'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { AnalyzePlay } from '@/content/analyze'

/**
 * 共起ネットワーク（限定表示）。
 *
 * 一つの軸（主題など）から中心の値を選ぶと、それと同じ曲に共に現れる値だけを周りに出す。
 * 全部の値を一度に結ぶ蜘蛛の巣は作らない（指示書 3.6）。
 * 線の太さ＝共に現れる曲の数。値を押すと、その二つをともに持つ曲の一覧へ移る。
 */

interface Dim { key: string; label: string }
const NEIGHBORS = 10

function topValues(plays: AnalyzePlay[], key: string): string[] {
  const c = new Map<string, number>()
  for (const p of plays) for (const v of p.facets[key] ?? []) c.set(v, (c.get(v) ?? 0) + 1)
  return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v)
}

function coValues(plays: AnalyzePlay[], key: string, seed: string) {
  let seedCount = 0
  const co = new Map<string, number>()
  const tot = new Map<string, number>()
  for (const p of plays) {
    const vals = p.facets[key] ?? []
    for (const v of vals) tot.set(v, (tot.get(v) ?? 0) + 1)
    if (!vals.includes(seed)) continue
    seedCount++
    for (const v of vals) if (v !== seed) co.set(v, (co.get(v) ?? 0) + 1)
  }
  const total = plays.length
  const neighbors = [...co.entries()]
    .map(([value, n]) => {
      const ex = ((tot.get(seed) ?? 0) * (tot.get(value) ?? 0)) / total
      return { value, n, lift: ex > 0 ? n / ex : 0 }
    })
    .sort((a, b) => b.n - a.n || b.lift - a.lift)
    .slice(0, NEIGHBORS)
  return { seedCount, neighbors }
}

export function CooccurrenceNetwork({ plays, dims }: { plays: AnalyzePlay[]; dims: Dim[] }) {
  const [dimKey, setDimKey] = useState('theme')
  const [seed, setSeed] = useState('救済')
  const values = useMemo(() => topValues(plays, dimKey), [plays, dimKey])
  const activeSeed = values.includes(seed) ? seed : values[0]

  const changeDim = (k: string) => {
    setDimKey(k)
    setSeed(topValues(plays, k)[0]) // 軸を変えたら中心もその軸の値に戻す
  }

  const { seedCount, neighbors } = useMemo(
    () => coValues(plays, dimKey, activeSeed),
    [plays, dimKey, activeSeed],
  )

  const dimLabel = dims.find((d) => d.key === dimKey)?.label ?? dimKey
  const bothHref = (v: string) =>
    `/ja/explore?${encodeURIComponent(dimKey)}=${encodeURIComponent(activeSeed)},${encodeURIComponent(v)}&and=${encodeURIComponent(dimKey)}`

  // 配置：中心＋放射状。ラベルはノードの外へ置いて読めるようにする。
  const W = 720, H = 440, cx = W / 2, cy = H / 2, R = 128
  const maxN = neighbors.reduce((m, x) => Math.max(m, x.n), 1)
  const nodes = neighbors.map((nb, i) => {
    const a = (i / neighbors.length) * Math.PI * 2 - Math.PI / 2
    const cos = Math.cos(a), sin = Math.sin(a)
    return {
      ...nb,
      x: cx + R * cos,
      y: cy + R * sin,
      lx: cx + (R + 16) * cos,
      ly: cy + (R + 16) * sin,
      anchor: cos > 0.2 ? 'start' : cos < -0.2 ? 'end' : 'middle',
    }
  })

  return (
    <div>
      <p className="max-w-read font-serif text-small text-ink/85">
        中心に選んだ値と<strong className="font-semibold">同じ曲によく一緒に出てくる</strong>{dimLabel}を並べます。
        線が太いほど、一緒に出る曲が多いという意味です。値を押すと、その二つをともに持つ曲の一覧へ移ります。
      </p>

      <div className="border-rule-strong mt-5 flex flex-wrap items-end gap-x-8 gap-y-4 border-t pt-4">
        <label className="block">
          <span className="label label-ink font-semibold">軸</span>
          <select
            value={dimKey}
            onChange={(e) => changeDim(e.target.value)}
            className="border-rule-strong bg-paper focus:border-accent mt-1.5 block border px-3 py-2 font-serif text-small outline-none"
          >
            {dims.map((d) => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label label-ink font-semibold">中心にする{dimLabel}</span>
          <select
            value={activeSeed}
            onChange={(e) => setSeed(e.target.value)}
            className="border-rule-strong bg-paper focus:border-accent mt-1.5 block border px-3 py-2 font-serif text-small outline-none"
          >
            {values.slice(0, 40).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <span className="label text-muted pb-2">
          「{activeSeed}」を持つ演目 {seedCount} 曲
        </span>
      </div>

      {/* 図 */}
      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mx-auto block h-auto w-full max-w-[720px]"
          role="group"
          aria-label={`${dimLabel}「${activeSeed}」と共に現れる値`}
        >
          {nodes.map((n) => (
            <line
              key={'e' + n.value}
              x1={cx} y1={cy} x2={n.x} y2={n.y}
              stroke="var(--color-rule-strong)"
              strokeWidth={1 + (n.n / maxN) * 7}
            />
          ))}
          {/* 周辺ノード＋外側ラベル */}
          {nodes.map((n) => {
            const r = 5 + (n.n / maxN) * 6
            return (
              <g key={'n' + n.value}>
                <circle cx={n.x} cy={n.y} r={r} fill="var(--color-accent)" />
                <text
                  x={n.lx}
                  y={n.ly}
                  textAnchor={n.anchor as 'start' | 'end' | 'middle'}
                  dominantBaseline="central"
                  fontSize={13}
                  fill="var(--color-ink)"
                  className="font-serif"
                >
                  {n.value}
                  <tspan fill="var(--color-muted)" fontSize={10}> {n.n}</tspan>
                </text>
              </g>
            )
          })}
          {/* 中心 */}
          <circle cx={cx} cy={cy} r={34} fill="var(--color-accent)" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={15} fill="var(--color-canvas)" className="font-serif">
            {activeSeed}
          </text>
        </svg>
      </div>

      {/* 文字一覧（図に依存しない・キーボード可） */}
      <div className="border-rule mt-4 border-t pt-4">
        <span className="label label-ink font-semibold">
          「{activeSeed}」とよく一緒に出る{dimLabel}
        </span>
        <ul className="mt-3 flex flex-wrap gap-2">
          {neighbors.map((nb) => (
            <li key={nb.value}>
              <Link
                href={bothHref(nb.value)}
                className="border-rule hover:bg-accent hover:text-canvas inline-flex items-baseline gap-2 border px-3 py-1.5 transition-colors"
                title={`「${activeSeed}」と「${nb.value}」をともに持つ曲へ`}
              >
                <span className="font-serif text-small">{nb.value}</span>
                <span className="num text-micro text-muted">{nb.n}曲{nb.lift >= 1.8 ? '・偏り大' : ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
