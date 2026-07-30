# MCP-STACK-GUIDE.md — boardwalk-capital-demo 向け MCP 導入ガイド

> このリポジトリで Claude Code に MCP を繋ぐときの指針。
> 元ネタの「公式MCP 8選」記事を、**このプロジェクトの実態に合わせて選定し直した**ものです。
> 結論から言うと、8個は要りません。このサイトで効くのは実質 **2個** です。

---

## 0. なぜ「8個全部」ではないのか

元記事の最重要ポイントは「MCPを増やすほど賢くなるわけではない。今の作業に必要な3〜5個に絞れ。プロジェクトごとに変えろ」でした。
このリポジトリの実態は次の通りで、8個のうち大半が**そもそも接続する対象を持っていません**。

| このプロジェクトの事実 | 影響 |
|---|---|
| `index.html` 1枚＋多言語静的ページのみ（ビルドなし・依存パッケージなし） | フレームワークの最新仕様を引く必要が薄い → Context7 の価値が小さい |
| バックエンドなし・サーバーサイドなし | Sentry（本番エラー監視）の対象がない |
| ホスティングは **GitHub Pages**（`CNAME` = `boardwalkcapitalinc.com`） | Cloudflare の対象がない |
| 決済機能なし（問い合わせは Formspree のみ） | Stripe の対象がない |
| 課題管理は GitHub の PR/コミット運用 | Linear は現状の運用外 |
| デザインは既に実装済み（Figma 連携運用は不明） | Figma は「今後デザインを Figma で起こすなら」の条件付き |

→ 残るのは、**書いた画面が本当に崩れず表示されるかを検証する手段**と、**PR/レビューを横断する手段**。すなわち **Playwright** と **GitHub** です。

---

## 1. 結論：このリポジトリでの推奨

| MCP | このプロジェクトでの評価 | 理由 |
|---|---|---|
| **Playwright** | ◎ 最優先 | 28言語・RTL(アラビア語)・レスポンシブ・intro演出・フォーム。**目視で全部確認するのが一番つらい工程**をClaude自身に回させられる |
| **GitHub** | ○ 推奨（※後述） | PRのレビューコメント/CI/Issueを横断。ただしこの環境では既に組み込み済み |
| Context7 | △ 任意 | バニラHTML/CSS/JSなので出番は少ない。ただしフォームや新API（`fetch`/`Intl`等）で最新仕様を引きたい時のみ |
| Figma | △ 条件付き | 今後デザインをFigmaで起こす運用にするなら有効。現状は対象なし |
| Sentry / Cloudflare / Stripe / Linear | ✕ 対象なし | バックエンド・Cloudflare・決済・Linear運用がこのプロジェクトに存在しない |

**まず Playwright だけ入れて、検証の往復が消える体感を得る。** これが記事の言う「今日やること＝1つだけ」に相当します。

---

## 2. セットアップ

### 2-1. Playwright MCP（最優先）

このリポジトリはブラウザ（Chromium）が使える環境を想定しています。

```bash
# Claude Code に追加（プロジェクトスコープ推奨）
claude mcp add playwright npx @playwright/mcp@latest
```

または `.mcp.json` に直接：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

- 公式パッケージ: `@playwright/mcp`（提供元: microsoft）
- スクリーンショットではなく**アクセシビリティツリー**を読むので、見た目が似た要素を取り違えにくい。
- このサイトは**ローカルで静的配信するだけ**で確認できます（ビルド不要）:
  ```bash
  python3 -m http.server 8000   # → http://localhost:8000
  ```

### 2-2. GitHub MCP

- 公式リポジトリ: https://github.com/github/github-mcp-server
- **注意:** この Claude Code 実行環境では GitHub MCP は既に組み込み済みです。ローカルの Claude Code で使う場合のみ、公式手順で別途接続してください。
- 価値が出るのは「gitコマンド」ではなく、**リモート側にしかない情報**（PRレビューコメント・CI結果・Issue・過去の議論）を横断するときです。

### 2-3. Context7（任意）

```bash
claude mcp add context7 npx @upstash/context7-mcp@latest
```

- 公式パッケージ: `@upstash/context7-mcp`（提供元: upstash）
- ホスト版もあり: `https://mcp.context7.com/mcp`（`Authorization: Bearer <API_KEY>`）
- このプロジェクトでは常用不要。1回の問い合わせに複数概念を混ぜないこと。

---

## 3. このサイト専用：Playwright 検証プロンプト

