import type { Metadata } from 'next'
import Link from 'next/link'
import { BlockHead } from '@/components/ui/SectionHead'
import { JourneyExplorer } from '@/components/JourneyExplorer'
import { ComparisonView } from '@/components/ComparisonView'
import { RelatedBlock } from '@/components/ArticleBlocks'
import { FEATURE_YOSHITSUNE as F, chapterHref } from '@/content/feature-yoshitsune'
import { JOURNEY_YOSHITSUNE, CONTEXT_EVENTS } from '@/content/journey-yoshitsune'
import { COMPARISON_BARRIER } from '@/content/comparisons'

export const metadata: Metadata = {
  title: F.title,
  description: F.lede.join(' '),
}

export default function FeaturePage() {
  return (
    <div className="mx-auto max-w-shell px-5 pt-8 pb-4 md:px-8 md:pt-12">
      {/* ─────────── 特集の扉。全画面写真は置かない ─────────── */}
      <header className="grid gap-x-10 gap-y-8 pb-14 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <span className="label label-ink font-semibold">{F.number}</span>
            <span className="label">特集</span>
          </div>
          <h1 className="mt-5 font-serif text-h1 leading-[1.4] md:text-display">{F.title}</h1>
          <p className="mt-4 font-serif text-h3 text-muted">{F.subtitle}</p>
          <div className="mt-8 max-w-read">
            {F.lede.map((p) => (
              <p key={p} className="mt-4 font-serif text-lede first:mt-0">
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="border-rule-strong border-t pt-3">
            <span className="label label-ink font-semibold">この特集の見取り図</span>
            <dl className="mt-3">
              <div className="border-rule grid grid-cols-[5.5rem_1fr] gap-x-4 border-t py-2.5">
                <dt className="label">区間</dt>
                <dd className="font-serif text-small">鞍馬 — 平泉</dd>
              </div>
              <div className="border-rule grid grid-cols-[5.5rem_1fr] gap-x-4 border-t py-2.5">
                <dt className="label">地点</dt>
                <dd className="num text-small">{JOURNEY_YOSHITSUNE.stops.length} 地点</dd>
              </div>
              <div className="border-rule grid grid-cols-[5.5rem_1fr] gap-x-4 border-t py-2.5">
                <dt className="label">章</dt>
                <dd className="num text-small">{F.chapters.length} 章</dd>
              </div>
              <div className="border-rule grid grid-cols-[5.5rem_1fr] gap-x-4 border-t border-b py-2.5">
                <dt className="label">年代</dt>
                <dd className="num text-small">1159 — 1189</dd>
              </div>
            </dl>
            <p className="text-muted mt-4 font-sans text-micro">
              旅程の両端は物語と能が埋めています。史料で追えるのは、ほぼ中ほどの十年だけです。
            </p>
          </div>
        </div>
      </header>

      {/* ─────────── JOURNEY MAP + TIMELINE ─────────── */}
      <section className="pb-16">
        <BlockHead
          label="JOURNEY"
          title={JOURNEY_YOSHITSUNE.title}
          note="地点を選ぶと、地図と年表が同時に動きます"
        />
        <JourneyExplorer stops={JOURNEY_YOSHITSUNE.stops} contextEvents={CONTEXT_EVENTS} />
      </section>

      {/* ─────────── 特集が追う問い ─────────── */}
      <section className="pb-16">
        <BlockHead
          label="QUESTIONS"
          title="この特集が追う七つの問い"
          note="あらすじの紹介ではなく、問いに沿って読み進めます"
        />
        <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {F.questions.map((q) => (
            <div key={q.key} className="border-rule border-t pt-3">
              <div className="flex items-baseline gap-3">
                <span className="label label-ink font-semibold">{q.en}</span>
                <span className="font-serif text-small">{q.key}</span>
              </div>
              <p className="mt-2 font-serif text-small text-ink/85">{q.body}</p>
            </div>
          ))}
        </div>
        <div className="border-rule-strong mt-10 border-t pt-6">
          <p className="max-w-[46rem] font-serif text-lede">
            最終的にこの特集が置く問いは、「源義経とは誰だったのか」ではありません。
            <span className="text-accent">日本人は、源義経を何者にしてきたのか。</span>
            記録の空白に何を書き足してきたかを見ることは、書き足した側を見ることでもあります。
          </p>
        </div>
      </section>

      {/* ─────────── CHAPTERS ─────────── */}
      <section className="pb-16">
        <BlockHead
          label="CHAPTERS"
          title="十三の章"
          note="各章は、土地・史実・物語・能の四つを並べて読みます"
        />
        <ol>
          {F.chapters.map((c) => {
            const published = c.status === '公開'
            return (
              <li key={c.no} className="border-rule border-t last:border-b">
                <Link
                  href={chapterHref(c)}
                  className="group block py-4 transition-colors hover:bg-accent/[0.04]"
                >
                  <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 lg:grid-cols-[3rem_11rem_1fr_9rem]">
                    <span className="num text-small text-muted">{c.no}</span>
                    <span className="flex items-baseline gap-3">
                      <span className="font-serif text-[1.0625rem] group-hover:text-accent">
                        {c.place}
                      </span>
                      <span className="label">{c.romaji}</span>
                    </span>
                    <span>
                      <span className="block font-serif text-small text-ink/85">{c.summary}</span>
                      {c.plays.length > 0 && (
                        <span className="mt-1 block font-serif text-micro text-muted">
                          能「{c.plays.map((p) => p.name).join('」「')}」
                        </span>
                      )}
                    </span>
                    <span className="label lg:text-right">
                      {published ? (
                        <span className="text-accent font-semibold">記事を読む →</span>
                      ) : (
                        <span>準備中 — 土地の頁へ</span>
                      )}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      {/* ─────────── COMPARATIVE VIEW ─────────── */}
      <section className="pb-16">
        <ComparisonView data={COMPARISON_BARRIER} />
      </section>

      {/* ─────────── 回遊 ─────────── */}
      <section className="pb-8">
        <BlockHead label="RELATED" title="この特集から先へ" />
        <RelatedBlock
          groups={[
            {
              label: '人物',
              items: [
                { href: '/ja/people/minamoto-yoshitsune', name: '源義経', note: '史料で追える十年' },
                { href: '/ja/people/benkei', name: '武蔵坊弁慶', note: '後から書かれた人物' },
              ],
            },
            {
              label: '土地',
              items: [
                { href: '/ja/places/gojo', name: '五条', note: '中世の五条橋はいまの場所にない' },
                { href: '/ja/places/daimotsu', name: '大物浦', note: '海岸線が動いた港' },
                { href: '/ja/places/ataka', name: '安宅', note: '作者がつくった関所' },
              ],
            },
            {
              label: '演目',
              items: [
                { href: '/ja/plays/hashi-benkei', name: '能「橋弁慶」' },
                { href: '/ja/plays/funabenkei', name: '能「船弁慶」' },
                { href: '/ja/plays/ataka', name: '能「安宅」' },
              ],
            },
          ]}
        />
      </section>
    </div>
  )
}
