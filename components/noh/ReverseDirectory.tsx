import Link from 'next/link'
import type { DirEntry } from '@/content/reverse'

/**
 * 逆引きの一覧。値と件数を並べ、押すとその値で絞った演目一覧（Explore）へ。
 * 件数の棒で相対量を静かに示す。カラフルなチップは使わない。
 */
export function ReverseDirectory({
  entries,
  limit,
  cols = 3,
}: {
  entries: DirEntry[]
  limit?: number
  cols?: 1 | 2 | 3
}) {
  const shown = limit ? entries.slice(0, limit) : entries
  const max = entries.reduce((m, e) => Math.max(m, e.count), 1)
  const gridCls =
    cols === 1 ? '' : cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
  return (
    <ul className={'grid gap-x-10 ' + gridCls}>
      {shown.map((e) => (
        <li key={e.value} className="border-rule border-t last:border-b">
          <Link href={e.href} className="group hover:bg-accent/[0.04] block py-2.5 transition-colors">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-serif text-small group-hover:text-accent">{e.value}</span>
              <span className="num text-micro text-muted">{e.count}</span>
            </span>
            <span aria-hidden className="mt-1 block h-px bg-rule">
              <span
                className="bg-accent/50 block h-px"
                style={{ width: Math.max(4, (e.count / max) * 100) + '%' }}
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
