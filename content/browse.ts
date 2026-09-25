import type { BrowseItem, FacetDef } from '@/components/FacetBrowser'
import { PLAYS } from '@/content/plays'
import { PLACES, placeBySlug } from '@/content/places'
import { PEOPLE, personBySlug } from '@/content/people'
import { THEMES, themeBySlug } from '@/content/themes'
import { SOURCES } from '@/content/sources'
import { PLAY_ARTICLES } from '@/content/articles'
import { PERSON_NOTES, PLACE_NOTES } from '@/content/entity-notes'
import { FEATURES, featuresForPlace, featuresForPlay } from '@/content/features'

/**
 * 一覧・検索に渡す形への変換。
 *
 * ここが「どの軸で探せるか」の定義そのものになる。
 * 軸を足したいときはここと Entity の型を触る。画面側は触らない。
 */

const ERA_ORDER = ['平安以前', '平安', '源平の争乱', '鎌倉', '南北朝・室町', '時代を定めない'] as const
const REGION_ORDER = ['東北', '関東', '中部', '近畿', '中国', '四国', '九州', '広域'] as const
const SHITE_ORDER = ['武者', '女', '僧・山伏', '神・天人', '鬼・異類', '霊', '老人'] as const
const CATEGORY_ORDER = ['二番目物', '三番目物', '四番目物', '五番目物'] as const
const PLACE_KIND_ORDER = ['都市', '山', '川', '海・浦', '街道・関', '社寺', '島'] as const
const PERSON_KIND_ORDER = ['武将', '僧', '芸能者', '歌人', '為政者', '役人'] as const

/* ───────────────── 演目 ───────────────── */

export const PLAY_FACETS: FacetDef[] = [
  { key: 'era', label: '時代', labelEn: 'ERA', order: ERA_ORDER },
  { key: 'region', label: '地域', labelEn: 'REGION', order: REGION_ORDER },
  { key: 'theme', label: '主題', labelEn: 'THEME', limit: 8 },
  { key: 'person', label: '人物', labelEn: 'PEOPLE', limit: 8 },
  { key: 'shite', label: '主役', labelEn: 'SHITE', order: SHITE_ORDER },
  { key: 'form', label: '形式', labelEn: 'FORM' },
  { key: 'category', label: '分類', labelEn: 'CATEGORY', order: CATEGORY_ORDER },
  { key: 'feature', label: '特集', labelEn: 'FEATURE' },
  { key: 'status', label: '記事', labelEn: 'ARTICLE' },
]

export const playItems = (): BrowseItem[] =>
  PLAYS.map((p) => {
    const places = p.places.map(placeBySlug).filter(Boolean)
    const people = p.people.map(personBySlug).filter(Boolean)
    const themes = p.themes.map(themeBySlug).filter(Boolean)
    const features = featuresForPlay(p.slug)
    const hasArticle = Boolean(PLAY_ARTICLES[p.slug])

    return {
      id: 'play-' + p.slug,
      href: '/ja/plays/' + p.slug,
      title: p.name,
      romaji: p.romaji,
      hook: p.hook,
      meta: p.minutes ? `約 ${p.minutes} 分` : undefined,
      badge: hasArticle ? '記事あり' : undefined,
      facets: {
        era: [p.settingEra],
        region: [...new Set(places.map((x) => x!.regionModern))],
        theme: themes.map((t) => t!.name),
        person: people.map((x) => x!.name),
        shite: p.shiteType,
        form: [p.form],
        category: [p.category],
        feature: features.map((f) => f.short),
        status: [hasArticle ? '記事あり' : '準備中'],
      },
      text: [
        p.name,
        p.reading,
        p.romaji,
        p.hook,
        p.summary,
        p.author,
        p.category,
        p.composedEra,
        ...places.map((x) => x!.name + x!.modernName + x!.prefecture + x!.enLocation),
        ...people.map((x) => x!.name + (x!.reading ?? '')),
        ...themes.map((t) => t!.name),
      ].join(' '),
    }
  })

/* ───────────────── 土地 ───────────────── */

export const PLACE_FACETS: FacetDef[] = [
  { key: 'region', label: '地方', labelEn: 'REGION', order: REGION_ORDER },
  { key: 'pref', label: '都道府県', labelEn: 'PREFECTURE', limit: 10 },
  { key: 'kind', label: '土地の性格', labelEn: 'TYPE', order: PLACE_KIND_ORDER },
  { key: 'feature', label: '特集', labelEn: 'FEATURE' },
  { key: 'play', label: '演目', labelEn: 'PLAYS', limit: 8 },
  { key: 'status', label: '記事', labelEn: 'ARTICLE' },
]

