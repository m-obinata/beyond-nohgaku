import type { Place } from '@/lib/types'

/**
 * PLACE — 現地を歩く（憲法 18・26）。
 *
 * 「こういう場所です」で終わらせない。
 * その土地で実際に見られるもの、授かれるもの、持ち帰れるものまで書く。
 * ただし観光広告にはしないので、なぜそれがそこにあるのかを必ず添える。
 */
export function PlaceGuide({ place }: { place: Place }) {
  const hasSites = place.sites && place.sites.length > 0
  const hasTakeaway = place.takeaway && place.takeaway.length > 0
  if (!hasSites && !hasTakeaway && !place.access) return null

  return (
    <div className="mt-8">
      <div className="border-rule-strong grid grid-cols-1 gap-x-10 gap-y-6 border-t pt-5 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="label label-ink font-semibold">いまの所在</p>
          <p className="mt-2 font-serif text-[1.0625rem]">{place.modernName}</p>
          {place.access && (
            <p className="mt-2 font-serif text-small text-muted">行き方 — {place.access}</p>
          )}
          {place.today && (
            <p className="mt-2 font-serif text-small text-muted">{place.today}</p>
          )}
        </div>

        {hasSites && (
          <div>
            <p className="label label-ink font-semibold">歩いて見られるもの</p>
            <ul className="mt-2">
              {place.sites!.map((s) => (
                <li key={s.name} className="border-rule border-t py-2.5 last:border-b">
                  <span className="block font-serif text-small">{s.name}</span>
                  <span className="mt-1 block font-serif text-micro text-muted">{s.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {hasTakeaway && (
        <div className="border-rule bg-paper mt-6 border px-5 py-5">
          <p className="label label-ink font-semibold">授かれるもの・持ち帰れるもの</p>
          <ul className="mt-2">
            {place.takeaway!.map((s) => (
              <li key={s.name} className="border-rule border-t py-2.5 last:border-b-0">
                <span className="block font-serif text-[1rem]">{s.name}</span>
                <span className="mt-1 block font-serif text-small text-muted">{s.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-rule-strong mt-5 border-t pt-3">
        <span className="label label-ink font-semibold">FIELDWORK — 現地取材：未</span>
        <p className="text-muted mt-1.5 font-sans text-micro">
          この案内は、地図・交通機関の公開情報・各施設の公表内容から構成しています。
          編集部はまだ現地を歩いていません。したがって、坂のきつさ、風の強さ、
          静けさといった体感は書いていません。取材したら、その旨をここに記します。
        </p>
        <p className="text-muted mt-2 font-sans text-micro">
          拝観・開館の時間や授与品の有無は変わります。出かける前に各施設の案内で確認してください。
        </p>
      </div>
    </div>
  )
}
