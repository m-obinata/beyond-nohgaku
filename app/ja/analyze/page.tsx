import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { CooccurrenceMatrix } from '@/components/analyze/CooccurrenceMatrix'
import { analyzePlays, ANALYZE_DIMS } from '@/content/analyze'

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
      <CooccurrenceMatrix plays={plays} dims={ANALYZE_DIMS} />
    </IndexShell>
  )
}
