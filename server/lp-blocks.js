// LP セクション見本帳 (案B1) — create_artifact が LP を作るとき AI に渡す参考資料。
// AI はここから必要なブロックを選び、HTML/CSS をコピーして :root の色と
// コンテンツを差し替える。各ブロックは id 付き <section> なので部分修正も速い。
const LP_BLOCKS = `
これは LP 制作用のセクション見本帳です。LP を作るときは、ここから必要なブロックを選び、
HTML と CSS をコピーして組み立て、:root のカラー変数とコンテンツ（文章・画像）をユーザーの
内容に差し替えてください。各ブロックは id 付きの独立した <section> なので、後の部分修正も
replace_selector で高速にできます。配色は :root の変数だけ書き換えれば全体に反映されます。

【見出しフォントについて】
見出しは Inter / Space Grotesk などのディスプレイフォントを使うと締まります。
<head> に次の行をリンクしてください:
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800;900&display=swap" rel="stylesheet">

================================================================
共有デザイントークン (:root) — LP の <head> に一度だけコピーする
色を変えたいときは :root のこの変数だけ変える。それで LP 全体の配色が変わる。
================================================================

CSS:
:root {
  --brand: #fb923c;          /* メインアクセント */
  --brand-d: #ea580c;        /* 濃いアクセント（ホバー・グラデ） */
  --ink: #1a1a1a;            /* 本文・見出しの主要テキスト */
  --muted: #6b7280;          /* 補助テキスト */
  --bg: #ffffff;             /* ページ背景 */
  --surface: #fafafa;        /* カード背景 */
  --border: rgba(0,0,0,.08); /* 罫線 */
  --radius: 14px;            /* 角丸の基準 */
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Noto Sans JP', sans-serif;
  color: var(--ink);
  background: var(--bg);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
h1, h2, h3 { font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; margin: 0; }


### block: nav — 画面上部に固定するナビゲーションバー（ロゴ + リンク + CTA）

HTML:
<section id="nav">
  <nav class="nav-wrap">
    <a href="#hero" class="nav-logo">YourBrand</a>
    <div class="nav-links">
      <a href="#features">機能</a>
      <a href="#pricing">料金</a>
      <a href="#faq">よくある質問</a>
    </div>
    <a href="#cta" class="nav-cta">無料ではじめる</a>
  </nav>
</section>

CSS:
#nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,.85);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-wrap {
  max-width: 1160px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px;
}
.nav-logo { font-weight: 900; font-size: 20px; letter-spacing: -0.03em; text-decoration: none; }
.nav-links { display: flex; gap: 32px; }
.nav-links a {
  text-decoration: none; color: var(--muted);
  font-size: 15px; font-weight: 500; transition: color .15s;
}
.nav-links a:hover { color: var(--ink); }
.nav-cta {
  background: var(--brand); color: #fff; text-decoration: none;
  font-weight: 600; font-size: 15px;
  padding: 10px 20px; border-radius: 999px;
  transition: background .15s, transform .1s;
}
.nav-cta:hover { background: var(--brand-d); transform: translateY(-1px); }
@media (max-width: 720px) {
  .nav-links { display: none; }
  .nav-wrap { padding: 14px 18px; }
}


### block: hero-split — 左右分割のヒーロー（左:見出し+CTA / 右:ビジュアル）

HTML:
<section id="hero">
  <div class="hero-wrap">
    <div class="hero-text">
      <span class="hero-badge">新登場</span>
      <h1 class="hero-title">あなたのビジネスを、<br>次のステージへ。</h1>
      <p class="hero-sub">面倒な作業はすべて自動化。チームはもっと大切なことに集中できます。今日から、もっと速く前へ進みましょう。</p>
      <div class="hero-actions">
        <a href="#cta" class="hero-btn-primary">無料ではじめる</a>
        <a href="#features" class="hero-btn-ghost">機能を見る</a>
      </div>
      <p class="hero-note">クレジットカード不要・3分でセットアップ完了</p>
    </div>
    <div class="hero-visual">
      <div class="hero-mock">
        <div class="hero-mock-bar"><span></span><span></span><span></span></div>
        <div class="hero-mock-body"></div>
      </div>
    </div>
  </div>
</section>

CSS:
#hero { padding: clamp(56px, 9vw, 104px) 24px; }
.hero-wrap {
  max-width: 1160px; margin: 0 auto;
  display: grid; grid-template-columns: 1.05fr .95fr;
  gap: 56px; align-items: center;
}
.hero-badge {
  display: inline-block; font-size: 13px; font-weight: 600;
  color: var(--brand-d); background: rgba(251,146,60,.12);
  padding: 6px 14px; border-radius: 999px; margin-bottom: 20px;
}
.hero-title { font-size: clamp(36px, 5vw, 58px); font-weight: 900; }
.hero-sub { font-size: clamp(16px, 1.6vw, 19px); color: var(--muted); margin: 22px 0 32px; max-width: 460px; }
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
.hero-btn-primary {
  background: var(--brand); color: #fff; text-decoration: none;
  font-weight: 600; padding: 14px 28px; border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(251,146,60,.28); transition: transform .1s, background .15s;
}
.hero-btn-primary:hover { background: var(--brand-d); transform: translateY(-2px); }
.hero-btn-ghost {
  border: 1px solid var(--border); color: var(--ink); text-decoration: none;
  font-weight: 600; padding: 14px 28px; border-radius: var(--radius);
  background: var(--surface); transition: border-color .15s;
}
.hero-btn-ghost:hover { border-color: var(--ink); }
.hero-note { font-size: 13px; color: var(--muted); margin-top: 18px; }
.hero-mock {
  background: linear-gradient(135deg, var(--brand), var(--brand-d));
  border-radius: 20px; padding: 14px;
  box-shadow: 0 30px 60px -20px rgba(234,88,12,.45);
}
.hero-mock-bar { display: flex; gap: 7px; padding: 6px 4px 12px; }
.hero-mock-bar span { width: 11px; height: 11px; border-radius: 50%; background: rgba(255,255,255,.55); }
.hero-mock-body {
  height: 260px; border-radius: 12px;
  background: rgba(255,255,255,.92);
}
@media (max-width: 720px) {
  .hero-wrap { grid-template-columns: 1fr; gap: 36px; }
  .hero-mock-body { height: 200px; }
}


### block: hero-centered — 中央寄せのヒーロー（見出し+CTA、下にスクショパネル）

HTML:
<section id="hero">
  <div class="heroc-wrap">
    <span class="heroc-badge">プロダクトハント1位を獲得</span>
    <h1 class="heroc-title">仕事のスピードを、<br>もう一段はやく。</h1>
    <p class="heroc-sub">直感的な操作と強力な自動化で、チームの生産性を最大化。導入したその日から効果を実感できます。</p>
    <div class="heroc-actions">
      <a href="#cta" class="heroc-btn">無料ではじめる</a>
    </div>
    <div class="heroc-shot">
      <img src="https://picsum.photos/seed/dashboard/1200/680" alt="製品スクリーンショット">
    </div>
  </div>
</section>

CSS:
#hero { padding: clamp(56px, 9vw, 110px) 24px clamp(40px, 6vw, 72px); text-align: center; }
.heroc-wrap { max-width: 880px; margin: 0 auto; }
.heroc-badge {
  display: inline-block; font-size: 13px; font-weight: 600;
  color: var(--brand-d); background: rgba(251,146,60,.12);
  padding: 6px 14px; border-radius: 999px; margin-bottom: 24px;
}
.heroc-title { font-size: clamp(38px, 6vw, 66px); font-weight: 900; }
.heroc-sub {
  font-size: clamp(16px, 1.7vw, 20px); color: var(--muted);
  margin: 24px auto 34px; max-width: 600px;
}
.heroc-btn {
  display: inline-block; background: var(--brand); color: #fff;
  text-decoration: none; font-weight: 600; padding: 15px 34px;
  border-radius: var(--radius); box-shadow: 0 10px 28px rgba(251,146,60,.3);
  transition: transform .1s, background .15s;
}
.heroc-btn:hover { background: var(--brand-d); transform: translateY(-2px); }
.heroc-shot {
  margin-top: clamp(40px, 6vw, 64px);
  border-radius: 16px; overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 40px 80px -30px rgba(0,0,0,.3);
}
@media (max-width: 720px) {
  .heroc-shot { margin-top: 36px; }
}


### block: logos — 「信頼されています」のロゴ並びソーシャルプルーフ帯

HTML:
<section id="logos">
  <div class="logos-wrap">
    <p class="logos-label">数千のチームに信頼されています</p>
    <div class="logos-row">
      <span class="logos-item">Acme</span>
      <span class="logos-item">Globex</span>
      <span class="logos-item">Initech</span>
      <span class="logos-item">Umbrella</span>
      <span class="logos-item">Hooli</span>
      <span class="logos-item">Soylent</span>
    </div>
  </div>
</section>

CSS:
#logos { padding: clamp(40px, 6vw, 64px) 24px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.logos-wrap { max-width: 1160px; margin: 0 auto; text-align: center; }
.logos-label {
  font-size: 13px; font-weight: 600; letter-spacing: .08em;
  text-transform: uppercase; color: var(--muted); margin: 0 0 28px;
}
.logos-row {
  display: flex; flex-wrap: wrap; justify-content: center;
  align-items: center; gap: clamp(28px, 5vw, 56px);
}
.logos-item {
  font-size: clamp(20px, 2.4vw, 26px); font-weight: 800;
  letter-spacing: -0.02em; color: var(--ink); opacity: .42;
  transition: opacity .15s;
}
.logos-item:hover { opacity: .85; }


### block: features-3col — 機能カード3列（インラインSVGアイコン付き）

HTML:
<section id="features">
  <div class="feat-wrap">
    <div class="feat-head">
      <h2 class="feat-title">必要な機能を、すべて。</h2>
      <p class="feat-sub">複雑なツールはもう不要です。一つのプラットフォームで完結します。</p>
    </div>
    <div class="feat-grid">
      <div class="feat-card">
        <div class="feat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <h3 class="feat-name">圧倒的なスピード</h3>
        <p class="feat-desc">待ち時間ゼロ。すべての操作が一瞬で完了し、思考を止めません。</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h3 class="feat-name">堅牢なセキュリティ</h3>
        <p class="feat-desc">エンタープライズ水準の暗号化で、大切なデータを安全に守ります。</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h3 class="feat-name">スムーズな共同作業</h3>
        <p class="feat-desc">チーム全員がリアルタイムで同じ画面を共有。連携がもっと速く。</p>
      </div>
    </div>
  </div>
</section>

CSS:
#features { padding: clamp(64px, 9vw, 96px) 24px; }
.feat-wrap { max-width: 1160px; margin: 0 auto; }
.feat-head { text-align: center; max-width: 620px; margin: 0 auto 52px; }
.feat-title { font-size: clamp(30px, 3.6vw, 42px); font-weight: 800; }
.feat-sub { font-size: 17px; color: var(--muted); margin-top: 14px; }
.feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.feat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 32px 28px;
  transition: transform .15s, box-shadow .15s;
}
.feat-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -18px rgba(0,0,0,.2); }
.feat-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(251,146,60,.12); color: var(--brand-d);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
}
.feat-icon svg { width: 24px; height: 24px; }
.feat-name { font-size: 19px; font-weight: 800; }
.feat-desc { font-size: 15px; color: var(--muted); margin-top: 10px; }
@media (max-width: 720px) {
  .feat-grid { grid-template-columns: 1fr; }
}


### block: features-alt — 画像とテキストが交互に並ぶ機能セクション

HTML:
<section id="features">
  <div class="falt-wrap">
    <div class="falt-row">
      <div class="falt-text">
        <span class="falt-tag">自動化</span>
        <h3 class="falt-title">繰り返し作業を、ゼロに。</h3>
        <p class="falt-desc">定型業務はすべてワークフローに任せましょう。一度設定すれば、あとは自動で回り続けます。</p>
        <a href="#cta" class="falt-link">詳しく見る →</a>
      </div>
      <div class="falt-media">
        <img src="https://picsum.photos/seed/flow/800/600" alt="自動化の様子">
      </div>
    </div>
    <div class="falt-row falt-reverse">
      <div class="falt-text">
        <span class="falt-tag">分析</span>
        <h3 class="falt-title">数字で、意思決定を。</h3>
        <p class="falt-desc">リアルタイムのダッシュボードで状況を可視化。次の一手が、データから見えてきます。</p>
        <a href="#cta" class="falt-link">詳しく見る →</a>
      </div>
      <div class="falt-media">
        <img src="https://picsum.photos/seed/analytics/800/600" alt="分析ダッシュボード">
      </div>
    </div>
  </div>
</section>

CSS:
#features { padding: clamp(64px, 9vw, 96px) 24px; }
.falt-wrap { max-width: 1160px; margin: 0 auto; display: flex; flex-direction: column; gap: clamp(56px, 8vw, 88px); }
.falt-row { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.falt-reverse .falt-text { order: 2; }
.falt-tag {
  display: inline-block; font-size: 13px; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  color: var(--brand-d); margin-bottom: 14px;
}
.falt-title { font-size: clamp(26px, 3.2vw, 38px); font-weight: 800; }
.falt-desc { font-size: 17px; color: var(--muted); margin: 16px 0 22px; }
.falt-link { font-weight: 600; color: var(--brand-d); text-decoration: none; }
.falt-link:hover { text-decoration: underline; }
.falt-media {
  border-radius: var(--radius); overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 24px 50px -24px rgba(0,0,0,.28);
}
@media (max-width: 720px) {
  .falt-row, .falt-reverse .falt-text { grid-template-columns: 1fr; order: 0; }
  .falt-row { gap: 28px; }
}


### block: steps — 「使い方」3ステップ（番号付き）

HTML:
<section id="steps">
  <div class="steps-wrap">
    <div class="steps-head">
      <h2 class="steps-title">使い方はかんたん3ステップ</h2>
      <p class="steps-sub">アカウント登録から、わずか数分で使いはじめられます。</p>
    </div>
    <div class="steps-grid">
      <div class="steps-card">
        <span class="steps-num">1</span>
        <h3 class="steps-name">アカウントを作成</h3>
        <p class="steps-desc">メールアドレスだけで登録完了。クレジットカードは不要です。</p>
      </div>
      <div class="steps-card">
        <span class="steps-num">2</span>
        <h3 class="steps-name">プロジェクトを設定</h3>
        <p class="steps-desc">テンプレートを選ぶだけ。あなたのチームに合わせて自由にカスタマイズ。</p>
      </div>
      <div class="steps-card">
        <span class="steps-num">3</span>
        <h3 class="steps-name">さっそく使いはじめる</h3>
        <p class="steps-desc">すぐに成果が見えはじめます。あとはチームで使い倒すだけ。</p>
      </div>
    </div>
  </div>
</section>

CSS:
#steps { padding: clamp(64px, 9vw, 96px) 24px; background: var(--surface); }
.steps-wrap { max-width: 1160px; margin: 0 auto; }
.steps-head { text-align: center; max-width: 600px; margin: 0 auto 52px; }
.steps-title { font-size: clamp(30px, 3.6vw, 42px); font-weight: 800; }
.steps-sub { font-size: 17px; color: var(--muted); margin-top: 14px; }
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.steps-card {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 32px 28px;
}
.steps-num {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--brand); color: #fff;
  font-size: 18px; font-weight: 900; margin-bottom: 18px;
}
.steps-name { font-size: 19px; font-weight: 800; }
.steps-desc { font-size: 15px; color: var(--muted); margin-top: 10px; }
@media (max-width: 720px) {
  .steps-grid { grid-template-columns: 1fr; }
}


### block: pricing — 料金プラン2-3枚（中央を「おすすめ」で強調）

HTML:
<section id="pricing">
  <div class="price-wrap">
    <div class="price-head">
      <h2 class="price-title">シンプルな料金プラン</h2>
      <p class="price-sub">隠れた費用は一切なし。いつでもプラン変更できます。</p>
    </div>
    <div class="price-grid">
      <div class="price-card">
        <h3 class="price-name">Starter</h3>
        <p class="price-amount">¥0<span>/月</span></p>
        <p class="price-for">個人で試したい方に</p>
        <ul class="price-list">
          <li>プロジェクト3件まで</li>
          <li>基本機能すべて</li>
          <li>コミュニティサポート</li>
        </ul>
        <a href="#cta" class="price-btn">無料ではじめる</a>
      </div>
      <div class="price-card price-featured">
        <span class="price-flag">おすすめ</span>
        <h3 class="price-name">Pro</h3>
        <p class="price-amount">¥2,400<span>/月</span></p>
        <p class="price-for">成長するチームに</p>
        <ul class="price-list">
          <li>プロジェクト無制限</li>
          <li>高度な分析機能</li>
          <li>優先サポート</li>
        </ul>
        <a href="#cta" class="price-btn price-btn-primary">Proをはじめる</a>
      </div>
      <div class="price-card">
        <h3 class="price-name">Business</h3>
        <p class="price-amount">¥8,000<span>/月</span></p>
        <p class="price-for">大規模な組織に</p>
        <ul class="price-list">
          <li>Proのすべて</li>
          <li>専任サポート担当</li>
          <li>SSO・監査ログ</li>
        </ul>
        <a href="#cta" class="price-btn">問い合わせる</a>
      </div>
    </div>
  </div>
</section>

CSS:
#pricing { padding: clamp(64px, 9vw, 96px) 24px; }
.price-wrap { max-width: 1160px; margin: 0 auto; }
.price-head { text-align: center; max-width: 600px; margin: 0 auto 52px; }
.price-title { font-size: clamp(30px, 3.6vw, 42px); font-weight: 800; }
.price-sub { font-size: 17px; color: var(--muted); margin-top: 14px; }
.price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start; }
.price-card {
  position: relative; background: var(--surface);
  border: 1px solid var(--border); border-radius: var(--radius);
  padding: 32px 28px;
}
.price-featured {
  background: var(--bg); border: 1.5px solid var(--brand);
  box-shadow: 0 24px 50px -22px rgba(251,146,60,.4);
  transform: scale(1.035);
}
.price-flag {
  position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
  background: var(--brand); color: #fff; font-size: 12px; font-weight: 700;
  padding: 5px 14px; border-radius: 999px;
}
.price-name { font-size: 18px; font-weight: 800; }
.price-amount { font-size: 38px; font-weight: 900; letter-spacing: -0.03em; margin: 12px 0 4px; }
.price-amount span { font-size: 15px; font-weight: 600; color: var(--muted); }
.price-for { font-size: 14px; color: var(--muted); margin: 0 0 22px; }
.price-list { list-style: none; padding: 0; margin: 0 0 26px; }
.price-list li {
  font-size: 15px; padding: 8px 0 8px 26px; position: relative;
  border-top: 1px solid var(--border);
}
.price-list li:first-child { border-top: none; }
.price-list li::before {
  content: "✓"; position: absolute; left: 0; top: 8px;
  color: var(--brand-d); font-weight: 900;
}
.price-btn {
  display: block; text-align: center; text-decoration: none;
  font-weight: 600; padding: 13px; border-radius: var(--radius);
  border: 1px solid var(--border); color: var(--ink);
  background: var(--bg); transition: border-color .15s;
}
.price-btn:hover { border-color: var(--ink); }
.price-btn-primary {
  background: var(--brand); color: #fff; border-color: var(--brand);
}
.price-btn-primary:hover { background: var(--brand-d); border-color: var(--brand-d); }
@media (max-width: 720px) {
  .price-grid { grid-template-columns: 1fr; }
  .price-featured { transform: none; }
}


### block: testimonials — お客様の声カード2-3枚（引用 + 名前 + 肩書 + アバター）

HTML:
<section id="testimonials">
  <div class="test-wrap">
    <div class="test-head">
      <h2 class="test-title">使っている人の声</h2>
      <p class="test-sub">さまざまな業種のチームに選ばれています。</p>
    </div>
    <div class="test-grid">
      <figure class="test-card">
        <blockquote class="test-quote">「導入してから、定例作業の時間が半分以下になりました。チーム全員がもう手放せないと言っています。」</blockquote>
        <figcaption class="test-person">
          <span class="test-avatar">SK</span>
          <span class="test-meta"><b>佐藤 健一</b><small>株式会社アクメ / 事業部長</small></span>
        </figcaption>
      </figure>
      <figure class="test-card">
        <blockquote class="test-quote">「とにかく操作が直感的。マニュアルを読まずに、初日からチームに浸透しました。」</blockquote>
        <figcaption class="test-person">
          <span class="test-avatar">YT</span>
          <span class="test-meta"><b>田中 由美</b><small>グローベックス / プロダクトマネージャー</small></span>
        </figcaption>
      </figure>
      <figure class="test-card">
        <blockquote class="test-quote">「サポートの対応が本当に早い。困ったときにすぐ解決できる安心感があります。」</blockquote>
        <figcaption class="test-person">
          <span class="test-avatar">MN</span>
          <span class="test-meta"><b>中村 誠</b><small>イニテック / 代表取締役</small></span>
        </figcaption>
      </figure>
    </div>
  </div>
</section>

CSS:
#testimonials { padding: clamp(64px, 9vw, 96px) 24px; background: var(--surface); }
.test-wrap { max-width: 1160px; margin: 0 auto; }
.test-head { text-align: center; max-width: 600px; margin: 0 auto 52px; }
.test-title { font-size: clamp(30px, 3.6vw, 42px); font-weight: 800; }
.test-sub { font-size: 17px; color: var(--muted); margin-top: 14px; }
.test-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.test-card {
  margin: 0; background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 30px 28px;
  display: flex; flex-direction: column; gap: 22px;
}
.test-quote { margin: 0; font-size: 16px; line-height: 1.75; }
.test-person { display: flex; align-items: center; gap: 14px; margin-top: auto; }
.test-avatar {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--brand), var(--brand-d));
  color: #fff; font-size: 14px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.test-meta { display: flex; flex-direction: column; line-height: 1.4; }
.test-meta b { font-size: 15px; }
.test-meta small { font-size: 13px; color: var(--muted); }
@media (max-width: 720px) {
  .test-grid { grid-template-columns: 1fr; }
}


### block: faq — よくある質問（native <details> 使用・JS不要）

HTML:
<section id="faq">
  <div class="faq-wrap">
    <div class="faq-head">
      <h2 class="faq-title">よくある質問</h2>
      <p class="faq-sub">お探しの答えが見つからないときは、お気軽にお問い合わせください。</p>
    </div>
    <div class="faq-list">
      <details class="faq-item">
        <summary class="faq-q">無料プランでどこまで使えますか？</summary>
        <div class="faq-a">無料プランでも基本機能はすべてお使いいただけます。プロジェクト数の上限のみ設定されています。</div>
      </details>
      <details class="faq-item">
        <summary class="faq-q">途中でプランを変更できますか？</summary>
        <div class="faq-a">はい、いつでもアップグレード・ダウングレードが可能です。差額は日割りで精算されます。</div>
      </details>
      <details class="faq-item">
        <summary class="faq-q">解約方法を教えてください。</summary>
        <div class="faq-a">設定画面からいつでもワンクリックで解約できます。違約金や手数料は一切かかりません。</div>
      </details>
      <details class="faq-item">
        <summary class="faq-q">データのセキュリティは大丈夫ですか？</summary>
        <div class="faq-a">すべての通信とデータは暗号化され、第三者機関によるセキュリティ監査も定期的に実施しています。</div>
      </details>
      <details class="faq-item">
        <summary class="faq-q">サポートはどのように受けられますか？</summary>
        <div class="faq-a">チャットとメールで対応しています。Proプラン以上では優先サポートをご利用いただけます。</div>
      </details>
    </div>
  </div>
</section>

CSS:
#faq { padding: clamp(64px, 9vw, 96px) 24px; }
.faq-wrap { max-width: 780px; margin: 0 auto; }
.faq-head { text-align: center; margin-bottom: 44px; }
.faq-title { font-size: clamp(30px, 3.6vw, 42px); font-weight: 800; }
.faq-sub { font-size: 17px; color: var(--muted); margin-top: 14px; }
.faq-list { display: flex; flex-direction: column; gap: 12px; }
.faq-item {
  border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--surface); overflow: hidden;
}
.faq-q {
  list-style: none; cursor: pointer; padding: 20px 24px;
  font-size: 16px; font-weight: 700;
  display: flex; align-items: center; justify-content: space-between;
}
.faq-q::-webkit-details-marker { display: none; }
.faq-q::after {
  content: "+"; font-size: 22px; font-weight: 400; color: var(--brand-d);
  transition: transform .2s;
}
.faq-item[open] .faq-q::after { transform: rotate(45deg); }
.faq-a {
  padding: 0 24px 22px; font-size: 15px; color: var(--muted);
}
@media (max-width: 720px) {
  .faq-q { padding: 18px 18px; }
  .faq-a { padding: 0 18px 20px; }
}


### block: cta — 最後のひと押し（大きな見出し + ボタンのバナー）

HTML:
<section id="cta">
  <div class="cta-wrap">
    <h2 class="cta-title">さあ、はじめましょう。</h2>
    <p class="cta-sub">3分で登録完了。あなたのチームの働き方が、今日から変わります。</p>
    <a href="#" class="cta-btn">無料ではじめる</a>
    <p class="cta-note">クレジットカード不要・いつでも解約可能</p>
  </div>
</section>

CSS:
#cta { padding: clamp(56px, 8vw, 88px) 24px; }
.cta-wrap {
  max-width: 1160px; margin: 0 auto;
  background: linear-gradient(135deg, var(--brand), var(--brand-d));
  border-radius: 24px; padding: clamp(48px, 7vw, 80px) 32px;
  text-align: center; color: #fff;
  box-shadow: 0 36px 70px -28px rgba(234,88,12,.5);
}
.cta-title { font-size: clamp(30px, 4.4vw, 50px); font-weight: 900; color: #fff; }
.cta-sub { font-size: clamp(16px, 1.7vw, 19px); margin: 18px auto 30px; max-width: 520px; opacity: .95; }
.cta-btn {
  display: inline-block; background: #fff; color: var(--brand-d);
  text-decoration: none; font-weight: 700; padding: 15px 36px;
  border-radius: var(--radius); transition: transform .1s;
}
.cta-btn:hover { transform: translateY(-2px); }
.cta-note { font-size: 13px; margin-top: 18px; opacity: .85; }


### block: footer — ミニマルなフッター（ロゴ + リンク列 + コピーライト）

HTML:
<section id="footer">
  <div class="foot-wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <span class="foot-logo">YourBrand</span>
        <p class="foot-tagline">あなたのビジネスを、次のステージへ。</p>
      </div>
      <div class="foot-cols">
        <div class="foot-col">
          <h4>製品</h4>
          <a href="#features">機能</a>
          <a href="#pricing">料金</a>
          <a href="#faq">よくある質問</a>
        </div>
        <div class="foot-col">
          <h4>会社</h4>
          <a href="#">運営会社</a>
          <a href="#">採用情報</a>
          <a href="#">お問い合わせ</a>
        </div>
        <div class="foot-col">
          <h4>規約</h4>
          <a href="#">利用規約</a>
          <a href="#">プライバシー</a>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <small>© 2026 YourBrand, Inc. All rights reserved.</small>
    </div>
  </div>
</section>

CSS:
#footer { padding: clamp(56px, 8vw, 80px) 24px 36px; border-top: 1px solid var(--border); background: var(--surface); }
.foot-wrap { max-width: 1160px; margin: 0 auto; }
.foot-top { display: grid; grid-template-columns: 1.4fr 2fr; gap: 48px; }
.foot-logo { font-size: 20px; font-weight: 900; letter-spacing: -0.03em; }
.foot-tagline { font-size: 14px; color: var(--muted); margin-top: 12px; max-width: 240px; }
.foot-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.foot-col { display: flex; flex-direction: column; gap: 10px; }
.foot-col h4 { font-size: 14px; font-weight: 700; margin: 0 0 4px; }
.foot-col a { font-size: 14px; color: var(--muted); text-decoration: none; transition: color .15s; }
.foot-col a:hover { color: var(--ink); }
.foot-bottom {
  margin-top: 44px; padding-top: 24px;
  border-top: 1px solid var(--border);
}
.foot-bottom small { font-size: 13px; color: var(--muted); }
@media (max-width: 720px) {
  .foot-top { grid-template-columns: 1fr; gap: 32px; }
  .foot-cols { grid-template-columns: repeat(2, 1fr); }
}
`;
module.exports = { LP_BLOCKS };
