import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { PerformanceList } from '@/components/ArticleBlocks'
import { PERFORMANCES } from '@/content/performances'

export const metadata: Metadata = {
  title: '公演',
  description: '現在観られる能楽の公演情報。演目・土地・人物の記事と紐づけて掲載します。',
}

export default function PerformancesIndex() {
  const sorted = [...PERFORMANCES].sort((a, b) => a.date.localeCompare(b.date))
  return (
    <IndexShell
      label="PERFORMANCE"
      title="この物語を舞台で観る"
      lede="記事を読んだあとに、実際に観に行けること。本サイトでは公演情報を独立したデータとして管理し、演目・土地・人物の記事から相互にたどれるようにしています。"
      aside={
        <div className="border-rule-strong border-t pt-3">
          <span className="label label-ink font-semibold">データについて</span>
          <p className="mt-2 font-serif text-small text-muted">
            公演は 日付 / 会場 / 都道府県 / 演目 / 出演 / 流儀 / 料金 / チケット / 出典URL / 取得日時
            を一件ごとに持ち、演目 ID と結びつけて管理します。
          </p>
        </div>
      }
    >
      <PerformanceList performances={sorted} />
    </IndexShell>
  )
}
