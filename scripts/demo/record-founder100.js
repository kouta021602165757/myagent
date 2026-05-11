#!/usr/bin/env node
/**
 * Records the Founder-100 scarcity short (scripts/demo/founder100-vertical.html)
 * → assets/founder100-vertical.webm + assets/founder100-vertical.mp4
 *
 * 17-second vertical (1080×1920) optimised for TikTok / Reels / Shorts.
 *
 *   node scripts/demo/record-founder100.js
 */
'use strict';

const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const HTML_PATH   = path.join(__dirname, 'founder100-vertical.html');
const OUT_DIR     = path.join(__dirname, '..', '..', 'assets');
const DURATION_MS = 18000; // 17s animation + 1s tail

(async () => {
  if(!fs.existsSync(HTML_PATH)){
    console.error('Missing:', HTML_PATH); process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('▶ Launching headless Chromium (1080×1920)…');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    recordVideo: { dir: OUT_DIR, size: { width: 1080, height: 1920 } },
  });
  const page = await context.newPage();
  await page.goto('file://' + HTML_PATH);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForLoadState('networkidle');

  console.log(`▶ Recording for ${DURATION_MS/1000}s…`);
  await page.waitForTimeout(DURATION_MS);

  await context.close();
  await browser.close();

  // Rename freshest webm to founder100-vertical.webm
  const files = fs.readdirSync(OUT_DIR)
    .filter(f => f.endsWith('.webm'))
    .map(f => ({ f, t: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  const raw = path.join(OUT_DIR, files[0].f);
  const webm = path.join(OUT_DIR, 'founder100-vertical.webm');
  if(raw !== webm) fs.renameSync(raw, webm);
  console.log(`✅ ${webm}  (${Math.round(fs.statSync(webm).size/1024)} KB)`);

  // Transcode to mp4 for native uploads
  try {
    const ffmpegPath = require('ffmpeg-static');
    if(ffmpegPath){
      const { spawnSync } = require('child_process');
      const mp4 = path.join(OUT_DIR, 'founder100-vertical.mp4');
      console.log('▶ Transcoding to mp4…');
      const r = spawnSync(ffmpegPath, [
        '-y', '-i', webm,
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-preset', 'medium', '-crf', '22',
        mp4,
      ], { stdio: 'inherit' });
      if(r.status === 0){
        console.log(`✅ ${mp4}  (${Math.round(fs.statSync(mp4).size/1024)} KB)`);
      }
    }
  } catch(e){
    console.log('ℹ ffmpeg-static not installed — webm only.');
  }

  console.log('');
  console.log('Upload targets:');
  console.log('  • TikTok        → founder100-vertical.mp4 (Bio: link to myaiagents.agency)');
  console.log('  • Instagram Reels');
  console.log('  • YouTube Shorts');
  console.log('  • X (native video)');
})().catch(e => { console.error(e); process.exit(1); });
