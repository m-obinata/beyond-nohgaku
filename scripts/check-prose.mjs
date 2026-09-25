#!/usr/bin/env node
/**
 * 日本語文章設計書（docs/japanese-prose.md）のうち、機械的に検出できる規約を拾う。
 *
 * 拾えるもの
 *   2. 創作上の判断の主語が人でない（「能がつくった」）
 *   3. 人名の略称（静 / 業平 / 知盛 …）
 *   4. 出典のない上演時間
 *   6. である体の混入
 *
 * 拾えないもの
 *   1. 主語の欠落      — 目で見る
 *   4. 死者の生死の明示 — 目で見る
 *   6. 体言止め・倒置   — 目で見る
 *
 * 落ちても build は止めない。報告するだけ。判断は人がする。
 */

import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

/** 一覧・要約・キャプションに使われるフィールド。ここが最も危険（設計書の表） */
const ONE_LINER_FIELDS =
  /\b(hook|summary|note|caption|lede|subtitle|takeaway|honest|sound)\s*:\s*\n?\s*'([^']*)'/g

/** 問いと見出しは です・ます の例外なので、である体の検査から外す */
const REGISTER_EXEMPT = new Set([
  'question',
  'label',
  'title',
  'short',
  'key',
  'en',
  // 見出しとキャプションは平叙の疑問形・体言のままでよい（設計書 §6 の例外）
  'caption',
  'subtitle',
])

const findings = []
const add = (rule, file, text, why) => findings.push({ rule, file, text, why })

// ───────────────────────────────────────── 規約 2
const AGENT_VERBS = '(?:つくっ|つくり|つくる|つくら|作っ|作る|選ん|選び|選ぶ|置い|置き換え|移し|移す|変え|削っ|書い|加え)'
const AGENT_RE = new RegExp(`能[はがも][^。]{0,14}?${AGENT_VERBS}`, 'g')

// ───────────────────────────────────────── 規約 3
/**
 * 「能が変えた」のように、その言い方自体を論じている引用は対象外にする。
 * 鉤括弧の中に収まっている一致は飛ばす。
 */
function matchAgent(text) {
  const out = []
  for (const m of text.matchAll(AGENT_RE)) {
    const before = text.slice(0, m.index)
    const opens = (before.match(/「/g) ?? []).length
    const closes = (before.match(/」/g) ?? []).length
    if (opens > closes) continue // 鉤括弧の内側
    out.push(m[0])
  }
  return out
}

/** 略称と、その正式名。同じ文字列に正式名が先に出ていれば二度目なので許す */
const SHORT_NAMES = [
  ['静', /(?<![御静])静(?!御前|か|ま|岡|寂)/, '静御前'],
  ['業平', /(?<!在原)業平/, '在原業平'],
  ['知盛', /(?<!平)知盛/, '平知盛'],
  ['敦盛', /(?<!平)敦盛/, '平敦盛'],
  ['秀衡', /(?<!藤原)秀衡/, '藤原秀衡'],
  ['泰衡', /(?<!藤原)泰衡/, '藤原泰衡'],
  ['直実', /(?<!熊谷)直実/, '熊谷直実'],
  ['長範', /(?<!熊坂)長範/, '熊坂長範'],
]

/**
 * 略称を検査するフィールド。
 * caption / note / lede は記事の内側に置かれるので、二度目以降の略称が許される。
 * ここに挙げるのは、記事の外で単独で読まれるものだけ。
 */
const STANDALONE_FIELDS = new Set(['hook', 'summary', 'takeaway', 'note'])

// ───────────────────────────────────────── 規約 4
const DURATION_RE = /(?:約|およそ)\s*\d+\s*分/g

// ───────────────────────────────────────── 規約 6
/** 丁寧形の文末。これ以外の活用語尾で終わる文を疑う */
const POLITE_END =
  /(?:です|ます|ました|ません|でした|ましょう|でしょう|ください|ませんでした)$/
const PLAIN_END = [
  [/である$/, 'である'],
  [/であった$/, 'であった'],
  [/だった$/, 'だった'],
  [/(?<!まし|でし)た$/, '〜た（過去の常体）'],
  [/(?<![ますおこ])る$/, '〜る（終止形）'],
  [/(?<!え|し|か)ない$/, '〜ない'],
]

function checkRegister(s) {
  // 「。」で区切り、最後の句点まで。体言止めはここでは見ない
  return s
    .split('。')
    .map((t) => t.trim())
    .filter(Boolean)
    .flatMap((sentence) => {
      if (POLITE_END.test(sentence)) return []
      for (const [re, name] of PLAIN_END) {
        if (re.test(sentence)) return [{ sentence, name }]
      }
      return []
    })
}

const files = globSync('content/*.ts')
for (const file of files) {
  const src = readFileSync(file, 'utf8')

  for (const m of src.matchAll(ONE_LINER_FIELDS)) {
    const field = m[1]
    const text = m[2]

    for (const hit of matchAgent(text)) {
      add('2 創作の主体', file, text, `「${hit}」— 決めたのは人。作者を主語にする`)
    }

    if (STANDALONE_FIELDS.has(field)) {
      for (const [name, re, full] of SHORT_NAMES) {
        if (!re.test(text)) continue
        // 同じ一文のなかで先にフルネームが出ていれば、それは二度目
        if (text.indexOf(full) !== -1 && text.indexOf(full) < text.search(re)) continue
        add('3 人名の略称', file, text, `「${name}」— 初出は「${full}」と書く`)
      }
    }

    for (const hit of text.match(DURATION_RE) ?? []) {
      add('4 出典のない数値', file, text, `「${hit}」— 出典があるか確かめる`)
    }

    if (!REGISTER_EXEMPT.has(field)) {
      for (const { name } of checkRegister(text)) {
        add('6 である体の混入', file, text, `${name} で終わっている`)
      }
    }
  }
}

// ───────────────────────────────────────── 本文（参考）
const mdx = globSync('app/**/body.mdx')
let mdxAgent = 0
for (const file of mdx) {
  const src = readFileSync(file, 'utf8')
  for (const line of src.split('\n')) {
    if (line.startsWith('<') || line.startsWith('#') || !line.trim()) continue
    for (const hit of matchAgent(line)) {
      add('2 創作の主体', file, line.trim(), `「${hit}」— 作者を主語にする`)
      mdxAgent++
    }
  }
}

// ───────────────────────────────────────── 報告
if (findings.length === 0) {
  console.log('機械で拾える範囲では、指摘はありません。')
  console.log('主語の欠落・死者の明示・体言止めは目で見てください（docs/japanese-prose.md §8）。')
  process.exit(0)
}

const byRule = new Map()
for (const f of findings) {
  if (!byRule.has(f.rule)) byRule.set(f.rule, [])
  byRule.get(f.rule).push(f)
}

for (const [rule, list] of [...byRule].sort()) {
  console.log(`\n── 規約 ${rule} — ${list.length} 件`)
  for (const f of list) {
    const t = f.text.length > 64 ? f.text.slice(0, 64) + '…' : f.text
    console.log(`  ${f.file}`)
    console.log(`    ${t}`)
    console.log(`    → ${f.why}`)
  }
}

console.log(`\n合計 ${findings.length} 件。docs/japanese-prose.md を参照。`)
console.log('検出できない規約（主語の欠落・死者の明示・体言止め）は §8 の点検で見てください。')
