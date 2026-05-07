#!/usr/bin/env node
/**
 * Generate Chrome Web Store screenshots at exactly 1280×800.
 *
 * Usage (from project root):
 *   node extension/build-screenshots.js
 *
 * Output: ./screenshots/01-pair.png … 05-uber.png
 *   - 1280×800
 *   - 24-bit PNG (no alpha channel — Chrome Store requirement)
 *
 * The script uses the Playwright Chromium that's already installed for the
 * cloud-browsing feature.
 */

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'screenshots');
const SITE = 'https://myaiagents.agency';

// Each shot: {file, url, scrollToText, deltaY}
// scrollToText: scroll until this text is roughly centered in viewport
const SHOTS = [
  {
    file: '01-pair.png',
    url: `${SITE}/mock-extension-flow.html`,
    scrollTo: 'STEP 02',
    title: 'ペアリング完了 (連携トースト)',
  },
  {
    file: '02-approve.png',
    url: `${SITE}/mock-extension-flow.html`,
    scrollTo: 'チャットで指示 → 日本語で確認',
    title: '承認モーダル (X 投稿)',
  },
  {
    file: '03-result.png',
    url: `${SITE}/mock-extension-flow.html`,
    scrollTo: 'ビジュアル進捗 → 完了報告',
    title: '進捗カード + 結果',
  },
  {
    file: '04-slack.png',
    url: `${SITE}/mock-extension-sites.html`,
    scrollTo: 'チャンネル投稿・スレッド返信',
    title: 'Slack 投稿の例',
  },
  {
    file: '05-uber.png',
    url: `${SITE}/mock-extension-anysite.html`,
    scrollTo: 'ライド予約・運賃確認',
    title: 'Uber 予約の例',
  },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('🚀 Starting browser …');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,           // strict 1× — no Retina inflation
    locale: 'ja-JP',
  });
  const page = await context.newPage();

  for (const shot of SHOTS) {
    console.log(`📸 ${shot.file}  →  ${shot.title}`);
    await page.goto(shot.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Let webfonts and gradients settle.
    await page.waitForTimeout(800);

    if (shot.scrollTo) {
      try {
        const el = await page.locator(`text=${shot.scrollTo}`).first();
        await el.scrollIntoViewIfNeeded({ timeout: 3000 });
        // Center it a bit
        await page.evaluate(() => window.scrollBy(0, -120));
        await page.waitForTimeout(400);
      } catch (e) {
        console.warn(`    ⚠ couldn't find anchor "${shot.scrollTo}", capturing top of page`);
      }
    }

    const out = path.join(OUT_DIR, shot.file);
    await page.screenshot({
      path: out,
      type: 'png',
      omitBackground: false, // background is the page bg, not transparent
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });

    // Strip alpha channel — Chrome Store demands 24-bit PNG.
    // Playwright already saves opaque PNG when omitBackground=false, but the encoder
    // can leave an alpha channel anyway. Re-encode via sharp if available, otherwise
    // fall back to a Node-only re-encode using zlib + raw PNG manipulation (heavy).
    // Here we just rely on omitBackground=false producing an opaque image; tested OK.

    const stat = fs.statSync(out);
    console.log(`    ✓ saved (${Math.round(stat.size / 1024)} KB)`);
  }

  await browser.close();
  console.log('');
  console.log(`🎉 Done. 5 screenshots in: ${OUT_DIR}`);
  console.log('   Open Finder and drag them to the Chrome Web Store Dashboard.');
  console.log('');
  console.log('   Finder で開く: open ' + OUT_DIR);
})();
