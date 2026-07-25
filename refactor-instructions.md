# refactor-instructions.md — boardwalk-capital-demo リファクタリング指示書

> 実装担当モデルへ: この文書に書かれたことだけを実施してください。
> 書かれていない変更(ついでの整形・全面書き換え・大きな削除)は禁止です。
> 判断に迷ったら実装を止め、「Stop And Ask Conditions」に従って質問してください。

---

## Objective

`index.html` 1ファイルに同居している HTML / CSS / JavaScript / 28言語分のi18n辞書のうち、
**確実に安全な範囲の負債**(二重定義CSS・未定義キー参照・データの二重管理)を、
**見た目と挙動を1pxも変えずに**削減する。

これは **本番稼働中のサイト**(GitHub Pages + 独自ドメイン `boardwalkcapitalinc.com`、CNAMEファイルで紐付け)である。
コーポレートサイトとしての信頼性が最優先。見た目の綺麗さのためのリファクタは目的ではない。

## Project Understanding

- **何か**: ボードウォーク・キャピタル株式会社(投資会社)のコーポレートサイト。1ページ完結の静的サイト。
- **構成**: `index.html`(約1290行)のみ。ビルドなし・依存パッケージなし・テストなし・CIなし。mainへのpushがそのまま本番デプロイ。
- **index.htmlの内訳**:
  - L48–489: インラインCSS(デザイントークン、セクション別スタイル、ネイビーテーマ上書き、RTL対応、レスポンシブ)
  - L491–718: HTML本体(intro演出 → header → hero → philosophy → cinematic → CEO message → track record → services → team → partners → news → contact → footer)
  - L720–1287: インラインJS
    - `LANGS`(メニュー掲載13言語) / `LANG_NAMES`(メニュー非掲載言語のラベル) / `I18N`(全28言語の辞書。L743–1097、ファイルの半分以上を占める)
    - `applyLang` / `detectLang`(L1100–1126): 言語適用。優先順位は **URL `?lang=` > localStorage `bwc_lang` > ブラウザ言語自動判定**。未翻訳キーは英語にフォールバック。`ar` のときのみ `dir="rtl"`
    - `NEWS`(L1146–1157): ニュース10件のデータ。`renderNews` が描画
    - `submitContact`(L1158–1169): Formspree(`https://formspree.io/f/mwvdgvlb`)へfetch POST
    - `PARTNERS`/`PURL`(L1192–1193): マーキー用8社(スラッグ→URL)
    - `CURL`(L1199–1211): グリッド用(日本語社名→URL)
    - `PCO`(L1214–1226): 投資先33社リスト
    - intro演出 / スクロールでheaderソリッド化 / IntersectionObserverによるreveal・カウントアップ / パララックス
- **外部依存**: Google Fonts(8ファミリー)、Formspree(問い合わせフォーム)。この2つだけ。
- **データフロー**: 静的。JSが `I18N`/`NEWS`/`PCO` 等のインラインデータからDOMを生成するのみ。サーバーサイドなし。

## Behaviors To Preserve(絶対に壊してはいけない挙動)

1. **i18n全体**: `?lang=xx` 強制(例 `?lang=pl`, `?lang=zh-Hant`)、`?lang=auto` でlocalStorageリセット、保存言語の復元、ブラウザ言語自動判定(メニュー13言語以外の15言語も自動判定対象)、未翻訳キーの英語フォールバック
2. **アラビア語のRTL**: `dir="rtl"` 切替とRTL用CSS(L347–358)
3. **言語別フォント**: `html[lang="ar"/"hi"/"th"]` のフォント切替(L342–345)
4. **問い合わせフォーム**: Formspreeへの送信、honeypot(`_gotcha`)、送信中のボタン無効化、成功/失敗アラート
5. **intro演出**: 約1.9秒で自動終了、wheel/touch/key/clickで即スキップ、終了後のDOM除去
6. **スクロール演出**: headerソリッド化(scrollY>40)、reveal再トリガー(視界に入るたび)、統計カウントアップ(`data-plain` は静的表示)、staggerディレイ、パララックス、マーキー(hover停止)
7. **SEO/メタ**: JSON-LD(Organization)、OGP、canonical、favicon一式、`CNAME`・`robots.txt`・`sitemap.xml`・`google4e4d1184d07ded76.html`(Search Console認証)には**一切触れない**
8. **prefers-reduced-motion** 対応(L485–488)
9. モバイルメニュー開閉とbodyスクロールロック

