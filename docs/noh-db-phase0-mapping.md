# Phase 0 — 演目DB 設計固定書（Excel → Web マッピング）

`noh_play_database_v0_12_249plays_L2_complete.xlsx`（249曲・Level 2）を、Webの検索・比較・回遊・分析基盤へ接続するための、実装前の合意文書である。ここで確定した公開項目・非公開項目・正規化方針に沿って Phase 1 を実装する。

この文書は実装コードではない。実データ（v0.12）を突き合わせて確認した結果に基づく。列名・値はすべて実ファイルから採取した。

関連：`docs/writing-style.md`（記事の構成と態度）、`docs/japanese-prose.md`（一文の骨格）、指示書『beyond-nohgaku_db_explore_analysis_design_instruction.md』。

---

## 0. 確定した方針

利用者との合意（確定）。以降の判断はすべてこれに従う。

1. **正規化辞書は全件人力整備しない。** 高頻度値と主要導線（橋弁慶・船弁慶・安宅ほか義経系）に関わる値を優先する。`character_type` / `relationship_type` / `ending_tag` は **raw値を保持**し、正規カテゴリ未設定のものは `needs_review`。**生値は絶対に捨てない。**
2. **「要確認」は正直に扱う。** `known` / `not_applicable` / `unknown` / `needs_review` を区別する。空欄・要確認を「該当なし」とみなさない。公開画面では断定せず「未確認」「確認中」「データ未整備」として見せる。
3. **`summary_short` は自動公開しない。** 公式解説・他サイト由来の可能性があるため初期Publicから除外する。公開するのは `sourcePolicy=original` または人手で自前確認済みの文章だけ。記事本文はDBから自動生成しない。
4. **`TAG.confidence` を `confidence` として型定義しない。** `tag_basis`（客観／編集判断）として扱う。類似・connection では客観タグと編集タグを別レイヤーにする。
5. **Explore のファセットは TAG だけから作らない。** TAG / CHARACTER / RELATIONSHIP / LOCATION / SOURCE / STORY_PATTERN / PLAY_SCHOOL を横断する。
6. 本Phase 0 の文書合意が取れてから Phase 1 実装に入る。

---

## 1. データ検証結果（v0.12）

- 15シート、演目 **249曲**、`play_id` は `N0001`〜`N0249` で統一（例外なし）。
- **参照整合性は健全。** 全子テーブルの `play_id` が PLAY に存在（orphan 0）。RELATIONSHIP の `character_a_id` / `character_b_id` は全件 CHARACTER に解決（欠落 0・空 0）。
- PERFORMANCE と INTERPRETATION のみ **150曲**ぶん（99曲は未整備）。他テーブルは249曲を網羅。
- **TAG_MASTER の 269 vs 869 は解決。** 正規タグは **269件**（`status` が `core` 264 / `extended` 5）。残り600行は末尾の空行。正規辞書＝269件で扱う。
- `maturity_level` は全249曲が `L2`（現時点で一律）。将来のLevel差スコア補正は今は無効化してよいが、フィールドは保持する。

### 1.1 設計書の型と実データのズレ（要注意）

指示書のクリーンな enum 型と、実データの自由記述はかなり違う。分類列の多くが**日本語自由記述＋ロングテール＋複合値（`A・B`, `A→B`）＋「要確認」混在**である。

| 列 | 実データの実態 | 対応 |
|---|---|---|
| `PLAY.author_confidence` | 要確認145・不詳59・有力35・伝・有力5・高2… (8種) | confidence正規化辞書（列別） |
| `PLAY.period` | 室町期108・**要確認93(37%)**・室町前期39… (11種) | period正規化＋unknown |
| `PLAY.noh_structure` | 夢幻能98・現在能79・現在能的66・夢幻能的4・複合型1・儀式能1 | 6値グルーピング |
| `CHARACTER.character_type` | **406種 / 738行**（ほぼ一意） | raw保持＋上位型辞書 |
| `CHARACTER.ontological_state` | 31種、`生者→亡霊`等の遷移値 | 遷移の意味を保持 |
| `RELATIONSHIP.relationship_type` | **303種 / 455行** | raw保持＋関係型辞書 |
| `LOCATION.location_type` | 54種、`寺社・都市・異界`等の複合 | 複合を配列に分解 |
| `STORY_PATTERN.ending_tag` | 100種、`父子再会・帰郷`等 | raw保持＋結末辞書 |
| PERFORMANCE 系（面/作リ物/太鼓/間） | **150曲中 ~145 が要確認** | unknown として正直に |

