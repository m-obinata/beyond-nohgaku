import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IndexShell } from '@/components/IndexShell'
import { THEMES, themeBySlug } from '@/content/themes'
import { PLAYS } from '@/content/plays'
import Link from 'next/link'
import { RelatedBlock } from '@/components/ArticleBlocks'

export function generateStaticParams() {
  return THEMES.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const t = themeBySlug(slug)
  return { title: t?.name ?? '主題', description: t?.summary }
}

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const theme = themeBySlug(slug)
  if (!theme) notFound()
  const plays = PLAYS.filter((p) => p.themes.includes(slug))

  return (
    <IndexShell label="THEME" title={theme.name} lede={theme.summary}>
      <section>
        <div className="rule-top-strong flex items-baseline justify-between pt-3 pb-5">
          <h2 className="label label-ink font-semibold">PLAYS — この主題を持つ曲</h2>
          <span className="label">{plays.length} 曲</span>
        </div>
        <RelatedBlock
          groups={[
            { label: '演目', items: plays.map((p) => ({ href: '/ja/plays/' + p.slug, name: '能「' + p.name + '」', note: p.summary })) },
          ]}
        />
        <p className="mt-6">
          <Link
            href={'/ja/plays?theme=' + encodeURIComponent(theme.name)}
            className="label border-rule-strong hover:border-accent hover:text-accent inline-block border px-4 py-2.5 transition-colors"
          >
            この主題で演目を絞り込む →
          </Link>
        </p>
      </section>
    </IndexShell>
  )
}