## Non-Negotiables

- 見た目(全ブレークポイント・全言語)のピクセル単位の同一性。視覚に影響する変更はこの指示書に明記されたもの以外禁止
- `main` ブランチへ直接pushしない。作業ブランチでコミットする
- 外部URL(Formspree、パートナー企業URL、Google Fonts)を変更・削除しない
- `I18N` の**翻訳文言そのもの**を書き換えない(キー削除はPhase指示の範囲のみ)
- localStorageキー名 `bwc_lang` を変えない(既存訪問者の保存言語が飛ぶ)
- 会社情報・経歴・ニュースなどの**コンテンツの事実**を変更しない

## Stop And Ask Conditions(実装を止めて人間に質問する条件)

- 削除対象がこの指示書に**明記されていない**のに「たぶん未使用」に見えたとき
- 変更の前後でスクリーンショット比較に差分が出たのに原因が特定できないとき
- `applyLang` / `detectLang` / `submitContact` のロジック変更が必要になったとき(この指示書はロジック変更を要求していない)
- ファイル分割(CSS/JS外部化)をしたくなったとき — **本指示書のスコープ外**(Out-of-scopeを参照)
- 下記「実装前に確認すべき質問」への回答が得られていない項目に踏み込むとき

## Baseline Commands(編集前に必ず実行し、結果を記録する)

ビルド・テスト・lintは存在しない。検証は「ローカル配信 + ブラウザ実測」で行う。

```bash
git status                      # 未コミット変更がないことを確認。あれば混ぜない
python3 -m http.server 8123 &   # ローカル配信
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8123/index.html   # 200
```

Playwright(chromiumは `/opt/pw-browsers/chromium`)で最低限以下を確認し、結果を記録する:

- `?lang=ja` / `?lang=en` / `?lang=ar` それぞれで: `document.documentElement.lang` と `dir`、hero見出しテキスト、`.news-card` が10件、`.pc`(投資先)が33件、console/pageエラーが0件であること
  - ※ Google Fontsへの `ERR_CONNECTION_RESET` はサンドボックスのネットワーク遮断によるもので無視してよい(2026-07-25のベースラインで確認済み)
- 各Phase完了ごとに同じチェックを再実行し、**ベースラインと同一**であることを確認する
- 望ましい追加検証: 各言語×PC/モバイル幅のフルページスクリーンショットを撮り、Phase前後でピクセル比較する

## Debt Map(証拠つき)

### D1. 二重定義・重複CSS 【安全に実装可】
- **`.creds` / `.contact` の二重スタイル**: L230–241で白基調として定義後、L317–340「桐蔭ネイビーのセクション」ブロックで背景・配色を全面上書き。前者の `background`/`border` 指定は死んでいる
- **`.creds .stat` hover等の完全重複**: L385–386 と L397–398 に `transition` と `:hover .n{color:#cfe0ff}` が二重に存在
- **`.navlinks a` のtransition二重定義**: L104 と L387
- **`@media(max-width:920px)` が2ブロック**(L435–439 と L441–460)に分裂
- **理由**: 段階的にデザイン変更した履歴がそのまま積層しており、「どちらが効いているか」を毎回目で追う必要がある
- **影響/リスク**: 低。カスケード順を保てば見た目不変
- **改善案**: 死んでいる宣言を削除し、同一セレクタの重複を統合。ネイビー上書きは各セクションの定義に畳み込むか、上書きブロックであることをコメントで明確化
- **検証**: 全ブレークポイント・スクリーンショット比較

### D2. 未使用CSS(対応するHTML要素が存在しない) 【安全に実装可】
- `.intro-mark` / `.intro-logo-wrap` / `.intro-logo` と `@keyframes markIn` / `introReveal`(L74–77, 84–86): `#intro` 内にはwordmarkとintro-lineしかない
- `.brand .bm`(L95–96, 101, 339, 426): HTML内に `class="bm"` の要素が存在しない(header/footerのbrandはwordmarkのみ)
- `.ft`(L238–241): 「The Banker」受賞フィーチャーボックスのスタイルだが、HTMLに `.ft` 要素がない(i18nの `cred.ft` キーと対。→ Q3)
- **検証**: `grep` で該当class名がHTML側に無いことを再確認 → 削除 → スクリーンショット比較