**朗報：** `STORY_PATTERN.sequence` は既に ` → ` 区切りの段階列（例：`旅僧来訪 → 女が業平との恋を語る → …`）。構造指紋にそのまま分解できる。

---

## 2. 四層と配置

指示書§3.2の四層を守る。UIは Public / Derived しか読まない。

| 層 | 実体 | 置き場所 | 生成 |
|---|---|---|---|
| Master | Excel原本 | `private-data/noh/…xlsx`（.gitignore） | 手（研究・編集） |
| Normalized | 正規化済み内部データ（raw＋正規値＋provenance） | `data/generated/normalized/`（内部・非公開想定） | スクリプト |
| Public | 公開ホワイトリストのみ | `data/generated/public/` | スクリプト |
| Derived | 検索索引・connection・類似・分析 | `data/generated/indexes/` `…/analysis/` | スクリプト |
| Editorial | 人が管理するWeb固有情報（slug・公開可否・権利・自前文章・手動関係） | `data/editorial/*.json` | 手 |

`private-data/` は `.gitignore` へ追加する。**Excel原本を公開リポジトリにコミットしない**（内部メモ・出典前文章・権利未確認テキストを含むため）。

---

## 3. Excel列 → Webスキーマ マッピング表

凡例：**公開**＝初期Publicに出す ／ **内部**＝Normalizedに保持しPublicに出さない ／ **編集ゲート**＝人手確認後のみ公開 ／ **キー**＝結合用ID（表示しない）。

### PLAY（249）
| 列 | 区分 | Web先 | 備考 |
|---|---|---|---|
| play_id | キー | `id` | 安定主キー。slug変更でも不変 |
| title | 公開 | `title` | |
| title_kana | 公開 | `titleKana` | |
| title_en | 公開 | `titleEn` | |
| author | 公開 | `author` | `不詳`は unknown 表示 |
| author_confidence | 公開 | `authorConfidence` | 列別confidence正規化 |
| period | 公開 | `period` | `要確認`→unknown |
| noh_structure | 公開 | `nohStructure` | 6値グルーピング |
| structure_detail | 編集ゲート | — | 自由記述。初期非公開 |
| season_general | 公開 | `seasonGeneral` | 複合(`夏〜秋`)は配列化 |
| main_location | 公開 | `mainLocationLabel` | 表示用ラベル。地理はLOCATION優先 |
| primary_source | 公開 | `primarySourceLabel` | 典拠ラベル。正規化はSOURCE側 |
| **summary_short** | **編集ゲート** | — | **能楽協会等の解説由来。自動公開しない** |
| core_themes | 内部/編集ゲート | — | 自由記述。タグへ正規化して間接利用 |
| maturity_level | 公開 | `maturityLevel` | 現状一律L2 |
| editorial_flag | 内部 | — | 編集メモ。公開しない |
| source_url | 内部 | `provenance` | 事実確認・追跡用。本文公開の根拠にしない |

### PLAY_SCHOOL（1,245）
| 列 | 区分 | Web先 |
|---|---|---|
| play_school_id / play_id | キー | 結合 |
| school | 公開 | `schools[].school`（観世/金春/宝生/金剛/喜多） |
| classification | 公開 | `schools[].classification`（例 `略二 四`） |
| season | 公開 | `schools[].season` |
| confidence | 公開 | `schools[].confidence`（`確定`等） |
| source_note | 内部 | — |
| source_url | 内部 | provenance |

