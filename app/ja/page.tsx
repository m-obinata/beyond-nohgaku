import Link from 'next/link'
import { BlockHead } from '@/components/ui/SectionHead'
import { EntityList } from '@/components/ui/EntityList'
import { PerformanceList } from '@/components/ArticleBlocks'
import { ChapterList } from '@/components/ChapterList'
import { SOURCE_LAYERS, SOURCE_LAYER_ORDER } from '@/content/source-layers'
import { FEATURE_YOSHITSUNE as F } from '@/content/feature-yoshitsune'
import { PLAYS } from '@/content/plays'
import { PEOPLE } from '@/content/people'
import { PLACES } from '@/content/places'
import { THEMES } from '@/content/themes'
import { SOURCES } from '@/content/sources'
import { PERFORMANCES } from '@/content/performances'

const INDEX_ROWS = [
  { label: '演目', en: 'PLAYS', n: PLAYS.length, href: '/ja/plays' },
  { label: '人物', en: 'PEOPLE', n: PEOPLE.length, href: '/ja/people' },
  { label: '土地', en: 'PLACES', n: PLACES.length, href: '/ja/places' },
  { label: '主題', en: 'THEMES', n: THEMES.length, href: '/ja/themes' },
  { label: '出典', en: 'SOURCES', n: SOURCES.length, href: '/ja/sources' },
]

const DISCOVERY = [
  {
    label: 'PEOPLE',
    title: '人物から',
    href: '/ja/people',
    items: ['minamoto-yoshitsune', 'benkei', 'ariwara-narihira', 'taira-atsumori'].map((slug) => {
      const p = PEOPLE.find((x) => x.slug === slug)!
      return { href: '/ja/people/' + p.slug, name: p.name, meta: p.lifespan, note: p.role }
    }),
  },
  {
    label: 'PLACES',
    title: '土地から',
    href: '/ja/places',
    items: ['kyoto', 'yoshino', 'kumano', 'hiraizumi', 'hokurikudo', 'setouchi'].map((slug) => {
      const p = PLACES.find((x) => x.slug === slug)!
      return { href: '/ja/places/' + p.slug, name: p.name, romaji: p.romaji, meta: p.prefecture }
    }),
  },
  {
    label: 'PLAYS',
    title: '演目から',
    href: '/ja/plays',
    items: ['ataka', 'funabenkei', 'izutsu', 'hagoromo', 'shunkan'].map((slug) => {
      const p = PLAYS.find((x) => x.slug === slug)!
      return { href: '/ja/plays/' + p.slug, name: p.name, romaji: p.romaji, meta: p.category }
    }),
  },
  {
    label: 'THEMES',
    title: '主題から',
    href: '/ja/themes',
    items: ['haisha', 'onryo', 'tabi', 'chugi', 'koi', 'chinkon'].map((slug) => {
      const t = THEMES.find((x) => x.slug === slug)!
      return { href: '/ja/themes/' + t.slug, name: t.name, note: t.summary }
    }),
  },
]

