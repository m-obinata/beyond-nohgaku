import Link from 'next/link'

export interface MetaRow {
  label: string
  /** テキストのみ、またはリンクの配列 */
  value?: string
  links?: { href: string; name: string; note?: string }[]
}

/**
 * 記事冒頭の Metadata（年代 / 場所 / 人物 / 関連演目）。
 * カードにせず、罫線で区切った定義リストとして出す。
 */
export function MetaTable({ rows }: { rows: MetaRow[] }) {
  return (
    <dl className="rule-top mt-8 grid grid-cols-1 sm:grid-cols-[7.5rem_1fr]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="contents"
        >
          <dt className="label border-rule pt-3 sm:border-t sm:pb-3">{row.label}</dt>
          <dd className="border-rule border-b pt-1 pb-3 font-sans text-small sm:border-t sm:pt-3">
            {row.value}
            {row.links && (
              <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                {row.links.map((l) => (
                  <Link
                    key={l.href + l.name}
                    href={l.href}
                    className="decoration-rule-strong hover:decoration-accent hover:text-accent underline underline-offset-4"
                  >
                    {l.name}
                    {l.note && <span className="text-muted ml-1 text-micro">{l.note}</span>}
                  </Link>
                ))}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
