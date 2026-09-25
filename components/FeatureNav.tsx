import Link from 'next/link'
import {
  FEATURE_YOSHITSUNE as F,
  chapterHref,
  chapters,
} from '@/content/feature-yoshitsune'

/**
 * 特集のなかでの現在地と、その続き。
 *
 * 記事を読み終えた読者が「で、次はどこへ行けばいいのか」で止まらないようにする。
 * 関連記事の一覧だけでは、順番のある特集では居場所を見失う。
 */
export function FeatureNav({ index }: { index: number }) {
  if (index < 0) return null
  const current = chapters[index]
  const prev = index > 0 ? chapters[index - 1] : undefined
  const next = index < chapters.length - 1 ? chapters[index + 1] : undefined

  return (
    <nav aria-label="特集のなかの位置" className="mt-16">
      <div className="rule-top-strong flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pt-3 pb-5">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <span className="label label-ink font-semibold">CONTINUE</span>
          <Link href={'/ja/features/' + F.slug} className="hover:text-accent font-serif text-h3">
            {F.title}
          </Link>
        </div>
        <span className="label">
          {F.number} — 第 {current.no} 章 / 全 {chapters.length} 章
        </span>
      </div>

      {/* 全章の目盛り。いまどこにいるかが一目で分かる */}
      <ol className="mb-8 flex flex-wrap gap-x-1.5 gap-y-2">
        {chapters.map((c, i) => {
          const isCurrent = i === index
          return (
            <li key={c.no}>
              <Link
                href={chapterHref(c)}
                aria-current={isCurrent ? 'step' : undefined}
                title={c.no + ' ' + c.place}
                className={
                  'label flex h-7 min-w-7 items-center justify-center border px-1.5 transition-colors ' +
                  (isCurrent
                    ? 'border-accent bg-accent text-canvas font-semibold'
                    : c.status === '公開'
                      ? 'border-rule-strong hover:border-accent hover:text-accent'
                      : 'border-rule text-muted hover:border-accent hover:text-accent')
                }
              >
                {c.no}
              </Link>
            </li>
          )
        })}
      </ol>

      <div className="grid grid-cols-1 gap-x-10 gap-y-4 lg:grid-cols-2">
        <ChapterLink chapter={prev} direction="prev" />
        <ChapterLink chapter={next} direction="next" />
      </div>
    </nav>
  )
}

function ChapterLink({
  chapter,
  direction,
}: {
  chapter?: (typeof chapters)[number]
  direction: 'prev' | 'next'
}) {
  const isNext = direction === 'next'
  if (!chapter) {
    return (
      <div className="border-rule border-t py-5">
        <span className="label">{isNext ? '次の章' : '前の章'}</span>
        <p className="text-muted mt-2 font-serif text-small">
          {isNext ? 'この特集の最後の章です。' : 'この特集の最初の章です。'}
        </p>
        <p className="mt-3">
          <Link
            href={'/ja/features/' + F.slug}
            className="label hover:text-accent decoration-rule-strong underline underline-offset-4"
          >
            特集の地図に戻る →
          </Link>
        </p>
      </div>
    )
  }

  return (
    <Link
      href={chapterHref(chapter)}
      className={
        'border-rule group hover:bg-accent/[0.04] block border-t py-5 transition-colors ' +
        (isNext ? 'lg:text-right' : '')
      }
    >
      <span className="label">
        {isNext ? '次の章 →' : '← 前の章'}
        <span className="text-muted ml-2 tracking-normal normal-case">第 {chapter.no} 章</span>
      </span>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-3 lg:justify-start">
        <span className="font-serif text-h3 group-hover:text-accent">{chapter.place}</span>
        <span className="label">{chapter.romaji}</span>
        {chapter.plays.length > 0 && (
          <span className="font-serif text-small text-muted">
            能「{chapter.plays.map((p) => p.name).join('」「')}」
          </span>
        )}
      </p>
      <p className="mt-1.5 font-serif text-small text-ink/85">{chapter.summary}</p>
      {chapter.status === '準備中' && (
        <span className="label mt-2 block">記事は準備中 — 土地の頁へ</span>
      )}
    </Link>
  )
}

/** 左レール用。特集のなかの位置だけを小さく示す */
export function FeatureRail({ index }: { index: number }) {
  if (index < 0) return null
  const current = chapters[index]
  return (
    <div>
      <Link href={'/ja/features/' + F.slug} className="hover:text-accent block font-serif text-small">
        {F.title}
      </Link>
      <p className="label mt-1.5">
        {F.number} — 第 {current.no} 章 / 全 {chapters.length} 章
      </p>
      <p className="mt-2">
        <Link
          href={'/ja/features/' + F.slug}
          className="label hover:text-accent decoration-rule-strong underline underline-offset-4"
        >
          地図と年表で見る →
        </Link>
      </p>
    </div>
  )
}
