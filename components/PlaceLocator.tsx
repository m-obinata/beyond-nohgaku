'use client'

import { useState } from 'react'
import { CultureMap, stopsToPoints } from './CultureMap'
import { placeBySlug } from '@/content/places'
import type { JourneyStop } from '@/lib/types'

/** 土地ページに置く小さな位置図。旅程のどこにあたるかだけを示す */
export function PlaceLocator({
  stops,
  initialStep,
}: {
  stops: JourneyStop[]
  initialStep: number
}) {
  const [step, setStep] = useState(initialStep)
  const points = stopsToPoints(stops, (slug) => placeBySlug(slug)?.modernName)
  return (
    <div className="border-rule bg-paper border p-3">
      <CultureMap
        points={points}
        activeKey={'stop-' + step}
        onSelect={(key) => setStep(Number(key.replace('stop-', '')))}
        showInset={false}
      />
    </div>
  )
}