### CHARACTER（738）
| 列 | 区分 | Web先 | 備考 |
|---|---|---|---|
| character_id / play_id | キー | 結合 | |
| role | 公開 | `role` | シテ/ワキ/子方/アイ…（`前後シテ`等の複合あり） |
| character_name | 公開 | `name` | |
| character_type | 公開(raw)＋派生 | `typeRaw` / `typeCanonical?` | **406種。rawは必ず出す。正規型は辞書化分のみ** |
| ontological_state | 公開(raw)＋派生 | `stateRaw` / `stateCanonical?` | 遷移値(`生者→亡霊`)を保持 |
| dramatic_function | 公開 | `dramaticFunction` | |
| confidence | 内部 | `confidence`(正規化) | `中〜高`等。列別正規化 |
| source_note / source_url | 内部 | provenance | |

### RELATIONSHIP（455）
| 列 | 区分 | Web先 | 備考 |
|---|---|---|---|
| relationship_id / play_id | キー | 結合 | |
| character_a_id / b_id | キー | 端点参照 | CHARACTERへ解決 |
| character_a / character_b | 公開 | `a` / `b` | 表示名 |
| relationship_type | 公開(raw)＋派生 | `typeRaw` / `typeCanonical?` | **303種。raw保持。正規型は辞書化分** |
| relationship_note | 編集ゲート | — | 自由記述。初期非公開 |
| confidence | 派生 | `basis`/`confidence` | `編集判断`は編集レイヤー印として使う |
| source_url | 内部 | provenance | |

### LOCATION（249）
| 列 | 区分 | Web先 | 備考 |
|---|---|---|---|
| location_id / play_id | キー | 結合 | |
| historical_name | 公開 | `historicalName` | |
| modern_name | 公開 | `modernName` | |
| prefecture | 公開 | `prefecture` | 複合(`兵庫県・大阪府`)は配列。`該当なし`/`海中世界`/`インド`はnot_applicable系を区別 |
| location_type | 公開(raw)＋派生 | `typeRaw`/`typeCanonical[]?` | 複合を分解 |
| scene | 公開 | `scene`（主舞台等） | |
| confidence | 内部 | confidence(正規化) | `要地理検証`等 |
| source_url | 内部 | provenance | |

### SOURCE（267）
| 列 | 区分 | Web先 | 備考 |
|---|---|---|---|
| source_id / play_id | キー | 結合 | |
| source_name | 公開 | `name` | |
| source_type | 公開(raw)＋派生 | `typeRaw`/`typeCanonical?` | 43種。軍記/説話/公式DB等へ束ねる |
| relation_type | 公開(raw)＋派生 | `relationRaw`/`relationCanonical?` | `主要素材`等 |
| note | 編集ゲート | — | 自由記述 |
| confidence | 派生 | basis/confidence | `編集整理`等 |
| source_url | 内部 | provenance | |

### TAG（3,913）
| 列 | 区分 | Web先 | 備考 |
|---|---|---|---|
| play_tag_id / play_id | キー | 結合 | |
| tag_category | 公開 | `category`（8種） | Situation/Theme/Emotion/Experience/Motif/Season/Form/Ending |
| tag_value | 公開 | `value`（正規化） | TAG_ALIASで正規タグへ寄せる |
| **confidence** | **派生（改名）** | **`basis`** | **§6参照。`客観`/`編集判断`。confidenceではない** |
| source_url | 内部 | provenance | |

### STORY_PATTERN（249）
| 列 | 区分 | Web先 | 備考 |
|---|---|---|---|
| story_pattern_id / play_id | キー | 結合 | |
| sequence | 公開＋派生 | `sequenceRaw` / `steps[]` | ` → ` で分解し順序保持の構造指紋に |
| ending_tag | 公開(raw)＋派生 | `endingRaw` / `endingCanonical?` | **100種。raw保持。辞書化分のみ正規** |
| confidence | 派生 | basis | 多くが`編集判断` |
| maturity_level / source_url | 内部 | — / provenance | |