### D3. 参照されるが未定義のi18nキー `ct.err` 【安全に実装可(文言は英語フォールバック方針で)】
- `submitContact`(L1165–1166)が `I18N[CUR]["ct.err"]` を参照するが、**どの言語にも `ct.err` が定義されていない**。全言語で日本語のハードコード文言にフォールバックする(英語話者にも日本語アラートが出る)
- **改善案**: 少なくとも `ja` と `en` に `ct.err` を追加(例 ja:「送信に失敗しました。時間をおいて再度お試しください。」/ en: "Failed to send. Please try again later.")。他言語は既存の英語フォールバック機構に任せる
- **検証**: DevToolsでfetchを失敗させ(オフライン化)、言語ごとのアラート文言を確認

### D4. 未使用i18nキー群 【削除は質問の回答待ち。実装保留】
- `nav.*`(6キー×28言語): headerとモバイルメニューのナビリンク(L503–508, 524–529)には `data-i18n` が**付いておらず**英語固定。辞書だけが全言語分存在(→ Q1)
- `team.b3`(15言語超): 表示メンバーはb1/b2/b4の3名のみ。b3(早稲田・精密機器アナリスト)は非表示(→ Q2)
- `cred.ft` / `news.more`: 対応するUI要素がHTMLに存在しない(→ Q3)
- **理由**: ファイル肥大の主因のひとつ。ただし「消した機能」なのか「これから繋ぐ機能」なのかコードからは判定不能
- **今やってよいか**: **不可**。質問への回答後にのみ実施

### D5. パートナーURLの二重管理 【安全に実装可】
- `PURL`(スラッグ→URL、L1193)と `CURL`(日本語社名→URL、L1199–1211)で同じ8社のURLを二重管理。片方だけ直すと乖離する
- **改善案**: 1つの配列(社名・英名・スラッグ・URL)に正規化し、`PURL`/`CURL`/`PCO` をそこから導出。**掲載順・掲載内容は現状と完全一致させる**(PCOの並びは「上場を時価総額順→非上場」という意味のある順序。コメントL1213を保持)
- **検証**: マーキーのリンク8件と、グリッド33件のリンク有無・URL・表示順がベースラインと完全一致すること

### D6. 未使用画像アセット 【削除は質問の回答待ち。実装保留】
- `index.html` から参照されていない画像: `img/hero-alt2.jpg`(449KB)、`img/partner/apaman.png`(コメントL1213に「APAMANは掲載除外」と明記)、`img/partner/top_partner_pc.png`、`img/about/top_about_pc.png`、`img/message/banner_kakugo.png`・`bg_message.png`・`section4_img1.png`・`top_message_pc.png`、`img/top/bg_news.png`・`section6_img1.png`・`top_sp.png`
- **注意**: 静的ホスティングでは外部(メール・SNS・他サイト)から画像へ直リンクされている可能性をコードから否定できない(→ Q4)。**回答があるまで削除しない**

### D7. `applyLang` のinnerHTML注入ヒューリスティック 【提案のみ・実装しない】
- L1107: `data-i18n-html` 属性が無くても値に `<span`/`<br` を含めば `innerHTML` で挿入する。辞書は静的なので現状の実害はないが、「翻訳値にHTMLを書けるかどうか」の契約が暗黙的
- **提案**: HTML許可キーを `data-i18n-html` 属性側に一本化(全該当要素に属性を付け、正規表現判定を撤去)。挙動同一だが変更点が多いため、実施は人間の承認後

### D8. 巨大画像・キャッシュ抑止メタ 【提案のみ・実装しない】
- `img/hero.jpg` 445KB、`img/hero-alt.jpg` 588KB。`<meta http-equiv="Cache-Control" content="no-cache...">`(L6–8)が全リソースの再取得を促し、表示速度に不利
- **提案**: 画像のWebP化・圧縮、no-cacheメタの削除はパフォーマンス改善として有効だが、**視覚品質とキャッシュ挙動が変わる**ため人間の承認後

