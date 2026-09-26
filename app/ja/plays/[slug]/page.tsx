import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StructuredContext } from '@/components/noh/StructuredContext'
import { getAllPlays, getPlayBySlug } from '@/lib/noh-data'

/**
 * 演目の詳細ページ。全249曲で同じ構造にそろえる。
 * ここは DB 由来の構造データ（登場人物・土地・原典・タグ・物語構造）だけを見せる。
 * 記事本文は別ページ（/ja/plays/<slug>/yomu）に置き、ここからはリンクで送る。
 * 構造データと記事本文を同じ画面に混ぜない。
 */
export function generateStaticParams() {
  return getAllPlays().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const play = getPlayBySlug(slug)
  return {
    title: play?.title ?? '演目',
    description: play
      ? `能「${play.title}」の登場人物・土地・原典・物語構造。`
      : undefined,
  }
}

export default async function PlayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const play = getPlayBySlug(slug)
  if (!play) notFound()

  const loc = play.locations[0]

  return (
    <div className="mx-auto max-w-shell px-5 pt-8 pb-16 md:px-8 md:pt-12">
      <nav aria-label="パンくず" className="mb-6 flex flex-wrap gap-x-3">
        <Link href="/ja" className="label hover:text-accent">能楽の向こう側</Link>
        <span className="label text-muted">／</span>
        <Link href="/ja/explore" className="label hover:text-accent">演目</Link>
      </nav>

      <header className="pb-8">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <h1 className="font-serif text-h1 md:text-display">{play.title}</h1>
          {play.titleKana && <span className="label">{play.titleKana}</span>}
          {play.titleEn && <span className="label">{play.titleEn}</span>}
        </div>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <span className="label">{play.nohStructure.label}</span>
          {loc?.prefecture && loc.prefectureState === 'known' && (
            <span className="label text-muted">{loc.prefecture}</span>
          )}
        </p>
      </header>

      {/* 記事がある曲は、記事へのリンクを目立たせる（本文はここに混ぜない） */}
      {play.publication.hasArticle ? (
        <Link
          href={'/ja/plays/' + play.slug + '/yomu'}
          className="border-accent bg-accent-tint/40 group mb-12 flex items-baseline justify-between gap-4 border px-5 py-4 transition-colors hover:bg-accent hover:text-canvas md:px-7 md:py-5"
        >
          <span>
            <span className="label label-ink font-semibold group-hover:text-canvas">この曲の記事があります</span>
            <span className="mt-1 block font-serif text-body">
              史料・物語・能・土地を横断して読む
            </span>
          </span>
          <span className="label group-hover:text-canvas whitespace-nowrap">記事を読む →</span>
        </Link>
      ) : (
        <p className="border-rule-strong bg-paper mb-12 max-w-read border px-4 py-3 font-sans text-micro text-muted">
          この曲の記事本文は準備中です。ここでは登場人物・土地・原典・物語構造といった構造データを表示しています。
        </p>
      )}

      <StructuredContext play={play} />

      <section className="border-rule-strong mt-14 border-t pt-6">
        <Link href="/ja/explore" className="label hover:text-accent">← 演目をさがすへ戻る</Link>
      </section>
    </div>
  )
}
