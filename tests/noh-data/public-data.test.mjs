// 公開データの不変条件を検査する（指示書 21.1）。
// パイプライン実行後に走らせる。node の標準テストランナーを使う。
//
//   実行: node --test tests/noh-data/

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const rd = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))

const rawFile = rd('data/generated/normalized/raw.json')
const norm = rd('data/generated/normalized/normalized.json')
const pub = rd('data/generated/public/plays.json')
const idx = rd('data/generated/public/plays-index.json')
const slugs = rd('data/editorial/slugs.json').map

test('249曲が欠落なく取り込まれる', () => {
  assert.equal(rawFile.tables.PLAY.rows.length, 249)
  assert.equal(norm.plays.length, 249)
  assert.equal(pub.plays.length, 249)
  assert.equal(idx.plays.length, 249)
})

test('公開JSONに内部メモ・自由記述キーが無い', () => {
  const forbidden = ['_internal', '_note', '_sourceNote', '_highlight', '_title', '_thesis',
    'summaryShort', 'structureDetail', 'editorialFlag', 'thesis', 'relationship_note']
  const json = JSON.stringify(pub.plays)
  for (const k of forbidden) {
    assert.ok(!json.includes('"' + k + '"'), `公開JSONに ${k} が混入`)
  }
})

test('summary は既定で公開されない（ready+original のみ）', () => {
  for (const p of pub.plays) {
    if (p.summary) assert.equal(p.publication.summaryStatus, 'ready')
  }
  // 現状 web-text は空なので summary を持つ曲は無い
  assert.equal(pub.plays.filter((p) => p.summary).length, 0)
})

test('不明と該当なしを混同しない（4状態が保たれる）', () => {
  const states = new Set(['known', 'needs_review', 'unknown', 'not_applicable'])
  for (const p of pub.plays) {
    assert.ok(states.has(p.author.state))
    assert.ok(states.has(p.period.state))
    if (p.performance) {
      assert.ok(states.has(p.performance.taiko))
    }
  }
  // 空欄由来は unknown であって not_applicable ではない
  const na = pub.plays.filter((p) => p.author.state === 'not_applicable')
  for (const p of na) assert.notEqual(p.author.label, null)
})

test('タグ別名が正規タグへ解決される（未解決は生値保持）', () => {
  let resolved = 0, total = 0
  for (const p of norm.plays) {
    for (const t of p.tags) { total++; if (t.resolved) resolved++ }
  }
  assert.ok(total > 3000, 'タグ総数が想定より少ない')
  assert.equal(resolved, total, '未解決タグがある（生値は保持されるが解決率100%想定）')
})

test('全曲に slug がある（重複なし）', () => {
  const seen = new Set()
  for (const p of pub.plays) {
    assert.ok(p.slug, `${p.id} に slug が無い`)
    assert.ok(!seen.has(p.slug), `slug 重複: ${p.slug}`)
    seen.add(p.slug)
    assert.equal(slugs[p.id].slug, p.slug)
  }
})

test('橋弁慶(N0008)のマッピングが期待どおり', () => {
  const hb = pub.plays.find((p) => p.id === 'N0008')
  assert.equal(hb.slug, 'hashi-benkei')
  assert.equal(hb.nohStructure.code, 'genzai')
  assert.deepEqual(hb.seasonGeneral, ['autumn'])
  assert.equal(hb.author.state, 'unknown') // 不詳
  assert.equal(hb.publication.hasArticle, true)
  assert.equal(hb.publication.summaryStatus, 'withheld') // 能楽協会由来のため非公開
  assert.ok(!('summary' in hb))
  // 全タグが編集判断
  assert.ok(hb.tags.every((t) => t.basis === 'editorial'))
  // 人物の生値が保持されている
  assert.ok(hb.characters.some((c) => c.typeRaw === '僧兵' && c.typeCanonical === 'priest'))
})

test('provenance が内部データに残る（生値の追跡）', () => {
  for (const p of norm.plays.slice(0, 10)) {
    assert.ok(p.provenance.sheet === 'PLAY')
    assert.ok(typeof p.provenance.row === 'number')
  }
})
