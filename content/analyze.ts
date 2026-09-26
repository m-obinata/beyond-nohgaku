import { exploreItems } from '@/content/noh-browse'

/**
 * 分析（かけ合わせ）用のデータ。
 * Explore と同じファセット定義を使い、演目ごとの「軸→値の集合」を渡す。
 * 分析でも生値の羅列や自動要約はしない。共起の数と、偏り（lift）を出すだけ。
 */

export interface AnalyzePlay {
  id: string
  title: string
  slug: string
  facets: Record<string, string[]>
}

/** かけ合わせに使える軸。多すぎる軸（都道府県・人物・月）は初期の対象から外す */
export const ANALYZE_DIMS: { key: string; label: string }[] = [
  { key: 'author', label: '作者' },
  { key: 'theme', label: '主題' },
  { key: 'emotion', label: '感情' },
  { key: 'situation', label: '状況' },
  { key: 'motif', label: 'モチーフ' },
  { key: 'experience', label: '経験' },
  { key: 'kind', label: '主役の種別' },
  { key: 'source', label: '原典' },
  { key: 'region', label: '地域' },
  { key: 'ending', label: '結末' },
  { key: 'season', label: '季節' },
  { key: 'structure', label: '形式' },
  { key: 'school', label: '流儀' },
]

/** 共起ネットワーク向けの軸。同一軸内で複数値を持ちうる（意味タグ・人物・原典など）ものだけ。 */
export const NETWORK_DIMS: { key: string; label: string }[] = [
  { key: 'theme', label: '主題' },
  { key: 'emotion', label: '感情' },
  { key: 'situation', label: '状況' },
  { key: 'motif', label: 'モチーフ' },
  { key: 'experience', label: '経験' },
  { key: 'person', label: '人物' },
  { key: 'source', label: '原典' },
  { key: 'kind', label: '主役の種別' },
]

export function analyzePlays(): AnalyzePlay[] {
  return exploreItems().map((i) => ({
    id: i.id,
    title: i.title,
    slug: i.href.replace('/ja/plays/', ''),
    facets: i.facets,
  }))
}
