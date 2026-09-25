import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { FacetBrowser } from '@/components/FacetBrowser'
import { EXPLORE_FACETS, exploreItems } from '@/content/noh-browse'
import { getAllPlays } from '@/lib/noh-data'

export const metadata: Metadata = {
  title: '演目をさがす',
  description: '能の全249曲を、形式・土地・人物・主題・結末・流儀から横断して絞り込む。',
}

export default function ExplorePage() {
  const total = getAllPlays().length
  return (
    <IndexShell
      label="EXPLORE"
      title="演目をさがす"
      lede={`能の全${total}曲を、複数の条件を重ねて絞り込めます。形式・土地・主役・主題・結末・流儀を組み合わせてください。同じ軸のなかは「または」、違う軸のあいだは「かつ」で効きます。`}
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">この一覧について</span>
          <p className="mt-2 font-serif text-small text-muted">
            {total}曲すべてを載せています。記事のない曲も外しません。一文の説明は構造データから機械的に作ったもので、
            あらすじの自動要約ではありません。<span className="text-accent">編集</span>の印が付いたタグは本サイトの解釈です。
          </p>
        </div>
      }
    >
      <FacetBrowser
        facets={EXPLORE_FACETS}
        items={exploreItems()}
        placeholder="曲名・人物・土地・主題・結末"
        emptyNote="条件に合う曲がありません。軸をひとつ外してみてください。"
      />
    </IndexShell>
  )
}
