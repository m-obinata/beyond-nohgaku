import Link from 'next/link'
import type { ArchiveItem, Performance, SakeNote as SakeNoteType } from '@/lib/types'
import { PERFORMANCES_ARE_SAMPLE } from '@/content/performances'

/** PERFORMANCE — この物語を舞台で観る（指示書 22） */
export function PerformanceList({
  performances,
  playName,
}: {
  performances: Performance[]
  playName?: string
}) {
  if (performances.length === 0) {
    return (
      <p className="border-rule border-t py-4 font-serif text-small text-muted">
        現在、掲載できる公演情報はありません。
      </p>
    )
  }
  return (
    <div>
      {PERFORMANCES_ARE_SAMPLE && (
        <p className="border-rule-strong bg-paper mb-4 border px-4 py-2.5 font-sans text-micro text-muted">
          以下は画面設計を検証するためのサンプルであり、実在の公演ではありません。
          公開時には、出典 URL と取得日時つきの実データに差し替えます。
        </p>
      )}
      <ul>
        {performances.map((p) => (
          <li key={p.date + p.venue + p.play} className="border-rule border-t py-3.5 last:border-b">
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-[7.5rem_1fr_auto]">
              <span className="num text-small">{p.dateLabel}</span>
              <span>
                <span className="block font-serif text-[1rem]">
                  能「{p.play}」
                  {!playName && <span className="text-muted ml-2 text-small">{p.school}</span>}
                </span>
                <span className="label mt-0.5 block tracking-normal normal-case">
                  {p.venue}
                  <span className="ml-2">{p.prefecture}</span>
                  {playName && <span className="ml-2">{p.school}</span>}
                </span>
              </span>
              <span className="num text-micro text-muted">{p.price}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3">
        <Link
          href="/ja/performances"
          className="label hover:text-accent decoration-rule-strong underline underline-offset-4"
        >
          公演をすべて見る →
        </Link>
      </p>
    </div>
  )
}

/** ARCHIVE — 史料・古絵図・図版（指示書 20） */
export function ArchiveList({ items }: { items: ArchiveItem[] }) {
  return (
    <ul>
      {items.map((a) => (
        <li key={a.title} className="border-rule border-t py-4 last:border-b">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <span className="font-serif text-[1rem]">{a.title}</span>
            <span className="num text-micro text-muted">{a.period}</span>
          </div>
          <p className="mt-1.5 font-serif text-small text-muted">{a.note}</p>
          <p className="label mt-1.5 tracking-normal normal-case">所蔵 — {a.holding}</p>
        </li>
      ))}
    </ul>
  )
}

/** SAKE — 旅のあとに一献（指示書 21）。観光広告にはしない */
export function SakeBlock({ note }: { note: SakeNoteType }) {
  return (
    <div className="border-rule bg-paper border px-5 py-5 md:px-7 md:py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="label label-ink font-semibold">SAKE — 旅のあとに一献</span>
        <span className="label">{note.region}</span>
      </div>
      <p className="mt-4 font-serif text-body">{note.context}</p>
      <dl className="border-rule mt-5 grid grid-cols-1 gap-x-8 border-t pt-4 sm:grid-cols-3">
        <div>
          <dt className="label">つくり手</dt>
          <dd className="mt-1 font-serif text-small">{note.brewery}</dd>
        </div>
        <div className="mt-3 sm:mt-0">
          <dt className="label">選ぶなら</dt>
          <dd className="mt-1 font-serif text-small">{note.sake}</dd>
        </div>
        <div className="mt-3 sm:mt-0">
          <dt className="label">水と味</dt>
          <dd className="mt-1 font-serif text-small">{note.body}</dd>
        </div>
      </dl>
    </div>
  )
}

/** RELATED — 関連記事・人物・演目。回遊のための出口（指示書 32） */
export function RelatedBlock({
  groups,
}: {
  groups: { label: string; items: { href: string; name: string; note?: string }[] }[]
}) {
  return (
    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <div key={g.label}>
            <p className="border-rule-strong label label-ink border-b pb-1.5 font-semibold">
              {g.label}
            </p>
            <ul className="mt-1">
              {g.items.map((i) => (
                <li key={i.href + i.name}>
                  <Link href={i.href} className="list-row group">
                    <span className="font-serif text-small group-hover:text-accent">{i.name}</span>
                    {i.note && (
                      <span className="mt-0.5 block font-serif text-micro text-muted">{i.note}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  )
}
