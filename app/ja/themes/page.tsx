import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { ReverseDirectory } from '@/components/noh/ReverseDirectory'
import { themeDirectory } from '@/content/reverse'

export const metadata: Metadata = {
  title: '主題',
  description: '主題から、その主題を持つ能の演目を引く。',
}

export default function ThemesIndex() {
  const themes = themeDirectory()
  return (
    <IndexShell
      label="THEMES"
      title="主題から"
      lede="能がどの主題を繰り返し選んできたかを見ると、この芸能が何に関心を持ってきたかが見えてきます。主題を選ぶと、その主題を持つ演目が出ます。数字は演目の数です。"
      aside={
        <div className="border-rule bg-paper border px-5 py-5">
          <span className="label label-ink font-semibold">主題について</span>
          <p className="mt-2 font-serif text-small text-muted">
            主題は、本サイトの編集判断で付けています。客観的な分類ではなく、
            作品どうしを行き来するための切り口です。勝利や達成を主題にした曲は、意外なほど多くありません。
          </p>
        </div>
      }
    >
      <div className="rule-top-strong flex items-baseline justify-between pt-3 pb-5">
        <span className="label label-ink font-semibold">THEMES — 主題</span>
        <span className="label">{themes.length} 主題</span>
      </div>
      <ReverseDirectory entries={themes} />
    </IndexShell>
  )
}
