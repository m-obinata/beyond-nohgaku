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

// 主役の種別（正体でまとめる。「武将の亡霊」は武将へ畳む＝亡霊は状態なので別扱いしない）
const KIND_ORDER = [
  '武将・武士', '貴人・王', '女性', '白拍子・遊女', '物狂', '母', '子ども',
  '僧・山伏', '神職・巫女', '歌人・文人', '老人・翁', '民・生業',
  '神', '龍神', '天人・天女', '鬼', '天狗', '妖怪・異類', '草木の精',
]

const ENDING_ORDER = [
  '祝言', '救済', '和解', '再会', '帰還', '別離', '喪失', '未救済', '孤絶',
  '調伏・退治', '退散', '仇討', '臣従', '昇天', '覚醒', '執着', '鎮魂を願う', '救済を願う',
]

const SEASON_ORDER = ['新春', '春', '夏', '秋', '冬', '無季']
const MONTH_ORDER = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

/**
 * Explore は「演目そのものの性質」で絞る軸だけを出す。
 * 土地・人物・主題・出典からの逆引きは、それぞれの索引ページ（/ja/places 等）に任せる。
 * ただし各演目の facets にはこれらの値も持たせてあるので、分析（かけ合わせ）からの
 * ドリルや共有URL（?theme=… 等）はそのまま絞り込みとして効く（FacetBrowser 側で対応）。
 */
