import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { ReverseDirectory } from '@/components/noh/ReverseDirectory'
import { sourceDirectory } from '@/content/reverse'

export const metadata: Metadata = {
  title: '原典',
  description: '原典から、その作品を素材にした能の演目を引く。',
}

export default function SourcesIndex() {
  const sources = sourceDirectory()
  return (
    <IndexShell
      label="SOURCES"
      title="原典から"
      lede="能は、既にある物語や説話を素材にして作られました。原典を選ぶと、それを素材にした演目が出ます。同じ『平家物語』から、これほど多くの曲が生まれています。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">原典のまとめ方</span>
          <p className="mt-2 font-serif text-small text-muted">
            出典名の表記はさまざまなので、主要な作品にまとめています。
            能楽協会の曲目データベースなど、事実確認のための出典メタは、ここには数えていません。
          </p>
        </div>
      }
    >
      <div className="rule-top-strong flex items-baseline justify-between pt-3 pb-5">
        <span className="label label-ink font-semibold">SOURCES — 原典</span>
        <span className="label">{sources.length} 種</span>
      </div>
      <ReverseDirectory entries={sources} />
    </IndexShell>
  )
}
