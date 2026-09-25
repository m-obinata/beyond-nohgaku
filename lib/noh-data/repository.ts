// 演目DB Repository 層。
//
// UIコンポーネントは公開JSONを直接読まず、この型付き関数だけを使う（指示書 18）。
// いまは data/generated/public の静的JSONを読むが、将来DBへ移してもUI側の変更を小さく保つ。

import { PublicPlay, PlayIndexEntry } from './types'
import playsData from '@/data/generated/public/plays.json'
import indexData from '@/data/generated/public/plays-index.json'

const PLAYS = (playsData as unknown as { plays: PublicPlay[] }).plays
const INDEX = (indexData as unknown as { plays: PlayIndexEntry[] }).plays

const byId = new Map(PLAYS.map((p) => [p.id, p]))
const bySlug = new Map(PLAYS.map((p) => [p.slug, p]))

/** 全曲（一覧の軽量版。本文なし） */
export function listPlays(): PlayIndexEntry[] {
  return INDEX
}

export function getPlayById(id: string): PublicPlay | undefined {
  return byId.get(id)
}

export function getPlayBySlug(slug: string): PublicPlay | undefined {
  return bySlug.get(slug)
}

export function getAllPlays(): PublicPlay[] {
  return PLAYS
}

/** 2〜4曲の比較用にまとめて取得（順序は渡された順を保つ） */
export function comparePlays(ids: string[]): PublicPlay[] {
  return ids.map((id) => byId.get(id)).filter((p): p is PublicPlay => Boolean(p))
}

/**
 * ある正規化値を持つ曲を横断で探す簡易検索（Phase 2 の Explore で拡張）。
 * axis はファセットの供給元。同一 axis 内は OR、複数 axis は AND を呼び出し側で合成する。
 */
export type FacetAxis =
  | 'tag' | 'character-type' | 'relationship-type' | 'prefecture'
  | 'source-type' | 'ending' | 'school' | 'noh-structure'

export function playHasFacet(play: PublicPlay, axis: FacetAxis, value: string): boolean {
  switch (axis) {
    case 'tag':
      return play.tags.some((t) => t.value === value)
    case 'character-type':
      return play.characters.some((c) => c.typeCanonical === value || c.typeRaw === value)
    case 'relationship-type':
      return play.relationships.some((r) => r.typeCanonical === value || r.typeRaw === value)
    case 'prefecture':
      return play.locations.some((l) => l.prefecture === value)
    case 'source-type':
      return play.sources.some((s) => s.sourceTypeCanonical.includes(value) || s.sourceTypeRaw === value)
    case 'ending':
      return play.storyPattern?.endingCanonical.includes(value) ?? false
    case 'school':
      return play.schools.some((s) => s.school === value)
    case 'noh-structure':
      return play.nohStructure.code === value
    default:
      return false
  }
}