### PERFORMANCE（150）
| 列 | 区分 | Web先 | 備考 |
|---|---|---|---|
| performance_id / play_id | キー | 結合 | |
| tsukurimono_present / _type | 公開 | `tsukurimono`(4状態) | 大半 `要確認`→unknown |
| ai_present / ai_type | 公開 | `ai`(4状態) | 同上 |
| taiko_status | 公開 | `taiko`(4状態) | 同上 |
| performance_highlight | 編集ゲート | — | 自由記述。初期非公開 |
| source_note | 内部 | — | |
| confidence / source_url | 内部 | — / provenance | |

> 名称衝突注意：Excelの `PERFORMANCE` は**舞台構造・演出情報**。現在の公演予定（`CurrentPerformance`）とは別物。コード上で明確に分ける（指示書§17）。

### INTERPRETATION（150）
| 列 | 区分 | 備考 |
|---|---|---|
| 全列 | **編集ゲート（初期全非公開）** | `interpretation_type` は全件`編集部解釈`。thesis/titleは自前だが編集解釈なので、`publicationStatus=ready`かつEDITORIALラベル付きでのみ表示 |

### TAG_MASTER / TAG_ALIAS / TAG_RELATION
正規化の辞書として**内部利用のみ**。`tag_master_id` と正規化関係で結合し、表示文字列だけで結合しない。TAG_ALIAS（`alias`/`detail_only`/`moved`/`split`/`relationship_only`）で正規タグへ寄せ、TAG_RELATION（`related`/`opposite`/`narrower`）で上位下位関連を扱う。

---

## 4. 公開ホワイトリスト（初期Public）

**明示的に許可したものだけ公開する**（「問題がなければ公開」ではない）。初期Publicに出すフィールド：

- 曲：id, title, titleKana, titleEn, author, authorConfidence, period, nohStructure, seasonGeneral, maturityLevel
- 流儀：school, classification, season, confidence
- 人物：role, name, typeRaw(+canonical), stateRaw(+canonical), dramaticFunction
- 関係：a, b, typeRaw(+canonical), basis
- 場所：historicalName, modernName, prefecture, locationTypeRaw(+canonical), scene
- 典拠：name, sourceTypeRaw(+canonical), relationRaw(+canonical)
- タグ：category, value(正規化), **basis**
- 構造：sequenceRaw, steps[], endingRaw(+canonical)
- 演出：tsukurimono/ai/taiko（4状態）
- provenance：source_url（内部追跡用。**本文の公開根拠にはしない**）

---

## 5. 非公開・要レビュー項目一覧

初期Publicに**出さない**。`data/generated/public/` へ絶対に流さない。

| 項目 | 理由 | 解禁条件 |
|---|---|---|
| `PLAY.summary_short` | 能楽協会等の解説由来の可能性 | 自前original化＋`ready` |
| `PLAY.structure_detail` | 自由記述 | 同上 |
| `PLAY.core_themes`（自由記述部） | 自由記述 | タグ正規化経由で間接利用 |
| `PLAY.editorial_flag` | 内部編集メモ | 公開しない |
| 各表 `source_note` / `note` | 内部メモ | 公開しない |
| `RELATIONSHIP.relationship_note` | 自由記述 | 自前original化 |
| `PERFORMANCE.performance_highlight` | 自由記述 | 自前original化 |
| `INTERPRETATION.*`（thesis 等） | 全件編集解釈 | `ready`＋EDITORIALラベル明示 |

`scripts/noh-db/check-rights-risk.ts`（Phase 1）で、内部メモ列の公開JSON流出・`internal_only`混入・引用元なし・長文の未確認公開を検出し、**検出したらビルド停止**。

---

## 6. `TAG.confidence` の再解釈 → `basis`

実データの `TAG.confidence` は confidence（確信度）ではなく、**その付与が客観情報か編集判断か**の区別だった。

| 実値 | 件数 | 意味 |
|---|---|---:|
| 編集判断 | 3,509 | 編集による意味づけ |
| 客観・構造整理 | 198 | 客観（構造から） |
| 客観情報 | 106 | 客観 |
| 編集整理 | 100 | 編集 |

