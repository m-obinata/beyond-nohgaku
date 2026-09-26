import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { ReverseDirectory } from '@/components/noh/ReverseDirectory'
import { peopleDirectory } from '@/content/reverse'

export const metadata: Metadata = {
  title: '人物',
  description: '人物から、その人物が登場する能の演目を引く。複数の曲に現れる人物を集めた。',
}

export default function PeopleIndex() {
  const people = peopleDirectory()
  return (
    <IndexShell
      label="PEOPLE"
      title="人物から"
      lede="複数の曲に現れる人物を集めました。名前を選ぶと、その人物が登場する演目が出ます。舞台に立つ役（シテ・ワキなど）も、実際には出てこず言及されるだけの場合も、一覧の各曲に役として示します。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">読むときの注意</span>
          <p className="mt-2 font-serif text-small text-muted">
            同じ人物でも、史料で追えることと物語が書き足したことは違います。
            数字は、その人物が登場する演目の数です。牛若丸は源義経にまとめています。
          </p>
        </div>
      }
    >
      <div className="rule-top-strong flex items-baseline justify-between pt-3 pb-5">
        <span className="label label-ink font-semibold">PEOPLE — 主な人物</span>
        <span className="label">{people.length} 人</span>
      </div>
      <ReverseDirectory entries={people} />
    </IndexShell>
  )
}
