import Link from 'next/link'

/**
 * グローバルナビは「読む・さがす・観る」の三つの動詞で束ねる。
 * 名詞（演目・人物…）と動詞（さがす・検索）が混在していた状態を解く。
 * - 読む: 編集された記事
 * - さがす: 作品・要素の索引と横断検索（演目＝全249の探索）
 * - 観る: 上演情報
 */
const GROUPS: { verb: string; en: string; items: { href: string; label: string }[] }[] = [
  {
    verb: '読む',
    en: 'READ',
    items: [
      { href: '/ja/features', label: '特集' },
      { href: '/ja/stories', label: '物語' },
    ],
  },
  {
    verb: 'さがす',
    en: 'FIND',
    items: [
      { href: '/ja/explore', label: '演目' },
      { href: '/ja/people', label: '人物' },
      { href: '/ja/places', label: '土地' },
      { href: '/ja/themes', label: '主題' },
      { href: '/ja/sources', label: '出典' },
      { href: '/ja/search', label: '横断検索' },
    ],
  },
  {
    verb: '観る',
    en: 'WATCH',
    items: [{ href: '/ja/performances', label: '公演' }],
  },
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

          {/* デスクトップ: 動詞で束ねた三群を区切り線で並べる */}
          <nav aria-label="グローバルナビゲーション" className="hidden lg:block">
            <ul className="flex items-stretch gap-5">
              {GROUPS.map((g) => (
                <li
                  key={g.en}
                  className="border-rule flex flex-col gap-1 border-l pl-5 first:border-l-0 first:pl-0"
                >
                  <span className="label text-[0.5625rem] tracking-[0.14em]">{g.en}</span>
                  <span className="flex items-baseline gap-4">
                    {g.items.map((n) => (
                      <Link
                        key={n.href}
                        href={n.href}
                        className="hover:text-accent font-serif text-[0.9375rem] whitespace-nowrap"
                      >
                        {n.label}
                      </Link>
                    ))}
                  </span>
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

      {/* モバイル/タブレット: 群ごとに見出しを付けて横スクロール */}
      <nav
        aria-label="グローバルナビゲーション"
        className="border-rule block border-t lg:hidden"
      >
        <ul className="flex gap-5 overflow-x-auto px-5 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GROUPS.map((g) => (
            <li key={g.en} className="border-rule flex shrink-0 items-center gap-3 border-l pl-5 first:border-l-0 first:pl-0">
              <span className="label text-[0.5625rem] tracking-[0.14em]">{g.en}</span>
              {g.items.map((n) => (
                <Link key={n.href} href={n.href} className="font-serif text-[0.9375rem] whitespace-nowrap">
                  {n.label}
                </Link>
              ))}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