これを `basis`（または `tag_origin`）として型定義する。二値へ束ねる：

```
客観・構造整理 / 客観情報      → basis = 'objective'
編集判断 / 編集整理            → basis = 'editorial'
```

**connection / similarity への効き方（重要）：**
- タグ共有による関係は、共有タグの `basis` によって層が変わる。
- `objective` タグの共有 → `factual` に寄せてよい。
- `editorial` タグの共有 → **`semantic` / `editorial` 層**。事実関係として表示しない。
- 実データでは約9割が `editorial`。したがって「タグが似ている＝編集判断による類似」が既定であり、画面でもそう明示する。

指示書の `Confidence = 'high'|'medium'|'low'|'needs_review'` 型に潰すと、この意味が失われる。**流用しない。**

---

## 7. confidence 列の正規化（4状態）

`confidence` は**表・列ごとに語彙が違う**（`要確認` / `不詳` / `中〜高` / `確定` / `要地理検証` / `編集整理`…）。ひとつのグローバル enum に潰さず、**列別の対応表**で共通4状態＋表示ラベルへ写像する。生値は保持する。

指示書§3.5の4状態を、実データのトークンから導く：

| 共通状態 | 実データのトークン例 | 画面表示 |
|---|---|---|
| `known` | 確定 / 高 / 有力 / 中〜高 / 生者 等の実体値 | 通常表示 |
| `needs_review` | 要確認 / 要地理検証 / 要文献確認 / L4未到達 | 「確認中」 |
| `unknown` | 不詳 / 不明 / 空欄（該当表以外） | 「未確認」 |
| `not_applicable` | 該当なし / 無（明示） | 「該当なし」 |

**空欄の既定は `unknown` であって `not_applicable` ではない**（情報が無いことを、要素が無いことにしない）。`該当なし`・`無` と明記されている場合だけ `not_applicable`。分析（類似・connection）では `unknown` / `needs_review` の項目を「共通しない」として不利に扱わない。

confidence の生値・basis の生値は Normalized に必ず残す（provenance）。

---

## 8. 正規化辞書の初期方針

方針1（全件人力整備しない）に沿う。**raw を必ず保持し、正規カテゴリは辞書化した分だけ付ける。未設定は `needs_review`。**

対象と初期スコープ：

| 辞書 | 対象列 | 初期整備範囲 |
|---|---|---|
| `noh-structure` | PLAY.noh_structure | 全6値（少ないので全整備）夢幻能/現在能/現在能的/夢幻能的/複合型/儀式能 |
| `season` | season_general | 単季（春夏秋冬・無季・新春）＋複合の分解規則 |
| `character-type` | CHARACTER.character_type | 高頻度＋主要導線のみ（僧/武将/亡霊/神/母/白拍子…）。残りraw+needs_review |
| `ontological-state` | ontological_state | 生者/亡霊・霊/神的・異類 と遷移(`A→B`)規則 |
| `relationship-type` | RELATIONSHIP.relationship_type | 親子/夫婦/主従/亡霊―供養者 等の高頻度＋義経系。残りraw |
| `location-type` | LOCATION.location_type | 複合の分解＋主要類型（山・霊地/水辺/寺社/古戦場/橋/関所…） |
| `source-type` | SOURCE.source_type | 軍記/説話/伝承/公式DB/詞章 に束ねる |
| `ending` | STORY_PATTERN.ending_tag | 高頻度（祝言/救済/和解/消滅/帰還/別離/退治…）＋複合分解。残りraw |
| `tag-canonical` | TAG.tag_value | TAG_MASTER(269)＋TAG_ALIAS(655)で機械解決 |

辞書は `data/schema/dictionaries/*.json` にバージョン付きで置く。生成処理で上書きしない。原値の無言の書き換えをしない。TAGの正規化以外は「機械では寄せない・rawのまま出す」を既定にし、辞書に載った分だけ canonical を付ける。

