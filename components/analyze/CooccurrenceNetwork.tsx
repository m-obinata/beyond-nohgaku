'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { AnalyzePlay } from '@/content/analyze'

/**
 * 共起ネットワーク（限定表示）。
 *
 * 一つの軸（主題など）を選び、中心の値を決めると、それと同じ曲に共に現れる値だけを
 * 周りに出す。全部の値を一度に結ぶ蜘蛛の巣は作らない（指示書 3.6）。
 * 線の太さ＝共に現れる曲の数。値を押すと、その二つをともに持つ曲の一覧へ移る。
 */

interface Dim { key: string; label: string }
const NEIGHBORS = 10

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

function topValues(plays: AnalyzePlay[], key: string): string[] {
  const c = new Map<string, number>()
  for (const p of plays) for (const v of p.facets[key] ?? []) c.set(v, (c.get(v) ?? 0) + 1)
  return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v)
}

export function CooccurrenceNetwork({ plays, dims }: { plays: AnalyzePlay[]; dims: Dim[] }) {
  const [dimKey, setDimKey] = useState('theme')
  const values = useMemo(() => topValues(plays, dimKey), [plays, dimKey])
  const [seed, setSeed] = useState('救済')
  const activeSeed = values.includes(seed) ? seed : values[0]

  const { seedCount, neighbors } = useMemo(
    () => coValues(plays, dimKey, activeSeed),
    [plays, dimKey, activeSeed],
  )

  const dimLabel = dims.find((d) => d.key === dimKey)?.label ?? dimKey
  const bothHref = (v: string) =>
    `/ja/explore?${encodeURIComponent(dimKey)}=${encodeURIComponent(activeSeed)},${encodeURIComponent(v)}&and=${encodeURIComponent(dimKey)}`

  // SVG エゴネットワークの配置
  const W = 640, H = 420, cx = W / 2, cy = H / 2, R = 150
  const maxN = neighbors.reduce((m, x) => Math.max(m, x.n), 1)
  const nodes = neighbors.map((nb, i) => {
    const a = (i / neighbors.length) * Math.PI * 2 - Math.PI / 2
    return { ...nb, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }
  })

  return (
    <div>
      <div className="border-rule-strong flex flex-wrap items-end gap-x-8 gap-y-4 border-t pt-4">
        <label className="block">
          <span className="label label-ink font-semibold">軸</span>
          <select
            value={dimKey}
            onChange={(e) => setDimKey(e.target.value)}
            className="border-rule-strong bg-paper focus:border-accent mt-1.5 block border px-3 py-2 font-serif text-small outline-none"
          >
            {dims.map((d) => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label label-ink font-semibold">中心の値</span>
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

      {/* 図（視覚） */}
      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mx-auto block h-auto w-full max-w-[640px]"
          role="group"
          aria-label={`${dimLabel}「${activeSeed}」と共に現れる値`}
        >
          {nodes.map((n) => (
            <line
              key={'e' + n.value}
              x1={cx} y1={cy} x2={n.x} y2={n.y}
              stroke="rgba(48,74,69,0.35)"
              strokeWidth={1 + (n.n / maxN) * 6}
            />
          ))}
          {/* 中心 */}
          <g>
            <circle cx={cx} cy={cy} r={30} fill="var(--accent)" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-canvas font-serif" fontSize={13}>
              {activeSeed}
            </text>
          </g>
          {/* 周辺（リンク） */}
          {nodes.map((n) => (
            <a key={'n' + n.value} href={bothHref(n.value)}>
              <circle cx={n.x} cy={n.y} r={22} fill="var(--paper)" stroke="var(--accent)" strokeWidth={1} />
              <text x={n.x} y={n.y - 2} textAnchor="middle" dominantBaseline="central" className="fill-ink font-serif" fontSize={11}>
                {n.value.length > 4 ? n.value.slice(0, 4) : n.value}
              </text>
              <text x={n.x} y={n.y + 11} textAnchor="middle" className="fill-muted" fontSize={8}>
                {n.n}
              </text>
            </a>
          ))}
        </svg>
      </div>

      {/* 一覧（文字・キーボード用。図に依存しない） */}
      <div className="border-rule mt-6 border-t pt-4">
        <span className="label label-ink font-semibold">「{activeSeed}」と共に現れる{dimLabel}</span>
        <p className="text-muted mt-1 font-sans text-micro">
          数字は、両方をともに持つ演目の数。押すと、その二つを持つ曲の一覧へ移ります。
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {neighbors.map((nb) => (
            <li key={nb.value}>
              <Link
                href={bothHref(nb.value)}
                className="border-rule hover:bg-accent hover:text-canvas inline-flex items-baseline gap-2 border px-3 py-1.5 transition-colors"
              >
                <span className="font-serif text-small">{nb.value}</span>
                <span className="num text-micro text-muted">{nb.n}{nb.lift >= 1.8 ? '・偏り大' : ''}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
