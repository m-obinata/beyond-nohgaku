// 正規化の共通ロジック。辞書の読み込み、4状態判定、複合値の分割・写像。
// 原値は必ず保持する。無言の書き換えをしない（生値と正規値を両方返す）。

import { join } from 'node:path'
import { PATHS, readJson, tidy } from './io.mjs'

const dict = (name) => readJson(join(PATHS.dictionaries, name))

export const DICT = {
  confidence: dict('confidence.v1.json'),
  tagBasis: dict('tag-basis.json'),
  nohStructure: dict('noh-structure.json'),
  season: dict('season.json'),
  characterType: dict('character-type.json'),
  relationshipType: dict('relationship-type.json'),
  ending: dict('ending.json'),
  locationType: dict('location-type.json'),
  sourceType: dict('source-type.json'),
}

/** 複合値を分割する区切り。中黒・スラッシュ・波ダッシュ・矢印など */
const SEP = /[・／\/〜～]/

/**
 * confidence／実体値 → 共通4状態。
 * 空欄の既定は unknown（該当なしにしない）。not_applicable は明示トークンのみ。
 */
export function toState(raw) {
  const v = tidy(raw)
  if (v === null) return 'unknown'
  const mapped = DICT.confidence.map[v]
  if (mapped) return mapped
  // 「要」で始まる未知トークンは確認中扱い
  if (/^要/.test(v) || /要確認$/.test(v)) return 'needs_review'
  if (v === '該当なし' || v === '無') return 'not_applicable'
  return 'known'
}

export const stateLabel = (s) => DICT.confidence.labels[s] ?? s

/** TAG.confidence → basis（客観／編集判断）。未知は既定 editorial。 */
export function toBasis(raw) {
  const v = tidy(raw)
  return (v && DICT.tagBasis.map[v]) || DICT.tagBasis.default
}

/**
 * 生値を辞書で正規化する。複合は分割して各片を写像。
 * 返り値 { raw, canonical:[...], unresolved:bool }。辞書未収載は canonical から除き unresolved=true。
 */
export function canonicalizeMulti(raw, map) {
  const v = tidy(raw)
  if (v === null) return { raw: null, canonical: [], unresolved: false }
  const parts = v.split(SEP).map((p) => p.trim()).filter(Boolean)
  const canonical = []
  let unresolved = false
  for (const p of parts) {
    const c = map[p]
    if (c === undefined) unresolved = true
    else if (c !== null) canonical.push(c)
  }
  return { raw: v, canonical: [...new Set(canonical)], unresolved }
}

/** 単一値の正規化（複合を想定しない列） */
export function canonicalizeOne(raw, map) {
  const v = tidy(raw)
  if (v === null) return { raw: null, canonical: null, unresolved: false }
  const c = map[v]
  if (c === undefined) return { raw: v, canonical: null, unresolved: true }
  return { raw: v, canonical: c, unresolved: false }
}

/** 矢印を含む関係型（例 対決者→主従）を from/to に分解しつつ正規化 */
export function normalizeRelationshipType(raw, map) {
  const v = tidy(raw)
  if (v === null) return { raw: null, from: null, to: null, canonical: null, unresolved: false }
  const arrow = v.split(/[→⇒]/).map((s) => s.trim()).filter(Boolean)
  if (arrow.length === 2) {
    const to = map[arrow[1]] ?? null
    return { raw: v, from: arrow[0], to: arrow[1], canonical: to, unresolved: to === null }
  }
  const c = map[v]
  return { raw: v, from: null, to: null, canonical: c ?? null, unresolved: c === undefined }
}