export default function TopPage() {
  return (
    <div className="mx-auto max-w-shell px-5 md:px-8">
      {/* ─────────── HERO ─────────── */}
      <section className="grid gap-x-10 gap-y-8 pt-10 pb-12 md:pt-14 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h1 className="font-serif text-display leading-[1.3] md:text-[3.25rem]">
            能楽の向こう側
          </h1>
          <p className="mt-3 font-serif text-h2 text-ink/85">日本の物語と土地を旅する</p>
          <p className="label mt-5">
            BEYOND NOHGAKU
            <span className="ml-4 tracking-normal normal-case">
              Journeys through Japanese stories and landscapes.
            </span>
          </p>
          <p className="mt-7 max-w-read font-serif text-lede">
            能楽を入口に、歴史と土地に残された物語をたどります。
            一曲の能の向こう側には、史料に残る出来事と、後世の人が作り足した物語と、
            いまも歩いて行ける土地があります。ここでは、その三つを混ぜずに並べて読みます。
          </p>
        </div>

        {/* 右: このアーカイブの索引。飾りではなく入口 */}
        <div className="lg:col-span-4">
          <div className="border-rule-strong border-t pt-3">
            <span className="label label-ink font-semibold">INDEX</span>
            <ul className="mt-2">
              {INDEX_ROWS.map((r) => (
                <li key={r.en}>
                  <Link href={r.href} className="list-row group">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="flex items-baseline gap-3">
                        <span className="font-serif text-[1rem] group-hover:text-accent">
                          {r.label}
                        </span>
                        <span className="label">{r.en}</span>
                      </span>
                      <span className="num text-small text-muted">{r.n}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-muted mt-3 font-sans text-micro">
              すべての記述には、史料・物語・舞台のどれに属するかの表示が付きます。
            </p>
          </div>
        </div>
      </section>

      {/* ─────────── FEATURE 01 ─────────── */}
      <section className="pb-16">
        <BlockHead label={F.number} note="特集" />
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-serif text-h1 leading-snug">
              <Link href={'/ja/features/' + F.slug} className="hover:text-accent">
                {F.title}
              </Link>
            </h2>
            <p className="mt-3 font-serif text-h3 text-muted">{F.subtitle}</p>
            <div className="mt-6 max-w-read">
              {F.lede.map((p) => (
                <p key={p} className="mt-3 font-serif text-body first:mt-0">
                  {p}
                </p>
              ))}
            </div>
            <p className="mt-7">
              <Link
                href={'/ja/features/' + F.slug}
                className="label border-ink hover:bg-accent hover:border-accent hover:text-canvas inline-block border px-5 py-3 transition-colors"
              >
                {F.cta} — START THE JOURNEY →
              </Link>
            </p>
          </div>

          {/*
            章は畳んでおく。特集が増えたとき、トップが章で埋まらないようにするため。
            畳んだ状態でも経路と進捗は見えるようにしている。
          */}
          <div className="lg:col-span-5">
            <ChapterList chapters={F.chapters} collapsible />
          </div>
        </div>
      </section>

      {/* ─────────── DISCOVERY ─────────── */}
      <section className="pb-16">
        <BlockHead
          label="DISCOVERY"
          title="何から旅しますか？"
          note="どこから入っても、最後は同じ地図の上でつながります"
        />
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {DISCOVERY.map((g) => (
            <div key={g.label}>
              <div className="border-rule-strong flex items-baseline justify-between border-b pb-1.5">
                <span className="label label-ink font-semibold">{g.label}</span>
                <Link href={g.href} className="label hover:text-accent">
                  {g.title} →
                </Link>
              </div>
              <div className="mt-1">
                <EntityList items={g.items} dense={g.label !== 'THEMES'} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── HOW TO READ ─────────── */}
      <section className="pb-16">
        <BlockHead
          label="HOW TO READ"
          title="史実と物語を、混ぜずに読む"
          note="本サイトのすべての記述に、次のいずれかの表示が付きます"
        />
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <dl>
              {SOURCE_LAYER_ORDER.map((id) => {
                const l = SOURCE_LAYERS[id]
                return (
                  <div
                    key={id}
                    className="border-rule grid grid-cols-[6.5rem_1fr] gap-x-5 border-t py-3 last:border-b sm:grid-cols-[7.5rem_1fr_9rem]"
                  >
                    <dt className="label label-ink font-semibold">{l.label}</dt>
                    <dd className="font-serif text-small">{l.definition}</dd>
                    <dd className="col-span-2 font-sans text-micro text-muted sm:col-span-1 sm:text-right">
                      {l.evidence}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
          <div className="lg:col-span-5">
            <div className="border-rule bg-paper border px-5 py-5">
              <p className="font-serif text-small">
                「史実度 ★★★☆☆」のような数値は使いません。
                正誤を採点することが目的ではなく、その一文がどの層の情報なのかを示すことが目的だからです。
              </p>
              <p className="mt-3 font-serif text-small text-muted">
                たとえば能「橋弁慶」で牛若が人を斬るのは、史実の否定ではなく、
                室町時代の舞台がそう作ったという事実です。層が違えば、読み方も変わります。
              </p>
              <p className="mt-4">
                <Link
                  href="/ja/about/source-layers"
                  className="label hover:text-accent decoration-rule-strong underline underline-offset-4"
                >
                  情報のレイヤーについて →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── PERFORMANCES ─────────── */}
      <section className="pb-8">
        <BlockHead label="PERFORMANCE" title="この物語を舞台で観る" note="直近の公演" />
        <PerformanceList performances={PERFORMANCES.slice(0, 4)} />
      </section>
    </div>
  )
}
