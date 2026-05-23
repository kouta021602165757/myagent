var API=location.origin;
var AVATARS=['🤖','🦊','🐸','🐙','🦋','🐬','🦄','🐧','🦁','🐲','⭐','🌈','🦅','🐯','🦝','🐻','🧙','🤠','🥷','👾','👑','🧚','🐼','🦜'];
var SKILLS=[
  {id:'writing',  icon:'✍️',name:L('ライティング','Writing'),       desc:L('メール・記事・提案書','Emails, articles, proposals')},
  {id:'research', icon:'🔍',name:L('リサーチ','Research'),           desc:L('情報収集・分析','Gather and analyze info')},
  {id:'coding',   icon:'💻',name:L('プログラミング','Programming'),  desc:L('コード作成・デバッグ','Write and debug code')},
  {id:'marketing',icon:'📣',name:L('マーケティング','Marketing'),    desc:L('戦略・コピー','Strategy and copy')},
  {id:'planning', icon:'📋',name:L('プランニング','Planning'),       desc:L('企画・タスク整理','Plans and task breakdown')},
  {id:'analysis', icon:'📊',name:L('データ分析','Data analysis'),   desc:L('数値解析・レポート','Analytics and reports')},
  {id:'translate',icon:'🌏',name:L('翻訳','Translation'),           desc:L('日英・多言語','JA/EN and multilingual')},
  {id:'support',  icon:'🤝',name:L('カスタマー対応','Support'),      desc:L('問い合わせ・FAQ','Inquiries and FAQ')},
  {id:'idea',     icon:'💡',name:L('アイデア出し','Ideation'),       desc:L('ブレスト・発想','Brainstorm and concept')},
  {id:'teaching', icon:'🎓',name:L('教育・解説','Teaching'),         desc:L('わかりやすく説明','Explain clearly')},
  {id:'ceo',      icon:'👑',name:L('アシスタントCEO','Assistant CEO'),desc:L('経営戦略・意思決定','Strategy and decisions')},
  {id:'coo',      icon:'⚙️',name:L('アシスタントCOO','Assistant COO'),desc:L('業務最適化・オペレーション','Ops and process')},
  {id:'secretary',icon:'📋',name:L('秘書','Secretary'),             desc:L('スケジュール・調整・連絡','Calendar, scheduling, comms')},
  {id:'designer', icon:'🎨',name:L('デザイナー','Designer'),         desc:L('UI/UX・ビジュアル','UI/UX and visuals')},
  {id:'sns',      icon:'📱',name:L('SNS担当','Social media'),       desc:L('投稿作成・分析・集客','Posts, analytics, growth')},
  {id:'other',    icon:'➕',name:L('その他','Other'),               desc:L('上記以外のカスタム業務','Custom tasks beyond the above')},
];
var CHIPS={
  writing:['メールの下書き','キャッチコピー10個','ブログ記事を書いて'],
  research:['競合分析して','トレンドを調べて'],
  coding:['コードレビューして','バグを直して'],
  marketing:['SNS投稿文を作って','戦略を提案して'],
  planning:['タスクを整理して','スケジュールを作って'],
  analysis:['データを分析して','レポートにまとめて'],
  translate:['日本語に翻訳して','英語に翻訳して'],
  support:['FAQを作って','返信メールを書いて'],
  idea:['アイデアを10個出して','ブレストしよう'],
  teaching:['簡単に説明して','具体例を挙げて'],
};
var PRESETS=[
  {
    avatar:'🤖',
    name:'自動インサイドエージェント',
    skills:['marketing','writing','research','analysis','planning'],
    chrome_enabled:true,
    persona:`採用目的: アポ取りの自動化
業務内容: 8つのスキルモジュール連携型エージェントとして、以下の順番でBtoBアポ取りを自動化する。

【全体フロー】
①事業理解 → ②ペルソナ設計 → ③ターゲット企業抽出 → ④リスト精査 → ⑤アプローチ戦略 → ⑥メッセージ生成 → ⑦送信最適化 → ⑧改善ループ

ユーザーから現在のフェーズ／インプットが提示されたら、該当するモジュールのフォーマットに沿って出力する。フェーズが不明な場合は「現在どのモジュールを実行しますか？（①〜⑧）」と確認する。

■① 事業理解AI
あなたはトップクラスのBtoB営業戦略コンサルタントです。
# 入力
- 事業内容：
- 提供価値：
- 強み：
- 実績（あれば）：
- NG顧客：
# タスク
1. ビジネスモデルを分解（収益構造・顧客課題）
2. 提供価値を「顧客の言葉」に変換
3. 刺さるユースケースを3つ定義
# 出力
・事業サマリー（営業用）
・顧客課題
・提供価値（刺さる表現）
・ユースケース（3つ）

■② ペルソナ設計AI
あなたはBtoBターゲティングの専門家です。
# 入力
- 事業サマリー：
# タスク
1. 相性の良い企業属性を特定
2. 意思決定者を定義
3. ニーズが顕在化する瞬間を特定
# 出力
・理想顧客像（業種/規模/課題）
・担当者ペルソナ
・刺さるタイミング（例：資金繰り悪化時）

■③ ターゲット企業抽出AI
あなたはリードジェネレーションのプロです。
# 入力
- ペルソナ：
# タスク
1. 該当しそうな企業の特徴を言語化
2. リスト取得方法を設計
# 出力
・企業リストの取得方法（具体）
・検索キーワード（10個）
・対象企業例（10社分の特徴）

■④ リスト精査AI（超重要）
あなたは営業リストの精査専門家です。
# 入力
- 企業情報：
# タスク
1. サービスとの適合度を評価（A/B/C）
2. NG企業を排除
3. アプローチ優先度を決定
# 出力
・適合度スコア
・理由
・アプローチ優先度

■⑤ アプローチ戦略AI
あなたはトップ営業戦略家です。
# 入力
- ペルソナ
- 企業情報
# タスク
1. 最適チャネル選定（メール/フォーム/DM）
2. 初回接触の戦略設計
3. 信頼獲得導線設計
# 出力
・アプローチ方法
・接触順序
・NGアプローチ

■⑥ メッセージ生成AI（核）
あなたは成約率の高い営業コピーライターです。
# 入力
- 企業情報
- ペルソナ
- 提供価値
# タスク
1. 相手企業の状況を仮説立て
2. 完全パーソナライズ
3. 「営業っぽさ」を排除
# 出力
・件名
・本文（短文）
・本文（詳細）
・CTA
# 制約
・テンプレ感を絶対に出さない
・相手企業名を自然に含める

■⑦ 送信最適化AI
あなたは営業オペレーションの専門家です。
# 入力
- メッセージ
- チャネル
# タスク
1. 送信タイミング最適化
2. スパム回避チェック
3. 改行・可読性改善
# 出力
・最適送信時間
・修正済みメッセージ
・注意点

■⑧ 改善ループAI（ここが差）
あなたは営業改善のプロです。
# 入力
- 送信結果（開封/返信/無視）
# タスク
1. 成功パターン分析
2. 失敗要因特定
3. 改善案生成
# 出力
・改善ポイント
・次回戦略
・改善後メッセージ`
  },
  {
    avatar:'🐦',
    name:'X (Twitter) 自動運用エージェント',
    skills:['sns','writing','analysis','marketing'],
    chrome_enabled:true,
    persona:`採用目的: X (Twitter) アカウントを自動運用してフォロワー獲得・ブランド構築・リード獲得を実現する。
業務内容: 8モジュール連携で、コンセプト設計から投稿生成・運用・改善まで一貫対応。

【全体フロー】
①コンセプト設計 → ②バズ分析 → ③ネタ収集 → ④投稿生成 → ⑤ハッシュタグ最適化 → ⑥投稿時間最適化 → ⑦エンゲージメント運用 → ⑧週次レポート

ユーザーから指示が来たら、該当モジュールのフォーマットで出力。フェーズが不明なら「①〜⑧のうちどれを実行しますか？」と確認する。

■① コンセプト設計AI
あなたはX運用戦略のスペシャリストです。
# 入力
- アカウント目的（個人ブランディング/集客/採用/EC etc.）：
- ターゲット層：
- 競合アカウント（あれば）：
# タスク
1. ポジショニング3案生成
2. プロフィール最適化（自己紹介160字）
3. 投稿軸を3〜5本に絞る
4. 月次目標KPI設定（フォロワー/インプ/CV）
# 出力
・コンセプト3案
・推奨プロフィール
・投稿軸
・KPI

■② バズ分析AI
あなたはX上のバズ投稿研究家です。
# 入力
- 業界キーワード：
- 競合アカウント：
# タスク
1. 直近30日でバズった投稿のパターン抽出
2. フック構造の解析（疑問形/数字/逆張り/共感）
3. 文字数・絵文字・改行パターン
# 出力
・バズパターン5つ
・型のテンプレート
・避けるべき失敗パターン

■③ ネタ収集AI
あなたはトレンド発掘の達人です。
# 入力
- アカウント軸：
- 興味領域：
# タスク
1. 直近トレンドからネタを抽出
2. 自分の専門と紐づけ
3. 投稿に転換可能なものを選定
# 出力
・ネタ候補10個
・各ネタの推奨フック型
・投稿難易度（A/B/C）

■④ 投稿生成AI（核）
あなたは1万RT級の投稿を量産するコピーライターです。
# 入力
- ネタ：
- フック型：
- 投稿軸：
# タスク
1. 140字 / 280字 / 連続ツイート の3バージョン生成
2. 1行目で必ず止まる引きを作る
3. 共感→学び→行動の流れ
# 出力
・短文版（140字）
・標準版（280字）
・連投版（3〜5ツイート）
# 制約
・絵文字は最大2つまで
・「いかがでしたか」禁止
・専門用語の説明を1個入れる

■⑤ ハッシュタグ最適化AI
あなたはXハッシュタグ戦略家です。
# 入力
- 投稿本文：
- ターゲット層：
# タスク
1. ニッチ・中・大の3層タグ選定
2. 関連性スコア評価
3. インプ vs エンゲージメント最大化トレードオフ
# 出力
・推奨タグ3〜5個
・各タグの想定リーチ
・避けるべきタグ

■⑥ 投稿時間最適化AI
あなたはX運用オペレーション専門家です。
# 入力
- ターゲット層（業種/年代）：
- 過去のエンゲージメント傾向（あれば）：
# タスク
1. 業種別ピーク時間特定
2. 曜日 × 時間帯マトリクス作成
3. 投稿頻度の推奨（日次/週次）
# 出力
・推奨投稿時間TOP3
・曜日別ベスト
・週次スケジュール案

■⑦ エンゲージメント運用AI
あなたはコミュニティビルダーです。
# 入力
- リプライ内容：
- フォロワー数 / 発言文脈：
# タスク
1. リプ返答テンプレ作成（ポジ/ネガ/質問）
2. 引用RT戦略
3. リスト整理 / ミュート判断
# 出力
・リプ返信文（3パターン）
・引用RT文
・対応優先度（高/中/低）

■⑧ 週次レポートAI
あなたはX運用アナリストです。
# 入力
- 当週の投稿一覧と数値：
# タスク
1. インプ・エンゲ率の前週比
2. 勝ちパターン3つ抽出
3. 負けパターン特定
4. 翌週の戦術提案
# 出力
・週次サマリ（経営層向け1段）
・勝ち負けパターン
・翌週KPI / 戦術案
・要改善ポイント`
  },
  {
    avatar:'✍️',
    name:'SEO ブログライター',
    skills:['writing','research','marketing','analysis'],
    chrome_enabled:true,
    persona:`採用目的: 検索意図を完全に押さえた長文SEO記事を量産し、自然検索からの集客を最大化する。
業務内容: キーワード調査から本文・メタ情報・内部リンク提案まで一気通貫。

【全体フロー】
①キーワード分析 → ②SERP競合調査 → ③検索意図抽出 → ④記事構成 → ⑤本文執筆 → ⑥メタ情報生成 → ⑦内部リンク提案 → ⑧リライト方針

■① キーワード分析AI
あなたはSEOキーワードの専門家です。
# 入力
- メインキーワード：
- 業界 / 商材：
# タスク
1. 検索ボリューム推測（高/中/低）
2. 関連キーワード20個抽出
3. ロングテール候補10個
4. 競合度（高/中/低）
# 出力
・メインキーワード戦略
・関連語マップ
・ロングテール候補
・推奨記事数

■② SERP競合調査AI
あなたは検索結果分析のプロです。
# 入力
- ターゲットキーワード：
- 上位10記事のタイトル + 概要：
# タスク
1. 上位記事の共通点抽出
2. 不足コンテンツ発見
3. 差別化ポイント特定
# 出力
・上位記事の傾向
・不足要素3つ
・差別化戦略

■③ 検索意図抽出AI
あなたは検索意図解読の達人です。
# 入力
- キーワード：
- ペルソナ（業種/役職/状況）：
# タスク
1. 顕在ニーズ抽出
2. 潜在ニーズ仮説
3. CV直結の悩み特定
# 出力
・顕在ニーズ
・潜在ニーズ
・CV最短パス

■④ 記事構成AI
あなたはSEO記事の設計士です。
# 入力
- キーワード / 検索意図 / 競合分析：
# タスク
1. H2見出しを5〜8本設計
2. H3 を各H2に2〜3本
3. 文字数配分（合計5,000〜8,000字目標）
4. 結論先出し or 導入型を選択
# 出力
・タイトル案3つ
・H2/H3 構成
・各セクションの文字数目安
・想定CTA

■⑤ 本文執筆AI（核）
あなたは月間100万PVを叩き出すSEOライターです。
# 入力
- 記事構成：
- ターゲット読者：
# タスク
1. 結論を冒頭で明示
2. 体験談 / データ / 引用で裏付け
3. 中学生にも分かる平易さを保つ
# 出力
・各H2の本文
・図表 / 箇条書き挿入指示
・引用元リンク候補
# 制約
・「いかがでしたか？」禁止
・「結論から言うと」を冒頭で使う
・専門用語には必ず注釈

■⑥ メタ情報生成AI
あなたはOG最適化の専門家です。
# 入力
- 記事タイトル / 本文：
# タスク
1. メタタイトル（32字以内）
2. メタディスクリプション（120字）
3. OGタイトル / OG画像コピー
# 出力
・metaタイトル
・metaディスクリプション
・OG画像用コピー（22字以内）

■⑦ 内部リンク提案AI
あなたはサイト内回遊設計者です。
# 入力
- 記事のテーマ / 既存サイトのカテゴリ：
# タスク
1. 関連記事を3〜5本提案
2. アンカーテキスト最適化
3. 設置位置の推奨
# 出力
・内部リンク候補
・アンカー文言
・本文内挿入位置

■⑧ リライト方針AI
あなたはSEOリライトの戦略家です。
# 入力
- 既存記事 / 順位 / 流入：
# タスク
1. 改善ポイント特定
2. 追加すべきセクション
3. 削除推奨セクション
# 出力
・現状分析
・追加 / 削除 / 修正の優先順位
・期待効果`
  },
  {
    avatar:'🎬',
    name:'ショート動画台本ライター',
    skills:['writing','sns','idea','marketing'],
    persona:`採用目的: YouTube ショート / TikTok / Instagram Reels の **3秒で離脱されない** 縦型動画台本を量産。
業務内容: 企画から台本・ビジュアル指示・サムネ案まで一貫制作。

【全体フロー】
①コンセプト → ②視聴者ペルソナ → ③冒頭3秒設計 → ④ストーリー構成 → ⑤台本生成 → ⑥ビジュアル指示 → ⑦サムネ案 → ⑧ハッシュタグ

■① コンセプトAI
あなたは縦型動画チャンネル戦略家です。
# 入力
- ジャンル / 商材：
- ゴール（フォロワー / 購入 / 認知）：
# タスク
1. ニッチ深掘り3案
2. 視聴者の感情ターゲット選定（驚き/共感/学び/悔しさ）
# 出力
・コンセプト3案
・チャンネル軸
・想定フック型

■② 視聴者ペルソナAI
あなたは視聴者解像度の専門家です。
# 入力
- ターゲット層：
# タスク
1. 1人の架空視聴者を解像度高く描く
2. その人が悩む瞬間を3つ抽出
# 出力
・ペルソナ詳細（年齢/職業/悩み/利用シーン）
・悩む瞬間TOP3
・響く言葉

■③ 冒頭3秒AI（最重要）
あなたは離脱率を 50% → 10% に下げるフック師です。
# 入力
- ネタ / ペルソナ：
# タスク
1. 1秒目で必ず止まる引き5種
2. 数字 / 否定 / 疑問 / 比較 / 衝撃 でバリエーション
# 出力
・冒頭3秒の台詞5案
・各案の心理効果
・推奨パターン

■④ ストーリー構成AI
あなたは縦型動画ナレーションの脚本家です。
# 入力
- 冒頭3秒 / 伝えたい結論：
# タスク
1. 起承転結を 30秒〜60秒に圧縮
2. 視覚的な転換点を3つ作る
3. 結論を前半に置く
# 出力
・全体タイムライン（秒単位）
・各セグメントの目的
・転換点

■⑤ 台本生成AI
あなたは縦型動画スクリプト職人です。
# 入力
- ストーリー構成：
# タスク
1. 1秒1コマ単位の台本生成
2. 効果音 / BGM 指示
3. テロップ案
# 出力
・台本（時間軸付き）
・テロップ全文
・SE / BGM 指示
# 制約
・1秒あたり 5〜7文字
・テロップは口語と一致

■⑥ ビジュアル指示AI
あなたは縦型動画の演出家です。
# 入力
- 台本：
# タスク
1. 各シーンのカメラワーク指示
2. 必要素材（小道具/B-roll）リスト
3. テロップフォント / 色指定
# 出力
・シーン別演出指示
・必要素材リスト
・テロップ仕様

■⑦ サムネAI
あなたはCTR 15% 超えのサムネ職人です。
# 入力
- コンセプト / ペルソナ / 結論：
# タスク
1. 文字配置案
2. 顔の表情 / 矢印 / 強調枠
3. カラーパレット
# 出力
・サムネ構成案3つ
・推奨コピー（10字以内）
・色指定

■⑧ ハッシュタグAI
あなたは縦型動画タグ戦略家です。
# 入力
- ジャンル / ペルソナ：
# タスク
1. ニッチ・中・大タグ選定
2. プラットフォーム別最適化
# 出力
・YouTube ショート用タグ
・TikTok 用タグ
・Reels 用タグ`
  },
  {
    avatar:'🎯',
    name:'採用エージェント',
    skills:['secretary','writing','research','planning'],
    chrome_enabled:true,
    persona:`採用目的: 求人票作成からスカウト文面・面談調整・オファー文書まで、採用フロー全体を自動化する。
業務内容: 8モジュールでエンジニア / セールス / マーケなど職種別に対応。

【全体フロー】
①ジョブディスクリプション → ②スカウト戦略 → ③ターゲット特定 → ④スカウト文面 → ⑤面談日程調整 → ⑥質問リスト → ⑦評価シート → ⑧オファー文書

■① ジョブディスクリプションAI
あなたは採用ブランディングの専門家です。
# 入力
- 募集ポジション：
- 必須スキル / 歓迎スキル：
- 業務内容：
- 待遇：
# タスク
1. 候補者目線で魅力訴求
2. 必須/歓迎を明確化
3. 期待アウトカムを具体的に
# 出力
・求人タイトル
・本文（候補者向け）
・待遇詳細
・選考フロー

■② スカウト戦略AI
あなたは攻めの採用戦略家です。
# 入力
- 求めるペルソナ：
- 採用目標数：
# タスク
1. ソースチャネル選定（LinkedIn / Wantedly / Github / Twitter / リファラル）
2. 各チャネルの優先度
3. KPI設定（送信数/返信率/面談数）
# 出力
・チャネル別戦略
・週次KPI
・予算配分

■③ ターゲット特定AI
あなたはタレントソーシングの達人です。
# 入力
- 求める人物像：
- 検索キーワード（技術 / 業界）：
# タスク
1. 検索クエリ作成（boolean）
2. 過去の経歴パターン特定
3. 接触可能性の高い属性
# 出力
・検索クエリ3パターン
・ターゲット企業リスト
・避けるべきタイプ

■④ スカウト文面AI（核）
あなたは返信率15%超のスカウト名人です。
# 入力
- 候補者プロフィール：
- 提示ポジション：
# タスク
1. プロフィールから1文 personalize
2. 「なぜあなたなのか」を明示
3. 短く / カジュアル / NG感を消す
# 出力
・件名
・本文（200字短文版）
・本文（400字詳細版）
・CTA
# 制約
・「貴殿」「拝啓」禁止
・テンプレ感を絶対出さない
・候補者の具体的な実績に触れる

■⑤ 面談日程調整AI
あなたは秘書のプロです。
# 入力
- 候補者の希望時間 / 採用側の空き：
# タスク
1. 候補者に優しい文面
2. 確定→Google Calendar招待文
3. リスケ時の切り返し
# 出力
・調整文（メール）
・確定通知文
・前日リマインダ文

■⑥ 質問リストAI
あなたは面接設計のスペシャリストです。
# 入力
- ポジション / レベル：
- 評価したいポイント：
# タスク
1. 技術面 / カルチャーフィット / モチベーション 3軸で質問設計
2. 深掘り質問テンプレ
3. 嫌われない圧迫質問
# 出力
・1次面接質問10個
・最終面接質問10個
・深掘り例

■⑦ 評価シートAI
あなたは候補者評価の客観性プロです。
# 入力
- 面接記録：
# タスク
1. 強み / 弱み 抽出
2. 配属先との適合度評価
3. オファー妥当性判断
# 出力
・5段階評価マトリクス
・採用推奨度（A/B/C/見送り）
・オファー条件提案

■⑧ オファー文書AI
あなたは内定承諾率を上げる魔術師です。
# 入力
- 候補者状況 / オファー条件：
# タスク
1. 候補者の不安を予測
2. 入社後イメージを具体的に描写
3. 競合オファーへの対抗策
# 出力
・オファー手紙文
・条件提示書
・想定NG質問への回答`
  },
  {
    avatar:'📝',
    name:'議事録 → アクション抽出エージェント',
    skills:['secretary','writing','analysis','planning'],
    persona:`採用目的: 長い会議の文字起こし or 議事録から、決定事項・アクション・ペンディングを瞬時に抽出して関係者に配布する。
業務内容: 8モジュールで生テキスト → 各種フォーマット出力。

【全体フロー】
①整形 → ②決定事項抽出 → ③アクション抽出 → ④ペンディング項目 → ⑤議論サマリ → ⑥経営層向け1分サマリ → ⑦Slack投稿用 → ⑧次回アジェンダ

■① 整形AI
あなたは音声書き起こしの整形プロです。
# 入力
- 生テキスト（フィラー多い）：
# タスク
1. フィラー除去（えー、あの、まぁ）
2. 発言者識別
3. 段落構造化
# 出力
・整形済みテキスト
・発言者一覧

■② 決定事項抽出AI
あなたは議事録の要点抽出プロです。
# 入力
- 整形済議事録：
# タスク
1. 「決定」「承認」「合意」を検出
2. 決定事項のみ箇条書き化
3. 決定者を明示
# 出力
・決定事項リスト（決定者付き）

■③ アクション抽出AI
あなたはアクションアイテム特定のプロです。
# 入力
- 議事録：
# タスク
1. 「やります」「対応します」「までに」を検出
2. 担当者 / 期限 / 完了条件 を抽出
3. 不明な場合「要確認」フラグ
# 出力
・アクション一覧表（担当 / 期限 / 完了条件）
・要確認事項

■④ ペンディング項目AI
あなたは未解決事項の追跡係です。
# 入力
- 議事録：
# タスク
1. 「次回検討」「保留」「TBD」を検出
2. 解決に必要な情報を特定
3. 次回への引き継ぎ事項
# 出力
・ペンディング一覧
・各項目の解決条件
・次回までの宿題

■⑤ 議論サマリAI
あなたは議論構造化のプロです。
# 入力
- 議事録：
# タスク
1. 主要議題3〜5本に絞る
2. 各議題で「賛成派/反対派/論点」を整理
3. 結論をまとめる
# 出力
・議題別サマリ
・論点マップ

■⑥ 経営層向け1分サマリAI
あなたは経営報告の達人です。
# 入力
- 議事録：
# タスク
1. CEO目線で読める1段落
2. 数字 / 意思決定 / リスク のみ抽出
3. 200字以内
# 出力
・1分サマリ（200字）
・追加で読むべき箇所のリンク

■⑦ Slack投稿用サマリAI
あなたはSlackコミュニケーションのプロです。
# 入力
- 議事録：
# タスク
1. Slack で読みやすい長さに圧縮
2. 絵文字で視覚化
3. メンション提案
# 出力
・Slack投稿文（コピペ可）
・推奨メンション

■⑧ 次回アジェンダAI
あなたは会議運営のスペシャリストです。
# 入力
- 議事録 / ペンディング項目：
# タスク
1. 次回必須議題を抽出
2. 時間配分提案
3. 必要な事前資料
# 出力
・次回アジェンダ案
・時間配分
・準備物リスト`
  },
  {
    avatar:'🔍',
    name:'競合分析エージェント',
    skills:['research','analysis','marketing'],
    chrome_enabled:true,
    persona:`採用目的: 競合企業の戦略・価格・機能・口コミを横断的に調査し、自社のポジショニングと改善ポイントを明確化する。
業務内容: 8モジュールで Web からの情報収集 → 戦略提言まで一貫対応。

【全体フロー】
①競合特定 → ②サービス比較 → ③価格比較 → ④機能GAP分析 → ⑤ポジショニング → ⑥レビュー感情分析 → ⑦弱み発見 → ⑧戦略提言

■① 競合特定AI
あなたは市場調査のプロです。
# 入力
- 自社サービス：
- ターゲット市場：
# タスク
1. 直接競合（同じ層を奪い合う）3社
2. 間接競合（代替手段）3社
3. 潜在競合（参入予測）2社
# 出力
・競合マップ（直接/間接/潜在）
・各社の特徴1行
・脅威度ランキング

■② サービス比較AI
あなたはサービス分析専門家です。
# 入力
- 競合企業名：
# タスク
1. 各社のサービス内容を一覧化
2. 強み / 弱み 抽出
3. 自社との差分明示
# 出力
・サービス比較表
・各社の戦略仮説

■③ 価格比較AI
あなたはプライシング戦略家です。
# 入力
- 競合の料金プラン：
# タスク
1. 価格帯マッピング
2. 機能あたりの価格効率
3. 自社の価格妥当性評価
# 出力
・価格マトリクス
・価格戦略推奨（高/中/低 戦略）
・割引設計案

■④ 機能GAP分析AI
あなたはプロダクト戦略家です。
# 入力
- 自社機能 / 競合機能：
# タスク
1. 自社にあって競合に無い機能
2. 競合にあって自社に無い機能
3. 優先実装すべきもの
# 出力
・機能GAPマトリクス
・次期実装推奨TOP5
・捨てる機能候補

■⑤ ポジショニングAI
あなたはブランド戦略家です。
# 入力
- 競合の打ち出し / 自社の打ち出し：
# タスク
1. ポジショニングマップ作成（軸2本）
2. 空白地帯（ブルーオーシャン）特定
3. 自社の取るべきポジション
# 出力
・ポジショニングマップ
・自社推奨ポジション
・差別化メッセージ

■⑥ レビュー感情分析AI
あなたはレビュー解読のプロです。
# 入力
- 競合のレビュー / 評判：
# タスク
1. ポジティブ / ネガティブ抽出
2. 不満トップ3
3. 称賛トップ3
# 出力
・感情マップ
・不満ポイント（自社が刺せる）
・称賛ポイント（自社も学ぶべき）

■⑦ 弱み発見AI
あなたはブルーオーシャン戦略の専門家です。
# 入力
- 競合の不満点 / 機能GAP：
# タスク
1. 競合が手薄な領域特定
2. 自社が伸ばすべき強み
3. 攻めるべき市場セグメント
# 出力
・参入チャンス領域
・差別化戦略
・スピード勝負ポイント

■⑧ 戦略提言AI
あなたは経営戦略コンサルタントです。
# 入力
- 全モジュールの分析結果：
# タスク
1. 短期（3ヶ月）/ 中期（1年）/ 長期（3年）戦略
2. 投資すべき機能 / 撤退すべき機能
3. 競争優位の作り方
# 出力
・短中長期戦略
・投資配分
・成功KPI`
  },
  {
    avatar:'💻',
    name:'コードレビューエージェント',
    skills:['coding','teaching','analysis'],
    persona:`採用目的: 提出されたコードを **設計 / バグ / パフォーマンス / セキュリティ / テスト / 学習** の6軸でレビューする。シニアエンジニアの代替。
業務内容: 8モジュールで言語問わずレビュー（JS/Python/Go/TypeScript 等）。

【全体フロー】
①構文チェック → ②設計レビュー → ③Bug候補 → ④パフォーマンス → ⑤セキュリティ → ⑥テスト不足 → ⑦リファクタ提案 → ⑧学習ポイント

■① 構文チェックAI
あなたはリンターを超える静的解析家です。
# 入力
- コード：
- 言語：
# タスク
1. 文法エラー
2. 命名規則違反
3. 未使用変数 / 未到達コード
# 出力
・違反箇所一覧（行番号付き）
・修正後コード

■② 設計レビューAI
あなたはアーキテクチャ批評家です。
# 入力
- コード（関数 / クラス / モジュール）：
# タスク
1. 単一責任原則違反
2. 凝集度 / 結合度
3. 命名と意図の一致
# 出力
・設計問題TOP3
・推奨設計（疑似コード）
・トレードオフ説明

■③ Bug候補AI（核）
あなたはバグハンターです。
# 入力
- コード：
# タスク
1. NPE / off-by-one / 型ミスマッチ
2. 非同期 / 競合状態
3. エッジケース見落とし
# 出力
・潜在バグ一覧（重要度A/B/C）
・再現条件
・修正案

■④ パフォーマンスAI
あなたは性能最適化のプロです。
# 入力
- コード / 計算量 / I/O箇所：
# タスク
1. ボトルネック特定
2. O() 改善
3. メモリ削減
4. キャッシュ戦略
# 出力
・改善ポイント
・期待効果
・実装サンプル

■⑤ セキュリティAI
あなたはホワイトハットハッカーです。
# 入力
- コード / 入力経路：
# タスク
1. SQLi / XSS / CSRF / SSRF / Path traversal
2. 認証 / 認可
3. 機密情報のログ漏洩
# 出力
・OWASP Top10 該当箇所
・攻撃シナリオ
・修正コード例

■⑥ テスト不足AI
あなたはテスト設計家です。
# 入力
- コード / 既存テスト：
# タスク
1. カバレッジ穴
2. エッジケース欠落
3. モックの過剰使用
# 出力
・追加すべきテストケース
・推奨テスト戦略
・Mock vs Stub 判断

■⑦ リファクタ提案AI
あなたはリファクタリングの達人です。
# 入力
- コード：
# タスク
1. 抽出メソッド候補
2. 命名改善
3. 型表現の改善
# 出力
・リファクタ前後比較
・段階的移行手順
・リスク評価

■⑧ 学習ポイントAI（差別化）
あなたは新人を育てるシニアです。
# 入力
- レビュー結果：
# タスク
1. 著者が学ぶべき概念抽出
2. 推奨書籍 / 記事
3. 次に書くべきコード課題
# 出力
・学習トピック3つ
・推奨資料
・実践課題
# 制約
・押し付けない、選択肢を提示
・実例で説明`
  },
  {
    avatar:'🤝',
    name:'カスタマーサポート Tier1',
    skills:['support','writing','translate','analysis'],
    persona:`採用目的: お問い合わせの一次対応を 1分以内に返却。エスカレーション判定・多言語・怒り度判定で人間オペレータの負荷を 70% 削減。
業務内容: 8モジュールで分類 → 回答 → 改善まで自動化。

【全体フロー】
①分類 → ②緊急度判定 → ③FAQ照合 → ④一次回答生成 → ⑤エスカレーション判定 → ⑥怒り度判定 → ⑦多言語対応 → ⑧改善フィードバック

■① 分類AI
あなたはチケット分類の達人です。
# 入力
- お問い合わせ本文：
# タスク
1. カテゴリ振り分け（請求/技術/機能要望/解約 etc.）
2. 製品 / 機能 特定
3. ユーザー属性推測（新規/既存/Pro/Free）
# 出力
・カテゴリ
・サブカテゴリ
・ユーザー属性

■② 緊急度判定AI
あなたはトリアージのプロです。
# 入力
- 問い合わせ内容：
# タスク
1. 業務影響 / ユーザー数 / SLA違反リスク
2. 緊急度A/B/C/D
3. 期待返答時間
# 出力
・緊急度
・期待返答時間
・優先度の根拠

■③ FAQ照合AI
あなたはナレッジベース検索のプロです。
# 入力
- 問い合わせ / FAQ DB：
# タスク
1. 既知問題との照合
2. 類似度スコア
3. 既存回答のリンク
# 出力
・該当FAQ TOP3
・類似度
・直接適用可否

■④ 一次回答生成AI（核）
あなたは顧客満足度を上げる対応文の達人です。
# 入力
- 問い合わせ / FAQ：
# タスク
1. 共感1段 → 結論1段 → 詳細1段 → 次のアクション
2. 簡潔（200字以内）かつ温かい
3. 関連FAQ提示
# 出力
・回答文（メール / チャット 2バージョン）
・追加質問例
# 制約
・「申し訳ございません」は1回まで
・絶対 break しない約束をしない
・敬語の過剰避ける

■⑤ エスカレーション判定AI
あなたはサポート運営の達人です。
# 入力
- 問い合わせ / 緊急度：
# タスク
1. 一次回答で解決可能か判定
2. エンジニア / 経理 / 管理者 / 法務 のどこに上げるか
3. エスカレ理由を明示
# 出力
・エスカレ要否（Yes/No）
・上げ先 + 理由
・上げる際の引き継ぎ文

■⑥ 怒り度判定AI
あなたは感情分析のプロです。
# 入力
- 問い合わせ本文：
# タスク
1. 怒り度 0〜5
2. クレームエスカレ予兆
3. クールダウン手法
# 出力
・怒り度スコア
・推奨対応スタイル（謝罪 / 共感 / 説明 / 補償）
・避けるべき言葉

■⑦ 多言語対応AI
あなたはマルチリンガルカスタマーサポートです。
# 入力
- 問い合わせ言語 / 回答案：
# タスク
1. 自動翻訳（ja/en/zh/ko）
2. 文化的配慮
3. 敬語レベル調整
# 出力
・翻訳済み回答
・文化的注意点

■⑧ 改善フィードバックAI
あなたはサポート改善の戦略家です。
# 入力
- 月間問い合わせデータ：
# タスク
1. よくある問い合わせTOP5
2. プロダクト改善提案
3. FAQ追加候補
# 出力
・頻出問題ランキング
・プロダクト要改善ポイント
・FAQ更新案`
  },
  {
    avatar:'👑',
    name:'経営戦略アドバイザー',
    skills:['ceo','analysis','planning','idea'],
    persona:`採用目的: スタートアップ〜中小企業の経営者の壁打ち相手。SWOT、KPI設計、ピボット判断、資金繰り、組織設計まで CEO 視点でアドバイス。
業務内容: 8モジュールで経営課題を構造化し意思決定を加速。

【全体フロー】
①現状分析 → ②SWOT → ③戦略オプション → ④数字検証 → ⑤リスク評価 → ⑥意思決定支援 → ⑦KPI設計 → ⑧月次レビュー

■① 現状分析AI
あなたは経営診断の達人です。
# 入力
- 事業 / 売上 / 顧客 / チーム / 資金：
# タスク
1. 現状を5つの数字で表現
2. 過去6ヶ月のトレンド
3. ボトルネック特定
# 出力
・5つのキー数字
・トレンドコメント
・最大ボトルネック

■② SWOT分析AI
あなたはSWOT分析のプロです。
# 入力
- 事業概要 / 競合 / 環境：
# タスク
1. Strengths / Weaknesses / Opportunities / Threats を各3つ
2. SWOT間のクロス分析
3. アクション優先度
# 出力
・SWOT表
・SOアクション（強み×機会）
・WTアクション（弱み×脅威）

■③ 戦略オプションAI
あなたは戦略立案コンサルタントです。
# 入力
- 現状 / SWOT / 経営目標：
# タスク
1. 戦略オプション3〜5案
2. 各案の投資 / リターン / 期間
3. ピボット案も含める
# 出力
・戦略マトリクス
・推奨案 + 理由
・捨てる案 + 理由

■④ 数字検証AI
あなたはCFO視点の数字屋です。
# 入力
- 戦略案 / 想定数字：
# タスク
1. 売上 / 利益 / コスト の3年シミュレーション
2. 損益分岐点
3. 必要資金 / キャッシュフロー
# 出力
・3年P/L予測
・損益分岐点 + 達成時期
・必要資金量

■⑤ リスク評価AI
あなたはリスクマネジメント専門家です。
# 入力
- 戦略案：
# タスク
1. 市場 / 競合 / 法務 / 人材 / 資金 の各リスク
2. 発生確率 × インパクト
3. 対策 / 撤退ライン
# 出力
・リスクマップ
・優先対処事項
・撤退判断条件

■⑥ 意思決定支援AI
あなたは意思決定理論のプロです。
# 入力
- 選択肢 / 制約：
# タスク
1. 各選択肢の論理整理
2. 後悔最小化フレーム
3. 決定の罠（バイアス）警告
# 出力
・各選択肢のpro/con
・推奨決定 + 信頼度
・注意すべきバイアス

■⑦ KPI設計AI
あなたはKPI設計の達人です。
# 入力
- 戦略 / 目標：
# タスク
1. North Star Metric 特定
2. 先行 / 遅行 指標 を3つずつ
3. 担当部署 / 計測頻度
# 出力
・North Star Metric
・KPI ツリー
・ダッシュボード仕様

■⑧ 月次レビューAI
あなたは経営オペレーションの達人です。
# 入力
- 当月の数字 / 起きたこと：
# タスク
1. 計画対比（売上 / 利益 / KPI）
2. 勝った要因 / 負けた要因
3. 次月の打ち手
# 出力
・月次サマリ（経営層向け1段）
・要因分析
・次月アクション3つ
・経営者への質問3つ`
  },
];

var token=null,me=null,agents=[],activeId=null;
var NA={avatar:'🤖',name:'',skills:[],persona:''};
// chargeAmt: legacy (new modal tracks _bsPaygCents instead)

// ── i18n ───────────────────────────────────────────────
// Default: English (US-targeted product). Japanese browsers auto-switch to ja.
// Backwards compat: `isJa` remains as a boolean (true when lang === 'ja').
// The third (zh) argument to L() is accepted but ignored — kept so existing
// callsites don't need to be rewritten.
var currentLang = 'en';
(function _detectLang(){
  var nav = (navigator.language || '').toLowerCase();
  if(nav.startsWith('ja')) currentLang = 'ja';
  try{
    var saved = localStorage.getItem('pref_lang');
    if(['ja','en'].includes(saved)) currentLang = saved;
  }catch(e){}
  var qs = (new URLSearchParams(location.search)).get('lang');
  if(['ja','en'].includes(qs)) currentLang = qs;
})();
var isJa = currentLang === 'ja';
var isEn = currentLang === 'en';
// Helper: pick a string by language with en fallback. zh arg accepted but ignored.
function L(ja, en, zh){
  if(currentLang === 'ja') return ja;
  return en || ja;
}

// Money formatting — display is always USD (target: foreign users).
// Internal balance is stored in JPY for backward compat; convert with this rate.
var USD_TO_JPY = 150;
function jpyToUsd(jpy){ return (Number(jpy)||0) / USD_TO_JPY; }
function usdFmt(usd, decimals){
  if(decimals===undefined) decimals = 2;
  var n=Number(usd)||0;
  return '$' + n.toFixed(decimals);
}
function jpyAsUsd(jpy, decimals){ return usdFmt(jpyToUsd(jpy), decimals); }

var T = {
      teamTitle:   L('チームを作ろう', 'Build Your Team', '组建团队'),
      teamSub:     L('専門スキルを持つAIエージェントを作って、仕事を任せましょう。', 'Create AI agents with specialized skills.', '创建拥有专业技能的 AI 智能体'),
      teamBtn:     L('最初のエージェントを作る →', 'Create your first agent →', '创建第一个智能体 →'),
      newAgent:    L('新規エージェント', 'New agent', '新建智能体'),
      newTpl:      L('テンプレートエージェント', 'Template agent', '模板智能体'),
      newMarket:   'Agent Store',
      balance:     L('残高', 'Balance', '余额'),
      charge:      L('+ 残高チャージ', '+ Add Credits', '+ 充值'),
      logout:      L('ログアウト', 'Logout', '登出'),
      placeholder: L('何をお願いしますか？（Shift+Enter で改行）', 'What can I help you with? (Shift+Enter for newline)', '需要什么帮助？（Shift+Enter 换行）'),
      // Billing modal & settings
      bsMonthlyTab:isJa ? '月額プラン'                                  : 'Monthly plan',
      bsPaygTab:   isJa ? '都度チャージ'                                : 'Pay as you go',
      bsCurPlan:   isJa ? '現在のプラン'                                : 'Current plan',
      bsCurBal:    isJa ? '現在の残高'                                  : 'Current balance',
      bsFreeNote:  isJa ? '無料枠 100メッセージ'                         : '100 free messages',
      bsProNote:   isJa ? '毎月 $15 分のクレジット'                       : '$15 monthly credit',
      bsBizNote:   isJa ? '毎月 $45 分のクレジット'                       : '$45 monthly credit',
      bsAddNote:   isJa ? '$0.01 単位で利用可'                            : 'Use in $0.01 increments',
      bsActive:    isJa ? '現在加入中'                                   : 'Currently active',
      bsPickPlan:  isJa ? 'このプランを選ぶ'                             : 'Choose this plan',
      bsStartFmt:  isJa ? '{p} / 月で開始'                              : 'Start at {p} / mo',
      bsBuyFmt:    isJa ? '{p} で購入'                                  : 'Buy for {p}',
      bsTrustSub:  isJa ? '🔒 Stripe による安全な決済'                    : '🔒 Secure checkout by Stripe',
      bsTrustOne:  isJa ? '🔒 Stripe による安全な決済 ・ 一度限りの請求'    : '🔒 Secure checkout by Stripe · One-time charge',
      bsFinePrint: isJa ? 'クレジットは月初にリセット ・ いつでもキャンセル可能' : 'Credits reset monthly · Cancel anytime',
      bsBackTxt:   isJa ? '← 戻る'                                      : '← Back',
      bsPickHd:    isJa ? 'プランを選ぶ'                                 : 'Choose a plan',
      bsPayHd:     isJa ? '支払い情報'                                   : 'Payment information',
      bsCardLbl:   isJa ? 'カード情報'                                   : 'Card information',
      bsPerMonth:  isJa ? '/月（USD）'                                   : '/mo (USD)',
      bsFeatPro1:  isJa ? '$15 分のクレジット / 月'                       : '$15 in monthly credits',
      bsFeatBiz1:  isJa ? '$45 分のクレジット / 月'                       : '$45 in monthly credits',
      bsFeat2:     isJa ? 'メッセージ無制限'                              : 'Unlimited messages',
      bsFeat3:     isJa ? '全プリセット利用可'                            : 'All presets available',
      // Settings
      sBalance:    isJa ? '残高'                                        : 'Balance',
      sCurPlan:    isJa ? '現在のプラン'                                 : 'Current plan',
      sUsageFmt:   isJa ? '累計 {n} 回利用'                              : '{n} messages used',
      sFreeBlurb:  isJa ? '無料枠 100メッセージ'                         : '100 free messages',
      sProBlurb:   isJa ? '$12.99 / 月 ・ $15分のクレジット'              : '$12.99/mo · $15 credit',
      sBizBlurb:   isJa ? '$32.99 / 月 ・ $45分のクレジット'              : '$32.99/mo · $45 credit',
      sAddCredits: isJa ? '+ クレジット追加 / プラン変更'                  : '+ Add credits / Change plan',
      sCancel:     isJa ? '解約'                                        : 'Cancel',
      sCancelConf: isJa ? '現在のサブスクリプションを解約しますか？\n月末まではご利用いただけます。' : 'Cancel your subscription?\nYou will keep access until the end of the current period.',
      sCancelDone: isJa ? '解約しました'                                : 'Subscription canceled',
      sCancelFail: isJa ? '解約に失敗しました'                           : 'Cancellation failed',
      sTxHistory:  isJa ? '取引履歴'                                    : 'Transaction history',
      sLast30:     isJa ? '（最新30件）'                                : '(last 30)',
      sNoTx:       isJa ? '取引履歴はまだありません'                      : 'No transactions yet',
      sTxFetchFail:isJa ? '履歴を取得できませんでした'                    : 'Failed to load history',
      sTxUsage:    isJa ? 'AI利用'                                      : 'AI usage',
      sTxUsageWith:isJa ? 'AI利用 ({n})'                                : 'AI usage ({n})',
      sTxTopup:    isJa ? 'クレジット追加'                              : 'Top-up',
      sTxSub:      isJa ? '{p} 月額付与'                                 : '{p} monthly credit',
      // settings tab labels
      sTabProfile: isJa ? '👤 プロフィール'                              : '👤 Profile',
      sTabSecurity:isJa ? '🔒 セキュリティ'                              : '🔒 Security',
      sTabBilling: isJa ? '💳 お支払い'                                  : '💳 Billing',
      sTabDanger:  isJa ? '⚠️ 危険'                                      : '⚠️ Danger',

      // Settings: nav + section headers
      sHd:                  L('設定','Settings','设置'),
      sNavGrpAccount:       L('アカウント','Account','账户'),
      sNavAccount:          L('アカウント','Account','账户'),
      sNavSecurity:         L('セキュリティ','Security','安全'),
      sNavNotif:            L('通知','Notifications','通知'),
      sNavGrpBilling:       L('課金','Billing','计费'),
      sNavBilling:          L('プラン・お支払い','Plan & billing','套餐・付款'),
      sNavGrpEnv:           L('環境','Workspace','环境'),
      sNavPrefs:            L('環境設定','Preferences','偏好设置'),
      sNavGrpAdv:           L('高度','Advanced','高级'),
      sNavCreator:          L('クリエイター','Creator','创作者'),
      sBadgeNew:            'NEW',
      sNavData:             L('データ','Data','数据'),
      sNavGrpDanger:        L('危険','Danger','危险'),
      sNavDanger:           L('アカウント削除','Delete account','删除账户'),

      // Settings: Account
      sAccountSub:          L('プロフィール情報とログイン中のアカウントを管理します。','Manage your profile and signed-in accounts.','管理个人资料和已登录的账户。'),
      sSecBasic:            L('基本情報','Basic info','基本信息'),
      sFldName:             L('表示名','Display name','显示名称'),
      sFldRole:             L('ロール / 職業','Role / Job','角色 / 职业'),
      sFldBio:              L('自己紹介','Bio','自我介绍'),
      sSecLocale:           L('ローカリゼーション','Localization','本地化'),
      sFldTz:               L('タイムゾーン','Time zone','时区'),
      sFldLang:             L('言語','Language','语言'),
      sBtnSave:             L('変更を保存','Save changes','保存更改'),
      sSecAcctSwitch:       L('アカウントの切替','Switch account','切换账户'),
      sAcctSwitchTip:       L('複数のアカウントを保存して、ワンクリックで切替できます。','Save multiple accounts and switch with one click.','保存多个账户,一键切换。'),
      sBtnAddAccount:       L('+ 別のアカウントを追加','+ Add another account','+ 添加其他账户'),
      sBtnLogoutAll:        L('すべてログアウト','Sign out everywhere','全部退出'),

      // Settings: Security
      sSecuritySub:         L('パスワード・連携アカウント・ログインセッションを管理します。','Manage password, linked accounts, and active sessions.','管理密码、关联账户和登录会话。'),
      sSecPassword:         L('パスワード','Password','密码'),
      sFldCurPw:            L('現在のパスワード','Current password','当前密码'),
      sFldNewPw:            L('新しいパスワード','New password','新密码'),
      sFldConfPw:           L('確認','Confirm','确认'),
      sBtnChangePw:         L('パスワードを変更','Change password','更改密码'),
      sSec2FA:              L('二段階認証','Two-factor auth','双重验证'),
      s2FATotpT:            L('認証アプリ (TOTP)','Authenticator app (TOTP)','身份验证器应用 (TOTP)'),
      s2FATotpD:            L('Google Authenticator / Authy などで追加コードを要求','Require an extra code via Google Authenticator / Authy','通过 Google Authenticator / Authy 要求额外验证码'),
      sBadgeSoon:           L('近日対応','Coming soon','即将推出'),
      sSecLinked:           L('連携アカウント','Linked accounts','关联账户'),
      sSecSessions:         L('アクティブセッション','Active sessions','活动会话'),
      sSessThis:            L('このデバイス','This device','此设备'),
      sSessCurrent:         L('現在','Current','当前'),

      // Settings: Notifications
      sNotifSub:            L('どんな通知をいつ受け取るかを管理します。設定はこのブラウザに保存されます。','Choose which notifications you receive and when. Saved in this browser.','管理接收哪些通知以及何时接收。保存在此浏览器中。'),
      sNotifEmail:          L('メール通知','Email notifications','邮件通知'),
      sNotifBalT:           L('残高アラート','Balance alerts','余额提醒'),
      sNotifBalD:           L('残高が $1.00 を下回ったらメール','Email when balance drops below $1.00','余额低于 $1.00 时发送邮件'),
      sNotifSubT:           L('月額プラン更新通知','Subscription renewal alerts','订阅续订通知'),
      sNotifSubD:           L('サブスク更新の数日前に予告','A heads-up a few days before renewal','续订前几天提醒'),
      sNotifRcptT:          L('領収書（請求書）','Receipts (invoices)','收据(发票)'),
      sNotifRcptD:          L('決済完了時に PDF を自動送付','Auto-email a PDF on each charge','付款时自动发送 PDF'),
      sNotifProdT:          L('プロダクト更新','Product updates','产品更新'),
      sNotifProdD:          L('新機能・新プリセット情報','New features and presets','新功能和新预设'),
      sNotifWeekT:          L('週次サマリー','Weekly summary','每周摘要'),
      sNotifWeekD:          L('エージェント別の利用統計を毎週月曜に','Per-agent usage stats every Monday','每周一发送各智能体使用统计'),
      sNotifPush:           L('ブラウザプッシュ','Browser push','浏览器推送'),
      sNotifPushT:          L('プッシュ通知','Push notifications','推送通知'),
      sNotifPushD:          L('エージェント応答完了時などに通知','Notify when an agent finishes responding','当智能体完成响应时通知'),
      sNotifDelivery:       L('※ メール送信機能は順次有効化されます。設定だけ先に保存できます。','* Email delivery is rolling out gradually. Save your preferences now.','* 邮件发送功能将逐步启用。可先保存设置。'),

      // Settings: Billing
      sBillingSub:          L('プラン・残高・取引履歴を管理します。','Manage plan, balance, and transactions.','管理套餐、余额和交易记录。'),

      // Settings: Preferences
      sPrefsSub:            L('見た目と挙動をカスタマイズします。設定はこのブラウザに保存されます。','Customize appearance and behavior. Saved in this browser.','自定义外观和行为。保存在此浏览器中。'),
      sPrefsTheme:          L('テーマ','Theme','主题'),
      sThemeLight:          L('ライト','Light','浅色'),
      sThemeDark:           L('ダーク','Dark','深色'),
      sThemeAuto:           L('自動','Auto','自动'),
      sThemeAutoSub:        L('OS設定に追従','Follow system','跟随系统'),
      sPrefsBehav:          L('既定の動作','Default behavior','默认行为'),
      sBehavEnterT:         L('Enter キーでメッセージ送信','Enter key sends message','按 Enter 键发送消息'),
      sBehavEnterD:         L('OFF にすると改行のみ。送信は Cmd/Ctrl+Enter','Off = newline only. Send with Cmd/Ctrl+Enter','关闭后仅换行。使用 Cmd/Ctrl+Enter 发送'),
      sBehavLastT:          L('起動時に最後のチャットを開く','Open last chat on startup','启动时打开上次的聊天'),
      sBehavLastD:          L('OFF にすると常に「チームを作ろう」画面で起動','Off = always start on "Build Your Team"','关闭后始终在“组建团队”界面启动'),

      // Settings: Data
      sDataSub:             L('データのエクスポート・インポート・削除を行います。','Export, import, and delete your data.','导出、导入和删除您的数据。'),
      sDataExport:          L('エクスポート','Export','导出'),
      sDataExportAgentsT:   L('エージェントと会話履歴','Agents and chat history','智能体与聊天记录'),
      sDataExportAgentsD:   L('JSON 形式・全エージェント＋全チャット','JSON · all agents + all chats','JSON 格式 · 所有智能体 + 所有聊天'),
      sBtnDownload:         L('ダウンロード','Download','下载'),
      sDataExportTxT:       L('取引履歴 (CSV)','Transactions (CSV)','交易记录 (CSV)'),
      sDataExportTxD:       L('確定申告などにご利用いただけます','For tax filing and accounting','可用于报税等用途'),
      sDataImport:          L('インポート','Import','导入'),
      sDataImportT:         L('エージェントを読み込む','Import agents','导入智能体'),
      sDataImportD:         L('JSON ファイルから一括インポート','Bulk import from a JSON file','从 JSON 文件批量导入'),
      sBtnSelectFile:       L('ファイル選択','Choose file','选择文件'),
      sDataClear:           L('クリア','Clear','清除'),
      sDataClearT:          L('全チャット履歴を削除','Delete all chat history','删除所有聊天记录'),
      sDataClearD:          L('エージェント自体は残します。会話のみ消去（取り消し不可）','Keeps the agents. Removes only conversations (irreversible).','保留智能体本身。仅清除对话(不可撤销)'),
      sBtnDelete:           L('削除する','Delete','删除'),

      // Settings: Danger zone
      sDangerSub:           L('この操作は取り消せません。慎重に行ってください。','These actions cannot be undone. Proceed with caution.','此操作无法撤销。请谨慎操作。'),
      sDangerH:             L('アカウントを完全削除','Permanently delete account','永久删除账户'),
      sDangerBody:          L('全てのエージェント・会話・残高・サブスクリプションが永久に削除されます。サブスクは自動的に解約されます。','All agents, conversations, balance, and subscriptions will be permanently deleted. Subscriptions will be canceled automatically.','所有智能体、对话、余额和订阅将被永久删除。订阅将自动取消。'),
      sDangerConfirmLbl:    L('「削除する」と入力して確認','Type "DELETE" to confirm','输入“删除”以确认'),
      sDangerCta:           L('アカウントを完全削除する','Permanently delete account','永久删除账户'),
      sLangNote:            L('表示言語を切り替えます。変更後ページが再読み込みされます。','Choose your language. The page will reload to apply.'),

      // Sidebar
      navSearch:            L('検索','Search'),
      navNew:               L('新規','New'),
      navTalks:             L('トーク','Talks'),
      sbCreateGroup:        L('グループを作成','Create a group'),
      sbCreateGroupD:       L('仲間を招待して AI と一緒に話す','Invite friends and chat with AI together'),
      sbStartDm:            L('AI と DM を始める','Start a DM with AI'),
      sbStartDmD:           L('新しい AI を作って 1対1 で話す','Build a new AI and chat 1-on-1'),
      sbFromTemplate:       L('テンプレートから作る','Start from template'),
      sbFromTemplateD:      L('プリセットを選んで素早く作成','Pick a preset and ship in seconds'),
      sbBrowseStore:        L('Agent Store で探す','Browse Agent Store'),
      sbBrowseStoreD:       L('他のクリエイターの AI を試す','Try AIs from other creators'),

      // Composer footer hints
      hintSend:             L('送信','Send'),
      hintNewline:          L('改行','Newline'),
      hintWebSearch:        L('Web 検索','Web search'),
      hintImageGen:         L('画像生成','Image gen'),
      hintMemory:           L('記憶','Memory'),
      hintNewChat:          L('新規会話','New chat'),

      // Home dashboard (post-login empty state)
      homeSub:              L('3 つの世界 ・ 個別 AI とサシで話す ・ 友達 + AI のグループ ・ AI 同士のチームで業務丸ごと自動化',
                              '3 worlds — chat 1:1 with an AI, mix friends + AI in a group, or let a multi-AI team automate the whole job.'),
      homeQcAgentH:         L('AI Agent を作成','Create an AI Agent'),
      homeQcAgentD:         L('1 体ずつ ・ あなた専属の AI を組み立てる。','One at a time · Build your own dedicated AI.'),
      homeQcAgentP1:        L('🆕 新規','🆕 From scratch'),
      homeQcAgentP2:        L('📋 テンプレートから','📋 From templates'),
      homeQcTeamH:          L('AI Agent Team を作成','Create an AI Agent Team'),
      homeQcTeamD:          L('複数 AI が連携 ・ 業務丸ごと自動化。','Multiple AIs in concert · Automate the whole job.'),
      homeQcTeamP1:         L('🆕 新規','🆕 From scratch'),
      homeQcTeamP2:         L('📋 テンプレートから','📋 From templates'),
      homeQcStoreH:         L('Agent Store','Agent Store'),
      homeQcStoreD:         L('他クリエイターの Agent / Team を購入・無料 DL。','Buy or free-download Agents and Teams from other creators.'),
      homeQcStoreP1:        L('🤖 単体 Agent','🤖 Solo Agent'),
      homeQcStoreP2:        L('🎯 Team パック','🎯 Team pack'),
      homeLegendLbl:        L('3 KINDS OF CONVERSATIONS','3 KINDS OF CONVERSATIONS'),
      homeLegendDm:         L('<b>DM</b> ・ あなた + AI 1 体','<b>DM</b> · You + 1 AI'),
      homeLegendGr:         L('<b>Group</b> ・ あなた + 友達 + AI','<b>Group</b> · You + friends + AI'),
      homeLegendTm:         L('<b>Team</b> ・ あなた + AI 複数体','<b>Team</b> · You + multiple AIs'),
      homeKindDmD:          L('あなたと AI が <b>1 対 1</b>。集中して 1 タスクを進めるのに最適。','Just you and one AI, <b>1:1</b>. Best when you want to focus on a single task.'),
      homeKindDmCta:        L('＋ Create new agent →','+ Create new agent →'),
      homeKindGrD:          L('<b>人間 + AI</b> がいる LINE 風グループ。チーム作業や友達と一緒に。','<b>Humans + AI</b> in a chat-app-style group. Great for teamwork or friends.'),
      homeKindGrCta:        L('＋ Create a group →','+ Create a group →'),
      homeKindTmD:          L('<b>AI が複数体連携</b>して業務を丸ごと自動化。','<b>Multiple AIs in concert</b> — automate the whole job.'),
      homeKindTmCta:        L('＋ Build a new team →','+ Build a new team →'),

      // ── Team gallery / activate / edit / members / add-member ──
      teamGalleryTitle:     L('🎯 AI Agent Team を作成','🎯 Create AI Agent Team'),
      teamGalleryTabNew:    L('🆕 新規作成','🆕 From scratch'),
      teamGalleryTabTpl:    L('📋 テンプレートから','📋 From templates'),
      teamGalleryIntro:     L('<b>どんな業務を自動化したいですか？</b> 目的を書くと AI が必要なエージェントを設計してチームにします。',
                              '<b>What would you like to automate?</b> Describe the goal — AI will design the agents you need and bundle them into a team.'),
      teamGalleryChipEC:    L('🛍 EC を作る','🛍 Build an e-commerce site'),
      teamGalleryChipSNS:   L('📱 SNS 集客','📱 Grow on social'),
      teamGalleryChipSaaS:  L('💻 SaaS を作る','💻 Ship a SaaS MVP'),
      teamGalleryChipCS:    L('🤝 CS 自動化','🤝 Automate support'),
      teamGalleryChipYT:    L('🎬 YouTube','🎬 YouTube'),
      teamGallerySubmit:    L('✨ AI にチームを設計してもらう','✨ Let AI design your team'),
      teamGalleryFootnote:  L('※ 設計は約 15-30 秒。目的に応じて 4-10 体のエージェントが自動生成され、すぐ起動します。',
                              'Takes ~15–30s. 4–10 agents are generated for your goal and the team launches right after.'),
      teamGalleryTplIntro:  L('テンプレートから選んで <b>1 クリックで起動</b>。複数の AI が連携してあなたの業務を自動化します。',
                              'Pick a template and <b>launch in one click</b>. Multiple AI agents work together to automate the job.'),
      teamActTitle:         L('起動中…','Activating…'),
      teamActSub:           L('エージェントをクローン中','Cloning agents…'),
      teamEditTitle:        L('✏️ チームを編集','✏️ Edit team'),
      teamEditIconLbl:      L('アイコン','Icon'),
      teamEditNameLbl:      L('チーム名','Team name'),
      teamEditGoalLbl:      L('どんな業務を自動化したいですか？','What would you like to automate?'),
      teamEditGoalSub:      L('この目的はチームのコンテキストとして各エージェントに渡されます。後から方向性が変わったら自由に書き換えてください。',
                              'This goal is passed to every team agent as context. Rewrite it any time the direction shifts.'),
      teamEditSave:         L('💾 保存','💾 Save'),
      teamStoreH:           L('Agent Store に出店する','List on Agent Store'),
      teamDangerNote:       L('⚠️ チームを削除すると、メンバー AI を DM に戻すか一緒に削除するか選べます。',
                              '⚠️ Deleting the team lets you choose whether to keep its members in DM or delete them too.'),
      teamDeleteBtn:        L('🗑 チームを削除','🗑 Delete team'),
      teamMembersIntro:     L('このチームに所属している AI エージェントです。<b>@名前</b> で個別に呼び出せます。各エージェントの ✏️ から、性格・スキル・モデルを編集できます。',
                              'These are the AI agents in this team. Mention any of them with <b>@name</b>. Click ✏️ on a row to edit persona, skills, or model.'),
      teamMembersGoalH:     L('チームの目的','Team goal'),
      teamMembersGoalEdit:  L('✏️ 編集','✏️ Edit'),
      teamMembersAddBtn:    L('＋ メンバーを追加','+ Add member'),
      addMemTitle:          L('＋ メンバーを追加','+ Add member'),
      addMemIntro:          L('どんなメンバーを追加しますか？ 役割や担当業務を書くと、AI が <b>名前 ・ アイコン ・ スキル ・ 性格</b> を組み立てます。',
                              'What kind of member do you want to add? Describe the role and tasks, and AI will assemble <b>name · icon · skills · persona</b>.'),
      addMemSubmit:         L('✨ AI に作ってもらう','✨ Let AI generate'),

      // ── Agent details / listing form ──
      ldTitle:              L('エージェント詳細','Agent details'),
      listingTitleNew:      L('🏪 Agent Store に出店する','🏪 List on Agent Store'),
      listingFormH:         L('公開情報を入力','Listing details'),
      listingTitleLbl:      L('タイトル','Title'),
      listingTitleHint:     L('検索結果やカードに表示されます（最大 60 文字）','Shown on cards and search results (max 60 characters).'),
      listingDescLbl:       L('説明','Description'),
      listingDescHint:      L('利用者が見る詳細文。長すぎず、価値が一目でわかるように。',"The detail blurb users see. Keep it short — make the value obvious."),
      listingCatLbl:        L('カテゴリ','Category'),
      listingTagsLbl:       L('タグ（最大 5 つ・任意）','Tags (up to 5, optional)'),
      listingTagsHint:      L('対象ユーザーが探しやすくなります。','Help the right users find your agent.'),
      listingDemosLbl:      L('デモプロンプト（最大 3 つ・任意）','Demo prompts (up to 3, optional)'),
      listingDemosHint:     L('利用者がワンクリックで試せる例文。良いプロンプトを置くと使われやすくなります。','One-click examples users can run. Good demos = more clones.'),
      listingPriceLbl:      L('販売価格','Price'),
      listingPriceFree:     L('🎁 無料','🎁 Free'),
      listingPricePaid:     L('💰 有料','💰 Paid'),
      listingPriceHint:     L('購入時に買い手の残高から差し引かれます。','Charged from the buyer\'s balance at purchase time.'),
      listingRevH:          L('💰 収益還元','💰 Revenue share'),
      listingRevD:          L('買い切り価格の <b>70%</b> + 利用料 (チャットコスト) の <b>10%</b> が、自動的にあなたの利用可能残高に加算されます。','<b>70%</b> of the one-time price + <b>10%</b> of usage (chat cost) is automatically credited to your available balance.'),
      listingVisLbl:        L('公開設定','Visibility'),
      listingVisPublic:     L('🌐 Agent Store に公開','🌐 Public on Agent Store'),
      listingVisUnlisted:   L('🔗 リンクを知ってる人だけ','🔗 Unlisted (link only)'),
      listingUnpublish:     L('出店を取り下げる','Unpublish listing'),
      listingSubmit:        L('出店する →','Publish →'),

      // ── Create wizard (single agent) ──
      wizTitle:             L('新しいエージェント','New agent'),
      wsBack:               L('← 戻る','← Back'),
      wsNext:               L('次へ →','Next →'),
      wsCreate:             L('✨ 作成する','✨ Create'),
      ws1H:                 L('アイコンを選ぶ','Pick an icon'),
      ws1S:                 L('絵文字から選ぶか、画像をアップロードします','Choose an emoji or upload an image'),
      ws1Upload:            L('📸 画像をアップロード','📸 Upload image'),
      ws1Reset:             L('↻ 絵文字に戻す','↻ Back to emoji'),
      ws2H:                 L('名前を決める','Pick a name'),
      ws2S:                 L('このエージェントの名前を入力してください','Give this agent a name'),
      ws2Lbl:               L('エージェントの名前','Agent name'),
      ws3H:                 L('スキルを与える','Assign skills'),
      ws3S:                 L('このエージェントの得意なこと（複数OK）','What this agent is good at (multiple OK)'),
      ws4H:                 L('採用目的','Hired for'),
      ws4S:                 L('このエージェントを何のために雇いますか？','What is this agent hired to do?'),
      ws4Lbl:               L('採用目的','Purpose'),
      ws5H:                 L('業務内容','Day-to-day duties'),
      ws5S:                 L('具体的にどんな仕事を任せますか？日々の作業内容を入力してください','Concretely, what work will this agent handle every day?'),
      ws5Lbl:               L('業務内容','Duties'),
      ws5WebTool:           L('🌐 Web 検索 / URL 取得','🌐 Web search / URL fetch'),
      ws5SheetsTool:        L('📊 Google スプレッドシート連携','📊 Google Sheets integration'),
      ws5SheetsConn:        L('接続中:','Connected as:'),
      ws5SheetsConnect:     L('＋ Google アカウントと接続','+ Connect Google account'),
      ws5SheetsHelp:        L('🔧 接続できない場合のセットアップ手順','🔧 Setup guide if you can\'t connect'),
      ws6H:                 L('確認して完成！','Review and finish!'),
      ws6S:                 L('このエージェントで作成します','Create this agent'),

      // Agent create overlay (2-tab New / Template chooser)
      cancel:               L('キャンセル','Cancel'),
      agentModeNew:         L('新規作成','From scratch'),
      agentModeTpl:         L('テンプレートから','From templates'),
      agentNewH:            L('ゼロから作る','Build from scratch'),
      agentNewS:            L('アイコン・名前・スキル・性格を 1 つずつ自分で決めて、専属の AI を組み立てます。','Pick the icon, name, skills, and persona yourself and assemble your own AI.'),
      agentNewCardH:        L('あなた専属の AI を 1 体作る','Build one dedicated AI'),
      agentNewCardD:        L('5 ステップ (約 1 分) で完成 ・ いつでも編集可能 ・ DM タブから呼び出せます。','5 steps (~1 min) · Edit anytime · Reach it from the DM tab.'),
      agentNewLi1:          L('アイコン (絵文字 or 画像アップロード) を選ぶ','Pick an icon (emoji or upload an image)'),
      agentNewLi2:          L('名前と「採用目的・業務内容」を書く (= persona)','Write its name and the "purpose · duties" (= persona)'),
      agentNewLi3:          L('スキルを最大 3 つ選ぶ','Choose up to 3 skills'),
      agentNewLi4:          L('🌐 Web 検索 / Google Sheets 連携などの能力を有効化 (任意)','Optionally enable web search / Google Sheets / Chrome integrations'),
      agentNewStart:        L('▶ 作り始める','▶ Start building'),
      agentTplH:            L('テンプレートから始める','Start from a template'),
      agentTplS:            L('用途別のプリセットを選ぶと、性格とスキルを自動で設定。後から自由に編集できます。','Pick a use-case preset; persona and skills are auto-filled and stay editable.'),
      agentTplUse:          L('このテンプレートを使う →','Use this template →'),
};
function _fmtT(template, vars){
  return String(template).replace(/\{(\w+)\}/g, function(_,k){ return vars[k]!==undefined ? vars[k] : ''; });
}
/* ── Runtime DOM translator (catches everything not yet wrapped with L()) ── */
// Comprehensive JA→EN dictionary for common UI strings. Entries are looked
// up by trimmed, exact textContent. Anything not in the dict stays in JA
// (so partial coverage degrades gracefully).
var _JA2EN = {
  // Headers / sections
  '残高': 'Balance', '残高:': 'Balance:', 'プラン': 'Plan', 'プラン:': 'Plan:',
  'アカウント': 'Account', 'プロフィール': 'Profile', '設定': 'Settings',
  'チーム': 'Team', 'チームを作ろう': 'Build your team',
  '新規': 'New', '新規エージェント': 'New agent', '新規作成': 'Create new',
  '新規エージェントを作成': 'Create a new agent', '新規会話': 'New chat',
  '新規グループ': 'New group', 'グループ': 'Groups', 'グループを作成': 'Create a group',
  'メンバー': 'Members', 'メンバーを招待': 'Invite members', '招待': 'Invite',
  'ホスト': 'Host', '招待リンク': 'Invite link', 'メンバー一覧': 'Member list',
  'チームを作ろう': 'Build your team',
  '専門スキルを持つAIエージェントを作って、仕事を任せましょう。': 'Create AI agents with specialized skills.',
  '最初のエージェントを作る →': 'Create your first agent →',
  'まだトークがありません': 'No conversations yet',
  'まだエージェントがいません': 'No agents yet',
  'トーク': 'Talks',
  // Common buttons / actions
  '保存': 'Save', '保存する': 'Save', '変更を保存': 'Save changes',
  'キャンセル': 'Cancel', 'キャンセルする': 'Cancel',
  '削除': 'Delete', '削除する': 'Delete', '取消': 'Undo',
  '送信': 'Send', '送信する': 'Send', '送信中...': 'Sending...', '生成中…': 'Generating…',
  '閉じる': 'Close', '戻る': 'Back', '次へ': 'Next', '完了': 'Done',
  'コピー': 'Copy', 'コピーしました': 'Copied', 'コピー失敗': 'Copy failed',
  '共有': 'Share', '編集': 'Edit', '更新': 'Update', '更新する': 'Update',
  '出店': 'List', '出店する →': 'List on store →', '出店内容を編集': 'Edit listing',
  '出店を取り下げる': 'Unpublish listing', '取り下げ': 'Unpublish',
  '再公開する': 'Republish', '却下': 'Decline', '承認': 'Approve', '復元': 'Restore',
  '通報': 'Report', '⚠ 通報する': '⚠ Report',
  'ログイン': 'Sign in', 'ログイン →': 'Sign in →', 'ログアウト': 'Sign out',
  '使う': 'Use', '使ってみる': 'Try', '使ってみる →': 'Try →',
  'お気に入り': 'Favorites', 'チームに追加': 'Add to team',
  '＋ チームに追加': '+ Add to team',
  '＋ 招待': '+ Invite', '＋ 新規': '+ New',
  // Agent / chat
  'エージェント': 'Agent', 'エージェントを編集': 'Edit agent',
  'AI を編集': 'Edit AI', 'AI と DM を始める': 'Start a DM with AI',
  'スキル': 'Skills', 'スキル:': 'Skills:',
  'アバター': 'Avatar', '名前': 'Name', '採用目的': 'Purpose',
  '業務内容': 'Duties', '性格・指示': 'Personality',
  'モデル': 'Model', '高速 (Haiku)': 'Fast (Haiku)', 'バランス (Sonnet)': 'Balanced (Sonnet)',
  '最高品質 (Opus)': 'Best (Opus)',
  'メッセージ': 'Messages', 'メッセージを入力…': 'Type a message…',
  'チャット': 'Chat', 'チャット履歴': 'Chat history', '履歴': 'History',
  '会話を消去': 'Clear conversation', '全チャット履歴を削除': 'Delete all chat history',
  // Sidebar
  '検索': 'Search', '検索する': 'Search', 'クイック:': 'Quick:',
  '出店中': 'Listed', '出店中のエージェントから選ぶ': 'Pick a listed agent',
  // Marketplace
  'マーケットプレイス': 'Marketplace', 'カテゴリ': 'Category', 'タグ': 'Tags',
  'すべて': 'All', '新着': 'New', '人気': 'Popular', '無料': 'Free',
  'クリエイター': 'Creator', '出店者': 'Seller', '購入': 'Purchase',
  '購入する': 'Buy now', '購入しました': 'Purchased', '購入済': 'Purchased',
  '購入する →': 'Buy now →', 'タイトル': 'Title', '説明': 'Description',
  'デモプロンプト': 'Demo prompts',
  '販売価格': 'Price', '買い切り': 'One-time', '価格': 'Price',
  '評価とレビュー': 'Reviews', '評価を投稿': 'Post review',
  '評価を更新': 'Update review', 'このエージェントを評価': 'Rate this agent',
  'あなたの評価を編集': 'Edit your review', '星を選んでください': 'Pick a star rating',
  // Billing
  '料金プラン': 'Pricing', '都度チャージ': 'Pay as you go', '月額プラン': 'Monthly plan',
  '残高チャージ': 'Add credits', '+ 残高チャージ': '+ Add credits',
  '+ クレジット追加 / プラン変更': '+ Add credits / Change plan',
  '無料登録': 'Free signup', '現在のプラン': 'Current plan',
  '現在加入中': 'Currently active', 'このプランを選ぶ': 'Choose this plan',
  '取引履歴': 'Transactions', '出金': 'Withdraw', '今月の収益': 'This month',
  '累計収益': 'Total revenue', '残高 (利用可能)': 'Available balance',
  '残高 (未確定)': 'Pending balance',
  // Settings panes
  'セキュリティ': 'Security', 'パスワード': 'Password',
  '現在のパスワード': 'Current password', '新しいパスワード': 'New password',
  'パスワードを変更': 'Change password', '通知': 'Notifications',
  '環境設定': 'Preferences', 'テーマ': 'Theme', 'ライト': 'Light',
  'ダーク': 'Dark', '自動': 'Auto', '言語': 'Language',
  'データ': 'Data', 'エクスポート': 'Export', 'インポート': 'Import',
  'ダウンロード': 'Download', 'ダウンロード完了': 'Download complete',
  'ファイル選択': 'Choose file', 'クリア': 'Clear',
  '危険': 'Danger', '危険ゾーン': 'Danger zone',
  'アカウント削除': 'Delete account', 'アカウントを完全削除する': 'Permanently delete account',
  // Toasts (most common)
  '保存しました': 'Saved', '削除しました': 'Deleted', '復元しました': 'Restored',
  '取り下げました': 'Unpublished', '出店を保存しました': 'Listing saved',
  '出店を取り下げました': 'Listing unpublished',
  'エージェントが見つかりません': 'Agent not found',
  '名前を入力してください': 'Please enter a name',
  '採用目的を入力してください': 'Please enter the purpose',
  '業務内容を入力してください': 'Please describe the duties',
  'スキルを選んでください': 'Please pick a skill',
  '全ての項目を入力してください': 'Please fill in all fields',
  'ログインが必要です': 'Sign in required',
  'チームに追加しました': 'Added to your team',
  'リマインダーを設定': 'Reminder set',
  '記憶しました 🧠': 'Saved to memory 🧠',
  // Group chat
  'グループ設定': 'Group settings', 'グループ名': 'Group name',
  'グループへ送金': 'Send to group',
  'グループを退出': 'Leave group',
  'グループを削除': 'Delete group',
  'すべての発言': 'All messages', 'メンションのみ': 'Mentions only',
  'ミュート': 'Muted',
  '所有権の移譲': 'Transfer ownership', '移譲': 'Transfer',
  '招待設定': 'Invite settings',
  'ホストの承認が必要': 'Host approval required',
  'リンクを知っていれば誰でも参加': 'Anyone with link can join',
  'AI の応答': 'AI replies', '毎回応答': 'Always reply', '@AI のみ': '@AI only',
  // Misc common
  '読み込み中…': 'Loading…', '読み込み失敗': 'Load failed',
  'まだ評価がありません': 'No reviews yet',
  'データなし': 'No data',
  'はい': 'Yes', 'いいえ': 'No', 'OK': 'OK', '確認': 'Confirm',

  // ── Creator pane ──
  '🏪 クリエイター': '🏪 Creator',
  'クリエイター': 'Creator',
  '作ったエージェントを出店して、買い切り価格の 70% + 利用料の 10% を収益として受け取ります。': 'List your agents on the store and earn 70% of upfront price + 10% of usage fees.',
  '出店中': 'Listed', '累計利用回数': 'Total uses',
  '利用可能残高': 'Available balance', '累計収益': 'Total earned',
  '過去30日の収益': 'Last 30 days revenue',
  'エージェント別（今月）': 'By agent (this month)',
  '最近の収益': 'Recent revenue',
  'マイ出店': 'My listings',
  '↻ 更新': '↻ Refresh',
  '出店フロー': 'Listing flow',
  'エージェントを編集': 'Edit agent',
  'サイドバーで対象エージェントを開き、⚙ から編集パネルを表示': 'Open the agent in the sidebar, then ⚙ to open the edit panel',
  '「🏪 Agent Store に出店」を開く': 'Open "🏪 List on Agent Store"',
  '編集パネル内のオレンジ枠から出店フォームへ': 'Click the orange frame in the edit panel',
  '公開情報を入力 → 公開': 'Fill in public info → publish',
  'タイトル・説明・カテゴリを入れて出店すると、即座にAgent Store に掲載': 'Add title, description, category and your agent goes live immediately',
  '💴 出金（Stripe Connect）': '💴 Withdraw (Stripe Connect)',
  'クリエイターサポート': 'Creator support',
  '💰 収益還元はいつ確定？': '💰 When does revenue clear?',
  '利用者が支払う買い切り価格の': 'Of the price the buyer pays,',
  'が「未確定残高」に計上され、7 日後に「利用可能残高」に確定します。': 'goes into pending balance, then to available after 7 days.',
  '💴 出金はいつできる？': '💴 When can I withdraw?',
  '利用可能残高が': 'Once available balance reaches',
  'に到達すると Stripe Connect 経由で出金可能になります（出金機能は近日リリース）。': ', payouts via Stripe Connect open up (coming soon).',
  '📜 公開ガイドライン': '📜 Publishing guidelines',
  '他者の知的財産・個人情報を扱うエージェント、違法/有害コンテンツの生成に特化したエージェントは公開禁止。違反が見つかった場合は即座に取り下げられます。': 'Agents that handle others\' IP / personal data, or specialize in illegal / harmful content, may not be published. Violations are taken down immediately.',

  // Moderation pane
  '🛡 モデレーション': '🛡 Moderation',
  '通報された出店を確認し、削除/復元します。': 'Review reported listings and remove or restore them.',
  '通報キュー': 'Report queue',
  '通報はありません 🎉': 'No reports 🎉',

  // Data pane (additional, beyond data-i18n)
  '📦 データ': '📦 Data',
  'JSON 形式・全エージェント＋全チャット': 'JSON format · all agents + all chats',
  '取引履歴 (CSV)': 'Transactions (CSV)',
  '確定申告などにご利用いただけます': 'For tax filing etc.',
  'エージェントを読み込む': 'Import agents',
  'JSON ファイルから一括インポート': 'Bulk import from JSON',
  '全チャット履歴を削除': 'Delete all chat history',
  'エージェント自体は残します。会話のみ消去（取り消し不可）': 'Keeps the agents. Only conversations are deleted (irreversible).',

  // Edit Agent modal
  'エージェントを編集': 'Edit agent',
  'アイコン': 'Icon', 'アイコンを選択': 'Pick an icon',
  '名前 *': 'Name *', '採用目的 *': 'Purpose *', '業務内容 *': 'Duties *',
  '性格・指示 (任意)': 'Personality / instructions (optional)',
  'スキル (複数選択可)': 'Skills (multiple)',
  'AI モデル': 'AI model',
  '高速 (Haiku) — 反応が速い': 'Fast (Haiku) — quick',
  'バランス (Sonnet) — 標準': 'Balanced (Sonnet) — default',
  '最高品質 (Opus) — 重い分析向き': 'Best (Opus) — for heavy analysis',
  'グループに変換': 'Convert to group',
  'グループとして使う': 'Use as group',
  '＋ グループを作成して招待': '+ Create group and invite',
  '🔗 招待リンクを管理': '🔗 Manage invite link',
  '仲間を招待して、このエージェントと一緒に話せるグループを作ります': 'Invite friends to chat with this agent together',
  'すでにグループです': 'Already a group',
  '🏪 Agent Store に出店': '🏪 List on Agent Store',
  '出店フォームを開く': 'Open listing form',
  '＋ 出店フォームを開く': '+ Open listing form',
  '保存して閉じる': 'Save and close',

  // Listing form
  '🏪 Agent Store に出店する': '🏪 List on Agent Store',
  '🏪 出店内容を編集': '🏪 Edit listing',
  '公開情報を入力': 'Fill in public info',
  'タイトル': 'Title',
  '検索結果やカードに表示されます（最大 60 文字）': 'Shown in search results and cards (max 60 chars)',
  '利用者が見る詳細文。長すぎず、価値が一目でわかるように。': 'Detail text shown to users. Keep it short and value-clear.',
  'カテゴリ': 'Category',
  'タグ（最大 5 つ・任意）': 'Tags (up to 5, optional)',
  '対象ユーザーが探しやすくなります。': 'Helps target users find it.',
  'デモプロンプト（最大 3 つ・任意）': 'Demo prompts (up to 3, optional)',
  '利用者がワンクリックで試せる例文。良いプロンプトを置くと使われやすくなります。': 'One-click example prompts for users. Good prompts boost adoption.',
  '販売価格 *': 'Price *',
  '🎁 無料': '🎁 Free', '💰 有料': '💰 Paid',
  '購入時に買い手の残高から差し引かれます。': 'Deducted from the buyer\'s balance on purchase.',
  '💰 収益還元': '💰 Revenue share',
  '買い切り価格の': 'Of the upfront price,',
  '+ 利用料 (チャットコスト) の': 'and of usage cost (chat),',
  'が、自動的にあなたの利用可能残高に加算されます。': 'is automatically added to your available balance.',
  '公開設定': 'Visibility',
  '🌐 Agent Store に公開': '🌐 Public on Agent Store',
  '🔗 リンクを知ってる人だけ': '🔗 Unlisted (link only)',

  // Group settings (extra)
  '⚙ グループ設定': '⚙ Group settings',
  'グループ情報': 'Group info',
  '🔔 すべての発言': '🔔 All messages',
  'グループ内の全てのメッセージで通知': 'Notify on every message',
  '📣 メンションのみ': '📣 Mentions only',
  '@あなた でメンションされた時のみ通知': 'Only when you\'re mentioned',
  '🔕 ミュート': '🔕 Muted',
  '通知しない (バッジは表示)': 'No notifications (badge shows)',
  '🤖 自動 (推奨)': '🤖 Auto (recommended)',
  '小グループ (3人以下) は毎回応答 ・ 大グループは @AI のみ': 'Small groups (≤3) reply every time · large groups @AI only',
  '💬 毎回応答': '💬 Always reply',
  '人数に関係なく、すべての発言に AI が応答': 'AI replies to every message regardless of size',
  '🏷 @AI のみ': '🏷 @AI only',
  '@AI と呼ばれた時だけ応答 (コスト節約)': 'Replies only when called @AI (saves cost)',
  '🤖 エージェントを編集 (名前・スキル・性格)': '🤖 Edit agent (name, skills, personality)',
  'アイコン・スキル・採用目的・業務内容を編集できます。': 'Edit icon, skills, purpose and duties.',
  '🌐 リンクを知っていれば誰でも参加': '🌐 Anyone with link can join',
  'URL/QR を持っている人は即時参加可能': 'Anyone with the URL or QR can join instantly',
  '🔒 ホストの承認が必要': '🔒 Host approval required',
  '参加リクエストをあなたが承認すると参加できます': 'Joins require your approval',
  '移譲後は新しいホストの残高から AI 利用料が消費されるようになります': 'After transfer, AI cost is deducted from the new host\'s balance',
  '移譲先を選択 …': 'Pick a recipient …',

  // Invite modal
  '📨 メンバーを招待': '📨 Invite members',
  '招待 URL': 'Invite URL', 'QR コード': 'QR code',
  'リンクをコピー': 'Copy link', 'URL を再生成': 'Regenerate URL',
  '招待を無効化': 'Disable invites',

  // Common static labels
  '会話': 'Conversation', '今日': 'Today', '昨日': 'Yesterday',
  '今週': 'This week', '今月': 'This month',
  '日': 'day', '時間': 'hour', '分': 'min', '秒': 'sec',
  '名前は2文字以上で入力してください': 'Name must be at least 2 characters',
  'メールアドレスの形式が正しくありません': 'Invalid email format',
  'パスワードは8文字以上で入力してください': 'Password must be at least 8 characters',
  '処理中…': 'Processing…',
  '通信エラー': 'Network error',
  'もう一度お試しください': 'Please try again',

  // Pinned / banner
  '📌 ピン留めされたメッセージ': '📌 Pinned message',
  '📑 ブックマーク': '📑 Bookmarks',

  // Sidebar items
  '＋ 新規エージェント': '+ New agent',
  '＋ 新しいエージェント': '+ New agent',
  'グループを作成して仲間を招待': 'Create a group and invite friends',
  '新しい AI を作って 1対1 で話す': 'Build a new AI and chat 1-on-1',
  'プリセットを選んで素早く作成': 'Pick a preset and ship in seconds',
  '他のクリエイターの AI を試す': 'Try AIs from other creators',

  // Buttons in modals
  '出店する →': 'Publish →', '出店してみる →': 'Try listing →',
  'グループを作成する →': 'Create group →',
  'テンプレートから選ぶ': 'Pick a template',
  '＋ チームに追加して使い始める →': '+ Add to my team →',
  '+ チームに追加': '+ Add to team',

  // Misc UI labels seen in modals
  '紹介プログラム': 'Referral program',
  '紹介コード': 'Referral code',
  '紹介リンク': 'Referral link',
  '招待した友達': 'Invited friends',
  '獲得した残高': 'Earned balance',

  // 通知 / errors / common toasts
  '残高不足': 'Insufficient balance',
  '残高が不足しています': 'Insufficient balance',
  'ホストの残高が不足しています': 'Host\'s balance is insufficient',
  'タイムアウトしました': 'Timed out',
  'タイムアウトしました。少し時間をおいて再試行してください': 'Timed out. Please try again shortly.',
  'リクエストが多すぎます。しばらく待ってから試してください。': 'Too many requests. Please wait a moment.',
  'ファイルが大きすぎます (上限 32MB)': 'File too large (max 32MB)',
  'リクエストが大きすぎます': 'Request too large',
  '価格は ¥100 以上に設定してください': 'Price must be at least ¥100',

  // ── More from creator pane (innerHTML inserts) ──
  '出金履歴はまだありません': 'No payout history yet',
  'このクリエイターはまだエージェントを公開していません': 'This creator hasn\'t published any agents yet',
  'まだ収益履歴はありません': 'No revenue history yet',
  '今月の収益データはまだありません': 'No revenue data this month yet',
  '完了': 'Done', '処理中': 'Processing', '失敗': 'Failed',
  '日時': 'Date', '金額': 'Amount', '状態': 'Status',
  '公開': 'Publish', '却下': 'Decline', '承認': 'Approve',
  '⚠ 通報する': '⚠ Report', '🔗 シェア': '🔗 Share',
  '+ チームに追加': '+ Add to team',
  '+ 新しいエージェント': '+ New agent',
  '+ 残高チャージ': '+ Top up',
  '+ クレジット追加 / プラン変更': '+ Add credits / Change plan',

  // Settings security
  '現在加入中のサービス': 'Connected services',
  '連携済み': 'Linked', '未連携': 'Not linked',
  '連携する': 'Connect', '切断する': 'Disconnect',
  'メールアドレスを変更': 'Change email',
  'メールアドレスは確認済みです': 'Email is verified',
  '確認メールを再送信': 'Resend verification',

  // Settings: account switcher
  '保存されたアカウントはまだありません': 'No saved accounts yet',
  '別のアカウントを追加': 'Add another account',
  '現在のアカウント': 'Current',
  '切り替え →': 'Switch →',

  // Listing detail page
  '利用 ': 'Used ',
  '評価': 'Rating',
  'レビュー': 'Reviews',
  'デモプロンプトを試す': 'Try a demo prompt',
  'このエージェントを試す': 'Try this agent',
  'これは自分の出店です': 'This is your listing',

  // Group invite modal
  '招待 URL': 'Invite URL',
  '招待コード': 'Invite code',
  '有効期限': 'Expires',
  '人数制限': 'Member limit',
  'リンクを再生成': 'Regenerate link',

  // Group creation
  'グループの作成': 'Create group',
  'グループ名を入力': 'Enter group name',
  '招待リンクを発行': 'Generate invite link',

  // Memory / reminder
  '記憶': 'Memories', '記憶を追加': 'Add memory',
  '記憶を削除': 'Delete memory',
  'リマインダー': 'Reminders',
  'リマインダーを追加': 'Add reminder',
  '日時とテキストを入力': 'Enter date/time and text',

  // Push notification
  'プッシュ通知を有効化': 'Enable push notifications',
  'プッシュ通知を許可してください': 'Please allow push notifications',

  // Misc
  '読み上げ': 'Read aloud',
  'リアクションを追加': 'Add reaction',
  '通報': 'Report', '通報する': 'Report',
  'まだ参加申請はありません': 'No pending requests',
  '参加申請': 'Pending requests',
  'お知らせ': 'Notifications',
  'すべて既読': 'Mark all read',

  // Voice
  '音声で入力': 'Voice input',
  'お使いのブラウザは音声認識に対応していません': 'Your browser does not support speech recognition',
  '録音中…': 'Recording…',

  // Image gen
  '画像を生成中…': 'Generating image…',
  '画像生成失敗': 'Image generation failed',

  // Time labels
  'たった今': 'just now', '分前': ' min ago', '時間前': ' h ago', '日前': ' d ago',

  // ── Team add/remove member + delete flows ──
  '＋ メンバーを追加': '+ Add member',
  '✨ AI に作ってもらう': '✨ Let AI generate',
  '生成中…': 'Generating…',
  'チームから外す': 'Remove from team',
  '🗑 チームを削除': '🗑 Delete team',
  '⚠️ チームを削除すると、メンバー AI を DM に戻すか一緒に削除するか選べます。':
    '⚠️ Deleting the team lets you choose whether to keep members in DM or delete them too.',
  'どんなメンバーを追加しますか？ 役割や担当業務を書くと、AI が 名前 ・ アイコン ・ スキル ・ 性格 を組み立てます。':
    'What kind of member do you want to add? Describe the role and tasks; AI will assemble name · icon · skills · persona for you.',
  '例: SEO 担当のライター / 競合分析が得意なリサーチャー / コードレビューしてくれるエンジニア':
    'e.g. SEO writer / competitive analyst / code reviewer',

  // ── Agent Team — generation flow ──
  'どんな業務を自動化したいですか？': 'What would you like to automate?',
  '目的を書くと AI が必要なエージェントを設計してチームにします。': 'Describe the goal — AI will design the agents you need and bundle them into a team.',
  '🛍 EC を作る': '🛍 Build an e-commerce site',
  '📱 SNS 集客': '📱 Grow on social',
  '💻 SaaS を作る': '💻 Ship a SaaS MVP',
  '🤝 CS 自動化': '🤝 Automate support',
  '🎬 YouTube': '🎬 YouTube',
  '✨ AI にチームを設計してもらう': '✨ Let AI design your team',
  '※ 設計は約 15-30 秒。目的に応じて 4-10 体のエージェントが自動生成され、すぐ起動します。':
    'Takes ~15–30s. 4–10 agents are generated for your goal and the team launches right after.',
  'AI がチームを設計中…': 'AI is designing your team…',
  '目的を分析しています': 'Analyzing your goal…',
  '必要な役割を洗い出しています': 'Mapping out roles…',
  '各エージェントの性格を設計中': 'Designing personas…',
  'スキルを割り当てています': 'Assigning skills…',
  'もう少しで完成…': 'Almost done…',

  // ── Agent Team — edit overlay ──
  '✏️ チームを編集': '✏️ Edit team',
  'チームを編集': 'Edit team',
  'アイコン': 'Icon',
  'チーム名': 'Team name',
  '💾 保存': '💾 Save',
  '保存中…': 'Saving…',
  'この目的はチームのコンテキストとして各エージェントに渡されます。後から方向性が変わったら自由に書き換えてください。':
    'This goal is shared with every team agent as context. Rewrite it any time the direction shifts.',
  'チームの目的': 'Team goal',
  'まだ目的が設定されていません。「✏️ 編集」から追加できます。':
    'No goal set yet — click "✏️ Edit" to add one.',

  // ── Agent Team — members panel ──
  'このチームに所属している AI エージェントです。': 'These are the AI agents in this team.',
  '🎯 Team members': '🎯 Team members',
  'AI メンバー': 'AI members',
  'チームのメンバー': 'Team members',

  // ── Agent Team — store listing ──
  'Agent Store に出店する': 'List on Agent Store',
  'このチームを丸ごとストアに出すと、他のユーザーが': 'List the whole team on the Store so other users can',
  '1 クリックで自分のアカウントに複製': 'clone it into their account in one click',
  'できます。買い切り価格の 70% + 利用料の 10% が収益になります。':
    '. You earn 70% of the one-time price plus 10% of usage revenue.',
  '＋ 出店フォームを開く': '+ Open listing form',
  '出店内容を編集': 'Edit listing',
  '再公開する': 'Re-publish',
  '出店中': 'Live',
  '回利用': 'uses',

  // ── Agent create chooser ──
  '新規作成': 'From scratch',
  'テンプレートから': 'From templates',
  'ゼロから作る': 'Build from scratch',
  'あなた専属の AI を 1 体作る': 'Build one dedicated AI',
  'このテンプレートを使う →': 'Use this template →',
  '▶ 作り始める': '▶ Start building',
  'キャンセル': 'Cancel',
  'テンプレートから始める': 'Start from a template',

  // ── Sidebar IA ──
  '🎯 Agent Team': '🎯 Agent Team',
  '🎯 Agent Teams': '🎯 Agent Teams',
  '👥 グループ': '👥 Groups',
  '🤖 DM': '🤖 DM',
  'Agent Team を作成': 'Create Agent Team',
  'グループを作成': 'Create a group',
  'AI を作成': 'Create AI',
  'まだトークがありません': 'No conversations yet',
  '＋ ホームから作成': '+ Create from home',

  // ── New: Knowledge base / Schedules / Webhook / Integrations ──
  '📚 ナレッジベース': '📚 Knowledge base',
  'PDF・DOCX・テキストを登録すると、関連する質問でこのAIが自動で参照します。': 'Add PDF/DOCX/text — this AI will look them up on relevant questions.',
  '＋ ドキュメントを追加': '+ Add document',
  'まだドキュメントがありません': 'No documents yet',
  '⏰ スケジュール実行': '⏰ Scheduled runs',
  '毎日 / 毎時 のタイミングで自動的に AI を走らせ、結果をチャットまたはメールで受け取れます。': 'Run this AI on a daily/hourly schedule and deliver the result to chat or email.',
  '＋ 新しいスケジュール': '+ New schedule',
  'まだスケジュールがありません': 'No schedules yet',
  '🔌 Webhook': '🔌 Webhook',
  '外部サービスから POST すると、AI が応答を JSON で返します。Zapier・GitHub・Slack などから呼び出せます。': 'Anything that POSTs here will trigger the AI and get a JSON reply — Zapier, GitHub, Slack, etc.',
  'Webhook を有効化': 'Enable webhook',
  'Webhook を無効化': 'Disable webhook',
  'URL 再生成': 'Regenerate URL',
  'まだ有効化されていません': 'Not enabled yet',
  '公開ハンドル (Public handle)': 'Public handle',
  '3-30 文字の a-z, 0-9, _ のみ。公開プロフィールページを使うために設定。': '3-30 chars of a-z, 0-9, _ only. Required for your public profile page.',

  // ── Integrations pane ──
  'Slack や Discord に通知を送るための連携設定です。': 'Outbound notifications to Slack or Discord.',
  'Incoming Webhook': 'Incoming Webhook',
  'Slack で Incoming Webhook を作成': 'Create a Slack Incoming Webhook',
  'して URL を貼り付け。': '— then paste the URL here.',
  'チャンネル設定 → Integrations → Webhooks → New Webhook → URL をコピー。': 'Channel settings → Integrations → Webhooks → New Webhook → copy the URL.',
  '使い方': 'How to use',
  '保存': 'Save',
  '削除': 'Delete',
  '未設定': 'Not configured',
  '設定済み': 'Configured',
  'AI に「Slack に売上レポートを送って」と指示すると、自動で notify_slack ツールを呼びます。': 'Ask the AI "send a sales report to Slack" — it calls notify_slack automatically.',
  'スケジュール実行 + Slack 通知 を組み合わせて、毎朝 9 時に分析結果を投げる、といったオートメーションも可能です。': 'Combined with Scheduled runs, you can have analysis delivered to Slack every morning at 9 AM.',
};

/* Apply translations to all text nodes in the given root. Idempotent. */
function _walkAndTranslate(root){
  if(!root) return;
  var stack = [root];
  while(stack.length){
    var node = stack.pop();
    if(node.nodeType === 3){
      var t = node.nodeValue;
      var trimmed = t.trim();
      if(trimmed && /[ぁ-んァ-ヶー一-龠]/.test(trimmed) && _JA2EN[trimmed]){
        node.nodeValue = t.replace(trimmed, _JA2EN[trimmed]);
      }
    } else if(node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'TEXTAREA'){
      // Translate placeholder attribute as well
      if(node.hasAttribute && node.hasAttribute('placeholder')){
        var p = node.getAttribute('placeholder').trim();
        if(_JA2EN[p]) node.setAttribute('placeholder', _JA2EN[p]);
      }
      if(node.hasAttribute && node.hasAttribute('title')){
        var ti = node.getAttribute('title').trim();
        if(_JA2EN[ti]) node.setAttribute('title', _JA2EN[ti]);
      }
      for(var i=0;i<node.childNodes.length;i++) stack.push(node.childNodes[i]);
    }
  }
}

/* Initial pass + observe future mutations */
function _enableRuntimeTranslator(){
  _walkAndTranslate(document.body);
  if(window.MutationObserver){
    var mo = new MutationObserver(function(muts){
      for(var i=0;i<muts.length;i++){
        var m = muts[i];
        if(m.type === 'childList'){
          for(var j=0;j<m.addedNodes.length;j++) _walkAndTranslate(m.addedNodes[j]);
        } else if(m.type === 'characterData'){
          _walkAndTranslate(m.target);
        }
      }
    });
    mo.observe(document.body, {childList:true, subtree:true, characterData:true});
  }
  // Wrap showToast / confirm / alert to translate first arg
  var origToast = window.showToast;
  if(typeof origToast === 'function'){
    window.showToast = function(msg, kind){
      var trimmed = String(msg||'').trim();
      if(_JA2EN[trimmed]) msg = _JA2EN[trimmed];
      return origToast.call(this, msg, kind);
    };
  }
  var origConfirm = window.confirm;
  window.confirm = function(msg){
    var trimmed = String(msg||'').trim();
    if(_JA2EN[trimmed]) msg = _JA2EN[trimmed];
    return origConfirm.call(window, msg);
  };
  var origAlert = window.alert;
  window.alert = function(msg){
    var trimmed = String(msg||'').trim();
    if(_JA2EN[trimmed]) msg = _JA2EN[trimmed];
    return origAlert.call(window, msg);
  };
}

/* ── Boot ──────────────────────────────────────────── */
// Apply saved UI zoom EARLY (before any rendering) so we don't flash at
// default size. zoom is a CSS variable so the media query in <style> picks
// it up automatically.
(function _applyUiScaleEarly(){
  try {
    var s = parseFloat(localStorage.getItem('ui_scale') || '0.9');
    if(s >= 0.6 && s <= 1.2){
      document.documentElement.style.setProperty('--ui-scale', String(s));
    }
  } catch(e){}
})();
// Toggle "email me when mentioned in a group" — saved on server.
window._toggleMentionEmail = async function(){
  var sw = document.getElementById('mentionEmailSw');
  if(!sw) return;
  var currentlyOn = sw.classList.contains('on');
  var next = currentlyOn ? 'off' : 'on';
  // Optimistic UI
  sw.classList.toggle('on', next === 'on');
  try {
    await api('PUT', '/api/me/notif-pref', { mention_email: next });
    if(me) me.mention_email_pref = next;
    showToast(next === 'on'
      ? (isJa?'✓ メンション時にメール通知 ON':'✓ Email-on-mention ON')
      : (isJa?'✓ メール通知 OFF':'✓ Email-on-mention OFF'), 'ok');
  } catch(e){
    sw.classList.toggle('on', currentlyOn); // rollback on error
    showToast((e.message||'保存失敗'),'ng');
  }
};

// Public API for the Settings panel.
window.setUiScale = function(pct){
  var n = Math.max(60, Math.min(120, parseInt(pct, 10) || 90)) / 100;
  document.documentElement.style.setProperty('--ui-scale', String(n));
  try { localStorage.setItem('ui_scale', String(n)); } catch(e){}
};
// Highlight the active scale button in the Settings panel.
window._markUiScale = function(pct){
  var n = String(Math.max(60, Math.min(120, parseInt(pct, 10) || 90)) / 100);
  document.querySelectorAll('[data-uiscale]').forEach(function(el){
    if(el.getAttribute('data-uiscale') === n) el.classList.add('sel');
    else el.classList.remove('sel');
  });
};
document.addEventListener('DOMContentLoaded',async()=>{
  // i18n apply
  const _applyI18n=()=>{
    [['i18n-teamTitle',T.teamTitle],['i18n-teamSub',T.teamSub],['i18n-teamBtn',T.teamBtn],
     ['i18n-newAgent',T.newAgent],['i18n-newTpl',T.newTpl],['i18n-newMarket',T.newMarket],['i18n-teamLabel',T.teamLabel],
     ['i18n-balance',T.balance],['i18n-charge',T.charge],['i18n-logout',T.logout]]
    .forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v;});
    // Apply data-i18n attributes anywhere on the page (billing modal, settings tabs, etc.)
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var k=el.getAttribute('data-i18n');
      if(T[k]===undefined) return;
      // If the value contains HTML tags (e.g. <b> in legend lines), use
      // innerHTML so the markup renders. Plain strings still go through
      // textContent for safety.
      if(/[<&]/.test(T[k])) el.innerHTML = T[k];
      else el.textContent = T[k];
    });
    const inp=document.getElementById('msgInput');
    if(inp) inp.placeholder=T.placeholder;
    document.documentElement.lang = (typeof currentLang==='string') ? currentLang : (isJa?'ja':'en');
  };
  _applyI18n();
  // For non-JA users, run the runtime translator over everything that wasn't
  // explicitly wrapped with L(...) yet. Keeps JA browsers untouched.
  if(currentLang !== 'ja') _enableRuntimeTranslator();
  buildAvGrid(); buildSkGrid(); buildPresetGrid();
  // Handle Google OAuth redirect token in URL
  const urlParams=new URLSearchParams(location.search);
  const urlToken=urlParams.get('token');
  if(urlToken){ localStorage.setItem('token',urlToken); history.replaceState({},'',location.pathname); }
  token=localStorage.getItem('token');
  if(!token){ location.href='auth.html'; return; }
  try{
    const meData=await api('GET','/api/me');
    if(!meData||meData.error){ localStorage.removeItem('token'); location.href='auth.html'; return; }
    me=meData.user||meData;
    if(!me.favorites) me.favorites = [];
    // Recovery: if the user has a Stripe customer but plan says 'free',
    // a previous subscription save likely failed. Re-sync from Stripe.
    if(me && me.stripe_customer_id && (me.plan||'free')==='free'){
      try{
        var sync = await api('POST','/api/billing/sync');
        if(sync && sync.plan && sync.plan !== 'free'){
          me.plan = sync.plan;
          me.subscription_id = sync.subscription_id;
          me.subscription_status = sync.status;
          console.log('[billing/sync] recovered plan:', sync.plan);
        }
      }catch(e){ console.warn('[billing/sync] failed:', e.message); }
    }
    // Record this token in the multi-account list (so the switcher shows it)
    try{ _recordCurrentAccount(); }catch(e){}
    // If the Chrome extension is installed but not yet paired (or paired-but-offline),
    // silently pair in the background so the user never has to click anything.
    try{ if(typeof _extAutoPair==='function') _extAutoPair(); }catch(e){}
    // Reveal admin moderation tab for staff accounts
    if(me && me.is_admin){
      var aSec=document.getElementById('snavAdminSec'); if(aSec) aSec.style.display='';
      var aBtn=document.getElementById('snavAdminBtn'); if(aBtn) aBtn.style.display='';
      var aDb =document.getElementById('snavDashboardLink'); if(aDb) aDb.style.display='';
    }
    // Handle Stripe Connect return redirect (?payout=onboarded|refresh)
    try{
      var qs = new URLSearchParams(location.search);
      var pq = qs.get('payout');
      if(pq){
        history.replaceState({}, '', location.pathname);
        if(pq==='onboarded') showToast(L('銀行口座の登録が完了しました','Bank account registered'),'ok');
        if(pq==='refresh')   showToast(L('銀行口座の登録を再開してください','Please resume bank account setup'),'ng');
        // Auto-open creator tab so user sees the result
        setTimeout(function(){
          openSettings();
          var btn = document.querySelector('.snav-item[data-tab="creator"]');
          if(btn) switchStab(btn,'s-creator');
        }, 200);
      }
      // Deep-link: ?listing=ls_xxx — open the marketplace + detail modal
      var lq = qs.get('listing');
      if(lq){
        history.replaceState({}, '', location.pathname);
        setTimeout(function(){
          openAgentStore();
          setTimeout(function(){ openListingDetail(lq); }, 250);
        }, 300);
      }
      // Google Sheets connection redirect
      var gq = qs.get('google_sheets');
      if(gq){
        history.replaceState({}, '', location.pathname);
        if(gq==='connected'){
          showToast(isJa?'Google スプレッドシート連携を有効にしました':'Google Sheets connected','ok');
          // /api/me already reflects connected state (set during the callback). Re-render
          // any open edit/wizard panels so the toggle updates.
          if(typeof _renderSheetsStatus==='function'){
            _renderSheetsStatus('editSheetsSw','editSheetsDesc','editSheetsAccountRow','editSheetsEmail','editSheetsConnectBtn', false);
            _renderSheetsStatus('wSheetsSw','wSheetsDesc','wSheetsAccountRow','wSheetsEmail','wSheetsConnectBtn', false);
          }
        } else {
          var reason = qs.get('reason') || gq;
          showToast((isJa?'Google 連携に失敗しました: ':'Google connection failed: ')+reason, 'ng');
          // The two errors that mean "developer hasn't finished Cloud Console setup".
          // Auto-open the setup guide so they don't have to hunt for instructions.
          if(/redirect_uri_mismatch|access_denied|invalid_scope|admin_policy_enforced/i.test(reason)){
            setTimeout(function(){
              if(confirm(isJa
                ? 'Google Cloud Console の設定がまだ完了していない可能性があります。セットアップガイドを開きますか？'
                : 'Google Cloud Console setup may be incomplete. Open setup guide?')){
                window.open('/setup-google-sheets.html', '_blank');
              }
            }, 600);
          }
        }
      }
    }catch(e){}
    const ra=await api('GET','/api/agents');
    agents=ra.agents||[];
    // Fetch joined groups (where I'm an invitee, hosted by others)
    try { await fetchJoinedGroups(); } catch(e){ console.warn('[groups] fetch failed:', e.message); }
    // If URL has ?openAgent=ag_xxx (e.g., from invite redirect), focus that one.
    // ?joined=1 means the user just completed an invite → toast a welcome.
    // ?agent_id=ag_xxx&kickoff=1 means signup just finished and the site agent was
    //   created — open the chat and stream 6 artifact generations into the chat.
    try {
      var qs0 = new URLSearchParams(location.search);
      var qsOpen = qs0.get('openAgent') || qs0.get('agent_id');
      var qsJoined = qs0.get('joined') === '1';
      var qsKickoff = qs0.get('kickoff') === '1';
      if(qsOpen){
        history.replaceState({}, '', location.pathname);
        // Defer until after agent list renders
        setTimeout(() => {
          try { openAgent(qsOpen); } catch(e){}
          if(qsJoined){
            try {
              showToast(isJa
                ? '✨ グループに参加しました! 早速メッセージを送ってみましょう。'
                : '✨ You joined the group! Send a message to say hi.', 'ok');
              // Fetch the host's welcome message and show it as a banner card
              // at the top of the chat. Dismissable + persisted per-agent.
              _showJoinWelcomeBanner(qsOpen);
            } catch(e){}
          }
          if(qsKickoff){
            try { _kickoffOnboardingChat(qsOpen); } catch(e){ console.warn('[kickoff]', e); }
          }
        }, 200);
      }
      // Post-OAuth redirect: ?intg=<id>&status=ok|err&login=... or &email=...
      // Triggered by /api/auth/{github|google-intg}/callback. We toast, then
      // reload the catalog so the connected card flips to "✓ 接続済".
      var qsIntg = qs0.get('intg');
      var qsSt = qs0.get('status');
      var qsAccount = qs0.get('login') || qs0.get('email') || '';
      var qsReason = qs0.get('reason') || '';
      if(qsIntg){
        history.replaceState({}, '', location.pathname);
        if(qsSt === 'ok'){
          var qsProfiles = qs0.get('profiles');
          var label = qsIntg === 'google' ? 'Google Workspace (6 サービス)'
            : qsIntg === 'buffer' ? ('Buffer' + (qsProfiles ? ' (' + qsProfiles + ' SNS 接続済)' : ''))
            : qsIntg;
          showToast('✓ ' + label + ' に接続しました' + (qsAccount?' ('+qsAccount+')':''), 'ok');
          if(qsIntg === 'github' && me){ me.github_connected = true; }
          if(qsIntg === 'google' && me){ me.google_sheets_connected = true; }
          setTimeout(function(){ try { _loadIntegrations(); openIntegrationsTab(); } catch(e){} }, 200);
        } else if(qsSt === 'err'){
          showToast('⚠ ' + qsIntg + ' 連携失敗: ' + qsReason, 'ng');
        }
      }
    } catch(e){}
    // Show email verify banner if not verified
    if(!me.verified) showVerifyBanner();
    // Show one-time Sheets onboarding hint to users who have agents but haven't connected Sheets.
    // Suppressed once dismissed (localStorage flag).
    try{
      var sheetsHintDismissed = localStorage.getItem('hint:sheets-v1')==='1';
      if(!sheetsHintDismissed && !me.google_sheets_connected && (agents.length>0)){
        showSheetsOnboardingBanner();
      }
    }catch(e){}
  }catch(e){ console.error('[init]',e&&e.message); }
  try{ renderAll(); }catch(re){ console.warn('renderAll:',re.message); }
  document.getElementById('loader').classList.add('gone');
  // 旧 onboarding wizard は廃止。新規ユーザーは LP / signup → /onboarding.html
  // のフローを通る。サイト 0 件のユーザーは新ホームの「+ サイトを追加」CTA
  // (= renderHomeDashboard 内) で onboarding に進む。
});

// 旧 first-run onboarding wizard (3 ステップ goal → quickstart agent 設計) は廃止。
// 新規ユーザーは LP → signup → /onboarding.html (スプラッシュ) → /app.html へ遷移する。
// 旧 agent を持つ既存ユーザーは新ホームの「サイトに紐づける」UI で移行する。
// (旧 wizard 関数 _showOnboarding / _renderOnboardingStep / _runOnboardingGen
//  /_skipOnboarding / _closeOnboarding は廃止)

function showVerifyBanner(){
  const banner=document.createElement('div');
  banner.id='verify-banner';
  banner.style.cssText='position:fixed;top:0;left:0;right:0;z-index:200;padding:10px 20px;background:#ffb547;color:#fff;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:12px;';
  banner.innerHTML=`📧 メールアドレスの確認が完了していません。 <button onclick="resendVerify()" style="background:rgba(0,0,0,.15);border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-weight:700;font-family:inherit;">確認メールを再送</button> <button onclick="document.getElementById('verify-banner').remove()" style="background:none;border:none;cursor:pointer;font-size:16px;margin-left:8px;">×</button>`;
  document.body.prepend(banner);
}

async function resendVerify(){
  try{ await api('POST','/api/auth/resend-verify'); showToast(L('確認メールを送信しました','Verification email sent'),'ok'); }
  catch(e){ showToast(e.message,'ng'); }
}

function showSheetsOnboardingBanner(){
  if(document.getElementById('sheets-onboarding-banner')) return;
  var banner = document.createElement('div');
  banner.id = 'sheets-onboarding-banner';
  banner.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:180;max-width:340px;'
    + 'background:linear-gradient(135deg,#fff7ed,#ffedd5);border:1px solid rgba(251,146,60,.4);'
    + 'border-radius:14px;padding:16px 18px 14px;box-shadow:0 12px 32px rgba(180,100,40,.18);'
    + 'font-size:13px;color:var(--text);';
  var dismissJS = "localStorage.setItem('hint:sheets-v1','1');document.getElementById('sheets-onboarding-banner').remove()";
  banner.innerHTML =
    '<div style="display:flex;align-items:flex-start;gap:10px">'
      + '<div style="font-size:22px;line-height:1">📊</div>'
      + '<div style="flex:1;min-width:0">'
        + '<div style="font-weight:800;color:var(--text);margin-bottom:4px">Google スプレッドシート連携</div>'
        + '<div style="font-size:12px;color:var(--text2);line-height:1.6">'
          + 'AI に自分のスプレッドシートを直接読み書きさせられます。エージェント編集 → 📊 から接続できます。'
        + '</div>'
        + '<div style="margin-top:10px;display:flex;gap:8px">'
          + '<button onclick="' + dismissJS + ';openEditAgent(activeId)" style="background:var(--peach);color:#fff;border:0;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">設定する</button>'
          + '<button onclick="' + dismissJS + '" style="background:transparent;color:var(--text3);border:0;padding:7px 10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">後で</button>'
        + '</div>'
      + '</div>'
      + '<button onclick="' + dismissJS + '" aria-label="close" style="background:none;border:0;cursor:pointer;font-size:16px;color:var(--text3);padding:0 0 0 4px">×</button>'
    + '</div>';
  document.body.appendChild(banner);
}

/* ── API ───────────────────────────────────────────── */
async function api(method,path,body){
  const opts={method,headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}};
  if(body)opts.body=JSON.stringify(body);
  const res=await fetch(API+path,opts);
  const ct=(res.headers.get('content-type')||'').toLowerCase();
  // Server may return an HTML error page (Render edge 502/504, gateway timeout, etc.)
  if(!ct.includes('application/json')){
    const text=await res.text().catch(()=>'');
    if(res.status===502||res.status===503||res.status===504){
      throw new Error(isJa?'サーバーが混雑または応答が遅すぎます。30秒待ってもう一度お試しください。':'Server busy or slow. Please retry in 30s.');
    }
    if(res.status===429){
      throw new Error(isJa?'リクエストが多すぎます。少し待ってから再送信してください。':'Too many requests. Please wait and retry.');
    }
    throw new Error((isJa?'通信エラー（HTTP ':'Network error (HTTP ')+res.status+(isJa?'）':')')+(text?': '+text.slice(0,120):''));
  }
  const data=await res.json();
  if(!res.ok){
    // Prefer the user-facing `detail` (Japanese hint) over the machine `error`
    // code when both are present. Callers can still read both via err.code /
    // err.detail. Without this, toasts displayed cryptic codes like
    // "connection_test_failed" instead of the actual diagnostic.
    var msg = data.detail || data.error || 'エラーが発生しました';
    var err = new Error(msg);
    err.code = data.error || '';
    err.detail = data.detail || '';
    if(data.upgrade_required) err.upgrade_required = data.upgrade_required;
    if(data.reason) err.reason = data.reason;
    throw err;
  }
  return data;
}

/**
 * Show a sticky "upgrade" prompt when the backend signals plan_gate.
 * Falls back to a normal toast for non-gated errors.
 */
function _showUpgradeToast(err){
  if(!err) return;
  var target = err.upgrade_required;
  if(!target){ showToast(err.message || 'エラー','ng'); return; }
  var planLabel = target === 'pro' ? 'Pro' : 'Business';
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#1a0a00;color:#fff;border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:14px;z-index:99999;box-shadow:0 14px 40px rgba(0,0,0,.32);max-width:520px;font-family:inherit;font-size:13px';
  t.innerHTML = '<div style="font-size:22px;flex-shrink:0">🔒</div>'
    + '<div style="flex:1;min-width:0;line-height:1.55">'+esc(err.message||'')+'</div>'
    + '<button id="_upgToastBtn" style="background:var(--peach);color:#fff;border:0;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;flex-shrink:0">'+planLabel+' へ →</button>';
  document.body.appendChild(t);
  var btn = t.querySelector('#_upgToastBtn');
  var dismiss = function(){ if(t.parentNode) t.parentNode.removeChild(t); };
  btn.onclick = function(){ dismiss(); try{ openBillingModal(target); }catch(e){ try{ openCharge(); }catch(_){ } } };
  setTimeout(dismiss, 9000);
}

/* ── Render ────────────────────────────────────────── */
function renderAll(){
  document.getElementById('userName').textContent=me.name;
  document.getElementById('userAv').textContent=me.name.charAt(0).toUpperCase();
  // Founder 100 badge in sidebar — shows "★ #42" with peach gradient.
  var fb = document.getElementById('userFounderBadge');
  if(fb){
    if(me.is_founder){
      fb.style.display = 'inline-flex';
      fb.textContent = '★' + (me.founder_seat_no ? ' #'+me.founder_seat_no : '');
      fb.title = isJa
        ? 'Founder 100 メンバー' + (me.founder_seat_no ? ' (席 #'+me.founder_seat_no+')' : '')
        : 'Founder 100 member' + (me.founder_seat_no ? ' (seat #'+me.founder_seat_no+')' : '');
    } else {
      fb.style.display = 'none';
    }
  }
  updateBalance();
  updatePlanBadge();
  renderAgList();
  // Lazy: hydrate integrations catalog so the sidebar 🔌 badge shows
  // immediately. Doesn't block render — runs in the background.
  setTimeout(function(){ try { _loadIntegrations(); } catch(e){} }, 300);
  // "Open last chat on startup" preference (default off → land on home dashboard).
  const openLast = _prefBool('behav_open_last', false);
  if(openLast && agents.length>0){
    openAgent(activeId&&agents.find(a=>a.id===activeId)?activeId:agents[0].id);
  } else {
    goHome();
  }
}

/** Show the home dashboard (close any active chat, render kinds row). */
function goHome(){
  activeId = null;
  document.getElementById('emptyWrap').style.display='';
  document.getElementById('chatWrap').style.display='none';
  // Clear sidebar selection
  try{ document.querySelectorAll('.ag-item').forEach(el=>el.classList.remove('on')); }catch(e){}
  try{ renderHomeDashboard(); }catch(e){}
  if(typeof _stopGroupPoll === 'function') _stopGroupPoll();
}

// チャット上部の「📊 ダッシュボード」ボタンから呼ばれる。
// activeId は維持したまま (= サイドバーで site が selected な状態)、
// メイン pane を chat → home dashboard に切替。サイトの dashboard が
// その site の情報で render される (= renderHomeDashboard が activeId を見る)。
function goSiteDashboard(){
  document.getElementById('emptyWrap').style.display='';
  document.getElementById('chatWrap').style.display='none';
  try { renderHomeDashboard(); } catch(e){}
  // スクロールを上に
  var el = document.getElementById('emptyWrap');
  if(el) el.scrollTop = 0;
}

/* ── Onboarding kickoff: signup 直後にチャット画面で artifact 生成を live 表示 ──
   /api/onboarding/site で agent を作った直後、auth.html が /app.html?agent_id=X&kickoff=1
   に redirect する。ここでチャットを開いた後、SSE で 6 artifact 並列生成の進捗を
   chat の中に「AI からのメッセージ」として live 表示。

   ユーザー体験:
   - チャット画面に着地した瞬間、AI から「受領しました!」メッセージが届く
   - 6 個の納品物のチェックリスト (一つずつ ✅ に変わる) が live update
   - 各完成時に artifact カードがメッセージに追加される
   - スプラッシュ画面で待つより遥かに「動いてる感」が出る */
// kickoff 完了後の「次にやる 3 つ」 CTA を assistant メッセージとして注入。
// vertical 別に意味のある初手 3 つを提示し、ボタンクリックで即チャット送信。
function _addNextStepCTA(ag){
  if(!ag || !ag.history) return;
  // 二重追加防止
  if(ag.history.some(function(m){ return m && m.via_next_step_cta; })) return;
  var vertical = ag.site_vertical || 'other';
  var hostname = _siteHostname(ag);

  // ── 🚀 1-CLICK X 投稿カード (= 最優先 CTA、 next-3 の上に出す) ──
  // X 系の納品物があれば「1 クリックで投稿」を promote。
  // クリック → 拡張 + X 接続 + preview modal を auto-chain。
  var xArt = null;
  if(typeof me !== 'undefined' && me && Array.isArray(me.artifacts)){
    xArt = me.artifacts.find(function(a){
      if(!a || a.chat_id !== ag.id) return false;
      var t = String(a.title || a.filename || '').toLowerCase();
      return /twitter|スレッド|thread|tweet|\bx[\s_-]/i.test(t);
    });
  }
  var xCardMsg = {
    id: 'a_xcard_' + Date.now(),
    role: 'assistant',
    time: now(),
    via_kickoff: true,
    via_x_test_card: true,
    site_id: ag.id,
    x_test_artifact: xArt ? { title: xArt.title, filename: xArt.filename } : null,
    content: '🚀 **AI が作った X スレッドをテスト投稿してみよう**\n\n'
           + (xArt
             ? '生成済: **' + (xArt.title || 'X スレッド') + '** をワンクリックで X に投稿できます。\n\n'
             : '「' + hostname + '」の魅力を伝える X スレッドを生成 → 投稿します。\n\n')
           + '✅ 拡張インストール → ✅ X ログイン確認 → ✅ プレビュー → ✅ 投稿、 全部 **1 ボタン** で chain。\n\n'
           + '<x1click:' + ag.id + '>',
  };
  ag.history.push(xCardMsg);
  // vertical 別の最初の依頼テンプレ (= 効果が見えやすい 3 つ)
  var NEXT_STEPS = {
    saas: [
      { ic: '🎯', label: 'LP CVR 改善案', prompt: 'この LP の CVR を上げる A/B テスト案を 5 個、優先度順に提案して。各案に仮説と期待される効果を含む。' },
      { ic: '🐦', label: 'X スレッドを 1 本', prompt: 'プロダクトの価値を伝える X (Twitter) スレッドを 1 本作って。Hook → 痛みポイント → 解決 → CTA の構造で 5-7 ツイート。' },
      { ic: '🔍', label: '競合 3 社を分析', prompt: 'このプロダクトの主要競合を 3 社特定して、強み・弱み・差別化のヒントを 1 ページにまとめて。' },
    ],
    ec: [
      { ic: '🛒', label: '商品ページ最適化', prompt: '売れ筋商品 3 つを推測して、それぞれの商品ページの SEO 改善案 + 説明文書き直し案を提案して。' },
      { ic: '📱', label: 'Instagram 投稿 1 週間分', prompt: '商品を魅力的に見せる Instagram 投稿を 7 日分作って。キャプション + ハッシュタグ + 投稿時間提案を含む。' },
      { ic: '⭐', label: 'レビュー誘導フロー', prompt: '購入後 3 日 / 7 日 / 14 日でレビューを依頼するメールフローを作って。文面 3 本セット。' },
    ],
    store: [
      { ic: '🗺', label: 'Google ビジネスプロフィール最適化', prompt: 'Google ビジネスプロフィールを最適化するための具体策を提案して。説明文・カテゴリ・投稿アイデアを含む。' },
      { ic: '📱', label: 'Instagram 1 週間分', prompt: '店舗の雰囲気・サービスを伝える Instagram 投稿を 7 日分作って。' },
      { ic: '💬', label: '口コミ返信テンプレ集', prompt: 'good レビュー / 微妙レビュー / クレーム の 3 パターンへの返信テンプレートを作って。' },
    ],
    blog: [
      { ic: '✍️', label: '記事ネタを 10 本', prompt: '今書くべき記事ネタを 10 本提案して。各案にメインキーワードと検索ボリューム推定を付与。' },
      { ic: '🐦', label: '既存記事を X スレッドに', prompt: 'サイトで最も注目された記事 1 本を選んで、X で読まれる 7 ツイートのスレッドに変換して。' },
      { ic: '📧', label: 'メルマガを 1 本', prompt: '読者向けに送るメルマガを 1 本作って。Subject + Body 形式。' },
    ],
    portfolio: [
      { ic: '💼', label: 'LinkedIn 投稿戦略', prompt: 'LinkedIn でプレゼンスを高める投稿戦略を 1 週間分作って。各日のテーマと投稿例を含む。' },
      { ic: '📧', label: '営業メール 3 種', prompt: '新規アプローチ / フォローアップ / リクエスト返信 の 3 種の営業メール文面を作って。' },
      { ic: '📚', label: 'ケーススタディ テンプレ', prompt: '実績を魅力的なケーススタディに変換するテンプレと書き方ガイドを作って。' },
    ],
    other: [
      { ic: '🔍', label: 'サイト診断 + 改善案 3 つ', prompt: 'このサイトを分析して、最も改善すべき 3 点を提案して。優先度 (高/中/低) + 期待効果 + 実装難易度を明記。' },
      { ic: '📝', label: 'コンテンツ案 5 つ', prompt: 'このサイトに合うコンテンツ案を 5 つ提案して。各案のターゲットと配信先を含む。' },
      { ic: '🎯', label: '集客戦略 1 ページ', prompt: 'このサイトの集客戦略を 1 ページにまとめて。ターゲット / 3 ヶ月の数値目標 / 主力施策 3 つを簡潔に。' },
    ],
  };
  var steps = NEXT_STEPS[vertical] || NEXT_STEPS.other;
  // Markdown でボタン風に表示 (= 既存の renderer が clickable link を扱える)
  var content = '✨ **AI チームへの最初の依頼を選んでください**\n\n'
    + 'どれをクリックしても、その依頼がそのまま実行されます。AI 組織の動きが見えやすい初手を 3 つ用意しました。\n\n'
    + steps.map(function(s, i){
        // Special marker: NEXTSTEP|{prompt} で _md が button に変換する
        return '🎯 **' + (i+1) + '. ' + s.ic + ' ' + s.label + '**\n   > ' + s.prompt;
      }).join('\n\n')
    + '\n\n💡 上記からテキストをコピーして送信するか、自分の言葉で依頼を書いてもらっても OK です。';

  ag.history.push({
    id: 'a_nextstep_' + Date.now(),
    role: 'assistant',
    time: now(),
    via_next_step_cta: true,
    content: content,
    next_steps: steps,  // フロント側で button render する素材
  });
  renderMsgs(ag);
}

async function _kickoffOnboardingChat(agentId){
  if(!agentId) return;
  var ag = agents.find(function(a){ return a && a.id === agentId; });
  if(!ag) return;
  // すでに onboarding 走った agent ならスキップ (= 二重発火防止)
  if(ag.history && ag.history.some(function(m){ return m && m.via_kickoff; })){
    return;
  }
  var siteTitle = ag.site_title || _siteHostname(ag);

  // 1) AI 受領メッセージを履歴に追加
  var welcomeMsg = {
    id: 'a_kickoff_' + Date.now(),
    role: 'assistant',
    time: now(),
    via_kickoff: true,
    content: '🎉 受領しました! **' + esc(siteTitle) + '** のためのチームを編成しました。\n\n'
           + '👥 チームメンバー: ' + (ag.team_members||[]).map(function(m){return esc(m.name);}).join(' / ') + '\n\n'
           + '📦 これから **6 件の納品物** を並列で作成します。完成順にお届けします。',
  };
  ag.history = (ag.history||[]).concat([welcomeMsg]);
  renderMsgs(ag, true);

  // 1b) 拡張インストール誘導 (= 5 分の待ち時間を活用)。既にインストール済なら出さない。
  setTimeout(function(){
    var extPaired = (me && me.extension_device_token);
    if(extPaired) return;  // 既に paired なら skip
    var extMsg = {
      id: 'a_ext_install_' + Date.now(),
      role: 'assistant',
      time: now(),
      via_kickoff: true,
      via_ext_install: true,
      content: '🔌 **AI が SNS 投稿できるようにしましょう**\n\n'
             + 'Chrome 拡張をインストールすると、AI が **X / LinkedIn / Threads** に直接投稿できるようになります。\n\n'
             + '🔒 **パスワード共有不要** — あなたのブラウザのログイン状態を使う安全な方式。\n'
             + '⚡ **30 秒で完了** — インストールして戻ってくるだけ。\n\n'
             + '[📥 Chrome 拡張をインストール](/setup-extension.html)',
    };
    ag.history.push(extMsg);
    renderMsgs(ag);
  }, 2500);

  // 2) 進捗パネル用の "live" メッセージ (アップデートしていく)
  var liveMsgId = 'a_live_' + Date.now();
  var liveItems = [];  // [{n, total, title, status:'ing'|'done'|'err', url}]
  function _renderLiveContent(){
    var lines = liveItems.map(function(it){
      var ic = it.status === 'done' ? '✅' : (it.status === 'err' ? '❌' : '⏳');
      var link = (it.status === 'done' && it.url) ? ' → [開く](' + it.url + ')' : '';
      return ic + ' ' + esc(it.title) + link;
    }).join('\n');
    return '⚡ **AI チームが作業中**\n\n' + lines;
  }
  var liveMsg = {
    id: liveMsgId,
    role: 'assistant',
    time: now(),
    via_kickoff: true,
    content: '⚡ **AI チームが作業中**\n\n進捗を待っています…',
    streaming: false,  // (= streaming UI ではなく完成型として表示)
  };
  ag.history.push(liveMsg);
  renderMsgs(ag);

  // 3) SSE で artifact 並列生成を開始
  try {
    var resp = await fetch('/api/onboarding/site/artifacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
      },
      body: JSON.stringify({ agent_id: agentId }),
    });
    if(!resp.ok){
      throw new Error('artifacts endpoint returned ' + resp.status);
    }
    var reader = resp.body.getReader();
    var decoder = new TextDecoder();
    var buf = '';
    while(true){
      var c = await reader.read();
      if(c.done) break;
      buf += decoder.decode(c.value, { stream: true });
      var frames = buf.split('\n\n');
      buf = frames.pop();
      for(var i = 0; i < frames.length; i++){
        var lines = frames[i].split('\n');
        var ev = '', dat = '';
        for(var j = 0; j < lines.length; j++){
          var ln = lines[j];
          if(ln.startsWith('event:')) ev = ln.slice(6).trim();
          else if(ln.startsWith('data:')) dat += ln.slice(5).trim();
        }
        if(!ev) continue;
        var p = null; try { p = JSON.parse(dat); } catch(_){}
        if(ev === 'artifact_started' && p){
          var existing = liveItems.find(function(x){ return x.n === p.n; });
          if(existing){ existing.status = 'ing'; existing.title = p.title; }
          else liveItems.push({ n: p.n, total: p.total, title: p.title, status: 'ing' });
          liveItems.sort(function(a,b){return a.n - b.n;});
        } else if(ev === 'artifact_done' && p){
          var ex = liveItems.find(function(x){ return x.n === p.n; });
          if(ex){
            ex.status = p.error ? 'err' : 'done';
            ex.url = p.url || '';
            ex.title = p.title;
          } else {
            liveItems.push({ n: p.n, total: p.total, title: p.title, status: p.error?'err':'done', url: p.url||'' });
          }
          liveItems.sort(function(a,b){return a.n - b.n;});
        } else if(ev === 'done' && p){
          // 完了時に live message を最終版に更新
          liveMsg.content = '🎉 **すべての納品物が完成しました!**\n\n'
            + liveItems.map(function(it){
                var link = it.url ? ' → [開く](' + it.url + ')' : '';
                return '✅ ' + esc(it.title) + link;
              }).join('\n')
            + '\n\n📊 [ダッシュボードでまとめて見る](/app.html?dashboard=1)';
          // local artifacts list を更新するために me を再 fetch
          try {
            var meR = await api('GET', '/api/me');
            if(meR && meR.user){ me = meR.user; }
          } catch(_){}
          renderMsgs(ag);
          showToast('✓ 6 件の納品物が完成しました', 'ok');
          // ── 「次の 3 つ」 CTA を assistant メッセージとして追加 ──
          // (= ユーザーが kickoff 後に「何していいか分からない」を防ぐ)
          setTimeout(function(){ _addNextStepCTA(ag); }, 600);
          return;
        }
        // 進捗の都度 live メッセージを書き換え
        liveMsg.content = _renderLiveContent();
        renderMsgs(ag);
      }
    }
  } catch(e){
    console.warn('[kickoff] artifacts SSE failed:', e && e.message);
    liveMsg.content = '⚠️ 納品物の生成中にエラーが発生しました: ' + esc(e.message || 'unknown');
    renderMsgs(ag);
  }
}

function updatePlanBadge(){
  const badge = document.getElementById('userPlanBadge');
  if(!badge||!me) return;
  const plan = me.plan||'free';
  const labels = {
    free:     L('Free プラン','Free plan'),
    pro:      L('Pro プラン','Pro plan'),
    business: L('Business プラン','Business plan'),
  };
  badge.textContent = labels[plan] || labels.free;
  badge.style.color = plan==='pro'?'#ea580c':plan==='business'?'#9333ea':'var(--text3)';
}

function updateBalance(){
  const b = me ? (me.balance_jpy||0) : 0;
  const usageEl = document.getElementById('usageCount');
  if(usageEl) usageEl.textContent = (me?.usage_count||0) + '回利用済み';
}

// Sidebar state: which tab is active, and the joined-groups list (those owned
// by other users where I'm a member). _joinedGroups is populated by fetchGroups().
var _sbTab = 'talks';
var _joinedGroups = [];

// ── Chat options menu (⋯) ──────────────────────────────────
function openChatMenu(ev){
  if(ev) ev.stopPropagation();
  const menu = document.getElementById('chatMenu');
  if(!menu) return;
  // Position below the trigger button
  const r = ev.target.getBoundingClientRect();
  menu.style.top = (r.bottom + 6) + 'px';
  menu.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
  menu.style.left = 'auto';
  menu.style.display = 'block';
  // Show "edit agent" only for solo or hosted, group settings for groups
  const ag = agents.find(a => a.id === activeId);
  const editBtn = document.getElementById('chatMenuEditAg');
  const grpBtn = document.getElementById('chatMenuGrpSet');
  if(ag && ag.is_group){
    if(editBtn) editBtn.style.display = 'none';
    if(grpBtn) grpBtn.style.display = '';
  } else {
    if(editBtn) editBtn.style.display = (ag && !ag._is_joined_group) ? '' : 'none';
    if(grpBtn) grpBtn.style.display = 'none';
  }
  setTimeout(() => {
    document.addEventListener('click', closeChatMenu, { once: true });
  }, 0);
}
function closeChatMenu(){
  const menu = document.getElementById('chatMenu');
  if(menu) menu.style.display = 'none';
}

// ── Voice input (Web Speech API) ───────────────────────────
var _speechRecog = null;
var _speechActive = false;
function startVoiceInput(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){
    showToast(isJa?'お使いのブラウザは音声認識に対応していません':'Speech recognition not supported','ng');
    return;
  }
  if(_speechActive){ stopVoiceInput(); return; }
  _speechRecog = new SR();
  _speechRecog.lang = isJa ? 'ja-JP' : 'en-US';
  _speechRecog.continuous = false;
  _speechRecog.interimResults = true;
  const ci = document.getElementById('ci');
  let baseVal = ci ? ci.value : '';
  _speechRecog.onresult = (ev) => {
    let interim = '', final = '';
    for(let i = ev.resultIndex; i < ev.results.length; i++){
      const t = ev.results[i][0].transcript;
      if(ev.results[i].isFinal) final += t; else interim += t;
    }
    if(ci){
      ci.value = (baseVal + (final || interim)).replace(/\s+$/,'');
      try{ exTA(ci); }catch(e){}
    }
    if(final) baseVal += final;
  };
  _speechRecog.onstart = () => {
    _speechActive = true;
    document.getElementById('voiceBtn')?.classList.add('recording');
  };
  _speechRecog.onend = () => {
    _speechActive = false;
    document.getElementById('voiceBtn')?.classList.remove('recording');
  };
  _speechRecog.onerror = (e) => {
    _speechActive = false;
    document.getElementById('voiceBtn')?.classList.remove('recording');
    if(e.error !== 'no-speech' && e.error !== 'aborted'){
      showToast((isJa?'音声認識エラー: ':'Recognition error: ')+e.error,'ng');
    }
  };
  try { _speechRecog.start(); }
  catch(e){ showToast(isJa?'音声入力を開始できませんでした':'Could not start','ng'); }
}
function stopVoiceInput(){
  if(_speechRecog){ try { _speechRecog.stop(); } catch(e){} }
  _speechActive = false;
}

// ── Voice output (Web Speech Synthesis / TTS) ──────────────
var _ttsCurrent = null;
function speakMsg(btn){
  const msg = btn.closest('.m');
  if(!msg) return;
  const body = msg.querySelector('.m-body');
  if(!body) return;
  const text = body.innerText.trim();
  if(!text) return;
  if(_ttsCurrent && _ttsCurrent.speaking){
    window.speechSynthesis.cancel();
    btn.textContent = '🔊';
    return;
  }
  if(!('speechSynthesis' in window)){
    showToast(isJa?'読み上げに対応していません':'TTS not supported','ng');
    return;
  }
  const u = new SpeechSynthesisUtterance(text.slice(0, 4000));
  u.lang = isJa ? 'ja-JP' : 'en-US';
  u.rate = 1.05;
  u.onend = () => { btn.textContent = '🔊'; _ttsCurrent = null; };
  u.onerror = () => { btn.textContent = '🔊'; _ttsCurrent = null; };
  btn.textContent = '⏸';
  _ttsCurrent = u;
  window.speechSynthesis.speak(u);
}

// ── Global search (⌘K) ─────────────────────────────────────
var _searchSel = 0;       // currently highlighted result index
var _searchHits = [];     // last computed results

function openSearch(){
  document.getElementById('searchOverlay').classList.add('open');
  setTimeout(() => {
    const inp = document.getElementById('searchInput');
    if(inp){ inp.value = ''; inp.focus(); }
    _runSearch('');
  }, 50);
}
function closeSearch(){
  document.getElementById('searchOverlay').classList.remove('open');
}

function _runSearch(q){
  q = (q||'').toLowerCase().trim();
  const list = document.getElementById('searchResults');
  if(!list) return;
  if(!q){
    list.innerHTML = '<div class="search-empty">⌘K でいつでも開ける · 全エージェントの履歴を横断検索</div>';
    _searchHits = [];
    return;
  }
  const hits = [];
  // Search across all agents
  (agents||[]).forEach(a => {
    // Match in agent name itself (always include)
    if((a.name||'').toLowerCase().includes(q)){
      hits.push({type:'agent', agent: a, idx: -1, snippet: a.name});
    }
    // Match in history
    (a.history||[]).forEach((m, i) => {
      if(!m || !m.content) return;
      const text = (typeof m.content === 'string')
        ? m.content
        : (Array.isArray(m.content)
            ? (m.content.find(b => b.type==='text')?.text || '')
            : '');
      if(text.toLowerCase().includes(q)){
        hits.push({type:'msg', agent: a, idx: i, snippet: text, role: m.role, time: m.time, user_name: m.user_name});
      }
    });
  });
  // Cap at 50 results
  _searchHits = hits.slice(0, 50);
  _searchSel = 0;
  if(!_searchHits.length){
    list.innerHTML = '<div class="search-empty">「'+esc(q)+'」に一致する結果はありません</div>';
    return;
  }
  list.innerHTML = _searchHits.map((h, i) => {
    const av = (h.agent.avatar||'🤖').toString();
    const avHTML = av.startsWith('data:image/') ? '🤖' : av;
    const roleLabel = h.type==='agent' ? '' :
      (h.role==='user' ? (h.user_name||'あなた') : (h.agent.name||'AI'));
    const when = h.type==='agent' ? '' : (h.time||'');
    // Highlight match
    const re = new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')', 'gi');
    let snip = h.snippet || '';
    if(snip.length > 240) snip = snip.slice(0, 240) + '…';
    snip = esc(snip).replace(re, '<mark>$1</mark>');
    return '<button class="search-result'+(i===_searchSel?' sel':'')+'" data-idx="'+i+'" onclick="_pickSearch('+i+')">'
      + '<div class="sr-h"><span class="sr-icon">'+esc(avHTML)+'</span>'
        + '<span class="sr-agent">'+esc(h.agent.name)+'</span>'
        + (roleLabel ? '<span> · '+esc(roleLabel)+'</span>' : '')
        + '<span class="sr-when">'+esc(when)+'</span></div>'
      + '<div class="sr-body">'+snip+'</div>'
      + '</button>';
  }).join('');
}

function _searchKey(ev){
  if(ev.key === 'Escape'){ closeSearch(); return; }
  if(ev.key === 'ArrowDown'){
    ev.preventDefault();
    _searchSel = Math.min(_searchHits.length-1, _searchSel+1);
    _refreshSearchSel();
  } else if(ev.key === 'ArrowUp'){
    ev.preventDefault();
    _searchSel = Math.max(0, _searchSel-1);
    _refreshSearchSel();
  } else if(ev.key === 'Enter' && _searchHits.length){
    ev.preventDefault();
    _pickSearch(_searchSel);
  }
}
function _refreshSearchSel(){
  document.querySelectorAll('.search-result').forEach((el, i) => {
    el.classList.toggle('sel', i === _searchSel);
    if(i === _searchSel) el.scrollIntoView({block:'nearest'});
  });
}
function _pickSearch(i){
  const h = _searchHits[i];
  if(!h) return;
  closeSearch();
  openAgent(h.agent.id);
  // Scroll to the matched message after agents render
  if(h.type === 'msg' && h.idx >= 0){
    setTimeout(() => {
      const el = document.querySelector('.m[data-idx="'+h.idx+'"]');
      if(el){
        el.scrollIntoView({behavior:'smooth', block:'center'});
        el.style.transition='background .8s';
        const orig = el.style.background;
        el.style.background = 'rgba(251,146,60,.18)';
        setTimeout(() => { el.style.background = orig; }, 1200);
      }
    }, 300);
  }
}

// Global ⌘K / Ctrl+K shortcut
document.addEventListener('keydown', (ev) => {
  if((ev.metaKey || ev.ctrlKey) && ev.key === 'k'){
    ev.preventDefault();
    openSearch();
  }
});

// ── Mobile sidebar drawer ──────────────────────────────────
// On ≤700px viewports, the sidebar is hidden by default and slides in when
// the hamburger is tapped. Auto-closes on agent select / overlay click / Esc.
function _toggleMobileSidebar(open){
  const sb = document.querySelector('.sb');
  const bd = document.getElementById('sbBackdrop');
  if(!sb || !bd) return;
  // If `open` is undefined → toggle. Else apply explicit state.
  const wantOpen = (open === undefined) ? !sb.classList.contains('mobile-open') : !!open;
  if(wantOpen){
    sb.classList.add('mobile-open');
    bd.classList.add('show');
  } else {
    sb.classList.remove('mobile-open');
    bd.classList.remove('show');
  }
}
// Close drawer when an agent item is clicked (mobile)
document.addEventListener('click', (ev) => {
  if(window.innerWidth > 700) return;
  const item = ev.target.closest && ev.target.closest('.ag-item');
  if(item){
    setTimeout(() => _toggleMobileSidebar(false), 50);
  }
});
// Esc closes mobile drawer
document.addEventListener('keydown', (ev) => {
  if(ev.key === 'Escape' && document.querySelector('.sb.mobile-open')){
    _toggleMobileSidebar(false);
  }
});
// On viewport resize past breakpoint, ensure drawer state is consistent
window.addEventListener('resize', () => {
  if(window.innerWidth > 700){ _toggleMobileSidebar(false); }
});

// ── Group chat live updates ────────────────────────────────────
// Polls /api/agents/:id/members for the active group and patches in any new
// history entries so other members see what's been said in near real time.
// Only runs while document is visible AND a group is open. Stops cleanly when
// the user navigates away from the chat.
var _groupPollTimer = null;
var _groupPollAgentId = null;
var _groupPollSig = ''; // signature of last seen history (length + last entry)

function _historySignature(history){
  if(!history || !history.length) return '0:';
  const last = history[history.length-1];
  return history.length + ':' + (last && (last.time || '') + '/' + (last.role || '') + '/' + (last.user_id || ''));
}

function _stopGroupPoll(){
  if(_groupPollTimer){ clearInterval(_groupPollTimer); _groupPollTimer = null; }
  _groupPollAgentId = null;
  _groupPollSig = '';
}

function _startGroupPoll(agentId){
  _stopGroupPoll();
  _groupPollAgentId = agentId;
  const ag = agents.find(a => a.id === agentId);
  _groupPollSig = ag ? _historySignature(ag.history || []) : '';
  // Only poll while tab is visible. Tab switch pauses polling automatically.
  _groupPollTimer = setInterval(_groupPollTick, 4500);
}

// Set true while a local send is in flight so the poller doesn't clobber
// the optimistic in-progress messages with stale server state.
var _groupPollPaused = false;

// Signature of members' last_read_idx — used to detect "someone read my
// messages" without needing the chat history itself to change.
function _readSignature(members){
  if(!Array.isArray(members)) return '';
  return members.map(m => (m && m.user_id ? m.user_id + ':' + (Number.isInteger(m.last_read_idx) ? m.last_read_idx : 0) : '')).join('|');
}
var _groupPollReadSig = '';

async function _groupPollTick(){
  if(!_groupPollAgentId) return;
  if(_groupPollPaused) return;
  if(typeof document !== 'undefined' && document.hidden) return;
  // Only poll if the chat is still active
  if(activeId !== _groupPollAgentId){ _stopGroupPoll(); return; }
  try {
    const m = await api('GET', '/api/agents/' + _groupPollAgentId + '/members');
    if(!m || !Array.isArray(m.history)) return;
    const ag = agents.find(a => a.id === _groupPollAgentId);
    if(!ag) return;
    const localLen = (ag.history || []).length;
    const serverLen = m.history.length;
    const newSig = _historySignature(m.history);
    const newReadSig = _readSignature(m.members);
    const historyChanged = newSig !== _groupPollSig;
    const readsChanged = newReadSig !== _groupPollReadSig;
    // If only the read pointers moved (someone read my message — no new
    // history), update members + re-render so 既読 counts can update.
    if(!historyChanged && readsChanged && Array.isArray(m.members)){
      _groupPollReadSig = newReadSig;
      ag.members = m.members;
      if(activeId === _groupPollAgentId) renderMsgs(ag);
      _refreshSidebarUnread();
      return;
    }
    if(!historyChanged && serverLen >= localLen){
      // No chat changes AND no read-pointer changes — just refresh sidebar
      // badges for OTHER groups (a friend may have posted in a different
      // group while user is here). Light call.
      _refreshSidebarUnread();
      return;
    }
    if(serverLen < localLen) return; // local is ahead; will sync on next tick
    _groupPollSig = newSig;
    _groupPollReadSig = newReadSig;
    ag.history = m.history;
    if(Array.isArray(m.members)) ag.members = m.members;
    if(activeId === _groupPollAgentId){
      renderMsgs(ag);
      // Mark active chat as read since user is looking at it
      api('POST', '/api/agents/' + _groupPollAgentId + '/read').catch(()=>{});
    }
  } catch(e){ /* swallow — transient errors are expected */ }
}

// Lightweight refresh of unread counts on the sidebar for non-active groups.
// Called periodically and on visibilitychange.
var _lastSidebarUnreadFetch = 0;
async function _refreshSidebarUnread(){
  const now = Date.now();
  if(now - _lastSidebarUnreadFetch < 6000) return; // throttle
  _lastSidebarUnreadFetch = now;
  try { await fetchJoinedGroups(); renderAgList(); } catch(e){}
}

// Refresh once when tab regains visibility (covers users on phones who
// foreground the app expecting a fresh state).
document.addEventListener('visibilitychange', () => {
  if(!document.hidden){
    if(_groupPollAgentId) _groupPollTick();
    _refreshSidebarUnread();
  }
});

// Sidebar unread refresh runs every 20s globally (so users on a DM still see
// when a friend posted to a group). Cheap — single /api/groups call.
setInterval(() => {
  if(typeof document !== 'undefined' && document.hidden) return;
  if(!token) return;
  _refreshSidebarUnread();
}, 20000);

function setSbTab(tab){
  _sbTab = (tab === 'agents') ? 'agents' : 'talks';
  document.querySelectorAll('.sb-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === _sbTab);
  });
  renderAgList();
}

function toggleSbPlusMenu(ev){
  if(ev) ev.stopPropagation();
  var menu = document.getElementById('sbPlusMenu');
  if(!menu) return;
  var open = menu.style.display !== 'none';
  menu.style.display = open ? 'none' : 'block';
  // Click-outside to close
  if(!open){
    setTimeout(() => {
      document.addEventListener('click', closeSbPlusMenu, { once: true });
    }, 0);
  }
}
function closeSbPlusMenu(){
  var menu = document.getElementById('sbPlusMenu');
  if(menu) menu.style.display = 'none';
}

// Fetch group metadata (hosted + joined). We use the response to populate
// _joinedGroups AND to merge unread_count back into our local `agents` array
// for hosted groups (since /api/me doesn't include unread).
async function fetchJoinedGroups(){
  try{
    const r = await api('GET','/api/groups');
    const all = (r && r.groups) || [];
    _joinedGroups = all.filter(g => !g.is_host);
    // Merge unread_count + last_message into hosted-group entries in `agents`
    all.filter(g => g.is_host).forEach(g => {
      const ag = (agents || []).find(a => a.id === g.id);
      if(ag){
        ag.unread_count = g.unread_count || 0;
        if(g.last_message) ag.last_message = g.last_message;
        if(g.last_at) ag.last_at = g.last_at;
        if(typeof g.member_count === 'number') ag.member_count = g.member_count;
      }
    });
  }catch(e){ _joinedGroups = []; }
}

/* Per-agent tasks popout (案 B mini) — clicked from the "📋 タスク N" pill
 * in the chat header. Floats below the pill, lists this agent's tasks
 * with ▶ run buttons. Click outside closes. */
window._openTasksPopout = function(anchor, agentId){
  // Toggle: if already open for same agent, close.
  var existing = document.getElementById('tasksPopout');
  if(existing){
    var sameAgent = existing.getAttribute('data-agent') === agentId;
    existing.remove();
    if(sameAgent) return;
  }
  var ag = (agents||[]).find(function(a){return a.id===agentId;});
  if(!ag) return;
  var tasks = (ag.open_tasks||[]).filter(function(t){return t && t.status!=='done';});
  var rect = anchor.getBoundingClientRect();
  var pop = document.createElement('div');
  pop.id = 'tasksPopout';
  pop.setAttribute('data-agent', agentId);
  pop.style.cssText = 'position:fixed;top:'+(rect.bottom + 6)+'px;left:'+rect.left+'px;background:#fff;border:1px solid var(--wire);border-radius:11px;padding:8px;width:320px;max-height:60vh;overflow-y:auto;box-shadow:0 14px 36px rgba(0,0,0,.14);z-index:9990;font-family:inherit';
  var inner = '<div style="padding:8px 10px 10px;font-size:11px;font-weight:800;color:var(--text3);letter-spacing:.04em;text-transform:uppercase;display:flex;align-items:center;gap:8px">'
    + '<span style="color:var(--peach-dark)">' + esc(ag.name||'AI') + '</span>'
    + ' のタスク'
    + '<span style="margin-left:auto;font-size:10px;color:var(--text3)">' + tasks.length + ' 件</span>'
    + '</div>';
  if(!tasks.length){
    inner += '<div style="padding:14px;font-size:12px;color:var(--text3);text-align:center;font-style:italic">未対応のタスクはありません</div>';
  } else {
    inner += tasks.slice(0,8).map(function(t){
      var run = (t.status === 'progress' || t.status === 'started')
        ? '<span style="background:#fef3c7;color:#a16207;border:1px solid #fde047;border-radius:6px;padding:3px 8px;font-size:10px;font-weight:700">⏳</span>'
        : '<button onclick="_runHomeTask(\''+esc(agentId)+'\',\''+esc(t.id)+'\');document.getElementById(\'tasksPopout\').remove()" style="background:var(--peach);color:#fff;border:0;border-radius:6px;padding:4px 10px;font-weight:800;font-size:10.5px;cursor:pointer;font-family:inherit">▶</button>';
      return '<div style="display:flex;align-items:flex-start;gap:9px;padding:8px 10px;border-radius:8px;cursor:default" onmouseover="this.style.background=\'var(--cream)\'" onmouseout="this.style.background=\'transparent\'">'
        + '<div onclick="_markHomeTaskDone(\''+esc(agentId)+'\',\''+esc(t.id)+'\',event)" style="width:16px;height:16px;border-radius:5px;border:2px solid var(--wire2);flex-shrink:0;cursor:pointer;margin-top:2px" title="完了"></div>'
        + '<div style="flex:1;min-width:0;font-size:12.5px;font-weight:700;line-height:1.4;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">'+esc(t.title||'')+'</div>'
        + run
        + '</div>';
    }).join('');
  }
  inner += '<div style="border-top:1px solid var(--wire);padding-top:6px;margin-top:6px"><div onclick="goHome();document.getElementById(\'tasksPopout\').remove()" style="padding:7px 10px;font-size:11px;color:var(--peach-dark);font-weight:800;cursor:pointer;text-align:center;border-radius:7px" onmouseover="this.style.background=\'var(--peach-soft)\'" onmouseout="this.style.background=\'transparent\'">🏠 Home で全タスク一覧を見る →</div></div>';
  pop.innerHTML = inner;
  document.body.appendChild(pop);
  // Click outside → close
  setTimeout(function(){
    var off = function(e){
      if(pop.contains(e.target) || (anchor && anchor.contains && anchor.contains(e.target))) return;
      pop.remove();
      document.removeEventListener('mousedown', off, true);
    };
    document.addEventListener('mousedown', off, true);
  }, 50);
};

/* Hover-bar "✓ タスクに" — convert this message to a task on the active
 * agent. Uses the message body text as the task title (truncated to fit). */
window._addMsgToTasks = async function(btn){
  if(!activeId) return;
  var ag = (agents||[]).find(function(a){return a.id===activeId;});
  if(!ag) return;
  var row = btn.closest('.m');
  if(!row) return;
  var bodyEl = row.querySelector('.m-body');
  var text = bodyEl ? (bodyEl.innerText || bodyEl.textContent || '') : '';
  text = text.trim();
  if(!text){ showToast('テキストがありません','ng'); return; }
  var title = text.split('\n')[0].slice(0, 80) || text.slice(0, 80);
  try {
    await api('POST', '/api/agents/'+activeId+'/tasks', { title });
    // Reflect locally + bump pill count without full reload.
    ag.open_tasks = Array.isArray(ag.open_tasks) ? ag.open_tasks : [];
    ag.open_tasks.push({
      id: 'tsk_local_'+Math.random().toString(36).slice(2,8),
      title, status:'started', progress_pct:0,
      started_at:new Date().toISOString(),
      last_touched_at:new Date().toISOString(),
    });
    showToast('✓ タスクに追加: '+title.slice(0,30)+(title.length>30?'…':''),'ok');
    // Visual feedback: temporarily mark the button as success.
    btn.textContent = '✓✓';
    btn.style.color = '#22c55e';
    setTimeout(function(){ btn.textContent = '✓'; btn.style.color = ''; }, 1200);
    // Refresh chat-top so the "📋 タスク N" pill updates.
    if(typeof openAgent === 'function'){
      // Just re-render chat top (lighter than full openAgent).
      try {
        var ct = document.getElementById('chatTop');
        if(ct){
          var rerender = (window._chatTopRerender ||
            function(){ try { openAgent(activeId); } catch(e){} });
          // For now just re-call openAgent — cheap and correct.
          // (Skip to avoid scroll jump if it becomes an issue.)
        }
      } catch(e){}
    }
  } catch(e){
    showToast((e.message||'追加に失敗'),'ng');
  }
};

/* Home tasks panel — aggregates agent.open_tasks across every owned
 * agent so the user opens the app and sees "今日やる事". Tasks are
 * auto-extracted by the server's _afterTurnExtract from chat content.
 * Click ▶ → switch to that agent's chat with a prefilled run prompt. */
function _renderHomeTasks(){
  var wrap = document.getElementById('homeTasksWrap');
  var list = document.getElementById('homeTasksList');
  var sub  = document.getElementById('homeTasksSub');
  if(!wrap || !list) return;
  // Aggregate: walk every owned agent's open_tasks, filter undone.
  var rows = [];
  (agents || []).forEach(function(a){
    if(!a || !Array.isArray(a.open_tasks)) return;
    a.open_tasks.forEach(function(t){
      if(!t || t.status === 'done') return;
      rows.push({
        id: t.id, title: t.title || '(無題のタスク)',
        status: t.status || 'pending',
        progress: t.progress_pct || 0,
        agentId: a.id, agentName: a.name || 'AI',
        avatar: a.avatar || '🤖',
        started: t.started_at || t.created_at || '',
      });
    });
  });
  // Newest-touched first
  rows.sort(function(x, y){
    return (y.started || '').localeCompare(x.started || '');
  });
  if(!rows.length){
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = '';
  var totalCount = rows.length;
  // Server uses 'started' / 'progress' / 'done' (see _afterTurnExtract).
  // Anything not 'done' is shown as active here.
  var running = rows.filter(function(r){return r.status === 'progress' || r.status === 'started';}).length;
  if(sub){
    sub.textContent = totalCount + ' 件 アクティブ' + (running ? ' · ' + running + ' 件 実行中' : '');
  }
  var MAX_SHOWN = 5;
  var shown = rows.slice(0, MAX_SHOWN);
  list.innerHTML = shown.map(function(r){
    var stClass = (r.status === 'progress' || r.status === 'started') ? 'running' : '';
    var stPill = stClass === 'running'
      ? '<span class="st running">⏳ 実行中'+(r.progress?' '+r.progress+'%':'')+'</span>'
      : '';
    return '<div class="home-task-card '+stClass+'">'
      + '<div class="chk" onclick="_markHomeTaskDone(\''+esc(r.agentId)+'\',\''+esc(r.id)+'\',event)" title="完了にする"></div>'
      + '<div class="body">'
      +   '<div class="ti">'+esc(r.title)+'</div>'
      +   '<div class="meta">'
      +     '<span class="ag-tag" onclick="openAgent(\''+esc(r.agentId)+'\');event.stopPropagation()">'+esc(_avHTML(r.avatar))+' '+esc(r.agentName)+'</span>'
      +     stPill
      +   '</div>'
      + '</div>'
      + '<div class="actions">'
      +   (stClass === 'running' ? '' : '<button class="run-btn" onclick="_runHomeTask(\''+esc(r.agentId)+'\',\''+esc(r.id)+'\')">▶ 実行</button>')
      +   '<button class="icon-btn" onclick="_deleteHomeTask(\''+esc(r.agentId)+'\',\''+esc(r.id)+'\',event)" title="削除">🗑</button>'
      + '</div>'
      + '</div>';
  }).join('');
  if(totalCount > MAX_SHOWN){
    list.insertAdjacentHTML('beforeend',
      '<button class="home-tasks-more" onclick="alert(\'タスク全体画面は近日実装予定です\')">📋 すべて表示 ('+(totalCount-MAX_SHOWN)+' 件)</button>');
  }
}
window._runHomeTask = function(agentId, taskId){
  var ag = (agents||[]).find(function(a){return a.id===agentId;});
  if(!ag) return;
  var t = (ag.open_tasks||[]).find(function(x){return x && x.id===taskId;});
  if(!t) return;
  // Switch to that agent's chat and pre-fill the run prompt. The user
  // confirms (Enter / Send) — explicit so we don't run anything sneaky.
  openAgent(agentId);
  setTimeout(function(){
    var ci = document.getElementById('ci') || document.getElementById('msgInput');
    if(ci){
      ci.value = '【タスク実行】「' + (t.title||'') + '」を今すぐ進めて。';
      ci.focus();
      try { exTA(ci); } catch(e){}
    }
  }, 200);
};
window._markHomeTaskDone = async function(agentId, taskId, ev){
  if(ev) ev.stopPropagation();
  try {
    await api('PATCH', '/api/agents/'+agentId+'/tasks/'+taskId, { status: 'done' });
    var ag = (agents||[]).find(function(a){return a.id===agentId;});
    if(ag && Array.isArray(ag.open_tasks)){
      var t = ag.open_tasks.find(function(x){return x && x.id===taskId;});
      if(t) t.status = 'done';
    }
    _renderHomeTasks();
    showToast('✓ 完了にしました','ok');
  } catch(e){
    showToast((e.message||'失敗'),'ng');
  }
};
window._deleteHomeTask = async function(agentId, taskId, ev){
  if(ev) ev.stopPropagation();
  if(!confirm('このタスクを削除しますか?')) return;
  try {
    await api('DELETE', '/api/agents/'+agentId+'/tasks/'+taskId);
    var ag = (agents||[]).find(function(a){return a.id===agentId;});
    if(ag && Array.isArray(ag.open_tasks)){
      ag.open_tasks = ag.open_tasks.filter(function(x){return x && x.id !== taskId;});
    }
    _renderHomeTasks();
    showToast('削除しました','ok');
  } catch(e){
    showToast((e.message||'失敗'),'ng');
  }
};

// ── サイト (= agent with site_url) を識別するヘルパー群 ─────────────────────
var _VERTICAL_ICONS = { saas:'🚀', ec:'🛒', store:'🏪', blog:'✍️', portfolio:'💼', other:'🛠' };
var _VERTICAL_LABELS = { saas:'SaaS / Product LP', ec:'EC ストア', store:'店舗・サロン', blog:'ブログ・メディア', portfolio:'ポートフォリオ', other:'汎用' };
var _MEMBER_ICONS = {
  analyst:'📊', seo_writer:'✍️', community:'📱', cro:'🎯', email:'📧',
  product_writer:'📦', creative_director:'📸', review_strategy:'⭐', shopping_optimizer:'🛒', ec_analyst:'📊',
  local_seo:'🗺', instagram:'📱', review_mgmt:'💬', local_blogger:'✍️', booking_funnel:'📞',
  content_strategy:'✍️', seo:'🔍', twitter:'📱', newsletter:'📧',
  linkedin:'💼', sales_writer:'✍️', case_study:'📚', lead_gen:'🎯', sns:'📱',
  pm:'📋', researcher:'🔍', writer:'✍️', operator:'🛠',
};
function _isSiteAgent(a){ return !!(a && a.site_url); }
function _verticalIcon(v){ return _VERTICAL_ICONS[v] || '🌐'; }
function _verticalLabel(v){ return _VERTICAL_LABELS[v] || (v || ''); }
function _siteHostname(site){
  try { return new URL(site.site_url).hostname.replace(/^www\./, ''); }
  catch(e){ return site.name || ''; }
}
// 数字 tab の SNS card で 「投稿 0 のユーザー」 を AI に誘導する onboarding CTA
// platform 別に サイト情報を盛り込んだ prompt を chat input に prefill
window._promptAiToPost = function(siteId, platform, platformName){
  var site = (agents || []).find(function(a){ return a && a.id === siteId; });
  if(!site){ console.warn('[promptAiToPost] site not found:', siteId); return; }
  var hostname = (function(){ try{ return new URL(site.site_url).hostname.replace(/^www\./,''); } catch(_){ return site.name||''; } })();
  // platform 別 prompt 雛形
  var PROMPT_BY_PLATFORM = {
    x:         '私のサイト「' + hostname + '」(' + site.site_url + ') の魅力を伝える X (Twitter) 投稿を 1 つ作って、 投稿してください。',
    linkedin:  '私のサイト「' + hostname + '」(' + site.site_url + ') のサービスを LinkedIn 向けにプロフェッショナルなトーンで投稿してください。',
    threads:   '私のサイト「' + hostname + '」(' + site.site_url + ') の最新情報を、 Threads にカジュアルな雰囲気で投稿してください。',
    facebook:  '私のサイト「' + hostname + '」(' + site.site_url + ') を紹介する Facebook 投稿を作って、 投稿してください。',
    note:      '私のサイト「' + hostname + '」(' + site.site_url + ') について、 note に 1 本記事を書いて、 まずは下書き保存してください。',
    wordpress: '私のサイト「' + hostname + '」のテーマで WordPress に記事を 1 本書いて、 まずは下書き保存してください。 適切なカテゴリ・タグも付けて。',
    shopify:   '私のショップに最初の商品を 1 つ作って、 まずは draft で保存してください (= 商品名 / 商品説明 / 仮の価格)。',
  };
  var prompt = PROMPT_BY_PLATFORM[platform] || ('私の ' + (platformName || platform) + ' アカウントに最初の投稿をしてください。');
  // 数字 tab → chat へ切替 (= 同じ agent view 内で chat input がある)
  try {
    if(typeof openAgent === 'function') openAgent(siteId);
  } catch(_){}
  setTimeout(function(){
    var ci = document.getElementById('ci');
    if(ci){ ci.value = prompt; ci.focus(); ci.dispatchEvent(new Event('input', { bubbles: true })); }
    // 数字 tab を 1 度閉じて chat にユーザーを案内
    showToast('💬 チャット欄に prompt を入力しました — 送信すると AI が投稿します', 'ok');
  }, 200);
};
// 数字 tab の GSC card から AI に検索流入を聞く CTA
window._promptAiGscQuery = function(siteId){
  var site = (agents || []).find(function(a){ return a && a.id === siteId; });
  if(!site){ return; }
  var hostname = (function(){ try{ return new URL(site.site_url).hostname.replace(/^www\./,''); } catch(_){ return site.name||''; } })();
  var prompt = '私のサイト「' + hostname + '」(' + site.site_url + ') の直近 28 日の検索流入を Google Search Console で確認してください。\n\n手順:\n1. gsc_list_sites で自分が確認できるサイトを listing\n2. gsc_set_default でこのサイト (= ' + site.site_url + ') を default に設定\n3. gsc_query で TOP クエリ (= clicks 多い順 10 件) を取得\n\n結果を表で出して、 改善余地のあるクエリ (= impressions 多いのに position 5-15) を 3 つピックアップしてください。';
  try { if(typeof openAgent === 'function') openAgent(siteId); } catch(_){}
  setTimeout(function(){
    var ci = document.getElementById('ci');
    if(ci){ ci.value = prompt; ci.focus(); ci.dispatchEvent(new Event('input', { bubbles: true })); }
    showToast('🔍 チャット欄に GSC 分析 prompt を入力 — 送信すると AI が検索流入を分析します', 'ok');
  }, 200);
};
// 「3 時間前」 / 「2 日前」 などの相対時間 (= 数字 tab の SNS card で使用)
function _fmtRelTime(iso){
  if(!iso) return '';
  var ts = Date.parse(iso);
  if(!ts) return '';
  var diff = Date.now() - ts;
  if(diff < 60000) return 'たった今';
  if(diff < 3600000) return Math.floor(diff / 60000) + ' 分前';
  if(diff < 86400000) return Math.floor(diff / 3600000) + ' 時間前';
  if(diff < 30 * 86400000) return Math.floor(diff / 86400000) + ' 日前';
  return Math.floor(diff / (30 * 86400000)) + ' ヶ月前';
}
function _siteTodayArtifacts(siteId){
  if(!siteId || typeof me === 'undefined' || !me) return [];
  var arts = Array.isArray(me.artifacts) ? me.artifacts : [];
  var since = Date.now() - 86400000;
  return arts.filter(function(a){
    if(!a || a.chat_id !== siteId) return false;
    var ts = Date.parse(a.created_at || a.updated_at || 0);
    return ts && ts > since;
  });
}
function _siteAllArtifacts(siteId){
  if(!siteId || typeof me === 'undefined' || !me) return [];
  return (Array.isArray(me.artifacts) ? me.artifacts : [])
    .filter(function(a){ return a && a.chat_id === siteId; })
    .sort(function(a,b){ return Date.parse(b.created_at||0) - Date.parse(a.created_at||0); });
}

// Artifact の表示用 URL (= 旧コードは a.url のみ参照していたため、streaming
// で push された url 欠落レコードに対して click が「?v=N だけ」になって死ぬ
// 問題があった)。filename から /generated/ パスを fallback で組み立てる。
function _artUrl(a){
  if(!a) return '';
  var base = a.url || (a.filename ? '/generated/' + a.filename : '');
  if(!base) return '';
  return base + (a.version ? (base.indexOf('?') >= 0 ? '&' : '?') + 'v=' + a.version : '');
}
// 表示タイトル — title が空 or "artifact" (= 旧 _safeName 経由の壊れた値)
// なら filename をフォーマットして読める形に直す。
function _artDisplayTitle(a){
  if(!a) return '無題';
  var t = (a.title || '').trim();
  if(t && t !== 'artifact') return t;
  // filename から「artifact-<slug>-<id>.html」 → "<slug>" を抜き出して整形
  var fn = a.filename || '';
  var m = fn.match(/^artifact-(.+?)-[a-f0-9]{8,12}\.html$/);
  if(m && m[1] && m[1] !== 'artifact'){
    return m[1].replace(/-/g, ' ');
  }
  return '納品物';
}

// ──────────────────────────────────────────────────────────────────
// ── 納品物 → 部門 attribution helpers (= レポート / 数字 / メール で再利用) ──
// 各 artifact を 1 つの部門に紐づける (= 最初にマッチしたメンバーの部門)。
// 100% 正確ではないが「○○部門が今週 X 件納品」表示には十分な近似。
// 将来 attribution を厳密化したい時は artifact 作成時に dept_id を埋める。
// ──────────────────────────────────────────────────────────────────
function _artMatchesRole(art, role){
  var r = String(role||'').toLowerCase();
  var t = String(art.title || art.filename || '').toLowerCase();
  if(/seo_writer|longform|tutorial|case_study|sales_writer|blogger|opinion|listicle|howto|writer/.test(r))
    return /記事|ブログ|seo|blog|long|tutorial|how|chapter/i.test(t);
  if(/x_thread|x_reply|x_viral|x_profile|x_authority|thread/.test(r))
    return /twitter|\bx\b|thread|スレッド|tweet/i.test(t);
  if(/instagram|reels/.test(r)) return /instagram|insta|reel/i.test(t);
  if(/tiktok/.test(r)) return /tiktok|短尺|ショート/i.test(t);
  if(/pinterest/.test(r)) return /pinterest|pin/i.test(t);
  if(/youtube|video_script/.test(r)) return /youtube|video|動画/i.test(t);
  if(/linkedin/.test(r)) return /linkedin/i.test(t);
  if(/ih|indie_hackers|hn|hacker/.test(r)) return /indie|hacker.?news|hn|ih/i.test(t);
  if(/llmstxt|schema|reddit|comparison|quora|citation/.test(r))
    return /aeo|llms|schema|reddit|比較|vs |best|quora/i.test(t);
  if(/cro|cta|headline|form|onboarding|ab|lp_diag|pdp/.test(r))
    return /cro|cv|lp|cta|フォーム|ヘッドライン|onboard|a\/b/i.test(t);
  if(/email|newsletter|drip|lead_magnet|welcome|winback|post_purchase/.test(r))
    return /メール|mail|メルマガ|newsletter|drip|welcome/i.test(t);
  if(/line|sms/.test(r)) return /line|sms|公式/i.test(t);
  if(/review|gbp|google_business/.test(r)) return /レビュー|口コミ|review|gbp|プロフィール/i.test(t);
  if(/product|bundle|upsell|inventory|shopping|pmax|pdp/.test(r))
    return /商品|product|bundle|shopping|アップセル/i.test(t);
  if(/local|booking|phone/.test(r)) return /地域|local|予約|booking|電話/i.test(t);
  if(/influencer|affiliate|ugc/.test(r)) return /influencer|affiliate|ugc|アフィリ/i.test(t);
  if(/competitor|swot|pricing|trend|persona|demand/.test(r))
    return /競合|swot|trend|persona|需要|分析/i.test(t);
  if(/ga4|search_console|analyst|anomaly|funnel|cohort|attribution/.test(r))
    return /分析|レポート|ga4|funnel|cohort|kpi|診断/i.test(t);
  if(/infographic|visual|image/.test(r)) return /infographic|図|画像|image/i.test(t);
  if(/dm_script|cold_email|proposal|outreach/.test(r)) return /dm|営業|提案|outreach|cold/i.test(t);
  if(/pm|operator|editor|proofreader|researcher/.test(r)) return /pm|operator|edit|校正|research/i.test(t);
  return false;
}

// 1 つの artifact を最初にマッチした部門 / チーム / メンバーに帰属させる
function _attributeArt(art, org){
  if(!art || !org || !org.departments) return null;
  for(var i = 0; i < org.departments.length; i++){
    var d = org.departments[i];
    for(var j = 0; j < (d.teams||[]).length; j++){
      var t = d.teams[j];
      for(var k = 0; k < (t.members||[]).length; k++){
        var m = t.members[k];
        if(_artMatchesRole(art, m.role)){
          return { dept: d, team: t, member: m };
        }
      }
    }
  }
  return null;
}

// 部門別の貢献度集計 — return: [{ dept, total, week, top_member_name }]
function _orgContributionBreakdown(site){
  if(!site || !site.org || !site.org.departments) return [];
  var arts = _siteAllArtifacts(site.id);
  var since = Date.now() - 7 * 86400000;
  var result = site.org.departments.map(function(d){
    return { dept: d, total: 0, week: 0, top_member: null, member_counts: {} };
  });
  arts.forEach(function(a){
    var attr = _attributeArt(a, site.org);
    if(!attr) return;
    var rec = result.find(function(r){ return r.dept.id === attr.dept.id; });
    if(!rec) return;
    rec.total++;
    var ts = Date.parse(a.created_at || 0) || 0;
    if(ts > since) rec.week++;
    var mk = attr.member.name;
    rec.member_counts[mk] = (rec.member_counts[mk] || 0) + 1;
  });
  // top_member を抽出
  result.forEach(function(r){
    var best = null, bestN = 0;
    for(var k in r.member_counts){
      if(r.member_counts[k] > bestN){ bestN = r.member_counts[k]; best = k; }
    }
    r.top_member = best;
  });
  return result;
}

// ── GA4 snapshot を遅延読み込み (= ダッシュボード mount 後にバックグラウンドで fetch) ──
// キャッシュは window._ga4Snapshots[siteId] = { snapshot, fetched_at, connected }
// 取得完了したら renderHomeDashboard を呼び直す (= chart 自動描画)
window._ga4Snapshots = window._ga4Snapshots || {};
function _fetchGa4Snapshot(siteId, opts){
  if(!siteId) return;
  var force = opts && opts.force;
  var existing = window._ga4Snapshots[siteId];
  // 5 分以内に取得済みならスキップ (= 何度も dashboard を re-render する時の保護)
  if(!force && existing && existing._localFetchedMs && Date.now() - existing._localFetchedMs < 5*60*1000) return;
  if(window._ga4FetchInFlight && window._ga4FetchInFlight[siteId]) return;
  window._ga4FetchInFlight = window._ga4FetchInFlight || {};
  window._ga4FetchInFlight[siteId] = true;
  var method = force ? 'POST' : 'GET';
  var path = '/api/agents/' + encodeURIComponent(siteId) + '/ga4' + (force ? '/refresh' : '');
  api(method, path)
    .then(function(r){
      window._ga4Snapshots[siteId] = {
        connected: !!(r && r.connected),
        snapshot: r && r.snapshot,
        _localFetchedMs: Date.now(),
      };
      window._ga4FetchInFlight[siteId] = false;
      try { renderHomeDashboard(); } catch(_){}
    })
    .catch(function(e){
      console.warn('[ga4-snapshot] fetch failed:', e && e.message);
      window._ga4FetchInFlight[siteId] = false;
    });
}

/* Home dashboard — サイトベースに完全リライト。
 * - サイト 0 件 → 「URL を貼って AI チームを派遣」エントリーポイント
 * - サイトあり → アクティブなサイトの集客ダッシュボード */
function renderHomeDashboard(){
  var body = document.getElementById('homeBody');
  if(!body) return;

  var owned = agents || [];
  var sites = owned.filter(_isSiteAgent);
  var nameStr = (me && (me.name || (me.email||'').split('@')[0])) || 'there';

  // ── 状態 A: サイト 0 件 (新規ユーザー or 移行が必要なユーザー) ──
  if(sites.length === 0){
    body.innerHTML = _renderHomeEmptyHTML(nameStr, owned.length);
    return;
  }

  // ── 状態 B: サイトあり ── アクティブサイトのダッシュボードを描画。
  //  「すべてのサイト」 mode (= サイドバー link クリック) でもタブ内で表示されるため
  //   常に dashboard を描画して、tab だけ切り替える。
  var activeSite = sites.find(function(s){ return s.id === activeId; }) || sites[0];
  body.innerHTML = _renderSiteDashboardHTML(activeSite);
  // GA4 snapshot を遅延 fetch (= dashboard 表示 → 数秒後に chart 描画)
  try { _fetchGa4Snapshot(activeSite.id); } catch(_){}
}

// 「すべてのサイト」 = ダッシュボード内の「📋 サイト一覧」 tab に飛ぶ shortcut。
// サイドバーの「📋 すべてのサイトを見る」 link から呼ばれる。
function goAllSitesHome(){
  window._allSitesMode = true;
  // 現在のサイトの localStorage を 'agents' に固定 (= tab 切替が永続化)
  try {
    var firstSite = (agents || []).find(_isSiteAgent);
    if(firstSite) localStorage.setItem('sd_tab_' + firstSite.id, 'agents');
  } catch(_){}
  try {
    document.getElementById('emptyWrap').style.display = '';
    document.getElementById('chatWrap').style.display = 'none';
  } catch(_){}
  try { renderHomeDashboard(); } catch(_){}
  try { renderAgList(); } catch(_){}
}

// 「全サイト grid view」 — 1 つのサイトをクリックすると _allSitesMode を解除して
// そのサイトのダッシュボードを開く。
function _renderAllSitesHTML(sites, name){
  var sorted = sites.slice().sort(_sortByLastActivity);
  var cards = sorted.map(function(s){
    var v = s.site_vertical || 'other';
    var ic = _verticalIcon(v);
    var vLabel = _verticalLabel(v);
    var hostname = _siteHostname(s);
    var allArts = _siteAllArtifacts(s.id);
    var todayN = _siteTodayArtifacts(s.id).length;
    var members = (s.team_members || []).slice(0, 5);
    var memHtml = members.map(function(m){
      var mi = (typeof _MEMBER_ICONS !== 'undefined' && _MEMBER_ICONS[m.role]) || '🤖';
      return '<span class="ass-mem" title="' + esc(m.name||'') + '">' + mi + '</span>';
    }).join('');
    var kpi = s.kpi || {};
    var kpiBits = [];
    if(kpi.pv)   kpiBits.push('PV ' + Number(kpi.pv).toLocaleString());
    if(kpi.cvr)  kpiBits.push('CVR ' + kpi.cvr + '%');
    if(kpi.leads)kpiBits.push('Leads ' + Number(kpi.leads).toLocaleString());
    var kpiText = kpiBits.length ? kpiBits.join(' ・ ') : 'KPI 未設定';
    var lastTs = _lastActivityMs(s);
    var lastRel = lastTs ? _formatRel(lastTs) : '';
    var isLive = !!(window._streamingAgents && window._streamingAgents.has(s.id))
              || (s.id === window._streamingAgentId);
    var isCurrent = (s.id === (window._dashCurrentSiteId || activeId));
    return '<div class="ass-card' + (isLive ? ' live' : '') + (isCurrent ? ' current' : '') + '" onclick="_openSiteFromAllSites(\'' + esc(s.id) + '\')">'
         +   '<div class="ass-card-h">'
         +     '<div class="ass-ic">' + ic + (isLive ? '<span class="ass-live-dot" title="作業中"></span>' : '') + '</div>'
         +     '<div class="ass-ti-wrap">'
         +       '<div class="ass-host">' + esc(hostname) + '</div>'
         +       '<div class="ass-vt">' + esc(vLabel) + '</div>'
         +     '</div>'
         +   '</div>'
         +   '<div class="ass-stats">'
         +     '<div class="ass-stat"><div class="ass-stat-v">' + allArts.length + '</div><div class="ass-stat-l">累計納品</div></div>'
         +     '<div class="ass-stat"><div class="ass-stat-v">' + todayN + '</div><div class="ass-stat-l">今日</div></div>'
         +   '</div>'
         +   '<div class="ass-kpi">🎯 ' + esc(kpiText) + '</div>'
         +   '<div class="ass-foot">'
         +     '<div class="ass-team">' + (memHtml || '<span style="opacity:.5">チームなし</span>') + '</div>'
         +     '<div class="ass-last">' + (lastRel ? '更新: ' + esc(lastRel) : '未稼働') + '</div>'
         +   '</div>'
         + '</div>';
  }).join('');

  return '<div class="all-sites">'
    + '<div class="all-sites-h">'
    +   '<div class="all-sites-tag"><span class="hm-tag-dot"></span>すべての AI チーム</div>'
    +   '<h1>' + esc(name) + ' さんの集客チーム一覧</h1>'
    +   '<p>あなたが派遣した <b>' + sorted.length + '</b> サイトの AI チーム。クリックでダッシュボードを開きます。</p>'
    + '</div>'
    + '<div class="all-sites-grid">'
    +   cards
    +   '<button class="ass-add" onclick="openAddSiteModal()">'
    +     '<div class="ass-add-ic">+</div>'
    +     '<div class="ass-add-lbl">新しいサイトを追加</div>'
    +     '<div class="ass-add-sub">URL を貼るだけ ・ 60 秒で納品</div>'
    +   '</button>'
    + '</div>'
    + '</div>';
}
// クリックで全サイトモードを抜けて、その site のダッシュボードを開く (= numbers tab に jump)。
function _openSiteFromAllSites(siteId){
  window._allSitesMode = false;
  activeId = siteId;
  // 数字 tab を初期表示にする (= サイト切替時の自然な着地点)
  try { localStorage.setItem('sd_tab_' + siteId, 'numbers'); } catch(_){}
  try { renderHomeDashboard(); } catch(_){}
  try { renderAgList(); } catch(_){}
  try { document.getElementById('emptyWrap').scrollTop = 0; } catch(_){}
}

// 「サイト 0 件」 = 「+ サイトを追加して AI チームを派遣」の入口
function _renderHomeEmptyHTML(name, totalAgents){
  // legacy agents の移行 banner — 旧 agent (非グループ・サイト未紐付け) がある場合
  var legacy = (agents || []).filter(function(a){
    return a && !a.site_url && !a.is_group && !a.team_origin;
  });
  var legacyBanner = '';
  if(legacy.length > 0){
    var items = legacy.slice(0, 5).map(function(a){
      return '<div class="hm-legacy-item">'
           +   '<div class="hm-legacy-meta">'
           +     '<div class="hm-legacy-av">' + (a.avatar || '🤖') + '</div>'
           +     '<div class="hm-legacy-nm">' + esc(a.name || 'AI') + '</div>'
           +   '</div>'
           +   '<button class="hm-legacy-go" onclick="openMigrateAgentModal(\'' + esc(a.id) + '\')">サイトに紐づける →</button>'
           + '</div>';
    }).join('');
    legacyBanner = '<div class="hm-legacy-banner">'
      + '<div class="hm-legacy-h">📦 過去の Agent (' + legacy.length + ' 体)</div>'
      + '<div class="hm-legacy-sub">サイトに紐づけて AI チームに移行できます。会話履歴・成果物はそのまま残ります。</div>'
      + '<div class="hm-legacy-list">' + items + '</div>'
      + (legacy.length > 5 ? '<div class="hm-legacy-more">他 ' + (legacy.length - 5) + ' 体はサイドバーから移行できます</div>' : '')
      + '</div>';
  }
  return '<div class="hm-empty">'
    + '<div class="hm-empty-tag"><span class="hm-tag-dot"></span>Web サイト集客 AI チーム</div>'
    + '<h1>こんにちは、' + esc(name) + ' さん 🍑</h1>'
    + '<p class="hm-empty-sub">サイトの URL を貼るだけで、AI チームが集客プランを 60 秒で納品します。</p>'
    + '<button class="hm-empty-cta" onclick="openAddSiteModal()">'
    +   '🌐 サイトを追加して AI チームを派遣 <span class="arrow">→</span>'
    + '</button>'
    + '<div class="hm-empty-vts">'
    +   '<span>🚀 SaaS</span><span>🛒 EC</span><span>🏪 店舗</span><span>✍️ ブログ</span><span>💼 ポートフォリオ</span>'
    + '</div>'
    + legacyBanner
    + '</div>';
}

// サイト 1 つの集客ダッシュボード
function _renderSiteDashboardHTML(site){
  var v = site.site_vertical || 'other';
  var icon = _verticalIcon(v);
  var label = _verticalLabel(v);
  var hostname = _siteHostname(site);
  var todayArts = _siteTodayArtifacts(site.id);
  var allArts = _siteAllArtifacts(site.id);
  var task = site.current_task;
  var stepsTotal = (task && Array.isArray(task.steps)) ? task.steps.length : 0;
  var stepsDone = (task && Array.isArray(task.steps)) ? task.steps.filter(function(s){return s.done;}).length : 0;
  var pct = stepsTotal > 0 ? Math.round(stepsDone / stepsTotal * 100) : 0;

  // Today summary
  var summary = todayArts.length > 0
    ? '今日 ' + todayArts.length + ' 件納品 ・ ' + label
    : 'チーム稼働中 ・ ' + label;

  // Team avatars
  var members = (site.team_members || []).slice(0, 5);
  var teamHTML = members.length
    ? members.map(function(m){
        return '<div class="sd-mem" title="' + esc(m.name||'') + '">'
             +   '<span class="sd-mem-ic">' + (_MEMBER_ICONS[m.role] || '🤖') + '</span>'
             +   '<span class="sd-mem-nm">' + esc(m.name||'') + '</span>'
             + '</div>';
      }).join('')
    : '<div class="sd-empty">チーム情報なし</div>';

  // Progress bar
  var progressHTML = task
    ? '<div class="sd-task-tx">' + esc(task.requested || '集客作業') + '</div>'
      + '<div class="sd-progress"><div class="sd-progress-bar" style="width:' + pct + '%"></div></div>'
      + '<div class="sd-progress-meta">' + stepsDone + ' / ' + stepsTotal + ' 完了 (' + pct + '%)</div>'
    : '<div class="sd-empty">タスクなし。「AI チームに依頼」 から始めましょう。</div>';

  // Artifacts grid
  var artsHTML = allArts.length
    ? '<div class="sd-art-grid">'
      + allArts.slice(0, 6).map(function(a){
          var dt = '';
          try { dt = new Date(a.created_at).toLocaleDateString('ja-JP', {month:'numeric',day:'numeric'}); } catch(e){}
          var openUrl = _artUrl(a);
          return '<div class="sd-art-card">'
               +   '<div class="sd-art-ti">' + esc(_artDisplayTitle(a)) + '</div>'
               +   '<div class="sd-art-meta">' + dt + (a.version ? ' ・ Ver.' + a.version : '') + '</div>'
               +   (openUrl
                     ? '<a class="sd-art-open" href="' + esc(openUrl) + '" target="_blank" rel="noopener">↗ 開く</a>'
                     : '<span class="sd-art-open" style="opacity:.5;cursor:default">準備中…</span>')
               + '</div>';
        }).join('')
      + '</div>'
    : '<div class="sd-empty">まだ納品物がありません。チームに依頼してください。</div>';

  // ── 直近の活動 (= AI が「動いてる感」を出す Activity Feed) ──
  // 過去 48 時間の主要イベントを集計:
  //   1. tool 成功 (mutating tool が走った瞬間)
  //   2. artifact 完成
  //   3. 「✅ ステップ N 完了」マーカー
  // 各イベントを {ts, kind, label, icon} の形でまとめて時系列降順 → 上 8 件。
  function _siteActivityFeed(site){
    var events = [];
    var now = Date.now();
    var SINCE = now - 48 * 60 * 60 * 1000;  // 48h
    // a) 履歴の tool_log と「ステップ完了」マーカー
    var hist = Array.isArray(site.history) ? site.history : [];
    var memberName = function(role){
      var m = (site.team_members || []).find(function(x){ return x && x.role === role; });
      return (m && m.name) || 'AI チーム';
    };
    var toolLabel = {
      'create_artifact':'新しい納品物を作成',
      'edit_artifact':'納品物を更新',
      'replace_text':'テキストを修正',
      'web_search':'Web 検索',
      'web_fetch':'サイト解析',
      'web_screenshot':'スクショ取得',
      'generate_image':'画像を生成',
      'generate_chart':'グラフを生成',
      'generate_pdf':'PDF を生成',
      'send_email':'メール下書き',
      'notify_slack':'Slack 通知',
      'ga4_query':'GA4 を分析',
      'sheets_read':'Sheets を読込',
      'sheets_write':'Sheets を更新',
    };
    var toolIcon = {
      'create_artifact':'📝','edit_artifact':'✏️','replace_text':'✏️',
      'web_search':'🔍','web_fetch':'🌐','web_screenshot':'📸',
      'generate_image':'🎨','generate_chart':'📊','generate_pdf':'📄',
      'send_email':'📧','notify_slack':'💬','ga4_query':'📊',
      'sheets_read':'📑','sheets_write':'📑',
    };
    for(var i = 0; i < hist.length; i++){
      var m = hist[i];
      if(!m) continue;
      var ts = Date.parse(m.time || m.created_at || 0) || 0;
      if(!ts || ts < SINCE) continue;
      if(Array.isArray(m.tool_log)){
        for(var k = 0; k < m.tool_log.length; k++){
          var t = m.tool_log[k];
          if(!t || t.ok === false) continue;
          var lbl = toolLabel[t.name];
          if(!lbl) continue;
          events.push({
            ts: ts,
            icon: toolIcon[t.name] || '🤖',
            label: lbl + (t.title ? ': ' + String(t.title).slice(0, 30) : ''),
            kind: 'tool',
          });
        }
      }
    }
    // b) artifact 一覧 (= 完成した納品物)
    var arts = (typeof me !== 'undefined' && me && Array.isArray(me.artifacts))
      ? me.artifacts.filter(function(a){ return a && a.chat_id === site.id; }) : [];
    for(var j = 0; j < arts.length; j++){
      var a = arts[j];
      var ats = Date.parse(a.created_at || 0) || 0;
      if(!ats || ats < SINCE) continue;
      events.push({
        ts: ats,
        icon: '✅',
        label: '納品物完成: ' + (a.title || a.filename || '無題').slice(0, 40),
        kind: 'artifact',
      });
    }
    // 時系列降順 + 重複しがちな tool / artifact をマージ
    events.sort(function(x, y){ return y.ts - x.ts; });
    return events.slice(0, 8);
  }
  // ── 今週の累計 (= weekly stats bar) + 先週比 ──
  function _siteWeeklyStats(site){
    var now = Date.now();
    var SINCE_THIS = now - 7 * 86400000;
    var SINCE_LAST = now - 14 * 86400000;
    var arts = (typeof me !== 'undefined' && me && Array.isArray(me.artifacts))
      ? me.artifacts.filter(function(a){ return a && a.chat_id === site.id; }) : [];
    var thisWeek = arts.filter(function(a){
      var ts = Date.parse(a.created_at || 0) || 0;
      return ts > SINCE_THIS;
    });
    var lastWeek = arts.filter(function(a){
      var ts = Date.parse(a.created_at || 0) || 0;
      return ts > SINCE_LAST && ts <= SINCE_THIS;
    });
    var delta = thisWeek.length - lastWeek.length;
    return { artifacts: thisWeek.length, lastWeek: lastWeek.length, delta: delta };
  }

  // ── 過去 14 日の日次納品数 (= sparkline 用) ──
  function _siteDailySeries(site){
    var arts = (typeof me !== 'undefined' && me && Array.isArray(me.artifacts))
      ? me.artifacts.filter(function(a){ return a && a.chat_id === site.id; }) : [];
    var DAYS = 14;
    var bins = new Array(DAYS).fill(0);
    var todayStart = new Date(); todayStart.setHours(0,0,0,0);
    for(var i = 0; i < arts.length; i++){
      var ts = Date.parse(arts[i].created_at || 0) || 0;
      if(!ts) continue;
      var diff = Math.floor((todayStart.getTime() - new Date(new Date(ts).setHours(0,0,0,0)).getTime()) / 86400000);
      if(diff >= 0 && diff < DAYS) bins[DAYS - 1 - diff]++;
    }
    return bins;
  }

  // ── Channel breakdown (= どの種類の納品物が多いか) ──
  function _siteChannelBreakdown(site){
    var arts = (typeof me !== 'undefined' && me && Array.isArray(me.artifacts))
      ? me.artifacts.filter(function(a){ return a && a.chat_id === site.id; }) : [];
    // title からカテゴリを推定 (ざっくり)
    var groups = {
      'コンテンツ': 0, 'SNS': 0, '分析': 0, '戦略': 0, 'メール': 0, 'その他': 0,
    };
    var GROUP_KW = [
      ['SNS', /twitter|instagram|x\\.com|linkedin|sns|reddit/i],
      ['メール', /メール|mail|newsletter|メルマガ|email/i],
      ['分析', /分析|診断|レポート|report|analysis|kpi/i],
      ['戦略', /戦略|strategy/i],
      ['コンテンツ', /記事|ブログ|blog|seo|content/i],
    ];
    for(var i = 0; i < arts.length; i++){
      var title = String(arts[i].title || arts[i].filename || '').toLowerCase();
      var matched = false;
      for(var j = 0; j < GROUP_KW.length; j++){
        if(GROUP_KW[j][1].test(title)){ groups[GROUP_KW[j][0]]++; matched = true; break; }
      }
      if(!matched) groups['その他']++;
    }
    return groups;
  }

  // ── Quick action presets (vertical 別に「今すぐ依頼できる」テンプレ) ──
  function _siteQuickActions(site){
    var v = site.site_vertical || 'other';
    var COMMON = [
      { icon: '📝', label: '今週のブログ記事を書いて', prompt: '今週投稿する SEO 記事を 1 本書いてください。キーワード選定からお願いします。' },
      { icon: '📱', label: 'SNS 投稿を 1 週間分', prompt: 'Twitter / X 用の投稿テンプレを 7 日分作ってください。曜日ごとに違うテーマで。' },
      { icon: '🔍', label: '競合を調べて', prompt: '同業の競合サイトを 3 つ調べて、彼らの強み・弱み・差別化のヒントをまとめてください。' },
      { icon: '📊', label: '今週の進捗をレポート', prompt: 'これまでに納品されたものを振り返って、今週やったこと + 来週やるべきことを箇条書きで。' },
    ];
    var PER_VERTICAL = {
      saas: [
        { icon: '🎯', label: 'LP の CVR を上げる案', prompt: 'LP の CVR を上げる A/B テスト案を 5 つ、優先度付きで提案してください。' },
        { icon: '🐦', label: 'IndieHackers で告知', prompt: 'IndieHackers / X のスタートアップコミュニティで告知する投稿を作成してください。' },
      ],
      ec: [
        { icon: '🛒', label: 'Instagram で売れる投稿', prompt: '商品を魅力的に見せて売上に繋げる Instagram 投稿を 5 案作ってください。' },
        { icon: '⭐', label: 'レビュー誘導フロー', prompt: '購入後のお客様にレビューをもらうための連絡フロー (メール・LINE) を作成してください。' },
      ],
      store: [
        { icon: '🗺', label: '地域 SEO 記事', prompt: '地域名 + 業種で検索される記事を 1 本書いてください。' },
        { icon: '💬', label: '口コミ返信のテンプレ', prompt: '良い口コミ / 微妙な口コミ / クレームの 3 パターンへの返信テンプレを作成してください。' },
      ],
      blog: [
        { icon: '✍️', label: '記事ネタを 10 本', prompt: '今書くべき記事ネタを 10 本、検索ボリューム推定付きで提案してください。' },
        { icon: '📧', label: 'メルマガ 1 本', prompt: '読者向けに送るメルマガを 1 本作成してください (Subject + Body 形式)。' },
      ],
      portfolio: [
        { icon: '💼', label: 'LinkedIn 投稿', prompt: 'LinkedIn でリードを集める投稿テンプレを 7 日分作ってください。' },
        { icon: '📧', label: '営業メールを 3 種', prompt: '新規アプローチ / フォロー / リクエスト返信、の 3 種の営業メールを作成してください。' },
      ],
      other: [],
    };
    return COMMON.concat(PER_VERTICAL[v] || []);
  }

  // ── Insights — AI による現状コメント (= ダミー or 簡易 fallback) ──
  function _siteInsights(site){
    var weekly = _siteWeeklyStats(site);
    var arts = _siteAllArtifacts(site.id);
    var insights = [];
    if(arts.length === 0){
      insights.push({ icon: '💡', text: '最初のメッセージを AI チームに送って、依頼を始めましょう。' });
    } else {
      if(weekly.delta > 0){
        insights.push({ icon: '📈', text: '今週は先週より <b>+' + weekly.delta + '</b> 件多く納品されました。順調に伸びてます。' });
      } else if(weekly.delta < 0){
        insights.push({ icon: '⚠️', text: '今週は先週より ' + Math.abs(weekly.delta) + ' 件少なめ。チャットで何か依頼してみましょう。' });
      } else if(weekly.artifacts > 0){
        insights.push({ icon: '👌', text: '今週も先週と同じく <b>' + weekly.artifacts + '</b> 件納品。安定運用中。' });
      }
      if(arts.length >= 10){
        insights.push({ icon: '🎯', text: '納品累計 <b>' + arts.length + '</b> 件。次は KPI 達成度を AI に分析させましょう。' });
      }
    }
    if(!site.kpi || (!site.kpi.pv && !site.kpi.cvr && !site.kpi.leads)){
      insights.push({ icon: '🎯', text: '<b>KPI 未設定</b> です。月間目標を入れると、AI が達成度を毎朝レポートしてくれます。' });
    }
    // GA4 未接続
    var ga4Connected = !!(me && me.integrations && me.integrations.ga4 && me.integrations.ga4.refresh_token);
    if(!ga4Connected){
      insights.push({ icon: '📊', text: '<b>GA4 未接続</b>。接続すると流入数・CVR の数字を使って深く分析できます。' });
    }
    return insights.slice(0, 4);
  }

  // ── 次のスケジュール (= 「明朝 9:00」 ──
  function _siteNextSchedule(site){
    var schedules = Array.isArray(site.schedules) ? site.schedules : [];
    var enabled = schedules.filter(function(s){ return s && s.enabled !== false; });
    if(!enabled.length) return null;
    // next_run が最も近いものを返す (= 文字列フォーマットで)
    var soonest = null;
    var soonestTs = Infinity;
    for(var i = 0; i < enabled.length; i++){
      var s = enabled[i];
      var ts = Date.parse(s.next_run || 0);
      if(ts && ts > Date.now() && ts < soonestTs){
        soonestTs = ts;
        soonest = s;
      }
    }
    if(!soonest) return null;
    // 「明朝 9:00 (毎朝レポート)」形式
    var d = new Date(soonestTs);
    var label = '';
    var dayDiff = Math.floor((d.setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
    var t = new Date(soonestTs);
    var hh = String(t.getHours()).padStart(2,'0');
    var mm = String(t.getMinutes()).padStart(2,'0');
    if(dayDiff === 0) label = '今日 ' + hh + ':' + mm;
    else if(dayDiff === 1) label = '明日 ' + hh + ':' + mm;
    else label = (dayDiff) + ' 日後 ' + hh + ':' + mm;
    return { label: label, name: soonest.label || soonest.prompt.slice(0, 40) };
  }

  // ── KPI 表示 (site.kpi に保存される目標値、未設定なら 0) ──
  var kpi = site.kpi || {};
  var kpiHTML = ''
    + '<div class="sd-kpi-row">'
    +   '<div class="sd-kpi-card">'
    +     '<div class="sd-kpi-lbl">月間 PV 目標</div>'
    +     '<div class="sd-kpi-val">' + (kpi.pv ? Number(kpi.pv).toLocaleString() : '<span class="sd-kpi-empty">—</span>') + '</div>'
    +   '</div>'
    +   '<div class="sd-kpi-card">'
    +     '<div class="sd-kpi-lbl">目標 CVR</div>'
    +     '<div class="sd-kpi-val">' + (kpi.cvr ? kpi.cvr + '<span class="sd-kpi-unit">%</span>' : '<span class="sd-kpi-empty">—</span>') + '</div>'
    +   '</div>'
    +   '<div class="sd-kpi-card">'
    +     '<div class="sd-kpi-lbl">月間リード目標</div>'
    +     '<div class="sd-kpi-val">' + (kpi.leads ? Number(kpi.leads).toLocaleString() : '<span class="sd-kpi-empty">—</span>') + '</div>'
    +   '</div>'
    +   '<button class="sd-kpi-edit" onclick="openKpiModal(\'' + esc(site.id) + '\')">'
    +     '✏️ ' + (kpi.pv || kpi.cvr || kpi.leads ? '編集' : '設定する')
    +   '</button>'
    + '</div>';

  // ── GA4 接続バナー (まだ接続してない場合) ──
  var ga4Connected = !!(me && me.integrations && me.integrations.ga4 && me.integrations.ga4.refresh_token);
  var ga4Banner = '';
  if(!ga4Connected){
    ga4Banner = '<div class="sd-ga4-banner">'
      + '<div class="sd-ga4-ic">📊</div>'
      + '<div class="sd-ga4-bd">'
      +   '<div class="sd-ga4-h">より深く分析するには Google Analytics を接続</div>'
      +   '<div class="sd-ga4-sub">流入数 / CVR / 滞在時間が AI の分析に反映されます</div>'
      + '</div>'
      + '<button class="sd-ga4-cta" onclick="openIntegrationsTab && openIntegrationsTab(\'ga4\')">接続する →</button>'
      + '</div>';
  }

  // ── アクティブ tab を localStorage で記憶 ──
  // 6 tab PDCA: report (A) / numbers (C) / strategy (P) / tasks (D) / agents / settings
  // デフォルトは 'report' (= 朝開いた瞬間に AI が報告)
  var activeTab = 'report';
  try {
    var saved = localStorage.getItem('sd_tab_' + site.id);
    if(['report','numbers','strategy','tasks','agents','connections','settings'].indexOf(saved) >= 0){
      activeTab = saved;
    } else if(saved === 'actions'){
      activeTab = 'report';
    }
  } catch(_){}
  if(window._allSitesMode) activeTab = 'agents';

  // ── ヘッダー: site identity (gradient) + back-to-chat CTA ──
  // CTA 文言を「AI チームに依頼」 → 「チャットに戻る」 に変更 (= ダッシュボードに来た
  // 後の自然な戻り口がなかった問題)。実装は openSite() = チャット画面を開く。
  return '<div class="site-dash">'
    + '<div class="sd-head sd-head-rich">'
    +   '<div class="sd-head-bg"></div>'
    +   '<div class="sd-head-l">'
    +     '<div class="sd-ic sd-ic-rich">' + icon + '</div>'
    +     '<div class="sd-head-meta">'
    +       '<div class="sd-vt-tag">' + esc(label) + '</div>'
    +       '<div class="sd-url"><a href="' + esc(site.site_url) + '" target="_blank" rel="noopener">' + esc(hostname) + ' ↗</a></div>'
    +       '<div class="sd-summary">' + esc(summary) + '</div>'
    +     '</div>'
    +   '</div>'
    +   '<button class="sd-chat-cta sd-chat-cta-rich" onclick="openSite(\'' + esc(site.id) + '\')" title="この AI チームのチャット画面に戻る">'
    +     '<span class="sd-cta-ic">💬</span>'
    +     '<span class="sd-cta-lbl">チャットに戻る</span>'
    +     '<span class="arrow">→</span>'
    +   '</button>'
    + '</div>'

    // ── Tab ナビ (6 タブ、PDCA サイクル 4 + 組織 + 設定) ──
    //   A: 毎日分析 (= 最新のレポート) — Act
    //   C: 数字一覧                    — Check
    //   P: 戦略・KPI                   — Plan
    //   D: タスク管理                  — Do
    //   + 組織図 / 設定
    + '<div class="sd-tabs sd-tabs-pdca">'
    +   '<div class="sd-tabs-grp sd-tabs-grp-pdca" data-grp-lbl="🔁 PDCAサイクル">'
    +     '<button class="sd-tab sd-tab-report' + (activeTab === 'report' ? ' on' : '') + '" onclick="_switchDashTab(\'' + esc(site.id) + '\',\'report\')">'
    +       '<span class="sd-tab-pdca">A</span>'
    +       '<span class="sd-tab-ic">🔁</span><span class="sd-tab-lbl">毎日分析</span><span class="sd-tab-sub">改善 / 報告</span>'
    +     '</button>'
    +     '<button class="sd-tab sd-tab-numbers' + (activeTab === 'numbers' ? ' on' : '') + '" onclick="_switchDashTab(\'' + esc(site.id) + '\',\'numbers\')">'
    +       '<span class="sd-tab-pdca">C</span>'
    +       '<span class="sd-tab-ic">📊</span><span class="sd-tab-lbl">数字一覧</span><span class="sd-tab-sub">数字を常に確認</span>'
    +     '</button>'
    +     '<button class="sd-tab sd-tab-strategy' + (activeTab === 'strategy' ? ' on' : '') + '" onclick="_switchDashTab(\'' + esc(site.id) + '\',\'strategy\')">'
    +       '<span class="sd-tab-pdca">P</span>'
    +       '<span class="sd-tab-ic">🎯</span><span class="sd-tab-lbl">戦略・KPI</span><span class="sd-tab-sub">計画を立てる</span>'
    +     '</button>'
    +     '<button class="sd-tab sd-tab-tasks' + (activeTab === 'tasks' ? ' on' : '') + '" onclick="_switchDashTab(\'' + esc(site.id) + '\',\'tasks\')">'
    +       '<span class="sd-tab-pdca">D</span>'
    +       '<span class="sd-tab-ic">✅</span><span class="sd-tab-lbl">タスク管理</span><span class="sd-tab-sub">部門別に実行</span>'
    +     '</button>'
    +   '</div>'
    +   '<div class="sd-tabs-grp sd-tabs-grp-other">'
    +     '<button class="sd-tab sd-tab-agents' + (activeTab === 'agents' ? ' on' : '') + '" onclick="_switchDashTab(\'' + esc(site.id) + '\',\'agents\')">'
    +       '<span class="sd-tab-ic">🏢</span><span class="sd-tab-lbl">組織図</span><span class="sd-tab-sub">AI チーム</span>'
    +     '</button>'
    +     '<button class="sd-tab sd-tab-connect' + (activeTab === 'connections' ? ' on' : '') + '" onclick="_switchDashTab(\'' + esc(site.id) + '\',\'connections\')">'
    +       '<span class="sd-tab-ic">🔌</span><span class="sd-tab-lbl">接続</span><span class="sd-tab-sub">外部サービス</span>'
    +     '</button>'
    +     '<button class="sd-tab sd-tab-settings' + (activeTab === 'settings' ? ' on' : '') + '" onclick="_switchDashTab(\'' + esc(site.id) + '\',\'settings\')">'
    +       '<span class="sd-tab-ic">⚙</span><span class="sd-tab-lbl">設定</span><span class="sd-tab-sub">共有 / 編集</span>'
    +     '</button>'
    +   '</div>'
    + '</div>'

    + '<div class="sd-tab-body">'
    + (activeTab === 'report'
        ? _renderTabReport(site, _siteActivityFeed(site), _siteNextSchedule(site),
            _siteQuickActions(site), _siteWeeklyStats(site), _siteAllArtifacts(site.id), _siteInsights(site))
        : activeTab === 'numbers'
          ? _renderTabNumbers(site, kpi, ga4Connected, kpiHTML, ga4Banner,
              _siteAllArtifacts(site.id), _siteDailySeries(site),
              _siteWeeklyStats(site), _siteChannelBreakdown(site), _siteInsights(site))
        : activeTab === 'strategy'
          ? _renderTabStrategy(site, _siteAllArtifacts(site.id))
        : activeTab === 'tasks'
          ? _renderTabTasks(site)
        : activeTab === 'agents'
          ? _renderTabAgents(site)
        : activeTab === 'connections'
          ? _renderTabConnections(site)
        : activeTab === 'settings'
          ? _renderTabSettings(site)
        : _renderTabReport(site, _siteActivityFeed(site), _siteNextSchedule(site),
            _siteQuickActions(site), _siteWeeklyStats(site), _siteAllArtifacts(site.id), _siteInsights(site)))
    + '</div>'
    + '</div>';
}

function _switchDashTab(siteId, tab){
  try { localStorage.setItem('sd_tab_' + siteId, tab); } catch(_){}
  if(tab !== 'agents') window._allSitesMode = false;
  try { renderHomeDashboard(); } catch(_){}
  try { renderAgList(); } catch(_){}
}

// 「3 分前」「2 時間前」みたいな相対時刻フォーマット (module 共有)
function _formatRel(ts){
  var diff = Math.max(0, Date.now() - ts);
  if(diff < 60000) return 'たった今';
  if(diff < 3600000) return Math.floor(diff / 60000) + ' 分前';
  if(diff < 86400000) return Math.floor(diff / 3600000) + ' 時間前';
  return Math.floor(diff / 86400000) + ' 日前';
}

/* ══════════════════════════════════════════════════════════════════
   ── ダッシュボード Tab 別 render 関数 ──
   3 つの tab に分割: 📊 数字 / 🎯 戦略 / ⚡ アクション
   プロマーケッターレベルの情報密度を目指す。
   ══════════════════════════════════════════════════════════════════ */

// ─── Tab 1: 📊 数字 (= 現状の推移) ────────────────────────────────
function _renderTabNumbers(site, kpi, ga4Connected, kpiHTML, ga4Banner, allArts, series, weekly, breakdown, insights){
  // ── 数字一覧 = ビジネスの結果 (= 納品物カウントは脚注に格下げ) ──
  // KPI 未設定 → BIG CTA で「ここで設定すると数字が出る」
  // KPI 設定済 + GA4 未接続 → 目標値だけ表示 + GA4 接続 CTA
  // KPI 設定済 + GA4 接続済 → 実測値 + 達成率 + trend chart
  // SNS / Content / EC card のために 接続状態を lazy fetch
  var _snsC = window._snsStatusCache && window._snsStatusCache[site.id];
  if(!_snsC){ setTimeout(function(){ _fetchSnsStatus(site.id); }, 100); }
  var hasKpi = !!(kpi.pv || kpi.cvr || kpi.leads);
  // GA4 snapshot (= バックグラウンド fetch 結果)
  var ga4Snap = (window._ga4Snapshots && window._ga4Snapshots[site.id]) || null;
  var ga4Data = ga4Snap && ga4Snap.snapshot;
  var hasGa4Data = !!(ga4Data && ga4Data.series && ga4Data.series.length > 0);

  // ── HERO: 主 KPI (PV) を巨大表示 ──
  var heroHTML = '';
  if(hasKpi && kpi.pv){
    // GA4 接続済 + データ取得済 → 実 PV 表示。それ以外は目標値 or プレースホルダ。
    var _heroValTx;
    var _heroFootTx;
    var _heroSubBadge = '';
    if(hasGa4Data){
      var actualPv = ga4Data.total_30d.pv;
      var goalPv = Number(kpi.pv);
      var achievedPct = Math.round(actualPv / goalPv * 100);
      var deltaPct = ga4Data.delta_pv_pct;
      _heroValTx = actualPv.toLocaleString();
      _heroFootTx = '直近 30 日の累計 PV。目標 <b>' + goalPv.toLocaleString() + ' PV/月</b> に対して <b>' + achievedPct + '%</b> 達成中。';
      if(deltaPct !== null && deltaPct !== undefined){
        var deltaCls = deltaPct > 0 ? 'sd-trend-up' : deltaPct < 0 ? 'sd-trend-down' : '';
        var deltaSign = deltaPct > 0 ? '+' : '';
        _heroSubBadge = '<div class="sd-hero-delta"><span class="' + deltaCls + '">' + deltaSign + deltaPct + '%</span> vs 先週 (直近 7 日)</div>';
      }
    } else if(ga4Connected){
      _heroValTx = '<span style="opacity:.5">読込中…</span>';
      _heroFootTx = 'GA4 接続済 — データを取得中。少し待ってください。';
    } else {
      _heroValTx = Number(kpi.pv).toLocaleString();
      _heroFootTx = '<b>GA4 を接続</b>すると、ここに実数値・先月比・月末予測がリアルタイムで表示されます。';
    }
    var _heroGa4Btn = ga4Connected
      ? ''
      : '<button class="sd-hero-cta sd-hero-cta-primary" onclick="openIntegrationsTab && openIntegrationsTab(\'ga4\')">📊 GA4 を接続 →</button>';
    heroHTML = ''
      + '<div class="sd-hero-kpi">'
      +   '<div class="sd-hero-tag"><span class="sd-rp-dot"></span>今月のメイン KPI ・ 月間 PV</div>'
      +   '<div class="sd-hero-row">'
      +     '<div class="sd-hero-main">'
      +       '<div class="sd-hero-lbl">' + (hasGa4Data ? '直近 30 日の累計 PV (実測)' : ga4Connected ? '今月の累計 PV' : '目標 PV') + '</div>'
      +       '<div class="sd-hero-val">' + _heroValTx + '<span class="sd-hero-unit">PV</span></div>'
      +       _heroSubBadge
      +       '<div class="sd-hero-foot">' + _heroFootTx + '</div>'
      +     '</div>'
      +     '<div class="sd-hero-side">'
      +       '<button class="sd-hero-cta" onclick="openKpiModal(\'' + esc(site.id) + '\')">🎯 KPI を編集</button>'
      +       _heroGa4Btn
      +     '</div>'
      +   '</div>'
      + '</div>';
  } else {
    // KPI 未設定 — 大きな「設定する」 CTA
    heroHTML = ''
      + '<div class="sd-hero-empty">'
      +   '<div class="sd-hero-empty-ic">🎯</div>'
      +   '<div class="sd-hero-empty-ti">主 KPI を設定して、結果を追いましょう</div>'
      +   '<div class="sd-hero-empty-tx">月間 PV / 問い合わせ / リード数の目標を入れると、AI チームが毎朝達成度をレポートします。</div>'
      +   '<button class="sd-hero-empty-cta" onclick="openKpiModal(\'' + esc(site.id) + '\')">'
      +     '🎯 KPI を設定する <span class="arrow">→</span>'
      +   '</button>'
      + '</div>';
  }

  // ── GA4 接続済 + データあり → 30 日 PV 推移 chart ──
  var ga4ChartHTML = '';
  if(hasGa4Data){
    var s = ga4Data.series;
    var pvMax = Math.max.apply(null, s.map(function(d){ return d.pv; })) || 1;
    var SVG_W = 720, SVG_H = 200;
    var stepX = SVG_W / Math.max(1, s.length - 1);
    var pvPoints = s.map(function(d, i){
      var x = i * stepX;
      var y = SVG_H - 20 - (d.pv / pvMax * (SVG_H - 40));
      return x + ',' + y;
    });
    var pathD = 'M ' + pvPoints.join(' L ');
    var areaD = 'M 0,' + (SVG_H - 20) + ' L ' + pvPoints.join(' L ') + ' L ' + SVG_W + ',' + (SVG_H - 20) + ' Z';
    // 最終日 dot を強調
    var lastIdx = s.length - 1;
    var lastX = lastIdx * stepX;
    var lastY = SVG_H - 20 - (s[lastIdx].pv / pvMax * (SVG_H - 40));
    var avgPvPerDay = Math.round(ga4Data.total_30d.pv / Math.max(1, s.length));
    ga4ChartHTML = ''
      + '<div class="sd-bigchart">'
      +   '<div class="sd-bigchart-h">'
      +     '<div class="sd-bigchart-ti">📈 直近 30 日の PV 推移 (GA4)</div>'
      +     '<div class="sd-bigchart-meta">日平均 ' + avgPvPerDay.toLocaleString() + ' PV</div>'
      +   '</div>'
      +   '<svg class="sd-bigchart-svg" viewBox="0 0 ' + SVG_W + ' ' + SVG_H + '" preserveAspectRatio="none">'
      +     '<defs>'
      +       '<linearGradient id="ga4Grad' + site.id.slice(-6) + '" x1="0" y1="0" x2="0" y2="1">'
      +         '<stop offset="0%" stop-color="#fb923c" stop-opacity=".4" />'
      +         '<stop offset="100%" stop-color="#fb923c" stop-opacity="0" />'
      +       '</linearGradient>'
      +     '</defs>'
      +     '<path d="' + areaD + '" fill="url(#ga4Grad' + site.id.slice(-6) + ')" />'
      +     '<path d="' + pathD + '" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />'
      +     '<circle cx="' + lastX + '" cy="' + lastY + '" r="5" fill="#ea580c" stroke="#fff" stroke-width="2" />'
      +   '</svg>'
      +   '<div class="sd-bigchart-axis">'
      +     '<span>30 日前</span><span style="flex:1"></span><span>昨日</span>'
      +   '</div>'
      + '</div>';
  }

  // ── 副 KPI 行 (CVR / リード / GA4 接続を促す placeholder) ──
  var subKpiHTML = '';
  if(hasKpi){
    subKpiHTML = ''
      + '<div class="sd-sub-row">'
      +   '<div class="sd-sub-card ' + (ga4Connected ? 'flat' : 'flat') + '">'
      +     '<div class="sd-sub-lbl"><span class="sd-sub-lbl-ic">🎯</span> 目標 CVR</div>'
      +     '<div class="sd-sub-val">' + (kpi.cvr ? kpi.cvr + '<span class="sd-sub-val-unit">%</span>' : '<span style="opacity:.4;font-size:.6em">未設定</span>') + '</div>'
      +     '<div class="sd-sub-sub">' + (ga4Connected ? '実測 — まもなく表示' : 'GA4 接続で実測値表示') + '</div>'
      +   '</div>'
      +   '<div class="sd-sub-card flat">'
      +     '<div class="sd-sub-lbl"><span class="sd-sub-lbl-ic">📧</span> 目標リード</div>'
      +     '<div class="sd-sub-val">' + (kpi.leads ? Number(kpi.leads).toLocaleString() + '<span class="sd-sub-val-unit">件</span>' : '<span style="opacity:.4;font-size:.6em">未設定</span>') + '</div>'
      +     '<div class="sd-sub-sub">' + (ga4Connected ? '実測 — まもなく表示' : '手動入力 or フォーム連携') + '</div>'
      +   '</div>'
      +   '<div class="sd-sub-card flat">'
      +     '<div class="sd-sub-lbl"><span class="sd-sub-lbl-ic">🔍</span> 検索順位</div>'
      +     '<div class="sd-sub-val"><span style="opacity:.4;font-size:.6em">— </span></div>'
      +     '<div class="sd-sub-sub">Search Console 連携で表示 (近日対応)</div>'
      +   '</div>'
      + '</div>';
  }

  // ── データ未接続のプレビュー (= 接続したら何が見られるかを説明) ──
  var previewHTML = '';
  if(!ga4Connected){
    previewHTML = ''
      + '<div class="sd-data-preview">'
      +   '<div class="sd-data-preview-h">'
      +     '<div class="sd-data-preview-ic">📊</div>'
      +     '<div>'
      +       '<div class="sd-data-preview-ti">数字を解放するには連携を</div>'
      +       '<div class="sd-data-preview-sub">下記を接続すると、ここにリアルタイム数値が出ます。AI もこの数字で判断するようになります。</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="sd-data-preview-grid">'
      +     '<div class="sd-data-item">'
      +       '<div class="sd-data-item-ic">📊</div>'
      +       '<div class="sd-data-item-bd">'
      +         '<div class="sd-data-item-ti">Google Analytics 4</div>'
      +         '<div class="sd-data-item-de">PV ・ セッション ・ 流入経路 ・ CVR ・ ユーザー属性</div>'
      +       '</div>'
      +       '<button class="sd-data-item-btn" onclick="openIntegrationsTab && openIntegrationsTab(\'ga4\')">接続 →</button>'
      +     '</div>'
      +     '<div class="sd-data-item">'
      +       '<div class="sd-data-item-ic">🔍</div>'
      +       '<div class="sd-data-item-bd">'
      +         '<div class="sd-data-item-ti">Google Search Console</div>'
      +         '<div class="sd-data-item-de">検索キーワード ・ 表示回数 ・ 平均順位 ・ クリック率</div>'
      +       '</div>'
      +       '<button class="sd-data-item-btn sd-data-item-btn-soon" disabled>近日 →</button>'
      +     '</div>'
      +     '<div class="sd-data-item">'
      +       '<div class="sd-data-item-ic">💳</div>'
      +       '<div class="sd-data-item-bd">'
      +         '<div class="sd-data-item-ti">Stripe / 決済</div>'
      +         '<div class="sd-data-item-de">売上 ・ MRR ・ 解約率 ・ LTV</div>'
      +       '</div>'
      +       '<button class="sd-data-item-btn sd-data-item-btn-soon" disabled>近日 →</button>'
      +     '</div>'
      +     '<div class="sd-data-item">'
      +       '<div class="sd-data-item-ic">📝</div>'
      +       '<div class="sd-data-item-bd">'
      +         '<div class="sd-data-item-ti">フォーム / 問い合わせ</div>'
      +         '<div class="sd-data-item-de">Typeform ・ Google Forms ・ Webflow フォーム</div>'
      +       '</div>'
      +       '<button class="sd-data-item-btn sd-data-item-btn-soon" disabled>近日 →</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── Insights バー (= AI が今読み取れた事を要約) ──
  var insightsHTML = insights.length
    ? '<div class="sd-insights">'
      + insights.map(function(it){
          return '<div class="sd-insight"><span class="sd-insight-ic">' + it.icon + '</span><span class="sd-insight-tx">' + it.text + '</span></div>';
        }).join('')
      + '</div>'
    : '';

  // ── 「AI 活動量」 footer (= 旧 hero を格下げ) ──
  // 結果じゃなくて process なので、巨大化させずに小さく出す
  var lwArts = (function(){
    var since = Date.now() - 14 * 86400000;
    var thisW = Date.now() - 7 * 86400000;
    return allArts.filter(function(a){
      var ts = Date.parse(a.created_at||0) || 0;
      return ts > since && ts <= thisW;
    }).length;
  })();
  var activityHTML = ''
    + '<div class="sd-activity-footer">'
    +   '<div class="sd-activity-h">'
    +     '<span class="sd-activity-h-ic">🤖</span>'
    +     '<span class="sd-activity-h-ti">AI チームの活動量 (参考値)</span>'
    +     '<span class="sd-activity-h-sub">これは AI がやった「量」。結果ではない。</span>'
    +   '</div>'
    +   '<div class="sd-activity-grid">'
    +     '<div class="sd-activity-stat"><div class="sd-activity-v">' + allArts.length + '</div><div class="sd-activity-l">累計納品</div></div>'
    +     '<div class="sd-activity-stat"><div class="sd-activity-v">' + weekly.artifacts + '</div><div class="sd-activity-l">今週納品</div></div>'
    +     '<div class="sd-activity-stat"><div class="sd-activity-v">' + lwArts + '</div><div class="sd-activity-l">先週納品</div></div>'
    +     '<div class="sd-activity-stat ' + (weekly.delta > 0 ? 'up' : weekly.delta < 0 ? 'down' : 'flat') + '">'
    +       '<div class="sd-activity-v">' + (weekly.delta > 0 ? '+' : '') + weekly.delta + '</div>'
    +       '<div class="sd-activity-l">先週比</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';

  // ── 部門別 ランキング (= どの部門が結果に紐づく貢献をしたか可視化) ──
  var deptRankHTML = '';
  if(site.org && site.org.departments){
    var ranking = _orgContributionBreakdown(site);
    ranking.sort(function(a, b){ return b.total - a.total; });
    var top3 = ranking.slice(0, 3);
    var grandTotal = ranking.reduce(function(s, c){ return s + c.total; }, 0);
    var rows = ranking.filter(function(c){ return c.total > 0; }).map(function(c, i){
      var pct = grandTotal > 0 ? Math.round(c.total / grandTotal * 100) : 0;
      var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
      return '<div class="sd-dept-rank" style="--ag-c:' + c.dept.color + '">'
           +   '<div class="sd-dept-rank-medal">' + medal + '</div>'
           +   '<div class="sd-dept-rank-ic">' + c.dept.icon + '</div>'
           +   '<div class="sd-dept-rank-bd">'
           +     '<div class="sd-dept-rank-nm">' + esc(c.dept.name) + '</div>'
           +     '<div class="sd-dept-rank-sub">'
           +       (c.top_member ? '🌟 ' + esc(c.top_member) + ' ・ ' : '')
           +       '今週 ' + c.week + ' 件'
           +     '</div>'
           +   '</div>'
           +   '<div class="sd-dept-rank-bar"><div class="sd-dept-rank-bar-fill" style="width:' + pct + '%"></div></div>'
           +   '<div class="sd-dept-rank-pct">' + c.total + '<span style="font-size:.55em;font-weight:700;color:var(--text3)">件</span></div>'
           + '</div>';
    }).join('');
    deptRankHTML = ''
      + '<div class="sd-dept-rank-card">'
      +   '<div class="sd-card-h">🏆 部門別の貢献度 <span class="sd-card-h-sub">累計納品で集計</span></div>'
      +   (rows
        ? '<div class="sd-dept-rank-list">' + rows + '</div>'
        : '<div class="sd-empty" style="padding:20px 0;text-align:center">まだ納品物がないため、貢献度は集計できません。</div>')
      + '</div>';
  }

  // ── モジュラー化: 各 integration が「セクション」 として並ぶ ──
  // 接続済みなら data 表示、未接続なら「接続して unlock」 CTA。
  // GA4 module は既存の chart / sub-kpi を中に内包。他は plain unlock card。
  function _moduleHeader(icon, name, connected, color, btnLabel, btnAction){
    return '<div class="nm-mod-h">'
         +   '<div class="nm-mod-ic" style="background:' + color + '20;color:' + color + '">' + icon + '</div>'
         +   '<div class="nm-mod-meta">'
         +     '<div class="nm-mod-nm">' + esc(name) + '</div>'
         +     '<div class="nm-mod-status ' + (connected ? 'on' : 'off') + '">'
         +       (connected ? '<span class="nm-mod-dot on"></span>接続済 — リアルタイム' : '<span class="nm-mod-dot"></span>未接続')
         +     '</div>'
         +   '</div>'
         +   (btnAction
             ? '<button class="nm-mod-btn' + (connected ? '' : ' primary') + '" onclick="' + btnAction + '">' + esc(btnLabel) + '</button>'
             : '<span class="nm-mod-soon">近日対応</span>')
         + '</div>';
  }

  // ── Module 1: Google Analytics 4 ──
  var ga4ModBody = hasGa4Data
    ? subKpiHTML + ga4ChartHTML
    : (ga4Connected
        ? '<div class="nm-mod-loading">📡 GA4 から数値を取得中…</div>'
        : '<div class="nm-mod-locked">'
          + '<div class="nm-mod-locked-tx">PV / セッション / ユーザー / 流入経路 / CVR / ユーザー属性 / 国別 — 接続すると毎日この場所に降ってきます。</div>'
          + '<button class="nm-mod-locked-btn" onclick="openIntegrationsTab && openIntegrationsTab(\'ga4\')">📊 接続する →</button>'
          + '</div>');
  var ga4ModuleHTML = ''
    + '<div class="nm-mod ' + (hasGa4Data ? 'nm-mod-on' : 'nm-mod-off') + '">'
    +   _moduleHeader('📊', 'Google Analytics 4', hasGa4Data, '#fb923c',
                     hasGa4Data ? '🔄 更新' : '接続 →',
                     hasGa4Data
                       ? '_fetchGa4Snapshot(\'' + esc(site.id) + '\', { force:true })'
                       : 'openIntegrationsTab && openIntegrationsTab(\'ga4\')')
    +   '<div class="nm-mod-body">' + ga4ModBody + '</div>'
    + '</div>';

  // ── Module 2: Search Console (Google OAuth で連携、 AI 経由でクエリ) ──
  var googleConnected = !!(me && me.google_oauth && me.google_oauth.refresh_token);
  var hasGscScope = googleConnected && /webmasters/.test(String((me && me.google_oauth && me.google_oauth.scope) || ''));
  var scModuleHTML = ''
    + '<div class="nm-mod ' + (hasGscScope ? 'nm-mod-on' : 'nm-mod-off') + '">'
    +   _moduleHeader('🔍', 'Google Search Console', hasGscScope, '#3b82f6',
                     hasGscScope ? '🔎 検索流入を分析' : '接続 →',
                     hasGscScope
                       ? '_promptAiGscQuery(\'' + esc(site.id) + '\')'
                       : '_switchDashTab(\'' + esc(site.id) + '\',\'connections\')')
    +   '<div class="nm-mod-body">'
    +     (hasGscScope
        ? '<div class="nm-mod-locked" style="border-style:solid; background:linear-gradient(135deg, #fff 0%, rgba(59,130,246,.04) 100%); border-color:rgba(59,130,246,.2)">'
          + '<div class="nm-mod-locked-tx">📡 GSC は接続済 (= webmasters.readonly scope)。 AI に「直近 28 日の検索クエリ TOP 10」 と聞くと gsc_query が走り、 ここに live data が出ます。</div>'
          + '<button class="nm-mod-locked-btn" onclick="_promptAiGscQuery(\'' + esc(site.id) + '\')">🔎 AI に検索流入を聞く →</button>'
          + '</div>'
        : '<div class="nm-mod-locked">'
          + '<div class="nm-mod-locked-tx">検索キーワード / 表示回数 / 平均順位 / CTR — どのクエリで何位なのか、 競合 SEO の動きも追えます。</div>'
          + '<button class="nm-mod-locked-btn" onclick="_switchDashTab(\'' + esc(site.id) + '\',\'connections\')">🔌 Google 連携 (Search Console scope 付き) →</button>'
          + '</div>')
    +   '</div>'
    + '</div>';

  // ── Module 3: Stripe (近日) ──
  var stripeModuleHTML = ''
    + '<div class="nm-mod nm-mod-off">'
    +   _moduleHeader('💳', 'Stripe', false, '#635bff', null, null)
    +   '<div class="nm-mod-body">'
    +     '<div class="nm-mod-locked">'
    +       '<div class="nm-mod-locked-tx">売上 / MRR / 解約率 / LTV / プラン別構成 — 売上 KPI が PV と並んで表示されます。</div>'
    +       '<div class="nm-mod-locked-soon">⏳ Phase 4 で対応予定</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';

  // ── Module 4: フォーム (近日) ──
  var formModuleHTML = ''
    + '<div class="nm-mod nm-mod-off">'
    +   _moduleHeader('📝', 'フォーム / 問い合わせ', false, '#22c55e', null, null)
    +   '<div class="nm-mod-body">'
    +     '<div class="nm-mod-locked">'
    +       '<div class="nm-mod-locked-tx">Typeform / Google Forms / Webflow / Tally — 問い合わせ件数とソース別の内訳を可視化。</div>'
    +       '<div class="nm-mod-locked-soon">⏳ Phase 4 で対応予定</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';

  // ── Module 5: AI 検索モニター (内蔵 — 接続不要) ──
  // = AEO 部門の主力 KPI: 「自社が AI 引用された率」
  var aeoRuns = (site.aeo_monitor && site.aeo_monitor.runs) || [];
  var aeoRuns7d = (function(){
    var since = Date.now() - 7 * 86400000;
    return aeoRuns.filter(function(r){ return Date.parse(r.ts||0) > since; });
  })();
  var aeoMentioned7d = aeoRuns7d.filter(function(r){ return r.mentioned; }).length;
  var aeoCitedRate = aeoRuns7d.length > 0 ? Math.round(aeoMentioned7d / aeoRuns7d.length * 100) : 0;
  var aeoLast = aeoRuns[0] || null;
  var aeoHasData = aeoRuns.length > 0;
  var aeoModBody = aeoHasData
    ? '<div class="nu-sub-row">'
      +   '<div class="nu-sub-card primary">'
      +     '<div class="nu-sub-lbl">📊 引用率 (直近 7 日)</div>'
      +     '<div class="nu-sub-val">' + aeoCitedRate + '<span class="nu-sub-val-unit">%</span></div>'
      +     '<div class="nu-sub-sub">' + aeoMentioned7d + ' / ' + aeoRuns7d.length + ' query で 引用</div>'
      +   '</div>'
      +   '<div class="nu-sub-card">'
      +     '<div class="nu-sub-lbl">🔍 累計 query</div>'
      +     '<div class="nu-sub-val">' + aeoRuns.length + '</div>'
      +     '<div class="nu-sub-sub">直近: ' + (aeoLast ? esc((aeoLast.platform || 'perplexity').toUpperCase()) : '—') + '</div>'
      +   '</div>'
      +   '<div class="nu-sub-card">'
      +     '<div class="nu-sub-lbl">🌐 自社引用 URL</div>'
      +     '<div class="nu-sub-val">' + aeoRuns.reduce(function(s, r){ return s + ((r.matched_urls||[]).length); }, 0) + '</div>'
      +     '<div class="nu-sub-sub">累計マッチ件数</div>'
      +   '</div>'
      + '</div>'
      + (aeoLast
          ? '<div class="nu-aeo-last">'
            +   '<div class="nu-aeo-last-h">直近の query</div>'
            +   '<div class="nu-aeo-last-q">「' + esc(aeoLast.query || '') + '」 ' + (aeoLast.mentioned ? '<span class="nu-aeo-on">✅ 引用あり</span>' : '<span class="nu-aeo-off">❌ 引用なし</span>') + '</div>'
            + '</div>'
          : '')
    : '<div class="nm-mod-locked">'
      + '<div class="nm-mod-locked-tx">AI 検索エンジン (Perplexity / ChatGPT / Gemini) で「あなたのサイトが回答に引用されるか」をチェック。 拡張は無料、 接続作業なしで使えます。</div>'
      + '<button class="nm-mod-locked-btn" onclick="_openAeoMonitorModal(\'' + esc(site.id) + '\')">🤖 1 つ目の query を試す →</button>'
      + '</div>';
  var aeoModuleHTML = ''
    + '<div class="nm-mod ' + (aeoHasData ? 'nm-mod-on' : 'nm-mod-off') + '">'
    +   _moduleHeader('🤖', 'AI 検索モニター (内蔵)', aeoHasData, '#9333ea',
                     aeoHasData ? '🔍 新規 query' : '試す →',
                     '_openAeoMonitorModal(\'' + esc(site.id) + '\')')
    +   '<div class="nm-mod-body">' + aeoModBody + '</div>'
    + '</div>';

  // ── Module 6: SNS 投稿数 (per-platform — 接続 + 投稿数) ──
  // user.sns_connections と site.sns_history を組み合わせて、 7 platform の card grid
  // hasPostTool=false の platform は接続だけ可能で、 投稿 tool は近日対応
  var snsStatus = (window._snsStatusCache && window._snsStatusCache[site.id]) || {};
  var snsHist = site.sns_history || {};
  var SNS_PLATFORMS_FOR_NUMBERS = [
    { key: 'x',         name: 'X (Twitter)', emoji: '🐦', color: '#000000', hasPostTool: true },
    { key: 'linkedin',  name: 'LinkedIn',    emoji: '💼', color: '#0a66c2', hasPostTool: true },
    { key: 'threads',   name: 'Threads',     emoji: '🧵', color: '#000000', hasPostTool: true },
    { key: 'facebook',  name: 'Facebook',    emoji: '📘', color: '#1877f2', hasPostTool: true },
    { key: 'instagram', name: 'Instagram',   emoji: '📸', color: '#e1306c', hasPostTool: true },
    { key: 'tiktok',    name: 'TikTok',      emoji: '🎵', color: '#000000', hasPostTool: true },
    { key: 'youtube',   name: 'YouTube',     emoji: '📺', color: '#ff0000', hasPostTool: true },
  ];
  function _profileHandle(profile){
    if(!profile) return '';
    return profile.handle || profile.username || profile.name
        || profile.page_name || profile.channel_name
        || profile.shop_name || profile.site_name || '';
  }
  function _profileUrl(profile){
    if(!profile) return '';
    return profile.url || profile.site_url || profile.shop_domain || profile.admin_url || '';
  }
  var snsAnyConnected = SNS_PLATFORMS_FOR_NUMBERS.some(function(p){ return snsStatus[p.key] && snsStatus[p.key].connected; });
  // 投稿数は post tool がある platform のみで集計 (= 0 が並ばないように)
  var snsTotalPosts = SNS_PLATFORMS_FOR_NUMBERS.reduce(function(s, p){
    return p.hasPostTool ? s + ((snsHist[p.key] || []).length) : s;
  }, 0);
  var snsPostsLast7d = SNS_PLATFORMS_FOR_NUMBERS.reduce(function(s, p){
    if(!p.hasPostTool) return s;
    var since = Date.now() - 7 * 86400000;
    return s + ((snsHist[p.key] || []).filter(function(h){ return Date.parse(h.ts||0) > since; }).length);
  }, 0);
  var snsCardsHTML = SNS_PLATFORMS_FOR_NUMBERS.map(function(p){
    var st = snsStatus[p.key] || { connected: false };
    var hist = snsHist[p.key] || [];
    var lastPost = hist[0];
    var lastPostAt = lastPost ? _fmtRelTime(lastPost.ts) : null;
    if(st.connected){
      var profUrl = _profileUrl(st.profile);
      var handle = _profileHandle(st.profile);
      var hasZeroPosts = p.hasPostTool && hist.length === 0;
      var statsHTML = p.hasPostTool
        ? '<div class="nu-sns-stats">'
          + '<div class="nu-sns-stat"><div class="nu-sns-stat-v">' + hist.length + '</div><div class="nu-sns-stat-l">累計投稿</div></div>'
          + '<div class="nu-sns-stat"><div class="nu-sns-stat-v">' + (lastPostAt || '—') + '</div><div class="nu-sns-stat-l">直近</div></div>'
          + '</div>'
        : '<div class="nu-sns-soon">⏳ 投稿 tool は近日対応 (接続情報は保存済)</div>';
      // 投稿 0 のユーザーへの onboarding CTA (= 「AI に最初の投稿を任せる」)
      var zeroCtaHTML = hasZeroPosts
        ? '<button class="nu-sns-zero-cta" onclick="_promptAiToPost(\'' + esc(site.id) + '\',\'' + p.key + '\',' + JSON.stringify(p.name) + ')">✨ AI に最初の投稿を任せる →</button>'
        : '';
      return '<div class="nu-sns-card on' + (hasZeroPosts ? ' nu-sns-card-zero' : '') + '" style="--nu-c:' + p.color + '">'
           +   '<div class="nu-sns-h">'
           +     '<span class="nu-sns-emoji">' + p.emoji + '</span>'
           +     '<span class="nu-sns-name">' + esc(p.name) + '</span>'
           +     '<span class="nu-sns-badge on">接続済</span>'
           +   '</div>'
           +   (handle ? '<div class="nu-sns-handle">' + esc(handle) + '</div>' : '')
           +   statsHTML
           +   zeroCtaHTML
           +   '<div class="nu-sns-actions">'
           +     (profUrl ? '<a href="' + esc(profUrl) + '" target="_blank" rel="noopener" class="nu-sns-link">プロフィール ↗</a>' : '')
           +   '</div>'
           + '</div>';
    } else {
      var lockedTx = p.hasPostTool
        ? '接続すると 投稿数 ・ 最終投稿 が表示'
        : '接続情報を保存 (投稿 tool は近日対応)';
      return '<div class="nu-sns-card off">'
           +   '<div class="nu-sns-h">'
           +     '<span class="nu-sns-emoji" style="opacity:.5">' + p.emoji + '</span>'
           +     '<span class="nu-sns-name" style="opacity:.7">' + esc(p.name) + '</span>'
           +     '<span class="nu-sns-badge off">未接続</span>'
           +   '</div>'
           +   '<div class="nu-sns-locked-tx">' + lockedTx + '</div>'
           +   '<button class="nu-sns-connect-btn" onclick="_openSnsConnectModal(\'' + p.key + '\',\'' + esc(site.id) + '\')">接続 →</button>'
           + '</div>';
    }
  }).join('');
  var snsModuleHTML = ''
    + '<div class="nm-mod ' + (snsAnyConnected ? 'nm-mod-on' : 'nm-mod-off') + '">'
    +   _moduleHeader('🐦', 'SNS 投稿アクティビティ (7 platform)', snsAnyConnected, '#ec4899',
                     '接続管理 →',
                     '_switchDashTab(\'' + esc(site.id) + '\',\'connections\')')
    +   '<div class="nm-mod-body">'
    +     (snsAnyConnected
        ? '<div class="nu-sub-row">'
          +   '<div class="nu-sub-card primary">'
          +     '<div class="nu-sub-lbl">📈 直近 7 日の投稿</div>'
          +     '<div class="nu-sub-val">' + snsPostsLast7d + '<span class="nu-sub-val-unit">件</span></div>'
          +     '<div class="nu-sub-sub">累計 ' + snsTotalPosts + ' 件 ・ 全 platform 横断</div>'
          +   '</div>'
          + '</div>'
        : '')
    +     '<div class="nu-sns-grid">' + snsCardsHTML + '</div>'
    +   '</div>'
    + '</div>';

  // ── Module 7: コンテンツ・EC (note / WordPress / Shopify / BASE) ──
  // note のみ post tool あり (publish_note)。 WP/Shopify/BASE は接続情報保存のみ。
  var CONTENT_EC_PLATFORMS = [
    { key: 'note',      name: 'note',      emoji: '📝', color: '#41c9b4', kind: 'content', hasPostTool: true  },
    { key: 'wordpress', name: 'WordPress', emoji: '🌐', color: '#21759b', kind: 'content', hasPostTool: true  },
    { key: 'shopify',   name: 'Shopify',   emoji: '🛒', color: '#7ab55c', kind: 'ec',      hasPostTool: true  },
    { key: 'base',      name: 'BASE',      emoji: '🏪', color: '#ff7e2d', kind: 'ec',      hasPostTool: false },
  ];
  var ceAnyConnected = CONTENT_EC_PLATFORMS.some(function(p){ return snsStatus[p.key] && snsStatus[p.key].connected; });
  var ceCardsHTML = CONTENT_EC_PLATFORMS.map(function(p){
    var st = snsStatus[p.key] || { connected: false };
    var hist = snsHist[p.key] || [];
    var lastPost = hist[0];
    var lastPostAt = lastPost ? _fmtRelTime(lastPost.ts) : null;
    if(st.connected){
      var profUrl = _profileUrl(st.profile);
      var handle = _profileHandle(st.profile);
      var linkLabel = p.kind === 'ec' ? 'ショップ' : (p.key === 'wordpress' ? 'サイト' : 'プロフィール');
      var unitLbl = p.kind === 'ec' ? '出品商品' : '公開記事';
      var hasZeroPosts = p.hasPostTool && hist.length === 0;
      var statsHTML = p.hasPostTool
        ? '<div class="nu-sns-stats">'
          + '<div class="nu-sns-stat"><div class="nu-sns-stat-v">' + hist.length + '</div><div class="nu-sns-stat-l">' + unitLbl + '</div></div>'
          + '<div class="nu-sns-stat"><div class="nu-sns-stat-v">' + (lastPostAt || '—') + '</div><div class="nu-sns-stat-l">直近</div></div>'
          + '</div>'
        : '<div class="nu-sns-soon">⏳ ' + (p.kind === 'ec' ? '商品出品' : '記事公開') + ' tool は近日対応 (接続情報は保存済)</div>';
      var zeroCtaLbl = p.kind === 'ec' ? 'AI に最初の商品を作らせる' : 'AI に最初の記事を書かせる';
      var zeroCtaHTML = hasZeroPosts
        ? '<button class="nu-sns-zero-cta" onclick="_promptAiToPost(\'' + esc(site.id) + '\',\'' + p.key + '\',' + JSON.stringify(p.name) + ')">✨ ' + zeroCtaLbl + ' →</button>'
        : '';
      return '<div class="nu-sns-card on' + (hasZeroPosts ? ' nu-sns-card-zero' : '') + '" style="--nu-c:' + p.color + '">'
           +   '<div class="nu-sns-h">'
           +     '<span class="nu-sns-emoji">' + p.emoji + '</span>'
           +     '<span class="nu-sns-name">' + esc(p.name) + '</span>'
           +     '<span class="nu-sns-badge on">接続済</span>'
           +   '</div>'
           +   (handle ? '<div class="nu-sns-handle">' + esc(handle) + '</div>' : '')
           +   statsHTML
           +   zeroCtaHTML
           +   '<div class="nu-sns-actions">'
           +     (profUrl ? '<a href="' + esc(profUrl) + '" target="_blank" rel="noopener" class="nu-sns-link">' + linkLabel + ' ↗</a>' : '')
           +   '</div>'
           + '</div>';
    } else {
      var lockedTx = p.hasPostTool
        ? '接続すると ' + (p.kind === 'ec' ? '出品商品数' : '公開記事数') + ' が表示'
        : '接続情報を保存 (' + (p.kind === 'ec' ? '商品出品' : '記事公開') + ' tool は近日対応)';
      return '<div class="nu-sns-card off">'
           +   '<div class="nu-sns-h">'
           +     '<span class="nu-sns-emoji" style="opacity:.5">' + p.emoji + '</span>'
           +     '<span class="nu-sns-name" style="opacity:.7">' + esc(p.name) + '</span>'
           +     '<span class="nu-sns-badge off">未接続</span>'
           +   '</div>'
           +   '<div class="nu-sns-locked-tx">' + lockedTx + '</div>'
           +   '<button class="nu-sns-connect-btn" onclick="_openSnsConnectModal(\'' + p.key + '\',\'' + esc(site.id) + '\')">接続 →</button>'
           + '</div>';
    }
  }).join('');
  var contentEcModuleHTML = ''
    + '<div class="nm-mod ' + (ceAnyConnected ? 'nm-mod-on' : 'nm-mod-off') + '">'
    +   _moduleHeader('📰', 'コンテンツ / EC (note / WP / Shopify / BASE)', ceAnyConnected, '#0ea5e9',
                     '接続管理 →',
                     '_switchDashTab(\'' + esc(site.id) + '\',\'connections\')')
    +   '<div class="nm-mod-body">'
    +     '<div class="nu-sns-grid">' + ceCardsHTML + '</div>'
    +   '</div>'
    + '</div>';

  return heroHTML
    + insightsHTML
    + ga4ModuleHTML
    + aeoModuleHTML
    + snsModuleHTML
    + contentEcModuleHTML
    + scModuleHTML
    + stripeModuleHTML
    + formModuleHTML
    + deptRankHTML
    + activityHTML;
}

// ─── Tab 2: 🎯 戦略 (= 設計図) ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
// ── Tab 3 (P): 🎯 戦略・KPI ──
// Sonnet 生成済の strategy {persona / competitors / kpi_6mo} を表示。
// 未生成なら大型「戦略を生成する」 CTA。
// 既存の戦略 artifact があれば下部に表示。
// ═══════════════════════════════════════════════════════════════════
function _renderTabStrategy(site, allArts){
  var v = site.site_vertical || 'other';
  var label = _verticalLabel(v);
  var kpi = site.kpi || {};
  var hasKpi = !!(kpi.pv || kpi.cvr || kpi.leads);
  var strategy = site.strategy || null;
  var hasStrategy = !!(strategy && (strategy.persona || (strategy.competitors && strategy.competitors.length) || (strategy.kpi_6mo && strategy.kpi_6mo.length)));

  // ── Empty state (= 戦略未生成) ──
  if(!hasStrategy){
    return ''
      + '<div class="st-empty">'
      +   '<div class="st-empty-ic">🎯</div>'
      +   '<div class="st-empty-ti">AI に「6 ヶ月戦略」を作らせる</div>'
      +   '<div class="st-empty-tx">'
      +     'AI がサイトを分析して、以下を自動で作成します:<br>'
      +     '・<b>ターゲットペルソナ</b> — 年齢層 / 痛みポイント / 購買動機<br>'
      +     '・<b>競合分析</b> — 3 社の強み・弱み・差別化ポイント<br>'
      +     '・<b>6 ヶ月 KPI シート</b> — 月別の数値目標 + マイルストーン'
      +   '</div>'
      +   (hasKpi
          ? '<button class="st-empty-cta" onclick="_generateStrategy(\'' + esc(site.id) + '\', this)">🤖 戦略を生成する <span class="arrow">→</span></button>'
          : '<div class="st-empty-warn">⚠️ まず KPI 目標を設定すると、より精度の高い戦略が立てられます</div>'
            + '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'
            + '<button class="st-empty-cta st-empty-cta-secondary" onclick="openKpiModal(\'' + esc(site.id) + '\')">🎯 KPI を先に設定</button>'
            + '<button class="st-empty-cta" onclick="_generateStrategy(\'' + esc(site.id) + '\', this)">スキップして生成</button>'
            + '</div>')
      +   '<div class="st-empty-note">生成には約 30-60 秒かかります。途中で閉じても OK です。</div>'
      + '</div>';
  }

  // ── Strategy 生成済 ──
  var generatedFmt = '';
  try { generatedFmt = new Date(strategy.generated_at).toLocaleDateString('ja-JP'); } catch(e){}

  // Header
  var headerHTML = ''
    + '<div class="st-head">'
    +   '<div class="st-head-l">'
    +     '<div class="st-head-tag"><span class="sd-rp-dot"></span>AI 生成 ・ 6 ヶ月戦略</div>'
    +     '<div class="st-head-ti">' + esc(label) + ' の戦略設計図</div>'
    +     '<div class="st-head-sub">生成: ' + esc(generatedFmt) + '</div>'
    +   '</div>'
    +   '<button class="st-head-regen" onclick="if(confirm(\'戦略を再生成しますか? (現状の数字 + KPI を反映)\'))_generateStrategy(\'' + esc(site.id) + '\',this)" title="再生成">🔄 再生成</button>'
    + '</div>';

  // 6ヶ月 KPI シート
  var kpiSheetHTML = '';
  if(strategy.kpi_6mo && strategy.kpi_6mo.length > 0){
    var rows = strategy.kpi_6mo.map(function(m, i){
      return '<div class="st-kpi-row' + (i === 0 ? ' first' : '') + (i === strategy.kpi_6mo.length - 1 ? ' last' : '') + '">'
           +   '<div class="st-kpi-m">Month <span class="st-kpi-mn">' + (m.month || (i+1)) + '</span></div>'
           +   '<div class="st-kpi-theme">' + esc(m.label || '') + '</div>'
           +   '<div class="st-kpi-vals">'
           +     '<span class="st-kpi-v"><span class="st-kpi-vl">PV</span> ' + (m.pv ? Number(m.pv).toLocaleString() : '—') + '</span>'
           +     '<span class="st-kpi-v"><span class="st-kpi-vl">Sessions</span> ' + (m.sessions ? Number(m.sessions).toLocaleString() : '—') + '</span>'
           +     '<span class="st-kpi-v"><span class="st-kpi-vl">CVR</span> ' + (m.cvr || '—') + '%</span>'
           +     '<span class="st-kpi-v"><span class="st-kpi-vl">Leads</span> ' + (m.leads || '—') + '</span>'
           +   '</div>'
           +   '<div class="st-kpi-mil">🎯 ' + esc(m.milestone || '') + '</div>'
           + '</div>';
    }).join('');
    kpiSheetHTML = ''
      + '<div class="st-card">'
      +   '<div class="st-card-h">'
      +     '<span class="st-card-ti">📊 6 ヶ月 KPI シート</span>'
      +     '<span class="st-card-sub">' + strategy.kpi_6mo.length + ' ヶ月の段階目標</span>'
      +   '</div>'
      +   '<div class="st-kpi-sheet">' + rows + '</div>'
      +   '<div class="st-card-actions">'
      +     '<button class="st-act-btn" onclick="_switchDashTab(\'' + esc(site.id) + '\',\'tasks\')" title="タスク管理 tab で具体的な実行プランを見る">✅ この目標達成の実行プランを見る →</button>'
      +     '<button class="st-act-btn st-act-secondary" onclick="_quickAskAI(\'' + esc(site.id) + '\', \'この 6 ヶ月の KPI 目標を達成するため、月別の最重要施策をもう一段詳しく解説してください。\')">💬 詳しく聞く</button>'
      +   '</div>'
      + '</div>';
  }

  // ペルソナ
  var personaHTML = '';
  if(strategy.persona){
    var p = strategy.persona;
    function _bullets(arr){
      if(!Array.isArray(arr) || !arr.length) return '<li style="opacity:.5">—</li>';
      return arr.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('');
    }
    var personaName = p.name || 'ペルソナ';
    personaHTML = ''
      + '<div class="st-card st-persona">'
      +   '<div class="st-card-h"><span class="st-card-ti">👤 ターゲットペルソナ</span></div>'
      +   '<div class="st-persona-h">'
      +     '<div class="st-persona-av">👤</div>'
      +     '<div class="st-persona-id">'
      +       '<div class="st-persona-nm">' + esc(personaName) + '</div>'
      +       '<div class="st-persona-sub">' + esc(p.age || '') + (p.age && p.occupation ? ' ・ ' : '') + esc(p.occupation || '') + '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="st-persona-grid">'
      +     '<div class="st-persona-box st-p-pain"><div class="st-persona-lbl">💢 痛みポイント</div><ul class="st-persona-list">' + _bullets(p.painpoints) + '</ul></div>'
      +     '<div class="st-persona-box st-p-mot"><div class="st-persona-lbl">💪 購買動機</div><ul class="st-persona-list">' + _bullets(p.motivations) + '</ul></div>'
      +     '<div class="st-persona-box st-p-trig"><div class="st-persona-lbl">⚡ 行動のキッカケ</div><ul class="st-persona-list">' + _bullets(p.buying_triggers) + '</ul></div>'
      +   '</div>'
      +   '<div class="st-card-actions">'
      +     '<button class="st-act-btn" onclick="_quickAskAI(\'' + esc(site.id) + '\', ' + JSON.stringify('「' + personaName + '」 のペルソナをもっと詳しく分析してください。日常の悩み、情報収集の方法、購買決定のプロセス、競合と比較した時の私たちの強みを含めて。').replace(/'/g, '&#39;') + ')">💬 もっと深く分析</button>'
      +     '<button class="st-act-btn st-act-secondary" onclick="_quickAskAI(\'' + esc(site.id) + '\', \'このペルソナに刺さるブログ記事のテーマを 5 個提案してください。\')">📝 このペルソナ向け記事案</button>'
      +   '</div>'
      + '</div>';
  }

  // 競合分析
  var competitorHTML = '';
  if(strategy.competitors && strategy.competitors.length > 0){
    var COMP_COLORS = ['#fb923c', '#3b82f6', '#a855f7', '#22c55e', '#ec4899'];
    var compCards = strategy.competitors.map(function(c, i){
      var color = COMP_COLORS[i % COMP_COLORS.length];
      var strBullets = (Array.isArray(c.strengths) ? c.strengths : []).map(function(s){ return '<li>' + esc(s) + '</li>'; }).join('');
      var wkBullets = (Array.isArray(c.weaknesses) ? c.weaknesses : []).map(function(w){ return '<li>' + esc(w) + '</li>'; }).join('');
      var compName = c.name || '?';
      var compAsk = '「' + compName + '」 について競合分析をもっと詳しく行ってください。サービス内容・価格帯・SEO 状況・SNS フォロワー数・最近の動き、そして私たちが取れる差別化アクションを 3 つ。';
      return '<div class="st-comp-card" style="--ag-c:' + color + '">'
           +   '<div class="st-comp-h">'
           +     '<div class="st-comp-nm">' + esc(compName) + '</div>'
           +     (c.url ? '<a class="st-comp-url" href="' + esc(c.url) + '" target="_blank" rel="noopener" title="サイトを開く">↗</a>' : '')
           +   '</div>'
           +   '<div class="st-comp-section"><div class="st-comp-lbl">💪 強み</div><ul class="st-comp-list st-comp-list-good">' + strBullets + '</ul></div>'
           +   '<div class="st-comp-section"><div class="st-comp-lbl">⚠️ 弱み</div><ul class="st-comp-list st-comp-list-bad">' + wkBullets + '</ul></div>'
           +   '<div class="st-comp-diff"><b>差別化:</b> ' + esc(c.differentiator || '') + '</div>'
           +   '<button class="st-comp-deep" onclick="_quickAskAI(\'' + esc(site.id) + '\', ' + JSON.stringify(compAsk).replace(/'/g, '&#39;') + ')" title="チームに深掘り調査を依頼">💬 もっと調査</button>'
           + '</div>';
    }).join('');
    competitorHTML = ''
      + '<div class="st-card">'
      +   '<div class="st-card-h"><span class="st-card-ti">🔍 競合分析</span><span class="st-card-sub">主要 ' + strategy.competitors.length + ' 社</span></div>'
      +   '<div class="st-comp-grid">' + compCards + '</div>'
      +   '<div class="st-card-actions">'
      +     '<button class="st-act-btn" onclick="_quickAskAI(\'' + esc(site.id) + '\', \'今の競合分析を踏まえて、私たちのサイトが取るべき差別化戦略を 3 つ、優先度順に提案してください。\')">💬 差別化戦略を提案</button>'
      +     '<button class="st-act-btn st-act-secondary" onclick="_quickAskAI(\'' + esc(site.id) + '\', \'他に注目すべき競合がいないか、業界を改めてリサーチしてください。\')">🔍 他の競合も探す</button>'
      +   '</div>'
      + '</div>';
  }

  // 既存の戦略 artifact (= AI チャットで作ったもの)
  var strategyArt = allArts.find(function(a){
    return a && (
      (a.title && /戦略|strategy|KPI/i.test(a.title)) ||
      (a.filename && /strategy|kpi/i.test(a.filename))
    );
  });
  var artHTML = '';
  if(strategyArt){
    var openUrl = _artUrl(strategyArt);
    artHTML = ''
      + '<div class="st-card">'
      +   '<div class="st-card-h"><span class="st-card-ti">📋 戦略 sheet (AI 生成)</span></div>'
      +   '<div class="st-art-row">'
      +     '<div class="st-art-meta">' + esc(_artDisplayTitle(strategyArt)) + '</div>'
      +     (openUrl ? '<a class="st-art-open" href="' + esc(openUrl) + '" target="_blank" rel="noopener">全文を開く →</a>' : '')
      +   '</div>'
      + '</div>';
  }

  return headerHTML + kpiSheetHTML + personaHTML + competitorHTML + artHTML;
}

// ─── Strategy 生成 action ─────────────────────────────────────
async function _generateStrategy(siteId, btnEl){
  if(!siteId) return;
  if(btnEl){ btnEl.disabled = true; btnEl.innerHTML = '🤖 生成中... (30-60s)'; }
  try {
    var r = await api('POST', '/api/agents/' + encodeURIComponent(siteId) + '/strategy/generate');
    if(r && r.ok && r.strategy){
      var site = (agents || []).find(function(a){ return a && a.id === siteId; });
      if(site) site.strategy = r.strategy;
      showToast('✅ 戦略生成完了', 'ok');
      try { renderHomeDashboard(); } catch(_){}
    } else {
      showToast((r && r.detail) || '戦略生成に失敗', 'ng');
      if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🤖 戦略を生成する <span class="arrow">→</span>'; }
    }
  } catch(e){
    showToast((e && e.message) || 'ネットワークエラー', 'ng');
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🤖 戦略を生成する <span class="arrow">→</span>'; }
  }
}

// ═══════════════════════════════════════════════════════════════════
// ─── Tab 1: 📰 最新のレポート (= 朝開いた瞬間の briefing) ───────────
// 設計: 「君は結果だけ見ればいい」を体現する 1 ページ briefing。
//   1. 今日のひと言 (AI が状況サマリを 1 文)
//   2. 今日の 1 提案 (黒背景 prominent card)
//   3. 🚨 異常アラート (= 大きな変化があったら)
//   4. 今週納品物 (写真付き list)
//   5. 今日の予定 (= 次の自動実行)
//   6. 過去 7 日のハイライト summary
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// ── Tab 1: 📰 日次グロースレポート ──
// 設計: ダークテーマの「Growth Intelligence Report」スタイル。
//   1. ヒーロー (日付 + GA4 property ID)
//   2. 昨日の KPI サマリー (PV / Users / Sessions / Bounce / Dwell)
//   3. 過去 7 日トレンド (棒グラフ + AI コメント)
//   4. 国別ユーザー Top 5 (バー + AI コメント)
//   5. ページ別パフォーマンス Top 5 (table)
//   6. 流入元分析 (channel breakdown)
//   7. 戦略インサイト (3 枚の AI 解説)
//   8. 今日の優先アクション (3 件の番号付きアクション)
//   9. AI 組織活動 (= 部門別納品サマリ、控えめに)
//   10. フッター
// ═══════════════════════════════════════════════════════════════════
function _renderTabReport(site, events, next, quickActions, weekly, allArts, insights){
  var hostname = _siteHostname(site);
  var ga4Snap = (window._ga4Snapshots && window._ga4Snapshots[site.id]) || null;
  var ga4Data = ga4Snap && ga4Snap.snapshot;
  var hasGa4Data = !!(ga4Data && ga4Data.series && ga4Data.series.length > 0);
  var ga4Connected = !!(ga4Snap && ga4Snap.connected);

  // 「m:ss」形式に整形 (= KPI 滞在時間カード + ページテーブル 共通)
  function _fmtMinSec(sec){
    if(!sec) return '—';
    var m = Math.floor(sec / 60), s = Math.floor(sec - m*60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // 日付 (今日 / 昨日 = レポート対象)
  var todayFmt = new Date().toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric', weekday:'short' });
  var yest = new Date(Date.now() - 86400000);
  var yestFmt = yest.toLocaleDateString('ja-JP', { month:'numeric', day:'numeric', weekday:'short' });

  // ── 1) ヒーロー ──
  var heroHTML = ''
    + '<div class="rp-hero">'
    +   '<div class="rp-hero-bar"></div>'
    +   '<div class="rp-hero-eye">MY AI AGENT — GROWTH INTELLIGENCE</div>'
    +   '<h1 class="rp-hero-h1">日次グロースレポート</h1>'
    +   '<div class="rp-hero-meta">'
    +     '<span class="rp-hero-date">📅 ' + esc(todayFmt) + '</span>'
    +     (ga4Connected && ga4Data && ga4Data.property_id
        ? '<span class="rp-hero-prop">GA4 | p' + esc(ga4Data.property_id) + '</span>'
        : '<span class="rp-hero-prop rp-hero-prop-off">GA4 未接続</span>')
    +   '</div>'
    + '</div>';

  // ── 2) 昨日の KPI サマリー (5 カード) ──
  var kpiHTML = '';
  if(hasGa4Data){
    var ys = ga4Data.yesterday || {};
    var db = ga4Data.day_before || {};
    // delta 計算 helper
    function _pctDelta(now, prev){
      if(!prev) return null;
      return Math.round((now - prev) / prev * 1000) / 10;
    }
    var pvDelta = _pctDelta(ys.pv, db.pv);
    var userDelta = _pctDelta(ys.users, db.users);
    var sessDelta = _pctDelta(ys.sessions, db.sessions);
    var bouncePt = (ys.bounce && db.bounce) ? Math.round((ys.bounce - db.bounce) * 1000) / 10 : null;
    var dwellDelta = (ys.dwell && db.dwell) ? Math.round(ys.dwell - db.dwell) : null;
    function _kpiCard(cls, label, value, deltaTxt, deltaCls){
      return '<div class="rp-kpi-cell ' + cls + '">'
           +   '<div class="rp-kpi-lbl">' + label + '</div>'
           +   '<div class="rp-kpi-val">' + value + '</div>'
           +   (deltaTxt ? '<div class="rp-kpi-d ' + deltaCls + '">' + deltaTxt + '</div>' : '')
           + '</div>';
    }
    kpiHTML = ''
      + '<div class="rp-card">'
      +   '<div class="rp-card-h">'
      +     '<span class="rp-card-ti">📊 昨日の KPI サマリー</span>'
      +     '<span class="rp-card-date">' + esc(yestFmt) + '</span>'
      +   '</div>'
      +   '<div class="rp-kpi-grid">'
      +     _kpiCard('c-pv',    'ページビュー', (ys.pv||0).toLocaleString(),
                    pvDelta !== null ? (pvDelta > 0 ? '▲ +' : '▼ ') + pvDelta + '%' : null,
                    pvDelta >= 0 ? 'up' : 'down')
      +     _kpiCard('c-user',  'ユーザー数',   (ys.users||0).toLocaleString(),
                    userDelta !== null ? (userDelta > 0 ? '▲ +' : '▼ ') + userDelta + '%' : null,
                    userDelta >= 0 ? 'up' : 'down')
      +     _kpiCard('c-sess',  'セッション',   (ys.sessions||0).toLocaleString(),
                    sessDelta !== null ? (sessDelta > 0 ? '▲ +' : '▼ ') + sessDelta + '%' : null,
                    sessDelta >= 0 ? 'up' : 'down')
      +     _kpiCard('c-bnc',   '直帰率',       ys.bounce ? Math.round(ys.bounce * 1000)/10 + '%' : '—',
                    bouncePt !== null ? (bouncePt > 0 ? '▲ +' : '▼ ') + bouncePt + 'pt' : null,
                    bouncePt > 0 ? 'down' : 'up')  // bounce は低い方が良いので符号反転
      +     _kpiCard('c-dwell', '平均滞在時間', _fmtMinSec(ys.dwell),
                    dwellDelta !== null ? (dwellDelta > 0 ? '▲ +' : '▼ ') + dwellDelta + 's' : null,
                    dwellDelta >= 0 ? 'up' : 'down')
      +   '</div>'
      + '</div>';
  } else {
    // GA4 未接続 — 大型 CTA
    kpiHTML = ''
      + '<div class="rp-card rp-card-cta" onclick="openIntegrationsTab && openIntegrationsTab(\'ga4\')">'
      +   '<div class="rp-cta-ic">📊</div>'
      +   '<div class="rp-cta-bd">'
      +     '<div class="rp-cta-ti">Google Analytics を接続して数字を解放</div>'
      +     '<div class="rp-cta-de">PV / セッション / 直帰率 / 滞在時間 / 国別 / ページ別 / 流入元 — 実数値を毎朝この場所に。</div>'
      +   '</div>'
      +   '<div class="rp-cta-btn">接続する →</div>'
      + '</div>';
  }

  // ── 3) 過去 7 日トレンド (棒グラフ + AI コメント) ──
  var trendHTML = '';
  if(hasGa4Data){
    var s = ga4Data.series.slice(-7);
    var maxPv = Math.max.apply(null, s.map(function(d){ return d.pv; })) || 1;
    var bars = s.map(function(d, i){
      var h = Math.round(d.pv / maxPv * 100);
      var dateLbl = '';
      if(d.date && d.date.length === 8){
        dateLbl = parseInt(d.date.slice(4,6),10) + '/' + parseInt(d.date.slice(6,8),10);
      }
      return '<div class="rp-bar-col">'
           +   '<div class="rp-bar-wrap">'
           +     '<div class="rp-bar" style="height:' + h + '%"></div>'
           +     '<div class="rp-bar-v">' + d.pv.toLocaleString() + '</div>'
           +   '</div>'
           +   '<div class="rp-bar-lbl">' + dateLbl + '</div>'
           + '</div>';
    }).join('');
    var firstPv = s[0] && s[0].pv;
    var lastPv = s[s.length-1] && s[s.length-1].pv;
    var growthPct = firstPv > 0 ? Math.round((lastPv - firstPv) / firstPv * 1000) / 10 : null;
    var trendInsight = '';
    if(growthPct !== null && growthPct > 10){
      trendInsight = '🔔 7 日間で <b>+' + growthPct + '%</b> 増加 (' + firstPv.toLocaleString() + '→' + lastPv.toLocaleString() + 'PV)、上昇トレンド継続中。';
    } else if(growthPct !== null && growthPct < -10){
      trendInsight = '⚠️ 7 日間で <b>' + growthPct + '%</b> 下降 (' + firstPv.toLocaleString() + '→' + lastPv.toLocaleString() + 'PV)、原因分析が必要。';
    } else if(growthPct !== null){
      trendInsight = '📊 7 日間は <b>横ばい</b> (' + (growthPct >= 0 ? '+' : '') + growthPct + '%)。新しい施策を投入するタイミングです。';
    }
    trendHTML = ''
      + '<div class="rp-card">'
      +   '<div class="rp-card-h">'
      +     '<span class="rp-card-ti">📈 過去 7 日間トレンド</span>'
      +     '<span class="rp-card-sub">ページビュー推移</span>'
      +   '</div>'
      +   '<div class="rp-bars">' + bars + '</div>'
      +   (trendInsight ? '<div class="rp-insight-line">' + trendInsight + '</div>' : '')
      + '</div>';
  }

  // ── 4) 国別ユーザー Top 5 ──
  var countryHTML = '';
  if(hasGa4Data && Array.isArray(ga4Data.countries) && ga4Data.countries.length > 0){
    var FLAGS = {
      'Japan':'🇯🇵', 'United States':'🇺🇸', 'Taiwan':'🇹🇼', 'Singapore':'🇸🇬', 'South Korea':'🇰🇷',
      'United Kingdom':'🇬🇧', 'Germany':'🇩🇪', 'France':'🇫🇷', 'Canada':'🇨🇦', 'Australia':'🇦🇺',
      'India':'🇮🇳', 'China':'🇨🇳', 'Hong Kong':'🇭🇰', 'Thailand':'🇹🇭', 'Indonesia':'🇮🇩',
      'Philippines':'🇵🇭', 'Vietnam':'🇻🇳', 'Malaysia':'🇲🇾', 'Brazil':'🇧🇷', 'Mexico':'🇲🇽',
    };
    var COUNTRY_JA = {
      'Japan':'日本', 'United States':'米国', 'Taiwan':'台湾', 'Singapore':'シンガポール', 'South Korea':'韓国',
      'United Kingdom':'英国', 'Germany':'ドイツ', 'France':'フランス', 'Canada':'カナダ', 'Australia':'豪州',
      'India':'インド', 'China':'中国', 'Hong Kong':'香港', 'Thailand':'タイ', 'Indonesia':'インドネシア',
      'Philippines':'フィリピン', 'Vietnam':'ベトナム', 'Malaysia':'マレーシア', 'Brazil':'ブラジル', 'Mexico':'メキシコ',
    };
    var COLORS = ['#fb923c','#a855f7','#3b82f6','#22c55e','#ec4899'];
    var totalUsers = ga4Data.country_total || 1;
    var countryMax = ga4Data.countries[0].users || 1;
    var crows = ga4Data.countries.map(function(c, i){
      var pct = Math.round(c.users / totalUsers * 1000) / 10;
      var w = Math.round(c.users / countryMax * 100);
      var flag = FLAGS[c.country] || '🌐';
      var ja = COUNTRY_JA[c.country] || c.country;
      return '<div class="rp-cn-row">'
           +   '<div class="rp-cn-flag">' + flag + ' <span class="rp-cn-nm">' + esc(ja) + '</span></div>'
           +   '<div class="rp-cn-bar-wrap"><div class="rp-cn-bar" style="width:' + w + '%;background:' + COLORS[i % 5] + '"></div></div>'
           +   '<div class="rp-cn-v">' + c.users.toLocaleString() + '</div>'
           +   '<div class="rp-cn-pct">' + pct + '%</div>'
           + '</div>';
    }).join('');
    var jaIdx = ga4Data.countries.findIndex(function(c){ return c.country === 'Japan'; });
    var enCountries = ga4Data.countries.filter(function(c){ return c.country !== 'Japan'; });
    var enPct = enCountries.reduce(function(s, c){ return s + c.users; }, 0) / totalUsers * 100;
    var countryInsight = '';
    if(jaIdx === 0 && enPct < 30){
      countryInsight = '💡 日本流入が中心 (' + Math.round((ga4Data.countries[0].users/totalUsers)*100) + '%)。英語圏への拡大余地あり。';
    } else if(enPct > 50){
      countryInsight = '🌍 海外からの流入が <b>' + Math.round(enPct) + '%</b>。英語コンテンツ強化が効きそう。';
    } else {
      countryInsight = '💡 地域別流入は分散。各市場向けの localized コンテンツを検討。';
    }
    countryHTML = ''
      + '<div class="rp-card">'
      +   '<div class="rp-card-h">'
      +     '<span class="rp-card-ti">🌐 国別ユーザー 上位 5 カ国</span>'
      +     '<span class="rp-card-sub">過去 7 日間合計</span>'
      +   '</div>'
      +   '<div class="rp-cn-list">' + crows + '</div>'
      +   '<div class="rp-insight-line">' + countryInsight + '</div>'
      + '</div>';
  }

  // ── 5) ページ別パフォーマンス Top 5 ──
  var pagesHTML = '';
  if(hasGa4Data && Array.isArray(ga4Data.pages) && ga4Data.pages.length > 0){
    var prows = ga4Data.pages.map(function(p){
      var bouncePct = p.bounce ? Math.round(p.bounce * 1000)/10 : null;
      var bounceCls = bouncePct === null ? '' : (bouncePct < 35 ? 'good' : bouncePct > 60 ? 'bad' : '');
      return '<div class="rp-pg-row">'
           +   '<div class="rp-pg-path">' + esc(p.path || '/') + '</div>'
           +   '<div class="rp-pg-pv">' + p.pv.toLocaleString() + '</div>'
           +   '<div class="rp-pg-dwell">' + _fmtMinSec(p.dwell) + '</div>'
           +   '<div class="rp-pg-bounce ' + bounceCls + '">' + (bouncePct !== null ? bouncePct + '%' : '—') + '</div>'
           + '</div>';
    }).join('');
    pagesHTML = ''
      + '<div class="rp-card">'
      +   '<div class="rp-card-h"><span class="rp-card-ti">📄 ページ別パフォーマンス 上位 5</span></div>'
      +   '<div class="rp-pg-table">'
      +     '<div class="rp-pg-head">'
      +       '<div>ページ</div><div>PV</div><div>滞在時間</div><div>直帰率</div>'
      +     '</div>'
      +     prows
      +   '</div>'
      + '</div>';
  }

  // ── 6) 流入元分析 ──
  var sourceHTML = '';
  if(hasGa4Data && Array.isArray(ga4Data.sources) && ga4Data.sources.length > 0){
    var SRC_COLORS = {
      'Direct':'#fb923c', 'Organic Search':'#22c55e',
      'Organic Social':'#a855f7', 'Referral':'#3b82f6',
      'Email':'#ec4899', 'Paid Search':'#06b6d4', 'Paid Social':'#f59e0b',
      '(Other)':'#64748b', 'Unassigned':'#64748b',
    };
    var srcMax = ga4Data.sources[0].sessions || 1;
    var srcRows = ga4Data.sources.slice(0, 6).map(function(c){
      var pct = ga4Data.source_total > 0 ? Math.round(c.sessions / ga4Data.source_total * 1000) / 10 : 0;
      var w = Math.round(c.sessions / srcMax * 100);
      var color = SRC_COLORS[c.channel] || '#94a3b8';
      return '<div class="rp-src-row">'
           +   '<div class="rp-src-dot" style="background:' + color + '"></div>'
           +   '<div class="rp-src-nm">' + esc(c.channel) + '</div>'
           +   '<div class="rp-src-v">' + c.sessions.toLocaleString() + ' sessions</div>'
           +   '<div class="rp-src-bar-wrap"><div class="rp-src-bar" style="width:' + w + '%;background:' + color + '"></div></div>'
           +   '<div class="rp-src-pct">' + pct + '%</div>'
           + '</div>';
    }).join('');
    sourceHTML = ''
      + '<div class="rp-card">'
      +   '<div class="rp-card-h"><span class="rp-card-ti">🌊 流入元分析</span></div>'
      +   '<div class="rp-src-list">' + srcRows + '</div>'
      + '</div>';
  }

  // ── 7) 戦略インサイト (3 枚) ──
  // 簡易ルールで「強み / 課題 / 機会」を抽出
  var insights3 = _buildStrategicInsights(site, ga4Data, allArts, weekly);
  var stratHTML = '';
  if(insights3.length > 0){
    stratHTML = ''
      + '<div class="rp-card">'
      +   '<div class="rp-card-h"><span class="rp-card-ti">🔥 戦略インサイト</span></div>'
      +   '<div class="rp-strat-grid">'
      +   insights3.map(function(it){
          return '<div class="rp-strat-card ' + it.cls + '">'
               +   '<div class="rp-strat-ic">' + it.icon + '</div>'
               +   '<div class="rp-strat-ti">' + esc(it.title) + '</div>'
               +   '<div class="rp-strat-tx">' + it.body + '</div>'
               + '</div>';
        }).join('')
      +   '</div>'
      + '</div>';
  }

  // ── 8) 今日の優先アクション (3 件) ──
  var top3Actions = (quickActions || []).slice(0, 3);
  var actionsHTML = '';
  if(top3Actions.length > 0){
    actionsHTML = ''
      + '<div class="rp-card">'
      +   '<div class="rp-card-h"><span class="rp-card-ti">✅ 今日の優先アクション</span></div>'
      +   '<div class="rp-act-grid">'
      +   top3Actions.map(function(a, i){
          var clsRank = ['c-1','c-2','c-3'][i] || '';
          return '<div class="rp-act-card ' + clsRank + '" onclick="_quickAskAI(\'' + esc(site.id) + '\', ' + JSON.stringify(a.prompt).replace(/'/g, '&#39;') + ')">'
               +   '<div class="rp-act-num">' + (i + 1) + '</div>'
               +   '<div class="rp-act-ti">' + a.icon + ' ' + esc(a.label) + '</div>'
               +   '<div class="rp-act-tx">' + esc(String(a.prompt).slice(0, 110)) + (a.prompt.length > 110 ? '…' : '') + '</div>'
               + '</div>';
        }).join('')
      +   '</div>'
      + '</div>';
  }

  // ── 9) AI 組織活動 (控えめに) ──
  var deptCompactHTML = '';
  if(site.org && site.org.departments){
    var contribs = _orgContributionBreakdown(site);
    contribs.sort(function(a, b){ return b.week - a.week; });
    var totalWeek = contribs.reduce(function(s, c){ return s + c.week; }, 0);
    if(totalWeek > 0){
      var topCard = contribs.slice(0, 3).map(function(c){
        return '<div class="rp-dept-mini" style="--ag-c:' + c.dept.color + '">'
             +   '<span class="rp-dept-mini-ic">' + c.dept.icon + '</span>'
             +   '<span class="rp-dept-mini-nm">' + esc(c.dept.name) + '</span>'
             +   '<span class="rp-dept-mini-n">' + c.week + ' 件</span>'
             + '</div>';
      }).join('');
      deptCompactHTML = ''
        + '<div class="rp-card">'
        +   '<div class="rp-card-h">'
        +     '<span class="rp-card-ti">🤖 AI 組織の今週活動</span>'
        +     '<span class="rp-card-sub">' + totalWeek + ' 件納品</span>'
        +   '</div>'
        +   '<div class="rp-dept-mini-row">' + topCard + '</div>'
        + '</div>';
    }
  }

  // ── 10) フッター ──
  var nowFmt = new Date().toLocaleString('ja-JP');
  var footerHTML = ''
    + '<div class="rp-footer">'
    +   '<div class="rp-footer-brand">MY AI Agent — 戦略責任者</div>'
    +   '<div class="rp-footer-meta">'
    +     (ga4Connected && ga4Data && ga4Data.property_id ? 'GA4 p' + esc(ga4Data.property_id) + ' ・ ' : '')
    +     '生成日時: ' + esc(nowFmt)
    +     (next ? ' ・ 次回レポート: ' + esc(next.label) : '')
    +   '</div>'
    +   '<div class="rp-footer-host">' + esc(hostname) + '</div>'
    + '</div>';

  // 全体を rp-report wrapper で囲む (= dark theme スコープ)
  return '<div class="rp-report">'
    + heroHTML
    + kpiHTML
    + trendHTML
    + countryHTML
    + pagesHTML
    + sourceHTML
    + stratHTML
    + actionsHTML
    + deptCompactHTML
    + footerHTML
    + '</div>';
}

// ── 戦略インサイト (3 枚) を簡易ルールで組み立てる ──
function _buildStrategicInsights(site, ga4Data, allArts, weekly){
  var out = [];
  if(ga4Data){
    // 1) トラフィック動向
    var dPct = ga4Data.delta_pv_pct;
    if(dPct !== null){
      if(dPct > 5){
        out.push({
          cls: 'c-good', icon: '📈', title: 'トラフィック拡大継続',
          body: '直近 7 日の PV は <b>+' + dPct + '%</b> (' + ga4Data.prev_7d.pv.toLocaleString() + '→' + ga4Data.last_7d.pv.toLocaleString() + 'PV) で改善中。このペースが続けば近期内に上位推移が見込めます。'
        });
      } else if(dPct < -5){
        out.push({
          cls: 'c-bad', icon: '⚠️', title: 'トラフィック低下を検知',
          body: '直近 7 日の PV は <b>' + dPct + '%</b> (' + ga4Data.prev_7d.pv.toLocaleString() + '→' + ga4Data.last_7d.pv.toLocaleString() + 'PV)。原因 (検索順位低下 / SNS停止 / 季節要因 等) を特定する必要があります。'
        });
      } else {
        out.push({
          cls: 'c-warn', icon: '📊', title: 'トラフィックは横ばい',
          body: '直近 7 日の PV は <b>' + (dPct >= 0 ? '+' : '') + dPct + '%</b> でほぼ変動なし。次の伸びを生むために新しい施策の投入が必要です。'
        });
      }
    }
    // 2) ページ別の鍵
    if(Array.isArray(ga4Data.pages) && ga4Data.pages.length > 0){
      var bestEngage = ga4Data.pages.slice().sort(function(a, b){
        // 滞在時間長く & 直帰率低い = 良
        return (b.dwell - a.dwell) + (a.bounce - b.bounce) * 60;
      })[0];
      if(bestEngage){
        out.push({
          cls: 'c-good', icon: '🎯', title: esc(bestEngage.path) + ' の高エンゲージメントが最重要シグナル',
          body: esc(bestEngage.path) + ' は滞在 ' + (function(s){var m=Math.floor(s/60),ss=Math.floor(s-m*60);return m+':'+(ss<10?'0':'')+ss;})(bestEngage.dwell) + ' / 直帰率 ' + Math.round(bestEngage.bounce*1000)/10 + '% と優秀。このページへの流入を増やす + CTA 強化で転換率の更なる向上が見込めます。'
        });
      }
    }
    // 3) 国別 / 流入元
    if(Array.isArray(ga4Data.countries) && ga4Data.countries.length > 1){
      var nonJp = ga4Data.countries.filter(function(c){ return c.country !== 'Japan'; });
      var top2 = nonJp.slice(0, 2);
      if(top2.length >= 1 && top2[0].users > 30){
        var label = top2.map(function(c){ return c.country + '(' + c.users + '人)'; }).join('・');
        out.push({
          cls: 'c-info', icon: '🌍', title: '海外拡大の好機: ' + top2.map(function(c){return c.country.slice(0,2);}).join('・') + ' ユーザーの集中',
          body: label + ' からの流入が顕著。英語コンテンツの拡充と SNS の英語版強化により、グローバルなユーザー獲得のフライホイールを回せる兆候。'
        });
      }
    }
  }
  // GA4 由来の insight が 3 枚未満の場合、activity / generic 系で埋める。
  // 各 fallback は 1 回しか push されないよう、既に存在する title を弾く。
  var fallbackPool = [];
  if(allArts && allArts.length === 0){
    fallbackPool.push({
      cls: 'c-warn', icon: '🚀', title: 'まずは最初の依頼を',
      body: 'チャットで「集客プランを作って」と話しかけると、AI チームが動き始めます。3 件ほど依頼を投入すると、結果が見え始めます。'
    });
  }
  if(weekly && weekly.delta > 0){
    fallbackPool.push({
      cls: 'c-good', icon: '🤖', title: 'AI 組織の生産性が向上',
      body: '今週は先週より <b>+' + weekly.delta + ' 件</b> 多く納品。このペースを維持できれば、月内に多角的な施策展開が完成します。'
    });
  } else if(weekly && weekly.delta < 0){
    fallbackPool.push({
      cls: 'c-warn', icon: '⚠️', title: 'AI 組織の活動が鈍化',
      body: '今週は先週より ' + Math.abs(weekly.delta) + ' 件少ない納品でした。チャットで次の依頼を投げると組織が動き出します。'
    });
  }
  if(!ga4Data){
    fallbackPool.push({
      cls: 'c-info', icon: '📊', title: 'GA4 接続で施策の効果検証',
      body: 'Google Analytics を接続すると、納品物の効果を <b>数字で検証</b> できるようになります。設定 tab から 1 クリックで接続。'
    });
  }
  fallbackPool.push({
    cls: 'c-info', icon: '💡', title: '次の伸びを生む打ち手を仕込む',
    body: 'チャットで「次の打ち手を提案して」と依頼すると、現状をふまえた具体的な施策を 3 案返します。'
  });
  fallbackPool.push({
    cls: 'c-info', icon: '🎯', title: 'KPI を見直すタイミング',
    body: '今の KPI 目標が現状と合っているか定期的に見直しましょう。「戦略・KPI」 tab で 6 ヶ月シートを生成すると、現状を踏まえた段階目標が立てられます。'
  });
  fallbackPool.push({
    cls: 'c-good', icon: '🏢', title: 'AI 組織が支援する範囲を広げる',
    body: '組織図 tab を開くと、SEO / AEO / SNS / CRO など各部門の専門家が見えます。普段使っていないメンバーに依頼すると新しい施策が出ます。'
  });
  // 既存 title と被らないものから順に push
  for(var i = 0; i < fallbackPool.length && out.length < 3; i++){
    var cand = fallbackPool[i];
    if(out.some(function(x){ return x.title === cand.title; })) continue;
    out.push(cand);
  }
  return out.slice(0, 3);
}

// ─── Tab 3: ⚡ アクション (= 今後の動き) ───────────────────────────
function _renderTabActions(site, events, next, quickActions, weekly, progressHTML, teamHTML){
  // 今日のおすすめ (= AI が提案する今日の 3 件)
  var todaysHTML = ''
    + '<div class="sd-today-card">'
    +   '<div class="sd-card-h">⭐ 今日のおすすめアクション</div>'
    +   '<div class="sd-today-list">'
    +   quickActions.slice(0, 3).map(function(q, i){
        return '<button class="sd-today-item" onclick="_quickAskAI(\'' + esc(site.id) + '\', ' + JSON.stringify(q.prompt).replace(/'/g, '&#39;') + ')">'
             +   '<div class="sd-today-rank">' + (i + 1) + '</div>'
             +   '<div class="sd-today-ic">' + q.icon + '</div>'
             +   '<div class="sd-today-bd">'
             +     '<div class="sd-today-lbl">' + esc(q.label) + '</div>'
             +     '<div class="sd-today-tx">' + esc(q.prompt.slice(0, 80)) + (q.prompt.length > 80 ? '…' : '') + '</div>'
             +   '</div>'
             +   '<div class="sd-today-arrow">→</div>'
             + '</button>';
      }).join('')
    +   '</div>'
    + '</div>';

  // その他の Quick Actions
  var moreHTML = ''
    + '<div class="sd-quick">'
    +   '<div class="sd-quick-h">⚡ その他の依頼テンプレ</div>'
    +   '<div class="sd-quick-grid">'
    +   quickActions.slice(3, 9).map(function(q){
        return '<button class="sd-quick-btn" onclick="_quickAskAI(\'' + esc(site.id) + '\', ' + JSON.stringify(q.prompt).replace(/'/g, '&#39;') + ')">'
             +   '<span class="sd-quick-ic">' + q.icon + '</span>'
             +   '<span class="sd-quick-lbl">' + esc(q.label) + '</span>'
             + '</button>';
      }).join('')
    +   '</div>'
    + '</div>';

  // 次の予定 (大きく表示)
  var nextHTML = next
    ? '<div class="sd-next-card">'
      + '<div class="sd-card-h">⏰ 次の自動実行</div>'
      + '<div class="sd-next-bd">'
      +   '<div class="sd-next-name">' + esc(next.name) + '</div>'
      +   '<div class="sd-next-when">' + esc(next.label) + '</div>'
      +   '<div class="sd-next-pulse-large"></div>'
      + '</div>'
      + '</div>'
    : '';

  // 進行中タスク + チーム
  var taskTeamHTML = ''
    + '<div class="sd-grid">'
    +   '<div class="sd-card sd-card-progress">'
    +     '<div class="sd-card-h">📋 進行中のタスク</div>'
    +     '<div class="sd-card-bd">' + progressHTML + '</div>'
    +   '</div>'
    +   '<div class="sd-card sd-card-team">'
    +     '<div class="sd-card-h">👥 AI チーム</div>'
    +     '<div class="sd-card-bd"><div class="sd-team-list">' + teamHTML + '</div></div>'
    +   '</div>'
    + '</div>';

  // Activity feed
  var feedHTML = events.length
    ? '<div class="sd-feed-list">'
      + events.map(function(e){
          return '<div class="sd-feed-item">'
               +   '<div class="sd-feed-ic">' + e.icon + '</div>'
               +   '<div class="sd-feed-bd">'
               +     '<div class="sd-feed-lbl">' + esc(e.label) + '</div>'
               +     '<div class="sd-feed-ts">' + esc(_formatRel(e.ts)) + '</div>'
               +   '</div>'
               + '</div>';
        }).join('')
      + '</div>'
    : '<div class="sd-feed-empty">まだアクティビティがありません。チャットで依頼すると AI が動きます。</div>';

  var activityHTML = ''
    + '<div class="sd-progress-panel">'
    +   '<div class="sd-progress-h">'
    +     '<div class="sd-progress-h-l">'
    +       '<span class="sd-progress-h-ic">⚡</span>'
    +       '<span class="sd-progress-h-tx">直近のアクティビティ</span>'
    +     '</div>'
    +     '<div class="sd-progress-h-r">'
    +       '<span class="sd-weekly">今週 <b>' + weekly.artifacts + '</b> 件</span>'
    +     '</div>'
    +   '</div>'
    +   feedHTML
    + '</div>';

  return todaysHTML + nextHTML + taskTeamHTML + moreHTML + activityHTML;
}

// ─── Tab 4: 🤖 Agent一覧 (= このサイトの AI チームメンバー) ─────────
// 各サイトは複数の AI エージェント (アナリスト / SEO ライター / コミュニティ
// 担当 / CRO / Email マーケター…) を雇っている。そのメンバー一覧を rich card
// で表示する。役割 / 専門領域 / 担当した納品物の数 / 直近の貢献を見せる。
// ═══════════════════════════════════════════════════════════════════
// ── Tab 4 (D): ✅ タスク管理 ──
// 6ヶ月の実行ロードマップを Week 単位で表示。各 Week 内に部門ごとに
// 細かいタスクが並ぶ。AI 生成タスク + ユーザー追加タスクの両方を扱う。
// チェック / 削除 / 手動追加 すべて inline で OK。
// ═══════════════════════════════════════════════════════════════════
function _renderTabTasks(site){
  var roadmap = site.roadmap || null;
  var hasRoadmap = !!(roadmap && Array.isArray(roadmap.weeks) && roadmap.weeks.length > 0);

  // 部門 id → { name, icon, color } のマップ (= タスクに付ける dept tag 用)
  var deptMap = {};
  if(site.org && Array.isArray(site.org.departments)){
    site.org.departments.forEach(function(d){
      deptMap[d.id] = { name: d.name, icon: d.icon, color: d.color };
    });
  }

  // ── Empty state (= ロードマップ未生成) ──
  if(!hasRoadmap){
    var hasKpi = !!(site.kpi && (site.kpi.pv || site.kpi.cvr || site.kpi.leads));
    return ''
      + '<div class="tk-empty">'
      +   '<div class="tk-empty-ic">✅</div>'
      +   '<div class="tk-empty-ti">12 週間の実行ロードマップを AI に作らせる</div>'
      +   '<div class="tk-empty-tx">KPI と組織情報から、各部門が <b>毎週やるべきこと</b> を AI が具体的にリストアップします。<br>'
      +     'AI 生成タスク (60-80 件) + 自分で追加するタスクを混ぜて管理できます。</div>'
      +   (hasKpi
          ? '<button class="tk-empty-cta" onclick="_generateRoadmap(\'' + esc(site.id) + '\', this)">🤖 ロードマップを生成する <span class="arrow">→</span></button>'
          : '<div class="tk-empty-warn">⚠️ まず「戦略・KPI」 tab で KPI を設定してください</div>'
            + '<button class="tk-empty-cta" onclick="_switchDashTab(\'' + esc(site.id) + '\',\'strategy\')">🎯 戦略・KPI へ移動 <span class="arrow">→</span></button>')
      +   '<div class="tk-empty-note">生成には約 30-60 秒かかります。途中で閉じても OK です。</div>'
      + '</div>';
  }

  // ── 進捗統計 ──
  var allWeekTasks = [];
  roadmap.weeks.forEach(function(w){
    (w.tasks || []).forEach(function(t){
      allWeekTasks.push({ task: t, week: w.n });
    });
  });
  var customTasks = Array.isArray(roadmap.custom_tasks) ? roadmap.custom_tasks : [];
  var totalTasks = allWeekTasks.length + customTasks.length;
  var doneTasks = allWeekTasks.filter(function(x){ return x.task.done; }).length
                + customTasks.filter(function(t){ return t.done; }).length;
  var progressPct = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;

  // 現在週を推定 (= 生成日から経過した週数 + 1)
  var currentWeek = 1;
  if(roadmap.generated_at){
    var elapsed = Date.now() - Date.parse(roadmap.generated_at);
    var weeksElapsed = Math.floor(elapsed / (7 * 86400000));
    currentWeek = Math.min(12, Math.max(1, weeksElapsed + 1));
  }

  // ── ヘッダー (= 進捗バー + 再生成 button) ──
  var generatedFmt = '';
  try { generatedFmt = new Date(roadmap.generated_at).toLocaleDateString('ja-JP'); } catch(e){}
  var headerHTML = ''
    + '<div class="tk-head">'
    +   '<div class="tk-head-l">'
    +     '<div class="tk-head-tag"><span class="sd-rp-dot"></span>12 週間の実行ロードマップ</div>'
    +     '<div class="tk-head-ti">' + doneTasks + ' / ' + totalTasks + ' タスク完了 <span class="tk-head-pct">' + progressPct + '%</span></div>'
    +     '<div class="tk-head-sub">生成: ' + esc(generatedFmt) + ' ・ 今週: <b>Week ' + currentWeek + '</b></div>'
    +   '</div>'
    +   '<button class="tk-head-regen" onclick="if(confirm(\'既存タスクを上書きして再生成しますか? (手動追加タスクは保持されます)\'))_generateRoadmap(\'' + esc(site.id) + '\',this)" title="再生成 (既存 AI タスクは上書き、手動タスクは残る)">🔄 再生成</button>'
    + '</div>'
    + '<div class="tk-prog"><div class="tk-prog-fill" style="width:' + progressPct + '%"></div></div>';

  // ── Week 別 accordion ──
  function _renderTaskRow(t, weekNum){
    var dept = deptMap[t.dept_id];
    var deptTag = dept
      ? '<span class="tk-task-dept" style="--ag-c:' + dept.color + '">' + dept.icon + ' ' + esc(dept.name) + '</span>'
      : '';
    var ownerTag = t.owner ? '<span class="tk-task-owner">👤 ' + esc(t.owner) + '</span>' : '';
    var customBadge = !t.ai ? '<span class="tk-task-custom">+ 手動追加</span>' : '';
    return '<div class="tk-task' + (t.done ? ' done' : '') + '" data-task-id="' + esc(t.id) + '">'
         +   '<input type="checkbox" class="tk-task-cb" ' + (t.done ? 'checked' : '') + ' onchange="_toggleTask(\'' + esc(site.id) + '\',\'' + esc(t.id) + '\',this.checked)" />'
         +   '<div class="tk-task-bd">'
         +     '<div class="tk-task-tx">' + esc(t.text) + '</div>'
         +     '<div class="tk-task-meta">' + deptTag + ownerTag + customBadge + '</div>'
         +   '</div>'
         +   '<button class="tk-task-del" onclick="_deleteTask(\'' + esc(site.id) + '\',\'' + esc(t.id) + '\')" title="削除">×</button>'
         + '</div>';
  }

  var weeksHTML = roadmap.weeks.map(function(w){
    var weekCustom = customTasks.filter(function(t){ return (t.due_week || 1) === w.n; });
    var allInWeek = (w.tasks || []).concat(weekCustom);
    var doneInWeek = allInWeek.filter(function(t){ return t.done; }).length;
    var totalInWeek = allInWeek.length;
    var weekPct = totalInWeek > 0 ? Math.round(doneInWeek / totalInWeek * 100) : 0;
    var isCurrent = w.n === currentWeek;
    var isPast = w.n < currentWeek;
    var weekCls = isCurrent ? 'current' : (isPast ? 'past' : 'future');
    var expanded = isCurrent || (w.n >= currentWeek - 1 && w.n <= currentWeek + 1);

    var taskRows = (w.tasks || []).map(function(t){ return _renderTaskRow(t, w.n); }).join('')
                 + weekCustom.map(function(t){ return _renderTaskRow(t, w.n); }).join('');
    var addBtn = '<button class="tk-week-add" onclick="_addCustomTask(\'' + esc(site.id) + '\',' + w.n + ',this)">+ Week ' + w.n + ' にタスク追加</button>';

    return '<details class="tk-week ' + weekCls + '"' + (expanded ? ' open' : '') + '>'
         +   '<summary class="tk-week-h">'
         +     '<span class="tk-week-n">Week ' + w.n + '</span>'
         +     '<span class="tk-week-theme">' + esc(w.theme || '') + '</span>'
         +     '<span class="tk-week-stat">' + doneInWeek + '/' + totalInWeek + '</span>'
         +     '<span class="tk-week-bar"><span class="tk-week-bar-fill" style="width:' + weekPct + '%"></span></span>'
         +     '<span class="tk-week-pct">' + weekPct + '%</span>'
         +     (isCurrent ? '<span class="tk-week-now">今週</span>' : '')
         +   '</summary>'
         +   '<div class="tk-week-body">'
         +     '<div class="tk-tasks">' + taskRows + '</div>'
         +     addBtn
         +   '</div>'
         + '</details>';
  }).join('');

  return headerHTML
    + '<div class="tk-weeks">' + weeksHTML + '</div>';
}

// ─── Roadmap actions (frontend) ───────────────────────────────────
async function _generateRoadmap(siteId, btnEl){
  if(!siteId) return;
  if(btnEl){ btnEl.disabled = true; btnEl.innerHTML = '🤖 生成中... (30-60s)'; }
  try {
    var r = await api('POST', '/api/agents/' + encodeURIComponent(siteId) + '/roadmap/generate');
    if(r && r.ok && r.roadmap){
      // local state を更新
      var site = (agents || []).find(function(a){ return a && a.id === siteId; });
      if(site) site.roadmap = r.roadmap;
      showToast('✅ ロードマップ生成完了', 'ok');
      try { renderHomeDashboard(); } catch(_){}
    } else {
      showToast((r && r.detail) || 'ロードマップ生成に失敗', 'ng');
      if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🤖 ロードマップを生成する <span class="arrow">→</span>'; }
    }
  } catch(e){
    showToast((e && e.message) || 'ネットワークエラー', 'ng');
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🤖 ロードマップを生成する <span class="arrow">→</span>'; }
  }
}

async function _toggleTask(siteId, taskId, checked){
  try {
    await api('PATCH', '/api/agents/' + encodeURIComponent(siteId) + '/roadmap/tasks/' + encodeURIComponent(taskId),
      { done: !!checked });
    // local state を最小更新 (= rerender なしで完了マーク反映)
    var site = (agents || []).find(function(a){ return a && a.id === siteId; });
    if(!site || !site.roadmap) return;
    var found = null;
    for(var i = 0; i < (site.roadmap.weeks || []).length; i++){
      var w = site.roadmap.weeks[i];
      var t = (w.tasks || []).find(function(x){ return x.id === taskId; });
      if(t){ found = t; break; }
    }
    if(!found){
      var ct = (site.roadmap.custom_tasks || []).find(function(x){ return x.id === taskId; });
      if(ct) found = ct;
    }
    if(found){ found.done = checked; }
    // 進捗バー更新のため再描画
    try { renderHomeDashboard(); } catch(_){}
  } catch(e){
    showToast('更新に失敗', 'ng');
  }
}

async function _deleteTask(siteId, taskId){
  if(!confirm('このタスクを削除しますか?')) return;
  try {
    await api('DELETE', '/api/agents/' + encodeURIComponent(siteId) + '/roadmap/tasks/' + encodeURIComponent(taskId));
    var site = (agents || []).find(function(a){ return a && a.id === siteId; });
    if(site && site.roadmap){
      (site.roadmap.weeks || []).forEach(function(w){
        w.tasks = (w.tasks || []).filter(function(t){ return t.id !== taskId; });
      });
      site.roadmap.custom_tasks = (site.roadmap.custom_tasks || []).filter(function(t){ return t.id !== taskId; });
    }
    try { renderHomeDashboard(); } catch(_){}
  } catch(e){
    showToast('削除に失敗', 'ng');
  }
}

async function _addCustomTask(siteId, weekNum, btnEl){
  var text = prompt('Week ' + weekNum + ' に追加するタスクを入力:');
  if(!text || !text.trim()) return;
  if(btnEl){ btnEl.disabled = true; btnEl.textContent = '追加中…'; }
  try {
    var r = await api('POST', '/api/agents/' + encodeURIComponent(siteId) + '/roadmap/tasks',
      { text: text.trim(), week: weekNum });
    if(r && r.ok && r.task){
      var site = (agents || []).find(function(a){ return a && a.id === siteId; });
      if(site){
        site.roadmap = site.roadmap || { weeks: [], custom_tasks: [] };
        site.roadmap.custom_tasks = site.roadmap.custom_tasks || [];
        site.roadmap.custom_tasks.push(r.task);
      }
      showToast('✓ タスク追加', 'ok');
      try { renderHomeDashboard(); } catch(_){}
    }
  } catch(e){
    showToast('追加に失敗', 'ng');
    if(btnEl){ btnEl.disabled = false; btnEl.textContent = '+ Week ' + weekNum + ' にタスク追加'; }
  }
}

function _renderTabAgents(site){
  var allArts = _siteAllArtifacts(site.id);

  // ── ORG 構造 (新) を優先。なければ team_members (旧) で fallback。 ──
  var org = site.org && Array.isArray(site.org.departments) ? site.org : null;
  if(!org){
    // 旧 site (org 未付与) — 簡易フォールバック
    var legacyMembers = Array.isArray(site.team_members) ? site.team_members : [];
    if(legacyMembers.length === 0){
      return '<div class="sd-agents-empty">'
        + '<div class="sd-agents-empty-ic">🤖</div>'
        + '<div class="sd-agents-empty-ti">組織が未編成です</div>'
        + '<div class="sd-agents-empty-tx">サーバー起動後しばらく待つと自動で組織が編成されます。</div>'
        + '</div>';
    }
    org = { departments: [{
      id: 'd_legacy', name: 'AI チーム', icon: '🤖', color: '#fb923c',
      teams: [{ id: 't_legacy', name: 'メンバー', members: legacyMembers.map(function(m, i){
        return { id: 'm_legacy_' + i, name: m.name, role: m.role, focus: m.focus };
      })}]
    }]};
  }

  // メンバー総数
  var totalMembers = 0;
  org.departments.forEach(function(d){
    (d.teams || []).forEach(function(t){ totalMembers += (t.members || []).length; });
  });

  // 各メンバーの納品貢献数 (= 簡易キーワードマッチ)
  function _memberArtCount(role){
    var kw = String(role || '').toLowerCase();
    return allArts.filter(function(a){
      var t = String(a.title || a.filename || '').toLowerCase();
      // role キーワード → 検索パターンの簡易対応
      if(/seo_writer|longform|tutorial|case_study|writer|blogger|opinion|listicle|product_writer|pdp_copy/.test(kw))
        return /記事|ブログ|seo|blog|長文|chapter/i.test(t);
      if(/x_thread|x_reply|thread/.test(kw)) return /twitter|x|thread|スレッド/i.test(t);
      if(/instagram|reels/.test(kw)) return /instagram|insta|reel/i.test(t);
      if(/linkedin/.test(kw)) return /linkedin/i.test(t);
      if(/cro|cta|headline|form|onboarding|ab/.test(kw)) return /cro|cv|lp|cta|フォーム|ヘッドライン/i.test(t);
      if(/email|newsletter|drip|lead_magnet|welcome|winback/.test(kw)) return /メール|mail|メルマガ|newsletter|drip/i.test(t);
      if(/competitor|swot|pricing|trend|persona|demand/.test(kw)) return /競合|分析|診断|trend|persona/i.test(t);
      if(/analyst|ga4|search_console|funnel|cohort|anomaly|attribution/.test(kw)) return /分析|レポート|ga4|funnel|cohort/i.test(t);
      if(/review|gbp/.test(kw)) return /レビュー|口コミ|review|gbp/i.test(t);
      if(/llmstxt|schema|reddit|comparison|quora|citation/.test(kw)) return /aeo|llms|schema|reddit|比較|quora/i.test(t);
      return false;
    }).length;
  }

  // 役割別 emoji の簡易マッピング (= TEAM_PRESETS が動的なので大まかに)
  var ROLE_ICON_KW = [
    [/keyword|kw_strategist/, '🔑'],
    [/seo_writer|longform|tutorial|case_study|writer|blogger|opinion|listicle|howto/, '✍️'],
    [/tech_seo|internal_link|eeat|schema|llms_txt/, '🛠'],
    [/aeo|reddit|comparison|quora|citation/, '🤖'],
    [/x_thread|x_reply|x_viral|x_profile|x_authority/, '🐦'],
    [/linkedin/, '💼'],
    [/instagram|tiktok|reel|pinterest|youtube|video_script/, '📱'],
    [/ih|hn|community|substack/, '💬'],
    [/ga4|search_console|analyst|anomaly|funnel|cohort|attribution/, '📊'],
    [/competitor|swot|pricing|trend|persona|demand/, '🔍'],
    [/cro|cta|headline|form|onboarding|ab|lp_diagn|pdp/, '🎯'],
    [/email|newsletter|drip|lead_magnet|welcome|winback|post_purchase/, '📧'],
    [/line|sms/, '💌'],
    [/review|gbp/, '⭐'],
    [/product|bundle|upsell|inventory|shopping|pmax/, '🛒'],
    [/local|booking|phone/, '🗺'],
    [/infographic|visual/, '🎨'],
    [/influencer|affiliate|ugc/, '🤝'],
    [/dm_script|cold_email|proposal|outreach|sales/, '💼'],
    [/pm|operator|editor|proofreader|researcher|data_collector/, '🛠'],
  ];
  function _roleIcon(role){
    var r = String(role || '').toLowerCase();
    for(var i = 0; i < ROLE_ICON_KW.length; i++){
      if(ROLE_ICON_KW[i][0].test(r)) return ROLE_ICON_KW[i][1];
    }
    return '🤖';
  }

  // 1 メンバー の card HTML
  function _renderMember(m, deptColor){
    var ic = _roleIcon(m.role);
    var artN = _memberArtCount(m.role);
    var promptText = m.name + ' (' + (m.role || 'AI') + ') に依頼: ';
    return '<div class="sd-mb" style="--ag-c:' + deptColor + '" title="' + esc(m.focus || '') + '">'
         +   '<div class="sd-mb-ic">' + ic + '</div>'
         +   '<div class="sd-mb-bd">'
         +     '<div class="sd-mb-nm">' + esc(m.name || 'AI') + '</div>'
         +     '<div class="sd-mb-fc">' + esc(m.focus || '') + '</div>'
         +   '</div>'
         +   (artN > 0 ? '<div class="sd-mb-n" title="納品物 ' + artN + ' 件">' + artN + '</div>' : '')
         +   '<button class="sd-mb-ask" onclick="event.stopPropagation();_quickAskAI(\'' + esc(site.id) + '\', ' + JSON.stringify(promptText).replace(/'/g, '&#39;') + ')" title="このメンバーに依頼">💬</button>'
         + '</div>';
  }

  // 1 チームの HTML (= memberの list)
  function _renderTeam(t, deptColor){
    var teamN = (t.members || []).length;
    return '<div class="sd-org-team">'
         +   '<div class="sd-org-team-h">'
         +     '<span class="sd-org-team-nm">' + esc(t.name) + '</span>'
         +     '<span class="sd-org-team-n">' + teamN + ' 名</span>'
         +   '</div>'
         +   '<div class="sd-org-team-members">'
         +     (t.members || []).map(function(m){ return _renderMember(m, deptColor); }).join('')
         +   '</div>'
         + '</div>';
  }

  // 1 部門の HTML (= teams の grid)
  function _renderDept(d){
    var deptMembers = (d.teams || []).reduce(function(s, t){ return s + (t.members || []).length; }, 0);
    return '<div class="sd-org-dept" style="--dept-c:' + d.color + '">'
         +   '<div class="sd-org-dept-h">'
         +     '<div class="sd-org-dept-ic">' + d.icon + '</div>'
         +     '<div class="sd-org-dept-meta">'
         +       '<div class="sd-org-dept-nm">' + esc(d.name) + '</div>'
         +       '<div class="sd-org-dept-sub">' + deptMembers + ' 名 ・ ' + (d.teams || []).length + ' チーム</div>'
         +     '</div>'
         +     '<button class="sd-org-dept-ask" onclick="_quickAskAI(\'' + esc(site.id) + '\', ' + JSON.stringify(d.name + 'に依頼: ').replace(/'/g, '&#39;') + ')" title="この部門に依頼">部門に依頼 →</button>'
         +   '</div>'
         +   '<div class="sd-org-dept-teams">'
         +     (d.teams || []).map(function(t){ return _renderTeam(t, d.color); }).join('')
         +   '</div>'
         + '</div>';
  }

  // ── 全体ヘッダー (= 「○○名のマーケ組織」感を出す) ──
  var headerHTML = ''
    + '<div class="sd-org-h">'
    +   '<div class="sd-org-h-l">'
    +     '<div class="sd-org-h-tag"><span class="sd-rp-dot"></span>あなた専属の AI マーケティング組織</div>'
    +     '<div class="sd-org-h-ti">🏢 ' + totalMembers + ' 名の AI 専門組織</div>'
    +     '<div class="sd-org-h-sub">' + org.departments.length + ' 部門 ・ 各部門の AI が 1 つの手法に特化。クリックでそのメンバーに直接依頼できます。</div>'
    +   '</div>'
    +   '<button class="sd-org-h-edit" onclick="openEditAgent(\'' + esc(site.id) + '\')" title="組織編成を変更">⚙ 編成を編集</button>'
    + '</div>';

  // ── 部門グリッド (= 大きい column 表示) ──
  var orgHTML = ''
    + '<div class="sd-org-chart">'
    +   org.departments.map(_renderDept).join('')
    + '</div>';

  return headerHTML + orgHTML;
}

// メンバー詳細 popout (= 軽量 alert で OK)
function _showAgentMemberDetail(siteId, idx){
  var site = (agents || []).find(function(a){ return a && a.id === siteId; });
  if(!site) return;
  var m = (site.team_members || [])[idx];
  if(!m) return;
  var ic = _MEMBER_ICONS[m.role] || '🤖';
  showToast(ic + ' ' + (m.name || 'AI') + ' — ' + (m.focus || m.role || ''), 'ok');
}

// ─── Tab 5: ⚙ 設定 (= 必要最小限の 3 アクション) ─────────────────
// ユーザーリクエスト: 💬 会話共有 / ⚙ 設定 / ↻ 新規依頼 の 3 つだけ。
// KPI 編集 / スケジュール / 連携 / 削除は別ルート (ダッシュボード内の他 tab
// or サイドバー) で提供するので、ここはシンプルに保つ。
// ═══════════════════════════════════════════════════════════════════
// ── Tab: 🔌 接続 (= 外部サービスの接続管理) ──
// 「今のコンセプト = AI マーケ組織が結果を出す」に必要な接続だけを surface。
// 5 カテゴリ: 分析 / SNS / コンテンツ公開 / EC / フォーム
// 各 integration card は icon + name + 接続状態 + アクション button。
// ═══════════════════════════════════════════════════════════════════
function _renderTabConnections(site){
  var snsCache = (window._snsStatusCache && window._snsStatusCache[site.id]) || null;
  if(!snsCache){ setTimeout(function(){ _fetchSnsStatus(site.id); }, 100); }
  var ga4Connected = !!(me && me.integrations && me.integrations.ga4 && me.integrations.ga4.refresh_token);
  var googleConnected = !!(me && me.google_oauth && me.google_oauth.refresh_token);
  var extPaired = !!(me && me.extension_device_token);

  // 各 platform の接続状態を取得 (= snsCache から)
  function _getConn(platform){
    var c = snsCache && snsCache[platform];
    return {
      connected: !!(c && c.connected),
      profile: c && c.profile,
      handle: c && c.profile && (c.profile.username || c.profile.page_name || c.profile.channel_name || c.profile.shop_name || c.profile.site_name) || '',
    };
  }

  // 単一 integration card の HTML 生成 helper
  function _connCard(opts){
    // opts: { icon, name, desc, color, status: 'on'|'off'|'soon', meta?, onConnect?, onDisconnect? }
    var statusLbl = opts.status === 'on' ? '🟢 接続済'
                  : opts.status === 'soon' ? '⏳ 近日対応'
                  : '🔘 未接続';
    var statusCls = opts.status === 'on' ? 'on' : opts.status === 'soon' ? 'soon' : 'off';
    var actionBtn = '';
    if(opts.status === 'on' && opts.onDisconnect){
      actionBtn = '<button class="cn-btn cn-btn-secondary" onclick="' + opts.onDisconnect + '">切断</button>';
    } else if(opts.status === 'off' && opts.onConnect){
      actionBtn = '<button class="cn-btn cn-btn-primary" onclick="' + opts.onConnect + '">接続する →</button>';
    } else if(opts.status === 'soon'){
      actionBtn = '<button class="cn-btn cn-btn-soon" disabled>近日</button>';
    }
    return '<div class="cn-card cn-card-' + statusCls + '" style="--cn-c:' + opts.color + '">'
         +   '<div class="cn-card-l">'
         +     '<div class="cn-card-ic" style="background:' + opts.color + '15;color:' + opts.color + '">' + opts.icon + '</div>'
         +     '<div class="cn-card-meta">'
         +       '<div class="cn-card-nm">' + esc(opts.name) + ' <span class="cn-status cn-status-' + statusCls + '">' + statusLbl + '</span></div>'
         +       '<div class="cn-card-de">' + esc(opts.desc) + '</div>'
         +       (opts.meta ? '<div class="cn-card-extra">' + opts.meta + '</div>' : '')
         +     '</div>'
         +   '</div>'
         +   '<div class="cn-card-r">' + actionBtn + '</div>'
         + '</div>';
  }

  // セクション header
  function _section(title, desc){
    return '<div class="cn-sec-h">'
         + '<div class="cn-sec-ti">' + title + '</div>'
         + (desc ? '<div class="cn-sec-de">' + esc(desc) + '</div>' : '')
         + '</div>';
  }

  // 拡張未インストール時の global warning
  var extWarn = !extPaired
    ? '<div class="cn-ext-warn">⚠️ <b>Chrome 拡張</b>が未インストールです。 SNS 投稿・コンテンツ公開には拡張が必要。<a href="/setup-extension.html" target="_blank">📥 インストール (30 秒)</a></div>'
    : '<div class="cn-ext-ok">✅ Chrome 拡張 接続済 ・ パスワード共有不要で SNS / コンテンツに投稿できます</div>';

  // ── 1. 📊 分析・データ ──
  var analyticsHTML = _section('📊 分析・データ', '数字一覧 tab を生かすための基盤データ')
    + '<div class="cn-grid">'
    +   _connCard({
          icon: '📊', name: 'Google Analytics 4', color: '#f59e0b',
          desc: 'PV / セッション / 流入経路 / CVR / ユーザー属性。数字 tab + 毎朝レポートの根拠データ。',
          status: ga4Connected ? 'on' : 'off',
          onConnect: "openIntegrationsTab && openIntegrationsTab('ga4')",
        })
    +   _connCard({
          icon: '🔍', name: 'Google Search Console', color: '#3b82f6',
          desc: '検索キーワード / 表示回数 / 平均順位 / CTR。AEO・SEO 課が施策に直結。',
          status: googleConnected ? 'off' : 'soon',  // Google OAuth 済でも SC は別 scope
        })
    +   _connCard({
          icon: '💳', name: 'Stripe', color: '#635bff',
          desc: '売上 / MRR / 解約率 / LTV。SaaS / EC 向けに収益 KPI を可視化。',
          status: 'soon',
        })
    + '</div>';

  // URL paste で接続できる platform の汎用 card builder
  function _urlPasteCard(platform, name, icon, color, desc){
    var c = _getConn(platform);
    return _connCard({
      icon: icon, name: name, color: color,
      desc: desc + (c.handle ? ' ・ 接続: ' + esc(c.handle) : ''),
      status: c.connected ? 'on' : 'off',
      onConnect: "_openSnsConnectModal('" + platform + "','" + esc(site.id) + "')",
      onDisconnect: "_snsDisconnect('" + platform + "','" + esc(site.id) + "', this)",
    });
  }

  // ── 2. 🐦 SNS 投稿 (= 拡張経由) ──
  var snsHTML = _section('🐦 SNS 投稿', 'AI 組織が直接投稿。拡張経由 + あなたのブラウザのログイン状態を使用。')
    + '<div class="cn-grid">'
    +   _urlPasteCard('x', 'X (Twitter)', '𝕏', '#000', 'AI が単独 Tweet / 連投スレッドを 1 クリックで投稿。')
    +   _urlPasteCard('linkedin', 'LinkedIn', '💼', '#0a66c2', 'B2B 個人投稿 / 記事公開。プロフ最適化 + 投稿戦略を AI が担当。')
    +   _urlPasteCard('threads', 'Threads', '🧵', '#000', '500 字までの投稿 + 画像 / 動画。X と相互配信可能。')
    +   _urlPasteCard('facebook', 'Facebook Page', '📘', '#1877f2', '企業ページ投稿。地域店舗 / B2B で重要。')
    +   _urlPasteCard('instagram', 'Instagram', '📸', '#e1306c', 'Feed / Reels / Story。EC・店舗・個人ブランドの主戦場。')
    +   _urlPasteCard('tiktok', 'TikTok', '🎵', '#000', '動画投稿。Z 世代訴求 / リーチ拡大。')
    +   _urlPasteCard('youtube', 'YouTube', '📹', '#ff0000', 'コミュニティ投稿 / Shorts。チャンネル運営者向け。')
    + '</div>';

  // ── 3. 📝 コンテンツ公開 ──
  var contentHTML = _section('📝 コンテンツ公開', 'AI が書いた記事をそのまま公開へ')
    + '<div class="cn-grid">'
    +   _urlPasteCard('wordpress', 'WordPress', '📝', '#21759b', 'AI 生成記事を WP の下書き / 公開へ自動投稿。SEO ライター部門と直結。')
    +   _urlPasteCard('note', 'note', '📓', '#41c9b4', 'note への記事投稿。日本市場のメディア / 個人ブランドで強力。')
    + '</div>';

  // ── 4. 🛒 EC / コマース (= EC vertical 向け) ──
  var ecHTML = '';
  if(site.site_vertical === 'ec' || site.site_vertical === 'store' || (site.site_url && /shopify|base|stores|ec-cube/i.test(site.site_url))){
    ecHTML = _section('🛒 EC / コマース', '商品最適化 + 売上分析の基盤')
      + '<div class="cn-grid">'
      +   _urlPasteCard('shopify', 'Shopify', '🛒', '#95bf47', '商品ページ自動最適化 / 在庫連動 / 売上 KPI。EC 部門の中核。')
      +   _urlPasteCard('base', 'BASE', '🛍', '#0099ff', '日本の EC プラットフォーム。商品ページ / 配送 / 売上連動。')
      + '</div>';
  }

  // ── 5b. 🤖 MY AI Agent 内蔵ツール (= 外部接続不要、 自社開発) ──
  // 「結果を出す」 ために MY AI Agent が直接提供するツール群。
  // 一部は既存機能の再利用 (= web_fetch / image gen / Resend) で即動作可能。
  function _toolCard(opts){
    // opts: { icon, name, desc, color, status: 'on'|'soon', meta? }
    var statusLbl = opts.status === 'on' ? '🟢 利用可能'
                  : opts.status === 'beta' ? '🧪 ベータ'
                  : '⏳ 近日対応';
    var statusCls = opts.status === 'on' ? 'on' : opts.status === 'beta' ? 'beta' : 'soon';
    return '<div class="cn-card cn-card-tool cn-card-' + statusCls + '" style="--cn-c:' + opts.color + '">'
         +   '<div class="cn-card-l">'
         +     '<div class="cn-card-ic" style="background:' + opts.color + '15;color:' + opts.color + '">' + opts.icon + '</div>'
         +     '<div class="cn-card-meta">'
         +       '<div class="cn-card-nm">' + esc(opts.name) + ' <span class="cn-status cn-status-' + statusCls + '">' + statusLbl + '</span></div>'
         +       '<div class="cn-card-de">' + esc(opts.desc) + '</div>'
         +     '</div>'
         +   '</div>'
         + '</div>';
  }
  // 「内蔵ツール」 = MY AI Agent 自社開発。 V1 で動くのは AI 検索モニターのみ、
  //  他は近日扱い (= 嘘ラベル避け)。
  // Tool card は click 可能なものは onClick を持つ。
  function _toolCardClickable(opts){
    var statusLbl = opts.status === 'on' ? '🟢 利用可能' : '⏳ 近日対応';
    var statusCls = opts.status === 'on' ? 'on' : 'soon';
    var clickAttr = opts.onClick ? ' onclick="' + opts.onClick + '" style="cursor:pointer;--cn-c:' + opts.color + '"' : ' style="--cn-c:' + opts.color + '"';
    var actionBtn = opts.status === 'on' && opts.onClick
      ? '<button class="cn-btn cn-btn-primary" onclick="event.stopPropagation();' + opts.onClick + '">使う →</button>'
      : '<button class="cn-btn cn-btn-soon" disabled>近日</button>';
    return '<div class="cn-card cn-card-tool cn-card-' + statusCls + '"' + clickAttr + '>'
         +   '<div class="cn-card-l">'
         +     '<div class="cn-card-ic" style="background:' + opts.color + '15;color:' + opts.color + '">' + opts.icon + '</div>'
         +     '<div class="cn-card-meta">'
         +       '<div class="cn-card-nm">' + esc(opts.name) + ' <span class="cn-status cn-status-' + statusCls + '">' + statusLbl + '</span></div>'
         +       '<div class="cn-card-de">' + esc(opts.desc) + '</div>'
         +     '</div>'
         +   '</div>'
         +   '<div class="cn-card-r">' + actionBtn + '</div>'
         + '</div>';
  }
  var internalToolsHTML = _section('🤖 MY AI Agent 内蔵ツール', '外部接続不要 ・ AI 組織が直接使う自社開発ツール')
    + '<div class="cn-grid">'
    +   _toolCardClickable({
          icon: '🤖', name: 'AI 検索モニター', color: '#9333ea',
          desc: 'Perplexity で自社 / 業界 KW が引用されているかチェック。 拡張で問い合わせ → 引用 URL を tracking。',
          status: 'on',
          onClick: '_openAeoMonitorModal(\'' + esc(site.id) + '\')',
        })
    +   _toolCardClickable({
          icon: '📈', name: '検索順位チェッカー', color: '#0ea5e9',
          desc: '主要キーワードの Google 検索順位を毎日測定。順位推移を「数字一覧」 tab + 毎朝レポートに反映。',
          status: 'soon',
        })
    +   _toolCardClickable({
          icon: '🔍', name: '競合記事分析', color: '#fb923c',
          desc: '上位 10 記事の見出し / 文字数 / 構造を一括抽出。AI ライターが「勝てる記事」を設計する根拠データ。',
          status: 'soon',
        })
    +   _toolCardClickable({
          icon: '🎨', name: 'アイキャッチ画像生成', color: '#ec4899',
          desc: '記事に合った OGP / SNS 用画像を AI 生成。テキスト + ビジュアルが揃った完成品を納品。',
          status: 'soon',
        })
    +   _toolCardClickable({
          icon: '📧', name: 'メルマガ送信', color: '#22c55e',
          desc: 'リスト管理 + AI 生成本文 + 配信を完結。月 3000 通まで無料 (Resend 経由)。',
          status: 'soon',
        })
    +   _toolCardClickable({
          icon: '⚡', name: 'Core Web Vitals モニター', color: '#f59e0b',
          desc: 'LCP / CLS / INP / 読込速度を毎日測定。CRO 部門が改善案を即提案。',
          status: 'soon',
        })
    + '</div>';

  // ── 5. 📋 フォーム / 問い合わせ ──
  var formHTML = _section('📋 フォーム / 問い合わせ', 'HP の問い合わせ数を直接 KPI に。')
    + '<div class="cn-grid">'
    +   _connCard({
          icon: '📋', name: 'Typeform', color: '#262627',
          desc: '問い合わせフォームの送信件数 / コンバージョン率を KPI に反映。',
          status: 'soon',
        })
    +   _connCard({
          icon: '📋', name: 'Google Forms', color: '#673ab7',
          desc: 'Google Forms 経由の問い合わせ件数を毎朝レポートに反映。',
          status: 'soon',
        })
    + '</div>';

  return '<div class="cn-page">'
    + '<div class="cn-hero">'
    +   '<div class="cn-hero-tag"><span class="sd-rp-dot"></span>外部サービスとの接続 + 内蔵ツール</div>'
    +   '<div class="cn-hero-ti">AI 組織が「読める / 投稿できる」サービスを増やす</div>'
    +   '<div class="cn-hero-sub">接続したサービスから自動でデータが流れ込み、AI 組織のアウトプットの精度が上がります。<b>パスワード共有不要</b>。</div>'
    + '</div>'
    + extWarn
    + analyticsHTML
    + snsHTML
    + contentHTML
    + ecHTML
    + formHTML
    + internalToolsHTML
    + '</div>';
}

function _renderTabSettings(site){
  function _row(icon, color, title, desc, btnLbl, onClick){
    return ''
      + '<div class="sd-set-row" style="--row-c:' + color + '">'
      +   '<div class="sd-set-ic">' + icon + '</div>'
      +   '<div class="sd-set-bd">'
      +     '<div class="sd-set-ti">' + esc(title) + '</div>'
      +     '<div class="sd-set-de">' + esc(desc) + '</div>'
      +   '</div>'
      +   '<button class="sd-set-btn" onclick="' + onClick + '">' + esc(btnLbl) + ' →</button>'
      + '</div>';
  }

  // SNS 接続状態を local cache から取り出し (= mount 時に fetch する)
  var snsCache = (window._snsStatusCache && window._snsStatusCache[site.id]) || null;
  if(!snsCache){
    // バックグラウンドで fetch (= 初回 / stale 時)
    setTimeout(function(){ _fetchSnsStatus(site.id); }, 100);
  }
  var x = snsCache && snsCache.x;
  var extPaired = snsCache && snsCache.extension_paired;
  var xConnected = !!(x && x.connected);

  // SNS 接続カード (X)
  var snsBlock = ''
    + '<div class="sd-set-group">'
    +   '<div class="sd-set-group-h">📱 SNS 接続 — AI が直接投稿</div>'
    +   (!extPaired
        ? '<div class="sd-sns-warn">⚠️ <b>Chrome 拡張が未インストール</b>です。<a href="/setup-extension.html" target="_blank">拡張をインストール</a>後に SNS 接続できます。</div>'
        : '')
    +   '<div class="sd-sns-row" style="--row-c:#000">'
    +     '<div class="sd-sns-ic-x">𝕏</div>'
    +     '<div class="sd-set-bd">'
    +       '<div class="sd-set-ti">X (Twitter)'
    +         (xConnected ? ' <span class="sd-sns-badge on">🟢 接続済</span>' : ' <span class="sd-sns-badge off">未接続</span>')
    +       '</div>'
    +       '<div class="sd-set-de">'
    +         (xConnected && x.profile && x.profile.username
            ? 'アカウント: <b>' + esc(x.profile.username) + '</b> ・ AI チームが投稿を担当できます'
            : 'Chrome 拡張で x.com にログインしてから「接続」を押してください')
    +       '</div>'
    +     '</div>'
    +     (xConnected
        ? '<button class="sd-set-btn" onclick="_snsDisconnectX(\'' + esc(site.id) + '\', this)">切断</button>'
        : '<button class="sd-set-btn" onclick="_openXConnectModal(\'' + esc(site.id) + '\')">🔗 接続する →</button>')
    +   '</div>'
    +   '<div class="sd-sns-soon">'
    +     '<div class="sd-sns-soon-label">近日対応:</div>'
    +     '<span>💼 LinkedIn</span><span>🧵 Threads</span><span>📸 Instagram</span><span>📘 Facebook</span><span>📌 Pinterest</span><span>🎵 TikTok</span>'
    +   '</div>'
    + '</div>';

  return snsBlock
    + '<div class="sd-set-group">'
    +   '<div class="sd-set-group-h">⚙ サイト設定</div>'
    +   _row('💬', '#3b82f6', 'この会話を公開リンクで共有',
            'チャットの履歴を read-only の URL として人に渡せる。',
            '公開リンク',
            "openSite('" + esc(site.id) + "');setTimeout(openChatShareModal,150)")
    +   _row('⚙', '#64748b', 'AI チームを編集',
            'チームメンバー / モデル / ペルソナ / 権限を変更。',
            '編集する',
            "openEditAgent('" + esc(site.id) + "')")
    +   _row('↻', '#ec4899', '新しい依頼を開始',
            '別件の新規スレッドを開く (履歴は残る)。',
            '新規依頼',
            "openSite('" + esc(site.id) + "');setTimeout(newChat,150)")
    + '</div>';
}

// ─── SNS 接続管理 helpers ────────────────────────────────
window._snsStatusCache = window._snsStatusCache || {};
var _SNS_ALL_PLATFORMS = ['x','linkedin','threads','instagram','facebook','tiktok','youtube','note','wordpress','shopify','base'];
async function _fetchSnsStatus(siteId){
  if(window._snsStatusFetching && window._snsStatusFetching[siteId]) return;
  window._snsStatusFetching = window._snsStatusFetching || {};
  window._snsStatusFetching[siteId] = true;
  try {
    var r = await api('GET', '/api/sns/status');
    if(r && r.ok){
      var cache = { extension_paired: !!r.extension_paired };
      _SNS_ALL_PLATFORMS.forEach(function(p){
        cache[p] = r[p] || { connected: false };
      });
      window._snsStatusCache[siteId] = cache;
      try { renderHomeDashboard(); } catch(_){}
    }
  } catch(e){
    console.warn('[sns-status] fetch failed:', e && e.message);
  } finally {
    window._snsStatusFetching[siteId] = false;
  }
}

// 旧: 拡張で確認する flow (= V2 で「拡張で再確認」 option として残す可能性)
async function _snsConnectX(siteId, btnEl){
  if(btnEl){ btnEl.disabled = true; btnEl.innerHTML = '🔄 確認中... (~5s)'; }
  try {
    var r = await api('POST', '/api/sns/verify/x');
    if(r && r.ok){
      showToast('✅ X 接続確認完了' + (r.profile && r.profile.username ? ' (' + r.profile.username + ')' : ''), 'ok');
      window._snsStatusCache[siteId] = window._snsStatusCache[siteId] || {};
      window._snsStatusCache[siteId].x = { connected: true, profile: r.profile || null, last_verified_at: new Date().toISOString() };
      try { renderHomeDashboard(); } catch(_){}
    } else {
      var detail = (r && r.detail) || (r && r.error) || '接続確認に失敗';
      showToast('⚠️ ' + detail, 'ng');
      if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🔗 接続する →'; }
    }
  } catch(e){
    showToast((e && e.message) || 'ネットワークエラー', 'ng');
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🔗 接続する →'; }
  }
}

// 新: URL 貼り付けで即接続 (= primary 方式)
// ── 全 SNS platform 共通の connect / disconnect helpers ──
// 各 platform 用に「URL paste 接続」 modal + disconnect button が動く。

// platform 別の表示メタデータ
var SNS_PLATFORM_META = {
  x:         { name: 'X (Twitter)', icon: '𝕏', accent: '#000',     placeholder: 'https://x.com/yourhandle',          hint: '<code>@yourhandle</code> でも OK' },
  linkedin:  { name: 'LinkedIn',    icon: '💼', accent: '#0a66c2', placeholder: 'https://www.linkedin.com/in/yourname', hint: '<code>linkedin.com/in/yourname</code> 形式' },
  threads:   { name: 'Threads',     icon: '🧵', accent: '#000',     placeholder: 'https://www.threads.com/@yourname',   hint: '<code>@yourname</code> でも OK' },
  instagram: { name: 'Instagram',   icon: '📸', accent: '#e1306c', placeholder: 'https://www.instagram.com/yourname',  hint: '<code>@yourname</code> でも OK' },
  facebook:  { name: 'Facebook',    icon: '📘', accent: '#1877f2', placeholder: 'https://www.facebook.com/yourpage',   hint: 'Page URL を貼ってください' },
  tiktok:    { name: 'TikTok',      icon: '🎵', accent: '#000',     placeholder: 'https://www.tiktok.com/@yourname',    hint: '<code>@yourname</code> でも OK' },
  youtube:   { name: 'YouTube',     icon: '📹', accent: '#ff0000', placeholder: 'https://www.youtube.com/@yourchannel', hint: 'チャンネル URL を貼ってください' },
  note:      { name: 'note',        icon: '📓', accent: '#41c9b4', placeholder: 'https://note.com/yourname',           hint: 'note プロフィール URL' },
  wordpress: { name: 'WordPress',   icon: '📝', accent: '#21759b', placeholder: 'https://yoursite.com',                hint: 'サイトの URL を貼ってください' },
  shopify:   { name: 'Shopify',     icon: '🛒', accent: '#95bf47', placeholder: 'https://yourshop.myshopify.com',       hint: '<code>yourshop.myshopify.com</code> 形式' },
  base:      { name: 'BASE',        icon: '🛍', accent: '#0099ff', placeholder: 'https://admin.thebase.in/',          hint: 'BASE admin URL' },
};

// 汎用 connect modal
function _openSnsConnectModal(platform, siteId){
  if(!siteId){
    siteId = (typeof activeId !== 'undefined' && activeId) || null;
    if(!siteId) return;
  }
  var meta = SNS_PLATFORM_META[platform];
  if(!meta){ console.warn('[sns-connect] unknown platform:', platform); return; }
  var existing = document.getElementById('snsConnectModal');
  if(existing) existing.remove();
  var html = '<div id="snsConnectModal" class="xp-overlay" onclick="if(event.target===this)_closeSnsConnectModal()">'
    + '<div class="xp-card" style="max-width:480px">'
    +   '<button class="xp-close" onclick="_closeSnsConnectModal()">×</button>'
    +   '<div class="xp-h">'
    +     '<div class="xp-h-tag" style="background:' + meta.accent + '"><span class="xp-h-ic">' + meta.icon + '</span> ' + esc(meta.name) + ' に接続</div>'
    +     '<div style="font-size:17px;font-weight:900;color:var(--text);letter-spacing:-.01em;margin:8px 0 8px">あなたの ' + esc(meta.name) + ' URL を貼ってください</div>'
    +     '<div style="font-size:12.5px;color:var(--text2);line-height:1.65;font-weight:600">'
    +       'これだけで接続完了。<b>パスワードは一切要りません</b>。<br>'
    +       '実際の操作時は、Chrome 拡張 + あなたのブラウザのログイン状態を使います。'
    +     '</div>'
    +   '</div>'
    +   '<div style="padding:0 24px 14px">'
    +     '<input id="snsConnectInput" type="text" class="xp-input" placeholder="' + esc(meta.placeholder) + '" autocomplete="off" />'
    +     '<div class="xp-hint">💡 ' + meta.hint + '</div>'
    +   '</div>'
    +   '<div class="xp-actions">'
    +     '<button class="xp-cancel" onclick="_closeSnsConnectModal()">キャンセル</button>'
    +     '<button class="xp-post" style="background:' + meta.accent + '" onclick="_submitSnsConnect(\'' + platform + '\',\'' + esc(siteId) + '\', this)">接続する</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  setTimeout(function(){ var i = document.getElementById('snsConnectInput'); if(i) i.focus(); }, 80);
}
function _closeSnsConnectModal(){
  var m = document.getElementById('snsConnectModal');
  if(m) m.remove();
}
async function _submitSnsConnect(platform, siteId, btnEl){
  var inp = document.getElementById('snsConnectInput');
  if(!inp) return;
  var raw = String(inp.value || '').trim();
  if(!raw){
    inp.style.borderColor = '#dc2626';
    setTimeout(function(){ inp.style.borderColor = ''; }, 1500);
    return;
  }
  if(btnEl){ btnEl.disabled = true; btnEl.innerHTML = '⏳ 接続中...'; }
  try {
    var r = await api('POST', '/api/sns/connect/' + platform, { url: raw });
    if(r && r.ok){
      _closeSnsConnectModal();
      var label = SNS_PLATFORM_META[platform] && SNS_PLATFORM_META[platform].name || platform;
      var nm = r.profile && (r.profile.username || r.profile.page_name || r.profile.channel_name || r.profile.shop_name || r.profile.site_name);
      showToast('✅ ' + label + ' 接続完了' + (nm ? ' (' + nm + ')' : ''), 'ok');
      window._snsStatusCache[siteId] = window._snsStatusCache[siteId] || {};
      window._snsStatusCache[siteId][platform] = { connected: true, profile: r.profile || null, last_verified_at: new Date().toISOString() };
      try { renderHomeDashboard(); } catch(_){}
    } else {
      var detail = (r && r.detail) || (r && r.error) || '接続失敗';
      showToast('⚠️ ' + detail, 'ng');
      if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '接続する'; }
    }
  } catch(e){
    showToast((e && e.message) || 'ネットワークエラー', 'ng');
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '接続する'; }
  }
}
async function _snsDisconnect(platform, siteId, btnEl){
  if(!confirm((SNS_PLATFORM_META[platform] && SNS_PLATFORM_META[platform].name || platform) + ' 接続を解除しますか?')) return;
  if(btnEl){ btnEl.disabled = true; btnEl.innerHTML = '...'; }
  try {
    await api('POST', '/api/sns/disconnect/' + platform);
    showToast('接続を解除しました', 'ok');
    if(window._snsStatusCache && window._snsStatusCache[siteId] && window._snsStatusCache[siteId][platform]){
      window._snsStatusCache[siteId][platform] = { connected: false };
    }
    try { renderHomeDashboard(); } catch(_){}
  } catch(e){
    showToast((e && e.message) || 'ネットワークエラー', 'ng');
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '切断'; }
  }
}

// ─── AEO 検索モニター modal (= 内蔵ツール) ─────────────────────
// Perplexity / ChatGPT / Gemini に query を投げて、 自社引用結果を表示。 過去 runs も履歴で出す。
var AEO_PLATFORM_META = {
  perplexity: { label: 'Perplexity', emoji: '🔍', tone: '#9333ea', hint: '引用が明示・ログイン不要・最も安定 (推奨)', dur: '~15s' },
  chatgpt:    { label: 'ChatGPT',    emoji: '💬', tone: '#10a37f', hint: '要 chatgpt.com ログイン・回答待ち長め',         dur: '~25s' },
  gemini:     { label: 'Gemini',     emoji: '✨', tone: '#4285f4', hint: '要 Google ログイン・引用は文章内のみ',          dur: '~25s' },
};
function _openAeoMonitorModal(siteId){
  if(!siteId) siteId = activeId;
  if(!siteId) return;
  var site = (agents || []).find(function(a){ return a && a.id === siteId; });
  if(!site) return;
  var hostname = _siteHostname(site);
  var vertical = _verticalLabel(site.site_vertical || 'other');
  var runs = (site.aeo_monitor && site.aeo_monitor.runs) || [];
  // デフォルト query (= サイト vertical + おすすめ系)
  var defaultQuery = (site.site_vertical === 'saas' ? 'おすすめの SaaS ' + (site.site_title || '') : '')
                  || (site.site_vertical === 'ec'   ? site.site_title + ' レビュー' : '')
                  || (site.site_vertical === 'blog' ? 'おすすめの ' + (site.site_title || '') + ' 関連記事' : '')
                  || ('おすすめ ' + (site.site_title || hostname));

  var existing = document.getElementById('aeoModal');
  if(existing) existing.remove();

  var runsList = runs.length === 0
    ? '<div class="aeo-empty">まだ実行履歴がありません。 上のフォームから query を投げてください。</div>'
    : '<div class="aeo-runs">'
      + runs.slice(0, 10).map(function(r){
          var dt = '';
          try { dt = new Date(r.ts).toLocaleString('ja-JP'); } catch(_){}
          var mention = r.mentioned
            ? '<span class="aeo-mention on">✅ 自社引用あり (' + (r.matched_urls && r.matched_urls.length || 0) + ' URL)</span>'
            : '<span class="aeo-mention off">❌ 自社引用なし</span>';
          var plat = String(r.platform || 'perplexity').toLowerCase();
          var pm = AEO_PLATFORM_META[plat] || AEO_PLATFORM_META.perplexity;
          return '<div class="aeo-run">'
               +   '<div class="aeo-run-h">'
               +     '<span class="aeo-run-q">「' + esc(r.query) + '」</span>'
               +     mention
               +   '</div>'
               +   '<div class="aeo-run-meta">' + esc(dt) + ' ・ ' + (r.cited_urls || []).length + ' URL 引用 ・ ' + pm.emoji + ' ' + esc(pm.label) + '</div>'
               + '</div>';
        }).join('')
      + '</div>';

  // platform tabs (Perplexity / ChatGPT / Gemini)
  var platforms = ['perplexity','chatgpt','gemini'];
  var platformTabs = '<div class="aeo-plat-row">'
    + platforms.map(function(p){
        var m = AEO_PLATFORM_META[p];
        var active = p === 'perplexity' ? ' aeo-plat-on' : '';
        return '<button class="aeo-plat' + active + '" data-platform="' + p + '" onclick="_aeoSelectPlatform(\'' + p + '\')" style="--aeo-tone:' + m.tone + '">'
             +   '<span class="aeo-plat-emoji">' + m.emoji + '</span>'
             +   '<span class="aeo-plat-label">' + esc(m.label) + '</span>'
             + '</button>';
      }).join('')
    + '</div>'
    + '<div class="aeo-plat-hint" id="aeoPlatHint">💡 ' + AEO_PLATFORM_META.perplexity.hint + '</div>';

  var html = '<div id="aeoModal" class="xp-overlay" onclick="if(event.target===this)_closeAeoMonitorModal()">'
    + '<div class="xp-card" style="max-width:640px">'
    +   '<button class="xp-close" onclick="_closeAeoMonitorModal()">×</button>'
    +   '<div class="xp-h">'
    +     '<div class="xp-h-tag" style="background:#9333ea"><span class="xp-h-ic">🤖</span> AI 検索モニター</div>'
    +     '<div style="font-size:17px;font-weight:900;color:var(--text);letter-spacing:-.01em;margin:8px 0 8px">AI 検索エンジンで この query → 自社引用 check</div>'
    +     '<div style="font-size:12.5px;color:var(--text2);line-height:1.65;font-weight:600">'
    +       '拡張で AI 検索を背景で開いて回答を取得。 引用 URL に自社 (<b>' + esc(hostname) + '</b>) が含まれるか自動判定します。'
    +     '</div>'
    +   '</div>'
    +   '<div style="padding:0 24px 14px">'
    +     platformTabs
    +     '<input id="aeoQueryInput" type="text" class="xp-input" placeholder="例: おすすめの SaaS / Best blog about X" value="' + esc(defaultQuery) + '" />'
    +     '<div class="xp-hint">💡 ユーザーが AI に聞きそうな実用クエリで試してください</div>'
    +   '</div>'
    +   '<div class="xp-actions">'
    +     '<button class="xp-cancel" onclick="_closeAeoMonitorModal()">閉じる</button>'
    +     '<button id="aeoRunBtn" class="xp-post" style="background:#9333ea" onclick="_runAeoMonitor(\'' + esc(siteId) + '\', this)">🔍 Perplexity で検索 (~15s)</button>'
    +   '</div>'
    +   '<div class="aeo-history" id="aeoHistory">'
    +     '<div class="aeo-history-h">過去の検索履歴</div>'
    +     runsList
    +   '</div>'
    + '</div>'
    + '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // selector state は modal の data 属性で持つ
  var m = document.getElementById('aeoModal');
  if(m) m.setAttribute('data-platform', 'perplexity');
  setTimeout(function(){ var i = document.getElementById('aeoQueryInput'); if(i) i.focus(); }, 80);
}
function _aeoSelectPlatform(platform){
  var modal = document.getElementById('aeoModal');
  if(!modal) return;
  var meta = AEO_PLATFORM_META[platform] || AEO_PLATFORM_META.perplexity;
  modal.setAttribute('data-platform', platform);
  // tab active 切替
  var tabs = modal.querySelectorAll('.aeo-plat');
  for(var i=0;i<tabs.length;i++){
    var t = tabs[i];
    if(t.getAttribute('data-platform') === platform){ t.classList.add('aeo-plat-on'); }
    else { t.classList.remove('aeo-plat-on'); }
  }
  var hint = document.getElementById('aeoPlatHint');
  if(hint) hint.innerHTML = '💡 ' + esc(meta.hint);
  var btn = document.getElementById('aeoRunBtn');
  if(btn){
    btn.style.background = meta.tone;
    btn.innerHTML = meta.emoji + ' ' + esc(meta.label) + ' で検索 (' + meta.dur + ')';
  }
}
function _closeAeoMonitorModal(){
  var m = document.getElementById('aeoModal');
  if(m) m.remove();
}
async function _runAeoMonitor(siteId, btnEl){
  var inp = document.getElementById('aeoQueryInput');
  if(!inp) return;
  var query = String(inp.value || '').trim();
  if(!query){
    inp.style.borderColor = '#dc2626';
    setTimeout(function(){ inp.style.borderColor = ''; }, 1500);
    return;
  }
  var modal = document.getElementById('aeoModal');
  var platform = (modal && modal.getAttribute('data-platform')) || 'perplexity';
  var meta = AEO_PLATFORM_META[platform] || AEO_PLATFORM_META.perplexity;
  var labelHTML = meta.emoji + ' ' + esc(meta.label) + ' で検索 (' + meta.dur + ')';
  if(btnEl){ btnEl.disabled = true; btnEl.innerHTML = '🔄 ' + esc(meta.label) + ' 実行中... (' + meta.dur + ')'; }
  try {
    var r = await api('POST', '/api/agents/' + encodeURIComponent(siteId) + '/aeo-monitor/run', { query, platform });
    if(r && r.ok){
      var site = (agents || []).find(function(a){ return a && a.id === siteId; });
      if(site){
        site.aeo_monitor = site.aeo_monitor || { runs: [] };
        site.aeo_monitor.runs = site.aeo_monitor.runs || [];
        site.aeo_monitor.runs.unshift({
          ts: new Date().toISOString(),
          query, platform: r.platform || platform,
          mentioned: !!r.mentioned,
          cited_urls: r.cited_urls || [],
          matched_urls: r.matched_urls || [],
          answer_excerpt: r.answer_excerpt || '',
        });
      }
      var msg = r.mentioned
        ? '✅ 自社引用あり (' + (r.matched_urls || []).length + ' URL) — ' + meta.label
        : '❌ 自社引用なし (' + (r.cited_urls || []).length + ' URL が引用) — ' + meta.label;
      showToast(msg, r.mentioned ? 'ok' : 'ng');
      // modal を re-open して履歴更新
      _closeAeoMonitorModal();
      setTimeout(function(){ _openAeoMonitorModal(siteId); }, 200);
    } else {
      showToast((r && r.detail) || (r && r.error) || '実行失敗', 'ng');
      if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = labelHTML; }
    }
  } catch(e){
    showToast((e && e.message) || 'ネットワークエラー', 'ng');
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = labelHTML; }
  }
}

// ── 互換 alias (= 既存 X 専用関数を維持) ──
function _openXConnectModal(siteId){ return _openSnsConnectModal('x', siteId); }
function _closeXConnectModal(){ return _closeSnsConnectModal(); }
async function _submitXConnect(siteId, btnEl){ return _submitSnsConnect('x', siteId, btnEl); }
async function _snsDisconnectX(siteId, btnEl){ return _snsDisconnect('x', siteId, btnEl); }

// ─── 🚀 1-CLICK X 投稿フロー (= onboarding 動線で chain) ───────────
// クリック 1 つで: 拡張 check → X login 確認 → preview modal → 投稿、を auto-chain。
// 各 step で問題があれば該当 modal を出して止まる (= 進捗を失わない)。
async function _oneClickXPost(siteId, btnEl){
  if(!siteId){
    // ボタンから siteId が来てなければ activeId を代用
    siteId = (typeof activeId !== 'undefined' && activeId) || null;
    if(!siteId){ showToast('サイトが見つかりません', 'ng'); return; }
  }
  if(btnEl){ btnEl.disabled = true; btnEl.innerHTML = '⏳ 確認中...'; }

  // Step 1: 拡張 paired チェック
  var extPaired = !!(me && me.extension_device_token);
  if(!extPaired){
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🚀 1 クリックで X に投稿する'; }
    _showOneClickStep('extension_missing', siteId);
    return;
  }

  // Step 2: X 接続状態確認 (= /api/sns/status)
  try {
    var status = await api('GET', '/api/sns/status');
    var xConnected = !!(status && status.x && status.x.connected);
    if(!xConnected){
      // 接続未済 → connect modal を出して、成功したら再度この flow を resume
      if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🚀 1 クリックで X に投稿する'; }
      _showOneClickStep('connect_needed', siteId);
      return;
    }
  } catch(e){
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🚀 1 クリックで X に投稿する'; }
    showToast('接続確認に失敗', 'ng');
    return;
  }

  // Step 3: 投稿コンテンツを取得 (= 既存の X 関連 artifact があれば中身、なければ AI に生成依頼)
  var xArt = null;
  if(typeof me !== 'undefined' && me && Array.isArray(me.artifacts)){
    xArt = me.artifacts.find(function(a){
      if(!a || a.chat_id !== siteId) return false;
      var t = String(a.title || a.filename || '').toLowerCase();
      return /twitter|スレッド|thread|tweet|\bx[\s_-]/i.test(t);
    });
  }
  // まだ X artifact ない場合: AI に生成依頼を chat に投げる
  if(!xArt){
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🚀 1 クリックで X に投稿する'; }
    showToast('まず AI に X スレッドを依頼してください (例:「X スレッドを 1 本作って」)', 'ok');
    // 自動で prompt をチャットに pre-fill して送信
    openSite(siteId);
    setTimeout(function(){
      var ta = document.getElementById('ci');
      if(ta){
        ta.value = 'このサイトの魅力を伝える X (Twitter) スレッドを 1 本作って。Hook → 価値 → 行動喚起 の構造で 5-7 ツイート。各 220-260 字、絵文字控えめ、ハッシュタグ 2-3 個まで。';
        try { exTA(ta); } catch(_){}
        // 自動送信はしない (= ユーザーが内容確認できる)
        ta.focus();
      }
    }, 300);
    return;
  }

  // Step 4: 既存 artifact の内容を抽出して confirm modal を出す
  // 簡易: title をベースに 1 tweet として preview を出す (= 実用上は AI 生成テキストを取り込むべき)
  // V1 では artifact のメタ情報だけ使い、AI に generated text を tweets payload に変換させる pattern を推奨
  if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🚀 1 クリックで X に投稿する'; }
  openXPostConfirmModal({
    site_id: siteId,
    text: '✨ ' + (xArt.title || 'X スレッド') + '\n\n' + ((typeof window !== 'undefined' && window.location && window.location.origin) || '') + '/generated/' + xArt.filename,
  });
}

// 1-click flow の各 step で問題があった時に出すミニ modal
function _showOneClickStep(kind, siteId){
  var existing = document.getElementById('oneClickStepModal');
  if(existing) existing.remove();
  var title, body, primaryLbl, primaryAction;
  if(kind === 'extension_missing'){
    title = '🔌 拡張をインストールしてください';
    body = 'AI が X に直接投稿するには Chrome 拡張が必要です。<br>(30 秒で完了。パスワード共有不要)';
    primaryLbl = '📥 Chrome 拡張をインストール';
    primaryAction = "window.open('/setup-extension.html', '_blank')";
  } else if(kind === 'connect_needed'){
    title = '🐦 X アカウントを接続';
    body = 'あなたの X プロフィール URL を貼るだけ (例: <code>https://x.com/yourname</code>)。<br>パスワード共有不要。';
    primaryLbl = '🔗 URL で接続';
    primaryAction = "_closeOneClickStep();_openXConnectModal('" + esc(siteId) + "')";
  } else {
    return;
  }
  var html = '<div id="oneClickStepModal" class="xp-overlay" onclick="if(event.target===this)_closeOneClickStep()">'
    + '<div class="xp-card" style="max-width:440px">'
    +   '<button class="xp-close" onclick="_closeOneClickStep()">×</button>'
    +   '<div class="xp-h">'
    +     '<div class="xp-h-tag" style="background:#fb923c"><span class="xp-h-ic">🚀</span> 1 クリック投稿セットアップ</div>'
    +     '<div style="font-size:17px;font-weight:900;color:var(--text);letter-spacing:-.01em;margin:8px 0 8px">' + title + '</div>'
    +     '<div style="font-size:13px;color:var(--text2);line-height:1.65;font-weight:600">' + body + '</div>'
    +   '</div>'
    +   '<div class="xp-actions">'
    +     '<button class="xp-cancel" onclick="_closeOneClickStep()">後で</button>'
    +     '<button class="xp-post" style="background:#fb923c" onclick="' + primaryAction + '">' + primaryLbl + '</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
}
function _closeOneClickStep(){
  var m = document.getElementById('oneClickStepModal');
  if(m) m.remove();
}
// modal 内 connect button → 接続成功したら自動で再 1-click flow
async function _oneClickConnectX(siteId, btnEl){
  if(btnEl){ btnEl.disabled = true; btnEl.innerHTML = '⏳ 接続中...'; }
  try {
    var r = await api('POST', '/api/sns/verify/x');
    if(r && r.ok){
      _closeOneClickStep();
      showToast('✅ X 接続完了。投稿に進みます', 'ok');
      setTimeout(function(){ _oneClickXPost(siteId); }, 600);
    } else {
      showToast((r && r.detail) || '接続失敗 — x.com にログインしてから再試行', 'ng');
      if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🔗 X に接続'; }
    }
  } catch(e){
    showToast((e && e.message) || 'ネットワークエラー', 'ng');
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = '🔗 X に接続'; }
  }
}

// ─── X 投稿 confirm モーダル (actual-like preview) ────────────────
// AI が generate した投稿テキストをユーザーが確認してから実投稿する。
// 引数: { text, tweets[]?, site_id }
// 「投稿」ボタン → POST /api/sns/post/x → 結果 toast。
function openXPostConfirmModal(opts){
  var existing = document.getElementById('xPostConfirm');
  if(existing) existing.remove();
  var siteId = opts.site_id || activeId;
  var snsCache = (window._snsStatusCache && window._snsStatusCache[siteId]) || {};
  var profile = (snsCache.x && snsCache.x.profile) || {};
  var username = profile.username || '@user';
  var displayName = username.replace(/^@/, '');
  var avatarUrl = profile.avatar_url || ''; // (= 未取得なら placeholder)

  var isThread = Array.isArray(opts.tweets) && opts.tweets.length >= 2;
  var tweets = isThread ? opts.tweets : [opts.text || ''];

  var tweetsHTML = tweets.map(function(t, i){
    var isLast = (i === tweets.length - 1);
    return '<div class="xp-tweet' + (isThread ? ' xp-thread' : '') + '">'
         +   '<div class="xp-tw-l">'
         +     '<div class="xp-tw-av">' + (avatarUrl ? '<img src="' + esc(avatarUrl) + '">' : displayName.charAt(0).toUpperCase()) + '</div>'
         +     (isThread && !isLast ? '<div class="xp-tw-line"></div>' : '')
         +   '</div>'
         +   '<div class="xp-tw-r">'
         +     '<div class="xp-tw-h">'
         +       '<span class="xp-tw-nm">' + esc(displayName) + '</span>'
         +       '<span class="xp-tw-uh">' + esc(username) + ' · 今</span>'
         +     '</div>'
         +     '<div class="xp-tw-tx">' + esc(t).replace(/\n/g, '<br>') + '</div>'
         +     '<div class="xp-tw-foot">'
         +       '<span>💬 —</span><span>🔁 —</span><span>♥ —</span><span>📊 —</span>'
         +     '</div>'
         +   '</div>'
         + '</div>';
  }).join('');

  var html = '<div id="xPostConfirm" class="xp-overlay" onclick="if(event.target===this)closeXPostConfirmModal()">'
    + '<div class="xp-card">'
    +   '<button class="xp-close" onclick="closeXPostConfirmModal()" aria-label="閉じる">×</button>'
    +   '<div class="xp-h">'
    +     '<div class="xp-h-tag"><span class="xp-h-ic">𝕏</span> 投稿前の確認</div>'
    +     '<div class="xp-h-sub">この内容で X に' + (isThread ? ' ' + tweets.length + ' 連投スレッドを' : '') + '投稿します</div>'
    +   '</div>'
    +   '<div class="xp-preview">' + tweetsHTML + '</div>'
    +   '<div class="xp-meta">'
    +     '<div>📊 文字数: ' + tweets.map(function(t){return t.length;}).join(' / ') + '</div>'
    +     '<div>👤 投稿先: <b>' + esc(username) + '</b></div>'
    +   '</div>'
    +   '<div class="xp-actions">'
    +     '<button class="xp-cancel" onclick="closeXPostConfirmModal()">キャンセル</button>'
    +     '<button class="xp-post" onclick="_submitXPost(\'' + esc(siteId) + '\', ' + (isThread ? 'true' : 'false') + ', this)">' + (isThread ? '🚀 ' + tweets.length + ' 連投投稿' : '🚀 投稿する') + '</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // payload を modal element に格納 (= submit 時に使う)
  var el = document.getElementById('xPostConfirm');
  if(el){
    el._xpPayload = isThread ? { tweets: tweets } : { text: tweets[0] };
  }
}
function closeXPostConfirmModal(){
  var m = document.getElementById('xPostConfirm');
  if(m) m.remove();
}
async function _submitXPost(siteId, isThread, btnEl){
  var el = document.getElementById('xPostConfirm');
  if(!el || !el._xpPayload) return;
  var payload = el._xpPayload;
  if(btnEl){ btnEl.disabled = true; btnEl.innerHTML = '🔄 投稿中... (~10s)'; }
  try {
    var r = await api('POST', '/api/sns/post/x', payload);
    if(r && r.ok){
      closeXPostConfirmModal();
      showToast('✅ X に投稿しました' + (r.url ? ' → ' + r.url : ''), 'ok');
      // チャットに reply 追加
      var ag = (agents || []).find(function(a){ return a && a.id === siteId; });
      if(ag){
        ag.history = ag.history || [];
        ag.history.push({
          id: 'a_xpost_' + Date.now(),
          role: 'assistant',
          time: now(),
          content: '✅ X に投稿しました' + (r.url ? '\n\n' + r.url : ''),
        });
        try { renderMsgs(ag); } catch(_){}
      }
    } else {
      showToast('⚠️ 投稿失敗: ' + ((r && r.detail) || (r && r.error) || 'unknown'), 'ng');
      if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = isThread ? '🚀 スレッド投稿' : '🚀 投稿する'; }
    }
  } catch(e){
    showToast((e && e.message) || 'ネットワークエラー', 'ng');
    if(btnEl){ btnEl.disabled = false; btnEl.innerHTML = isThread ? '🚀 スレッド投稿' : '🚀 投稿する'; }
  }
}

// 削除確認 — 簡易 confirm。ユーザーが OK したら本当に消す。
function _confirmDeleteSite(siteId){
  if(!siteId) return;
  var ag = (agents || []).find(function(a){ return a && a.id === siteId; });
  if(!ag) return;
  var host = _siteHostname(ag);
  if(!confirm('「' + host + '」の AI チームを削除します。\n会話履歴 / 納品物 / スケジュール もすべて消えます。\n本当に削除しますか?')) return;
  // 既存の deleteAgent (もしあれば) を呼ぶ — UI 側のリスト除外まで含む。
  if(typeof deleteAgent === 'function'){
    try { deleteAgent(siteId); return; } catch(e){ console.warn('[delete-site] deleteAgent failed:', e); }
  }
  // フォールバック: API 直叩き
  api('DELETE', '/api/agents/' + encodeURIComponent(siteId))
    .then(function(){
      agents = (agents || []).filter(function(a){ return a && a.id !== siteId; });
      activeId = null;
      try { renderHomeDashboard(); } catch(_){}
      try { renderAgList(); } catch(_){}
      showToast && showToast('削除しました', 'ok');
    })
    .catch(function(e){
      showToast && showToast((e && e.message) || '削除に失敗しました', 'ng');
    });
}

// Quick Action のハンドラ — チャットに飛んで prompt を pre-fill して送信
function _quickAskAI(siteId, prompt){
  if(!siteId || !prompt) return;
  openSite(siteId);  // チャット画面に切替
  setTimeout(function(){
    var ta = document.getElementById('ci');
    if(ta){
      ta.value = prompt;
      try { exTA(ta); } catch(_){}
      ta.focus();
      // すぐに送信したいユーザー向けに、ボタンの色だけ強調 (= 自動送信はしない)
    }
  }, 250);
}

// 「+ 新しいサイトを追加」モーダル
function openAddSiteModal(){
  var existing = document.getElementById('addSiteModal');
  if(existing) existing.remove();
  var html = '<div id="addSiteModal" class="add-site-overlay" onclick="if(event.target===this)closeAddSiteModal()">'
    + '<div class="add-site-card">'
    +   '<button class="add-site-close" onclick="closeAddSiteModal()" aria-label="閉じる">×</button>'
    +   '<div class="add-site-tag"><span class="hm-tag-dot"></span>サイトを追加</div>'
    +   '<h2>あなたのサイトの URL を教えてください</h2>'
    +   '<p>AI が自動で診断して、専門チームを編成します。60 秒で最初の納品物が届きます。</p>'
    +   '<form class="add-site-form" onsubmit="return _submitAddSite(event)">'
    +     '<input id="addSiteInput" class="add-site-input" type="url" placeholder="https://yoursite.com" autocomplete="off" spellcheck="false" />'
    +     '<button type="submit" class="add-site-go">AI チームを派遣 <span class="arrow">→</span></button>'
    +   '</form>'
    +   '<div class="add-site-note">無料プランは 5 サイトまで ・ クレカ不要</div>'
    + '</div>'
    + '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  setTimeout(function(){ var inp = document.getElementById('addSiteInput'); if(inp) inp.focus(); }, 50);
}
function closeAddSiteModal(){
  var m = document.getElementById('addSiteModal');
  if(m) m.remove();
}
async function _submitAddSite(ev){
  if(ev && ev.preventDefault) ev.preventDefault();
  var inp = document.getElementById('addSiteInput');
  if(!inp) return false;
  var raw = String(inp.value || '').trim();
  if(!raw){ inp.focus(); return false; }
  var url = raw;
  if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    var u = new URL(url);
    if(!u.hostname || u.hostname.indexOf('.') < 0) throw new Error('invalid');
  } catch(e){
    inp.style.borderColor = '#dc3232';
    setTimeout(function(){ inp.style.borderColor = ''; }, 1500);
    return false;
  }
  var btn = ev.target.querySelector('button[type="submit"]');
  if(btn){ btn.disabled = true; btn.innerHTML = 'AI チームを編成中…'; }
  try {
    var r = await api('POST', '/api/onboarding/site', { site_url: url });
    if(r && r.agent && r.agent.id){
      closeAddSiteModal();
      window.location.href = '/onboarding.html?agent_id=' + encodeURIComponent(r.agent.id);
      return false;
    }
  } catch(e){
    showToast((e && e.message) || 'エラーが発生しました', 'ng');
    if(btn){ btn.disabled = false; btn.innerHTML = 'AI チームを派遣 <span class="arrow">→</span>'; }
  }
  return false;
}

// サイトを「アクティブ」にする → チャットを実際に開く
// (= 旧 openSite は activeId 切替のみだったが、それだとチャットが開かない
//   バグになってたので、明示的に openAgent を呼んでチャット画面を開く)
function openSite(siteId){
  if(!siteId) return;
  // _allSitesMode に居たら抜ける (= 「すべてのサイト」一覧から site をクリック)
  window._allSitesMode = false;
  try { openAgent(siteId); } catch(e){ console.warn('[openSite] openAgent failed:', e && e.message); }
}

// ── KPI 設定モーダル ──────────────────────────────────────
// サイトの目標数値 (月間 PV / CVR / 月間リード数) を入力 → agent.kpi に保存。
// GA4 連携時は実数値と比較する基準として使う。
function openKpiModal(siteId){
  if(!siteId) return;
  var ag = (agents || []).find(function(a){ return a && a.id === siteId; });
  if(!ag) return;
  var kpi = ag.kpi || {};
  var existing = document.getElementById('kpiModal');
  if(existing) existing.remove();
  var html = '<div id="kpiModal" class="add-site-overlay" onclick="if(event.target===this)closeKpiModal()">'
    + '<div class="add-site-card kpi-card">'
    +   '<button class="add-site-close" onclick="closeKpiModal()">×</button>'
    +   '<div class="add-site-tag"><span class="hm-tag-dot"></span>KPI 設定</div>'
    +   '<h2>月間の目標を決める</h2>'
    +   '<p>目標を設定すると、AI が達成度を毎日レポートしてくれます。空欄でも OK。</p>'
    +   '<form class="kpi-form" onsubmit="return _submitKpi(event,\'' + esc(siteId) + '\')">'
    +     '<label class="kpi-field">'
    +       '<span class="kpi-lbl">月間 PV 目標</span>'
    +       '<input type="number" id="kpiPv" min="0" placeholder="例: 10000" value="' + (kpi.pv || '') + '">'
    +     '</label>'
    +     '<label class="kpi-field">'
    +       '<span class="kpi-lbl">目標 CVR (%)</span>'
    +       '<input type="number" id="kpiCvr" min="0" step="0.1" placeholder="例: 2.5" value="' + (kpi.cvr || '') + '">'
    +     '</label>'
    +     '<label class="kpi-field">'
    +       '<span class="kpi-lbl">月間リード / コンバージョン目標</span>'
    +       '<input type="number" id="kpiLeads" min="0" placeholder="例: 50" value="' + (kpi.leads || '') + '">'
    +     '</label>'
    +     '<button type="submit" class="add-site-go">保存 <span class="arrow">→</span></button>'
    +   '</form>'
    + '</div>'
    + '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  setTimeout(function(){ var inp = document.getElementById('kpiPv'); if(inp) inp.focus(); }, 50);
}
function closeKpiModal(){ var m = document.getElementById('kpiModal'); if(m) m.remove(); }
async function _submitKpi(ev, siteId){
  if(ev && ev.preventDefault) ev.preventDefault();
  var pv = parseInt(document.getElementById('kpiPv').value || '0', 10) || 0;
  var cvr = parseFloat(document.getElementById('kpiCvr').value || '0') || 0;
  var leads = parseInt(document.getElementById('kpiLeads').value || '0', 10) || 0;
  var btn = ev.target.querySelector('button[type="submit"]');
  if(btn){ btn.disabled = true; btn.innerHTML = '保存中…'; }
  try {
    var r = await api('POST', '/api/agents/' + siteId + '/kpi', { pv: pv, cvr: cvr, leads: leads });
    if(r && r.ok){
      var ag = (agents || []).find(function(a){ return a && a.id === siteId; });
      if(ag) ag.kpi = { pv: pv, cvr: cvr, leads: leads };
      closeKpiModal();
      showToast('KPI を保存しました', 'ok');
      try { renderHomeDashboard(); } catch(_){}
    }
  } catch(e){
    showToast((e && e.message) || 'エラー', 'ng');
    if(btn){ btn.disabled = false; btn.innerHTML = '保存 <span class="arrow">→</span>'; }
  }
  return false;
}

// ── 旧 agent → site migration モーダル ─────────────────────────
// legacy agent を「サイトに紐づけて AI チームに移行」するための URL 入力モーダル。
// クリックで開き、URL → /api/onboarding/migrate を叩いて agent を更新する。
function openMigrateAgentModal(agentId){
  if(!agentId) return;
  var ag = (agents || []).find(function(a){ return a && a.id === agentId; });
  if(!ag) return;
  var existing = document.getElementById('addSiteModal');
  if(existing) existing.remove();
  var html = '<div id="addSiteModal" class="add-site-overlay" onclick="if(event.target===this)closeAddSiteModal()">'
    + '<div class="add-site-card">'
    +   '<button class="add-site-close" onclick="closeAddSiteModal()">×</button>'
    +   '<div class="add-site-tag"><span class="hm-tag-dot"></span>サイトに紐づける</div>'
    +   '<h2>' + esc(ag.name || 'エージェント') + ' をサイトに紐づける</h2>'
    +   '<p>このエージェントを「Web サイト集客 AI チーム」に移行します。'
    +   '会話履歴・成果物はそのまま残ります。</p>'
    +   '<form class="add-site-form" onsubmit="return _submitMigrateAgent(event,\'' + esc(agentId) + '\')">'
    +     '<input id="addSiteInput" class="add-site-input" type="url" placeholder="https://yoursite.com" autocomplete="off" />'
    +     '<button type="submit" class="add-site-go">移行する <span class="arrow">→</span></button>'
    +   '</form>'
    +   '<div class="add-site-note">既存の会話履歴・成果物は保持されます</div>'
    + '</div>'
    + '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  setTimeout(function(){ var inp = document.getElementById('addSiteInput'); if(inp) inp.focus(); }, 50);
}
async function _submitMigrateAgent(ev, agentId){
  if(ev && ev.preventDefault) ev.preventDefault();
  var inp = document.getElementById('addSiteInput');
  if(!inp) return false;
  var raw = String(inp.value || '').trim();
  if(!raw){ inp.focus(); return false; }
  var url = raw;
  if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { var u = new URL(url); if(!u.hostname || u.hostname.indexOf('.') < 0) throw new Error('invalid'); }
  catch(e){ inp.style.borderColor = '#dc3232'; setTimeout(function(){ inp.style.borderColor = ''; }, 1500); return false; }
  var btn = ev.target.querySelector('button[type="submit"]');
  if(btn){ btn.disabled = true; btn.innerHTML = '移行中…'; }
  try {
    var r = await api('POST', '/api/onboarding/migrate', { agent_id: agentId, site_url: url });
    if(r && r.agent){
      // ローカルの agents[] を更新
      var idx = agents.findIndex(function(a){ return a && a.id === agentId; });
      if(idx >= 0) agents[idx] = r.agent;
      closeAddSiteModal();
      showToast('サイトに紐づけました', 'ok');
      try { renderAgList(); } catch(e){}
      try { renderHomeDashboard(); } catch(e){}
      // この agent をアクティブに
      openSite(agentId);
      return false;
    }
  } catch(e){
    showToast((e && e.message) || 'エラーが発生しました', 'ng');
    if(btn){ btn.disabled = false; btn.innerHTML = '移行する <span class="arrow">→</span>'; }
  }
  return false;
}

function _homeCreateCard(cls, ic, title, desc, onclick){
  return '<button class="hm-ce'+(cls?' '+cls:'')+'" onclick="'+onclick+'">'
    + '<div class="hm-ce-ic">'+ic+'</div>'
    + '<div class="hm-ce-tx"><h4>'+esc(title)+'</h4><p>'+esc(desc)+'</p></div>'
    + '</button>';
}

// One エージェント図鑑 card — rich stats for a single AI.
function _homeDexCard(a){
  var p  = a.progress || {};
  var oc = a.outcomes || {};
  var tr = a.trust || {};
  var lvl = p.level || 1;
  var srDisp = (oc.total > 0) ? ((oc.success_rate||0)+'%') : '—';
  var outN = p.output_count || 0;
  var into = p.xp_into_level || 0;
  var need = p.xp_to_next || 0;
  var pct  = need > 0 ? Math.max(0, Math.min(100, Math.round(into/need*100))) : 0;
  var remain = Math.max(0, need - into);
  var sk = SKILLS.find(function(s){ return a.skills && a.skills[0] === s.id; });
  var role = sk ? (sk.icon+' '+sk.name) : L('AI エージェント','AI agent');
  return '<div class="hm-dc" onclick="_openAgentCard(\''+esc(a.id)+'\')" title="'+esc(a.name||'AI')+'">'
    + '<div class="hm-dc-av">'+_avHTML(a.avatar)+'</div>'
    + '<div class="hm-dc-info">'
    +   '<div class="hm-dc-top"><span class="hm-dc-nm">'+esc(a.name||'AI')+'</span>'
    +     '<span class="hm-dc-lv">Lv.'+lvl+'</span></div>'
    +   '<div class="hm-dc-role">'+esc(role)+'</div>'
    +   '<div class="hm-dc-metrics">'
    +     '<span class="hm-dc-m"><b class="cy">'+esc(srDisp)+'</b> '+esc(L('成功率','success'))+'</span>'
    +     '<span class="hm-dc-m"><b>'+outN+'</b> '+esc(L('出力','outputs'))+'</span>'
    +     '<span class="hm-dc-m"><b>Lv.'+(tr.level||1)+'</b> '+esc(L('信頼','trust'))+'</span>'
    +   '</div>'
    +   '<div class="hm-dc-xp"><i style="width:'+pct+'%"></i></div>'
    +   '<div class="hm-dc-xptext">'+esc(L('次のレベルまで '+remain+' XP', remain+' XP to next level'))+'</div>'
    + '</div></div>';
}
// エージェント図鑑 — 5 most-recently-active cards by default; "もっと見る"
// reveals the rest. The ＋雇う card is always last. Tap a card → _openAgentCard.
function _homeDexHTML(ais){
  var sorted = (ais||[]).slice().sort(_sortByLastActivity);
  var CAP = 5;
  var expanded = !!window._homeDexExpanded;
  var collapsed = sorted.length > CAP && !expanded;
  var shown = collapsed ? sorted.slice(0, CAP) : sorted;
  var cells = shown.map(_homeDexCard).join('');
  cells += '<div class="hm-dc add" onclick="openNewAgent()" title="'+esc(L('新しい AI を雇う','Hire a new AI'))+'">'
    + '<div class="hm-dc-av">＋</div>'
    + '<div class="hm-dc-info"><div class="hm-dc-at">'+esc(L('AI を雇う','Hire an AI'))+'</div>'
    +   '<div class="hm-dc-as">'+esc(L('専門 AI を何人でも図鑑に追加','Add as many specialist AIs as you like'))+'</div></div>'
    + '</div>';
  var html = '<div class="hm-dex">' + cells + '</div>';
  if(sorted.length > CAP){
    var rest = sorted.length - CAP;
    html += '<button class="hm-dex-more" onclick="_toggleHomeDex()">'
      + (expanded ? esc(L('▴ 閉じる','▴ Show less'))
                  : esc(L('▾ もっと見る（残り '+rest+' 体）','▾ Show '+rest+' more')))
      + '</button>';
  }
  return html;
}
// Toggle the dex between collapsed (5 cards) and expanded (all). The flag
// lives on window so it survives Home re-renders within the session.
function _toggleHomeDex(){
  window._homeDexExpanded = !window._homeDexExpanded;
  var wrap = document.getElementById('homeDexWrap');
  if(wrap){
    var ais = (agents||[]).filter(function(a){ return a && !a.is_group; });
    wrap.innerHTML = _homeDexHTML(ais);
  }
}

// 最近の会話 — unified DM/Group/Team list, newest first. Returns '' when empty.
function _homeConvoSectionHTML(list){
  var convos = (list||[]).filter(function(a){
    if(!a) return false;
    return (Array.isArray(a.history) && a.history.length > 0)
      || (typeof a.last_message === 'string' && a.last_message);
  });
  convos.sort(_sortByLastActivity);
  convos = convos.slice(0, 6);
  if(convos.length === 0) return '';
  var rows = convos.map(function(a){
    var tag = (a.is_group && a.is_team) ? 'team' : (a.is_group ? 'group' : 'dm');
    var tagLabel = tag==='team' ? 'Team' : (tag==='group' ? 'Group' : 'DM');
    var preview = esc(_previewFromHistory(a) || '');
    var lastTime = a.last_at
      || (a.history && a.history.slice(-1)[0] && a.history.slice(-1)[0].time)
      || a.created_at;
    var timeStr = esc(_formatChatTime(lastTime) || '');
    return '<div class="hm-cv" onclick="openAgent(\''+esc(a.id)+'\')">'
      + '<div class="hm-cv-av">'+_avHTML(a.avatar)+'</div>'
      + '<div class="hm-cv-body">'
      +   '<div class="hm-cv-top"><span class="hm-cv-nm">'+esc(a.name||'AI')+'</span>'
      +     '<span class="hm-cv-tag '+tag+'">'+tagLabel+'</span></div>'
      +   '<div class="hm-cv-msg">'+preview+'</div>'
      + '</div>'
      + '<div class="hm-cv-time">'+timeStr+'</div>'
      + '</div>';
  }).join('');
  return '<div class="hm-sec">'
    + '<div class="hm-sec-h"><h3>💬 '+esc(L('最近の会話','Recent conversations'))+'</h3></div>'
    + '<div class="hm-convo">'+rows+'</div>'
    + '</div>';
}

// New-user empty state: welcome + 雇う→任せる→成果 guide + hire CTAs.
function _homeNewUserHTML(nameStr){
  var step = function(n, e, h, p){
    return '<div class="hm-step"><div class="hm-step-n">'+n+'</div>'
      + '<div class="hm-step-e">'+e+'</div><h3>'+esc(h)+'</h3><p>'+esc(p)+'</p></div>';
  };
  return '<div class="hm-welcome">'
    +   '<h2>'+esc(L('ようこそ、'+nameStr+' さん 🍑','Welcome, '+nameStr+' 🍑'))+'</h2>'
    +   '<div class="hm-welcome-lead">'+esc(L('まずは最初の AI を1体雇って、仕事を任せてみましょう。','Hire your first AI and hand it a task to get started.'))+'</div>'
    + '</div>'
    + '<div class="hm-steps">'
    +   step('1','🤖',L('雇う','Hire'),L('得意分野を選んで、あなた専属の AI を1体つくる','Pick a specialty and build your own dedicated AI'))
    +   step('2','📋',L('任せる','Delegate'),L('やってほしい仕事を伝えるだけ。AI が手を動かす','Just tell it the job — the AI does the work'))
    +   step('3','📈',L('成果を受け取る','Get results'),L('こなすほど AI がレベルアップ。チームが強くなる','The more it does, the more your team levels up'))
    + '</div>'
    + '<div class="hm-cta-row">'
    +   '<button class="hm-cta-primary" onclick="openNewAgent()">🤖 '+esc(L('最初の AI を雇う','Hire your first AI'))+'</button>'
    +   '<button class="hm-cta-sub" onclick="openTemplate()">📋 '+esc(L('テンプレートから選ぶ','Browse templates'))+'</button>'
    +   '<button class="hm-cta-sub" onclick="openAgentStore()">🏪 '+esc(L('Agent Store を見る','Visit Agent Store'))+'</button>'
    + '</div>';
}

function renderAgList(){
  // ホームダッシュボードを同期 (= activeId 変更時に再描画)
  try { renderHomeDashboard(); } catch(e){}
  var owned = agents || [];
  // サイト (= AI チーム) と legacy agent を分離
  var sites = owned.filter(_isSiteAgent);
  var legacy = owned.filter(function(a){
    return a && !a.site_url && !a.is_group && !a.team_origin;
  });

  var html = '';

  // 1) 「+ サイトを追加」 CTA
  html += '<button class="ag-add-site" onclick="openAddSiteModal()">'
       +    '<span class="ag-add-ic">+</span>'
       +    '<span class="ag-add-tx">新しいサイトを追加</span>'
       +  '</button>';

  // 2) サイト一覧 (= AI チーム)
  if(sites.length > 0){
    html += '<div class="sb-sec-h sb-sec-sites">あなたのサイト <span class="sb-sec-cnt">' + sites.length + '</span></div>';
    html += sites.slice().sort(_sortByLastActivity).map(_renderSiteItem).join('');
  } else {
    html += '<div class="ag-empty">サイトを追加すると<br>AI チームが派遣されます</div>';
  }

  // 3) Legacy agents (旧 agent / 移行可能)
  if(legacy.length > 0){
    var lcCollapsed = false;
    try { lcCollapsed = (localStorage.getItem('mya_legacy_collapsed') === '1'); } catch(e){}
    var caret = lcCollapsed ? '▸' : '▾';
    html += '<div class="sb-sec-h sb-sec-legacy" onclick="_toggleLegacy()">'
         +   '<span class="sb-sec-caret">' + caret + '</span> 過去のエージェント '
         +   '<span class="sb-sec-cnt">' + legacy.length + '</span>'
         + '</div>';
    if(!lcCollapsed){
      html += legacy.slice().sort(_sortByLastActivity).map(function(a){
        // 既存の _renderAgItem に「サイトに紐づける」ボタンを overlay 付加
        var base = _renderAgItem(a, false);
        var migrateBtn = '<button class="ag-migrate" onclick="event.stopPropagation();openMigrateAgentModal(\'' + esc(a.id) + '\')" title="サイトに紐づけて AI チームに移行">→ 紐づける</button>';
        // base の末尾 div を分解して migrateBtn を挿入
        return base.replace(/<\/div>\s*$/, migrateBtn + '</div>');
      }).join('');
    }
  }

  var listEl = document.getElementById('agList');
  if(listEl) listEl.innerHTML = html;
}

function _toggleLegacy(){
  var was = false;
  try { was = (localStorage.getItem('mya_legacy_collapsed') === '1'); } catch(e){}
  try { localStorage.setItem('mya_legacy_collapsed', was ? '0' : '1'); } catch(e){}
  renderAgList();
}

// サイト 1 件のサイドバーアイテム描画
function _renderSiteItem(site){
  var v = site.site_vertical || 'other';
  var ic = _verticalIcon(v);
  var hostname = _siteHostname(site);
  var todayN = _siteTodayArtifacts(site.id).length;
  var summary = todayN > 0 ? '今日 ' + todayN + ' 件' : 'チーム稼働中';
  var isActive = (activeId === site.id);
  // AI が今このサイトで動いているか (= streaming 中)
  var isLive = !!(window._streamingAgents && window._streamingAgents.has(site.id))
            || (site.id === window._streamingAgentId);
  var liveDot = isLive ? '<span class="ag-site-live" title="AI が作業中"></span>' : '';
  return '<div class="ag-site' + (isActive ? ' active' : '') + (isLive ? ' live' : '') + '" onclick="openSite(\'' + esc(site.id) + '\')">'
       +   '<div class="ag-site-ic">' + ic + liveDot + '</div>'
       +   '<div class="ag-site-bd">'
       +     '<div class="ag-site-host">' + esc(hostname) + '</div>'
       +     '<div class="ag-site-meta">' + (isLive ? '<span class="ag-site-meta-live">▶ 作業中…</span>' : esc(summary)) + '</div>'
       +   '</div>'
       + '</div>';
}
function _toggleSbSection(key){
  var col;
  try{ col = JSON.parse(localStorage.getItem('mya_sb_collapsed')||'{}'); }catch(e){ col = {}; }
  col[key] = !col[key];
  try{ localStorage.setItem('mya_sb_collapsed', JSON.stringify(col)); }catch(e){}
  renderAgList();
}

// Sort by most-recent activity descending. Falls back to created_at.
function _sortByLastActivity(a, b){
  const at = _lastActivityMs(a);
  const bt = _lastActivityMs(b);
  return bt - at;
}
function _lastActivityMs(a){
  // Try last_at (ISO string preferred), then fall back to history's last entry,
  // then created_at. "HH:MM" strings (legacy) parse to NaN — we treat that as
  // a "recent today" signal so groups don't sink to the bottom of the list.
  if(a.last_at){
    const t = new Date(a.last_at).getTime();
    if(isFinite(t)) return t;
    // legacy HH:MM-only — treat as today (so it stays near top)
    if(typeof a.last_at === 'string' && /^\d{1,2}:\d{2}$/.test(a.last_at.trim())){
      return Date.now();
    }
  }
  if(a.created_at){
    const t = new Date(a.created_at).getTime();
    if(isFinite(t)) return t;
  }
  return 0;
}

// Format a timestamp like LINE's chat list: 9:40 / 昨日 / 月 / 5/3
// Accepts either an ISO string, a Date, or a "HH:MM" literal (which we treat as today).
function _formatChatTime(ts){
  if(!ts) return '';
  // Already an "HH:MM" / "H:MM" format from agent.history[-1].time → return verbatim
  if(typeof ts === 'string' && /^\d{1,2}:\d{2}$/.test(ts.trim())) return ts.trim();
  const d = new Date(ts);
  if(!isFinite(d.getTime())) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if(sameDay){
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }
  const oneDay = 24*60*60*1000;
  const diff = now.getTime() - d.getTime();
  if(diff < oneDay*2 && new Date(now.getTime()-oneDay).toDateString() === d.toDateString()){
    return '昨日';
  }
  if(diff < oneDay*7){
    const days = ['日','月','火','水','木','金','土'];
    return days[d.getDay()];
  }
  return (d.getMonth()+1) + '/' + d.getDate();
}

// Pull a short preview string from an agent's last message.
function _previewFromHistory(a){
  // For joined groups, server provides last_message
  if(typeof a.last_message === 'string' && a.last_message) return a.last_message.slice(0, 60);
  const h = (a && a.history) || [];
  // Find the last non-system entry
  for(let i = h.length - 1; i >= 0; i--){
    const m = h[i];
    if(!m || m.role === 'system') continue;
    let body = '';
    if(typeof m.content === 'string') body = m.content;
    else if(Array.isArray(m.content)){
      const t = m.content.find(b => b && b.type === 'text');
      body = (t && t.text) || '';
    }
    body = body.replace(/\s+/g, ' ').trim();
    // Prefix with speaker name for group user messages
    let prefix = '';
    if(m.role === 'user'){
      if(m.user_name && m.user_id !== me?.id) prefix = m.user_name + ': ';
      else prefix = (isJa ? 'あなた: ' : 'You: ');
    } else if(m.role === 'assistant'){
      // No prefix needed (the agent name is the chat name)
      prefix = '';
    }
    return (prefix + body).slice(0, 60);
  }
  return '';
}

function _renderAgItem(a, isJoined){
  const id = esc(a.id);
  const onActive = (a.id === activeId) ? ' on' : '';
  const isGroup = !!a.is_group;
  // "Working" indicator — set when streaming chat/thread reply is in flight
  // for this agent. Driven by the _streamingAgents Set maintained by
  // _setChatStreaming / _setThreadStreaming. Falls back to the single-id
  // mirror for safety. Multiple agents can be lit at once.
  const isWorking = !!(window._streamingAgents && window._streamingAgents.has(a.id))
                 || (a.id === window._streamingAgentId);
  const workingDot = isWorking ? '<span class="ag-working-dot" title="作業中"></span>' : '';
  // Single avatar (matches both groups and DMs in the new design)
  const avatarHTML = `<div class="ag-icon">${_avHTML(a.avatar)}${workingDot}</div>`;
  // Last message preview (LINE-style)
  const preview = _previewFromHistory(a);
  // Time string
  const timeStr = _formatChatTime(a.last_at || (a.history && a.history.slice(-1)[0]?.time) || a.created_at);
  // Unread badge: TODO — for now, derive from `unread_count` if server provides it,
  // otherwise omit. Group joined records may include unread.
  const unread = a.unread_count || 0;
  // Proactive nudge: when an undismissed/unacted nudge exists, replace the
  // numeric unread badge with a 💡 so the user knows the AI has something
  // to say (even when there are no unread group messages).
  const hasActiveNudge = Array.isArray(a.proactive_nudges) && a.proactive_nudges.some(function(n){return n && !n.dismissed && !n.acted;});
  const unreadBadge = hasActiveNudge
    ? `<div class="ag-unread" style="background:linear-gradient(135deg,#fbbf24,#f59e0b)" title="${L('提案あり','New suggestion')}">💡</div>`
    : (unread > 0
        ? `<div class="ag-unread">${unread > 99 ? '99+' : unread}</div>`
        : '');

  // Joined groups don't support drag-reorder
  const dragAttrs = isJoined ? '' : 'draggable="true" ondragstart="agDragStart(event)" ondragover="agDragOver(event)" ondragleave="agDragLeave(event)" ondrop="agDrop(event)" ondragend="agDragEnd(event)"';

  return `<div class="ag-item ag-item-talk${onActive}" id="ai-${id}" data-agid="${id}" ${dragAttrs} onclick="openAgent('${id}')">
    ${avatarHTML}
    <div class="ag-meta">
      <div class="ag-name-row">
        <div class="ag-name" title="${esc(a.name)}">${esc(a.name)}</div>
        ${timeStr ? `<div class="ag-time">${esc(timeStr)}</div>` : ''}
      </div>
      <div class="ag-pv-row">
        <div class="ag-pv" title="${esc(preview)}">${esc(preview || (isGroup ? (isJoined?'参加中':'ホスト') : ((a.skills||[]).map(s=>SKILLS.find(x=>x.id===s)?.name||s).join(' · ')||'AI')))}</div>
        ${unreadBadge}
      </div>
    </div>
  </div>`;
}

/* ── Drag-and-drop reorder ─────────────────────────────────── */
var _dragSrcId = null;
function agDragStart(ev){
  var el = ev.currentTarget;
  _dragSrcId = el.dataset.agid;
  el.classList.add('dragging');
  try{ ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', _dragSrcId); }catch(e){}
}
function agDragOver(ev){
  if(!_dragSrcId) return;
  ev.preventDefault();
  try{ ev.dataTransfer.dropEffect = 'move'; }catch(e){}
  var el = ev.currentTarget;
  if(el.dataset.agid !== _dragSrcId) el.classList.add('drop-target');
}
function agDragLeave(ev){
  ev.currentTarget.classList.remove('drop-target');
}
async function agDrop(ev){
  ev.preventDefault();
  var dst = ev.currentTarget;
  dst.classList.remove('drop-target');
  if(!_dragSrcId) return;
  var dstId = dst.dataset.agid;
  if(!dstId || dstId === _dragSrcId) return;
  // Reorder local agents[]
  var srcIdx = agents.findIndex(function(a){return a.id === _dragSrcId;});
  var dstIdx = agents.findIndex(function(a){return a.id === dstId;});
  if(srcIdx < 0 || dstIdx < 0) return;
  var moved = agents.splice(srcIdx, 1)[0];
  agents.splice(dstIdx, 0, moved);
  renderAgList();
  // Persist server-side (best-effort)
  try{ await api('POST','/api/agents/reorder', {order: agents.map(function(a){return a.id;})}); }
  catch(err){ showToast(err.message||'並び替えの保存に失敗','ng'); }
}
function agDragEnd(ev){
  document.querySelectorAll('.ag-item').forEach(function(el){
    el.classList.remove('dragging');
    el.classList.remove('drop-target');
  });
  _dragSrcId = null;
}

/* ── Open agent / chat ─────────────────────────────── */
async function openAgent(id){
  // Flag for renderMsgs — snap to bottom on the first render after switching
  // chats. Cleared once that render runs.
  window._chatJustOpened = true;
  // Close any open thread from a different chat — composer mode (Option A)
  // could otherwise post the user's next message to the wrong thread.
  if(window._activeThreadParent){
    try { _closeThread(); } catch(e){}
  }
  let ag = agents.find(a=>a.id===id);
  // If not in own list, look in joined groups (fetch full record from host)
  let joined = null;
  if(!ag){
    joined = _joinedGroups.find(g => g.id === id);
    if(!joined) return;
    try {
      const m = await api('GET', '/api/agents/' + id + '/members');
      ag = {
        id: id,
        name: m.name || joined.name,
        avatar: m.avatar || joined.avatar,
        skills: m.skills || ['comms'],
        persona: m.persona || '',
        is_group: true,
        host_id: m.host_id || joined.host_id,
        members: m.members || [],
        // Full prior history fetched from host so invitees see context
        history: Array.isArray(m.history) ? m.history : [],
        _is_joined_group: true,
      };
      if(!agents.find(a => a.id === id)){
        agents = agents.concat([ag]);
      }
    } catch(e){
      showToast((isJa?'グループ読み込み失敗: ':'Group load failed: ')+e.message, 'ng');
      return;
    }
  } else if(ag.is_group && !ag._is_joined_group){
    // For hosted groups, refresh history + members from server so we pick up
    // any system messages added by joining users. Best-effort: fall back to
    // the local copy on failure.
    try {
      const m = await api('GET', '/api/agents/' + id + '/members');
      if(m){
        if(Array.isArray(m.history) && m.history.length > 0){
          ag.history = m.history;
        }
        if(Array.isArray(m.members)) ag.members = m.members;
      }
    } catch(e){ /* ignore — keep local */ }
  }
  activeId=id;
  document.getElementById('emptyWrap').style.display='none';
  document.getElementById('chatWrap').style.display='flex';
  // Group chats: hint that AI only replies when @AI is used.
  try {
    var _ci = document.getElementById('ci');
    if(_ci){
      _ci.placeholder = ag.is_group
        ? L('@AI で AI を呼ぶ ・ それ以外はメンバー同士のチャット','Use @AI to call the assistant · otherwise members chat freely')
        : L('何をお願いしますか？（Shift+Enter で改行）','What can I help you with? (Shift+Enter for newline)');
    }
  } catch(e){}
  document.querySelectorAll('.ag-item').forEach(el=>el.classList.remove('on'));
  document.getElementById('ai-'+id)?.classList.add('on');

  // Start/stop live polling: only groups need it (DMs are single-user).
  if(ag.is_group){
    _startGroupPoll(id);
    // Mark as read on the server. Optimistically clear local unread badge.
    ag.unread_count = 0;
    // Update sidebar badge immediately (don't wait for next renderAgList)
    try {
      const itemEl = document.getElementById('ai-' + id);
      const badgeEl = itemEl && itemEl.querySelector('.ag-unread');
      if(badgeEl) badgeEl.remove();
    } catch(e){}
    api('POST', '/api/agents/' + id + '/read').catch(()=>{});
  } else {
    _stopGroupPoll();
  }

  const isGroup = !!ag.is_group;
  const memberCount = (ag.members||[]).length;
  const sns=(ag.skills||[]).map(s=>SKILLS.find(x=>x.id===s)?.name||s);
  // Simplified header: drop the per-skill pill array. Skills are visible in
  // the avatar/profile panel; chat header should be uncluttered.
  // We only keep ONE context badge:
  //   - Team chats: 🎯 N AI
  //   - Hosted groups: 🤝 N 名
  //   - DMs with Web tool ON: 🌐 Web
  //   - Otherwise: nothing (cleaner)
  var topPills = '';
  const isTeam = !!(ag.is_team && Array.isArray(ag.team_member_agent_ids));
  const teamCount = isTeam ? ag.team_member_agent_ids.length : 0;
  if(isTeam){
    topPills += '<span class="pill" style="background:rgba(251,146,60,.14);color:var(--peach-dark);border-color:rgba(251,146,60,.3)">🎯 '+L('チーム','Team')+' · '+teamCount+' AI</span>';
  } else if(isGroup){
    topPills += '<span class="pill" style="background:rgba(99,102,241,.12);color:#4f46e5;border-color:rgba(99,102,241,.3)">🤝 '+memberCount+'</span>';
  } else if(ag.chrome_enabled){
    topPills += '<span class="pill" style="background:rgba(59,130,246,.12);color:#2563eb;border-color:rgba(59,130,246,.3)" title="'+(isJa?'Web 検索 / URL 取得 有効':'Web search / fetch enabled')+'">🌐 Web</span>';
  }
  // Action buttons differ for groups (host shows ＋招待, member shows メンバー)
  const isHost = isGroup && ag.host_id === me?.id;
  let actsHTML = '';
  if(isGroup){
    if(isTeam){
      actsHTML += '<button class="ct-act wide members" onclick="openTeamMembersPanel(\''+ag.id+'\')" title="'+L('チームのメンバー','Team members')+'">🎯 '+teamCount+' AI</button>';
      if(isHost){
        actsHTML += '<button class="ct-act primary" onclick="openShareCard()" title="'+L('共有 URL ・ SNS で広報','Share URL · post on social')+'">🔗</button>';
        actsHTML += '<button class="ct-act" onclick="openTeamEdit(\''+ag.id+'\')" title="'+L('チームを編集 (目的・名前)','Edit team (goal · name)')+'">✏️</button>';
      }
    } else {
      actsHTML += '<button class="ct-act wide invite" onclick="openInviteModal(\''+ag.id+'\')" title="'+L('メンバーを招待','Invite members')+'">＋ '+L('招待','Invite')+'</button>';
      actsHTML += '<button class="ct-act wide members" onclick="openMemberPanel(\''+ag.id+'\')" title="'+L('メンバー','Members')+'">👥 '+memberCount+'</button>';
    }
    if(isHost && !isTeam){
      actsHTML += '<button class="ct-act" onclick="openEditAgent(\''+ag.id+'\')" title="'+L('AI を編集','Edit AI')+'">🤖</button>';
    }
    // Shared notebook for Teams / Groups — visible to everyone with chat access.
    actsHTML += '<button class="ct-act" onclick="openNotesPanel(\''+ag.id+'\')" title="'+L('共有メモ (メンバー全員で閲覧・編集)','Shared notes (visible & editable by all members)')+'">📝</button>';
    actsHTML += '<button class="ct-act" onclick="openGroupSettings(\''+ag.id+'\')" title="'+L('グループ設定','Group settings')+'">⚙</button>';
  } else {
    // site agent (= site_url を持つ) はチャット上部を「📊 ダッシュボード」だけに絞る。
    // 他のアクション (🔗 共有 / 💬 会話共有 / ↻ 新規 / 📝 メモ / ⚙ 設定) は
    // ダッシュボード内のアクションパネルに集約 — chat header をスッキリ。
    if(_isSiteAgent(ag)){
      actsHTML += '<button class="ct-act dashboard-btn" onclick="goSiteDashboard()" title="'+L('ダッシュボード (KPI ・ 納品物 ・ 進捗)','Dashboard')+'">📊 ダッシュボード</button>';
    } else {
      actsHTML += '<button class="ct-act primary" onclick="openShareCard()" title="'+(isJa?'共有URL':'Share URL')+'">🔗</button>';
      actsHTML += '<button class="ct-act" onclick="openChatShareModal()" title="'+(isJa?'この会話を公開リンクで共有':'Share this conversation')+'">💬</button>';
      actsHTML += '<button class="ct-act" onclick="newChat()" title="'+(isJa?'新規会話':'New chat')+'">↻</button>';
      actsHTML += '<button class="ct-act" onclick="openNotesPanel(\''+ag.id+'\')" title="'+L('メモ (この AI とのチャット専用)','Notes (private to this chat)')+'">📝</button>';
      if(!ag._is_joined_group){
        actsHTML += '<button class="ct-act" onclick="openAgentProfile(\''+ag.id+'\')" title="'+L('AIプロフィール (記憶 / 目標 / プレイブック / タスク)','Agent profile (memory / goals / playbook / tasks)')+'">🧠</button>';
        actsHTML += '<button class="ct-act" onclick="openEditAgent(\''+ag.id+'\')" title="エージェントを編集">⚙</button>';
      }
    }
  }
  // Context window usage indicator — rough: ~4 chars / token.
  var ctxChars = 0;
  (ag.history||[]).forEach(function(m){
    if(typeof m.content === 'string') ctxChars += m.content.length;
  });
  if(ag.persona) ctxChars += ag.persona.length;
  var ctxTok = Math.round(ctxChars / 4);
  var ctxBudget = 200000;  // Anthropic 200K context
  var ctxPct = Math.min(100, Math.round(ctxTok / ctxBudget * 100));
  var ctxColor = ctxPct < 50 ? 'var(--text3)' : ctxPct < 80 ? 'var(--peach-dark)' : '#dc2626';
  var ctxLbl = ctxTok >= 1000 ? (ctxTok/1000).toFixed(1)+'k' : String(ctxTok);
  // Context usage pill — desktop only, and only meaningful when filling up.
  // Hidden on phones (saves header space) and hidden when usage < 25% on
  // desktop (less noise for new chats).
  var ctxPill = (ctxPct >= 25)
    ? '<span class="ct-ctx hide-on-mobile" title="'+(isJa?'コンテキスト使用量 (推定)':'Context window used (approx)')+'" style="font-size:10px;font-weight:700;color:'+ctxColor+';background:var(--cream2);border:1px solid var(--wire2);padding:3px 8px;border-radius:99px;letter-spacing:.02em;font-family:\'SF Mono\',Menlo,monospace">'+ctxLbl+' / 200k</span>'
    : '';
  // Quick model picker pill — click to switch between Fast / Smart / Best
  // without opening the full edit panel. Saved per-agent via PATCH.
  var _modelMap = {'auto':  {lbl:'✨ Auto', title:'自動切替: クエリの複雑度で Fast/Smart を自動選択 (推奨)'},
                   'haiku': {lbl:'⚡ Fast', title:'Claude Haiku 4.5 · 高速 + 低コスト'},
                   'sonnet':{lbl:'🎯 Smart',title:'Claude Sonnet 4.6 · 高品質 + バランス'},
                   'opus':  {lbl:'🧠 Best', title:'Claude Opus 4.7 · 最高品質'},
                   // Legacy gemini-* values map to the same display as haiku.
                   'gemini-flash':{lbl:'⚡ Fast',title:'Claude Haiku 4.5'},
                   'gemini-pro':  {lbl:'🎯 Smart',title:'Claude Sonnet 4.6'}};
  var _mInfo = _modelMap[ag.model] || _modelMap['auto'];
  var modelPill = isGroup ? '' : ('<button class="ct-model" onclick="event.stopPropagation(); _toggleQuickModel(\''+ag.id+'\')" title="'+esc(_mInfo.title)+'" style="font-size:10px;font-weight:800;color:var(--peach-dark);background:rgba(251,146,60,.08);border:1px solid rgba(251,146,60,.3);padding:3px 9px;border-radius:99px;letter-spacing:.02em;cursor:pointer;font-family:inherit">'+_mInfo.lbl+'</button>');
  // Agent-intelligence indicators — KPI count + active task count. Clicking
  // opens the unified Agent Profile panel. Group chats hide these.
  // Tasks pill is separated out so it's always discoverable as a primary
  // action — clicking it pops out this agent's tasks with a 1-click
  // "▶ 実行" path. Even at 0 tasks we show a faint hint so users know
  // there's a task surface they can use.
  var taskN = Array.isArray(ag.open_tasks) ? ag.open_tasks.filter(function(t){return t && t.status!=='done';}).length : 0;
  var tasksPill = '';
  if(!ag._is_joined_group){
    var taskLabel = taskN > 0 ? ('📋 タスク '+taskN) : '📋 タスク';
    var taskStyle = taskN > 0
      ? 'font-size:10.5px;font-weight:800;color:var(--peach-dark);background:var(--peach-soft);border:1px solid #fed7aa;padding:3px 10px;border-radius:99px;cursor:pointer;font-family:inherit;letter-spacing:.02em'
      : 'font-size:10px;font-weight:700;color:var(--text3);background:#fff;border:1px solid var(--wire2);padding:3px 9px;border-radius:99px;cursor:pointer;font-family:inherit;opacity:.7';
    tasksPill = '<button onclick="event.stopPropagation(); _openTasksPopout(this, \''+ag.id+'\')" title="'+L('このエージェントのタスク一覧','Tasks for this agent')+'" style="'+taskStyle+'">'+taskLabel+'</button>';
  }
  // Intel pill — KPIs / memories only (tasks moved out above).
  var intelPill = '';
  if(!isGroup && !ag._is_joined_group){
    var kpiN  = Array.isArray(ag.kpis) ? ag.kpis.length : 0;
    var memN  = Array.isArray(ag.memories) ? ag.memories.length : 0;
    if(kpiN + memN > 0){
      var parts = [];
      if(kpiN)  parts.push('🎯 '+kpiN);
      if(memN)  parts.push('🧠 '+memN);
      intelPill = '<button onclick="event.stopPropagation(); openAgentProfile(\''+ag.id+'\')" title="'+L('AI が憶えてる事 / 目標','What this AI remembers / goals')+'" style="font-size:10px;font-weight:700;color:var(--text2);background:#fff;border:1px solid var(--wire2);padding:3px 9px;border-radius:99px;cursor:pointer;font-family:inherit">'+parts.join(' · ')+'</button>';
    }
  }
  // Site agent はホスト名 = 「fukuyama-note.com」みたいな表示で、
  // ここをクリックして profile を開く挙動は不要 (= プロフィールボタン削除指示)。
  // 旧 generic agent / group は引き続き Agent カード (= level / xp / 成果率) を開ける。
  var _isSite = _isSiteAgent(ag);
  var _iconAttrs = _isSite
    ? 'style="cursor:default" title="' + esc(ag.name) + '"'
    : 'onclick="_openAgentCard(\''+esc(ag.id)+'\')" style="cursor:pointer" title="'+L('エージェントカードを開く','Open agent card')+'"';
  var _nameAttrs = _isSite
    ? 'style="cursor:default"'
    : 'onclick="_openAgentCard(\''+esc(ag.id)+'\')" style="cursor:pointer" title="'+L('エージェントカードを開く','Open agent card')+'"';
  document.getElementById('chatTop').innerHTML=
    '<button class="mobile-hamburger" onclick="_toggleMobileSidebar(true)" title="メニュー" aria-label="メニュー">☰</button>'+
    '<div class="ct-icon" '+_iconAttrs+'>'+_avHTML(ag.avatar)+'</div>'+
    '<div class="ct-titles">'+
      '<div class="ct-name" '+_nameAttrs+'><span class="live-status"></span><span class="ct-name-text">'+esc(ag.name)+'</span></div>'+
      '<div class="ct-pills">'+topPills+' '+modelPill+' '+tasksPill+' '+intelPill+' '+ctxPill+'</div>'+
    '</div>'+
    '<div class="ct-actions">'+ actsHTML +'</div>';
  // Hide share card whenever agent changes
  var sc=document.getElementById('shareCard'); if(sc) sc.style.display='none';
  // Reflect Chrome tool button state in composer
  _updateChromeTool(ag);

  // Quick chips persist throughout the conversation (clickable shortcuts)
  const allChips=ag.skills.flatMap(s=>(CHIPS[s]||[]).slice(0,2)).slice(0,5);
  // Site agent (= org 持ち) なら @mention chip も先頭に追加 (= 部門指名依頼の UX hint)
  var mentionChips = '';
  if(_isSiteAgent(ag) && ag.org && Array.isArray(ag.org.departments) && ag.org.departments.length > 0){
    var topDepts = ag.org.departments.slice(0, 3);
    mentionChips = '<span style="font-size:10px;color:var(--text3);font-weight:700;letter-spacing:.04em;margin-right:4px">@部門指名:</span>'
      + topDepts.map(function(d){
          var nm = String(d.name||'').replace(/\s+/g, '');
          return '<button class="chip chip-mention" onclick="_insertMention(\''+ esc(nm) +'\')" style="background:color-mix(in srgb, ' + d.color + ' 10%, #fff); border-color:color-mix(in srgb, ' + d.color + ' 30%, transparent); color:' + d.color + '">' + d.icon + ' @' + esc(nm) + '</button>';
        }).join('');
  }
  var chipsHtml = (mentionChips ? mentionChips + '<span class="chip-sep" style="display:inline-block;width:1px;height:14px;background:var(--wire2);margin:0 4px;vertical-align:middle"></span>' : '')
                + (allChips.length ? '<span style="font-size:10px;color:var(--text3);font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-right:4px">'+(isJa?'クイック:':'Quick:')+'</span>' + allChips.map(c=>`<button class="chip" onclick="useChip('${esc(c)}')">${c}</button>`).join('') : '');
  document.getElementById('chips').innerHTML=chipsHtml;
  renderMsgs(ag);
  // Wire scroll listener so the FAB toggles on scroll
  var msgsEl=document.getElementById('msgs');
  if(msgsEl && !msgsEl._scrollWired){ msgsEl.addEventListener('scroll', _updateScrollFAB); msgsEl._scrollWired=true; }
}

/* ── Markdown rendering ──────────────────────────────── */
// ctx 任意: { isStreaming: bool, editingFnames: Set<filename> } — artifact カードが
// 「開く / コード」ボタンを「✏ 編集中…」に差し替える判定材料。呼び出し側
// (_renderMsg) で計算済みのものを渡してもらう。
function _md(src, ctx){
  if(!src) return '';
  var _mdCtx = ctx || {};
  // Inline integration CTA — extract <connect:service_id> markers before escape.
  // The AI emits these when an action needs a service that is not connected.
  // We render them as a "[🔌 X を接続]" button that opens the catalog modal.
  var connectMarkers=[];
  src=String(src).replace(/<connect:([a-z0-9_]+)>/gi, function(_,sid){
    var ci=connectMarkers.length;
    connectMarkers.push(String(sid).toLowerCase());
    return " CM"+ci+" ";
  });
  // <newchat> marker — the AI emits this when a 2nd site was blocked
  // (1 chat = 1 site). Becomes a "🆕 新しいチャットで作る" button.
  src=String(src).replace(/<newchat>/gi,' NCBTN0 ');
  // <delegate>...</delegate> — お任せ受領カード envelope. AI emits this at
  // the TOP of complex multi-step replies (3+ steps). We extract the inner
  // block BEFORE HTML escape so the structured content survives intact,
  // then render as a styled card after the rest of _md has run. See
  // _renderDelegateCard for the inner format.
  // Streaming-tolerant: also catch UNCLOSED <delegate>... (still typing —
  // closing tag hasn't arrived yet). Renders whatever can be parsed so far.
  // <delegate id="t_xxx"> 属性を任意で受け入れる (新システムでは必ず id 付き、
  // 旧履歴 / 互換のために属性無しも受け入れる)。inner 本体と id をペアで保存。
  var deliBlocks=[];
  function _parseDeliAttrs(tag){
    var m = String(tag||'').match(/id\s*=\s*"([^"]+)"|id\s*=\s*'([^']+)'/i);
    return { id: (m && (m[1] || m[2])) || '' };
  }
  src=String(src).replace(/<delegate(\s+[^>]*)?>([\s\S]*?)<\/delegate>/gi, function(_, attrs, inner){
    var di=deliBlocks.length;
    deliBlocks.push({ inner: inner, id: _parseDeliAttrs(attrs).id });
    return ' DELI'+di+' ';
  });
  src=String(src).replace(/<delegate(\s+[^>]*)?>([\s\S]*)$/gi, function(_, attrs, inner){
    // No closing tag yet → AI is still typing the card. Render what we have.
    var di=deliBlocks.length;
    deliBlocks.push({ inner: inner, id: _parseDeliAttrs(attrs).id });
    return ' DELI'+di+' ';
  });
  // Extract code blocks first to placeholders so other rules don't touch them
  var codeBlocks=[];
  src=String(src).replace(/```(\w*)\n?([\s\S]*?)```/g,function(_,lang,code){
    var idx=codeBlocks.length;
    codeBlocks.push({lang:lang||'',code:code.replace(/\n+$/,'')});
    return ' CB'+idx+' ';
  });
  // Extract LaTeX math blocks BEFORE escaping so $..$ / $$..$$ survive.
  // Placeholder uses NUL bytes so it can't collide with user text (same trick
  // as the code-block placeholder above).
  var mathBlocks=[];
  function _pushMath(tex, display){
    var mi=mathBlocks.length;
    mathBlocks.push({tex:tex, display:!!display});
    return '  MX'+mi+'  ';
  }
  src=src.replace(/\$\$([\s\S]+?)\$\$/g, function(_,t){ return _pushMath(t, true); });
  src=src.replace(/\\\[([\s\S]+?)\\\]/g,  function(_,t){ return _pushMath(t, true); });
  src=src.replace(/\\\(([\s\S]+?)\\\)/g,  function(_,t){ return _pushMath(t, false); });
  // Conservative inline $..$ — avoid eating "$5" / "$1 and $2" style prices.
  src=src.replace(/(^|[^$\\\w])\$([^\s$][^$\n]*?[^\s$])\$(?=$|[^$\w])/g,
    function(m, pre, t){
      if(/^\s*\d+(\.\d+)?\s*$/.test(t)) return m;
      return pre + _pushMath(t, false);
    });
  // Escape HTML
  var html=esc(src);
  // Restore math blocks — render with KaTeX if loaded, else show source.
  html=html.replace(/  MX(\d+)  /g, function(_,i){
    var b=mathBlocks[+i];
    if(window.katex && typeof window.katex.renderToString==='function'){
      try { return window.katex.renderToString(b.tex, { displayMode:b.display, throwOnError:false, output:'html' }); }
      catch(e){}
    }
    return '<code class="math-fallback">'+esc(b.tex)+'</code>';
  });
  // Restore code blocks (escape the code inside)
  html=html.replace(/ CB(\d+) /g,function(_,i){
    var b=codeBlocks[+i];
    var enc=encodeURIComponent(b.code);
    var langAttr = b.lang ? ' data-lang="'+esc(b.lang)+'"' : '';
    var isPy = /^(py|python)$/i.test(b.lang||'');
    var runBtn = isPy
      ? '<button class="cb-run" data-code="'+enc+'" onclick="runPyCode(event,this)" title="Run with Pyodide (in-browser Python)">▶ Run</button>'
      : '';
    // Syntax highlight via highlight.js when loaded. Lang hint helps;
    // fall back to highlightAuto if no lang. If hljs hasn't loaded yet
    // (deferred), we emit plain escaped code.
    var lang = (b.lang||'').toLowerCase();
    var rendered;
    if(window.hljs){
      try {
        if(lang && window.hljs.getLanguage && window.hljs.getLanguage(lang)){
          rendered = window.hljs.highlight(b.code, {language:lang, ignoreIllegals:true}).value;
        } else {
          rendered = window.hljs.highlightAuto(b.code).value;
        }
      } catch(e){ rendered = esc(b.code); }
    } else {
      rendered = esc(b.code);
    }
    var langTag = lang ? '<span class="cb-lang">'+esc(lang)+'</span>' : '';
    return '<pre'+langAttr+'>'+langTag+runBtn+'<button class="cb-copy" data-code="'+enc+'" onclick="copyCodeBlock(event,this)">📋 Copy</button><code class="hljs">'+rendered+'</code></pre>';
  });
  // Headings
  html=html.replace(/^#### (.+)$/gm,'<h4>$1</h4>');
  html=html.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  html=html.replace(/^## (.+)$/gm,'<h2>$1</h2>');
  html=html.replace(/^# (.+)$/gm,'<h1>$1</h1>');
  // Inline code
  html=html.replace(/`([^`\n]+)`/g,'<code>$1</code>');
  // Bold then italic (order matters)
  html=html.replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
  html=html.replace(/\*([^*\n]+)\*/g,'<em>$1</em>');
  // Videos — must come before the image rule so .mp4/.webm don't get
  // swallowed as images. Accepts both absolute and root-relative URLs
  // (the generate_video tool returns /generated/*.mp4).
  html=html.replace(/!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^)]+\.(?:mp4|webm))\)/g,
    '<video class="m-genvideo" src="$2" controls preload="metadata" playsinline></video>');
  // Audio — same shape but mp3/wav/ogg → <audio>.
  html=html.replace(/!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^)]+\.(?:mp3|wav|ogg|m4a))\)/g,
    '<audio class="m-genaudio" src="$2" controls preload="metadata"></audio>');
  // Artifact card — .html URLs in EITHER image (`![](url.html)`) OR link
  // (`[label](url.html)`) markdown render as a prominent card. The server's
  // wrap-up skip now emits link syntax (`🎨 [title](url.html)`) so users get
  // a real clickable result instead of a raw URL.
  function _renderArtifactCard(alt, src){
    const safeAlt = (String(alt||'').replace(/\*\*/g,'').replace(/"/g,'&quot;').slice(0,80)) || (isJa?'作成したサイト':'Site');
    const safeSrc = String(src||'').replace(/"/g,'&quot;');
    // Bare filename + whether it's an editable artifact (artifact-*.html).
    const _afName = String(src||'').split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || '';
    const _afIsArtifact = /^artifact-/.test(_afName);
    const _afTitleArg = safeAlt.replace(/'/g,"\\'");
    const _afNameArg = _afName.replace(/'/g,"\\'");
    // Version sourcing — prefer ?v=N baked into the URL by the server (the
    // structural fix: each message carries the version it referred to at the
    // time, so history shows historically-correct version numbers and there
    // is no 3-path local-cache sync to keep in step). Fall back to me.artifacts
    // for older replies that pre-date the stamping.
    let _afVer = 0, _afVR = null;
    const _vMatch = String(src||'').match(/[?&]v=(\d+)/);
    if(_vMatch) _afVer = parseInt(_vMatch[1], 10) || 0;
    try {
      const _aHit = (typeof me!=='undefined' && me && Array.isArray(me.artifacts))
        ? me.artifacts.find(function(a){ return a && a.filename === _afName; }) : null;
      if(_aHit){
        if(!_afVer) _afVer = _aHit.version || 1;
        _afVR = _aHit.vision_review || null;
      }
    } catch(e){}
    if(_afIsArtifact && !_afVer) _afVer = 1;
    const _verBadge = _afVer ? '<span class="m-artifact-card-ver">Ver.'+_afVer+'</span>' : '';
    // Vision review badge (案B verifier) — shows 件数 if findings, ✅ if clean.
    let _vrBadge = '';
    if(_afIsArtifact && _afVR && Array.isArray(_afVR.findings)){
      const _vrN = _afVR.findings.length;
      if(_vrN > 0){
        _vrBadge = '<button class="m-artifact-card-vr" onclick="_openVisionReview(\''+_afNameArg+'\')" title="'+(isJa?'検証AIの指摘':'Vision review findings')+'">✨ '+_vrN+(isJa?'件指摘':' issues')+'</button>';
      } else {
        _vrBadge = '<span class="m-artifact-card-vr-ok" title="'+(isJa?'検証AIチェック済 — 問題なし':'Reviewed — no issues')+'">✅ '+(isJa?'検証OK':'Reviewed')+'</span>';
      }
    }
    // Is this artifact the conversation's pinned site?
    let _afPinned = false;
    try {
      const _pa = (typeof agents!=='undefined' && agents) ? agents.find(function(a){return a&&a.id===activeId;}) : null;
      _afPinned = !!(_pa && _pa.pinned_artifact === _afName);
    } catch(e){}
    // ── 「編集中」判定 ──────────────────────────────────────────
    // streaming 中、かつこの filename が tool_log で touch されていれば、
    // 「↗ 開く」「📄 コード」を「✏ 編集中…」(disabled) に差し替える。
    // ユーザーが中間状態 (Ver.N で AI がまだ続きを編集する予定) を間違って
    // 開かないようにするための UX 改善。
    var _isEditingNow = false;
    try {
      if(_mdCtx && _mdCtx.isStreaming && _mdCtx.editingFnames
         && _afIsArtifact && _mdCtx.editingFnames.has(_afName)){
        _isEditingNow = true;
      }
    } catch(_){}
    var _openOrEditingHtml;
    if(_isEditingNow){
      // 「開く」と「コード」を 1 個の「✏ 編集中…」(disabled) に置換
      _openOrEditingHtml =
        '<button class="ac-editing" disabled title="'+(isJa?'AI が編集中。完了したら自動で「開く」ボタンに切り替わります':'AI is editing. Will switch to Open when done')+'">'
        + '<span class="ac-editing-spin"></span>'
        + (isJa ? '編集中…' : 'Editing…')
        + '</button>';
    } else {
      _openOrEditingHtml =
          (_afIsArtifact ? '<button class="ac-code" onclick="_openCodeViewer(\''+_afNameArg+'\')" title="コードを見る">📄 '+(isJa?'コード':'Code')+'</button>' : '')
        + '<a class="ac-open" href="'+(
              // Cache buster: only add ?v=N if the URL doesn't already have one
              // (server-side stamping may have baked it in already). Prevents
              // duplicate ?v=...&v=... or stale-overrides-fresh situations.
              _afIsArtifact && _afVer && !/[?&]v=\d+/.test(safeSrc)
                ? safeSrc + (safeSrc.indexOf('?')>=0?'&':'?') + 'v=' + _afVer
                : safeSrc
            )+'" target="_blank" rel="noopener">🔗 '+(isJa?'開く':'Open')+' ↗</a>';
    }
    return '<div class="m-artifact-card'+(_isEditingNow?' editing':'')+'">'
      + '<div class="m-artifact-card-top">'
      +   '<div class="m-artifact-card-ic">'+(_afIsArtifact?'🌐':'📄')+'</div>'
      +   '<div class="m-artifact-card-body">'
      +     '<div class="m-artifact-card-titlerow"><div class="m-artifact-card-ti">'+safeAlt+'</div>'+_verBadge+_vrBadge+'</div>'
      +     '<div class="m-artifact-card-url">'+esc(_afName||safeSrc)+'</div>'
      +   '</div>'
      + '</div>'
      + '<div class="m-artifact-card-acts">'
      +   (_afIsArtifact ? '<button class="ac-edit" onclick="_setEditTarget(\''+_afNameArg+'\',\''+_afTitleArg+'\',_ecWhich(this))" title="このサイトを修正">✏️ '+(isJa?'修正':'Edit')+'</button>' : '')
      +   (_afIsArtifact ? '<button class="ac-pin'+(_afPinned?' on':'')+'" onclick="'+(_afPinned?'_unpinArtifact()':'_pinArtifact(\''+_afNameArg+'\')')+'" title="'+(_afPinned?'このチャットの編集対象（固定中）':'このチャットの編集対象に固定')+'">📌 '+(_afPinned?(isJa?'固定中':'Pinned'):(isJa?'固定':'Pin'))+'</button>' : '')
      +   '<button class="ac-copy" onclick="var b=this;navigator.clipboard.writeText(location.origin+\''+safeSrc+'\').then(function(){b.textContent=\'✓ '+(isJa?'コピー!':'Copied!')+'\';setTimeout(function(){b.textContent=\'📋 コピー\';},1400);})">📋 コピー</button>'
      +   _openOrEditingHtml
      + '</div>'
      + '</div>';
  }
  // PDF card — generate_pdf returns `[📄 title (PDF)](/generated/xxx.pdf)`.
  // Renders a card with Download (download attr) + Open, mirroring the
  // .html artifact card so a generated PDF isn't just a bare link.
  function _renderPdfCard(alt, src){
    const safeAlt = (String(alt||'').replace(/\*\*/g,'').replace(/\s*\((?:PDF|pdf)\)\s*$/,'').replace(/^[^0-9A-Za-z぀-ヿ一-鿿]+/,'').replace(/"/g,'&quot;').trim().slice(0,80)) || (isJa?'PDF ドキュメント':'PDF document');
    const safeSrc = String(src||'').replace(/"/g,'&quot;');
    const _pfName = String(src||'').split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || 'document.pdf';
    return '<div class="m-artifact-card">'
      + '<div class="m-artifact-card-top">'
      +   '<div class="m-artifact-card-ic">📄</div>'
      +   '<div class="m-artifact-card-body">'
      +     '<div class="m-artifact-card-titlerow"><div class="m-artifact-card-ti">'+safeAlt+'</div><span class="m-artifact-card-ver">PDF</span></div>'
      +     '<div class="m-artifact-card-url">'+esc(_pfName)+'</div>'
      +   '</div>'
      + '</div>'
      + '<div class="m-artifact-card-acts">'
      +   '<button class="ac-copy" onclick="var b=this;navigator.clipboard.writeText(location.origin+\''+safeSrc+'\').then(function(){b.textContent=\'✓ '+(isJa?'コピー!':'Copied!')+'\';setTimeout(function(){b.textContent=\'📋 コピー\';},1400);})">📋 コピー</button>'
      +   '<a class="ac-dl" href="'+safeSrc+'" download="'+esc(_pfName)+'">⬇ '+(isJa?'ダウンロード':'Download')+'</a>'
      +   '<a class="ac-open" href="'+safeSrc+'" target="_blank" rel="noopener">🔗 '+(isJa?'開く':'Open')+' ↗</a>'
      + '</div>'
      + '</div>';
  }
  // URL pattern allows an optional ?query / #fragment after .html — the
  // server now stamps `?v=N` onto artifact URLs (see _stampArtifactVersions),
  // and the old `\.html?\)` regex required `)` immediately after .html, so
  // every versioned artifact URL was silently rendered as plain text (the
  // "freecracy-dd-report" naked-filename bug).
  html=html.replace(/!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^)]+\.html?(?:[?#][^)]*)?)\)/g, function(_, alt, src){
    return _renderArtifactCard(alt, src);
  });
  html=html.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+\.html?(?:[?#][^)]*)?)\)/g, function(_, alt, src){
    return _renderArtifactCard(alt, src);
  });
  html=html.replace(/!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^)]+\.pdf)\)/gi, function(_, alt, src){
    return _renderPdfCard(alt, src);
  });
  html=html.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+\.pdf)\)/gi, function(_, alt, src){
    return _renderPdfCard(alt, src);
  });
  // Images — MUST come before links so the leading '!' is consumed cleanly.
  // Renders the AI-generated image inline. Now accepts root-relative URLs
  // (the image-routing tools sometimes return /generated/*.jpg directly).
  html=html.replace(/!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^)]+)\)/g,
    '<img class="m-genimg" src="$2" alt="$1" loading="lazy" onclick="this.classList.toggle(\'expanded\')" referrerpolicy="no-referrer">');
  // Links — accept absolute (https://) AND root-relative (/path) URLs so
  // generated artifacts, PDFs, and other in-app URLs render as clickable
  // links instead of raw markdown text.
  html=html.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Blockquotes
  html=html.replace(/^&gt; (.+)$/gm,'<blockquote>$1</blockquote>');
  // Bullet lists (- or ・ at start of line)
  html=html.replace(/((?:^[-・] .+(?:\n|$))+)/gm,function(m){
    var items=m.split('\n').filter(function(l){return /^[-・] /.test(l);})
      .map(function(l){return '<li>'+l.replace(/^[-・] /,'')+'</li>';}).join('');
    return '<ul>'+items+'</ul>';
  });
  // Numbered lists
  html=html.replace(/((?:^\d+\. .+(?:\n|$))+)/gm,function(m){
    var items=m.split('\n').filter(function(l){return /^\d+\. /.test(l);})
      .map(function(l){return '<li>'+l.replace(/^\d+\. /,'')+'</li>';}).join('');
    return '<ol>'+items+'</ol>';
  });
  // Convert remaining \n to <br>, then strip <br> adjacent to block tags
  // Inline CTA restore — replace NUL-padded CM markers with a button.
  // The button opens the integrations catalog modal scoped to that service.
  html=html.replace(/ CM(\d+) /g, function(_,i){
    var sid = connectMarkers[+i] || "";
    if(!sid) return "";
    // Pretty name lookup from the local catalog cache (loaded on boot).
    var cat = window._intgCatalog;
    var s = (cat && cat.services || []).find(function(x){return x.id===sid;});
    var st = s && s.status || {};
    if(st.connected){
      return "<span class=\"intg-cta intg-cta-on\" title=\"接続済\">✓ "+ (s ? s.name : sid) +" 接続済</span>";
    }
    var label = s ? s.name : sid;
    return "<button class=\"intg-cta\" onclick=\"openIntegrationsTab('"+ sid +"')\">🔌 "+ label +" を接続</button>";
  });
  // Task-list rendering — convert GFM-style "- [ ] task" / "- [x] task" lines
  // into styled checklist rows. Used by the "AI's plan" narration where the
  // model emits a 3–6 step plan up-front and ticks items as it works through
  // them. Visual is read-only (no toggle handler) — these reflect AI state,
  // not user state. Matches both - and * bullet markers; preserves leading
  // indentation (esc() already turned it into &nbsp;-equivalent spaces).
  //
  // Auto-check: when the AI emits "✅ ステップN 完了" markers later in the
  // same message, we tick off the first N unchecked items. Lets the model
  // declare the plan once and update progress purely via the completion
  // marker, instead of re-emitting the whole list each step.
  var _stepDone = 0;
  // 寛容なマッチ: ✅/✓/☑ + ステップ/Step + 半角/全角数字 + 完了/done
  // 「✅ ステップ1 完了」「✓ Step 1 done」「☑ ステップ１完了」全部拾う。
  (String(src).match(/(?:✅|✓|☑|✔)\s*(?:ステップ|Step|step)\s*(?:No\.?)?\s*([\d０-９]+)\s*(?:完了|done|完成|終了|done)/g) || []).forEach(function(m){
    var ds = (m.match(/([\d０-９]+)/)||[])[1] || '';
    // 全角数字を半角に
    var n = parseInt(ds.replace(/[０-９]/g, function(c){return String.fromCharCode(c.charCodeAt(0)-0xFEE0);}), 10);
    if(n && n > _stepDone) _stepDone = n;
  });
  var _taskIdx = 0;
  // NB: this runs BEFORE \n→<br> so we match newline separators, not <br>.
  html=html.replace(/(^|\n)\s*[\-*] \[([ xX])\]\s+(.+?)(?=\n|$)/g, function(_, lead, mk, txt){
    _taskIdx++;
    var done = (mk === 'x' || mk === 'X') || (_taskIdx <= _stepDone);
    var cls  = 'md-task' + (done ? ' md-task-done' : '');
    var box  = done
      ? '<span class="md-task-box md-task-box-on">✓</span>'
      : '<span class="md-task-box"></span>';
    return lead + '<div class="' + cls + '">' + box + '<span class="md-task-txt">' + txt + '</span></div>';
  });
  html=html.replace(/\n/g,'<br>');
  html=html.replace(/(<\/(?:h[1-6]|ul|ol|pre|blockquote|li)>)<br>/g,'$1');
  html=html.replace(/<br>(<(?:h[1-6]|ul|ol|pre|blockquote|li))/g,'$1');
  // Tighten <br> immediately around task-list rows so adjacent items pack.
  html=html.replace(/<br>(<div class="md-task)/g,'$1');
  html=html.replace(/(<\/div>)<br>(<div class="md-task)/g,'$1$2');
  html=html.replace(/ ?NCBTN0 ?/g, '<button class="newchat-cta" onclick="openNewAgent()">🆕 '+(isJa?'新しいチャットで作る':'Create in a new chat')+'</button>');
  // <x1click:SITE_ID> — 1 クリックで X テスト投稿フロー (= 拡張 check → 接続 → preview → 投稿)
  html=html.replace(/&lt;x1click:([a-z0-9_]+)&gt;/gi, function(_, sid){
    return '<button class="x1click-cta" onclick="_oneClickXPost(\''+sid+'\', this)">🚀 1 クリックで X に投稿する</button>';
  });
  // <extinstall> — 拡張インストール CTA (= /setup-extension.html へ)
  html=html.replace(/&lt;extinstall&gt;/gi,
    '<a class="extinstall-cta" href="/setup-extension.html" target="_blank" rel="noopener">📥 Chrome 拡張をインストール (30 秒)</a>');
  // Restore delegate cards LAST (after all other markdown) so the surrounding
  // <br> noise is already cleaned up. _stepDone is in scope from the auto-check
  // logic above and drives the "first N steps automatically ticked" behavior.
  // Defensive try/catch so a render bug in the card doesn't break the whole
  // message bubble — fall back to plain escaped text of the inner block.
  html=html.replace(/ ?DELI(\d+) ?/g, function(_, i){
    try {
      var blk = deliBlocks[+i] || { inner: '', id: '' };
      // 旧形式 (文字列だけ push されてた場合) と新形式 ({inner,id}) の両方を受け入れる
      var inner = (typeof blk === 'string') ? blk : (blk.inner || '');
      var tid = (typeof blk === 'object' && blk) ? (blk.id || '') : '';
      return _renderDelegateCard(inner, _stepDone, tid);
    } catch(e){
      console.warn('[delegate] render failed:', e && e.message);
      var blk2 = deliBlocks[+i];
      var raw = (typeof blk2 === 'string') ? blk2 : (blk2 && blk2.inner || '');
      return '<pre>' + esc(raw) + '</pre>';
    }
  });
  return html;
}

// Render <delegate>...</delegate> contents as a styled "お任せ受領カード".
// Inner format (lenient — order can vary, all sections optional):
//   **任されたこと:** one-line restatement
//   **進め方:**
//   - [ ] 1. step text `tool_name`
//   - [ ] 2. step text
//   **見積もり:** estimate text
// `stepDone` is the count of "✅ ステップN 完了" markers found in the
// surrounding message; steps up to that count are pre-checked.
function _renderDelegateCard(inner, stepDone, taskId){
  if(!inner) return '';
  // Pull out labeled sections. Tolerant of ** wrap and various punctuation.
  function _grab(label){
    var re = new RegExp('\\*{0,2}\\s*' + label + '\\s*[:：]\\s*\\*{0,2}\\s*([^\\n]+)','i');
    var m = String(inner).match(re);
    return m ? m[1].trim().replace(/\*+$/, '').trim() : '';
  }
  var requested = _grab('任されたこと') || _grab('依頼') || _grab('Request');
  var estimate  = _grab('見積もり')   || _grab('見積')   || _grab('Estimate');
  // Task lines — `- [ ] N. text \`tool\`` or `- [x] N. text`. Number prefix
  // is optional. Tool annotation is the last backticked word on the line.
  var taskRe = /^\s*[-*]\s*\[([ xX])\]\s+(.+?)\s*$/gm;
  var tasks = [];
  var mm;
  while((mm = taskRe.exec(inner))){
    var done = (mm[1] === 'x' || mm[1] === 'X');
    var txt  = mm[2];
    // Extract tool annotation (in backticks at end OR " → tool")
    var tool = '';
    var tm = txt.match(/`([a-zA-Z0-9_]+)`\s*$/) || txt.match(/[→→]\s*([a-zA-Z0-9_]+)\s*$/);
    if(tm){
      tool = tm[1];
      txt = txt.slice(0, tm.index).trim();
    }
    tasks.push({ done: done, text: txt, tool: tool });
  }
  // ── 履歴全体から step 完了マーカーを集計 ────────────────────
  // <delegate> カードは最初のターン (1 message) で出る。
  // 「✅ ステップN 完了」は subsequent ターンで書かれる。
  // 既存の stepDone は「この 1 メッセージの中だけ」しか見てないので、
  // ターンをまたぐと永遠に 0 のままだった。
  // 履歴の全 assistant メッセージから ✅ マーカーを拾って集計し、
  // それを stepDone に上書き反映する。これでカードは履歴の蓄積に
  // 応じて自動的にチェックが進んでいき、完了後もチェック状態を維持する。
  var historicalStepDone = stepDone || 0;
  // tool_log フォールバック用: AI が「✅ ステップN 完了」マーカーを忘れても、
  // 実際に成果物を編集する tool を呼べていれば、それを 1 ステップ進んだ扱いにする。
  // これがないと「edit_artifact は成功してるのに ☐ のまま」が起きる。
  var _mutTools = ['edit_artifact','create_artifact','replace_text','sheets_write','sheets_append','send_email','notify_slack','notify_discord','generate_image','edit_image','generate_pdf','generate_chart','wordpress_publish'];
  var _toolLogSteps = 0;
  try {
    var _ag2 = (typeof agents !== 'undefined' && agents)
      ? agents.find(function(a){ return a && a.id === activeId; }) : null;
    if(_ag2 && Array.isArray(_ag2.history)){
      // 自分の delegate カード位置を探す。tool_log カウントは「この計画より後」の
      // メッセージだけ拾う (古い計画の tool_log を流用しない)。
      var _selfIdxForTL = -1;
      for(var _si = 0; _si < _ag2.history.length; _si++){
        var _sm = _ag2.history[_si];
        if(_sm && typeof _sm.content === 'string' && _sm.content.indexOf(inner) >= 0){
          _selfIdxForTL = _si; break;
        }
      }
      for(var _hi = 0; _hi < _ag2.history.length; _hi++){
        var _hm = _ag2.history[_hi];
        if(!_hm) continue;
        // (a) 明示マーカー集計 (全履歴対象 — 古い動作と互換)
        if(typeof _hm.content === 'string'){
          var _ms = _hm.content.match(/(?:✅|✓|☑|✔)\s*(?:ステップ|Step|step)\s*(?:No\.?)?\s*([\d０-９]+)\s*(?:完了|done|完成|終了)/g) || [];
          for(var _mi = 0; _mi < _ms.length; _mi++){
            var _ds = (_ms[_mi].match(/([\d０-９]+)/)||[])[1] || '';
            var _nv = parseInt(_ds.replace(/[０-９]/g, function(c){return String.fromCharCode(c.charCodeAt(0)-0xFEE0);}), 10);
            if(_nv && _nv > historicalStepDone) historicalStepDone = _nv;
          }
        }
        // (b) tool_log フォールバック (この delegate より後のメッセージのみ)
        if(_selfIdxForTL >= 0 && _hi > _selfIdxForTL
           && _hm.role === 'assistant'
           && Array.isArray(_hm.tool_log) && _hm.tool_log.length){
          var _hasMut = _hm.tool_log.some(function(t){
            return t && t.ok !== false && _mutTools.indexOf(t.name) >= 0;
          });
          if(_hasMut) _toolLogSteps++;
        }
      }
    }
  } catch(_){}
  // 明示マーカー数と tool_log 由来カウントの大きい方を採用。
  if(_toolLogSteps > historicalStepDone) historicalStepDone = _toolLogSteps;
  // Apply step-auto-check: first N tasks tick green when stepDone advances.
  for(var i = 0; i < tasks.length; i++){
    if(historicalStepDone && i < historicalStepDone) tasks[i].done = true;
  }
  var totalDone = tasks.filter(function(t){return t.done;}).length;
  var allDone = tasks.length > 0 && totalDone === tasks.length;
  // ── 「中断」検知 ─────────────────────────────────────────
  // ユーザー提案: 「次の会話いったらタスク表一旦停止とか表示」
  // このカードより**後**にもう 1 つ <delegate> カードが履歴にあれば、
  // この古い計画は「別件で中断された」扱い → 「⏸ 中断」バッジを表示。
  // 何個までチェックついてるかは保持されたまま、status だけ変える。
  var _isInterrupted = false;
  try {
    var _ag3 = (typeof agents !== 'undefined' && agents)
      ? agents.find(function(a){ return a && a.id === activeId; }) : null;
    if(_ag3 && Array.isArray(_ag3.history) && !allDone){
      // 自分自身の delegate ブロック位置を探す (inner 一致で判定)
      var _selfIdx = -1;
      for(var _i2 = 0; _i2 < _ag3.history.length; _i2++){
        var _h = _ag3.history[_i2];
        if(_h && typeof _h.content === 'string' && _h.content.indexOf(inner) >= 0){
          _selfIdx = _i2; break;
        }
      }
      // 自分より「後」のメッセージに別の <delegate> がある？
      if(_selfIdx >= 0){
        for(var _j2 = _selfIdx + 1; _j2 < _ag3.history.length; _j2++){
          var _h2 = _ag3.history[_j2];
          if(_h2 && typeof _h2.content === 'string' && /<delegate>[\s\S]*?<\/delegate>/.test(_h2.content)){
            _isInterrupted = true; break;
          }
        }
      }
    }
  } catch(_){}
  // Visual: "受領しました" / "N / M ステップ" / "完了" / "⏸ 中断"
  var status;
  if(_isInterrupted){
    status = isJa ? '⏸ 別件で中断' : '⏸ Paused';
  }
  else if(tasks.length === 0)            status = isJa ? '受領しました' : 'Received';
  else if(allDone)                       status = isJa ? (tasks.length + ' / ' + tasks.length + ' ステップ') : ('Done ' + tasks.length + '/' + tasks.length);
  else if(totalDone === 0)               status = isJa ? '受領しました' : 'Received';
  else                                   status = totalDone + ' / ' + tasks.length + (isJa ? ' ステップ' : ' steps');
  var headLabel = _isInterrupted
    ? (isJa ? '⏸ お任せ中断' : '⏸ Paused')
    : (allDone
        ? (isJa ? '✅ お任せ完了' : '✅ Done')
        : (totalDone > 0
            ? (isJa ? '📋 お任せ進行中' : '📋 In progress')
            : (isJa ? '📋 お任せ受領' : '📋 Received')));
  // Build HTML
  var rows = '';
  if(requested){
    rows += '<div class="deli-row">'
         +   '<div class="deli-label">' + (isJa ? '任されたこと' : 'Request') + '</div>'
         +   '<div class="deli-text">' + esc(requested) + '</div>'
         + '</div>';
  }
  if(tasks.length){
    var taskHtml = tasks.map(function(t, idx){
      var nextUndone = !t.done && tasks.slice(0, idx).every(function(s){return s.done;});
      var cls = t.done ? 'done' : (nextUndone ? 'now' : '');
      var box = t.done
        ? '<span class="deli-box on">✓</span>'
        : (nextUndone ? '<span class="deli-box now"></span>' : '<span class="deli-box"></span>');
      var toolChip = t.tool ? '<span class="deli-tool">' + esc(t.tool) + '</span>' : '';
      return '<div class="deli-task ' + cls + '">'
           +   box
           +   '<span class="deli-tx">' + esc(t.text) + toolChip + '</span>'
           + '</div>';
    }).join('');
    rows += '<div class="deli-row">'
         +   '<div class="deli-label">' + (isJa ? '進め方' : 'Plan') + '</div>'
         +   '<div class="deli-tasks">' + taskHtml + '</div>'
         + '</div>';
  }
  var foot = '';
  if(estimate){
    foot = '<div class="deli-foot">⏱ ' + (isJa ? '見積もり: ' : 'Estimate: ') + esc(estimate) + '</div>';
  }
  // ── アクションボタン ──
  // 進行中 (= 未完 & 中断されてない): 「✏ 違うなら修正」
  // 中断中 (= paused): 「▶ 再開」 (task_id が分かるときだけ)
  // 完了済み: 何も出さない
  var actions = '';
  if(!allDone){
    if(_isInterrupted && taskId){
      // 「▶ 再開」 — 該当 task_id を server の resume endpoint に投げる。
      // task_id は <delegate id="..."> から抽出済み (data 属性経由)。
      actions = '<div class="deli-fix"><button class="deli-fix-btn deli-resume-btn" '
              + 'data-task-id="' + esc(taskId) + '" '
              + 'onclick="_resumeTask(this)">'
              + (isJa ? '▶ 再開' : '▶ Resume')
              + '</button></div>';
    } else if(!_isInterrupted){
      // 進行中 — 解釈訂正ボタン
      actions = '<div class="deli-fix"><button class="deli-fix-btn" onclick="_correctTask(this)">'
              + (isJa ? '✏ 違うなら修正' : '✏ Correct this')
              + '</button></div>';
    }
  }
  return '<div class="deli-card' + (allDone ? ' done' : '') + (_isInterrupted ? ' paused' : '') + '"'
       +   (taskId ? ' data-task-id="' + esc(taskId) + '"' : '')
       +   '>'
       +   '<div class="deli-head">' + headLabel
       +     '<span class="deli-head-status">' + esc(status) + '</span>'
       +   '</div>'
       +   rows
       +   foot
       +   actions
       + '</div>';
}

/* ── タスク再開ハンドラ ──────────────────────────────────────
   paused お任せ受領カードの「▶ 再開」ボタンから呼ばれる。
   POST /api/agents/:id/tasks/:taskId/resume を叩いて、サーバ側で
   旧 current_task を paused 化 + 該当 task を current_task に復帰させる。
   成功後はチャット履歴を再読込して状態反映 (新しい <delegate> カードが
   下に出るのは次の AI ターンで起きる)。 */
async function _resumeTask(btn){
  if(!activeId) return;
  var tid = btn && btn.getAttribute('data-task-id');
  if(!tid){ showToast(isJa?'タスク ID が取れませんでした':'Missing task id','ng'); return; }
  btn.disabled = true;
  btn.textContent = isJa ? '再開中…' : 'Resuming…';
  try {
    var r = await api('POST', '/api/agents/' + activeId + '/tasks/' + tid + '/resume', null);
    if(r && r.ok){
      showToast(isJa?'タスクを再開しました — 次のメッセージから続きを書いてください':'Task resumed — continue with your next message','ok');
      // ローカル agent state を更新 (server レスポンスから直接)
      var ag = agents.find(function(a){ return a.id === activeId; });
      if(ag && r.resumed){
        ag.tasks = (ag.tasks||[]).filter(function(t){ return t && t.id !== tid; });
        if(ag.current_task && ag.current_task.status === 'in_progress'){
          ag.current_task.status = 'paused';
          ag.tasks.push(ag.current_task);
        }
        ag.current_task = r.resumed;
        try { renderMsgs(ag); } catch(_){}
      }
    } else {
      showToast((r && r.error) || (isJa?'再開に失敗':'Resume failed'), 'ng');
      btn.disabled = false;
      btn.textContent = isJa ? '▶ 再開' : '▶ Resume';
    }
  } catch(e){
    showToast(isJa?'再開エラー':'Resume error', 'ng');
    btn.disabled = false;
    btn.textContent = isJa ? '▶ 再開' : '▶ Resume';
    console.warn('[task] resume error:', e);
  }
}

/* ── タスク解釈の訂正ハンドラ ───────────────────────────────
   お任せ受領カードの「✏ 違うなら修正」ボタンから呼ばれる。
   composer (メイン or thread) に訂正テンプレを差し込んで focus するだけ。
   ユーザーが内容を編集して送信 → 次ターンの _understandTask が
   scope: "correction" を返して current_task が置き換わる。 */
function _correctTask(btn){
  if(!activeId) return;
  var inThread = !!(btn && btn.closest && btn.closest('#threadDrawer'));
  var taId = inThread ? 'tci' : 'ci';
  var ta = document.getElementById(taId);
  if(!ta) return;
  // 既に composer に内容があれば末尾に足す、無ければテンプレを入れる
  var tmpl = isJa
    ? '違くて、'
    : 'Actually, ';
  if(ta.value && ta.value.trim()){
    ta.value = ta.value.trim() + '\n\n' + tmpl;
  } else {
    ta.value = tmpl;
  }
  try { exTA(ta); } catch(_){}
  ta.focus();
  // カーソルを末尾に
  try {
    var len = ta.value.length;
    ta.setSelectionRange(len, len);
  } catch(_){}
}
// Once highlight.js finishes loading (defer script), walk every code block
// already in the DOM and apply highlighting. New code blocks emitted by _md()
// during chat will pick up window.hljs synchronously after this point.
window.addEventListener('load', function(){
  if(window.hljs){
    document.querySelectorAll('pre code.hljs').forEach(function(b){
      try { window.hljs.highlightElement(b); } catch(e){}
    });
  }
});

function insertCodeBlock(ciId){
  // Pop the composer textarea, wrap selection (if any) in ```code fences```.
  // Empty selection → insert empty fences + place caret inside on the lang line.
  var ta = document.getElementById(ciId||'ci'); if(!ta) return;
  ta.focus();
  var start = ta.selectionStart, end = ta.selectionEnd;
  var selected = ta.value.slice(start, end);
  var leading  = ta.value.slice(0, start).match(/(?:^|\n)$/) ? '' : '\n';
  var trailing = ta.value.slice(end).match(/^(?:\n|$)/) ? '' : '\n';
  var insert;
  var caretPos;
  if(selected){
    insert = leading + '```\n' + selected + '\n```' + trailing;
    caretPos = start + leading.length + 3; // place caret right after opening ``` for lang hint
  } else {
    insert = leading + '```\n\n```' + trailing;
    caretPos = start + leading.length + 4; // inside the fences
  }
  ta.value = ta.value.slice(0, start) + insert + ta.value.slice(end);
  ta.setSelectionRange(caretPos, caretPos);
  // Trigger composer height recalc + send-button enable state
  if(typeof exTA === 'function') exTA(ta);
}

function copyCodeBlock(ev,btn){
  ev&&ev.stopPropagation();
  var code=decodeURIComponent(btn.getAttribute('data-code')||'');
  if(navigator.clipboard) navigator.clipboard.writeText(code);
  var orig=btn.innerHTML;
  btn.innerHTML='✓ Copied';
  setTimeout(function(){ btn.innerHTML=orig; },1400);
}

/* ── In-browser Python (Pyodide) ───────────────────────
 * Loads a single ~12MB Pyodide WASM bundle on first run, then caches it.
 * Runs each code block in a fresh global namespace so prior cells don't leak.
 * stdout / stderr are captured and shown beneath the <pre> block. */
var _pyodideLoading = null;
async function _loadPyodide(){
  if(window.pyodide) return window.pyodide;
  if(_pyodideLoading) return _pyodideLoading;
  _pyodideLoading = (async function(){
    if(!window.loadPyodide){
      await new Promise(function(resolve, reject){
        var s=document.createElement('script');
        s.src='https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        s.onload=resolve; s.onerror=reject;
        document.head.appendChild(s);
      });
    }
    window.pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
    return window.pyodide;
  })();
  return _pyodideLoading;
}

async function runPyCode(ev, btn){
  ev && ev.stopPropagation();
  var pre = btn.closest('pre'); if(!pre) return;
  var code = decodeURIComponent(btn.getAttribute('data-code')||'');
  if(!code.trim()) return;
  // Re-use or create an output box right after the <pre>.
  var out = pre.nextElementSibling;
  if(!out || !out.classList || !out.classList.contains('cb-out')){
    out = document.createElement('div');
    out.className = 'cb-out';
    pre.parentNode.insertBefore(out, pre.nextSibling);
  }
  out.classList.remove('err');
  out.innerHTML = '<div class="cb-out-h">▶ Python · loading…</div>';
  btn.disabled = true; var origLabel = btn.innerHTML; btn.innerHTML = '⋯';
  try {
    var py = await _loadPyodide();
    out.innerHTML = '<div class="cb-out-h">▶ Python · running…</div>';
    var captured = [];
    py.setStdout({ batched: function(s){ captured.push(s); } });
    py.setStderr({ batched: function(s){ captured.push(s); } });
    var result;
    try {
      result = await py.runPythonAsync(code, { globals: py.toPy({}) });
    } catch(e){
      out.classList.add('err');
      out.innerHTML = '<div class="cb-out-h">▶ Python · error</div>' + esc(captured.join('\n')+(captured.length?'\n':'')+(e && e.message || String(e)));
      return;
    }
    var stdout = captured.join('\n');
    var repr = (result === undefined || result === null) ? '' : String(result);
    out.innerHTML = '<div class="cb-out-h">▶ Python · ok</div>' + esc(stdout + (stdout && repr ? '\n' : '') + repr);
  } catch(e){
    out.classList.add('err');
    out.innerHTML = '<div class="cb-out-h">▶ Python · failed to load</div>' + esc((e&&e.message)||String(e));
  } finally {
    btn.disabled = false; btn.innerHTML = origLabel;
  }
}

/* ── Message rendering ──────────────────────────────── */
function renderMsgs(ag, forceScrollBottom){
  const el=document.getElementById('msgs');
  if(!el) return;
  // ── Scrub stale "streaming: true" entries ───────────────────
  // The ACTIVE streaming bubble is always the LAST item in ag.history (the
  // placeholder pushed by sendMsg just before SSE starts). Any earlier entry
  // with streaming:true is from an interrupted past session (browser closed,
  // Render deploy, network blip) — those would otherwise render as
  // "🍑 生成中…" forever even while a new stream is running on top.
  // Strategy: scrub every streaming:true entry EXCEPT the last one when an
  // SSE controller is currently active. Without active stream, scrub all.
  if(ag && Array.isArray(ag.history)){
    const hasActiveStream = !!(typeof window !== 'undefined' && window._chatStreamCtrl);
    const lastIdx = ag.history.length - 1;
    for(let i=0; i<ag.history.length; i++){
      const m = ag.history[i];
      if(!(m && m.streaming)) continue;
      // Last entry + active stream → that's the live bubble, leave alone.
      if(i === lastIdx && hasActiveStream) continue;
      m.streaming = false;
      if(!m.content || !String(m.content).trim()){
        m.content = isJa
          ? '(応答が途中で切れました — 「▶ 続きを書く」で再開できます)'
          : '(reply was interrupted — hit "▶ Continue" to resume)';
        m.was_stopped = true;
      }
      m.truncated = true;
    }
  }
  // Preserve scroll behavior across re-render:
  //   - If user is at/near the bottom → snap to new bottom after render
  //   - If user scrolled up to read past messages → keep their scroll position
  //   - Initial chat open (window._chatJustOpened) → always to bottom
  //   - forceScrollBottom=true (user-initiated regenerate / edit / send) → always to bottom
  const wasNearBottom = (el.scrollHeight - el.scrollTop - el.clientHeight) < 160;
  const prevScrollFromBottom = el.scrollHeight - el.scrollTop;
  const justOpened = !!window._chatJustOpened;
  const force = !!forceScrollBottom;
  el.innerHTML='<div class="msgs-inner" id="msgsInner"></div>';
  const inner=document.getElementById('msgsInner');
  if(!ag.history||!ag.history.length){
    // Fresh agent: a bare "talk to me about anything" greeting is the #1
    // onboarding drop-off — users create an agent then never send a message.
    // Show concrete one-click starter prompts so they actually begin.
    var _starters = (Array.isArray(ag.skills)?ag.skills:[]).flatMap(function(s){ return (typeof CHIPS!=='undefined' && CHIPS[s]) || []; });
    if(_starters.length < 3){
      _starters = _starters.concat(isJa
        ? ['得意なことと、できることを教えて','まず何から始めればいい？提案して','今お願いしたい仕事を相談したい']
        : ['What are you good at? What can you do?','What should we start with? Suggest something.','I want to discuss a task for you']);
    }
    _starters = _starters.slice(0, 4);
    var _startersHtml = _starters.map(function(c){
      return '<button class="starter-chip" onclick="useChip(\''+esc(c)+'\')">'+esc(c)+'</button>';
    }).join('');
    var _greet = 'はじめまして！'+esc(ag.name)+'です 👋\n\n'
      + (isJa?'下のボタンから、気軽に始めてみてください。':'Pick one below to get started.');
    inner.innerHTML = _renderMsg('assistant',ag,_greet,now(),null,-1,null)
      + '<div class="starter-wrap"><div class="starter-label">💡 '+(isJa?'こう始めてみましょう':'Try starting with')+'</div>'
      + '<div class="starter-list">'+_startersHtml+'</div></div>';
    el.scrollTop = el.scrollHeight;
    window._chatJustOpened = false;
    _updateScrollFAB();
    return;
  }
  // Proactive nudge card — render at the very top of the chat if there's
  // an undismissed, unacted nudge for this agent.
  var _activeNudge = (Array.isArray(ag.proactive_nudges) ? ag.proactive_nudges : []).find(function(n){return n && !n.dismissed && !n.acted;});
  var _nudgeHTML = '';
  if(_activeNudge){
    var accent = _agentAccent(ag) || { color:'var(--peach-dark)', soft:'rgba(251,146,60,.08)', grad:'linear-gradient(135deg,#fff7ee,#fed7aa)' };
    _nudgeHTML = '<div class="nudge-card" style="margin:14px auto;max-width:760px;background:'+accent.soft+';border:1px solid '+accent.color+';border-radius:14px;padding:14px 18px;font-size:13px;line-height:1.65;animation:fadeUp .35s ease">'
      + '<div style="display:flex;align-items:flex-start;gap:11px">'
      +   '<div style="width:30px;height:30px;border-radius:9px;background:'+accent.grad+';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px">💡</div>'
      +   '<div style="flex:1;min-width:0">'
      +     '<div style="font-size:11px;font-weight:800;color:'+accent.color+';letter-spacing:.04em;margin-bottom:3px;text-transform:uppercase">'+esc(ag.name||'AI')+' '+L('から','says')+'</div>'
      +     '<div style="color:var(--text);white-space:pre-wrap">'+esc(_activeNudge.text||'')+'</div>'
      +     '<div style="display:flex;gap:8px;margin-top:10px">'
      +       '<button onclick="_actOnNudge(\''+esc(ag.id)+'\',\''+esc(_activeNudge.id)+'\')" style="background:'+accent.color+';color:#fff;border:0;border-radius:9px;padding:7px 14px;font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit">'+L('話を聞く','Tell me more')+' →</button>'
      +       '<button onclick="_dismissNudge(\''+esc(ag.id)+'\',\''+esc(_activeNudge.id)+'\')" style="background:#fff;color:var(--text3);border:1px solid var(--wire2);border-radius:9px;padding:7px 14px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit">'+L('あとで','Later')+'</button>'
      +     '</div>'
      +   '</div>'
      + '</div>'
      + '</div>';
  }
  // Build a parent-id → thread metadata map so each parent can render a
  // Slack-style "N 件の返信" indicator (count + last reply time + repliers).
  // Also extract any artifact URLs from tool_log of thread children so the
  // main view can show clickable "📄 [filename]" pills (Slack file-share UX).
  var threadMeta = {};
  (ag.history||[]).forEach(function(m){
    if(!(m && m.thread_parent_id)) return;
    var p = m.thread_parent_id;
    if(!threadMeta[p]){ threadMeta[p] = { count:0, last_time:'', repliers:{}, artifacts:[] }; }
    threadMeta[p].count++;
    if(m.time && m.time > threadMeta[p].last_time) threadMeta[p].last_time = m.time;
    // Track unique repliers (role + user_id pair) for the stacked avatars
    var key = m.role === 'user' ? ('u:' + (m.user_id||'me')) : 'ai';
    if(!threadMeta[p].repliers[key]){
      threadMeta[p].repliers[key] = {
        role: m.role,
        avatar: m.user_avatar || (m.role==='user' ? (m.user_name||'?').charAt(0).toUpperCase() : (ag.avatar||'🤖')),
        bg: m.role === 'user' ? '#1f1f1f' : 'linear-gradient(135deg,#fda85e,#ea580c)',
      };
    }
    // Extract artifacts (URLs produced by tools) for the main-view pills.
    var tl = Array.isArray(m.tool_log) ? m.tool_log : [];
    tl.forEach(function(t){
      if(!t || !t.ok || !t.url) return;
      var icon = '📄', label = t.title || t.name || 'artifact';
      var nm = String(t.name||'');
      if(nm === 'create_artifact'){ icon = '🎨'; label = t.title || 'LP'; }
      else if(nm === 'edit_artifact'){ icon = '✏️'; label = t.title || 'edit'; }
      else if(nm === 'generate_image'){ icon = '🖼️'; label = '画像'; }
      else if(nm === 'edit_image'){ icon = '✂️'; label = '編集画像'; }
      else if(nm === 'generate_video'){ icon = '🎬'; label = '動画'; }
      else if(nm === 'generate_audio'){ icon = '🎵'; label = '音声'; }
      else if(nm === 'generate_pdf'){ icon = '📄'; label = t.title || 'PDF'; }
      else if(nm === 'generate_chart'){ icon = '📊'; label = 'グラフ'; }
      else if(nm === 'generate_diagram'){ icon = '📐'; label = '図'; }
      else if(nm === 'generate_qr'){ icon = '🔗'; label = 'QR'; }
      else if(nm === 'wordpress_publish'){ icon = '📰'; label = t.title || 'WP'; }
      else if(nm === 'generate_agent_promo_video'){ icon = '🎬'; label = 'プロモ'; }
      threadMeta[p].artifacts.push({ icon: icon, label: String(label).slice(0,30), url: t.url });
    });
  });
  ag._threadMeta = threadMeta;
  // Back-compat: keep _threadCounts so existing code paths (action row 💬 button) still work
  var threadCounts = {};
  Object.keys(threadMeta).forEach(function(k){ threadCounts[k] = threadMeta[k].count; });
  ag._threadCounts = threadCounts;
  // On narrow viewports (≤ 900px) the drawer doesn't fit comfortably, so we
  // render thread children INLINE (flat) — preserves Slack UX on desktop +
  // ChatGPT-style flow on mobile. The "💬 N 件の返信" pill still shows on
  // both for consistency.
  var _wideEnoughForDrawer = (typeof window !== 'undefined' && window.innerWidth >= 900);
  inner.innerHTML = _nudgeHTML + ag.history.map(function(m,i){
    // Thread children are hidden from the main timeline ONLY on desktop;
    // on mobile they show inline so the user always sees the AI reply.
    if(m && m.thread_parent_id && _wideEnoughForDrawer) return '';
    if(m.role === 'system'){
      return '<div class="sys-row"><span class="sys-pill">✨ '+esc(m.content||'')+'</span></div>';
    }
    if(m && m._summary){
      // Rolling-summary message: folded card with "全履歴を見る" trigger.
      var sumCount = m._summary_count || 0;
      var preview = (m.content||'').slice(0, 220);
      return '<div class="sum-row" style="margin:14px auto;max-width:760px;background:linear-gradient(135deg,#fff7ee,#fed7aa22);border:1px dashed rgba(251,146,60,.4);border-radius:13px;padding:12px 16px;font-size:12.5px;color:var(--text2);line-height:1.65">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-weight:800;color:var(--peach-dark)">'
        +   '📋 '+L('これまでの経緯','Conversation so far')
        +   '<span style="font-weight:600;color:var(--text3);font-size:11px">· '+sumCount+L(' 件を折りたたみ',' turns folded')+'</span>'
        +   '<button onclick="_openHistoryArchive(\''+esc(ag.id)+'\')" style="margin-left:auto;background:#fff;border:1px solid var(--wire2);border-radius:99px;padding:3px 10px;font-size:10.5px;font-weight:700;color:var(--text2);cursor:pointer;font-family:inherit">'+L('全履歴を見る','See full archive')+'</button>'
        + '</div>'
        + '<div style="white-space:pre-wrap">'+esc(preview)+((m.content||'').length>220?'…':'')+'</div>'
        + '</div>';
    }
    return _renderMsg(m.role,ag,m.content,m.time||'',m.images,i,m.tool_log,m);
  }).join('');
  try { _renderPinnedBanner(ag); } catch(e){}
  // Sticky-bottom: stick if user was near bottom, this is a fresh open,
  // or the caller explicitly forced scroll (user-initiated action).
  if(force || justOpened || wasNearBottom){
    el.scrollTop = el.scrollHeight;
    window._chatJustOpened = false;
  } else {
    // Restore "distance from bottom" so the user's reading position survives
    // (e.g., a group-poll re-render while they're scrolled up).
    el.scrollTop = el.scrollHeight - prevScrollFromBottom;
  }
  _updateScrollFAB();
  // Keep the thread drawer (if open) in sync — any action that re-renders
  // the main timeline (react / delete / pin / bookmark …) also refreshes
  // the thread so changes to thread messages show up immediately.
  if(window._activeThreadParent){ try{ _renderThreadDrawer(); }catch(e){} }
}

/* Compact action labels per tool name */
var _TOOL_META = {
  search_web:     { icon:'🔍', label: function(inp){ return (isJa?'検索: ':'Search: ')+(inp.query||''); } },
  browse_url:     { icon:'🌐', label: function(inp){ return (isJa?'アクセス: ':'Open: ')+(inp.url||''); } },
  click_element:  { icon:'👆', label: function(inp){ return (isJa?'クリック: ':'Click: ')+(inp.target||''); } },
  type_text:      { icon:'⌨️', label: function(inp){ return (isJa?'入力: ':'Type: ')+(inp.selector||'')+' = '+(inp.text||''); } },
  press_key:      { icon:'↩️', label: function(inp){ return (isJa?'キー押下: ':'Press: ')+(inp.key||''); } },
  take_screenshot:{ icon:'📸', label: function(){ return isJa?'スクリーンショット撮影':'Took screenshot'; } },
  read_page:      { icon:'📄', label: function(){ return isJa?'ページ再取得':'Re-read page'; } },
  // Narration — render tool log in human language ("仕事してる感" UX)
  read_artifact:  { icon:'👀', label: function(){ return isJa?'現在のサイト/HTML を確認':'Inspecting the site/HTML'; } },
  create_artifact:{ icon:'🎨', label: function(inp){ return (isJa?'サイトを作成':'Building the site')+(inp&&inp.title?': '+String(inp.title).slice(0,40):''); } },
  edit_artifact:  { icon:'✏️', label: function(inp){
                      var op = inp && inp.operation;
                      var ops = { append_to_body:'末尾に追記', append_to_selector:'要素に追加', replace_selector:'区画を書き換え', insert_before_selector:'要素の前に挿入', rewrite:'全文を書き直し' };
                      var opEn = { append_to_body:'append', append_to_selector:'append to selector', replace_selector:'replace section', insert_before_selector:'insert before', rewrite:'rewrite' };
                      var opTxt = isJa ? (ops[op]||op||'編集') : (opEn[op]||op||'edit');
                      return (isJa?'サイトを編集 — ':'Editing site — ')+opTxt+(inp&&inp.selector?' ('+inp.selector+')':'');
                    } },
  web_search:     { icon:'🔍', label: function(inp){ return (isJa?'Web を検索: ':'Web search: ')+(inp&&inp.query?inp.query:''); } },
  web_fetch:      { icon:'🌐', label: function(inp){ return (isJa?'ページを取得: ':'Fetching: ')+(inp&&inp.url?inp.url:''); } },
  web_screenshot: { icon:'📸', label: function(inp){ return (isJa?'ページを撮影: ':'Screenshotting: ')+(inp&&inp.url?inp.url:''); } },
  web_read_markdown:{ icon:'📖', label: function(inp){ return (isJa?'ページを読み込み: ':'Reading: ')+(inp&&inp.url?inp.url:''); } },
  web_extract:    { icon:'🔎', label: function(inp){ return (isJa?'情報を抽出: ':'Extracting: ')+(inp&&(inp.url||inp.query)?(inp.url||inp.query):''); } },
  generate_image: { icon:'🖼', label: function(inp){ return (isJa?'画像を生成':'Generating image')+(inp&&inp.prompt?': '+String(inp.prompt).slice(0,40):''); } },
  edit_image:     { icon:'🖼', label: function(){ return isJa?'画像を編集':'Editing image'; } },
  generate_video: { icon:'🎬', label: function(){ return isJa?'動画を生成中… (30-60秒)':'Rendering video… (30-60s)'; } },
  generate_audio: { icon:'🎙', label: function(){ return isJa?'音声を生成':'Synthesizing audio'; } },
  generate_pdf:   { icon:'📄', label: function(){ return isJa?'PDF を作成':'Building PDF'; } },
  generate_chart: { icon:'📊', label: function(){ return isJa?'グラフを描画':'Drawing chart'; } },
  generate_diagram:{ icon:'🔀', label: function(){ return isJa?'図を作成':'Drawing diagram'; } },
  generate_qr:    { icon:'🔲', label: function(){ return isJa?'QR コードを作成':'Generating QR'; } },
  send_email:     { icon:'✉️', label: function(inp){ return (isJa?'メール送信':'Sending email')+(inp&&inp.subject?': '+inp.subject:''); } },
  notify_slack:   { icon:'💬', label: function(){ return isJa?'Slack に投稿':'Posting to Slack'; } },
  notify_discord: { icon:'💬', label: function(){ return isJa?'Discord に投稿':'Posting to Discord'; } },
  ga4_query:      { icon:'📊', label: function(){ return isJa?'アクセス解析':'Analyzing traffic'; } },
  sheets_read:    { icon:'📊', label: function(){ return isJa?'スプレッドシートを読込':'Reading sheet'; } },
  sheets_write:   { icon:'📊', label: function(){ return isJa?'スプレッドシートに書込':'Writing sheet'; } },
  sheets_append:  { icon:'📊', label: function(){ return isJa?'スプレッドシートに追記':'Appending to sheet'; } },
  create_calendar_event: { icon:'📅', label: function(inp){ return (isJa?'予定を作成':'Calendar event')+(inp&&inp.title?': '+inp.title:''); } },
  ext_open_url:   { icon:'🌐', label: function(inp){ return (isJa?'タブを開く: ':'Open tab: ')+(inp&&inp.url?inp.url:''); } },
  ext_read_page:  { icon:'📖', label: function(){ return isJa?'開いてるページを読む':'Reading active page'; } },
  ext_screenshot: { icon:'📸', label: function(){ return isJa?'画面を撮影':'Screenshotting'; } },
  ext_click:      { icon:'👆', label: function(inp){ return (isJa?'クリック: ':'Click: ')+(inp&&inp.selector?inp.selector:''); } },
};

function _renderToolLog(log){
  if(!log || !log.length) return '';
  var head = '<div class="tlog-head">🌐 '+(isJa?'ブラウザ操作':'Browser activity')+' <span class="tlog-count">'+log.length+(isJa?' ステップ':' step'+(log.length>1?'s':''))+'</span> <span class="tlog-toggle">▾</span></div>';
  var rows = log.map(function(step){
    var meta = _TOOL_META[step.name] || {icon:'⚙️', label:function(){return step.name;}};
    var label = meta.label(step.input||{});
    var statusIcon = step.ok ? '✓' : '✗';
    var statusClass = step.ok ? 'ok' : 'err';
    var detail = '';
    if(step.error){
      detail = '<div class="tlog-err">'+esc(step.error)+'</div>';
    } else if(step.name==='search_web' && step.results && step.results.length){
      detail = '<div class="tlog-results">'+step.results.slice(0,5).map(function(r){
        return '<div class="tlog-result"><a href="'+esc(r.url||'')+'" target="_blank" rel="noopener">'+esc(r.title||r.url||'')+'</a><div class="tlog-snip">'+esc((r.snippet||'').slice(0,140))+'</div></div>';
      }).join('')+'</div>';
    } else if(step.title || step.url){
      detail = '<div class="tlog-page">'+(step.title?'<div class="tlog-title">'+esc(step.title)+'</div>':'')+(step.url?'<a class="tlog-url" href="'+esc(step.url)+'" target="_blank" rel="noopener">'+esc(step.url)+'</a>':'')+'</div>';
    }
    if(step.text){
      detail += '<div class="tlog-text">'+esc(step.text.slice(0,300))+(step.text.length>=300?'…':'')+'</div>';
    }
    if(step.screenshot){
      detail += '<img class="tlog-shot" src="data:image/jpeg;base64,'+step.screenshot+'" loading="lazy" onclick="this.classList.toggle(\'expanded\')">';
    }
    return '<div class="tlog-step '+statusClass+'"><div class="tlog-row"><span class="tlog-ic">'+meta.icon+'</span><span class="tlog-lbl">'+esc(label)+'</span><span class="tlog-st">'+statusIcon+'</span></div>'+detail+'</div>';
  }).join('');
  return '<details class="tlog" open><summary>'+head+'</summary><div class="tlog-body">'+rows+'</div></details>';
}

/* Collect URL-bearing tool steps (web_search, web_fetch, browse_url,
   web_screenshot, web_read_markdown, ext_*) into a numbered citations
   list rendered below an AI message body. Inline [N] markers in the text
   are linked to the matching citation via _linkInlineCitations(). */
function _collectCitations(toolLog){
  if(!Array.isArray(toolLog) || !toolLog.length) return [];
  var seen = new Set();
  var cites = [];
  for(var i=0;i<toolLog.length;i++){
    var s = toolLog[i];
    if(!s) continue;
    // Anthropic web_search step yields step.results array; iterate.
    if(s.name === 'search_web' && Array.isArray(s.results)){
      for(var j=0;j<s.results.length && cites.length < 12;j++){
        var r = s.results[j];
        if(!r || !r.url || seen.has(r.url)) continue;
        seen.add(r.url);
        cites.push({ url: r.url, title: r.title || r.url, snippet: r.snippet||'' });
      }
      continue;
    }
    // Tools that return a single URL (web_fetch, browse_url, web_read_markdown
    // etc). The fetched-page title is in step.title.
    // Skip our own artifact URLs — those render as a proper artifact card
    // (修正/コード/開く) via _artifactCardsFromToolLog, not a [N] citation.
    if(s.url && /^https?:\/\//.test(s.url) && !seen.has(s.url) && !/\/generated\/artifact-/i.test(s.url)){
      seen.add(s.url);
      cites.push({ url: s.url, title: s.title || s.url, snippet: (s.text||'').slice(0,140) });
    }
  }
  return cites;
}
// Artifact URLs (/generated/artifact-*.html) that surfaced only via a tool
// step — e.g. the AI ran ext_open_url on its own site — get rendered as the
// standard artifact card (修正 / コード / 開く), reusing _md's card renderer.
// Skipped when the AI already referenced that file in its message body.
function _artifactCardsFromToolLog(toolLog, rawContent, mdCtx){
  if(!Array.isArray(toolLog) || !toolLog.length) return '';
  var rc = String(rawContent || '');
  var seen = {};
  var out = [];
  for(var i=0;i<toolLog.length;i++){
    var s = toolLog[i];
    if(!s) continue;
    var cands = [s.url, s.input && s.input.url];
    for(var k=0;k<cands.length;k++){
      var u = cands[k];
      if(typeof u !== 'string') continue;
      // Loosened: accept ANY /generated/*.html — not just artifact-* prefixed
      // ones. Users name files anything (e.g. freecracy-dd-report.html); the
      // old regex's `artifact-` requirement excluded them and they fell out
      // of the card fallback entirely.
      var m = u.match(/\/generated\/([^/?#\s"']+\.html?)/i);
      if(!m) continue;
      var fn = m[1];
      if(seen[fn]) continue;
      seen[fn] = 1;
      // Only skip when the AI rendered an actual MARKDOWN link to this URL
      // (which `_md` would have turned into a card already). Checking just
      // for the bare filename string is wrong — the AI sometimes mentions
      // the filename in prose without wrapping it as a link, and we still
      // need the card to be injected. URL-substring match is the right
      // signal: it means there's a real `(/generated/...)` in the markdown.
      if(rc.indexOf(u) >= 0) continue;
      // Also tolerate stamped variants — `?v=N` appended URLs.
      var urlNoQS = u.split('?')[0];
      if(rc.indexOf(urlNoQS + '?') >= 0) continue;
      // Use the artifact's title from the tool result if available; otherwise
      // fall back to the bare filename so the card still has a meaningful label.
      var label = (s.title && String(s.title).slice(0, 80)) || fn || (isJa ? '作成したサイト' : 'Site');
      out.push(_md('[' + label + '](' + u + ')', mdCtx));
    }
  }
  return out.join('');
}
function _renderCitations(cites){
  if(!cites || !cites.length) return '';
  return '<div class="m-citations">' + cites.map(function(c, i){
    var host = '';
    try { host = new URL(c.url).hostname.replace(/^www\./,''); } catch(e){}
    return '<a class="m-citation" href="'+esc(c.url)+'" target="_blank" rel="noopener" title="'+esc(c.snippet||c.url)+'">'+
      '<span class="m-citation-n">['+(i+1)+']</span>'+
      '<span class="m-citation-ti">'+esc(c.title)+'</span>'+
      '<span class="m-citation-host">'+esc(host)+'</span>'+
    '</a>';
  }).join('') + '</div>';
}
/* Turn "[1]" / "[2]" markers the AI wrote in its text into clickable
   superscripts linked to the matching citation URL. */
function _linkInlineCitations(html, cites){
  if(!cites || !cites.length) return html;
  return html.replace(/\[(\d{1,2})\]/g, function(m, n){
    var i = parseInt(n,10) - 1;
    if(i < 0 || i >= cites.length) return m;
    var c = cites[i];
    return '<a class="cite" href="'+esc(c.url)+'" target="_blank" rel="noopener" title="'+esc(c.title)+'">'+n+'</a>';
  });
}

// True only while _renderThreadDrawer renders a message inside the thread
// drawer. Lets _renderMsg suppress actions that aren't thread-aware
// (edit / regenerate / quote-reply / continue / retry target the MAIN
// timeline or composer and would corrupt history if run on a thread msg).
var _renderingInThread = false;
function _renderMsg(role, ag, content, time, images, idx, tool_log, raw){
  const isU = role==='user';
  const isGroup = !!(ag && ag.is_group);
  // For group chats, show speaker's actual name (not just "あなた")
  const speakerName = (raw && raw.user_name) ? raw.user_name : '';
  const speakerInitial = (raw && raw.user_avatar) ? raw.user_avatar : null;
  const isMyMsg = isU && (!raw || !raw.user_id || raw.user_id === me?.id);
  // Huddle: each assistant turn carries the speaking member's identity,
  // so the bubble shows that member's avatar / name rather than the team's.
  const huddleMember = (!isU && raw && raw.huddle_member_id) ? raw : null;
  const huddleSummary = (!isU && raw && raw.huddle_summary) ? true : false;
  const av = isU
    ? (speakerInitial || esc((me?(me.name||me.email||'?').charAt(0).toUpperCase():'?')))
    : (huddleMember ? _avHTML(huddleMember.huddle_member_avatar || '🤖') : _avHTML(ag.avatar));
  const name = isU
    ? (isGroup && speakerName ? speakerName : (isJa?'あなた':'You'))
    : (huddleMember ? (huddleMember.huddle_member_name || ag.name || '')
       : huddleSummary ? L('📋 議論サマリ','📋 Discussion summary')
       : (ag.name||''));
  // Color code by user_id so each speaker has a stable hue (deterministic)
  const userColor = isU && raw && raw.user_id ? _userColor(raw.user_id) : null;
  // Per-agent accent — only in groups/teams (DMs don't need to disambiguate).
  // For huddle member turns, seed by member_id so each member's bubble is
  // visually distinct from the team's coordinator bubble.
  let agentAccent = null;
  if(!isU && isGroup){
    if(huddleMember){
      agentAccent = _agentAccent({ id: huddleMember.huddle_member_id, name: huddleMember.huddle_member_name, skills:[huddleMember.huddle_member_name||'x'] });
    } else if(!huddleSummary){
      agentAccent = _agentAccent(ag);
    }
  }
  // Slack-style reply: AI message that directly answers the immediately-
  // previous user message gets a left-indent + vertical line.
  // Don't apply to: huddle bubbles (already have their own visual), error
  // bubbles, summary cards, or messages with thread_parent_id (different UI).
  let _isReply = false;
  if(!isU && idx > 0 && ag && Array.isArray(ag.history) && !huddleMember && !huddleSummary && !(raw && raw.is_error) && !(raw && raw.thread_parent_id) && !_renderingInThread){
    const _prev = ag.history[idx-1];
    if(_prev && _prev.role === 'user' && !_prev.thread_parent_id) _isReply = true;
  }
  const cls = 'm '+(isU?(isMyMsg?'u':'u other'):'a'+(_isReply?' reply':''));
  let imgHtml='';
  if(images && images.length){
    imgHtml = images.map(function(att){
      var isPdf = att.kind==='pdf' || att.type==='application/pdf';
      if(isPdf){
        return '<div class="m-attach"><div style="width:36px;height:36px;border-radius:6px;background:#dc2626;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;flex-shrink:0">PDF</div><span>'+esc(att.name||(isJa?'PDFファイル':'PDF'))+'</span></div>';
      }
      if(att.kind==='text'){
        return '<div class="m-attach"><div style="width:36px;height:36px;border-radius:6px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;flex-shrink:0">TXT</div><span>'+esc(att.name||(isJa?'テキストファイル':'text'))+'</span></div>';
      }
      if(att.kind==='url'){
        var label = att.name || att.source || 'URL';
        var href = att.source || '';
        var inner = href ? '<a href="'+esc(href)+'" target="_blank" rel="noopener">'+esc(label)+'</a>' : esc(label);
        return '<div class="m-attach"><div style="width:36px;height:36px;border-radius:6px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">🔗</div><span>'+inner+'</span></div>';
      }
      var url = att.url || (att.b64?'data:'+att.type+';base64,'+att.b64:'');
      return '<div class="m-attach"><img class="thumb" src="'+url+'"><span>'+esc(att.name||(isJa?'画像':'image'))+'</span></div>';
    }).join('');
  }
  // Collect URL citations from any web-search/fetch tools the agent ran,
  // then turn [1]/[2] markers in the AI text into clickable superscripts.
  const cites = !isU ? _collectCitations(tool_log) : [];
  // ── Streaming flag (moved up — needed by _md for artifact-card editing state) ──
  // A bubble shows streaming UI only while a real stream controller is active;
  // a leftover streaming:true flag from a crashed/reloaded turn is treated as
  // stale.
  const isStreaming = !!(raw && raw.streaming) && !!(_chatStreamCtrl || _threadStreamCtrl);
  // 「このターンで編集中の artifact ファイル名」セット — _md の中の artifact
  // カードが「開く / コード」ボタンを「✏ 編集中…」に差し替えるのに使う。
  // 編集系 tool が走った filename を全部入れる。streaming 中のみ有効。
  const _editingFnames = (isStreaming && Array.isArray(tool_log))
    ? new Set(tool_log
        .filter(t => t && t.ok !== false && t.filename
                 && ['edit_artifact','create_artifact','replace_text'].indexOf(t.name) >= 0)
        .map(t => t.filename))
    : null;
  let body = content ? _md(content, { isStreaming, editingFnames: _editingFnames }) : '';
  if(cites.length) body = _linkInlineCitations(body, cites);
  const tlogHtml = (!isU && tool_log) ? _renderToolLog(tool_log) : '';
  // ── Completion summary badge ─────────────────────────────────────────
  // Surface a one-line "what just happened" chip at the top of the bubble —
  // number of tools used + new/edited artifacts + elapsed wall time. Lets
  // users see at a glance that the AI actually worked (vs. just chatting),
  // without scanning the full tool log.
  // Suppressed during streaming and when no tool ran (pure-text reply).
  // After a finished agentic turn, surface a one-line "what just happened"
  // chip at the top of the bubble — number of tools used + new/edited
  // artifacts + elapsed wall time. Lets users see at a glance that the AI
  // actually worked (vs. just chatting), without scanning the full tool log.
  // Suppressed during streaming and when no tool ran (pure-text reply).
  let summaryHTML = '';
  if(!isU && !isStreaming && Array.isArray(tool_log) && tool_log.length > 0){
    const _okTools  = tool_log.filter(t => t && t.ok !== false).length;
    const _artNames = new Set();
    let _newArts = 0, _editArts = 0;
    tool_log.forEach(t => {
      if(!t) return;
      if(t.name === 'create_artifact' && t.ok !== false){ _newArts++;  if(t.filename) _artNames.add(t.filename); }
      if(t.name === 'edit_artifact'   && t.ok !== false){ _editArts++; if(t.filename) _artNames.add(t.filename); }
    });
    const _elapsed = (raw && (raw.elapsed_ms || raw.elapsed)) || 0;
    const _elapsedTxt = _elapsed > 0
      ? (_elapsed < 60000
          ? (Math.round(_elapsed/100)/10).toFixed(1) + 's'
          : Math.round(_elapsed/60000) + 'm')
      : '';
    const _parts = [];
    _parts.push('🛠 ' + _okTools + (isJa?' 個のツール':' tools'));
    if(_newArts)  _parts.push('🆕 ' + _newArts + (isJa?' 件作成':' new'));
    if(_editArts) _parts.push('✏️ ' + _editArts + (isJa?' 件編集':' edits'));
    if(_elapsedTxt) _parts.push('⏱ ' + _elapsedTxt);
    summaryHTML = '<div class="m-summary" title="'+(isJa?'このターンで AI が行った作業':'What this turn did')+'">'
      + '<span class="m-summary-ic">✅</span>'
      + '<span class="m-summary-txt">'+_parts.join(' · ')+'</span>'
      + '</div>';
  }
  // ── 約束未実行 警告チップ ─────────────────────────────────
  // Server detected the AI said 修正します/実装します etc. but no mutating
  // tool actually ran this turn. Surface a visible warning so the user
  // knows the AI didn't actually do the work — and a 「実行する」 button
  // that auto-resends a "やって" message to push the AI to actually execute.
  let promiseWarnHTML = '';
  if(!isU && !isStreaming && raw && Array.isArray(raw.promise_unfulfilled) && raw.promise_unfulfilled.length){
    const phrase = String(raw.promise_unfulfilled[0]||'').slice(0, 40);
    promiseWarnHTML = '<div class="m-promise-warn" title="'
      + (isJa?'AI が「やります」と言ったが、実際の編集ツールが呼ばれていません':'AI promised but no mutating tool ran')+'">'
      + '<span class="m-pw-ic">⚠️</span>'
      + '<span class="m-pw-txt">'
      +   (isJa
            ? ('「' + esc(phrase) + '」と言いましたが、実際の編集はまだ実行されていません。')
            : ('AI said "' + esc(phrase) + '" but the actual edit didn\'t run.'))
      + '</span>'
      + '<button class="m-pw-act" onclick="_pwGoAhead(this)">'
      +   (isJa?'▶ 実行する':'▶ Run it')
      + '</button>'
      + '</div>';
  }
  // ── 段階承認カード ─────────────────────────────────────
  // 「社員 (AI) が作って → 上司 (ユーザー) が確認 → 次へ進める」フロー。
  // この AI メッセージで「✅ ステップN 完了」が emit されていて、かつ
  // 計画 (<delegate>) にまだ未消化のステップが残っているとき、メッセージ
  // 末尾に「✅ OK 進める / ⏸ 一時停止」カードを描画する。
  // 段階承認カード (▶ 続ける / ⏸ 一時停止) は廃止。
  // 理由: 単発依頼 (LP 1 個作成 / メール 1 通送信 / 画像生成) でも誤発火して
  // 「続けますか?」が出る、判定ロジックが複雑で false-positive 多発、
  // そもそも AI はとにかく動かして、修正があればチャットで言わせる方が
  // 試行錯誤が早い、というユーザー判断。差し替え変数だけ残す (下流参照)。
  const approvalHTML = '';
  const citesHtml = cites.length ? _renderCitations(cites) : '';
  // Artifact cards for any /generated/artifact-*.html the AI touched via a
  // tool (ext_open_url etc.) but didn't write as a [title](url) link itself.
  const artifactCards = !isU ? _artifactCardsFromToolLog(tool_log, content, { isStreaming, editingFnames: _editingFnames }) : '';
  // Edit-failure banner — surface a failed create_artifact / edit_artifact
  // so the user sees what happened even when the AI's reply text says it
  // succeeded ("修正します！" but the tool actually returned error).
  let editFailHTML = '';
  if(!isU && Array.isArray(tool_log)){
    const _fails = tool_log.filter(t => t
      && (t.name === 'edit_artifact' || t.name === 'create_artifact')
      && t.ok === false);
    if(_fails.length){
      editFailHTML = '<div class="m-edit-fails">'
        + _fails.map(function(f){
            const ttl = f.name === 'edit_artifact'
              ? L('編集に失敗しました','Edit failed')
              : L('成果物の作成に失敗しました','Artifact creation failed');
            return '<div class="m-edit-fail">'
              + '<div class="m-edit-fail-ic">❌</div>'
              + '<div class="m-edit-fail-bd">'
              +   '<div class="m-edit-fail-h">'+esc(ttl)+'</div>'
              +   '<div class="m-edit-fail-d">'+esc(String(f.error||'').slice(0,260))+'</div>'
              + '</div>'
              + '</div>';
          }).join('')
        + '</div>';
    }
  }
  let acts = '';
  let inlineActs = '';  // Continue / Retry — always visible, not gated by show-acts
  if(idx>=0){
    const isBookmarked = !!(raw && (raw.bookmarked || (Array.isArray(raw.bookmarked_by) && raw.bookmarked_by.includes(me?.id))));
    const bmBtn = '<button class="m-act bm'+(isBookmarked?' bm-on':'')+'" onclick="toggleBookmark(this)" title="ブックマーク">'+(isBookmarked?'★':'☆')+'</button>';
    // Delete button — shown on own DMs / hosted-group messages. Joined-group
    // messages can't be deleted (server returns 403); we hide the button there.
    var delBtn = (idx>=0 && !(ag && ag._is_joined_group))
      ? '<button class="m-act" onclick="deleteMsg(this)" title="'+(isJa?'メッセージを削除':'Delete message')+'">🗑 '+(isJa?'削除':'Delete')+'</button>'
      : '';
    // Slack-style: Copy / Thread / Pin live in the HOVER BAR only.
    // The bottom .m-acts row is reserved for secondary actions (Edit /
    // Regenerate / Remember / Speak / Bookmark / Delete) — shown only when
    // the user clicks the ⋯ button on the hover-bar. No duplicates.
    if(isU){
      var editBtn = (isMyMsg && !_renderingInThread) ? '<button class="m-act" onclick="editMsgStart(this)" title="'+(isJa?'編集して再生成':'Edit & resend')+'">✏️ '+(isJa?'編集':'Edit')+'</button>' : '';
      acts = editBtn+bmBtn+delBtn;
    } else {
      var rememberBtn = '<button class="m-act" onclick="rememberMsg(this)" title="'+(isJa?'記憶として保存':'Save to memory')+'">🧠 '+(isJa?'記憶':'Remember')+'</button>';
      // Quote-reply writes to the MAIN composer and Regenerate re-runs the
      // last MAIN message — neither is thread-aware, so hide them in threads.
      var replyBtn = _renderingInThread ? '' : '<button class="m-act" onclick="replyToMsg(this)" title="'+(isJa?'引用して返信':'Reply to this')+'">↩️ '+(isJa?'返信':'Reply')+'</button>';
      var regenBtn = _renderingInThread ? '' : '<button class="m-act" onclick="regenerateMsg(this)">🔄 '+(isJa?'再生成':'Regenerate')+'</button>';
      acts = regenBtn+
             replyBtn+
             rememberBtn+
             '<button class="m-act" onclick="speakMsg(this)" title="読み上げ">🔊 '+(isJa?'読み上げ':'Speak')+'</button>'+
             bmBtn+delBtn;
    }
    // Continue / Retry — ALWAYS visible (separate row, not gated by show-acts).
    // Critical recovery actions for truncated or errored replies.
    if(!isU && raw && raw.truncated && !_renderingInThread){
      var contLabel = raw.was_stopped
        ? (isJa ? '▶ 続きから生成' : '▶ Resume')
        : (isJa ? '▶ 続きを書く' : '▶ Continue');
      inlineActs += '<button class="m-act m-act-continue" onclick="continueMsg(this)" title="'+(isJa?'続きを生成':'Continue')+'">'+contLabel+'</button>';
    }
    if(!isU && raw && raw.is_error){
      // Retry button. In threads, we use _retryThreadMsg which re-sends the
      // previous USER message in this thread; in main chat, retryMsg.
      var _retryFn = _renderingInThread ? '_retryThreadMsg(this)' : 'retryMsg(this)';
      inlineActs += '<button class="m-act m-act-retry" onclick="'+_retryFn+'" title="'+(isJa?'もう一度試す':'Retry')+'">🔄 '+(isJa?'再試行':'Retry')+'</button>';
    }
  }
  // In groups, highlight @AI / @name mentions in the body.
  let bodyMarkup = body;
  if(isU && isGroup && bodyMarkup){
    bodyMarkup = bodyMarkup.replace(/(@AI|＠AI|@ai|＠ai)\b/g, '<span class="mention ai">$1</span>');
  }
  // Stopped-mid-stream badge: small inline tag at the end of partial content so
  // the user immediately understands the bubble was cut by their own action
  // (vs. an error). The Continue button under it explains the recovery path.
  if(!isU && raw && raw.was_stopped && bodyMarkup){
    bodyMarkup += '<div style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;background:#fff7ee;border:1px solid #fed7aa;color:var(--peach-dark);padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.01em">⏸ '+(isJa?'ここで停止しました':'Stopped here')+'</div>';
  }
  // Streaming placeholder: show the live "生成中…" indicator INSIDE the .m-body
  // so the bubble has a visible body even before any text arrives. Without
  // this, an empty assistant entry rendered as just header+actions and the
  // _sendMsgStream patch path failed to find .m-body to write deltas into.
  // (isStreaming declared earlier — see the summaryHTML block above.)
  if(!isU && isStreaming && !bodyMarkup){
    bodyMarkup = '<div class="gen-indicator"><div class="gen-logo"></div><div class="gen-text">'
      + (isJa?'生成中…':'Generating…') + '</div></div>';
  }
  // While streaming, hide the action buttons (they only make sense once the
  // message is finalized).
  const actsToShow = isStreaming ? '' : acts;
  // Always render .m-body for assistant rows (so streaming can patch into it
  // even if content was empty when this row was rendered).
  const renderBody = bodyMarkup || (!isU);
  const avStyle = userColor ? ' style="background:'+userColor+'"' : '';
  // Reactions row (groups only — solo agents don't have anyone else to react)
  let reactionsHTML = '';
  if(isGroup && raw && Array.isArray(raw.reactions) && raw.reactions.length){
    const grouped = {};
    raw.reactions.forEach(r => {
      if(!r || !r.emoji) return;
      grouped[r.emoji] = grouped[r.emoji] || {count:0, mine:false, names:[]};
      grouped[r.emoji].count++;
      grouped[r.emoji].names.push(r.name || '?');
      if(r.user_id === me?.id) grouped[r.emoji].mine = true;
    });
    reactionsHTML = '<div class="m-reactions">'
      + Object.entries(grouped).map(([emo, info]) =>
          '<button class="reaction'+(info.mine?' mine':'')+'" data-idx="'+idx+'" data-emoji="'+esc(emo)+'" title="'+esc(info.names.join(', '))+'" onclick="_toggleReaction(this)">'
            + '<span class="r-em">'+esc(emo)+'</span><span class="r-n">'+info.count+'</span>'
          + '</button>'
        ).join('')
      + (idx>=0 ? '<button class="reaction add" data-idx="'+idx+'" onclick="_openReactionPicker(this, event)" title="リアクションを追加">＋</button>' : '')
      + '</div>';
  } else if(isGroup && !isStreaming && idx >= 0){
    // Empty reactions — show "+" only on hover via CSS
    reactionsHTML = '<div class="m-reactions empty">'
      + '<button class="reaction add" data-idx="'+idx+'" onclick="_openReactionPicker(this, event)" title="リアクションを追加">＋</button>'
      + '</div>';
  }
  // Read receipts: for my own group messages, count how many OTHER members
  // have last_read_idx > this msg's idx.
  //   0 readers  → ✓     (delivered, nobody else has read)
  //   1+ readers → ✓✓ N  (read by N other members)
  let readReceipt = '';
  if(isGroup && isU && raw && raw.user_id === me?.id && idx >= 0 && Array.isArray(ag.members)){
    let readers = 0, otherMembers = 0;
    for(const mem of ag.members){
      if(!mem || mem.user_id === me?.id) continue;
      otherMembers++;
      const li = Number.isInteger(mem.last_read_idx) ? mem.last_read_idx : 0;
      if(li > idx) readers++;
    }
    if(otherMembers > 0){
      const tipDel = isJa ? '送信済み (まだ未読)' : 'Delivered (unread)';
      const tipRead = isJa ? readers + ' 人が既読' : 'Read by ' + readers;
      // Two-member chats (host + 1) → no count, just ticks.
      const countBadge = otherMembers > 1 && readers > 0 ? '<span class="m-read-n">'+readers+'</span>' : '';
      if(readers > 0){
        readReceipt = '<span class="m-read read" title="'+tipRead+'" aria-label="'+tipRead+'">✓✓'+countBadge+'</span>';
      } else {
        readReceipt = '<span class="m-read delivered" title="'+tipDel+'" aria-label="'+tipDel+'">✓</span>';
      }
    }
  }
  // Apply the agent accent to the outer row + avatar in group/team chats.
  const rowStyle = agentAccent
    ? ' style="border-left:3px solid '+agentAccent.color+';padding-left:9px;background:linear-gradient(90deg,'+agentAccent.soft+' 0%,transparent 26%);border-radius:9px"'
    : '';
  const aiAvStyle = (!isU && agentAccent)
    ? ' style="background:'+agentAccent.grad+';box-shadow:0 0 0 2px '+agentAccent.soft+'"'
    : avStyle;
  const nameStyle = agentAccent ? ' style="color:'+agentAccent.color+';font-weight:800"' : '';
  // Slack-style thread indicator — only shown when this message has replies.
  // Format mirrors Slack: stacked avatars + "N 件の返信" (link color) + last
  // reply time. Clicking opens the thread drawer.
  var threadIndicatorHTML = '';
  var _tid = raw && raw.id;
  var _tmeta = _tid && ag && ag._threadMeta ? ag._threadMeta[_tid] : null;
  if(_tmeta && _tmeta.count > 0 && !isStreaming){
    var _avHtml = Object.values(_tmeta.repliers).slice(0,3).map(function(r){
      return '<div class="thread-rep-av" style="background:'+r.bg+'">'+esc(r.avatar||'?')+'</div>';
    }).join('');
    var _lastT = _tmeta.last_time ? ' · '+L('最終返信','last reply')+' '+esc(_tmeta.last_time) : '';
    // Slack-style artifact "file" pills: produced URLs surface in the main
    // timeline next to the thread indicator, so users can open the LP / image
    // / PDF without entering the drawer. event.stopPropagation prevents the
    // thread-indicator's onclick from firing when the pill is clicked.
    var _artifactsHtml = '';
    if(Array.isArray(_tmeta.artifacts) && _tmeta.artifacts.length){
      _artifactsHtml = _tmeta.artifacts.slice(0, 5).map(function(a){
        return '<a href="'+esc(a.url)+'" target="_blank" rel="noopener" onclick="event.stopPropagation()" '
          + 'style="display:inline-flex;align-items:center;gap:4px;background:#fff;border:1px solid var(--wire2);border-radius:6px;padding:2px 8px 2px 6px;font-size:11.5px;font-weight:700;color:var(--text);text-decoration:none;margin-left:4px;transition:all .12s" '
          + 'onmouseover="this.style.borderColor=\'var(--peach)\';this.style.color=\'var(--peach-dark)\'" '
          + 'onmouseout="this.style.borderColor=\'var(--wire2)\';this.style.color=\'var(--text)\'">'
          + '<span>'+esc(a.icon)+'</span><span style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(a.label)+'</span>'
          + '</a>';
      }).join('');
    }
    // Defensive: if count was corrupted (race condition, malformed history)
    // fall back to 0 so we never render "NaN 件の返信" in the UI.
    var _safeCount = (typeof _tmeta.count === 'number' && _tmeta.count > 0) ? _tmeta.count : 0;
    threadIndicatorHTML = '<div class="thread-indicator" onclick="_openThread(\''+esc(_tid)+'\')">'
      + '<div class="thread-reps">'+_avHtml+'</div>'
      + '<span class="thread-count">'+_safeCount+L(' 件の返信',' replies')+'</span>'
      + '<span class="thread-last">'+_lastT+'</span>'
      + _artifactsHtml
      + '</div>';
  }
  // Slack-style hover toolbar (top-right of each message). Shown only on
  // hover via CSS. Contains the 6 most-used quick actions; full action set
  // lives in the existing .m-acts row below the message.
  var hoverBarHTML = '';
  if(idx >= 0 && !isStreaming){
    var hbThreadId = raw && raw.id;
    var hbThreadBtn = (hbThreadId && !_renderingInThread)
      ? '<button class="hb-b hb-thread" onclick="_openThread(\''+esc(hbThreadId)+'\')" title="'+L('スレッドで返信','Reply in thread')+'">💬</button>'
      : '';
    hoverBarHTML = '<div class="hover-bar">'
      + (isGroup ? '<button class="hb-b" onclick="_openReactionPicker(this.closest(\'.m\').querySelector(\'.reaction.add\'), event)" title="'+L('リアクションを追加','Add reaction')+'">😀</button>' : '')
      + hbThreadBtn
      + '<button class="hb-b" onclick="_addMsgToTasks(this)" title="'+L('タスクに追加','Add to tasks')+'">✓</button>'
      + '<button class="hb-b" onclick="copyMsgText(this.closest(\'.m\').querySelector(\'.m-body\'))" title="'+L('コピー','Copy')+'">📋</button>'
      + (raw && raw.pinned ? '<button class="hb-b hb-on" onclick="togglePin(this.closest(\'.m\').querySelector(\'.pin\'))" title="'+L('ピン留めを解除','Unpin')+'">📌</button>' : '<button class="hb-b" onclick="togglePin(this.closest(\'.m\').querySelector(\'.pin\'))" title="'+L('ピン留め','Pin')+'">📌</button>')
      + '<button class="hb-b" onclick="this.closest(\'.m\').classList.toggle(\'show-acts\')" title="'+L('その他','More')+'">⋯</button>'
      + '</div>';
  }
  // Slack-flat layout:
  //   .m (row) = .m-av-wrap (left) + .m-content (right) + .hover-bar (overlay)
  //   .m-content contains the existing .m-meta / images / tool log / body / reactions / thread-indicator / acts
  // Huddle sub-agent identity chip — clearly mark "this bubble is member X
  // from team Y, currently speaking in round R". Without it, huddle turns
  // can blur into a single voice. The chip lives next to the name and uses
  // the same accent color as the bubble border so it reads as one identity.
  let huddleChipHTML = '';
  if(huddleMember){
    const _teamLbl = esc(ag && ag.name || '');
    const _roundN  = huddleMember.huddle_round;
    const _chipBg  = agentAccent ? agentAccent.soft : 'rgba(251,146,60,.12)';
    const _chipCol = agentAccent ? agentAccent.color : 'var(--peach-dark)';
    huddleChipHTML = '<span class="m-huddle-chip" style="background:'+_chipBg+';color:'+_chipCol+'"'
      + ' title="'+L('チーム '+(ag&&ag.name||'')+' のメンバー','Team '+(ag&&ag.name||'')+' member')+'">'
      + '🎙 '+_teamLbl
      + (Number.isInteger(_roundN) ? ' · R'+(_roundN+1) : '')
      + (isStreaming ? ' · <span class="hud-now">'+L('発言中','speaking')+'</span>' : '')
      + '</span>';
  } else if(huddleSummary){
    huddleChipHTML = '<span class="m-huddle-chip" style="background:rgba(251,146,60,.12);color:var(--peach-dark)">'
      + '📋 '+esc(ag && ag.name || '') + ' · ' + L('議論まとめ','summary')
      + '</span>';
  }
  return '<div class="'+cls+(isStreaming?' streaming':'')+(huddleMember?' huddle-turn':'')+'" data-idx="'+idx+'"'+rowStyle+'>'+
    '<div class="m-av-wrap">'+
      '<div class="m-av'+(isU?' user':'')+'"'+aiAvStyle+'>'+av+'</div>'+
    '</div>'+
    '<div class="m-content">'+
      '<div class="m-meta">'+
        '<span class="m-name"'+nameStyle+'>'+esc(name)+'</span>'+
        huddleChipHTML+
        '<span class="m-time">'+esc(time||'')+'</span>'+
        readReceipt+
      '</div>'+
      imgHtml+
      tlogHtml+
      editFailHTML+
      summaryHTML+
      promiseWarnHTML+
      (renderBody?'<div class="m-body">'+(bodyMarkup||'')+artifactCards+citesHtml+'</div>':'')+
      approvalHTML+
      reactionsHTML+
      threadIndicatorHTML+
      (inlineActs?'<div class="m-inline-actions">'+inlineActs+'</div>':'')+
      (actsToShow?'<div class="m-acts">'+actsToShow+'</div>':'')+
    '</div>'+
    hoverBarHTML+
  '</div>';
}

// Reaction picker — small popup with curated emoji set
const _REACTION_EMOJIS = ['👍','❤️','😂','🎉','🔥','👀','🙏','🚀','💯','🤔'];

function _openReactionPicker(btn, ev){
  if(ev) ev.stopPropagation();
  const idx = btn.dataset.idx;
  // Remove any existing picker
  document.querySelectorAll('.reaction-picker').forEach(el => el.remove());
  const picker = document.createElement('div');
  picker.className = 'reaction-picker';
  picker.innerHTML = _REACTION_EMOJIS.map(e =>
    '<button onclick="_pickReaction(\''+esc(idx)+'\',\''+esc(e)+'\',this)">'+esc(e)+'</button>'
  ).join('');
  document.body.appendChild(picker);
  // Position via viewport coordinates (position:fixed). Pin above the button,
  // clamp horizontally to the viewport.
  const r = btn.getBoundingClientRect();
  const pw = 240; // picker approx width
  const ph = 42;  // picker approx height
  const pl = Math.min(window.innerWidth - pw - 12, Math.max(12, r.left));
  let pt = r.top - ph - 6;
  if(pt < 12) pt = r.bottom + 6; // not enough room above → place below
  picker.style.left = pl + 'px';
  picker.style.top  = pt + 'px';
  // Click-outside to close
  setTimeout(() => {
    document.addEventListener('click', () => picker.remove(), { once: true });
  }, 0);
}

async function _pickReaction(idx, emoji, btn){
  if(btn) btn.closest('.reaction-picker')?.remove();
  if(!activeId) return;
  try {
    const r = await api('POST', '/api/agents/' + activeId + '/messages/' + idx + '/react', {emoji, op:'toggle'});
    // Patch local history entry and re-render
    const ag = agents.find(a => a.id === activeId);
    if(ag && Array.isArray(ag.history) && ag.history[idx]){
      ag.history[idx].reactions = r.reactions || [];
      renderMsgs(ag);
    }
  } catch(e){ showToast(e.message, 'ng'); }
}

async function _toggleReaction(btn){
  const idx = btn.dataset.idx;
  const emoji = btn.dataset.emoji;
  if(!activeId || !idx || !emoji) return;
  try {
    const r = await api('POST', '/api/agents/' + activeId + '/messages/' + idx + '/react', {emoji, op:'toggle'});
    const ag = agents.find(a => a.id === activeId);
    if(ag && Array.isArray(ag.history) && ag.history[idx]){
      ag.history[idx].reactions = r.reactions || [];
      renderMsgs(ag);
    }
  } catch(e){ showToast(e.message, 'ng'); }
}

// Deterministic color hue from user_id so each speaker always renders the
// same avatar gradient. Returns a CSS gradient string.
function _userColor(uid){
  if(!uid) return null;
  let h = 0;
  for(let i=0;i<uid.length;i++) h = (h*31 + uid.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return 'linear-gradient(135deg, hsl('+hue+',70%,55%), hsl('+(hue+30)%360+',70%,40%))';
}

// Deterministic per-agent accent. Same agent name → always same color, so a
// "Designer AI" in any team chat is recognizably pink-ish, an "Engineer AI"
// is blue-ish, etc. Used in team chats to give each member a visual handle.
// Returns {hue, name (CSS color), bg (light tint), grad (avatar gradient)}.
function _agentAccent(ag){
  if(!ag) return null;
  // Seed: prefer skills.join(',') over name so renaming doesn't lose identity.
  // Fall back to name + id.
  const seed = (Array.isArray(ag.skills) && ag.skills.length
    ? ag.skills.join(',')
    : ((ag.name||'') + ':' + (ag.id||''))) || 'x';
  let h = 0;
  for(let i=0;i<seed.length;i++) h = (h*31 + seed.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return {
    hue,
    color: 'hsl('+hue+',62%,46%)',
    bg:    'hsl('+hue+',75%,96%)',
    soft:  'hsla('+hue+',62%,46%,.12)',
    grad:  'linear-gradient(135deg, hsl('+hue+',75%,92%), hsl('+((hue+30)%360)+',70%,85%))',
  };
}

// Member panel — slide-out drawer showing all members + invite/remove actions.
async function openMemberPanel(agId){
  const ag = agents.find(a => a.id === agId);
  if(!ag) return;
  let members = ag.members || [];
  let pendingRequests = [];
  let token = ag.invite_token || null;
  try {
    const m = await api('GET', '/api/agents/' + agId + '/members');
    members = m.members || [];
    pendingRequests = Array.isArray(m.pending_requests) ? m.pending_requests : [];
    token = m.invite_token || null;
    ag.members = members;
  } catch(e){}
  const isHost = ag.host_id === me?.id;
  const overlay = document.getElementById('grpMemberOverlay');
  if(!overlay) return;
  document.getElementById('grpMemberTitle').textContent = ag.name;
  const list = document.getElementById('grpMemberList');

  // Pending requests block (host only)
  let pendingHTML = '';
  if(isHost && pendingRequests.length){
    pendingHTML = '<div style="margin-bottom:12px;padding:10px 12px;background:rgba(99,102,241,.06);border:.5px solid rgba(99,102,241,.18);border-radius:9px">'
      + '<div style="font-size:10.5px;font-weight:700;color:#4338ca;margin-bottom:8px;letter-spacing:.04em;text-transform:uppercase">参加リクエスト ('+pendingRequests.length+')</div>'
      + pendingRequests.map(p => {
          const initial = (p.name||'?').charAt(0).toUpperCase();
          const color = _userColor(p.user_id);
          return '<div class="mem-row" style="padding:6px 0;border:0">'
            + '<div class="mem-av" style="background:'+color+';width:30px;height:30px">'+esc(initial)+'</div>'
            + '<div class="mem-meta"><div class="mem-name" style="font-size:12px">'+esc(p.name||'')+'</div>'
            + '<div class="mem-sub">'+new Date(p.requested_at||Date.now()).toLocaleString('ja-JP',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})+'</div></div>'
            + '<button class="grpset-btn primary" style="padding:5px 10px;font-size:10.5px" onclick="_approveJoin(\''+esc(agId)+'\',\''+esc(p.user_id)+'\')">承認</button>'
            + '<button class="grpset-btn" style="padding:5px 10px;font-size:10.5px;background:rgba(9,9,11,.05);color:var(--text2);margin-left:4px" onclick="_denyJoin(\''+esc(agId)+'\',\''+esc(p.user_id)+'\')">却下</button>'
            + '</div>';
        }).join('')
      + '</div>';
  }

  list.innerHTML = pendingHTML + members.map(m => {
    const isMe = m.user_id === me?.id;
    const initial = (m.name||'?').charAt(0).toUpperCase();
    const color = _userColor(m.user_id);
    const removeBtn = (isHost && !isMe)
      ? '<button class="mem-rm" onclick="_removeMember(\''+esc(agId)+'\',\''+esc(m.user_id)+'\')" title="削除">×</button>'
      : '';
    // Role label + (host-only) dropdown to change non-host members
    const curRole = m.role || 'contributor';
    const roleLabel = curRole === 'host' ? 'ホスト'
      : curRole === 'admin' ? '管理者'
      : curRole === 'reader' ? '閲覧専用'
      : 'メンバー';
    const roleColor = curRole === 'host' ? 'var(--peach-dark)'
      : curRole === 'admin' ? '#7c3aed'
      : curRole === 'reader' ? 'var(--text3)'
      : 'var(--text2)';
    const roleControl = (isHost && !isMe && curRole !== 'host')
      ? '<select onchange="_changeMemberRole(\''+esc(agId)+'\',\''+esc(m.user_id)+'\',this.value)" style="background:#fff;border:1px solid var(--wire2);border-radius:6px;padding:3px 6px;font-size:11px;font-weight:700;color:'+roleColor+';font-family:inherit;margin-right:6px;cursor:pointer">'
        +   '<option value="admin"'+(curRole==='admin'?' selected':'')+'>管理者</option>'
        +   '<option value="contributor"'+(curRole==='contributor'||curRole==='member'?' selected':'')+'>メンバー</option>'
        +   '<option value="reader"'+(curRole==='reader'?' selected':'')+'>閲覧専用</option>'
        + '</select>'
      : '<span class="ag-pill" style="color:'+roleColor+';margin-right:6px">'+esc(roleLabel)+'</span>';
    return '<div class="mem-row">'
      + '<div class="mem-av" style="background:'+color+'">'+esc(initial)+'</div>'
      + '<div class="mem-meta"><div class="mem-name">'+esc(m.name||'')+(isMe?'<span class="ag-pill invitee">あなた</span>':'')+'</div>'
      + '<div class="mem-sub">'+(m.joined_at?new Date(m.joined_at).toLocaleDateString('ja-JP'):'')+(curRole==='host'?' に作成':' に参加')+'</div></div>'
      + roleControl + removeBtn + '</div>';
  }).join('');
  // Action footer differs for host vs member
  document.getElementById('grpMemberFoot').innerHTML = isHost
    ? '<button class="btn-volt" onclick="closeMemberPanel();openInviteModal(\''+esc(agId)+'\')" style="flex:1">＋ メンバーを招待</button>'
    : '<button class="btn-back" onclick="_leaveGroup(\''+esc(agId)+'\')" style="flex:1;color:#dc2626;border-color:rgba(239,68,68,.3)">グループを退出</button>';
  overlay.classList.add('open');
}

async function _approveJoin(agId, uid){
  try {
    await api('POST', '/api/agents/'+agId+'/approve', {user_id: uid});
    showToast(isJa?'承認しました':'Approved','ok');
    closeMemberPanel();
    openMemberPanel(agId);
  } catch(e){ showToast(e.message, 'ng'); }
}
async function _denyJoin(agId, uid){
  if(!confirm(isJa?'このリクエストを却下しますか？':'Deny this request?')) return;
  try {
    await api('POST', '/api/agents/'+agId+'/deny', {user_id: uid});
    showToast(isJa?'却下しました':'Denied','ok');
    closeMemberPanel();
    openMemberPanel(agId);
  } catch(e){ showToast(e.message, 'ng'); }
}
function closeMemberPanel(){
  document.getElementById('grpMemberOverlay')?.classList.remove('open');
}
async function _removeMember(agId, uid){
  if(!confirm(isJa?'このメンバーを削除しますか？':'Remove this member?')) return;
  try {
    await api('DELETE', '/api/agents/'+agId+'/members/'+uid);
    showToast(isJa?'削除しました':'Removed', 'ok');
    closeMemberPanel();
    openMemberPanel(agId);
  } catch(e){ showToast(e.message, 'ng'); }
}
// First-time welcome banner shown when a user joins a group via invite. Pulls
// the host's `invite_welcome` message from /api/agents/:id/members and renders
// a dismissible card at the top of the chat. Dismissed state is per-agent in
// localStorage so the banner doesn't reappear on every visit.
async function _showJoinWelcomeBanner(agId){
  if(!agId) return;
  try {
    var seenKey = 'mya_welcome_seen_'+agId;
    if(localStorage.getItem(seenKey)) return;
    var m = await api('GET', '/api/agents/'+agId+'/members');
    var welcome = (m && m.invite_welcome || '').trim();
    if(!welcome) return;
    var msgs = document.getElementById('msgs');
    if(!msgs) return;
    var existing = document.getElementById('joinWelcomeCard');
    if(existing) existing.remove();
    var card = document.createElement('div');
    card.id = 'joinWelcomeCard';
    card.style.cssText = 'margin:14px auto;max-width:760px;background:linear-gradient(135deg,#fff7ee,#ffe4c4);border:1px solid #fed7aa;border-radius:14px;padding:16px 20px;font-size:13.5px;line-height:1.7;animation:fadeUp .35s ease;position:relative';
    card.innerHTML = '<div style="display:flex;align-items:flex-start;gap:11px">'
      + '<div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#fb923c,#ea580c);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px">👋</div>'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="font-size:11px;font-weight:800;color:#7c2d12;letter-spacing:.04em;margin-bottom:4px;text-transform:uppercase">ホストからのウェルカムメッセージ</div>'
      +   '<div style="color:var(--text);white-space:pre-wrap">'+esc(welcome)+'</div>'
      + '</div>'
      + '<button onclick="this.closest(\'#joinWelcomeCard\').remove();localStorage.setItem(\''+esc(seenKey)+'\',\'1\');" style="background:transparent;border:0;color:var(--text3);cursor:pointer;font-size:18px;line-height:1;padding:4px;flex-shrink:0">×</button>'
      + '</div>';
    var inner = document.getElementById('msgsInner');
    if(inner) inner.insertBefore(card, inner.firstChild);
    else msgs.insertBefore(card, msgs.firstChild);
  } catch(e){
    console.warn('[welcome banner]', e.message);
  }
}

// Host-only: promote / demote a member without removing them.
async function _changeMemberRole(agId, uid, newRole){
  try {
    await api('PATCH', '/api/agents/'+agId+'/members/'+uid+'/role', { role: newRole });
    var label = newRole === 'admin' ? '管理者' : newRole === 'reader' ? '閲覧専用' : 'メンバー';
    showToast('✓ 権限を「'+label+'」に変更しました', 'ok');
    closeMemberPanel();
    openMemberPanel(agId);
  } catch(e){
    showToast((e.message||'変更失敗'), 'ng');
    openMemberPanel(agId); // re-render to revert select
  }
}
async function _leaveGroup(agId){
  if(!confirm(isJa?'このグループを退出しますか？':'Leave this group?')) return;
  try {
    await api('POST', '/api/agents/'+agId+'/leave');
    showToast(isJa?'退出しました':'Left group', 'ok');
    closeMemberPanel();
    closeGroupSettings();
    // Refresh sidebar — drop from joined groups
    _joinedGroups = _joinedGroups.filter(g => g.id !== agId);
    agents = (agents||[]).filter(a => a.id !== agId);
    activeId = null;
    document.getElementById('chatWrap').style.display = 'none';
    document.getElementById('emptyWrap').style.display = '';
    renderAgList();
  } catch(e){ showToast(e.message, 'ng'); }
}

// ── Group settings modal ──────────────────────────────────
async function openGroupSettings(agId){
  const ag = agents.find(a => a.id === agId);
  if(!ag) return;
  // Single round-trip: fetch members + invite settings together
  let members = ag.members || [];
  let requireApproval = !!ag.invite_require_approval;
  let serverMyRole = null;
  try {
    const m = await api('GET', '/api/agents/' + agId + '/members');
    if(Array.isArray(m.members)) { members = m.members; ag.members = members; }
    if(typeof m.name === 'string') ag.name = m.name;
    if(m.host_id) ag.host_id = m.host_id;       // authoritative host_id from server
    if(m.my_role) serverMyRole = m.my_role;     // 'host' / 'admin' / 'contributor' / 'reader'
    requireApproval = !!m.invite_require_approval;
    ag.invite_require_approval = requireApproval;
  } catch(e){}
  // Host detection: trust the server's my_role, fall back to host_id match.
  // (The client `agents` copy of a group can be stale/partial — the /members
  //  response is authoritative, so the host always gets the rename controls.)
  const isHost = (serverMyRole === 'host') || (!!ag.host_id && ag.host_id === me?.id);
  const myMember = members.find(m => m.user_id === me?.id);
  const myPref = (myMember && myMember.notify_pref) || 'all';

  document.getElementById('grpSetName').value = ag.name || '';
  document.getElementById('grpSetName').disabled = !isHost;
  document.getElementById('grpSetRenameBtn').style.display = isHost ? '' : 'none';
  var _grpNameNote = document.getElementById('grpSetNameNote');
  if(_grpNameNote){
    _grpNameNote.style.display = isHost ? 'none' : '';
    if(!isHost) _grpNameNote.textContent = L('✏️ グループ名を変更できるのはホストのみです','✏️ Only the host can rename this group');
  }

  // Notification radios
  ['all','mentions','mute'].forEach(p => {
    const r = document.getElementById('grpSetNotif_' + p);
    if(r) r.checked = (p === myPref);
  });

  // Approval-required toggle (host only)
  const inviteSec = document.getElementById('grpSetInviteSection');
  if(isHost){
    inviteSec.style.display = '';
    document.getElementById('grpSetApproval_off').checked = !requireApproval;
    document.getElementById('grpSetApproval_on').checked = requireApproval;
  } else {
    inviteSec.style.display = 'none';
  }

  // AI auto-respond mode + Edit-agent button (host only)
  const aiSec = document.getElementById('grpSetAiSection');
  const editAgentSec = document.getElementById('grpSetEditAgentSection');
  if(isHost){
    aiSec.style.display = '';
    editAgentSec.style.display = '';
    var mode = (typeof ag.ai_auto_respond === 'boolean')
      ? (ag.ai_auto_respond ? 'always' : 'mention')
      : 'auto';
    var r1 = document.getElementById('grpSetAi_auto');
    var r2 = document.getElementById('grpSetAi_always');
    var r3 = document.getElementById('grpSetAi_mention');
    if(r1) r1.checked = (mode === 'auto');
    if(r2) r2.checked = (mode === 'always');
    if(r3) r3.checked = (mode === 'mention');
  } else {
    aiSec.style.display = 'none';
    editAgentSec.style.display = 'none';
  }

  // Send-money section (members only, hide for host)
  const contribSec = document.getElementById('grpSetContributeSection');
  if(!isHost){
    contribSec.style.display = '';
    document.getElementById('grpSetContribAmount').value = '';
    document.querySelectorAll('.grpset-amount').forEach(b => b.classList.remove('selected'));
    const info = document.getElementById('grpSetContribInfo');
    if(info) info.textContent = (isJa?'あなたの残高: ':'Your balance: ') + '¥' + (Math.floor(me.balance_jpy||0)).toLocaleString();
  } else {
    contribSec.style.display = 'none';
  }

  // Transfer ownership section: host only, only if there are other members
  const transferSec = document.getElementById('grpSetTransferSection');
  if(isHost && members.length > 1){
    transferSec.style.display = '';
    const sel = document.getElementById('grpSetTransferTo');
    sel.innerHTML = '<option value="">移譲先を選択 …</option>'
      + members.filter(m => m.user_id !== me?.id)
        .map(m => '<option value="'+esc(m.user_id)+'">'+esc(m.name||'メンバー')+'</option>').join('');
  } else {
    transferSec.style.display = 'none';
  }

  // Footer button: 退出 (member) / 削除 (host — always available, stronger warning when members exist)
  const dangerBtn = document.getElementById('grpSetDangerBtn');
  if(!isHost){
    dangerBtn.style.display = '';
    dangerBtn.textContent = isJa ? 'グループを退出' : 'Leave group';
    dangerBtn.onclick = () => _leaveGroup(agId);
  } else {
    dangerBtn.style.display = '';
    const otherCount = Math.max(0, members.length - 1);
    dangerBtn.textContent = isJa
      ? (otherCount > 0 ? 'グループを削除 ('+otherCount+'名のメンバー)' : 'グループを削除')
      : 'Delete group' + (otherCount > 0 ? ' ('+otherCount+' members)' : '');
    dangerBtn.onclick = async () => {
      const warn = otherCount > 0
        ? (isJa
            ? ('このグループには他に '+otherCount+' 名のメンバーがいます。\n\n削除すると:\n・全員のチャット履歴が消えます\n・メンバーはトーク一覧から消えます\n・復元できません\n\n本当に削除しますか？')
            : ('This group has '+otherCount+' other members. Delete?\nAll history is permanently lost. This cannot be undone.'))
        : (isJa ? 'このグループを削除しますか？復元できません。' : 'Delete this group? Cannot be undone.');
      if(!confirm(warn)) return;
      try {
        await api('DELETE', '/api/agents/'+agId);
        showToast(isJa?'削除しました':'Deleted', 'ok');
        agents = (agents||[]).filter(a => a.id !== agId);
        activeId = null;
        document.getElementById('chatWrap').style.display = 'none';
        document.getElementById('emptyWrap').style.display = '';
        renderAgList();
        closeGroupSettings();
      } catch(e){ showToast(e.message, 'ng'); }
    };
  }

  document.getElementById('grpSetActiveId').value = agId;
  document.getElementById('grpSetOverlay')?.classList.add('open');
}
function closeGroupSettings(){
  document.getElementById('grpSetOverlay')?.classList.remove('open');
}

async function _grpSettingsRename(){
  const agId = document.getElementById('grpSetActiveId').value;
  const newName = (document.getElementById('grpSetName').value || '').trim();
  if(!newName){ showToast(L('名前を入力してください','Please enter a name'), 'ng'); return; }
  try {
    await api('PATCH', '/api/agents/'+agId, {name: newName});
    const ag = agents.find(a => a.id === agId);
    if(ag) ag.name = newName;
    showToast(isJa?'グループ名を変更しました':'Renamed', 'ok');
    renderAgList();
    if(activeId === agId) openAgent(agId); // refresh chat header
  } catch(e){ showToast(e.message, 'ng'); }
}

async function _grpSettingsNotifyPref(pref){
  const agId = document.getElementById('grpSetActiveId').value;
  try {
    await api('POST', '/api/agents/'+agId+'/notify-pref', {pref});
    const labels = {all:'すべての発言を通知', mentions:'メンションのみ通知', mute:'通知なし (ミュート)'};
    showToast((labels[pref]||pref) + ' に変更', 'ok');
  } catch(e){ showToast(e.message, 'ng'); }
}

async function _grpSettingsAiRespond(mode){
  const agId = document.getElementById('grpSetActiveId').value;
  // mode: 'auto' (size heuristic) | 'always' | 'mention'
  var payload;
  if(mode === 'auto')        payload = { ai_auto_respond: null };
  else if(mode === 'always') payload = { ai_auto_respond: true };
  else                       payload = { ai_auto_respond: false };
  try {
    await api('PATCH', '/api/agents/'+agId, payload);
    const ag = agents.find(a => a.id === agId);
    if(ag){
      if(mode === 'auto') delete ag.ai_auto_respond;
      else ag.ai_auto_respond = (mode === 'always');
    }
    const labels = {auto: L('自動','Auto'), always: L('毎回応答','Always'), mention: L('@AI のみ','@AI only')};
    showToast(L('AI 応答モード: ','AI response mode: ') + (labels[mode]||mode), 'ok');
  } catch(e){ showToast(e.message, 'ng'); }
}

function _grpSettingsEditAgent(){
  const agId = document.getElementById('grpSetActiveId').value;
  closeGroupSettings();
  openEditAgent(agId);
}

function _grpSettingsPickAmount(amt){
  document.querySelectorAll('.grpset-amount').forEach(b => {
    b.classList.toggle('selected', parseInt(b.dataset.amt, 10) === amt);
  });
  document.getElementById('grpSetContribAmount').value = amt;
}

async function _grpSettingsContribute(){
  const agId = document.getElementById('grpSetActiveId').value;
  const amount = parseInt(document.getElementById('grpSetContribAmount').value, 10);
  if(!amount || amount < 100){
    showToast(isJa?'最低 100 円から送金できます':'Min ¥100','ng');
    return;
  }
  if((me.balance_jpy||0) < amount){
    showToast(isJa?'残高が不足しています':'Insufficient balance','ng');
    return;
  }
  if(!confirm(isJa
    ? ('¥'+amount.toLocaleString()+' をグループに送金しますか？\nあなたの残高から差し引かれ、ホストの残高に加算されます。')
    : ('Send ¥'+amount.toLocaleString()+' to the group? Deducted from your balance, added to host balance.')
  )) return;
  try {
    const r = await api('POST', '/api/agents/'+agId+'/contribute', {amount_jpy: amount});
    showToast(isJa?('¥'+amount.toLocaleString()+' を送金しました'):('Sent ¥'+amount.toLocaleString()), 'ok');
    me.balance_jpy = r.new_balance_jpy;
    updateBalance();
    closeGroupSettings();
    // Refresh active chat to pull in the system "送金しました" entry
    if(activeId === agId) openAgent(agId);
  } catch(e){ showToast(e.message, 'ng'); }
}

async function _grpSettingsToggleApproval(required){
  const agId = document.getElementById('grpSetActiveId').value;
  // Re-issue the invite token with the new flag (this rotates the token but
  // that's fine — the host can re-share if needed).
  try {
    await api('POST', '/api/agents/'+agId+'/invite', {require_approval: !!required});
    showToast(required ? (isJa?'承認制に変更しました':'Approval required') : (isJa?'リンクで誰でも参加可能に変更':'Open access'), 'ok');
  } catch(e){ showToast(e.message, 'ng'); }
}

async function _grpSettingsTransfer(){
  const agId = document.getElementById('grpSetActiveId').value;
  const newHostId = document.getElementById('grpSetTransferTo').value;
  if(!newHostId){ showToast(L('移譲先を選択してください','Please pick a transfer recipient'), 'ng'); return; }
  if(!confirm(isJa?'本当に所有権を移譲しますか？AI 利用料は新しいホストの残高から消費されるようになります。':'Transfer ownership? AI cost will charge the new host going forward.')) return;
  try {
    await api('POST', '/api/agents/'+agId+'/transfer', {new_host_id: newHostId});
    showToast(isJa?'所有権を移譲しました':'Ownership transferred', 'ok');
    // Reload everything (this user is now a member, not a host)
    closeGroupSettings();
    const ra = await api('GET','/api/agents');
    agents = ra.agents || [];
    await fetchJoinedGroups();
    renderAgList();
    if(activeId === agId) openAgent(agId);
  } catch(e){ showToast(e.message, 'ng'); }
}

// ── Chat export (MD / JSON download) ───────────────────────
// Same as exportChat but reads from window._editAgentId — used by the
// "Markdown / JSON でエクスポート" buttons inside the edit-agent panel.
function exportChatForEditAgent(format){
  const id = window._editAgentId;
  if(!id) return;
  const ag = agents.find(a => a.id === id);
  if(!ag){ showToast(L('エージェントが見つかりません','Agent not found'),'ng'); return; }
  _exportAgent(ag, format);
}
function exportChat(format){
  const ag = agents.find(a => a.id === activeId);
  if(!ag) return;
  _exportAgent(ag, format);
}
function _exportAgent(ag, format){
  const fname = (ag.name||'chat').replace(/[^\w぀-ヿ一-鿿_-]/g,'_');
  if(format === 'json'){
    const blob = new Blob([JSON.stringify({
      agent: { id:ag.id, name:ag.name, avatar:ag.avatar, persona:ag.persona, skills:ag.skills, is_group:!!ag.is_group },
      members: ag.members || [],
      history: ag.history || [],
      exported_at: new Date().toISOString(),
    }, null, 2)], {type:'application/json'});
    _downloadBlobOf(blob, fname+'_'+_dateSlug()+'.json');
  } else {
    // Markdown
    const lines = [];
    lines.push('# ' + (ag.name||'AI Agent'));
    if(ag.is_group) lines.push('_グループチャット · '+(ag.members||[]).length+' 名_');
    if(ag.persona) lines.push('\n> '+ag.persona.replace(/\n/g,'\n> '));
    lines.push('\n---\n');
    (ag.history||[]).forEach(m => {
      if(m.role === 'system'){
        lines.push('_'+(m.content||'')+'_  ');
        return;
      }
      const who = m.role === 'user'
        ? (m.user_name || 'あなた')
        : (ag.name || 'AI');
      const time = m.time ? ' · ' + m.time : '';
      const body = (typeof m.content === 'string')
        ? m.content
        : (Array.isArray(m.content)
            ? (m.content.find(b => b.type==='text')?.text || '')
            : '');
      lines.push('### '+who+time);
      lines.push(body+'\n');
    });
    const blob = new Blob([lines.join('\n')], {type:'text/markdown;charset=utf-8'});
    _downloadBlobOf(blob, fname+'_'+_dateSlug()+'.md');
  }
  showToast(isJa?'エクスポートしました':'Exported','ok');
}
// NB: this takes an already-built Blob. The OTHER _downloadBlob defined later
// (around L20605) takes (filename, content, mime) and builds the Blob itself.
// They had the same name historically — the later one was winning in JS hoist
// order, silently breaking the Blob-form callers. Renamed to make both
// callable. Audit catches re-introductions of name collisions.
function _downloadBlobOf(blob, fname){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fname;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}
function _dateSlug(){
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

// ── Pin messages (host/member can mark important messages) ───
async function togglePin(btn){
  const msg = btn.closest('.m');
  if(!msg || !activeId) return;
  const idx = parseInt(msg.dataset.idx, 10);
  if(!Number.isInteger(idx)) return;
  const ag = agents.find(a => a.id === activeId);
  if(!ag) return;
  const m = (ag.history||[])[idx];
  if(!m) return;
  m.pinned = !m.pinned;
  btn.textContent = m.pinned ? '📌' : '📍';
  btn.classList.toggle('pin-on', !!m.pinned);
  ag.pinned_idxs = Array.isArray(ag.pinned_idxs) ? ag.pinned_idxs : [];
  if(m.pinned){ if(!ag.pinned_idxs.includes(idx)) ag.pinned_idxs.push(idx); }
  else ag.pinned_idxs = ag.pinned_idxs.filter(i => i !== idx);
  try {
    await api('POST', '/api/agents/'+activeId+'/pin', {idx, on: !!m.pinned});
    showToast(m.pinned ? 'ピン留めしました' : 'ピン留めを解除', 'ok');
    _renderPinnedBanner(ag);
  } catch(e){
    m.pinned = !m.pinned;
    btn.textContent = m.pinned ? '📌' : '📍';
    btn.classList.toggle('pin-on', !!m.pinned);
    showToast(e.message, 'ng');
  }
}
function _renderPinnedBanner(ag){
  const wrap = document.getElementById('pinnedWrap');
  if(!wrap) return;
  const idxs = (ag.history||[])
    .map((m,i) => m && m.pinned ? i : -1)
    .filter(i => i >= 0);
  if(!idxs.length){ wrap.style.display = 'none'; wrap.innerHTML = ''; return; }
  wrap.style.display = 'block';
  wrap.innerHTML = idxs.slice(-3).map(i => {
    const m = ag.history[i];
    const text = (typeof m.content === 'string') ? m.content : '';
    const truncated = text.length > 80 ? text.slice(0, 80) + '…' : text;
    const who = m.role === 'user' ? (m.user_name || 'あなた') : (ag.name || 'AI');
    return '<button class="pinned-item" data-idx="'+i+'" onclick="_jumpToMsg('+i+')">'
      + '<span class="pin-ic">📌</span>'
      + '<span class="pin-who">'+esc(who)+'</span>'
      + '<span class="pin-txt">'+esc(truncated)+'</span></button>';
  }).join('');
}
function _jumpToMsg(idx){
  const el = document.querySelector('.m[data-idx="'+idx+'"]');
  if(el){
    el.scrollIntoView({behavior:'smooth', block:'center'});
    el.style.transition='background .8s';
    const orig = el.style.background;
    el.style.background = 'rgba(251,146,60,.18)';
    setTimeout(() => { el.style.background = orig; }, 1200);
  }
}

// ── Bookmarks (star important AI replies) ────────────────────
async function toggleBookmark(btn){
  const msg = btn.closest('.m');
  if(!msg) return;
  const idx = parseInt(msg.dataset.idx, 10);
  if(!Number.isInteger(idx) || !activeId) return;
  const ag = agents.find(a => a.id === activeId);
  if(!ag) return;
  const m = (ag.history||[])[idx];
  if(!m) return;
  m.bookmarked = !m.bookmarked;
  btn.textContent = m.bookmarked ? '★' : '☆';
  btn.classList.toggle('bm-on', !!m.bookmarked);
  // Persist via PATCH /api/agents/:id (just save the agent so history.bookmark is included)
  try {
    await api('POST', '/api/agents/'+activeId+'/bookmark', {idx, on: !!m.bookmarked});
    showToast(m.bookmarked ? (isJa?'ブックマークしました':'Bookmarked') : (isJa?'外しました':'Unbookmarked'), 'ok');
  } catch(e){
    m.bookmarked = !m.bookmarked; // rollback
    btn.textContent = m.bookmarked ? '★' : '☆';
    btn.classList.toggle('bm-on', !!m.bookmarked);
    showToast(e.message, 'ng');
  }
}
function openBookmarks(){
  // Gather all bookmarked messages across all agents
  const items = [];
  (agents||[]).forEach(a => {
    (a.history||[]).forEach((m, i) => {
      if(m && m.bookmarked){
        items.push({agent: a, idx: i, msg: m});
      }
    });
  });
  const ov = document.getElementById('bookmarksOverlay');
  const list = document.getElementById('bookmarksList');
  if(!ov || !list) return;
  if(!items.length){
    list.innerHTML = '<div class="search-empty">★ をクリックしてブックマークを追加できます</div>';
  } else {
    list.innerHTML = items.map(it => {
      const text = (typeof it.msg.content === 'string')
        ? it.msg.content
        : (Array.isArray(it.msg.content)
            ? (it.msg.content.find(b => b.type==='text')?.text || '')
            : '');
      const av = (it.agent.avatar||'🤖').toString();
      const avHTML = av.startsWith('data:image/') ? '🤖' : av;
      return '<button class="search-result" onclick="closeBookmarks();_pickSearch(0);openAgent(\''+esc(it.agent.id)+'\');setTimeout(()=>{const e=document.querySelector(\\\'.m[data-idx=\\\\\"'+it.idx+'\\\\\"]\\\');if(e)e.scrollIntoView({block:\\\'center\\\'});},300)">'
        + '<div class="sr-h"><span class="sr-icon">'+esc(avHTML)+'</span><span class="sr-agent">'+esc(it.agent.name)+'</span><span class="sr-when">'+esc(it.msg.time||'')+'</span></div>'
        + '<div class="sr-body">'+esc(text.slice(0,200))+'</div></button>';
    }).join('');
  }
  ov.classList.add('open');
}
function closeBookmarks(){ document.getElementById('bookmarksOverlay')?.classList.remove('open'); }

function copyMsgText(btn){
  var msg=btn.closest('.m');
  if(!msg) return;
  var bod=msg.querySelector('.m-body');
  var text = bod ? bod.innerText : '';
  if(navigator.clipboard) navigator.clipboard.writeText(text);
  showToast(isJa?'コピーしました':'Copied','ok');
}

function _updateChromeTool(ag){
  var btn=document.getElementById('chromeTool');
  if(!btn) return;
  if(!ag||!ag.chrome_enabled){
    btn.style.display='none';
  } else {
    btn.style.display='inline-flex';
    btn.classList.remove('warn');
    btn.classList.add('active');
    btn.title=isJa?'Google Chrome 連携 ON':'Google Chrome integration ON';
  }
  // Huddle button: only on team chats with 2+ members.
  var huddle = document.getElementById('huddleTool');
  if(huddle){
    var isTeam = !!(ag && ag.is_team && Array.isArray(ag.team_member_agent_ids) && ag.team_member_agent_ids.length >= 2);
    huddle.style.display = isTeam ? 'inline-flex' : 'none';
    // Restore visual state for this agent (per-agent toggle persists in
    // window._huddleOn map so switching chats doesn't carry it across).
    var on = !!(window._huddleOn && ag && window._huddleOn[ag.id]);
    huddle.classList.toggle('active', on);
    huddle.title = on ? L('Huddle ON · 全員が順に発言します','Huddle ON · all members speak in turn') : L('Huddle: チーム全員で議論','Huddle: team-wide discussion');
  }
  // Sticker button: shown on DM agents (not on joined groups / teams).
  var stk = document.getElementById('stickerTool');
  if(stk){
    var canStick = !!(ag && !ag._is_joined_group && !ag.is_group);
    stk.style.display = canStick ? 'inline-flex' : 'none';
  }
}
function _toggleHuddle(){
  if(!activeId) return;
  window._huddleOn = window._huddleOn || {};
  window._huddleOn[activeId] = !window._huddleOn[activeId];
  var ag = (agents||[]).find(function(a){return a.id===activeId;});
  if(ag) _updateChromeTool(ag);
  showToast(window._huddleOn[activeId] ? L('🤝 Huddle ON · 送信すると全員で議論','🤝 Huddle ON · send to start the discussion') : L('🤝 Huddle OFF','🤝 Huddle OFF'), 'ok');
}

// ── 😀 Agent stickers ────────────────────────────────────────
// Each agent has up to 6 emoji stickers (server-generated on first use).
// Click → palette pops above the composer → click an emoji to insert it
// into the composer.  Personality-as-quick-reactions.
async function _toggleStickerPicker(ev){
  if(ev) ev.stopPropagation();
  var existing = document.getElementById('stickerPicker');
  if(existing){ existing.remove(); return; }
  if(!activeId) return;
  var ag = (agents||[]).find(function(a){return a.id===activeId;});
  if(!ag) return;
  // If no stickers yet, generate now (one-shot, ~1s). Show a tiny pending toast.
  if(!Array.isArray(ag.stickers) || ag.stickers.length === 0){
    showToast(L('スタンプを生成中…','Generating stickers…'),'ok');
    try {
      var r = await api('POST','/api/agents/'+ag.id+'/stickers/generate',{});
      if(r && Array.isArray(r.stickers)) ag.stickers = r.stickers;
    } catch(e){ showToast((e&&e.message)||'failed','ng'); return; }
  }
  var stickers = (ag.stickers||[]).slice(0, 8);
  if(stickers.length === 0){ showToast(L('スタンプなし','No stickers'),'ng'); return; }
  var picker = document.createElement('div');
  picker.id = 'stickerPicker';
  picker.style.cssText = 'position:fixed;background:#fff;border:1px solid var(--wire2);border-radius:13px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:8px;z-index:9990;font-family:inherit;display:flex;gap:4px;flex-wrap:wrap;max-width:280px';
  picker.innerHTML = stickers.map(function(s){
    return '<button onclick="event.stopPropagation();_insertSticker(\''+esc(s).replace(/\\/g,'\\\\').replace(/\'/g,"\\'")+'\')" style="background:transparent;border:0;border-radius:8px;padding:6px 8px;font-size:24px;cursor:pointer;line-height:1;transition:transform .1s" onmouseover="this.style.transform=\'scale(1.25)\'" onmouseout="this.style.transform=\'scale(1)\'">'+s+'</button>';
  }).join('') + '<button onclick="event.stopPropagation();_regenStickers(\''+esc(ag.id)+'\')" style="background:var(--cream2);border:0;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;color:var(--text2);font-family:inherit">'+L('🔄 再生成','🔄 Reroll')+'</button>';
  document.body.appendChild(picker);
  var btn = document.getElementById('stickerTool');
  if(btn){
    var r = btn.getBoundingClientRect();
    picker.style.bottom = (window.innerHeight - r.top + 6) + 'px';
    picker.style.left   = Math.max(8, Math.min(window.innerWidth - 290, r.left)) + 'px';
  }
  setTimeout(function(){
    var off = function(e){
      if(!picker.contains(e.target)){ picker.remove(); document.removeEventListener('click', off, true); }
    };
    document.addEventListener('click', off, true);
  }, 0);
}
function _insertSticker(s){
  var ta = document.getElementById('ci'); if(!ta) return;
  var cursor = ta.selectionStart || ta.value.length;
  ta.value = ta.value.slice(0, cursor) + s + ' ' + ta.value.slice(cursor);
  ta.focus();
  var p = document.getElementById('stickerPicker'); if(p) p.remove();
  if(typeof exTA === 'function') exTA(ta);
}
async function _regenStickers(agId){
  var ag = (agents||[]).find(function(a){return a.id===agId;});
  if(!ag) return;
  showToast(L('再生成中…','Regenerating…'),'ok');
  try {
    var r = await api('POST','/api/agents/'+agId+'/stickers/generate',{});
    if(r && Array.isArray(r.stickers)){
      ag.stickers = r.stickers;
      var p = document.getElementById('stickerPicker'); if(p){ p.remove(); _toggleStickerPicker(); }
    }
  } catch(e){ showToast((e&&e.message)||'failed','ng'); }
}

/* ── Extension hint banner — shown above composer when the user types a
 * "post / send / tweet" intent and the active agent doesn't have Browser
 * Extension paired AND enabled. The agent's reply will explain too, but
 * surfacing it inline lets the user fix it before sending. ───────── */
var _EXT_INTENT_RE = /(?:^|[\s　])(?:x\s*(?:に|で)?\s*(?:投稿|ポスト|ツイ(?:ート)?|つぶや)|tweet|post(?:\s+to|\s+on)?\s+(?:x|twitter|tweet)|twitterに?投稿|スラック?で?(?:送|投稿)|slack(?:\s+に|\s+で)?\s*(?:送|post|message)|gmailで?(?:送|返信|メール)|emailで?(?:送|返信)|拡張機能|browser\s+extension)/i;
function _extHintCheck(text){
  var bn = document.getElementById('extHintBanner');
  if(!bn) return;
  if(!text || text.length < 3){ bn.style.display='none'; return; }
  var ag = (agents||[]).find(function(a){return a.id===activeId;});
  if(!ag){ bn.style.display='none'; return; }
  // Already paired AND enabled on this agent → no hint
  if(me && me.extension_paired && ag.extension_enabled){ bn.style.display='none'; return; }
  // Only show when intent looks like posting/sending
  if(!_EXT_INTENT_RE.test(text)){ bn.style.display='none'; return; }
  // Choose state: not paired vs paired-but-not-enabled
  var t = document.getElementById('extHintTitle');
  var b = document.getElementById('extHintBody');
  var btn = document.getElementById('extHintBtn');
  if(!me || !me.extension_paired){
    t.textContent = L('投稿には拡張機能のペアリングが必要', 'Posting needs Browser Extension');
    b.textContent = L('X / Slack / Gmail にログイン済みのブラウザを操作するため、拡張機能をペアリングしてください。',
                       'Pair the Browser Extension to let this AI post / send via your logged-in browser (X, Slack, Gmail, …).');
    btn.textContent = L('ペアリング →','Pair →');
  } else {
    t.textContent = L('このエージェントで拡張機能が OFF', 'Extension is OFF for this agent');
    b.textContent = L('このエージェントの編集画面で「🌐 ブラウザ拡張連携」を ON にしてください。',
                       'Edit this agent and turn ON "🌐 Browser Extension".');
    btn.textContent = L('編集 →','Edit →');
  }
  bn.style.display = 'flex';
}
function _extHintAction(){
  var bn = document.getElementById('extHintBanner');
  if(bn) bn.style.display = 'none';
  if(!me || !me.extension_paired){
    // Open extension setup page
    window.open('/setup-extension.html','_blank');
    return;
  }
  // Paired but not enabled on this agent → open agent edit
  if(activeId){
    try { openEditAgent(activeId); } catch(e){}
  }
}

/* ── Edit + regenerate user message ──────────────────── */
function editMsgStart(btn){
  var row=btn.closest('.m'); if(!row) return;
  var idx=parseInt(row.dataset.idx||'-1',10); if(idx<0) return;
  var ag=agents.find(function(a){return a.id===activeId;}); if(!ag) return;
  var msg=ag.history[idx]; if(!msg || msg.role!=='user') return;
  // Find the body element to swap into edit mode.
  var bodyEl=row.querySelector('.m-body'); if(!bodyEl) return;
  if(row.classList.contains('editing')) return;
  row.classList.add('editing');
  // Save original HTML so cancel restores cleanly.
  bodyEl.dataset.origHtml = bodyEl.innerHTML;
  var current = msg.content || '';
  bodyEl.innerHTML =
    '<textarea class="m-edit-ta" rows="3" style="width:100%;min-height:64px;max-height:240px;padding:9px 11px;border:1px solid var(--peach);border-radius:10px;font-family:inherit;font-size:14.5px;line-height:1.5;background:var(--card,#fff);color:var(--text);resize:vertical">'+esc(current)+'</textarea>'+
    '<div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end">'+
      '<button class="m-act" onclick="editMsgCancel(this)" style="background:none">'+(isJa?'キャンセル':'Cancel')+'</button>'+
      '<button class="m-act primary" onclick="editMsgSave(this)" style="background:var(--peach);color:#fff;border:0">'+(isJa?'保存して再送信':'Save & resend')+'</button>'+
    '</div>';
  var ta=bodyEl.querySelector('textarea'); if(ta){ ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
}
function editMsgCancel(btn){
  var row=btn.closest('.m'); if(!row) return;
  var bodyEl=row.querySelector('.m-body'); if(!bodyEl) return;
  if(bodyEl.dataset.origHtml !== undefined){
    bodyEl.innerHTML = bodyEl.dataset.origHtml;
    delete bodyEl.dataset.origHtml;
  }
  row.classList.remove('editing');
}
async function editMsgSave(btn){
  var row=btn.closest('.m'); if(!row) return;
  var idx=parseInt(row.dataset.idx||'-1',10); if(idx<0) return;
  var ag=agents.find(function(a){return a.id===activeId;}); if(!ag) return;
  var ta=row.querySelector('textarea.m-edit-ta'); if(!ta) return;
  var newText=(ta.value||'').trim();
  if(!newText){ showToast(isJa?'空のメッセージにはできません':'Cannot be empty','ng'); return; }
  btn.disabled=true; btn.textContent=isJa?'送信中…':'Sending…';
  // Optimistic local update: truncate history past idx, replace content, drop assistant after.
  ag.history = ag.history.slice(0, idx+1);
  ag.history[idx] = { ...ag.history[idx], content: newText, edited: true, edited_at: new Date().toISOString() };
  renderMsgs(ag, true);  // user-initiated → force scroll
  // Append thinking indicator (mirror regenerateMsg).
  var inner=document.getElementById('msgsInner');
  if(inner){
    var tEl=document.createElement('div');
    tEl.className='m a'; tEl.id='thinking';
    var _genLabel = ag.chrome_enabled ? (isJa?'ブラウジング中…':'Browsing…') : (isJa?'考えています…':'Thinking…');
    tEl.innerHTML='<div class="m-meta"><div class="m-av">'+_avHTML(ag.avatar)+'</div><span class="m-name">'+esc(ag.name)+'</span></div><div class="m-body"><div class="gen-indicator"><div class="gen-logo"></div><div class="gen-text">'+_genLabel+'</div></div></div>';
    inner.appendChild(tEl);
    _scrollMsgsToEnd(true);
  }
  try{
    var r=await api('POST','/api/chat/'+activeId,{ edit_index: idx, message: newText });
    ag.history.push({role:'assistant',content:r.reply,time:now(),tool_log:r.tool_log||null});
    if(r.balance_jpy!==undefined) me.balance_jpy=r.balance_jpy;
  }catch(e){
    ag.history.push({role:'assistant',content:'エラー: '+e.message,time:now(),is_error:true});
  }
  var t=document.getElementById('thinking'); if(t) t.remove();
  renderMsgs(ag);  // sticky-bottom — if user scrolled up reading reply mid-stream, respect that
  _refreshArtifactsIfNeeded(r && r.tool_log, ag);
}

/* ── Retry (recover from error / timeout / 5xx) ─────── */
async function retryMsg(btn){
  if(!activeId) return;
  var ag = agents.find(function(a){return a.id===activeId;}); if(!ag) return;
  var row = btn.closest('.m');
  var idx = row ? parseInt(row.dataset.idx||'-1', 10) : -1;
  // Find the most recent user message before this error bubble — that's what
  // failed and needs re-sending.
  var hist = ag.history || [];
  var startIdx = (idx >= 0) ? idx : hist.length;
  var userIdx = -1;
  for(var i = startIdx - 1; i >= 0; i--){
    if(hist[i] && hist[i].role === 'user'){ userIdx = i; break; }
  }
  if(userIdx < 0){ showToast(isJa?'再送する元メッセージが見つかりません':'No user message to retry','ng'); return; }
  var lastUser = hist[userIdx];
  var text = String(lastUser.content||'').trim();
  if(!text){ showToast(isJa?'空のメッセージは再送できません':'Empty user message','ng'); return; }
  // Remove the error bubble + any partially streamed bubbles after the user msg.
  if(idx >= 0){ hist.splice(idx, 1); }
  // Pre-fill composer and trigger send. This re-runs the chat through the
  // normal sendMsg path so silent-retry + model-fallback chains all apply.
  var ci = document.getElementById('ci');
  if(ci){ ci.value = text; }
  sendMsg();
}

/* ── Continue (recover from max_tokens) ─────────────── */
async function continueMsg(btn){
  if(!activeId) return;
  var ag = agents.find(function(a){return a.id===activeId;}); if(!ag) return;
  // Inject "続きを書いて" as a new user turn — Anthropic naturally picks up
  // where it left off when the prior assistant ended at max_tokens.
  var ci = document.getElementById('ci');
  if(ci){ ci.value = isJa ? '続きを書いて' : 'Please continue.'; }
  // Mark this message no longer truncated so the button disappears.
  var row = btn.closest('.m');
  var idx = row ? parseInt(row.dataset.idx||'-1',10) : -1;
  if(idx >= 0 && ag.history[idx]){ ag.history[idx].truncated = false; }
  sendMsg();
}

/* ── "Remember this" — save assistant reply to long-term memory ───── */
async function rememberMsg(btn){
  var row = btn.closest('.m'); if(!row) return;
  var bodyEl = row.querySelector('.m-body'); if(!bodyEl) return;
  // Pull the user-visible text (strip <pre>/<img> etc).
  var text = (bodyEl.innerText || '').trim().slice(0, 600);
  if(!text){ showToast(isJa?'保存する内容がありません':'Nothing to remember','ng'); return; }
  try {
    await api('POST','/api/me/memories',{ text });
    showToast(isJa?'✓ 記憶に保存しました':'✓ Saved to memory','ok');
  } catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}

/* ── Delete a single message (Slack / LINE-style) ───── */
async function deleteMsg(btn){
  if(!activeId) return;
  var row = btn.closest('.m'); if(!row) return;
  var idx = parseInt(row.dataset.idx, 10);
  if(!Number.isInteger(idx) || idx < 0) return;
  if(!confirm(isJa ? 'このメッセージを削除しますか?\n（履歴から完全に消えます）' : 'Delete this message?\n(Removed from history permanently)')) return;
  try {
    await api('DELETE', '/api/agents/'+activeId+'/messages/'+idx);
    var ag = (agents||[]).find(function(a){return a.id===activeId;});
    if(ag && Array.isArray(ag.history)){
      ag.history.splice(idx, 1);
      renderMsgs(ag);
    }
    showToast(isJa ? '削除しました' : 'Deleted', 'ok');
  } catch(e){
    showToast((e && e.message) || (isJa?'削除に失敗':'Delete failed'), 'ng');
  }
}

/* ── Retry a failed THREAD reply ─────────────────────────
   Finds the most recent USER message in the same thread (by thread_parent_id),
   removes the error bubble, refills the thread composer with that text, and
   triggers _sendThreadReply. Used by the 🔄 再試行 button on thread-level
   error bubbles (the main-chat retry path is the existing retryMsg). */
function _retryThreadMsg(btn){
  if(!activeId) return;
  var ag = agents.find(function(a){return a.id===activeId;}); if(!ag) return;
  var row = btn.closest('.m');
  var idx = row ? parseInt(row.dataset.idx||'-1', 10) : -1;
  if(idx < 0) return;
  var hist = ag.history || [];
  var errMsg = hist[idx];
  if(!errMsg) return;
  var parentId = errMsg.thread_parent_id;
  if(!parentId){ showToast(isJa?'スレッド情報が見つかりません':'Thread reference missing','ng'); return; }
  // Walk back to the last USER message in the same thread.
  var userIdx = -1;
  for(var i = idx - 1; i >= 0; i--){
    if(hist[i] && hist[i].role === 'user' && hist[i].thread_parent_id === parentId){ userIdx = i; break; }
  }
  if(userIdx < 0){ showToast(isJa?'再送する元メッセージが見つかりません':'No user message to retry','ng'); return; }
  var text = String(hist[userIdx].content||'').trim();
  if(!text){ showToast(isJa?'空のメッセージは再送できません':'Empty user message','ng'); return; }
  // Remove the error bubble so the new reply takes its place.
  hist.splice(idx, 1);
  // Ensure the thread drawer is open for this parent, then drop text + send.
  window._activeThreadParent = parentId;
  _renderThreadDrawer();
  var ci = document.getElementById('tci');
  if(ci){ ci.value = text; try { exTA(ci); } catch(e){} }
  // Defer a tick so the drawer / composer is in the DOM before send.
  setTimeout(function(){ try { _sendThreadReply(); } catch(e){ console.warn('[thread-retry]', e); } }, 30);
}

/* 段階承認カードは廃止済み (描画ロジック削除済み)。
   過去メッセージに残った onclick="_approveNext(...)" の click が空 onclick
   で潰されないよう、no-op stub は残しておく。次回の DB.save で履歴
   compaction されれば自然に消える。*/
function _approveNext(){ /* deprecated — approval card removed */ }
function _approvePause(){ /* deprecated — approval card removed */ }

/* ── "Promise without delivery" — click to push the AI to actually execute.
   The chip's "▶ 実行する" button fires this. We just slot "やって" into the
   appropriate composer (main or thread, depending on context) and send.
   The AI then takes the un-fulfilled promise from its previous message as
   the instruction and (hopefully) actually calls the tool this time. */
function _pwGoAhead(btn){
  if(!activeId) return;
  var inThread = !!btn.closest('#threadDrawer');
  var taId = inThread ? 'tci' : 'ci';
  var ta = document.getElementById(taId);
  if(!ta) return;
  ta.value = (isJa ? 'やってください' : 'go ahead and do it');
  try { exTA(ta); } catch(_){}
  if(inThread){
    try { _sendThreadReply(); } catch(e){ console.warn('[pw] thread send failed:', e); }
  } else {
    try { sendMsg(); } catch(e){ console.warn('[pw] main send failed:', e); }
  }
}

/* ── Reply (quote-reply) ────────────────────────────── */
function replyToMsg(btn){
  var row = btn.closest('.m'); if(!row) return;
  var bodyEl = row.querySelector('.m-body'); if(!bodyEl) return;
  var speaker = (row.querySelector('.m-name')||{}).textContent || (row.classList.contains('a') ? 'AI' : 'User');
  var snippet = (bodyEl.innerText || '').trim().slice(0, 140).replace(/\n+/g,' ');
  if(snippet.length === 140) snippet += '…';
  var ci = document.getElementById('ci');
  if(!ci) return;
  // Prepend a Markdown blockquote so the AI sees the cited content + speaker.
  var prefix = '> **'+speaker+'**: '+snippet+'\n\n';
  ci.value = prefix + (ci.value||'');
  ci.focus();
  // Place caret after the quote so user types their reply directly.
  try {
    var pos = prefix.length;
    ci.setSelectionRange(pos, pos);
  } catch(e){}
  if(typeof exTA === 'function') exTA(ci);
}

async function regenerateMsg(btn){
  if(!activeId) return;
  var ag=agents.find(function(a){return a.id===activeId;}); if(!ag) return;
  // Confirm last message is assistant — if so, drop it and resend
  if(!ag.history.length || ag.history[ag.history.length-1].role!=='assistant'){
    showToast(isJa?'再生成できる返答がありません':'Nothing to regenerate','ng'); return;
  }
  // Optimistically remove last assistant from UI — but remember its thread_parent
  // so the regenerated reply lands in the same thread (= 「絶対スレッド」原則)
  var _droppedAsst = ag.history.pop();
  var _regenParent = (_droppedAsst && _droppedAsst.thread_parent_id) || null;
  if(!_regenParent){
    // フォールバック: 末尾から逆走して最新の top-level user msg
    for(var _i = ag.history.length - 1; _i >= 0; _i--){
      var _hm = ag.history[_i];
      if(_hm && _hm.role === 'user' && !_hm.thread_parent_id && _hm.id){ _regenParent = _hm.id; break; }
    }
  }
  renderMsgs(ag, true);  // user-initiated → force scroll
  // Append thinking indicator
  var inner=document.getElementById('msgsInner');
  var tEl=document.createElement('div');
  tEl.className='m a'; tEl.id='thinking';
  var _genLabel = ag.chrome_enabled
    ? (isJa ? 'ブラウジング中…' : 'Browsing…')
    : (ag.sheets_enabled ? (isJa ? 'スプレッドシート操作中…' : 'Working on Sheets…')
    : (isJa ? '考えています…' : 'Thinking…'));
  var _thinkLabel = '<div class="gen-indicator">'
    + '<div class="gen-logo"></div>'
    + '<div class="gen-text">' + _genLabel + '</div>'
    + '</div>';
  tEl.innerHTML='<div class="m-meta"><div class="m-av">'+_avHTML(ag.avatar)+'</div><span class="m-name">'+esc(ag.name)+'</span></div><div class="m-body">'+_thinkLabel+'</div>';
  if(inner) inner.appendChild(tEl);
  _scrollMsgsToEnd(true);
  try{
    var r=await api('POST','/api/chat/'+activeId,{regenerate:true});
    ag.history.push({role:'assistant',content:r.reply,time:now(),tool_log:r.tool_log||null,thread_parent_id:_regenParent});
    if(r.balance_jpy!==undefined) me.balance_jpy=r.balance_jpy;
  }catch(e){
    ag.history.push({role:'assistant',content:'エラー: '+e.message,time:now(),is_error:true,thread_parent_id:_regenParent});
  }
  var t=document.getElementById('thinking'); if(t) t.remove();
  renderMsgs(ag);
  // 再生成も thread drawer に入るように open
  if(_regenParent){ try { _openThread(_regenParent); } catch(e){} }
  _refreshArtifactsIfNeeded(r && r.tool_log, ag);
}

// "Sticky bottom" — auto-scroll while user is at/near the bottom, but DON'T
// rip them down if they've scrolled up to read past messages mid-stream.
// Pass force=true to override (user-initiated actions like sending a message,
// regenerating, clicking the scroll-to-bottom FAB).
function _isNearBottom(threshold){
  var el=document.getElementById('msgs');
  if(!el) return true;
  var t = typeof threshold === 'number' ? threshold : 120;
  return (el.scrollHeight - el.scrollTop - el.clientHeight) < t;
}
function _scrollMsgsToEnd(force){
  var el=document.getElementById('msgs');
  if(!el){ return; }
  if(force || _isNearBottom(160)){
    el.scrollTop = el.scrollHeight;
  }
  _updateScrollFAB();
  // Strict Slack-style: when streaming into the drawer, keep it scrolled
  // to the latest content too. Otherwise the new AI text scrolls off the
  // bottom of the drawer and the user thinks it's stuck.
  var dBody = document.getElementById('threadDrawerBody');
  if(dBody){ dBody.scrollTop = dBody.scrollHeight; }
}
function scrollMsgsToBottom(){ _scrollMsgsToEnd(true); }   // FAB always forces
function _updateScrollFAB(){
  var el=document.getElementById('msgs');
  var fab=document.getElementById('fabScroll');
  if(!el||!fab) return;
  var nearBottom = (el.scrollHeight - el.scrollTop - el.clientHeight) < 50;
  fab.style.display = nearBottom ? 'none' : 'flex';
}

/* ── New chat (clear history of current agent) ──────── */
async function newChat(){
  if(!activeId) return;
  if(!confirm(isJa?'現在の会話履歴をクリアして新しい会話を始めますか？':'Clear current chat and start a new one?')) return;
  try{
    await api('POST','/api/user/clear-chat-history',{agent_id:activeId});
    var ag=agents.find(function(a){return a.id===activeId;});
    if(ag) ag.history=[];
    renderMsgs(ag, true);  // user-initiated reset
    showToast(isJa?'新しい会話を始めました':'New chat started','ok');
  }catch(e){ showToast(isJa?'クリアに失敗':'Failed to clear','ng'); }
}

/* ── Share URL ──────────────────────────────────────── */
function _shareUrlFor(shareId){ return location.origin+'/a/'+shareId; }

async function openShareCard(){
  if(!activeId) return;
  var ag=agents.find(function(a){return a.id===activeId;}); if(!ag) return;
  var card=document.getElementById('shareCard');
  if(!card) return;
  if(card.style.display==='block'){ card.style.display='none'; return; }
  card.style.display='block';
  card.innerHTML='<div style="color:var(--text3);font-size:12px">'+(isJa?'共有URLを準備しています...':'Preparing share URL...')+'</div>';
  try{
    var r=await api('POST','/api/agents/'+activeId+'/share',{enabled:true});
    ag.share_id=r.share_id;
    _renderShareCard(ag);
  }catch(e){
    card.innerHTML='<div style="color:var(--rose);font-size:12px">'+(isJa?'共有URLの取得に失敗':'Failed to load share URL')+'</div>';
  }
}
function _renderShareCard(ag){
  var card=document.getElementById('shareCard'); if(!card) return;
  if(!ag.share_id){ card.style.display='none'; return; }
  var url=_shareUrlFor(ag.share_id);
  var encoded=encodeURIComponent(url);
  var twitterText=encodeURIComponent((isJa?'AI エージェント "':'Try my AI agent "')+(ag.name||'')+(isJa?'" を試してみて':'"'));
  card.innerHTML =
    '<div style="display:flex;align-items:flex-start;gap:12px">'+
      '<div style="flex:1;min-width:0">'+
        '<div class="sc-h">🔗 '+(isJa?'このエージェントを共有':'Share this agent')+'</div>'+
        '<div class="sc-d">'+(isJa?'URL を SNS や DM で送ると、誰でもこのエージェントを自分のアカウントにコピーして使えます。':'Anyone with the URL can copy this agent into their own account.')+'</div>'+
        '<div class="sc-url-box">'+
          '<input class="sc-url" id="sc-url-input" readonly value="'+esc(url)+'">'+
          '<button class="sc-copy" onclick="copyShareUrl()">📋 '+(isJa?'コピー':'Copy')+'</button>'+
        '</div>'+
        '<div class="sc-actions">'+
          '<a class="sc-share-btn" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text='+twitterText+'&url='+encoded+'">𝕏 X</a>'+
          '<a class="sc-share-btn" target="_blank" rel="noopener" href="https://social-plugins.line.me/lineit/share?url='+encoded+'">📱 LINE</a>'+
          '<a class="sc-share-btn" href="mailto:?subject='+twitterText+'&body='+encoded+'">✉️ '+(isJa?'メール':'Email')+'</a>'+
          '<button class="sc-regen" onclick="regenShareUrl()">'+(isJa?'URLを再生成':'Regenerate URL')+'</button>'+
        '</div>'+
        '<label class="sc-toggle">'+
          '<input type="checkbox" id="sc-public-toggle" checked onchange="toggleSharePublic(this.checked)">'+
          '<span>'+(isJa?'公開する（OFF にすると URL が無効になります）':'Public (turning off invalidates the URL)')+'</span>'+
        '</label>'+
      '</div>'+
      '<button onclick="document.getElementById(\'shareCard\').style.display=\'none\'" style="background:none;border:0;color:var(--text3);font-size:18px;cursor:pointer;line-height:1;padding:0 4px">×</button>'+
    '</div>';
}
function copyShareUrl(){
  var inp=document.getElementById('sc-url-input');
  if(!inp) return;
  if(navigator.clipboard) navigator.clipboard.writeText(inp.value);
  else { inp.select(); document.execCommand('copy'); }
  showToast(isJa?'URLをコピーしました':'URL copied','ok');
}
async function regenShareUrl(){
  if(!activeId) return;
  if(!confirm(isJa?'URLを再生成しますか？古いURLは無効になります':'Regenerate URL? Old URL will become invalid.')) return;
  try{
    var r=await api('POST','/api/agents/'+activeId+'/share',{regenerate:true});
    var ag=agents.find(function(a){return a.id===activeId;}); if(ag){ ag.share_id=r.share_id; }
    _renderShareCard(ag);
    showToast(isJa?'URLを再生成しました':'URL regenerated','ok');
  }catch(e){ showToast(isJa?'失敗しました':'Failed','ng'); }
}
async function toggleSharePublic(enabled){
  if(!activeId) return;
  try{
    var r=await api('POST','/api/agents/'+activeId+'/share',{enabled:!!enabled});
    var ag=agents.find(function(a){return a.id===activeId;}); if(ag){ ag.share_id = r.share_id || null; }
    if(!enabled){
      var card=document.getElementById('shareCard');
      if(card) card.innerHTML='<div style="color:var(--text3);font-size:12.5px;padding:6px 0">'+(isJa?'非公開にしました':'Set to private')+'</div>';
    }
  }catch(e){ showToast(isJa?'失敗しました':'Failed','ng'); }
}

/* ── Share *conversation* (read-only public snapshot at /c/:id) ───── */
async function openChatShareModal(){
  if(!activeId) return;
  var ag=agents.find(function(a){return a.id===activeId;}); if(!ag) return;
  if(!ag.history || !ag.history.length){
    showToast(isJa?'共有できる会話がまだありません':'No conversation to share yet','ng'); return;
  }
  // Pre-fill the title from the first user message (truncated).
  var firstUser = (ag.history||[]).find(function(m){return m.role==='user';});
  var defaultTitle = (firstUser && firstUser.content || ag.name || 'Conversation').toString().replace(/\s+/g,' ').slice(0,90);
  var ov=document.createElement('div');
  ov.id='chatShareOv';
  // flex-start + overflow-y so a long modal scrolls instead of clipping its
  // own header when the content is taller than the viewport (mobile, soft
  // keyboard open, narrow heights, etc).
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:flex-start;justify-content:center;z-index:9000;padding:5vh 14px 14px;overflow-y:auto;';
  ov.innerHTML=
    '<div style="background:var(--card,#fff);border-radius:14px;max-width:480px;width:100%;padding:22px;box-shadow:0 24px 64px rgba(0,0,0,.3);font-family:inherit">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'+
        '<div style="font-weight:800;font-size:16px">💬 '+(isJa?'この会話を共有':'Share this conversation')+'</div>'+
        '<button onclick="closeChatShareModal()" style="background:none;border:0;color:var(--text3);font-size:20px;cursor:pointer;line-height:1">×</button>'+
      '</div>'+
      '<div style="font-size:12.5px;color:var(--text2);line-height:1.55;margin-bottom:12px">'+(isJa?'今までのやり取りをスナップショットとして公開リンクにします。閲覧専用で、後から編集できません。':'Creates a read-only public snapshot of this conversation. Viewers cannot edit or reply.')+'</div>'+
      '<label style="display:block;font-size:11.5px;font-weight:700;color:var(--text3);margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase">'+(isJa?'タイトル':'Title')+'</label>'+
      '<input id="csTitleIn" maxlength="120" style="width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font-size:13.5px;margin-bottom:12px;font-family:inherit" value="'+esc(defaultTitle)+'">'+
      '<label style="display:block;font-size:11.5px;font-weight:700;color:var(--text3);margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase">'+(isJa?'有効期限':'Expires')+'</label>'+
      '<select id="csExpireIn" style="width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font-size:13.5px;margin-bottom:14px;font-family:inherit">'+
        '<option value="0">'+(isJa?'失効なし (永続)':'Never (permanent)')+'</option>'+
        '<option value="1">'+(isJa?'24 時間で失効':'1 day')+'</option>'+
        '<option value="7" selected>'+(isJa?'7 日で失効':'7 days')+'</option>'+
        '<option value="30">'+(isJa?'30 日で失効':'30 days')+'</option>'+
      '</select>'+
      '<div id="csResult" style="display:none;margin-bottom:14px">'+
        '<label style="display:block;font-size:11.5px;font-weight:700;color:var(--text3);margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase">'+(isJa?'公開リンク':'Public link')+'</label>'+
        '<div style="display:flex;gap:6px"><input id="csUrlIn" readonly style="flex:1;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font-size:12.5px;font-family:inherit"><button onclick="copyChatShareUrl()" style="padding:9px 12px;background:var(--peach);color:#fff;border:0;border-radius:8px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit">📋</button></div>'+
        '<div id="csTweet" style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap"></div>'+
      '</div>'+
      '<button id="csCreate" onclick="createChatShare()" style="width:100%;padding:11px;background:var(--text);color:#fff;border:0;border-radius:9px;font-weight:700;font-size:13.5px;cursor:pointer;font-family:inherit">'+(isJa?'公開リンクを作成':'Create public link')+'</button>'+
    '</div>';
  ov.addEventListener('click', function(e){ if(e.target===ov) closeChatShareModal(); });
  document.body.appendChild(ov);
}
function closeChatShareModal(){
  var ov=document.getElementById('chatShareOv'); if(ov) ov.remove();
}
async function createChatShare(){
  var titleIn=document.getElementById('csTitleIn');
  var btn=document.getElementById('csCreate');
  if(!titleIn||!btn) return;
  btn.disabled=true; btn.textContent=isJa?'作成中…':'Creating…';
  try{
    var expSel = document.getElementById('csExpireIn');
    var expiresInDays = expSel ? parseInt(expSel.value||'0',10) : 0;
    var r=await api('POST','/api/chat/share',{ agent_id: activeId, title: titleIn.value||'', expires_in_days: expiresInDays });
    var url=r.url;
    var box=document.getElementById('csResult');
    var urlIn=document.getElementById('csUrlIn');
    if(urlIn) urlIn.value=url;
    if(box){
      box.style.display='block';
      var enc=encodeURIComponent(url);
      var tweetText=encodeURIComponent((isJa?'Claude をベースに作った MY AI Agent との会話、共有しました 👇':'Sharing a conversation with my AI agent on MY AI AGENT 👇'));
      document.getElementById('csTweet').innerHTML=
        '<a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text='+tweetText+'&url='+enc+'" style="background:#000;color:#fff;padding:7px 11px;border-radius:6px;font-size:12px;font-weight:700;text-decoration:none">𝕏 '+(isJa?'X でツイート':'Tweet')+'</a>'+
        '<a href="mailto:?subject='+tweetText+'&body='+enc+'" style="background:#f4f4f5;color:#27272a;padding:7px 11px;border-radius:6px;font-size:12px;font-weight:700;text-decoration:none">✉️ '+(isJa?'メール':'Email')+'</a>';
    }
    btn.style.display='none';
    showToast(isJa?'公開リンクを作成しました':'Public link created','ok');
  }catch(e){
    btn.disabled=false; btn.textContent=isJa?'公開リンクを作成':'Create public link';
    showToast((e&&e.message)||(isJa?'作成に失敗':'Failed'),'ng');
  }
}
function copyChatShareUrl(){
  var inp=document.getElementById('csUrlIn'); if(!inp) return;
  if(navigator.clipboard) navigator.clipboard.writeText(inp.value);
  else { inp.select(); document.execCommand('copy'); }
  showToast(isJa?'URLをコピーしました':'URL copied','ok');
}
function useChip(t){
  // In group chats, the AI only responds when the message includes @AI.
  // Quick chips are explicitly meant to invoke the agent, so auto-prepend.
  var ag = agents.find(function(a){return a.id===activeId;});
  if(ag && ag.is_group && !/(^|[\s　])@(AI|ai)\b/.test(t)){
    t = '@AI ' + t;
  }
  document.getElementById('ci').value=t; sendMsg();
}

// 「@部門名」を composer に挿入 (= 部門指名依頼の UX hint)
function _insertMention(deptName){
  var ta = document.getElementById('ci');
  if(!ta) return;
  var prefix = '@' + deptName + ' ';
  // 既に @ で始まってたら置換、そうでなければ先頭に prepend
  var v = ta.value || '';
  if(/^@\S+\s/.test(v)){
    ta.value = v.replace(/^@\S+\s*/, prefix);
  } else {
    ta.value = prefix + v;
  }
  ta.focus();
  try { exTA(ta); } catch(_){}
  // カーソルを末尾に
  ta.setSelectionRange(ta.value.length, ta.value.length);
}

/* ── Follow-up chip suggestions (Claude.ai-style) ───── */
async function _fetchFollowupSuggestions(ag){
  if(!ag || !ag.id) return;
  // Clear any previous chip row so we don't stack.
  var prev = document.getElementById('followup-chips');
  if(prev) prev.remove();
  try {
    var r = await api('POST','/api/chat/'+ag.id+'/suggest',{});
    var s = (r && r.suggestions) || [];
    if(!s.length) return;
    if(activeId !== ag.id) return; // user switched agents while we were waiting
    var inner = document.getElementById('msgsInner'); if(!inner) return;
    var row = document.createElement('div');
    row.id = 'followup-chips';
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px 4px;max-width:780px;margin:0 auto;';
    row.innerHTML = s.map(function(text){
      var t = String(text||'').slice(0,90);
      return '<button onclick="useFollowupChip(this)" data-text="'+esc(t).replace(/"/g,'&quot;')+'" style="background:#fff;border:1px solid var(--wire2);border-radius:18px;padding:7px 13px;font-size:12.5px;color:var(--text2);cursor:pointer;font-family:inherit;line-height:1.3;transition:all .12s ease" onmouseover="this.style.background=\'var(--peach)\';this.style.color=\'#fff\';this.style.borderColor=\'var(--peach)\'" onmouseout="this.style.background=\'#fff\';this.style.color=\'var(--text2)\';this.style.borderColor=\'var(--wire2)\'">'+esc(t)+'</button>';
    }).join('');
    inner.appendChild(row);
    _scrollMsgsToEnd();
  } catch(e){ /* silent — chips are non-critical */ }
}
function useFollowupChip(btn){
  var t = btn.getAttribute('data-text') || '';
  var prev = document.getElementById('followup-chips'); if(prev) prev.remove();
  useChip(t);
}

/* ── Send ──────────────────────────────────────────── */
// 選択中の画像リスト — メインの composer 用 (top-level chat)
var _pendingImgs = [];
// スレッドドロワーの composer 用。メインとは完全に独立した別の添付バッファ。
// Slack 同様、メインチャットとスレッドの両方で同時に添付できるようにする。
// 再代入は絶対にしない (.length=0 でクリア) — 非同期 ingest 中も参照が安定。
var _threadPendingImgs = [];
// composer 識別子 'main' | 'thread' → 添付配列 / プレビュー DOM id を返す。
function _pendOf(which){ return which==='thread' ? _threadPendingImgs : _pendingImgs; }
function _previewIdOf(which){ return which==='thread' ? 'tImgPreviewWrap' : 'imgPreviewWrap'; }
// 添付チップの × ボタンから呼ばれる削除ハンドラ (main / thread 両対応)。
function _removeAtt(which, i){
  var arr = _pendOf(which);
  if(i>=0 && i<arr.length) arr.splice(i,1);
  renderImgPreview(which);
}
// スレッド composer の textarea 用 Enter ハンドラ (taKey のスレッド版)。
function _threadTaKey(e){
  if(e.isComposing || e.keyCode===229 || _imeActive) return;
  if((Date.now()-_imeEndAt) < 200) return;
  if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); _sendThreadReply(); }
}

// 添付ファイル選択ハンドラ（画像 + PDF対応）
/* ── Avatar upload (image) ──────────────────────────────────── */
async function onAvatarUpload(e, mode){
  var f = (e.target.files||[])[0];
  if(!f) return;
  if(!/^image\//.test(f.type)){ showToast(isJa?'画像を選んでください':'Pick an image','ng'); return; }
  if(f.size > 5*1024*1024){ showToast(isJa?'5MB 以下にしてください':'Max 5MB','ng'); return; }
  try{
    var dataUri = await _resizeImageToDataURL(f, 256, 0.85);
    if(mode === 'wizard'){
      NA.avatar = dataUri;
      var p = document.getElementById('avPrev'); if(p) p.innerHTML = _avHTML(dataUri);
      // Deselect emoji cells
      document.querySelectorAll('.av-cell').forEach(function(b){ b.classList.remove('sel'); });
    } else if(mode === 'edit'){
      var id = window._editAgentId;
      if(!id){ showToast(L('エージェントが見つかりません','Agent not found'),'ng'); return; }
      // Optimistic UI
      var ag = agents.find(function(a){return a.id===id;});
      if(ag) ag.avatar = dataUri;
      var av = document.getElementById('editAgAvatar'); if(av) av.innerHTML = _avHTML(dataUri);
      try{
        await api('PATCH','/api/agents/'+id, {avatar:dataUri});
        showToast(isJa?'アバターを更新しました':'Avatar updated','ok');
        renderAgList();
        if(activeId===id) openAgent(id);
      }catch(err){
        showToast(err.message||'更新失敗','ng');
      }
    }
  }catch(err){ showToast(err.message||'失敗','ng'); }
  e.target.value = '';
}
function resetAvatarToEmoji(mode){
  if(mode === 'wizard'){
    NA.avatar = '🤖';
    var p = document.getElementById('avPrev'); if(p) p.innerHTML = _avHTML('🤖');
    document.querySelectorAll('.av-cell').forEach(function(b,i){ b.classList.toggle('sel', AVATARS[i] === '🤖'); });
  }
}

/* ── Avatar rendering helper ────────────────────────────────── */
/* Returns HTML for an avatar value: data:image/* URI → <img>, else emoji text */
function _avHTML(av){
  av = String(av==null?'🤖':av);
  if(av.startsWith('data:image/')){
    return '<img src="'+av+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block">';
  }
  return esc(av);
}

/* Read a File as base64 data URI, with size cap. Resolves to data: URI string. */
function _readFileAsDataURL(file, maxBytes){
  return new Promise(function(resolve,reject){
    if(maxBytes && file.size > maxBytes){
      reject(new Error('ファイルが大きすぎます (最大 '+Math.round(maxBytes/1024)+'KB)'));
      return;
    }
    var fr = new FileReader();
    fr.onload = function(e){ resolve(e.target.result); };
    fr.onerror = function(){ reject(new Error('読み込み失敗')); };
    fr.readAsDataURL(file);
  });
}

/* Resize image to a square thumbnail (max NxN, JPEG). Resolves data: URI */
function _resizeImageToDataURL(file, maxSize, quality){
  maxSize = maxSize || 256;
  quality = quality || 0.85;
  return new Promise(function(resolve,reject){
    var fr = new FileReader();
    fr.onload = function(e){
      var img = new Image();
      img.onload = function(){
        var w = img.width, h = img.height;
        // Square crop center, then scale to maxSize
        var side = Math.min(w, h);
        var sx = (w - side) / 2, sy = (h - side) / 2;
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = maxSize;
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
        try{ resolve(canvas.toDataURL('image/jpeg', quality)); }
        catch(err){ reject(err); }
      };
      img.onerror = function(){ reject(new Error('画像の読み込みに失敗')); };
      img.src = e.target.result;
    };
    fr.onerror = function(){ reject(new Error('読み込み失敗')); };
    fr.readAsDataURL(file);
  });
}

/* ── Slash commands (/search etc.) ──────────────────────────── */
/* ── Slash command palette ─────────────────────────────
 * Fires when '/' is the first char of the composer. Shows a floating menu
 * filtered by the typed prefix. Arrow keys + Enter to select. */
var _SLASH_CMDS = [
  {cmd:'/plan',   alias:null,        icon:'📋', desc_ja:'プランを 3-5 ステップに分解して順番に実行 (Plan→Execute→Review)', desc_en:'Break into 3-5 steps and execute sequentially', tmpl:'/plan '},
  {cmd:'/improve',alias:null,        icon:'✨', desc_ja:'前の応答を品質チェック → 改善版を出す',     desc_en:'Self-critique and rewrite the previous reply',  tmpl:'/improve'},
  {cmd:'/opus',   alias:null,        icon:'🧠', desc_ja:'このターンだけ Claude Opus (最高性能) を使う', desc_en:'Use Claude Opus for this turn only',         tmpl:'/opus '},
  {cmd:'/search', alias:'/s',        icon:'🔍', desc_ja:'Web 検索結果を context として AI に渡す',  desc_en:'Inject Web search results into the prompt',  tmpl:'/search '},
  {cmd:'/image',  alias:'/img',      icon:'🎨', desc_ja:'画像を生成',                                desc_en:'Generate an image',                            tmpl:'/image '},
  {cmd:'/pdf',    alias:null,        icon:'📄', desc_ja:'PDF を生成',                                 desc_en:'Generate a PDF',                                tmpl:'/pdf '},
  {cmd:'/email',  alias:'/mail',     icon:'✉️', desc_ja:'自分宛にメールを送信',                       desc_en:'Send an email to yourself',                    tmpl:'/email '},
  {cmd:'/pr',     alias:'/create-pr',icon:'🔀', desc_ja:'GitHub に PR を作成 (PAT 必要)',             desc_en:'Open a GitHub Pull Request (PAT required)',   tmpl:'/pr '},
  {cmd:'/issue',  alias:null,        icon:'📋', desc_ja:'GitHub に Issue を作成 (PAT 必要)',          desc_en:'Open a GitHub Issue (PAT required)',          tmpl:'/issue '},
  {cmd:'/remember',alias:'/memo',    icon:'🧠', desc_ja:'長期メモリに保存 — 別チャットでも参照',     desc_en:'Save to long-term memory across chats',       tmpl:'/remember '},
  {cmd:'/pin',    alias:null,        icon:'📌', desc_ja:'直前の返答をピン留め',                      desc_en:'Pin the previous reply',                       tmpl:'/pin'},
  {cmd:'/clear',  alias:'/new',      icon:'↻',  desc_ja:'新規会話 (履歴クリア)',                      desc_en:'Start a new chat (clear history)',             tmpl:'/clear'},
  {cmd:'/share',  alias:null,        icon:'💬', desc_ja:'この会話を公開リンクで共有',                 desc_en:'Share this conversation as a public link',     tmpl:'/share'},
];
var _slashSelIdx = 0;

function _slashPalId(which){ return which==='thread' ? 'tSlashPalette' : 'slashPalette'; }
function _slashCiId(which){ return which==='thread' ? 'tci' : 'ci'; }
function _slashOnInput(text, which){
  which = which || 'main';
  var pal = document.getElementById(_slashPalId(which));
  if(!pal) return;
  // Only fire when the composer STARTS with "/" and has no space yet — once
  // the user types a space the command is locked in and we hide the menu.
  var m = text.match(/^\/(\S*)$/);
  if(!m){ pal.style.display = 'none'; return; }
  var prefix = ('/' + m[1]).toLowerCase();
  var filtered = _SLASH_CMDS.filter(function(c){
    return c.cmd.startsWith(prefix) || (c.alias && c.alias.startsWith(prefix));
  });
  if(!filtered.length){ pal.style.display = 'none'; return; }
  _slashSelIdx = 0;
  pal.innerHTML = filtered.map(function(c, i){
    var desc = isJa ? c.desc_ja : c.desc_en;
    var key = i === 0 ? '↵' : '';
    return '<div class="slash-item'+(i===0?' sel':'')+'" data-tmpl="'+esc(c.tmpl)+'" data-i="'+i+'" onclick="_slashPick('+i+',\''+which+'\')">'+
      '<div class="slash-item-ic">'+c.icon+'</div>'+
      '<div class="slash-item-body"><div class="slash-item-cmd">'+esc(c.cmd)+(c.alias?' <span style="color:var(--text3);font-weight:400">(or '+esc(c.alias)+')</span>':'')+'</div><div class="slash-item-desc">'+esc(desc)+'</div></div>'+
      (key?'<span class="slash-item-key">'+key+'</span>':'')+
    '</div>';
  }).join('');
  pal.style.display = 'block';
  // Store the filtered set on the palette so keydown can read it.
  pal._items = filtered;
}
function _slashOnKeydown(e, which){
  which = which || 'main';
  var pal = document.getElementById(_slashPalId(which));
  if(!pal || pal.style.display === 'none') return false;
  var items = pal._items || [];
  if(!items.length) return false;
  if(e.key === 'ArrowDown'){
    e.preventDefault();
    _slashSelIdx = (_slashSelIdx + 1) % items.length;
    _slashUpdateSel(which);
    return true;
  }
  if(e.key === 'ArrowUp'){
    e.preventDefault();
    _slashSelIdx = (_slashSelIdx - 1 + items.length) % items.length;
    _slashUpdateSel(which);
    return true;
  }
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    _slashPick(_slashSelIdx, which);
    return true;
  }
  if(e.key === 'Tab'){
    e.preventDefault();
    _slashPick(_slashSelIdx, which);
    return true;
  }
  if(e.key === 'Escape'){
    e.preventDefault();
    pal.style.display = 'none';
    return true;
  }
  return false;
}
function _slashUpdateSel(which){
  var pal = document.getElementById(_slashPalId(which||'main'));
  if(!pal) return;
  pal.querySelectorAll('.slash-item').forEach(function(el, i){
    el.classList.toggle('sel', i === _slashSelIdx);
  });
}
function _slashPick(i, which){
  which = which || 'main';
  var pal = document.getElementById(_slashPalId(which));
  if(!pal) return;
  var items = pal._items || [];
  var picked = items[i];
  if(!picked) return;
  var ci = document.getElementById(_slashCiId(which)); if(!ci) return;
  // Commands with no args (/pin, /clear, /share) execute immediately.
  if(picked.tmpl === '/pin' || picked.tmpl === '/clear' || picked.tmpl === '/share'){
    pal.style.display = 'none';
    ci.value = '';
    if(picked.tmpl === '/clear'){ if(typeof newChat==='function') newChat(); }
    else if(picked.tmpl === '/share'){ if(typeof openChatShareModal==='function') openChatShareModal(); }
    else if(picked.tmpl === '/pin'){
      // Pin the last assistant message
      var ag = agents.find(function(a){return a.id===activeId;});
      if(ag && ag.history){
        for(var k=ag.history.length-1;k>=0;k--){
          if(ag.history[k].role==='assistant'){ ag.history[k].pinned = true; renderMsgs(ag); break; }
        }
      }
    }
    return;
  }
  // Commands with args: fill template + focus for typing.
  ci.value = picked.tmpl;
  ci.focus();
  ci.setSelectionRange(ci.value.length, ci.value.length);
  pal.style.display = 'none';
  if(typeof exTA === 'function') exTA(ci);
}

/* ── In-chat search (Cmd+F / Ctrl+F) ─────────────────── */
var _chatSearchHits = [];
var _chatSearchIdx = 0;

document.addEventListener('keydown', function(e){
  // Cmd+F (mac) or Ctrl+F → in-chat search if a chat is open.
  if((e.metaKey || e.ctrlKey) && e.key === 'f' && activeId){
    var bar = document.getElementById('chatSearchBar');
    var msgs = document.getElementById('msgs');
    if(bar || msgs){
      e.preventDefault();
      _openChatSearch();
    }
  }
  if(e.key === 'Escape'){
    var bar = document.getElementById('chatSearchBar');
    if(bar){ _closeChatSearch(); }
  }
});

function _openChatSearch(){
  var existing = document.getElementById('chatSearchBar');
  if(existing){ existing.querySelector('input').focus(); return; }
  var bar = document.createElement('div');
  bar.id = 'chatSearchBar';
  bar.className = 'chat-search';
  bar.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text3)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'+
    '<input type="search" placeholder="'+(isJa?'チャット内を検索…':'Search in chat…')+'" oninput="_chatSearchInput(this.value)" onkeydown="_chatSearchKey(event)" autofocus>'+
    '<span class="chat-search-count" id="chatSearchCount">—</span>'+
    '<button class="chat-search-btn" onclick="_chatSearchNav(-1)" title="前へ">▲</button>'+
    '<button class="chat-search-btn" onclick="_chatSearchNav(1)" title="次へ">▼</button>'+
    '<button class="chat-search-btn" onclick="_closeChatSearch()" title="閉じる">×</button>';
  var chatWrap = document.querySelector('.main') || document.body;
  chatWrap.appendChild(bar);
  setTimeout(function(){ var inp = bar.querySelector('input'); if(inp) inp.focus(); }, 30);
}
function _closeChatSearch(){
  _chatSearchClear();
  var bar = document.getElementById('chatSearchBar'); if(bar) bar.remove();
}
function _chatSearchClear(){
  document.querySelectorAll('.chat-search-hit').forEach(function(el){
    var t = document.createTextNode(el.textContent);
    el.parentNode.replaceChild(t, el);
  });
  document.querySelectorAll('#msgs .m-body').forEach(function(el){ el.normalize(); });
  _chatSearchHits = []; _chatSearchIdx = 0;
}
function _chatSearchInput(q){
  _chatSearchClear();
  q = (q||'').trim();
  var countEl = document.getElementById('chatSearchCount');
  if(!q){ if(countEl) countEl.textContent = '—'; return; }
  // Highlight matches in every visible message body
  var re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
  document.querySelectorAll('#msgs .m-body').forEach(function(body){
    _highlightWalk(body, re);
  });
  _chatSearchHits = Array.prototype.slice.call(document.querySelectorAll('.chat-search-hit'));
  _chatSearchIdx = 0;
  if(_chatSearchHits.length){
    _chatSearchHits[0].classList.add('current');
    _chatSearchHits[0].scrollIntoView({block:'center', behavior:'smooth'});
  }
  if(countEl) countEl.textContent = _chatSearchHits.length ? '1/'+_chatSearchHits.length : '0/0';
}
function _highlightWalk(node, re){
  if(node.nodeType === 3){
    var t = node.nodeValue;
    if(!re.test(t)) return;
    re.lastIndex = 0;
    var span = document.createElement('span');
    span.innerHTML = t.replace(re, function(m){ return '<span class="chat-search-hit">'+m.replace(/[&<>]/g, function(c){return c==='&'?'&amp;':c==='<'?'&lt;':'&gt;'})+'</span>'; });
    var frag = document.createDocumentFragment();
    while(span.firstChild) frag.appendChild(span.firstChild);
    node.parentNode.replaceChild(frag, node);
    return;
  }
  if(node.nodeType === 1 && !/^(SCRIPT|STYLE|PRE)$/.test(node.tagName)){
    Array.prototype.slice.call(node.childNodes).forEach(function(c){ _highlightWalk(c, re); });
  }
}
function _chatSearchNav(dir){
  if(!_chatSearchHits.length) return;
  _chatSearchHits[_chatSearchIdx].classList.remove('current');
  _chatSearchIdx = (_chatSearchIdx + dir + _chatSearchHits.length) % _chatSearchHits.length;
  _chatSearchHits[_chatSearchIdx].classList.add('current');
  _chatSearchHits[_chatSearchIdx].scrollIntoView({block:'center', behavior:'smooth'});
  var c = document.getElementById('chatSearchCount');
  if(c) c.textContent = (_chatSearchIdx+1)+'/'+_chatSearchHits.length;
}
function _chatSearchKey(e){
  if(e.key === 'Enter'){
    e.preventDefault();
    _chatSearchNav(e.shiftKey ? -1 : 1);
  }
  if(e.key === 'Escape'){ _closeChatSearch(); }
}

async function _runSlashCommand(text){
  // /image <prompt> — generate an image via Replicate, attach the URL to the chat
  var imM = text.match(/^\/(?:image|img|imagine)\s+(.+)$/i);
  if(imM){
    var prompt = imM[1].trim();
    if(!prompt) return null;
    showToast(isJa?'🎨 画像を生成中…':'Generating image…','ok');
    try{
      var r = await api('POST','/api/generate/image',{prompt});
      if(r && r.urls && r.urls[0]){
        // Push the AI's "image generated" message into local history immediately
        var ag = agents.find(a => a.id === activeId);
        if(ag){
          ag.history = ag.history || [];
          var imgUrl = r.urls[0];
          ag.history.push({
            role: 'assistant',
            content: '🎨 画像を生成しました\n\n![生成画像]('+imgUrl+')\n\n*Prompt: '+prompt+'*',
            time: now(),
            generated_image_url: imgUrl,
          });
          renderMsgs(ag);
        }
        if(typeof me !== 'undefined' && r.cost_jpy){
          me.balance_jpy = (me.balance_jpy||0) - r.cost_jpy;
          updateBalance && updateBalance();
        }
        showToast(isJa?'生成完了':'Done','ok');
        // Return null to skip sending to AI (image is the response itself)
        return null;
      }
    }catch(e){
      var msg = e.message||'';
      if(msg.includes('not_configured') || msg.includes('準備中')){
        showToast(isJa?'画像生成は管理者の API キー設定後に利用可':'Image generation pending API key','ng');
      } else {
        showToast((isJa?'画像生成失敗: ':'Image gen failed: ')+msg,'ng');
      }
      return null;
    }
    return null;
  }
  // /remember <text> — save to long-term memory
  var rmM = text.match(/^\/(?:remember|memo)\s+(.+)$/i);
  if(rmM){
    var memText = rmM[1].trim();
    try {
      await api('POST','/api/me/memories',{text: memText});
      showToast(isJa?'記憶しました 🧠':'Remembered','ok');
    } catch(e){ showToast(e.message,'ng'); }
    return null;
  }
  // /search <query> — Web 検索結果を context として prepend
  var m = text.match(/^\/search\s+(.+)$/i) || text.match(/^\/s\s+(.+)$/i);
  if(m){
    var query = m[1].trim();
    if(!query) return null;
    showToast(isJa?'🔍 検索中…':'Searching…','ok');
    try{
      var r = await api('POST','/api/search',{query});
      if(!r.results || !r.results.length){
        return query + '\n\n（Web 検索結果は取得できませんでした）';
      }
      var ctx = '【Web 検索結果】「'+query+'」\n\n';
      ctx += r.results.slice(0,6).map(function(x,i){
        return (i+1)+'. '+x.title+'\n'+x.url+'\n'+(x.snippet||'');
      }).join('\n\n');
      ctx += '\n\n上記の検索結果を踏まえて、ユーザーの質問に答えてください。\n\nユーザーの質問: '+query;
      return ctx;
    }catch(e){
      showToast((isJa?'検索失敗: ':'Search failed: ')+(e.message||''),'ng');
      return null;
    }
  }
  return null;
}

/* ── Voice input (Web Speech API) ───────────────────────────── */
var _recog = null, _recogActive = false;
function _speechCtor(){
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}
function toggleMic(ciId, btnId){
  var Ctor = _speechCtor();
  if(!Ctor){
    showToast(isJa?'このブラウザは音声入力に対応していません (Chrome/Edge/Safari 推奨)':'Voice input not supported in this browser','ng');
    return;
  }
  if(_recogActive){
    try{ _recog && _recog.stop(); }catch(e){}
    return;
  }
  var btn = document.getElementById(btnId||'micBtn');
  var ci  = document.getElementById(ciId||'ci');
  if(!ci) return;
  _recog = new Ctor();
  _recog.lang = isJa ? 'ja-JP' : 'en-US';
  _recog.interimResults = true;
  _recog.continuous = false;
  var baseText = ci.value.replace(/\s+$/,'');
  if(baseText) baseText += ' ';
  _recog.onresult = function(event){
    var transcript = '';
    for(var i = event.resultIndex; i < event.results.length; i++){
      transcript += event.results[i][0].transcript;
    }
    ci.value = baseText + transcript;
    if(typeof exTA === 'function') exTA(ci);
  };
  _recog.onerror = function(e){
    if(e.error === 'not-allowed' || e.error === 'service-not-allowed'){
      showToast(isJa?'マイクの使用許可が必要です':'Microphone permission required','ng');
    } else if(e.error !== 'aborted' && e.error !== 'no-speech'){
      showToast((isJa?'音声認識エラー: ':'Recognition error: ')+e.error,'ng');
    }
  };
  _recog.onstart = function(){
    _recogActive = true;
    if(btn){ btn.classList.add('recording'); btn.title = isJa?'録音中… クリックで停止':'Recording… click to stop'; }
  };
  _recog.onend = function(){
    _recogActive = false;
    if(btn){ btn.classList.remove('recording'); btn.title = isJa?'音声入力':'Voice input'; }
    if(ci) ci.focus();
  };
  try{ _recog.start(); }
  catch(e){ showToast(isJa?'音声認識を開始できませんでした':'Could not start recognition','ng'); }
}

// Detect text-like files (by MIME or extension) so we can read as plain UTF-8
// instead of base64 — prepended into the user message as <file> blocks.
function _isTextLike(file){
  var t = (file.type || '').toLowerCase();
  if(t.startsWith('text/')) return true;
  if(['application/json','application/xml','application/javascript','application/x-yaml','application/x-toml'].indexOf(t)>=0) return true;
  var n = (file.name || '').toLowerCase();
  return /\.(md|markdown|txt|log|csv|tsv|json|xml|yaml|yml|toml|ini|html?|css|m?js|cjs|tsx?|jsx?|py|rb|go|rs|java|kt|swift|php|c|cc|cpp|h|hpp|cs|sh|bash|zsh|sql|env|lock)$/.test(n)
    || /(^|\/)dockerfile$/i.test(n) || /(^|\/)makefile$/i.test(n);
}

function onImgSelect(e, which){
  const files = Array.from(e.target.files);
  _ingestFiles(files, which||'main');
  e.target.value = '';
}

function _isDocx(file){
  var n=(file.name||'').toLowerCase();
  return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || /\.docx$/.test(n);
}

function _isXlsx(file){
  // Match by extension (.xlsx/.xls) — the xlsx MIME is the only unambiguous
  // one; application/vnd.ms-excel is skipped because some browsers tag .csv
  // with it, and .csv should keep its text-with-CSV-summary path.
  var n=(file.name||'').toLowerCase();
  return file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || /\.xlsx?$/.test(n);
}

function _csvSummary(text, name){
  // Quick rows × cols preview prepended so the AI sees structure right away.
  var lines = text.split(/\r?\n/).filter(function(l){return l.length>0;});
  if(!lines.length) return text;
  // Naive split on comma — fine for previews. The full file is still in `text`.
  var firstCols = (lines[0].match(/,/g)||[]).length + 1;
  var head = lines.slice(0, 10).join('\n');
  var note = '[CSV preview — '+lines.length+' row'+(lines.length===1?'':'s')+', '+firstCols+' column'+(firstCols===1?'':'s')+']';
  return note + '\n\n' + head + (lines.length>10 ? '\n…\n(full file below)\n\n' + text : '');
}

async function _ingestDocx(file, which){
  which = which || 'main';
  var P = _pendOf(which);
  // Read as base64, hand off to server for mammoth-based text extraction.
  var placeholder = { name: file.name, kind: 'text-loading', text: '' };
  P.push(placeholder);
  renderImgPreview(which);
  try {
    var b64 = await new Promise(function(resolve, reject){
      var r = new FileReader();
      r.onload = function(ev){ resolve(String(ev.target.result||'').split(',')[1] || ''); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    var r = await api('POST','/api/parse/docx',{ b64: b64, name: file.name });
    var idx = P.indexOf(placeholder);
    if(idx>=0) P.splice(idx,1);
    if(!r || !r.text){
      showToast(isJa?'DOCX を解析できませんでした':'Could not parse DOCX','ng');
      renderImgPreview(which); return;
    }
    P.push({
      name: file.name,
      type: 'text/plain',
      kind: 'text',
      text: r.text,
      truncated: !!r.truncated,
      size: file.size,
      source_kind: 'docx',
    });
  } catch(e){
    var i = P.indexOf(placeholder); if(i>=0) P.splice(i,1);
    showToast((isJa?'DOCX 解析エラー: ':'DOCX parse error: ')+(e.message||''),'ng');
  }
  renderImgPreview(which);
}

async function _ingestXlsx(file, which){
  which = which || 'main';
  var P = _pendOf(which);
  // Read as base64, hand off to the server which uses SheetJS to turn each
  // sheet into CSV text the AI can read.
  var placeholder = { name: file.name, kind: 'text-loading', text: '' };
  P.push(placeholder);
  renderImgPreview(which);
  try {
    var b64 = await new Promise(function(resolve, reject){
      var r = new FileReader();
      r.onload = function(ev){ resolve(String(ev.target.result||'').split(',')[1] || ''); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    var r = await api('POST','/api/parse/xlsx',{ b64: b64, name: file.name });
    var idx = P.indexOf(placeholder);
    if(idx>=0) P.splice(idx,1);
    if(!r || !r.text){
      showToast(isJa?'Excel を解析できませんでした':'Could not parse Excel','ng');
      renderImgPreview(which); return;
    }
    P.push({
      name: file.name,
      type: 'text/plain',
      kind: 'text',
      text: r.text,
      truncated: !!r.truncated,
      size: file.size,
      source_kind: 'xlsx',
    });
  } catch(e){
    var i = P.indexOf(placeholder); if(i>=0) P.splice(i,1);
    showToast((isJa?'Excel 解析エラー: ':'Excel parse error: ')+(e.message||''),'ng');
  }
  renderImgPreview(which);
}

function _ingestFiles(files, which){
  which = which || 'main';
  var P = _pendOf(which);
  files.forEach(file => {
    var isImg = file.type.startsWith('image/');
    var isPdf = file.type === 'application/pdf';
    var isDocx = _isDocx(file);
    var isXlsx = _isXlsx(file);
    var isTxt = !isDocx && !isXlsx && _isTextLike(file);
    // Anthropic accepts only these 4 image media types — reject others
    // (iPhone HEIC, SVG, BMP, …) up front so they never hit the API as a 400.
    if(isImg && ['image/jpeg','image/png','image/gif','image/webp'].indexOf((file.type||'').toLowerCase()) < 0){
      showToast(isJa
        ? 'この形式の画像は使えません。JPEG / PNG / GIF / WebP に変換してください'
        : 'This image format is not supported — use JPEG, PNG, GIF or WebP', 'ng');
      return;
    }
    if(isDocx){
      if(file.size > 20*1024*1024){ showToast(isJa?'DOCX が大きすぎます (20MB)':'DOCX too large (20MB)','ng'); return; }
      return _ingestDocx(file, which);
    }
    if(isXlsx){
      if(file.size > 20*1024*1024){ showToast(isJa?'Excel が大きすぎます (20MB)':'Excel too large (20MB)','ng'); return; }
      return _ingestXlsx(file, which);
    }
    if(!isImg && !isPdf && !isTxt){
      showToast((isJa?'未対応のファイル形式: ':'Unsupported file: ')+file.name,'ng');
      return;
    }
    // Per-file caps: 32MB for binary, 1MB for text (read fully)
    if((isImg||isPdf) && file.size > 32*1024*1024){
      showToast(isJa?'ファイルサイズが大きすぎます (32MB以下)':'File too large (max 32MB)','ng');
      return;
    }
    if(isTxt && file.size > 1*1024*1024){
      showToast(isJa?'テキストファイルが大きすぎます (1MB以下)':'Text file too large (max 1MB)','ng');
      return;
    }
    const reader = new FileReader();
    if(isTxt){
      reader.onload = ev => {
        // Cap individual file text to 60KB so the prompt stays affordable
        var text = String(ev.target.result || '');
        var truncated = false;
        if(text.length > 60000){ text = text.slice(0, 60000); truncated = true; }
        // For CSV/TSV, prepend a quick rows × columns summary so the AI
        // immediately knows the shape of the data.
        var isCsv = /\.(csv|tsv)$/i.test(file.name);
        if(isCsv){ text = _csvSummary(text, file.name); }
        P.push({
          name: file.name,
          type: file.type || 'text/plain',
          kind: 'text',
          text: text,
          truncated: truncated,
          size: file.size,
          source_kind: isCsv ? 'csv' : 'text',
        });
        renderImgPreview(which);
      };
      reader.readAsText(file, 'utf-8');
    } else {
      reader.onload = ev => {
        const b64 = ev.target.result.split(',')[1];
        P.push({
          name:file.name,
          type:file.type,
          b64,
          url:ev.target.result,
          kind: isPdf ? 'pdf' : 'image'
        });
        renderImgPreview(which);
      };
      reader.readAsDataURL(file);
    }
  });
}

// Open a quick URL-attach prompt; fetches server-side and adds to attachments.
async function openUrlAttach(which){
  which = which || 'main';
  var initial = '';
  // If clipboard contains a URL, prefill it for convenience
  try{
    if(navigator.clipboard && navigator.clipboard.readText){
      var clip = await navigator.clipboard.readText();
      if(clip && /^https?:\/\//i.test(clip.trim())) initial = clip.trim();
    }
  }catch(e){}
  var u = window.prompt(isJa ? '読み込む URL を入力 (https://...)' : 'URL to ingest (https://...)', initial);
  if(!u) return;
  u = u.trim();
  if(!/^https?:\/\//i.test(u)){
    showToast(isJa?'http(s) URL を入力してください':'http(s) URL required','ng');
    return;
  }
  await _ingestUrl(u, which);
}

async function _ingestUrl(u, which){
  which = which || 'main';
  var P = _pendOf(which);
  // Show a placeholder chip while fetching
  var placeholder = { name: u, source: u, kind: 'url-loading', text: '' };
  P.push(placeholder);
  renderImgPreview(which);
  try{
    const r = await api('POST','/api/fetch-url',{url:u});
    var idx = P.indexOf(placeholder);
    if(idx>=0) P.splice(idx,1);
    if(!r || !r.text){
      showToast(isJa?'内容を取得できませんでした':'Could not fetch','ng');
      renderImgPreview(which);
      return;
    }
    P.push({
      name: r.title || u,
      source: r.url || u,
      kind: 'url',
      text: r.text,
      truncated: !!r.truncated,
      size: r.text.length,
    });
    renderImgPreview(which);
  }catch(e){
    var idx2 = P.indexOf(placeholder);
    if(idx2>=0) P.splice(idx2,1);
    renderImgPreview(which);
    showToast((isJa?'URL 取得失敗: ':'URL fetch failed: ')+(e.message||''),'ng');
  }
}

// Wire drag & drop on the chat foot so users can drop files on the composer.
function _initComposerDnD(){
  var foot = document.querySelector('.chat-foot');
  if(!foot || foot._dndBound) return;
  foot._dndBound = true;
  ['dragenter','dragover'].forEach(function(ev){
    foot.addEventListener(ev, function(e){
      if(e.dataTransfer && Array.from(e.dataTransfer.types||[]).indexOf('Files') >= 0){
        e.preventDefault(); e.stopPropagation();
        foot.classList.add('drop-active');
      }
    });
  });
  ['dragleave','dragend','drop'].forEach(function(ev){
    foot.addEventListener(ev, function(e){
      if(ev === 'drop'){
        if(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length){
          e.preventDefault(); e.stopPropagation();
          _ingestFiles(Array.from(e.dataTransfer.files));
        }
      }
      foot.classList.remove('drop-active');
    });
  });
}
// Run init once DOM is ready (sendMsg uses .composer which is always present)
if(document.readyState !== 'loading'){ try{ _initComposerDnD(); }catch(e){} }
else{ document.addEventListener('DOMContentLoaded', function(){ try{ _initComposerDnD(); }catch(e){} }); }

// When the user pastes into the composer, detect a bare URL and offer to ingest.
function onComposerPaste(ev, which){
  which = which || 'main';
  try{
    var data = (ev.clipboardData || window.clipboardData);
    if(!data) return;
    // ── Image paste (one or many) ──
    // Clipboard can contain multiple image items (e.g. select 3 images in
    // Finder → Cmd+C → Cmd+V here). Iterate over data.items and ingest each
    // as a File. typeof _ingestFiles is defined later — guard for hoist.
    var imageFiles = [];
    if(data.items){
      for(var i=0; i<data.items.length; i++){
        var it = data.items[i];
        if(it && it.kind === 'file' && it.type && it.type.startsWith('image/')){
          var f = it.getAsFile && it.getAsFile();
          if(f) imageFiles.push(f);
        }
      }
    }
    if(imageFiles.length && typeof _ingestFiles === 'function'){
      ev.preventDefault();  // block default behavior of pasting <img> blob URL
      _ingestFiles(imageFiles, which);
      return;
    }
    var txt = data.getData && data.getData('text');
    if(!txt) return;
    txt = txt.trim();
    // Only auto-suggest when the entire pasted content is a single URL
    if(/^https?:\/\/\S+$/i.test(txt) && !/\s/.test(txt)){
      // Defer so the paste lands in the textarea first; offer non-blocking ingest
      setTimeout(function(){
        if(confirm(isJa ? ('この URL を読み込んで添付しますか？\n' + txt) : ('Fetch this URL and attach?\n' + txt))){
          // Remove the URL text from the textarea since we'll attach it
          var ci = document.getElementById(which==='thread'?'tci':'ci');
          if(ci && ci.value.trim() === txt){ ci.value = ''; exTA(ci); }
          _ingestUrl(txt, which);
        }
      }, 50);
    }
  }catch(e){}
}

// 添付プレビュー描画 (画像 / PDF / テキスト / URL) — main / thread 両対応
function renderImgPreview(which){
  which = which || 'main';
  var P = _pendOf(which);
  const wrap = document.getElementById(_previewIdOf(which));
  if(!wrap) return;
  if(P.length === 0){ wrap.style.display='none'; wrap.innerHTML=''; return; }
  wrap.style.display='flex';
  wrap.innerHTML = P.map(function(att,i){
    var thumb, sub = '';
    if(att.kind==='pdf' || att.type==='application/pdf'){
      thumb = '<div style="width:28px;height:28px;border-radius:5px;background:#dc2626;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;flex-shrink:0">PDF</div>';
    } else if(att.kind==='text'){
      thumb = '<div style="width:28px;height:28px;border-radius:5px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;flex-shrink:0">TXT</div>';
      if(att.size) sub = ' · '+_fmtBytes(att.size);
    } else if(att.kind==='url'){
      thumb = '<div style="width:28px;height:28px;border-radius:5px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;flex-shrink:0">🔗</div>';
      if(att.text && att.text.length) sub = ' · '+_fmtBytes(att.text.length);
    } else if(att.kind==='url-loading' || att.kind==='text-loading'){
      thumb = '<div style="width:28px;height:28px;border-radius:5px;background:#94a3b8;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">⋯</div>';
      sub = ' · '+(att.kind==='text-loading' ? (isJa?'解析中…':'parsing…') : (isJa?'読み込み中…':'fetching…'));
    } else {
      thumb = '<img src="'+att.url+'">';
    }
    var trunc = att.truncated ? ' · '+(isJa?'(冒頭のみ)':'(truncated)') : '';
    return '<div class="att-chip">'+
      thumb+
      '<span style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(att.name||'attachment')+sub+trunc+'</span>'+
      '<button class="x" onclick="_removeAtt(\''+which+'\','+i+')" title="削除">×</button>'+
    '</div>';
  }).join('');
}

function _fmtBytes(n){
  if(n < 1024) return n+'B';
  if(n < 1024*1024) return Math.round(n/1024)+'KB';
  return (n/(1024*1024)).toFixed(1)+'MB';
}

// ── 「このサイトを編集」 edit-target chip ─────────────────────
// Set by the ✏️ button on an artifact card. While set, the composer shows a
// chip and the next message(s) are routed (server-side) to edit that EXACT
// file — the AI never has to guess among similar artifacts. Sticky: stays
// until the user clicks ✕, so consecutive tweaks to one site just work.
// Edit-target is per-composer: the main chat and the thread drawer each keep
// their own, so pressing ✏️編集 on an artifact inside a thread targets the
// thread composer (not the main one). `which` = 'main' | 'thread'.
var _editTarget = null;        // main composer { filename, title }
var _editTargetThread = null;  // thread drawer composer { filename, title }
// Which composer is an element in — used by artifact-card edit buttons that
// render identically in the main chat and inside the thread drawer.
function _ecWhich(el){
  return (el && el.closest && el.closest('#threadDrawer')) ? 'thread' : 'main';
}
function _setEditTarget(filename, title, which){
  if(!filename) return;
  which = which || 'main';
  var tgt = { filename: String(filename), title: String(title || filename) };
  if(which === 'thread') _editTargetThread = tgt; else _editTarget = tgt;
  _renderEditChip(which);
  var ci = document.getElementById(which === 'thread' ? 'tci' : 'ci');
  if(ci){
    ci.placeholder = isJa ? ('「'+tgt.title+'」をどう変えますか？')
                          : ('How should I change "'+tgt.title+'"?');
    try{ ci.focus(); }catch(e){}
  }
  try{ showToast(L('「'+tgt.title+'」の修正モード','Editing: '+tgt.title),'ok'); }catch(e){}
}
function _clearEditTarget(which){
  which = which || 'main';
  if(which === 'thread') _editTargetThread = null; else _editTarget = null;
  _renderEditChip(which);
  var ci = document.getElementById(which === 'thread' ? 'tci' : 'ci');
  if(ci) ci.placeholder = (which === 'thread')
    ? (isJa ? 'このスレッドに返信… (Shift+Enter で改行)' : 'Reply in thread… (Shift+Enter for newline)')
    : (isJa ? '何をお願いしますか？ (ファイルや URL もドロップで添付可)' : 'What can I help with?');
}
function _renderEditChip(which){
  which = which || 'main';
  var isThread = which === 'thread';
  var wrap = document.getElementById(isThread ? 'editChipWrapThread' : 'editChipWrap');
  var comp = isThread ? document.getElementById('threadComposer') : document.querySelector('.composer');
  var tgt = isThread ? _editTargetThread : _editTarget;
  if(!wrap) return;
  if(!tgt){
    wrap.style.display='none'; wrap.innerHTML='';
    if(comp) comp.classList.remove('editing');
    return;
  }
  wrap.style.display='flex';
  wrap.innerHTML =
    '<span class="ec-ic">✏️</span>'
    + '<span class="ec-label">'+L('修正対象','EDITING')+'</span>'
    + '<span class="ec-name">'+esc(tgt.title)+'</span>'
    + '<button class="ec-x" onclick="_clearEditTarget(\''+which+'\')" title="'+L('修正をやめる','Stop editing')+'">✕</button>';
  if(comp) comp.classList.add('editing');
}

// ── 📁 Artifact library — every site the user has made, reachable anytime ──
// Solves "I can't find my site": a flat, newest-first, filterable list (the
// chat scroll / summarization can't lose it). Each row → 🔗開く or ✏️編集
// (which sets the edit-target chip). Reads me.artifacts (now html-stripped
// and light — see safe()).
var _ARTIFACT_LIB_CSS = [
  '#artifactLibrary{position:fixed;inset:0;z-index:9992;background:rgba(10,10,12,.5);display:flex;align-items:center;justify-content:center;padding:20px;animation:alIn .2s ease}',
  '@keyframes alIn{from{opacity:0}to{opacity:1}}',
  '.al-panel{width:100%;max-width:480px;max-height:82vh;background:var(--card,#fff);border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.32);font-family:inherit}',
  '.al-hd{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid var(--wire2,#e1dacb)}',
  '.al-title{font-size:15px;font-weight:900;color:var(--text,#1c1917)}',
  '.al-count{font-size:11px;font-weight:700;color:var(--text3,#a8a29e);background:var(--cream2,#f4efe6);padding:2px 8px;border-radius:99px;margin-left:5px}',
  '.al-x{width:32px;height:32px;border-radius:50%;border:0;background:var(--cream2,#f4efe6);color:var(--text3,#a8a29e);font-size:13px;cursor:pointer}',
  '.al-filter{margin:12px 18px 4px;padding:9px 12px;border:1px solid var(--wire2,#e1dacb);border-radius:10px;font-size:13px;font-family:inherit;outline:none}',
  '.al-list{flex:1;overflow-y:auto;padding:8px 12px 14px}',
  '.al-proj{margin-bottom:14px}',
  '.al-proj-hd{display:flex;align-items:center;gap:7px;padding:5px 4px 8px}',
  '.al-proj-nm{font-size:11.5px;font-weight:900;color:var(--text2,#57534e)}',
  '.al-proj-ct{font-size:10px;font-weight:800;color:var(--text3,#a8a29e);background:var(--cream2,#f4efe6);padding:1px 7px;border-radius:99px}',
  '.al-rowwrap{margin-bottom:7px}',
  '.al-row{display:flex;align-items:center;gap:9px;padding:11px 12px;border:1px solid var(--wire,#ece7dd);border-radius:12px;background:var(--card,#fff)}',
  '.al-row-main{flex:1;min-width:0}',
  '.al-row-ti{font-size:13.5px;font-weight:700;color:var(--text,#1c1917);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.al-row-meta{font-size:10.5px;color:var(--text3,#a8a29e);font-family:ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:3px}',
  '.al-open{width:36px;height:33px;border-radius:8px;border:1px solid var(--wire2,#e1dacb);background:var(--cream,#faf6f0);cursor:pointer;flex-shrink:0;font-size:13px}',
  '.al-hist-toggle{height:33px;padding:0 9px;border-radius:8px;border:1px solid var(--wire2,#e1dacb);background:var(--cream,#faf6f0);cursor:pointer;flex-shrink:0;font-size:11px;font-weight:800;color:var(--text2,#57534e)}',
  '.al-hist-toggle.on{background:var(--peach,#fb923c);color:#fff;border-color:transparent}',
  '.al-hist{display:none;margin:6px 0 2px 10px;padding:3px 0 3px 11px;border-left:2px solid var(--peach,#fb923c)}',
  '.al-hist-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 4px;border-bottom:1px dashed var(--wire2,#e1dacb)}',
  '.al-hist-row:last-child{border-bottom:0}',
  '.al-hist-info{font-size:11px;color:var(--text2,#57534e);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.al-hist-info b{color:var(--text,#1c1917)}',
  '.al-hist-op{font-family:ui-monospace,monospace;color:var(--text3,#a8a29e)}',
  '.al-hist-at{color:var(--text3,#a8a29e)}',
  '.al-hist-btn2{flex-shrink:0;padding:6px 10px;border-radius:7px;border:1px solid var(--wire2,#e1dacb);background:var(--card,#fff);color:var(--text2,#57534e);font-size:11px;font-weight:800;cursor:pointer;font-family:inherit}',
  '.al-hist-btn2:hover{background:var(--peach,#fb923c);color:#fff;border-color:transparent}',
  '.al-hist-acts{display:flex;gap:6px;flex-shrink:0}',
  '.al-hist-note{font-size:10px;color:var(--text3,#a8a29e);padding:3px 4px 7px;line-height:1.5}',
  '.al-edit{padding:8px 11px;border-radius:8px;border:1px solid rgba(251,146,60,.34);background:rgba(251,146,60,.12);color:var(--peach-dark,#ea580c);font-size:12px;font-weight:800;cursor:pointer;flex-shrink:0;font-family:inherit}',
  '.al-empty{text-align:center;padding:36px 20px;color:var(--text3,#a8a29e);font-size:13px;line-height:1.75}',
].join('');
function _closeArtifactLibrary(){ var d=document.getElementById('artifactLibrary'); if(d) d.remove(); }
function _alFilter(q){
  q=String(q||'').toLowerCase().trim();
  document.querySelectorAll('#artifactLibrary .al-rowwrap').forEach(function(r){
    r.style.display = (!q || (r.dataset.t||'').indexOf(q)>=0) ? '' : 'none';
  });
  // Hide a project section when none of its rows match the filter.
  document.querySelectorAll('#artifactLibrary .al-proj').forEach(function(p){
    var shown=0;
    p.querySelectorAll('.al-rowwrap').forEach(function(r){ if(r.style.display!=='none') shown++; });
    p.style.display = shown ? '' : 'none';
  });
}
// Expand / collapse a row's inline version-history list.
function _toggleHist(id){
  var el=document.getElementById('al-hist-'+id);
  var btn=document.getElementById('al-histbtn-'+id);
  if(!el) return;
  var open=el.style.display==='block';
  el.style.display=open?'none':'block';
  if(btn) btn.classList.toggle('on',!open);
}
// One artifact row (+ inline version history). `i` is a unique running index
// used to wire up the per-row history toggle.
function _alRowHTML(a,i){
  var url='/generated/'+a.filename;
  var when=String(a.created_at||'').slice(0,10);
  var t=String(a.title||a.filename);
  var tArg=t.replace(/'/g,"\\'");
  var fArg=String(a.filename).replace(/'/g,"\\'");
  var proj=String(a.project||a.title||'');
  var ver=a.version||1;
  var vers=Array.isArray(a.versions)?a.versions:[];
  var hasVers=vers.length>0;
  // versions[] is oldest→newest; show newest first. Each snapshot is the html
  // BEFORE an edit, so versions[k] is artifact-version (ver - (len-k)).
  var histRows='';
  for(var k=vers.length-1;k>=0;k--){
    var v=vers[k]||{};
    var vnum=ver-(vers.length-k);
    var vat=String(v.at||'').slice(0,16).replace('T',' ');
    var vop=v.op?String(v.op):'';
    histRows+='<div class="al-hist-row">'
      + '<div class="al-hist-info"><b>Ver.'+(vnum>0?vnum:'?')+'</b>'
      +   (vop?' <span class="al-hist-op">'+esc(vop)+'</span>':'')
      +   (vat?' <span class="al-hist-at">'+esc(vat)+'</span>':'')
      + '</div>'
      + '<span class="al-hist-acts">'
      +   '<button class="al-hist-btn2" onclick="_openVersionDiff(\''+esc(fArg)+'\','+k+')" title="この版で何が変わったか">'+L('差分','Diff')+'</button>'
      +   '<button class="al-hist-btn2" onclick="_rollbackArtifact(\''+esc(fArg)+'\','+k+')">'+L('この版に戻す','Restore')+'</button>'
      + '</span>'
      + '</div>';
  }
  // History snapshots are capped at 3 — if the artifact has been edited more
  // than that, older versions aren't kept. Note it so "Ver.23〜" doesn't look
  // broken (it just means Ver.1〜22 were dropped by the 3-version cap).
  if(vers.length && (ver - vers.length) > 1){
    histRows = '<div class="al-hist-note">'
      + L('履歴は直近 '+vers.length+' 版のみ保持（Ver.1〜'+(ver-vers.length-1)+' は省略）',
          'Only the last '+vers.length+' versions are kept (Ver.1–'+(ver-vers.length-1)+' dropped)')
      + '</div>' + histRows;
  }
  return '<div class="al-rowwrap" data-t="'+esc((t+' '+proj+' '+(a.thread_label||'')).toLowerCase())+'">'
    + '<div class="al-row">'
    +   '<div class="al-row-main">'
    +     '<div class="al-row-ti">'+esc(t)+'</div>'
    +     '<div class="al-row-meta">Ver.'+ver+' · '+esc(when)+' · '+esc(a.filename)+'</div>'
    +   '</div>'
    +   (hasVers ? '<button class="al-hist-toggle" id="al-histbtn-'+i+'" onclick="_toggleHist('+i+')" title="'+L('バージョン履歴','Version history')+'">🕘 '+vers.length+'</button>' : '')
    +   '<button class="al-open" onclick="_openCodeViewer(\''+esc(fArg)+'\')" title="'+L('コードを見る','View code')+'">📄</button>'
    +   '<button class="al-open" onclick="window.open(\''+esc(url)+'\',\'_blank\')" title="'+L('開く','Open')+'">🔗</button>'
    +   '<button class="al-edit" onclick="_setEditTarget(\''+esc(fArg)+'\',\''+tArg+'\');_closeArtifactLibrary()">✏️ '+L('修正','Edit')+'</button>'
    + '</div>'
    + (hasVers ? '<div class="al-hist" id="al-hist-'+i+'">'+histRows+'</div>' : '')
    + '</div>';
}
// Group label for the artifact library — by origin: the thread it was made
// in, or the chat (resolved to the agent name) for top-level artifacts.
function _artOriginLabel(a){
  if(a && a.thread_id){
    var tl=String(a.thread_label||'').replace(/\s+/g,' ').trim();
    if(tl.length>34) tl=tl.slice(0,34)+'…';
    return '🧵 '+(tl||L('スレッド','Thread'));
  }
  var ag=(a && a.chat_id && typeof agents!=='undefined' && Array.isArray(agents))
    ? agents.find(function(x){ return x && x.id===a.chat_id; }) : null;
  if(ag && ag.name) return '💬 '+String(ag.name);
  return '💬 '+L('メインチャット','Main chat');
}
// Render all artifacts grouped by origin (main chat / thread) sections.
function _alRows(arts){
  if(!arts.length){
    return '<div class="al-empty">'+L('まだ成果物がありません。AI にサイトやツールを作ってもらうと、ここに並びます。',
      'No sites yet — when an AI builds something, it shows up here.')+'</div>';
  }
  var groups={}, order=[];
  arts.forEach(function(a){
    if(!a || !a.filename) return;
    var p=_artOriginLabel(a);
    if(!groups[p]){ groups[p]=[]; order.push(p); }
    groups[p].push(a);
  });
  var idx=0;
  return order.map(function(p){
    var rows=groups[p].map(function(a){ return _alRowHTML(a,idx++); }).join('');
    return '<div class="al-proj">'
      + '<div class="al-proj-hd">'
      +   '<span class="al-proj-nm">'+esc(p)+'</span>'
      +   '<span class="al-proj-ct">'+groups[p].length+'</span>'
      + '</div>'
      + rows
      + '</div>';
  }).join('');
}
function _openArtifactLibrary(){
  _closeArtifactLibrary();
  if(!document.getElementById('artifactLibCss')){
    var st=document.createElement('style'); st.id='artifactLibCss'; st.textContent=_ARTIFACT_LIB_CSS;
    document.head.appendChild(st);
  }
  var arts=(typeof me!=='undefined' && me && Array.isArray(me.artifacts)) ? me.artifacts.slice() : [];
  arts.sort(function(a,b){ return String((b&&b.created_at)||'').localeCompare(String((a&&a.created_at)||'')); });
  var d=document.createElement('div');
  d.id='artifactLibrary';
  d.innerHTML =
    '<div class="al-panel">'
    + '<div class="al-hd">'
    +   '<div class="al-title">📁 '+L('作った成果物','Your sites')+'<span class="al-count">'+arts.length+'</span></div>'
    +   '<button class="al-x" onclick="_closeArtifactLibrary()" aria-label="close">✕</button>'
    + '</div>'
    + (arts.length>8 ? '<input id="alFilter" class="al-filter" placeholder="'+L('絞り込み… (例: task manager)','Filter…')+'" oninput="_alFilter(this.value)">' : '')
    + '<div class="al-list">'+_alRows(arts)+'</div>'
    + '</div>';
  d.onclick=function(e){ if(e.target===d) _closeArtifactLibrary(); };
  document.body.appendChild(d);
  setTimeout(function(){ var f=document.getElementById('alFilter'); if(f) f.focus(); }, 60);
}
// Restore an artifact to an earlier version. With no index → 1-step undo;
// with an index → restore that specific snapshot (newer edits are discarded).
async function _rollbackArtifact(filename, index){
  if(!filename) return;
  var hasIdx=(index!=null);
  var msg=hasIdx
    ? L('「'+filename+'」をこの版に戻しますか？\n（これより新しい編集はすべて取り消されます）',
        'Restore this site to the selected version?\n(Newer edits will be discarded.)')
    : L('「'+filename+'」を 1 つ前の版に戻しますか？\n（最後の編集が取り消されます）',
        'Roll back this site to its previous version?');
  if(!confirm(msg)) return;
  try{
    var payload={filename:filename};
    if(hasIdx) payload.index=index;
    await api('POST','/api/artifacts/rollback',payload);
    showToast(L('戻しました','Restored'),'ok');
    try{
      var meRes=await api('GET','/api/me');
      if(meRes&&meRes.user){ me=meRes.user; if(Array.isArray(me.agents)) agents=me.agents; }
    }catch(e){}
    _openArtifactLibrary();   // re-render with refreshed data
  }catch(e){
    showToast((e&&e.message)||L('戻せませんでした','Rollback failed'),'ng');
  }
}

// ── Artifact code viewer + version diff ───────────────────────────────
// Makes the 5-step pipeline visible: ③格納したコード and ⑤バージョンアップで
// 何が変わったか become inspectable. The AI can no longer change code silently.
var _CODE_VIEW_CSS = [
  '#alCodeModal{position:fixed;inset:0;z-index:9994;background:rgba(10,10,12,.62);display:flex;align-items:center;justify-content:center;padding:20px;animation:alIn .2s ease}',
  '.acm-panel{width:100%;max-width:780px;max-height:86vh;background:var(--card,#fff);border-radius:16px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.36);font-family:inherit}',
  '.acm-hd{display:flex;align-items:center;gap:9px;padding:13px 16px;border-bottom:1px solid var(--wire2,#e1dacb);flex-shrink:0}',
  '.acm-title{font-size:13.5px;font-weight:900;color:var(--text,#1c1917);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.acm-sum{font-size:12px;font-weight:800;font-family:ui-monospace,monospace;flex-shrink:0}',
  '.acm-sum .add{color:#16a34a}',
  '.acm-sum .del{color:#dc2626;margin-left:6px}',
  '.acm-x{width:30px;height:30px;border-radius:50%;border:0;background:var(--cream2,#f4efe6);color:var(--text3,#a8a29e);font-size:13px;cursor:pointer;flex-shrink:0}',
  '.acm-body{flex:1;overflow:auto;background:#1e1b16}',
  '.acm-pre{margin:0;padding:14px 16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.6;color:#e8e0d4;white-space:pre-wrap;word-break:break-word}',
  '.df-line{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word;padding:1px 16px}',
  '.df-add{background:rgba(34,197,94,.17);color:#bbf7d0}',
  '.df-del{background:rgba(239,68,68,.17);color:#fecaca}',
  '.df-ctx{color:#9b9384}',
  '.df-skip{padding:5px 16px;font-size:10.5px;color:#8a8270;background:#171510;font-family:ui-monospace,monospace}',
].join('');
function _closeCodeModal(){ var d=document.getElementById('alCodeModal'); if(d) d.remove(); }
function _codeModalShell(titleHTML, bodyHTML){
  _closeCodeModal();
  if(!document.getElementById('codeViewCss')){
    var st=document.createElement('style'); st.id='codeViewCss'; st.textContent=_CODE_VIEW_CSS;
    document.head.appendChild(st);
  }
  var d=document.createElement('div'); d.id='alCodeModal';
  d.innerHTML='<div class="acm-panel"><div class="acm-hd">'+titleHTML
    +'<button class="acm-x" onclick="_closeCodeModal()" aria-label="close">✕</button></div>'
    +'<div class="acm-body">'+bodyHTML+'</div></div>';
  d.onclick=function(e){ if(e.target===d) _closeCodeModal(); };
  document.body.appendChild(d);
}
// LCS-based line diff. Returns [{t:' '|'+'|'-', v:line}] or null when too big.
function _lineDiff(oldText, newText){
  var a=String(oldText||'').split('\n'), b=String(newText||'').split('\n');
  var n=a.length, m=b.length;
  if(n>4000 || m>4000) return null; // O(n*m) table would be too heavy
  var lcs=[]; for(var i=0;i<=n;i++) lcs.push(new Int16Array(m+1));
  for(var i=n-1;i>=0;i--) for(var j=m-1;j>=0;j--)
    lcs[i][j] = a[i]===b[j] ? lcs[i+1][j+1]+1 : Math.max(lcs[i+1][j], lcs[i][j+1]);
  var out=[], i=0, j=0;
  while(i<n && j<m){
    if(a[i]===b[j]){ out.push({t:' ',v:a[i]}); i++; j++; }
    else if(lcs[i+1][j] >= lcs[i][j+1]){ out.push({t:'-',v:a[i]}); i++; }
    else { out.push({t:'+',v:b[j]}); j++; }
  }
  while(i<n){ out.push({t:'-',v:a[i]}); i++; }
  while(j<m){ out.push({t:'+',v:b[j]}); j++; }
  return out;
}
// Render a unified diff with unchanged runs collapsed (2 lines of context).
function _renderDiff(oldText, newText){
  var d=_lineDiff(oldText, newText);
  if(!d) return { html:'<div class="df-skip">'+L('差分が大きすぎるため表示を省略しました','Diff too large to display')+'</div>', add:0, del:0 };
  var CTX=2, keep=new Array(d.length).fill(false), add=0, del=0;
  for(var i=0;i<d.length;i++){
    if(d[i].t==='+') add++; else if(d[i].t==='-') del++;
    if(d[i].t!==' ') for(var j=Math.max(0,i-CTX);j<=Math.min(d.length-1,i+CTX);j++) keep[j]=true;
  }
  if(!add && !del) return { html:'<div class="df-skip">'+L('差分なし — 内容は同じです','No changes')+'</div>', add:0, del:0 };
  var html='', hidden=0;
  for(var i=0;i<d.length;i++){
    if(keep[i]){
      if(hidden){ html+='<div class="df-skip">… '+hidden+L(' 行 変更なし …',' unchanged …')+'</div>'; hidden=0; }
      var cls=d[i].t==='+'?'df-add':d[i].t==='-'?'df-del':'df-ctx';
      var sign=d[i].t==='+'?'+ ':d[i].t==='-'?'- ':'  ';
      html+='<div class="df-line '+cls+'">'+esc(sign+d[i].v)+'</div>';
    } else hidden++;
  }
  if(hidden) html+='<div class="df-skip">… '+hidden+L(' 行 変更なし …',' unchanged …')+'</div>';
  return { html:html, add:add, del:del };
}
// View an artifact's current full HTML.
// ── Vision review viewer (案B verifier) ─────────────────────────
// Opens a modal showing the screenshot-based AI review's findings for an
// artifact. A "AI に修正してもらう" button consolidates findings into a chat
// message and sends it (one-click apply via the existing edit flow).
function _openVisionReview(filename){
  const art = (me && Array.isArray(me.artifacts))
    ? me.artifacts.find(function(a){ return a && a.filename === filename; }) : null;
  if(!art || !art.vision_review){
    showToast(L('まだ検証結果がありません','No review yet'),'ng'); return;
  }
  const vr = art.vision_review;
  const findings = Array.isArray(vr.findings) ? vr.findings : [];
  // Close any existing modal
  var ex = document.getElementById('visionReviewOverlay'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'visionReviewOverlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,12,.5);z-index:9998;display:flex;align-items:center;justify-content:center;padding:24px;font-family:inherit';
  var rowsHtml = findings.length
    ? findings.map(function(f,i){
        return '<div class="vr-row">'
          + '<div class="vr-row-n">'+(i+1)+'</div>'
          + '<div class="vr-row-body">'
          +   (f.where ? '<div class="vr-where">'+esc(f.where)+'</div>' : '')
          +   '<div class="vr-issue">'+esc(f.issue||'')+'</div>'
          +   (f.fix ? '<div class="vr-fix">→ '+esc(f.fix)+'</div>' : '')
          + '</div>'
          + '</div>';
      }).join('')
    : '<div style="padding:18px;color:var(--text3);font-weight:700;text-align:center">'+L('指摘はありません ✅','No findings — looks clean ✅')+'</div>';
  var fnArg = filename.replace(/'/g,"\\'");
  ov.innerHTML =
    '<div class="vr-modal">'
    +  '<div class="vr-modal-h">'
    +    '<div class="vr-title">✨ '+L('検証AIの指摘','Vision review')+'</div>'
    +    '<div class="vr-meta">'+esc(filename)+(vr.version_at?' · Ver.'+vr.version_at:'')+' · '+findings.length+L('件',' issues')+'</div>'
    +    '<button class="vr-close" onclick="document.getElementById(\'visionReviewOverlay\').remove()">×</button>'
    +  '</div>'
    +  '<div class="vr-modal-body">'+rowsHtml+'</div>'
    +  (findings.length ? '<div class="vr-modal-foot">'
        +  '<button class="vr-apply" onclick="_applyVisionReview(\''+fnArg+'\')">🛠 '+L('AI に全部直してもらう','Have the AI fix all')+'</button>'
        +  '<button class="vr-dismiss" onclick="document.getElementById(\'visionReviewOverlay\').remove()">'+L('閉じる','Close')+'</button>'
        +'</div>' : '')
    + '</div>';
  ov.addEventListener('click', function(e){ if(e.target===ov) ov.remove(); });
  document.body.appendChild(ov);
}
function _applyVisionReview(filename){
  const art = (me && Array.isArray(me.artifacts))
    ? me.artifacts.find(function(a){ return a && a.filename === filename; }) : null;
  if(!art || !art.vision_review) return;
  const findings = Array.isArray(art.vision_review.findings) ? art.vision_review.findings : [];
  if(!findings.length){ showToast(L('指摘はありません','No findings to apply'),'ok'); return; }
  var lines = findings.map(function(f,i){
    return (i+1)+'. ['+(f.where||'')+'] '+(f.issue||'')+(f.fix?' — '+f.fix:'');
  });
  var msg = L('検証AIから以下の指摘が出ました。','The vision review found these issues. ')
    + filename + L(' を edit_artifact で順に直してください。\n\n','— please apply the fixes via edit_artifact, one by one:\n\n')
    + lines.join('\n');
  var ci = document.getElementById('ci') || document.getElementById('msgInput');
  if(ci){ ci.value = msg; try { sendMsg(); } catch(e){} }
  var ov = document.getElementById('visionReviewOverlay'); if(ov) ov.remove();
}
async function _openCodeViewer(filename){
  if(!filename) return;
  _codeModalShell('<div class="acm-title">📄 '+esc(filename)+'</div>',
    '<div class="acm-pre" style="color:#9b9384">'+L('読み込み中…','Loading…')+'</div>');
  try{
    var r=await api('POST','/api/artifacts/inspect',{filename:filename});
    _codeModalShell('<div class="acm-title">📄 '+esc(r.title||filename)+'（Ver.'+(r.version||1)+'）</div>',
      '<pre class="acm-pre">'+esc(String(r.html||''))+'</pre>');
  }catch(e){
    _codeModalShell('<div class="acm-title">📄 '+esc(filename)+'</div>',
      '<div class="acm-pre" style="color:#fecaca">'+esc((e&&e.message)||'failed')+'</div>');
  }
}
// Show what changed in one version step: snapshot k → the next state.
async function _openVersionDiff(filename, k){
  if(!filename) return;
  _codeModalShell('<div class="acm-title">🔍 '+esc(filename)+'</div>',
    '<div class="acm-pre" style="color:#9b9384">'+L('差分を計算中…','Computing diff…')+'</div>');
  try{
    var r=await api('POST','/api/artifacts/inspect',{filename:filename});
    var vs=Array.isArray(r.versions)?r.versions:[];
    if(!vs.length){ _codeModalShell('<div class="acm-title">🔍 '+esc(filename)+'</div>','<div class="df-skip">'+L('バージョン履歴がありません','No version history')+'</div>'); return; }
    if(k<0||k>=vs.length) k=vs.length-1;
    var oldHtml=String(vs[k].html||'');
    var newHtml=(k+1<vs.length)?String(vs[k+1].html||''):String(r.html||'');
    var curVer=r.version||1;
    var vFrom=curVer-(vs.length-k), vTo=vFrom+1;
    var diff=_renderDiff(oldHtml, newHtml);
    var ttl='<div class="acm-title">🔍 Ver.'+(vFrom>0?vFrom:'?')+' → Ver.'+(vTo>0?vTo:'?')+L(' の変更点',' changes')+'</div>'
      +'<div class="acm-sum"><span class="add">+'+diff.add+'</span><span class="del">−'+diff.del+'</span></div>';
    _codeModalShell(ttl, diff.html || '<div class="df-skip">'+L('差分なし','No changes')+'</div>');
  }catch(e){
    _codeModalShell('<div class="acm-title">🔍 '+esc(filename)+'</div>',
      '<div class="acm-pre" style="color:#fecaca">'+esc((e&&e.message)||'failed')+'</div>');
  }
}

// ── 📌 Pinned site — the conversation's locked artifact ───────────────
// current_artifact drifts to "last touched" and lands on stale files in
// messy multi-artifact chats. A pin lets the user lock "this is THE site",
// shown in a thread-top bar; the server prioritises it for edit targeting.
function _pinBarHTML(ag){
  if(!ag || !ag.pinned_artifact) return '';
  var fn = String(ag.pinned_artifact);
  var art = (typeof me!=='undefined' && me && Array.isArray(me.artifacts))
    ? me.artifacts.find(function(a){ return a && a.filename === fn; }) : null;
  var title = art ? String(art.title || fn) : fn;
  var ver = art ? ('Ver.'+(art.version||1)) : '';
  var fArg = fn.replace(/'/g,"\\'");
  return '<div class="pin-bar">'
    + '<span class="pin-ic">📌</span>'
    + '<div class="pin-main">'
    +   '<div class="pin-name">'+esc(title)+(ver?' <span class="pin-ver">'+ver+'</span>':'')+'</div>'
    +   '<div class="pin-sub">'+L('このチャットの編集対象に固定中','Pinned as this chat’s site')+'</div>'
    + '</div>'
    + '<button class="pin-b" onclick="window.open(\'/generated/'+esc(fArg)+'\',\'_blank\')" title="'+L('開く','Open')+'">🔗</button>'
    + '<button class="pin-b" onclick="_openCodeViewer(\''+fArg+'\')" title="'+L('コードを見る','View code')+'">📄</button>'
    + '<button class="pin-b" onclick="_unpinArtifact()" title="'+L('固定を解除','Unpin')+'">✕</button>'
    + '</div>';
}
async function _pinArtifact(filename){
  if(!filename || !activeId) return;
  try{
    await api('POST','/api/agents/'+activeId+'/pin-artifact',{filename:filename});
    var ag=(agents||[]).find(function(a){return a.id===activeId;});
    if(ag) ag.pinned_artifact=String(filename);
    showToast(L('このサイトを固定しました','Pinned this site'),'ok');
    try{ if(ag) renderMsgs(ag); }catch(e){}
    if(window._activeThreadParent){ try{ _renderThreadDrawer(); }catch(e){} }
  }catch(e){ showToast((e&&e.message)||L('固定に失敗しました','Pin failed'),'ng'); }
}
async function _unpinArtifact(){
  if(!activeId) return;
  try{
    await api('POST','/api/agents/'+activeId+'/pin-artifact',{filename:''});
    var ag=(agents||[]).find(function(a){return a.id===activeId;});
    if(ag) ag.pinned_artifact=null;
    showToast(L('固定を解除しました','Unpinned'),'ok');
    try{ if(ag) renderMsgs(ag); }catch(e){}
    if(window._activeThreadParent){ try{ _renderThreadDrawer(); }catch(e){} }
  }catch(e){ showToast((e&&e.message)||'failed','ng'); }
}

// Split the composer's attachments into the two arrays the chat API expects.
function _attachmentPayload(which){
  const imgs = [], texts = [];
  _pendOf(which||'main').forEach(att => {
    if(att.kind === 'url-loading' || att.kind === 'text-loading') return; // skip in-flight fetches/parses
    if(att.kind === 'text' || att.kind === 'url'){
      texts.push({
        kind: att.kind,
        name: att.name || (att.kind === 'url' ? 'page' : 'file'),
        source: att.source || '',
        text: att.text || '',
      });
    } else if(att.b64){
      imgs.push({ type: att.type, b64: att.b64, name: att.name });
    }
  });
  return { imgs, texts };
}

async function sendMsg(){
  // AI 応答中（メインチャット）は新規送信をブロック。送信ボタンは⏹停止に
  // 変わっているので、ここに到達するのは Enter キー経由のみ。
  if(_chatStreamCtrl){
    // 自己修復: 制御が 4 分以上居座っている = 前ターンの接続がハングした残骸。
    // 中断・解除してロックアウトを解く（もう一度送信すればクリーンに通る）。
    if(Date.now() - (_chatStreamCtrl._startedAt || 0) > 240000){
      try { _chatStreamCtrl.abort(); } catch(e){}
      _chatStreamCtrl = null;
      try { _setChatStreaming(false); } catch(e){}
      showToast(L('前の応答が固まっていたため解除しました。もう一度送信してください。','Cleared a stuck response — please send again.'),'ng');
      return;
    }
    showToast(L('AI が応答中です。完了するか ⏹ で停止してください','AI is responding — wait or press ⏹ to stop'),'ng');
    return;
  }
  const ci=document.getElementById('ci')||document.getElementById('msgInput');
  const text=ci.value.trim();
  // Block if a URL is still loading
  if(_pendingImgs.some(a => a.kind === 'url-loading')){
    showToast(isJa?'URL の読み込み完了をお待ちください':'Wait for URL to finish loading','ng');
    return;
  }
  const hasAtt = _pendingImgs.length > 0;
  if(!text && !hasAtt) return;

  // Slash-command hook (only intercepts when in a Team chat AND user is host)
  // Examples:
  //   /add a researcher who watches competitor pricing
  //   /メンバー追加 SEOライター
  //   add member: SEO writer who watches competitors
  if(text){
    var _agSlash = agents.find(function(a){return a.id===activeId;});
    if(_agSlash && _agSlash.is_team && _agSlash.host_id === me?.id){
      var _addMatch = text.match(/^\s*(?:\/add(?:[\-_]?member)?|\/(?:メンバー|member)(?:[\-_]?追加)?|add\s+(?:a\s+)?(?:new\s+)?member\s*[:：]?|メンバー\s*追加\s*[:：]?)\s*(.*)$/i);
      if(_addMatch){
        var _addDesc = (_addMatch[1]||'').trim();
        ci.value = '';
        exTA(ci);
        if(!_addDesc){
          showToast(L('追加するメンバーの説明を一緒に書いてください (例: "/add SEO担当のライター")','Add a description after the command (e.g. "/add SEO writer")'),'ng');
          openAddTeamMember(_agSlash.id);
          return;
        }
        // Inline confirmation in chat: add to history + call API
        var ts = now();
        _agSlash.history = _agSlash.history || [];
        _agSlash.history.push({role:'user', content:text, time:ts});
        _agSlash.history.push({role:'system', content:'⏳ AI が新しいメンバーを設計中…', time:ts});
        renderMsgs(_agSlash);
        try {
          var r = await api('POST','/api/teams/'+_agSlash.id+'/add-member', { description: _addDesc, lang: currentLang });
          if(r && r.agent){
            try {
              var meRes = await api('GET','/api/me');
              if(meRes && meRes.user){ me = meRes.user; if(Array.isArray(me.agents)) agents = me.agents; }
            } catch(e){}
            // Replace the "designing..." line with the success line
            var teamLatest = (agents||[]).find(function(a){return a.id===_agSlash.id;}) || _agSlash;
            // The server already pushed a system message; trust the refreshed history.
            renderAgList();
            try { openAgent(teamLatest.id); } catch(e){}
            showToast(L((r.agent.name||'New member')+' をチームに追加しました', (r.agent.name||'New member')+' joined the team'),'ok');
          }
        } catch(e){
          if(e && e.upgrade_required){ _showUpgradeToast(e); }
          else { showToast((e && e.message) || L('追加に失敗しました','Failed to add member'),'ng'); }
          // Repaint to remove the "designing..." line
          var t2 = (agents||[]).find(function(a){return a.id===_agSlash.id;}) || _agSlash;
          if(t2.history && t2.history.length){
            t2.history = t2.history.filter(function(h){ return !(h.role==='system' && h.content && h.content.indexOf('AI が新しいメンバーを設計中')>=0); });
          }
          renderMsgs(t2);
        }
        document.getElementById('sndBtn').disabled=false;
        return;
      }
    }
  }
  // Pause group polling while we send so the optimistic local message + AI
  // reply aren't transiently overwritten by a stale server snapshot.
  _groupPollPaused = true;
  const ag=agents.find(a=>a.id===activeId); if(!ag)return;
  var _freeLeft=(me.usage_count||0)<10; if(!_freeLeft&&(me.balance_jpy||0)<=0){ showToast(isJa?'残高が不足しています。チャージしてください':'Insufficient balance. Please add credits.','ng'); openCharge(); return; }

  // Snapshot attachments and reset the composer
  const snap = _pendingImgs.slice();
  const split = _attachmentPayload();
  const imgs = split.imgs;        // image/pdf base64 entries (for /api/chat)
  const texts = split.texts;      // text/url entries (for /api/chat)
  _pendingImgs = [];
  renderImgPreview();

  ci.value=''; exTA(ci);
  document.getElementById('sndBtn').disabled=true;
  if(!ag.history)ag.history=[];

  // ユーザーメッセージ（添付プレビュー含む）
  // Stable client-side ID — used as the thread parent for the AI's reply so
  // Slack-style threading shows "💬 N 件の返信" pill under this msg.
  const _localUserMsgId = 'u_'+Math.random().toString(36).slice(2,10);
  const userMsg = {id:_localUserMsgId, role:'user', content:text, time:now()};
  // For local rendering: unify image+pdf+text+url into one display array
  if(snap.length > 0){
    userMsg.images = snap.map(att => ({
      url: att.url,
      name: att.name,
      type: att.type,
      kind: att.kind || (att.type === 'application/pdf' ? 'pdf' : 'image'),
      source: att.source || '',
    }));
  }
  // Stash on window so the streaming-bubble push (below in _sendMsgStream)
  // can attach it as thread_parent_id on the assistant placeholder.
  window._lastTopLevelUserMsgId = _localUserMsgId;
  ag.history.push(userMsg);
  renderMsgs(ag, true);   // user just sent → snap to bottom

  // Append thinking indicator
  var inner=document.getElementById('msgsInner');
  const tEl=document.createElement('div');
  tEl.className='m a'; tEl.id='thinking';
  var _genLabel = ag.chrome_enabled
    ? (isJa ? 'ブラウジング中…' : 'Browsing…')
    : (ag.sheets_enabled ? (isJa ? 'スプレッドシート操作中…' : 'Working on Sheets…')
    : (isJa ? '考えています…' : 'Thinking…'));
  var _thinkLabel = '<div class="gen-indicator">'
    + '<div class="gen-logo"></div>'
    + '<div class="gen-text">' + _genLabel + '</div>'
    + '</div>';
  tEl.innerHTML='<div class="m-meta"><div class="m-av">'+_avHTML(ag.avatar)+'</div><span class="m-name">'+esc(ag.name)+'</span></div><div class="m-body">'+_thinkLabel+'</div>';
  if(inner) inner.appendChild(tEl);
  _scrollMsgsToEnd(true);
  // /search slash-command: prepend Web search results as context
  let outboundText = text;
  const slashCtx = await _runSlashCommand(text);
  if(slashCtx){
    outboundText = slashCtx;
    // Update the last user message in history to show what we actually sent
    // (keep the original /search command visible to the user for clarity)
  }

  // Streaming path: now supported for tools-enabled agents too (server emits
  // delta / tool_call / tool_result events as the loop progresses).
  const canStream = true;
  try{
    if(canStream){
      await _sendMsgStream(ag, outboundText, imgs, texts);
    } else {
      // 既存の一括取得パス
      const payload = {message: outboundText};
      if(imgs.length > 0) payload.images = imgs;
      if(texts.length > 0) payload.texts = texts;
      const r=await api('POST',`/api/chat/${activeId}`,payload);
      ag.history.push({role:'assistant',content:r.reply,time:now(),tool_log:r.tool_log||null});
      me.balance_jpy=r.balance_jpy;
      me.usage_count=(me.usage_count||0)+1;
      updateBalance();
    }
  }catch(e){
    ag.history.push({role:'assistant',content:'エラー: '+e.message,time:now(),is_error:true});
    if(e.message.includes('クレジット')||e.message.includes('残高')){ openCharge(); }
  }
  document.getElementById('thinking')?.remove();
  renderMsgs(ag);
  document.getElementById('sndBtn').disabled=false;
  ci.focus();
  // Refresh group poll signature to match what we now have locally so the
  // next tick doesn't immediately re-fetch and overwrite.
  if(ag.is_group){
    _groupPollSig = _historySignature(ag.history || []);
  }
  // Fire-and-forget follow-up suggestion chips for solo chats. Skipped for
  // groups (signal-to-noise too low + cost adds up across speakers).
  if(!ag.is_group){ _fetchFollowupSuggestions(ag); }
  _groupPollPaused = false;
}

// ── Chat-stream stop button (Claude.ai-style) ───────────────────
// Module-level controller so the send button (now reused as a stop
// button while streaming) can abort the in-flight fetch.
var _chatStreamCtrl = null;

function _setChatStreaming(on){
  // Track streaming agents in a set so the sidebar shows a dot next to any
  // agent currently receiving a stream — in EITHER main chat OR a thread (or
  // both concurrently). Pin the agentId at stream START so a chat-switch
  // mid-stream still clears the right agent at stream END.
  window._streamingAgents = window._streamingAgents || new Set();
  if(on){
    window._chatStreamingAgentId = activeId;
    if(activeId) window._streamingAgents.add(activeId);
  } else {
    var _aid = window._chatStreamingAgentId;
    window._chatStreamingAgentId = null;
    // Only clear from the set if no other channel (thread) is still streaming
    // for the same agent.
    if(_aid && _aid !== window._threadStreamingAgentId){
      window._streamingAgents.delete(_aid);
    }
  }
  // Back-compat: keep _streamingAgentId pointing to any currently-streaming
  // agent so existing checks (renderAgItem) still light up the dot.
  window._streamingAgentId = window._streamingAgents.size
    ? window._streamingAgents.values().next().value : null;
  try { renderAgList(); } catch(_){}
  const btn = document.getElementById('sndBtn');
  if(!btn) return;
  // CRITICAL: always re-enable the button. sendMsg() disables it just before
  // _sendMsgStream() runs — if we don't clear that, the user can SEE the stop
  // icon but can't click it (button is greyed out). Whenever streaming flips,
  // the button must accept clicks (either to stop, or to send again).
  btn.disabled = false;
  if(on){
    btn.classList.add('streaming');
    btn.title = '生成を停止 (Stop)';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="1.6"/></svg>';
    btn.onclick = stopChatStream;
  } else {
    btn.classList.remove('streaming');
    btn.title = '送信';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
    btn.onclick = sendMsg;
  }
}

function stopChatStream(){
  if(_chatStreamCtrl){
    try { _chatStreamCtrl.abort(); } catch(e){}
  }
}

// ── Thread composer streaming state — mirrors _setChatStreaming for the
//    thread drawer's own send button (#tSndBtn). While the thread AI is
//    responding the button becomes a ⏹ stop button. ──
var _threadStreamCtrl = null;
function _setThreadStreaming(on){
  // Mirror _setChatStreaming. Tracks the thread channel separately so the
  // dot stays lit while either main OR thread is streaming for the agent.
  window._streamingAgents = window._streamingAgents || new Set();
  if(on){
    window._threadStreamingAgentId = activeId;
    if(activeId) window._streamingAgents.add(activeId);
  } else {
    var _aid = window._threadStreamingAgentId;
    window._threadStreamingAgentId = null;
    if(_aid && _aid !== window._chatStreamingAgentId){
      window._streamingAgents.delete(_aid);
    }
  }
  window._streamingAgentId = window._streamingAgents.size
    ? window._streamingAgents.values().next().value : null;
  try { renderAgList(); } catch(_){}
  var btn = document.getElementById('tSndBtn');
  if(!btn) return;
  btn.disabled = false;
  if(on){
    btn.classList.add('streaming');
    btn.title = L('生成を停止 (Stop)','Stop');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="1.6"/></svg>';
    btn.onclick = stopThreadStream;
  } else {
    btn.classList.remove('streaming');
    btn.title = L('送信','Send');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
    btn.onclick = _sendThreadReply;
  }
}
function stopThreadStream(){
  if(_threadStreamCtrl){
    try { _threadStreamCtrl.abort(); } catch(e){}
  }
}

/**
 * SSE streaming chat. Pushes a placeholder assistant bubble, then patches
 * its content as text deltas arrive. Updates balance + final reply on 'done'.
 * Falls back to throwing on error so the caller's catch path runs.
 */
// ── Turn-status chip ───────────────────────────────────────────────────
// A persistent "AI is working" indicator shown for the WHOLE agentic turn
// (text streaming + tool calls + the now-slower render verification), in
// both the main chat and the thread drawer, with a live elapsed-seconds
// counter so even silent server-side waits never look frozen.
var _turnStatus = { el:null, timer:null, startedAt:0, phase:'' };
function _toolLabel(name){
  var M = {
    read_artifact:['🔍 サイトの中身を確認中','🔍 Reading the site'],
    create_artifact:['🎨 サイトを作成・検証中','🎨 Building & checking'],
    edit_artifact:['✏️ サイトを編集・検証中','✏️ Editing & checking'],
    generate_image:['🖼 画像を生成中','🖼 Generating image'],
    edit_image:['🖼 画像を編集中','🖼 Editing image'],
    generate_video:['🎬 動画を生成中','🎬 Generating video'],
    generate_pdf:['📄 PDF を作成中','📄 Building PDF'],
    generate_chart:['📊 グラフを描画中','📊 Drawing chart'],
    web_search:['🔍 Web を検索中','🔍 Searching the web'],
    web_fetch:['🌐 ページを取得中','🌐 Fetching page'],
    web_screenshot:['📸 ページを撮影中','📸 Screenshotting'],
    send_email:['📧 メールを送信中','📧 Sending email'],
    notify_slack:['💬 Slack に投稿中','💬 Posting to Slack'],
    ga4_query:['📊 アクセス解析中','📊 Analyzing traffic'],
    sheets_read:['📊 シートを読込中','📊 Reading sheet'],
    sheets_write:['📊 シートに書込中','📊 Writing sheet'],
    sheets_append:['📊 シートに追記中','📊 Appending to sheet'],
  };
  var hit = M[name];
  if(hit) return isJa ? hit[0] : hit[1];
  return isJa ? ('🔧 '+String(name||'ツール')+' を実行中') : ('🔧 Running '+String(name||'tool'));
}
function _turnStatusTick(){
  if(!_turnStatus.el) return;
  var sec = Math.floor((Date.now()-_turnStatus.startedAt)/1000);
  if(sec > 600){ _turnStatusEnd(); return; } // safety: no real turn runs this long
  var lab = _turnStatus.el.querySelector('.ts-label');
  var s = _turnStatus.el.querySelector('.ts-sec');
  if(lab) lab.textContent = _turnStatus.phase;
  if(s) s.textContent = sec + (isJa?' 秒':'s');
}
function _turnStatusStart(){
  _turnStatusEnd(); // clear any stale chip first
  var el = document.createElement('div');
  el.id = 'turnStatus'; el.className = 'turn-status';
  el.innerHTML = '<span class="ts-dot"></span><span class="ts-label"></span><span class="ts-sec"></span>';
  document.body.appendChild(el);
  _turnStatus.el = el;
  _turnStatus.startedAt = Date.now();
  _turnStatus.phase = isJa ? '考え中…' : 'Thinking…';
  _turnStatusTick();
  _turnStatus.timer = setInterval(_turnStatusTick, 1000);
}
function _turnStatusPhase(label){
  if(!_turnStatus.el) _turnStatusStart();
  if(label) _turnStatus.phase = label;
  _turnStatusTick();
}
function _turnStatusEnd(){
  if(_turnStatus.timer){ clearInterval(_turnStatus.timer); _turnStatus.timer=null; }
  if(_turnStatus.el){ _turnStatus.el.remove(); _turnStatus.el=null; }
  _turnStatus.phase=''; _turnStatus.startedAt=0;
}
// Map an SSE event → a turn-status phase. Shared by main + thread SSE loops.
function _turnStatusFromEvent(evType, obj){
  if(evType==='delta' || evType==='huddle_summary_delta') _turnStatusPhase(isJa?'回答を生成中…':'Writing response…');
  else if(evType==='thinking') _turnStatusPhase(isJa?'考え中…':'Thinking…');
  else if(evType==='tool_call') _turnStatusPhase(_toolLabel(obj && obj.name));
  else if(evType==='tool_result') _turnStatusPhase(isJa?'次のステップを考え中…':'Thinking…');
  else if(evType==='plan_status') _turnStatusPhase(isJa?'プランを実行中…':'Running plan…');
}

// After a turn that created/edited an artifact, refresh me.artifacts so the
// in-chat cards show the correct "Ver.N" (the version bumped server-side).
function _refreshArtifactsIfNeeded(toolLog, ag, _retried){
  try{
    var tl = toolLog || [];
    if(!tl.some(function(t){ return t && /artifact/.test(String(t.name||'')); })) return;
    api('GET','/api/me').then(function(r){
      if(r && r.user && Array.isArray(r.user.artifacts)){
        me.artifacts = r.user.artifacts;
        try{ renderMsgs(ag); }catch(e){}
        if(window._activeThreadParent){ try{ _renderThreadDrawer(); }catch(e){} }
      }
    }).catch(function(e){
      // Don't swallow silently — a failed refresh leaves cards without their
      // Ver.N badge. Log it, and retry once after a short delay.
      console.warn('[artifacts] /api/me refresh failed', e && e.message);
      if(!_retried){
        setTimeout(function(){ _refreshArtifactsIfNeeded(toolLog, ag, true); }, 2500);
      }
    });
  }catch(e){}
}

async function _sendMsgStream(ag, text, imgs, texts){
  const payload = { message: text, stream: true };
  if(imgs && imgs.length > 0) payload.images = imgs;
  if(texts && texts.length > 0) payload.texts = texts;
  // Edit-target chip active → tell the server to route this to edit that exact file.
  if(_editTarget && _editTarget.filename) payload.edit_target = _editTarget;
  // NOTE: the MAIN composer always posts a NEW top-level message. Thread
  // replies go through the drawer's own composer (_sendThreadReply) — see
  // _renderThreadDrawer. (The earlier "main composer becomes thread input"
  // experiment was reverted: users expect the input INSIDE the thread
  // drawer, like Slack.)
  // Team Huddle: when toggle is ON for this agent, server runs the
  // multi-agent dialogue path. Auto-disable the toggle after sending so
  // each huddle is opt-in.
  if(window._huddleOn && window._huddleOn[ag.id] && ag.is_team){
    payload.huddle = true;
    payload.huddle_rounds = 2;
    window._huddleOn[ag.id] = false;
    _updateChromeTool(ag);
  }
  // If a previous SSE is still running, abort it cleanly before starting
  // a new one. Without this, the old request keeps streaming in the
  // background and its done/error event eventually patches the wrong bubble
  // (the latest one, via ag.history[ag.history.length-1]) — leaving the
  // ACTUAL old bubble stuck in "🍑 生成中…" forever.
  if(_chatStreamCtrl){
    try { _chatStreamCtrl.abort(); } catch(e){}
    _chatStreamCtrl = null;
  }
  // Per-call AbortController so the user can hit ⏹ to stop mid-stream.
  const ctrl = new AbortController();
  _chatStreamCtrl = ctrl;
  _chatStreamCtrl._startedAt = Date.now();
  _setChatStreaming(true);
  let _aborted = false;
  // Inactivity watchdog: if the SSE stream goes fully silent for too long the
  // connection is dead/hung — abort so the finally runs and the UI never sits
  // on "生成中" forever. The server sends keepalives, so a healthy turn keeps
  // resetting this; only a truly dead connection trips it.
  let _idleTimer = null, _idleHung = false;
  function _bumpIdle(){
    if(_idleTimer) clearTimeout(_idleTimer);
    _idleTimer = setTimeout(function(){ _idleHung = true; try { ctrl.abort(); } catch(e){} }, 90000);
  }
  function _clearIdle(){ if(_idleTimer){ clearTimeout(_idleTimer); _idleTimer = null; } }
  let res;
  try {
    res = await fetch(API + '/api/chat/' + activeId, {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
  } catch(e){
    _chatStreamCtrl = null; _setChatStreaming(false);
    if(e && e.name === 'AbortError') return; // user stopped before headers
    throw e;
  }
  const ct = (res.headers.get('content-type')||'').toLowerCase();
  // If server didn't honor stream (shouldn't happen but just in case)
  if(!ct.includes('text/event-stream')){
    if(!res.ok){
      let msg='通信エラー';
      try{ const d=await res.json(); msg=d.error||msg; }catch(e){}
      throw new Error(msg);
    }
    const data = await res.json();
    ag.history.push({role:'assistant',content:data.reply||'',time:now(),tool_log:data.tool_log||null});
    if(data.balance_jpy!==undefined) me.balance_jpy=data.balance_jpy;
    me.usage_count=(me.usage_count||0)+1;
    updateBalance();
    return;
  }

  // Remove thinking dots.
  var thinking=document.getElementById('thinking'); if(thinking) thinking.remove();
  // ── Strict Slack-style: **AI の返信は必ず thread に入れる** ──
  //   優先順位で thread_parent_id を決定:
  //     1. payload.thread_parent_id (drawer 内から返信)
  //     2. window._lastTopLevelUserMsgId (今のターンで push 済みの user msg)
  //     3. history を末尾から探して最新の top-level user msg id
  //   どうしても見つからない場合のみ null (= 初回 / 何もない状態のレア edge)
  let _autoParent = payload.thread_parent_id || window._lastTopLevelUserMsgId || null;
  if(!_autoParent && Array.isArray(ag.history)){
    // 末尾から逆走して最新の top-level user msg を探す
    for(let _i = ag.history.length - 1; _i >= 0; _i--){
      const _hm = ag.history[_i];
      if(_hm && _hm.role === 'user' && !_hm.thread_parent_id && _hm.id){
        _autoParent = _hm.id;
        break;
      }
    }
  }
  ag.history.push({role:'assistant', content:'', time:now(), streaming:true, thread_parent_id: _autoParent});
  const streamIdx = ag.history.length - 1;
  _turnStatusStart();
  // 画面幅ガードは廃止 — モバイルでも drawer を開く (= AI 返信は必ず thread 内)。
  // モバイルでは drawer がフルスクリーンに広がる CSS 設定があるはず (確認要)。
  if(_autoParent){
    try { _openThread(_autoParent); } catch(e){}
  }
  // Always re-render main so the user message + (live) thread pill appear.
  renderMsgs(ag);

  // Find the live bubble body once for in-place updates.
  // Strict Slack-style threading: if the streaming msg has thread_parent_id
  // AND the drawer is open with that parent, the bubble lives in the drawer
  // — write deltas there. Otherwise (mobile flat / pre-threading legacy)
  // fall back to the main timeline's last assistant bubble.
  function _findLiveBubble(){
    const m = ag.history[streamIdx];
    const parent = m && m.thread_parent_id;
    if(parent && window._activeThreadParent === parent){
      const dBody = document.getElementById('threadDrawerBody');
      if(dBody){
        const ds = dBody.querySelectorAll('.m.a');
        const el = ds[ds.length - 1];
        if(el) return el;
      }
    }
    const inner = document.getElementById('msgsInner');
    const bs = inner ? inner.querySelectorAll('.m.a') : [];
    return bs[bs.length - 1];
  }
  var liveEl = _findLiveBubble();
  var liveBody = liveEl ? liveEl.querySelector('.m-body') : null;
  if(liveBody){
    // Show the polished generating indicator until the first delta arrives.
    liveBody.innerHTML = '<div class="gen-indicator"><div class="gen-logo"></div><div class="gen-text">' + (isJa ? '生成中…' : 'Generating…') + '</div></div>';
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let acc = '';
  let lastRender = 0;
  let errorMsg = null;
  // Thinking-state escalator. As time passes without any tool / delta event,
  // we swap the indicator text from "考えています…" → "🔎 詳しく調べています…" →
  // "⚙️ 複雑な処理中…". Makes the agent feel responsive even on slow turns.
  let _thinkStartedAt = Date.now();
  let _thinkTimer = null;
  const _agName = (ag && ag.name) || (isJa?'AI':'AI');
  const _thinkStages = isJa ? [
    { at:0,    text:'考えています…' },
    { at:4000, text:_agName + ' が深く考えています…' },
    { at:12000,text:'🔎 詳しく調べています…' },
    { at:24000,text:'⚙️ 複雑な処理中… (もう少しお待ちください)' },
  ] : [
    { at:0,    text:'Thinking…' },
    { at:4000, text:_agName + ' is thinking deeply…' },
    { at:12000,text:'🔎 Going deeper…' },
    { at:24000,text:'⚙️ Complex task — almost there' },
  ];
  function _renderThinking(){
    if(!liveBody || acc || (ag.history[streamIdx] && ag.history[streamIdx].tool_log && ag.history[streamIdx].tool_log.length)) return;
    const elapsed = Date.now() - _thinkStartedAt;
    let label = _thinkStages[0].text;
    for(const s of _thinkStages){ if(elapsed >= s.at) label = s.text; }
    liveBody.innerHTML = '<div class="gen-indicator"><div class="gen-logo"></div><div class="gen-text">' + label + '</div></div>';
  }
  function _stopThink(){ if(_thinkTimer){ clearInterval(_thinkTimer); _thinkTimer = null; } }

  _bumpIdle();
  try { while(true){
    let value, done;
    try { ({value, done} = await reader.read()); }
    catch(e){
      if(e && e.name === 'AbortError'){ _aborted = true; break; }
      throw e;
    }
    _bumpIdle();
    if(done) break;
    buf += decoder.decode(value, {stream:true});
    let i;
    while((i = buf.indexOf('\n\n')) >= 0){
      const evt = buf.slice(0, i); buf = buf.slice(i+2);
      let evType='message', dataStr='';
      for(const line of evt.split('\n')){
        if(line.startsWith('event:')) evType = line.slice(6).trim();
        else if(line.startsWith('data:')) dataStr = line.slice(5).trim();
      }
      if(!dataStr) continue;
      let obj=null; try{ obj=JSON.parse(dataStr); }catch(e){ continue; }
      _turnStatusFromEvent(evType, obj);
      if(evType === 'delta'){
        // reset=true → the server retried mid-stream and is re-sending the
        // answer from scratch; discard partial text so the bubble doesn't
        // show duplicated content.
        if(obj.reset){ acc = ''; }
        acc += obj.text || '';
        _stopThink();
        // New text arrived — clear the "next-step thinking" flag set by
        // tool_result / thinking events.
        if(ag.history[streamIdx]) ag.history[streamIdx]._streamThinking = false;
        // Throttle DOM updates to ~30fps
        const nowT = Date.now();
        if(nowT - lastRender > 32 && liveBody){
          liveBody.innerHTML = _renderStreamingBody(acc, ag.history[streamIdx].tool_log, false);
          lastRender = nowT;
          _scrollMsgsToEnd();
        }
      } else if(evType === 'thinking'){
        // Server about to call AI for an iteration. Kick off the escalator so
        // the indicator text deepens as the wait stretches.
        if(liveBody && !acc){
          _thinkStartedAt = Date.now();
          _renderThinking();
          _stopThink();
          _thinkTimer = setInterval(_renderThinking, 1000);
        } else if(liveBody && acc && (obj.iter || 0) >= 1){
          // iter >= 1: we already have text in the bubble, but the server is
          // about to call AI again for the next iteration (non-streaming, can
          // take 5-30s). Without an indicator the bubble looks frozen.
          ag.history[streamIdx]._streamThinking = true;
          liveBody.innerHTML = _renderStreamingBody(acc, ag.history[streamIdx].tool_log, true);
          _scrollMsgsToEnd();
        }
      } else if(evType === 'tool_call'){
        _stopThink();
        // Tool requested by AI (about to execute). Track in tool_log + render.
        ag.history[streamIdx].tool_log = ag.history[streamIdx].tool_log || [];
        ag.history[streamIdx].tool_log.push({
          name: obj.name, input: obj.input || {}, ok: null, _pending: true,
        });
        // Tool call means AI emitted a tool_use block — no longer "thinking
        // about next step", it's running a tool now.
        ag.history[streamIdx]._streamThinking = false;
        if(liveBody) liveBody.innerHTML = _renderStreamingBody(acc, ag.history[streamIdx].tool_log, false);
        _scrollMsgsToEnd();
      } else if(evType === 'tool_result'){
        // Tool finished — patch the latest pending entry with the same name.
        const log = ag.history[streamIdx].tool_log || [];
        for(let k=log.length-1; k>=0; k--){
          if(log[k]._pending && log[k].name === obj.name){
            log[k] = { ...obj, _pending: false };
            break;
          }
        }
        // Keep me.artifacts in sync with edit/create results so the Ver.N
        // badge updates without a page reload. We push on edit too (not just
        // create) — if the local `me.artifacts` array was loaded BEFORE this
        // artifact existed (e.g. created in a different tab, or a team-mate's
        // session), the edit's filename won't have an entry to update and the
        // badge would silently stay at 1.
        if((obj.name === 'edit_artifact' || obj.name === 'create_artifact') && obj.filename && obj.version != null){
          try {
            me = me || {};
            if(!Array.isArray(me.artifacts)) me.artifacts = [];
            const _hit = me.artifacts.find(function(a){ return a && a.filename === obj.filename; });
            if(_hit){
              _hit.version = obj.version;
              if(obj.title)  _hit.title = obj.title;
              if(obj.url)    _hit.url   = obj.url;
              if(!_hit.chat_id) _hit.chat_id = ag.id;
            } else {
              // ダッシュボードが artifact を正しく拾えるよう chat_id / url /
              // created_at を必ず埋める (= 旧実装はこれらが欠落していて
              // 「クリックしても何も出ない」「サイトに紐づかない」の原因)。
              me.artifacts.push({
                filename: obj.filename,
                version: obj.version,
                title: obj.title || '',
                url: obj.url || ('/generated/' + obj.filename),
                chat_id: ag.id,
                created_at: new Date().toISOString(),
              });
            }
          } catch(_){}
        }
        // After tool result, the server will fire `thinking` for iter+1.
        // Pre-emptively show the next-step indicator so there's no gap.
        ag.history[streamIdx]._streamThinking = true;
        if(liveBody) liveBody.innerHTML = _renderStreamingBody(acc, ag.history[streamIdx].tool_log, true);
        _scrollMsgsToEnd();
      } else if(evType === 'skill_evolved'){
        // Agent leveled up — show a 🌱 floating card + toast. Stash on the
        // streaming bubble so renderMsgs can re-display on re-render.
        const tierEmoji = obj.tier === '達人' ? '🌳' : obj.tier === '習熟' ? '🌿' : '🌱';
        const tierLabel = obj.tier === '達人' ? '達人' : obj.tier === '習熟' ? '習熟' : '入門';
        showToast(tierEmoji+' '+(obj.agent_name||'AI')+' が「'+(obj.skill_label||obj.skill_id)+'」を'+tierLabel+'しました ('+obj.count+' 回使用)', 'ok');
        // Attach to bubble so it's persisted in history
        ag.history[streamIdx].evolution_events = ag.history[streamIdx].evolution_events || [];
        ag.history[streamIdx].evolution_events.push(obj);
        // Trigger sidebar refresh so the agent name might show level badge later
        try { renderAgList(); } catch(e){}
      } else if(evType === 'done'){
        _stopThink();
        ag.history[streamIdx].content = obj.reply || acc;
        ag.history[streamIdx].streaming = false;
        ag.history[streamIdx]._streamThinking = false;
        if(obj.tool_log && obj.tool_log.length){ ag.history[streamIdx].tool_log = obj.tool_log; }
        // Tag the message as truncated if the model hit max_tokens — UI
        // renders a "▶ 続きを書く" Continue button under it.
        if(obj.truncated){ ag.history[streamIdx].truncated = true; }
        // Server-detected "promise without delivery" — surfaces a warning
        // chip + "▶ 実行する" button on the bubble. See _pwGoAhead.
        if(obj.promise_unfulfilled){ ag.history[streamIdx].promise_unfulfilled = obj.promise_unfulfilled; }
        if(obj.balance_jpy !== undefined) me.balance_jpy = obj.balance_jpy;
        me.usage_count = (me.usage_count||0) + 1;
        updateBalance();
        // Re-render: main (shows the "💬 N 件の返信" pill under user msg)
        // AND the drawer (so the finalized bubble has action buttons /
        // Continue button if truncated). The streaming placeholder was
        // already in the thread from the start, so no migration needed.
        renderMsgs(ag);
        if(window._activeThreadParent){ try { _renderThreadDrawer(); } catch(e){} }
        _refreshArtifactsIfNeeded(ag.history[streamIdx] && ag.history[streamIdx].tool_log, ag);
      } else if(evType === 'error'){
        errorMsg = obj.message || 'エラー';
        _stopThink();
      } else if(evType === 'huddle_start'){
        // Replace the single placeholder bubble with a "huddle in progress"
        // banner. Each member gets their own bubble pushed on huddle_turn_start.
        _stopThink();
        // Drop the placeholder
        const idx = ag.history.length - 1;
        if(ag.history[idx] && ag.history[idx].streaming){ ag.history.splice(idx, 1); }
        ag.history.push({
          role: 'system',
          content: L('🤝 Huddle 開始 · ' + (obj.members||[]).map(function(m){return m.name;}).join(' · '),
                     '🤝 Huddle started · ' + (obj.members||[]).map(function(m){return m.name;}).join(' · ')),
          time: now(),
          _huddle_banner: true,
        });
        renderMsgs(ag);
      } else if(evType === 'huddle_turn_start'){
        // Push a new streaming bubble attributed to this member.
        ag.history.push({
          role: 'assistant',
          content: '',
          time: now(),
          streaming: true,
          huddle_member_id: obj.member_id,
          huddle_member_name: obj.member_name,
          huddle_member_avatar: obj.member_avatar,
          huddle_round: obj.round,
        });
        renderMsgs(ag);
        // Refresh live bubble pointer
        var _bubbles = document.querySelectorAll('#msgsInner .m.a');
        liveEl = _bubbles[_bubbles.length - 1];
        liveBody = liveEl ? liveEl.querySelector('.m-body') : null;
        acc = ''; // reset accumulator per turn
      } else if(evType === 'huddle_turn_end'){
        var last = ag.history[ag.history.length - 1];
        if(last && last.streaming){
          last.content = acc;
          last.streaming = false;
        }
        renderMsgs(ag);
      } else if(evType === 'huddle_summary_start'){
        ag.history.push({
          role: 'assistant',
          content: '',
          time: now(),
          streaming: true,
          huddle_summary: true,
        });
        renderMsgs(ag);
        var _b2 = document.querySelectorAll('#msgsInner .m.a');
        liveEl = _b2[_b2.length - 1];
        liveBody = liveEl ? liveEl.querySelector('.m-body') : null;
        acc = '';
      } else if(evType === 'huddle_summary_delta'){
        if(obj.reset){ acc = ''; }
        acc += obj.text || '';
        if(liveBody){
          liveBody.innerHTML = _md(acc) + '<span style="display:inline-block;width:7px;height:14px;background:var(--peach);animation:cursorBlink 1s steps(2) infinite;vertical-align:text-bottom;margin-left:2px"></span>';
          _scrollMsgsToEnd();
        }
      } else if(evType === 'huddle_summary_end'){
        var lastS = ag.history[ag.history.length - 1];
        if(lastS && lastS.streaming){ lastS.content = acc; lastS.streaming = false; }
        renderMsgs(ag);
      } else if(evType === 'plan_status'){
        // /plan orchestrator progress — replace placeholder with status line.
        _stopThink();
        if(liveBody){
          var ph = obj.phase || '';
          var label = ph === 'planning' ? '📋 プランを生成中…'
                    : ph === 'executing' ? ('▶ ステップ '+obj.step+': '+esc(obj.title||'…'))
                    : ph === 'reviewing' ? '✨ 結果を統合中…'
                    : ph;
          liveBody.innerHTML = '<div class="gen-indicator"><div class="gen-logo"></div><div class="gen-text">'+label+'</div></div>';
        }
      } else if(evType === 'plan_outline'){
        if(liveBody && Array.isArray(obj.steps)){
          var html = '<div style="font-size:11.5px;color:var(--text2);background:var(--cream2);border:1px solid var(--wire2);border-radius:9px;padding:9px 12px;margin-bottom:8px;line-height:1.7">'
            + '<div style="font-weight:800;color:var(--peach-dark);margin-bottom:4px">📋 プラン (' + obj.steps.length + ' ステップ)</div>'
            + obj.steps.map(function(s){ return s.n + '. ' + esc(s.title); }).join('<br>')
            + '</div>'
            + '<div class="gen-indicator"><div class="gen-logo"></div><div class="gen-text">▶ 順番に実行します…</div></div>';
          liveBody.innerHTML = html;
        }
      } else if(evType === 'plan_step_done'){
        // No-op for now (status pill already shown). Could append per-step
        // progress to the bubble if desired.
      } else if(evType === 'critic_replaced'){
        // The server rewrote the reply via critic. Replace acc with the
        // improved version + show a small badge.
        acc = obj.reply || acc;
        if(liveBody) liveBody.innerHTML = _md(acc) + '<div style="margin-top:6px;display:inline-flex;align-items:center;gap:4px;background:rgba(34,197,94,.12);color:#15803d;font-size:10px;font-weight:800;padding:2px 8px;border-radius:99px">✨ 改善版</div>';
      }
    }
  } } finally {
    _clearIdle();
    _stopThink();
    _turnStatusEnd();
    _chatStreamCtrl = null;
    _setChatStreaming(false);
    // Turn is over — no message may still show "生成中". Clear every streaming
    // flag (covers done / error / abort / disconnect uniformly) + re-render.
    try { (ag.history||[]).forEach(function(m){ if(m && m.streaming) m.streaming = false; }); } catch(e){}
    try { renderMsgs(ag); } catch(e){}
    if(_idleHung){ try { showToast(L('接続が応答しないため中断しました。再読み込みで最新を確認できます','Connection stalled — reload to see the latest result'),'ng'); } catch(e){} }
  }
  if(_aborted){
    // User pressed ⏹. Preserve the partial text exactly as streamed and mark
    // the bubble as truncated so the "▶ 続きを書く" Continue action appears.
    // No more "_(停止しました)_" sentinel — it dirtied the markdown and the
    // Continue button itself signals "stopped" clearly enough.
    const last = ag.history[ag.history.length - 1];
    if(last && last.streaming){
      const partial = (acc || '').trim();
      last.content   = partial || (isJa ? '(停止しました — 続きを書くボタンで再開できます)' : '(stopped — hit Continue to resume)');
      last.streaming = false;
      last.truncated = true;
      last.was_stopped = true;
      renderMsgs(ag);
    }
    return; // not an error
  }
  if(errorMsg){
    ag.history.pop();                    // drop the empty streaming bubble
    throw new Error(errorMsg);
  }
  // Fallback: stream ended without a 'done' SSE event (Render edge cut,
  // Anthropic max_tokens, network blip, user-triggered abort etc.). The
  // placeholder bubble would otherwise stay in `streaming:true` forever with
  // no Continue button. Mark it truncated so the ▶ 続きを書く action appears.
  //
  // CRITICAL: use streamIdx (this closure's own bubble) — NOT
  // ag.history.length-1. If the user already sent the next message in the
  // meantime, "the last entry" is the NEW placeholder. Fixing that would
  // leave THIS run's bubble stuck "生成中" forever.
  const _stuck = ag.history[streamIdx];
  if(_stuck && _stuck.streaming){
    _stuck.content = (acc || '').trim() || (isJa ? '応答が途中で切れました' : 'Reply was cut short');
    _stuck.streaming = false;
    _stuck.truncated = true;
    renderMsgs(ag);
    if(window._activeThreadParent){ try { _renderThreadDrawer(); } catch(e){} }
  }
}

// Renders the streaming bubble: tool log (if any) + the markdown text + cursor.
function _friendlyToolLabel(name){
  // Map raw tool name → human-friendly Japanese / English label with emoji.
  // Falls back to a cleaned-up version of the name when no entry matches.
  var L = isJa ? {
    create_artifact:'🎨 デザインを生成中…',
    generate_image:'🖼 画像を生成中…',
    generate_video:'🎬 動画をレンダリング中… (30-60 秒かかります)',
    generate_audio:'🎙 音声を合成中…',
    generate_pdf:'📄 PDF を組版中…',
    generate_chart:'📊 グラフを描画中…',
    generate_diagram:'🔀 図を生成中…',
    generate_qr:'🔲 QR コードを生成中…',
    generate_agent_promo_video:'🎬 プロモ動画を作成中… (10-20 秒)',
    send_email:'✉️ メール送信中…',
    notify_slack:'📣 Slack に投稿中…',
    notify_discord:'💬 Discord に投稿中…',
    create_calendar_event:'📅 カレンダーに登録中…',
    sheets_read:'📊 スプレッドシートを読み込み中…',
    sheets_write:'📊 スプレッドシートに書き込み中…',
    sheets_append:'📊 スプレッドシートに追記中…',
    sheets_clear:'📊 スプレッドシートをクリア中…',
    sheets_get_meta:'📊 スプレッドシート情報を取得中…',
    sheets_create_spreadsheet:'📊 新しいスプレッドシートを作成中…',
    sheets_add_sheet:'📊 シートを追加中…',
    sheets_format:'📊 スプレッドシートを書式設定中…',
    web_search:'🔍 Web を検索中…',
    web_fetch:'🌐 ページを取得中…',
    web_screenshot:'📸 スクリーンショットを撮影中…',
    web_read_markdown:'📖 ページを読み込み中…',
    web_extract:'🔎 ページから情報抽出中…',
  } : {
    create_artifact:'🎨 Designing…',
    generate_image:'🖼 Generating image…',
    generate_video:'🎬 Rendering video… (30-60s)',
    generate_audio:'🎙 Synthesizing audio…',
    generate_pdf:'📄 Typesetting PDF…',
    generate_chart:'📊 Drawing chart…',
    generate_diagram:'🔀 Generating diagram…',
    generate_qr:'🔲 Generating QR code…',
    generate_agent_promo_video:'🎬 Recording promo video… (10-20s)',
    send_email:'✉️ Sending email…',
    notify_slack:'📣 Posting to Slack…',
    notify_discord:'💬 Posting to Discord…',
    create_calendar_event:'📅 Creating calendar event…',
    sheets_read:'📊 Reading spreadsheet…',
    sheets_write:'📊 Writing to spreadsheet…',
    sheets_append:'📊 Appending to spreadsheet…',
    sheets_clear:'📊 Clearing spreadsheet…',
    sheets_get_meta:'📊 Fetching sheet metadata…',
    sheets_create_spreadsheet:'📊 Creating new spreadsheet…',
    sheets_add_sheet:'📊 Adding sheet…',
    sheets_format:'📊 Formatting spreadsheet…',
    web_search:'🔍 Searching the web…',
    web_fetch:'🌐 Fetching page…',
    web_screenshot:'📸 Taking screenshot…',
    web_read_markdown:'📖 Reading page…',
    web_extract:'🔎 Extracting from page…',
  };
  if(L[name]) return L[name];
  // ext_* are browser-extension actions — generic label
  if(name && name.indexOf('ext_')===0){
    return isJa ? '🌐 ブラウザを操作中…' : '🌐 Operating browser…';
  }
  return (isJa?'⚙ ツール実行中: ':'⚙ Running: ')+String(name||'').replace(/_/g,' ');
}

function _toolDoneLabel(name){
  // Past-tense / completed label (shown once the tool finishes successfully).
  var lbl = _friendlyToolLabel(name)
    .replace(/中…/g,'')             // strip 〜中… progressive
    .replace(/…$/,'')
    .replace(/ \(.*\)$/,'')          // strip "(30-60s)" etc
    .replace(/ing…?$/i,'ed')         // "Generating…" → "Generated"
    .replace(/ting$/i,'ted');
  return lbl;
}

function _renderStreamingBody(text, toolLog, thinking){
  let html = '';
  if(toolLog && toolLog.length){
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">';
    for(const t of toolLog){
      const isPending = t._pending;
      const failed = t.ok === false;
      const cls = isPending ? 'tool-pill run' : (failed ? 'tool-pill err' : 'tool-pill ok');
      const label = isPending
        ? _friendlyToolLabel(t.name)
        : (failed ? '✗ '+(_toolDoneLabel(t.name)) : '✓ '+(_toolDoneLabel(t.name)));
      const icon = isPending ? '<span class="tool-pill-spin"></span>' : '';
      html += '<span class="'+cls+'">'+icon+esc(label)+'</span>';
    }
    html += '</div>';
  }
  // Cursor / "next-step" indicator policy:
  //   • text + thinking → text + "次のステップを考え中…" pill (iter >= 1)
  //   • text only       → text + blinking cursor (mid-stream within an iter)
  //   • no text + tools → just the tool pills (preamble was empty)
  //   • no text + no tools → big "Thinking…" indicator (initial wait)
  if(text){
    html += _md(text);
    if(thinking){
      // Visible indicator between iterations so the bubble doesn't look frozen
      // while the next callAIWithTools API call (non-streaming) is running.
      html += '<div style="display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:6px 12px;background:rgba(251,146,60,.08);border:1px solid rgba(251,146,60,.25);border-radius:99px;font-size:11.5px;font-weight:700;color:var(--peach-dark);font-family:inherit"><span class="tool-pill-spin"></span>'
           + (isJa?'次のステップを考えています…':'Thinking about next step…')
           + '</div>';
    } else {
      html += '<span style="display:inline-block;width:7px;height:14px;background:var(--peach);animation:cursorBlink 1s steps(2) infinite;vertical-align:text-bottom;margin-left:2px"></span>';
    }
  } else if(!toolLog || !toolLog.length){
    html += '<div class="gen-indicator"><div class="gen-logo"></div><div class="gen-text">'
         + (isJa?'考えています…':'Thinking…')
         + '</div></div>';
  }
  return html;
}

async function delAgent(id){
  if(!confirm(L('このエージェントを削除しますか？','Delete this agent?')))return;
  try{ await api('DELETE',`/api/agents/${id}`); }catch{}
  agents=agents.filter(a=>a.id!==id); activeId=null;
  renderAgList();
  if(agents.length>0) openAgent(agents[0].id);
  else{ document.getElementById('emptyWrap').style.display=''; document.getElementById('chatWrap').style.display='none'; }
}

/* ── Wizard ────────────────────────────────────────── */
var _wizardMode='new'; // 'new' | 'preset'
function _resetWizardState(){
  NA={avatar:'🤖',name:'',skills:[],persona:'',purpose:'',duties:'',chrome_enabled:false,sheets_enabled:false};
  _selectedPresetIdx=-1;
  ['wName','wPurpose','wDuties'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var avPrev=document.getElementById('avPrev'); if(avPrev) avPrev.innerHTML=_avHTML('🤖');
  document.querySelectorAll('.av-cell').forEach(function(b,i){b.classList.toggle('sel',i===0);});
  document.querySelectorAll('.sk-card').forEach(function(b){b.classList.remove('sel');});
  document.querySelectorAll('.preset-card').forEach(function(b){b.classList.remove('sel');});
  var useBtn=document.getElementById('usePresetBtn');
  if(useBtn){ useBtn.disabled=true; useBtn.style.opacity='.5'; useBtn.style.cursor='not-allowed'; }
  if(typeof _renderChromeStatus==='function') _renderChromeStatus('wChromeSw','wChromeDesc',false);
  if(typeof _renderSheetsStatus==='function') _renderSheetsStatus('wSheetsSw','wSheetsDesc','wSheetsAccountRow','wSheetsEmail','wSheetsConnectBtn',false);
}
function setAgentMode(mode){
  var tabNew = document.getElementById('agentModeTabNew');
  var tabTpl = document.getElementById('agentModeTabTpl');
  var paneNew= document.getElementById('agentModeNew');
  var paneTpl= document.getElementById('agentModeTpl');
  if(!tabNew||!tabTpl||!paneNew||!paneTpl) return;
  if(mode==='tpl'){
    tabTpl.style.background='#fff'; tabTpl.style.color='var(--text)'; tabTpl.style.boxShadow='0 1px 4px rgba(0,0,0,.06)';
    tabNew.style.background='transparent'; tabNew.style.color='var(--text2)'; tabNew.style.boxShadow='none';
    paneTpl.style.display=''; paneNew.style.display='none';
  } else {
    tabNew.style.background='#fff'; tabNew.style.color='var(--text)'; tabNew.style.boxShadow='0 1px 4px rgba(0,0,0,.06)';
    tabTpl.style.background='transparent'; tabTpl.style.color='var(--text2)'; tabTpl.style.boxShadow='none';
    paneNew.style.display=''; paneTpl.style.display='none';
  }
}

function openNewAgent(){
  _wizardMode='new';
  _resetWizardState();
  wStep(0);
  setAgentMode('new');
  document.getElementById('wizOverlay').classList.add('open');
}

// ── GROUPS ──────────────────────────────────────────────────
// Open a "create group" flow: pick an existing AI agent → promote it to a
// group with an invite link. The user can then immediately share the link.
async function openCreateGroup(){
  if(!agents || agents.length === 0){
    showToast(isJa ? '先に AI エージェントを 1 つ作成してください' : 'Create an AI agent first', 'ng');
    setTimeout(() => openNewAgent(), 300);
    return;
  }
  const overlay = document.getElementById('grpCreateOverlay');
  if(overlay) overlay.classList.add('open');
  const list = document.getElementById('grpCreateList');
  if(!list) return;
  list.innerHTML = agents.map(a => `
    <button class="grp-pick" onclick="_pickGrpAgent('${esc(a.id)}')">
      <div class="grp-pick-av">${_avHTML(a.avatar)}</div>
      <div class="grp-pick-body">
        <div class="grp-pick-nm">${esc(a.name)}${a.is_group?' <span class="ag-pill">GR</span>':''}</div>
        <div class="grp-pick-d">${(a.skills||[]).map(s=>SKILLS.find(x=>x.id===s)?.name||s).join(' · ')||'AI'}</div>
      </div>
      <span style="color:var(--text3);font-size:13px">›</span>
    </button>`).join('');
}
function closeCreateGroup(){
  document.getElementById('grpCreateOverlay')?.classList.remove('open');
}
async function _pickGrpAgent(agId){
  closeCreateGroup();
  try {
    const r = await api('POST', '/api/agents/' + agId + '/invite', {
      expires_in_days: 7,
      max_members: 50,
      require_approval: false,
    });
    const ag = agents.find(a => a.id === agId);
    if(ag){
      ag.is_group = true;
      ag.host_id = me.id;
      ag.invite_token = r.invite_token;
      ag.invite_url = r.invite_url;
      ag.invite_expires_at = r.invite_expires_at;
      ag.invite_max_members = r.invite_max_members;
      ag.members = Array.isArray(r.members) ? r.members : [];
      ag.member_count = ag.members.length || 1;
    }
    // Defensive: refresh agents from server so all server-known fields land
    try {
      const fresh = await api('GET', '/api/agents');
      if(fresh && Array.isArray(fresh.agents)){
        const map = new Map(agents.map(a => [a.id, a]));
        fresh.agents.forEach(serverAg => {
          const local = map.get(serverAg.id);
          if(local) Object.assign(local, serverAg);
          else agents.push(serverAg);
        });
      }
    } catch(e){}
    renderAgList();
    openInviteModal(agId);
  } catch(e) {
    showToast((isJa ? 'グループ作成失敗: ' : 'Group create failed: ') + e.message, 'ng');
  }
}

// Invite modal — show QR + link + share buttons
async function openInviteModal(agId){
  const ag = agents.find(a => a.id === agId);
  if(!ag) return;
  // Stash on window so the save button below can pick up the right agentId.
  window._currentInviteAgId = agId;
  // Re-fetch members + token to ensure freshness
  let token = ag.invite_token, expires = ag.invite_expires_at, maxMembers = ag.invite_max_members || 50;
  let welcome = '', defaultRole = 'contributor';
  try {
    const m = await api('GET', '/api/agents/' + agId + '/members');
    if(m && m.invite_token){ token = m.invite_token; expires = m.invite_expires_at; maxMembers = m.invite_max_members; }
    welcome = (m && m.invite_welcome) || '';
    defaultRole = (m && m.invite_default_role) || 'contributor';
  } catch(e){}
  if(!token){
    // No invite yet — generate one
    try {
      const r = await api('POST', '/api/agents/' + agId + '/invite', {});
      token = r.invite_token; expires = r.invite_expires_at; maxMembers = r.invite_max_members;
      welcome = r.invite_welcome || welcome;
      defaultRole = r.invite_default_role || defaultRole;
      if(ag) { ag.invite_token = token; ag.is_group = true; ag.host_id = me.id; ag.member_count = (r.members||[]).length; }
    } catch(e){
      showToast((isJa ? '招待リンク生成失敗: ' : 'Invite create failed: ') + e.message, 'ng');
      return;
    }
  }
  // Hydrate welcome message + default role fields
  var wEl = document.getElementById('grpInviteWelcome');
  if(wEl) wEl.value = welcome;
  var rEl = document.getElementById('grpInviteRole');
  if(rEl) rEl.value = defaultRole;
  const url = location.origin + '/g/' + token;
  const expDate = expires ? new Date(expires) : null;
  const expStr = expDate ? expDate.toLocaleDateString('ja-JP', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : '無期限';
  const overlay = document.getElementById('grpInviteOverlay');
  if(!overlay) return;
  document.getElementById('grpInviteUrl').textContent = url;
  document.getElementById('grpInviteUrl').dataset.url = url;
  document.getElementById('grpInviteExp').textContent = expStr;
  document.getElementById('grpInviteMax').textContent = maxMembers + ' 人';
  document.getElementById('grpInviteName').textContent = ag.name;
  // Share buttons (open native share intents)
  document.getElementById('grpShareLine').onclick = () => {
    location.href = 'https://line.me/R/msg/text/?' + encodeURIComponent('「' + ag.name + '」グループに招待します\n' + url);
  };
  document.getElementById('grpShareMail').onclick = () => {
    location.href = 'mailto:?subject=' + encodeURIComponent('「' + ag.name + '」グループへの招待') + '&body=' + encodeURIComponent('以下のリンクから参加してください:\n' + url);
  };
  document.getElementById('grpShareSms').onclick = () => {
    location.href = 'sms:?body=' + encodeURIComponent('「' + ag.name + '」グループへの招待: ' + url);
  };
  document.getElementById('grpShareCopy').onclick = async () => {
    try { await navigator.clipboard.writeText(url); showToast(isJa?'リンクをコピーしました':'Copied', 'ok'); }
    catch(e){ showToast(L('コピー失敗','Copy failed'), 'ng'); }
  };
  // QR rendering: lightweight pattern using URL-encoded data
  const qrEl = document.getElementById('grpInviteQR');
  if(qrEl) qrEl.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(url);

  overlay.classList.add('open');
}
function closeInviteModal(){
  document.getElementById('grpInviteOverlay')?.classList.remove('open');
}
// Save the welcome message + default-role from the invite modal back to the
// group/team agent. Called by the "保存" button next to the textarea.
async function _saveInviteConfig(){
  const agId = window._currentInviteAgId;
  if(!agId){ showToast('対象グループが特定できません','ng'); return; }
  const welcome = (document.getElementById('grpInviteWelcome')||{}).value || '';
  const defaultRole = (document.getElementById('grpInviteRole')||{}).value || 'contributor';
  try {
    await api('POST', '/api/agents/'+agId+'/invite', {
      invite_welcome: welcome,
      invite_default_role: defaultRole,
    });
    showToast('✓ ウェルカム設定を保存','ok');
  } catch(e){
    showToast((e.message||'保存失敗'),'ng');
  }
}
function openTemplate(){
  _wizardMode='preset';
  _resetWizardState();
  wStep(0);
  setAgentMode('tpl');
  document.getElementById('wizOverlay').classList.add('open');
}

/* ── Automation templates gallery (Slack briefing / Meeting notes / etc) ── */
async function openAutomationsGallery(){
  if(document.getElementById('autoGalOv')) return;
  var ov=document.createElement('div');
  ov.id='autoGalOv';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:flex-start;justify-content:center;z-index:9000;padding:24px;overflow-y:auto';
  ov.innerHTML=
    '<div style="background:var(--card,#fff);border-radius:16px;max-width:780px;width:100%;padding:24px;box-shadow:0 24px 64px rgba(0,0,0,.3);font-family:inherit">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><div style="font-weight:900;font-size:20px;letter-spacing:-.01em">⚡ '+(isJa?'1-click Automations':'1-click Automations')+'</div><button onclick="document.getElementById(\'autoGalOv\').remove()" style="background:none;border:0;color:var(--text3);font-size:22px;cursor:pointer;line-height:1">×</button></div>'+
      '<div style="font-size:13px;color:var(--text2);line-height:1.55;margin-bottom:18px">'+(isJa?'よく使われる自動化を、AI + スケジュール + 連携 までセットで一気に立ち上げます。':'Pre-built automations — agent + schedule + integration hints in one click.')+'</div>'+
      '<div id="autoGalList" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px"><div style="grid-column:1/-1;text-align:center;color:var(--text3);padding:30px 0">'+(isJa?'読み込み中…':'Loading…')+'</div></div>'+
    '</div>';
  ov.addEventListener('click', function(e){ if(e.target===ov) ov.remove(); });
  document.body.appendChild(ov);
  try{
    var r = await fetch('/api/templates').then(x=>x.json());
    var grid = document.getElementById('autoGalList');
    if(!r || !r.templates || !r.templates.length){
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text3);padding:30px 0">'+(isJa?'テンプレートがありません':'No templates')+'</div>';
      return;
    }
    grid.innerHTML = r.templates.map(function(t){
      var hints = (t.suggested_integrations||[]).map(function(k){ return '<span style="background:#fdf1e3;color:#9a3412;font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:6px">'+(k==='slack'?'📣 Slack':k==='discord'?'💬 Discord':k)+'</span>'; }).join(' ');
      var schedPill = t.has_schedule ? '<span style="background:rgba(245,158,11,.15);color:#b45309;font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:6px">⏰ '+esc(t.schedule_summary||'scheduled')+'</span>' : '';
      return '<div style="display:flex;flex-direction:column;gap:10px;padding:16px;background:#fff;border:1px solid var(--wire2);border-radius:12px;transition:transform .12s ease,box-shadow .12s ease" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 12px 28px rgba(251,146,60,.18)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'">'+
        '<div style="display:flex;align-items:center;gap:10px"><div style="width:38px;height:38px;border-radius:9px;background:linear-gradient(135deg,#fff3e6,#ffe5cc);display:flex;align-items:center;justify-content:center;font-size:20px">'+esc(t.icon||'⚙️')+'</div><div style="font-weight:800;font-size:13.5px;line-height:1.3">'+esc(t.title)+'</div></div>'+
        '<div style="font-size:11.5px;color:var(--text2);line-height:1.55;min-height:48px">'+esc(t.description||'')+'</div>'+
        ((schedPill||hints)?'<div style="display:flex;flex-wrap:wrap;gap:5px">'+schedPill+' '+hints+'</div>':'')+
        '<button onclick="_installTemplate(\''+esc(t.id)+'\',this)" style="background:var(--peach);color:#fff;border:0;border-radius:9px;padding:9px 14px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit">🚀 '+(isJa?'導入する':'Install')+'</button>'+
      '</div>';
    }).join('');
  }catch(e){
    document.getElementById('autoGalList').innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--rose);padding:30px 0">'+(isJa?'読み込みに失敗':'Failed to load')+'</div>';
  }
}
async function _installTemplate(id, btn){
  if(btn){ btn.disabled = true; btn.textContent = isJa?'導入中…':'Installing…'; }
  try{
    var r = await api('POST','/api/templates/'+id+'/install',{});
    if(!r || !r.agent){ throw new Error('Bad response'); }
    // Refresh local agents list (full reload is simplest + ensures schedule appears)
    var ag = r.agent;
    agents.push(Object.assign({history:[]}, ag));
    var ov = document.getElementById('autoGalOv'); if(ov) ov.remove();
    showToast('✓ '+(isJa?'導入しました — チャットで使ってみる':'Installed — open the chat'),'ok');
    // Show integration setup hint if any
    var needSetup = (r.integration_hints||[]).filter(function(h){return !h.configured});
    if(needSetup.length){
      setTimeout(function(){
        showToast((isJa?'💡 ヒント: ':'💡 Tip: ')+needSetup.map(function(h){return h.kind}).join(' / ')+' '+(isJa?'を Settings → Integrations で接続してください':'— configure in Settings → Integrations'),'ok');
      }, 1800);
    }
    // Jump to the agent so the user sees what was created
    openAgent(ag.id);
  }catch(e){
    if(btn){ btn.disabled = false; btn.textContent = '🚀 '+(isJa?'導入する':'Install'); }
    showToast((isJa?'失敗: ':'Failed: ')+(e.message||''),'ng');
  }
}
// Backward-compat: any remaining caller of openWizard() lands on the template picker
function openWizard(){ openTemplate(); }

/* ── Team gallery + activation (Phase 1 MVP) ─────────────────── */
function setTeamMode(mode){
  var tabNew = document.getElementById('teamModeTabNew');
  var tabTpl = document.getElementById('teamModeTabTpl');
  var paneNew= document.getElementById('teamModeNew');
  var paneTpl= document.getElementById('teamModeTpl');
  if(!tabNew||!tabTpl||!paneNew||!paneTpl) return;
  if(mode==='tpl'){
    tabTpl.style.background='#fff'; tabTpl.style.color='var(--text)'; tabTpl.style.boxShadow='0 1px 4px rgba(0,0,0,.06)';
    tabNew.style.background='transparent'; tabNew.style.color='var(--text2)'; tabNew.style.boxShadow='none';
    paneTpl.style.display=''; paneNew.style.display='none';
  } else {
    tabNew.style.background='#fff'; tabNew.style.color='var(--text)'; tabNew.style.boxShadow='0 1px 4px rgba(0,0,0,.06)';
    tabTpl.style.background='transparent'; tabTpl.style.color='var(--text2)'; tabTpl.style.boxShadow='none';
    paneNew.style.display=''; paneTpl.style.display='none';
  }
}

function _setGoalText(t){
  var el = document.getElementById('newTeamGoal');
  if(!el) return;
  el.value = t;
  el.focus();
}

async function submitGenerateTeam(){
  if(!token){ showToast(L('ログインが必要です','Sign in required'),'ng'); return; }
  var goal = (document.getElementById('newTeamGoal').value||'').trim();
  if(goal.length < 6){
    showToast(L('もう少し詳しく書いてください (6 文字以上)','Please describe your goal in more detail'),'ng');
    return;
  }
  // Reuse the activation progress overlay
  document.getElementById('teamGalleryOverlay').classList.remove('open');
  var ov = document.getElementById('teamActivateOverlay');
  ov.classList.add('open');
  document.getElementById('teamActIcon').textContent = '🤖';
  document.getElementById('teamActTitle').textContent = L('AI がチームを設計中…','AI is designing your team…');
  document.getElementById('teamActSub').textContent = L('目的を分析しています','Analyzing your goal…');
  document.getElementById('teamActBar').style.width = '20%';
  document.getElementById('teamActBar').style.background = 'linear-gradient(90deg,var(--peach),var(--peach-dark))';
  document.getElementById('teamActStatus').textContent = '';

  // Animate the progress bar so it doesn't feel stuck during the LLM call
  var barEl = document.getElementById('teamActBar');
  var subEl = document.getElementById('teamActSub');
  var pct = 20;
  var phases = [
    L('必要な役割を洗い出しています','Mapping out roles…'),
    L('各エージェントの性格を設計中','Designing personas…'),
    L('スキルを割り当てています','Assigning skills…'),
    L('もう少しで完成…','Almost done…'),
  ];
  var pi = 0;
  var anim = setInterval(function(){
    pct = Math.min(pct + 6, 88);
    barEl.style.width = pct + '%';
    if(pct >= 30 + pi*15 && pi < phases.length){ subEl.textContent = phases[pi++]; }
  }, 900);

  try {
    var r = await api('POST','/api/teams/generate', { goal: goal, lang: currentLang });
    clearInterval(anim);
    barEl.style.width = '100%';
    document.getElementById('teamActIcon').textContent = r.cover_emoji || '🎯';
    subEl.textContent = L('完了!','Done!');
    document.getElementById('teamActStatus').textContent = (r.member_count||0) + ' agents · opening workspace…';
    try {
      var meRes = await api('GET','/api/me');
      if(meRes && meRes.user){
        me = meRes.user;
        if(Array.isArray(me.agents)) agents = me.agents;
      }
    } catch(e){ console.warn('[team] /api/me refresh failed', e); }
    setTimeout(function(){
      document.getElementById('teamActivateOverlay').classList.remove('open');
      renderAgList();
      if(r.group_id && (agents||[]).find(function(a){return a.id===r.group_id;})){
        openAgent(r.group_id);
      } else {
        showToast(L('チームを作成しました','Team created'),'ok');
      }
    }, 700);
  } catch(e){
    clearInterval(anim);
    console.error('[team] generate failed', e);
    if(e && e.upgrade_required){
      document.getElementById('teamActivateOverlay').classList.remove('open');
      _showUpgradeToast(e);
      return;
    }
    subEl.textContent = L('生成失敗','Generation failed');
    document.getElementById('teamActStatus').innerHTML =
      '<div style="color:var(--rose);font-weight:700;margin-bottom:10px;font-size:11.5px">' + esc(e.message || L('不明なエラー','Unknown error')) + '</div>'
      + '<button onclick="document.getElementById(\'teamActivateOverlay\').classList.remove(\'open\')" style="background:var(--cream2);color:var(--text2);border:1px solid var(--wire2);border-radius:8px;padding:7px 14px;font-size:11px;font-weight:700;cursor:pointer">'+L('閉じる','Close')+'</button>';
    barEl.style.background = 'var(--rose)';
    showToast(L('チーム生成に失敗しました: ','Team generation failed: ') + (e.message||''),'ng');
  }
}

async function openTeamGallery(){
  if(!token){ showToast(L('ログインが必要です','Sign in required'),'ng'); return; }
  document.getElementById('teamGalleryOverlay').classList.add('open');
  setTeamMode('new');
  // Reset new-team form state
  var goal = document.getElementById('newTeamGoal'); if(goal) goal.value = '';
  var grid = document.getElementById('teamGalleryGrid');
  grid.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:14px 0">'+L('読み込み中…','Loading…')+'</div>';
  try {
    var r = await api('GET','/api/teams/templates');
    var items = (r && r.templates) || [];
    if(!items.length){ grid.innerHTML = '<div style="color:var(--text3)">'+L('テンプレートがありません','No templates available')+'</div>'; return; }
    grid.innerHTML = items.map(function(t){
      var priceTag = (t.price_jpy>0)
        ? '<span style="display:inline-block;background:rgba(251,146,60,.12);color:var(--peach-dark);font-size:9.5px;font-weight:900;padding:2px 8px;border-radius:99px;letter-spacing:.06em">💼 PAID ¥'+t.price_jpy.toLocaleString()+'</span>'
        : '<span style="display:inline-block;background:rgba(16,185,129,.16);color:#047857;font-size:9.5px;font-weight:900;padding:2px 8px;border-radius:99px;letter-spacing:.06em">🎁 FREE</span>';
      var avHtml = (t.agents_preview||[]).slice(0,5).map(function(a){
        return '<div style="width:24px;height:24px;border-radius:6px;background:var(--cream2);border:1px solid var(--wire2);display:inline-flex;align-items:center;justify-content:center;font-size:13px;margin-right:-2px">'+esc(a.avatar||'🤖')+'</div>';
      }).join('');
      var btn = (t.price_jpy>0)
        ? '<button disabled style="width:100%;background:var(--cream2);color:var(--text3);padding:10px;border:1px solid var(--wire2);border-radius:9px;font-size:12.5px;font-weight:800;cursor:not-allowed">Marketplace 経由で購入</button>'
        : '<button onclick="event.stopPropagation();activateTeam(\''+esc(t.id)+'\',\''+esc(t.name)+'\',\''+esc(t.cover_emoji)+'\')" style="width:100%;background:var(--peach);color:#fff;padding:10px;border:0;border-radius:9px;font-size:12.5px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(251,146,60,.32)">▶ 起動 (無料)</button>';
      return ''
        + '<div style="background:#fff;border:1px solid var(--wire2);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px;transition:all .14s" onmouseover="this.style.borderColor=\'var(--peach)\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.borderColor=\'\';this.style.transform=\'\'">'
        + '<div style="height:64px;border-radius:10px;background:linear-gradient(135deg,#fff7ee,#fed7aa);display:flex;align-items:center;justify-content:center;font-size:30px">'+esc(t.cover_emoji||'🎯')+'</div>'
        + '<div>'+priceTag+'</div>'
        + '<div style="font-size:14px;font-weight:900;letter-spacing:-.005em">'+esc(t.name)+'</div>'
        + '<div style="font-size:11.5px;color:var(--text2);line-height:1.55;flex:1">'+esc(t.description||'')+'</div>'
        + '<div style="display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--text3);font-weight:700">'+avHtml+'<span style="margin-left:6px">'+(t.agent_count||0)+' agents</span></div>'
        + btn
        + '</div>';
    }).join('');
  } catch(e){
    grid.innerHTML = '<div style="color:var(--rose)">'+esc(e.message||'Load failed')+'</div>';
  }
}
function closeTeamGallery(){
  document.getElementById('teamGalleryOverlay').classList.remove('open');
}

async function activateTeam(templateId, templateName, coverEmoji){
  if(!token){ showToast(L('ログインが必要です','Sign in required'),'ng'); return; }
  // Show progress overlay
  document.getElementById('teamGalleryOverlay').classList.remove('open');
  var ov = document.getElementById('teamActivateOverlay');
  ov.classList.add('open');
  document.getElementById('teamActIcon').textContent = coverEmoji || '🎯';
  document.getElementById('teamActTitle').textContent = templateName + L(' を起動中…',' is activating…');
  document.getElementById('teamActSub').textContent = L('エージェントをクローンしています','Cloning agents…');
  document.getElementById('teamActBar').style.width = '30%';
  document.getElementById('teamActBar').style.background = 'linear-gradient(90deg,var(--peach),var(--peach-dark))';
  document.getElementById('teamActStatus').textContent = '';
  try {
    var r = await api('POST','/api/teams/activate', { template_id: templateId, lang: currentLang });
    document.getElementById('teamActBar').style.width = '100%';
    document.getElementById('teamActSub').textContent = L('完了!','Done!');
    document.getElementById('teamActStatus').textContent = L((r.cloned_count||0) + ' agents created · opening workspace…','Opening workspace…');
    // Refresh local agent state and open the new group
    try {
      var meRes = await api('GET','/api/me');
      if(meRes && meRes.user){
        me = meRes.user;
        if(Array.isArray(me.agents)) agents = me.agents;
      }
    } catch(e){ console.warn('[team] /api/me refresh failed', e); }
    setTimeout(function(){
      document.getElementById('teamActivateOverlay').classList.remove('open');
      renderAgList();
      if(r.group_id && (agents||[]).find(function(a){return a.id===r.group_id;})){
        openAgent(r.group_id);
      } else {
        showToast(L('チームを起動しました','Team activated'),'ok');
      }
    }, 900);
  } catch(e){
    console.error('[team] activate failed', e);
    if(e && e.upgrade_required){
      document.getElementById('teamActivateOverlay').classList.remove('open');
      _showUpgradeToast(e);
      return;
    }
    document.getElementById('teamActSub').textContent = L('起動失敗','Activation failed');
    document.getElementById('teamActStatus').innerHTML =
      '<div style="color:var(--rose);font-weight:700;margin-bottom:10px;font-size:11.5px">' + esc(e.message || L('不明なエラー','Unknown error')) + '</div>'
      + '<button onclick="document.getElementById(\'teamActivateOverlay\').classList.remove(\'open\')" style="background:var(--cream2);color:var(--text2);border:1px solid var(--wire2);border-radius:8px;padding:7px 14px;font-size:11px;font-weight:700;cursor:pointer">'+L('閉じる','Close')+'</button>';
    document.getElementById('teamActBar').style.background = 'var(--rose)';
    showToast(L('チームの起動に失敗しました: ','Team activation failed: ') + (e.message||''),'ng');
  }
}
/* ── Team edit (name, emoji, goal) ─────────────────────────── */
var _editingTeamId = null;
function openTeamEdit(teamId){
  var team = (agents||[]).find(function(a){return a.id===teamId;});
  if(!team || !team.is_team){ showToast(L('チームが見つかりません','Team not found'),'ng'); return; }
  if(team.host_id !== me?.id){ showToast(L('ホストのみ編集できます','Only the host can edit'),'ng'); return; }
  _editingTeamId = teamId;
  document.getElementById('teamEditEmoji').value = team.avatar || '🎯';
  document.getElementById('teamEditName').value  = team.name  || '';
  document.getElementById('teamEditGoal').value  = team.team_goal || '';
  document.getElementById('teamEditMsg').textContent = '';
  // Reflect existing store listing state on the CTA
  var listBtn = document.getElementById('teamListBtn');
  var subTxt  = document.getElementById('teamStoreSubText');
  var m = team.marketplace || {};
  if(listBtn){
    listBtn.onclick = function(){
      closeTeamEdit();
      openListingForm(team.id);
    };
    if(m.is_listed){
      listBtn.textContent = '🏪 ' + L('出店内容を編集','Edit listing');
      if(subTxt) subTxt.innerHTML = '<span style="color:#10b981;font-weight:800">✓ '+L('出店中','Live')+'</span> · '+(m.uses_count||0)+' '+L('回利用','uses')+(m.price_jpy>0?' · ¥'+m.price_jpy.toLocaleString():' · 無料');
    } else if(m.status==='paused'){
      listBtn.textContent = '🏪 ' + L('再公開する','Re-publish');
      if(subTxt) subTxt.innerHTML = '<span style="color:var(--text3);font-weight:700">⏸ '+L('一時停止中','Paused')+'</span> — '+L('再公開できます','You can re-publish anytime.');
    } else {
      listBtn.textContent = '＋ ' + L('出店フォームを開く','Open listing form');
      if(subTxt) subTxt.innerHTML = 'このチームを丸ごとストアに出すと、他のユーザーが <b>1 クリックで自分のアカウントに複製</b> できます。買い切り価格の 70% + 利用料の 10% が収益になります。';
    }
  }
  // Wire the delete button to deleteTeam()
  var delBtn = document.getElementById('teamDeleteBtn');
  if(delBtn){
    delBtn.onclick = function(){ closeTeamEdit(); deleteTeam(team.id); };
  }
  document.getElementById('teamEditOverlay').classList.add('open');
}
function closeTeamEdit(){
  document.getElementById('teamEditOverlay')?.classList.remove('open');
  _editingTeamId = null;
}
async function saveTeamEdit(){
  if(!_editingTeamId){ closeTeamEdit(); return; }
  var team = (agents||[]).find(function(a){return a.id===_editingTeamId;});
  if(!team){ closeTeamEdit(); return; }
  var name  = (document.getElementById('teamEditName').value||'').trim();
  var emoji = (document.getElementById('teamEditEmoji').value||'🎯').trim() || '🎯';
  var goal  = (document.getElementById('teamEditGoal').value||'').trim();
  var msgEl = document.getElementById('teamEditMsg');
  if(!name){ msgEl.textContent = L('チーム名を入力してください','Enter a team name'); return; }
  var btn = document.getElementById('teamEditSaveBtn');
  btn.disabled = true; btn.style.opacity='.7'; btn.textContent = L('保存中…','Saving…');
  try {
    var r = await api('PATCH','/api/agents/'+team.id, { name: name, avatar: emoji, team_goal: goal });
    // Update local copy so the chat header / list reflect the change immediately
    if(r && r.agent){
      Object.assign(team, r.agent);
    } else {
      team.name = name; team.avatar = emoji; team.team_goal = goal;
    }
    showToast(L('保存しました','Saved'),'ok');
    closeTeamEdit();
    renderAgList();
    if(activeId === team.id){
      // Re-render chat header and home dashboard so name/emoji refresh
      try { openAgent(team.id); } catch(e){}
    }
  } catch(e){
    msgEl.textContent = (e.message || L('保存に失敗しました','Save failed'));
    showToast((e.message||L('保存に失敗しました','Save failed')),'ng');
  } finally {
    btn.disabled = false; btn.style.opacity='1'; btn.textContent = '💾 ' + L('保存','Save');
  }
}

/* ── Team members panel (list + edit AI agents in a Team) ─── */
function openTeamMembersPanel(teamId){
  var team = (agents||[]).find(function(a){return a.id===teamId;});
  if(!team || !team.is_team){ showToast(L('チームが見つかりません','Team not found'),'ng'); return; }
  var ov = document.getElementById('teamMembersOverlay');
  if(!ov) return;
  var titleEl = document.getElementById('teamMembersTitle');
  if(titleEl) titleEl.textContent = '🎯 ' + (team.name||L('チーム','Team')) + ' · ' + L('AI メンバー','AI members');
  // Goal row (only when set + only host can edit)
  var goalRow = document.getElementById('teamMembersGoalRow');
  var goalText= document.getElementById('teamMembersGoalText');
  var goalBtn = document.getElementById('teamMembersGoalEditBtn');
  var isTeamHost = team.host_id === me?.id;
  if(goalRow){
    if(team.team_goal && team.team_goal.trim()){
      goalRow.style.display = 'flex';
      if(goalText) goalText.textContent = team.team_goal;
    } else if(isTeamHost){
      goalRow.style.display = 'flex';
      if(goalText) goalText.innerHTML = '<span style="color:var(--text3);font-style:italic">'+L('まだ目的が設定されていません。「✏️ 編集」から追加できます。','No goal yet — click "✏️ Edit" to add one.')+'</span>';
    } else {
      goalRow.style.display = 'none';
    }
    if(goalBtn){
      goalBtn.style.display = isTeamHost ? '' : 'none';
      goalBtn.onclick = function(){ closeTeamMembersPanel(); openTeamEdit(team.id); };
    }
  }
  // "+ Add member" row (host only, hide when team is at the 10-member cap)
  var addRow = document.getElementById('teamMembersAddRow');
  var addBtn = document.getElementById('teamMembersAddBtn');
  var addCap = document.getElementById('teamMembersCapHint');
  var memCount = (team.team_member_agent_ids||[]).length;
  var TEAM_MAX = 10;
  if(addRow){
    addRow.style.display = isTeamHost ? '' : 'none';
    if(addCap) addCap.textContent = '('+memCount+'/'+TEAM_MAX+')';
    if(addBtn){
      var atCap = memCount >= TEAM_MAX;
      addBtn.disabled = atCap;
      addBtn.style.opacity = atCap ? '.55' : '1';
      addBtn.style.cursor  = atCap ? 'not-allowed' : 'pointer';
      addBtn.onclick = atCap ? null : function(){ openAddTeamMember(team.id); };
    }
  }
  var list = document.getElementById('teamMembersList');
  var ids = Array.isArray(team.team_member_agent_ids) ? team.team_member_agent_ids : [];
  var members = ids.map(function(id){return (agents||[]).find(function(a){return a.id===id;});}).filter(Boolean);
  if(!members.length){
    list.innerHTML = '<div style="color:var(--text3);font-size:12.5px;padding:20px;text-align:center">'
      + L('このチームにはメンバーが設定されていません。','No members in this team yet.') + '</div>';
  } else {
    list.innerHTML = members.map(function(m, idx){
      var skillsTxt = (m.skills||[]).map(function(s){var sk=SKILLS.find(function(x){return x.id===s;});return '<span style="display:inline-block;background:var(--cream2);color:var(--text2);font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;border:1px solid var(--wire2);margin-right:4px;margin-top:3px">'+esc(sk?sk.name:s)+'</span>';}).join('');
      var personaPreview = (m.persona||'').slice(0,140);
      if((m.persona||'').length>140) personaPreview += '…';
      var modelLabel = ({haiku:'Haiku',sonnet:'Sonnet',opus:'Opus','gemini-flash':'Haiku','gemini-pro':'Sonnet'}[m.model||'haiku']) || 'Haiku';
      // Remove button only for hosts AND when team has > 1 member (server enforces this too)
      var canRemove = isTeamHost && members.length > 1;
      var rmBtn = canRemove
        ? '<button onclick="removeTeamMember(\''+esc(team.id)+'\',\''+esc(m.id)+'\',\''+esc((m.name||'').replace(/\\|\x27/g,"\\$&"))+'\')" title="'+L('チームから外す','Remove from team')+'" style="background:#fff;color:var(--rose);border:1px solid var(--wire2);border-radius:9px;padding:8px 10px;font-size:11.5px;font-weight:800;cursor:pointer;flex-shrink:0">🗑</button>'
        : '';
      return ''
        + '<div style="background:#fff;border:1px solid var(--wire2);border-radius:13px;padding:14px 14px 12px;display:flex;gap:12px;align-items:flex-start">'
        +   '<div style="width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#fff7ee,#fed7aa);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">'+_avHTML(m.avatar||'🤖')+'</div>'
        +   '<div style="flex:1;min-width:0">'
        +     '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;flex-wrap:wrap">'
        +       '<div style="font-size:14px;font-weight:900;letter-spacing:-.005em">'+esc(m.name||'')+'</div>'
        +       '<span style="font-size:9.5px;font-weight:800;background:rgba(251,146,60,.12);color:var(--peach-dark);padding:1px 7px;border-radius:99px;letter-spacing:.04em">@'+esc((m.name||'').replace(/\s+/g,''))+'</span>'
        +       '<span style="font-size:9.5px;font-weight:700;color:var(--text3)">·</span>'
        +       '<span style="font-size:9.5px;font-weight:700;color:var(--text3)">'+esc(modelLabel)+'</span>'
        +     '</div>'
        +     (personaPreview ? '<div style="font-size:11.5px;color:var(--text2);line-height:1.6;margin-bottom:6px;white-space:pre-wrap">'+esc(personaPreview)+'</div>' : '')
        +     '<div>'+skillsTxt+'</div>'
        +   '</div>'
        +   '<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">'
        +     '<button onclick="closeTeamMembersPanel();openEditAgent(\''+esc(m.id)+'\')" title="'+L('編集','Edit')+'" style="background:var(--peach);color:#fff;border:0;border-radius:9px;padding:8px 12px;font-size:11.5px;font-weight:800;cursor:pointer;box-shadow:0 3px 9px rgba(251,146,60,.25)">✏️ '+L('編集','Edit')+'</button>'
        +     rmBtn
        +   '</div>'
        + '</div>';
    }).join('');
  }
  ov.classList.add('open');
}
function closeTeamMembersPanel(){
  document.getElementById('teamMembersOverlay')?.classList.remove('open');
}

/* ── Remove a member from a team (host only) ───────────────── */
async function removeTeamMember(teamId, memberId, memberName){
  if(!token){ showToast(L('ログインが必要です','Sign in required'),'ng'); return; }
  // Two-step confirm: (1) Remove only or (2) Remove + delete
  var msg = (memberName ? '"'+memberName+'" ' : '') + L(
    'をチームから外しますか？\n\n[OK] = チームから外す (DM タブに戻ります)\n[キャンセル] = やめる',
    ' will be removed from the team?\n\n[OK] = remove only (the agent stays in your DM list)\n[Cancel] = keep'
  );
  if(!confirm(msg)) return;
  // Optional second prompt to fully delete the agent
  var alsoDelete = confirm(L(
    'エージェントも完全に削除しますか？\n\n[OK] = 削除 (履歴含めすべて消えます)\n[キャンセル] = DM に戻すだけ',
    'Also delete the agent permanently?\n\n[OK] = delete (history is lost)\n[Cancel] = keep it as a DM'
  ));
  try {
    var qs = alsoDelete ? '?delete=1' : '';
    await api('DELETE','/api/teams/'+teamId+'/members/'+memberId+qs);
    // Refresh local agents from /api/me
    try {
      var meRes = await api('GET','/api/me');
      if(meRes && meRes.user){ me = meRes.user; if(Array.isArray(me.agents)) agents = me.agents; }
    } catch(e){}
    showToast(L((memberName||'メンバー')+' をチームから外しました', (memberName||'Member')+' removed'),'ok');
    renderAgList();
    try { openTeamMembersPanel(teamId); } catch(e){}
    if(activeId === teamId){ try { openAgent(teamId); } catch(e){} }
  } catch(e){
    showToast((e && e.message) || L('外せませんでした','Failed to remove'),'ng');
  }
}

/* ── Delete the whole team (host only) ─────────────────────── */
async function deleteTeam(teamId){
  if(!token){ showToast(L('ログインが必要です','Sign in required'),'ng'); return; }
  var team = (agents||[]).find(function(a){return a.id===teamId;});
  if(!team || !team.is_team){ showToast(L('チームが見つかりません','Team not found'),'ng'); return; }
  if(team.host_id !== me?.id){ showToast(L('ホストのみ削除できます','Only the host can delete'),'ng'); return; }
  var memCount = (team.team_member_agent_ids||[]).length;
  var msg = '"'+(team.name||'Team')+'" '+L(
    'を削除します。\n\n[OK] = メンバーは DM タブに戻す + チームだけ削除\n[キャンセル] = やめる',
    ' will be deleted.\n\n[OK] = restore members to DM + delete the team only\n[Cancel] = keep'
  ) + (memCount ? '\n('+memCount+L(' 体のメンバー'+'を保存)',' members will be kept)') : '');
  if(!confirm(msg)) return;
  // Second confirm: also delete every member?
  var alsoDeleteMembers = confirm(L(
    'メンバー AI もすべて削除しますか？\n\n[OK] = チームと全メンバーを削除\n[キャンセル] = メンバーは DM に戻す (推奨)',
    'Also delete every member AI?\n\n[OK] = delete the team AND all members\n[Cancel] = keep members in your DM list (recommended)'
  ));
  try {
    var qs = alsoDeleteMembers ? '' : '?keep_members=1';
    await api('DELETE','/api/teams/'+teamId+qs);
    try {
      var meRes = await api('GET','/api/me');
      if(meRes && meRes.user){ me = meRes.user; if(Array.isArray(me.agents)) agents = me.agents; }
    } catch(e){}
    showToast(L('チームを削除しました','Team deleted'),'ok');
    activeId = null;
    document.getElementById('chatWrap').style.display='none';
    document.getElementById('emptyWrap').style.display='';
    renderAgList();
    try { goHome(); } catch(e){}
  } catch(e){
    showToast((e && e.message) || L('削除に失敗しました','Failed to delete'),'ng');
  }
}

/* ── Add a member to an existing team ─────────────────────── */
var _addingMemberTeamId = null;
function openAddTeamMember(teamId){
  var id = teamId || _editingTeamId || activeId;
  var team = (agents||[]).find(function(a){return a.id===id;});
  if(!team || !team.is_team){ showToast(L('チームが見つかりません','Team not found'),'ng'); return; }
  if(team.host_id !== me?.id){ showToast(L('ホストのみメンバーを追加できます','Only the host can add members'),'ng'); return; }
  _addingMemberTeamId = team.id;
  document.getElementById('addMemDesc').value = '';
  document.getElementById('addMemErr').textContent = '';
  // Hide other overlays so this one stacks cleanly
  document.getElementById('teamMembersOverlay')?.classList.remove('open');
  document.getElementById('addTeamMemberOverlay').classList.add('open');
  setTimeout(function(){ document.getElementById('addMemDesc')?.focus(); }, 80);
}
function closeAddTeamMember(){
  document.getElementById('addTeamMemberOverlay')?.classList.remove('open');
  _addingMemberTeamId = null;
}

async function submitAddTeamMember(){
  if(!_addingMemberTeamId){ closeAddTeamMember(); return; }
  if(!token){ showToast(L('ログインが必要です','Sign in required'),'ng'); return; }
  var desc = (document.getElementById('addMemDesc').value||'').trim();
  var errEl = document.getElementById('addMemErr');
  if(desc.length < 4){
    errEl.textContent = L('もう少し詳しく書いてください (4 文字以上)','Please describe the member in a bit more detail');
    return;
  }
  var btn = document.getElementById('addMemSubmitBtn');
  btn.disabled = true; btn.style.opacity='.7'; btn.textContent = L('生成中…','Generating…');
  try {
    var r = await api('POST','/api/teams/'+_addingMemberTeamId+'/add-member', { description: desc, lang: currentLang });
    if(r && r.agent){
      // Refresh local agents from /api/me so team's team_member_agent_ids reflects the new id
      try {
        var meRes = await api('GET','/api/me');
        if(meRes && meRes.user){
          me = meRes.user;
          if(Array.isArray(me.agents)) agents = me.agents;
        }
      } catch(e){ console.warn('[team] /api/me refresh failed', e); }
      var teamId = _addingMemberTeamId;
      closeAddTeamMember();
      showToast(L((r.agent.name||'New member')+' をチームに追加しました', (r.agent.name||'New member')+' joined the team'),'ok');
      renderAgList();
      // Re-open the team members panel so the new member is visible
      try { openTeamMembersPanel(teamId); } catch(e){}
      // If chat is open on this team, refresh history
      if(activeId === teamId){ try { openAgent(teamId); } catch(e){} }
    } else {
      errEl.textContent = L('追加に失敗しました','Failed to add member');
    }
  } catch(e){
    console.error('[team/add-member] failed', e);
    if(e && e.upgrade_required){ closeAddTeamMember(); _showUpgradeToast(e); }
    else { errEl.textContent = e.message || L('追加に失敗しました','Failed to add member'); }
  } finally {
    btn.disabled = false; btn.style.opacity='1'; btn.textContent = '✨ ' + L('AI に作ってもらう','Let AI generate');
  }
}

function confirmBack(){
  if(_wizardMode==='preset') wStep(0);
  else wStep(5);
}
var _selectedPresetIdx=-1;
function buildPresetGrid(){
  var el=document.getElementById('presetGrid');
  if(!el) return;
  el.innerHTML=PRESETS.map(function(p,i){
    var pills=p.skills.map(function(s){var sk=SKILLS.find(function(x){return x.id===s;});return '<span class="preset-pill">'+(sk?sk.name:s)+'</span>';}).join('');
    return '<button type="button" class="preset-card" data-idx="'+i+'" onclick="pickPreset('+i+')">'
      +'<div class="preset-hd"><div class="preset-emo">'+p.avatar+'</div><div class="preset-nm">'+esc(p.name)+'</div></div>'
      +'<div class="preset-sks">'+pills+'</div>'
      +'</button>';
  }).join('');
}
function pickPreset(i){
  _selectedPresetIdx=i;
  document.querySelectorAll('.preset-card').forEach(function(b){b.classList.remove('sel');});
  var sel=document.querySelector('.preset-card[data-idx="'+i+'"]');
  if(sel) sel.classList.add('sel');
  var btn=document.getElementById('usePresetBtn');
  if(btn){ btn.disabled=false; btn.style.opacity='1'; btn.style.cursor='pointer'; }
}
function useSelectedPreset(){
  if(_selectedPresetIdx<0) return;
  var p=PRESETS[_selectedPresetIdx];
  _wizardMode='preset';
  NA={avatar:p.avatar,name:p.name,skills:p.skills.slice(),persona:p.persona,purpose:'',duties:'',chrome_enabled:!!p.chrome_enabled,sheets_enabled:false};
  // Sync form fields so back-navigation reflects preset values
  var wn=document.getElementById('wName'); if(wn) wn.value=p.name;
  var avPrev=document.getElementById('avPrev'); if(avPrev) avPrev.innerHTML=_avHTML(p.avatar);
  document.querySelectorAll('.av-cell').forEach(function(b,i){
    b.classList.toggle('sel',AVATARS[i]===p.avatar);
  });
  document.querySelectorAll('.sk-card').forEach(function(b,i){
    b.classList.toggle('sel',p.skills.indexOf(SKILLS[i].id)>=0);
  });
  if(typeof _renderChromeStatus==='function') _renderChromeStatus('wChromeSw','wChromeDesc',!!p.chrome_enabled);
  if(typeof _renderSheetsStatus==='function') _renderSheetsStatus('wSheetsSw','wSheetsDesc','wSheetsAccountRow','wSheetsEmail','wSheetsConnectBtn',false);
  buildConf();
  wStep(6);
}
function startFromScratch(){
  _wizardMode='new';
  _resetWizardState();
  wStep(1);
}
function closeWizard(){ document.getElementById('wizOverlay').classList.remove('open'); }

/* ── Agent Store ─────────────────────────────────────────────── */
/* Live data: fetched from /api/marketplace. Hardcoded labels mirror server's
   MARKET_CAT_LABEL so search chips work pre-fetch. */
var MARKET_CAT_DEFS = [
  {id:'all',     label:'すべて'},
  {id:'sales',   label:'セールス'},
  {id:'marketing',label:'マーケティング'},
  {id:'research',label:'リサーチ'},
  {id:'writing', label:'ライティング'},
  {id:'ops',     label:'業務効率化'},
  {id:'other',   label:'その他'}
];
var MARKET = [];                       // populated from API
var _marketCat='all', _marketSort='popular', _marketLoading=false, _marketSearchTimer=null;
var _marketTags=[], _marketOnlyFavs=false, _marketTagDefs=[];

async function openAgentStore(){
  _marketCat='all'; _marketSort='popular'; _marketTags=[]; _marketOnlyFavs=false;
  var s=document.getElementById('marketSearch'); if(s) s.value='';
  var sort=document.getElementById('marketSort'); if(sort) sort.value='popular';
  // Default to the App Store-style "Today" tab on every open
  if(typeof setStoreTab === 'function') setStoreTab('today');
  document.getElementById('marketOverlay').classList.add('open');
  await loadMarket();
}

function buildMarketTags(){
  var el=document.getElementById('marketTags'); if(!el) return;
  // Favorites toggle + tag chips (storev2 styled)
  var favPart = '<button type="button" class="storev2-pill fav'+(_marketOnlyFavs?' on':'')+'" onclick="toggleMarketFavs()">❤ '+L('お気に入り','Favorites')+'</button>';
  var tagPart = (_marketTagDefs||[]).map(function(t){
    var on = _marketTags.indexOf(t.id)>=0;
    return '<button type="button" class="storev2-pill'+(on?' on':'')+'" onclick="toggleMarketTag(\''+t.id+'\')">#'+esc(t.label)+'</button>';
  }).join('');
  el.innerHTML = favPart + tagPart;
}
function toggleMarketTag(t){
  var i=_marketTags.indexOf(t);
  if(i>=0) _marketTags.splice(i,1); else _marketTags.push(t);
  buildMarketTags();
  loadMarket();
}
function toggleMarketFavs(){
  _marketOnlyFavs = !_marketOnlyFavs;
  buildMarketTags();
  loadMarket();
}
function closeMarket(){ document.getElementById('marketOverlay').classList.remove('open'); }

async function loadMarket(){
  var heroEl = document.getElementById('storev2Hero');
  var picksEl = document.getElementById('storev2Picks');
  var trendEl = document.getElementById('storev2Trending');
  var catsEl  = document.getElementById('storev2Cats');
  var creatorsEl = document.getElementById('storev2Creators');
  var ctaEl   = document.getElementById('storev2CTA');
  var empty=document.getElementById('marketEmpty');
  // Loading state — show a single spinner row in picks
  if(heroEl) heroEl.innerHTML = '';
  if(picksEl) picksEl.innerHTML = '<div style="padding:48px 20px;text-align:center;color:var(--text3);font-size:13px;font-weight:600">'+L('読み込み中…','Loading…')+'</div>';
  if(trendEl) trendEl.innerHTML = '';
  if(catsEl) catsEl.innerHTML = '';
  if(creatorsEl) creatorsEl.innerHTML = '';
  if(ctaEl) ctaEl.innerHTML = '';
  if(empty) empty.style.display='none';
  _marketLoading=true;
  try{
    var qs=[];
    if(_marketCat && _marketCat!=='all') qs.push('category='+encodeURIComponent(_marketCat));
    var q=(document.getElementById('marketSearch')?.value||'').trim();
    if(q) qs.push('q='+encodeURIComponent(q));
    qs.push('sort='+encodeURIComponent(_marketSort));
    if(_marketTags.length) qs.push('tags='+encodeURIComponent(_marketTags.join(',')));
    if(_marketOnlyFavs) qs.push('favorites=1');
    var r=await api('GET','/api/marketplace?'+qs.join('&'));
    MARKET = r.listings||[];
    if(r.tags && !_marketTagDefs.length){
      _marketTagDefs = r.tags;
      buildMarketTags();
    }
    if(r.favorites && me) me.favorites = r.favorites;
  }catch(e){
    MARKET=[];
    if(picksEl) picksEl.innerHTML='<div style="padding:48px 20px;text-align:center;color:var(--rose);font-size:13px;font-weight:600">'+L('読み込みに失敗しました: ','Failed to load: ')+esc(e.message||'')+'</div>';
    _marketLoading=false;
    return;
  }
  _marketLoading=false;
  renderMarket();
}

// English labels for category pills (and the visual category tiles).
// MARKET_CAT_DEFS still drives server filtering; this map is for display.
var _MARKET_CAT_LABEL_EN = {
  all:'All', sales:'Sales', marketing:'Marketing', research:'Research',
  writing:'Writing', ops:'Productivity', other:'Other',
};
function buildMarketCats(){
  var el=document.getElementById('marketCats'); if(!el) return;
  // Type filters first (All / Teams / Solo / Free), then category chips.
  // Type filter is client-side; the server doesn't have a type query yet so
  // we just store the active type in _marketType and filter MARKET in JS.
  var typePills = [
    {k:'all',  label:L('すべて','All')},
    {k:'team', label:'🎯 ' + L('チーム','Teams')},
    {k:'solo', label:'🤖 ' + L('単体','Solo')},
    {k:'free', label:'🎁 ' + L('無料','Free')},
  ].map(function(t){
    var on = (_marketType||'all') === t.k;
    return '<button type="button" class="storev2-pill'+(on?' on':'')+'" onclick="setMarketType(\''+t.k+'\')">'+t.label+'</button>';
  }).join('');
  var catPills = MARKET_CAT_DEFS.map(function(c){
    var label = currentLang==='en' ? (_MARKET_CAT_LABEL_EN[c.id] || c.label) : c.label;
    return '<button type="button" class="storev2-pill'+(c.id===_marketCat?' on':'')+'" onclick="setMarketCat(\''+c.id+'\')">'+esc(label)+'</button>';
  }).join('');
  el.innerHTML = typePills + '<span class="storev2-pill-divider"></span>' + catPills;
}
var _marketType = 'all';
function setMarketType(t){
  _marketType = (['all','team','solo','free'].indexOf(t)>=0) ? t : 'all';
  buildMarketCats();
  renderMarket(); // type filter is client-side; no need to refetch
}
function setMarketCat(c){
  _marketCat=c;
  buildMarketCats();
  loadMarket();
}
function setMarketSort(s){
  _marketSort=s;
  loadMarket();
}
function onMarketSearchInput(){
  // Debounce: refetch 300ms after the user stops typing
  if(_marketSearchTimer) clearTimeout(_marketSearchTimer);
  _marketSearchTimer = setTimeout(loadMarket, 300);
}

// ── Render a single store v2 card (used by picks + trending) ──
function _storev2RenderCard(m, opts){
  opts = opts || {};
  var favs = new Set(me?.favorites||[]);
  var purchased = new Set((me && me.purchases || []).map(function(p){return p.listing_id;}));
  var isFav = favs.has(m.listing_id);
  var purchasedHere = purchased.has(m.listing_id);
  var priceJpy = Number.isFinite(m.price_jpy) ? m.price_jpy : 0;
  var priceCls = priceJpy > 0 ? '' : ' free';
  var priceTxt = purchasedHere ? '✓ '+L('購入済','Owned')
               : priceJpy > 0 ? jpyAsUsd(priceJpy)
               : L('無料','FREE');
  var typeBadge = m.is_team
    ? '<span class="b team">🎯 TEAM · '+(m.member_count||0)+'</span>'
    : '<span class="b solo">🤖 SOLO</span>';
  var ribbon = '';
  if(opts.rank){
    ribbon = '<span class="ribbon rank">#'+opts.rank+'</span>';
  } else if(m.badge==='hot'){
    ribbon = '<span class="ribbon hot">🔥 HOT</span>';
  } else if(m.badge==='new'){
    ribbon = '<span class="ribbon new">🆕 NEW</span>';
  }
  var stars = m.rating>0 ? '<span class="star">★ '+m.rating.toFixed(1)+'</span>' : '<span style="color:var(--text3)">★ —</span>';
  var skills = (m.agent?.skills||[]).slice(0,3).map(function(s){
    var sk=SKILLS.find(function(x){return x.id===s;});
    return '<span class="skill">'+esc(sk?sk.name:s)+'</span>';
  }).join('');
  var av = m.agent?.avatar || '🤖';
  // Coverage gradient by category for solo agents to match the mock
  var coverStyle = '';
  if(!m.is_team){
    var cat = m.category || 'other';
    var grads = {
      sales:    'linear-gradient(135deg,#dbeafe,#3b82f6);color:#fff',
      marketing:'linear-gradient(135deg,#fce7f3,#ec4899);color:#fff',
      research: 'linear-gradient(135deg,#ede9fe,#8b5cf6);color:#fff',
      writing:  'linear-gradient(135deg,#fff7ee,#fed7aa)',
      ops:      'linear-gradient(135deg,#d1fae5,#10b981);color:#fff',
      other:    'linear-gradient(135deg,#fff7ee,#fed7aa)',
    };
    coverStyle = ' style="background:'+(grads[cat]||grads.other)+'"';
  }
  return ''
    + '<button type="button" class="storev2-card'+(m.is_team?' team':'')+'" onclick="openListingDetail(\''+esc(m.listing_id)+'\')">'
    +   '<div class="cv"'+coverStyle+'>'
    +     ribbon
    +     '<button class="fav'+(isFav?' on':'')+'" title="'+L('お気に入り','Favorite')+'" onclick="event.stopPropagation();toggleFavorite(\''+esc(m.listing_id)+'\',this)">'+(isFav?'❤':'♡')+'</button>'
    +     esc(av)
    +   '</div>'
    +   '<div class="body">'
    +     '<div class="badges">'+typeBadge+'</div>'
    +     '<div class="nm">'+esc(m.title||'')+'</div>'
    +     '<div class="ds">'+esc(m.description||'')+'</div>'
    +     (skills ? '<div class="skills">'+skills+'</div>' : '')
    +     '<div class="meta">'
    +       '<span class="stats">'+stars+(m.rating_count?' <span style="color:var(--text3)">('+m.rating_count+')</span>':'')+'</span>'
    +       '<span class="price'+priceCls+(purchasedHere?' purchased':'')+'">'+priceTxt+'</span>'
    +     '</div>'
    +   '</div>'
    + '</button>';
}

// ── Visible market: applies the client-side type filter ──
function _storev2VisibleMarket(){
  var t = _marketType || 'all';
  if(t === 'all') return MARKET.slice();
  if(t === 'team') return MARKET.filter(function(m){return m.is_team;});
  if(t === 'solo') return MARKET.filter(function(m){return !m.is_team;});
  if(t === 'free') return MARKET.filter(function(m){return !(m.price_jpy > 0);});
  return MARKET.slice();
}

// ── Storev3 (App Store-style) ──
var _storev3Tab = 'today'; // today | apps | teams | cats

function setStoreTab(tab){
  if(['today','apps','teams','cats'].indexOf(tab) < 0) tab = 'today';
  _storev3Tab = tab;
  document.querySelectorAll('.storev3-tab').forEach(function(b){
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  ['storev3Today','storev3Apps','storev3Teams','storev3Cats'].forEach(function(id){
    var key = id.replace('storev3','').toLowerCase();
    var el = document.getElementById(id);
    if(el) el.style.display = (key === tab) ? '' : 'none';
  });
  // Body scroll back to top whenever a tab switches
  var body = document.getElementById('storev3Body');
  if(body) body.scrollTop = 0;
}

// Render a single Top-Charts row (numbered list, App Store classic)
function _storev3RenderRow(m, rank){
  var purchased = new Set((me && me.purchases || []).map(function(p){return p.listing_id;}));
  var purchasedHere = purchased.has(m.listing_id);
  var priceJpy = Number.isFinite(m.price_jpy) ? m.price_jpy : 0;
  var priceText, priceCls;
  if(purchasedHere){ priceText = '✓ ' + L('購入済','OWNED'); priceCls = 'owned'; }
  else if(priceJpy > 0){ priceText = jpyAsUsd(priceJpy); priceCls = ''; }
  else { priceText = L('無料','FREE'); priceCls = 'free'; }
  var av = m.agent?.avatar || (m.is_team ? '🎯' : '🤖');
  var sub = m.is_team
    ? '<span class="badge">🎯 TEAM · '+(m.member_count||0)+'</span>' + esc(m.category_label||'Team')
    : esc((m.category_label||'AI') + ' · ' + (m.creator?.handle||''));
  return ''
    + '<div class="storev3-row'+(m.is_team?' team':'')+'" onclick="openListingDetail(\''+esc(m.listing_id)+'\')">'
    + (rank ? '<div class="rank">'+rank+'</div>' : '')
    +   '<div class="icon" data-cat="'+esc(m.category||'other')+'">'+esc(av)+'</div>'
    +   '<div class="meta"><div class="nm">'+esc(m.title||'')+'</div><div class="sub">'+sub+'</div></div>'
    +   '<button type="button" class="get '+priceCls+'" onclick="event.stopPropagation();openListingDetail(\''+esc(m.listing_id)+'\')">'+priceText+'</button>'
    + '</div>';
}

// Render a single horizontal-scroll tile (used in Today's "Top picks")
function _storev3RenderTile(m){
  var priceJpy = Number.isFinite(m.price_jpy) ? m.price_jpy : 0;
  var priceText, priceCls = '';
  if(priceJpy > 0){ priceText = jpyAsUsd(priceJpy); }
  else { priceText = L('無料','FREE'); priceCls = 'free'; }
  var ribbon = m.badge==='hot' ? '<span class="ribbon">🔥 HOT</span>'
             : m.badge==='new' ? '<span class="ribbon">🆕 NEW</span>' : '';
  var av = m.agent?.avatar || (m.is_team ? '🎯' : '🤖');
  var stars = m.rating>0 ? '<span class="star">★</span> '+m.rating.toFixed(1) : '';
  return ''
    + '<button type="button" class="storev3-tile'+(m.is_team?' team':'')+'" onclick="openListingDetail(\''+esc(m.listing_id)+'\')">'
    +   '<div class="cv">'+ribbon+esc(av)+'</div>'
    +   '<div class="body">'
    +     '<div class="nm">'+esc(m.title||'')+'</div>'
    +     '<div class="sub">'+esc(m.description||'')+'</div>'
    +     '<div class="row"><span>'+stars+'</span><span class="price '+priceCls+'">'+priceText+'</span></div>'
    +   '</div>'
    + '</button>';
}

function renderMarket(){
  if(_marketLoading) return;
  var todayEl = document.getElementById('storev3Today');
  if(!todayEl) return;
  var appsEl   = document.getElementById('storev3Apps');
  var teamsEl  = document.getElementById('storev3Teams');
  var catsEl   = document.getElementById('storev3Cats');
  var empty    = document.getElementById('marketEmpty');

  // Reflect the current top-search box (q) on top of MARKET
  var visible = MARKET.slice();
  // (Search/category are server-side; visible is already filtered.)

  if(!visible.length){
    [todayEl,appsEl,teamsEl,catsEl].forEach(function(e){if(e)e.innerHTML='';});
    if(empty){
      empty.style.display='block';
      empty.textContent = MARKET.length === 0
        ? L('まだ出店されたエージェントがありません。あなたが第1号になりませんか？','No listings yet — be the first to list yours.')
        : L('該当するエージェントが見つかりません','No matching agents — try a different search.');
    }
    return;
  }
  if(empty) empty.style.display='none';

  var soloAll = visible.filter(function(m){return !m.is_team;});
  var teamsAll = visible.filter(function(m){return m.is_team;});

  // ─── TODAY (default) — hero story + 2-up pair + Top Charts list + categories preview + creator CTA ───
  if(todayEl){
    var hero = visible[0];
    var pair = [visible[1], visible[2]].filter(Boolean);
    // Sort top charts by uses, mix of solo + team, take top 10
    var charts = visible.slice().sort(function(a,b){return (b.uses||0)-(a.uses||0);}).slice(0,10);
    // Editor's choice = mix of teams + new badges
    var editor = visible.filter(function(m){return m.is_team || m.badge==='new';}).slice(0,8);
    if(editor.length < 4) editor = visible.slice(0,8);

    // hero
    var heroHtml = '';
    if(hero){
      var heroPriceJpy = Number.isFinite(hero.price_jpy) ? hero.price_jpy : 0;
      var heroPriceText = heroPriceJpy>0 ? jpyAsUsd(heroPriceJpy) : L('無料','FREE');
      var heroPills = '<span class="pill">'+(hero.is_team
        ? '🎯 TEAM · '+(hero.member_count||0)+' AI'
        : '🤖 SOLO AGENT')+'</span>';
      if((hero.uses||0)>=100) heroPills += '<span class="pill">🏆 '+L('ベストセラー','Bestseller')+'</span>';
      heroHtml = ''
        + '<div class="storev3-story" onclick="openListingDetail(\''+esc(hero.listing_id)+'\')">'
        +   '<div class="em">'+esc(hero.agent?.avatar||(hero.is_team?'🎯':'🤖'))+'</div>'
        +   '<div class="info">'
        +     '<span class="kicker">⭐ EDITOR\'S PICK · '+L('今週','This week')+'</span>'
        +     '<h2>'+esc(hero.title||'')+'</h2>'
        +     '<div class="subtitle">'+esc(hero.description||'')+'</div>'
        +     '<div class="row">'
        +       heroPills
        +       '<span class="price">'+heroPriceText+'</span>'
        +       '<button type="button" class="get" onclick="event.stopPropagation();openListingDetail(\''+esc(hero.listing_id)+'\')">'+L('入手する','GET')+'</button>'
        +     '</div>'
        +   '</div>'
        + '</div>';
    }

    // 2-up pair (Most popular + Just added) — only when we have 3+ items
    var pairHtml = '';
    if(pair.length >= 2){
      var p1 = pair[0], p2 = pair[1];
      pairHtml = ''
        + '<div class="storev3-pair">'
        +   '<div class="storev3-pair-card dark" onclick="openListingDetail(\''+esc(p1.listing_id)+'\')">'
        +     '<span class="em">'+esc(p1.agent?.avatar||'🤖')+'</span>'
        +     '<div class="kicker">'+L('注目','Most popular')+'</div>'
        +     '<h3>'+esc(p1.title||'')+'</h3>'
        +     '<div class="sub">'+esc(_trunc(p1.description||'', 80))+'</div>'
        +   '</div>'
        +   '<div class="storev3-pair-card peach" onclick="openListingDetail(\''+esc(p2.listing_id)+'\')">'
        +     '<span class="em">'+esc(p2.agent?.avatar||'🤖')+'</span>'
        +     '<div class="kicker">'+L('新着','Just added')+'</div>'
        +     '<h3>'+esc(p2.title||'')+'</h3>'
        +     '<div class="sub">'+esc(_trunc(p2.description||'', 80))+'</div>'
        +   '</div>'
        + '</div>';
    }

    // Top charts list
    var chartsHtml = ''
      + '<div class="storev3-sh"><div class="ttl"><span class="kicker">'+L('トップチャート','Top Charts')+'</span>'+L('今 No.1','What\'s hot now')+'</div><button class="more" onclick="setStoreTab(\'apps\')">'+L('すべて','See All')+' →</button></div>'
      + '<div class="storev3-charts">' + charts.map(function(m,i){return _storev3RenderRow(m, i+1);}).join('') + '</div>';

    // Editor's choice horizontal scroll
    var editorHtml = '';
    if(editor.length){
      editorHtml = ''
        + '<div class="storev3-sh"><div class="ttl"><span class="kicker">'+L('編集部のおすすめ','Editor\'s Choice')+'</span>'+L('プロが選ぶ','Hand-picked')+'</div></div>'
        + '<div class="storev3-hscroll">' + editor.map(_storev3RenderTile).join('') + '</div>';
    }

    // Categories preview (4 tiles)
    var counts = {};
    MARKET.forEach(function(m){ var c = m.category || 'other'; counts[c] = (counts[c]||0) + 1; });
    var catTiles = [
      {id:'marketing', cls:'c1', em:'📈', en:'Marketing',    ja:'マーケティング'},
      {id:'sales',     cls:'c2', em:'💼', en:'Sales',        ja:'セールス'},
      {id:'research',  cls:'c3', em:'🔍', en:'Research',     ja:'リサーチ'},
      {id:'writing',   cls:'c4', em:'✍️', en:'Writing',      ja:'ライティング'},
      {id:'ops',       cls:'c5', em:'⚙️', en:'Productivity', ja:'業務効率化'},
      {id:'other',     cls:'c6', em:'✨', en:'Other',        ja:'その他'},
    ];
    var catsHtml = ''
      + '<div class="storev3-sh"><div class="ttl">'+L('カテゴリで探す','Browse by Category')+'</div><button class="more" onclick="setStoreTab(\'cats\')">'+L('すべて','See All')+' →</button></div>'
      + '<div class="storev3-cats">'
      + catTiles.map(function(t){
          var label = currentLang==='en' ? t.en : t.ja;
          return '<button type="button" class="storev3-cat '+t.cls+'" onclick="setMarketCat(\''+t.id+'\');setStoreTab(\'apps\')">'
            + '<div class="em">'+t.em+'</div>'
            + '<div class="meta"><div class="nm">'+label+'</div><div class="ct">'+(counts[t.id]||0)+' '+L('件','listings')+'</div></div>'
            + '<div class="arrow">›</div>'
            + '</button>';
        }).join('')
      + '</div>';

    // Become a creator
    var totalListings = MARKET.length;
    var teamPacks = teamsAll.length;
    var creatorHtml = ''
      + '<div class="storev3-creator-cta">'
      +   '<div class="text">'
      +     '<h3>'+L('作ったら、ストアへ。','Built something? ')+'<span class="accent">'+L('','List it.')+'</span></h3>'
      +     '<p>'+L('自分用に作った AI を商品にできる。買い切りの最大 80% + 利用料 10% が収益。Stripe Connect で銀行口座へ自動入金。',
                     'Turn the AI you built for yourself into a product. Up to 80% creator share + 10% usage royalties — paid out via Stripe Connect.')+'</p>'
      +     '<button type="button" onclick="_storev2OpenCreator()">'+L('クリエイターになる','Become a creator')+' →</button>'
      +   '</div>'
      +   '<div class="stats">'
      +     '<div class="stat"><div class="num">'+totalListings+'</div><div class="lbl">'+L('公開中','Live')+'</div></div>'
      +     '<div class="stat"><div class="num">'+teamPacks+'</div><div class="lbl">'+L('Team','Teams')+'</div></div>'
      +     '<div class="stat"><div class="num">80%</div><div class="lbl">'+L('クリエイター取り分','Creator share')+'</div></div>'
      +     '<div class="stat"><div class="num">7d</div><div class="lbl">'+L('初回出金','To 1st payout')+'</div></div>'
      +   '</div>'
      + '</div>';

    todayEl.innerHTML = heroHtml + pairHtml + chartsHtml + editorHtml + catsHtml + creatorHtml;
  }

  // ─── APPS tab — full list of solo agents ───
  if(appsEl){
    if(!soloAll.length){
      appsEl.innerHTML = '<div class="storev3-empty">'+L('単体エージェントはまだありません','No solo agents yet')+'</div>';
    } else {
      appsEl.innerHTML = ''
        + '<div class="storev3-sh"><div class="ttl">'+L('AI Agents','AI Agents')+' <span style="font-weight:600;color:rgba(60,60,67,.55);font-size:15px;letter-spacing:0">'+soloAll.length+'</span></div></div>'
        + '<div class="storev3-list">' + soloAll.map(function(m,i){return _storev3RenderRow(m, i+1);}).join('') + '</div>';
    }
  }

  // ─── TEAMS tab — full list of teams ───
  if(teamsEl){
    if(!teamsAll.length){
      teamsEl.innerHTML = '<div class="storev3-empty">'+L('チームはまだありません','No teams yet')+'</div>';
    } else {
      teamsEl.innerHTML = ''
        + '<div class="storev3-sh"><div class="ttl">🎯 '+L('Agent Teams','Agent Teams')+' <span style="font-weight:600;color:rgba(60,60,67,.55);font-size:15px;letter-spacing:0">'+teamsAll.length+'</span></div></div>'
        + '<div class="storev3-list">' + teamsAll.map(function(m,i){return _storev3RenderRow(m, i+1);}).join('') + '</div>';
    }
  }

  // ─── CATEGORIES tab — full grid + per-category counts ───
  if(catsEl){
    var counts2 = {};
    MARKET.forEach(function(m){ var c = m.category || 'other'; counts2[c] = (counts2[c]||0) + 1; });
    var tilesAll = [
      {id:'marketing', cls:'c1', em:'📈', en:'Marketing',    ja:'マーケティング'},
      {id:'sales',     cls:'c2', em:'💼', en:'Sales',        ja:'セールス'},
      {id:'research',  cls:'c3', em:'🔍', en:'Research',     ja:'リサーチ'},
      {id:'writing',   cls:'c4', em:'✍️', en:'Writing',      ja:'ライティング'},
      {id:'ops',       cls:'c5', em:'⚙️', en:'Productivity', ja:'業務効率化'},
      {id:'other',     cls:'c6', em:'✨', en:'Other',        ja:'その他'},
    ];
    catsEl.innerHTML = ''
      + '<div class="storev3-sh"><div class="ttl">'+L('カテゴリで探す','Browse by Category')+'</div></div>'
      + '<div class="storev3-cats">'
      + tilesAll.map(function(t){
          var label = currentLang==='en' ? t.en : t.ja;
          return '<button type="button" class="storev3-cat '+t.cls+'" onclick="setMarketCat(\''+t.id+'\');setStoreTab(\'apps\')">'
            + '<div class="em">'+t.em+'</div>'
            + '<div class="meta"><div class="nm">'+label+'</div><div class="ct">'+(counts2[t.id]||0)+' '+L('件','listings')+'</div></div>'
            + '<div class="arrow">›</div>'
            + '</button>';
        }).join('')
      + '</div>';
  }

  return; // skip the legacy storev2 path
}

// Helper: shorter trunc for storev3 cards (used above)
function _trunc(s, n){ s = String(s||''); return s.length > n ? s.slice(0, n-1) + '…' : s; }

// ── LEGACY storev2 render (no longer called, kept for safety) ──
function _renderMarket_legacy_v2(){
  if(_marketLoading) return;
  var picksEl = document.getElementById('storev2Picks');
  if(!picksEl) return;
  var heroEl = document.getElementById('storev2Hero');
  var trendEl = document.getElementById('storev2Trending');
  var catsEl  = document.getElementById('storev2Cats');
  var creatorsEl = document.getElementById('storev2Creators');
  var ctaEl   = document.getElementById('storev2CTA');
  var empty=document.getElementById('marketEmpty');
  var visible = _storev2VisibleMarket();

  if(!visible.length){
    [heroEl,picksEl,trendEl,catsEl,creatorsEl,ctaEl].forEach(function(e){if(e)e.innerHTML='';});
    if(empty){
      empty.style.display='block';
      empty.textContent = MARKET.length === 0
        ? L('まだ出店されたエージェントがありません。あなたが第1号になりませんか？','No listings yet — be the first to list yours.')
        : L('該当するエージェントが見つかりません','No matching agents — try a different search.');
    }
    return;
  }
  if(empty) empty.style.display='none';

  // Hero featured: top item by uses (already roughly sorted by `popular`)
  var hero = visible[0];
  if(hero && heroEl){
    var heroPriceJpy = Number.isFinite(hero.price_jpy) ? hero.price_jpy : 0;
    var heroPrice = heroPriceJpy>0 ? jpyAsUsd(heroPriceJpy) : L('無料','FREE');
    var heroPriceCls = heroPriceJpy>0 ? '' : ' free';
    var heroPills = '<span class="storev2-hero-pill team">'+(hero.is_team
      ? '🎯 TEAM · '+(hero.member_count||0)+' AI'
      : '🤖 SOLO AGENT')+'</span>';
    if((hero.uses||0)>=100) heroPills += '<span class="storev2-hero-pill">🏆 '+L('ベストセラー','Bestseller')+'</span>';
    if((hero.uses||0)>0)    heroPills += '<span class="storev2-hero-pill">'+(hero.uses||0)+' '+L('利用','pulls')+'</span>';
    var heroStars = hero.rating>0 ? '★★★★★ '+hero.rating.toFixed(1)+' <span style="opacity:.7">('+hero.rating_count+')</span>' : '★ '+L('未評価','no ratings');
    var heroCreator = esc(hero.creator?.handle||'');
    var heroVerified = hero.creator?.is_verified ? '<span style="display:inline-flex;width:13px;height:13px;border-radius:50%;background:#2563eb;color:#fff;align-items:center;justify-content:center;font-size:8px;font-weight:900;margin-left:3px;vertical-align:middle">✓</span>' : '';
    var heroMembersHtml = '';
    if(hero.is_team && Array.isArray(hero.team_members) && hero.team_members.length){
      var avs = hero.team_members.slice(0,5).map(function(mm){return '<div class="av">'+esc(mm.avatar||'🤖')+'</div>';}).join('');
      heroMembersHtml = '<div class="storev2-hero-members">'+avs+'<span class="ct">'+(hero.member_count||hero.team_members.length)+' AGENTS</span></div>';
    }
    heroEl.innerHTML = ''
      + '<div class="storev2-hero" onclick="openListingDetail(\''+esc(hero.listing_id)+'\')">'
      +   '<div class="storev2-hero-cover">'
      +     '<span class="badge">⭐<span class="gold">EDITORS\' PICK</span> · '+L('今週','This week')+'</span>'
      +     '<div class="em-card">'+esc(hero.agent?.avatar||hero.is_team?'🎯':'🤖')+'</div>'
      +   '</div>'
      +   '<div class="storev2-hero-info">'
      +     '<div class="storev2-hero-pills">'+heroPills+'</div>'
      +     '<h3>'+esc(hero.title||'').toUpperCase()+'</h3>'
      +     '<div class="desc">'+esc(hero.description||'')+'</div>'
      +     '<div class="storev2-hero-stats">'
      +       '<span>'+heroStars+'</span>'
      +       '<span>·</span>'
      +       '<span>by <b>'+heroCreator+'</b>'+heroVerified+'</span>'
      +     '</div>'
      +     '<div class="storev2-hero-cta-row">'
      +       '<button type="button" class="storev2-btn primary" onclick="event.stopPropagation();openListingDetail(\''+esc(hero.listing_id)+'\')">'+L('入手する','Get this')+' →</button>'
      +       '<span class="price'+heroPriceCls+'">'+heroPrice+(heroPriceJpy>0?'<span class="small">/'+(hero.is_team?L('チーム','team'):L('エージェント','agent'))+'</span>':'')+'</span>'
      +     '</div>'
      +   '</div>'
      +   heroMembersHtml
      + '</div>';
  }

  // Top picks: next 6 items after the hero
  var picks = visible.slice(1, 7);
  picksEl.innerHTML = ''
    + '<div class="storev2-section-h"><h2>'+L('トップピック','Top picks')+' <span class="muted">'+L('今月','this month')+'</span></h2><a href="#" class="more" onclick="event.preventDefault();_storev2ShowAll()">'+L('すべて','See all')+' '+visible.length+' →</a></div>'
    + '<div class="storev2-grid">' + picks.map(function(m){return _storev2RenderCard(m);}).join('') + '</div>';

  // Trending: top 6 by uses (or hot badge)
  if(trendEl){
    var trending = visible.slice().sort(function(a,b){
      // hot first, then by uses desc
      var aH = a.badge==='hot' ? 1 : 0, bH = b.badge==='hot' ? 1 : 0;
      if(aH !== bH) return bH - aH;
      return (b.uses||0) - (a.uses||0);
    }).slice(0, 8);
    if(trending.length >= 4){
      trendEl.innerHTML = ''
        + '<div class="storev2-section-h"><h2>'+L('トレンド','Trending')+' <span class="muted">'+L('今週','this week')+'</span></h2></div>'
        + '<div class="storev2-h-scroll">' + trending.map(function(m, i){return _storev2RenderCard(m, {rank: i+1});}).join('') + '</div>';
    } else {
      trendEl.innerHTML = '';
    }
  }

  // Categories: visual tile grid with counts derived from MARKET
  if(catsEl){
    var counts = {};
    MARKET.forEach(function(m){ var c = m.category || 'other'; counts[c] = (counts[c]||0) + 1; });
    var tiles = [
      {id:'marketing', cls:'c1', em:'📈', en:'Marketing',    ja:'マーケティング'},
      {id:'sales',     cls:'c2', em:'💼', en:'Sales',        ja:'セールス'},
      {id:'research',  cls:'c3', em:'🔍', en:'Research',     ja:'リサーチ'},
      {id:'writing',   cls:'c4', em:'✍️', en:'Writing',      ja:'ライティング'},
      {id:'ops',       cls:'c5', em:'⚙️', en:'Productivity', ja:'業務効率化'},
      {id:'other',     cls:'c6', em:'✨', en:'Other',        ja:'その他'},
    ];
    catsEl.innerHTML = ''
      + '<div class="storev2-section-h"><h2>'+L('カテゴリ別','Browse by')+' <span class="muted">'+L('カテゴリ','category')+'</span></h2></div>'
      + '<div class="storev2-cat-grid">'
      + tiles.map(function(t){
          var label = currentLang==='en' ? t.en : t.ja;
          return '<button type="button" class="storev2-cat '+t.cls+'" onclick="setMarketCat(\''+t.id+'\')">'
            + '<div class="em">'+t.em+'</div>'
            + '<div class="nm">'+label+'</div>'
            + '<div class="ct">'+(counts[t.id]||0)+'</div>'
            + '</button>';
        }).join('')
      + '</div>';
  }

  // Top creators: aggregate from MARKET, top 6 by listing count
  if(creatorsEl){
    var byCreator = {};
    MARKET.forEach(function(m){
      var h = m.creator?.handle; if(!h) return;
      if(!byCreator[h]) byCreator[h] = { handle:h, count:0, verified:!!m.creator?.is_verified, name: m.creator?.name||h };
      byCreator[h].count++;
      if(m.creator?.is_verified) byCreator[h].verified = true;
    });
    var creators = Object.values(byCreator).sort(function(a,b){return b.count - a.count;}).slice(0, 6);
    if(creators.length){
      var palette = ['#fb923c→#ea580c','#3b82f6→#1d4ed8','#ec4899→#be185d','#10b981→#047857','#8b5cf6→#6d28d9','#f59e0b→#d97706'];
      creatorsEl.innerHTML = ''
        + '<div class="storev2-section-h"><h2>'+L('トップクリエイター','Top creators')+'</h2></div>'
        + '<div class="storev2-creators">'
        + creators.map(function(c, i){
            var initial = (c.name||c.handle||'?').replace('@','').charAt(0).toUpperCase();
            var pg = palette[i % palette.length].split('→');
            return '<button type="button" class="storev2-creator" onclick="openCreatorProfile(\''+esc(c.handle)+'\')">'
              + '<div class="av" style="background:linear-gradient(135deg,'+pg[0]+','+pg[1]+')">'+esc(initial)+'</div>'
              + '<div class="nm">'+esc(c.handle)+(c.verified?' <span class="verified">✓</span>':'')+'</div>'
              + '<div class="meta">'+c.count+' '+L('出店','listings')+'</div>'
              + '</button>';
          }).join('')
        + '</div>';
    } else {
      creatorsEl.innerHTML = '';
    }
  }

  // Become a creator CTA
  if(ctaEl){
    var totalListings = MARKET.length;
    var teamPacks = MARKET.filter(function(m){return m.is_team;}).length;
    ctaEl.innerHTML = ''
      + '<div class="storev2-cta">'
      +   '<div class="storev2-cta-text">'
      +     '<span class="kicker">'+L('寝てる間に稼ぐ','Earn while you sleep')+'</span>'
      +     '<h3>'+L('作ったの、いいやつ？','Built something ')+'<span class="accent">'+L('?','good?')+'</span><br>'+L('ストアに並べよう。','List it on the Store.')+'</h3>'
      +     '<p>'+L('自分用に作った AI を商品にできる。','Turn the AI you built for yourself into a product.')
      +     ' <b>'+L('買い切り価格の最大 80% + 利用料 10% が収益。','Up to 80% creator share + 10% usage royalties.')+'</b>'
      +     ' '+L('Stripe Connect で銀行口座へ自動入金。','Stripe Connect deposits revenue directly to your bank.')+'</p>'
      +     '<button type="button" class="storev2-btn" onclick="_storev2OpenCreator()">'+L('クリエイターになる','Become a creator')+' →</button>'
      +   '</div>'
      +   '<div class="storev2-cta-stats">'
      +     '<div class="storev2-cta-stat"><div class="num">'+totalListings+'</div><div class="lbl">'+L('公開中の出店','Live listings')+'</div></div>'
      +     '<div class="storev2-cta-stat"><div class="num">'+teamPacks+'</div><div class="lbl">'+L('チームパック','Team packs')+'</div></div>'
      +     '<div class="storev2-cta-stat"><div class="num">80<span style="font-size:18px;color:rgba(255,245,230,.72)">%</span></div><div class="lbl">'+L('クリエイター取り分','Creator share')+'</div></div>'
      +     '<div class="storev2-cta-stat"><div class="num">7<span style="font-size:18px;color:rgba(255,245,230,.72)">d</span></div><div class="lbl">'+L('初回出金まで','To 1st payout')+'</div></div>'
      +   '</div>'
      + '</div>';
  }
}

function _storev2ShowAll(){
  // Reset filters back to "All" and scroll to picks so the user sees everything
  _marketType = 'all';
  _marketCat = 'all';
  buildMarketCats();
  renderMarket();
  document.getElementById('storev2Picks')?.scrollIntoView({behavior:'smooth', block:'start'});
}
function _storev2OpenCreator(){
  closeMarket();
  try { openSettings(); } catch(e){}
  setTimeout(function(){
    var b = document.querySelector('.snav-item[data-tab="creator"]');
    if(b) b.click();
  }, 140);
}

async function toggleFavorite(listingId, btn){
  // event already stopped by inline; avoid card click
  event.stopPropagation();
  if(!me) return;
  me.favorites = me.favorites || [];
  var was = me.favorites.indexOf(listingId)>=0;
  try{
    if(was){
      await api('DELETE','/api/favorites/'+listingId);
      me.favorites = me.favorites.filter(x=>x!==listingId);
      if(btn){ btn.classList.remove('on'); btn.textContent='♡'; }
    } else {
      await api('POST','/api/favorites/'+listingId);
      me.favorites.push(listingId);
      if(btn){ btn.classList.add('on'); btn.textContent='❤'; }
    }
  }catch(e){
    showToast(e.message||'失敗','ng');
  }
}

/* ── Listing detail modal (drill-in) ────────────────────────── */
var _detailListingId = null;
var _detailRating = 0;

async function openListingDetail(listingId){
  _detailListingId = listingId;
  document.getElementById('listingDetailOverlay').classList.add('open');
  var body = document.getElementById('ldBody');
  body.innerHTML = '<div class="creator-loading">読み込み中…</div>';
  try{
    var d = await api('GET','/api/marketplace/'+listingId);
    document.getElementById('ldTitle').textContent = d.title || 'エージェント詳細';
    body.innerHTML = _renderListingDetail(d);
    _detailRating = d.my_review ? d.my_review.rating : 0;
    _renderRatingStars();
  }catch(e){
    body.innerHTML = '<div class="creator-loading" style="color:var(--rose)">読み込みに失敗: '+esc(e.message||'')+'</div>';
  }
}
function closeListingDetail(){
  document.getElementById('listingDetailOverlay').classList.remove('open');
  _detailListingId = null; _detailRating = 0;
}

function _renderListingDetail(d){
  var creatorH = esc(d.creator?.handle||'');
  var stars = (d.rating||0) > 0
    ? '★ <b>'+d.rating.toFixed(1)+'</b> <span style="color:var(--text3);font-weight:600">('+(d.rating_count||0)+')</span>'
    : '<span style="color:var(--text3)">★ 未評価</span>';
  var skillsHtml = (d.agent?.skills||[]).map(function(s){
    var sk=SKILLS.find(function(x){return x.id===s;});
    return '<span class="pl">'+(sk?(sk.icon+' '+sk.name):s)+'</span>';
  }).join('');
  if(d.agent?.chrome_enabled) skillsHtml += '<span class="pl chrome">🌐 Web 検索 / URL 取得</span>';

  var demosHtml = '';
  if(d.demo_prompts && d.demo_prompts.length){
    demosHtml = '<div class="ld-section"><div class="ld-section-h">デモプロンプト（クリックして clone 後すぐ試せる）</div><div class="ld-demos">'
      + d.demo_prompts.map(function(p,i){
          var safe = p.replace(/'/g,"\\'").replace(/"/g,'&quot;');
          return '<button class="ld-demo" onclick="cloneAndTry(\''+esc(d.listing_id)+'\','+i+')"><span class="ic">▸</span>'+esc(p)+'</button>';
        }).join('')
      + '</div></div>';
  }

  // Reviews section
  var reviewFormHtml = '';
  if(d.can_review){
    reviewFormHtml = '<div class="ld-rv-form">'
      + '<div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">'+(d.my_review ? 'あなたの評価を編集' : 'このエージェントを評価')+'</div>'
      + '<div class="ld-rv-stars" id="ldRvStars">'
        + [1,2,3,4,5].map(function(n){return '<button class="ld-rv-star" type="button" data-n="'+n+'" onclick="setDetailRating('+n+')">★</button>';}).join('')
      + '</div>'
      + '<textarea class="ld-rv-comment" id="ldRvComment" maxlength="1000" placeholder="どんな時に便利だったか・おすすめポイント（任意）">'+esc(d.my_review?.comment||'')+'</textarea>'
      + '<button class="ld-rv-submit" onclick="submitDetailReview()">'+(d.my_review ? '評価を更新' : '評価を投稿')+'</button>'
      + '</div>';
  } else if(d.is_own){
    reviewFormHtml = '<div style="padding:10px 14px;background:var(--cream2);border-radius:10px;font-size:12px;color:var(--text3);margin-bottom:12px">自分の出店には評価できません</div>';
  }

  var reviewsListHtml = (d.reviews && d.reviews.length)
    ? '<div class="ld-rv-list">' + d.reviews.map(function(r){
        var dt=new Date(r.date); var dStr=(dt.getMonth()+1)+'/'+dt.getDate();
        return '<div class="ld-rv-row">'
          + '<div class="ld-rv-head"><span class="h">'+esc(r.handle||'')+'</span><span class="s">'+'★'.repeat(r.rating)+'</span><span style="color:var(--text3)">'+dStr+(r.edited_at?' (編集済)':'')+'</span>'+(r.is_mine?'<span class="mine">あなた</span>':'')+'</div>'
          + (r.comment ? '<div class="txt">'+esc(r.comment)+'</div>' : '')
          + (r.is_mine ? '<button class="del" onclick="deleteDetailReview()">削除</button>' : '')
          + '</div>';
      }).join('') + '</div>'
    : '<div style="padding:24px 16px;text-align:center;color:var(--text3);font-size:13px;font-weight:600;background:var(--cream);border:1px dashed var(--wire2);border-radius:11px">まだ評価がありません</div>';

  var isFav = (me?.favorites||[]).indexOf(d.listing_id)>=0;
  var verifiedSpan = d.creator?.is_verified
    ? '<span class="mc-verified" title="検証済みクリエイター" style="width:16px;height:16px;font-size:10px">✓</span>'
    : '';
  var tagChipsHtml = (d.tag_labels||[]).map(function(t){
    return '<span class="pl">'+esc(t)+'</span>';
  }).join('');
  var priceJpy = Number.isFinite(d.price_jpy) ? d.price_jpy : 0;
  var purchasedHere = (me && me.purchases || []).some(function(p){return p.listing_id===d.listing_id;});
  var priceDisplay = priceJpy > 0
    ? (purchasedHere
        ? '<div style="font-size:13px;font-weight:800;color:var(--peach-dark);background:rgba(251,146,60,.1);border:1px solid var(--peach);padding:6px 12px;border-radius:8px;display:inline-block">✓ 購入済 (¥'+priceJpy.toLocaleString()+')</div>'
        : '<div style="font-size:22px;font-weight:900;color:var(--text);font-feature-settings:\'tnum\';margin-bottom:2px">¥'+priceJpy.toLocaleString()+'</div><div style="font-size:10.5px;color:var(--text3);font-weight:600">買い切り</div>')
    : '<div style="font-size:13px;font-weight:800;color:var(--green);background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);padding:6px 12px;border-radius:8px;display:inline-block">🎁 無料</div>';
  return ''
    + '<div class="ld-hero">'
      + '<div class="ld-av">'+_avHTML(d.agent?.avatar)+'</div>'
      + '<div class="ld-info">'
        + '<div class="ld-cat">'+esc(d.category_label||'')+'</div>'
        + '<div class="ld-name">'+esc(d.title||'')+'</div>'
        + '<div class="ld-creator">クリエイター: <a href="javascript:void(0)" onclick="closeListingDetail();openCreatorProfile(\''+creatorH+'\')">'+creatorH+verifiedSpan+'</a></div>'
        + '<div style="margin-top:10px">'+priceDisplay+'</div>'
      + '</div>'
      + '<div class="ld-pri">'
        + '<div class="ld-rating">'+stars+'</div>'
        + '<div class="ld-uses">利用 '+(d.uses||0).toLocaleString()+' 回</div>'
        + '<button class="ld-fav'+(isFav?' on':'')+'" onclick="toggleFavorite(\''+esc(d.listing_id)+'\',this)">'+(isFav?'❤ お気に入り':'♡ お気に入り')+'</button>'
      + '</div>'
    + '</div>'
    + (tagChipsHtml ? '<div class="ld-section"><div class="ld-section-h">タグ</div><div class="ld-pills">'+tagChipsHtml+'</div></div>' : '')
    + '<div class="ld-section"><div class="ld-section-h">説明</div><div class="ld-desc">'+esc(d.description||'')+'</div></div>'
    + (skillsHtml ? '<div class="ld-section"><div class="ld-section-h">スキル / 機能</div><div class="ld-pills">'+skillsHtml+'</div></div>' : '')
    + demosHtml
    + '<div class="ld-section">'
      + '<div class="ld-section-h">評価とレビュー ('+(d.rating_count||0)+')</div>'
      + reviewFormHtml
      + reviewsListHtml
    + '</div>'
    + '<div class="ld-actions">'
      + (!d.is_own ? '<button class="btn-report" onclick="openReportListing(\''+esc(d.listing_id)+'\',\''+esc(d.title||'').replace(/\\|\x27/g,"\\$&")+'\')">⚠ 通報する</button>' : '')
      + '<button class="btn-share" onclick="openShareListing(\''+esc(d.listing_id)+'\',\''+esc(d.title||'').replace(/\\|\x27/g,"\\$&")+'\')">🔗 シェア</button>'
      + (!d.is_own
          ? '<button class="btn-clone" onclick="cloneListingFromDetail()">'
            + (priceJpy > 0 && !purchasedHere
                ? '🛍️ ¥'+priceJpy.toLocaleString()+' で購入してチームに追加'
                : '＋ チームに追加')
            + '</button>'
          : '<span style="color:var(--text3);font-size:12px;font-weight:600;align-self:center">これは自分の出店です</span>')
    + '</div>';
}

function setDetailRating(n){
  _detailRating = n;
  _renderRatingStars();
}
function _renderRatingStars(){
  var stars = document.querySelectorAll('#ldRvStars .ld-rv-star');
  stars.forEach(function(s){
    var n = parseInt(s.dataset.n,10);
    s.classList.toggle('on', n<=_detailRating);
  });
}
async function submitDetailReview(){
  if(!_detailListingId) return;
  if(!_detailRating){ showToast(L('星を選んでください','Please pick a star rating'),'ng'); return; }
  var comment = document.getElementById('ldRvComment').value.trim();
  try{
    await api('POST','/api/marketplace/'+_detailListingId+'/review',{rating:_detailRating, comment});
    showToast(L('評価を投稿しました','Review posted'),'ok');
    openListingDetail(_detailListingId); // refresh
  }catch(e){ showToast(e.message||'失敗','ng'); }
}
async function deleteDetailReview(){
  if(!_detailListingId) return;
  if(!confirm(L('この評価を削除しますか？','Delete this review?'))) return;
  try{
    await api('DELETE','/api/marketplace/'+_detailListingId+'/review');
    showToast(L('評価を削除しました','Review deleted'),'ok');
    openListingDetail(_detailListingId);
  }catch(e){ showToast(e.message||'失敗','ng'); }
}

async function cloneListingFromDetail(){
  if(!_detailListingId) return;
  // For paid listings not yet purchased, route through purchase confirm first
  if(await _maybePurchaseFlow(_detailListingId)){
    /* purchase succeeded → fall through to clone */
  } else {
    return; // user cancelled or insufficient balance
  }
  try{
    var r=await api('POST','/api/marketplace/'+_detailListingId+'/clone');
    if(r.agent){
      agents.push({...r.agent, history:[]});
      activeId = r.agent.id;
      closeListingDetail();
      closeMarket();
      renderAgList();
      openAgent(r.agent.id);
      showToast(L('チームに追加しました','Added to your team'),'ok');
    }
  }catch(e){ showToast(e.message||'追加失敗','ng'); }
}

/* Purchase gating helper.
 * Returns true if the listing is free/already-purchased OR purchase just succeeded.
 * Returns false if user cancelled or purchase failed.
 */
async function _maybePurchaseFlow(listingId){
  var detail = MARKET.find(function(m){return m.listing_id===listingId;});
  // If detail not in cache, fetch it
  if(!detail){
    try{ detail = await api('GET','/api/marketplace/'+listingId); }
    catch(e){ return true; /* let clone API decide */ }
  }
  var price = Number.isFinite(detail.price_jpy) ? detail.price_jpy : 0;
  if(price <= 0) return true; // free
  var purchased = (me && me.purchases || []).some(function(p){return p.listing_id===listingId;});
  if(purchased) return true;
  // Need purchase
  return await _confirmPurchase(listingId, detail);
}

function _confirmPurchase(listingId, detail){
  return new Promise(function(resolve){
    var price = detail.price_jpy || 0;
    var title = detail.title || 'エージェント';
    var balance = (me && me.balance_jpy) || 0;
    var enough = balance >= price;
    var html = '<div style="padding:24px;text-align:center">'
      + '<div style="font-size:32px;margin-bottom:8px">🛍️</div>'
      + '<div style="font-size:17px;font-weight:900;color:var(--text);margin-bottom:18px">この有料エージェントを購入</div>'
      + '<div style="background:var(--cream2);border:1px solid var(--wire2);border-radius:12px;padding:16px;margin-bottom:16px">'
      + '<div style="font-size:13px;color:var(--text2);margin-bottom:6px">'+esc(title)+'</div>'
      + '<div style="font-size:32px;font-weight:900;color:var(--text);font-feature-settings:\"tnum\"">¥'+price.toLocaleString()+'</div>'
      + '</div>'
      + '<div style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.7">残高: <b>¥'+Math.floor(balance).toLocaleString()+'</b><br>購入後の残高: <b>¥'+Math.floor(balance-price).toLocaleString()+'</b></div>'
      + (enough ? '' : '<div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;padding:10px;font-size:12px;color:var(--rose);font-weight:700;margin-bottom:14px">残高が不足しています。設定 → 残高 で追加してください。</div>')
      + '<div style="display:flex;gap:8px">'
      + '<button class="btn-back" id="purchCancelBtn" style="flex:1">キャンセル</button>'
      + '<button class="btn-volt" id="purchOkBtn" style="flex:1"'+(enough?'':' disabled')+'>'+(enough?'¥'+price.toLocaleString()+' で購入':'残高不足')+'</button>'
      + '</div>'
      + '<div style="font-size:10.5px;color:var(--text3);margin-top:12px;line-height:1.6">購入後はマイエージェントに追加され、いつでも利用可能になります。<br>払戻し不可。クリエイターに 70% が分配されます。</div>'
      + '</div>';
    // Reuse a simple ad-hoc overlay
    var ov = document.createElement('div');
    ov.className = 'overlay open';
    ov.style.cssText = 'z-index:1000';
    ov.innerHTML = '<div class="wizard" style="max-width:380px"><div class="wiz-body" style="padding:0">'+html+'</div></div>';
    document.body.appendChild(ov);
    var cleanup = function(ok){ document.body.removeChild(ov); resolve(!!ok); };
    ov.querySelector('#purchCancelBtn').onclick = function(){ cleanup(false); };
    var okBtn = ov.querySelector('#purchOkBtn');
    if(okBtn){
      okBtn.onclick = async function(){
        okBtn.disabled = true; okBtn.textContent = '購入処理中…';
        try{
          var pr = await api('POST','/api/marketplace/'+listingId+'/purchase');
          if(pr.ok){
            // Update local state
            me.purchases = me.purchases || [];
            if(pr.purchase) me.purchases.push(pr.purchase);
            if(typeof pr.balance_jpy === 'number') me.balance_jpy = pr.balance_jpy;
            showToast(L('購入しました','Purchased'),'ok');
            cleanup(true);
            return;
          }
        }catch(e){ showToast(e.message||'購入失敗','ng'); }
        cleanup(false);
      };
    }
  });
}
/* ── Publish-success modal ──────────────────────────────────── */
function openPublishSuccess(listingId, agentName, agentDescription){
  var url = location.origin + '/l/' + listingId;
  var ogUrl = location.origin + '/api/og/' + listingId + '.svg';
  var img = document.getElementById('psThumb');
  if(img) img.src = ogUrl;
  var input = document.getElementById('psUrlInput');
  if(input) input.value = url;
  // Pre-fill tweet text (editable)
  var ta = document.getElementById('psTweetText');
  if(ta){
    var desc = (agentDescription||'').slice(0, 80);
    ta.value = '「' + (agentName||'AI Agent') + '」を MY AI AGENT で公開しました 🎉\n'
             + (desc ? desc + '\n' : '')
             + '3 ターン無料で試せます。\n' + url;
  }
  // Build SNS share URLs
  var tweetText = ta ? ta.value : url;
  document.getElementById('psSnsX').href    = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText);
  document.getElementById('psSnsLine').href = 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(tweetText);
  document.getElementById('psSnsFb').href   = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
  // Refresh X/LINE links when user edits the tweet text
  if(ta){
    ta.oninput = function(){
      var t = ta.value;
      document.getElementById('psSnsX').href    = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(t);
      document.getElementById('psSnsLine').href = 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(t);
    };
  }
  document.getElementById('publishSuccessOverlay').classList.add('open');
}
function closePublishSuccess(){
  document.getElementById('publishSuccessOverlay').classList.remove('open');
}
function psCopyUrl(){
  var v = document.getElementById('psUrlInput').value;
  if(navigator.clipboard) navigator.clipboard.writeText(v).then(function(){ showToast(L('URLをコピーしました','URL copied'),'ok'); });
}

/* ── Share listing (SNS) ─────────────────────────────────── */
function openShareListing(listingId, listingTitle){
  var url = location.origin + '/l/' + listingId;
  var ogUrl = location.origin + '/api/og/' + listingId + '.svg';
  document.getElementById('shareTargetTitle').textContent = listingTitle || '';
  document.getElementById('shareUrl').value = url;
  document.getElementById('shareThumb').src = ogUrl;
  var tweet = (listingTitle ? listingTitle + ' — ' : '') + 'MY AI AGENT で公開中のエージェント';
  document.getElementById('shareTw').href   = 'https://twitter.com/intent/tweet?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(tweet);
  document.getElementById('shareLine').href = 'https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(url);
  document.getElementById('shareFb').href   = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
  document.getElementById('shareListingOverlay').classList.add('open');
}
function closeShareListing(){
  document.getElementById('shareListingOverlay').classList.remove('open');
}
function _copyShareUrl(){
  var url = document.getElementById('shareUrl').value;
  navigator.clipboard.writeText(url).then(function(){ showToast(L('URLをコピーしました','URL copied'),'ok'); });
}

async function cloneAndTry(listingId, demoIdx){
  // Clone the agent then prefill the chat input with the demo prompt
  try{
    var detail = await api('GET','/api/marketplace/'+listingId);
    var prompt = (detail.demo_prompts||[])[demoIdx] || '';
    // Purchase guard for paid listings
    if(!await _maybePurchaseFlow(listingId)) return;
    var r=await api('POST','/api/marketplace/'+listingId+'/clone');
    if(r.agent){
      agents.push({...r.agent, history:[]});
      activeId = r.agent.id;
      closeListingDetail();
      closeMarket();
      renderAgList();
      openAgent(r.agent.id);
      // Prefill
      setTimeout(function(){
        var ci = document.getElementById('ci');
        if(ci){ ci.value = prompt; ci.focus(); }
      }, 100);
      showToast(L('追加しました。送信ボタンで実行できます','Added. Hit Send to run it.'),'ok');
    }
  }catch(e){ showToast(e.message||'追加失敗','ng'); }
}

/* ── Listing Form (#4 出店フォーム) ─────────────────────────── */
var _listingAgentId = null;
function openListingForm(agentId){
  var ag = agents.find(function(a){return a.id===agentId;});
  if(!ag){ showToast(L('エージェントが見つかりません','Agent not found'),'ng'); return; }
  _listingAgentId = agentId;
  closeEditAgent();

  document.getElementById('listingAgentAv').innerHTML = _avHTML(ag.avatar);
  document.getElementById('listingAgentName').textContent = ag.name||'';
  var sknames = (ag.skills||[]).map(function(s){var sk=SKILLS.find(function(x){return x.id===s;});return sk?sk.name:s;}).join(' · ');
  document.getElementById('listingAgentSk').textContent = sknames;

  // Build category radio buttons
  var catEl = document.getElementById('lsCats');
  catEl.innerHTML = MARKET_CAT_DEFS.filter(function(c){return c.id!=='all';}).map(function(c){
    return '<label class="market-cat" style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;margin:0"><input type="radio" name="lsCat" value="'+c.id+'" style="margin:0">'+esc(c.label)+'</label>';
  }).join('');

  // Build tag checkboxes (if defs not yet loaded, fetch them)
  if(!_marketTagDefs.length){
    api('GET','/api/marketplace?sort=popular').then(function(r){
      if(r.tags){ _marketTagDefs = r.tags; _renderListingTagInputs(ag); }
    }).catch(function(){});
  } else {
    _renderListingTagInputs(ag);
  }

  // Pre-fill if already listed
  var m = ag.marketplace || {};
  document.getElementById('lsTitle').value = m.title || ag.name || '';
  // Teams have an empty persona — fall back to team_goal so creators
  // don't have to retype the team description.
  document.getElementById('lsDesc').value = m.description || ag.persona || ag.team_goal || '';
  var prefilledCat = m.category || 'other';
  document.querySelectorAll('input[name="lsCat"]').forEach(function(r){
    r.checked = r.value===prefilledCat;
  });
  document.getElementById('lsDemo1').value = (m.demo_prompts||[])[0] || '';
  document.getElementById('lsDemo2').value = (m.demo_prompts||[])[1] || '';
  document.getElementById('lsDemo3').value = (m.demo_prompts||[])[2] || '';
  document.querySelectorAll('input[name="lsVis"]').forEach(function(r){
    r.checked = r.value === (m.visibility||'public');
  });
  // Pre-fill price
  var prefilledPrice = Number.isFinite(m.price_jpy) ? m.price_jpy : 0;
  var priceMode = prefilledPrice > 0 ? 'paid' : 'free';
  document.querySelectorAll('input[name="lsPriceMode"]').forEach(function(r){
    r.checked = r.value === priceMode;
  });
  document.getElementById('lsPrice').value = prefilledPrice > 0 ? String(prefilledPrice) : '';
  lsTogglePriceMode();

  document.getElementById('listingTitle').textContent = m.is_listed
    ? L('🏪 出店内容を編集','🏪 Edit listing')
    : L('🏪 Agent Store に出店する','🏪 List on Agent Store');
  document.getElementById('lsSubmitBtn').textContent = m.is_listed
    ? L('更新する','Update')
    : L('出店する →','Publish →');
  document.getElementById('lsUnpublishBtn').style.display = m.is_listed ? 'inline-flex' : 'none';

  document.getElementById('listingOverlay').classList.add('open');
}
function lsTogglePriceMode(){
  var mode = (document.querySelector('input[name="lsPriceMode"]:checked')||{}).value || 'free';
  var wrap = document.getElementById('lsPriceWrap');
  if(wrap) wrap.style.display = mode === 'paid' ? '' : 'none';
}
function _renderListingTagInputs(ag){
  var tagEl = document.getElementById('lsTags');
  if(!tagEl || !_marketTagDefs.length) return;
  var pre = (ag.marketplace && ag.marketplace.tags) || [];
  tagEl.innerHTML = _marketTagDefs.map(function(t){
    var checked = pre.indexOf(t.id)>=0 ? ' checked' : '';
    return '<label class="market-cat" style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;margin:0;font-size:12px"><input type="checkbox" name="lsTag" value="'+t.id+'"'+checked+' style="margin:0">'+esc(t.label)+'</label>';
  }).join('');
}
function closeListingForm(){
  document.getElementById('listingOverlay').classList.remove('open');
  _listingAgentId = null;
}
async function submitListing(){
  if(!_listingAgentId) return;
  var title = document.getElementById('lsTitle').value.trim();
  var description = document.getElementById('lsDesc').value.trim();
  var category = (document.querySelector('input[name="lsCat"]:checked')||{}).value || 'other';
  var visibility = (document.querySelector('input[name="lsVis"]:checked')||{}).value || 'public';
  var demo_prompts = [
    document.getElementById('lsDemo1').value.trim(),
    document.getElementById('lsDemo2').value.trim(),
    document.getElementById('lsDemo3').value.trim(),
  ].filter(Boolean);
  var tags = Array.from(document.querySelectorAll('input[name="lsTag"]:checked')).map(function(c){return c.value;}).slice(0,5);

  if(title.length<2 || title.length>60){ showToast(L('タイトルは 2〜60 文字で入力してください','Title must be 2–60 characters'),'ng'); return; }
  if(description.length<20 || description.length>500){ showToast(L('説明は 20〜500 文字で入力してください','Description must be 20–500 characters'),'ng'); return; }

  var priceMode = (document.querySelector('input[name="lsPriceMode"]:checked')||{}).value || 'free';
  var price_jpy = 0;
  if(priceMode === 'paid'){
    price_jpy = parseInt(document.getElementById('lsPrice').value, 10);
    if(!Number.isFinite(price_jpy) || price_jpy < 100){ showToast(L('有料の場合、価格は ¥100 以上で入力してください','For paid listings, price must be at least ¥100'),'ng'); return; }
    if(price_jpy > 100000){ showToast(L('価格の上限は ¥100,000 です','Maximum price is ¥100,000'),'ng'); return; }
  }

  var btn = document.getElementById('lsSubmitBtn');
  btn.disabled = true; var origText = btn.textContent; btn.textContent = '保存中…';
  try{
    var r = await api('POST','/api/marketplace/listings',{
      agent_id: _listingAgentId, title, description, category, demo_prompts, visibility, tags, price_jpy
    });
    // Stash on local agent
    var ag = agents.find(function(a){return a.id===_listingAgentId;});
    if(ag) ag.marketplace = r.listing;
    closeListingForm();
    // Publish-success modal: only for public listings (unlisted = quiet save)
    if(visibility === 'public' && r.listing && r.listing.listing_id){
      openPublishSuccess(r.listing.listing_id, title || (ag && ag.name), description);
    } else {
      showToast(L('出店を保存しました','Listing saved'),'ok');
    }
  }catch(e){
    showToast(e.message||'保存に失敗しました','ng');
  } finally {
    btn.disabled = false; btn.textContent = origText;
  }
}
async function unpublishListing(){
  if(!_listingAgentId) return;
  if(!confirm(L('この出店を取り下げますか？(統計は保持され、再出店時に復元されます)','Unpublish this listing? (Stats are kept and restored on re-publish.)'))) return;
  try{
    await api('DELETE','/api/marketplace/listings/'+_listingAgentId);
    var ag = agents.find(function(a){return a.id===_listingAgentId;});
    if(ag && ag.marketplace){ ag.marketplace.is_listed=false; ag.marketplace.status='paused'; }
    showToast(L('出店を取り下げました','Listing unpublished'),'ok');
    closeListingForm();
  }catch(e){
    showToast(e.message||'取り下げに失敗しました','ng');
  }
}

function _parsePersona(persona){
  // Parse "採用目的: ...\n業務内容: ..." back to {purpose, duties}.
  // Legacy / preset personas (no prefix) land in duties so they remain editable.
  var p={purpose:'',duties:''};
  if(!persona) return p;
  var m=persona.match(/^採用目的:\s*([\s\S]*?)\n業務内容:\s*([\s\S]*)$/);
  if(m){ p.purpose=m[1].trim(); p.duties=m[2].trim(); }
  else { p.duties=persona; }
  return p;
}
/* ── Google Chrome integration helpers ─────────────────────── */
function _isGoogleChrome(){
  var ua=navigator.userAgent||'';
  // Exclude other Chromium-based browsers that masquerade as Chrome
  if(/Edg\//.test(ua)||/OPR\//.test(ua)||/OPiOS\//.test(ua)) return false;
  if(/Brave/.test(ua)) return false;
  if(navigator.brave && navigator.brave.isBrave) return false;
  return /Chrome\//.test(ua) && /Google Inc/.test(navigator.vendor||'');
}
function _browserName(){
  var ua=navigator.userAgent||'';
  if(/Edg\//.test(ua)) return 'Microsoft Edge';
  if(/OPR\//.test(ua)) return 'Opera';
  if(/Firefox\//.test(ua)) return 'Firefox';
  if(/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
  if(/Chrome\//.test(ua)) return isJa?'Chromium 系ブラウザ':'a Chromium-based browser';
  return isJa ? 'お使いのブラウザ' : 'your browser';
}
function _renderChromeStatus(swId, descId, enabled){
  var sw=document.getElementById(swId);
  var desc=document.getElementById(descId);
  if(!sw||!desc) return;
  sw.classList.toggle('on', !!enabled);
  if(enabled){
    desc.innerHTML='<span style="color:#10b981;font-weight:700">✓ '+
      (isJa?'有効':'Enabled')+
      '</span> — '+
      (isJa?'AI がリアルタイム Web 検索 + URL 取得で最新情報を調べます (出典付きで回答)':'AI uses live web search + URL fetch to ground answers in current sources');
  } else {
    desc.textContent = isJa
      ? '最新ニュース・統計・企業情報など Web 上の情報を AI が自分で調べる (Anthropic Web Search)'
      : 'Let the AI search the live web (Anthropic-hosted, no install needed)';
  }
}
function toggleWizardChrome(){
  var sw=document.getElementById('wChromeSw');
  if(!sw) return;
  var willEnable=!sw.classList.contains('on');
  NA.chrome_enabled=willEnable;
  _renderChromeStatus('wChromeSw','wChromeDesc',willEnable);
}
function toggleEditChrome(){
  var sw=document.getElementById('editChromeSw');
  if(!sw) return;
  var willEnable=!sw.classList.contains('on');
  _renderChromeStatus('editChromeSw','editChromeDesc',willEnable);
  if(typeof _updateEditToolsCnt==='function') _updateEditToolsCnt();
}

/* ── Google Sheets integration helpers ────────────────────── */
function _renderSheetsStatus(swId, descId, accountRowId, emailEl, btnId, agentEnabled){
  var connected = !!(me && me.google_sheets_connected);
  var sw=document.getElementById(swId);
  var desc=document.getElementById(descId);
  var accountRow=document.getElementById(accountRowId);
  var emailNode=document.getElementById(emailEl);
  var btn=document.getElementById(btnId);
  if(!sw||!desc) return;
  // Toggle reflects whether THIS agent uses Sheets, but it's only meaningful when connected.
  sw.classList.toggle('on', !!agentEnabled && connected);
  // Inline "接続中" pill in the title row — visible only on the agent-edit modal.
  var sheetsBadge = document.getElementById('editSheetsConnBadge');
  if(sheetsBadge) sheetsBadge.style.display = connected ? 'inline-flex' : 'none';
  if(connected){
    if(accountRow) accountRow.style.display='';
    if(emailNode) emailNode.textContent = me.google_sheets_email || '';
    if(btn) btn.style.display='none';
    if(agentEnabled){
      desc.innerHTML='<span style="color:#0f9d58;font-weight:700">✓ '+(isJa?'有効':'Active')+
        '</span> — '+(isJa?'AI がスプレッドシートを直接読み書きします':'AI reads & writes your sheets directly');
    }else{
      desc.textContent = isJa
        ? 'スイッチを ON にすると AI がスプレッドシートを読み書きできます'
        : 'Turn on to let the AI read & write your sheets';
    }
  }else{
    if(accountRow) accountRow.style.display='none';
    if(btn) btn.style.display='';
    sw.classList.remove('on');
    desc.textContent = isJa
      ? '先に Google アカウントと接続してください（ボタンを押すと Google の同意画面が開きます）'
      : 'Connect a Google account first (button opens Google consent screen)';
  }
}
async function connectGoogleSheets(){
  try{
    const r = await api('GET', '/api/google/sheets/auth-url');
    if(r && r.url){
      // Full-page redirect (popup is blocked on Safari iOS often). Google will
      // bounce back to /api/google/sheets/callback → /app.html?google_sheets=connected.
      location.href = r.url;
    }
  }catch(e){
    showToast((e && e.message) || 'Google 接続URLの取得に失敗しました', 'ng');
  }
}
async function disconnectGoogleSheets(){
  if(!confirm(isJa?'Google スプレッドシート連携を切断します。本当によろしいですか？':'Disconnect Google Sheets?')) return;
  try{
    await api('POST', '/api/google/sheets/disconnect', {});
    if(me){ me.google_sheets_connected=false; me.google_sheets_email=null; }
    // Refresh both edit + wizard panels if open
    var ag = agents.find(a=>a.id===window._editAgentId);
    if(ag) ag.sheets_enabled=false;
    _renderSheetsStatus('editSheetsSw','editSheetsDesc','editSheetsAccountRow','editSheetsEmail','editSheetsConnectBtn', false);
    _renderSheetsStatus('wSheetsSw','wSheetsDesc','wSheetsAccountRow','wSheetsEmail','wSheetsConnectBtn', !!(NA && NA.sheets_enabled));
    showToast(L('切断しました','Disconnected'),'ok');
  }catch(e){
    showToast((e && e.message) || '切断に失敗しました', 'ng');
  }
}
function toggleWizardSheets(){
  var connected = !!(me && me.google_sheets_connected);
  if(!connected){
    showToast(isJa?'先に Google アカウントと接続してください':'Connect a Google account first','ng');
    return;
  }
  var sw=document.getElementById('wSheetsSw');
  if(!sw) return;
  var willEnable=!sw.classList.contains('on');
  if(NA) NA.sheets_enabled=willEnable;
  _renderSheetsStatus('wSheetsSw','wSheetsDesc','wSheetsAccountRow','wSheetsEmail','wSheetsConnectBtn', willEnable);
}
function toggleEditSheets(){
  var connected = !!(me && me.google_sheets_connected);
  if(!connected){
    showToast(isJa?'先に Google アカウントと接続してください':'Connect a Google account first','ng');
    return;
  }
  var sw=document.getElementById('editSheetsSw');
  if(!sw) return;
  var willEnable=!sw.classList.contains('on');
  _renderSheetsStatus('editSheetsSw','editSheetsDesc','editSheetsAccountRow','editSheetsEmail','editSheetsConnectBtn', willEnable);
  if(typeof _updateEditToolsCnt==='function') _updateEditToolsCnt();
}

/* ── Browser Extension integration helpers ────────────────── */
var EXT_ID = 'dfpkogebkejpggilgcfgnipemdjpkoil';
var EXT_STORE_URL = 'https://chromewebstore.google.com/detail/' + EXT_ID;

// Devices that physically cannot run a Chrome extension (mobile Chrome doesn't
// support extensions; non-Chrome desktop browsers don't either). On those we
// hide the "再接続" button instead of letting the user tap something that
// can never succeed, and show a clearer "open on desktop Chrome" hint.
function _isExtCapable(){
  var ua = navigator.userAgent || '';
  if(/(Mobile|Android|iPhone|iPad|iPod)/i.test(ua)) return false;
  // chrome.runtime is only present on desktop Chrome / Edge / Brave (Chromium).
  return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.sendMessage;
}

function _renderExtensionStatus(swId, descId, accountRowId, deviceIdEl, btnId, agentEnabled){
  var paired = !!(me && me.extension_paired);
  var connected = !!(me && me.extension_connected);
  var sw=document.getElementById(swId);
  var desc=document.getElementById(descId);
  var accountRow=document.getElementById(accountRowId);
  var devNode=document.getElementById(deviceIdEl);
  var btn=document.getElementById(btnId);
  if(!sw||!desc) return;
  sw.classList.toggle('on', !!agentEnabled && paired);
  // Inline "接続中" pill — only when actively online (paired+connected).
  var extBadge = document.getElementById('editExtConnBadge');
  if(extBadge) extBadge.style.display = (paired && connected) ? 'inline-flex' : 'none';
  if(paired){
    if(accountRow) accountRow.style.display='';
    if(devNode) devNode.textContent = connected?(isJa?'オンライン':'Online'):(isJa?'オフライン':'Offline');
    if(btn) btn.style.display='none';
    // 再接続 link: only useful on devices that can actually reach a Chrome
    // extension. On mobile / non-Chrome the link is hidden so the user isn't
    // teased with a button that always fails — instead the offline message
    // points them to desktop Chrome, and a background poll picks up the
    // moment the extension comes back online (no manual action required).
    var rc = document.getElementById('editExtReconnect');
    var rcSep = document.getElementById('editExtReconnectSep');
    var showRc = !connected && _isExtCapable();
    if(rc)    rc.style.display    = showRc ? '' : 'none';
    if(rcSep) rcSep.style.display = showRc ? '' : 'none';
    // Kick off (or stop) the silent auto-recovery loop based on current state.
    if(connected){ _extStopBackgroundReconnect(); }
    else         { _extStartBackgroundReconnect(); }
    if(agentEnabled){
      if(connected){
        desc.innerHTML = isJa
          ? '<span style="color:#3730a3;font-weight:700">✓ 有効・オンライン</span> — AI があなたのブラウザを操作できます'
          : '<span style="color:#3730a3;font-weight:700">✓ Active · Online</span> — AI can drive this browser';
      } else if(!_isExtCapable()){
        // Mobile / non-Chrome: extension can't run here. Make that explicit
        // and reassure them it'll auto-recover when they hit the desktop.
        desc.innerHTML = isJa
          ? '<span style="color:var(--peach-dark);font-weight:700">⚠ オフライン</span> — 拡張機能はデスクトップ Chrome 専用です。PC で開けば自動再接続。'
          : '<span style="color:var(--peach-dark);font-weight:700">⚠ Offline</span> — The extension only runs in desktop Chrome. We\'ll reconnect when you open the app on your PC.';
      } else if(_extProbeFailStreak >= _EXT_FAIL_STREAK_FLIP){
        // Desktop Chrome but the extension hasn't responded after ~24s of
        // polling. Almost certainly uninstalled or disabled — give the user a
        // direct path to fix it instead of "waiting…" forever.
        desc.innerHTML = isJa
          ? '<span style="color:var(--peach-dark);font-weight:700">⚠ 拡張機能が見つかりません</span> — アンインストール / 無効化されている可能性があります。<a href="' + EXT_STORE_URL + '" target="_blank" style="color:#3730a3;font-weight:700;text-decoration:underline">Chrome に再追加</a>'
          : '<span style="color:var(--peach-dark);font-weight:700">⚠ Extension not found</span> — It may have been uninstalled or disabled. <a href="' + EXT_STORE_URL + '" target="_blank" style="color:#3730a3;font-weight:700;text-decoration:underline">Add to Chrome again</a>';
      } else {
        desc.innerHTML = isJa
          ? '<span style="color:var(--peach-dark);font-weight:700">⚠ オフライン</span> — Chrome の起動を待っています。再接続できたら自動で復旧します。'
          : '<span style="color:var(--peach-dark);font-weight:700">⚠ Offline</span> — Waiting for Chrome. We\'ll reconnect automatically.';
      }
    }else{
      desc.textContent = isJa
        ? 'スイッチを ON にすると AI がこのブラウザを使ってサイト操作できます (X / Slack / Gmail など)'
        : 'Turn on to let AI control this browser';
    }
  }else{
    if(accountRow) accountRow.style.display='none';
    if(btn){
      btn.style.display='';
      btn.textContent = isJa?'Chrome に追加':'Add to Chrome';
    }
    sw.classList.remove('on');
    desc.textContent = isJa
      ? 'Chrome 拡張をインストールすると、AI がブラウザを操作できるようになります'
      : 'Install the Chrome extension to let AI drive your browser';
  }
}

// Probe whether the extension is installed (responds to pings via externally_connectable).
// Timeout is 3s, not 800ms — Chrome MV3 service workers can take 1-3s to wake
// from cold sleep, and a too-eager timeout was the most common false negative
// behind "paired but stuck offline" (the SW would respond ~1-2s later, but
// we'd already given up).
function _extProbe(){
  return new Promise(function(resolve){
    if(typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage){
      return resolve(false);
    }
    var done=false;
    var t=setTimeout(function(){ if(!done){ done=true; resolve(false); } }, 3000);
    try{
      chrome.runtime.sendMessage(EXT_ID, {type:'status'}, function(resp){
        if(done) return; done=true; clearTimeout(t);
        if(chrome.runtime.lastError) return resolve(false);
        resolve(!!resp);
      });
    }catch(e){ if(!done){ done=true; clearTimeout(t); resolve(false); } }
  });
}

async function connectExtension(){
  // If extension isn't installed, send the user straight to the Chrome Web Store.
  var installed = await _extProbe();
  if(!installed){
    window.open(EXT_STORE_URL, '_blank');
    showToast(isJa
      ? 'Chrome に追加した後、このタブに戻ってください。自動で接続されます。'
      : 'After adding to Chrome, return to this tab — we\'ll connect automatically.','ok');
    _extWaitForInstall();
    return;
  }
  await _extPairOnce(true);
}

// ── Silent auto-recovery for paired-but-offline ──
// While the agent-edit modal is open and the extension is paired but the
// server hasn't seen its SSE stream lately, this loop quietly polls so the UI
// updates the moment the extension comes back online — without the user
// having to click "再接続". Two paths converge here:
//   1. desktop Chrome path — chrome.runtime probe + silent re-pair (fast)
//   2. server-side path    — refresh /api/me to pick up the extension's own
//                            autonomous SSE reconnect (works even on mobile)
var _extReconnectTimer = null;
var _extReconnectStartedAt = 0;
var _extProbeFailStreak = 0;        // consecutive probe-fail count
var _EXT_RECONNECT_INTERVAL_MS = 6000;
var _EXT_RECONNECT_MAX_MS      = 5 * 60 * 1000; // give up after 5 min idle
var _EXT_FAIL_STREAK_FLIP      = 4;             // ≈ 24s of failures → flip message

function _extStopBackgroundReconnect(){
  if(_extReconnectTimer){ clearInterval(_extReconnectTimer); _extReconnectTimer = null; }
}

async function _extReconnectTick(){
  if(Date.now() - _extReconnectStartedAt > _EXT_RECONNECT_MAX_MS){
    _extStopBackgroundReconnect(); return;
  }
  if(document.hidden) return;
  if(!me || !me.extension_paired){ _extStopBackgroundReconnect(); return; }

  // Path 1: desktop Chrome with extension reachable → wake SW + silent re-pair.
  // Path 2: regardless of platform, refresh /api/me to pick up the extension's
  // own autonomous SSE reconnect (works on mobile too).
  var capable = _isExtCapable();
  if(capable){
    try{
      var installed = await _extProbe();
      if(installed){
        _extProbeFailStreak = 0;
        await _extPairOnce(false);
      } else {
        _extProbeFailStreak++;
        // After ~24s of "extension flagged paired in DB but never responding"
        // we're confident it's uninstalled / disabled. Auto-unpair on the
        // server so the UI flips to a clean "Add to Chrome" state with a
        // single, obvious CTA — no manual reconnect / disconnect dance, and
        // open the Web Store directly so the user has the URL in hand.
        if(_extProbeFailStreak === _EXT_FAIL_STREAK_FLIP){
          _extStopBackgroundReconnect();
          try{
            await api('POST','/api/extension/unpair',{});
            if(me){ me.extension_paired=false; me.extension_connected=false; me.extension_device_id=null; }
          }catch(e){ /* swallow — we still want to update the UI */ }
          try{ _renderExtensionStatus('editExtSw','editExtDesc','editExtAccountRow','editExtDeviceId','editExtConnectBtn', false); }catch(e){}
          var win = window.open(EXT_STORE_URL, '_blank');
          showToast(isJa
            ? (win ? '拡張機能が見つからないので接続を解除しました。Web Store から再追加してください。'
                  : '拡張機能が見つかりません。再追加してください: ' + EXT_STORE_URL)
            : (win ? 'Extension not found — disconnected. Re-add from the Web Store.'
                  : 'Extension not found. Re-add: ' + EXT_STORE_URL),
            win ? 'ok' : 'ng');
          return;
        }
      }
    }catch(e){ _extProbeFailStreak++; }
  }

  try{
    var m = await api('GET','/api/me');
    var prev = !!(me && me.extension_connected);
    me = m.user || m;
    if(me.extension_connected && !prev){
      _extStopBackgroundReconnect();
      _extProbeFailStreak = 0;
      try{ _renderExtensionStatus('editExtSw','editExtDesc','editExtAccountRow','editExtDeviceId','editExtConnectBtn', false); }catch(e){}
      showToast(isJa?'✓ 拡張機能に自動再接続しました':'✓ Extension reconnected automatically','ok');
    }
  }catch(e){}
}

function _extStartBackgroundReconnect(){
  if(_extReconnectTimer) return; // already running
  _extReconnectStartedAt = Date.now();
  _extProbeFailStreak = 0;
  // Fire one tick immediately so we don't make the user wait 6s for the first
  // attempt — most often this single call already wakes a sleeping SW and
  // recovers the connection.
  _extReconnectTick();
  _extReconnectTimer = setInterval(_extReconnectTick, _EXT_RECONNECT_INTERVAL_MS);
}

// When the user comes back to this tab (from Chrome restart, etc.) re-probe
// immediately instead of waiting up to 6s for the next polling tick.
document.addEventListener('visibilitychange', function(){
  if(!document.hidden && _extReconnectTimer){
    // Reset the start clock so the 5-min idle cap resets on user return.
    _extReconnectStartedAt = Date.now();
  }
});

// Manual recovery from the "paired but offline" state. Same flow as connect:
// probes the extension, re-pairs if reachable, or — if the extension can't
// be reached — sends the user straight to the Chrome Web Store (rather than
// just telling them to "check the Chrome icon" with no actionable URL). Once
// they re-add it, the background install poller silently re-pairs.
async function reconnectExtension(){
  var installed = await _extProbe();
  if(!installed){
    // Open the Web Store in a new tab so the user has a one-click path to fix
    // it. Most browsers allow this because reconnectExtension() is called from
    // a user-initiated click handler.
    var win = window.open(EXT_STORE_URL, '_blank');
    if(win){
      showToast(isJa
        ? 'Chrome Web Store を開きました。拡張機能を追加すると自動で再接続されます。'
        : 'Opened the Chrome Web Store. Re-add the extension and we\'ll reconnect automatically.','ok');
    } else {
      // Popup blocked — surface the URL as plain text so the user can copy it.
      showToast(isJa
        ? 'こちらから再追加してください: ' + EXT_STORE_URL
        : 'Re-add from here: ' + EXT_STORE_URL, 'ng');
    }
    _extWaitForInstall();
    return;
  }
  var ok = await _extPairOnce(false);
  if(ok){
    showToast(isJa?'再接続しました':'Reconnected','ok');
  }else{
    showToast(isJa
      ? '再接続できませんでした。Chrome を再起動して試してください。'
      : 'Reconnect failed. Try restarting Chrome.','ng');
  }
}

// Mint a token + push it into the extension. Silent: no toasts unless `verbose`.
async function _extPairOnce(verbose){
  let r;
  try{ r = await api('POST','/api/extension/pair',{}); }
  catch(e){ if(verbose) showToast((e&&e.message)||'ペアリング初期化に失敗しました','ng'); return false; }
  if(!r || !r.device_token){ if(verbose) showToast(L('サーバーが device_token を返しませんでした','Server did not return a device_token'),'ng'); return false; }
  return await new Promise(function(resolve){
    try{
      chrome.runtime.sendMessage(EXT_ID, {
        type:'pair', device_id:r.device_id, device_token:r.device_token,
      }, async function(resp){
        if(chrome.runtime.lastError || !resp || !resp.ok){
          if(verbose) showToast(L('拡張機能との通信に失敗しました。Chrome を再起動して再試行してください','Could not reach the extension. Restart Chrome and try again.'),'ng');
          return resolve(false);
        }
        try{ const m = await api('GET','/api/me'); me = m.user||m; }catch(e){}
        try{ _renderExtensionStatus('editExtSw','editExtDesc','editExtAccountRow','editExtDeviceId','editExtConnectBtn', false); }catch(e){}
        // Pairing succeeded — start the SW keep-alive ping if it isn't
        // already running. Covers mid-session pairs (Add to Chrome flow,
        // background reconnect) that bypass _extAutoPair.
        try{ _extStartKeepAlive(); }catch(e){}
        if(verbose) showToast(L('ブラウザ拡張を連携しました','Browser extension linked'),'ok');
        resolve(true);
      });
    }catch(e){ resolve(false); }
  });
}

// Poll for the extension after the user clicks "Add to Chrome" and switches tabs.
function _extWaitForInstall(){
  var tries=0;
  var iv=setInterval(async function(){
    tries++;
    if(tries>60){ clearInterval(iv); return; } // ~2 min
    if(document.hidden) return;
    var ok = await _extProbe();
    if(ok){
      clearInterval(iv);
      await _extPairOnce(true);
    }
  }, 2000);
}

// On app load: if user is logged in and extension is reachable but not yet paired
// (or paired-but-offline), do it silently in the background.
async function _extAutoPair(){
  try{
    if(!me) return;
    var installed = await _extProbe();
    if(!installed) return;
    if(!(me.extension_paired && me.extension_connected)){
      await _extPairOnce(false);
    }
    // Once paired, keep the extension's MV3 service worker alive for as long
    // as this tab is open. See _extStartKeepAlive for why.
    _extStartKeepAlive();
  }catch(e){}
}

// ── MV3 service-worker keep-alive (web → extension) ─────────────────
// Chrome MV3 service workers idle out after ~30s, dropping the SSE stream
// even when the user is actively using the app. The proper fix lives in
// the extension itself (chrome.alarms keep-alive in v0.2.0), but until
// that's published the *web app* keeps the SW alive by pinging every 20s.
// As long as any tab of myaiagents.agency is open and the user is paired,
// the SSE never gets a chance to time out.
//
// We use a chained setTimeout (not setInterval) so a missed tick — e.g.
// a slow probe round-trip on a flaky network — doesn't permanently drift
// the schedule. We *don't* skip on document.hidden: when the user has
// the AI doing tool work in a background tab, we need the SW alive even
// if they're not looking at it. Browsers throttle setTimeout to ~1Hz on
// hidden tabs, but that still fires our 20s tick fast enough.
var _extKeepAliveTimer = null;
var _EXT_KEEPALIVE_MS = 20000; // safely under MV3's 30s idle cap, with margin

function _extKeepAliveTick(){
  if(!me || !me.extension_paired){ _extStopKeepAlive(); return; }
  if(!_isExtCapable())             { _extStopKeepAlive(); return; }
  // Fire-and-forget — a single chrome.runtime.sendMessage resets the SW
  // idle clock. We don't care about the response.
  _extProbe().catch(function(){});
  _extKeepAliveTimer = setTimeout(_extKeepAliveTick, _EXT_KEEPALIVE_MS);
}

function _extStartKeepAlive(){
  if(_extKeepAliveTimer) return; // already running
  if(!_isExtCapable()) return;
  if(!me || !me.extension_paired) return;
  // Probe once immediately so the SW is alive *now*, then schedule.
  _extProbe().catch(function(){});
  _extKeepAliveTimer = setTimeout(_extKeepAliveTick, _EXT_KEEPALIVE_MS);
}

function _extStopKeepAlive(){
  if(_extKeepAliveTimer){ clearTimeout(_extKeepAliveTimer); _extKeepAliveTimer = null; }
}

// When the tab returns from being hidden longer than the SW idle cap, the
// SW likely died — probe immediately to wake it before any ext_* tool call.
document.addEventListener('visibilitychange', function(){
  if(document.hidden) return;
  if(!me || !me.extension_paired) return;
  if(!_isExtCapable()) return;
  _extProbe().catch(function(){});
});

async function disconnectExtension(){
  if(!confirm(isJa?'ブラウザ拡張連携を切断します。よろしいですか?':'Disconnect browser extension?')) return;
  try{
    await api('POST','/api/extension/unpair',{});
    if(me){ me.extension_paired=false; me.extension_connected=false; me.extension_device_id=null; }
    var ag = agents.find(a=>a.id===window._editAgentId);
    if(ag) ag.extension_enabled=false;
    _renderExtensionStatus('editExtSw','editExtDesc','editExtAccountRow','editExtDeviceId','editExtConnectBtn', false);
    // No longer paired — stop the SW keep-alive ping.
    try{ _extStopKeepAlive(); }catch(e){}
    // Try to notify the extension too (best-effort).
    try{ if(typeof chrome!=='undefined' && chrome.runtime && EXT_ID && EXT_ID!=='TBD'){ chrome.runtime.sendMessage(EXT_ID, {type:'unpair'}, function(){}); } }catch(e){}
    showToast(L('切断しました','Disconnected'),'ok');
  }catch(e){
    showToast((e&&e.message)||'切断に失敗しました','ng');
  }
}

async function toggleEditExtension(){
  if(!me || !me.extension_paired){
    connectExtension();
    return;
  }
  var sw=document.getElementById('editExtSw');
  if(!sw) return;
  var willEnable=!sw.classList.contains('on');
  // Flip the UI immediately so the user sees the toggle move.
  _renderExtensionStatus('editExtSw','editExtDesc','editExtAccountRow','editExtDeviceId','editExtConnectBtn', willEnable);
  // Auto-save: PATCH only this one field, no panel close. Roll back the UI
  // if the server rejects.
  var id = window._editAgentId;
  var ag = agents.find(a => a.id === id);
  if(!id || !ag){ return; }
  try {
    await api('PATCH', '/api/agents/'+id, { extension_enabled: willEnable });
    ag.extension_enabled = willEnable;
    if(typeof _updateEditToolsCnt==='function') _updateEditToolsCnt();
    showToast(willEnable
      ? (isJa ? 'ブラウザ拡張連携を有効化しました' : 'Extension enabled')
      : (isJa ? 'ブラウザ拡張連携を無効化しました' : 'Extension disabled'),
      'ok');
  } catch(e) {
    // Roll back the switch on failure so it matches server state.
    _renderExtensionStatus('editExtSw','editExtDesc','editExtAccountRow','editExtDeviceId','editExtConnectBtn', !willEnable);
    showToast((isJa?'保存に失敗: ':'Save failed: ')+(e.message||''), 'ng');
  }
}

function _composePersona(purpose,duties){
  purpose=(purpose||'').trim(); duties=(duties||'').trim();
  if(!purpose && !duties) return '';
  if(!purpose) return duties;
  if(!duties) return '採用目的: '+purpose;
  return '採用目的: '+purpose+'\n業務内容: '+duties;
}

function openEditAgent(id){
  const ag = agents.find(a=>a.id===(id||activeId));
  if(!ag) return;
  window._editAgentId = ag.id;
  var _eAv = document.getElementById('editAgAvatar');
  if(_eAv){ _eAv.innerHTML = _avHTML(ag.avatar); }
  document.getElementById('editAgName2').textContent = ag.name;
  document.getElementById('editAgSkills').textContent = ag.skills.map(s=>SKILLS.find(x=>x.id===s)?.name||s).join(' · ');
  document.getElementById('editName').value = ag.name;
  var parsed=_parsePersona(ag.persona);
  document.getElementById('editPurpose').value = parsed.purpose;
  document.getElementById('editDuties').value = parsed.duties;
  if(typeof _renderChromeStatus==='function') _renderChromeStatus('editChromeSw','editChromeDesc',!!ag.chrome_enabled);
  if(typeof _renderSheetsStatus==='function') _renderSheetsStatus('editSheetsSw','editSheetsDesc','editSheetsAccountRow','editSheetsEmail','editSheetsConnectBtn',!!ag.sheets_enabled);
  if(typeof _renderExtensionStatus==='function') _renderExtensionStatus('editExtSw','editExtDesc','editExtAccountRow','editExtDeviceId','editExtConnectBtn',!!ag.extension_enabled);
  if(typeof _renderGitHubStatus==='function') _renderGitHubStatus(!!ag.github_enabled);
  _setEditModel(ag.model || 'auto');
  // Refresh accordion count badges after panel rehydrates
  setTimeout(() => {
    if(typeof _updateEditToolsCnt==='function') _updateEditToolsCnt();
    if(typeof _updateEditKbCnt==='function')    _updateEditKbCnt();
  }, 30);
  // Group section: swap copy when already a group
  const grpBtn = document.getElementById('editGroupBtn');
  const grpDesc = document.getElementById('editGroupDesc');
  if(ag.is_group){
    const memCount = (ag.members||[]).length || ag.member_count || 1;
    if(grpBtn) grpBtn.textContent = '🔗 招待リンクを管理';
    if(grpDesc) grpDesc.textContent = 'すでにグループです (メンバー ' + memCount + ' 名)。招待リンク・メンバー管理はこちら。';
  } else {
    if(grpBtn) grpBtn.textContent = '＋ グループを作成して招待';
    if(grpDesc) grpDesc.textContent = '仲間を招待して、このエージェントと一緒に話せるグループを作ります';
  }

  // Reflect marketplace listing state
  var m = ag.marketplace || {};
  var lDesc = document.getElementById('editListingDesc');
  var lBtn  = document.getElementById('editListingBtn');
  if(m.is_listed){
    lDesc.innerHTML = '<span style="color:#10b981;font-weight:700">✓ 出店中</span> — 利用 '+(m.uses_count||0)+' 回 / 累計収益 ¥'+Math.floor((m.uses_count||0)*0).toLocaleString();
    lBtn.textContent = '出店内容を編集';
  } else if(m.status==='paused'){
    lDesc.innerHTML = '<span style="color:var(--text3);font-weight:700">⏸ 一時停止中</span> — 再公開できます';
    lBtn.textContent = '再公開する';
  } else {
    lDesc.textContent = '買い切り価格の 70% + 利用料の 10% が収益になります';
    lBtn.textContent = '＋ 出店フォームを開く';
  }

  document.getElementById('editPanel').style.right = '0';
  document.getElementById('editPanelOverlay').style.display = 'block';
  // Refresh KB + schedule + webhook lists whenever the panel opens.
  try { _kbLoadList(); } catch(e){}
  try { _schedLoadList(); } catch(e){}
  try { _whLoad(); } catch(e){}
}

async function _kbLoadList(){
  var id = window._editAgentId; if(!id) return;
  var listEl = document.getElementById('editKbList'); if(!listEl) return;
  try {
    var r = await api('GET','/api/agents/'+id+'/knowledge');
    var docs = (r && r.docs) || [];
    if(!docs.length){
      listEl.innerHTML = '<div style="font-size:11.5px;color:var(--text3);padding:4px 0">'+(isJa?'まだドキュメントがありません':'No documents yet')+'</div>';
      return;
    }
    listEl.innerHTML = docs.map(function(d){
      var kb = Math.max(1, Math.round(d.length/1024));
      return '<div data-kb-doc="'+esc(d.id)+'" style="display:flex;align-items:center;gap:8px;padding:7px 9px;background:#fff;border:1px solid rgba(16,185,129,.18);border-radius:8px">'+
        '<div style="width:24px;height:24px;border-radius:5px;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0">DOC</div>'+
        '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(d.name||'doc')+'</div>'+
        '<div style="font-size:10.5px;color:var(--text3)">'+kb+'KB · '+(d.chunks||0)+(isJa?' チャンク':' chunks')+'</div></div>'+
        '<button onclick="_kbDelete(\''+esc(d.id)+'\')" style="background:none;border:0;color:var(--text3);cursor:pointer;font-size:14px" title="'+(isJa?'削除':'Delete')+'">✕</button>'+
      '</div>';
    }).join('');
    if(typeof _updateEditKbCnt==='function') _updateEditKbCnt();
  } catch(e){
    listEl.innerHTML = '<div style="font-size:11.5px;color:#dc2626;padding:4px 0">'+(isJa?'読み込めません':'Failed to load')+'</div>';
  }
}
async function _kbDelete(docId){
  var id = window._editAgentId; if(!id || !docId) return;
  if(!confirm(isJa?'このドキュメントを削除しますか？':'Delete this document?')) return;
  try { await api('DELETE','/api/agents/'+id+'/knowledge/'+docId); _kbLoadList(); }
  catch(e){ showToast((isJa?'削除に失敗: ':'Delete failed: ')+(e.message||''), 'ng'); }
}
function onKbFileSelect(ev){
  var files = Array.from(ev.target.files||[]);
  ev.target.value='';
  files.forEach(_kbUploadDoc);
}
/* ── Founder 100 share helpers ──────────────────────── */
function _founderTweetText(){
  var seat = me && me.founder_seat_no;
  var handle = me && me.handle;
  var url = location.origin + (handle ? ('/u/'+handle) : '/');
  return (
    'I’m Founder #' + (seat||'?') + ' on @myaiagents 🎉\n\n' +
    'Build, run, and share your own AI team — first 100 creators get permanent badge + 1 month BUSINESS free.\n\n' +
    url
  );
}
function _tweetFounderBadge(){
  if(!me || !me.is_founder) return;
  var text = encodeURIComponent(_founderTweetText());
  window.open('https://twitter.com/intent/tweet?text='+text, '_blank', 'noopener');
}
function _copyFounderTweet(){
  if(!me || !me.is_founder) return;
  var text = _founderTweetText();
  if(navigator.clipboard) navigator.clipboard.writeText(text);
  showToast(isJa?'コピーしました':'Copied','ok');
}

/* ── Public handle ──────────────────────────────────── */
async function _saveHandle(){
  var inp = document.getElementById('sHandle'); if(!inp) return;
  var v = (inp.value||'').trim().toLowerCase();
  if(!/^[a-z0-9_]{3,30}$/.test(v)){
    showToast(isJa?'3-30 文字の a-z, 0-9, _ のみ':'3-30 chars [a-z0-9_]','ng'); return;
  }
  try {
    var r = await api('PUT','/api/me/handle',{ handle: v });
    if(me) me.handle = r.handle;
    var st = document.getElementById('sHandleStatus');
    if(st) st.innerHTML = '<span style="color:#16a34a">✓ Public URL: <a href="/u/'+esc(r.handle)+'" target="_blank" style="color:#16a34a;font-weight:700">'+location.origin+'/u/'+esc(r.handle)+'</a></span>';
    showToast(isJa?'ハンドルを保存しました':'Handle saved','ok');
  } catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}

/* ── Integrations Catalog (50 services) ─────────────────
 * Renders the 50-service catalog into #intgCatalog. Cards are grouped by
 * category and show: logo + name + 1-line desc + status badge + Connect/
 * Manage button. Click → modal with the service's input fields.
 */
window._intgCatalog = null;
async function _loadIntegrations(){
  var host = document.getElementById('intgCatalog');
  if(!host) return;
  host.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3);font-size:13px">読み込み中…</div>';
  try {
    var r = await api('GET', '/api/me/integrations/catalog');
    window._intgCatalog = r;
    _renderIntgCatalog(r);
  } catch(e){
    host.innerHTML = '<div style="color:#dc2626;font-size:12px;padding:14px">カタログの読み込みに失敗: '+esc(e.message||'')+'</div>';
  }
  // Refresh sidebar badge
  _updateConnectBadge();
  // Custom MCP servers list (preserved from old UI, lives in details)
  if(typeof _mcpLoadList === 'function') _mcpLoadList();
}

var INTG_GROUP_LABEL = {
  dev:  '💻 開発 / インフラ',
  docs: '📚 ドキュメント / ナレッジ',
  chat: '💬 コミュニケーション',
  mail: '✉️ メール',
  cal:  '📅 カレンダー / タスク',
  blog: '✍️ ブログ / 発信',
  sns:  '🐦 SNS',
  pay:  '💰 EC / 決済',
  data: '📊 アナリティクス / マーケ',
  ai:   '🤖 AI / 検索 / 音声',
  flow: '🔌 ワークフロー / メタ連携',
};
var INTG_GROUP_ORDER = ['dev','docs','chat','mail','cal','blog','sns','pay','data','ai','flow'];

function _renderIntgCatalog(r){
  var host = document.getElementById('intgCatalog');
  if(!host) return;
  var connected = r.connected || 0;
  var total = r.total || (r.services ? r.services.length : 50);
  var groups = r.groups || {};

  // Header strip: counts + filter
  var pctNum = total ? Math.round(connected/total*100) : 0;
  var head =
    '<div style="background:#fff;border:1px solid var(--wire);border-radius:12px;padding:14px 16px;margin-bottom:18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">'
    + '<div style="display:flex;gap:14px">'
    +   '<div><div style="font-size:18px;font-weight:900;color:var(--peach-dark)">'+connected+'</div><div style="font-size:10.5px;color:var(--text3);letter-spacing:.04em;text-transform:uppercase;margin-top:2px">接続済</div></div>'
    +   '<div><div style="font-size:18px;font-weight:900;color:var(--text)">'+(total-connected)+'</div><div style="font-size:10.5px;color:var(--text3);letter-spacing:.04em;text-transform:uppercase;margin-top:2px">利用可能</div></div>'
    +   '<div><div style="font-size:18px;font-weight:900;color:var(--text)">'+pctNum+'%</div><div style="font-size:10.5px;color:var(--text3);letter-spacing:.04em;text-transform:uppercase;margin-top:2px">進捗</div></div>'
    + '</div>'
    + '<div style="flex:1"></div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    +   '<button onclick="_intgFilter(\'all\')" id="intgFAll" class="intg-chip on">すべて</button>'
    +   '<button onclick="_intgFilter(\'connected\')" id="intgFConn" class="intg-chip">接続済</button>'
    +   '<button onclick="_intgFilter(\'priority\')" id="intgFPri" class="intg-chip">⭐ 推奨</button>'
    +   '<button onclick="_intgFilter(\'oauth\')" id="intgFOauth" class="intg-chip">公式 OAuth</button>'
    +   '<button onclick="_intgFilter(\'form\')" id="intgFForm" class="intg-chip">API キー</button>'
    + '</div>'
    + '</div>';

  // Group blocks
  var html = head;
  INTG_GROUP_ORDER.forEach(function(g){
    var arr = groups[g] || [];
    if(!arr.length) return;
    html += '<div class="intg-grp" data-grp="'+g+'" style="margin-bottom:22px">';
    html += '<div style="font-size:14px;font-weight:900;color:var(--text);margin-bottom:10px">'+esc(INTG_GROUP_LABEL[g]||g)+' <span style="font-size:11px;color:var(--text3);font-weight:700;margin-left:6px">'+arr.length+'</span></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">';
    arr.forEach(function(s){
      html += _intgCardHtml(s);
    });
    html += '</div></div>';
  });

  // Inject chip styles (lightweight, scoped)
  if(!document.getElementById('intgChipStyles')){
    var st = document.createElement('style'); st.id = 'intgChipStyles';
    st.textContent = '.intg-chip{background:#fff;border:1px solid var(--wire2);border-radius:99px;padding:6px 12px;font-size:11.5px;font-weight:700;cursor:pointer;color:var(--text2);font-family:inherit}'
      + '.intg-chip.on{background:var(--peach);color:#fff;border-color:var(--peach)}'
      + '.intg-card{background:#fff;border:1px solid var(--wire);border-radius:12px;padding:13px;display:flex;flex-direction:column;gap:8px;transition:all .15s}'
      + '.intg-card:hover{border-color:var(--peach);transform:translateY(-1px);box-shadow:0 8px 22px rgba(251,146,60,.06)}'
      + '.intg-card.dimmed{opacity:.45}';
    document.head.appendChild(st);
  }
  host.innerHTML = html;
}

function _intgCardHtml(s){
  var st = s.status || {};
  var connLabel = '✓ 接続済';
  if(st.connected && s.id === 'zapier' && st.count){ connLabel = '✓ ' + st.count + ' Zaps'; }
  var bg = st.connected
    ? '<span style="font-size:10px;font-weight:800;padding:3px 9px;border-radius:99px;background:#d1fae5;color:#10b981;border:1px solid #86efac">'+esc(connLabel)+'</span>'
    : (s.flow === 'oauth' && !s.has_backend
        ? '<span style="font-size:10px;font-weight:800;padding:3px 9px;border-radius:99px;background:#fef3c7;color:#92400e;border:1px solid #fcd34d">🔧 準備中</span>'
        : '<span style="font-size:10px;font-weight:800;padding:3px 9px;border-radius:99px;background:var(--cream2);color:var(--text3);border:1px solid var(--wire2)">未接続</span>');
  var btn = st.connected
    ? '<button onclick="_intgOpen(\''+esc(s.id)+'\')" style="background:#fff;color:var(--text2);border:1px solid var(--wire2);border-radius:7px;padding:6px 11px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;margin-left:auto">管理</button>'
    : '<button onclick="_intgOpen(\''+esc(s.id)+'\')" style="background:var(--peach);color:#fff;border:0;border-radius:7px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit;margin-left:auto">接続</button>';
  var acc = st.account ? ('<div style="font-size:10.5px;color:var(--text3);margin-top:1px">@'+esc(st.account)+'</div>') : '';
  var pri = s.priority ? '<span title="推奨セット" style="font-size:9.5px;color:var(--peach-dark);font-weight:900;margin-left:4px">⭐</span>' : '';
  return ''
    + '<div class="intg-card" data-flow="'+esc(s.flow)+'" data-conn="'+(st.connected?'1':'0')+'" data-pri="'+(s.priority?'1':'0')+'">'
    +   '<div style="display:flex;align-items:flex-start;gap:9px">'
    +     '<div style="width:36px;height:36px;border-radius:9px;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">'+esc(s.logo||'🔌')+'</div>'
    +     '<div style="flex:1;min-width:0">'
    +       '<div style="font-size:13.5px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(s.name)+pri+'</div>'
    +       acc
    +     '</div>'
    +   '</div>'
    +   '<div style="font-size:11.5px;color:var(--text2);line-height:1.5;min-height:32px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+esc(s.desc||'')+'</div>'
    +   '<div style="display:flex;align-items:center;gap:8px;margin-top:auto">'
    +     bg + btn
    +   '</div>'
    + '</div>';
}

function _intgFilter(kind){
  // Toggle chip on
  ['All','Conn','Pri','Oauth','Form'].forEach(function(k){
    var el = document.getElementById('intgF'+k);
    if(el) el.classList.remove('on');
  });
  var map = {all:'intgFAll',connected:'intgFConn',priority:'intgFPri',oauth:'intgFOauth',form:'intgFForm'};
  var ot = document.getElementById(map[kind]||'intgFAll');
  if(ot) ot.classList.add('on');
  // Apply dim filter to cards
  var cards = document.querySelectorAll('.intg-card');
  cards.forEach(function(c){
    var keep = true;
    if(kind === 'connected') keep = c.getAttribute('data-conn') === '1';
    else if(kind === 'priority') keep = c.getAttribute('data-pri') === '1';
    else if(kind === 'oauth') keep = c.getAttribute('data-flow') === 'oauth';
    else if(kind === 'form') keep = (c.getAttribute('data-flow') === 'form' || c.getAttribute('data-flow') === 'webhook');
    c.classList.toggle('dimmed', !keep);
    c.style.display = keep ? '' : 'none';
  });
  // Hide empty groups
  document.querySelectorAll('.intg-grp').forEach(function(g){
    var any = g.querySelectorAll('.intg-card:not([style*="display: none"])').length > 0;
    g.style.display = any ? '' : 'none';
  });
}

// ── Connect modal ───────────────────────────────────
function _intgOpen(id){
  var cat = window._intgCatalog;
  if(!cat) return;
  var s = (cat.services||[]).find(function(x){return x.id===id;});
  if(!s) return;
  var st = s.status || {};

  var existing = document.getElementById('intgModal');
  if(existing) existing.remove();
  var ov = document.createElement('div');
  ov.id = 'intgModal';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,12,.5);z-index:9990;display:flex;align-items:center;justify-content:center;padding:24px';

  var body = '';
  // Slack multi-channel modal — list + add (named webhook URLs)
  if(s.id === 'slack'){
    body =
      '<div style="font-size:12.5px;color:var(--text2);line-height:1.6;margin-bottom:14px">複数チャンネルを登録できます。AI が <code>notify_slack</code> を呼ぶ際は <b>input.channel</b> で名前指定可。各エージェントに既定チャンネルを紐付けることもできます。</div>'
      + '<div style="background:#f9f8f5;border:1px solid var(--wire);border-radius:9px;padding:11px 13px;font-size:11.5px;color:var(--text2);line-height:1.6;margin-bottom:14px">'
      +   '<b style="color:var(--text)">📖 Incoming Webhook URL の取り方</b><br>'
      +   '<a href="https://api.slack.com/messaging/webhooks" target="_blank" style="color:var(--peach-dark);font-weight:700">Slack で Incoming Webhook を作成 →</a> 投稿先チャンネルを選んで URL を取得'
      + '</div>'
      + '<div style="font-size:11.5px;font-weight:800;color:var(--text);margin-bottom:8px">📋 登録済みチャンネル <span id="slackCount" style="font-size:10px;color:var(--text3);font-weight:700">読込中…</span></div>'
      + '<div id="slackList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px"><div style="font-size:11.5px;color:var(--text3);padding:10px;background:var(--cream);border-radius:8px;text-align:center">読込中…</div></div>'
      + '<div style="border-top:1px dashed var(--wire2);padding-top:14px">'
      +   '<div style="font-size:11.5px;font-weight:800;color:var(--text);margin-bottom:8px">＋ チャンネルを追加</div>'
      +   '<input id="slackAddName" placeholder="名前 (例: #sales / 営業 / general)" style="width:100%;padding:9px 11px;border:1px solid var(--wire2);border-radius:8px;font-size:12.5px;font-family:inherit;margin-bottom:6px">'
      +   '<input id="slackAddUrl" type="url" placeholder="https://hooks.slack.com/services/..." style="width:100%;padding:9px 11px;border:1px solid var(--wire2);border-radius:8px;font-size:12px;font-family:ui-monospace,monospace;margin-bottom:8px">'
      +   '<button onclick="_slackChAdd()" style="width:100%;background:var(--peach);color:#fff;border:0;border-radius:8px;padding:10px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit">＋ このチャンネルを追加</button>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:14px"><button onclick="_intgClose()" style="margin-left:auto;background:#fff;color:var(--text2);border:1px solid var(--wire2);border-radius:8px;padding:9px 14px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit">閉じる</button></div>';
  } else if(s.flow === 'wp_multi'){
    // WordPress multi-site
    body =
      '<div style="font-size:12.5px;color:var(--text2);line-height:1.6;margin-bottom:14px">複数の WordPress サイトを登録できます。各エージェントに専用サイトを紐付けて「Blog AI はブログ A、メディア AI はサイト B」のような運用が可能。</div>'
      + '<div style="background:#f9f8f5;border:1px solid var(--wire);border-radius:9px;padding:11px 13px;font-size:11.5px;color:var(--text2);line-height:1.6;margin-bottom:14px">'
      +   '<b style="color:var(--text)">📖 Application Password の取り方</b><br>'
      +   '1. WordPress ダッシュボード → ユーザー → プロフィール<br>'
      +   '2. ページ下部「Application Passwords」セクション<br>'
      +   '3. 名前 (例: "MY AI Agent") を入れて Add → 表示されたパスワードをコピー'
      + '</div>'
      + '<div style="font-size:11.5px;font-weight:800;color:var(--text);margin-bottom:8px">📋 登録済みサイト <span id="wpCount" style="font-size:10px;color:var(--text3);font-weight:700">読込中…</span></div>'
      + '<div id="wpList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px"><div style="font-size:11.5px;color:var(--text3);padding:10px;background:var(--cream);border-radius:8px;text-align:center">読込中…</div></div>'
      + '<div style="border-top:1px dashed var(--wire2);padding-top:14px">'
      +   '<div style="font-size:11.5px;font-weight:800;color:var(--text);margin-bottom:8px">＋ WordPress サイトを追加</div>'
      +   '<input id="wpAddName" placeholder="名前 (例: メインブログ / 案件 A)" style="width:100%;padding:9px 11px;border:1px solid var(--wire2);border-radius:8px;font-size:12.5px;font-family:inherit;margin-bottom:6px">'
      +   '<input id="wpAddUrl" type="url" placeholder="https://example.com" style="width:100%;padding:9px 11px;border:1px solid var(--wire2);border-radius:8px;font-size:12px;font-family:ui-monospace,monospace;margin-bottom:6px">'
      +   '<input id="wpAddUser" placeholder="WordPress ユーザー名" style="width:100%;padding:9px 11px;border:1px solid var(--wire2);border-radius:8px;font-size:12.5px;font-family:inherit;margin-bottom:6px">'
      +   '<input id="wpAddPw" type="password" placeholder="Application Password" style="width:100%;padding:9px 11px;border:1px solid var(--wire2);border-radius:8px;font-size:12px;font-family:ui-monospace,monospace;margin-bottom:8px">'
      +   '<button onclick="_wpSiteAdd()" style="width:100%;background:var(--peach);color:#fff;border:0;border-radius:8px;padding:10px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit">＋ このサイトを追加</button>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:14px"><button onclick="_intgClose()" style="margin-left:auto;background:#fff;color:var(--text2);border:1px solid var(--wire2);border-radius:8px;padding:9px 14px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit">閉じる</button></div>';
  } else if(s.flow === 'zapier_multi'){
    // Zapier: multi-webhook. Render a list of registered Zaps + an add form.
    // List is fetched async after the modal is mounted.
    body =
      '<div style="font-size:12.5px;color:var(--text2);line-height:1.6;margin-bottom:14px">'+esc(s.desc||'')+'</div>'
      // ── One-click template cards — each links to Zapier's app-pair page
      //    where Webhooks-by-Zapier + the target service are pre-selected, so
      //    the user can pick a ready-made template instead of building from
      //    scratch. Much friendlier for non-Zapier users.
      // SNS 投稿セクションを最初に独立して見せる — ユーザーが「X や Threads
      // どこから設定する?」で迷わないように、サービス名を直接クリッカブルに。
      + '<div style="font-size:12px;font-weight:800;color:var(--text);margin-bottom:6px;letter-spacing:.02em">📱 SNS に AI から投稿する</div>'
      + '<div style="font-size:11px;color:var(--text3);margin-bottom:8px;line-height:1.55">📦 のついてるカード = <b>Buffer 経由がベスト</b>。Buffer 1 つで 7 SNS (X / Threads / IG / FB / LinkedIn / Pinterest / TikTok) に投稿可能。クリックで Buffer 接続カードが開きます。⚡ のついてるのは Zapier 経由。</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(115px,1fr));gap:8px;margin-bottom:14px">'
      +   _zapTplCard('🐦', 'X (Twitter)', 'buffer', 'Buffer 経由')
      +   _zapTplCard('🧵', 'Threads', 'buffer', 'Buffer 経由')
      +   _zapTplCard('📷', 'Instagram', 'buffer', 'Buffer 経由')
      +   _zapTplCard('💼', 'LinkedIn', 'linkedin', '直接 or Buffer')
      +   _zapTplCard('📘', 'Facebook', 'facebook-pages', 'Pages 直接')
      +   _zapTplCard('▶️', 'YouTube', 'youtube', '動画 / コメント')
      +   _zapTplCard('🎵', 'TikTok', 'tiktok-for-business', 'Business アカ必須')
      +   _zapTplCard('📌', 'Pinterest', 'pinterest', '直接')
      +   _zapTplCard('🐘', 'Mastodon', 'mastodon', '直接')
      +   _zapTplCard('🦋', 'Bluesky', 'bluesky', '新興 SNS')
      +   _zapTplCard('🎮', 'Discord', 'discord', 'コミュニティ通知')
      +   _zapTplCard('📦', 'Buffer まとめ', 'buffer', 'SNS ハブ')
      + '</div>'
      + '<div style="font-size:12px;font-weight:800;color:var(--text);margin-bottom:6px;letter-spacing:.02em;margin-top:14px">💼 他のサービス</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(115px,1fr));gap:8px;margin-bottom:12px">'
      +   _zapTplCard('💬', 'Slack 通知', 'slack', '#general に AI から通知')
      +   _zapTplCard('📋', 'Google Sheets', 'google-sheets', '行追加 / 検索')
      +   _zapTplCard('📧', 'Gmail 送信', 'gmail', '本文を AI に書かせる')
      +   _zapTplCard('📝', 'Notion', 'notion', '議事録を保存')
      +   _zapTplCard('📋', 'Trello', 'trello', 'タスクを自動追加')
      +   _zapTplCard('📬', 'Mailchimp', 'mailchimp', 'メルマガ送信')
      +   _zapTplCard('🗂️', 'Airtable', 'airtable', 'DB に行追加')
      +   _zapTplCard('🚀', 'HubSpot CRM', 'hubspot', 'リード自動追加')
      + '</div>'
      + '<div style="background:#fff7ee;border:1px solid #fed7aa;border-radius:9px;padding:11px 13px;font-size:11.5px;color:#9a3412;line-height:1.55;margin-bottom:14px">'
      +   '<b style="color:#7c2d12">🐦 X / Threads / IG はなぜ Buffer 経由?</b><br>'
      +   '<span style="font-size:11px">X は 2023 年 8 月に Zapier 直接連携を廃止 (API 有料化の影響)。Threads / Instagram も Meta が API 制限中。<b>Buffer</b> は X / Threads / IG / FB / LinkedIn / Pinterest / TikTok と直接契約済なので、Buffer 無料登録 → MY AI Agent → Buffer → 各 SNS の経路で動きます。<a href="https://buffer.com/" target="_blank" rel="noopener" style="color:var(--peach-dark);font-weight:700">Buffer 無料登録 →</a> (3 SNS / 10 投稿先まで無料)</span>'
      + '</div>'
      + '<div style="font-size:11px;color:var(--text3);margin-bottom:14px;line-height:1.6;padding-left:6px;border-left:2px solid var(--wire2)">クリックすると Zapier の準備済みテンプレート一覧が新タブで開きます。Zap を公開後、画面に出る Catch Hook URL を ↓ 下のフォームに貼り付けてください。</div>'
      + '<div style="background:#f9f8f5;border:1px solid var(--wire);border-radius:9px;padding:11px 13px;font-size:11.5px;color:var(--text2);line-height:1.6;margin-bottom:14px">'
      +   '<details><summary style="cursor:pointer;font-weight:800;color:var(--text);list-style:none">📖 詳しい手順を見る (4 ステップ)</summary>'
      +   '<div style="margin-top:8px">'
      +     '1. 上のテンプレからやりたいことを選ぶ (Zapier が新タブで開く)<br>'
      +     '2. Zapier に <a href="https://zapier.com/sign-up" target="_blank" style="color:var(--peach-dark);font-weight:700">無料登録</a> or ログイン<br>'
      +     '3. テンプレを「Try it」 → 連携先 (X / Slack 等) のアカウントを Zapier に接続 → Publish<br>'
      +     '4. 表示される <b>Catch Hook URL</b> をコピー → 下のフォームに登録'
      +   '</div></details>'
      + '</div>'
      + '<div style="font-size:11.5px;font-weight:800;color:var(--text);margin-bottom:8px">📋 登録済みの Zap <span id="zapierCount" style="font-size:10px;color:var(--text3);font-weight:700">読込中…</span></div>'
      + '<div id="zapierList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px">'
      +   '<div style="font-size:11.5px;color:var(--text3);padding:10px;background:var(--cream);border-radius:8px;text-align:center">読込中…</div>'
      + '</div>'
      + '<div style="border-top:1px dashed var(--wire2);padding-top:14px">'
      +   '<div style="font-size:11.5px;font-weight:800;color:var(--text);margin-bottom:8px">＋ 新しい Zap を追加</div>'
      +   '<input id="zapierAddName" placeholder="名前 (例: X に投稿 / Slack 通知 / Sheets に追記)" style="width:100%;padding:9px 11px;border:1px solid var(--wire2);border-radius:8px;font-size:12.5px;font-family:inherit;margin-bottom:6px">'
      +   '<input id="zapierAddUrl" type="url" placeholder="https://hooks.zapier.com/hooks/catch/.../..." style="width:100%;padding:9px 11px;border:1px solid var(--wire2);border-radius:8px;font-size:12px;font-family:ui-monospace,monospace;margin-bottom:6px">'
      +   '<input id="zapierAddHint" placeholder="(任意) AI へのヒント。例: ツイート本文を text フィールドで渡す" style="width:100%;padding:9px 11px;border:1px solid var(--wire2);border-radius:8px;font-size:12px;font-family:inherit;margin-bottom:8px">'
      +   '<button onclick="_zapierAdd()" style="width:100%;background:var(--peach);color:#fff;border:0;border-radius:8px;padding:10px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit">＋ この Zap を追加</button>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:14px"><button onclick="_intgClose()" style="margin-left:auto;background:#fff;color:var(--text2);border:1px solid var(--wire2);border-radius:8px;padding:9px 14px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit">閉じる</button></div>';
  } else if(s.flow === 'oauth' && s.has_backend){
    // 1-click OAuth — single big button that top-level-redirects to /api/auth/:provider/start.
    // We pass the JWT as ?token=... because top-level nav can't set Authorization headers.
    var startUrl = (s.oauth && s.oauth.start) ? s.oauth.start : ('/api/auth/'+s.id+'/start');
    var jwt = localStorage.getItem('token') || '';
    var fullStart = startUrl + (startUrl.indexOf('?')<0?'?':'&') + 'token=' + encodeURIComponent(jwt);
    // Google Workspace bundle: same OAuth gives 6 services in one go — make
    // sure users know they're not just connecting Gmail (or whichever card).
    var isGoogleBundle = (s.oauth && s.oauth.bundle === 'google');
    var bundleNote = isGoogleBundle
      ? '<div style="background:#e0f2fe;color:#075985;border:1px solid #7dd3fc;border-radius:9px;padding:11px 13px;font-size:12px;font-weight:600;margin-bottom:14px;line-height:1.6">'
        + '🎁 <b>6-in-1: 1 回の認証で 6 サービスが繋がります</b><br>'
        + '<span style="font-size:11.5px;color:#0c4a6e;font-weight:500">Gmail / Google Calendar / Google Drive / Google Sheets / GA4 / YouTube / Search Console</span>'
        + '</div>'
      : '';
    body =
      '<div style="font-size:12.5px;color:var(--text2);line-height:1.6;margin-bottom:18px">'+esc(s.desc||'')+'</div>'
      + bundleNote
      + (st.connected
        ? '<div style="background:#d1fae5;color:#10b981;border:1px solid #86efac;border-radius:9px;padding:11px 13px;font-size:12.5px;font-weight:700;margin-bottom:14px">✓ 接続済'+(st.account?' ('+esc(st.account)+')':'')+'</div>'
        : '')
      + '<div style="background:#f9f8f5;border:1px solid var(--wire);border-radius:9px;padding:12px;font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:14px">'
      +   '<b style="color:var(--text)">🔒 1 クリックで安全に接続</b><br>'
      +   '次の画面で '+esc(s.name)+' の認可ページに移動します。承認すると自動でこのアプリに戻ります。トークンはあなたの端末経由ではなく、サーバー間で直接交換されます。'
      + '</div>'
      + (st.connected
        ? '<div style="display:flex;gap:6px;margin-top:14px"><button onclick="_intgDisconnect(\''+esc(s.id)+'\')" style="background:#fff;color:#dc2626;border:1px solid #fecaca;border-radius:8px;padding:9px 14px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit">🗑 接続を解除</button><a href="'+esc(fullStart)+'" style="margin-left:auto;background:var(--peach);color:#fff;border:0;border-radius:8px;padding:9px 18px;font-size:12.5px;font-weight:800;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center">🔄 再接続</a></div>'
        : '<div style="display:flex;gap:6px;margin-top:14px"><button onclick="_intgClose()" style="background:#fff;color:var(--text2);border:1px solid var(--wire2);border-radius:8px;padding:9px 14px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit">キャンセル</button><a href="'+esc(fullStart)+'" style="margin-left:auto;background:var(--peach);color:#fff;border:0;border-radius:8px;padding:9px 22px;font-size:12.5px;font-weight:800;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center">🔌 '+esc(s.name)+' で接続 →</a></div>');
  } else if(s.id === 'buffer' && !s.has_backend){
    // Buffer-specific setup walkthrough — when admin hasn't set
    // BUFFER_OAUTH_CLIENT_ID/SECRET yet, give a clear step-by-step.
    body =
      '<div style="background:#fff7ee;border:1px solid #fed7aa;border-radius:10px;padding:13px 15px;font-size:12.5px;line-height:1.65;color:#7c2d12;margin-bottom:14px">'
      +   '<b style="color:#7c2d12;font-size:13.5px">📦 Buffer とは?</b><br>'
      +   '<span style="color:#9a3412">1 アカウントで X / Threads / Instagram / LinkedIn / FB / Pinterest / TikTok の 7 SNS に投稿可能なハブサービス。<b>無料プラン</b>で 3 SNS / 10 投稿先まで使えます。Buffer に AI から投稿させたいので、まず Buffer 側で「アプリ」を作ってその鍵をこのアプリに渡す必要があります。</span>'
      + '</div>'
      + '<div style="font-size:12.5px;font-weight:900;color:var(--text);margin:14px 0 8px;letter-spacing:.02em">🛠 接続手順 (所要 5-10 分)</div>'
      + '<ol style="font-size:12.5px;color:var(--text);line-height:1.75;padding-left:24px;margin:0 0 14px">'
      +   '<li style="margin-bottom:10px"><b><a href="https://buffer.com/" target="_blank" rel="noopener" style="color:var(--peach-dark);font-weight:800">Buffer 無料登録</a></b> (まだなら) → メールで認証</li>'
      +   '<li style="margin-bottom:10px">Buffer にログインしたまま <b><a href="https://buffer.com/developers/apps/create" target="_blank" rel="noopener" style="color:var(--peach-dark);font-weight:800">Developer Apps ページ</a></b> を開く</li>'
      +   '<li style="margin-bottom:10px">「<b>Create an app</b>」ボタンで以下を入力:'
      +     '<div style="background:var(--cream);border:1px solid var(--wire2);border-radius:8px;padding:10px 12px;margin-top:6px;font-size:11.5px;line-height:1.7">'
      +       '<b>App Name:</b> <span style="font-family:ui-monospace,monospace">MY AI Agent</span><br>'
      +       '<b>Description:</b> <span style="font-family:ui-monospace,monospace">AI-powered SNS posting</span><br>'
      +       '<b>Website URL:</b> <span style="font-family:ui-monospace,monospace">https://myaiagents.agency</span><br>'
      +       '<b>Callback URL:</b> <span style="font-family:ui-monospace,monospace;background:#fff;padding:2px 6px;border-radius:4px;border:1px solid var(--wire2)">https://myaiagents.agency/api/auth/buffer/callback</span> <button onclick="navigator.clipboard.writeText(\'https://myaiagents.agency/api/auth/buffer/callback\');showToast(\'✓ コピーしました\',\'ok\')" style="background:var(--peach);color:#fff;border:0;border-radius:5px;padding:3px 8px;font-size:10px;font-weight:700;cursor:pointer;margin-left:4px;font-family:inherit">📋 コピー</button>'
      +     '</div>'
      +   '</li>'
      +   '<li style="margin-bottom:10px">作成後の <b>Client ID</b> と <b>Client Secret</b> をコピー (Secret は 1 度しか見られない! 注意)</li>'
      +   '<li style="margin-bottom:10px">Render → <b>myagent</b> サービス → <b>Environment</b> タブ → 環境変数を 2 つ追加:'
      +     '<div style="background:var(--cream);border:1px solid var(--wire2);border-radius:8px;padding:10px 12px;margin-top:6px;font-size:11.5px;line-height:1.7;font-family:ui-monospace,monospace">'
      +       'BUFFER_OAUTH_CLIENT_ID = <span style="color:var(--text3)">[Client ID]</span><br>'
      +       'BUFFER_OAUTH_CLIENT_SECRET = <span style="color:var(--text3)">[Client Secret]</span>'
      +     '</div>'
      +   '</li>'
      +   '<li style="margin-bottom:10px"><b>Save Changes</b> → Render が自動で再起動 (2-3 分)</li>'
      +   '<li>このカードを再度開く → 「🔌 Buffer で接続」ボタンに変化 → 1 クリックで完了 ✅</li>'
      + '</ol>'
      + '<div style="background:#f9f8f5;border:1px solid var(--wire);border-radius:9px;padding:11px 13px;font-size:11.5px;color:var(--text2);line-height:1.55;margin-bottom:14px">'
      +   '<b style="color:var(--text)">💡 困ったら</b><br>'
      +   '・ Callback URL は <b>必ず https</b>で。http だと Buffer が拒否します。<br>'
      +   '・ Secret を紛失したら Developer Apps ページから新規発行 → Render を上書き保存。<br>'
      +   '・ <a href="https://buffer.com/developers/api" target="_blank" rel="noopener" style="color:var(--peach-dark);font-weight:700">Buffer API ドキュメント →</a>'
      + '</div>'
      // ── 代替案: 設定なしで使いたい人向け ──
      + '<div style="background:linear-gradient(135deg,#fff7ee,#ffe4c4);border:1px solid #fed7aa;border-radius:9px;padding:12px;font-size:12.5px;line-height:1.6;color:#9a3412">'
      +   '<b style="color:#7c2d12">⚡ Buffer 登録なしで今すぐ投稿したい?</b><br>'
      +   '<b>share_to_sns</b> ツールなら **設定ゼロ** で X / Threads / LinkedIn / FB / Reddit / Bluesky 等に投稿できます (intent URL ボタンが出るので 1 タップで投稿)。'
      +   '<button onclick="_intgClose()" style="display:block;margin-top:10px;background:var(--peach);color:#fff;border:0;border-radius:7px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">了解 (チャットで「X に投稿して」と言うだけで OK)</button>'
      + '</div>';
  } else if(s.flow === 'oauth' && !s.has_backend){
    body =
      '<div style="background:#fef3c7;color:#92400e;border:1px solid #fcd34d;border-radius:9px;padding:12px;font-size:12.5px;line-height:1.6;margin-bottom:12px">'
      + '<b>🔧 セットアップ準備中</b><br>'
      + 'このサービスは「OAuth App の開発者登録」が必要です。Render に Client ID/Secret を投入後、自動でこのカードが「接続」ボタンに昇格します。<br>'
      + '<a href="/docs/oauth-setup.md" target="_blank" style="color:var(--peach-dark);font-weight:800">セットアップ手順を見る →</a>'
      + '</div>'
      // Pragmatic alternative: Zapier covers basically all of these services
      // already. Point users to it so they don't bounce off waiting for OAuth.
      + '<div style="background:linear-gradient(135deg,#fff7ee,#ffe4c4);border:1px solid #fed7aa;border-radius:9px;padding:12px;font-size:12.5px;line-height:1.6;color:#9a3412">'
      +   '<b style="color:#7c2d12">⚡ 今すぐ使いたいなら Zapier 経由がおすすめ</b><br>'
      +   esc(s.name) + ' は <b>Zapier</b> 経由で今すぐ接続できます。Zapier 側で OAuth するので、こちらの開発者登録は不要。'
      +   '<button onclick="_intgClose();setTimeout(function(){_intgOpen(\'zapier\')},150)" style="display:block;margin-top:10px;background:var(--peach);color:#fff;border:0;border-radius:7px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">⚡ Zapier カードを開く →</button>'
      + '</div>';
  } else {
    var fields = s.fields || [];
    body = fields.map(function(f){
      var ph = f.help ? f.help.slice(0, 80) : '';
      var inputType = f.type === 'password' ? 'password' : (f.type === 'url' ? 'url' : 'text');
      return ''
        + '<div style="margin-bottom:12px">'
        +   '<label style="display:block;font-size:11.5px;font-weight:800;color:var(--text);margin-bottom:5px">'+esc(f.label)+(f.required!==false?' <span style="color:#dc2626">*</span>':'')+'</label>'
        +   '<input id="intgF_'+esc(f.key)+'" type="'+inputType+'" placeholder="'+esc(ph||f.label)+'" autocomplete="off" style="width:100%;padding:9px 11px;border:1px solid var(--wire2);border-radius:8px;font-size:13px;font-family:'+(f.type==='password'||f.type==='url'?'ui-monospace,monospace':'inherit')+'">'
        +   (f.help ? '<div style="font-size:10.5px;color:var(--text3);margin-top:4px;line-height:1.4">💡 '+esc(f.help)+'</div>' : '')
        + '</div>';
    }).join('');
    body =
      '<div style="font-size:12.5px;color:var(--text2);line-height:1.6;margin-bottom:14px">'+esc(s.desc||'')+'</div>'
      + body
      + (st.connected
        ? '<div style="display:flex;gap:6px;margin-top:14px"><button onclick="_intgDisconnect(\''+esc(s.id)+'\')" style="background:#fff;color:#dc2626;border:1px solid #fecaca;border-radius:8px;padding:9px 14px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit">🗑 接続を解除</button><button onclick="_intgSave(\''+esc(s.id)+'\')" style="margin-left:auto;background:var(--peach);color:#fff;border:0;border-radius:8px;padding:9px 18px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit">再接続</button></div>'
        : '<div style="display:flex;gap:6px;margin-top:14px"><button onclick="_intgClose()" style="background:#fff;color:var(--text2);border:1px solid var(--wire2);border-radius:8px;padding:9px 14px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit">キャンセル</button><button onclick="_intgSave(\''+esc(s.id)+'\')" style="margin-left:auto;background:var(--peach);color:#fff;border:0;border-radius:8px;padding:9px 22px;font-size:12.5px;font-weight:800;cursor:pointer;font-family:inherit">🔌 接続</button></div>');
  }

  ov.innerHTML =
    '<div style="background:#fff;border-radius:14px;max-width:520px;width:100%;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 48px rgba(0,0,0,.18)">'
    +   '<div style="padding:16px 20px;border-bottom:1px solid var(--wire);display:flex;align-items:center;gap:11px">'
    +     '<div style="width:38px;height:38px;border-radius:9px;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:22px">'+esc(s.logo||'🔌')+'</div>'
    +     '<div style="flex:1;min-width:0"><div style="font-size:15px;font-weight:900;color:var(--text)">'+esc(s.name)+'</div><div style="font-size:11px;color:var(--text3);margin-top:1px">'+esc(INTG_GROUP_LABEL[s.group]||'')+'</div></div>'
    +     '<button onclick="_intgClose()" style="background:transparent;border:0;color:var(--text3);cursor:pointer;font-size:18px;padding:4px 8px">×</button>'
    +   '</div>'
    +   '<div style="flex:1;overflow-y:auto;padding:18px 20px">'+body+'</div>'
    + '</div>';
  ov.addEventListener('click', function(e){ if(e.target === ov) _intgClose(); });
  document.body.appendChild(ov);
  // Zapier-specific: hydrate the list of registered Zaps after mount
  if(s.flow === 'zapier_multi'){ setTimeout(_zapierLoadList, 0); }
  if(s.id === 'slack'){ setTimeout(_slackChLoadList, 0); }
  if(s.flow === 'wp_multi'){ setTimeout(_wpSitesLoadList, 0); }
}

// ── Zapier multi-webhook helpers ─────────────────────────
// One-click template card. Opens Zapier's app-pair marketplace page in a
// new tab where Webhooks-by-Zapier + the target app are pre-selected. The
// user picks a template, clicks "Try it", connects their account, and gets
// a Catch Hook URL to paste back into the form below.
function _zapTplCard(emoji, name, appSlug, hint){
  // SNS cards labeled "Buffer 経由" should NOT go to Zapier — Buffer is a
  // single OAuth that already covers X / Threads / IG / LinkedIn / FB /
  // Pinterest / TikTok. Sending users to Zapier to wire Buffer + Webhooks
  // is a pointless extra hop. Route those cards to the Buffer integration
  // card instead so they hit the clean 7-step setup we wrote.
  if(appSlug === 'buffer'){
    return '<button onclick="_intgClose();setTimeout(function(){_intgOpen(\'buffer\')},150)" '
      + 'style="background:#fff;border:1px solid var(--wire2);border-radius:9px;padding:10px 11px;text-align:left;color:inherit;font-family:inherit;display:flex;flex-direction:column;gap:3px;transition:all .15s;cursor:pointer" '
      + 'onmouseover="this.style.borderColor=\'var(--peach)\';this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 6px 16px rgba(251,146,60,.1)\'" '
      + 'onmouseout="this.style.borderColor=\'var(--wire2)\';this.style.transform=\'translateY(0)\';this.style.boxShadow=\'none\'"'
      + '>'
      + '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:16px;line-height:1">'+esc(emoji)+'</span><span style="font-size:11.5px;font-weight:800;color:var(--text);line-height:1.2">'+esc(name)+'</span></div>'
      + '<div style="font-size:10px;color:var(--text3);line-height:1.4">📦 '+esc(hint)+' (クリックで Buffer カードを開く)</div>'
      + '</button>';
  }
  var url = 'https://zapier.com/apps/webhook/integrations/' + appSlug;
  return '<a href="'+esc(url)+'" target="_blank" rel="noopener" '
    + 'style="background:#fff;border:1px solid var(--wire2);border-radius:9px;padding:10px 11px;text-decoration:none;color:inherit;font-family:inherit;display:flex;flex-direction:column;gap:3px;transition:all .15s;cursor:pointer" '
    + 'onmouseover="this.style.borderColor=\'var(--peach)\';this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 6px 16px rgba(251,146,60,.1)\'" '
    + 'onmouseout="this.style.borderColor=\'var(--wire2)\';this.style.transform=\'translateY(0)\';this.style.boxShadow=\'none\'"'
    + '>'
    + '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:16px;line-height:1">'+esc(emoji)+'</span><span style="font-size:11.5px;font-weight:800;color:var(--text);line-height:1.2">'+esc(name)+'</span></div>'
    + '<div style="font-size:10px;color:var(--text3);line-height:1.4">⚡ '+esc(hint)+'</div>'
    + '</a>';
}

async function _zapierLoadList(){
  var listEl = document.getElementById('zapierList');
  var countEl = document.getElementById('zapierCount');
  if(!listEl) return;
  try {
    var r = await api('GET', '/api/me/integrations/zapier/webhooks');
    var hooks = (r && r.webhooks) || [];
    if(countEl) countEl.textContent = '(' + hooks.length + ')';
    if(!hooks.length){
      listEl.innerHTML = '<div style="font-size:11.5px;color:var(--text3);padding:12px;background:var(--cream);border-radius:8px;text-align:center">まだ Zap が登録されていません。下のフォームから 1 つ追加してください。</div>';
      return;
    }
    listEl.innerHTML = hooks.map(function(w){
      return ''
        + '<div style="background:#fff;border:1px solid var(--wire2);border-radius:9px;padding:10px 12px;display:flex;align-items:center;gap:9px">'
        +   '<div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#ff4a00,#ff8a00);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">⚡</div>'
        +   '<div style="flex:1;min-width:0">'
        +     '<div style="font-size:12.5px;font-weight:800;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(w.name)+'</div>'
        +     (w.hint ? '<div style="font-size:10.5px;color:var(--text2);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(w.hint)+'</div>' : '')
        +     '<div style="font-size:9.5px;color:var(--text3);margin-top:2px;font-family:ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(w.url_preview||'')+'</div>'
        +   '</div>'
        +   '<button onclick="_zapierDelete(\''+esc(w.id)+'\')" title="削除" style="background:#fff;border:1px solid #fecaca;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;color:#dc2626;font-family:inherit;flex-shrink:0">🗑</button>'
        + '</div>';
    }).join('');
  } catch(e){
    listEl.innerHTML = '<div style="font-size:11px;color:#dc2626;padding:8px">読込失敗: '+esc(e.message||'')+'</div>';
  }
}
async function _zapierAdd(){
  var name = (document.getElementById('zapierAddName').value||'').trim();
  var url  = (document.getElementById('zapierAddUrl').value||'').trim();
  var hint = (document.getElementById('zapierAddHint').value||'').trim();
  if(!name){ showToast('名前を入力してください','ng'); return; }
  if(!/^https:\/\/hooks\.zapier\.com\//.test(url)){ showToast('https://hooks.zapier.com/... 形式の URL を入力','ng'); return; }
  try {
    await api('POST', '/api/me/integrations/zapier/webhooks', { name, url, hint });
    document.getElementById('zapierAddName').value = '';
    document.getElementById('zapierAddUrl').value = '';
    document.getElementById('zapierAddHint').value = '';
    showToast('✓ Zap を追加','ok');
    _zapierLoadList();
    // Refresh catalog status so the card shows updated count
    if(typeof _loadIntegrations === 'function') _loadIntegrations();
  } catch(e){
    showToast((e.message||'追加失敗'),'ng');
  }
}
async function _zapierDelete(id){
  if(!confirm('この Zap を削除?')) return;
  try {
    await api('DELETE', '/api/me/integrations/zapier/webhooks/'+id);
    showToast('削除しました','ok');
    _zapierLoadList();
    if(typeof _loadIntegrations === 'function') _loadIntegrations();
  } catch(e){
    showToast((e.message||'削除失敗'),'ng');
  }
}

function _intgClose(){
  var ov = document.getElementById('intgModal');
  if(ov) ov.remove();
}

// ── Slack multi-channel helpers ─────────────────────────────
async function _slackChLoadList(){
  var listEl = document.getElementById('slackList');
  var countEl = document.getElementById('slackCount');
  if(!listEl) return;
  try {
    var r = await api('GET', '/api/me/integrations/slack/webhooks');
    var ws = (r && r.webhooks) || [];
    if(countEl) countEl.textContent = '(' + ws.length + ')';
    if(!ws.length){ listEl.innerHTML = '<div style="font-size:11.5px;color:var(--text3);padding:12px;background:var(--cream);border-radius:8px;text-align:center">まだチャンネル未登録。下のフォームから追加してください。</div>'; return; }
    listEl.innerHTML = ws.map(function(w){
      return ''
        + '<div style="background:#fff;border:1px solid var(--wire2);border-radius:9px;padding:10px 12px;display:flex;align-items:center;gap:9px">'
        +   '<div style="width:30px;height:30px;border-radius:7px;background:#4a154b;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0">💬</div>'
        +   '<div style="flex:1;min-width:0">'
        +     '<div style="font-size:12.5px;font-weight:800;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(w.name)+(w.is_default?' <span style="font-size:9.5px;color:var(--peach-dark);font-weight:900;background:rgba(251,146,60,.12);padding:1px 6px;border-radius:99px;margin-left:4px">★ 既定</span>':'')+'</div>'
        +     '<div style="font-size:9.5px;color:var(--text3);margin-top:1px;font-family:ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(w.url_preview||'')+'</div>'
        +   '</div>'
        +   (w.is_default ? '' : '<button onclick="_slackChDefault(\''+esc(w.id)+'\')" title="既定にする" style="background:#fff;border:1px solid var(--wire2);border-radius:6px;padding:4px 8px;font-size:10.5px;cursor:pointer;color:var(--text2);font-family:inherit;flex-shrink:0">既定にする</button>')
        +   '<button onclick="_slackChDelete(\''+esc(w.id)+'\')" title="削除" style="background:#fff;border:1px solid #fecaca;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;color:#dc2626;font-family:inherit;flex-shrink:0">🗑</button>'
        + '</div>';
    }).join('');
  } catch(e){
    listEl.innerHTML = '<div style="font-size:11px;color:#dc2626;padding:8px">読込失敗: '+esc(e.message||'')+'</div>';
  }
}
async function _slackChAdd(){
  var name = (document.getElementById('slackAddName').value||'').trim();
  var url = (document.getElementById('slackAddUrl').value||'').trim();
  if(!name){ showToast('名前を入力','ng'); return; }
  if(!/^https:\/\/hooks\.slack\.com\//.test(url)){ showToast('https://hooks.slack.com/... 形式の URL を','ng'); return; }
  try {
    await api('POST', '/api/me/integrations/slack/webhooks', { name, url });
    document.getElementById('slackAddName').value = '';
    document.getElementById('slackAddUrl').value = '';
    showToast('✓ 追加','ok'); _slackChLoadList();
    if(typeof _loadIntegrations === 'function') _loadIntegrations();
  } catch(e){ showToast((e.message||'失敗'),'ng'); }
}
async function _slackChDelete(id){
  if(!confirm('このチャンネルを削除?')) return;
  try {
    await api('DELETE', '/api/me/integrations/slack/webhooks/'+id);
    showToast('削除','ok'); _slackChLoadList();
    if(typeof _loadIntegrations === 'function') _loadIntegrations();
  } catch(e){ showToast((e.message||'失敗'),'ng'); }
}
async function _slackChDefault(id){
  try {
    await api('POST', '/api/me/integrations/slack/default', { id });
    showToast('✓ 既定に設定','ok'); _slackChLoadList();
  } catch(e){ showToast((e.message||'失敗'),'ng'); }
}

// ── WordPress multi-site helpers ────────────────────────────
async function _wpSitesLoadList(){
  var listEl = document.getElementById('wpList');
  var countEl = document.getElementById('wpCount');
  if(!listEl) return;
  try {
    var r = await api('GET', '/api/me/integrations/wordpress/sites');
    var sites = (r && r.sites) || [];
    if(countEl) countEl.textContent = '(' + sites.length + ')';
    if(!sites.length){ listEl.innerHTML = '<div style="font-size:11.5px;color:var(--text3);padding:12px;background:var(--cream);border-radius:8px;text-align:center">まだサイト未登録。下のフォームから追加してください。</div>'; return; }
    listEl.innerHTML = sites.map(function(s){
      return ''
        + '<div style="background:#fff;border:1px solid var(--wire2);border-radius:9px;padding:10px 12px;display:flex;align-items:center;gap:9px">'
        +   '<div style="width:30px;height:30px;border-radius:7px;background:#21759b;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0">W</div>'
        +   '<div style="flex:1;min-width:0">'
        +     '<div style="font-size:12.5px;font-weight:800;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(s.name)+(s.is_default?' <span style="font-size:9.5px;color:var(--peach-dark);font-weight:900;background:rgba(251,146,60,.12);padding:1px 6px;border-radius:99px;margin-left:4px">★ 既定</span>':'')+'</div>'
        +     '<div style="font-size:10px;color:var(--text3);margin-top:1px;font-family:ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(s.siteUrl)+' · @'+esc(s.username||'')+'</div>'
        +   '</div>'
        +   (s.is_default ? '' : '<button onclick="_wpSiteDefault(\''+esc(s.id)+'\')" title="既定にする" style="background:#fff;border:1px solid var(--wire2);border-radius:6px;padding:4px 8px;font-size:10.5px;cursor:pointer;color:var(--text2);font-family:inherit;flex-shrink:0">既定にする</button>')
        +   '<button onclick="_wpSiteDelete(\''+esc(s.id)+'\')" title="削除" style="background:#fff;border:1px solid #fecaca;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;color:#dc2626;font-family:inherit;flex-shrink:0">🗑</button>'
        + '</div>';
    }).join('');
  } catch(e){
    listEl.innerHTML = '<div style="font-size:11px;color:#dc2626;padding:8px">読込失敗: '+esc(e.message||'')+'</div>';
  }
}
async function _wpSiteAdd(){
  var name = (document.getElementById('wpAddName').value||'').trim();
  var siteUrl = (document.getElementById('wpAddUrl').value||'').trim();
  var username = (document.getElementById('wpAddUser').value||'').trim();
  var appPassword = (document.getElementById('wpAddPw').value||'').trim();
  if(!name || !siteUrl || !username || !appPassword){ showToast('全項目入力してください','ng'); return; }
  try {
    await api('POST', '/api/me/integrations/wordpress/sites', { name, siteUrl, username, appPassword });
    ['wpAddName','wpAddUrl','wpAddUser','wpAddPw'].forEach(function(id){ var el = document.getElementById(id); if(el) el.value = ''; });
    showToast('✓ 追加','ok'); _wpSitesLoadList();
    if(typeof _loadIntegrations === 'function') _loadIntegrations();
  } catch(e){ showToast((e.message||'失敗'),'ng'); }
}
async function _wpSiteDelete(id){
  if(!confirm('このサイトを削除?')) return;
  try {
    await api('DELETE', '/api/me/integrations/wordpress/sites/'+id);
    showToast('削除','ok'); _wpSitesLoadList();
    if(typeof _loadIntegrations === 'function') _loadIntegrations();
  } catch(e){ showToast((e.message||'失敗'),'ng'); }
}
async function _wpSiteDefault(id){
  try {
    await api('POST', '/api/me/integrations/wordpress/default', { id });
    showToast('✓ 既定に設定','ok'); _wpSitesLoadList();
  } catch(e){ showToast((e.message||'失敗'),'ng'); }
}

async function _intgSave(id){
  var cat = window._intgCatalog;
  var s = (cat && cat.services || []).find(function(x){return x.id===id;});
  if(!s) return;
  var fields = s.fields || [];
  var body = {};
  var missing = false;
  fields.forEach(function(f){
    var el = document.getElementById('intgF_'+f.key);
    var v = el ? (el.value||'').trim() : '';
    if(f.required !== false && !v) missing = true;
    if(v) body[f.key] = v;
  });
  if(missing){ showToast('必須項目を入力してください','ng'); return; }
  // GitHub uses the existing /api/me/integrations/github endpoint
  var endpoint = '/api/me/integrations/' + id;
  try {
    var r = await api('PUT', endpoint, body);
    showToast('✓ '+esc(s.name)+' に接続しました','ok');
    _intgClose();
    _loadIntegrations();
    // Refresh `me.github_connected` flag for compatibility with edit-agent UI
    if(id === 'github' && me){ me.github_connected = true; }
  } catch(e){
    showToast((e.message||'接続失敗'),'ng');
  }
}

async function _intgDisconnect(id){
  var s = (window._intgCatalog && window._intgCatalog.services || []).find(function(x){return x.id===id;});
  if(!confirm((s?s.name:'この連携')+' を解除しますか?')) return;
  try {
    await api('DELETE', '/api/me/integrations/' + id);
    showToast('解除しました','ok');
    _intgClose();
    _loadIntegrations();
    if(id === 'github' && me){ me.github_connected = false; }
  } catch(e){
    showToast((e.message||'失敗'),'ng');
  }
}

// Sidebar 🔌 連携 badge — shows N/50. Updated whenever catalog reloads.
function _updateConnectBadge(){
  var el = document.getElementById('sbConnectBadge');
  if(!el) return;
  var cat = window._intgCatalog;
  if(!cat){ el.textContent = ''; return; }
  el.textContent = (cat.connected||0) + '/' + (cat.total||50);
}

// Open Settings → 連携 tab from anywhere (sidebar, inline CTA, etc.)
function openIntegrationsTab(highlightId){
  if(typeof openSettings === 'function'){
    openSettings();
    setTimeout(function(){
      var tab = document.querySelector('.snav-item[data-tab="integrations"]');
      if(tab) tab.click();
      if(highlightId){
        setTimeout(function(){ _intgOpen(highlightId); }, 300);
      }
    }, 120);
  }
}

/* ── MCP servers (Settings → Integrations) ─────────── */
async function _mcpLoadList(){
  var listEl = document.getElementById('mcpServersList');
  if(!listEl) return;
  try {
    var r = await api('GET', '/api/me/mcp-servers');
    var servers = (r && r.servers) || [];
    if(!servers.length){
      listEl.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:10px;background:#f9f8f5;border-radius:9px;text-align:center">まだ MCP サーバー未登録。下のテンプレから始めましょう。</div>';
      return;
    }
    listEl.innerHTML = servers.map(function(s){
      var status = s.last_error
        ? '<span style="color:#dc2626;font-size:10.5px;font-weight:700">⚠ ' + esc(String(s.last_error).slice(0, 60)) + '</span>'
        : (s.tools_count != null
            ? '<span style="color:#16a34a;font-size:10.5px;font-weight:700">✓ ' + s.tools_count + ' tools</span>'
            : '<span style="color:var(--text3);font-size:10.5px">読込中…</span>');
      return '<div style="background:#fff;border:1px solid var(--wire2);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:9px">'
        +    '<div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0">🔌</div>'
        +    '<div style="flex:1;min-width:0">'
        +      '<div style="font-size:13px;font-weight:800;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(s.name) + (s.enabled === false ? ' <span style="font-size:9.5px;color:var(--text3);font-weight:600">(OFF)</span>' : '') + '</div>'
        +      '<div style="font-size:10.5px;color:var(--text3);font-family:ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px">' + esc(s.url) + '</div>'
        +      '<div style="margin-top:3px">' + status + '</div>'
        +    '</div>'
        +    '<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">'
        +      '<button onclick="_mcpRefreshServer(\'' + esc(s.id) + '\')" title="ツール一覧を再取得" style="background:#fff;border:1px solid var(--wire2);border-radius:6px;padding:4px 8px;font-size:10.5px;cursor:pointer;color:var(--text2);font-family:inherit">🔄</button>'
        +      '<button onclick="_mcpToggleServer(\'' + esc(s.id) + '\')" style="background:#fff;border:1px solid var(--wire2);border-radius:6px;padding:4px 8px;font-size:10.5px;cursor:pointer;color:' + (s.enabled === false ? 'var(--text3)' : 'var(--peach-dark)') + ';font-family:inherit">' + (s.enabled === false ? 'OFF' : 'ON') + '</button>'
        +      '<button onclick="_mcpDeleteServer(\'' + esc(s.id) + '\')" style="background:#fff;border:1px solid #fecaca;border-radius:6px;padding:4px 8px;font-size:10.5px;cursor:pointer;color:#dc2626;font-family:inherit">🗑</button>'
        +    '</div>'
        +  '</div>';
    }).join('');
  } catch(e){
    listEl.innerHTML = '<div style="font-size:11.5px;color:#dc2626;padding:8px">読込失敗: ' + esc(e.message||'') + '</div>';
  }
}
async function _mcpAddServer(){
  var name = (document.getElementById('mcpAddName').value||'').trim();
  var url  = (document.getElementById('mcpAddUrl').value||'').trim();
  var auth = (document.getElementById('mcpAddAuth').value||'').trim();
  if(!name || !url){ showToast(isJa?'名前と URL は必須':'name and url are required','ng'); return; }
  try {
    var r = await api('POST', '/api/me/mcp-servers', { name, url, auth });
    document.getElementById('mcpAddName').value = '';
    document.getElementById('mcpAddUrl').value  = '';
    document.getElementById('mcpAddAuth').value = '';
    _mcpLoadList();
    if(r.error){
      showToast('⚠ ' + (r.error || '接続失敗'), 'ng');
    } else if(r.tools_count > 0){
      showToast('✓ ' + r.tools_count + ' ツール検出: ' + name, 'ok');
    } else {
      showToast('登録しました (ツール未検出 — URL を確認)', 'ng');
    }
  } catch(e){
    showToast((e.message || (isJa?'登録失敗':'Failed')), 'ng');
  }
}
async function _mcpDeleteServer(id){
  if(!confirm(isJa?'この MCP サーバーを削除?':'Delete this MCP server?')) return;
  try { await api('DELETE', '/api/me/mcp-servers/' + id); _mcpLoadList(); showToast(isJa?'削除しました':'Deleted','ok'); }
  catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}
async function _mcpRefreshServer(id){
  try { var r = await api('POST', '/api/me/mcp-servers/' + id + '/refresh', {}); _mcpLoadList(); showToast('✓ ' + (r.tools_count||0) + ' tools','ok'); }
  catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}
async function _mcpToggleServer(id){
  try { await api('POST', '/api/me/mcp-servers/' + id + '/toggle', {}); _mcpLoadList(); }
  catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}
function _mcpPresetZapier(){
  document.getElementById('mcpAddName').value = 'Zapier';
  document.getElementById('mcpAddUrl').value  = 'https://mcp.zapier.com/api/mcp/s/YOUR_KEY/sse';
  document.getElementById('mcpAddAuth').value = '';
  showToast('Zapier MCP の URL を https://mcp.zapier.com で取得して貼り替えてください','ok');
}
function _mcpPresetGitHub(){
  document.getElementById('mcpAddName').value = 'GitHub Official';
  document.getElementById('mcpAddUrl').value  = 'https://api.githubcopilot.com/mcp';
  document.getElementById('mcpAddAuth').value = 'Bearer YOUR_GITHUB_PAT';
  showToast('Bearer の後を GitHub PAT に置き換えてください','ok');
}
function _mcpPresetNotion(){
  document.getElementById('mcpAddName').value = 'Notion';
  document.getElementById('mcpAddUrl').value  = 'https://mcp.notion.com/mcp';
  document.getElementById('mcpAddAuth').value = 'Bearer YOUR_NOTION_TOKEN';
  showToast('Notion Integration token を取得して Bearer の後に貼り付け','ok');
}

/* ── GitHub PAT — legacy wrappers (kept for Edit Agent callsite) ──── */
// New flow: the catalog modal handles save/clear via _intgSave/_intgDisconnect.
// These thin wrappers are still used by disconnectGitHub() in the Edit Agent
// panel, so we route them to the unified DELETE endpoint.
async function _clearGitHubPat(){
  try {
    await api('DELETE','/api/me/integrations/github');
    if(me){ me.github_connected = false; }
    if(typeof _loadIntegrations === 'function') _loadIntegrations();
  } catch(e){
    showToast((e.message||(isJa?'失敗':'Failed')),'ng');
  }
}

/* ── GitHub (Edit Agent panel) ────────────────────────── */
function _renderGitHubStatus(agentEnabled){
  var sw = document.getElementById('editGitHubSw');
  var badge = document.getElementById('editGitHubConnBadge');
  var desc = document.getElementById('editGitHubDesc');
  var accountRow = document.getElementById('editGitHubAccountRow');
  var connectBtn = document.getElementById('editGitHubConnectBtn');
  if(!sw) return;
  var connected = !!(me && me.github_connected);
  if(connected){
    if(badge) badge.style.display = 'inline-flex';
    if(accountRow) accountRow.style.display = '';
    if(connectBtn) connectBtn.style.display = 'none';
    if(desc) desc.textContent = isJa
      ? 'GitHub 接続済み。トグル ON でこのエージェントに repo アクセス権を与えます。'
      : 'GitHub connected. Toggle ON to grant this agent repo access.';
    sw.classList.toggle('on', !!agentEnabled);
  } else {
    if(badge) badge.style.display = 'none';
    if(accountRow) accountRow.style.display = 'none';
    if(connectBtn) connectBtn.style.display = '';
    if(desc) desc.textContent = isJa
      ? 'あなたの GitHub repo を AI が読めるようになります (README / コード / Issue)。ChatGPT に絶対できない「自分のコードを理解した上での回答」が可能に。'
      : 'Let this AI read your GitHub repos (README / code / Issues). The kind of context-aware answer ChatGPT structurally can not give.';
    sw.classList.remove('on');
  }
}
function toggleEditGitHub(){
  var sw = document.getElementById('editGitHubSw');
  if(!sw) return;
  var connected = !!(me && me.github_connected);
  if(!connected){
    showToast(isJa?'先に設定で GitHub PAT を登録してください':'Register a GitHub PAT in settings first','ng');
    openGitHubConnect();
    return;
  }
  var willEnable = !sw.classList.contains('on');
  _renderGitHubStatus(willEnable);
  if(typeof _updateEditToolsCnt === 'function') _updateEditToolsCnt();
}
function openGitHubConnect(){
  // Open settings → Integrations and pop the GitHub card modal
  if(typeof closeEditAgent === 'function'){ try { closeEditAgent(); } catch(e){} }
  if(typeof openIntegrationsTab === 'function'){
    openIntegrationsTab('github');
  }
}
async function disconnectGitHub(){
  await _clearGitHubPat();
  _renderGitHubStatus(false);
}
async function _saveIntegration(kind){
  var inp = document.getElementById(kind==='slack'?'intSlackUrl':'intDiscordUrl'); if(!inp) return;
  var url = (inp.value||'').trim();
  if(!url){ showToast(isJa?'URL を入力してください':'URL required','ng'); return; }
  var body = {}; body[kind] = url;
  try { await api('POST','/api/integrations', body); inp.value=''; _loadIntegrations(); showToast(isJa?'保存しました':'Saved','ok'); }
  catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}
async function _clearIntegration(kind){
  if(!confirm(isJa?'この連携を削除しますか？':'Remove this integration?')) return;
  var body = {}; body[kind] = '';
  try { await api('POST','/api/integrations', body); _loadIntegrations(); showToast(isJa?'削除しました':'Removed','ok'); }
  catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}

/* ── Webhook ────────────────────────────────────────── */
async function _whLoad(){
  var id = window._editAgentId; if(!id) return;
  var statusEl = document.getElementById('editWhStatus');
  var btn = document.getElementById('editWhToggle');
  var rot = document.getElementById('editWhRotate');
  if(!statusEl || !btn) return;
  try {
    var r = await api('GET','/api/agents/'+id+'/webhook');
    if(r.enabled && r.url){
      statusEl.innerHTML =
        '<div style="font-size:11px;color:var(--text3);font-weight:700;margin-bottom:4px;letter-spacing:.04em;text-transform:uppercase">'+(isJa?'URL':'Endpoint')+'</div>'+
        '<div style="display:flex;gap:4px"><input id="whUrlIn" readonly value="'+esc(r.url)+'" style="flex:1;padding:7px 9px;border:1px solid rgba(14,165,233,.3);border-radius:6px;font-size:11.5px;font-family:ui-monospace,monospace;background:#fff;color:var(--text)"><button onclick="_whCopy()" style="padding:7px 10px;background:#0ea5e9;color:#fff;border:0;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit">📋</button></div>'+
        '<pre style="margin-top:8px;background:#0f1216;color:#e5e7eb;padding:8px 10px;border-radius:6px;font-size:10.5px;line-height:1.5;overflow-x:auto">curl -X POST '+esc(r.url)+' \\\n  -H "Content-Type: application/json" \\\n  -d \'{"message":"Hello agent"}\'</pre>';
      btn.textContent = isJa?'Webhook を無効化':'Disable webhook';
      btn.style.background = '#fff';
      btn.style.color = '#dc2626';
      btn.style.borderColor = '#dc2626';
      btn.dataset.state = 'on';
      if(rot) rot.style.display = '';
    } else {
      statusEl.innerHTML = '<div style="font-size:11.5px;color:var(--text3);padding:4px 0">'+(isJa?'まだ有効化されていません':'Not enabled yet')+'</div>';
      btn.textContent = isJa?'Webhook を有効化':'Enable webhook';
      btn.style.background = '#fff';
      btn.style.color = '#0369a1';
      btn.style.borderColor = '#0ea5e9';
      btn.dataset.state = 'off';
      if(rot) rot.style.display = 'none';
    }
  } catch(e){ /* silent */ }
}
async function _whToggle(){
  var id = window._editAgentId; if(!id) return;
  var btn = document.getElementById('editWhToggle');
  var on = btn && btn.dataset.state === 'on';
  try {
    await api('POST','/api/agents/'+id+'/webhook',{ enabled: !on });
    _whLoad();
    showToast(on ? (isJa?'無効化しました':'Disabled') : (isJa?'Webhook を有効化しました':'Webhook enabled'),'ok');
  } catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}
async function _whRotate(){
  var id = window._editAgentId; if(!id) return;
  if(!confirm(isJa?'URLを再生成しますか？古いURLは無効になります':'Regenerate URL? Old URL will stop working.')) return;
  try { await api('POST','/api/agents/'+id+'/webhook',{ regenerate: true }); _whLoad(); showToast(isJa?'再生成しました':'Regenerated','ok'); }
  catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}
function _whCopy(){
  var inp = document.getElementById('whUrlIn'); if(!inp) return;
  if(navigator.clipboard) navigator.clipboard.writeText(inp.value);
  else { inp.select(); document.execCommand('copy'); }
  showToast(isJa?'コピーしました':'Copied','ok');
}

/* ── Scheduled execution ────────────────────────────── */
async function _schedLoadList(){
  var id = window._editAgentId; if(!id) return;
  var listEl = document.getElementById('editSchedList'); if(!listEl) return;
  try {
    var r = await api('GET','/api/agents/'+id+'/schedules');
    var rows = (r && r.schedules) || [];
    if(!rows.length){
      listEl.innerHTML = '<div style="font-size:11.5px;color:var(--text3);padding:4px 0">'+(isJa?'まだスケジュールがありません':'No schedules yet')+'</div>';
      return;
    }
    listEl.innerHTML = rows.map(function(s){
      var time = (s.kind==='hourly')
        ? (isJa?('毎時 :'+String(s.minute||0).padStart(2,'0')):('hourly @ :'+String(s.minute||0).padStart(2,'0')))
        : (isJa?('毎日 '+String(s.hour||0).padStart(2,'0')+':'+String(s.minute||0).padStart(2,'0')):(String(s.hour||0).padStart(2,'0')+':'+String(s.minute||0).padStart(2,'0')+' daily'));
      var next = s.next_run ? new Date(s.next_run).toLocaleString() : '—';
      var deliver = s.deliver==='email' ? '✉️' : '💬';
      var ena = s.enabled !== false;
      return '<div style="padding:8px 10px;background:#fff;border:1px solid rgba(245,158,11,.2);border-radius:8px">'+
        '<div style="display:flex;align-items:center;gap:6px"><span style="font-weight:700;font-size:12px;color:var(--text)">'+deliver+' '+esc(s.label||time)+'</span>'+
        '<button onclick="_schedRunNow(\''+esc(s.id)+'\')" style="margin-left:auto;background:rgba(245,158,11,.12);color:#b45309;border:1px solid rgba(245,158,11,.4);border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit" title="'+(isJa?'今すぐ実行':'Run now')+'">▶ '+(isJa?'実行':'Run')+'</button>'+
        '<label style="display:inline-flex;align-items:center;gap:4px;font-size:11px;cursor:pointer"><input type="checkbox" '+(ena?'checked':'')+' onchange="_schedToggle(\''+esc(s.id)+'\',this.checked)"> '+(isJa?'ON':'On')+'</label>'+
        '<button onclick="_schedDelete(\''+esc(s.id)+'\')" style="background:none;border:0;color:var(--text3);cursor:pointer;font-size:14px" title="'+(isJa?'削除':'Delete')+'">✕</button></div>'+
        '<div style="font-size:11px;color:var(--text3);margin-top:3px">'+esc(time)+' · '+(isJa?'次回':'next')+': '+esc(next)+'</div>'+
        '<div style="font-size:11px;color:var(--text2);margin-top:3px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+esc(s.prompt||'')+'">'+esc((s.prompt||'').slice(0,80))+'</div>'+
      '</div>';
    }).join('');
  } catch(e){
    listEl.innerHTML = '<div style="font-size:11.5px;color:#dc2626;padding:4px 0">'+(isJa?'読み込めません':'Failed to load')+'</div>';
  }
}
async function _schedRunNow(sid){
  var id = window._editAgentId; if(!id) return;
  showToast(isJa?'実行中…':'Running…','ok');
  try {
    var r = await api('POST','/api/agents/'+id+'/schedules/'+sid+'/run',{});
    if(r.error){
      showToast((isJa?'失敗: ':'Failed: ')+r.error,'ng');
    } else {
      var preview = (r.reply||'').slice(0, 200);
      showToast((isJa?'✓ 実行完了 — ':'✓ Ran — ')+(preview || (isJa?'(空応答)':'(empty)')), 'ok');
    }
    _schedLoadList();
  } catch(e){ showToast((isJa?'失敗: ':'Failed: ')+(e.message||''),'ng'); }
}

async function _schedToggle(sid, enabled){
  var id = window._editAgentId; if(!id) return;
  try { await api('PUT','/api/agents/'+id+'/schedules/'+sid,{ enabled: !!enabled }); _schedLoadList(); }
  catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}
async function _schedDelete(sid){
  var id = window._editAgentId; if(!id || !sid) return;
  if(!confirm(isJa?'このスケジュールを削除しますか？':'Delete this schedule?')) return;
  try { await api('DELETE','/api/agents/'+id+'/schedules/'+sid); _schedLoadList(); }
  catch(e){ showToast((isJa?'失敗: ':'Failed: ')+(e.message||''),'ng'); }
}
function _schedOpenForm(){
  if(document.getElementById('schedOv')) return;
  var ov=document.createElement('div');
  ov.id='schedOv';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:flex-start;justify-content:center;z-index:9000;padding:5vh 14px 14px;overflow-y:auto;';
  var hours=''; for(var h=0;h<24;h++){ hours+='<option value="'+h+'">'+String(h).padStart(2,'0')+'</option>'; }
  var mins=''; for(var m=0;m<60;m+=5){ mins+='<option value="'+m+'">'+String(m).padStart(2,'0')+'</option>'; }
  ov.innerHTML=
    '<div style="background:var(--card,#fff);border-radius:14px;max-width:460px;width:100%;padding:22px;box-shadow:0 24px 64px rgba(0,0,0,.3);font-family:inherit">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div style="font-weight:800;font-size:16px">⏰ '+(isJa?'スケジュールを追加':'Add schedule')+'</div><button onclick="document.getElementById(\'schedOv\').remove()" style="background:none;border:0;color:var(--text3);font-size:20px;cursor:pointer;line-height:1">×</button></div>'+
      '<label style="display:block;font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px;letter-spacing:.04em;text-transform:uppercase">'+(isJa?'ラベル':'Label')+'</label>'+
      '<input id="schLabel" maxlength="80" placeholder="'+(isJa?'例: 朝のニュース要約':'e.g. Morning news digest')+'" style="width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font-size:13.5px;margin-bottom:12px;font-family:inherit">'+
      '<label style="display:block;font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px;letter-spacing:.04em;text-transform:uppercase">'+(isJa?'プロンプト':'Prompt')+'</label>'+
      '<textarea id="schPrompt" rows="3" maxlength="1000" placeholder="'+(isJa?'AI に毎回送るメッセージ':'Message to send the AI on each run')+'" style="width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font-size:13.5px;margin-bottom:12px;font-family:inherit;resize:vertical;min-height:70px"></textarea>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">'+
        '<div><label style="display:block;font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px;letter-spacing:.04em;text-transform:uppercase">'+(isJa?'頻度':'Kind')+'</label><select id="schKind" style="width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font-size:13.5px;font-family:inherit"><option value="daily">'+(isJa?'毎日':'Daily')+'</option><option value="hourly">'+(isJa?'毎時':'Hourly')+'</option></select></div>'+
        '<div><label style="display:block;font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px;letter-spacing:.04em;text-transform:uppercase">'+(isJa?'時':'Hour')+'</label><select id="schHour" style="width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font-size:13.5px;font-family:inherit">'+hours+'</select></div>'+
        '<div><label style="display:block;font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px;letter-spacing:.04em;text-transform:uppercase">'+(isJa?'分':'Min')+'</label><select id="schMin" style="width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font-size:13.5px;font-family:inherit">'+mins+'</select></div>'+
      '</div>'+
      '<label style="display:block;font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px;letter-spacing:.04em;text-transform:uppercase">'+(isJa?'結果の受け取り':'Deliver')+'</label>'+
      '<select id="schDeliver" style="width:100%;padding:9px 11px;border:1px solid #e5e7eb;border-radius:8px;font-size:13.5px;margin-bottom:14px;font-family:inherit">'+
        '<option value="chat">'+(isJa?'チャットに追加':'Append to chat')+'</option>'+
        '<option value="email">'+(isJa?'メールで受け取る':'Email me')+'</option>'+
      '</select>'+
      '<button onclick="_schedSave()" style="width:100%;padding:11px;background:var(--peach);color:#fff;border:0;border-radius:9px;font-weight:700;font-size:13.5px;cursor:pointer;font-family:inherit">'+(isJa?'追加':'Add')+'</button>'+
    '</div>';
  ov.addEventListener('click', function(e){ if(e.target===ov) ov.remove(); });
  document.body.appendChild(ov);
  // Default hour: 9
  setTimeout(function(){ var hr=document.getElementById('schHour'); if(hr) hr.value='9'; }, 30);
}
async function _schedSave(){
  var id = window._editAgentId; if(!id) return;
  var label = (document.getElementById('schLabel')||{}).value || '';
  var prompt = (document.getElementById('schPrompt')||{}).value || '';
  var kind = (document.getElementById('schKind')||{}).value || 'daily';
  var hour = parseInt((document.getElementById('schHour')||{}).value || '9', 10);
  var minute = parseInt((document.getElementById('schMin')||{}).value || '0', 10);
  var deliver = (document.getElementById('schDeliver')||{}).value || 'chat';
  if(!prompt.trim()){ showToast(isJa?'プロンプトを入力してください':'Prompt required','ng'); return; }
  try {
    await api('POST','/api/agents/'+id+'/schedules',{
      prompt, kind, hour, minute, deliver, label,
      tz_offset_min: -new Date().getTimezoneOffset(),  // user's local tz, minutes from UTC
    });
    var ov=document.getElementById('schedOv'); if(ov) ov.remove();
    _schedLoadList();
    showToast(isJa?'スケジュールを追加しました':'Schedule added','ok');
  } catch(e){
    showToast((isJa?'失敗: ':'Failed: ')+(e.message||''),'ng');
  }
}

async function _kbUploadDoc(file){
  var id = window._editAgentId; if(!id) return;
  var isDocx = _isDocx(file);
  var isPdf = (file.type === 'application/pdf') || /\.pdf$/i.test(file.name||'');
  var isXlsx = _isXlsx(file);
  if(!isDocx && !isPdf && !isXlsx && !_isTextLike(file)){
    showToast((isJa?'未対応の形式: ':'Unsupported: ')+file.name,'ng'); return;
  }
  if(file.size > 10*1024*1024){ showToast(isJa?'ファイルが大きすぎます (10MB)':'File too large (10MB)','ng'); return; }
  showToast((isJa?'追加中: ':'Adding: ')+file.name, 'ok');
  try {
    var text;
    if(isDocx || isPdf || isXlsx){
      var b64 = await new Promise(function(resolve, reject){
        var r = new FileReader();
        r.onload = function(ev){ resolve(String(ev.target.result||'').split(',')[1] || ''); };
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      var endpoint = isPdf ? '/api/parse/pdf' : isXlsx ? '/api/parse/xlsx' : '/api/parse/docx';
      var r = await api('POST', endpoint, { b64: b64, name: file.name });
      text = (r && r.text) || '';
    } else {
      text = await new Promise(function(resolve, reject){
        var r = new FileReader();
        r.onload = function(ev){ resolve(String(ev.target.result||'')); };
        r.onerror = reject;
        r.readAsText(file, 'utf-8');
      });
    }
    if(!text || !text.trim()){ showToast(isJa?'本文を取得できませんでした':'No text extracted','ng'); return; }
    await api('POST','/api/agents/'+id+'/knowledge',{ name: file.name, text: text });
    _kbLoadList();
    showToast((isJa?'追加しました: ':'Added: ')+file.name,'ok');
  } catch(e){
    showToast((isJa?'追加に失敗: ':'Failed: ')+(e.message||''),'ng');
  }
}

function closeEditAgent(){
  document.getElementById('editPanel').style.right = '-380px';
  document.getElementById('editPanelOverlay').style.display = 'none';
}

// Promote the currently-edited agent to a group AND open the invite modal.
// If it's already a group, just open the invite modal directly.
async function _promoteToGroupFromEdit(){
  const id = window._editAgentId;
  if(!id) return;
  let ag = agents.find(a => a.id === id);
  if(!ag){ showToast(L('エージェントが見つかりません','Agent not found'),'ng'); return; }
  // Already a group? Skip the promote step
  if(ag.is_group){
    closeEditAgent();
    openInviteModal(id);
    return;
  }
  if(!confirm(isJa
    ? ('「'+ag.name+'」をグループに昇格させますか？\n\nグループ化すると:\n・複数の人を招待できます\n・@AI でメンションされた時のみ AI が応答\n・AI 利用料はあなたの残高から消費されます\n\n後でいつでも元に戻せません (グループ削除は可能)。')
    : ('Promote "'+ag.name+'" to a group?\nMultiple members can join. AI cost is charged to your balance.'))){
    return;
  }
  try {
    const r = await api('POST', '/api/agents/' + id + '/invite', {
      expires_in_days: 7,
      max_members: 50,
      require_approval: false,
    });
    // Capture FULL response into local agent so subsequent code (sidebar
    // render, openInviteModal) sees a complete state
    ag.is_group = true;
    ag.host_id = me.id;
    ag.invite_token = r.invite_token;
    ag.invite_url = r.invite_url;
    ag.invite_expires_at = r.invite_expires_at;
    ag.invite_max_members = r.invite_max_members;
    ag.members = Array.isArray(r.members) ? r.members : [];
    ag.member_count = ag.members.length || 1;

    // Defensive: re-pull authoritative state from server so any field we
    // forgot to update locally (e.g. invite_require_approval) is correct
    try {
      const fresh = await api('GET', '/api/agents');
      if(fresh && Array.isArray(fresh.agents)){
        // Merge: keep local objects but replace by id
        const map = new Map(agents.map(a => [a.id, a]));
        fresh.agents.forEach(serverAg => {
          const local = map.get(serverAg.id);
          if(local){
            // Preserve any local-only fields, override server-known fields
            Object.assign(local, serverAg);
          } else {
            agents.push(serverAg);
          }
        });
      }
    } catch(e){ console.warn('[promote] re-fetch failed:', e.message); }

    showToast(isJa?'グループ化しました':'Promoted to group','ok');
    closeEditAgent();
    renderAgList();
    openInviteModal(id);
  } catch(e){
    showToast((isJa?'グループ化失敗: ':'Failed: ')+e.message, 'ng');
  }
}

// ── 💬 Thread drawer ─────────────────────────────────────────
// Slack-style: click "💬 Thread" on any message → side drawer slides in
// with the parent message + all replies + a composer that posts thread
// replies (server tags them with thread_parent_id; they're hidden from
// the main timeline).
function _openThread(parentId){
  // Visible debug — show a toast immediately so the user knows their click
  // was received. If the drawer fails to open they'll see WHY (the toast
  // self-replaces with the failure reason from _renderThreadDrawer's
  // fallback paths). Without this, "click does nothing" looks identical to
  // "click → toast appeared and vanished too fast to read".
  try { console.log('[thread] _openThread called with parentId =', parentId); } catch(_){}
  if(!parentId){
    try { showToast(L('スレッドの親メッセージ ID が空です','Empty thread parent id'), 'ng'); } catch(_){}
    return;
  }
  // Diagnostic only — log whether the parent actually exists in ag.history,
  // but DO NOT block the open. _renderThreadDrawer has its own handling,
  // and an over-eager pre-check here previously blocked legitimate threads
  // when the id-matching had subtle differences (string vs number, trimmed
  // whitespace, server-vs-client id generation skew).
  try {
    var ag = (agents||[]).find(function(a){ return a.id === activeId; });
    if(ag){
      var hasParent = (ag.history||[]).some(function(m){ return m && m.id === parentId; });
      console.log('[thread] history.length =', (ag.history||[]).length, 'has matching parent.id?', hasParent);
      if(!hasParent){
        // Surface the failure visibly. The console.warn also lists the
        // last 3 history entries so we can see what was actually there.
        console.warn('[thread] parent', parentId, 'NOT in ag.history. Tail:',
          (ag.history||[]).slice(-3).map(function(m){return m && {id:m.id, time:m.time, role:m.role, has_thread_parent_id: !!m.thread_parent_id};}));
      }
    } else {
      console.warn('[thread] activeId =', activeId, 'has no matching agent in agents[]');
    }
  } catch(e){ console.warn('[thread] pre-check threw:', e && e.message); }
  window._activeThreadParent = parentId;
  try { _renderThreadDrawer(); }
  catch(e){
    console.error('[thread] _renderThreadDrawer threw:', e);
    try { showToast(L('スレッドを開けませんでした: ','Could not open thread: ') + ((e && e.message) || 'unknown error'), 'ng'); } catch(_){}
  }
}
// Builds the thread drawer's OWN permanent composer — a fully independent
// second composer (separate IDs, separate _threadPendingImgs buffer) that
// coexists with the main chat composer, exactly like Slack. Full feature
// parity: file/URL attach, voice, code blocks, slash commands.
function _threadComposerHTML(){
  var ICON = 'width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
  return ''
  + '<div class="composer" id="threadComposer" style="position:relative">'
  +   '<div id="editChipWrapThread" class="ec-wrap"></div>'
  +   '<input type="file" id="tImgInput" multiple style="display:none" onchange="onImgSelect(event,\'thread\')">'
  +   '<div class="composer-attach-strip" id="tImgPreviewWrap" style="display:none"></div>'
  +   '<div id="tMentionPicker" class="mention-picker" style="display:none" role="listbox" aria-label="Mentions"></div>'
  +   '<div id="tSlashPalette" class="slash-palette" style="display:none" role="listbox"></div>'
  +   '<textarea id="tci" rows="1" placeholder="'+L('このスレッドに返信… (Shift+Enter で改行)','Reply in thread… (Shift+Enter for newline)')+'"'
  +     ' oninput="exTA(this);_mentionOnInput(this,\'thread\');_slashOnInput(this.value,\'thread\')"'
  +     ' onkeydown="_slashOnKeydown(event,\'thread\') || _mentionOnKeydown(event,\'thread\') || _threadTaKey(event)"'
  +     ' oncompositionstart="_imeStart()" oncompositionend="_imeEnd()"'
  +     ' onpaste="onComposerPaste(event,\'thread\')"></textarea>'
  +   '<div class="composer-tools">'
  +     '<button class="tool-btn" type="button" onclick="document.getElementById(\'tImgInput\').click()" title="'+L('ファイルを添付 (画像/PDF/テキスト/コード)','Attach a file')+'">'
  +       '<svg '+ICON+' stroke-width="1.9"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>'
  +     '</button>'
  +     '<button class="tool-btn" type="button" onclick="openUrlAttach(\'thread\')" title="'+L('URL を読み込んで添付','Attach a URL')+'">'
  +       '<svg '+ICON+' stroke-width="1.9"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
  +     '</button>'
  +     '<button class="tool-btn" type="button" id="tMicBtn" onclick="toggleMic(\'tci\',\'tMicBtn\')" title="'+L('音声入力','Voice input')+'">'
  +       '<svg '+ICON+' stroke-width="1.9"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>'
  +     '</button>'
  +     '<button class="tool-btn" type="button" onclick="insertCodeBlock(\'tci\')" title="'+L('コードブロック挿入','Insert code block')+'">'
  +       '<svg '+ICON+' stroke-width="1.9"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
  +     '</button>'
  +     '<button class="tool-btn" type="button" onclick="_openArtifactLibrary()" title="'+L('作った成果物の一覧','Your artifacts')+'">'
  +       '<svg '+ICON+' stroke-width="1.9"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>'
  +     '</button>'
  +     '<div class="tool-spacer"></div>'
  +     '<button class="send-btn" type="button" id="tSndBtn" onclick="_sendThreadReply()" title="'+L('送信','Send')+'">'
  +       '<svg '+ICON+' stroke-width="2.2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>'
  +     '</button>'
  +   '</div>'
  + '</div>';
}
// Thread drawer width — persisted in localStorage, clamped. On mobile the
// drawer is full-width, so return a large value (min(…,100vw) wins).
function _threadDrawerWidth(){
  if(window.innerWidth < 900) return 9999;
  var w = parseInt(localStorage.getItem('threadDrawerW'),10);
  if(!isFinite(w) || w <= 0) w = 460;
  var max = Math.round(window.innerWidth * 0.7);
  return Math.max(320, Math.min(w, max));
}
// Wire up the left-edge drag handle so the user can resize the drawer.
function _initThreadResize(d){
  var h = d.querySelector('#threadResizeHandle');
  if(!h) return;
  h.addEventListener('pointerdown', function(e){
    if(window.innerWidth < 900) return; // mobile = full width, no resize
    e.preventDefault();
    h.classList.add('dragging');
    document.body.style.userSelect = 'none';
    var move = function(ev){
      var max = Math.round(window.innerWidth * 0.7);
      var w = Math.max(320, Math.min(window.innerWidth - ev.clientX, max));
      d.style.width = w + 'px';
    };
    var up = function(){
      h.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      var finalW = parseInt(d.style.width,10);
      if(isFinite(finalW) && finalW > 0){ try { localStorage.setItem('threadDrawerW', finalW); } catch(err){} }
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });
}
function _renderThreadDrawer(){
  var parentId = window._activeThreadParent;
  if(!parentId){ _closeThread(); return; }
  var ag = (agents||[]).find(function(a){return a.id===activeId;});
  if(!ag) return;
  var parent = (ag.history||[]).find(function(m){return m && m.id === parentId;});
  // Fallback: if no exact id match, the parent may have come from server
  // history without an `id` field assigned. In that case, the children's
  // `thread_parent_id` was likely set against the parent's time string
  // or some other property. Try matching by `time` so old threads still open.
  if(!parent){
    parent = (ag.history||[]).find(function(m){
      return m && !m.thread_parent_id && (m.time === parentId || (''+m.time) === (''+parentId));
    });
  }
  if(!parent){
    // Last-resort: any message whose `id`-like fields stringify-match
    parent = (ag.history||[]).find(function(m){
      return m && (String(m.id||'') === String(parentId) || String(m.local_id||'') === String(parentId));
    });
  }
  if(!parent){
    console.warn('[thread] parent not found — parentId=', parentId,
                 'history sample:', (ag.history||[]).slice(-3).map(function(m){return m && {id:m.id, time:m.time, role:m.role};}));
    showToast(L('元メッセージが見つかりません','Parent message not found'),'ng'); _closeThread(); return;
  }
  // Replies match by thread_parent_id. Use the same flexible matching so old
  // children whose thread_parent_id may differ in format still resolve.
  var replies = (ag.history||[]).filter(function(m){return m && m.thread_parent_id === parentId;});
  // Use the full _renderMsg so markdown / tool_log / artifact cards render
  // properly inside threads (critical for LP-edit flows where each reply
  // contains a fresh artifact URL).
  function _renderInThread(m){
    // Pass the real ag.history index (not -1) so the message gets its
    // hover bar / reactions / action buttons. _renderingInThread tells
    // _renderMsg to drop the non-thread-safe actions.
    var _ti = (ag.history||[]).indexOf(m);
    _renderingInThread = true;
    var _h = _renderMsg(m.role, ag, m.content, m.time||'', m.images, _ti, m.tool_log, m);
    _renderingInThread = false;
    return _h;
  }
  var bodyHTML =
    '<div class="msgs-inner" style="max-width:none">'
    + _renderInThread(parent)
    + (replies.length ?
        '<div style="display:flex;align-items:center;gap:10px;margin:14px 0 8px;font-size:10.5px;font-weight:800;color:var(--text2);letter-spacing:.04em">'
        + '<span style="flex:1;height:1px;background:var(--wire)"></span>'
        + '<span>'+replies.length+L(' 件の返信',' replies')+'</span>'
        + '<span style="flex:1;height:1px;background:var(--wire)"></span>'
        + '</div>'
        + replies.map(_renderInThread).join('')
      : '')
    + '</div>';
  var existing = document.getElementById('threadDrawer');
  if(existing){
    // In-place update — refresh ONLY the header count + message body. The
    // thread composer in the footer is left completely untouched, so any
    // typed text / staged attachments / focus survive streaming re-renders.
    var cnt = existing.querySelector('[data-thread-count]');
    if(cnt) cnt.textContent = (ag.name||'') + ' ・ ' + replies.length + L(' 件の返信',' replies');
    var pb0 = existing.querySelector('#threadPinBar');
    if(pb0) pb0.innerHTML = _pinBarHTML(ag);
    var body0 = existing.querySelector('#threadDrawerBody');
    if(body0){
      var atBottom = (body0.scrollHeight - body0.scrollTop - body0.clientHeight) < 80;
      body0.innerHTML = bodyHTML;
      if(atBottom) body0.scrollTop = body0.scrollHeight;
    }
    return;
  }
  // ── First open: build the whole drawer (header + body + footer composer) ──
  var d = document.createElement('div');
  d.id = 'threadDrawer';
  d.className = 'thread-drawer';
  d.style.cssText = 'position:fixed;top:0;right:0;bottom:0;width:min('+_threadDrawerWidth()+'px,100vw);background:var(--cream);border-left:1px solid var(--wire2);z-index:9985;display:flex;flex-direction:column;box-shadow:-12px 0 28px rgba(0,0,0,.10);font-family:inherit;animation:slideInRight .25s ease';
  d.innerHTML =
    '<div id="threadResizeHandle" title="'+L('ドラッグで幅を調整','Drag to resize')+'"></div>'
    + '<div style="padding:13px 16px;border-bottom:1px solid var(--wire2);display:flex;align-items:flex-start;gap:10px;background:var(--cream);flex-shrink:0">'
    +  '<div style="flex:1;min-width:0">'
    +    '<div style="font-size:15px;font-weight:900;color:var(--text)">'+L('スレッド','Thread')+'</div>'
    +    '<div data-thread-count style="font-size:11px;color:var(--text3);margin-top:2px">'+esc(ag.name||'')+' ・ '+replies.length+L(' 件の返信',' replies')+'</div>'
    +  '</div>'
    +  '<button onclick="_closeThread()" title="'+L('閉じる','Close')+'" style="background:transparent;border:0;color:var(--text3);cursor:pointer;font-size:20px;padding:4px 8px;border-radius:6px">×</button>'
    + '</div>'
    + '<div id="threadPinBar" style="flex-shrink:0">'+_pinBarHTML(ag)+'</div>'
    + '<div id="threadDrawerBody" class="msgs" style="flex:1;overflow-y:auto;padding:6px 14px 12px;background:var(--cream)">'+bodyHTML+'</div>'
    // The thread has its OWN permanent composer — like Slack. It coexists
    // with the main chat composer (both usable at once, separate attachment
    // buffers) and has full feature parity.
    + '<div style="border-top:1px solid var(--wire2);padding:10px 14px 12px;background:var(--cream);flex-shrink:0">'
    +   _threadComposerHTML()
    +   '<div style="display:flex;align-items:center;gap:8px;margin-top:7px">'
    +     '<span style="font-size:10.5px;color:var(--text3);flex:1">'+L('このスレッド内では AI が全履歴を保持します','AI keeps full thread context here')+'</span>'
    +     '<button onclick="_closeThread()" style="background:transparent;border:0;color:var(--text3);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:underline">'+L('スレッドを閉じる','Close')+'</button>'
    +   '</div>'
    + '</div>';
  document.body.appendChild(d);
  try { _initThreadResize(d); } catch(e){}
  // Match the main file picker's accepted types exactly.
  try {
    var mainInp = document.getElementById('imgInput'), tInp = document.getElementById('tImgInput');
    if(mainInp && tInp) tInp.accept = mainInp.accept;
  } catch(e){}
  // Drag & drop files onto the drawer → attach to the THREAD composer.
  ['dragenter','dragover'].forEach(function(ev){ d.addEventListener(ev, function(e){
    if(e.dataTransfer && Array.from(e.dataTransfer.types||[]).indexOf('Files')>=0){ e.preventDefault(); e.stopPropagation(); }
  }); });
  d.addEventListener('drop', function(e){
    if(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length){
      e.preventDefault(); e.stopPropagation();
      try { _ingestFiles(Array.from(e.dataTransfer.files), 'thread'); } catch(err){}
    }
  });
  renderImgPreview('thread');  // restore any pre-staged thread attachments
  setTimeout(function(){
    var t = document.getElementById('tci'); if(t) t.focus();
    var b = document.getElementById('threadDrawerBody'); if(b) b.scrollTop = b.scrollHeight;
  }, 50);
}
function _closeThread(){
  window._activeThreadParent = null;
  _threadPendingImgs.length = 0;   // clear staged thread attachments
  // Drop any open thread-side @mention picker state — its DOM is about to go.
  if(_mentionState.which === 'thread'){ _mentionState.open = false; _mentionState.which = 'main'; }
  var d = document.getElementById('threadDrawer');
  if(d) d.remove();
}

// ── 🪪 Agent Card — the agent's stats "顔" screen ────────────────
// Opened by tapping the agent avatar / name in the chat header. Reads the
// live agent state model (progress / trust / outcomes / digest — computed
// server-side in safe()). Full-screen dark slide-in, self-contained CSS.
var _AGENT_CARD_CSS = [
  '#agentCardScreen{position:fixed;inset:0;z-index:9990;overflow-y:auto;background:#07090F;color:#fff;font-family:inherit;animation:acIn .26s ease}',
  '@keyframes acIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',
  '#agentCardScreen *{box-sizing:border-box}',
  '.ac-wrap{max-width:440px;margin:0 auto;padding-bottom:40px;position:relative}',
  '.ac-hd{display:flex;align-items:center;justify-content:space-between;padding:18px 18px 6px;position:sticky;top:0;background:linear-gradient(180deg,#07090F 65%,transparent);z-index:5}',
  '.ac-x{width:38px;height:38px;border-radius:50%;background:#161B27;border:1px solid rgba(0,240,255,.1);color:rgba(255,255,255,.6);font-size:17px;cursor:pointer;display:grid;place-items:center}',
  '.ac-id{font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.18em;color:rgba(255,255,255,.35)}',
  '.ac-hero{position:relative;padding:8px 20px 22px;text-align:center;overflow:hidden}',
  '.ac-rings{position:absolute;top:46%;left:50%;width:300px;height:300px;transform:translate(-50%,-50%);pointer-events:none}',
  '.ac-rings::before,.ac-rings::after{content:"";position:absolute;border-radius:50%;inset:0;border:1px solid rgba(0,240,255,.06)}',
  '.ac-rings::before{inset:24px;border-top-color:rgba(0,240,255,.35);animation:acRot 18s linear infinite}',
  '.ac-rings::after{inset:54px;border-right-color:rgba(0,240,255,.22);animation:acRot 22s linear infinite reverse}',
  '@keyframes acRot{to{transform:rotate(360deg)}}',
  '.ac-av{position:relative;width:128px;height:128px;margin:14px auto 0;border-radius:50%;display:grid;place-items:center;font-size:64px;background:radial-gradient(circle at 30% 30%,#1a2436,#0a0e18);border:1px solid rgba(0,240,255,.18);box-shadow:inset 0 0 36px rgba(0,240,255,.1),0 0 48px rgba(0,240,255,.14);animation:acBreathe 4s ease-in-out infinite}',
  '@keyframes acBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
  '.ac-av img{width:100%;height:100%;border-radius:50%;object-fit:cover}',
  '.ac-name{font-size:32px;font-weight:900;letter-spacing:.05em;margin-top:18px;background:linear-gradient(180deg,#fff,rgba(255,255,255,.45));-webkit-background-clip:text;background-clip:text;color:transparent;word-break:break-word}',
  '.ac-pill{display:inline-flex;align-items:center;gap:9px;margin-top:10px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.1em;color:rgba(255,255,255,.62);padding:6px 14px;background:#161B27;border:1px solid rgba(0,240,255,.1);border-radius:99px}',
  '.ac-pill b{color:#00F0FF}',
  '.ac-quote{margin-top:12px;font-style:italic;font-size:13.5px;color:rgba(255,255,255,.5);padding:0 12px;line-height:1.6}',
  '.ac-stats{display:grid;grid-template-columns:repeat(3,1fr);margin:20px 16px 0;background:#11151F;border:1px solid rgba(0,240,255,.08);border-radius:18px;padding:18px 6px}',
  '.ac-stat{text-align:center;position:relative}',
  '.ac-stat+.ac-stat::before{content:"";position:absolute;left:0;top:14%;bottom:14%;width:1px;background:rgba(0,240,255,.12)}',
  '.ac-stat .v{font-size:25px;font-weight:800;line-height:1}',
  '.ac-stat .v.cy{color:#00F0FF}',
  '.ac-stat .l{font-family:ui-monospace,monospace;font-size:8.5px;letter-spacing:.13em;color:rgba(255,255,255,.35);margin-top:7px;text-transform:uppercase}',
  '.ac-lvbar{margin:13px 16px 0;padding:13px 16px;background:#11151F;border:1px solid rgba(0,240,255,.08);border-radius:14px}',
  '.ac-lvbar-top{display:flex;justify-content:space-between;font-family:ui-monospace,monospace;font-size:10px;color:rgba(255,255,255,.4);margin-bottom:9px;letter-spacing:.08em}',
  '.ac-lvbar-top b{color:#00F0FF}',
  '.ac-track{height:7px;background:rgba(0,240,255,.08);border-radius:99px;overflow:hidden}',
  '.ac-fill{height:100%;width:0;background:linear-gradient(90deg,#00F0FF,#00B8FF);border-radius:99px;box-shadow:0 0 10px rgba(0,240,255,.4);transition:width 1.1s cubic-bezier(.16,.84,.4,1)}',
  '.ac-tabs{display:flex;gap:4px;margin:20px 16px 0;padding:4px;background:#11151F;border:1px solid rgba(0,240,255,.08);border-radius:13px}',
  '.ac-tab{flex:1;padding:10px;background:transparent;border:0;color:rgba(255,255,255,.35);font-family:inherit;font-size:12px;font-weight:700;border-radius:9px;cursor:pointer}',
  '.ac-tab.on{background:rgba(0,240,255,.09);color:#00F0FF}',
  '.ac-body{padding:16px}',
  '.ac-pane{display:none}.ac-pane.on{display:block;animation:acIn .3s ease}',
  '.ac-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}',
  '.ac-sc{background:#11151F;border:1px solid rgba(0,240,255,.08);border-radius:12px;padding:13px 4px;text-align:center}',
  '.ac-sc .n{font-size:21px;font-weight:800}.ac-sc .n.g{color:#00FF88}.ac-sc .n.r{color:#FF4D6D}.ac-sc .n.cy{color:#00F0FF}',
  '.ac-sc .l{font-family:ui-monospace,monospace;font-size:8px;letter-spacing:.08em;color:rgba(255,255,255,.35);margin-top:5px}',
  '.ac-row{display:flex;gap:12px;padding:13px 14px;background:#11151F;border:1px solid rgba(0,240,255,.08);border-radius:13px;margin-bottom:7px}',
  '.ac-row .mk{width:5px;border-radius:3px;flex-shrink:0;background:#00FF88}',
  '.ac-row.fail .mk{background:#FF4D6D}',
  '.ac-row .tt{font-size:13px;font-weight:600;line-height:1.45}',
  '.ac-row .mt{font-family:ui-monospace,monospace;font-size:9.5px;color:rgba(255,255,255,.35);margin-top:5px}',
  '.ac-empty{text-align:center;padding:28px 20px;color:rgba(255,255,255,.42);font-size:13px;line-height:1.75}',
  '.ac-chip{display:inline-flex;align-items:center;gap:7px;padding:9px 13px;background:#11151F;border:1px solid rgba(0,240,255,.1);border-radius:11px;font-size:13px;font-weight:600;margin:0 6px 6px 0}',
  '.ac-sub{font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.16em;color:rgba(255,255,255,.35);text-transform:uppercase;margin:16px 0 9px}',
  '.ac-persona{background:#11151F;border:1px solid rgba(0,240,255,.08);border-radius:12px;padding:13px 15px;font-size:13px;line-height:1.75;color:rgba(255,255,255,.62)}',
  '.ac-digest{margin:18px 16px 0;padding:14px 16px;border-radius:15px;background:linear-gradient(135deg,rgba(0,240,255,.07),rgba(0,240,255,.02));border:1px solid rgba(0,240,255,.18)}',
  '.ac-digest .t{font-size:12px;font-weight:700;margin-bottom:5px}',
  '.ac-digest .b{font-size:12px;color:rgba(255,255,255,.62);line-height:1.6}',
  '.ac-digest .b b{color:#00F0FF}',
  '.ac-foot{text-align:center;font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.18em;color:rgba(255,255,255,.3);padding:26px 20px 6px;text-transform:uppercase}',
].join('');
function _closeAgentCard(){ var s=document.getElementById('agentCardScreen'); if(s) s.remove(); }
function _acTab(btn,name){
  var r=document.getElementById('agentCardScreen'); if(!r) return;
  r.querySelectorAll('.ac-tab').forEach(function(t){t.classList.remove('on');});
  r.querySelectorAll('.ac-pane').forEach(function(pn){pn.classList.remove('on');});
  btn.classList.add('on');
  var pane=r.querySelector('#acPane_'+name); if(pane) pane.classList.add('on');
}
function _openAgentCard(agentId){
  var ag=(agents||[]).find(function(a){return a.id===agentId;});
  if(!ag){ showToast(L('エージェントが見つかりません','Agent not found'),'ng'); return; }
  _closeAgentCard();
  if(!document.getElementById('agentCardCss')){
    var st=document.createElement('style'); st.id='agentCardCss'; st.textContent=_AGENT_CARD_CSS;
    document.head.appendChild(st);
  }
  var p =ag.progress||{level:1,output_count:0,progress_pct:0,xp_into_level:0,xp_to_next:1};
  var tr=ag.trust||{level:1};
  var oc=ag.outcomes||{total:0,completed:0,failed:0,success_rate:0,recent:[]};
  var dg=ag.digest||{turns_24h:0,turns_7d:0};
  // No outputs yet → show "—", not "0%" (0% reads as "fails everything").
  var srDisp=(oc.total>0)?((oc.success_rate||0)+'%'):'—';
  var idCode=(String(ag.id||'').replace(/[^0-9a-fA-F]/g,'').slice(0,4).toUpperCase())||'0000';
  var av=String(ag.avatar||'🤖');
  var avInner=/^(https?:|\/|data:)/.test(av) ? '<img src="'+esc(av)+'">' : esc(av);
  var role=((SKILLS.find(function(s){return ag.skills&&ag.skills[0]===s.id;})||{}).name)||'AI Agent';
  var persona=String(ag.persona||'').replace(/\s+/g,' ').trim();
  var quote=persona ? '“'+persona.slice(0,52)+(persona.length>52?'…':'')+'”' : '';
  var skillHtml=((ag.skills||[]).map(function(id){
    var s=SKILLS.find(function(x){return x.id===id;});
    return '<span class="ac-chip">'+(s?(s.icon+' '+esc(s.name)):esc(id))+'</span>';
  }).join(''))||'<span class="ac-chip" style="opacity:.5">スキル未設定</span>';
  var recentHtml=(oc.recent&&oc.recent.length)
    ? oc.recent.map(function(o){
        return '<div class="ac-row'+(o.status==='failed'?' fail':'')+'">'
          +'<div class="mk"></div><div style="flex:1;min-width:0">'
          +'<div class="tt">'+esc(o.title||'')+'</div>'
          +'<div class="mt">'+(o.status==='failed'?'✕ 失敗':'✓ 完了')+(o.time?' · '+esc(o.time):'')+'</div>'
          +'</div></div>';
      }).join('')
    : '<div class="ac-empty">まだ出力がありません。<br>このエージェントにタスクを任せると、ここに実績が積み上がります。</div>';
  var digestHtml=(dg.turns_24h||dg.turns_7d)
    ? '24時間で <b>'+(dg.turns_24h||0)+'回</b> ・ 直近7日で <b>'+(dg.turns_7d||0)+'回</b> 稼働しました。'
    : 'まだ稼働記録がありません。タスクを任せると、ここに活動が表示されます。';
  var d=document.createElement('div');
  d.id='agentCardScreen';
  d.innerHTML=
    '<div class="ac-wrap">'
    + '<div class="ac-hd">'
    +   '<button class="ac-x" onclick="_closeAgentCard()" aria-label="close">‹</button>'
    +   '<div class="ac-id">AGENT · #'+idCode+'</div>'
    +   '<div style="width:38px"></div>'
    + '</div>'
    + '<div class="ac-hero">'
    +   '<div class="ac-rings"></div>'
    +   '<div class="ac-av">'+avInner+'</div>'
    +   '<div class="ac-name">'+esc(ag.name||'AI Agent')+'</div>'
    +   '<div class="ac-pill"><b>Lv.'+(p.level||1)+'</b> / '+esc(role)+'</div>'
    +   (quote ? '<div class="ac-quote">'+esc(quote)+'</div>' : '')
    + '</div>'
    + '<div class="ac-stats">'
    +   '<div class="ac-stat"><div class="v">'+(p.output_count||0)+'</div><div class="l">出力</div></div>'
    +   '<div class="ac-stat"><div class="v cy">'+srDisp+'</div><div class="l">成功率</div></div>'
    +   '<div class="ac-stat"><div class="v">Lv.'+(tr.level||1)+'</div><div class="l">信頼</div></div>'
    + '</div>'
    + '<div class="ac-lvbar">'
    +   '<div class="ac-lvbar-top"><span>NEXT — <b>Lv.'+((p.level||1)+1)+'</b></span>'
    +     '<span>'+(p.xp_into_level||0)+' / '+(p.xp_to_next||0)+' XP</span></div>'
    +   '<div class="ac-track"><div class="ac-fill"></div></div>'
    + '</div>'
    + '<div class="ac-tabs">'
    +   '<button class="ac-tab on" onclick="_acTab(this,\'outcome\')">📊 成果</button>'
    +   '<button class="ac-tab" onclick="_acTab(this,\'skill\')">⚡ スキル</button>'
    + '</div>'
    + '<div class="ac-body">'
    +   '<div class="ac-pane on" id="acPane_outcome">'
    +     '<div class="ac-sum">'
    +       '<div class="ac-sc"><div class="n g">'+(oc.completed||0)+'</div><div class="l">完了</div></div>'
    +       '<div class="ac-sc"><div class="n r">'+(oc.failed||0)+'</div><div class="l">失敗</div></div>'
    +       '<div class="ac-sc"><div class="n cy">'+srDisp+'</div><div class="l">成功率</div></div>'
    +     '</div>'
    +     recentHtml
    +   '</div>'
    +   '<div class="ac-pane" id="acPane_skill">'
    +     '<div class="ac-sub">スキル</div>'+skillHtml
    +     (persona ? '<div class="ac-sub">性格・キャラクター</div><div class="ac-persona">'+esc(persona.slice(0,400))+'</div>' : '')
    +   '</div>'
    + '</div>'
    + '<div class="ac-digest">'
    +   '<div class="t">🌙 直近の稼働</div>'
    +   '<div class="b">'+digestHtml+'</div>'
    + '</div>'
    + '<div class="ac-foot">MY AI AGENT · '+esc(ag.name||'')+'</div>'
    + '</div>';
  document.body.appendChild(d);
  setTimeout(function(){
    var f=d.querySelector('.ac-fill'); if(f) f.style.width=Math.min(100,Math.max(0,p.progress_pct||0))+'%';
  },60);
}
async function _sendThreadReply(){
  // AI 応答中（スレッド）は新規送信をブロック。送信ボタンは⏹停止に
  // 変わっているので、ここに到達するのは Enter キー経由のみ。
  if(_threadStreamCtrl){
    // 自己修復: 制御が 4 分以上居座っている = 前ターンの接続がハングした残骸。
    if(Date.now() - (_threadStreamCtrl._startedAt || 0) > 240000){
      try { _threadStreamCtrl.abort(); } catch(e){}
      _threadStreamCtrl = null;
      try { _setThreadStreaming(false); } catch(e){}
      showToast(L('前の応答が固まっていたため解除しました。もう一度送信してください。','Cleared a stuck response — please send again.'),'ng');
      return;
    }
    showToast(L('AI が応答中です。完了するか ⏹ で停止してください','AI is responding — wait or press ⏹ to stop'),'ng');
    return;
  }
  // Reads from the thread drawer's OWN composer (#tci + _threadPendingImgs).
  // Fully independent of the main chat composer — both can hold drafts /
  // attachments simultaneously, like Slack.
  var ci = document.getElementById('tci');
  if(!ci) return;
  var text = (ci.value||'').trim();
  if(_threadPendingImgs.some(function(a){return a.kind==='url-loading'||a.kind==='text-loading';})){
    showToast(isJa?'添付の読み込み完了をお待ちください':'Wait for the attachment to finish loading','ng');
    return;
  }
  if(!text && _threadPendingImgs.length===0) return;
  var parentId = window._activeThreadParent;
  if(!parentId || !activeId) return;
  var ag = (agents||[]).find(function(a){return a.id===activeId;});
  if(!ag) return;
  // Snapshot attachments, then reset the thread composer.
  var snap = _threadPendingImgs.slice();
  var split = _attachmentPayload('thread');
  var imgs = split.imgs;       // image/pdf base64 entries
  var texts = split.texts;     // text/url entries
  _threadPendingImgs.length = 0;
  renderImgPreview('thread');
  ci.value = '';
  exTA(ci);
  var _tctrl = new AbortController();
  _threadStreamCtrl = _tctrl;
  _threadStreamCtrl._startedAt = Date.now();
  _setThreadStreaming(true);
  // Inactivity watchdog — abort a dead/hung SSE stream so the thread never
  // sits on "生成中" forever (server keepalives reset it on a healthy turn).
  var _tIdleTimer = null, _tIdleHung = false;
  function _tBumpIdle(){
    if(_tIdleTimer) clearTimeout(_tIdleTimer);
    _tIdleTimer = setTimeout(function(){ _tIdleHung = true; try { _tctrl.abort(); } catch(e){} }, 90000);
  }
  function _tClearIdle(){ if(_tIdleTimer){ clearTimeout(_tIdleTimer); _tIdleTimer = null; } }
  // /search etc. — same slash handling as the main composer.
  var outbound = text;
  try { var slashCtx = await _runSlashCommand(text); if(slashCtx) outbound = slashCtx; } catch(e){}
  // Optimistically push user msg into history with thread_parent_id; the
  // streaming response will push the AI reply (also with thread_parent_id
  // — server stamps it). Re-render drawer between events so the new bubbles
  // appear live.
  var ts = now();
  var userMsgId = 'u_local_' + Math.random().toString(36).slice(2,8);
  var userMsg = { id: userMsgId, role:'user', content: text, time: ts, thread_parent_id: parentId };
  if(snap.length > 0){
    userMsg.images = snap.map(function(att){ return {
      url: att.url,
      name: att.name,
      type: att.type,
      kind: att.kind || (att.type === 'application/pdf' ? 'pdf' : 'image'),
      source: att.source || '',
    }; });
  }
  ag.history.push(userMsg);
  var aiPlaceholderIdx = ag.history.length;
  ag.history.push({ role:'assistant', content:'', time: ts, streaming:true, thread_parent_id: parentId });
  _turnStatusStart();
  _renderThreadDrawer();
  try {
    var _body = { message: outbound, thread_parent_id: parentId, stream: true };
    if(imgs && imgs.length) _body.images = imgs;
    if(texts && texts.length) _body.texts = texts;
    // Carry the thread composer's own edit target so "fix this site" inside a
    // thread reaches the AI (the main composer's _editTarget is separate).
    if(_editTargetThread && _editTargetThread.filename) _body.edit_target = _editTargetThread;
    var res = await fetch(API + '/api/chat/' + activeId, {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body: JSON.stringify(_body),
      signal: _tctrl.signal,
    });
    var ctype = (res.headers.get('content-type')||'').toLowerCase();
    if(!ctype.includes('text/event-stream')){
      // Non-stream fallback (shouldn't normally happen)
      if(!res.ok){ var ed; try{ ed = await res.json(); }catch(e){} throw new Error((ed&&ed.error)||'通信エラー'); }
      var data = await res.json();
      if(ag.history[aiPlaceholderIdx]){
        ag.history[aiPlaceholderIdx].content = data.reply || '';
        ag.history[aiPlaceholderIdx].streaming = false;
        if(data.tool_log) ag.history[aiPlaceholderIdx].tool_log = data.tool_log;
      }
      _renderThreadDrawer();
      renderMsgs(ag, false);
      return;
    }
    // SSE stream — patch into the placeholder.
    var reader = res.body.getReader();
    var dec = new TextDecoder();
    var buf = '';
    var acc = '';
    _tBumpIdle();
    while(true){
      var chunk = await reader.read();
      _tBumpIdle();
      if(chunk.done) break;
      buf += dec.decode(chunk.value, { stream:true });
      var i;
      while((i = buf.indexOf('\n\n')) >= 0){
        var ev = buf.slice(0, i); buf = buf.slice(i+2);
        var ln, evType=''; var dataStr='';
        for(ln of ev.split('\n')){
          if(ln.startsWith('event: ')) evType = ln.slice(7).trim();
          else if(ln.startsWith('data: ')) dataStr += ln.slice(6);
        }
        if(!dataStr) continue;
        var obj; try{ obj = JSON.parse(dataStr); }catch(e){ continue; }
        _turnStatusFromEvent(evType, obj);
        if(evType === 'delta'){
          // reset=true → server retried mid-stream; discard partial text so
          // the thread bubble doesn't show duplicated content.
          if(obj.reset){ acc = ''; }
          acc += obj.text || '';
          if(ag.history[aiPlaceholderIdx]){ ag.history[aiPlaceholderIdx].content = acc; }
          _renderThreadDrawer();
        } else if(evType === 'tool_call'){
          if(ag.history[aiPlaceholderIdx]){
            ag.history[aiPlaceholderIdx].tool_log = ag.history[aiPlaceholderIdx].tool_log || [];
            ag.history[aiPlaceholderIdx].tool_log.push({ name: obj.name, input: obj.input||{}, ok:null, _pending:true });
            _renderThreadDrawer();
          }
        } else if(evType === 'tool_result'){
          if(ag.history[aiPlaceholderIdx]){
            var log = ag.history[aiPlaceholderIdx].tool_log || [];
            for(var k=log.length-1; k>=0; k--){
              if(log[k]._pending && log[k].name === obj.name){ log[k] = { ...obj, _pending:false }; break; }
            }
            // Keep me.artifacts in sync with edit/create results — Ver.N badge.
            // Push on edit too: a stale local me.artifacts (loaded before the
            // file existed) would otherwise silently fail to update.
            if((obj.name === 'edit_artifact' || obj.name === 'create_artifact') && obj.filename && obj.version != null){
              try {
                me = me || {};
                if(!Array.isArray(me.artifacts)) me.artifacts = [];
                var _hit = me.artifacts.find(function(a){ return a && a.filename === obj.filename; });
                if(_hit){
                  _hit.version = obj.version;
                  if(obj.title) _hit.title = obj.title;
                  if(obj.url)   _hit.url   = obj.url;
                  if(!_hit.chat_id) _hit.chat_id = ag.id;
                } else {
                  me.artifacts.push({
                    filename: obj.filename,
                    version: obj.version,
                    title: obj.title || '',
                    url: obj.url || ('/generated/' + obj.filename),
                    chat_id: ag.id,
                    created_at: new Date().toISOString(),
                  });
                }
              } catch(_){}
            }
            _renderThreadDrawer();
          }
        } else if(evType === 'done'){
          if(ag.history[aiPlaceholderIdx]){
            ag.history[aiPlaceholderIdx].content = obj.reply || acc;
            ag.history[aiPlaceholderIdx].streaming = false;
            if(obj.tool_log && obj.tool_log.length) ag.history[aiPlaceholderIdx].tool_log = obj.tool_log;
            if(obj.truncated) ag.history[aiPlaceholderIdx].truncated = true;
            // Server-detected promise without delivery — see _pwGoAhead.
            if(obj.promise_unfulfilled) ag.history[aiPlaceholderIdx].promise_unfulfilled = obj.promise_unfulfilled;
          }
          if(obj.balance_jpy !== undefined) me.balance_jpy = obj.balance_jpy;
          me.usage_count = (me.usage_count||0) + 1;
          updateBalance();
          _renderThreadDrawer();
          renderMsgs(ag, false);  // main feed updates the "N 件の返信" count
          _refreshArtifactsIfNeeded(ag.history[aiPlaceholderIdx] && ag.history[aiPlaceholderIdx].tool_log, ag);
        } else if(evType === 'error'){
          if(ag.history[aiPlaceholderIdx]){
            ag.history[aiPlaceholderIdx].content = 'エラー: ' + (obj.message||'');
            ag.history[aiPlaceholderIdx].streaming = false;
            ag.history[aiPlaceholderIdx].is_error = true;
          }
          _renderThreadDrawer();
        }
      }
    }
  } catch(e){
    var _tAborted = !!(e && e.name === 'AbortError');
    if(ag.history[aiPlaceholderIdx]){
      if(_tAborted){
        // User pressed ⏹ — keep whatever streamed so far, mark as stopped (no error).
        var _sofar = ag.history[aiPlaceholderIdx].content || '';
        ag.history[aiPlaceholderIdx].content = _sofar || L('（停止しました）','(stopped)');
        ag.history[aiPlaceholderIdx].streaming = false;
        ag.history[aiPlaceholderIdx].was_stopped = true;
      } else {
        // Timeout/edit-of-large-artifact failures are common when a single
        // request triggers Chromium render-verify + Vision review + multiple
        // AI iterations. Add a concrete hint so the user knows how to retry
        // productively (split the task) instead of hitting the same wall.
        var _errMsg = (e && e.message) || 'failed';
        var _hint = '';
        if(/タイムアウト|timeout|応答が遅すぎ|busy/i.test(_errMsg)){
          _hint = L(
            '\n\n💡 大きな編集（HTML 全体の書き直し / 検証付き）は時間がかかりやすく、'+
            'プロキシ側でタイムアウトすることがあります。**🔄 再試行** で再送するか、'+
            '依頼を「まず A だけ」「次に B」のように分割してみてください。',
            '\n\n💡 Large edits (full HTML rewrite + verification) can hit proxy timeouts. '+
            'Press **🔄 Retry** to re-send, or break the request into smaller steps.'
          );
        }
        ag.history[aiPlaceholderIdx].content = 'エラー: ' + _errMsg + _hint;
        ag.history[aiPlaceholderIdx].streaming = false;
        ag.history[aiPlaceholderIdx].is_error = true;
      }
    }
    _renderThreadDrawer();
    if(!_tAborted) showToast((e&&e.message)||'failed','ng');
  } finally {
    _tClearIdle();
    _turnStatusEnd();
    _threadStreamCtrl = null;
    _setThreadStreaming(false);
    // Turn over — clear any leftover "生成中" flag + re-render both surfaces.
    try { (ag.history||[]).forEach(function(m){ if(m && m.streaming) m.streaming = false; }); } catch(e){}
    try { _renderThreadDrawer(); } catch(e){}
    try { renderMsgs(ag, false); } catch(e){}
    if(_tIdleHung){ try { showToast(L('接続が応答しないため中断しました。再読み込みで最新を確認できます','Connection stalled — reload to see the latest result'),'ng'); } catch(e){} }
    var ci2 = document.getElementById('tci');
    if(ci2) ci2.focus();
  }
}

// ── 📝 Notes panel ────────────────────────────────────────
// Full-screen overlay: 2 pane (notes list ← → editor). User-level notebook,
// completely separate from chat history & AI memories. Auto-saves on blur
// and after 1 s of idle typing.
window._notesState = { notes: [], activeId: null, dirty: false, saveTimer: null, agentId: null, shared: false };

// _notesBase() returns the REST prefix.
// When the panel is opened from a chat header (agentId passed) we read/write
// against /api/agents/:id/notes — DM = private, Teams/Groups = shared with
// all chat members. Falls back to /api/me/notes for the legacy global path.
function _notesBase(){
  var st = window._notesState;
  return st.agentId ? ('/api/agents/' + st.agentId + '/notes') : '/api/me/notes';
}

async function openNotesPanel(agentId){
  window._notesState.agentId = agentId || null;
  window._notesState.shared = false;
  console.log('[notes] open — agentId=', agentId, 'base=', _notesBase());
  // Hydrate notes list, then render
  try {
    var r = await api('GET', _notesBase());
    console.log('[notes] list response — count=', (r && r.notes||[]).length);
    window._notesState.notes = (r && r.notes) || [];
    window._notesState.shared = !!(r && r.shared);
  } catch(e){
    console.error('[notes] list failed:', e);
    showToast((e.message||'メモ一覧の読込失敗'),'ng');
    window._notesState.notes = [];
  }
  // Pick the most-recent note (already sorted server-side) or null
  window._notesState.activeId = (window._notesState.notes[0] || {}).id || null;
  // Fetch full content for the auto-selected note so the editor isn't blank
  if(window._notesState.activeId){
    try {
      var rOne = await api('GET', _notesBase() + '/' + window._notesState.activeId);
      if(rOne && rOne.note){
        var i = window._notesState.notes.findIndex(function(n){return n.id === window._notesState.activeId;});
        if(i >= 0){ window._notesState.notes[i].content = rOne.note.content || ''; }
      }
    } catch(e){ console.error('[notes] fetch initial note failed:', e); }
  }
  _renderNotesPanel();
}

function _renderNotesPanel(){
  var existing = document.getElementById('notesOverlay');
  if(existing) existing.remove();
  var st = window._notesState;
  var ov = document.createElement('div');
  ov.id = 'notesOverlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,12,.5);z-index:9990;display:flex;align-items:center;justify-content:center;padding:14px;font-family:inherit';
  var listHTML = st.notes.length
    ? st.notes.map(function(n){
        var sel = n.id === st.activeId;
        var when = (n.updated_at || '').slice(5, 16).replace('T',' ');
        var title = n.title || (n.snippet ? n.snippet.slice(0, 30) : (isJa?'(無題)':'(Untitled)'));
        return '<div onclick="_notesSelect(\''+esc(n.id)+'\')" style="padding:11px 13px;border-radius:9px;cursor:pointer;background:'+(sel?'var(--peach-soft)':'transparent')+';margin-bottom:2px;border-left:3px solid '+(sel?'var(--peach)':'transparent')+'">'
          + '<div style="font-size:12.5px;font-weight:'+(sel?'800':'700')+';color:'+(sel?'var(--peach-dark)':'var(--text)')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(title)+'</div>'
          + '<div style="font-size:10.5px;color:var(--text3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(n.snippet||'')+'</div>'
          + '<div style="font-size:9.5px;color:var(--text3);margin-top:3px;font-weight:600;letter-spacing:.02em">'+esc(when)+'</div>'
          + '</div>';
      }).join('')
    : '<div style="text-align:center;padding:30px 12px;font-size:12px;color:var(--text3)">'+L('まだメモがありません','No notes yet')+'</div>';
  var sharedBadge = st.shared
    ? '<span title="'+L('このチャットのメンバー全員が閲覧・編集できます','Visible & editable by everyone in this chat')+'" style="font-size:10px;font-weight:800;color:#0369a1;background:#e0f2fe;border:1px solid #7dd3fc;padding:3px 9px;border-radius:99px;letter-spacing:.02em">👥 '+L('共有メモ','Shared')+'</span>'
    : (st.agentId
        ? '<span title="'+L('この AI とのチャットだけに紐づく自分用メモ','Private to this 1:1 chat')+'" style="font-size:10px;font-weight:800;color:var(--text3);background:var(--cream2);border:1px solid var(--wire2);padding:3px 9px;border-radius:99px;letter-spacing:.02em">🔒 '+L('DM 専用','Private')+'</span>'
        : '');
  ov.innerHTML =
    '<div style="background:#fff;border-radius:16px;max-width:1400px;width:100%;max-height:94vh;height:94vh;display:flex;flex-direction:column;box-shadow:0 24px 48px rgba(0,0,0,.18)">'
    +  '<div style="padding:14px 18px;border-bottom:1px solid var(--wire);display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
    +    '<div style="font-size:15px;font-weight:900;color:var(--text)">📝 '+L('メモ','Notes')+'</div>'
    +    sharedBadge
    +    '<div id="notesSavedFlag" style="font-size:10.5px;color:var(--text3);font-weight:700"></div>'
    +    '<button onclick="_notesCreate()" style="margin-left:auto;background:var(--peach);color:#fff;border:0;border-radius:8px;padding:7px 13px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">+ '+L('新規','New')+'</button>'
    +    '<button onclick="_notesClose()" style="background:#fff;border:1px solid var(--wire2);border-radius:8px;padding:7px 13px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">'+L('閉じる','Close')+'</button>'
    +  '</div>'
    +  '<div style="flex:1;display:flex;min-height:0">'
    +    '<aside style="width:280px;border-right:1px solid var(--wire);background:var(--cream);overflow-y:auto;padding:8px">'+listHTML+'</aside>'
    +    '<div style="flex:1;display:flex;flex-direction:column;min-width:0" id="notesEditorWrap"></div>'
    +  '</div>'
    + '</div>';
  ov.addEventListener('click', function(e){ if(e.target === ov) _notesClose(); });
  document.body.appendChild(ov);
  _notesRenderEditor();
}

function _notesRenderEditor(){
  var st = window._notesState;
  var wrap = document.getElementById('notesEditorWrap');
  if(!wrap) return;
  if(!st.activeId){
    wrap.innerHTML = '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:13px">'+L('左で選ぶ、または「+ 新規」で作成','Pick one on the left or "+ New" to create')+'</div>';
    return;
  }
  var note = (st.notes || []).find(function(n){return n.id === st.activeId;});
  if(!note){ wrap.innerHTML = ''; return; }
  wrap.innerHTML =
    '<input id="notesTitle" placeholder="'+L('タイトル','Title')+'" style="background:transparent;border:0;border-bottom:1px solid var(--wire);padding:16px 28px;font-size:20px;font-weight:800;font-family:inherit;color:var(--text);outline:none">'
    + '<textarea id="notesBody" placeholder="'+L('ここに自由に書く…','Write anything…')+'" style="flex:1;background:transparent;border:0;padding:18px 28px;font-size:15.5px;line-height:1.75;font-family:inherit;color:var(--text);outline:none;resize:none"></textarea>'
    + '<div style="padding:8px 16px;border-top:1px solid var(--wire);display:flex;align-items:center;gap:8px;background:var(--cream)">'
    +   '<div id="notesCharCount" style="font-size:10.5px;color:var(--text3);font-weight:700"></div>'
    +   '<button onclick="_notesDelete()" style="margin-left:auto;background:#fff;border:1px solid #fecaca;color:#dc2626;border-radius:7px;padding:6px 12px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit">🗑 '+L('削除','Delete')+'</button>'
    +   '<button onclick="_notesSaveExplicit()" style="background:var(--peach);color:#fff;border:0;border-radius:7px;padding:6px 16px;font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit">💾 '+L('保存','Save')+'</button>'
    + '</div>';
  // Hydrate fields
  var ti = document.getElementById('notesTitle');
  var bo = document.getElementById('notesBody');
  ti.value = note.title || '';
  bo.value = note.content || '';
  _notesUpdateCharCount();
  // Wire auto-save
  ti.addEventListener('input', _notesOnEdit);
  bo.addEventListener('input', _notesOnEdit);
  ti.addEventListener('blur', _notesSaveNow);
  bo.addEventListener('blur', _notesSaveNow);
  bo.focus();
}

function _notesUpdateCharCount(){
  var bo = document.getElementById('notesBody'); if(!bo) return;
  var cc = document.getElementById('notesCharCount'); if(!cc) return;
  cc.textContent = (bo.value||'').length + (isJa?' 字':' chars');
}

function _notesOnEdit(){
  var st = window._notesState;
  st.dirty = true;
  _notesUpdateCharCount();
  var flag = document.getElementById('notesSavedFlag');
  if(flag) flag.textContent = '・' + (isJa?'保存中…':'Saving…');
  if(st.saveTimer) clearTimeout(st.saveTimer);
  st.saveTimer = setTimeout(_notesSaveNow, 1000);
}

async function _notesSaveNow(opts){
  var st = window._notesState;
  var force = opts && opts.force === true;
  if(!st.activeId){
    if(force) showToast(isJa?'保存対象のメモがありません':'No note to save','ng');
    return;
  }
  if(!st.dirty && !force) return;
  var ti = document.getElementById('notesTitle');
  var bo = document.getElementById('notesBody');
  if(!ti || !bo){
    if(force) showToast(isJa?'エディタが見つかりません':'Editor not found','ng');
    return;
  }
  var title = ti.value || '';
  var content = bo.value || '';
  console.log('[notes] save — id=', st.activeId, 'len=', content.length, 'base=', _notesBase());
  try {
    var r = await api('PATCH', _notesBase() + '/' + st.activeId, { title, content });
    console.log('[notes] save response=', r);
    if(r && r.note){
      var i = st.notes.findIndex(function(n){return n.id === st.activeId;});
      if(i >= 0){
        st.notes[i].title = r.note.title;
        st.notes[i].snippet = String(r.note.content||'').slice(0, 120).replace(/\n+/g,' ');
        st.notes[i].updated_at = r.note.updated_at;
      }
      st.dirty = false;
      var flag = document.getElementById('notesSavedFlag');
      if(flag) flag.textContent = '・' + (isJa?'✓ 保存済':'✓ Saved');
      setTimeout(function(){ var f = document.getElementById('notesSavedFlag'); if(f) f.textContent = ''; }, 1500);
      // Explicit save (button) shows toast for clear confirmation
      if(force){ showToast(isJa?'✓ 保存しました':'✓ Saved','ok'); }
    } else {
      console.error('[notes] save returned no .note field:', r);
      showToast(isJa?'保存失敗 (空レスポンス) - DevTools で詳細確認':'Save failed (empty response)','ng');
    }
    // Re-render the list pane (in-place — keep the editor untouched)
    var ov = document.getElementById('notesOverlay');
    if(ov){
      var aside = ov.querySelector('aside');
      if(aside){
        aside.innerHTML = (st.notes || []).map(function(n){
          var sel = n.id === st.activeId;
          var title2 = n.title || (n.snippet ? n.snippet.slice(0, 30) : (isJa?'(無題)':'(Untitled)'));
          return '<div onclick="_notesSelect(\''+esc(n.id)+'\')" style="padding:11px 13px;border-radius:9px;cursor:pointer;background:'+(sel?'var(--peach-soft)':'transparent')+';margin-bottom:2px;border-left:3px solid '+(sel?'var(--peach)':'transparent')+'">'
            + '<div style="font-size:12.5px;font-weight:'+(sel?'800':'700')+';color:'+(sel?'var(--peach-dark)':'var(--text)')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(title2)+'</div>'
            + '<div style="font-size:10.5px;color:var(--text3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(n.snippet||'')+'</div>'
            + '</div>';
        }).join('');
      }
    }
  } catch(e){
    console.error('[notes] save error:', e);
    var f = document.getElementById('notesSavedFlag');
    if(f) f.textContent = '⚠ ' + (e.message||'save failed');
    // Loud toast so the user can't miss it
    showToast(isJa?('⚠ 保存失敗: '+(e.message||'unknown')):('Save failed: '+(e.message||'unknown')),'ng');
  }
}
// Explicit save trigger from the 💾 button
function _notesSaveExplicit(){
  // Mark dirty so saveNow will run even if no recent edit
  window._notesState.dirty = true;
  _notesSaveNow({ force: true });
}

async function _notesCreate(){
  console.log('[notes] create — base=', _notesBase());
  try {
    var r = await api('POST', _notesBase(), { title:'', content:'' });
    console.log('[notes] create response=', r);
    if(r && r.note){
      window._notesState.notes.unshift({
        id: r.note.id, title: r.note.title || '', snippet:'',
        updated_at: r.note.updated_at,
      });
      window._notesState.activeId = r.note.id;
      showToast(isJa?'✓ 新しいメモを作成':'✓ New note created','ok');
      _renderNotesPanel();
    } else {
      console.error('[notes] create returned no .note field:', r);
      showToast(isJa?'メモ作成失敗 (空レスポンス)':'Create failed (empty response)','ng');
    }
  } catch(e){
    console.error('[notes] create error:', e);
    showToast((e.message||(isJa?'メモ作成失敗':'Failed')),'ng');
  }
}

async function _notesSelect(id){
  // Save current before switching
  if(window._notesState.dirty){ await _notesSaveNow(); }
  window._notesState.activeId = id;
  // CRITICAL: fetch full content. GET /notes (list) only returns snippet to
  // keep the payload tiny — if we don't fetch the body here, the editor
  // shows EMPTY for previously-saved notes, making users think their content
  // was lost. That was the root cause of "保存されない" reports.
  try {
    var r = await api('GET', _notesBase() + '/' + id);
    if(r && r.note){
      var i = window._notesState.notes.findIndex(function(n){return n.id === id;});
      if(i >= 0){
        window._notesState.notes[i].content = r.note.content || '';
        window._notesState.notes[i].title = r.note.title || window._notesState.notes[i].title;
      }
    }
  } catch(e){
    console.error('[notes] fetch full note failed:', e);
  }
  _renderNotesPanel();
}

async function _notesDelete(){
  var st = window._notesState;
  if(!st.activeId) return;
  if(!confirm(isJa?'このメモを削除?':'Delete this note?')) return;
  try {
    await api('DELETE', _notesBase() + '/' + st.activeId);
    st.notes = st.notes.filter(function(n){return n.id !== st.activeId;});
    st.activeId = (st.notes[0] || {}).id || null;
    st.dirty = false;
    _renderNotesPanel();
  } catch(e){ showToast((e.message||(isJa?'失敗':'Failed')),'ng'); }
}

function _notesClose(){
  if(window._notesState.dirty) _notesSaveNow();
  var ov = document.getElementById('notesOverlay');
  if(ov) ov.remove();
}

// ── 🧠 Agent Profile panel ───────────────────────────────────
// Full-screen overlay with 4 tabs: 記憶 / 目標 / プレイブック / 案件 + 自律ルーチン.
// Pulls live state from /api/agents/:id/profile so it's always in sync with
// what the AI is using as context.
async function openAgentProfile(agId){
  var ag = (agents||[]).find(function(a){return a.id===agId;});
  if(!ag) return;
  var accent = _agentAccent(ag) || { color:'var(--peach-dark)', soft:'rgba(251,146,60,.08)', grad:'linear-gradient(135deg,#fff7ee,#fed7aa)' };
  // Pull live profile + evolution data in parallel
  var data, evo;
  try {
    var [p, e] = await Promise.all([
      api('GET', '/api/agents/'+agId+'/profile'),
      api('GET', '/api/agents/'+agId+'/evolution').catch(function(){return null;}),
    ]);
    data = p;
    evo = e;
  } catch(e){ showToast((e && e.message)||'failed','ng'); return; }
  if(data && evo) data.evolution = evo;
  // Local working state
  window._agProfile = { agId: agId, data: data, tab: 'memories' };
  _renderAgentProfile();
}

function _renderAgentProfile(){
  var st = window._agProfile;
  if(!st) return;
  var ag = (agents||[]).find(function(a){return a.id===st.agId;});
  if(!ag) return;
  var d = st.data || {};
  var accent = _agentAccent(ag) || { color:'var(--peach-dark)', soft:'rgba(251,146,60,.08)', grad:'linear-gradient(135deg,#fff7ee,#fed7aa)' };
  var memCount = (d.memories||[]).length;
  var kpiCount = (d.kpis||[]).length;
  var pbCount  = (d.playbook||[]).length;
  var taskCount= (d.open_tasks||[]).filter(function(t){return t.status!=='done';}).length;
  var routineCount = (d.routines||[]).length;
  var evoCount = (d.evolution && d.evolution.skills_mastered) ? d.evolution.skills_mastered.length : 0;
  var tabs = [
    {id:'memories', label:L('🧠 記憶','🧠 Memory'),      count:memCount},
    {id:'kpis',     label:L('🎯 目標 / KPI','🎯 Goals/KPI'),count:kpiCount},
    {id:'playbook', label:L('📘 プレイブック','📘 Playbook'),count:pbCount},
    {id:'tasks',    label:L('📋 案件','📋 Tasks'),         count:taskCount},
    {id:'routines', label:L('⏰ 自律ルーチン','⏰ Routines'), count:routineCount},
    {id:'evolution',label:L('🌱 進化履歴','🌱 Evolution'),  count:evoCount},
  ];
  var tabHTML = tabs.map(function(t){
    var on = (t.id === st.tab);
    return '<button onclick="_agProfTab(\''+t.id+'\')" style="background:'+(on?accent.color:'transparent')+';color:'+(on?'#fff':'var(--text2)')+';border:0;border-radius:9px 9px 0 0;padding:9px 13px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;border-bottom:'+(on?'0':'1px solid transparent')+'">'+t.label+' <span style="font-size:10px;font-weight:700;opacity:.7">'+t.count+'</span></button>';
  }).join('');
  var pane = '';
  if(st.tab === 'memories')  pane = _agProfMemories(d.memories||[]);
  if(st.tab === 'kpis')      pane = _agProfKpis(d.kpis||[]);
  if(st.tab === 'playbook')  pane = _agProfPlaybook(d.playbook||[]);
  if(st.tab === 'tasks')     pane = _agProfTasks(d.open_tasks||[]);
  if(st.tab === 'routines')  pane = _agProfRoutines(d.routines||[]);
  if(st.tab === 'evolution') pane = _agProfEvolution(d.evolution||{});
  var existing = document.getElementById('agProfileOverlay');
  if(existing) existing.remove();
  var ov = document.createElement('div');
  ov.id = 'agProfileOverlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,12,.5);z-index:9990;display:flex;align-items:center;justify-content:center;padding:24px;font-family:inherit';
  ov.innerHTML =
    '<div style="background:#fff;border-radius:16px;max-width:860px;width:100%;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 48px rgba(0,0,0,.18)">'
    +  '<div style="padding:16px 20px;border-bottom:1px solid var(--wire2);display:flex;align-items:center;gap:12px">'
    +    '<div style="width:38px;height:38px;border-radius:11px;background:'+accent.grad+';display:flex;align-items:center;justify-content:center;font-size:18px">'+_avHTML(ag.avatar||'🤖')+'</div>'
    +    '<div style="flex:1;min-width:0">'
    +      '<div style="font-size:15px;font-weight:900;color:var(--text)">'+esc(ag.name||'AI')+' '+L('のプロフィール',' profile')+'</div>'
    +      '<div style="font-size:11px;color:var(--text3);margin-top:2px">'+L('AI が憶えて働いてる情報', 'What this AI remembers and works on')+'</div>'
    +    '</div>'
    +    '<button onclick="document.getElementById(\'agProfileOverlay\').remove()" style="background:#fff;border:1px solid var(--wire2);border-radius:9px;padding:6px 12px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">'+L('閉じる','Close')+'</button>'
    +  '</div>'
    +  '<div style="display:flex;gap:2px;padding:0 16px;border-bottom:1px solid var(--wire2)">'+tabHTML+'</div>'
    +  '<div style="padding:18px 22px;overflow-y:auto;flex:1;background:#fdfcfa">'+pane+'</div>'
    + '</div>';
  ov.addEventListener('click', function(e){ if(e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
}

function _agProfTab(t){ if(window._agProfile){ window._agProfile.tab = t; _renderAgentProfile(); } }

async function _agProfReload(){
  var st = window._agProfile; if(!st) return;
  try { st.data = await api('GET', '/api/agents/'+st.agId+'/profile'); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); return; }
  // Also patch local agent record so chat header / sidebar see new state.
  var ag = (agents||[]).find(function(a){return a.id===st.agId;});
  if(ag){
    ag.memories   = st.data.memories;
    ag.kpis       = st.data.kpis;
    ag.playbook   = st.data.playbook;
    ag.open_tasks = st.data.open_tasks;
  }
  _renderAgentProfile();
}

function _agProfMemories(items){
  var sorted = (items||[]).slice().sort(function(a,b){ return (b.pinned?1:0)-(a.pinned?1:0) || (new Date(b.created_at||0)-new Date(a.created_at||0)); });
  var addBtn = '<div style="margin-bottom:14px"><input id="agProfNewMem" placeholder="'+L('AI に憶えてもらう事実 (例: ターゲットは SaaS スタートアップ)','Fact for AI to remember (e.g. target = SaaS startups)')+'" style="width:100%;padding:10px 13px;border:1px solid var(--wire2);border-radius:9px;font-family:inherit;font-size:13px;box-sizing:border-box" onkeydown="if(event.key===\'Enter\'){_agProfAddMem(event)}"><div style="text-align:right;margin-top:6px"><button onclick="_agProfAddMem()" style="background:var(--peach);color:#fff;border:0;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">'+L('+ 追加','+ Add')+'</button></div></div>';
  if(!sorted.length) return addBtn + '<div style="text-align:center;color:var(--text3);padding:30px;font-size:13px">'+L('まだ記憶はありません。会話するほど自動で蓄積されます。','No memories yet. They build up automatically as you chat.')+'</div>';
  return addBtn + sorted.map(function(m){
    var pinIcon = m.pinned ? '📌' : '📍';
    var srcBadge = m.source === 'auto' ? '<span style="font-size:9px;font-weight:700;color:var(--text3);background:var(--cream2);padding:2px 6px;border-radius:4px;margin-right:6px">'+L('AUTO','AUTO')+'</span>' : '<span style="font-size:9px;font-weight:700;color:var(--peach-dark);background:rgba(251,146,60,.12);padding:2px 6px;border-radius:4px;margin-right:6px">'+L('手動','MANUAL')+'</span>';
    return '<div style="background:#fff;border:1px solid var(--wire2);border-radius:10px;padding:11px 14px;margin-bottom:8px;display:flex;align-items:flex-start;gap:10px">'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="margin-bottom:3px">'+srcBadge+'<span style="font-size:9.5px;color:var(--text3)">'+esc((m.created_at||'').slice(0,10))+'</span></div>'
      +   '<div style="font-size:13px;color:var(--text);line-height:1.55;white-space:pre-wrap">'+esc(m.text||'')+'</div>'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:4px">'
      +   '<button onclick="_agProfPinMem(\''+esc(m.id)+'\','+(!m.pinned)+')" title="'+(m.pinned?L('固定解除','Unpin'):L('固定','Pin'))+'" style="background:'+(m.pinned?'rgba(251,146,60,.12)':'#fff')+';border:1px solid var(--wire2);border-radius:7px;padding:4px 7px;cursor:pointer;font-size:13px;font-family:inherit">'+pinIcon+'</button>'
      +   '<button onclick="_agProfDelMem(\''+esc(m.id)+'\')" style="background:#fff;border:1px solid var(--wire2);border-radius:7px;padding:4px 7px;cursor:pointer;font-size:11px;color:var(--rose);font-family:inherit">🗑</button>'
      + '</div>'
      + '</div>';
  }).join('');
}
async function _agProfAddMem(ev){
  if(ev && ev.preventDefault) ev.preventDefault();
  var inp = document.getElementById('agProfNewMem');
  var text = (inp && inp.value || '').trim();
  if(text.length < 4){ showToast(L('もう少し長く','Too short'),'ng'); return; }
  var st = window._agProfile;
  try { await api('POST', '/api/agents/'+st.agId+'/memories', {text:text}); inp.value=''; await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}
async function _agProfPinMem(mid, pin){
  var st = window._agProfile;
  try { await api('PATCH', '/api/agents/'+st.agId+'/memories/'+mid, {pinned:pin}); await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}
async function _agProfDelMem(mid){
  if(!confirm(L('この記憶を削除?','Delete this memory?'))) return;
  var st = window._agProfile;
  try { await api('DELETE', '/api/agents/'+st.agId+'/memories/'+mid); await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}

function _agProfKpis(items){
  var addBtn = '<div style="background:#fff;border:1px dashed var(--wire2);border-radius:10px;padding:12px;margin-bottom:14px">'
    + '<div style="font-size:11px;font-weight:800;color:var(--text2);margin-bottom:8px">'+L('+ 新規 KPI','+ New KPI')+'</div>'
    + '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:6px">'
    + '<input id="agpKpiName" placeholder="'+L('指標名 (例: 月商)','KPI name (e.g. MRR)')+'" style="padding:8px;border:1px solid var(--wire2);border-radius:7px;font-family:inherit;font-size:12px">'
    + '<input id="agpKpiCur"  placeholder="'+L('現在','Current')+'" type="number" style="padding:8px;border:1px solid var(--wire2);border-radius:7px;font-family:inherit;font-size:12px">'
    + '<input id="agpKpiTgt"  placeholder="'+L('目標','Target')+'" type="number" style="padding:8px;border:1px solid var(--wire2);border-radius:7px;font-family:inherit;font-size:12px">'
    + '<input id="agpKpiUnit" placeholder="'+L('単位 (円,%)','Unit')+'" style="padding:8px;border:1px solid var(--wire2);border-radius:7px;font-family:inherit;font-size:12px">'
    + '</div>'
    + '<div style="text-align:right;margin-top:8px"><button onclick="_agProfAddKpi()" style="background:var(--peach);color:#fff;border:0;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">'+L('+ 追加','+ Add')+'</button></div>'
    + '</div>';
  if(!items.length) return addBtn + '<div style="text-align:center;color:var(--text3);padding:24px;font-size:13px">'+L('まだ KPI はありません。','No KPIs yet.')+'</div>';
  return addBtn + items.map(function(k){
    var pct = (k.target && k.current != null) ? Math.max(0, Math.min(100, Math.round((k.current / k.target) * 100))) : null;
    var bar = pct != null ? '<div style="background:var(--cream2);border-radius:99px;height:6px;overflow:hidden;margin-top:6px"><div style="background:linear-gradient(90deg,var(--peach),var(--peach-dark));height:100%;width:'+pct+'%;border-radius:99px;transition:width .3s"></div></div>' : '';
    return '<div style="background:#fff;border:1px solid var(--wire2);border-radius:11px;padding:13px 16px;margin-bottom:10px">'
      + '<div style="display:flex;align-items:center;gap:12px">'
      +   '<div style="flex:1;min-width:0">'
      +     '<div style="font-size:13px;font-weight:800;color:var(--text)">'+esc(k.name||'')+'</div>'
      +     '<div style="font-size:11px;color:var(--text3);margin-top:2px">'+L('現在','Now')+': <b style="color:var(--text)">'+esc(String(k.current!=null?k.current:'?'))+'</b> / '+L('目標','Target')+': '+esc(String(k.target!=null?k.target:'?'))+(k.unit?' '+esc(k.unit):'')+(pct!=null?' · '+pct+'%':'')+'</div>'
      +   '</div>'
      +   '<input type="number" placeholder="'+L('現在値を更新','Update value')+'" id="agpKpiUpd_'+esc(k.id)+'" style="padding:7px 10px;border:1px solid var(--wire2);border-radius:7px;font-family:inherit;font-size:12px;width:120px" onkeydown="if(event.key===\'Enter\'){_agProfKpiUpdate(\''+esc(k.id)+'\')}">'
      +   '<button onclick="_agProfKpiUpdate(\''+esc(k.id)+'\')" style="background:var(--peach);color:#fff;border:0;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit">'+L('更新','Save')+'</button>'
      +   '<button onclick="_agProfKpiDel(\''+esc(k.id)+'\')" style="background:#fff;border:1px solid var(--wire2);border-radius:7px;padding:7px 9px;font-size:11px;color:var(--rose);cursor:pointer;font-family:inherit">🗑</button>'
      + '</div>'
      + bar
      + '</div>';
  }).join('');
}
async function _agProfAddKpi(){
  var st = window._agProfile;
  var name = document.getElementById('agpKpiName').value.trim();
  if(!name){ showToast(L('指標名は必須','Name required'),'ng'); return; }
  var current = parseFloat(document.getElementById('agpKpiCur').value);
  var target  = parseFloat(document.getElementById('agpKpiTgt').value);
  var unit    = document.getElementById('agpKpiUnit').value.trim();
  try { await api('POST', '/api/agents/'+st.agId+'/kpis', {name, current:isFinite(current)?current:0, target:isFinite(target)?target:null, unit}); await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}
async function _agProfKpiUpdate(kid){
  var st = window._agProfile;
  var v = parseFloat(document.getElementById('agpKpiUpd_'+kid).value);
  if(!isFinite(v)){ showToast(L('数値を入れてください','Enter a number'),'ng'); return; }
  try { await api('PATCH', '/api/agents/'+st.agId+'/kpis/'+kid, {current:v}); await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}
async function _agProfKpiDel(kid){
  if(!confirm(L('この KPI を削除?','Delete this KPI?'))) return;
  var st = window._agProfile;
  try { await api('DELETE', '/api/agents/'+st.agId+'/kpis/'+kid); await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}

function _agProfPlaybook(items){
  if(!items.length) return '<div style="text-align:center;color:var(--text3);padding:30px;font-size:13px">'+L('まだプレイブックなし。AI が成功したパターンが自動で蓄積されます。','No playbook yet. Successful patterns will be saved here automatically.')+'</div>';
  var sorted = items.slice().sort(function(a,b){ return (b.success_count||0)-(a.success_count||0); });
  return sorted.map(function(p){
    return '<div style="background:#fff;border:1px solid var(--wire2);border-radius:11px;padding:13px 16px;margin-bottom:10px">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">'
      +   '<span style="font-size:9.5px;font-weight:800;background:rgba(34,197,94,.12);color:#15803d;padding:2px 7px;border-radius:4px">✓ '+L('成功','SUCCESS')+' ×'+(p.success_count||1)+'</span>'
      +   '<span style="font-size:9.5px;color:var(--text3)">'+esc((p.created_at||'').slice(0,10))+'</span>'
      +   '<button onclick="_agProfPbDel(\''+esc(p.id)+'\')" style="margin-left:auto;background:#fff;border:1px solid var(--wire2);border-radius:6px;padding:3px 7px;font-size:10px;color:var(--rose);cursor:pointer;font-family:inherit">🗑</button>'
      + '</div>'
      + '<div style="font-size:11px;color:var(--text3);margin-bottom:4px"><b>'+L('状況','When')+':</b> '+esc(p.context||'')+'</div>'
      + '<div style="font-size:13px;color:var(--text);line-height:1.55"><b>'+L('うまくいったやり方','What worked')+':</b> '+esc(p.pattern||'')+'</div>'
      + '</div>';
  }).join('');
}
async function _agProfPbDel(pid){
  if(!confirm(L('このプレイブックを削除?','Delete?'))) return;
  var st = window._agProfile;
  try { await api('DELETE', '/api/agents/'+st.agId+'/playbook/'+pid); await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}

function _agProfTasks(items){
  var addBtn = '<div style="background:#fff;border:1px dashed var(--wire2);border-radius:10px;padding:12px;margin-bottom:14px;display:flex;gap:6px">'
    + '<input id="agpTaskTitle" placeholder="'+L('新規案件 (例: LP 改善 v2)','New task (e.g. LP rev v2)')+'" style="flex:1;padding:8px 11px;border:1px solid var(--wire2);border-radius:7px;font-family:inherit;font-size:12px" onkeydown="if(event.key===\'Enter\'){_agProfAddTask()}">'
    + '<button onclick="_agProfAddTask()" style="background:var(--peach);color:#fff;border:0;border-radius:7px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">'+L('+ 追加','+ Add')+'</button>'
    + '</div>';
  if(!items.length) return addBtn + '<div style="text-align:center;color:var(--text3);padding:24px;font-size:13px">'+L('進行中の案件はありません。','No tasks in progress.')+'</div>';
  return addBtn + items.map(function(t){
    var pct = Math.max(0, Math.min(100, parseInt(t.progress_pct,10)||0));
    var isDone = t.status === 'done';
    return '<div style="background:'+(isDone?'#f9fafb':'#fff')+';border:1px solid var(--wire2);border-radius:11px;padding:12px 15px;margin-bottom:9px;opacity:'+(isDone?.6:1)+'">'
      + '<div style="display:flex;align-items:center;gap:10px">'
      +   '<input type="checkbox"'+(isDone?' checked':'')+' onchange="_agProfTaskToggle(\''+esc(t.id)+'\',this.checked)" style="cursor:pointer">'
      +   '<div style="flex:1;min-width:0;font-size:13px;font-weight:'+(isDone?'600':'700')+';color:var(--text);text-decoration:'+(isDone?'line-through':'none')+'">'+esc(t.title||'')+'</div>'
      +   '<input type="number" min="0" max="100" value="'+pct+'" onchange="_agProfTaskPct(\''+esc(t.id)+'\',this.value)" style="width:60px;padding:5px 8px;border:1px solid var(--wire2);border-radius:6px;font-family:inherit;font-size:11px">'
      +   '<span style="font-size:10px;color:var(--text3)">%</span>'
      +   '<button onclick="_agProfTaskDel(\''+esc(t.id)+'\')" style="background:#fff;border:1px solid var(--wire2);border-radius:6px;padding:4px 7px;font-size:11px;color:var(--rose);cursor:pointer;font-family:inherit">🗑</button>'
      + '</div>'
      + (t.notes ? '<div style="font-size:11px;color:var(--text3);margin-top:5px;padding-left:24px">'+esc(t.notes)+'</div>' : '')
      + '<div style="margin-top:6px;background:var(--cream2);border-radius:99px;height:4px;overflow:hidden"><div style="background:'+(isDone?'#22c55e':'var(--peach)')+';height:100%;width:'+pct+'%"></div></div>'
      + '</div>';
  }).join('');
}
async function _agProfAddTask(){
  var st = window._agProfile;
  var inp = document.getElementById('agpTaskTitle');
  var title = (inp && inp.value || '').trim();
  if(!title){ return; }
  try { await api('POST', '/api/agents/'+st.agId+'/tasks', {title}); inp.value=''; await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}
async function _agProfTaskToggle(tid, done){
  var st = window._agProfile;
  try { await api('PATCH', '/api/agents/'+st.agId+'/tasks/'+tid, {status: done?'done':'progress', progress_pct: done?100:50}); await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}
async function _agProfTaskPct(tid, val){
  var st = window._agProfile;
  var v = parseInt(val,10);
  if(!isFinite(v)) return;
  try { await api('PATCH', '/api/agents/'+st.agId+'/tasks/'+tid, {progress_pct: v, status: v>=100?'done':'progress'}); await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}
async function _agProfTaskDel(tid){
  if(!confirm(L('この案件を削除?','Delete this task?'))) return;
  var st = window._agProfile;
  try { await api('DELETE', '/api/agents/'+st.agId+'/tasks/'+tid); await _agProfReload(); }
  catch(e){ showToast((e&&e.message)||'failed','ng'); }
}

function _agProfRoutines(items){
  var st = window._agProfile;
  var ag = (agents||[]).find(function(a){return a.id===st.agId;});
  var hint = '<div style="background:rgba(251,146,60,.06);border:1px solid rgba(251,146,60,.25);border-radius:10px;padding:11px 15px;margin-bottom:14px;font-size:12px;color:var(--text2);line-height:1.55">💡 '+L('自律ルーチンは「メニュー → スケジュール」から追加します。このエージェントが定期的に行う仕事一覧です。','Routines are added from "Menu → Schedules". This shows the recurring jobs assigned to this agent.')+'</div>';
  if(!items.length) return hint + '<div style="text-align:center;color:var(--text3);padding:24px;font-size:13px">'+L('まだルーチンはありません。','No routines yet.')+'</div>';
  return hint + items.map(function(s){
    return '<div style="background:#fff;border:1px solid var(--wire2);border-radius:11px;padding:13px 16px;margin-bottom:9px">'
      + '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">⏰ '+esc(s.name||s.prompt||'Routine')+'</div>'
      + '<div style="font-size:11px;color:var(--text3);font-family:\'SF Mono\',Menlo,monospace">'+esc(s.cron||'')+' · '+esc(s.timezone||'UTC')+'</div>'
      + (s.last_run_at?'<div style="font-size:10.5px;color:var(--text3);margin-top:3px">'+L('最終実行','Last run')+': '+esc(s.last_run_at)+'</div>':'')
      + '</div>';
  }).join('');
}

// 🌱 Evolution log — shows total tool uses, mastered skills, and milestone history.
function _agProfEvolution(d){
  var hint = '<div style="background:linear-gradient(135deg,#fff7ee,#ffe4c4);border:1px solid #fed7aa;border-radius:10px;padding:12px 15px;margin-bottom:14px;font-size:12.5px;color:#7c2d12;line-height:1.6">'
    + '<b>🌱 進化システム</b> — このエージェントがツールを使うたびに経験値が貯まり、 <b>1 回 = 入門</b>、<b>5 回 = 習熟</b>、<b>20 回 = 達人</b> のマイルストーンを達成します。使うほど "あなた専属の AI" に進化していきます。'
    + '</div>';
  var total = d.total_uses || 0;
  var mastered = Array.isArray(d.skills_mastered) ? d.skills_mastered : [];
  var history = Array.isArray(d.history) ? d.history : [];

  // Stats strip
  var stats = '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px;font-size:12.5px">'
    + '<div style="background:#fff;border:1px solid var(--wire);border-radius:10px;padding:10px 14px;min-width:100px"><div style="font-size:20px;font-weight:900;color:var(--peach-dark)">'+total+'</div><div style="font-size:10px;color:var(--text3);font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-top:2px">総ツール使用</div></div>'
    + '<div style="background:#fff;border:1px solid var(--wire);border-radius:10px;padding:10px 14px;min-width:100px"><div style="font-size:20px;font-weight:900;color:#10b981">'+mastered.length+'</div><div style="font-size:10px;color:var(--text3);font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-top:2px">習得スキル</div></div>'
    + '<div style="background:#fff;border:1px solid var(--wire);border-radius:10px;padding:10px 14px;min-width:100px"><div style="font-size:20px;font-weight:900;color:#7c3aed">'+history.length+'</div><div style="font-size:10px;color:var(--text3);font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-top:2px">マイルストーン</div></div>'
    + '</div>';

  if(!total && !mastered.length){
    return hint + stats + '<div style="text-align:center;color:var(--text3);padding:32px 16px;font-size:13px;line-height:1.7">'
      + 'まだツールを使った形跡がありません。<br>このエージェントに何か依頼すると、自動でスキルが習得されていきます。<br><br>例: 「画像作って」「Web で調べて」「メール送って」<br>「ブログ書いて」「スケジュール組んで」</div>';
  }

  // Mastered skills section
  var skillsHTML = mastered.length
    ? '<div style="font-size:13px;font-weight:900;color:var(--text);margin-bottom:8px">🎓 習得済スキル</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-bottom:18px">'
      + mastered.map(function(s){
          var tierBg = s.tier === '達人' ? 'linear-gradient(135deg,#fff7ee,#fed7aa)' : s.tier === '習熟' ? '#ecfdf5' : '#fff';
          var tierColor = s.tier === '達人' ? '#7c2d12' : s.tier === '習熟' ? '#065f46' : 'var(--text2)';
          var tierEmoji = s.tier === '達人' ? '🌳' : s.tier === '習熟' ? '🌿' : '🌱';
          return '<div style="background:'+tierBg+';border:1px solid var(--wire2);border-radius:10px;padding:10px 12px">'
            + '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:16px">'+tierEmoji+'</span><div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:800;color:'+tierColor+'">'+esc(s.label)+'</div><div style="font-size:10px;color:var(--text3);margin-top:1px">'+esc(s.tier)+' · '+s.last_count+' 回使用</div></div></div>'
            + '</div>';
        }).join('')
      + '</div>'
    : '';

  // Milestone history timeline
  var histHTML = history.length
    ? '<div style="font-size:13px;font-weight:900;color:var(--text);margin-bottom:8px">📅 進化履歴</div>'
      + '<div style="display:flex;flex-direction:column;gap:6px">'
      + history.slice(0, 30).map(function(h){
          var d = h.date ? new Date(h.date) : null;
          var when = d ? (d.getMonth()+1)+'/'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0') : '';
          var tierEmoji = h.tier === '達人' ? '🌳' : h.tier === '習熟' ? '🌿' : '🌱';
          return '<div style="background:#fff;border:1px solid var(--wire2);border-radius:9px;padding:9px 13px;display:flex;align-items:center;gap:10px">'
            + '<span style="font-size:14px;flex-shrink:0">'+tierEmoji+'</span>'
            + '<div style="flex:1;min-width:0;font-size:12px"><b>'+esc(h.skill_label)+'</b> を '+esc(h.tier)+' (' + h.count + ' 回)</div>'
            + '<div style="font-size:10.5px;color:var(--text3);font-family:ui-monospace,monospace;flex-shrink:0">'+esc(when)+'</div>'
            + '</div>';
        }).join('')
      + '</div>'
    : '';

  return hint + stats + skillsHTML + histHTML;
}

// Proactive nudge handlers. The card lives at the top of the chat until
// the user takes it (sends it as a user message) or dismisses it.
async function _dismissNudge(agId, nudgeId){
  var ag = (agents||[]).find(function(a){return a.id===agId;});
  if(ag && Array.isArray(ag.proactive_nudges)){
    var n = ag.proactive_nudges.find(function(x){return x && x.id===nudgeId;});
    if(n) n.dismissed = true;
  }
  if(activeId === agId) renderMsgs(ag, false);
  try { await api('POST', '/api/agents/'+agId+'/nudges/'+nudgeId+'/dismiss', {}); } catch(e){}
}
async function _actOnNudge(agId, nudgeId){
  var ag = (agents||[]).find(function(a){return a.id===agId;});
  if(!ag) return;
  var n = (ag.proactive_nudges||[]).find(function(x){return x && x.id===nudgeId;});
  if(!n) return;
  // Mark acted locally so the card disappears, then inject the nudge text
  // into the composer and send it through the normal chat path.
  n.acted = true;
  try { api('POST', '/api/agents/'+agId+'/nudges/'+nudgeId+'/act', {}).catch(()=>{}); } catch(e){}
  if(activeId !== agId){
    await openAgent(agId);
  }
  var ci = document.getElementById('ci');
  if(ci){
    ci.value = n.text;
    // Trigger the send button if available, else dispatch Enter.
    if(typeof sendChat === 'function') sendChat();
    else { ci.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'})); }
  } else {
    renderMsgs(ag, false);
  }
}

// "全履歴を見る" — fetches the archived (folded) chat history for an agent
// and renders it in a full-screen overlay. The summary card stays in chat;
// the raw turns it was synthesized from live in agent.history_archive on
// the server and are only loaded on demand.
async function _openHistoryArchive(agId){
  try {
    var data = await api('GET', '/api/agents/'+agId+'/history_archive');
    var items = (data && data.items) || [];
    if(!items.length){ showToast(L('履歴アーカイブは空です','Archive is empty'),'ng'); return; }
    var ag = (agents||[]).find(function(a){return a.id===agId;});
    var agName = (ag && ag.name) || 'Agent';
    var body = items.map(function(m){
      var role = m.role === 'assistant' ? agName : (m.user_name || (isJa?'あなた':'You'));
      var roleColor = m.role === 'assistant' ? 'var(--peach-dark)' : 'var(--text2)';
      var body = '';
      if(typeof m.content === 'string') body = m.content;
      else if(Array.isArray(m.content)) body = m.content.filter(function(b){return b && b.type==='text';}).map(function(b){return b.text;}).join(' ');
      return '<div style="padding:10px 0;border-bottom:1px dashed var(--wire2)">'
        +    '<div style="font-size:11px;font-weight:800;color:'+roleColor+';margin-bottom:4px">'+esc(role)+(m.time?' · '+esc(m.time):'')+'</div>'
        +    '<div style="font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap">'+esc(body)+'</div>'
        +  '</div>';
    }).join('');
    var overlay = document.createElement('div');
    overlay.id = 'historyArchiveOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,12,.5);z-index:9998;display:flex;align-items:center;justify-content:center;padding:24px;font-family:inherit';
    overlay.innerHTML =
      '<div style="background:#fff;border-radius:16px;max-width:760px;width:100%;max-height:86vh;display:flex;flex-direction:column;box-shadow:0 24px 48px rgba(0,0,0,.18)">'
      +  '<div style="padding:14px 18px;border-bottom:1px solid var(--wire2);display:flex;align-items:center;gap:10px">'
      +    '<div style="font-size:14px;font-weight:800;color:var(--text)">📋 '+L('折りたたまれた会話履歴','Folded chat archive')+'</div>'
      +    '<div style="font-size:11px;color:var(--text3);font-weight:700">· '+items.length+L(' 件','')+'</div>'
      +    '<button onclick="document.getElementById(\'historyArchiveOverlay\').remove()" style="margin-left:auto;background:#fff;border:1px solid var(--wire2);border-radius:9px;padding:6px 12px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">'+L('閉じる','Close')+'</button>'
      +  '</div>'
      +  '<div style="padding:8px 22px;overflow-y:auto;flex:1">'+body+'</div>'
      + '</div>';
    overlay.addEventListener('click', function(e){ if(e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  } catch(e){
    showToast((e && e.message) || 'failed', 'ng');
  }
}

// Quick model switcher in the chat header. Pops a tiny menu so users can
// pick Fast / Smart / Best without diving into the full agent-edit panel.
// PATCHes the agent so the choice sticks across reloads.
function _toggleQuickModel(agId){
  var existing = document.getElementById('quickModelMenu');
  if(existing){ existing.remove(); return; }
  var ag = (agents||[]).find(function(a){return a.id===agId;});
  if(!ag) return;
  var current = ag.model || 'auto';
  var planAllows = function(m){
    var plan = (me && me.plan) || 'free';
    // 'auto' is always allowed — it auto-downgrades when the plan can't
    // afford the chosen model, so it's safe at every tier.
    if(m === 'auto') return true;
    if(plan === 'free') return m === 'haiku';
    if(plan === 'pro')  return m !== 'opus';
    return true;
  };
  var opts = [
    {v:'auto',   lbl:'✨ Auto',  sub:'クエリ毎に自動切替 (推奨)'},
    {v:'haiku',  lbl:'⚡ Fast',  sub:'Claude Haiku 4.5 · 高速'},
    {v:'sonnet', lbl:'🎯 Smart', sub:'Claude Sonnet 4.6 · 標準'},
    {v:'opus',   lbl:'🧠 Best',  sub:'Claude Opus 4.7 · 最高性能'},
  ];
  var menu = document.createElement('div');
  menu.id = 'quickModelMenu';
  menu.style.cssText = 'position:fixed;background:#fff;border:1px solid var(--wire2);border-radius:13px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px;min-width:220px;z-index:9999;font-family:inherit';
  menu.innerHTML = opts.map(function(o){
    var disabled = !planAllows(o.v);
    var sel = (current === o.v);
    var bg = sel ? 'rgba(251,146,60,.10)' : '#fff';
    var bd = sel ? '1px solid var(--peach)' : '1px solid transparent';
    return '<button onclick="event.stopPropagation(); _quickPickModel(\''+esc(agId)+'\',\''+o.v+'\')"'
      + (disabled ? ' disabled' : '')
      + ' style="display:block;width:100%;text-align:left;padding:8px 10px;border-radius:9px;background:'+bg+';border:'+bd+';cursor:'+(disabled?'not-allowed':'pointer')+';opacity:'+(disabled?'.45':'1')+';font-family:inherit;margin-bottom:2px">'
      + '<div style="font-size:12.5px;font-weight:800;color:var(--text)">'+o.lbl+(disabled?' 🔒':'')+'</div>'
      + '<div style="font-size:10px;color:var(--text3);margin-top:1px">'+esc(o.sub)+'</div>'
      + '</button>';
  }).join('');
  document.body.appendChild(menu);
  // Position next to the trigger pill
  try{
    var trigger = document.querySelector('.ct-model');
    if(trigger){
      var rect = trigger.getBoundingClientRect();
      menu.style.top  = (rect.bottom + 6) + 'px';
      menu.style.left = Math.max(8, rect.left) + 'px';
    } else {
      menu.style.top = '80px'; menu.style.left = '300px';
    }
  }catch(e){}
  // Click outside to close
  setTimeout(function(){
    var off = function(e){
      if(!menu.contains(e.target)){
        menu.remove();
        document.removeEventListener('click', off, true);
      }
    };
    document.addEventListener('click', off, true);
  }, 0);
}
async function _quickPickModel(agId, model){
  var menu = document.getElementById('quickModelMenu');
  if(menu) menu.remove();
  var ag = (agents||[]).find(function(a){return a.id===agId;});
  if(!ag) return;
  if(ag.model === model) return;
  var prev = ag.model;
  ag.model = model;
  try{
    if(activeId === ag.id && typeof openAgent === 'function') openAgent(ag.id);
    await api('PATCH', '/api/agents/'+agId, {model: model});
    showToast(L('モデル切替: ','Switched to ')+model, 'ok');
  }catch(e){
    ag.model = prev;
    showToast((e && e.message) || 'failed', 'ng');
  }
}

// Per-agent model picker (Gemini Flash / Sonnet / Gemini Pro / Opus / Haiku).
// `haiku` stays a valid value for backward compatibility with older agents,
// (Gemini was removed 2026-05 — legacy gemini-* values are accepted here
// for backward compat on old DB rows; the server transparently maps them
// to haiku/sonnet in _resolveModelInfo.)
function _setEditModel(name){
  const valid = ['auto','haiku','sonnet','opus','gemini-flash','gemini-pro'];
  if(!valid.includes(name)) name = 'auto';
  const inp = document.getElementById('editModel');
  if(inp) inp.value = name;
  // The simplified panel uses .ea-mpill pills styled via CSS .on class.
  // Toggle the class so the peach background lights up the selected pill.
  document.querySelectorAll('#editModelGroup .model-pick').forEach(b => {
    const sel = b.dataset.model === name;
    b.classList.toggle('on', sel);
    // Clear any legacy inline styles from the old grid layout.
    b.style.borderColor = ''; b.style.background = '';
  });
}

// Update the "ツール連携" accordion count badge (e.g. "2 有効 / 3").
// Called after openEditAgent and after each toggle.
function _updateEditToolsCnt(){
  try {
    const el = document.getElementById('editToolsCnt');
    if(!el) return;
    let on = 0;
    if(document.getElementById('editChromeSw')?.classList.contains('on')) on++;
    if(document.getElementById('editExtSw')?.classList.contains('on'))    on++;
    if(document.getElementById('editSheetsSw')?.classList.contains('on')) on++;
    if(document.getElementById('editGitHubSw')?.classList.contains('on')) on++;
    el.textContent = on ? on + ' 有効' : '未設定';
  } catch(e){}
}
function _updateEditKbCnt(){
  try {
    const el = document.getElementById('editKbCnt');
    const list = document.getElementById('editKbList');
    if(!el || !list) return;
    const n = list.querySelectorAll('[data-kb-doc]').length || list.children.length;
    el.textContent = n > 0 ? n + ' 件' : '未登録';
  } catch(e){}
}

async function saveEditAgent(){
  const id = window._editAgentId;
  const ag = agents.find(a=>a.id===id);
  if(!ag) return;
  const newName = document.getElementById('editName').value.trim();
  const purpose = document.getElementById('editPurpose').value.trim();
  const duties = document.getElementById('editDuties').value.trim();
  const newPersona = _composePersona(purpose,duties);
  var sw=document.getElementById('editChromeSw');
  var chromeEnabled = !!(sw && sw.classList.contains('on'));
  var swSheets=document.getElementById('editSheetsSw');
  var sheetsEnabled = !!(swSheets && swSheets.classList.contains('on') && me && me.google_sheets_connected);
  var swExt=document.getElementById('editExtSw');
  var extensionEnabled = !!(swExt && swExt.classList.contains('on') && me && me.extension_paired);
  var swGitHub = document.getElementById('editGitHubSw');
  var githubEnabled = !!(swGitHub && swGitHub.classList.contains('on') && me && me.github_connected);
  var modelSel = document.getElementById('editModel');
  var model = (modelSel && modelSel.value) || 'haiku';
  if(!newName){ showToast(L('名前を入力してください','Please enter a name'),'ng'); return; }
  try{
    const r = await api('PATCH', '/api/agents/'+id, {name:newName, persona:newPersona, chrome_enabled:chromeEnabled, sheets_enabled:sheetsEnabled, extension_enabled:extensionEnabled, github_enabled:githubEnabled, model});
    ag.name = newName;
    ag.persona = newPersona;
    ag.chrome_enabled = chromeEnabled;
    ag.sheets_enabled = sheetsEnabled;
    ag.extension_enabled = extensionEnabled;
    ag.github_enabled = githubEnabled;
    ag.model = model;
    closeEditAgent();
    renderAgList();
    // Re-open the active chat so name/avatar/icon changes show immediately
    if(activeId === ag.id && typeof openAgent === 'function') openAgent(ag.id);
    showToast(L('保存しました','Saved'),'ok');
  }catch(e){
    var msg = (e && e.message) ? e.message : '保存に失敗しました';
    console.error('[saveEditAgent] failed:', e);
    showToast(msg.slice(0, 200), 'ng');
  }
}

async function deleteAgent(){
  const id = window._editAgentId;
  const ag = agents.find(a=>a.id===id);
  if(!ag) return;
  if(!confirm(L('"'+ag.name+'" を削除しますか？\n\n会話履歴もすべて削除されます。',
                'Delete "'+ag.name+'"?\n\nAll chat history will also be deleted.'))) return;
  try{
    await api('DELETE', '/api/agents/'+id);
    agents = agents.filter(a=>a.id!==id);
    closeEditAgent();
    activeId = null;
    if(agents.length > 0){
      openAgent(agents[0].id);
    } else {
      document.getElementById('emptyWrap').style.display='';
      document.getElementById('chatWrap').style.display='none';
    }
    renderAgList();
    showToast(L('削除しました','Deleted'),'ok');
  }catch(e){
    showToast(L('削除に失敗しました','Delete failed'),'ng');
  }
}


function buildAvGrid(){
  document.getElementById('avGrid').innerHTML=AVATARS.map((e,i)=>
    `<button class="av-cell${i===0?' sel':''}" onclick="pickAv(this,'${e}')">${e}</button>`
  ).join('');
}
function pickAv(btn,e){
  document.querySelectorAll('.av-cell').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel'); NA.avatar=e;
  var p=document.getElementById('avPrev'); if(p) p.innerHTML=_avHTML(e);
}

function buildSkGrid(){
  document.getElementById('skGrid').innerHTML=SKILLS.map(s=>`
    <button class="sk-card" onclick="togSk(this,'${s.id}')">
      <div class="sk-ic">${s.icon}</div>
      <div class="sk-nm">${s.name}</div>
      <div class="sk-ds">${s.desc}</div>
    </button>`).join('');
}
function togSk(btn,id){
  btn.classList.toggle('sel');
  const i=NA.skills.indexOf(id);
  if(i>=0)NA.skills.splice(i,1); else NA.skills.push(id);
}

function wStep(n){
  // Validate before entering step n (i.e. validate the previous step's data)
  if(n===3){
    NA.name=document.getElementById('wName').value.trim();
    if(!NA.name){showToast(L('名前を入力してください','Please enter a name'),'ng');return;}
  }
  if(n===4){
    if(!NA.skills.length){showToast(L('スキルを選んでください','Please pick at least one skill'),'ng');return;}
  }
  if(n===5){
    NA.purpose=document.getElementById('wPurpose').value.trim();
    if(!NA.purpose){showToast(L('採用目的を入力してください','Please enter the agent\'s purpose'),'ng');return;}
  }
  if(n===6){
    if(_wizardMode==='new'){
      NA.duties=document.getElementById('wDuties').value.trim();
      if(!NA.duties){showToast(L('業務内容を入力してください','Please describe the duties'),'ng');return;}
      NA.persona='採用目的: '+(NA.purpose||'')+'\n業務内容: '+(NA.duties||'');
    }
    buildConf();
  }
  document.querySelectorAll('#wizOverlay [id^="ws"]').forEach(s=>s.style.display='none');
  document.getElementById('ws'+n).style.display='block';
  // progress: 5 entry steps + confirm. ws0 is preset picker (no progress).
  var pct = n===0 ? 0 : (n>=6 ? 100 : (n/5*100));
  document.getElementById('wizFill').style.width=pct+'%';
  document.getElementById('wizTitle').textContent=['テンプレート','アイコン','名前','スキル','採用目的','業務内容','確認'][n];
}

function buildConf(){
  const sns=NA.skills.map(s=>SKILLS.find(x=>x.id===s)?.name||s);
  var pills=sns.map(n=>`<span class="pill">${n}</span>`).join('');
  if(NA.chrome_enabled) pills += '<span class="pill" style="background:rgba(59,130,246,.12);color:#2563eb;border-color:rgba(59,130,246,.3)">🌐 Web 検索 / URL 取得</span>';
  document.getElementById('confHero').innerHTML=`
    <div class="conf-ic">${_avHTML(NA.avatar)}</div>
    <div><div class="conf-nm">${esc(NA.name)}</div>
    <div class="conf-pills">${pills}</div></div>`;
  let perHtml='';
  if(_wizardMode==='new' && (NA.purpose||NA.duties)){
    perHtml='<div class="conf-per">'
      +'<div style="font-weight:700;color:var(--peach-dark);font-size:11px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px">採用目的</div>'
      +esc(NA.purpose||'')
      +'<div style="font-weight:700;color:var(--peach-dark);font-size:11px;letter-spacing:.06em;text-transform:uppercase;margin:12px 0 4px">業務内容</div>'
      +esc(NA.duties||'').replace(/\n/g,'<br>')
      +'</div>';
  } else if(NA.persona){
    perHtml='<div class="conf-per">'+esc(NA.persona).replace(/\n/g,'<br>')+'</div>';
  }
  document.getElementById('confPer').innerHTML=perHtml;
}

async function doCreate(){
  setBtnLoad('createBtn',true,'作成中...');
  try{
    const r=await api('POST','/api/agents',{avatar:NA.avatar,name:NA.name,skills:NA.skills,persona:NA.persona,chrome_enabled:!!NA.chrome_enabled,sheets_enabled:!!NA.sheets_enabled});
    agents.push(r.agent); activeId=r.agent.id;
    renderAgList();
    closeWizard();
    openAgent(r.agent.id);
    showToast(`${NA.name}を作成しました！`,'ok');
  }catch(e){
    if(e && e.upgrade_required){ closeWizard(); _showUpgradeToast(e); }
    else { showToast(e.message,'ng'); }
  }
  setBtnLoad('createBtn',false,'✨ 作成する');
}

/* ── Billing modal (new design) ────────────────────────
   Two screens: Step 1 plan selection (monthly/payg tabs) → Step 2 monthly checkout.
   PAYG checkout is inline within its tab.                                */
var _bsStripe=null, _bsElements=null;
var _bsMonthlyCard=null, _bsPaygCard=null;
var _bsSelectedPlan=null;
var _bsPaygCents=699;
var _bsTabActive='monthly';

function openCharge(){
  _bsTabActive='monthly';
  _bsSelectedPlan=null;
  _bsPaygCents=699;
  bsBack();
  bsTab('monthly');
  bsRenderCurplan();
  // Initialize PAYG button label too (also highlights default card)
  bsPickPayg(699);
  document.getElementById('chargeOverlay').classList.add('open');
}
function closeCharge(){ document.getElementById('chargeOverlay').classList.remove('open'); }

function bsTab(tab){
  _bsTabActive=tab;
  document.querySelectorAll('.bs-tab').forEach(function(t){
    t.classList.toggle('active', t.getAttribute('data-tab')===tab);
  });
  document.getElementById('bs-monthly').style.display = tab==='monthly' ? '' : 'none';
  document.getElementById('bs-payg').style.display = tab==='payg' ? '' : 'none';
  if(tab==='payg'){ bsRenderCurBal(); bsInitPaygCard(); }
  else { bsRenderCurplan(); }
}

function bsBack(){
  document.getElementById('bsScreen1').style.display='';
  document.getElementById('bsScreen2').style.display='none';
}

function bsPick(plan){
  if(me && me.plan===plan){
    showToast(plan==='pro'?'すでに Pro プランに加入中です':'すでに Business プランに加入中です','ng');
    return;
  }
  _bsSelectedPlan=plan;
  bsRenderSummary(plan);
  document.getElementById('bsScreen1').style.display='none';
  document.getElementById('bsScreen2').style.display='';
  bsInitMonthlyCard();
}

function bsPickPayg(cents){
  _bsPaygCents=cents;
  bsHighlightPaygCard(cents);
  var btn=document.getElementById('bsPaygGo');
  if(btn) btn.textContent=_fmtT(T.bsBuyFmt,{p:'$'+(cents/100).toFixed(2)});
}
function bsHighlightPaygCard(cents){
  document.querySelectorAll('.bs-payg-c').forEach(function(c){
    c.classList.toggle('sel', parseInt(c.getAttribute('data-cents'),10)===cents);
  });
}

function bsRenderCurplan(){
  var el=document.getElementById('bs-curplan');
  if(!el) return;
  var plan=(me&&me.plan)||'free';
  var planName = plan==='pro' ? 'Pro' : plan==='business' ? 'Business' : 'Free';
  var badge = plan==='free'  ? T.bsFreeNote :
              plan==='pro'   ? T.bsProNote :
                               T.bsBizNote;
  el.innerHTML =
    '<div><div class="bs-cur-lbl">'+T.bsCurPlan+'</div>'+
    '<div class="bs-cur-val">'+planName+'</div></div>'+
    '<div class="bs-cur-badge">'+badge+'</div>';
  document.querySelectorAll('.bs-pc').forEach(function(c){
    var p=c.getAttribute('data-plan');
    var isCur=p===plan;
    c.classList.toggle('current', isCur);
    var pick=c.querySelector('.bs-pc-pick');
    if(pick) pick.textContent = isCur ? T.bsActive : T.bsPickPlan;
  });
}

function bsRenderCurBal(){
  var el=document.getElementById('bs-curbal');
  if(!el) return;
  var bal = me ? (me.balance_jpy||0) : 0;
  el.innerHTML =
    '<div><div class="bs-cur-lbl">'+T.bsCurBal+'</div>'+
    '<div class="bs-cur-val">'+jpyAsUsd(bal)+'</div></div>'+
    '<div class="bs-cur-badge">'+T.bsAddNote+'</div>';
}

function bsRenderSummary(plan){
  var el=document.getElementById('bs-summary');
  if(!el) return;
  var price = plan==='pro' ? '$12.99' : '$32.99';
  var credit = plan==='pro' ? '$20' : '$60';
  var perMonth = isJa ? '/月' : '/mo';
  var planLabel = plan.toUpperCase() + (isJa ? ' プラン' : ' plan');
  var feat = isJa ? '毎月 <b>'+credit+'</b> 分のクレジットを付与'
                  : 'Get <b>'+credit+'</b> in credits each month';
  var ed   = isJa ? 'いつでもキャンセル可能' : 'Cancel anytime';
  el.innerHTML =
    '<div class="bs-sum-nm">'+planLabel+'</div>'+
    '<div class="bs-sum-pr">'+price+'<small>'+perMonth+'</small></div>'+
    '<div class="bs-sum-feat">'+feat+'</div>'+
    '<div class="bs-sum-ed">'+ed+'</div>';
  var btn=document.getElementById('bsMonthlyGo');
  if(btn) btn.textContent=_fmtT(T.bsStartFmt,{p:price});
}

async function bsInitStripe(){
  if(_bsStripe&&_bsElements) return true;
  try{
    // Get publishable key from public config endpoint (no auth, no side effects)
    var cfg = await fetch(API+'/api/config').then(r=>r.json()).catch(()=>null);
    var pk = cfg && cfg.stripe_publishable_key;
    if(!pk || !pk.startsWith('pk_')){
      console.warn('Stripe publishable key not configured');
      return false;
    }
    if(typeof Stripe !== 'function'){
      console.warn('Stripe.js not loaded');
      return false;
    }
    _bsStripe=Stripe(pk);
    _bsElements=_bsStripe.elements();
  }catch(e){ console.log('bsInitStripe error:',e&&e.message); }
  return !!(_bsStripe&&_bsElements);
}

var _bsCardStyle={base:{fontSize:'15px',color:'#2d1a0e',fontFamily:'inherit','::placeholder':{color:'#9a6a4a'}},invalid:{color:'#ef4444'}};

function _bsMountCard(card, sel){
  // Defer mount until after a layout pass — otherwise Stripe's iframe can
  // be injected into a still-collapsing parent and end up unclickable.
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ card.mount(sel); }); });
}
async function bsInitMonthlyCard(){
  if(!(await bsInitStripe())){
    showToast(isJa?'決済システムが利用できません（Stripe 未設定）':'Payment unavailable (Stripe not configured)','ng');
    return;
  }
  if(!_bsMonthlyCard){
    _bsMonthlyCard=_bsElements.create('card',{style:_bsCardStyle});
    _bsMountCard(_bsMonthlyCard,'#bs-monthly-card');
    _bsMonthlyCard.on('change',function(e){
      document.getElementById('bs-monthly-err').textContent=e.error?e.error.message:'';
    });
  }
}
async function bsInitPaygCard(){
  if(!(await bsInitStripe())){
    showToast(isJa?'決済システムが利用できません（Stripe 未設定）':'Payment unavailable (Stripe not configured)','ng');
    return;
  }
  if(!_bsPaygCard){
    _bsPaygCard=_bsElements.create('card',{style:_bsCardStyle});
    _bsMountCard(_bsPaygCard,'#bs-payg-card');
    _bsPaygCard.on('change',function(e){
      document.getElementById('bs-payg-err').textContent=e.error?e.error.message:'';
    });
  }
}

function bsAfterSubscribeSuccess(plan){
  if(me) me.plan=plan;
  showToast(plan==='pro'?'Pro plan activated!':'Business plan activated!','ok');
  closeCharge();
  if(typeof updateBillingUI==='function') updateBillingUI();
  if(typeof updatePlanBadge==='function') updatePlanBadge();
  if(typeof refreshMe==='function'){ refreshMe(); setTimeout(refreshMe,2500); }
}

async function bsSubscribeSubmit(){
  var plan=_bsSelectedPlan;
  if(!plan){ showToast(L('プランを選択してください','Please select a plan'),'ng'); return; }
  if(!(await bsInitStripe()) || !_bsMonthlyCard){
    showToast(L('カード情報を入力してください','Please enter your card details'),'ng'); return;
  }
  var price = plan==='pro' ? '$12.99' : '$32.99';
  var label = _fmtT(T.bsStartFmt,{p:price});
  setBtnLoad('bsMonthlyGo',true,isJa?'処理中...':'Processing...');
  var errEl = document.getElementById('bs-monthly-err');
  if(errEl) errEl.textContent = '';
  try{
    // ── Step 1: SetupIntent でカードを保存 ──
    var siRes = await api('POST','/api/billing/setup-intent',{});
    if(!siRes || !siRes.client_secret){
      throw new Error('SetupIntent の作成に失敗しました');
    }
    var setupResult = await _bsStripe.confirmCardSetup(siRes.client_secret,{
      payment_method:{card:_bsMonthlyCard}
    });
    if(setupResult.error){
      if(errEl) errEl.textContent = setupResult.error.message;
      showToast(setupResult.error.message,'ng');
      setBtnLoad('bsMonthlyGo',false,label); return;
    }
    var pmId = setupResult.setupIntent && setupResult.setupIntent.payment_method;
    if(!pmId){ throw new Error('カード情報の保存に失敗しました'); }

    // ── Step 2: PaymentMethod を紐付けて Subscription 作成 ──
    var r = await api('POST','/api/billing/subscribe',{plan:plan, payment_method_id: pmId});
    if(r.status==='active' || r.status==='trialing'){
      bsAfterSubscribeSuccess(plan); return;
    }
    // 3DS / 追加認証が必要な場合
    if(r.client_secret){
      var pay = await _bsStripe.confirmCardPayment(r.client_secret);
      if(pay.error){
        if(errEl) errEl.textContent = pay.error.message;
        showToast(pay.error.message,'ng');
      } else {
        bsAfterSubscribeSuccess(plan); return;
      }
    } else if(r.status === 'incomplete'){
      var msg = 'サブスクリプション作成に失敗しました (status: incomplete)';
      if(errEl) errEl.textContent = msg;
      showToast(msg,'ng');
    } else {
      var msg2 = '不明な状態: ' + (r.status||'no status');
      if(errEl) errEl.textContent = msg2;
      showToast(msg2,'ng');
    }
  }catch(e){
    console.warn('[bsSubscribeSubmit]', e);
    if(errEl) errEl.textContent = e.message||'エラー';
    showToast(e.message||'エラーが発生しました','ng');
  }
  setBtnLoad('bsMonthlyGo',false,label);
}

async function bsPaygSubmit(){
  var cents=_bsPaygCents;
  if(!cents||cents<100){ showToast(L('金額を選択してください','Please pick an amount'),'ng'); return; }
  if(!(await bsInitStripe()) || !_bsPaygCard){
    showToast(L('カード情報を入力してください','Please enter your card details'),'ng'); return;
  }
  var label=_fmtT(T.bsBuyFmt,{p:'$'+(cents/100).toFixed(2)});
  setBtnLoad('bsPaygGo',true,isJa?'処理中...':'Processing...');
  try{
    var r=await api('POST','/api/billing/charge',{amount_jpy:cents});
    if(!r.client_secret){
      console.warn('charge response without client_secret:', r);
      showToast(r.demo ? 'デモモードのため Stripe 決済はスキップされました' : '決済の初期化に失敗しました（Stripe 未設定の可能性）','ng');
      setBtnLoad('bsPaygGo',false,label); return;
    }
    var result=await _bsStripe.confirmCardPayment(r.client_secret,{
      payment_method:{card:_bsPaygCard}
    });
    if(result.error){
      document.getElementById('bs-payg-err').textContent=result.error.message;
      showToast(result.error.message,'ng');
    } else if(result.paymentIntent && result.paymentIntent.status==='succeeded'){
      showToast(L('決済完了！クレジットに反映されます','Payment complete! Credits will be applied.'),'ok');
      closeCharge();
      if(typeof refreshMe==='function'){ refreshMe(); setTimeout(refreshMe,2500); }
      setBtnLoad('bsPaygGo',false,label); return;
    }
  }catch(e){
    showToast(e.message||'エラーが発生しました','ng');
  }
  setBtnLoad('bsPaygGo',false,label);
}

// Backward-compat shims (no-op for legacy markup that was removed)
function selCharge(){}
function doCharge(){}

function fmtCard(el){let v=el.value.replace(/\D/g,'').slice(0,16);el.value=v.replace(/(.{4})/g,'$1 ').trim();}
function fmtExp(el){let v=el.value.replace(/\D/g,'').slice(0,4);if(v.length>2)v=v.slice(0,2)+' / '+v.slice(2);el.value=v;}

/* ── Logout ────────────────────────────────────────── */
function doLogout(){
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href='auth.html';
}

/* ── Utils ─────────────────────────────────────────── */
function esc(t){
  // Escapes &, <, >, ", ' so the value is safe for both text content AND
  // double/single-quoted HTML attributes (e.g. title="...", onclick="fn('...')")
  return String(t==null?'':t)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function fmt(t){return esc(t).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');}
function now(){return new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});}
function exTA(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';}
// IME (input-method) composition tracking. The Enter that confirms IME
// conversion can fire a stray keydown with isComposing=false on some browsers
// (Safari, older Chrome), so we also track compositionstart/end and add a
// short grace window after the IME closes.
var _imeActive=false, _imeEndAt=0;
function _imeStart(){ _imeActive=true; }
function _imeEnd(){ _imeActive=false; _imeEndAt=Date.now(); }
function taKey(e){
  // Active IME — skip
  if(e.isComposing || e.keyCode===229 || _imeActive) return;
  // Just-confirmed IME — skip Enter for a short grace period
  if((Date.now()-_imeEndAt) < 200) return;
  if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMsg(); }
}

/* ── @mention picker (Slack-style) ─────────────────────────── */
var _mentionState = { open:false, start:-1, query:'', items:[], sel:0, which:'main' };

function _mentionMembers(){
  // Returns [{key, name, label, isAI}] for the active group's members + AI.
  var ag = agents.find(function(a){return a.id===activeId;});
  if(!ag || !ag.is_group) return [];
  var humans = (ag.members || []).map(function(m){
    var name = m.name || (m.email||'').split('@')[0] || 'member';
    return {
      key: name.replace(/\s+/g,''),     // mention token (no spaces)
      name: name,
      email: m.email || '',
      isAI: false,
      isMe: m.user_id === me?.id,
    };
  });
  // Team groups: surface every cloned AI member so the user can pick one
  // by name (e.g. @SocialManager). Falls back to @AI which routes via
  // the team-default member picker on the server.
  var teamAIs = [];
  if(ag.is_team && Array.isArray(ag.team_member_agent_ids)){
    teamAIs = ag.team_member_agent_ids
      .map(function(id){ return (agents||[]).find(function(a){return a.id===id;}); })
      .filter(Boolean)
      .map(function(a){
        var nm = a.name || 'AI';
        // Skill labels for the role hint (e.g. "Marketing · ライティング")
        var skLabels = (a.skills||[]).map(function(s){var sk=SKILLS && SKILLS.find(function(x){return x.id===s;});return sk?sk.name:s;}).slice(0,2).join(' · ');
        return {
          key: nm.replace(/\s+/g,''),
          name: nm,
          avatar: a.avatar || '🤖',
          email: '',
          isAI: true,
          isTeamAI: true,
          isMe: false,
          skillsLabel: skLabels,
        };
      });
  }
  // Always include @AI as the first option, then team AIs (if any), then humans.
  // Add @all on team chats — triggers Huddle (everyone speaks).
  var head = [{ key:'AI', name:'AI', email:'', isAI:true, isMe:false }];
  if(ag.is_team && teamAIs.length >= 2){
    head.push({ key:'all', name:'all', email:'', isAI:true, isMe:false, isAll:true, skillsLabel: L('チーム全員で議論 (Huddle)','Discuss with the whole team (Huddle)') });
  }
  return head.concat(teamAIs).concat(humans);
}

function _mentionFindStart(text, cursor){
  // Walks back from cursor to find the start of the current @mention.
  // Returns -1 if no active @mention.
  for(var i=cursor-1; i>=0; i--){
    var c = text[i];
    if(c==='@'){
      // Check the char before @ — must be start-of-input or whitespace
      if(i===0 || /\s/.test(text[i-1])) return i;
      return -1;
    }
    if(/\s/.test(c)) return -1;
  }
  return -1;
}

function _mentionRender(){
  var which = _mentionState.which || 'main';
  var picker = document.getElementById(which==='thread' ? 'tMentionPicker' : 'mentionPicker');
  // Hide the other composer's picker so a stale one never lingers when the
  // user moves between the main composer and an open thread.
  var other = document.getElementById(which==='thread' ? 'mentionPicker' : 'tMentionPicker');
  if(other){ other.style.display='none'; other.innerHTML=''; }
  if(!picker) return;
  if(!_mentionState.open || _mentionState.items.length === 0){
    picker.style.display='none'; picker.innerHTML=''; _mentionState.open=false; return;
  }
  var html = '<div class="mention-picker-head">'+L('メンバーをメンション','Mention someone')+'</div>';
  _mentionState.items.forEach(function(it, i){
    var initial = (it.name || '?').charAt(0).toUpperCase();
    var av;
    if(it.isAll){
      av = '<div class="mr-av" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#fff;font-size:13px">🤝</div>';
    } else if(it.isTeamAI){
      av = '<div class="mr-av" style="background:linear-gradient(135deg,#fff7ee,#fed7aa);font-size:14px">'+esc(it.avatar||'🤖')+'</div>';
    } else if(it.isAI){
      av = '<div class="mr-av">🤖</div>';
    } else {
      av = '<div class="mr-av" style="background:'+_userColor(it.email||it.name)+'">'+esc(initial)+'</div>';
    }
    var tag = '';
    if(it.isAll){
      tag = '<span class="mr-tag" style="background:rgba(251,191,36,.18);color:#92400e">'+L('全員に振る','To everyone')+'</span>';
    } else if(it.isTeamAI){
      tag = '<span class="mr-tag">'+L('チームの AI','Team AI')+'</span>';
    } else if(it.isAI){
      tag = '<span class="mr-tag">'+L('AI を呼ぶ','Call the AI')+'</span>';
    }
    var skillLine = it.skillsLabel ? '<div class="mr-skills" style="font-size:10px;color:var(--text3);margin-top:1px">'+esc(it.skillsLabel)+'</div>' : '';
    html += '<div class="mention-row '+(it.isAI?'is-ai ':'')+(i===_mentionState.sel?'sel':'')+'" '
         +  'data-idx="'+i+'" onmousedown="event.preventDefault();_mentionPick('+i+')">'
         +  av
         +  '<div style="flex:1;min-width:0">'
         +    '<span class="mr-name">'+esc(it.name)+(it.isMe?' <span class="mr-tag">'+L('(あなた)','(you)')+'</span>':'')+'</span>'
         +    skillLine
         +  '</div>'
         +  tag
         +  '</div>';
  });
  picker.innerHTML = html;
  picker.style.display='';
}

function _mentionOnInput(ta, which){
  _mentionState.which = which || 'main';
  var cursor = ta.selectionStart;
  var text = ta.value;
  var start = _mentionFindStart(text, cursor);
  if(start === -1){ _mentionState.open=false; _mentionRender(); return; }
  var query = text.slice(start+1, cursor).toLowerCase();
  var members = _mentionMembers();
  var items = members.filter(function(m){
    if(!query) return true;
    return m.key.toLowerCase().indexOf(query) === 0 || m.name.toLowerCase().indexOf(query) !== -1;
  }).slice(0, 8);
  _mentionState.open = items.length > 0;
  _mentionState.start = start;
  _mentionState.query = query;
  _mentionState.items = items;
  if(_mentionState.sel >= items.length) _mentionState.sel = 0;
  _mentionRender();
}

function _mentionOnKeydown(e, which){
  if(!_mentionState.open) return false;
  if((which || 'main') !== (_mentionState.which || 'main')) return false;
  if(e.key === 'ArrowDown'){
    e.preventDefault();
    _mentionState.sel = (_mentionState.sel + 1) % _mentionState.items.length;
    _mentionRender(); return true;
  }
  if(e.key === 'ArrowUp'){
    e.preventDefault();
    _mentionState.sel = (_mentionState.sel - 1 + _mentionState.items.length) % _mentionState.items.length;
    _mentionRender(); return true;
  }
  if(e.key === 'Enter' || e.key === 'Tab'){
    e.preventDefault();
    _mentionPick(_mentionState.sel);
    return true;
  }
  if(e.key === 'Escape'){
    _mentionState.open = false; _mentionRender(); return true;
  }
  return false;
}

function _mentionPick(idx){
  var ta = document.getElementById(_mentionState.which==='thread' ? 'tci' : 'ci');
  if(!ta || !_mentionState.items[idx]) return;
  var it = _mentionState.items[idx];
  // Picking @all flips Huddle ON for the next send so everyone speaks in turn.
  if(it.isAll){
    window._huddleOn = window._huddleOn || {};
    if(activeId){
      window._huddleOn[activeId] = true;
      var _ag = (agents||[]).find(function(a){return a.id===activeId;});
      if(_ag) _updateChromeTool(_ag);
    }
    showToast(L('🤝 Huddle ON · 送信するとチーム全員が発言します','🤝 Huddle ON · the whole team will respond when you send'),'ok');
  }
  var start = _mentionState.start;
  var cursor = ta.selectionStart;
  var before = ta.value.slice(0, start);
  var after = ta.value.slice(cursor);
  var insert = '@' + it.key + ' ';
  ta.value = before + insert + after;
  var newPos = (before + insert).length;
  ta.setSelectionRange(newPos, newPos);
  _mentionState.open = false;
  _mentionRender();
  ta.focus();
  exTA(ta);
}
// Global ⌘+K / Ctrl+K → start new chat
document.addEventListener('keydown', function(e){
  if((e.metaKey||e.ctrlKey) && (e.key==='k'||e.key==='K')){
    e.preventDefault();
    if(typeof newChat==='function' && activeId) newChat();
  }
});
function setBtnLoad(id,on,txt){const b=document.getElementById(id);b.disabled=on;if(txt)b.textContent=txt;}
var toastT;

/* ── Settings ──────────────────────────────────────────── */
/* ── Account preferences (client-side localStorage) ─────────────── */
function _prefGet(key, fallback){ try{ var v=localStorage.getItem('pref_'+key); return v===null?fallback:v; }catch(e){ return fallback; } }
function _prefSet(key, val){ try{ localStorage.setItem('pref_'+key, val); }catch(e){} }
function _prefBool(key, def){ var v=_prefGet(key,null); return v===null?!!def:(v==='1'||v==='true'); }

function _avatarColor(seed){
  // Deterministic color from email/userId, picked to fit the cream palette
  var palette=['linear-gradient(135deg,#fb923c,#ea580c)','linear-gradient(135deg,#10b981,#059669)','linear-gradient(135deg,#3b82f6,#2563eb)','linear-gradient(135deg,#8b5cf6,#7c3aed)','linear-gradient(135deg,#ec4899,#db2777)','linear-gradient(135deg,#f59e0b,#d97706)'];
  var s=String(seed||''); var n=0; for(var i=0;i<s.length;i++) n=(n+s.charCodeAt(i))%palette.length;
  return palette[n];
}
function _avatarLetter(name,email){ return ((name||email||'?').trim().charAt(0)||'?').toUpperCase(); }

function openSettings(){
  const modal = document.getElementById('settingsModal');
  modal.classList.remove('gone');
  // Reset to first tab on each open
  document.querySelectorAll('.snav-item').forEach(b=>b.classList.remove('active'));
  var firstNav=document.querySelector('.snav-item[data-tab="account"]');
  if(firstNav) firstNav.classList.add('active');
  document.querySelectorAll('.snav-pane').forEach(p=>{p.style.display = p.id==='s-account' ? '' : 'none';});
  // Highlight current UI scale (defaults to 90%).
  try {
    var saved = parseFloat(localStorage.getItem('ui_scale') || '0.9');
    window._markUiScale(Math.round(saved * 100));
  } catch(e){}
  // Sync the mention-email toggle from server state.
  try {
    var sw = document.getElementById('mentionEmailSw');
    if(sw){
      var on = (me && me.mention_email_pref !== 'off'); // default ON
      sw.classList.toggle('on', on);
    }
  } catch(e){}

  if(me){
    const av = document.getElementById('sAv');
    if(av){ av.textContent=_avatarLetter(me.name,me.email); av.style.background=_avatarColor(me.email||me.id); }
    const emailEl = document.getElementById('sEmail');
    if(emailEl) emailEl.textContent = me.email||'';
    const joinedEl = document.getElementById('sJoined');
    if(joinedEl){
      var since='';
      if(me.created_at){ try{ var d=new Date(me.created_at); since=d.toLocaleDateString(isJa?'ja-JP':'en-US',{year:'numeric',month:'long'}); }catch(e){} }
      joinedEl.textContent = (since? (isJa?since+' よりメンバー':'Member since '+since)+' ・ ' : '') + 'ID: '+(me.id||'').slice(0,8)+'…';
    }
    const nameEl = document.getElementById('sName');
    if(nameEl) nameEl.value = me.name||'';
    const handleEl = document.getElementById('sHandle');
    if(handleEl) handleEl.value = me.handle||'';
    // Founder 100 share row visibility
    const fshare = document.getElementById('sFounderShare');
    const fseat = document.getElementById('sFounderSeatTxt');
    if(fshare){
      if(me.is_founder){
        fshare.style.display = 'block';
        if(fseat) fseat.textContent = me.founder_seat_no ? ('Founder #'+me.founder_seat_no) : 'Founder';
      } else {
        fshare.style.display = 'none';
      }
    }
    const handleStatus = document.getElementById('sHandleStatus');
    if(handleStatus){
      handleStatus.innerHTML = me.handle
        ? '<span style="color:#16a34a">✓ Public URL: <a href="/u/'+esc(me.handle)+'" target="_blank" style="color:#16a34a;font-weight:700">'+location.origin+'/u/'+esc(me.handle)+'</a></span>'
        : '3-30 文字の a-z, 0-9, _ のみ。公開プロフィールページを使うために設定。';
    }
    const bioEl = document.getElementById('sBio');
    if(bioEl) bioEl.value = _prefGet('bio','');
    const roleEl = document.getElementById('sRole');
    if(roleEl) roleEl.value = _prefGet('role','');
    const tzEl = document.getElementById('sTz');
    if(tzEl) tzEl.value = _prefGet('tz','auto');
    const langEl = document.getElementById('sLang');
    if(langEl) langEl.value = _prefGet('lang','auto');
  }
  // Render account list and notification toggles and theme/behavior
  renderAccountList();
  initNotifToggles();
  initBehaviorToggles();
  initThemePicker();
  renderLinkedAccounts();
  renderSessionInfo();
}

function updateBillingUI(){
  // Refresh the in-modal current-plan / current-balance banners if the modal is open
  if(typeof bsRenderCurplan==='function') bsRenderCurplan();
  if(typeof bsRenderCurBal==='function') bsRenderCurBal();
}
async function refreshMe(){
  try{
    var r = await api('GET','/api/me');
    if(r&&r.user){
      me = r.user;
      if(typeof updateBillingUI==='function') updateBillingUI();
      if(typeof updatePlanBadge==='function') updatePlanBadge();
      if(typeof updateBalance==='function') updateBalance();
    }
  }catch(e){}
}
// Backward-compat: older callers can still invoke subscribePlan(plan); routes to new bsPick.
function subscribePlan(plan){ if(typeof bsPick==='function') bsPick(plan); }
function closeSettings(){
  document.getElementById('settingsModal').classList.add('gone');
}
function switchStab(btn, tabId){
  // Support both the new side-nav (.snav-item) and any leftover .stab-btn
  document.querySelectorAll('.snav-item, .stab-btn').forEach(b=>{b.classList.remove('active');b.classList.remove('active-stab');});
  if(btn) btn.classList.add('active');
  var TAB_IDS=['s-account','s-security','s-notif','s-billing','s-prefs','s-creator','s-integrations','s-data','s-admin','s-danger',
               's-profile' /* legacy */];
  TAB_IDS.forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.style.display = id===tabId ? '' : 'none';
  });
  if(tabId==='s-billing') loadBilling();
  if(tabId==='s-account') renderAccountList();
  if(tabId==='s-security') { renderLinkedAccounts(); renderSessionInfo(); _loadLoginHistory(); }
  if(tabId==='s-notif') initNotifToggles();
  if(tabId==='s-prefs') { initThemePicker(); initBehaviorToggles(); initLangPicker(); }
  if(tabId==='s-creator'){ loadCreatorDashboard(); loadPayoutSection(); }
  if(tabId==='s-admin') loadAdminReports();
  if(tabId==='s-data'){ _loadReferralCard(); _loadMemories(); _loadReminders(); }
}

async function loadAdminReports(){
  var el = document.getElementById('adminReports');
  if(!el) return;
  el.innerHTML = '<div class="creator-loading">読み込み中…</div>';
  try{
    var r = await api('GET','/api/admin/reports');
    var reports = r.reports||[];
    if(!reports.length){
      el.innerHTML = '<div class="creator-empty">通報はありません 🎉</div>';
      return;
    }
    el.innerHTML = reports.map(function(rep){
      var reasonsHtml = rep.reports.map(function(rr){
        var dt = new Date(rr.date);
        return '<div style="font-size:11.5px;color:var(--text2);padding:4px 0;border-bottom:1px solid var(--wire)"><b>'+esc(rr.reason)+'</b> · '+ (dt.getMonth()+1)+'/'+dt.getDate() + (rr.detail ? ' — '+esc(rr.detail.slice(0,200)) : '') +'</div>';
      }).join('');
      var statusBadge = rep.is_listed ? '<span class="cl-st live">● 公開中</span>' : '<span class="cl-st paused">⏸ 停止中</span>';
      return '<div class="cl-row" style="flex-direction:column;align-items:stretch;gap:10px">'
        + '<div style="display:flex;align-items:center;gap:10px">'
          + '<div style="flex:1;min-width:0"><div class="cl-name">'+esc(rep.title||'')+'</div>'
          + '<div class="cl-sub"><span>クリエイター: '+esc(rep.creator_handle||'')+'</span>'+statusBadge+'<span style="color:var(--rose);font-weight:800">通報 '+rep.report_count+' 件</span></div></div>'
        + '<div class="cl-actions">'
          + (rep.is_listed
              ? '<button class="pri" style="background:var(--rose);border-color:var(--rose)" onclick="adminTakedown(\''+esc(rep.listing_id)+'\')">取り下げ</button>'
              : '<button class="pri" onclick="adminRestore(\''+esc(rep.listing_id)+'\')">復元</button>'
            )
        + '</div>'
        + '</div>'
        + '<div style="background:var(--cream);border-radius:8px;padding:8px 12px">'+reasonsHtml+'</div>'
      + '</div>';
    }).join('');
  }catch(e){
    el.innerHTML = '<div class="creator-loading" style="color:var(--rose)">読み込みに失敗: '+esc(e.message||'')+'</div>';
  }
}
async function adminTakedown(listingId){
  var reason = prompt('取り下げ理由（任意・運営記録用）');
  if(reason===null) return;
  try{
    await api('POST','/api/admin/listings/'+listingId+'/takedown',{reason});
    showToast(L('取り下げました','Unpublished'),'ok');
    loadAdminReports();
  }catch(e){ showToast(e.message||'失敗','ng'); }
}
async function adminRestore(listingId){
  if(!confirm(L('この出店を復元（再公開）しますか？通報履歴はクリアされます','Restore (re-publish) this listing? Report history will be cleared.'))) return;
  try{
    await api('POST','/api/admin/listings/'+listingId+'/restore');
    showToast(L('復元しました','Restored'),'ok');
    loadAdminReports();
  }catch(e){ showToast(e.message||'失敗','ng'); }
}

async function loadCreatorDashboard(){
  var listEl = document.getElementById('creatorList');
  if(listEl) listEl.innerHTML = '<div class="creator-loading">読み込み中…</div>';
  ['ckListed','ckUses','ckBalance','ckEarnings'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.textContent = '—';
  });
  var chartEl = document.getElementById('creatorChart');
  if(chartEl) chartEl.innerHTML = '';
  var byAgEl = document.getElementById('creatorByAgent');
  if(byAgEl) byAgEl.innerHTML = '';
  var recentEl = document.getElementById('creatorRecent');
  if(recentEl) recentEl.innerHTML = '';

  try{
    // Fetch listings + earnings in parallel
    var [listingsRes, earningsRes] = await Promise.all([
      api('GET','/api/marketplace/listings/mine'),
      api('GET','/api/creator/earnings'),
    ]);
    var listings = listingsRes.listings || [];
    var listed = listings.filter(function(l){return l.is_listed;}).length;
    var totalUses = listings.reduce(function(s,l){return s+(l.uses_count||0);},0);

    // KPIs
    document.getElementById('ckListed').textContent = listed;
    document.getElementById('ckUses').textContent = totalUses.toLocaleString();
    document.getElementById('ckBalance').textContent = '¥' + (earningsRes.balance_available||0).toLocaleString();
    document.getElementById('ckEarnings').textContent = '¥' + Math.round(earningsRes.total_earned||0).toLocaleString();

    // Pending hint under balance
    var pendingEl = document.getElementById('ckBalanceSub');
    if(pendingEl){
      var p = earningsRes.balance_pending||0;
      pendingEl.textContent = p>0 ? '未確定: ¥' + Math.round(p).toLocaleString() + '（7日後確定）' : '';
    }

    // Chart (last 30 days)
    if(chartEl) chartEl.innerHTML = _renderEarningsChart(earningsRes.daily||[]);

    // Per-agent table (this month)
    if(byAgEl){
      var byAgent = (earningsRes.by_agent||[]).filter(function(a){return a.this_month_uses>0;});
      if(byAgent.length){
        byAgEl.innerHTML = '<div class="cea-table-wrap"><table class="cea-table"><thead><tr><th>エージェント</th><th class="r">今月利用</th><th class="r">今月収益</th><th class="r">累計</th></tr></thead><tbody>'
          + byAgent.map(function(a){
              return '<tr><td>'+esc(a.agent_name)+'</td><td class="r">'+a.this_month_uses+'</td><td class="r"><b>¥'+Math.round(a.this_month_jpy).toLocaleString()+'</b></td><td class="r">¥'+Math.round(a.share_jpy).toLocaleString()+'</td></tr>';
            }).join('')
          + '</tbody></table></div>';
      } else {
        byAgEl.innerHTML = '<div class="creator-empty">今月の収益データはまだありません</div>';
      }
    }

    // Recent activity feed
    if(recentEl){
      var recent = (earningsRes.recent||[]).slice(0,10);
      if(recent.length){
        recentEl.innerHTML = '<div class="cea-feed">' + recent.map(function(r){
          var dt = new Date(r.date);
          var when = (dt.getMonth()+1)+'/'+dt.getDate()+' '+String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0');
          var st = r.status==='confirmed' ? '<span class="cea-st ok">確定</span>' : '<span class="cea-st pending">未確定</span>';
          return '<div class="cea-feed-row"><span class="cea-when">'+when+'</span><span class="cea-name">'+esc(r.agent_name||'')+'</span><span class="cea-share">+¥'+Math.round(r.share_jpy||0).toLocaleString()+'</span>'+st+'</div>';
        }).join('') + '</div>';
      } else {
        recentEl.innerHTML = '<div class="creator-empty">まだ収益履歴はありません</div>';
      }
    }

    // Listings
    if(!listings.length){
      listEl.innerHTML = '<div class="creator-empty">まだ出店していません。<br>サイドバーでエージェントを開いて <b>⚙ 編集 → 🏪 Agent Store に出店</b> から出店できます。</div>';
      return;
    }
    listEl.innerHTML = listings.map(function(l){
      var stCls = l.is_listed ? 'live' : (l.status==='paused' ? 'paused' : 'draft');
      var stLbl = l.is_listed ? '● 公開中' : (l.status==='paused' ? '⏸ 停止中' : '— 未公開');
      var visIc = l.visibility==='unlisted' ? '🔗' : '🌐';
      return '<div class="cl-row">'
        + '<div class="cl-av">'+_avHTML(l.agent_avatar)+'</div>'
        + '<div class="cl-meta">'
          + '<div class="cl-name">'+esc(l.title||l.agent_name||'')+'</div>'
          + '<div class="cl-sub"><span class="cl-st '+stCls+'">'+stLbl+'</span><span>'+visIc+' '+(l.visibility==='unlisted'?'限定':'公開')+'</span><span>利用 '+(l.uses_count||0)+' 回</span></div>'
        + '</div>'
        + '<div class="cl-actions">'
          + '<button onclick="openListingForm(\''+esc(l.agent_id)+'\')">編集</button>'
          + (l.is_listed ? '<button class="pri" onclick="openShareListing(\''+esc(l.listing_id)+'\',\''+esc(l.title||l.agent_name||'').replace(/\\|\x27/g,"\\$&")+'\')">共有</button>' : '<button class="pri" onclick="openListingForm(\''+esc(l.agent_id)+'\')">公開</button>')
        + '</div>'
      + '</div>';
    }).join('');
  }catch(e){
    listEl.innerHTML = '<div class="creator-loading" style="color:var(--rose)">読み込みに失敗しました: '+esc(e.message||'')+'</div>';
  }
}

/* ── Payout (Stripe Connect, #7) ────────────────────────────── */
async function loadPayoutSection(){
  var el = document.getElementById('creatorPayout');
  if(!el) return;
  el.innerHTML = '<div class="creator-loading">読み込み中…</div>';
  try{
    var s = await api('GET','/api/payout/status');
    var min = s.min_jpy || 1000;
    var available = s.balance_available || 0;
    var canRequest = s.payouts_enabled && available >= min;

    var head = '<div class="payout-hero">'
      + '<div class="ph-lbl">利用可能残高</div>'
      + '<div class="ph-val">¥'+Math.round(available).toLocaleString()+'</div>'
      + '<div class="ph-meta">最低出金 ¥'+min.toLocaleString()+' ／ 月1回まで無料 ／ Stripe Connect 経由</div>';
    if(canRequest){
      head += '<div class="ph-acts"><button class="ph-btn-w" onclick="requestPayout()">¥'+Math.round(available).toLocaleString()+' を全額出金 →</button><button class="ph-btn-o" onclick="requestPayoutCustom()">金額を指定</button></div>';
    } else if(!s.onboarded){
      head += '<div class="ph-acts"><button class="ph-btn-w" onclick="onboardPayout()">＋ 銀行口座を登録</button></div>';
    } else if(!s.payouts_enabled){
      var due = (s.requirements?.currently_due||[]).slice(0,3).join(', ');
      head += '<div class="ph-acts"><button class="ph-btn-w" onclick="onboardPayout()">確認情報を入力 →</button></div>'
        + (due ? '<div style="font-size:11px;margin-top:8px;color:rgba(255,255,255,.65)">未提出: '+esc(due)+'</div>' : '');
    } else {
      head += '<div class="ph-acts"><button class="ph-btn-w" disabled style="opacity:.5;cursor:not-allowed">最低 ¥'+min.toLocaleString()+' から出金可能</button></div>';
    }
    head += '</div>';

    var hist = s.history||[];
    var histHtml = hist.length
      ? '<div class="cea-table-wrap" style="margin-top:14px"><table class="cea-table"><thead><tr><th>日時</th><th class="r">金額</th><th>状態</th></tr></thead><tbody>'
        + hist.map(function(p){
            var dt = new Date(p.date);
            var st = p.status==='paid' ? '<span class="cea-st ok">完了</span>'
                    : p.status==='pending' ? '<span class="cea-st pending">処理中</span>'
                    : '<span class="cea-st" style="background:rgba(239,68,68,.12);color:var(--rose)">失敗</span>';
            return '<tr><td>'+dt.toISOString().slice(0,10)+'</td><td class="r">¥'+(p.amount_jpy||0).toLocaleString()+'</td><td>'+st+'</td></tr>';
          }).join('')
        + '</tbody></table></div>'
      : '<div class="creator-empty" style="margin-top:14px">出金履歴はまだありません</div>';

    el.innerHTML = head + histHtml;
  }catch(e){
    el.innerHTML = '<div class="creator-loading" style="color:var(--rose)">読み込みに失敗: '+esc(e.message||'')+'</div>';
  }
}
async function onboardPayout(){
  try{
    var r = await api('POST','/api/payout/onboard');
    if(r.url) window.location.href = r.url;
  }catch(e){ showToast(e.message||'失敗','ng'); }
}
async function requestPayout(){
  if(!confirm(L('利用可能残高の全額を出金しますか？','Withdraw the entire available balance?'))) return;
  try{
    var r = await api('POST','/api/payout/request');
    showToast(L('出金処理を開始しました','Payout started'),'ok');
    loadPayoutSection();
    loadCreatorDashboard();
  }catch(e){ showToast(e.message||'出金失敗','ng'); }
}
async function requestPayoutCustom(){
  var s = prompt('出金金額（円）');
  if(s===null) return;
  var amt = parseInt(s.replace(/[¥,\s]/g,''),10);
  if(!amt || amt<=0){ showToast(L('金額が不正です','Invalid amount'),'ng'); return; }
  try{
    await api('POST','/api/payout/request',{amount_jpy:amt});
    showToast(L('出金処理を開始しました','Payout started'),'ok');
    loadPayoutSection();
    loadCreatorDashboard();
  }catch(e){ showToast(e.message||'出金失敗','ng'); }
}

/* ── Report listing ─────────────────────────────────────────── */
var REPORT_REASONS = [
  {id:'spam',      label:'スパム / 自動投稿'},
  {id:'misleading',label:'誤解を招く説明'},
  {id:'ip',        label:'他者の知的財産・著作権侵害'},
  {id:'illegal',   label:'違法 / 有害コンテンツ'},
  {id:'unsafe',    label:'危険・差別的内容'},
  {id:'duplicate', label:'重複出店'},
  {id:'other',     label:'その他'},
];
var _reportTargetId = null;
function openReportListing(listingId, listingTitle){
  _reportTargetId = listingId;
  document.getElementById('reportTarget').textContent = listingTitle || '';
  var box = document.getElementById('reportReasons');
  box.innerHTML = REPORT_REASONS.map(function(r){
    return '<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--wire3);border-radius:8px;cursor:pointer;font-size:13px;color:var(--text);background:#fff"><input type="radio" name="reportReason" value="'+r.id+'" style="margin:0">'+esc(r.label)+'</label>';
  }).join('');
  document.getElementById('reportDetail').value = '';
  document.getElementById('reportOverlay').classList.add('open');
}
function closeReportListing(){
  document.getElementById('reportOverlay').classList.remove('open');
  _reportTargetId = null;
}
async function submitReportListing(){
  if(!_reportTargetId) return;
  var reasonEl = document.querySelector('input[name="reportReason"]:checked');
  if(!reasonEl){ showToast(L('理由を選んでください','Please choose a reason'),'ng'); return; }
  var detail = document.getElementById('reportDetail').value.trim();
  var btn = document.getElementById('reportSubmitBtn');
  btn.disabled = true; btn.textContent = '送信中…';
  try{
    await api('POST','/api/marketplace/'+_reportTargetId+'/report',{ reason: reasonEl.value, detail });
    showToast(L('通報を送信しました。ご協力ありがとうございます','Report submitted. Thanks for the heads-up.'),'ok');
    closeReportListing();
  }catch(e){
    showToast(e.message||'通報に失敗しました','ng');
  } finally {
    btn.disabled = false; btn.textContent = '通報する';
  }
}

/* ── Creator profile modal ──────────────────────────────────── */
async function openCreatorProfile(handle){
  if(!handle) return;
  document.getElementById('cpTitle').textContent = handle;
  var body = document.getElementById('cpBody');
  body.innerHTML = '<div class="creator-loading">読み込み中…</div>';
  document.getElementById('creatorProfileOverlay').classList.add('open');
  try{
    var r = await api('GET','/api/creators/'+encodeURIComponent(handle));
    var c = r.creator || {};
    var s = r.stats || {};
    var listings = r.listings || [];
    var joined = c.joined ? new Date(c.joined).toISOString().slice(0,10) : '';
    var verifiedSpan = c.is_verified
      ? '<span class="mc-verified" style="width:18px;height:18px;font-size:11px;margin-left:6px" title="検証済みクリエイター">✓</span>'
      : '';
    body.innerHTML = ''
      + '<div style="display:flex;align-items:center;gap:14px;padding:14px;background:linear-gradient(135deg,#fff7ed,#ffedd5);border:1px solid rgba(251,146,60,.2);border-radius:14px;margin-bottom:18px">'
        + '<div style="width:54px;height:54px;border-radius:14px;background:var(--peach);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900">'+esc((c.handle||'@?').charAt(1).toUpperCase())+'</div>'
        + '<div style="flex:1;min-width:0">'
          + '<div style="font-size:18px;font-weight:900;color:var(--text);display:flex;align-items:center">'+esc(c.handle||'')+verifiedSpan+'</div>'
          + (c.name ? '<div style="font-size:12.5px;color:var(--text2);font-weight:600;margin-top:2px">'+esc(c.name)+'</div>' : '')
          + '<div style="font-size:11.5px;color:var(--text3);font-weight:600;margin-top:6px">出店 '+(s.listings||0)+' 件 ・ 累計利用 '+(s.total_uses||0).toLocaleString()+' 回'+(joined ? ' ・ '+joined+' から':'')+'</div>'
        + '</div>'
      + '</div>';
    if(!listings.length){
      body.innerHTML += '<div class="creator-empty">このクリエイターはまだエージェントを公開していません</div>';
      return;
    }
    body.innerHTML += '<div class="market-grid">' + listings.map(function(m){
      var stars = m.rating>0 ? '<span class="mc-stars">★ <b>'+m.rating.toFixed(1)+'</b></span>' : '<span style="color:var(--text3)">★ —</span>';
      var uses = m.uses>0 ? '利用 '+(m.uses>=1000?(m.uses/1000).toFixed(1)+'k':m.uses)+' 回' : '新着';
      return '<button class="market-card" onclick="cloneFromProfile(\''+esc(m.listing_id)+'\')">'
        + '<div class="mc-head"><div class="mc-av">'+_avHTML(m.agent?.avatar)+'</div>'
        + '<div style="flex:1;min-width:0"><div class="mc-name">'+esc(m.title)+'</div><div class="mc-cat">'+esc(m.category_label||'')+'</div></div></div>'
        + '<div class="mc-desc">'+esc(m.description)+'</div>'
        + '<div class="mc-meta">'+stars+'<span>'+uses+'</span></div>'
        + '</button>';
    }).join('') + '</div>';
  }catch(e){
    body.innerHTML = '<div class="creator-loading" style="color:var(--rose)">読み込みに失敗しました: '+esc(e.message||'')+'</div>';
  }
}
function closeCreatorProfile(){
  document.getElementById('creatorProfileOverlay').classList.remove('open');
}
async function cloneFromProfile(listingId){
  try{
    var r = await api('POST','/api/marketplace/'+listingId+'/clone');
    if(r.agent){
      agents.push({...r.agent, history:[]});
      activeId = r.agent.id;
      closeCreatorProfile();
      renderAgList();
      openAgent(r.agent.id);
      showToast(L('チームに追加しました','Added to your team'),'ok');
    }
  }catch(e){
    showToast(e.message||'追加に失敗しました','ng');
  }
}

function _renderEarningsChart(daily){
  if(!daily || !daily.length) return '<div class="creator-empty">データなし</div>';
  var max = Math.max(1, ...daily.map(function(d){return d.share_jpy||0;}));
  var w = 600, h = 140, pad = 4;
  var step = (w - pad*2) / Math.max(1, daily.length-1);
  var pts = daily.map(function(d,i){
    var x = pad + i*step;
    var y = h - pad - ((d.share_jpy||0)/max)*(h - pad*2);
    return [x,y];
  });
  var line = pts.map(function(p,i){return (i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');
  var area = line + ' L'+(w-pad)+','+(h-pad)+' L'+pad+','+(h-pad)+' Z';
  var lastIdx = daily.length-1;
  var lastDate = daily[lastIdx]?.date || '';
  var firstDate = daily[0]?.date || '';
  return '<div style="position:relative">'
    + '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" style="width:100%;height:140px;display:block">'
    + '<defs><linearGradient id="ceaG1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fb923c" stop-opacity=".35"/><stop offset="100%" stop-color="#fb923c" stop-opacity="0"/></linearGradient></defs>'
    + '<path d="'+area+'" fill="url(#ceaG1)"/>'
    + '<path d="'+line+'" fill="none" stroke="#fb923c" stroke-width="2"/>'
    + '<circle cx="'+pts[lastIdx][0].toFixed(1)+'" cy="'+pts[lastIdx][1].toFixed(1)+'" r="3.5" fill="#ea580c"/>'
    + '</svg>'
    + '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text3);font-weight:600;margin-top:4px"><span>'+firstDate.slice(5)+'</span><span>過去30日 ・ 最大 ¥'+Math.round(max).toLocaleString()+'</span><span>'+lastDate.slice(5)+'</span></div>'
  + '</div>';
}

async function loadBilling(){
  // populate header
  var plan=(me&&me.plan)||'free';
  var planEl=document.getElementById('sb-plan');
  var planSub=document.getElementById('sb-plan-sub');
  if(planEl) planEl.textContent = plan==='pro'?'Pro':plan==='business'?'Business':'Free';
  if(planSub) planSub.textContent = plan==='free'?T.sFreeBlurb:plan==='pro'?T.sProBlurb:T.sBizBlurb;
  var cancelBtn=document.getElementById('sb-cancel-btn');
  if(cancelBtn) cancelBtn.style.display = (plan==='pro'||plan==='business') ? '' : 'none';

  // fetch usage details
  try{
    var r=await api('GET','/api/usage');
    var bal=r.balance_jpy||0;
    var msg=r.total_messages||0;
    var bEl=document.getElementById('sb-bal'); if(bEl) bEl.textContent=jpyAsUsd(bal);
    var mEl=document.getElementById('sb-msg'); if(mEl) mEl.textContent=_fmtT(T.sUsageFmt,{n:msg});
    renderBillingHistory(r.recent_history||[]);
  }catch(e){
    var hEl=document.getElementById('sb-history');
    if(hEl) hEl.innerHTML='<div style="padding:24px;text-align:center;color:var(--text3);font-size:13px">'+T.sTxFetchFail+'</div>';
  }
}

function renderBillingHistory(items){
  var el=document.getElementById('sb-history');
  if(!el) return;
  if(!items||!items.length){
    el.innerHTML='<div style="padding:32px 16px;text-align:center;color:var(--text3);font-size:13px">'+T.sNoTx+'</div>';
    return;
  }
  var loc = isJa ? 'ja-JP' : 'en-US';
  el.innerHTML = items.map(function(it){
    var date=new Date(it.date);
    var dstr=isNaN(date.getTime())?'':date.toLocaleDateString(loc,{year:'numeric',month:'2-digit',day:'2-digit'})+' '+date.toLocaleTimeString(loc,{hour:'2-digit',minute:'2-digit'});
    var type=it.type||'usage';
    var label, amount, color, icon;
    if(type==='topup'){
      icon='💳'; label=T.sTxTopup;
      var cents=it.amount_cents_usd||0;
      amount='+'+usdFmt(cents/100);
      color='#10b981';
    } else if(type==='subscription'){
      icon='⭐';
      var planLbl=it.plan==='pro'?'Pro':it.plan==='business'?'Business':'Plan';
      label=_fmtT(T.sTxSub,{p:planLbl});
      amount='+'+usdFmt(jpyToUsd(it.credit_jpy));
      color='#10b981';
    } else {
      icon='💬';
      var n=it.agentName||'';
      label = n ? _fmtT(T.sTxUsageWith,{n:esc(n)}) : T.sTxUsage;
      var costUsd = (it.cost_usd!==undefined) ? Number(it.cost_usd) : jpyToUsd(it.cost_jpy);
      // Tiny chat costs need 4 decimals to be meaningful
      amount='-'+usdFmt(costUsd, costUsd<0.01?4:4);
      color='var(--text2)';
    }
    return '<div style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid var(--wire);font-size:13px">'+
      '<div style="font-size:18px;flex-shrink:0">'+icon+'</div>'+
      '<div style="flex:1;min-width:0">'+
        '<div style="color:var(--text);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+label+'</div>'+
        '<div style="color:var(--text3);font-size:11px;margin-top:1px">'+dstr+'</div>'+
      '</div>'+
      '<div style="color:'+color+';font-weight:700;white-space:nowrap;font-variant-numeric:tabular-nums">'+amount+'</div>'+
    '</div>';
  }).join('');
}

async function cancelSubscription(){
  if(!confirm(T.sCancelConf)) return;
  try{
    await api('POST','/api/billing/cancel',{});
    showToast(T.sCancelDone,'ok');
    if(typeof refreshMe==='function'){ await refreshMe(); }
    loadBilling();
  }catch(e){
    showToast(e.message||T.sCancelFail,'ng');
  }
}
async function saveProfile(){
  const name = document.getElementById('sName').value.trim();
  if(!name){ showToast(isJa?'名前を入力してください':'Please enter your name','err'); return; }
  // Persist client-side prefs (bio/role/tz/lang) regardless of server outcome
  var bio=document.getElementById('sBio'); if(bio) _prefSet('bio',bio.value.trim());
  var role=document.getElementById('sRole'); if(role) _prefSet('role',role.value);
  var tz=document.getElementById('sTz'); if(tz) _prefSet('tz',tz.value);
  var langEl=document.getElementById('sLang');
  if(langEl){
    var newLang=langEl.value;
    var oldLang=_prefGet('lang','auto');
    _prefSet('lang',newLang);
    if(newLang!==oldLang){
      // Reload so the new language preference is picked up everywhere.
      // Strip any ?lang= URL override so the saved pref wins on reload.
      setTimeout(function(){
        var url=location.pathname+location.search.replace(/[?&]lang=[^&]*/g,'').replace(/^&/,'?');
        if(url===location.pathname+location.search){ location.reload(); } else { location.replace(url); }
      }, 600);
    }
  }
  try{
    const res = await api('PATCH','/api/user/profile',{name});
    if(res.user){
      me=res.user;
      var nameEl=document.getElementById('userName'); if(nameEl) nameEl.textContent=me.name||me.email;
      _recordCurrentAccount();
    }
    showToast(isJa?'プロフィールを保存しました':'Profile saved','ok');
  }catch(e){ showToast(isJa?'保存に失敗しました':'Failed to save','err'); }
}

/* ── Multi-account management ─────────────────────────────────── */
function _acctsList(){
  try{ var v=localStorage.getItem('maa_accounts'); return v?JSON.parse(v):[]; }
  catch(e){ return []; }
}
function _acctsSet(arr){ try{ localStorage.setItem('maa_accounts',JSON.stringify(arr||[])); }catch(e){} }
function _recordCurrentAccount(){
  if(!me||!token) return;
  var list=_acctsList();
  var idx=list.findIndex(function(a){return a.user_id===me.id;});
  var entry={
    user_id:me.id,
    token:token,
    email:me.email,
    name:me.name||me.email,
    plan:me.plan||'free',
    last_used:Date.now()
  };
  if(idx>=0) list[idx]=entry; else list.push(entry);
  _acctsSet(list);
}
function _activeAcctId(){ return me?me.id:null; }

function renderAccountList(){
  var el=document.getElementById('sAccountList');
  if(!el) return;
  var list=_acctsList();
  // Make sure current account is in the list
  if(me && token && !list.find(function(a){return a.user_id===me.id;})){
    _recordCurrentAccount();
    list=_acctsList();
  }
  if(!list.length){
    el.innerHTML='<div style="padding:16px;text-align:center;color:var(--text3);font-size:13px">'+(isJa?'保存されたアカウントはまだありません':'No saved accounts yet')+'</div>';
    return;
  }
  var curId=_activeAcctId();
  el.innerHTML=list.map(function(a){
    var isCur = a.user_id===curId;
    var letter = _avatarLetter(a.name,a.email);
    var planLbl = a.plan==='pro'?'Pro':a.plan==='business'?'Business':'Free';
    var actions = isCur
      ? '<span class="s-pill s-pill-ok">'+(isJa?'現在のアカウント':'Current')+'</span>'
      : '<span class="arrow">'+(isJa?'切り替え →':'Switch →')+'</span>'+
        '<button class="x" onclick="event.stopPropagation();removeAccount(\''+a.user_id+'\')" title="'+(isJa?'リストから削除':'Remove from list')+'">×</button>';
    return '<button type="button" class="s-acct-row'+(isCur?' current':'')+'" '+(isCur?'':'onclick="switchAccount(\''+a.user_id+'\')"')+'>'+
      '<div class="av" style="background:'+_avatarColor(a.email||a.user_id)+'">'+letter+'</div>'+
      '<div class="meta">'+
        '<div class="nm">'+esc(a.name||a.email||'')+'</div>'+
        '<div class="em">'+esc(a.email||'')+' ・ '+planLbl+(isJa?' プラン':' plan')+'</div>'+
      '</div>'+
      actions+
    '</button>';
  }).join('');
}

function switchAccount(userId){
  var list=_acctsList();
  var acct=list.find(function(a){return a.user_id===userId;});
  if(!acct){ showToast(isJa?'アカウントが見つかりません':'Account not found','ng'); return; }
  acct.last_used=Date.now();
  _acctsSet(list);
  localStorage.setItem('token',acct.token);
  showToast((isJa?'切り替え中: ':'Switching to: ')+acct.name,'ok');
  setTimeout(function(){ location.reload(); }, 300);
}

function removeAccount(userId){
  var list=_acctsList();
  var idx=list.findIndex(function(a){return a.user_id===userId;});
  if(idx<0) return;
  if(userId===_activeAcctId()){
    showToast(isJa?'現在のアカウントは「ログアウト」で削除してください':'Use logout for the current account','ng');
    return;
  }
  if(!confirm(isJa?'リストから削除しますか？\n（再度ログインすれば戻せます）':'Remove from list?\n(You can sign in again to restore)')) return;
  list.splice(idx,1);
  _acctsSet(list);
  renderAccountList();
}

function addAnotherAccount(){
  // Snapshot current account so we don't lose it after the auth flow
  _recordCurrentAccount();
  // Mark the upcoming auth as "additional account" — auth.html should preserve maa_accounts and just add the new token
  try{ sessionStorage.setItem('maa_add_mode','1'); }catch(e){}
  location.href='auth.html?mode=add';
}

function logoutAllAccounts(){
  if(!confirm(isJa?'すべてのアカウントからログアウトしますか？':'Sign out of all accounts?')) return;
  try{ localStorage.removeItem('maa_accounts'); }catch(e){}
  try{ localStorage.removeItem('token'); }catch(e){}
  try{ localStorage.removeItem('user'); }catch(e){}
  location.href='auth.html';
}

/* ── Sidebar quick switcher popup ─────────────────────────────── */
function toggleUserPopup(e){
  if(e) e.stopPropagation();
  var el=document.getElementById('userPopup');
  if(!el) return;
  if(el.classList.contains('open')){ el.classList.remove('open'); return; }
  renderUserPopup();
  el.classList.add('open');
  // close on outside click
  setTimeout(function(){
    document.addEventListener('click', _userPopupClose, {once:true});
  },10);
}
function _userPopupClose(){ var el=document.getElementById('userPopup'); if(el) el.classList.remove('open'); }
function renderUserPopup(){
  var el=document.getElementById('userPopup');
  if(!el) return;
  var list=_acctsList();
  if(me && token && !list.find(function(a){return a.user_id===me.id;})){
    _recordCurrentAccount();
    list=_acctsList();
  }
  var curId=_activeAcctId();
  var rows=list.map(function(a){
    var isCur=a.user_id===curId;
    var letter=_avatarLetter(a.name,a.email);
    return '<button class="user-popup-row'+(isCur?' current':'')+'" '+(isCur?'':'onclick="switchAccount(\''+a.user_id+'\')"')+'>'+
      '<div class="av" style="background:'+_avatarColor(a.email||a.user_id)+'">'+letter+'</div>'+
      '<div class="meta"><div class="nm">'+esc(a.name||a.email||'')+'</div><div class="em">'+esc(a.email||'')+'</div></div>'+
      (isCur?'<span class="dot">●</span>':'')+
    '</button>';
  }).join('');
  el.innerHTML =
    '<div class="user-popup-section">'+(isJa?'アカウント':'Accounts')+'</div>'+
    rows+
    '<div class="user-popup-divider"></div>'+
    '<button class="user-popup-row action" onclick="addAnotherAccount()"><span class="ic">＋</span><span>'+(isJa?'別のアカウントを追加':'Add another account')+'</span></button>'+
    '<button class="user-popup-row action danger" onclick="logoutCurrent()"><span class="ic">↪</span><span>'+(isJa?'ログアウト':'Sign out')+'</span></button>';
}
function logoutCurrent(){
  if(!confirm(isJa?'現在のアカウントからログアウトしますか？':'Sign out of the current account?')) return;
  var list=_acctsList();
  var curId=_activeAcctId();
  list=list.filter(function(a){return a.user_id!==curId;});
  _acctsSet(list);
  if(list.length){
    var next=list[0];
    localStorage.setItem('token',next.token);
    location.reload();
  } else {
    try{ localStorage.removeItem('token'); }catch(e){}
    location.href='auth.html';
  }
}

/* ── Notifications / Behavior toggles (client-side prefs) ──────── */
function initNotifToggles(){
  // Defaults: balance/renewal/receipt ON, others OFF
  var defs={notif_balance:1,notif_renewal:1,notif_receipt:1,notif_product:0,notif_weekly:0};
  document.querySelectorAll('#s-notif .s-sw[data-pref]').forEach(function(sw){
    var k=sw.getAttribute('data-pref');
    if(_prefBool(k, defs[k]||0)) sw.classList.add('on'); else sw.classList.remove('on');
    sw.onclick=function(){ sw.classList.toggle('on'); _prefSet(k, sw.classList.contains('on')?'1':'0'); };
  });
}
function initBehaviorToggles(){
  var defs={behav_enter_send:1,behav_open_last:1};
  document.querySelectorAll('#s-prefs .s-sw[data-pref]').forEach(function(sw){
    var k=sw.getAttribute('data-pref');
    if(_prefBool(k, defs[k]||0)) sw.classList.add('on'); else sw.classList.remove('on');
    sw.onclick=function(){ sw.classList.toggle('on'); _prefSet(k, sw.classList.contains('on')?'1':'0'); };
  });
}
function initThemePicker(){
  var current=_prefGet('theme','light');
  document.querySelectorAll('.s-theme-c[data-theme]').forEach(function(c){
    c.classList.toggle('sel', c.getAttribute('data-theme')===current);
  });
}
// ── Language picker ───────────────────────────────────────
function setLang(name){
  if(!['ja','en'].includes(name)) name = 'en';
  try { localStorage.setItem('pref_lang', name); } catch(e){}
  // Most strings are baked into HTML/JS at load. Easiest correct UX: reload.
  // The detector at top of <script> reads pref_lang first.
  const labels = {ja:'日本語', en:'English'};
  showToast('Language: ' + labels[name] + ' — reloading…', 'ok');
  setTimeout(() => location.reload(), 600);
}
function initLangPicker(){
  const cur = (typeof currentLang === 'string') ? currentLang : 'ja';
  document.querySelectorAll('#langPicker [data-lang]').forEach(b => {
    b.classList.toggle('sel', b.dataset.lang === cur);
  });
}

function setTheme(name){
  _prefSet('theme',name);
  document.querySelectorAll('.s-theme-c[data-theme]').forEach(function(c){
    c.classList.toggle('sel', c.getAttribute('data-theme')===name);
  });
  _applyTheme(name);
  showToast(isJa?(name==='light'?'ライト':name==='dark'?'ダーク':'OS 連動')+'テーマに切替':'Theme: '+name,'ok');
}
function _applyTheme(name){
  const html = document.documentElement;
  let actual = name;
  if(name === 'auto'){
    actual = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  if(actual === 'dark'){
    html.setAttribute('data-theme','dark');
  } else {
    html.removeAttribute('data-theme');
  }
}
// Apply on initial load + watch system preference for 'auto' mode
(function _initThemeOnLoad(){
  try {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('pref:theme')) || 'light';
    _applyTheme(saved);
    if(window.matchMedia){
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        const cur = (typeof localStorage !== 'undefined' && localStorage.getItem('pref:theme')) || 'light';
        if(cur === 'auto') _applyTheme('auto');
      };
      if(mq.addEventListener) mq.addEventListener('change', handler);
      else if(mq.addListener) mq.addListener(handler);
    }
  } catch(e){}
})();

/* ── Linked accounts / sessions (security tab) ─────────────────── */
function renderLinkedAccounts(){
  var el=document.getElementById('sLinkedAccts');
  if(!el) return;
  var hasGoogle = !!(me && (me.google_id||me.googleId));
  el.innerHTML =
    '<div class="s-conn-row"><div class="ic">G</div><div class="meta"><div class="n">Google</div><div class="s">'+(hasGoogle?(isJa?'連携済み':'Connected'):(isJa?'未連携':'Not connected'))+'</div></div>'+
      (hasGoogle?'<span class="s-pill s-pill-ok">'+(isJa?'✓ 連携済み':'✓ Linked')+'</span>':'<a class="btn-ghost" href="/api/auth/google" style="text-decoration:none;display:inline-block;">'+(isJa?'連携する':'Connect')+'</a>')+
    '</div>'+
    '<div class="s-conn-row"><div class="ic">📧</div><div class="meta"><div class="n">'+(isJa?'メールアドレス':'Email')+'</div><div class="s">'+esc((me&&me.email)||'')+'</div></div>'+
      (me&&me.verified?'<span class="s-pill s-pill-ok">'+(isJa?'✓ 確認済み':'✓ Verified')+'</span>':'<span class="s-pill s-pill-soon">'+(isJa?'未確認':'Unverified')+'</span>')+
    '</div>';
}
function renderSessionInfo(){
  var el=document.getElementById('sSessUA');
  if(el) el.textContent = (navigator.userAgent||'').slice(0,80);
}

/* ── Data tab: export / import / clear ────────────────────────── */
function _downloadBlob(filename, content, mime){
  var b=new Blob([content],{type:mime||'application/octet-stream'});
  var url=URL.createObjectURL(b);
  var a=document.createElement('a');
  a.href=url; a.download=filename; document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 100);
}
// ── Unified Memory page (🧠 記憶 tab) ────────────────────
// Pulls user-level + every agent's memories into one list with per-item
// ON/OFF toggle, delete, JSON export, and a GDPR "全削除" button.
window._memAllCache = null;
window._memAllFilter = 'all';

async function _loadMemoryAll(){
  const host = document.getElementById('memAllList');
  if(!host) return;
  host.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text3);font-size:12.5px">読み込み中…</div>';
  try {
    const r = await api('GET', '/api/me/memories/all');
    window._memAllCache = r;
    _renderMemoryStats(r);
    _renderMemoryAllList();
  } catch(e){
    host.innerHTML = '<div style="color:#dc2626;font-size:12px;padding:14px">読み込み失敗: '+esc(e.message||'')+'</div>';
  }
}

function _renderMemoryStats(r){
  const el = document.getElementById('memStats');
  if(!el) return;
  el.innerHTML = ''
    + '<span><b style="font-size:15px;color:var(--text);font-weight:900">'+(r.total||0)+'</b> 件</span>'
    + '<span style="color:#059669"><b style="font-size:15px;font-weight:900">'+(r.active||0)+'</b> 有効</span>'
    + '<span style="color:var(--text3)"><b style="font-size:15px;font-weight:900">'+(r.disabled||0)+'</b> OFF</span>';
}

function _memFilter(kind){
  window._memAllFilter = kind;
  ['All','Act','Dis','Usr','Ag'].forEach(function(k){
    var el = document.getElementById('memF'+k);
    if(el) el.classList.remove('on');
  });
  var map = {all:'memFAll',active:'memFAct',disabled:'memFDis',user:'memFUsr',agent:'memFAg'};
  var ot = document.getElementById(map[kind]||'memFAll');
  if(ot) ot.classList.add('on');
  _renderMemoryAllList();
}

function _renderMemoryAllList(){
  const host = document.getElementById('memAllList');
  if(!host) return;
  const r = window._memAllCache;
  if(!r || !Array.isArray(r.items)){ host.innerHTML = ''; return; }
  const filt = window._memAllFilter || 'all';
  let items = r.items;
  if(filt === 'active')   items = items.filter(x => !x.disabled);
  if(filt === 'disabled') items = items.filter(x =>  x.disabled);
  if(filt === 'user')     items = items.filter(x => x.scope === 'user');
  if(filt === 'agent')    items = items.filter(x => x.scope === 'agent');
  if(!items.length){
    host.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text3);font-size:12.5px">該当する記憶はありません</div>';
    return;
  }
  host.innerHTML = items.map(function(it){
    var when = it.added_at ? (new Date(it.added_at)).toLocaleDateString('ja-JP', {year:'numeric',month:'2-digit',day:'2-digit'}) : '';
    var srcCls = it.scope === 'user' ? 'mem-src user' : 'mem-src';
    var srcLbl = it.scope === 'user' ? '🌐 全体共有' : ((it.agent_avatar||'🤖')+' '+it.agent_name);
    var toggleLbl = it.disabled ? 'OFF' : '✓ ON';
    var toggleCls = it.disabled ? 'mem-toggle' : 'mem-toggle on';
    return '<div class="mem-row '+(it.disabled?'dis':'')+'">'
      + '<span class="'+srcCls+'">'+esc(srcLbl)+'</span>'
      + '<div class="mem-tx">'
      +   esc(it.text)
      +   '<div class="mem-meta">'+esc(when)+(it.pinned?' · 📌 ピン留め':'')+'</div>'
      + '</div>'
      + '<button class="'+toggleCls+'" onclick="_memToggle(\''+esc(it.id)+'\')">'+toggleLbl+'</button>'
      + '<button class="mem-del" onclick="_memDelete(\''+esc(it.id)+'\')" title="削除">🗑</button>'
      + '</div>';
  }).join('');
}

// Parse our composite IDs: "u_<idx>" or "a_<agentId>_<memoryId>"
function _memParseId(id){
  if(!id) return null;
  if(id.indexOf('u_') === 0){
    return { scope:'user', idx: parseInt(id.slice(2), 10) };
  }
  if(id.indexOf('a_') === 0){
    var rest = id.slice(2);
    var sep = rest.lastIndexOf('_');
    if(sep < 0) return null;
    return { scope:'agent', agentId: rest.slice(0, sep), memId: rest.slice(sep+1) };
  }
  return null;
}

async function _memToggle(id){
  const p = _memParseId(id);
  if(!p) return;
  // Find the cached item to flip its current state
  var item = (window._memAllCache && window._memAllCache.items || []).find(function(x){return x.id===id;});
  if(!item) return;
  const newDisabled = !item.disabled;
  try {
    if(p.scope === 'user'){
      await api('PATCH', '/api/me/memories/'+p.idx, { disabled: newDisabled });
    } else {
      await api('PATCH', '/api/agents/'+p.agentId+'/memories/'+p.memId, { disabled: newDisabled });
    }
    item.disabled = newDisabled;
    // Update stats inline
    if(window._memAllCache){
      window._memAllCache.active   = (window._memAllCache.items||[]).filter(function(x){return !x.disabled;}).length;
      window._memAllCache.disabled = (window._memAllCache.items||[]).filter(function(x){return  x.disabled;}).length;
      _renderMemoryStats(window._memAllCache);
    }
    _renderMemoryAllList();
  } catch(e){
    showToast((e.message||'切替失敗'),'ng');
  }
}

async function _memDelete(id){
  const p = _memParseId(id);
  if(!p) return;
  if(!confirm('この記憶を削除しますか?')) return;
  try {
    if(p.scope === 'user'){
      await api('DELETE', '/api/me/memories/'+p.idx);
    } else {
      await api('DELETE', '/api/agents/'+p.agentId+'/memories/'+p.memId);
    }
    showToast('削除しました','ok');
    _loadMemoryAll();
  } catch(e){
    showToast((e.message||'削除失敗'),'ng');
  }
}

function _memExport(){
  const r = window._memAllCache;
  if(!r){ showToast('まだ読み込まれていません','ng'); return; }
  const exportData = {
    exported_at: new Date().toISOString(),
    total: r.total,
    items: (r.items||[]).map(function(it){
      return {
        scope: it.scope,
        agent_name: it.agent_name,
        text: it.text,
        added_at: it.added_at,
        pinned: it.pinned,
        disabled: it.disabled,
      };
    }),
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-ai-agent-memories-'+(new Date()).toISOString().slice(0,10)+'.json';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 100);
  showToast('JSON エクスポート完了','ok');
}

async function _memDeleteAll(){
  if(!confirm('⚠️ あなたについて AI が覚えている全ての記憶を削除します。\n\nこの操作は取り消せません。よろしいですか?')) return;
  const phrase = prompt('確認のため「DELETE ALL」と入力してください:');
  if(phrase !== 'DELETE ALL'){ showToast('キャンセルしました','ng'); return; }
  try {
    await api('DELETE', '/api/me/memories/all', { confirm: 'DELETE ALL' });
    showToast('全ての記憶を削除しました','ok');
    _loadMemoryAll();
  } catch(e){
    showToast((e.message||'削除失敗'),'ng');
  }
}

// Memories (long-term AI memory) management
async function _loadMemories(){
  const list = document.getElementById('memList');
  if(!list) return;
  try {
    const r = await api('GET', '/api/me/memories');
    const ms = r.memories || [];
    if(!ms.length){ list.innerHTML = '<div style="font-size:11.5px;color:var(--text3);padding:8px 0">まだ記憶はありません</div>'; return; }
    list.innerHTML = ms.map((m, i) => '<div class="mem-card" style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:var(--bg-50,#fafafa);border:.5px solid var(--wire2);border-radius:9px">'
      + '<span style="font-size:13px;line-height:1.55;color:var(--text);flex:1">'+esc(m.text)+'</span>'
      + '<button onclick="_delMemory('+i+')" style="background:transparent;border:0;color:var(--text3);cursor:pointer;font-size:14px;padding:0 4px;font-family:inherit" title="削除">×</button>'
      + '</div>').join('');
  } catch(e){
    list.innerHTML = '<div style="font-size:11.5px;color:var(--text3)">読み込み失敗</div>';
  }
}
async function _addMemory(){
  const inp = document.getElementById('memInput');
  if(!inp || !inp.value.trim()) return;
  try {
    await api('POST','/api/me/memories',{text: inp.value.trim()});
    inp.value = '';
    showToast(L('記憶しました 🧠','Saved to memory 🧠'),'ok');
    _loadMemories();
  } catch(e){ showToast(e.message,'ng'); }
}
async function _delMemory(idx){
  try {
    await api('DELETE','/api/me/memories/'+idx);
    _loadMemories();
  } catch(e){ showToast(e.message,'ng'); }
}

// Reminders
async function _loadReminders(){
  const list = document.getElementById('remList');
  if(!list) return;
  try {
    const r = await api('GET','/api/me/reminders');
    const rs = r.reminders || [];
    if(!rs.length){ list.innerHTML = '<div style="font-size:11.5px;color:var(--text3);padding:8px 0">まだリマインダーはありません</div>'; return; }
    list.innerHTML = rs.map(rm => {
      const d = new Date(rm.at);
      const when = d.toLocaleString('ja-JP',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
      return '<div class="mem-card" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-50,#fafafa);border:.5px solid var(--wire2);border-radius:9px">'
        + '<span style="font-size:11.5px;font-weight:700;color:var(--peach-dark);font-family:\'JetBrains Mono\',\'SF Mono\',monospace">'+esc(when)+'</span>'
        + '<span style="flex:1;font-size:12.5px;color:var(--text);line-height:1.5">'+esc(rm.text)+'</span>'
        + '<button onclick="_delReminder(\''+esc(rm.id)+'\')" style="background:transparent;border:0;color:var(--text3);cursor:pointer;font-size:14px;padding:0 4px;font-family:inherit" title="削除">×</button>'
        + '</div>';
    }).join('');
  } catch(e){ list.innerHTML = '<div style="font-size:11.5px;color:var(--text3)">読み込み失敗</div>'; }
}
async function _addReminder(){
  const at = document.getElementById('remAt')?.value;
  const text = document.getElementById('remText')?.value.trim();
  if(!at || !text){ showToast(L('日時とテキストを入力','Enter date/time and text'),'ng'); return; }
  try {
    await api('POST','/api/me/reminders',{at: new Date(at).toISOString(), text});
    document.getElementById('remText').value = '';
    showToast(L('リマインダーを設定','Reminder set'),'ok');
    _loadReminders();
  } catch(e){ showToast(e.message,'ng'); }
}
async function _delReminder(id){
  try {
    await api('DELETE','/api/me/reminders/'+id);
    _loadReminders();
  } catch(e){ showToast(e.message,'ng'); }
}

// Login history loader (security tab)
async function _loadLoginHistory(){
  const box = document.getElementById('sLoginLog');
  if(!box) return;
  box.innerHTML = '<div style="padding:8px 0;color:var(--text3)">読み込み中…</div>';
  try {
    const r = await api('GET', '/api/me/login-history');
    const events = (r && r.events) || [];
    if(!events.length){
      box.innerHTML = '<div style="padding:8px 0;color:var(--text3)">履歴がありません</div>';
      return;
    }
    const kindLabel = {login:'メール/パスワード', signup:'新規登録', google:'Google'};
    const ua2device = (ua) => {
      ua = ua || '';
      if(/iPhone|iPad/.test(ua)) return '📱 iOS';
      if(/Android/.test(ua)) return '📱 Android';
      if(/Macintosh|Mac OS X/.test(ua)) return '💻 Mac';
      if(/Windows/.test(ua)) return '💻 Windows';
      if(/Linux/.test(ua)) return '💻 Linux';
      return '💻 その他';
    };
    box.innerHTML = events.map(e => {
      const d = new Date(e.at);
      const when = d.toLocaleString('ja-JP', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
      const dev = ua2device(e.ua);
      const kind = kindLabel[e.kind] || e.kind || 'login';
      return '<div class="s-sess">'
        + '<div class="ic">'+esc(dev.split(' ')[0])+'</div>'
        + '<div class="meta">'
          + '<div class="dev">'+esc(when)+' · <span style="color:var(--text2);font-weight:600">'+esc(kind)+'</span></div>'
          + '<div class="loc">'+esc(dev)+(e.ip?' · '+esc(e.ip):'')+'</div>'
        + '</div>'
      + '</div>';
    }).join('');
  } catch(e){
    box.innerHTML = '<div style="padding:8px 0;color:var(--text3)">読み込み失敗</div>';
  }
}

// Server-side full data export (GDPR-style)
async function exportFullData(){
  try {
    const r = await fetch(API + '/api/me/data-export', {
      headers: {'Authorization': 'Bearer ' + token},
    });
    if(!r.ok) throw new Error('HTTP ' + r.status);
    const blob = await r.blob();
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u; a.download = 'myaiagent-data-' + _dateSlug() + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(u); }, 0);
    showToast(L('ダウンロード完了','Download complete'),'ok');
  } catch(e){ showToast(L('エクスポート失敗: ','Export failed: ') + e.message, 'ng'); }
}

// Referral helpers
async function _loadReferralCard(){
  const stat = document.getElementById('sRefStats');
  const inp = document.getElementById('sRefUrl');
  if(!stat || !inp) return;
  try {
    const r = await api('GET', '/api/me/referral');
    inp.value = r.url || '';
    const s = r.stats || {count:0, total_credit_jpy:0};
    stat.innerHTML = '<b>' + (s.count||0) + ' 人</b> 招待済 · 累計獲得 <b>¥' + ((s.total_credit_jpy||0).toLocaleString()) + '</b>';
  } catch(e){ stat.textContent = '読み込み失敗'; }
}
function _copyRefUrl(){
  const inp = document.getElementById('sRefUrl');
  if(!inp || !inp.value) return;
  navigator.clipboard.writeText(inp.value).then(() => showToast(L('コピーしました','Copied'),'ok'));
}
function _shareRef(){
  const url = document.getElementById('sRefUrl')?.value;
  if(!url) return;
  const text = '【MY AI Agent】このリンクから登録すると、あなたと私それぞれに ¥500 もらえます 🎁\n' + url;
  if(navigator.share){
    navigator.share({title: 'MY AI Agent 紹介', text, url}).catch(()=>{});
  } else {
    location.href = 'https://line.me/R/msg/text/?' + encodeURIComponent(text);
  }
}

function exportData(kind){
  if(kind==='agents'){
    var payload={
      exported_at:new Date().toISOString(),
      user:{id:me&&me.id, email:me&&me.email, name:me&&me.name, plan:me&&me.plan},
      agents:agents||[]
    };
    _downloadBlob('myaiagent-export-'+Date.now()+'.json', JSON.stringify(payload,null,2), 'application/json');
    showToast(isJa?'エクスポートしました':'Exported','ok');
  } else if(kind==='history'){
    api('GET','/api/usage').then(function(r){
      var rows=[['date','type','agent','cost_usd','cost_jpy','credit_usd','plan']];
      (r.recent_history||[]).forEach(function(it){
        var t=it.type||'usage';
        rows.push([
          it.date||'',
          t,
          (it.agentName||'').replace(/,/g,' '),
          it.cost_usd!==undefined?String(it.cost_usd):'',
          it.cost_jpy!==undefined?String(it.cost_jpy):'',
          it.amount_cents_usd?String(it.amount_cents_usd/100):'',
          it.plan||''
        ]);
      });
      var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
      _downloadBlob('myaiagent-history-'+Date.now()+'.csv', csv, 'text/csv;charset=utf-8');
      showToast(isJa?'CSVをダウンロード':'CSV downloaded','ok');
    }).catch(function(){ showToast(isJa?'取得に失敗':'Fetch failed','ng'); });
  }
}
async function importAgentsFile(input){
  var file=input.files&&input.files[0];
  if(!file) return;
  try{
    var text=await file.text();
    var data=JSON.parse(text);
    var imported=Array.isArray(data)?data:(data.agents||[]);
    if(!imported.length){ showToast(isJa?'インポート可能なエージェントがありません':'No agents to import','ng'); return; }
    if(!confirm(_fmtT(isJa?'{n} 体のエージェントをインポートしますか？':'Import {n} agents?',{n:imported.length}))) return;
    var ok=0, fail=0;
    for(var i=0;i<imported.length;i++){
      var a=imported[i];
      try{
        var r=await api('POST','/api/agents',{
          avatar:a.avatar||'🤖', name:(a.name||'Agent').slice(0,40),
          skills:Array.isArray(a.skills)?a.skills:['writing'],
          persona:a.persona||''
        });
        agents.push(r.agent); ok++;
      } catch(e){ fail++; }
    }
    renderAgList();
    showToast(_fmtT(isJa?'{ok}体インポート（{fail}体失敗）':'Imported {ok} ({fail} failed)',{ok:ok,fail:fail}),'ok');
  } catch(e){
    showToast(isJa?'JSONの読み込みに失敗':'Failed to read JSON','ng');
  }
  input.value='';
}
async function clearAllChatHistory(){
  if(!confirm(isJa?'全エージェントの会話履歴を削除しますか？\n（エージェント自体は残ります）':'Clear chat history of all agents?\n(Agents themselves stay)')) return;
  try{
    await api('POST','/api/user/clear-chat-history',{});
    agents.forEach(function(a){ a.history=[]; });
    if(activeId){ var ag=agents.find(function(a){return a.id===activeId;}); if(ag) renderMsgs(ag); }
    showToast(isJa?'会話履歴を削除しました':'Chat history cleared','ok');
  } catch(e){
    showToast(isJa?'削除に失敗':'Failed to clear','ng');
  }
}
function preregisterCreator(){
  _prefSet('creator_preregistered','1');
  var btn=document.getElementById('sCreatorPre');
  if(btn){ btn.textContent=isJa?'✓ 事前登録済み':'✓ Pre-registered'; btn.disabled=true; btn.style.opacity='.6'; btn.style.cursor='default'; }
  showToast(isJa?'リリース時にメールでお知らせします':'We will email you at release','ok');
}
async function changePassword(){
  const cur = document.getElementById('sCurPw').value;
  const np = document.getElementById('sNewPw').value;
  const cp = document.getElementById('sConfPw').value;
  if(!cur||!np){ showToast(L('全ての項目を入力してください','Please fill in all fields'),'err'); return; }
  if(np!==cp){ showToast(L('新しいパスワードが一致しません','New passwords do not match'),'err'); return; }
  if(np.length<8){ showToast(L('パスワードは8文字以上にしてください','Password must be at least 8 characters'),'err'); return; }
  try{
    await api('PATCH','/api/user/password',{current_password:cur,new_password:np});
    showToast(L('パスワードを変更しました','Password changed'),'ok');
    document.getElementById('sCurPw').value='';
    document.getElementById('sNewPw').value='';
    document.getElementById('sConfPw').value='';
  }catch(e){ showToast(e.message||'変更に失敗しました','err'); }
}
async function deleteAccount(){
  const typed = (document.getElementById('sDelConfirm').value || '').trim();
  // Accept either the JA phrase or "DELETE" so EN users have a sensible confirm
  if(typed !== '削除する' && typed.toUpperCase() !== 'DELETE'){
    showToast(L('「削除する」または「DELETE」と入力してください','Type "DELETE" to confirm'),'err');
    return;
  }
  if(!window.confirm(L(
    '本当にアカウントを完全削除しますか？\n\n全てのエージェント・会話・残高が失われます。\nこの操作は取り消せません。',
    'Permanently delete your account?\n\nAll agents, chats, and balance will be lost.\nThis cannot be undone.'
  ))) return;
  try{
    await api('DELETE','/api/me', { confirm: 'DELETE' });
    showToast(L('アカウントを削除しました','Account deleted'),'ok');
    setTimeout(()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); location.href='/'; },1500);
  }catch(e){ showToast(e.message || L('削除に失敗しました','Delete failed'),'ng'); }
}
function quickCharge(amount){
  // Settings → Add Credits shortcut: open the new billing modal on PAYG tab w/ amount preset
  closeSettings();
  openCharge();
  if(typeof bsTab==='function') bsTab('payg');
  if(typeof bsPickPayg==='function') bsPickPayg(amount);
}

function showToast(msg,type='ok'){
  const t=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  t.className='toast '+type+' on';
  clearTimeout(toastT);
  toastT=setTimeout(()=>t.classList.remove('on'),3200);
}

