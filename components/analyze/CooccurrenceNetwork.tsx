'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { AnalyzePlay } from '@/content/analyze'

/**
 * 共起ネットワーク（キーワード近傍）。
 *
 * 一つの軸から中心キーワードを選ぶと、それと共に現れる値を集め、
 * さらに「それらの値どうし」の共起も線で結ぶ。星形ではなく、近傍のつながり方を見る。
 * 全値をいちどに結ぶ蜘蛛の巣は作らない（中心の近傍だけに限る・指示書 3.6）。
 *
 * 配置は力学モデル（Fruchterman–Reingold 風）を決定的に数百回まわして求める。
 * 線の太さ＝共起の強さ（Jaccard 係数）。ノードを押すと、そのノードを中心に置き直す。
 */

interface Dim { key: string; label: string }
const NEIGHBORS = 11 // 中心を除く近傍数

function counts(plays: AnalyzePlay[], key: string) {
  const tot = new Map<string, number>()
  for (const p of plays) for (const v of new Set(p.facets[key] ?? [])) tot.set(v, (tot.get(v) ?? 0) + 1)
  return tot
}

/** 2値がともに現れた曲数 */
function pairCount(plays: AnalyzePlay[], key: string, a: string, b: string) {
  let n = 0
  for (const p of plays) {
    const s = p.facets[key] ?? []
    if (s.includes(a) && s.includes(b)) n++
  }
  return n
}

function topValues(tot: Map<string, number>): string[] {
  return [...tot.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v)
}

interface Node { id: string; x: number; y: number; center: boolean; count: number }
interface Edge { a: number; b: number; w: number; jac: number }

const W = 720, H = 460

/** 近傍ネットワークを組み立て、力学配置で座標を決める（決定的） */
function buildNetwork(plays: AnalyzePlay[], key: string, seed: string) {
  const tot = counts(plays, key)
  // 中心と共起する上位を近傍に
  const co = new Map<string, number>()
  for (const p of plays) {
    const s = p.facets[key] ?? []
    if (!s.includes(seed)) continue
    for (const v of s) if (v !== seed) co.set(v, (co.get(v) ?? 0) + 1)
  }
  const neighbors = [...co.entries()].sort((a, b) => b[1] - a[1]).slice(0, NEIGHBORS).map(([v]) => v)
  const ids = [seed, ...neighbors]
  const idx = new Map(ids.map((v, i) => [v, i]))

  // エッジ：ノード集合の全ペアで、共起があるもの（Jaccard で重み）
  const edges: Edge[] = []
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const n = pairCount(plays, key, ids[i], ids[j])
      if (n < 2) continue
      const uni = (tot.get(ids[i]) ?? 0) + (tot.get(ids[j]) ?? 0) - n
      const jac = uni > 0 ? n / uni : 0
      // 中心につながる線は必ず残す。近傍どうしは弱すぎるものを間引く
      if (i !== 0 && jac < 0.08) continue
      edges.push({ a: i, b: j, w: n, jac })
    }
  }

  // 力学配置（決定的な初期円 → FR 反復）
  const n = ids.length
  const pos = ids.map((_, i) => {
    if (i === 0) return { x: W / 2, y: H / 2 }
    const a = ((i - 1) / (n - 1)) * Math.PI * 2 - Math.PI / 2
    return { x: W / 2 + 150 * Math.cos(a), y: H / 2 + 150 * Math.sin(a) }
  })
  const k = Math.sqrt((W * H) / n) * 0.55
  const maxJac = Math.max(...edges.map((e) => e.jac), 0.001)
  for (let it = 0; it < 320; it++) {
    const temp = (1 - it / 320) * (W * 0.08)
    const disp = pos.map(() => ({ x: 0, y: 0 }))
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y
        let d = Math.hypot(dx, dy) || 0.01
        const f = (k * k) / d
        dx /= d; dy /= d
        disp[i].x += dx * f; disp[i].y += dy * f
        disp[j].x -= dx * f; disp[j].y -= dy * f
      }
    }
    for (const e of edges) {
      let dx = pos[e.a].x - pos[e.b].x, dy = pos[e.a].y - pos[e.b].y
      let d = Math.hypot(dx, dy) || 0.01
      const f = ((d * d) / k) * (0.4 + (e.jac / maxJac) * 0.9)
      dx /= d; dy /= d
      disp[e.a].x -= dx * f; disp[e.a].y -= dy * f
      disp[e.b].x += dx * f; disp[e.b].y += dy * f
    }
    for (let i = 1; i < n; i++) { // 中心(0)は固定
      const d = Math.hypot(disp[i].x, disp[i].y) || 0.01
      pos[i].x += (disp[i].x / d) * Math.min(d, temp)
      pos[i].y += (disp[i].y / d) * Math.min(d, temp)
      pos[i].x = Math.max(60, Math.min(W - 60, pos[i].x))
      pos[i].y = Math.max(40, Math.min(H - 40, pos[i].y))
    }
  }

  const nodes: Node[] = ids.map((id, i) => ({
    id, x: pos[i].x, y: pos[i].y, center: i === 0, count: tot.get(id) ?? 0,
  }))
  return { nodes, edges, idx: idx as Map<string, number>, neighbors }
}

