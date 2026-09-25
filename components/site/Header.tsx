import Link from 'next/link'

const NAV = [
  { href: '/ja/stories', label: '物語', romaji: 'STORIES' },
  { href: '/ja/places', label: '土地', romaji: 'PLACES' },
  { href: '/ja/plays', label: '演目', romaji: 'PLAYS' },
  { href: '/ja/explore', label: 'さがす', romaji: 'EXPLORE' },
  { href: '/ja/features', label: '特集', romaji: 'FEATURES' },
  { href: '/ja/performances', label: '公演', romaji: 'PERFORMANCES' },
  { href: '/ja/search', label: '検索', romaji: 'SEARCH' },
]

export function Header() {
  return (
    <header className="bg-canvas/95 border-rule sticky top-0 z-50 border-b backdrop-blur-[2px]">
      <div className="mx-auto max-w-shell px-5 md:px-8">
        <div className="flex items-center justify-between gap-6 py-3 md:py-4">
          <Link href="/ja" className="group block shrink-0" aria-label="能楽の向こう側 トップページ">
            <span className="block font-serif text-[1.0625rem] leading-tight tracking-[0.04em] md:text-[1.125rem]">
              能楽の向こう側
            </span>
            <span className="label mt-0.5 block group-hover:text-accent">BEYOND NOHGAKU</span>
          </Link>

          <nav aria-label="グローバルナビゲーション" className="hidden md:block">
            <ul className="flex items-baseline gap-7">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="group block text-center">
                    <span className="block font-serif text-[0.9375rem] group-hover:text-accent">
                      {n.label}
                    </span>
                    <span className="label mt-0.5 block text-[0.5625rem] tracking-[0.12em]">
                      {n.romaji}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-baseline gap-1.5">
            <span className="label text-ink font-semibold" aria-current="true">
              JA
            </span>
            <span className="label" aria-hidden="true">
              /
            </span>
            <span className="label" title="英語版は準備中です">
              EN
            </span>
          </div>
        </div>
      </div>

      {/* Mobile: ナビを畳まず、横スクロールの帯として常時見せる */}
      <nav
        aria-label="グローバルナビゲーション"
        className="border-rule block border-t md:hidden"
      >
        <ul className="flex gap-6 overflow-x-auto px-5 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((n) => (
            <li key={n.href} className="shrink-0">
              <Link href={n.href} className="flex items-baseline gap-2">
                <span className="font-serif text-[0.9375rem]">{n.label}</span>
                <span className="label text-[0.5625rem]">{n.romaji}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
