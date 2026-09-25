import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArticleShell, RailBlock } from '@/components/ArticleShell'
import { EntitySections } from '@/components/EntitySections'
import { EntityList } from '@/components/ui/EntityList'
import { SectionHead } from '@/components/ui/SectionHead'
import { RelatedBlock } from '@/components/ArticleBlocks'
import { JourneyStrip } from '@/components/Timeline'
import { PEOPLE, personBySlug } from '@/content/people'
import { playsBySlugs } from '@/content/plays'
import { placesBySlugs } from '@/content/places'
import { sourcesBySlugs } from '@/content/sources'
import { PERSON_NOTES } from '@/content/entity-notes'
import { JOURNEY_YOSHITSUNE } from '@/content/journey-yoshitsune'

export function generateStaticParams() {
  return PEOPLE.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const person = personBySlug(slug)
  return { title: person?.name ?? '人物', description: person?.summary }
}

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const person = personBySlug(slug)
  if (!person) notFound()

  const note = PERSON_NOTES[slug]
  const plays = playsBySlugs(person.plays)
  const places = placesBySlugs(person.places)
  const sources = sourcesBySlugs(person.sources)

  /** この人物が現れる旅程の地点 */
  const stops = JOURNEY_YOSHITSUNE.stops.filter((s) => person.places.includes(s.placeSlug))

  return (
    <ArticleShell
      breadcrumb={[
        { href: '/ja', label: '能楽の向こう側' },
        { href: '/ja/people', label: '人物' },
        { href: '/ja/people/' + person.slug, label: person.name },
      ]}
      meta={{
        slug: person.slug,
        kind: 'person',
        title: person.name,
        reading: person.reading,
        romaji: 'PERSON',
        lede: note?.lede ?? person.summary,
        period: person.lifespan ?? '',
        places: [],
        people: [],
        plays: [],
        sources: [],
        themes: [],
      }}
      metaRows={[
        { label: '生没年', value: person.lifespan ?? '不詳' },
        { label: '立場', value: person.role },
        {
          label: '土地',
          links: places.map((p) => ({ href: '/ja/places/' + p.slug, name: p.name })),
        },
        {
          label: '関連演目',
          links: plays.map((p) => ({ href: '/ja/plays/' + p.slug, name: p.name })),
        },
        {
          label: '出典',
          links: sources.map((s) => ({ href: '/ja/sources/' + s.slug, name: '『' + s.name + '』' })),
        },
      ]}
      journey={
        stops.length > 0 ? (
          <RailBlock label="JOURNEY" note="旅程での位置">
            <JourneyStrip stops={stops} currentStep={-1} />
          </RailBlock>
        ) : null
      }
      context={
        <>
          <RailBlock label="PLAYS" note="登場する曲">
            <EntityList
              items={plays.map((p) => ({
                href: '/ja/plays/' + p.slug,
                name: '能「' + p.name + '」',
                note: p.category,
              }))}
              dense
            />
          </RailBlock>
          <RailBlock label="SOURCES" note="出典">
            <EntityList
              items={sources.map((s) => ({
                href: '/ja/sources/' + s.slug,
                name: '『' + s.name + '』',
                note: s.period,
              }))}
              dense
            />
          </RailBlock>
          <RailBlock label="PLACES" note="関わる土地">
            <EntityList
              items={places.map((p) => ({
                href: '/ja/places/' + p.slug,
                name: p.name,
                romaji: p.romaji,
              }))}
              dense
            />
          </RailBlock>
        </>
      }
    >
      {note ? (
        <EntitySections sections={note.sections} />
      ) : (
        <section>
          <SectionHead label="SUMMARY" caption="この人物について" />
          <div className="prose-nohgaku">
            <p>{person.summary}</p>
            <p className="text-muted">
              この人物の詳細な記事は準備中です。現在は関連する演目・土地・出典への導線のみを掲載しています。
            </p>
          </div>
        </section>
      )}

      <section className="mt-16">
        <SectionHead label="RELATED" caption="関連記事・人物・演目" />
        <RelatedBlock
          groups={[
            {
              label: '演目',
              items: plays.map((p) => ({
                href: '/ja/plays/' + p.slug,
                name: '能「' + p.name + '」',
                note: p.summary,
              })),
            },
            {
              label: '土地',
              items: places.map((p) => ({
                href: '/ja/places/' + p.slug,
                name: p.name,
                note: p.summary,
              })),
            },
            {
              label: '出典',
              items: sources.map((s) => ({
                href: '/ja/sources/' + s.slug,
                name: '『' + s.name + '』',
                note: s.period,
              })),
            },
          ]}
        />
        <p className="mt-6">
          <Link
            href="/ja/features/yoshitsune-benkei"
            className="label hover:text-accent decoration-rule-strong underline underline-offset-4"
          >
            特集 01 — 義経は、どのように義経になったのか。→
          </Link>
        </p>
      </section>
    </ArticleShell>
  )
}