## Implementation Phases(小さく・安全な順)

各Phaseは独立した1コミット。Phase完了ごとにBaseline Commandsの検証を再実行し、差分ゼロを確認してから次へ進む。

- **Phase 0 — ベースライン記録**: `git status` 確認 → ローカル配信 → 3言語スモークとスクリーンショットを記録(コミット不要)
- **Phase 1 — 未定義キー修正(D3)**: `ja`/`en` に `ct.err` を追加。差分は2行
- **Phase 2 — 未使用CSS削除(D2)**: `.intro-mark`系・`.brand .bm`系・`.ft` と対応keyframesを削除。※ `.ft` はQ3の回答が「復活予定あり」なら削除せずスキップ
- **Phase 3 — 重複CSS統合(D1)**: 完全重複の宣言(L385–386 vs L397–398、L104 vs L387)を統合 → 死んだ `.creds`/`.contact` の初期定義を整理 → 2つの920pxメディアクエリを統合。**1操作=1コミットに分けてもよい**
- **Phase 4 — パートナーデータ正規化(D5)**: 単一ソース化。表示結果の完全一致を検証
- **Phase 5 —(回答待ち)未使用i18nキー削除(D4)・未使用画像削除(D6)**: 質問の回答が得られた項目のみ実施
- **Phase 6 —(承認後のみ)D7/D8**: 本指示書では提案止まり。承認なしに着手しない

## Verification Requirements

- 各Phase後: ローカル配信 + Playwrightスモーク(ja/en/ar、lang/dir/hero/news10件/pc33件/エラー0)がベースラインと一致
- Phase 3・4後: PC幅(1280px)とモバイル幅(390px)のフルページスクリーンショットをベースラインとピクセル比較
- Phase 4後: マーキー8リンク・グリッド33項目のURLと順序を機械的に照合(DOMをdumpして diff)
- 最終: `git diff main --stat` を確認し、意図した範囲以外のファイルに差分がないこと

## Reporting Format(最終報告に必ず含める)

1. 実施したPhaseと各コミットのハッシュ・要約
2. 各Phaseで実行した検証コマンドと**実際の出力**(予測ではなく実測)
3. ベースラインとの差分比較の結果(スクリーンショット比較を含む)
4. 実施しなかった項目とその理由(回答待ち/承認待ち/スコープ外)
5. 作業中に新たに発見した負債(あれば。勝手に直さないこと)

## Out-of-scope Items(今回はやらない)

- CSS/JS/i18n辞書の**外部ファイルへの分割**: キャッシュ挙動・読み込み順・デプロイ構成が変わるため、本番サイトでは人間の承認が必要
- フレームワーク導入・ビルドパイプライン導入・TypeScript化
- 画像最適化・no-cacheメタ削除(D8)
- i18n翻訳品質の見直し、コンテンツの追加・修正
- `sitemap.xml` / `robots.txt` / JSON-LD等のSEO要素の変更
- アクセシビリティ改善(別タスクとして提案価値はある)

---

## 実装前に確認すべき質問(人間への質問。回答があるまで該当Phaseは保留)

- **Q1**: ナビリンク(TOP/ABOUT/CEO MESSAGE/PARTNERS/EVENT/CONTACT)は英語固定が意図ですか? 意図なら `nav.*` キー(6キー×28言語)は削除できます。逆に「翻訳されるべきだった」なら `data-i18n` の付け忘れというバグであり、キーを繋ぐ修正になります(なお `nav.news`=「ニュース」とリンク表示「EVENT」のように文言も一致していません)。
- **Q2**: `team.b3`(早稲田・精密機器アナリストの経歴、15言語超で翻訳済み)は現在どのメンバーにも使われていません。過去メンバーの残骸として削除してよいですか? それとも掲載予定がありますか?
- **Q3**: `cred.ft`(The Banker受賞のフィーチャーボックス文言)と `news.more`(「すべて見る」ボタン文言)に対応するUIは存在しません。削除してよいですか? 復活予定はありますか?
- **Q4**: 未使用画像(D6のリスト、合計約1.5MB。`apaman.png` 含む)は、メール署名やSNS等から直リンクされている可能性はありますか? なければリポジトリから削除できます。
