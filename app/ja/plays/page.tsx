import type { Metadata } from 'next'
import Link from 'next/link'
import { IndexShell } from '@/components/IndexShell'
import { FacetBrowser } from '@/components/FacetBrowser'
import { PLAY_FACETS, playItems } from '@/content/browse'

export const metadata: Metadata = {
  title: '演目',
  description: '時代・地域・主題・人物から能の演目を絞り込む。',
}

export default function PlaysIndex() {
  return (
    <IndexShell
      label="PLAYS"
      title="演目から"
      lede="分類ごとに並べても、曲数が増えれば目で追えなくなります。時代・地域・主題・誰が出てくるかで絞り込んでください。軸は組み合わせられます。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">軸の読み方</span>
          <p className="mt-2 font-serif text-small text-muted">
            <strong className="text-ink font-semibold">時代</strong> は物語の舞台になる時代、
            <strong className="text-ink font-semibold">地域</strong> は現在の地方区分です。
            <strong className="text-ink font-semibold">形式</strong> は、霊が過去を語る曲（夢幻能）か、
            事件がその場で進む曲（現在能）かの別です。
          </p>
          <p className="border-rule mt-4 border-t pt-4 font-serif text-small text-muted">
            ここに並ぶのは、記事や特集で扱っている曲です。
            <Link href="/ja/explore" className="text-accent hover:underline">
              能の全249曲から探す
            </Link>
            こともできます。
          </p>
        </div>
      }
    >
      <FacetBrowser
        facets={PLAY_FACETS}
        items={playItems()}
        placeholder="曲名・人物・土地・出典"
        emptyNote="条件に合う曲がありません。軸をひとつ外してみてください。"
      />
    </IndexShell>
  )
}
