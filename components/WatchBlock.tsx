import Link from 'next/link'
import { sectionId } from '@/lib/slug'

/**
 * WATCH — 観るなら、ここを見る。
 *
 * 解釈をいくら書いても、人は劇場へ行かない。
 * 行くかどうかを決めるのは、何分か、どこが面白いか、退屈しないか、である。
 * 弱点も書く。隠すと全部が宣伝文に見える。
 */
export function WatchBlock({
  watch,
  minutes,
  performanceCount,
}: {
  watch: { points: string[]; sound?: string; honest: string }
  minutes?: number
  performanceCount: number
}) {
  return (
    <div className="border-accent/40 bg-accent-tint/40 border px-5 py-5 md:px-7 md:py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="label label-ink font-semibold">初めて観るなら</span>
        {minutes && <span className="label">およそ {minutes} 分</span>}
      </div>

      <ol className="mt-4">
        {watch.points.map((p, i) => (
          <li key={p} className="border-rule flex gap-3 border-t py-3 first:border-t-0 first:pt-0">
            <span className="num text-micro text-accent pt-1">{String(i + 1).padStart(2, '0')}</span>
            <span className="font-serif text-body">{p}</span>
          </li>
        ))}
      </ol>

      {watch.sound && (
        <p className="border-rule mt-3 border-t pt-3 font-serif text-small">
          <span className="label mr-2">音</span>
          {watch.sound}
        </p>
      )}

      <p className="border-rule mt-3 border-t pt-3 font-serif text-small">
        <span className="label mr-2">正直なところ</span>
        {watch.honest}
      </p>

      <p className="text-muted mt-4 font-sans text-micro">
        上演時間は流儀・小書・演者によって大きく変わります。
        確かめられる公演記録が揃うまで、目安の分数は載せません。
        ここに書いているのは曲の約束ごとと公開されている情報からの整理で、
        特定の公演の記録ではありません。
      </p>

      <p className="mt-4">
        <Link
          href={'#' + sectionId('PERFORMANCE')}
          className="label border-accent text-accent hover:bg-accent hover:text-canvas inline-block border px-4 py-2.5 transition-colors"
        >
          公演を見る（{performanceCount} 件） ↓
        </Link>
      </p>
    </div>
  )
}
