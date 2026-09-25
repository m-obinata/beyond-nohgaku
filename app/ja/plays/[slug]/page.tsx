import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleShell, RailBlock } from '@/components/ArticleShell'
import { EntityList } from '@/components/ui/EntityList'
import { SectionHead } from '@/components/ui/SectionHead'
import { PerformanceList, RelatedBlock } from '@/components/ArticleBlocks'
import { PLAYS, playBySlug, playsBySlugs } from '@/content/plays'
import { peopleBySlugs } from '@/content/people'
import { placesBySlugs } from '@/content/places'
import { sourcesBySlugs } from '@/content/sources'
import { themesBySlugs } from '@/content/themes'
import { performancesForPlay } from '@/content/performances'
import { PLAY_ARTICLES } from '@/content/articles'

/** 本文記事を持つ曲は、それぞれの固定ルートが受け持つ */
export function generateStaticParams() {
  return PLAYS.filter((p) => !PLAY_ARTICLES[p.slug]).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const play = playBySlug(slug)
  return { title: play?.name ?? '演目', description: play?.summary }
}

export default async function PlayStubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const play = playBySlug(slug)
  if (!play) notFound()

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
        {
          label: '場所',
          links: places.map((p) => ({ href: '/ja/places/' + p.slug, name: p.name })),
        },
        {
          label: '人物',
          links: people.map((p) => ({ href: '/ja/people/' + p.slug, name: p.name })),
        },
        {
          label: '出典',
          links: sources.map((s) => ({ href: '/ja/sources/' + s.slug, name: '『' + s.name + '』' })),
        },
        {
          label: '関連演目',
          links: related.map((p) => ({ href: '/ja/plays/' + p.slug, name: p.name })),
        },
      ]}
      context={
        <>
          <RailBlock label="THEMES" note="主題">
            <EntityList
              items={themes.map((t) => ({ href: '/ja/themes/' + t.slug, name: t.name }))}
              dense
            />
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
              items: related.map((p) => ({
                href: '/ja/plays/' + p.slug,
                name: '能「' + p.name + '」',
                note: p.summary,
              })),
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
