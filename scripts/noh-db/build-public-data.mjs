// build-public-data — normalized.json から公開用JSONを生成する。
// ホワイトリスト方式。内部メモ・自由記述は出さない。summary は editorial ゲートを通ったものだけ。
//
//   実行: node scripts/noh-db/build-public-data.mjs

import { join } from 'node:path'
import { PATHS, readJson, writeJson, stamp, log } from './lib/io.mjs'

function main() {
  log.step('build-public-data — normalized.json → public/')
  const norm = readJson(PATHS.normalized)
  const slugs = readJson(join(PATHS.editorial, 'slugs.json')).map
  const pubStatus = readJson(join(PATHS.editorial, 'publication-status.json')).map
  const webText = readJson(join(PATHS.editorial, 'web-text.json')).blocks
  // 作者監査（あれば公開データの作者を上書きする）
  const authors = readJson(join(PATHS.editorial, 'authors.json'), { map: {} }).map
  const structureLabel = Object.fromEntries(
    Object.values(readJson(join(PATHS.dictionaries, 'noh-structure.json')).map).map((v) => [v.code, v.label]),
  )

  // 公開可能な自前文章だけを索引化（sourcePolicy=original かつ ready）
  const readyText = new Map()
  for (const b of webText) {
    if (b.sourcePolicy === 'original' && b.publicationStatus === 'ready') {
      readyText.set(b.playId + ':' + b.kind, b.text)
    }
  }

  const plays = norm.plays.map((p) => {
    const slug = slugs[p.id]?.slug ?? 'play-' + p.id.toLowerCase()
    const status = pubStatus[p.id] ?? { summaryStatus: 'withheld', hasArticle: false }

    const aud = authors[p.id]
    const author = aud
      ? {
          label: aud.author,
          state: aud.state,
          status: aud.status ?? null, // 確認済 / 異説あり / 複合作者情報 / 不詳 / 要追加文献確認
          uncertain: !!aud.uncertain,
          sourceUrl: aud.sourceUrl ?? null,
        }
      : { label: p.author.raw, state: p.author.state }

    const pub = {
      id: p.id,
      slug,
      title: p.title,
      titleKana: p.titleKana,
      titleEn: p.titleEn && p.titleEn !== '要確認' ? p.titleEn : null,
      author,
      period: { label: p.period.raw, state: p.period.state },
      nohStructure: p.nohStructure.canonical
        ? { code: p.nohStructure.canonical, label: structureLabel[p.nohStructure.canonical] ?? p.nohStructure.raw }
        : { code: null, label: p.nohStructure.raw },
      seasonGeneral: p.seasonGeneral.canonical,
      maturityLevel: p.maturityLevel,
      schools: p.schools.map((s) => ({
        school: s.school, classification: s.classification, season: s.season,
      })),
      characters: p.characters.map((c) => ({
        role: c.role, name: c.name,
        typeRaw: c.type.raw, typeCanonical: c.type.canonical,
        stateRaw: c.stateRaw, dramaticFunction: c.dramaticFunction,
      })),
      relationships: p.relationships.map((r) => ({
        a: r.a, b: r.b,
        typeRaw: r.type.raw, typeCanonical: r.type.canonical, to: r.type.to,
        basis: r.basis,
      })),
      locations: p.locations.map((l) => ({
        historicalName: l.historicalName, modernName: l.modernName,
        prefecture: l.prefecture, prefectureState: l.prefectureState,
        typeRaw: l.type.raw, typeCanonical: l.type.canonical, scene: l.scene,
      })),
      sources: p.sources.map((s) => ({
        name: s.name, sourceTypeRaw: s.type.raw, sourceTypeCanonical: s.type.canonical,
        relationRaw: s.relationRaw,
      })),
      tags: p.tags.map((t) => ({ category: t.category, value: t.value, basis: t.basis })),
      storyPattern: p.storyPattern
        ? { steps: p.storyPattern.steps, endingRaw: p.storyPattern.ending.raw, endingCanonical: p.storyPattern.ending.canonical }
        : null,
      performance: p.performance
        ? { tsukurimono: p.performance.tsukurimono.state, ai: p.performance.ai.state, taiko: p.performance.taiko.state }
        : null,
      publication: { summaryStatus: status.summaryStatus, hasArticle: !!status.hasArticle },
    }

    // summary は ready+original のときだけ載せる（既定は載らない）
    const s = readyText.get(p.id + ':summary_short') || readyText.get(p.id + ':summary_standard')
    if (s && status.summaryStatus === 'ready') {
      pub.summary = s
      pub.publication.summaryStatus = 'ready'
    }
    return pub
  })

  // 一覧用の軽量索引（本文なし）
  const index = plays.map((p) => ({
    id: p.id, slug: p.slug, title: p.title, titleKana: p.titleKana,
    nohStructure: p.nohStructure.label, prefecture: p.locations[0]?.prefecture ?? null,
    hasArticle: p.publication.hasArticle,
  }))

  writeJson(join(PATHS.publicDir, 'plays.json'), { _meta: stamp(), plays })
  writeJson(join(PATHS.publicDir, 'plays-index.json'), { _meta: stamp(), plays: index })
  log.ok(`public/plays.json: ${plays.length} 曲`)
  log.ok(`public/plays-index.json: ${index.length} 曲`)

  const withSummary = plays.filter((p) => p.summary).length
  log.ok(`summary を載せた曲: ${withSummary}（既定は 0。ready+original のみ）`)
}

main()
