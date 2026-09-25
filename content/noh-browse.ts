import type { BrowseItem, FacetDef } from '@/components/FacetBrowser'
import { getAllPlays } from '@/lib/noh-data'

/**
 * 249曲DBの Explore 用。Repository（型付き）だけを読み、ファセットと一覧項目に落とす。
 * ファセットは TAG だけでなく、人物・関係・土地・典拠・構造・流儀から横断で作る（憲法/指示書 12.2）。
 * 生値ではなく正規化済みの値を軸に使い、未整備（canonical=null）は軸に出さない。
 * ただし自由語検索では生値も対象にする。
 */

const STRUCTURE_ORDER = ['夢幻能', '現在能', '現在能的', '夢幻能的', '複合型', '儀式能']

export const EXPLORE_FACETS: FacetDef[] = [
  { key: 'structure', label: '形式', labelEn: 'FORM', order: STRUCTURE_ORDER },
  { key: 'pref', label: '都道府県', labelEn: 'PREFECTURE', limit: 10 },
  { key: 'shite', label: '主役の型', labelEn: 'SHITE TYPE', limit: 10 },
  { key: 'theme', label: '主題', labelEn: 'THEME', limit: 10 },
  { key: 'emotion', label: '感情', labelEn: 'EMOTION', limit: 8 },
  { key: 'ending', label: '結末', labelEn: 'ENDING', limit: 8 },
  { key: 'school', label: '流儀', labelEn: 'SCHOOL' },
  { key: 'status', label: '記事', labelEn: 'ARTICLE' },
]

/** 4状態の表示語（DBと同じ規約） */
const nonEmpty = (a: (string | null)[]) => [...new Set(a.filter((x): x is string => Boolean(x)))]

/** 人物型・関係型の canonical は英語コードなので、表示は生値（typeRaw）の代表を使う */
export function exploreItems(): BrowseItem[] {
  return getAllPlays().map((p) => {
    const prefs = nonEmpty(p.locations.map((l) => (l.prefectureState === 'known' ? l.prefecture : null)))
    // 主役の型：シテ／前シテ等の character_type 生値（辞書化されていれば raw を代表に）
    const shiteTypes = nonEmpty(
      p.characters
        .filter((c) => (c.role ?? '').includes('シテ'))
        .map((c) => c.typeRaw),
    )
    const tagVals = (cat: string) => nonEmpty(p.tags.filter((t) => t.category === cat).map((t) => t.value))
    const endings = nonEmpty([p.storyPattern?.endingRaw ?? null])

    return {
      id: p.id,
      href: '/ja/plays/' + p.slug,
      title: p.title ?? p.id,
      romaji: p.titleEn ?? undefined,
      reading: p.titleKana ?? undefined,
      hook: buildHook(p),
      badge: p.publication.hasArticle ? '記事あり' : undefined,
      facets: {
        structure: nonEmpty([p.nohStructure.label]),
        pref: prefs,
        shite: shiteTypes,
        theme: tagVals('Theme'),
        emotion: tagVals('Emotion'),
        ending: endings,
        school: nonEmpty(p.schools.map((s) => s.school)),
        status: [p.publication.hasArticle ? '記事あり' : '準備中'],
      },
      text: [
        p.title, p.titleKana, p.titleEn,
        p.author.label, p.period.label,
        ...p.characters.flatMap((c) => [c.name, c.typeRaw, c.stateRaw]),
        ...p.relationships.map((r) => r.typeRaw),
        ...p.locations.flatMap((l) => [l.historicalName, l.modernName, l.prefecture]),
        ...p.sources.map((s) => s.name),
        ...p.tags.map((t) => t.value),
        (p.storyPattern?.steps ?? []).join(' '),
        p.storyPattern?.endingRaw ?? '',
      ]
        .filter(Boolean)
        .join(' '),
    }
  })
}

/**
 * 一覧の一文。自動要約はしない（記事本文由来の summary は既定で非公開）。
 * 構造データから機械的に組み立て、断定文にしない。
 */
function buildHook(p: ReturnType<typeof getAllPlays>[number]): string {
  const shite = p.characters.find((c) => (c.role ?? '').includes('シテ'))
  const parts: string[] = []
  if (p.nohStructure.label) parts.push(p.nohStructure.label)
  if (shite?.name) parts.push(`シテは${shite.name}`)
  const loc = p.locations[0]
  if (loc?.modernName || loc?.historicalName) parts.push(`舞台は${loc.modernName || loc.historicalName}`)
  if (p.storyPattern?.endingRaw) parts.push(`結末は${p.storyPattern.endingRaw}`)
  return parts.join('／') || '構造データを整備中です。'
}
