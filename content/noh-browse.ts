import type { BrowseItem, FacetDef } from '@/components/FacetBrowser'
import { getAllPlays } from '@/lib/noh-data'

/**
 * 249曲DBの Explore 用。Repository（型付き）だけを読み、ファセットと一覧項目に落とす。
 *
 * 設計方針（軸を絞る）：
 * - 生値をそのまま軸にしない。207種の主役型・複合の都道府県・単発タグは軸にならない。
 * - 各軸はせいぜい十数区分に収める。多いのは地域・都道府県だけ許す。
 * - 主役は「性質」7区分にまとめる（キーワード分類）。結末は正規化21区分。
 * - 意味タグは主題（Theme）だけを頻度順で出す。感情・状況などは検索語に残す。
 */

const STRUCTURE_ORDER = ['夢幻能', '現在能', '現在能的', '夢幻能的', '複合型', '儀式能']

const REGION_ORDER = [
  '東北', '関東', '中部', '近畿', '中国地方', '四国', '九州', '北海道', '大陸・海外', '異界',
]

const NATURE_ORDER = ['生者', '亡霊・霊', '神', '天人・仙', '鬼・異類', '天狗', '精']

const ENDING_ORDER = [
  '祝言', '救済', '和解', '再会', '帰還', '別離', '喪失', '未救済', '孤絶',
  '調伏・退治', '退散', '仇討', '臣従', '昇天', '覚醒', '執着', '鎮魂を願う', '救済を願う',
]

export const EXPLORE_FACETS: FacetDef[] = [
  { key: 'structure', label: '形式', labelEn: 'FORM', order: STRUCTURE_ORDER },
  { key: 'region', label: '地域', labelEn: 'REGION', order: REGION_ORDER },
  { key: 'nature', label: '主役の性質', labelEn: 'SHITE', order: NATURE_ORDER },
  { key: 'theme', label: '主題', labelEn: 'THEME', limit: 12, sortByCount: true },
  { key: 'ending', label: '結末', labelEn: 'ENDING', order: ENDING_ORDER, limit: 12 },
  { key: 'pref', label: '都道府県', labelEn: 'PREFECTURE', limit: 12 },
  { key: 'school', label: '流儀', labelEn: 'SCHOOL' },
  { key: 'status', label: '記事', labelEn: 'ARTICLE' },
]

const uniq = (a: (string | null | undefined)[]) => [...new Set(a.filter((x): x is string => Boolean(x)))]

