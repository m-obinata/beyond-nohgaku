import type { Metadata } from 'next'
import Link from 'next/link'
import { IndexShell } from '@/components/IndexShell'
import { SOURCES } from '@/content/sources'
import { SOURCE_LAYERS, SOURCE_LAYER_ORDER } from '@/content/source-layers'

export const metadata: Metadata = {
  title: '出典',
  description: '本サイトが参照する史料・物語・舞台。それぞれがどの層に属するかを含めて掲載します。',
}

export default function SourcesIndex() {
  const groups = SOURCE_LAYER_ORDER.map((id) => ({
    layer: SOURCE_LAYERS[id],
    items: SOURCES.filter((s) => s.layer === id),
  })).filter((g) => g.items.length > 0)

  return (
    <IndexShell
      label="SOURCES"
      title="参照している史料と物語"
      lede="同じ「出典」でも、事件と同時期に書かれた日記と、一世紀後に編纂された記録と、室町時代の物語では性格がまったく違います。ここでは層ごとに分けて並べます。"
      aside={
        <div className="border-rule-strong border-t pt-3">
          <span className="label label-ink font-semibold">読み方</span>
          <p className="mt-2 font-serif text-small text-muted">
            上にあるものほど出来事に近く、下にあるものほど後から書かれています。
            下にあることは、価値が低いという意味ではありません。
          </p>
          <p className="mt-3">
            <Link
              href="/ja/about/source-layers"
              className="label hover:text-accent decoration-rule-strong underline underline-offset-4"
            >
              情報のレイヤーについて →
            </Link>
          </p>
        </div>
      }
    >
      {groups.map((g) => (
        <section key={g.layer.id} className="mb-12">
          <div className="rule-top-strong flex flex-wrap items-baseline justify-between gap-x-6 pt-3 pb-4">
            <div className="flex flex-wrap items-baseline gap-x-4">
              <h2 className="label label-ink font-semibold">{g.layer.label}</h2>
              <span className="font-serif text-h3">{g.layer.definition}</span>
            </div>
            <span className="font-sans text-micro text-muted">{g.layer.evidence}</span>
          </div>
          <ul>
            {g.items.map((s) => (
              <li key={s.slug} className="border-rule border-t last:border-b">
                <Link
                  href={'/ja/sources/' + s.slug}
                  className="group hover:bg-accent/[0.04] block py-4 transition-colors"
                >
                  <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 lg:grid-cols-[12rem_1fr]">
                    <span className="flex items-baseline gap-3">
                      <span className="font-serif text-[1.0625rem] group-hover:text-accent">
                        『{s.name}』
                      </span>
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
      ))}
    </IndexShell>
  )
}
