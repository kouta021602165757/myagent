#!/usr/bin/env node
/**
 * Records the 30-second demo animation (scripts/demo/demo-animation.html) to
 * a webm video using Playwright's built-in recordVideo. Output goes to
 *   assets/demo.webm
 * (mp4 conversion via ffmpeg is optional — most platforms including
 * ProductHunt accept webm via YouTube/Loom).
 *
 * Usage:
 *   node scripts/demo/record.js
 */
'use strict';

const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const HTML_PATH = path.join(__dirname, 'demo-animation.html');
const OUT_DIR   = path.join(__dirname, '..', '..', 'assets');
const DURATION_MS = 31000; // 30s animation + 1s tail

(async () => {
  if(!fs.existsSync(HTML_PATH)){
    console.error('Missing:', HTML_PATH); process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('▶ Launching headless Chromium…');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();

  console.log('▶ Loading demo HTML…');
  await page.goto('file://' + HTML_PATH);
  // Give web fonts a beat to load before any animation starts.
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  // Trick to force a clean animation start: reload after fonts settled.
  await page.reload();
  await page.waitForLoadState('networkidle');

  console.log(`▶ Recording for ${DURATION_MS/1000}s…`);
  await page.waitForTimeout(DURATION_MS);

  await context.close(); // flushes the .webm to disk
  await browser.close();

  // Playwright auto-names the output — find the freshest .webm in OUT_DIR.
  const files = fs.readdirSync(OUT_DIR)
    .filter(f => f.endsWith('.webm'))
    .map(f => ({ f, t: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  if(!files.length){
    console.error('No .webm produced.'); process.exit(1);
  }
  const raw = path.join(OUT_DIR, files[0].f);
  const out = path.join(OUT_DIR, 'demo.webm');
  if(raw !== out){
    fs.renameSync(raw, out);
  }
  const sizeKb = Math.round(fs.statSync(out).size / 1024);
  console.log(`✅ ${out}  (${sizeKb} KB)`);

  // Best-effort transcode to mp4 — uses ffmpeg-static if it happens to be in
  // node_modules (we install it on demand). Falls back to "webm only" so the
  // script never hard-fails on a clean install.
  try {
    const ffmpegPath = require('ffmpeg-static');
    if(ffmpegPath){
      console.log('▶ Transcoding to mp4…');
      const { spawnSync } = require('child_process');
      const mp4 = path.join(OUT_DIR, 'demo.mp4');
      const r = spawnSync(ffmpegPath, [
        '-y', '-i', out,
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-preset', 'medium', '-crf', '23',
        mp4,
      ], { stdio: 'inherit' });
      if(r.status === 0){
        const mp4kb = Math.round(fs.statSync(mp4).size / 1024);
        console.log(`✅ ${mp4}  (${mp4kb} KB)`);
      }
    }
  } catch(e){
    console.log('ℹ ffmpeg-static not installed — webm only. Install with:');
    console.log('   npm install --no-save ffmpeg-static');
  }

  console.log('');
  console.log('Upload steps:');
  console.log('  1. youtube.com/upload → drag assets/demo.mp4');
  console.log('  2. Visibility: Unlisted');
  console.log('  3. Title: "MY AI Agent — 30s demo"');
  console.log('  4. Copy the share URL');
  console.log('  5. Paste into ProductHunt Video / Loom field');
})().catch(e => { console.error(e); process.exit(1); });
