#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
//  Render the LP OG thumbnail (F2: Dark Premium · Type → Build)
//  to /public/social/og-home.png. Run this locally any time the
//  source SVG below changes.
//
//    $ node scripts/render-og-home.js
//
//  Requires @resvg/resvg-js (already in package.json).
//  Twemoji SVGs are fetched at runtime so the rendered PNG looks
//  correct even on Linux hosts without a color emoji font.
// ─────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT_PATH = path.join(__dirname, '..', 'public', 'social', 'og-home.png');
const FONT_DIR = path.join(__dirname, '..', 'node_modules', '@fontsource', 'noto-sans-jp', 'files');

// ── Helpers ──
function fetchBuf(url){
  return new Promise((resolve, reject) => {
    https.get(url, r => {
      if(r.statusCode === 301 || r.statusCode === 302){
        return resolve(fetchBuf(r.headers.location));
      }
      if(r.statusCode !== 200) return reject(new Error('HTTP '+r.statusCode+' for '+url));
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => resolve(Buffer.concat(chunks)));
      r.on('error', reject);
    }).on('error', reject);
  });
}

function emojiToCodepoint(emoji){
  const cps = [];
  for(const ch of emoji){ const cp = ch.codePointAt(0); if(cp !== 0xFE0F) cps.push(cp.toString(16)); }
  return cps.join('-');
}

async function getTwemojiDataUri(emoji){
  const cp = emojiToCodepoint(emoji);
  const url = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/' + cp + '.svg';
  try {
    const buf = await fetchBuf(url);
    return 'data:image/svg+xml;base64,' + buf.toString('base64');
  } catch(e){
    console.warn('  twemoji miss:', emoji, '('+cp+'):', e.message);
    return null;
  }
}

// ── Build the SVG ──
async function buildSvg(){
  // Pre-fetch Twemoji for every emoji we use
  const EMOJIS = ['🛍','📸','🌐','📱','📊','✨'];
  const tw = {};
  for(const em of EMOJIS){
    const uri = await getTwemojiDataUri(em);
    if(uri) tw[em] = uri;
  }

  const emTile = (em, x, y, size, bg) => {
    const half = size / 2;
    const dataUri = tw[em];
    return `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="${size}" height="${size}" rx="14" ry="14" fill="${bg}" stroke="rgba(255,255,255,0.10)" stroke-width="2"/>
      ${dataUri
        ? `<image x="${half - size*0.36}" y="${half - size*0.36}" width="${size*0.72}" height="${size*0.72}" href="${dataUri}" preserveAspectRatio="xMidYMid meet"/>`
        : `<text x="${half}" y="${half}" text-anchor="middle" dominant-baseline="central" font-size="${size*0.55}">${em}</text>`}
    </g>`;
  };

  // Sparkle for input box (✨ inline)
  const sparkleUri = tw['✨'];
  const sparkleSvg = sparkleUri
    ? `<image x="-12" y="-12" width="24" height="24" href="${sparkleUri}" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-size="22" fill="#fb923c">✨</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"
     font-family="'Inter','Helvetica Neue','Hiragino Sans','Noto Sans JP',Arial,sans-serif">
  <defs>
    <radialGradient id="rPeach" cx="20%" cy="30%" r="55%">
      <stop offset="0%" stop-color="#fb923c" stop-opacity="0.40"/>
      <stop offset="100%" stop-color="#fb923c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rViolet" cx="90%" cy="100%" r="65%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Dark base + radial highlights -->
  <rect width="1200" height="630" fill="#0c0a09"/>
  <rect width="1200" height="630" fill="url(#rPeach)"/>
  <rect width="1200" height="630" fill="url(#rViolet)"/>

  <!-- Header: brand + ⚡ 30 SECONDS pill -->
  <g transform="translate(54 38)">
    <rect x="0" y="0" width="44" height="44" rx="9" ry="9" fill="#fb923c"/>
    <text x="22" y="32" text-anchor="middle" fill="#0c0a09" font-size="26" font-weight="900" letter-spacing="-0.02em">M</text>
    <text x="56" y="30" fill="#ffffff" font-size="22" font-weight="900" letter-spacing="0.04em">MY AI AGENT</text>
  </g>
  <g transform="translate(${1200 - 54 - 198} 46)">
    <rect x="0" y="0" width="198" height="34" rx="17" ry="17" fill="#10b981"/>
    <text x="99" y="23" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="900" letter-spacing="0.08em">⚡ 30 SECONDS</text>
  </g>

  <!-- Headline: "TYPE A GOAL." white + "BUILD A TEAM." peach -->
  <g transform="translate(54 200)">
    <text x="0" y="0" fill="#ffffff" font-size="92" font-weight="900" letter-spacing="-0.025em">TYPE A GOAL.</text>
    <text x="0" y="92" fill="#fb923c" font-size="92" font-weight="900" letter-spacing="-0.025em">BUILD A TEAM.</text>
  </g>

  <!-- Input mockup box -->
  <g transform="translate(54 380)">
    <rect x="0" y="0" width="780" height="68" rx="14" ry="14"
          fill="rgba(255,255,255,0.06)" stroke="#fb923c" stroke-width="1.5"/>
    <!-- Sparkle -->
    <g transform="translate(36 34)">${sparkleSvg}</g>
    <!-- Input text -->
    <text x="68" y="42" fill="#ffffff" font-size="18" font-weight="700">"Build &amp; sell on Shopify with margin &gt; 50%"</text>
    <!-- GENERATE button -->
    <g transform="translate(${780 - 130} 14)">
      <rect x="0" y="0" width="116" height="40" rx="20" ry="20" fill="#fb923c"/>
      <text x="58" y="27" text-anchor="middle" fill="#0c0a09" font-size="13" font-weight="900" letter-spacing="0.06em">GENERATE</text>
    </g>
  </g>

  <!-- Tilted arrow -->
  <g transform="translate(880 410) rotate(8)">
    <text x="0" y="0" fill="#fb923c" font-size="56" font-weight="900">→</text>
  </g>

  <!-- 5 member avatars (right-bottom) -->
  ${(() => {
    const members = [
      { em:'🛍', bg:'rgba(255,255,255,0.10)' },
      { em:'📸', bg:'rgba(255,255,255,0.10)' },
      { em:'🌐', bg:'rgba(255,255,255,0.10)' },
      { em:'📱', bg:'rgba(255,255,255,0.10)' },
      { em:'📊', bg:'rgba(255,255,255,0.10)' },
    ];
    const baseX = 720;
    const y = 500;
    const tile = 56;
    const gap = -10;        // overlap
    return members.map((m, i) => emTile(m.em, baseX + i * (tile + gap), y, tile, m.bg)).join('');
  })()}

  <!-- READY pill (right of avatars) -->
  <g transform="translate(${720 + 5 * 56 + 4 * (-10) + 14} ${500 + 12})">
    <rect x="0" y="0" width="156" height="32" rx="16" ry="16" fill="#fb923c"/>
    <text x="78" y="22" text-anchor="middle" fill="#0c0a09" font-size="13" font-weight="900" letter-spacing="0.06em">5 AI · READY</text>
  </g>

  <!-- URL bottom-left -->
  <text x="54" y="588" fill="rgba(255,245,230,0.6)" font-size="14" font-weight="500"
        font-family="'DM Mono','SF Mono',Menlo,monospace">myaiagents.agency</text>
</svg>`;
}

