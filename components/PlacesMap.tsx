'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Place } from '@/lib/types'
import { CultureMap, stopsToPoints, type MapPoint } from './CultureMap'

/**
 * 土地の地図。
 *
 * 特集はこれから増える。そのたびに旅程がこの地図の上に重なることになるので、
 * 既定ではどの旅程も引かず、すべての土地を点として置くだけにする。
 * 旅程は「選んだときだけ浮かび上がるレイヤー」として扱う。
 */

export interface MapJourney {
  slug: string
  short: string
  title: string
  stops: {
    step: number
    name: string
    romaji: string
    lat: number
    lon: number
    placeSlug: string
    layer: string
  }[]
}

export function PlacesMap({
  places,
  journeys,
}: {
  places: Place[]
  journeys: MapJourney[]
}) {
  const [layerSlug, setLayerSlug] = useState<string | null>(null)
  const [activeKey, setActiveKey] = useState<string | undefined>(undefined)

  const layer = journeys.find((j) => j.slug === layerSlug)
  const modernNameOf = (slug: string) => places.find((p) => p.slug === slug)?.modernName

  const layerPoints: MapPoint[] = layer ? stopsToPoints(layer.stops, modernNameOf) : []
  const covered = new Set(layerPoints.map((p) => p.placeSlug))

  const basePoints: MapPoint[] = places
    .filter((p) => !covered.has(p.slug))
    .map((p) => ({
      key: 'place-' + p.slug,
      name: p.name,
      romaji: p.romaji,
      lat: p.lat,
      lon: p.lon,
      placeSlug: p.slug,
      modernName: p.modernName,
    }))

  const points = [...basePoints, ...layerPoints]
  const active = points.find((p) => p.key === activeKey)
  const activePlace = active ? places.find((p) => p.slug === active.placeSlug) : undefined

  return (
    <div>
      {/* レイヤー選択 */}
      <div className="rule-top-strong flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-3 pb-4">
        <span className="label label-ink font-semibold">MAP — 重ねる旅程</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setLayerSlug(null)
              setActiveKey(undefined)
            }}
            aria-pressed={layer === undefined}
            className={
              'label border px-3 py-1.5 transition-colors ' +
              (layer === undefined
                ? 'border-accent bg-accent text-canvas'
                : 'border-rule-strong hover:border-accent hover:text-accent')
            }
          >
            重ねない
          </button>
          {journeys.map((j) => {
            const on = j.slug === layerSlug
            return (
              <button
                key={j.slug}
                type="button"
                onClick={() => {
                  setLayerSlug(on ? null : j.slug)
                  setActiveKey(undefined)
                }}
                aria-pressed={on}
                title={j.title}
                className={
                  'label border px-3 py-1.5 transition-colors ' +
                  (on
                    ? 'border-accent bg-accent text-canvas'
                    : 'border-rule-strong hover:border-accent hover:text-accent')
                }
              >
                {j.short}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-rule bg-paper border p-3 md:p-4">
        <CultureMap
          points={points}
          activeKey={activeKey}
          onSelect={setActiveKey}
          showRoute={Boolean(layer)}
          showInset
        />
      </div>

      {/* 選択した地点 */}
      <div className="border-rule mt-3 min-h-[5.5rem] border-t pt-3" aria-live="polite">
        {activePlace ? (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="flex flex-wrap items-baseline gap-x-3">
                <Link
                  href={'/ja/places/' + activePlace.slug}
                  className="hover:text-accent font-serif text-h3"
                >
                  {activePlace.name}
                </Link>
                <span className="label">{activePlace.romaji}</span>
              </span>
              <span className="font-sans text-micro text-accent">
                いまの {activePlace.modernName}
              </span>
            </div>
            <p className="mt-2 max-w-[46rem] font-serif text-small text-ink/85">
              {activePlace.summary}
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4">
              <span className="label">{activePlace.regionModern}</span>
              <span className="label">{activePlace.kind}</span>
              <span className="label">旧国 — {activePlace.region}</span>
              <Link
                href={'/ja/places/' + activePlace.slug}
                className="label text-accent hover:underline"
              >
                この土地を読む →
              </Link>
            </p>
          </div>
        ) : (
          <p className="font-sans text-micro text-muted">
            地点を選ぶと、いまの所在と概要が出ます。
            {journeys.length > 0 && '「重ねる旅程」を選ぶと、その特集の経路だけが線で結ばれます。'}
          </p>
        )}
      </div>
    </div>
  )
}
