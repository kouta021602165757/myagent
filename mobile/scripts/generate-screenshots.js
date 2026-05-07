#!/usr/bin/env node
/**
 * Generate App Store / Google Play screenshots from the in-page mock.
 *
 * Strategy:
 *   1. Open public/mock-mobile-app.html in Playwright at desktop viewport.
 *   2. For each .phone in the mock, extract its .iphone-screen DOM (the
 *      296×640 device-frame mock) and re-render it inside a fresh page sized
 *      to actual iPhone screenshot dimensions (1290×2796 for 6.7"/6.9").
 *   3. Screenshot. PNG, 24-bit, no alpha.
 *
 * Output: mobile/store-screenshots/ios/{01..08}-<slug>.png  (1290×2796)
 *         mobile/store-screenshots/android/{01..08}-<slug>.png  (1080×1920)
 *
 * Run from project root:
 *   node mobile/scripts/generate-screenshots.js
 *
 * Requires the dev server running locally (npm start) OR set SITE env to a
 * deployed URL:
 *   SITE=https://myaiagents.agency node mobile/scripts/generate-screenshots.js
 */

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const SITE = process.env.SITE || 'http://localhost:3000';
const MOCK_URL = `${SITE}/mock-mobile-app.html`;
const OUT_IOS = path.join(__dirname, '..', 'store-screenshots', 'ios');
const OUT_ANDROID = path.join(__dirname, '..', 'store-screenshots', 'android');

// iPhone 16 Pro Max @ 1x: 1290×2796
// (App Store accepts a single 6.9" set for all newer devices)
const IOS_W = 1290, IOS_H = 2796;
// Pixel 8 portrait: 1080×2400
const AND_W = 1080, AND_H = 2400;

const SCREENS = [
  { idx: 0, slug: 'login',         caption: 'ログイン — Welcome back' },
  { idx: 1, slug: 'chat',          caption: 'AI が業務を実行中' },
  { idx: 2, slug: 'sidemenu',      caption: 'エージェント切り替え' },
  { idx: 3, slug: 'notifications', caption: '完了通知センター' },
  { idx: 4, slug: 'push',          caption: 'プッシュ通知 (ロック画面)' },
  { idx: 5, slug: 'agentstore',    caption: 'Agent Store で見つける' },
  { idx: 6, slug: 'settings',      caption: '設定とプラン管理' },
  { idx: 7, slug: 'agents',        caption: 'マイエージェント一覧' },
];

async function makeScreenHTML(page, screenIdx) {
  // Extract just the inner .iphone-screen of the Nth .phone, plus all <style>
  // tags from the source page so the layout renders identically.
  const data = await page.evaluate((idx) => {
    const phones = document.querySelectorAll('.phone .iphone-screen');
    if (idx >= phones.length) throw new Error(`No phone at index ${idx}`);
    const styles = Array.from(document.querySelectorAll('style'))
      .map((s) => s.outerHTML).join('\n');
    const links = Array.from(document.querySelectorAll('link[rel=stylesheet]'))
      .map((l) => l.outerHTML).join('\n');
    return { html: phones[idx].outerHTML, styles, links };
  }, screenIdx);
  return data;
}

async function renderShot(browser, page, idx, w, h, outPath) {
  const data = await makeScreenHTML(page, idx);
  // Build a standalone HTML page that renders one .iphone-screen at exactly w×h.
  // The original .iphone-screen is sized 296×640 so we scale uniformly.
  const scale = Math.min(w / 296, h / 640);
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
${data.links}
${data.styles}
<style>
html,body{margin:0;padding:0;width:${w}px;height:${h}px;background:#000;overflow:hidden;}
.frame{
  width:296px;height:640px;
  transform: translate(-50%, -50%) scale(${scale});
  position:absolute;left:50%;top:50%;
  transform-origin: 50% 50%;
}
/* Override the device frame styles so we get a plain screen content fill */
.frame .iphone-screen{
  position:relative !important; inset:auto !important;
  border-radius:0 !important;
  box-shadow:none !important;
  width:296px !important; height:640px !important;
}
</style></head>
<body><div class="frame">${data.html}</div></body></html>`;

  const shotPage = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await shotPage.setContent(html, { waitUntil: 'domcontentloaded' });
  await shotPage.waitForTimeout(800);
  await shotPage.screenshot({ path: outPath, type: 'png', omitBackground: false, clip: { x: 0, y: 0, width: w, height: h } });
  await shotPage.close();
}

(async () => {
  if (!fs.existsSync(OUT_IOS)) fs.mkdirSync(OUT_IOS, { recursive: true });
  if (!fs.existsSync(OUT_ANDROID)) fs.mkdirSync(OUT_ANDROID, { recursive: true });

  console.log('🚀 Launching browser…');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1400, height: 4000 },
    deviceScaleFactor: 1,
    locale: 'ja-JP',
  });
  const page = await context.newPage();

  console.log(`🌐 Loading ${MOCK_URL}`);
  try {
    await page.goto(MOCK_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.error(`❌ Could not load ${MOCK_URL}: ${e.message}`);
    console.error('   Tip: run `npm start` in another terminal, or set SITE=https://myaiagents.agency');
    process.exit(1);
  }
  await page.waitForTimeout(1200);

  for (const s of SCREENS) {
    const num = String(s.idx + 1).padStart(2, '0');
    const iosOut = path.join(OUT_IOS, `${num}-${s.slug}.png`);
    const andOut = path.join(OUT_ANDROID, `${num}-${s.slug}.png`);
    console.log(`📸 [${num}] ${s.caption}`);
    try {
      await renderShot(context, page, s.idx, IOS_W, IOS_H, iosOut);
      console.log(`    ✓ iOS  ${IOS_W}×${IOS_H}`);
    } catch (e) {
      console.warn(`    ⚠ iOS fail: ${e.message}`);
    }
    try {
      await renderShot(context, page, s.idx, AND_W, AND_H, andOut);
      console.log(`    ✓ Android  ${AND_W}×${AND_H}`);
    } catch (e) {
      console.warn(`    ⚠ Android fail: ${e.message}`);
    }
  }

  await browser.close();
  console.log('');
  console.log(`🎉 Done. Output:`);
  console.log(`    iOS:     ${OUT_IOS}`);
  console.log(`    Android: ${OUT_ANDROID}`);
  console.log('');
  console.log('   App Store Connect / Play Console にこれらをアップロード。');
})();
