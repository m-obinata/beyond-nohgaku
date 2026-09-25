'use client'

import Link from 'next/link'
import type { ChronologyEvent, JourneyStop } from '@/lib/types'
import { SOURCE_LAYERS } from '@/content/source-layers'
import { playBySlug } from '@/content/plays'
import { placeBySlug } from '@/content/places'

/**
 * Timeline（指示書 17）。
 * 装飾の年表ではなく、「その出来事が物語と史実のどこに位置するか」を読むためのUI。
 * 地図と同じ選択状態を共有する。
 */

type Row =
  | { kind: 'stop'; yearNum: number; stop: JourneyStop }
  | { kind: 'context'; yearNum: number; event: ChronologyEvent }

export function Timeline({
  stops,
  contextEvents = [],
  activeStep,
  onSelect,
}: {
  stops: JourneyStop[]
  contextEvents?: ChronologyEvent[]
  activeStep: number
  onSelect: (step: number) => void
}) {
  const rows: Row[] = [
    ...stops.map((stop) => ({ kind: 'stop' as const, yearNum: stop.yearNum, stop })),
    ...contextEvents.map((event) => ({ kind: 'context' as const, yearNum: event.yearNum, event })),
  ].sort((a, b) => a.yearNum - b.yearNum)

  return (
    <ol className="relative">
      {/* 時間の軸 */}
      <span
        aria-hidden="true"
        className="bg-rule absolute top-0 bottom-0 left-[4.25rem] hidden w-px sm:block"
      />
      {rows.map((row) =>
        row.kind === 'stop' ? (
          <StopRow
            key={'s' + row.stop.step}
            stop={row.stop}
            active={row.stop.step === activeStep}
            onSelect={onSelect}
          />
        ) : (
          <ContextRow key={'c' + row.event.yearNum + row.event.headline} event={row.event} />
        ),
      )}
    </ol>
  )
}

function StopRow({
  stop,
  active,
  onSelect,
}: {
  stop: JourneyStop
  active: boolean
  onSelect: (step: number) => void
}) {
  const layer = SOURCE_LAYERS[stop.layer]
  return (
    <li className="border-rule border-t last:border-b">
      <button
        type="button"
        onClick={() => onSelect(stop.step)}
        aria-pressed={active}
        className={
          'grid w-full grid-cols-1 gap-x-5 py-4 text-left transition-colors sm:grid-cols-[4.25rem_1fr] ' +
          (active ? 'bg-accent-tint/60' : 'hover:bg-accent/[0.04]')
        }
      >
        <div className="relative flex items-baseline gap-2 sm:block">
          <span className={'num text-small ' + (active ? 'text-accent font-semibold' : 'text-ink')}>
            {stop.year}
          </span>
          <span
            aria-hidden="true"
            className={
              'absolute top-[0.55rem] right-[-0.3rem] hidden h-[7px] w-[7px] rounded-full sm:block ' +
              (active ? 'bg-accent' : 'bg-canvas border-rule-strong border')
            }
          />
        </div>

        <div className="sm:pl-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="label">
              {String(stop.step).padStart(2, '0')} — {stop.romaji}
            </span>
            <span
              className={
                'font-serif text-[1.0625rem] leading-snug ' + (active ? 'text-accent' : '')
              }
            >
              {stop.name}
            </span>
            <span className="font-serif text-small text-muted">{stop.headline}</span>
            <span className="font-sans text-micro text-muted">
              いまの {placeBySlug(stop.placeSlug)?.modernName}
            </span>
          </div>

          <p className="mt-1.5 max-w-[46rem] font-serif text-small text-ink/85">{stop.note}</p>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="label">
              <span className="text-ink font-semibold">{layer.label}</span>
              <span className="text-muted ml-2 tracking-normal normal-case">{layer.evidence}</span>
            </span>
            {stop.plays.length > 0 && (
              <span className="flex flex-wrap items-baseline gap-x-3">
                {stop.plays.map((slug) => {
                  const play = playBySlug(slug)
                  if (!play) return null
                  return (
                    <span key={slug} className="font-serif text-small">
                      能「{play.name}」
                    </span>
                  )
                })}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  )
}

function ContextRow({ event }: { event: ChronologyEvent }) {
  return (
    <li className="border-rule border-t border-dashed last:border-b">
      <div className="grid grid-cols-1 gap-x-5 py-3 sm:grid-cols-[4.25rem_1fr]">
        <div className="relative">
          <span className="num text-small text-muted">{event.year}</span>
          <span
            aria-hidden="true"
            className="bg-rule-strong absolute top-[0.6rem] right-[-0.15rem] hidden h-px w-[5px] sm:block"
          />
        </div>
        <div className="sm:pl-3">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="label">{event.era}</span>
            <span className="font-serif text-small">{event.headline}</span>
          </div>
          <p className="mt-1 max-w-[46rem] font-serif text-small text-muted">
            {event.detail}
            <span className="label ml-2 tracking-normal normal-case">出典 {event.source}</span>
          </p>
        </div>
      </div>
    </li>
  )
}

/** 記事ページ側で使う、前後の移動だけを示す小さな JOURNEY 表示 */
export function JourneyStrip({
  stops,
  currentStep,
}: {
  stops: JourneyStop[]
  currentStep: number
}) {
  return (
    <ol>
      {stops.map((s) => {
        const isCurrent = s.step === currentStep
        return (
          <li key={s.step} className="border-rule border-t last:border-b">
            <Link
              href={'/ja/places/' + s.placeSlug}
              className={
                'flex items-baseline gap-2.5 py-2 transition-colors ' +
                (isCurrent ? 'text-accent' : 'hover:text-accent')
              }
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className={'num text-micro ' + (isCurrent ? 'text-accent' : 'text-muted')}>
                {String(s.step).padStart(2, '0')}
              </span>
              <span className="flex-1">
                <span className={'block font-serif text-small ' + (isCurrent ? 'font-semibold' : '')}>
                  {s.name}
                </span>
                <span className="label block text-[0.5625rem]">{s.romaji}</span>
              </span>
              <span className="num text-micro text-muted">{s.year}</span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
