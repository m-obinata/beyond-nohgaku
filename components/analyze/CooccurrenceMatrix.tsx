'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { AnalyzePlay } from '@/content/analyze'

/**
 * 2軸のかけ合わせ（共起マトリクス）。
 *
 * 軸Xと軸Yを選ぶと、各値の組み合わせを持つ演目の数を格子で見せる。
 * 色の濃さ＝件数。丸＝偏り（lift）が大きい組み合わせ＝「その2つが特に結びつく」。
 * セルを押すと、その条件で絞った演目一覧（Explore）へ飛ぶ。
 *
 * 数を出すだけで、なぜ結びつくかは演目一覧で確かめられるようにする（ブラックボックスにしない）。
 * ネットワーク図は作らない（指示書 3.6）。
 */

interface Dim { key: string; label: string }

const TOP = 12 // 各軸で扱う値の上限（頻度上位）

function topValues(plays: AnalyzePlay[], key: string, limit: number): string[] {
  const c = new Map<string, number>()
  for (const p of plays) for (const v of p.facets[key] ?? []) c.set(v, (c.get(v) ?? 0) + 1)
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([v]) => v)
}

export function CooccurrenceMatrix({ plays, dims }: { plays: AnalyzePlay[]; dims: Dim[] }) {
  const [xKey, setXKey] = useState('theme')
  const [yKey, setYKey] = useState('emotion')

  const model = useMemo(() => {
    const total = plays.length
    const xs = topValues(plays, xKey, TOP)
    const ys = topValues(plays, yKey, TOP)
    const nX = new Map<string, number>()
    const nY = new Map<string, number>()
    const nXY = new Map<string, number>()
    for (const p of plays) {
      const px = (p.facets[xKey] ?? []).filter((v) => xs.includes(v))
      const py = (p.facets[yKey] ?? []).filter((v) => ys.includes(v))
      for (const x of px) nX.set(x, (nX.get(x) ?? 0) + 1)
      for (const y of py) nY.set(y, (nY.get(y) ?? 0) + 1)
      for (const x of px) for (const y of py) {
        const k = x + '\u0000' + y
        nXY.set(k, (nXY.get(k) ?? 0) + 1)
      }
    }
    let max = 0
    const cells: Record<string, { n: number; lift: number }> = {}
    const assoc: { x: string; y: string; n: number; lift: number }[] = []
    for (const x of xs) for (const y of ys) {
      const n = nXY.get(x + '\u0000' + y) ?? 0
      const ex = ((nX.get(x) ?? 0) * (nY.get(y) ?? 0)) / total
      const lift = ex > 0 ? n / ex : 0
      cells[x + '\u0000' + y] = { n, lift }
      if (n > max) max = n
      if (n >= 3 && lift >= 1.5) assoc.push({ x, y, n, lift })
    }
    assoc.sort((a, b) => b.lift - a.lift || b.n - a.n)
    return { xs, ys, cells, max, assoc: assoc.slice(0, 8) }
  }, [plays, xKey, yKey])

  const dimLabel = (k: string) => dims.find((d) => d.key === k)?.label ?? k
  const cellHref = (x: string, y: string) =>
    `/ja/explore?${encodeURIComponent(xKey)}=${encodeURIComponent(x)}&${encodeURIComponent(yKey)}=${encodeURIComponent(y)}`

  return (
    <div>
      {/* 軸の選択 */}
      <div className="border-rule-strong flex flex-wrap items-end gap-x-8 gap-y-4 border-t pt-4">
        <AxisPick label="縦の軸" en="Y" value={yKey} onChange={setYKey} dims={dims} disabled={xKey} />
        <span className="label pb-2">×</span>
        <AxisPick label="横の軸" en="X" value={xKey} onChange={setXKey} dims={dims} disabled={yKey} />
      </div>

      {/* 強い結びつき */}
      {model.assoc.length > 0 && (
        <div className="border-rule mt-6 border-t pt-4">
          <span className="label label-ink font-semibold">とくに強い結びつき</span>
          <p className="text-muted mt-1 font-sans text-micro">
            件数が多く、かつ偶然の同時出現より偏りが大きい（lift）組み合わせです。
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {model.assoc.map((a) => (
              <li key={a.x + a.y}>
                <Link
                  href={cellHref(a.x, a.y)}
                  className="border-accent/40 hover:bg-accent hover:text-canvas inline-flex items-baseline gap-2 border px-3 py-1.5 transition-colors"
                >
                  <span className="font-serif text-small">
                    {a.y} × {a.x}
                  </span>
                  <span className="num text-micro text-muted">
                    {a.n}曲 ×{a.lift.toFixed(1)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 格子 */}
      <div className="mt-6 overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-canvas p-2 text-left align-bottom">
                <span className="label text-muted">
                  {dimLabel(yKey)} ＼ {dimLabel(xKey)}
                </span>
              </th>
              {model.xs.map((x) => (
                <th key={x} className="p-1 align-bottom">
                  <span className="block whitespace-nowrap font-serif text-micro [writing-mode:vertical-rl]">
                    {x}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.ys.map((y) => (
              <tr key={y}>
                <th className="border-rule sticky left-0 z-10 border-t bg-canvas p-2 text-left">
                  <span className="whitespace-nowrap font-serif text-small">{y}</span>
                </th>
                {model.xs.map((x) => {
                  const cell = model.cells[x + '\u0000' + y]
                  const n = cell?.n ?? 0
                  const strong = n >= 3 && (cell?.lift ?? 0) >= 1.5
                  const alpha = model.max ? Math.min(0.85, (n / model.max) * 0.85 + (n ? 0.08 : 0)) : 0
                  return (
                    <td key={x} className="border-rule border-t p-0 text-center">
                      {n > 0 ? (
                        <Link
                          href={cellHref(x, y)}
                          className="relative flex h-9 w-9 items-center justify-center hover:outline hover:outline-accent"
                          style={{ backgroundColor: `rgba(48,74,69,${alpha})` }}
                          title={`${y} × ${x}：${n}曲` + (strong ? `（偏り ×${cell!.lift.toFixed(1)}）` : '')}
                        >
                          <span className={'num text-micro ' + (alpha > 0.5 ? 'text-canvas' : 'text-ink')}>
                            {n}
                          </span>
                          {strong && (
                            <span
                              aria-hidden
                              className="border-accent absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full border bg-canvas"
                            />
                          )}
                        </Link>
                      ) : (
                        <span className="block h-9 w-9" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted mt-4 font-sans text-micro">
        数字はその2つの値をともに持つ演目の数、色の濃さはその大小です。丸は、件数が多く偏り（lift）の大きい組み合わせを表します。
        各軸は頻度上位{TOP}件までを載せています。セルを押すと、その条件の演目一覧へ移ります。
      </p>
    </div>
  )
}

function AxisPick({
  label, en, value, onChange, dims, disabled,
}: {
  label: string; en: string; value: string; onChange: (v: string) => void; dims: Dim[]; disabled: string
}) {
  return (
    <label className="block">
      <span className="label label-ink font-semibold">
        {en} — {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-rule-strong bg-paper focus:border-accent mt-1.5 block border px-3 py-2 font-serif text-small outline-none"
      >
        {dims.map((d) => (
          <option key={d.key} value={d.key} disabled={d.key === disabled}>
            {d.label}
          </option>
        ))}
      </select>
    </label>
  )
}
