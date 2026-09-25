import Link from 'next/link'
import { chapterHref, type FeatureChapter } from '@/content/feature-yoshitsune'

/**
 * 章の一覧。
 *
 * 特集はこれから増える。各特集が十数章を持つので、一覧ページで全部開いていると
 * 画面が章で埋まり、肝心の「どんな特集があるか」が見えなくなる。
 *
 * そこで一覧では既定で畳み、開いていない状態でも中身が分かるように
 * 経路と進捗を一行で見せる。特集そのもののページでは開いたまま出す。
 *
 * details / summary を使うので、JavaScript なしで動く。
 */

function routeLine(chapters: FeatureChapter[]) {
  const names = chapters.map((c) => c.place)
  if (names.length <= 5) return names.join(' → ')
  return [names[0], names[1], '…', names[names.length - 2], names[names.length - 1]].join(' → ')
}

export function ChapterList({
  chapters,
  collapsible = false,
  defaultOpen = false,
}: {
  chapters: FeatureChapter[]
  /** 一覧ページでは true。特集そのもののページでは false（常に開いたまま） */
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const published = chapters.filter((c) => c.status === '公開').length

  const list = (
    <ol className="mt-2">
      {chapters.map((c) => (
        <li key={c.no} className="border-rule border-t py-2 last:border-b">
          <Link href={chapterHref(c)} className="group flex items-baseline gap-3">
            <span className="num text-micro text-muted">{c.no}</span>
            <span className="flex-1 font-serif text-small group-hover:text-accent">{c.place}</span>
            <span className="label">{c.romaji}</span>
            <span className="flex-1 text-right font-serif text-micro text-muted">
              {c.plays.map((p) => p.name).join(' / ') || '—'}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )

  if (!collapsible) {
    return (
      <div>
        <div className="border-rule-strong flex items-baseline justify-between border-t pt-3">
          <span className="label label-ink font-semibold">CHAPTERS</span>
          <span className="label">全 {chapters.length} 章</span>
        </div>
        {list}
      </div>
    )
  }

  return (
    <details open={defaultOpen} className="group">
      <summary className="border-rule-strong cursor-pointer list-none border-t pt-3 [&::-webkit-details-marker]:hidden">
        <span className="flex items-baseline justify-between gap-4">
          <span className="label label-ink font-semibold">CHAPTERS</span>
          <span className="label">
            全 {chapters.length} 章
            <span className="text-accent ml-2">公開 {published}</span>
          </span>
        </span>

        <span className="mt-2 block font-serif text-small text-muted group-open:hidden">
          {routeLine(chapters)}
        </span>

        <span className="label hover:text-accent mt-2 block">
          <span className="group-open:hidden">章を開く ＋</span>
          <span className="hidden group-open:inline">章を閉じる −</span>
        </span>
      </summary>

      {list}
    </details>
  )
}
