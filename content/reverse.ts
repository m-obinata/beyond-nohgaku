import { exploreItems } from '@/content/noh-browse'

/**
 * 逆引き（値 → その値を持つ演目）。
 *
 * 人物・土地・主題・出典は Explore の軸から外し、ここを受け皿にする。
 * 各値は Explore の絞り込みへ深リンクする（?person=… など）。
 * 演目一覧側で役（シテ/ワキ/言及）が付くので、「役つきで出る」はそこで満たす。
 */

export interface DirEntry {
  value: string
  count: number
  href: string
}

const REGION_ORDER = [
  '東北', '関東', '中部', '近畿', '中国地方', '四国', '九州', '北海道', '大陸・海外', '異界',
]

function countBy(key: string): Map<string, number> {
  const m = new Map<string, number>()
  for (const it of exploreItems()) {
    for (const v of it.facets[key] ?? []) m.set(v, (m.get(v) ?? 0) + 1)
  }
  return m
}

const href = (key: string, value: string) =>
  `/ja/explore?${key}=${encodeURIComponent(value)}`

const sorted = (m: Map<string, number>, key: string): DirEntry[] =>
  [...m.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
    .map(([value, count]) => ({ value, count, href: href(key, value) }))

/** 主な人物（2曲以上に登場。exploreItems の person 軸がすでにその条件） */
export function peopleDirectory(): DirEntry[] {
  return sorted(countBy('person'), 'person')
}

/** 主題（Theme タグ） */
export function themeDirectory(): DirEntry[] {
  return sorted(countBy('theme'), 'theme')
}

/** 原典（主要作品にまとめたもの） */
export function sourceDirectory(): DirEntry[] {
  return sorted(countBy('source'), 'source')
}

/** 都道府県を地域ごとにまとめた逆引き */
export function placeDirectoryByRegion(): { region: string; entries: DirEntry[] }[] {
  const items = exploreItems()
  const byRegion = new Map<string, Map<string, number>>()
  for (const it of items) {
    const regions = it.facets['region'] ?? []
    const prefs = it.facets['pref'] ?? []
    for (const r of regions) {
      if (!byRegion.has(r)) byRegion.set(r, new Map())
    }
    // 県を、その県が属する地域の下にぶら下げる
    for (const p of prefs) {
      const r = PREF_TO_REGION[p]
      if (!r) continue
      if (!byRegion.has(r)) byRegion.set(r, new Map())
      const inner = byRegion.get(r)!
      inner.set(p, (inner.get(p) ?? 0) + 1)
    }
  }
  return REGION_ORDER.filter((r) => byRegion.has(r) && byRegion.get(r)!.size > 0).map((r) => ({
    region: r,
    entries: sorted(byRegion.get(r)!, 'pref'),
  }))
}

// 逆引きの地域まとめ用（noh-browse と同じ対応。ここでは県→地域だけ必要）
const PREF_TO_REGION: Record<string, string> = {
  北海道: '北海道',
  青森県: '東北', 岩手県: '東北', 宮城県: '東北', 秋田県: '東北', 山形県: '東北', 福島県: '東北',
  茨城県: '関東', 栃木県: '関東', 群馬県: '関東', 埼玉県: '関東', 千葉県: '関東', 東京都: '関東', 神奈川県: '関東',
  新潟県: '中部', 富山県: '中部', 石川県: '中部', 福井県: '中部', 山梨県: '中部', 長野県: '中部',
  岐阜県: '中部', 静岡県: '中部', 愛知県: '中部',
  三重県: '近畿', 滋賀県: '近畿', 京都府: '近畿', 大阪府: '近畿', 兵庫県: '近畿', 奈良県: '近畿', 和歌山県: '近畿',
  鳥取県: '中国地方', 島根県: '中国地方', 岡山県: '中国地方', 広島県: '中国地方', 山口県: '中国地方',
  徳島県: '四国', 香川県: '四国', 愛媛県: '四国', 高知県: '四国',
  福岡県: '九州', 佐賀県: '九州', 長崎県: '九州', 熊本県: '九州', 大分県: '九州', 宮崎県: '九州', 鹿児島県: '九州', 沖縄県: '九州',
  中国: '大陸・海外', インド: '大陸・海外',
  海中世界: '異界', 海中: '異界',
}