---

## 9. 橋弁慶（N0008）ワークト例

実レコードを raw → normalized → public で示す。これが型と処理の基準になる。

### 9.1 raw（Excel実値・抜粋）
```
PLAY:  title=橋弁慶 kana=はしべんけい en=Hashi Benkei
       author=不詳  author_confidence=不詳  period=室町期
       noh_structure=現在能  structure_detail=単式  season_general=秋
       main_location=京都・五条橋  primary_source=義経伝説・義経記系
       summary_short=弁慶が五条橋で妖しい少年牛若と対決して敗れ、後の主従関係の起点となる。
       core_themes=対決・主客逆転・異能・臣従  maturity_level=L2
       editorial_flag=編集確認済
       source_url=https://www.nohgaku.or.jp/encyclopedia/program_db/hashibenkei
PLAY_SCHOOL: 観世(略二 四/9月/確定) 金春(二 四 五/9月/確定) 宝生(略二 四 五/秋/確定)
             金剛(二 四/初秋/確定) 喜多(略二 四/秋/確定)
CHARACTER:  シテ 武蔵坊弁慶 / 僧兵 / 生者 / 主人公 / 高
            子方 牛若丸 / 少年武者 / 生者 / 対決者・後の主君 / 高
            アイ/従者 弁慶の従者 / 従者 / 生者 / 情報提供者 / 高
RELATIONSHIP: 武蔵坊弁慶 ― 牛若丸 / 対決者→主従 / 編集判断
LOCATION:   五条橋(歴史) 京都市(現在) 京都府 / type=橋 / scene=主舞台 / 要地理検証
SOURCE:     義経伝説・義経記系 / 軍記・伝説 / 主要素材 / 編集整理
TAG(9):     Situation:対決,探索  Emotion:驚き,闘争心  Theme:異能,主客逆転
            Motif:長刀  Experience:劇的,勇壮   ※全タグ basis=編集判断
STORY_PATTERN: 五条橋の怪しい少年の噂 → 弁慶が出向く → 牛若と遭遇 → 決闘 → 弁慶敗北
               → 牛若の素性認識 → 臣従     ending=臣従・主従成立 / 編集判断
PERFORMANCE: tsukurimono=要確認  ai=要確認  taiko=要確認  highlight=牛若と弁慶の打合い
INTERPRETATION: 「弁慶の敗北が牛若の超越性を立ち上げる」 type=編集部解釈
```

### 9.2 normalized（内部・raw＋正規値＋4状態）
```
author = 不詳 → { value:'不詳', state:'unknown' }
author_confidence = 不詳 → { raw:'不詳', state:'unknown' }
period = 室町期 → { raw:'室町期', canonical:'室町期', state:'known' }
noh_structure = 現在能 → { raw:'現在能', canonical:'genzai', state:'known' }
season_general = 秋 → { raw:'秋', canonical:['秋'], state:'known' }
character_type 僧兵 → { raw:'僧兵', canonical:'僧'(辞書化済), state:'known' }
character_type 少年武者 → { raw:'少年武者', canonical:'武者'?, state:'needs_review' }※辞書未収载ならneeds_review
relationship_type 対決者→主従 → { raw:'対決者→主従', from:'対決者', to:'主従', canonical:'主従'? }
location prefecture 京都府 → { raw:'京都府', state:'known' }
location confidence 要地理検証 → state:'needs_review'
tag 対決 <編集判断> → { category:'Situation', value:'対決'(正規化), basis:'editorial' }
ending_tag 臣従・主従成立 → { raw:'臣従・主従成立', canonical:['臣従','主従成立']? }
performance taiko 要確認 → { raw:'要確認', state:'needs_review' }
summary_short → 【編集ゲート】source_url=nohgaku.or.jp → publicationStatus未・Publicへ出さない
interpretation → 【編集ゲート】type=編集部解釈 → EDITORIALラベル・ready時のみ
provenance: 各行に source_url と Excel行番号・原テーブルを保持
```

