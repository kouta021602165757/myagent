#!/usr/bin/env node
/**
 * Records the 9:16 vertical demo (scripts/demo/demo-animation-vertical.html)
 * → assets/demo-vertical.webm + assets/demo-vertical.mp4
 *
 * Use the .mp4 for TikTok / Instagram Reels / YouTube Shorts uploads.
 *
 * Usage:
 *   node scripts/demo/record-vertical.js
 */
'use strict';

const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const HTML_PATH   = path.join(__dirname, 'demo-animation-vertical.html');
const OUT_DIR     = path.join(__dirname, '..', '..', 'assets');
const DURATION_MS = 31000;

(async () => {
  if(!fs.existsSync(HTML_PATH)){
    console.error('Missing:', HTML_PATH); process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('▶ Launching headless Chromium (1080×1920)…');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1080, height: 1920 },
    },
  });
  const page = await context.newPage();

  await page.goto('file://' + HTML_PATH);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForLoadState('networkidle');

  console.log(`▶ Recording vertical for ${DURATION_MS/1000}s…`);
  await page.waitForTimeout(DURATION_MS);

  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUT_DIR)
    .filter(f => f.endsWith('.webm'))
    .map(f => ({ f, t: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  // Find the freshest webm that ISN'T the 16:9 master we might have on disk.
  // Simplest: take freshest, rename to demo-vertical.webm.
  const raw = path.join(OUT_DIR, files[0].f);
  const webm = path.join(OUT_DIR, 'demo-vertical.webm');
  if(raw !== webm) fs.renameSync(raw, webm);
  const wkb = Math.round(fs.statSync(webm).size / 1024);
  console.log(`✅ ${webm}  (${wkb} KB)`);

  // Transcode to mp4 for TikTok / Reels / Shorts native uploads.
  try {
    const ffmpegPath = require('ffmpeg-static');
    if(ffmpegPath){
      const { spawnSync } = require('child_process');
      const mp4 = path.join(OUT_DIR, 'demo-vertical.mp4');
      console.log('▶ Transcoding to mp4…');
      const r = spawnSync(ffmpegPath, [
        '-y', '-i', webm,
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-preset', 'medium', '-crf', '22',
        mp4,
      ], { stdio: 'inherit' });
      if(r.status === 0){
        const mkb = Math.round(fs.statSync(mp4).size / 1024);
        console.log(`✅ ${mp4}  (${mkb} KB)`);
      }
    }
  } catch(e){
    console.log('ℹ ffmpeg-static not installed — webm only.');
  }

  console.log('');
  console.log('Distribution targets:');
  console.log('  • TikTok        → upload demo-vertical.mp4 (no URL field, put CTA in caption)');
  console.log('  • Instagram Reels → upload via app or Meta Business Suite');
  console.log('  • YouTube Shorts → /upload, set as Short (auto-detects 9:16)');
  console.log('  • LinkedIn      → "Video" post (1080×1920 OK)');
})().catch(e => { console.error(e); process.exit(1); });
