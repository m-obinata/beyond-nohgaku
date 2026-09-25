import type { Metadata } from 'next'
import Link from 'next/link'
import { IndexShell } from '@/components/IndexShell'
import { THEMES } from '@/content/themes'
import { PLAYS } from '@/content/plays'

export const metadata: Metadata = { title: '主題', description: '主題から演目をたどる。' }

export default function ThemesIndex() {
  return (
    <IndexShell
      label="THEMES"
      title="主題から"
      lede="能がどの主題を繰り返し選んできたかを見ると、この芸能が何に関心を持ってきたかが見えてきます。勝利や達成を主題にした曲は、意外なほど少ないのです。"
    >
      <ul>
        {THEMES.map((t) => {
          const plays = PLAYS.filter((p) => p.themes.includes(t.slug))
          return (
            <li key={t.slug} className="border-rule border-t last:border-b">
              <Link href={'/ja/themes/' + t.slug} className="group hover:bg-accent/[0.04] block py-4 transition-colors">
                <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 lg:grid-cols-[8rem_1fr_14rem]">
                  <span className="font-serif text-[1.0625rem] group-hover:text-accent">{t.name}</span>
                  <span className="font-serif text-small text-ink/85">{t.summary}</span>
                  <span className="label lg:text-right">
                    {plays.length > 0 ? plays.map((p) => p.name).join('・') : '—'}
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </IndexShell>
  )
}