export const placeItems = (): BrowseItem[] =>
  PLACES.map((p) => {
    const plays = p.plays.map((s) => PLAYS.find((x) => x.slug === s)).filter(Boolean)
    const features = featuresForPlace(p.slug)
    const hasArticle = Boolean(PLACE_NOTES[p.slug])

    return {
      id: 'place-' + p.slug,
      href: '/ja/places/' + p.slug,
      title: p.name,
      romaji: p.romaji,
      hook: p.summary,
      meta: 'いまの ' + p.modernName,
      badge: hasArticle ? '記事あり' : undefined,
      facets: {
        region: [p.regionModern],
        pref: p.prefecture === '—' ? [] : [p.prefecture],
        kind: [p.kind],
        feature: features.map((f) => f.short),
        play: plays.map((x) => x!.name),
        status: [hasArticle ? '記事あり' : '準備中'],
      },
      text: [
        p.name,
        p.reading,
        p.romaji,
        p.modernName,
        p.prefecture,
        p.region,
        p.enLocation,
        p.summary,
        p.today ?? '',
        ...(p.sites ?? []).map((s) => s.name),
        ...plays.map((x) => x!.name),
      ].join(' '),
    }
  })

/* ───────────────── 人物 ───────────────── */

export const PERSON_FACETS: FacetDef[] = [
  { key: 'kind', label: '立場', labelEn: 'ROLE', order: PERSON_KIND_ORDER },
  { key: 'era', label: '時代', labelEn: 'ERA', order: ERA_ORDER },
  { key: 'play', label: '登場する曲', labelEn: 'PLAYS', limit: 8 },
  { key: 'region', label: '地域', labelEn: 'REGION', order: REGION_ORDER },
  { key: 'status', label: '記事', labelEn: 'ARTICLE' },
]

export const personItems = (): BrowseItem[] =>
  PEOPLE.map((p) => {
    const plays = p.plays.map((s) => PLAYS.find((x) => x.slug === s)).filter(Boolean)
    const places = p.places.map(placeBySlug).filter(Boolean)
    const hasArticle = Boolean(PERSON_NOTES[p.slug])

    return {
      id: 'person-' + p.slug,
      href: '/ja/people/' + p.slug,
      title: p.name,
      reading: p.reading,
      hook: p.summary,
      meta: p.lifespan,
      badge: hasArticle ? '記事あり' : undefined,
      facets: {
        kind: [p.kind],
        era: [p.era],
        play: plays.map((x) => x!.name),
        region: [...new Set(places.map((x) => x!.regionModern))],
        status: [hasArticle ? '記事あり' : '準備中'],
      },
      text: [p.name, p.reading, p.role, p.summary, ...plays.map((x) => x!.name)].join(' '),
    }
  })

/* ───────────────── 横断検索 ───────────────── */

export const ALL_FACETS: FacetDef[] = [
  { key: 'type', label: '種別', labelEn: 'TYPE' },
  { key: 'era', label: '時代', labelEn: 'ERA', order: ERA_ORDER },
  { key: 'region', label: '地域', labelEn: 'REGION', order: REGION_ORDER },
  { key: 'theme', label: '主題', labelEn: 'THEME', limit: 8 },
  { key: 'feature', label: '特集', labelEn: 'FEATURE' },
]

export const allItems = (): BrowseItem[] => {
  const plays = playItems().map((i) => ({
    ...i,
    facets: { ...i.facets, type: ['演目'] },
  }))
  const places = placeItems().map((i) => ({
    ...i,
    facets: { ...i.facets, type: ['土地'] },
  }))
  const people = personItems().map((i) => ({
    ...i,
    facets: { ...i.facets, type: ['人物'] },
  }))

  const themes: BrowseItem[] = THEMES.map((t) => ({
    id: 'theme-' + t.slug,
    href: '/ja/themes/' + t.slug,
    title: t.name,
    hook: t.summary,
    meta: PLAYS.filter((p) => p.themes.includes(t.slug)).length + ' 曲',
    facets: {
      type: ['主題'],
      theme: [t.name],
    },
    text: [t.name, t.summary].join(' '),
  }))

  const sources: BrowseItem[] = SOURCES.map((s) => ({
    id: 'source-' + s.slug,
    href: '/ja/sources/' + s.slug,
    title: '『' + s.name + '』',
    romaji: s.romaji,
    hook: s.summary,
    meta: s.period,
    facets: { type: ['出典'] },
    text: [s.name, s.reading, s.romaji, s.period, s.summary].join(' '),
  }))

  const features: BrowseItem[] = FEATURES.map((f) => ({
    id: 'feature-' + f.slug,
    href: '/ja/features/' + f.slug,
    title: f.title,
    hook: f.subtitle,
    meta: f.number,
    facets: { type: ['特集'], feature: [f.short] },
    text: [f.title, f.subtitle, f.short, f.number].join(' '),
  }))

  return [...features, ...plays, ...places, ...people, ...themes, ...sources]
}
