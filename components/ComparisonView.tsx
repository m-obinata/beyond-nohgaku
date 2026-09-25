import type { Comparison } from '@/lib/types'
import { SOURCE_LAYERS } from '@/content/source-layers'

/**
 * Comparative View（指示書 18）。
 * 横に並べるのは「媒体」であり、優劣ではない。
 * デスクトップは列、モバイルは段として読ませる。縮小コピーにはしない。
 */
export function ComparisonView({ data }: { data: Comparison }) {
  return (
    <section aria-label={'比較 — ' + data.title} className="cmp">
      <div className="rule-top-strong flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pt-3 pb-5">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="label label-ink font-semibold">COMPARATIVE VIEW</span>
          <h3 className="font-serif text-h3">{data.title}</h3>
        </div>
        <p className="max-w-[34rem] font-sans text-micro text-muted">{data.question}</p>
      </div>

      {/* Desktop: 列で比較する */}
      <div
        className="cmp-cols"
        style={{ ['--cmp-n' as string]: String(data.columns.length) }}
      >
        {data.columns.map((col) => {
          const l = SOURCE_LAYERS[col.layer]
          return (
            <div key={col.medium}>
              <p className="label text-ink font-semibold">{l.label}</p>
              <p className="mt-2 font-serif text-[0.9375rem] leading-snug">{col.medium}</p>
              <p className="num text-micro text-muted mt-1">{col.period}</p>
              <p className="border-rule mt-3 border-t pt-3 font-serif text-small">{col.body}</p>
              <ul className="mt-3">
                {col.points.map((p) => (
                  <li
                    key={p}
                    className="text-muted relative mt-1.5 pl-3 font-sans text-micro leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-rule-strong absolute top-[0.6em] left-0 h-px w-2"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Mobile / Tablet: 段で比較する。順序そのものが変化の順になっている */}
      <ol className="cmp-stack">
        {data.columns.map((col) => {
          const l = SOURCE_LAYERS[col.layer]
          return (
            <li key={col.medium} className="border-rule border-t py-4 last:border-b">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="label text-ink font-semibold">{l.label}</span>
                <span className="num text-micro text-muted">{col.period}</span>
              </div>
              <p className="mt-1.5 font-serif text-[1rem]">{col.medium}</p>
              <p className="mt-2 font-serif text-small">{col.body}</p>
              <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                {col.points.map((p) => (
                  <li key={p} className="text-muted relative pl-3 font-sans text-micro">
                    <span
                      aria-hidden="true"
                      className="bg-rule-strong absolute top-[0.6em] left-0 h-px w-2"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>

      <p className="text-muted mt-4 font-sans text-micro">
        左から右へ一直線に変化したとは限りません。成立の前後が確定しない組み合わせもあります。
        ここで見えるのは、それぞれの版が何を持ち、何を持たないかです。どれが正しいかを決めるための表ではありません。
      </p>
    </section>
  )
}
