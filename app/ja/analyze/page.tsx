import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { BlockHead } from '@/components/ui/SectionHead'
import { CooccurrenceMatrix } from '@/components/analyze/CooccurrenceMatrix'
import { CooccurrenceScatter } from '@/components/analyze/CooccurrenceScatter'
import { CooccurrenceNetwork } from '@/components/analyze/CooccurrenceNetwork'
import { analyzePlays, ANALYZE_DIMS, NETWORK_DIMS } from '@/content/analyze'

export const metadata: Metadata = {
  title: 'かけ合わせて見る',
  description: '作者×主題、感情×原典のように、二つの軸をかけ合わせて、能の作品群にどんな結びつきがあるかを見る。',
}

export default function AnalyzePage() {
  const plays = analyzePlays()
  return (
    <IndexShell
      label="ANALYZE"
      title="かけ合わせて見る"
      lede="二つの軸をかけ合わせて、能の作品群にどんな結びつきがあるかを見ます。たとえば作者と主題、感情と原典。数の多い組み合わせと、偶然より偏って結びつく組み合わせが分かります。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">読み方</span>
          <p className="mt-2 font-serif text-small text-muted">
            格子の数字は、その二つの値をともに持つ演目の数です。色が濃いほど多く、
            <span className="text-accent">丸</span>は偏りの大きい（その二つが特に結びつく）組み合わせを指します。
            なぜ結びつくかは、セルを押して演目そのものを読んで確かめてください。
          </p>
        </div>
      }
    >
      <section className="mb-16">
        <BlockHead label="MATRIX" title="2軸の格子" note="どの組み合わせが多いか・偏るかを一望する" />
        <CooccurrenceMatrix plays={plays} dims={ANALYZE_DIMS} />
      </section>

      <section className="mb-16">
        <BlockHead label="SCATTER" title="件数 × 偏りの散布" note="右上ほど、多くて偏りも強い結びつき" />
        <CooccurrenceScatter plays={plays} dims={ANALYZE_DIMS} />
      </section>

      <section>
        <BlockHead label="NETWORK" title="共起のネットワーク" note="ひとつの値を中心に、共に現れる値だけを出す" />
        <CooccurrenceNetwork plays={plays} dims={NETWORK_DIMS} />
      </section>
    </IndexShell>
  )
}
