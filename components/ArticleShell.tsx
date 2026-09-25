import Link from 'next/link'
import type { ArticleMeta } from '@/lib/types'
import { MetaTable, type MetaRow } from '@/components/ui/MetaTable'

/**
 * 記事ページの三層構造（指示書 7）。
 *   Journey / Article / Context
 * モバイルでは中央本文を主軸にし、左右のレールを本文の後ろへ再配置する。
 * PC版の単純縮小はしない。
 */
export function ArticleShell({
  meta,
  metaRows,
  journey,
  context,
  breadcrumb,
  summary,
  children,
}: {
  meta: ArticleMeta
  metaRows: MetaRow[]
  /** メタ表の直後に置く「十秒で分かる面」 */
  summary?: React.ReactNode
  journey?: React.ReactNode
  context?: React.ReactNode
  breadcrumb?: { href: string; label: string }[]
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-shell px-5 pt-8 pb-4 md:px-8 md:pt-12">
      <div className="grid gap-x-10 gap-y-14 lg:grid-cols-12">
        {/* 左: Journey */}
        <aside className="hidden min-w-0 lg:col-span-2 lg:block">
          <div className="sticky-rail">{journey}</div>
        </aside>

        {/* 中央: 本文 */}
        <article className="min-w-0 lg:col-span-7">
          {breadcrumb && (
            <nav aria-label="パンくず" className="mb-6">
              <ol className="flex flex-wrap items-baseline gap-x-2">
                {breadcrumb.map((b, i) => (
                  <li key={b.href} className="flex items-baseline gap-2">
                    {i > 0 && (
                      <span aria-hidden="true" className="label">
                        /
                      </span>
                    )}
                    <Link href={b.href} className="label hover:text-accent">
                      {b.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <header>
            <h1 className="font-serif text-h1 leading-tight md:text-display">{meta.title}</h1>
            <p className="label mt-3">
              {meta.romaji}
              {meta.reading && <span className="ml-3 tracking-normal normal-case">{meta.reading}</span>}
            </p>
            {meta.question && (
              <p className="border-accent mt-7 max-w-read border-l-2 pl-5 font-serif text-h2 leading-relaxed">
                {meta.question}
              </p>
            )}
            <p className="mt-6 max-w-read font-serif text-lede">{meta.lede}</p>
            <MetaTable rows={metaRows} />
            {summary}
          </header>

          <div className="mt-14">{children}</div>
        </article>

        {/* 右: Context */}
        <aside className="hidden min-w-0 lg:col-span-3 lg:block">
          <div className="sticky-rail">{context}</div>
        </aside>

        {/* モバイル: 本文の後ろへ再配置する */}
        <div className="lg:hidden">
          {context && <div className="mb-14">{context}</div>}
          {journey && <div>{journey}</div>}
        </div>
      </div>
    </div>
  )
}

/** 左右レールの中の小見出し。レール内は密度を上げ、線で区切る */
export function RailBlock({
  label,
  note,
  children,
}: {
  label: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-9">
      <div className="border-rule-strong flex items-baseline justify-between gap-2 border-b pb-1.5">
        <h2 className="label label-ink font-semibold">{label}</h2>
        {note && <span className="label">{note}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  )
}
