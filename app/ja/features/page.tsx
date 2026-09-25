import type { Metadata } from 'next'
import Link from 'next/link'
import { IndexShell } from '@/components/IndexShell'
import { ChapterList } from '@/components/ChapterList'
import { AXES, PLANNED_FEATURES, PUBLISHED_FEATURES, featuresForAxis } from '@/content/features'
import { FEATURE_YOSHITSUNE } from '@/content/feature-yoshitsune'

export const metadata: Metadata = {
  title: '特集',
  description: '一本の主題にそって、歴史と土地と能を横断してたどる長い記事。公開中のものと、これから作るものの一覧。',
}

export default function FeaturesIndex() {
  return (
    <IndexShell
      label="FEATURES"
      title="特集"
      lede="ひとつの主題を、複数の土地・人物・演目を横断しながら追う長い記事です。読み終えたときに、地図の上に一本の線が引けていることを目指します。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">企画も公開しています</span>
          <p className="mt-2 font-serif text-small text-muted">
            まだ書いていない特集も、問いと扱う範囲だけ先に置いています。
            何を作ろうとしているかが見えたほうが、読む側も選びやすいと思うからです。
          </p>
        </div>
      }
    >
      {/* ─────────── 公開中 ─────────── */}
      <section className="mb-16">
        <div className="rule-top-strong flex flex-wrap items-baseline justify-between gap-x-6 pt-3 pb-6">
          <h2 className="label label-ink font-semibold">PUBLISHED — 読めます</h2>
          <span className="label">{PUBLISHED_FEATURES.length} 本</span>
        </div>

        {PUBLISHED_FEATURES.map((f) => (
          <article key={f.slug} className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-baseline gap-x-4">
                <span className="label label-ink font-semibold">{f.number}</span>
                {f.axes.map((a) => (
                  <span key={a} className="label">
                    {a}
                  </span>
                ))}
              </div>
              <h3 className="mt-4 font-serif text-h1 leading-snug">
                <Link href={'/ja/features/' + f.slug} className="hover:text-accent">
                  {f.title}
                </Link>
              </h3>
              <p className="mt-3 font-serif text-h3 text-muted">{f.subtitle}</p>
              <p className="mt-5 max-w-read font-serif text-body">{f.lede}</p>
              <p className="mt-6">
                <Link
                  href={'/ja/features/' + f.slug}
                  className="label border-ink hover:bg-accent hover:border-accent hover:text-canvas inline-block border px-5 py-3 transition-colors"
                >
                  {FEATURE_YOSHITSUNE.cta} — START THE JOURNEY →
                </Link>
              </p>
            </div>
            <div className="lg:col-span-5">
              <ChapterList chapters={FEATURE_YOSHITSUNE.chapters} collapsible />
            </div>
          </article>
        ))}
      </section>

      {/* ─────────── 企画中 ─────────── */}
      <section className="mb-16">
        <div className="rule-top-strong flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-3 pb-6">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <h2 className="label label-ink font-semibold">IN PREPARATION — これから作ります</h2>
          </div>
          <span className="label">{PLANNED_FEATURES.length} 本</span>
        </div>

        <ul>
          {PLANNED_FEATURES.map((f) => (
            <li key={f.slug} className="border-rule border-t last:border-b">
              <Link
                href={'/ja/features/' + f.slug}
                className="group hover:bg-accent/[0.04] block py-5 transition-colors"
              >
                <div className="grid grid-cols-1 gap-x-8 gap-y-2 lg:grid-cols-[6rem_1fr_9rem]">
                  <span className="label label-ink font-semibold">{f.number}</span>
                  <span>
                    <span className="block font-serif text-[1.125rem] group-hover:text-accent">
                      {f.title}
                    </span>
                    <span className="mt-1 block font-serif text-small text-muted">
                      {f.subtitle}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {f.topics.slice(0, 7).map((t) => (
                        <span key={t} className="label text-muted">
                          {t}
                        </span>
                      ))}
                      {f.topics.length > 7 && (
                        <span className="label text-muted">ほか {f.topics.length - 7}</span>
                      )}
                    </span>
                  </span>
                  <span className="label lg:text-right">
                    <span className="block">準備中</span>
                    <span className="text-muted mt-1 block">企画を見る →</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ─────────── 思想軸 ─────────── */}
      <section className="mb-8">
        <div className="rule-top-strong pt-3 pb-6">
          <h2 className="label label-ink font-semibold">AXES — 特集を貫く十の軸</h2>
          <p className="text-muted mt-2 font-sans text-micro">
            カテゴリーではなく、日本文化を読み解くための切り口です。
            ひとつの特集が複数の軸にまたがります。
          </p>
        </div>

        <dl>
          {AXES.map((a) => {
            const fs = featuresForAxis(a.key)
            return (
              <div
                key={a.key}
                className="border-rule grid grid-cols-1 gap-x-8 gap-y-1.5 border-t py-4 last:border-b lg:grid-cols-[13rem_1fr_12rem]"
              >
                <dt className="font-serif text-[1.0625rem]">{a.key}</dt>
                <dd className="font-serif text-small text-ink/85">{a.question}</dd>
                <dd className="label lg:text-right">
                  {fs.length > 0 ? fs.map((f) => f.short).join(' / ') : '—'}
                </dd>
              </div>
            )
          })}
        </dl>
      </section>
    </IndexShell>
  )
}
