// normalize-data — raw.json を正規化した内部データへ変換する。
// 原値を保持し、辞書で正規値と4状態を付す。TAG別名を正規タグへ寄せる。
// 出力は内部データ（raw・内部メモを含むため公開しない）。
//
//   実行: node scripts/noh-db/normalize-data.mjs

import { PATHS, readJson, writeJson, tidy, stamp, log } from './lib/io.mjs'
import {
  DICT, toState, toBasis, canonicalizeMulti, canonicalizeOne, normalizeRelationshipType,
} from './lib/normalize.mjs'

function buildTagAliasIndex(rawTables) {
  // alias_value → canonical_value（正規タグ表記）
  const idx = new Map()
  for (const r of rawTables.TAG_ALIAS.rows) {
    const a = tidy(r.alias_value)
    const c = tidy(r.canonical_value)
    if (a && c) idx.set(a, c)
  }
  const canon = new Set(rawTables.TAG_MASTER.rows.map((r) => tidy(r.tag_value)).filter(Boolean))
  return { idx, canon }
}

function main() {
  log.step('normalize-data — raw.json → normalized.json')
  const raw = readJson(PATHS.raw)
  const T = raw.tables
  const { idx: aliasIdx, canon } = buildTagAliasIndex(T)

  const by = (sheet) => {
    const m = new Map()
    for (const r of T[sheet].rows) {
      if (!m.has(r.play_id)) m.set(r.play_id, [])
      m.get(r.play_id).push(r)
    }
    return m
  }
  const schools = by('PLAY_SCHOOL'), chars = by('CHARACTER'), rels = by('RELATIONSHIP')
  const locs = by('LOCATION'), srcs = by('SOURCE'), tags = by('TAG')
  const sp = by('STORY_PATTERN'), perf = by('PERFORMANCE'), interp = by('INTERPRETATION')

  let unresolvedCanon = 0
  let unresolvedTag = 0

  const plays = T.PLAY.rows.map((p) => {
    const prov = { sheet: p.__sheet, row: p.__row, sourceUrl: tidy(p.source_url) }

    const characters = (chars.get(p.play_id) || []).map((c) => {
      const t = canonicalizeOne(c.character_type, DICT.characterType.map)
      if (t.unresolved) unresolvedCanon++
      return {
        characterId: tidy(c.character_id),
        role: tidy(c.role),
        name: tidy(c.character_name),
        type: t,
        stateRaw: tidy(c.ontological_state),
        dramaticFunction: tidy(c.dramatic_function),
        confidenceState: toState(c.confidence),
        _sourceNote: tidy(c.source_note),
      }
    })

    const relationships = (rels.get(p.play_id) || []).map((r) => {
      const t = normalizeRelationshipType(r.relationship_type, DICT.relationshipType.map)
      if (t.unresolved) unresolvedCanon++
      return {
        relationshipId: tidy(r.relationship_id),
        a: tidy(r.character_a), b: tidy(r.character_b),
        aId: tidy(r.character_a_id), bId: tidy(r.character_b_id),
        type: t,
        basis: toBasis(r.confidence),
        _note: tidy(r.relationship_note),
      }
    })

    const locations = (locs.get(p.play_id) || []).map((l) => {
      const t = canonicalizeMulti(l.location_type, DICT.locationType.map)
      if (t.unresolved) unresolvedCanon++
      return {
        locationId: tidy(l.location_id),
        historicalName: tidy(l.historical_name),
        modernName: tidy(l.modern_name),
        prefecture: tidy(l.prefecture),
        prefectureState: toState(l.prefecture),
        type: t,
        scene: tidy(l.scene),
        confidenceState: toState(l.confidence),
      }
    })

    const sources = (srcs.get(p.play_id) || []).map((s) => {
      const t = canonicalizeMulti(s.source_type, DICT.sourceType.map)
      if (t.unresolved) unresolvedCanon++
      return {
        sourceId: tidy(s.source_id),
        name: tidy(s.source_name),
        type: t,
        relationRaw: tidy(s.relation_type),
        basis: toBasis(s.confidence),
        _note: tidy(s.note),
      }
    })

    const playTags = (tags.get(p.play_id) || []).map((g) => {
      const rawVal = tidy(g.tag_value)
      let value = rawVal, resolved = false
      if (rawVal) {
        if (canon.has(rawVal)) { resolved = true }
        else if (aliasIdx.has(rawVal)) { value = aliasIdx.get(rawVal); resolved = true }
      }
      if (!resolved) unresolvedTag++
      return {
        category: tidy(g.tag_category),
        raw: rawVal,
        value,
        resolved,
        basis: toBasis(g.confidence),
      }
    })

    const spRow = (sp.get(p.play_id) || [])[0]
    const storyPattern = spRow
      ? {
          steps: tidy(spRow.sequence) ? tidy(spRow.sequence).split('→').map((s) => s.trim()).filter(Boolean) : [],
          sequenceRaw: tidy(spRow.sequence),
          ending: canonicalizeMulti(spRow.ending_tag, DICT.ending.map),
          basis: toBasis(spRow.confidence),
        }
      : null
    if (storyPattern?.ending.unresolved) unresolvedCanon++

    const pfRow = (perf.get(p.play_id) || [])[0]
    const performance = pfRow
      ? {
          tsukurimono: { raw: tidy(pfRow.tsukurimono_present), state: toState(pfRow.tsukurimono_present) },
          ai: { raw: tidy(pfRow.ai_present), state: toState(pfRow.ai_present) },
          taiko: { raw: tidy(pfRow.taiko_status), state: toState(pfRow.taiko_status) },
          _highlight: tidy(pfRow.performance_highlight),
        }
      : null

    const ipRow = (interp.get(p.play_id) || [])[0]
    const interpretation = ipRow
      ? { // 全て編集ゲート。内部保持（Publicに出さない）
          _title: tidy(ipRow.interpretation_title),
          _thesis: tidy(ipRow.thesis),
          _tags: tidy(ipRow.interpretation_tags),
          type: tidy(ipRow.interpretation_type),
        }
      : null

    return {
      id: p.play_id,
      provenance: prov,
      title: tidy(p.title),
      titleKana: tidy(p.title_kana),
      titleEn: tidy(p.title_en),
      author: { raw: tidy(p.author), state: toState(p.author) },
      authorConfidence: { raw: tidy(p.author_confidence), state: toState(p.author_confidence) },
      period: { raw: tidy(p.period), state: toState(p.period) },
      nohStructure: canonicalizeOne(p.noh_structure, mapCode(DICT.nohStructure.map)),
      seasonGeneral: canonicalizeMulti(p.season_general, DICT.season.map),
      mainLocationLabel: tidy(p.main_location),
      primarySourceLabel: tidy(p.primary_source),
      maturityLevel: tidy(p.maturity_level),
      schools: (schools.get(p.play_id) || []).map((s) => ({
        school: tidy(s.school),
        classification: tidy(s.classification),
        season: tidy(s.season),
        confidenceState: toState(s.confidence),
      })),
      characters,
      relationships,
      locations,
      sources,
      tags: playTags,
      storyPattern,
      performance,
      interpretation,
      // 内部保持（Publicへ出さない・rightsゲート対象）
      _internal: {
        summaryShort: tidy(p.summary_short),
        structureDetail: tidy(p.structure_detail),
        coreThemes: tidy(p.core_themes),
        editorialFlag: tidy(p.editorial_flag),
      },
    }
  })

  // nohStructure は {code,label} を返す辞書なので canonical に code、label を別持ち
  writeJson(PATHS.normalized, { _meta: stamp(), plays })
  log.ok(`plays: ${plays.length}`)
  log.warn(`辞書未収載の分類（canonical=null / needs_review）: ${unresolvedCanon} 件`)
  log.warn(`正規タグ未解決（raw のまま保持）: ${unresolvedTag} 件`)
  log.ok('書き出し: data/generated/normalized/normalized.json')
}

/** {code,label} 形式の辞書を canonicalizeOne 用に code 文字列マップへ */
function mapCode(m) {
  const out = {}
  for (const [k, v] of Object.entries(m)) out[k] = v.code
  return out
}

main()
