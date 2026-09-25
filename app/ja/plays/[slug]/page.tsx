import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArticleShell, RailBlock } from '@/components/ArticleShell'
import { EntityList } from '@/components/ui/EntityList'
import { SectionHead } from '@/components/ui/SectionHead'
import { PerformanceList, RelatedBlock } from '@/components/ArticleBlocks'
import { StructuredContext } from '@/components/noh/StructuredContext'
import { PLAYS, playBySlug, playsBySlugs } from '@/content/plays'
import { peopleBySlugs } from '@/content/people'
import { placesBySlugs } from '@/content/places'
import { sourcesBySlugs } from '@/content/sources'
import { themesBySlugs } from '@/content/themes'
import { performancesForPlay } from '@/content/performances'
import { PLAY_ARTICLES } from '@/content/articles'
import { getAllPlays, getPlayBySlug } from '@/lib/noh-data'

/**
 * ルーティングの三層。
 * 1) 本文記事を持つ曲 … それぞれの固定ルート（app/ja/plays/<slug>/）が受け持つ
 * 2) 編集データ（content/plays）を持つ曲 … このルートで従来どおり表示
 * 3) DBのみの曲（残り234曲）… このルートで構造情報パネルを表示（記事は準備中）
 */
export function generateStaticParams() {
  const curated = new Set(PLAYS.map((p) => p.slug))
  const fromContent = PLAYS.filter((p) => !PLAY_ARTICLES[p.slug]).map((p) => ({ slug: p.slug }))
  const fromDb = getAllPlays()
    .filter((p) => !curated.has(p.slug))
    .map((p) => ({ slug: p.slug }))
  return [...fromContent, ...fromDb]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const play = playBySlug(slug)
  if (play) return { title: play.name, description: play.summary }
  const db = getPlayBySlug(slug)
  return {
    title: db?.title ?? '演目',
    description: db ? `能「${db.title}」の登場人物・土地・原典・物語構造。` : undefined,
  }
}

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const curated = playBySlug(slug)
  if (curated) return <CuratedStub slug={slug} />
  const db = getPlayBySlug(slug)
  if (db) return <DbDetail slug={slug} />
  notFound()
}

/* ─────────── DBのみの曲：構造情報パネル ─────────── */
function DbDetail({ slug }: { slug: string }) {
  const play = getPlayBySlug(slug)!
  return (
    <div className="mx-auto max-w-shell px-5 pt-8 pb-16 md:px-8 md:pt-12">
      <nav aria-label="パンくず" className="mb-6 flex flex-wrap gap-x-3">
        <Link href="/ja" className="label hover:text-accent">能楽の向こう側</Link>
        <span className="label text-muted">／</span>
        <Link href="/ja/explore" className="label hover:text-accent">演目をさがす</Link>
      </nav>

      <header className="pb-10">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <h1 className="font-serif text-h1 md:text-display">{play.title}</h1>
          {play.titleKana && <span className="label">{play.titleKana}</span>}
          {play.titleEn && <span className="label">{play.titleEn}</span>}
        </div>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <span className="label">{play.nohStructure.label}</span>
          {play.locations[0]?.prefecture && play.locations[0].prefectureState === 'known' && (
            <span className="label text-muted">{play.locations[0].prefecture}</span>
          )}
        </p>
        <p className="border-rule-strong bg-paper mt-6 max-w-read border px-4 py-3 font-sans text-micro text-muted">
          この曲の記事本文は準備中です。ここでは登場人物・土地・原典・物語構造といった構造データを表示しています。
          自由記述の自動要約はしていません。
        </p>
      </header>

      <StructuredContext play={play} />

      <section className="border-rule-strong mt-14 border-t pt-6">
        <Link href="/ja/explore" className="label hover:text-accent">← 演目をさがすへ戻る</Link>
      </section>
    </div>
  )
}

/* ─────────── 編集データを持つ曲：従来の導線つきスタブ ─────────── */
function CuratedStub({ slug }: { slug: string }) {
  const play = playBySlug(slug)!
  const people = peopleBySlugs(play.people)
  const places = placesBySlugs(play.places)
  const sources = sourcesBySlugs(play.sources)
  const themes = themesBySlugs(play.themes)
  const related = playsBySlugs(play.relatedPlays)
  const performances = performancesForPlay(slug)

  return (
    <ArticleShell
      breadcrumb={[
        { href: '/ja', label: '能楽の向こう側' },
        { href: '/ja/plays', label: '演目' },
        { href: '/ja/plays/' + play.slug, label: play.name },
      ]}
      meta={{
        slug: play.slug,
        kind: 'play',
        title: play.name,
        reading: play.reading,
        romaji: play.romaji,
        lede: play.summary,
        period: play.category,
        places: [],
        people: [],
        plays: [],
        sources: [],
        themes: [],
      }}
      metaRows={[
        { label: '分類', value: play.category + '／' + play.author },
        { label: '場所', links: places.map((p) => ({ href: '/ja/places/' + p.slug, name: p.name })) },
        { label: '人物', links: people.map((p) => ({ href: '/ja/people/' + p.slug, name: p.name })) },
        { label: '出典', links: sources.map((s) => ({ href: '/ja/sources/' + s.slug, name: '『' + s.name + '』' })) },
        { label: '関連演目', links: related.map((p) => ({ href: '/ja/plays/' + p.slug, name: p.name })) },
      ]}
      context={
        <>
          <RailBlock label="THEMES" note="主題">
            <EntityList items={themes.map((t) => ({ href: '/ja/themes/' + t.slug, name: t.name }))} dense />
          </RailBlock>
          <RailBlock label="PEOPLE" note="人物">
            <EntityList
              items={people.map((p) => ({ href: '/ja/people/' + p.slug, name: p.name, note: p.role }))}
              dense
            />
          </RailBlock>
        </>
      }
    >
      <section>
        <SectionHead label="SUMMARY" caption="この曲について" />
        <div className="prose-nohgaku">
          <p>{play.summary}</p>
        </div>
        <p className="border-rule-strong bg-paper mt-6 border px-4 py-3 font-sans text-micro text-muted">
          この曲の記事は準備中です。現在は関連する人物・土地・出典への導線と、公演情報のみを掲載しています。
        </p>
      </section>

      <section className="mt-16">
        <SectionHead label="PERFORMANCE" caption="この物語を舞台で観る" />
        <PerformanceList performances={performances} playName={play.name} />
      </section>

      <section className="mt-16">
        <SectionHead label="RELATED" caption="関連記事・人物・演目" />
        <RelatedBlock
          groups={[
            {
              label: '演目',
              items: related.map((p) => ({ href: '/ja/plays/' + p.slug, name: '能「' + p.name + '」', note: p.summary })),
            },
            {
              label: '土地',
              items: places.map((p) => ({ href: '/ja/places/' + p.slug, name: p.name, note: p.summary })),
            },
            {
              label: '人物',
              items: people.map((p) => ({ href: '/ja/people/' + p.slug, name: p.name, note: p.role })),
            },
          ]}
        />
      </section>
    </ArticleShell>
  )
}
