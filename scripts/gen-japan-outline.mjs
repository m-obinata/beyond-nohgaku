/**
 * 日本列島の海岸線を、地図と同じ投影で SVG パスに変換して書き出す。
 *
 * 実行時に地理データへ依存させたくないので、生成物をリポジトリに置く。
 *   node scripts/gen-japan-outline.mjs
 *
 * 出典: Natural Earth 1:50m（パブリックドメイン）を world-atlas 経由で使用。
 * 投影は content/map-config.json を地図本体と共有する。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { feature } from 'topojson-client'

const cfg = JSON.parse(readFileSync('content/map-config.json', 'utf8'))
const topo = JSON.parse(readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'))

const geom = topo.objects.countries.geometries.find((g) => g.id === '392')
if (!geom) throw new Error('Japan (392) not found')
const japan = feature(topo, geom)

const px = (lon) => ((lon - cfg.lonMin) / (cfg.lonMax - cfg.lonMin)) * cfg.w
const py = (lat) => ((cfg.latMax - lat) / (cfg.latMax - cfg.latMin)) * cfg.h

const polygons =
  japan.geometry.type === 'MultiPolygon' ? japan.geometry.coordinates : [japan.geometry.coordinates]

/** 表示範囲の外、または点になってしまう小島は落とす */
const MIN_EXTENT = 3.5
/** 投影後にこの距離未満しか動かない点は間引く */
const MIN_STEP = 0.7

const subpaths = []
let kept = 0
let dropped = 0

for (const poly of polygons) {
  for (const ring of poly) {
    const pts = ring.map(([lon, lat]) => [px(lon), py(lat)])
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)

    if (maxX < -20 || minX > cfg.w + 20 || maxY < -20 || minY > cfg.h + 20) {
      dropped++
      continue
    }
    if (maxX - minX < MIN_EXTENT && maxY - minY < MIN_EXTENT) {
      dropped++
      continue
    }

    const simplified = []
    for (const p of pts) {
      const last = simplified[simplified.length - 1]
      if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= MIN_STEP) simplified.push(p)
    }
    if (simplified.length < 4) {
      dropped++
      continue
    }

    const r = (n) => Math.round(n * 10) / 10
    subpaths.push(
      'M' +
        simplified.map((p) => r(p[0]) + ' ' + r(p[1])).join('L') +
        'Z',
    )
    kept++
  }
}

const d = subpaths.join('')
const out = `/**
 * 自動生成ファイル — 直接編集しない。
 * 生成: node scripts/gen-japan-outline.mjs
 * 出典: Natural Earth 1:50m coastline（パブリックドメイン）
 * 投影: content/map-config.json
 */
export const JAPAN_OUTLINE_PATH =
  '${d}'
`
writeFileSync('content/japan-outline.ts', out)
console.log('rings kept:', kept, 'dropped:', dropped, 'path chars:', d.length)
