#!/usr/bin/env node
/**
 * Renders every HTML file in scripts/demo/gallery/ as a 1280×720 PNG and
 * drops the results in assets/gallery/. Each PNG is a ProductHunt-ready
 * gallery image matching the launch design language.
 *
 * Usage:
 *   node scripts/demo/screenshot-gallery.js
 */
'use strict';

const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const GALLERY_DIR = path.join(__dirname, 'gallery');
const OUT_DIR     = path.join(__dirname, '..', '..', 'assets', 'gallery');

(async () => {
  const sources = fs.readdirSync(GALLERY_DIR)
    .filter(f => f.endsWith('.html'))
    .sort();
  if(!sources.length){
    console.error('No .html files in', GALLERY_DIR); process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2, // 2× for crisp Retina rendering
  });
  const page = await context.newPage();

  for(const src of sources){
    const file = path.join(GALLERY_DIR, src);
    const outName = src.replace(/\.html$/, '.png');
    const out = path.join(OUT_DIR, outName);

    console.log(`▶ ${src} → ${outName}`);
    await page.goto('file://' + file);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(700); // let webfonts settle
    await page.screenshot({ path: out, type: 'png' });
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`  ✅ ${kb} KB`);
  }

  await context.close();
  await browser.close();
  console.log(`\nAll outputs in: ${OUT_DIR}`);
  console.log('Upload to ProductHunt → Images and media → Gallery.');
})().catch(e => { console.error(e); process.exit(1); });
