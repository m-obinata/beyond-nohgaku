import Link from 'next/link'
import { termsBySlugs } from '@/content/glossary'

/**
 * 「この記事の言葉」。
 *
 * 本文のなかで説明しきれない言葉を、読みながら参照できる位置に置く。
 * ツールチップにしないのは、モバイルで扱いづらく、また読者が
 * 「どの言葉が説明されているか」を一覧で把握できないため。
 */
export function GlossaryRail({ terms }: { terms: string[] }) {
  const items = termsBySlugs(terms)
  if (items.length === 0) return null

  return (
    <dl>
      {items.map((t) => (
        <div key={t.slug} className="border-rule border-t py-2.5 last:border-b">
          <dt className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-serif text-small">{t.term}</span>
            <span className="label text-[0.5625rem]">{t.reading}</span>
          </dt>
          <dd className="mt-1 font-serif text-micro text-muted">{t.short}</dd>
        </div>
      ))}
      <p className="mt-3">
        <Link
          href="/ja/about/glossary"
          className="label hover:text-accent decoration-rule-strong underline underline-offset-4"
        >
          用語集をすべて見る →
        </Link>
      </p>
    </dl>
  )
}

/** モバイル用。本文の直後に、同じ内容を横組みで置く */
export function GlossaryBlock({ terms }: { terms: string[] }) {
  const items = termsBySlugs(terms)
  if (items.length === 0) return null

  return (
    <dl className="grid gap-x-8 sm:grid-cols-2">
      {items.map((t) => (
        <div key={t.slug} className="border-rule border-t py-3">
          <dt className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-serif text-[1rem]">{t.term}</span>
            <span className="label text-[0.5625rem]">{t.reading}</span>
          </dt>
          <dd className="mt-1 font-serif text-small text-muted">{t.short}</dd>
        </div>
      ))}
    </dl>
  )
}
