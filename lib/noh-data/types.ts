// 演目DB 公開スキーマの型。
// UI からはこの型と Repository（repository.ts）だけを使う。
// data/generated/public/*.json の形と一致させる。将来DBへ移してもこの型を保つ。

export type FourState = 'known' | 'needs_review' | 'unknown' | 'not_applicable'
export type TagBasis = 'objective' | 'editorial'

export interface StateLabel {
  label: string | null
  state: FourState
}

export interface AuthorInfo {
  label: string | null
  state: FourState
  /** 確認済 / 異説あり / 複合作者情報 / 不詳 / 要追加文献確認（監査由来） */
  status?: string | null
  /** 一説・改作など不確かさの注記があるか */
  uncertain?: boolean
  sourceUrl?: string | null
}

export interface PublicSchool {
  school: string | null
  classification: string | null
  season: string | null
}

export interface PublicCharacter {
  role: string | null
  name: string | null
  typeRaw: string | null
  /** 辞書で正規化できた場合のみ。未収載は null（生値 typeRaw を使う） */
  typeCanonical: string | null
  stateRaw: string | null
  dramaticFunction: string | null
}

export interface PublicRelationship {
  a: string | null
  b: string | null
  typeRaw: string | null
  typeCanonical: string | null
  to: string | null
  /** 客観か編集判断か。connection/similarity のレイヤー判定に使う */
  basis: TagBasis
}

export interface PublicLocation {
  historicalName: string | null
  modernName: string | null
  prefecture: string | null
  prefectureState: FourState
  typeRaw: string | null
  typeCanonical: string[]
  scene: string | null
}

export interface PublicSource {
  name: string | null
  sourceTypeRaw: string | null
  sourceTypeCanonical: string[]
  relationRaw: string | null
}

export interface PublicTag {
  category: string | null
  value: string | null
  basis: TagBasis
}

export interface PublicStoryPattern {
  steps: string[]
  endingRaw: string | null
  endingCanonical: string[]
}

export interface PublicPerformance {
  tsukurimono: FourState
  ai: FourState
  taiko: FourState
}

export interface PublicationMeta {
  summaryStatus: 'ready' | 'draft' | 'needs_review' | 'internal_only' | 'withheld'
  hasArticle: boolean
}

export interface PublicPlay {
  id: string
  slug: string
  title: string | null
  titleKana: string | null
  titleEn: string | null
  author: AuthorInfo
  period: StateLabel
  nohStructure: { code: string | null; label: string | null }
  seasonGeneral: string[]
  maturityLevel: string | null
  schools: PublicSchool[]
  characters: PublicCharacter[]
  relationships: PublicRelationship[]
  locations: PublicLocation[]
  sources: PublicSource[]
  tags: PublicTag[]
  storyPattern: PublicStoryPattern | null
  performance: PublicPerformance | null
  publication: PublicationMeta
  /** ready かつ original のときだけ入る。既定は無い */
  summary?: string
}

export interface PlayIndexEntry {
  id: string
  slug: string
  title: string | null
  titleKana: string | null
  nohStructure: string | null
  prefecture: string | null
  hasArticle: boolean
}
