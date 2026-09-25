// validate-workbook — raw.json のスキーマ・参照整合性を検査する。
// 停止エラー（公開データを生成させない）と警告（記録して継続）を区別する。
//
//   実行: node scripts/noh-db/validate-workbook.mjs

import { PATHS, readJson, tidy, log } from './lib/io.mjs'

const REQUIRED_SHEETS = {
  PLAY: ['play_id', 'title', 'title_kana', 'noh_structure', 'maturity_level'],
  PLAY_SCHOOL: ['play_school_id', 'play_id', 'school'],
  CHARACTER: ['character_id', 'play_id', 'role', 'character_name'],
  RELATIONSHIP: ['relationship_id', 'play_id', 'character_a_id', 'character_b_id', 'relationship_type'],
  LOCATION: ['location_id', 'play_id', 'prefecture'],
  SOURCE: ['source_id', 'play_id', 'source_name'],
  TAG: ['play_tag_id', 'play_id', 'tag_category', 'tag_value'],
  STORY_PATTERN: ['story_pattern_id', 'play_id', 'sequence'],
  PERFORMANCE: ['performance_id', 'play_id'],
  INTERPRETATION: ['interpretation_id', 'play_id'],
  TAG_MASTER: ['tag_master_id', 'category', 'tag_value'],
  TAG_ALIAS: ['alias_id', 'alias_value', 'canonical_value'],
  TAG_RELATION: ['tag_relation_id', 'relation_type'],
  LEVEL_MASTER: ['level'],
}

const errors = []
const warnings = []
const E = (m) => errors.push(m)
const W = (m) => warnings.push(m)

function main() {
  log.step('validate-workbook — スキーマと参照整合性')
  const raw = readJson(PATHS.raw)
  const T = raw.tables

  // 1. 必須シート・列
  for (const [sheet, cols] of Object.entries(REQUIRED_SHEETS)) {
    if (!T[sheet]) { E(`シート欠落: ${sheet}`); continue }
    for (const c of cols) {
      if (!T[sheet].columns.includes(c)) E(`列欠落: ${sheet}.${c}`)
    }
  }
  if (errors.length) return finish()

  const play = T.PLAY.rows
  const playIds = new Set(play.map((r) => r.play_id))

  // 2. play_id の重複・形式
  const seen = new Set()
  for (const r of play) {
    if (seen.has(r.play_id)) E(`play_id 重複: ${r.play_id}`)
    seen.add(r.play_id)
    if (!/^N\d{4}$/.test(String(r.play_id))) W(`play_id 形式外: ${r.play_id}`)
    if (!tidy(r.title)) E(`title 空: ${r.play_id}`)
  }

  // 3. 子テーブルの play_id 参照整合性
  for (const sheet of ['PLAY_SCHOOL', 'CHARACTER', 'RELATIONSHIP', 'LOCATION', 'SOURCE', 'TAG', 'STORY_PATTERN', 'PERFORMANCE', 'INTERPRETATION']) {
    for (const r of T[sheet].rows) {
      if (!playIds.has(r.play_id)) E(`${sheet} 行${r.__row}: 存在しない play_id ${r.play_id}`)
    }
  }

  // 4. RELATIONSHIP の人物参照整合性
  const charIds = new Set(T.CHARACTER.rows.map((r) => String(r.character_id)))
  for (const r of T.RELATIONSHIP.rows) {
    for (const k of ['character_a_id', 'character_b_id']) {
      const v = tidy(r[k])
      if (!v) { W(`RELATIONSHIP 行${r.__row}: ${k} 空`); continue }
      if (!charIds.has(String(v))) E(`RELATIONSHIP 行${r.__row}: ${k}=${v} が CHARACTER に無い`)
    }
  }

  // 5. TAG の正規タグ解決可能性（TAG_MASTER + TAG_ALIAS）
  const canon = new Set(T.TAG_MASTER.rows.map((r) => tidy(r.tag_value)).filter(Boolean))
  const alias = new Set(T.TAG_ALIAS.rows.map((r) => tidy(r.alias_value)).filter(Boolean))
  let unresolved = 0
  for (const r of T.TAG.rows) {
    const v = tidy(r.tag_value)
    if (v && !canon.has(v) && !alias.has(v)) unresolved++
  }
  if (unresolved) W(`正規タグへ解決できない TAG 値: ${unresolved} 件（正規化で needs_review 扱い）`)

  // 6. maturity_level
  const levels = new Set(T.LEVEL_MASTER.rows.map((r) => tidy(r.level)).filter(Boolean))
  for (const r of play) {
    if (tidy(r.maturity_level) && !levels.has(tidy(r.maturity_level))) W(`maturity_level 想定外: ${r.play_id}=${r.maturity_level}`)
  }

  // 7. URL 形式（source_url があるなら http(s)）
  for (const sheet of Object.keys(T)) {
    for (const r of T[sheet].rows) {
      const u = tidy(r.source_url)
      if (u && !/^https?:\/\//.test(u)) W(`${sheet} 行${r.__row}: source_url が URL 形式でない`)
    }
  }

  finish()
}

function finish() {
  for (const w of warnings.slice(0, 40)) log.warn(w)
  if (warnings.length > 40) log.warn(`… ほか ${warnings.length - 40} 件の警告`)
  if (errors.length === 0) {
    log.ok(`停止エラー 0 / 警告 ${warnings.length}`)
    log.ok('検証を通過しました。')
    process.exit(0)
  }
  for (const e of errors) log.err(e)
  log.err(`停止エラー ${errors.length} 件。公開データは生成しません。`)
  process.exit(1)
}

main()
