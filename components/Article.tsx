import type { SourceLayerId } from '@/lib/types'
import { SOURCE_LAYERS } from '@/content/source-layers'
import { SectionHead } from '@/components/ui/SectionHead'
import { sourceRailClass, SourceLabel } from '@/components/ui/SourceLabel'
import { ComparisonView } from '@/components/ComparisonView'
import { COMPARISONS, type ComparisonId } from '@/content/comparisons'
import { PlaceGuide } from '@/components/PlaceGuide'
import { placeBySlug } from '@/content/places'
import Image from 'next/image'
import { photoById } from '@/content/photos'

/**
 * 記事本文の部品。MDX から直接使える（mdx-components.tsx で登録）。
 * 章立ては指示書 15 のテンプレートに従うが、不要な章は省略してよい。
 */

export function Sec({
  label,
  caption,
  children,
}: {
  label: string
  caption?: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-14 first:mt-0">
      <SectionHead label={label} caption={caption} />
      <div className="prose-nohgaku">{children}</div>
    </section>
  )
}

/** 段落単位でレイヤーを明示する。史実と物語を同じ地の文で混ぜない。 */
export function Layer({
  id,
  source,
  children,
}: {
  id: SourceLayerId
  source?: string
  children: React.ReactNode
}) {
  const l = SOURCE_LAYERS[id]
  return (
    <div className={'my-6 ' + sourceRailClass(id) + ' pl-4'}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <SourceLabel layer={id} />
        {source && <span className="font-sans text-micro text-muted">出典 — {source}</span>}
      </div>
      <p className="text-muted mt-1 font-sans text-micro">{l.definition}</p>
      <div className="prose-nohgaku mt-2.5">{children}</div>
    </div>
  )
}

/** 引用・謡の詞章 */
export function Q({ children, cite }: { children: React.ReactNode; cite?: string }) {
  return (
    <figure className="my-7">
      <blockquote className="quote-classical">{children}</blockquote>
      {cite && (
        <figcaption className="label mt-2 pl-5 tracking-normal normal-case">— {cite}</figcaption>
      )}
    </figure>
  )
}

/**
 * 図版・写真の枠。
 * 実画像が入るまでは、何が入るべきかを明示したプレースホルダを出す。
 * 装飾目的の大判写真は置かない（指示書 19）。
 */
export function Fig({
  caption,
  credit,
  subject,
  src,
  ratio = '3 / 2',
}: {
  caption: string
  credit?: string
  /** 写真がまだない場合に、何が入るべきかを書く */
  subject: string
  /** content/photos.ts に登録した id。入れると実写真に切り替わる */
  src?: string
  ratio?: string
}) {
  const photo = src ? photoById(src) : undefined

  return (
    <figure className="my-8">
      {photo ? (
        <Image
          src={photo.file}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          className="border-rule h-auto w-full border"
          sizes="(min-width: 1024px) 720px, 100vw"
        />
      ) : (
        <div
          className="border-rule bg-paper flex items-center justify-center border"
          style={{ aspectRatio: ratio }}
          role="img"
          aria-label={caption}
        >
          <span className="label px-6 text-center">{subject}</span>
        </div>
      )}
      <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-serif text-small text-muted">{caption}</span>
        <span className="label">
          {photo ? photo.source + (photo.author ? ' / ' + photo.author : '') : credit}
        </span>
      </figcaption>
    </figure>
  )
}

/** 本文の脇に置く短い注記 */
export function Note({ label = 'NOTE', children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="border-rule bg-paper my-7 border px-5 py-4">
      <span className="label">{label}</span>
      <div className="prose-nohgaku mt-1.5 text-small">{children}</div>
    </div>
  )
}

/** MDX 本文のなかに比較表を差し込む */
export function Compare({ id }: { id: ComparisonId }) {
  return (
    <div className="my-16">
      <ComparisonView data={COMPARISONS[id]} />
    </div>
  )
}

/** MDX の PLACE 節に、その土地で実際に見られるものを差し込む */
export function Guide({ place }: { place: string }) {
  const p = placeBySlug(place)
  if (!p) return null
  return <PlaceGuide place={p} />
}

const VIEW_KIND = {
  research: { label: 'INTERPRETATION', jp: '研究上の解釈', note: '専門的な研究で示されてきた読み' },
  alt: { label: 'ALTERNATIVE', jp: '異説', note: '同じ材料から導かれる別の読み' },
  ours: { label: 'OUR READING', jp: '本サイトの考察', note: '編集部の読み。定説ではない' },
} as const

/**
 * 事実・解釈・異説・考察を混ぜないための枠（憲法 9・12）。
 * SOURCE LAYER が「どの史料に属するか」を示すのに対し、
 * こちらは「誰の読みか」を示す。
 */
export function View({
  kind,
  by,
  children,
}: {
  kind: keyof typeof VIEW_KIND
  by?: string
  children: React.ReactNode
}) {
  const v = VIEW_KIND[kind]
  return (
    <div className="border-rule bg-paper my-7 border px-5 py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="label label-ink font-semibold">{v.label}</span>
        <span className="font-sans text-micro text-ink">{v.jp}</span>
        <span className="font-sans text-micro text-muted">{by ?? v.note}</span>
      </div>
      <div className="prose-nohgaku prose-tight mt-2.5">{children}</div>
    </div>
  )
}

/** 二人・二つの立場を対置する表。比較表（媒体の比較）とは別の用途 */
export function Contrast({
  left,
  right,
  rows,
  note,
}: {
  left: string
  right: string
  rows: [string, string][]
  note?: string
}) {
  return (
    <figure className="my-8">
      <div className="border-rule-strong grid grid-cols-2 gap-x-6 border-b pb-2">
        <span className="label label-ink font-semibold">{left}</span>
        <span className="label label-ink font-semibold">{right}</span>
      </div>
      <dl>
        {rows.map(([a, b]) => (
          <div key={a + b} className="border-rule grid grid-cols-2 gap-x-6 border-b py-2.5">
            <dt className="font-serif text-small">{a}</dt>
            <dd className="font-serif text-small">{b}</dd>
          </div>
        ))}
      </dl>
      {note && <figcaption className="text-muted mt-2 font-sans text-micro">{note}</figcaption>}
    </figure>
  )
}
