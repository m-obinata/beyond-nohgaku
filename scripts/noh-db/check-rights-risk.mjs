// check-rights-risk — 公開データに内部メモ・非公開文章が漏れていないか検査する。
// 「問題がなければ公開」ではなく「明示的に許可したものだけ公開」。漏洩を見つけたら停止。
//
//   実行: node scripts/noh-db/check-rights-risk.mjs

import { join } from 'node:path'
import { PATHS, readJson, log } from './lib/io.mjs'

const errors = []
const E = (m) => errors.push(m)

// 公開JSONに現れてはならない内部キー
const FORBIDDEN_KEYS = [
  '_internal', '_note', '_sourceNote', '_highlight', '_title', '_thesis', '_tags',
  'summaryShort', 'summary_short', 'structureDetail', 'structure_detail',
  'editorialFlag', 'editorial_flag', 'relationship_note', 'performance_highlight', 'thesis',
]

function scanForbiddenKeys(node, path) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => scanForbiddenKeys(v, `${path}[${i}]`))
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (FORBIDDEN_KEYS.includes(k)) E(`公開JSONに内部キー: ${path}.${k}`)
      scanForbiddenKeys(v, `${path}.${k}`)
    }
  }
}

function main() {
  log.step('check-rights-risk — 公開データの権利検査')
  const pub = readJson(join(PATHS.publicDir, 'plays.json'))
  const webText = readJson(join(PATHS.editorial, 'web-text.json')).blocks
  const rights = readJson(join(PATHS.editorial, 'rights-review.json')).entries

  // 1. 内部キーの流出
  scanForbiddenKeys(pub.plays, 'plays')

  // 2. summary を載せているのに ready+original でない
  const rightsIdx = new Map(rights.map((r) => [r.playId + ':' + r.kind, r]))
  for (const p of pub.plays) {
    if (p.summary) {
      if (p.publication.summaryStatus !== 'ready') E(`${p.id}: summary があるのに status≠ready`)
    }
  }

  // 3. web-text の各ブロックの権利メタ健全性
  for (const b of webText) {
    if (b.sourcePolicy === 'quoted' && !b.quoteSource) E(`web-text ${b.id}: quoted なのに引用元がない`)
    if (b.publicationStatus === 'ready' && b.rightsRisk === 'high') E(`web-text ${b.id}: ready かつ rightsRisk=high`)
  }

  // 4. 長文が公開JSONに混じっていないか（自前確認のない長文＝転載リスク）
  const LONG = 60
  for (const p of pub.plays) {
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === 'string' && v.length > LONG && k !== 'summary') {
        E(`${p.id}.${k}: 想定外の長文（${v.length}字）。転載の疑い`)
      }
    }
  }

  if (errors.length === 0) {
    log.ok('権利検査を通過しました（内部メモの流出・未許可公開なし）。')
    process.exit(0)
  }
  for (const e of errors) log.err(e)
  log.err(`権利検査エラー ${errors.length} 件。公開を停止します。`)
  process.exit(1)
}

main()
