/** Entity は分離し、Relation を前提とする（指示書 23）。 */

/* ───────────────────────────────────────────────
   ファセット（絞り込みの軸）
   一覧を「分類して並べる」のではなく「軸で絞る」ために、
   すべての Entity が共通の軸でタグ付けされている必要がある。
   軸は、読者がすでに持っている知識で選べるものにする。
   旧国名のように、知っている人にしか分からない区分は主軸にしない。
   ─────────────────────────────────────────────── */

/** 現代の地方区分。旧国名ではなく、まずこれで探せるようにする */
export type ModernRegion =
  | '東北'
  | '関東'
  | '中部'
  | '近畿'
  | '中国'
  | '四国'
  | '九州'
  | '広域'

/** 物語の舞台になる時代 */
export type EraTag =
  | '平安以前'
  | '平安'
  | '源平の争乱'
  | '鎌倉'
  | '南北朝・室町'
  | '時代を定めない'

/** 曲の形式。霊が過去を語るのか、事件がその場で進行するのか */
export type PlayForm = '現在能' | '夢幻能'

/** シテ（主役）が何者か */
export type ShiteType =
  | '武者'
  | '女'
  | '僧・山伏'
  | '神・天人'
  | '鬼・異類'
  | '霊'
  | '老人'

/** 土地の性格 */
export type PlaceKind = '都市' | '山' | '川' | '海・浦' | '街道・関' | '社寺' | '島'

/** 人物の立場 */
export type PersonKind = '武将' | '僧' | '芸能者' | '歌人' | '為政者' | '役人'

export type SourceLayerId =
  | 'history'
  | 'chronicle'
  | 'story'
  | 'stage'
  | 'legend'

export interface SourceLayer {
  id: SourceLayerId
  /** 画面に出す英語ラベル。色に頼らず必ず文字で示す。 */
  label: string
  /** 日本語の定義 */
  definition: string
  /** 「史実度」を数値化せず、どのレイヤーに属するかを述べる（指示書 14）。 */
  evidence: string
}

export interface EntityRef {
  slug: string
  name: string
  reading?: string
  note?: string
}

export interface Person extends EntityRef {
  lifespan?: string
  kind: PersonKind
  era: EraTag
  role: string
  summary: string
  plays: string[]
  places: string[]
  sources: string[]
}

export interface PlaceSite {
  name: string
  note: string
}

export interface Place extends EntityRef {
  romaji: string
  prefecture: string
  /** いまの市区町村まで。読者に「で、どこ？」と思わせないための必須情報。 */
  modernName: string
  /** 現代の地方区分。一覧の既定のグルーピングに使う */
  regionModern: ModernRegion
  /** 旧国名。副次情報として添える */
  region: string
  kind: PlaceKind
  /** 将来の英語版と、いま読んでいる海外読者のための簡略表記 */
  enLocation: string
  lat: number
  lon: number
  summary: string
  /** 現在の地理的事実。ここは HISTORY ではなく現況として扱う。 */
  today?: string
  access?: string
  /** その土地で実際に見られる、能や物語にまつわる場所 */
  sites?: PlaceSite[]
  /** 授かれるもの・買えるもの。観光広告にはしないが、行ける場所は挙げる。 */
  takeaway?: PlaceSite[]
  plays: string[]
  people: string[]
}

export interface Play extends EntityRef {
  romaji: string
  category: string
  author: string
  school?: string
  summary: string
  /** 検索で最初に読まれる一文。あらすじではなく「何が起きる曲か」 */
  hook: string
  form: PlayForm
  shiteType: ShiteType[]
  settingEra: EraTag
  composedEra: string
  /** 上演時間の目安（分）。探すときの実用情報 */
  minutes?: number
  people: string[]
  places: string[]
  sources: string[]
  themes: string[]
  relatedPlays: string[]
}

export interface SourceText extends EntityRef {
  romaji: string
  layer: SourceLayerId
  period: string
  summary: string
}

export interface Theme extends EntityRef {
  summary: string
}

export interface JourneyStop {
  /** 旅程上の通し番号 */
  step: number
  placeSlug: string
  name: string
  romaji: string
  lat: number
  lon: number
  /** 年代表記（不確かなものは「頃」「諸説」を明示） */
  year: string
  yearNum: number
  headline: string
  note: string
  layer: SourceLayerId
  plays: string[]
}

export interface Journey {
  slug: string
  title: string
  subtitle: string
  stops: JourneyStop[]
}

export interface ChronologyEvent {
  yearNum: number
  year: string
  era: string
  placeName?: string
  placeRomaji?: string
  headline: string
  detail: string
  layer: SourceLayerId
  source: string
}

export interface ComparisonColumn {
  layer: SourceLayerId
  /** その媒体の具体名（『義経記』、能「橋弁慶」など） */
  medium: string
  period: string
  body: string
  points: string[]
}

export interface Comparison {
  title: string
  question: string
  columns: ComparisonColumn[]
}

export interface Performance {
  date: string
  dateLabel: string
  venue: string
  prefecture: string
  play: string
  playSlug: string
  performer: string
  school: string
  price: string
  ticketUrl?: string
  sourceUrl?: string
  retrievedAt: string
}

export interface ArchiveItem {
  title: string
  period: string
  holding: string
  note: string
}

export interface SakeNote {
  region: string
  brewery: string
  sake: string
  body: string
  context: string
}

export interface PhotoCredit {
  id: string
  /** public/ からのパス */
  file: string
  width: number
  height: number
  /** 見えない人にも内容が伝わる説明。キャプションとは別に書く。 */
  alt: string
  source: string
  author?: string
  license: string
  retrievedAt: string
}

export interface ArticleMeta {
  slug: string
  kind: 'play' | 'person' | 'place' | 'feature'
  title: string
  reading?: string
  romaji: string
  /** 記事の入口に置く問い。あらすじの要約にはしない（憲法 7）。 */
  question?: string
  lede: string
  /** Metadata 行: 年代 / 場所 / 人物 / 関連演目 */
  period: string
  places: EntityRef[]
  people: EntityRef[]
  plays: EntityRef[]
  sources: EntityRef[]
  themes: EntityRef[]
}
