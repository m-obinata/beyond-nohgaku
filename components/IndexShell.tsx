import Link from 'next/link'

/** 一覧ページの共通の枠。見出しの作法を全ページで反復する */
export function IndexShell({
  label,
  title,
  lede,
  aside,
  children,
}: {
  label: string
  title: string
  lede: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-shell px-5 pt-8 pb-4 md:px-8 md:pt-12">
      <nav aria-label="パンくず" className="mb-6">
        <Link href="/ja" className="label hover:text-accent">
          能楽の向こう側
        </Link>
      </nav>

      <header className="grid gap-x-10 gap-y-6 pb-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="label label-ink font-semibold">{label}</span>
          <h1 className="mt-4 font-serif text-h1 md:text-display">{title}</h1>
          <p className="mt-5 max-w-read font-serif text-lede">{lede}</p>
        </div>
        {aside && <div className="lg:col-span-5">{aside}</div>}
      </header>

      {children}
    </div>
  )
}
