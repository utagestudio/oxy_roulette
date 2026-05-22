# Stellar Picker

Stellar Picker は、配信や作業の「やることリスト」からランダムに1件を選ぶ、ブラウザ向けのオンラインルーレット抽選ツールです。

円形ルーレットではなく、対象項目をグリッド表示し、セルのハイライト演出で抽選中の動きを見せます。配信冒頭で今日の作業、企画、夕飯などを視覚的に決める用途を想定しています。

公開URL: https://stellar-picker.utage.games/

## Features

- リスト形式のルーレット抽選
- 抽選対象、非対象、抽選済みの3状態管理
- `Start` / `Confirm` による未確定結果と確定結果の分離
- 3つの保存スロットとタブ名編集
- ペーストによる複数項目の一括追加
- 1番目のスロットに夕飯のおかずサンプル20件を初期設定
- `localStorage` による項目、状態、スロット、表示言語の保存
- 日本語 / 英語の表示切り替え
- ヘルプモーダル、初期化、トースト通知
- Google Tag Manager の同意後ロード
- SEO / OGP / Twitter Card / JSON-LD / sitemap / llms.txt 対応

## Usage

1. ページを開きます。
2. 必要に応じて、項目管理パネルで抽選対象を調整します。
3. メモ帳などで1行1項目のリストを作り、アプリがアクティブな状態で貼り付けると一括追加できます。
4. `スタート` / `Start` で抽選します。
5. 結果を採用する場合だけ `確定` / `Confirm` を押します。

初回起動時は、すぐ試せるように「今夜の夕飯」スロットへサンプル項目が入っています。

## Tech Stack

- Vite
- React
- TypeScript
- Sass

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Preview built files:

```bash
npm run preview
```

## Environment Variables

Google Tag Manager を使う場合は、`.env` またはホスティング環境変数に次を設定します。

```env
VITE_GTM_ID=GTM-XXXXXXX
```

`VITE_GTM_ID` が未設定の場合、GTM 関連の同意バナーやタグ読み込みは行われません。

`VITE_GTM_ID` が設定されている場合でも、ユーザーが同意するまで GTM スクリプトは読み込まれません。同意状態は `localStorage` に保存され、ヘルプモーダルからプライバシー設定を変更できます。

実値入りの `.env` はコミットしないでください。設定例は `.env.example` を参照してください。

## Persistence

ルーレットデータは `localStorage` の `oni-roulette-v1` に保存されます。

保存対象:

- アクティブな保存スロット
- 3つのスロット
- 各スロットの項目、状態、未確定の抽選結果
- 更新日時

表示言語とトラッキング同意状態は別キーで保存します。

ヘルプモーダルの `初期状態に戻す` から、保存済みデータを削除して初期状態に戻せます。

## Public Assets

- `public/logo.png`: ヘッダー用ロゴ
- `public/ogp.png`: OGP / Twitter Card 画像
- `public/favicon.png`: favicon
- `public/robots.txt`: クロール設定
- `public/sitemap.xml`: サイトマップ
- `public/llms.txt`: AI検索向け概要

## Project Notes

詳細な仕様や運用ルールは `AGENTS.md` を参照してください。

作業後のコミットメッセージは `SKILLS/git-commit.md` のルールに従います。