### 9.3 public（初期Publicに出るもの）
```json
{
  "id": "N0008", "slug": "hashi-benkei",
  "title": "橋弁慶", "titleKana": "はしべんけい", "titleEn": "Hashi Benkei",
  "author": {"label": "不詳", "state": "unknown"},
  "period": {"label": "室町期", "state": "known"},
  "nohStructure": "現在能", "seasonGeneral": ["秋"], "maturityLevel": "L2",
  "schools": [
    {"school":"観世","classification":"略二 四","season":"9月","confidence":"確定"}
    /* 金春・宝生・金剛・喜多 */
  ],
  "characters": [
    {"role":"シテ","name":"武蔵坊弁慶","typeRaw":"僧兵","typeCanonical":"僧","stateRaw":"生者","dramaticFunction":"主人公"},
    {"role":"子方","name":"牛若丸","typeRaw":"少年武者","typeCanonical":null,"stateRaw":"生者","dramaticFunction":"対決者・後の主君"},
    {"role":"アイ/従者","name":"弁慶の従者","typeRaw":"従者","dramaticFunction":"情報提供者"}
  ],
  "relationships": [
    {"a":"武蔵坊弁慶","b":"牛若丸","typeRaw":"対決者→主従","basis":"editorial"}
  ],
  "locations": [
    {"historicalName":"五条橋","modernName":"京都市","prefecture":"京都府","typeRaw":"橋","scene":"主舞台"}
  ],
  "sources": [
    {"name":"義経伝説・義経記系","sourceTypeRaw":"軍記・伝説","relationRaw":"主要素材"}
  ],
  "tags": [
    {"category":"Situation","value":"対決","basis":"editorial"},
    {"category":"Theme","value":"主客逆転","basis":"editorial"}
    /* 驚き・闘争心・探索・異能・長刀・劇的・勇壮 すべて basis=editorial */
  ],
  "storyPattern": {
    "steps": ["五条橋の怪しい少年の噂","弁慶が出向く","牛若と遭遇","決闘","弁慶敗北","牛若の素性認識","臣従"],
    "endingRaw": "臣従・主従成立"
  },
  "performance": {"tsukurimono":"needs_review","ai":"needs_review","taiko":"needs_review"},
  "publication": {"summaryStatus":"withheld","hasArticle":true}
}
```

- **summary_short は public に無い**（能楽協会由来のため）。記事本文は既存 `app/ja/plays/hashi-benkei/body.mdx` を使い、DBで上書きしない。
- 橋弁慶タグは**全て `basis=editorial`**。ゆえに「似た曲」で橋弁慶がタグ経由でつながる関係は、既定で `semantic/editorial` 層として提示する。
- `子方 牛若丸` の `typeCanonical` は辞書未収載なら `null`＋内部 `needs_review`。rawの`少年武者`は必ず表示する。

---

## 10. Phase 1 に進む前の確認事項

以下の理解で Phase 1（データ基盤）に着手する。異論があれば直す。

- **Excel原本の受け渡し。** `private-data/noh/` を `.gitignore` 追加のうえ、原本はローカルに置く（公開リポジトリに入れない）。現状 Excel は `~/Downloads` にある。Phase 1 冒頭で `private-data/noh/` へ移動する運用でよいか。
- **Normalized 層の公開可否。** raw と内部メモを含むため、Normalized も公開リポジトリにコミットしない前提で進める（Public / Derived だけコミット）。
- **辞書の初期整備曲。** 橋弁慶ほか義経系11曲＋高頻度値を最初のスコープにする（方針1）。それ以外は raw + needs_review で通す。

Phase 1 の成果物（予定）：`private-data`配置と`.gitignore`／`import-workbook`・`validate-workbook`・`normalize-data`・`build-public-data`／公開状態・slug・権利データ（`data/editorial/`）／`lib/noh-data/` Repository層／テスト。各工程を単独実行・検証できるようにし、巨大スクリプトにしない。

この文書に合意が取れ次第、Phase 1 に入る。
