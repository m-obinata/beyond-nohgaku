'use client'

import CFG from '@/content/map-config.json'
import { JAPAN_OUTLINE_PATH } from '@/content/japan-outline'

/**
 * 文化地図。
 *
 * 道路地図にはしない。しかし「日本のどこの話なのか」が分からない図にもしない。
 * 海岸線（Natural Earth 1:50m）・経緯線・縮尺を土台に置いたうえで、
 * 載せる情報を 地点 / 移動線 に絞る。
 *
 * 特集が増えると、この地図の上に何本もの旅程が重なりうる。
 * そこで旅程そのものは外から渡す「レイヤー」として扱い、
 * この部品は点と線を描くことだけを受け持つ。
 *
 * 投影は content/map-config.json を scripts/gen-japan-outline.mjs と共有している。
 * 設定を変えたら海岸線も生成し直すこと。
 */

export interface MapPoint {
  /** 一意なキー。同じ土地を二度通る旅程があるので placeSlug とは別に持つ */
  key: string
  name: string
  romaji: string
  lat: number
  lon: number
  placeSlug: string
  modernName?: string
  /** 経路上の番号。持つ点だけが線で結ばれる */
  step?: number
  /** 塗りつぶし = 同時代史料で追える、白抜き = 物語・舞台の側 */
  filled?: boolean
}

const MAP = { w: CFG.w, h: CFG.h }
const px = (lon: number) => ((lon - CFG.lonMin) / (CFG.lonMax - CFG.lonMin)) * CFG.w
const py = (lat: number) => ((CFG.latMax - lat) / (CFG.latMax - CFG.latMin)) * CFG.h

const KM_PER_LON = 111.32 * Math.cos(((CFG.latMin + CFG.latMax) / 2) * (Math.PI / 180))
const MAP_WIDTH_KM = (CFG.lonMax - CFG.lonMin) * KM_PER_LON
const SCALE_KM = 100
const SCALE_PX = (SCALE_KM / MAP_WIDTH_KM) * CFG.w

const INSET_B = { lonMin: 134.9, lonMax: 136.35, latMin: 34.25, latMax: 35.28 }
const INSET = { x: 12, y: 12, w: 252, h: 196 }
const ix = (lon: number) =>
  INSET.x + ((lon - INSET_B.lonMin) / (INSET_B.lonMax - INSET_B.lonMin)) * INSET.w
const iy = (lat: number) =>
  INSET.y + ((INSET_B.latMax - lat) / (INSET_B.latMax - INSET_B.latMin)) * INSET.h
const inInset = (p: { lon: number; lat: number }) =>
  p.lon >= INSET_B.lonMin &&
  p.lon <= INSET_B.lonMax &&
  p.lat >= INSET_B.latMin &&
  p.lat <= INSET_B.latMax

/** 畿内は地名が数 px まで密集するため、引出線の向きを手で決める */
const INSET_LABEL: Record<string, { dx: number; dy: number; anchor: 'start' | 'end' }> = {
  kurama: { dx: -11, dy: -4, anchor: 'end' },
  gojo: { dx: -11, dy: 13, anchor: 'end' },
  'omi-kagami': { dx: 12, dy: 3, anchor: 'start' },
  ichinotani: { dx: 11, dy: 15, anchor: 'start' },
  kyoto: { dx: 12, dy: -5, anchor: 'start' },
  daimotsu: { dx: -11, dy: 2, anchor: 'end' },
  yoshino: { dx: 12, dy: 5, anchor: 'start' },
}

const REGIONS = [
  { name: '陸奥', lon: 140.3, lat: 39.9 },
  { name: '北陸', lon: 138.1, lat: 36.7 },
  { name: '山陰', lon: 133.3, lat: 35.5 },
  { name: '瀬戸内', lon: 132.9, lat: 33.9 },
]

interface Props {
  points: MapPoint[]
  activeKey?: string
  onSelect?: (key: string) => void
  /** 経路（step を持つ点）を線で結ぶか */
  showRoute?: boolean
  /** 畿内の拡大図を出すか */
  showInset?: boolean
}

export function CultureMap(props: Props) {
  return (
    <>
      <div className="hidden md:block">
        <Canvas {...props} compact={false} />
      </div>
      <div className="md:hidden">
        <Canvas {...props} compact />
      </div>
    </>
  )
}