`refactor-instructions.md` の「Behaviors To Preserve（絶対に壊してはいけない挙動）」に対応させた検証手順です。
実装や修正のあとに、そのまま貼って使えます。

```
ローカルで `python3 -m http.server 8000` を起動し、Playwright MCP で
http://localhost:8000 を開いて、以下を実際に操作して検証してください。
コードを読むだけで推測せず、必ずブラウザ上で再現・確認すること。

1. 言語切替: ?lang=ja / ?lang=en / ?lang=zh-Hant で本文が切り替わるか
2. RTL: ?lang=ar で dir="rtl" になり、レイアウトが破綻していないか
3. 言語別フォント: ar / hi でフォントが切り替わるか
4. 未翻訳キー: メニュー外言語(例 ?lang=pl)で英語フォールバックされるか
5. intro演出: 約1.9秒で自動終了し、クリック等で即スキップできるか
6. スクロール演出: ヘッダーのソリッド化、reveal、統計表示が出るか
7. 問い合わせフォーム: 必須同意チェック・送信中のボタン無効化・
   インライン通知が動くか（Formspreeへの本番送信は行わないこと）
8. レスポンシブ: 375px幅（スマホ）でヘッダー/メニュー/各セクションが崩れないか
9. モバイルメニュー: 開閉とbodyスクロールロック

崩れ・不具合があれば、ブラウザ上で再現してから修正し、
同じ手順を再実行して成功を確認してから完了と報告してください。
```

> フォームは Formspree（`https://formspree.io/f/mwvdgvlb`）へ実送信されます。**検証で実際の送信は行わない**か、送信直前で止めること。

---

## 4. 元記事「公式MCP 8選」早見表

| # | MCP | 目的 | 公式 |
|---|---|---|---|
| 1 | Context7 | ライブラリ最新ドキュメントをバージョン別に参照させ、古い/存在しないコード生成を防ぐ | github.com/upstash/context7 |
| 2 | Playwright | Claude自身にブラウザを操作させUIを検証 | github.com/microsoft/playwright-mcp |
| 3 | Figma | 画像でなく設計データ（色・余白・トークン・コンポーネント）を直接読ませる | developers.figma.com/docs/figma-mcp-server |
| 4 | Linear | Issue検索/作成/更新/コメントを Claude 内で完結 | linear.app/docs/mcp |
| 5 | Sentry | 本番エラーを貼らずに原因調査・再現・修正 | docs.sentry.io/product/sentry-mcp |
| 6 | Cloudflare | デプロイ先の状態確認・設定改善 | developers.cloudflare.com/agents/model-context-protocol |
| 7 | Stripe | 決済コードと Stripe 側設定の突き合わせ | docs.stripe.com/mcp |
| 8 | GitHub | PR/レビュー/CI/Issue を横断しレビュー対応まで閉じる | github.com/github/github-mcp-server |

> リンク先の**認証方式と要求権限は接続前に必ず確認**すること（料金・提供条件は変動します）。

---

## 5. 安全設計（記事の「落とし穴」より・このリポジトリ向け）

このサイトは**本番稼働中のコーポレートサイトで、main への push がそのまま本番デプロイ**です。以下は必須。

1. **繋ぎすぎない。** まず Playwright 1個。効果を体感してから足す。候補が増えるほど Claude はツールを取り違える。
2. **読み取りと書き込みを分ける。** 読み取りは許可 / 作成・更新は確認を挟む / 削除・本番操作は拒否。
3. **公式とコミュニティ製を混同しない。** 提供元の公式組織か、最終更新はいつか、要求権限は何かを接続前に確認。本パッケージ名は §2 の通り（`@playwright/mcp` / `@upstash/context7-mcp`）。
4. **外部から来た文章をそのまま実行させない。** Issue や PR コメント（他人が書いた文章）を読ませて実装させるときは、**何をしようとしているかを一度提示させてから**動かす。
5. **`main` へ直接コミットしない。** 作業はブランチで行い、PR を経由する（本番即時反映のため）。
6. **SEO/デプロイ資産に触らない。** `CNAME` / `robots.txt` / `sitemap.xml` / `google*.html` / `.nojekyll` は検証・変更対象外。

---

## 6. 今日やること（1つだけ）

Claude Code と別画面を一番往復している工程は、このサイトでは
**「多言語・RTL・レスポンシブが崩れていないかの目視確認」** です。
まず **Playwright だけ** を入れて（§2-1）、§3 の検証プロンプトを一度回してください。
その往復が消える体感を得てから、次の MCP を検討します。
