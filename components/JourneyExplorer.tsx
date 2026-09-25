'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ChronologyEvent, JourneyStop } from '@/lib/types'
import { CultureMap, stopsToPoints } from './CultureMap'
import { Timeline } from './Timeline'
import { SOURCE_LAYERS, SOURCE_LAYER_ORDER } from '@/content/source-layers'
import { playBySlug } from '@/content/plays'
import { placeBySlug } from '@/content/places'

/**
 * 地図と年表を同じ選択状態で結ぶ（指示書 16・17）。
 * 地図だけでは地名が読めず、年表だけでは距離が分からない。両方を同時に出す。
 */
export function JourneyExplorer({
  stops,
  contextEvents,
}: {
  stops: JourneyStop[]
  contextEvents?: ChronologyEvent[]
}) {
  const [activeStep, setActiveStep] = useState(1)
  const active = stops.find((s) => s.step === activeStep) ?? stops[0]
  const place = placeBySlug(active.placeSlug)
  const layer = SOURCE_LAYERS[active.layer]
  const index = stops.findIndex((s) => s.step === active.step)
  const points = stopsToPoints(stops, (slug) => placeBySlug(slug)?.modernName)

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* 地図 */}
        <div className="lg:col-span-7">
          <div className="border-rule bg-paper border p-3 md:p-4">
            <CultureMap
              points={points}
              activeKey={'stop-' + activeStep}
              onSelect={(key) => setActiveStep(Number(key.replace('stop-', '')))}
            />
          </div>

          {/* 小さな画面では地図は位置の把握に徹する。選択は年表で行う */}
          <p className="text-muted mt-2 font-sans text-micro md:hidden">
            小さな画面では地図に番号を出していません。地点の選択は、下の年表から行えます。
          </p>

          {/* 凡例。色だけで意味を伝えない（指示書 30） */}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="label">凡例 — 情報のレイヤー</span>
            {SOURCE_LAYER_ORDER.filter((id) => stops.some((s) => s.layer === id)).map((id) => {
              const l = SOURCE_LAYERS[id]
              const filled = id === 'history' || id === 'chronicle'
              return (
                <span key={id} className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={
                      'border-accent inline-block h-[9px] w-[9px] rounded-full border ' +
                      (filled ? 'bg-accent' : 'bg-canvas')
                    }
                  />
                  <span className="label text-ink">{l.label}</span>
                  <span className="font-sans text-micro text-muted">{l.evidence}</span>
                </span>
              )
            })}
          </div>
        </div>

        {/* 選択地点の詳細 */}
        <aside className="lg:col-span-5" aria-live="polite">
          <div className="rule-top-strong pt-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="label">
                STOP {String(active.step).padStart(2, '0')} / {stops.length}
              </span>
              <span className="num text-micro text-muted">{active.year}</span>
            </div>

            <h3 className="mt-3 font-serif text-h2">{active.name}</h3>
            <p className="label mt-1">{active.romaji}</p>

            <p className="mt-4 font-serif text-body">{active.headline}。{active.note}</p>

            <div className="border-rule mt-5 border-t pt-3">
              <span className="label">この記述の位置づけ</span>
              <p className="mt-1.5 font-sans text-small">
                <span className="text-ink font-semibold">{layer.label}</span>
                <span className="text-muted"> — {layer.definition}／{layer.evidence}</span>
              </p>
            </div>

            {place && (
              <div className="border-rule mt-4 border-t pt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="label">土地</span>
                  <span className="font-sans text-micro text-accent">
                    いまの {place.prefecture === '—' ? place.modernName : place.modernName}
                  </span>
                </div>
                <p className="mt-1.5 font-serif text-small">{place.summary}</p>
                {place.today && (
                  <p className="mt-1.5 font-sans text-micro text-muted">現在 — {place.today}</p>
                )}
                {place.access && (
                  <p className="mt-1 font-sans text-micro text-muted">行き方 — {place.access}</p>
                )}
              </div>
            )}

            {active.plays.length > 0 && (
              <div className="border-rule mt-4 border-t pt-3">
                <span className="label">この地点の演目</span>
                <ul className="mt-1">
                  {active.plays.map((slug) => {
                    const play = playBySlug(slug)
                    if (!play) return null
                    return (
                      <li key={slug}>
                        <Link href={'/ja/plays/' + play.slug} className="list-row group">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="font-serif text-small group-hover:text-accent">
                              能「{play.name}」
                            </span>
                            <span className="label">{play.category}</span>
                          </span>
                          <span className="mt-0.5 block font-serif text-micro text-muted">
                            {play.summary}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                className="label border-rule-strong hover:border-accent hover:text-accent disabled:opacity-35 border px-3 py-2"
                onClick={() => setActiveStep(stops[Math.max(index - 1, 0)].step)}
                disabled={index === 0}
              >
                ← 前の地点
              </button>
              <button
                type="button"
                className="label border-rule-strong hover:border-accent hover:text-accent disabled:opacity-35 border px-3 py-2"
                onClick={() => setActiveStep(stops[Math.min(index + 1, stops.length - 1)].step)}
                disabled={index === stops.length - 1}
              >
                次の地点 →
              </button>
              <Link
                href={'/ja/places/' + active.placeSlug}
                className="label hover:text-accent underline decoration-rule-strong underline-offset-4"
              >
                {active.name}の記事へ
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* 年表 */}
      <div className="mt-14">
        <div className="rule-top-strong flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-3 pb-5">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <span className="label label-ink font-semibold">TIMELINE</span>
            <h3 className="font-serif text-h3">旅程と、その外で起きていたこと</h3>
          </div>
          <p className="font-sans text-micro text-muted">
            破線の行は、義経の旅程には現れないが同時期に進行していた出来事
          </p>
        </div>
        <Timeline
          stops={stops}
          contextEvents={contextEvents}
          activeStep={activeStep}
          onSelect={setActiveStep}
        />
      </div>
    </div>
  )
}
