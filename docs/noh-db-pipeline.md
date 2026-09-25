# 演目DB パイプライン（Phase 1）

Excel原本（Master）から公開用データ（Public）を生成する処理の手引き。
設計の背景は `docs/noh-db-phase0-mapping.md` を参照。

## データの層と配置

| 層 | 置き場所 | git |
|---|---|---|
| Master（Excel原本） | `private-data/noh/*.xlsx` | **除外** |
| Normalized（raw＋正規値＋内部メモ） | `data/generated/normalized/` | **除外** |
| Public（公開のみ） | `data/generated/public/` | 追跡 |
| Editorial（人手管理） | `data/editorial/*.json` | 追跡 |
| 辞書 | `data/schema/dictionaries/*.json` | 追跡 |

Excel原本は公開リポジトリに置かない。内部メモ・出典前文章・権利未確認テキストを含むため。
クローン後は原本を各自 `private-data/noh/` に配置する（ファイル名は `import_workbook.py` の定数に一致させる）。

## 実行

```bash
npm run noh:all      # 通し（import→validate→normalize→build→rights）
npm run noh:test     # 公開データの不変条件テスト
```

工程は単独でも実行できる。

```bash
npm run noh:import     # Excel → raw.json（唯一 Excel に触れる。Python + openpyxl）
npm run noh:validate   # スキーマ・参照整合性（停止エラーと警告を区別）
npm run noh:normalize  # 正規化（raw保持＋正規値＋4状態＋provenance）
npm run noh:build      # 公開ホワイトリスト適用（内部メモ除去・summaryゲート）
npm run noh:rights     # 権利検査（内部キー流出・未許可公開を検出したら停止）
```

依存：`import_workbook.py` は openpyxl を使う（`python -m pip install openpyxl`）。
exceljs は当該ブックを開けなかったため採用していない。Excel を読む工程はこの一箇所だけで、
以降は Node が `raw.json` を読む。

## UI からの利用

UIコンポーネントは公開JSONを直接読まず、Repository 層だけを使う。

```ts
import { getPlayBySlug, listPlays, comparePlays } from '@/lib/noh-data'
```

将来 DB へ移しても、この型（`lib/noh-data/types.ts`）と関数を保てばページ側の変更は小さい。

## 確定している方針（要点）

- 生値は必ず保持する。正規カテゴリは辞書化した分だけ付け、未収載は canonical=null（needs_review）。
- 「要確認」は正直に扱う。空欄の既定は unknown であって not_applicable ではない。
- `summary_short` は自動公開しない（公式解説由来のため）。公開は original かつ ready のみ。
- `TAG.confidence` は `basis`（客観／編集判断）。confidence ではない。約9割が editorial。
- Explore のファセットは TAG だけでなく、人物・関係・土地・典拠・構造・流儀から横断で作る。

## 既知のデータ課題（要手当）

- `title_en` が「要確認」または人名（例 N0189 佐渡＝金春信高）の曲が約97件。暫定 slug（`play-nXXXX`）を付け、`data/editorial/slugs.json` で `source:needs_review` と記録している。公開URLを整える際に手当てする。
- PERFORMANCE の面／作リ物／太鼓／間は大半が「要確認」。unknown/needs_review として正直に見せる。
