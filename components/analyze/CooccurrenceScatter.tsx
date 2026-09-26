'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AnalyzePlay } from '@/content/analyze'

/**
 * 2軸の散布。各点は「軸Xの値 × 軸Yの値」の組み合わせ。
 * 横＝ともに持つ演目の数、縦＝偏り（lift。1なら偶然どおり、大きいほど強く結びつく）。
 * 右上ほど「数も多く、偏りも大きい＝意味のある結びつき」。点を押すとその条件の演目一覧へ。
 */

interface Dim { key: string; label: string }
const TOP = 12

function topValues(plays: AnalyzePlay[], key: string, limit: number): string[] {
  const c = new Map<string, number>()
  for (const p of plays) for (const v of p.facets[key] ?? []) c.set(v, (c.get(v) ?? 0) + 1)
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([v]) => v)
}

export function CooccurrenceScatter({ plays, dims }: { plays: AnalyzePlay[]; dims: Dim[] }) {
  const router = useRouter()
  const [xKey, setXKey] = useState('kind')
  const [yKey, setYKey] = useState('ending')

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
    const pts: { x: string; y: string; n: number; lift: number }[] = []
    let maxN = 1, maxLift = 1.2
    for (const [k, n] of nXY.entries()) {
      const [x, y] = k.split('\u0000')
      const ex = ((nX.get(x) ?? 0) * (nY.get(y) ?? 0)) / total
      const lift = ex > 0 ? n / ex : 0
      pts.push({ x, y, n, lift })
      if (n > maxN) maxN = n
      if (lift > maxLift) maxLift = lift
    }
    return { pts, maxN, maxLift }
  }, [plays, xKey, yKey])

  const dimLabel = (k: string) => dims.find((d) => d.key === k)?.label ?? k

  const W = 680, H = 460, padL = 44, padB = 40, padT = 16, padR = 16
  const plotW = W - padL - padR, plotH = H - padT - padB
  const sx = (n: number) => padL + (n / model.maxN) * plotW
  const sy = (lift: number) => padT + plotH - (Math.min(lift, model.maxLift) / model.maxLift) * plotH
  const y1 = sy(1) // lift=1 の基準線

  // ラベルは「数×偏り」が大きい上位だけ（重なり回避）
  const labeled = new Set(
    [...model.pts].sort((a, b) => b.n * b.lift - a.n * a.lift).slice(0, 10).map((p) => p.x + '\u0000' + p.y),
  )

  const go = (x: string, y: string) =>
    router.push(`/ja/explore?${encodeURIComponent(xKey)}=${encodeURIComponent(x)}&${encodeURIComponent(yKey)}=${encodeURIComponent(y)}`)

  return (
    <div>
      <div className="border-rule-strong flex flex-wrap items-end gap-x-8 gap-y-4 border-t pt-4">
        <Pick label="横の軸（数）" value={xKey} onChange={setXKey} dims={dims} other={yKey} />
        <span className="label pb-2">×</span>
        <Pick label="縦の軸" value={yKey} onChange={setYKey} dims={dims} other={xKey} />
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-[680px]" role="img"
          aria-label={`${dimLabel(yKey)}と${dimLabel(xKey)}の組み合わせの散布図`}>
          {/* 軸 */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--rule)" />
          <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="var(--rule)" />
          {/* lift=1 基準線 */}
          <line x1={padL} y1={y1} x2={W - padR} y2={y1} stroke="rgba(48,74,69,0.3)" strokeDasharray="3 3" />
          <text x={W - padR} y={y1 - 4} textAnchor="end" className="fill-muted" fontSize={9}>
            偏りなし（lift 1）
          </text>
          <text x={padL} y={padT + 10} className="fill-muted" fontSize={9}>偏り 大 ↑</text>
          <text x={W - padR} y={padT + plotH + 26} textAnchor="end" className="fill-muted" fontSize={9}>
            件数 多 →
          </text>
          {/* 点 */}
          {model.pts.map((p) => {
            const strong = p.n >= 3 && p.lift >= 1.5
            const key = p.x + '\u0000' + p.y
            return (
              <g key={key} onClick={() => go(p.x, p.y)} className="cursor-pointer">
                <circle
                  cx={sx(p.n)} cy={sy(p.lift)} r={strong ? 5 : 3.5}
                  fill={strong ? 'var(--accent)' : 'rgba(48,74,69,0.35)'}
                >
                  <title>{`${p.y} × ${p.x}：${p.n}曲・偏り×${p.lift.toFixed(1)}`}</title>
                </circle>
                {labeled.has(key) && (
                  <text x={sx(p.n) + 7} y={sy(p.lift) + 3} className="fill-ink font-serif" fontSize={10}>
                    {p.y}×{p.x}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      <p className="text-muted mt-3 font-sans text-micro">
        点は「{dimLabel(yKey)}の値 × {dimLabel(xKey)}の値」の組み合わせ。横が件数、縦が偏り（lift）です。
        右上ほど、数も多く偏りも大きい＝意味のある結びつきです。各軸は頻度上位{TOP}件。点を押すとその条件の演目一覧へ移ります。
      </p>
    </div>
  )
}

function Pick({
  label, value, onChange, dims, other,
}: {
  label: string; value: string; onChange: (v: string) => void; dims: Dim[]; other: string
}) {
  return (
    <label className="block">
      <span className="label label-ink font-semibold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-rule-strong bg-paper focus:border-accent mt-1.5 block border px-3 py-2 font-serif text-small outline-none"
      >
        {dims.map((d) => (
          <option key={d.key} value={d.key} disabled={d.key === other}>{d.label}</option>
        ))}
      </select>
    </label>
  )
}