export const EXPLORE_FACETS: FacetDef[] = [
  { key: 'structure', label: '形式', labelEn: 'FORM', order: STRUCTURE_ORDER },
  { key: 'season', label: '季節', labelEn: 'SEASON', order: SEASON_ORDER },
  {
    key: 'month', label: '月', labelEn: 'MONTH', order: MONTH_ORDER, limit: 12, scoped: true,
    note: '季節を選ぶと、その季節の月に絞れます（流儀の上演月）',
  },
  { key: 'author', label: '作者', labelEn: 'AUTHOR', limit: 12, sortByCount: true },
  { key: 'kind', label: '主役の種別', labelEn: 'SHITE', order: KIND_ORDER, limit: 14 },
  { key: 'emotion', label: '感情', labelEn: 'EMOTION', limit: 10, sortByCount: true },
  { key: 'situation', label: '状況', labelEn: 'SITUATION', limit: 10, sortByCount: true },
  { key: 'motif', label: 'モチーフ', labelEn: 'MOTIF', limit: 10, sortByCount: true },
  { key: 'experience', label: '経験', labelEn: 'EXPERIENCE', limit: 10, sortByCount: true },
  { key: 'ending', label: '結末', labelEn: 'ENDING', order: ENDING_ORDER, limit: 12 },
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

/* ───────── 主役の種別（正体で約20区分に分類）
 * typeRaw を優先。亡霊/化身などの状態語は無視して正体でまとめる。
 * 順序が優先度。人でないもの（神・鬼・天狗・精）を先に判定し、次に人の種別。 */
function shiteKind(typeRaw: string | null, stateRaw: string | null): string | null {
  const t = typeRaw ?? ''
  const st = stateRaw ?? ''
  // 人でないもの
  if (/天狗/.test(t)) return '天狗'
  if (/天人|天女|仙人|仙女/.test(t)) return '天人・天女'
  if (/龍神|龍女|龍/.test(t)) return '龍神'
  if (/明神|権現|女神|男神|雷神|山神|明王|菩薩|弁才天|神霊|神の化身|^神|・神|神$/.test(t)) return '神'
  if (/鬼(?!界)|夜叉/.test(t)) return '鬼'
  if (/妖怪|霊獣|大蛇|蛇|土蜘蛛|異類|化生/.test(t)) return '妖怪・異類'
  if (/の精|植物霊|花の精|松の精|草木|精霊|木の/.test(t)) return '草木の精'
  // 人（正体）
  if (/物狂|狂女|狂人/.test(t)) return '物狂'
  if (/白拍子|遊女|傀儡/.test(t)) return '白拍子・遊女'
  if (/僧|山伏|法師|尼|聖|沙門/.test(t)) return '僧・山伏'
  if (/神職|巫女|禰宜|宮司/.test(t)) return '神職・巫女'
  if (/歌人|歌詠|文人|詩人/.test(t)) return '歌人・文人'
  if (/武将|武士|武者|軍|兵(?!衛)|侍/.test(t)) return '武将・武士'
  if (/皇帝|天皇|帝|王|貴族|大臣|公卿|上皇|院|内親王|后/.test(t)) return '貴人・王'
  if (/老女|老人|翁|媼|老/.test(t)) return '老人・翁'
  if (/母/.test(t)) return '母'
  if (/子(?!細)|少年|童|若君|稚児|幼/.test(t)) return '子ども'
  if (/女|娘|妻|姫|侍女|上臈|息女/.test(t)) return '女性'
  if (/漁師|海人|海士|樵|農|商|職人|庭守|馬|駒|船頭|里人|従者|下人|工|守/.test(t)) return '民・生業'
  // typeRaw で決まらないときは state を最後に見る
  if (/神/.test(st)) return '神'
  if (/異類/.test(st)) return '妖怪・異類'
  if (t || st) return '民・生業'
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

/* ───────── 季節（正規化コード → 表示語。無い場合は無季） ───────── */
function playSeasons(p: ReturnType<typeof getAllPlays>[number]): string[] {
  const s = p.seasonGeneral.map((c) => SEASON_LABEL[c] ?? c)
  return s.length ? [...new Set(s)] : ['無季']
}

/* ───────── 月（流儀ごとの上演月。schools[].season の「N月」を拾う） ───────── */
function playMonths(p: ReturnType<typeof getAllPlays>[number]): string[] {
  const z2h = (x: string) => x.replace(/[０-９]/g, (d) => String('０１２３４５６７８９'.indexOf(d)))
  const ms = new Set<string>()
  for (const s of p.schools) {
    const m = (s.season ? z2h(s.season) : '').match(/(\d{1,2})月/)
    if (m) ms.add(m[1] + '月')
  }
  return [...ms]
}

/* ───────── 作者（表記ゆれを主要人物へ寄せる。不詳・要確認は軸に出さない） ───────── */
const AUTHOR_FIGURES: [RegExp, string][] = [
  [/観阿弥/, '観阿弥'],
  [/世阿弥/, '世阿弥'],
  [/観世元雅|元雅/, '観世元雅'],
  [/観世小次郎信光|信光/, '観世信光'],
  [/金春禅竹|禅竹/, '金春禅竹'],
  [/宮増/, '宮増'],
  [/土岐善麿/, '土岐善麿'],
  [/榎並左衛門/, '榎並左衛門'],
]
function playAuthors(p: ReturnType<typeof getAllPlays>[number]): string[] {
  const raw = p.author.label
  if (!raw || /不詳|要確認/.test(raw)) return []
  const out: string[] = []
  for (const [re, name] of AUTHOR_FIGURES) if (re.test(raw)) out.push(name)
  return [...new Set(out)]
}

/* ───────── 原典（出典名 → 主要な作品・典拠にまとめる） ─────────
 * 「能楽協会 曲目データベース」等は出典メタなので原典に数えない。 */
const SOURCE_WORKS: [RegExp, string][] = [
  [/源氏物語|源氏/, '源氏物語'],
  [/平家物語|平家/, '平家物語'],
  [/伊勢物語/, '伊勢物語'],
  [/太平記/, '太平記'],
  [/曽我/, '曽我物語'],
  [/義経記|義経伝説|義経|牛若/, '義経記・義経伝説'],
  [/古今|新古今|勅撰|和歌集|百人一首|和歌/, '和歌・勅撰集'],
  [/日本書紀|古事記|風土記|記紀|神話/, '記紀・神話'],
  [/邯鄲|荘子|項羽|白楽天|漢籍|漢/, '漢籍・中国故事'],
  [/縁起/, '寺社縁起'],
  [/説話|宇治拾遺|今昔|沙石集/, '説話'],
  [/伝説|伝承/, '伝承・伝説'],
]
const SOURCE_EXCLUDE = /能楽協会|曲目データ|曲目DB|国立国会|レファレンス/
function sourceWorks(names: (string | null)[]): string[] {
  const out: string[] = []
  for (const n of names) {
    if (!n || SOURCE_EXCLUDE.test(n)) continue
    for (const [re, label] of SOURCE_WORKS) {
      if (re.test(n)) { out.push(label); break }
    }
  }
  return [...new Set(out)]
}

/* ───────── 主な人物（複数の曲に登場する固有名） ─────────
 * 全249曲を走査し、2曲以上に出る固有名を集める。総称（都の僧・帝の臣下等）は除く。
 * 同一人物の別名は代表名へ寄せる。 */
const PERSON_ALIAS: Record<string, string> = {
  牛若丸: '源義経', 西行法師: '西行',
}
const personName = (n: string) => PERSON_ALIAS[n] ?? n
const GENERIC_SUFFIX = /(僧|山伏|神職|衆徒|巫女|廷臣|臣下|尉|女|男|妻|母|童子|従者|里人|供|精|霊|神|人)$/
const GENERIC_EXACT = new Set(['帝', '皇帝', '龍女', '天女', '天人', '鬼', '龍神', '老人', '老女', '勅使', '廷臣', '官人', '大臣', '公卿'])
function isGenericName(n: string): boolean {
  if (n.length <= 1) return true
  if (n.includes('の')) return true // 「都の僧」「帝の臣下」「富士の妻」など役柄表現
  if (GENERIC_EXACT.has(n)) return true
  if (GENERIC_SUFFIX.test(n)) return true
  return false
}

/** 2曲以上に登場する固有名の集合（モジュール初期化時に一度だけ計算） */
const NOTABLE_PEOPLE: Set<string> = (() => {
  const count = new Map<string, number>()
  for (const p of getAllPlays()) {
    const seen = new Set<string>()
    for (const c of p.characters) {
      if (!c.name) continue
      const name = personName(c.name)
      if (isGenericName(name) || seen.has(name)) continue
      seen.add(name)
      count.set(name, (count.get(name) ?? 0) + 1)
    }
  }
  return new Set([...count.entries()].filter(([, v]) => v >= 2).map(([k]) => k))
})()

function playPeople(p: ReturnType<typeof getAllPlays>[number]): string[] {
  return uniq(p.characters.map((c) => (c.name ? personName(c.name) : null)).filter((n) => n && NOTABLE_PEOPLE.has(n)))
}

/** 役を短く。舞台に出ない人物は「言及」と明示する（玄人向けの但し書き） */
export function roleShort(role: string | null): string {
  const r = role ?? ''
  if (/不在|回想|非登場|象徴|憑依/.test(r)) return '言及'
  if (/子方/.test(r)) return '子方'
  if (/シテ/.test(r)) return 'シテ'
  if (/ワキ/.test(r)) return 'ワキ'
  if (/ツレ/.test(r)) return 'ツレ'
  if (/アイ/.test(r)) return 'アイ'
  return r || '—'
}

/** 「この曲での主な人物とその役」。頼光=ワキ、葵上=言及、のように玄人の突っ込みを先回りする */
function castLine(p: ReturnType<typeof getAllPlays>[number]): string | undefined {
  const seen = new Set<string>()
  const parts: string[] = []
  for (const c of p.characters) {
    if (!c.name) continue
    const name = personName(c.name)
    if (!NOTABLE_PEOPLE.has(name) || seen.has(name)) continue
    seen.add(name)
    parts.push(`${name}〈${roleShort(c.role)}〉`)
  }
  return parts.length ? '主な人物　' + parts.join('・') : undefined
}

export function exploreItems(): BrowseItem[] {
  return getAllPlays().map((p) => {
    const prefs = splitPrefs(p.locations.map((l) => (l.prefectureState === 'known' ? l.prefecture : null)))
    const regions = uniq(prefs.map((pf) => PREF_REGION[pf]))
    const kinds = uniq(
      p.characters.filter((c) => (c.role ?? '').includes('シテ')).map((c) => shiteKind(c.typeRaw, c.stateRaw)),
    )
    const tagVals = (cat: string) => uniq(p.tags.filter((t) => t.category === cat).map((t) => t.value))
    const endings = uniq((p.storyPattern?.endingCanonical ?? []).map((c) => ENDING_LABEL[c] ?? c))

    return {
      id: p.id,
      href: '/ja/plays/' + p.slug,
      title: p.title ?? p.id,
      romaji: p.titleEn ?? undefined,
      reading: p.titleKana ?? undefined,
      hook: buildHook(p),
      subline: castLine(p),
      badge: p.publication.hasArticle ? '記事あり' : undefined,
      facets: {
        structure: uniq([p.nohStructure.label]),
        season: playSeasons(p),
        month: playMonths(p),
        author: playAuthors(p),
        region: regions,
        kind: kinds,
        person: playPeople(p),
        source: sourceWorks(p.sources.map((s) => s.name)),
        theme: tagVals('Theme'),
        emotion: tagVals('Emotion'),
        situation: tagVals('Situation'),
        motif: tagVals('Motif'),
        experience: tagVals('Experience'),
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
