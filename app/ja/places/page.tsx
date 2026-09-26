import type { Metadata } from 'next'
import { IndexShell } from '@/components/IndexShell'
import { PlacesMap } from '@/components/PlacesMap'
import { ReverseDirectory } from '@/components/noh/ReverseDirectory'
import { PLACES } from '@/content/places'
import { FEATURES } from '@/content/features'
import { placeDirectoryByRegion } from '@/content/reverse'

export const metadata: Metadata = {
  title: '土地',
  description: '地方・都道府県から、能の舞台になった土地の演目を引く。',
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

  const regions = placeDirectoryByRegion()

  return (
    <IndexShell
      label="PLACES"
      title="土地から"
      lede="旧国名ではなく、いまの地方と都道府県から探せます。県を選ぶと、その土地を舞台にする演目が出ます。能の舞台の多くは、行っても何も残っていません。その「何もなさ」も含めて土地は情報です。"
    >
      <section className="mb-16">
        <PlacesMap places={PLACES} journeys={journeys} />
        <p className="text-muted mt-3 font-sans text-micro">
          地図は特集で扱った土地を示します。下の一覧は、全249曲を都道府県から引くための索引です。
        </p>
      </section>

      <section>
        <div className="rule-top-strong flex items-baseline justify-between pt-3 pb-6">
          <span className="label label-ink font-semibold">PREFECTURE — 都道府県から</span>
          <span className="label">地域順</span>
        </div>
        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
          {regions.map((r) => (
            <div key={r.region}>
              <h3 className="border-rule-strong flex items-baseline justify-between border-t pt-2 pb-3">
                <span className="font-serif text-[1.0625rem]">{r.region}</span>
                <span className="label">{r.entries.length} 県</span>
              </h3>
              <ReverseDirectory entries={r.entries} cols={1} />
            </div>
          ))}
        </div>
      </section>
    </IndexShell>
  )
}
