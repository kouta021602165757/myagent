#!/usr/bin/env node
/**
 * Generate splash screen images for iOS and Android.
 * Output:
 *   resources/splash.png             — 2732×2732 master (Capacitor uses this)
 *   resources/splash-dark.png        — same, dark variant
 *
 * Capacitor's `npx cap assets` (or @capacitor/assets) consumes these masters
 * and generates all platform-specific sizes automatically. The 2732×2732
 * master ensures every iPad/iPhone/Android density is covered without quality
 * loss.
 *
 * Run: node scripts/generate-splash.js
 *
 * No image library deps — vanilla zlib + raw PNG construction.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const RESOURCES = path.resolve(__dirname, '..', 'resources');
const SIZE = 2732;

function makeSplash({ dark = false } = {}) {
  const w = SIZE, h = SIZE;
  const px = Buffer.alloc(w * h * 4);

  // Background
  const bg = dark ? [0x09, 0x09, 0x0b] : [0xfa, 0xfa, 0xfa];

  // Logo geometry — 280px logo, centered
  const logoSize = 360;
  const logoX = Math.floor((w - logoSize) / 2);
  const logoY = Math.floor((h - logoSize) / 2);
  const logoR = Math.floor(logoSize * 0.224); // matches iOS app icon corner radius

  // Logo gradient (peach)
  const peachA = [0xfb, 0x92, 0x3c];
  const peachB = [0xea, 0x58, 0x0c];

  // 3 vertical bars inside logo
  const barW = Math.floor(logoSize * 0.108);
  const gap  = Math.floor(logoSize * 0.05);
  const totalBarsW = barW * 3 + gap * 2;
  const startBarX = logoX + Math.floor((logoSize - totalBarsW) / 2);
  const barHeights = [0.55, 0.42, 0.30];
  const barAlphas  = [255, 165, 90];

  function inLogo(x, y) {
    const lx = x - logoX, ly = y - logoY;
    if (lx < 0 || lx >= logoSize || ly < 0 || ly >= logoSize) return false;
    // Rounded corners
    const r = logoR;
    if (lx < r && ly < r) {
      const dx = lx - r, dy = ly - r;
      return dx * dx + dy * dy <= r * r;
    }
    if (lx > logoSize - r - 1 && ly < r) {
      const dx = lx - (logoSize - r - 1), dy = ly - r;
      return dx * dx + dy * dy <= r * r;
    }
    if (lx < r && ly > logoSize - r - 1) {
      const dx = lx - r, dy = ly - (logoSize - r - 1);
      return dx * dx + dy * dy <= r * r;
    }
    if (lx > logoSize - r - 1 && ly > logoSize - r - 1) {
      const dx = lx - (logoSize - r - 1), dy = ly - (logoSize - r - 1);
      return dx * dx + dy * dy <= r * r;
    }
    return true;
  }

  function inBar(x, y) {
    for (let i = 0; i < 3; i++) {
      const bx = startBarX + i * (barW + gap);
      if (x >= bx && x < bx + barW) {
        const bh = Math.floor(logoSize * barHeights[i]);
        const by = logoY + Math.floor((logoSize - bh) / 2);
        const r2 = Math.floor(barW / 2);
        if (y >= by + r2 && y < by + bh - r2) return barAlphas[i];
        if (y >= by && y < by + r2) {
          const cx = bx + r2, cy = by + r2;
          const dx = x - cx, dy = y - cy;
          if (dx * dx + dy * dy <= r2 * r2) return barAlphas[i];
        }
        if (y >= by + bh - r2 && y < by + bh) {
          const cx = bx + r2, cy = by + bh - r2 - 1;
          const dx = x - cx, dy = y - cy;
          if (dx * dx + dy * dy <= r2 * r2) return barAlphas[i];
        }
      }
    }
    return 0;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      // Default: bg
      px[idx]     = bg[0];
      px[idx + 1] = bg[1];
      px[idx + 2] = bg[2];
      px[idx + 3] = 255;

      if (inLogo(x, y)) {
        const lx = x - logoX, ly = y - logoY;
        const t = (lx + ly) / (logoSize * 2);
        const r0 = Math.round(peachA[0] * (1 - t) + peachB[0] * t);
        const g0 = Math.round(peachA[1] * (1 - t) + peachB[1] * t);
        const b0 = Math.round(peachA[2] * (1 - t) + peachB[2] * t);

        const ba = inBar(x, y);
        if (ba > 0) {
          const a = ba / 255;
          px[idx]     = Math.round(r0 * (1 - a) + 255 * a);
          px[idx + 1] = Math.round(g0 * (1 - a) + 255 * a);
          px[idx + 2] = Math.round(b0 * (1 - a) + 255 * a);
        } else {
          px[idx]     = r0;
          px[idx + 1] = g0;
          px[idx + 2] = b0;
        }
      }
    }
  }

  return encodePNG(px, w, h);
}

// ── Vanilla PNG encoder (RGBA) ─────────────────────────────
function encodePNG(rgba, w, h) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const filtered = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    filtered[y * (1 + w * 4)] = 0;
    rgba.copy(filtered, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(filtered, { level: 9 });
  const iend = Buffer.alloc(0);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', iend)]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const buf = Buffer.concat([t, data]);
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crc ^ buf[i];
    for (let j = 0; j < 8; j++) crc = (crc & 1) ? ((crc >>> 1) ^ 0xedb88320) : (crc >>> 1);
  }
  crc = (crc ^ 0xffffffff) >>> 0;
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

// ── Main ────────────────────────────────────────────────────
console.log('🖼  Generating splash master (2732×2732)…');
fs.writeFileSync(path.join(RESOURCES, 'splash.png'), makeSplash({ dark: false }));
console.log('  resources/splash.png');

console.log('🌙 Generating dark splash master (2732×2732)…');
fs.writeFileSync(path.join(RESOURCES, 'splash-dark.png'), makeSplash({ dark: true }));
console.log('  resources/splash-dark.png');

console.log('✅ Done. To generate per-platform sizes:');
console.log('   npm install -D @capacitor/assets');
console.log('   npx capacitor-assets generate');
