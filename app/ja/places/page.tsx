import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { FacetBrowser } from '@/components/FacetBrowser'
import { PlacesMap } from '@/components/PlacesMap'
import { PLACE_FACETS, placeItems } from '@/content/browse'
import { PLACES } from '@/content/places'
import { FEATURES } from '@/content/features'

export const metadata: Metadata = {
  title: '土地',
  description: '地方・都道府県・土地の性格から、能の舞台になった場所を絞り込む。',
}

export default function PlacesIndex() {
  const journeys = FEATURES.filter((f) => f.journey).map((f) => ({
    slug: f.slug,
    short: f.short,
    title: f.title,
    stops: f.journey!.stops.map((s) => ({
      step: s.step,
      name: s.name,
      romaji: s.romaji,
      lat: s.lat,
      lon: s.lon,
      placeSlug: s.placeSlug,
      layer: s.layer as string,
    })),
  }))

  return (
    <IndexShell
      label="PLACES"
      title="土地から"
      lede="旧国名ではなく、いまの地方と都道府県から探せるようにしています。能の舞台になった場所の多くは、行っても何も残っていません。その「何もなさ」も含めて土地は情報です。"
    >
      <section className="mb-16">
        <PlacesMap places={PLACES} journeys={journeys} />
      </section>

      <FacetBrowser
        facets={PLACE_FACETS}
        items={placeItems()}
        placeholder="地名・市区町村・旧国名・曲名"
        emptyNote="条件に合う土地がありません。"
      />
    </IndexShell>
  )
}
