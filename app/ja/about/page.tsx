import type { Metadata } from 'next'
import Link from 'next/link'
import { IndexShell } from '@/components/IndexShell'

export const metadata: Metadata = { title: 'このサイトについて' }

const PRINCIPLES = [
  { label: '01', title: '情報を減らして静けさを作らない', body: '余白で情報量を削るのではなく、階層・反復・罫線・グリッドで整理します。高密度でも、うるさくない画面を目指します。' },
  { label: '02', title: '史実と物語を混ぜない', body: 'すべての記述に、史料・後世の記録・物語・舞台・伝承のどれに属するかを表示します。採点はしません。' },
  { label: '03', title: '能を勉強させない', body: '土地や歴史から入って、結果として能に辿り着く。順序はどちらからでも構いません。一方向に読ませる作りにはしません。' },
  { label: '04', title: '装飾としての「和」を使わない', body: '円相、筆文字、和紙テクスチャ、能面といった記号を装飾目的で使いません。日本文化らしさは、情報と土地と文字から生じさせます。' },
  { label: '05', title: '前提知識を求めない', body: '日本文化の予備知識がなくても辿れることを条件とします。固有名詞にはローマ字表記を併記し、将来の英語版に備えた構造にしています。' },
]

export default function AboutPage() {
  return (
    <IndexShell
      label="ABOUT"
      title="能楽の向こう側について"
      lede="能楽そのものを解説するサイトではありません。一曲の能の向こう側にある、日本の歴史・土地・記憶をたどるためのデジタル文化誌です。"
      aside={
        <div className="border-rule-strong border-t pt-3">
          <span className="label label-ink font-semibold">扱う対象</span>
          <p className="mt-2 font-serif text-small text-muted">
            日本史 / 土地・地理 / 文学 / 神話・伝承 / 信仰 / 人物 / 芸能史 / 史跡 / 旅 / 地酒 / 現在の公演
          </p>
        </div>
      }
    >
      <section className="mb-16">
        <div className="rule-top-strong pt-3 pb-5">
          <h2 className="label label-ink font-semibold">PRINCIPLES — 編集方針</h2>
        </div>
        <dl>
          {PRINCIPLES.map((p) => (
            <div key={p.label} className="border-rule grid grid-cols-1 gap-x-8 gap-y-2 border-t py-5 last:border-b lg:grid-cols-[4rem_16rem_1fr]">
              <dt className="num text-small text-muted">{p.label}</dt>
              <dd className="font-serif text-[1.0625rem]">{p.title}</dd>
              <dd className="font-serif text-small text-ink/85">{p.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <div className="rule-top-strong pt-3 pb-5">
          <h2 className="label label-ink font-semibold">NEXT</h2>
        </div>
        <ul>
          <li>
            <Link href="/ja/about/source-layers" className="list-row group">
              <span className="font-serif text-[1.0625rem] group-hover:text-accent">情報のレイヤーについて</span>
              <span className="mt-0.5 block font-serif text-small text-muted">本サイトの中心にある方法です。</span>
            </Link>
          </li>
          <li>
            <Link href="/ja/sources" className="list-row group">
              <span className="font-serif text-[1.0625rem] group-hover:text-accent">参照した史料</span>
              <span className="mt-0.5 block font-serif text-small text-muted">それぞれの成立時期と層を掲載しています。</span>
            </Link>
          </li>
        </ul>
      </section>
    </IndexShell>
  )
}
