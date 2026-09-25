import type { Metadata } from 'next'
import Link from 'next/link'
import { IndexShell } from '@/components/IndexShell'
import { ComparisonView } from '@/components/ComparisonView'
import { SOURCE_LAYERS, SOURCE_LAYER_ORDER } from '@/content/source-layers'
import { COMPARISON_MEETING } from '@/content/comparisons'

export const metadata: Metadata = {
  title: '情報のレイヤーについて',
  description:
    '本サイトは、史実・後世の記録・物語・舞台・伝承を五つのレイヤーに分けて表示します。史実度の採点はしません。',
}

const EXAMPLES: Record<string, string> = {
  history: '「一一八五年の冬、船団が暴風で戻された」',
  chronicle: '「従者の一人として武蔵坊弁慶の名が挙がる」',
  story: '「弁慶は太刀を千本集める願を立てていた」',
  stage: '「夜ごと人を斬っているのは牛若のほうである」',
  legend: '「ここが安宅の関の跡だと伝えられている」',
}

export default function SourceLayersPage() {
  return (
    <IndexShell
      label="METHOD"
      title="史実と物語を、混ぜずに読む"
      lede="ひとつの出来事について、史料が語ることと、物語が語ることと、舞台が見せることは違います。本サイトは、そのどれかを正解にするのではなく、どの層の情報なのかを毎回示します。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">しないこと</span>
          <ul className="mt-3">
            <li className="border-rule border-t py-2 font-serif text-small text-muted">
              史実度 ★★★☆☆ のような採点
            </li>
            <li className="border-rule border-t py-2 font-serif text-small text-muted">
              信頼度 80% のような数値化
            </li>
            <li className="border-rule border-t border-b py-2 font-serif text-small text-muted">
              「これは史実ではない」という断定だけで終えること
            </li>
          </ul>
          <p className="mt-4 font-serif text-small">
            目的は正誤判定ではなく、情報がどのレイヤーに属するかを示すことです。
          </p>
        </div>
      }
    >
      <section className="mb-16">
        <div className="rule-top-strong pt-3 pb-5">
          <h2 className="label label-ink font-semibold">FIVE LAYERS — 五つの層</h2>
        </div>
        <dl>
          {SOURCE_LAYER_ORDER.map((id) => {
            const l = SOURCE_LAYERS[id]
            return (
              <div
                key={id}
                className="border-rule grid grid-cols-1 gap-x-8 gap-y-2 border-t py-5 last:border-b lg:grid-cols-[9rem_13rem_1fr]"
              >
                <dt className="label label-ink font-semibold">{l.label}</dt>
                <dd>
                  <span className="block font-serif text-[1.0625rem]">{l.definition}</span>
                  <span className="label mt-1 block tracking-normal normal-case">
                    表示 — {l.evidence}
                  </span>
                </dd>
                <dd className="font-serif text-small text-muted">例 — {EXAMPLES[id]}</dd>
              </div>
            )
          })}
        </dl>
      </section>

      <section className="mb-16">
        <div className="rule-top-strong pt-3 pb-5">
          <h2 className="label label-ink font-semibold">WHY — なぜ採点しないのか</h2>
        </div>
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
          <div className="prose-nohgaku">
            <p>
              「史実度 30%」と書いた瞬間に、残りの 70% は劣った情報になります。
              しかし能「橋弁慶」で牛若が人を斬るという設定は、史実として間違っているのではなく、
              室町時代の舞台がそう作ったという事実です。層が違えば、正しさの基準そのものが変わります。
            </p>
            <p>
              採点をやめると、比べ方も変わります。どちらが本当かを決める代わりに、
              同じ出来事が媒体を移るたびに何を足され、何を落とされたかを見ることになります。
              本サイトの比較表は、そのために置かれています。
            </p>
          </div>
          <div className="prose-nohgaku">
            <p>
              もうひとつの理由は、確からしさが一定ではないことです。
              同時代の日記に一行だけ書かれた記述と、複数の記録が一致する記述を、
              同じ「史実」として扱うことはできません。
              数値はその差を隠してしまいます。
            </p>
            <p>
              そこで本サイトは、数値ではなく出典を示します。
              どの史料に、いつ書かれたか。判断の材料を読み手に渡すことを優先しています。
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="rule-top-strong pt-3 pb-5">
          <h2 className="label label-ink font-semibold">CAUTION — 五つの層は、時間の順番ではない</h2>
        </div>
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
          <div className="prose-nohgaku">
            <p>
              HISTORY から LEGEND へ、情報が順番に変化していったように見えるかもしれません。
              しかしこの並びは、確からしさの層であって、成立の順番ではありません。
            </p>
            <p>
              たとえば『義経記』と能「橋弁慶」は、どちらもおおよそ室町時代の成立とされますが、
              前後を決めることができません。
              能が物語を作り替えたとも、物語が能を取り込んだとも言えず、
              両方が、それ以前から語られていた話の別の版だった可能性もあります。
            </p>
          </div>
          <div className="prose-nohgaku">
            <p>
              そのため本サイトでは、層のあいだの関係を
              「A が B を変えた」と書かないようにしています。
              成立の前後がはっきりしている場合にだけ方向を示し、
              それも推定であることを本文中で断ります。
            </p>
            <p>
              比較表も同じです。左から右へ一直線に変化したのではなく、
              それぞれの版が何を持ち、何を持たないかを並べたものとして読んでください。
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="rule-top-strong pt-3 pb-5">
          <h2 className="label label-ink font-semibold">
            NOW — 現在の情報にも、同じ規律を使う
          </h2>
        </div>
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
          <div className="prose-nohgaku">
            <p>
              層を分ける規律は、史料だけのものではありません。
              「いま現地へ行くと何があるか」「舞台ではどう演じられるか」も、
              確かめたことと確かめていないことを混ぜれば、同じ種類の嘘になります。
            </p>
            <p>
              そこで本サイトでは、現地を歩いていない土地について、
              坂のきつさ、風の強さ、静けさといった体感を書きません。
              書けるのは、駅からの所要時間、そこに何があるか、
              気候や地形として知られていることまでです。
            </p>
          </div>
          <div className="prose-nohgaku">
            <p>
              演目についても同じで、上演時間や曲の約束ごとは書きますが、
              特定の公演で何が起きたかは、観ていない限り書きません。
              能の立ち回りを現代の殺陣のように書けば、
              それを読んで劇場へ行った人を裏切ることになります。
            </p>
            <p>
              各記事の現地案内には <strong>現地取材：未</strong> の表示があります。
              取材を済ませたら、その旨に置き換わります。
              これは弱点の告白ではなく、本サイトの方法そのものです。
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <ComparisonView data={COMPARISON_MEETING} />
      </section>

      <section className="mb-8">
        <div className="rule-top-strong pt-3 pb-5">
          <h2 className="label label-ink font-semibold">NEXT</h2>
        </div>
        <ul>
          <li>
            <Link href="/ja/sources" className="list-row group">
              <span className="font-serif text-[1.0625rem] group-hover:text-accent">
                参照している史料・物語の一覧
              </span>
              <span className="mt-0.5 block font-serif text-small text-muted">
                それぞれがどの層に属するかを含めて掲載しています。
              </span>
            </Link>
          </li>
          <li>
            <Link href="/ja/features/yoshitsune-benkei" className="list-row group">
              <span className="font-serif text-[1.0625rem] group-hover:text-accent">
                特集 01 — 義経は、どのように義経になったのか。
              </span>
              <span className="mt-0.5 block font-serif text-small text-muted">
                この方法を、一本の旅程にそって使ってみます。
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </IndexShell>
  )
}
