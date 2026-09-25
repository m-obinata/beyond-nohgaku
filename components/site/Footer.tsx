import Link from 'next/link'

const COLUMNS = [
  {
    label: 'EXPLORE',
    title: '探す',
    items: [
      { href: '/ja/features/yoshitsune-benkei', name: '特集 01 — 義経と弁慶' },
      { href: '/ja/plays', name: '演目から' },
      { href: '/ja/places', name: '土地から' },
      { href: '/ja/performances', name: '公演を探す' },
    ],
  },
  {
    label: 'METHOD',
    title: '本サイトの方法',
    items: [
      { href: '/ja/about/source-layers', name: '情報のレイヤーについて' },
      { href: '/ja/about/glossary', name: '用語集' },
      { href: '/ja/about/credits', name: '写真・図版の出所' },
      { href: '/ja/about/sources', name: '参照した史料' },
      { href: '/ja/about', name: 'このサイトについて' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="rule-top-strong mt-24 bg-canvas">
      <div className="mx-auto max-w-shell px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr_1fr] md:gap-12">
          <div>
            <p className="font-serif text-[1.125rem] leading-tight">能楽の向こう側</p>
            <p className="label mt-1">BEYOND NOHGAKU</p>
            <p className="mt-4 max-w-[26rem] font-serif text-small text-muted">
              能楽を入口に、日本の歴史・土地・記憶をたどるデジタル文化誌です。
              それぞれの記述が、史料・物語・舞台のどれに属するかを明示しています。
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.label} aria-label={col.title}>
              <p className="label border-rule border-b pb-2">{col.label}</p>
              <ul className="mt-1">
                {col.items.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className="list-row hover:text-accent font-serif text-small">
                      {i.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="rule-top mt-12 flex flex-wrap items-baseline justify-between gap-3 pt-5">
          <p className="label">© 2026 BEYOND NOHGAKU</p>
          <p className="font-sans text-micro text-muted">
            Journeys through Japanese stories and landscapes.
          </p>
        </div>
      </div>
    </footer>
  )
}
