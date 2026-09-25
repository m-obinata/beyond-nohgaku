import Link from 'next/link'

export interface EntityListItem {
  href: string
  name: string
  romaji?: string
  note?: string
  meta?: string
}

/**
 * カードを並べず、行として並べる（指示書 12・4）。
 * 情報量を落とさずに視覚を静かに保つための、サイトの基本リスト。
 */
export function EntityList({
  items,
  dense = false,
}: {
  items: EntityListItem[]
  dense?: boolean
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.href + item.name}>
          <Link href={item.href} className="list-row group px-1 -mx-1">
            <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-serif text-[1.0625rem] leading-snug group-hover:text-accent">
                  {item.name}
                </span>
                {item.romaji && <span className="label">{item.romaji}</span>}
              </span>
              {item.meta && <span className="font-sans text-micro text-muted">{item.meta}</span>}
            </span>
            {!dense && item.note && (
              <span className="mt-1 block font-serif text-small text-muted">{item.note}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
