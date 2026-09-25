import type { Metadata } from 'next'
import Link from 'next/link'
import { IndexShell } from '@/components/IndexShell'
import { COMPARISONS } from '@/content/comparisons'
import { SOURCES } from '@/content/sources'
import { SOURCE_LAYERS } from '@/content/source-layers'

export const metadata: Metadata = {
  title: '物語',
  description: '同じ出来事が、記録・物語・舞台・大衆文化のあいだをどう移動したか。場面から入る索引。',
}

const SCENES = [
  { id: 'meeting', href: '/ja/plays/hashi-benkei', via: '能「橋弁慶」の記事で読む' },
  { id: 'parting', href: '/ja/plays/funabenkei', via: '能「船弁慶」の記事で読む' },
  { id: 'barrier', href: '/ja/plays/ataka', via: '能「安宅」の記事で読む' },
] as const

export default function StoriesIndex() {
  const storySources = SOURCES.filter((s) => s.layer === 'story')

  return (
    <IndexShell
      label="STORIES"
      title="物語から"
      lede="ここで「物語」と呼ぶのは、史実の別名ではありません。史料が書かなかったところに、後の人が書き足していったものです。書き足された場面から入ると、誰が何を必要としたかが見えてきます。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">この層について</span>
          <p className="mt-3 font-serif text-small">
            {SOURCE_LAYERS.story.definition}。表示は「{SOURCE_LAYERS.story.evidence}」。
          </p>
          <p className="mt-3 font-serif text-small text-muted">
            物語は史実の劣化版ではなく、別の目的を持った独立した作品です。
            本サイトでは、否定も肯定もせず、層として並べます。
          </p>
        </div>
      }
    >
      <section className="mb-16">
        <div className="rule-top-strong flex items-baseline justify-between pt-3 pb-5">
          <h2 className="label label-ink font-semibold">SCENES — 移動した場面</h2>
          <span className="label">比較表あり</span>
        </div>
        <ul>
          {SCENES.map((s) => {
            const c = COMPARISONS[s.id]
            return (
              <li key={s.id} className="border-rule border-t last:border-b">
                <Link
                  href={s.href}
                  className="group hover:bg-accent/[0.04] block py-5 transition-colors"
                >
                  <div className="grid grid-cols-1 gap-x-8 gap-y-2 lg:grid-cols-[16rem_1fr_11rem]">
                    <span className="font-serif text-[1.125rem] group-hover:text-accent">
                      {c.title}
                    </span>
                    <span className="font-serif text-small text-ink/85">{c.question}</span>
                    <span className="label lg:text-right">{s.via} →</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {c.columns.map((col) => (
                      <span key={col.medium} className="label">
                        {SOURCE_LAYERS[col.layer].label}
                        <span className="text-muted ml-1.5 tracking-normal normal-case">
                          {col.medium}
                        </span>
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <div className="rule-top-strong pt-3 pb-5">
          <h2 className="label label-ink font-semibold">TEXTS — 書き足した側の作品</h2>
        </div>
        <ul>
          {storySources.map((s) => (
            <li key={s.slug} className="border-rule border-t last:border-b">
              <Link href={'/ja/sources/' + s.slug} className="group block py-4">
                <div className="grid grid-cols-1 gap-x-6 gap-y-1 lg:grid-cols-[14rem_1fr]">
                  <span className="font-serif text-[1.0625rem] group-hover:text-accent">
                    『{s.name}』
                  </span>
                  <span>
                    <span className="block font-serif text-small text-ink/85">{s.summary}</span>
                    <span className="num text-micro text-muted mt-1 block">{s.period}</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </IndexShell>
  )
}
