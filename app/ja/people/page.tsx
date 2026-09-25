import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { FacetBrowser } from '@/components/FacetBrowser'
import { PERSON_FACETS, personItems } from '@/content/browse'

export const metadata: Metadata = {
  title: '人物',
  description: '立場・時代・登場する曲から人物を絞り込む。',
}

export default function PeopleIndex() {
  return (
    <IndexShell
      label="PEOPLE"
      title="人物から"
      lede="伝記を読むためではなく、その人物についてどこまでが史料で、どこからが物語なのかを確かめるための索引です。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">読むときの注意</span>
          <p className="mt-2 font-serif text-small text-muted">
            同時代の史料で生涯を追える人物は、ここではむしろ少数です。
            記録がほとんど残っていない人物ほど、後世の物語が大きく書き込んでいます。
          </p>
        </div>
      }
    >
      <FacetBrowser
        facets={PERSON_FACETS}
        items={personItems()}
        placeholder="人名・立場・曲名"
        emptyNote="条件に合う人物がいません。"
      />
    </IndexShell>
  )
}