// ── Render ──
async function main(){
  console.log('[og-home] building SVG…');
  const svg = await buildSvg();

  // Save the SVG too (for debugging / manual review)
  const svgOut = path.join(__dirname, '..', 'public', 'social', 'og-home.svg');
  fs.writeFileSync(svgOut, svg);
  console.log('[og-home] wrote', path.relative(process.cwd(), svgOut));

  console.log('[og-home] loading resvg…');
  let Resvg;
  try { ({ Resvg } = require('@resvg/resvg-js')); }
  catch(e){
    console.error('[og-home] @resvg/resvg-js not installed. Run: npm install');
    process.exit(1);
  }

  // Find Noto Sans JP font files (variable + static fallbacks)
  const fontFiles = [];
  try {
    if(fs.existsSync(FONT_DIR)){
      const files = fs.readdirSync(FONT_DIR).filter(f => /\.(ttf|otf|woff2?)$/i.test(f));
      for(const f of files) fontFiles.push(path.join(FONT_DIR, f));
    }
  } catch(e){}
  // Also include the bundled NotoSansJP-VF.ttf if present
  const vf = path.join(__dirname, '..', 'assets', 'fonts', 'NotoSansJP-VF.ttf');
  if(fs.existsSync(vf)) fontFiles.push(vf);
  console.log('[og-home] fonts:', fontFiles.length, 'file(s)');

  const opts = {
    fitTo: { mode: 'width', value: 1200 },
    background: '#0c0a09',
    font: {
      fontFiles,
      loadSystemFonts: true,
    },
  };
  console.log('[og-home] rendering PNG…');
  const resvg = new Resvg(svg, opts);
  const png = resvg.render().asPng();
  fs.writeFileSync(OUT_PATH, png);
  console.log('[og-home] wrote', path.relative(process.cwd(), OUT_PATH), '·', png.length, 'bytes');
}

main().catch(e => { console.error(e); process.exit(1); });
