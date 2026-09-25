import Link from 'next/link'
import type { Place, Play } from '@/lib/types'
import { sectionId } from '@/lib/slug'

/**
 * AT A GLANCE。
 *
 * 検索から来た読者は、まず「これは何の曲か」を知りたい。
 * 四千字の本文に直接落とすのではなく、十秒で答えが出る面を先に置く。
 * 長文を読むかどうかは、そのあとで決めてもらう。
 */
export function PlaySummary({
  play,
  places,
  minutesLabel,
  performanceCount,
}: {
  play: Play
  places: Place[]
  minutesLabel?: string
  performanceCount: number
}) {
  const stage = places[0]

  return (
    <section className="border-rule bg-paper mt-10 border px-5 py-5 md:px-7 md:py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="label label-ink font-semibold">AT A GLANCE — この曲は</span>
        <span className="label">{play.composedEra} 成立</span>
      </div>

      <p className="mt-4 font-serif text-lede">{play.hook}</p>

      <dl className="border-rule mt-5 grid grid-cols-2 gap-x-8 gap-y-4 border-t pt-4 md:grid-cols-4">
        <div>
          <dt className="label">舞台</dt>
          <dd className="mt-1 font-serif text-small">
            {stage ? (
              <>
                <Link href={'/ja/places/' + stage.slug} className="hover:text-accent">
                  {stage.name}
                </Link>
                <span className="text-muted mt-0.5 block font-sans text-micro">
                  いまの {stage.modernName}
                </span>
              </>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt className="label">時代</dt>
          <dd className="mt-1 font-serif text-small">{play.settingEra}</dd>
        </div>
        <div>
          <dt className="label">主役</dt>
          <dd className="mt-1 font-serif text-small">{play.shiteType.join('・')}</dd>
        </div>
        <div>
          <dt className="label">形式</dt>
          <dd className="mt-1 font-serif text-small">
            {play.form}
            <span className="text-muted mt-0.5 block font-sans text-micro">{play.category}</span>
          </dd>
        </div>
      </dl>

      <div className="border-rule mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t pt-4">
        {minutesLabel && <span className="label">上演 {minutesLabel}</span>}
        <span className="label">作者 — {play.author}</span>
        <Link
          href={'#' + sectionId('PERFORMANCE')}
          className="label text-accent decoration-rule-strong hover:underline underline-offset-4"
        >
          公演 {performanceCount} 件 ↓
        </Link>
        <Link
          href={'#' + sectionId('PLACE')}
          className="label text-accent decoration-rule-strong hover:underline underline-offset-4"
        >
          現地を歩く ↓
        </Link>
      </div>
    </section>
  )
}

/** 左レールの目次。長い記事のどこに何があるかを最初に見せる */
export function Contents({
  items,
}: {
  items: { label: string; caption?: string }[]
}) {
  return (
    <ol>
      {items.map((s, i) => (
        <li key={s.label} className="border-rule border-t last:border-b">
          <a
            href={'#' + sectionId(s.label)}
            className="hover:text-accent flex items-baseline gap-2.5 py-2"
          >
            <span className="num text-micro text-muted">{String(i + 1).padStart(2, '0')}</span>
            <span className="flex-1">
              <span className="label block">{s.label}</span>
              {s.caption && (
                <span className="mt-0.5 block font-serif text-micro text-muted">{s.caption}</span>
              )}
            </span>
          </a>
        </li>
      ))}
    </ol>
  )
}