function Canvas({
  points,
  activeKey,
  onSelect,
  showRoute = true,
  showInset = true,
  compact,
}: Props & { compact: boolean }) {
  /**
   * 同じ座標に複数の点が来ることがある（平泉を二度通る旅程など）。
   * 素直に投影すると一方が押せなくなるので、出現順にずらす。
   */
  const seen = new Map<string, number>()
  const placed = points.map((p) => {
    const k = p.lon + ':' + p.lat
    const n = seen.get(k) ?? 0
    seen.set(k, n + 1)
    return { p, x: px(p.lon) + n * -14, y: py(p.lat) + n * 12 }
  })

  const routeNodes = placed
    .filter((n) => n.p.step !== undefined)
    .sort((a, b) => (a.p.step ?? 0) - (b.p.step ?? 0))
  const hasRoute = showRoute && routeNodes.length > 1

  const activeIndex = routeNodes.findIndex((n) => n.p.key === activeKey)
  const route = routeNodes.map((n) => n.x + ',' + n.y).join(' ')
  const travelled = routeNodes
    .slice(0, Math.max(activeIndex + 1, 0))
    .map((n) => n.x + ',' + n.y)
    .join(' ')

  const active = placed.find((n) => n.p.key === activeKey)
  const insetNodes = placed.filter((n) => inInset(n.p))
  const labelX = active
    ? Math.min(active.x + (compact ? 18 : 13), MAP.w - (compact ? 200 : 155))
    : 0

  return (
    <svg
      viewBox={'0 0 ' + MAP.w + ' ' + MAP.h}
      className="h-auto w-full"
      role="group"
      aria-label={'文化地図。' + points.length + ' 地点。' + (active ? '選択は ' + active.p.name : '')}
    >
      <path
        d={JAPAN_OUTLINE_PATH}
        fill="var(--color-canvas)"
        stroke="var(--color-rule-strong)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      <g stroke="var(--color-rule)" strokeWidth="0.5" opacity="0.9">
        {[132, 134, 136, 138, 140, 142].map((lon) => (
          <line key={lon} x1={px(lon)} y1={0} x2={px(lon)} y2={MAP.h} />
        ))}
        {[34, 35, 36, 37, 38, 39, 40].map((lat) => (
          <line key={lat} x1={0} y1={py(lat)} x2={MAP.w} y2={py(lat)} />
        ))}
      </g>

      {!compact && (
        <g fill="var(--color-muted)" fontSize="8" fontFamily="var(--font-sans)" letterSpacing="0.1em">
          {[132, 134, 136, 138, 140].map((lon) => (
            <text key={lon} x={px(lon) + 3} y={MAP.h - 6}>
              E{lon}
            </text>
          ))}
          {[35, 37, 39].map((lat) => (
            <text key={lat} x={4} y={py(lat) - 4}>
              N{lat}
            </text>
          ))}
        </g>
      )}

      {!compact && (
        <g
          fill="var(--color-muted)"
          fontSize="10.5"
          fontFamily="var(--font-serif)"
          opacity="0.65"
          letterSpacing="0.3em"
          textAnchor="middle"
        >
          {REGIONS.map((r) => (
            <text key={r.name} x={px(r.lon)} y={py(r.lat)}>
              {r.name}
            </text>
          ))}
        </g>
      )}

      {/* 縮尺 */}
      <g transform={'translate(' + (MAP.w - SCALE_PX - 26) + ',' + (MAP.h - 32) + ')'}>
        <line x1="0" y1="0" x2={SCALE_PX} y2="0" stroke="var(--color-ink)" strokeWidth="1" />
        <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="var(--color-ink)" strokeWidth="1" />
        <line x1={SCALE_PX} y1="-3.5" x2={SCALE_PX} y2="3.5" stroke="var(--color-ink)" strokeWidth="1" />
        <text
          x={SCALE_PX / 2}
          y="15"
          textAnchor="middle"
          fontSize={compact ? 12 : 8.5}
          fontFamily="var(--font-sans)"
          fill="var(--color-muted)"
          letterSpacing="0.08em"
        >
          {SCALE_KM} km
        </text>
      </g>

      {hasRoute && (
        <>
          <polyline
            points={route}
            fill="none"
            stroke="var(--color-rule-strong)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {travelled && (
            <polyline
              points={travelled}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.4"
              opacity="0.9"
            />
          )}
        </>
      )}

      {/* 畿内拡大図 */}
      {!compact && showInset && insetNodes.length > 1 && (
        <g>
          <rect
            x={px(INSET_B.lonMin)}
            y={py(INSET_B.latMax)}
            width={px(INSET_B.lonMax) - px(INSET_B.lonMin)}
            height={py(INSET_B.latMin) - py(INSET_B.latMax)}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.75"
            opacity="0.7"
          />
          <line
            x1={px(INSET_B.lonMin)}
            y1={py(INSET_B.latMax)}
            x2={INSET.x + INSET.w}
            y2={INSET.y + INSET.h}
            stroke="var(--color-rule-strong)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          <rect
            x={INSET.x}
            y={INSET.y}
            width={INSET.w}
            height={INSET.h}
            fill="var(--color-paper)"
            stroke="var(--color-rule-strong)"
            strokeWidth="0.75"
          />
          <text
            x={INSET.x + 9}
            y={INSET.y + 16}
            fontSize="8"
            fontFamily="var(--font-sans)"
            letterSpacing="0.14em"
            fill="var(--color-muted)"
          >
            DETAIL — 畿内・京周辺
          </text>

          {insetNodes.map(({ p }) => {
            const conf = INSET_LABEL[p.placeSlug] ?? { dx: 11, dy: 4, anchor: 'start' as const }
            const on = p.key === activeKey
            return (
              <g
                key={'inset-' + p.key}
                className={onSelect ? 'cursor-pointer' : ''}
                onClick={() => onSelect?.(p.key)}
                aria-hidden="true"
              >
                <line
                  x1={ix(p.lon)}
                  y1={iy(p.lat)}
                  x2={ix(p.lon) + conf.dx * 0.7}
                  y2={iy(p.lat) + conf.dy * 0.7}
                  stroke="var(--color-rule-strong)"
                  strokeWidth="0.5"
                />
                <circle
                  cx={ix(p.lon)}
                  cy={iy(p.lat)}
                  r={on ? 4 : 2.5}
                  fill={on || p.filled ? 'var(--color-accent)' : 'var(--color-paper)'}
                  stroke="var(--color-accent)"
                  strokeWidth="1"
                />
                <text
                  x={ix(p.lon) + conf.dx}
                  y={iy(p.lat) + conf.dy}
                  textAnchor={conf.anchor}
                  fontSize="10"
                  fontFamily="var(--font-serif)"
                  fill={on ? 'var(--color-accent)' : 'var(--color-ink)'}
                  fontWeight={on ? 600 : 400}
                >
                  {p.step !== undefined ? p.step + '. ' : ''}
                  {p.name}
                </text>
              </g>
            )
          })}
        </g>
      )}

      {/* 地点 */}
      {placed.map(({ p, x, y }) => {
        const on = p.key === activeKey
        const inRoute = p.step !== undefined
        const r = compact
          ? on
            ? 10
            : inRoute
              ? 5.5
              : 3.5
          : on
            ? 6.5
            : inRoute
              ? 4.2
              : 2.8
        return (
          <g
            key={p.key}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={
              (p.step !== undefined ? p.step + '. ' : '') +
              p.name +
              ' ' +
              p.romaji +
              (p.modernName ? ' いまの ' + p.modernName : '')
            }
            aria-pressed={onSelect ? on : undefined}
            className={onSelect ? 'cursor-pointer' : ''}
            onClick={() => onSelect?.(p.key)}
            onKeyDown={(e) => {
              if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onSelect(p.key)
              }
            }}
          >
            <circle cx={x} cy={y} r={compact ? 24 : 15} fill="transparent" />
            {on && (
              <circle
                cx={x}
                cy={y}
                r={r + 5}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="0.75"
                opacity="0.6"
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={on || p.filled ? 'var(--color-accent)' : 'var(--color-paper)'}
              stroke={inRoute || on ? 'var(--color-accent)' : 'var(--color-rule-strong)'}
              strokeWidth={inRoute || on ? 1.1 : 0.9}
            />
            {!compact && inRoute && (
              <text
                x={x}
                y={y + 3}
                textAnchor="middle"
                fontSize="7.5"
                fontFamily="var(--font-sans)"
                fontWeight="600"
                fill={on || p.filled ? 'var(--color-canvas)' : 'var(--color-accent)'}
                pointerEvents="none"
              >
                {p.step}
              </text>
            )}
          </g>
        )
      })}

      {/* 選択地点のラベル。いまの都道府県まで出す */}
      {active && (
        <g pointerEvents="none">
          <text
            x={labelX}
            y={active.y - (compact ? 14 : 9)}
            fontSize={compact ? 26 : 15}
            fontFamily="var(--font-serif)"
            fontWeight="600"
            fill="var(--color-ink)"
          >
            {active.p.name}
          </text>
          <text
            x={labelX}
            y={active.y + (compact ? 14 : 6)}
            fontSize={compact ? 13 : 8.5}
            fontFamily="var(--font-sans)"
            letterSpacing="0.12em"
            fill="var(--color-muted)"
          >
            {active.p.romaji}
          </text>
          {active.p.modernName && (
            <text
              x={labelX}
              y={active.y + (compact ? 31 : 17)}
              fontSize={compact ? 13 : 9}
              fontFamily="var(--font-sans)"
              fill="var(--color-muted)"
            >
              いまの {active.p.modernName}
            </text>
          )}
        </g>
      )}
    </svg>
  )
}

/** JourneyStop から地図の点へ。史料で追える地点を塗りつぶしで示す */
export function stopsToPoints(
  stops: {
    step: number
    name: string
    romaji: string
    lat: number
    lon: number
    placeSlug: string
    layer: string
  }[],
  modernNameOf: (slug: string) => string | undefined,
): MapPoint[] {
  return stops.map((s) => ({
    key: 'stop-' + s.step,
    name: s.name,
    romaji: s.romaji,
    lat: s.lat,
    lon: s.lon,
    placeSlug: s.placeSlug,
    modernName: modernNameOf(s.placeSlug),
    step: s.step,
    filled: s.layer === 'history' || s.layer === 'chronicle',
  }))
}
