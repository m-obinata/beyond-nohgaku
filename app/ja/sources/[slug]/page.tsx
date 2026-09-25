import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { IndexShell } from '@/components/IndexShell'
import { SOURCES, sourceBySlug } from '@/content/sources'
import { SOURCE_LAYERS } from '@/content/source-layers'
import { PLAYS } from '@/content/plays'
import { PEOPLE } from '@/content/people'
import { RelatedBlock } from '@/components/ArticleBlocks'

export function generateStaticParams() {
  return SOURCES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const s = sourceBySlug(slug)
  return { title: s ? '『' + s.name + '』' : '出典', description: s?.summary }
}

export default async function SourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const source = sourceBySlug(slug)
  if (!source) notFound()
  const layer = SOURCE_LAYERS[source.layer]
  const plays = PLAYS.filter((p) => p.sources.includes(slug))
  const people = PEOPLE.filter((p) => p.sources.includes(slug))

  return (
    <IndexShell
      label={'SOURCE — ' + layer.label}
      title={'『' + source.name + '』'}
      lede={source.summary}
      aside={
        <div className="border-rule-strong border-t pt-3">
          <dl>
            <div className="border-rule grid grid-cols-[6rem_1fr] gap-x-4 border-t py-2.5">
              <dt className="label">読み</dt>
              <dd className="font-serif text-small">{source.reading}</dd>
            </div>
            <div className="border-rule grid grid-cols-[6rem_1fr] gap-x-4 border-t py-2.5">
              <dt className="label">成立</dt>
              <dd className="num text-small">{source.period}</dd>
            </div>
            <div className="border-rule grid grid-cols-[6rem_1fr] gap-x-4 border-t border-b py-2.5">
              <dt className="label">層</dt>
              <dd className="font-serif text-small">
                {layer.label} — {layer.definition}
                <span className="label mt-1 block tracking-normal normal-case">{layer.evidence}</span>
              </dd>
            </div>
          </dl>
          <p className="mt-3">
            <Link href="/ja/about/source-layers" className="label hover:text-accent decoration-rule-strong underline underline-offset-4">
              情報のレイヤーについて →
            </Link>
          </p>
        </div>
      }
    >
      <section>
        <div className="rule-top-strong pt-3 pb-5">
          <h2 className="label label-ink font-semibold">RELATED — この出典が関わるもの</h2>
        </div>
        <RelatedBlock
          groups={[
            { label: '演目', items: plays.map((p) => ({ href: '/ja/plays/' + p.slug, name: '能「' + p.name + '」', note: p.summary })) },
            { label: '人物', items: people.map((p) => ({ href: '/ja/people/' + p.slug, name: p.name, note: p.role })) },
          ]}
        />
      </section>
    </IndexShell>
  )
}
