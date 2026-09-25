import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BlockHead } from '@/components/ui/SectionHead'
import { AXES, FEATURES, PLANNED_FEATURES, featureBySlug } from '@/content/features'

/**
 * 準備中の特集の頁。
 *
 * 企画だけ決まっていて本文がない特集にも、URL と、何を書くつもりかを置いておく。
 * 公開済みの特集は静的ルート（例 /ja/features/yoshitsune-benkei）が優先されるので、
 * ここに来るのは準備中のものだけになる。
 */

export function generateStaticParams() {
  return PLANNED_FEATURES.map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const f = featureBySlug(slug)
  if (!f) return { title: '特集' }
  return { title: f.title + '（準備中）', description: f.lede }
}

export default async function PlannedFeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const f = featureBySlug(slug)
  if (!f || f.status !== '準備中') notFound()

  const i = PLANNED_FEATURES.findIndex((x) => x.slug === f.slug)
  const prev = PLANNED_FEATURES[i - 1]
  const next = PLANNED_FEATURES[i + 1]
  const axes = AXES.filter((a) => (f.axes as readonly string[]).includes(a.key))

  return (
    <div className="mx-auto max-w-shell px-5 pt-8 pb-4 md:px-8 md:pt-12">
      <nav aria-label="パンくず" className="mb-6 flex flex-wrap gap-x-3">
        <Link href="/ja" className="label hover:text-accent">
          能楽の向こう側
        </Link>
        <span className="label text-muted">／</span>
        <Link href="/ja/features" className="label hover:text-accent">
          特集
        </Link>
      </nav>

      <header className="grid gap-x-10 gap-y-8 pb-14 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <span className="label label-ink font-semibold">{f.number}</span>
            <span className="label border-rule border px-2 py-0.5">準備中</span>
          </div>
          <h1 className="mt-5 font-serif text-h1 leading-[1.4] md:text-display">{f.title}</h1>
          <p className="mt-4 font-serif text-h3 text-muted">{f.subtitle}</p>
          <p className="mt-8 max-w-read font-serif text-lede">{f.lede}</p>
        </div>

        <div className="lg:col-span-4">
          <div className="border-rule bg-paper border px-5 py-5">
            <span className="label label-ink font-semibold">この頁について</span>
            <p className="mt-2 font-serif text-small text-ink/85">
              この特集はまだ書いていません。
              企画の段階で決まっていること — 立てる問いと、扱う範囲だけを先に置いています。
            </p>
            <p className="text-muted mt-3 font-sans text-micro">
              取りかかる前に枠を公開するのは、何を作ろうとしているかが見えたほうが、
              読む側も待ちやすいと思うからです。予定は変わることがあります。
            </p>
          </div>
        </div>
      </header>

      <section className="pb-16">
        <BlockHead
          label="AXES"
          title="この特集が立てる問い"
          note="カテゴリーではなく、読み解くための切り口です"
        />
        <dl>
          {axes.map((a) => (
            <div
              key={a.key}
              className="border-rule grid grid-cols-1 gap-x-8 gap-y-1.5 border-t py-4 last:border-b lg:grid-cols-[13rem_1fr]"
            >
              <dt className="font-serif text-[1.0625rem]">{a.key}</dt>
              <dd className="font-serif text-small text-ink/85">{a.question}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pb-16">
        <BlockHead
          label="SCOPE"
          title="扱う予定"
          note="演目・主題の候補です。増えることも、外れることもあります"
        />
        <ul className="flex flex-wrap gap-x-3 gap-y-3">
          {f.topics.map((t) => (
            <li key={t} className="border-rule border px-3 py-1.5 font-serif text-small">
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="pb-16">
        <BlockHead label="METHOD" title="書くときに守ること" />
        <div className="max-w-read">
          <p className="font-serif text-body">
            この特集も、あらすじの紹介からは始めません。問いから始めます。
            そして、確かめられる事実・研究上の解釈・別の説・本サイトの考えを、
            混ぜずに分けて書きます。
          </p>
          <p className="mt-4 font-serif text-body">
            起源のはっきりしないもの — とくに神仏や祭礼にかかわる話について、
            言い切らないようにします。分からないところは、分からないと書きます。
          </p>
        </div>
      </section>

      <section className="border-rule-strong border-t pt-6 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            {prev ? (
              <Link href={'/ja/features/' + prev.slug} className="group block">
                <span className="label">← {prev.number}</span>
                <span className="mt-1 block font-serif text-small group-hover:text-accent">
                  {prev.short}
                </span>
              </Link>
            ) : (
              <Link href="/ja/features" className="group block">
                <span className="label">← 特集の一覧</span>
              </Link>
            )}
          </div>

          <Link href="/ja/features" className="label hover:text-accent">
            特集の一覧へ
          </Link>

          <div className="text-right">
            {next ? (
              <Link href={'/ja/features/' + next.slug} className="group block">
                <span className="label">{next.number} →</span>
                <span className="mt-1 block font-serif text-small group-hover:text-accent">
                  {next.short}
                </span>
              </Link>
            ) : (
              <Link href={'/ja/features/' + FEATURES[0].slug} className="group block">
                <span className="label">公開中の特集 →</span>
                <span className="mt-1 block font-serif text-small group-hover:text-accent">
                  {FEATURES[0].short}
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
