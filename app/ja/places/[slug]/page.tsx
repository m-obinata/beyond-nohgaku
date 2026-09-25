import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleShell, RailBlock } from '@/components/ArticleShell'
import { EntitySections } from '@/components/EntitySections'
import { EntityList } from '@/components/ui/EntityList'
import { SectionHead } from '@/components/ui/SectionHead'
import { RelatedBlock } from '@/components/ArticleBlocks'
import { JourneyStrip } from '@/components/Timeline'
import { PlaceLocator } from '@/components/PlaceLocator'
import { PLACES, placeBySlug } from '@/content/places'
import { playsBySlugs } from '@/content/plays'
import { peopleBySlugs } from '@/content/people'
import { PLACE_NOTES } from '@/content/entity-notes'
import { JOURNEY_YOSHITSUNE } from '@/content/journey-yoshitsune'
import { chapterIndexByPlace } from '@/content/feature-yoshitsune'
import { FeatureNav, FeatureRail } from '@/components/FeatureNav'
import { PlaceGuide } from '@/components/PlaceGuide'
import { Contents } from '@/components/PlaySummary'

export function generateStaticParams() {
  return PLACES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const place = placeBySlug(slug)
  return { title: place?.name ?? '土地', description: place?.summary }
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const place = placeBySlug(slug)
  if (!place) notFound()

  const note = PLACE_NOTES[slug]
  const plays = playsBySlugs(place.plays)
  const people = peopleBySlugs(place.people)

  const chapterIndex = chapterIndexByPlace(slug)
  const allStops = JOURNEY_YOSHITSUNE.stops
  const here = allStops.filter((s) => s.placeSlug === slug)
  const step = here[0]?.step
  const window = step ? allStops.filter((s) => Math.abs(s.step - step) <= 2) : []

  return (
    <ArticleShell
      breadcrumb={[
        { href: '/ja', label: '能楽の向こう側' },
        { href: '/ja/places', label: '土地' },
        { href: '/ja/places/' + place.slug, label: place.name },
      ]}
      meta={{
        slug: place.slug,
        kind: 'place',
        title: place.name,
        reading: place.reading,
        romaji: place.romaji,
        question: note?.question,
        lede: note?.lede ?? place.summary,
        period: '',
        places: [],
        people: [],
        plays: [],
        sources: [],
        themes: [],
      }}
      metaRows={[
        { label: 'いまの所在', value: place.modernName },
        { label: '旧国', value: place.region },
        { label: '行き方', value: place.access ?? '—' },
        { label: '座標', value: place.lat.toFixed(3) + '°N  ' + place.lon.toFixed(3) + '°E' },
        {
          label: '関連演目',
          links: plays.map((p) => ({ href: '/ja/plays/' + p.slug, name: p.name })),
        },
        {
          label: '人物',
          links: people.map((p) => ({ href: '/ja/people/' + p.slug, name: p.name })),
        },
      ]}
      journey={
        <>
          {note && (
            <RailBlock label="CONTENTS" note="この記事の構成">
              <Contents
                items={[
                  ...note.sections.map((s) => ({ label: s.label, caption: s.caption })),
                  { label: 'PLACE', caption: '現地を歩く' },
                  { label: 'RELATED', caption: '関連' },
                ]}
              />
            </RailBlock>
          )}
          {step ? (
            <>
              <RailBlock label="JOURNEY" note="前後の移動">
                <JourneyStrip stops={window} currentStep={step} />
              </RailBlock>
              {chapterIndex >= 0 && (
                <RailBlock label="FEATURE" note="特集のなかの位置">
                  <FeatureRail index={chapterIndex} />
                </RailBlock>
              )}
            </>
          ) : null}
        </>
      }
      context={
        <>
          {step && (
            <RailBlock label="LOCATION" note="旅程のなかの位置">
              <PlaceLocator stops={allStops} initialStep={step} />
            </RailBlock>
          )}
          <RailBlock label="PLAYS" note="この土地の曲">
            <EntityList
              items={plays.map((p) => ({
                href: '/ja/plays/' + p.slug,
                name: '能「' + p.name + '」',
                note: p.category,
              }))}
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
      {note ? (
        <EntitySections sections={note.sections} />
      ) : (
        <section>
          <SectionHead label="SUMMARY" caption="この土地について" />
          <div className="prose-nohgaku">
            <p>{place.summary}</p>
            {place.today && <p>現在 — {place.today}</p>}
            <p className="text-muted">
              この土地の詳細な記事は準備中です。現在は関連する演目・人物への導線のみを掲載しています。
            </p>
          </div>
        </section>
      )}

      <section className="mt-16">
        <SectionHead label="PLACE" caption="現地を歩く" />
        <PlaceGuide place={place} />
      </section>

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
              label: '人物',
              items: people.map((p) => ({
                href: '/ja/people/' + p.slug,
                name: p.name,
                note: p.role,
              })),
            },
            {
              label: '特集',
              items: [
                {
                  href: '/ja/features/yoshitsune-benkei',
                  name: '義経は、どのように義経になったのか。',
                  note: 'FEATURE 01 — 鞍馬から平泉への旅',
                },
              ],
            },
          ]}
        />
      </section>

      <section className="mt-16">
        <SectionHead label="SAME AXES" caption="同じ軸で、ほかの土地を探す" />
        <div className="flex flex-wrap gap-2">
          <Link
            href={'/ja/places?region=' + encodeURIComponent(place.regionModern)}
            className="label border-rule-strong hover:border-accent hover:text-accent border px-3 py-1.5 transition-colors"
          >
            地方 — {place.regionModern}
          </Link>
          {place.prefecture !== '—' && (
            <Link
              href={'/ja/places?pref=' + encodeURIComponent(place.prefecture)}
              className="label border-rule-strong hover:border-accent hover:text-accent border px-3 py-1.5 transition-colors"
            >
              {place.prefecture}
            </Link>
          )}
          <Link
            href={'/ja/places?kind=' + encodeURIComponent(place.kind)}
            className="label border-rule-strong hover:border-accent hover:text-accent border px-3 py-1.5 transition-colors"
          >
            土地の性格 — {place.kind}
          </Link>
        </div>
      </section>

      <FeatureNav index={chapterIndex} />
    </ArticleShell>
  )
}