/* ───────── 地域（都道府県 → 地方の8+区分） ───────── */
const PREF_REGION: Record<string, string> = {
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

/** 複合の都道府県（岐阜県・京都府）を分割して純粋な県の集合に */
function splitPrefs(prefs: (string | null)[]): string[] {
  return uniq(prefs.flatMap((p) => (p ? p.split('・') : [])))
}

/* ───────── 主役の性質（キーワード分類）
 * 型（typeRaw）を優先して判定する。状態の「神的・異類」だけで鬼側へ倒さない。
 * 神は鬼より先に見る（鬼神は鬼側でよい）。 */
function shiteNature(typeRaw: string | null, stateRaw: string | null): string | null {
  const t = typeRaw ?? ''
  const st = stateRaw ?? ''
  if (/亡霊|怨霊|幽霊|生霊|の霊|亡母|亡き|死者|霊$/.test(t) || /亡霊|怨霊|幽霊|生霊|死者|の霊/.test(st))
    return '亡霊・霊'
  if (/天狗/.test(t)) return '天狗'
  if (/天人|天女|仙人|仙女/.test(t)) return '天人・仙'
  if (/龍神|龍|明神|権現|女神|男神|雷神|山神|神霊|神の化身|明王|菩薩|弁才天|^神/.test(t)) return '神'
  if (/鬼|夜叉|妖怪|霊獣|大蛇|蛇|異類/.test(t)) return '鬼・異類'
  if (/の精|植物霊|花の精|松の精|精霊/.test(t)) return '精'
  if (/神/.test(st)) return '神'
  if (/異類/.test(st)) return '鬼・異類'
  if (t || st) return '生者'
  return null
}

/* ───────── 結末（正規化コード → 表示語） ───────── */
const ENDING_LABEL: Record<string, string> = {
  celebration: '祝言', salvation: '救済', reconciliation: '和解', vanishing: '消滅',
  'seek-salvation': '救済を願う', 'seek-repose': '鎮魂を願う', 'seek-memorial': '供養を願う',
  return: '帰還', separation: '別離', subjugation: '調伏・退治', dispersal: '退散',
  unsaved: '未救済', isolation: '孤絶', unresolved: '未決着', revenge: '仇討',
  reunion: '再会', ascension: '昇天', awakening: '覚醒', submission: '臣従',
  loss: '喪失', attachment: '執着',
}

const SEASON_LABEL: Record<string, string> = {
  spring: '春', summer: '夏', autumn: '秋', winter: '冬', 'new-year': '新春',
}

export function exploreItems(): BrowseItem[] {
  return getAllPlays().map((p) => {
    const prefs = splitPrefs(p.locations.map((l) => (l.prefectureState === 'known' ? l.prefecture : null)))
    const regions = uniq(prefs.map((pf) => PREF_REGION[pf]))
    const natures = uniq(
      p.characters.filter((c) => (c.role ?? '').includes('シテ')).map((c) => shiteNature(c.typeRaw, c.stateRaw)),
    )
    const themes = uniq(p.tags.filter((t) => t.category === 'Theme').map((t) => t.value))
    const endings = uniq((p.storyPattern?.endingCanonical ?? []).map((c) => ENDING_LABEL[c] ?? c))

    return {
      id: p.id,
      href: '/ja/plays/' + p.slug,
      title: p.title ?? p.id,
      romaji: p.titleEn ?? undefined,
      reading: p.titleKana ?? undefined,
      hook: buildHook(p),
      badge: p.publication.hasArticle ? '記事あり' : undefined,
      facets: {
        structure: uniq([p.nohStructure.label]),
        region: regions,
        nature: natures,
        theme: themes,
        ending: endings,
        pref: prefs,
        school: uniq(p.schools.map((s) => s.school)),
        status: [p.publication.hasArticle ? '記事あり' : '準備中'],
      },
      text: [
        p.title, p.titleKana, p.titleEn, p.author.label, p.period.label,
        ...p.characters.flatMap((c) => [c.name, c.typeRaw, c.stateRaw]),
        ...p.relationships.map((r) => r.typeRaw),
        ...p.locations.flatMap((l) => [l.historicalName, l.modernName, l.prefecture]),
        ...p.sources.map((s) => s.name),
        ...p.tags.map((t) => t.value), // 感情・状況・モチーフも検索語には残す
        ...(p.storyPattern?.steps ?? []),
        p.storyPattern?.endingRaw ?? '',
      ].filter(Boolean).join(' '),
    }
  })
}

/** 一覧の一文。自動要約はしない。構造データから機械的に、断定せずに組む。 */
function buildHook(p: ReturnType<typeof getAllPlays>[number]): string {
  const shite = p.characters.find((c) => (c.role ?? '').includes('シテ'))
  const parts: string[] = []
  if (p.nohStructure.label) parts.push(p.nohStructure.label)
  if (shite?.name) parts.push(`シテは${shite.name}`)
  const loc = p.locations[0]
  if (loc?.modernName || loc?.historicalName) parts.push(`舞台は${loc.modernName || loc.historicalName}`)
  if (p.seasonGeneral.length) parts.push(`${p.seasonGeneral.map((c) => SEASON_LABEL[c] ?? c).join('・')}の曲`)
  if (p.storyPattern?.endingRaw) parts.push(`結末は${p.storyPattern.endingRaw}`)
  return parts.join('／') || '構造データを整備中です。'
}
