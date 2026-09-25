import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { FacetBrowser } from '@/components/FacetBrowser'
import { ALL_FACETS, allItems } from '@/content/browse'

export const metadata: Metadata = {
  title: '検索',
  description: '特集・演目・土地・人物・主題・出典を横断して絞り込む。',
}

export default function SearchPage() {
  return (
    <IndexShell
      label="SEARCH"
      title="横断して探す"
      lede="特集・演目・土地・人物・主題・出典は別々のデータとして管理され、互いに結びついています。種別をまたいで同じ軸で絞り込めます。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">たとえば</span>
          <p className="mt-2 font-serif text-small text-muted">
            「時代 — 源平の争乱」と「地域 — 近畿」を選べば、その時代にその地域で起きたことに触れる
            演目・土地・人物が、種別を越えて一度に並びます。
          </p>
        </div>
      }
    >
      <FacetBrowser
        facets={ALL_FACETS}
        items={allItems()}
        placeholder="なんでも（義経 / 五条 / 怨霊 / ATAKA）"
      />
    </IndexShell>
  )
}
