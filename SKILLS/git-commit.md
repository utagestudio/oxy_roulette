---
name: git-commit-message
description: このプロジェクトでは、以下のルールに従って Git コミットメッセージを作成してください。
metadata:
  version: "1.0.0"
---

# Skill Title
git commit 時のメッセージガイドライン

## Rules
- このプロジェクトでは、以下のルールに従って Git コミットメッセージを作成してください。
  1. **1行目**: 英語による簡潔な要約（最大50文字）。: の左に作業種類（Add とか Remove とか Update とか）
      - 例: `Update: site design to light theme`
  2. **2行目**: 空行。
  3. **3行目以降**: 日本語による詳細な変更内容の説明。
      - 箇条書きや具体的な変更点を含めてください。
  4. **フッター**: Junie を Co-author として追加。
      - `Co-authored-by: Junie <junie@jetbrains.com>`

## Examples
```text
Update: site design to light theme

サイト全体をダークテーマから、白と明るいグレーを基調としたモダンでクリーンなライトテーマへと刷新しました。
- Layout.astro: 背景色の変更
- Hero.astro: グラデーションの調整

Co-authored-by: Junie <junie@jetbrains.com>
```
