/**
 * 記事内セクションの共通見出し。
 * 英語のセクション名（構造）と日本語の定義（意味）を必ず対で出す。
 * これを全記事で反復することが、密度の高い画面を静かに保つ骨格になる。
 */
import { sectionId } from '@/lib/slug'

export function SectionHead({
  label,
  caption,
  id,
}: {
  label: string
  caption?: string
  id?: string
}) {
  return (
    <div id={id ?? sectionId(label)} className="rule-top-strong scroll-mt-24 pt-3 pb-5">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="label label-ink text-[0.75rem] font-semibold">{label}</h2>
        {caption && <p className="font-sans text-micro text-muted">{caption}</p>}
      </div>
    </div>
  )
}

/** ページ内の大区画（トップページなど記事外で使う） */
export function BlockHead({
  label,
  title,
  note,
  action,
}: {
  label: string
  title?: string
  note?: string
  action?: React.ReactNode
}) {
  return (
    <div className="rule-top-strong flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-3 pb-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="label label-ink font-semibold">{label}</span>
        {title && <h2 className="font-serif text-h3">{title}</h2>}
        {note && <p className="font-sans text-micro text-muted">{note}</p>}
      </div>
      {action}
    </div>
  )
}