export function CooccurrenceNetwork({ plays, dims }: { plays: AnalyzePlay[]; dims: Dim[] }) {
  const [dimKey, setDimKey] = useState('theme')
  const [seed, setSeed] = useState('救済')
  const allValues = useMemo(() => topValues(counts(plays, dimKey)), [plays, dimKey])
  const activeSeed = allValues.includes(seed) ? seed : allValues[0]

  const changeDim = (k: string) => {
    setDimKey(k)
    setSeed(topValues(counts(plays, k))[0])
  }

  const net = useMemo(() => buildNetwork(plays, dimKey, activeSeed), [plays, dimKey, activeSeed])
  const dimLabel = dims.find((d) => d.key === dimKey)?.label ?? dimKey
  const maxW = Math.max(...net.edges.map((e) => e.w), 1)
  const seedCount = net.nodes[0]?.count ?? 0

  const bothHref = (v: string) =>
    `/ja/explore?${encodeURIComponent(dimKey)}=${encodeURIComponent(activeSeed)},${encodeURIComponent(v)}&and=${encodeURIComponent(dimKey)}`

  return (
    <div>
      <p className="max-w-read font-serif text-small text-ink/85">
        中心のキーワードと共に現れる{dimLabel}を集め、さらに<strong className="font-semibold">それらどうしのつながり</strong>も線で結びます。
        近くにかたまっている値どうしは、同じ曲に一緒に出やすいという意味です。線が太いほど強く結びつきます。
        ノードを押すと、その値を中心に置き直します。
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
          <span className="label label-ink font-semibold">中心のキーワード</span>
          <select
            value={activeSeed}
            onChange={(e) => setSeed(e.target.value)}
            className="border-rule-strong bg-paper focus:border-accent mt-1.5 block border px-3 py-2 font-serif text-small outline-none"
          >
            {allValues.slice(0, 40).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <span className="label text-muted pb-2">「{activeSeed}」を持つ演目 {seedCount} 曲</span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mx-auto block h-auto w-full max-w-[720px]"
          role="group"
          aria-label={`${dimLabel}「${activeSeed}」の近傍ネットワーク`}
        >
          {net.edges.map((e) => (
            <line
              key={e.a + '-' + e.b}
              x1={net.nodes[e.a].x} y1={net.nodes[e.a].y}
              x2={net.nodes[e.b].x} y2={net.nodes[e.b].y}
              stroke={e.a === 0 ? 'rgba(48,74,69,0.45)' : 'var(--color-rule-strong)'}
              strokeWidth={1 + (e.w / maxW) * 6}
            />
          ))}
          {net.nodes.map((nd) => {
            const r = nd.center ? 30 : 8 + (nd.count ? Math.min(10, nd.count / 6) : 0)
            return (
              <g
                key={nd.id}
                className={nd.center ? '' : 'cursor-pointer'}
                onClick={() => !nd.center && setSeed(nd.id)}
              >
                <circle cx={nd.x} cy={nd.y} r={r} fill="var(--color-accent)" opacity={nd.center ? 1 : 0.85} />
                <text
                  x={nd.x}
                  y={nd.center ? nd.y : nd.y - r - 4}
                  textAnchor="middle"
                  dominantBaseline={nd.center ? 'central' : 'auto'}
                  fontSize={nd.center ? 15 : 12}
                  fill={nd.center ? 'var(--color-canvas)' : 'var(--color-ink)'}
                  className="font-serif"
                >
                  {nd.id}
                  {!nd.center && <tspan fill="var(--color-muted)" fontSize={9}> {nd.count}</tspan>}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* 文字一覧（図に依存しない。押すと両方を持つ曲へ） */}
      <div className="border-rule mt-4 border-t pt-4">
        <span className="label label-ink font-semibold">「{activeSeed}」とよく一緒に出る{dimLabel}</span>
        <ul className="mt-3 flex flex-wrap gap-2">
          {net.neighbors.map((v) => (
            <li key={v}>
              <Link
                href={bothHref(v)}
                className="border-rule hover:bg-accent hover:text-canvas inline-flex items-baseline gap-2 border px-3 py-1.5 transition-colors"
                title={`「${activeSeed}」と「${v}」をともに持つ曲へ`}
              >
                <span className="font-serif text-small">{v}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
