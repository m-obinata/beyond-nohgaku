// 演目DBパイプライン共通のI/Oとパス。
// 各工程スクリプトはここだけを共有し、互いを import しない（単独実行可能に保つ）。

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(here, '..', '..', '..') // repo root

export const PATHS = {
  workbook: join(
    ROOT,
    'private-data',
    'noh',
    'noh_play_database_v0_12_249plays_L2_complete.xlsx',
  ),
  dictionaries: join(ROOT, 'data', 'schema', 'dictionaries'),
  editorial: join(ROOT, 'data', 'editorial'),
  normalizedDir: join(ROOT, 'data', 'generated', 'normalized'),
  publicDir: join(ROOT, 'data', 'generated', 'public'),
  indexesDir: join(ROOT, 'data', 'generated', 'indexes'),
  raw: join(ROOT, 'data', 'generated', 'normalized', 'raw.json'),
  normalized: join(ROOT, 'data', 'generated', 'normalized', 'normalized.json'),
  meta: join(ROOT, 'data', 'generated', 'normalized', 'meta.json'),
}

/** 生成元Excelのバージョン。生成物すべてに刻む（指示書 4.3） */
export const SOURCE_VERSION = 'v0.12-249plays-L2'
export const SCHEMA_VERSION = '1'

export function readJson(path, fallback = undefined) {
  if (!existsSync(path)) {
    if (fallback !== undefined) return fallback
    throw new Error('見つかりません: ' + path)
  }
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

export function stamp() {
  return {
    sourceVersion: SOURCE_VERSION,
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
  }
}

/** 文字列の軽い整形。値の意味は変えない（前後空白・全角空白・改行のみ） */
export function tidy(v) {
  if (v === null || v === undefined) return null
  const s = String(v).replace(/　/g, ' ').replace(/\s+/g, ' ').trim()
  return s === '' ? null : s
}

export const log = {
  step: (name) => console.log(`\n▶ ${name}`),
  ok: (msg) => console.log(`  ✓ ${msg}`),
  warn: (msg) => console.log(`  ⚠ ${msg}`),
  err: (msg) => console.error(`  ✗ ${msg}`),
}
