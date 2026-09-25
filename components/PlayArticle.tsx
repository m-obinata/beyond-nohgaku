import Link from 'next/link'
import { ArticleShell, RailBlock } from '@/components/ArticleShell'
import { SectionHead } from '@/components/ui/SectionHead'
import { EntityList } from '@/components/ui/EntityList'
import { JourneyStrip } from '@/components/Timeline'
import { ArchiveList, PerformanceList, RelatedBlock, SakeBlock } from '@/components/ArticleBlocks'
import { PLAY_ARTICLES } from '@/content/articles'
import { playBySlug, playsBySlugs } from '@/content/plays'
import { peopleBySlugs } from '@/content/people'
import { placesBySlugs } from '@/content/places'
import { sourcesBySlugs } from '@/content/sources'
import { themesBySlugs } from '@/content/themes'
import { performancesForPlay } from '@/content/performances'
import { JOURNEY_YOSHITSUNE } from '@/content/journey-yoshitsune'
import { chapterIndexByPlay } from '@/content/feature-yoshitsune'
import { FeatureNav, FeatureRail } from '@/components/FeatureNav'
import { GlossaryRail } from '@/components/GlossaryRail'
import { Contents, PlaySummary } from '@/components/PlaySummary'
import { WatchBlock } from '@/components/WatchBlock'

/** 演目記事の共通シェル。章の有無は記事ごとに変えてよい（指示書 15） */
export function PlayArticle({ slug, children }: { slug: string; children: React.ReactNode }) {
  const play = playBySlug(slug)
  const extras = PLAY_ARTICLES[slug]
  if (!play || !extras) return null

  const people = peopleBySlugs(play.people)
  const places = placesBySlugs(play.places)
  const sources = sourcesBySlugs(play.sources)
  const themes = themesBySlugs(play.themes)
  const related = playsBySlugs(play.relatedPlays)
  const performances = performancesForPlay(slug)

  const chapterIndex = chapterIndexByPlay(slug)
  const step = extras.journeyStep
  const stops = JOURNEY_YOSHITSUNE.stops
  const window = step
    ? stops.filter((s) => Math.abs(s.step - step) <= 2)
    : []

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
        question: extras.question,
        lede: extras.lede,
        period: extras.period,
        places: [],
        people: [],
        plays: [],
        sources: [],
        themes: [],
      }}
      metaRows={[
        { label: '年代', value: extras.period },
        {
          label: '場所',
          links: places.map((p) => ({
            href: '/ja/places/' + p.slug,
            name: p.name,
            note: 'いまの ' + p.modernName,
          })),
        },
        {
          label: '人物',
          links: people.map((p) => ({ href: '/ja/people/' + p.slug, name: p.name })),
        },
        { label: '分類', value: play.category + '／' + play.author },
        {
          label: '関連演目',
          links: related.map((p) => ({ href: '/ja/plays/' + p.slug, name: p.name })),
        },
      ]}
      summary={
        <>
          <PlaySummary
            play={play}
            places={places}
            minutesLabel={play.minutes ? '約 ' + play.minutes + ' 分' : undefined}
            performanceCount={performances.length}
          />
          {extras.watch && (
            <div className="mt-6">
              <WatchBlock
                watch={extras.watch}
                minutes={play.minutes}
                performanceCount={performances.length}
              />
            </div>
          )}
        </>
      }
      journey={
        <>
          <RailBlock label="CONTENTS" note="この記事の構成">
            <Contents
              items={[
                ...extras.contents,
                { label: 'ARCHIVE', caption: '史料・図版' },
                ...(extras.sake ? [{ label: 'SAKE', caption: '旅のあとに一献' }] : []),
                { label: 'PERFORMANCE', caption: '公演' },
                { label: 'RELATED', caption: '関連' },
              ]}
            />
          </RailBlock>
          {step ? (
            <>
              <RailBlock label="JOURNEY" note="前後の移動">
                <JourneyStrip stops={window} currentStep={step} />
              </RailBlock>
              <RailBlock label="FEATURE" note="特集のなかの位置">
                <FeatureRail index={chapterIndex} />
              </RailBlock>
            </>
          ) : null}
        </>
      }
      context={
        <>
          <RailBlock label="PEOPLE" note="人物">
            <EntityList
              items={people.map((p) => ({
                href: '/ja/people/' + p.slug,
                name: p.name,
                note: p.role,
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

          <RailBlock label="GLOSSARY" note="この記事の言葉">
            <GlossaryRail terms={extras.terms} />
          </RailBlock>

          <RailBlock label="THEMES" note="主題">
            <EntityList
              items={themes.map((t) => ({ href: '/ja/themes/' + t.slug, name: t.name }))}
              dense
            />
          </RailBlock>

          <RailBlock label="ON STAGE" note="この曲について">
            <dl className="mt-1">
              <div className="border-rule grid grid-cols-[4.5rem_1fr] gap-x-3 border-t py-2">
                <dt className="label">分類</dt>
                <dd className="font-serif text-small">{play.category}</dd>
              </div>
              <div className="border-rule grid grid-cols-[4.5rem_1fr] gap-x-3 border-t py-2">
                <dt className="label">作者</dt>
                <dd className="font-serif text-small">{play.author}</dd>
              </div>
              <div className="border-rule grid grid-cols-[4.5rem_1fr] gap-x-3 border-t border-b py-2">
                <dt className="label">公演</dt>
                <dd className="font-serif text-small">{performances.length} 件</dd>
              </div>
            </dl>
          </RailBlock>
        </>
      }
    >
      {children}

      <section className="mt-16">
        <SectionHead label="ARCHIVE" caption="史料・古絵図・図版" />
        <ArchiveList items={extras.archive} />
      </section>

      {extras.sake && (
        <section className="mt-16">
          <SectionHead label="SAKE" caption="旅のあとに一献" />
          <SakeBlock note={extras.sake} />
        </section>
      )}

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
              label: '人物',
              items: people.map((p) => ({
                href: '/ja/people/' + p.slug,
                name: p.name,
                note: p.role,
              })),
            },
            {
              label: '土地',
              items: places.map((p) => ({
                href: '/ja/places/' + p.slug,
                name: p.name,
                note: 'いまの ' + p.modernName,
              })),
            },
          ]}
        />
      </section>

      <section className="mt-16">
        <SectionHead label="SAME AXES" caption="同じ軸で、ほかの曲を探す" />
        <div className="flex flex-wrap gap-2">
          {[
            { label: '時代 — ' + play.settingEra, href: '/ja/plays?era=' + encodeURIComponent(play.settingEra) },
            ...[...new Set(places.map((p) => p.regionModern))].map((r) => ({
              label: '地域 — ' + r,
              href: '/ja/plays?region=' + encodeURIComponent(r),
            })),
            ...themes.map((t) => ({
              label: '主題 — ' + t.name,
              href: '/ja/plays?theme=' + encodeURIComponent(t.name),
            })),
            ...play.shiteType.map((t) => ({
              label: '主役 — ' + t,
              href: '/ja/plays?shite=' + encodeURIComponent(t),
            })),
            { label: '形式 — ' + play.form, href: '/ja/plays?form=' + encodeURIComponent(play.form) },
          ].map((x) => (
            <Link
              key={x.href + x.label}
              href={x.href}
              className="label border-rule-strong hover:border-accent hover:text-accent border px-3 py-1.5 transition-colors"
            >
              {x.label}
            </Link>
          ))}
        </div>
      </section>

      <FeatureNav index={chapterIndex} />
    </ArticleShell>
  )
}
