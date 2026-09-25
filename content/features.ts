import type { Journey } from '@/lib/types'
import { FEATURE_YOSHITSUNE, chapters } from '@/content/feature-yoshitsune'
import { JOURNEY_YOSHITSUNE } from '@/content/journey-yoshitsune'

/**
 * 特集のレジストリ。
 *
 * 特集は、タグ付けされた記事を一貫した切り口でグルーピングしたものと捉える。
 * したがって「どの特集に属するか」自体がひとつのファセットになるし、
 * 地図の上では重ねたり外したりできるレイヤーになる。
 *
 * 企画だけ決まっていて未着手のものも、ここに枠として置いておく。
 * 準備中の特集は、地図のレイヤーにも絞り込みの軸にも出さない
 * （placeSlugs / playSlugs が空なので、自然に現れない）。
 */

/** 思想軸。カテゴリーではなく、日本文化を読み解くための切り口（憲法 4）。 */
export const AXES = [
  { key: '歴史と物語', question: '実在した人物や事件は、後世にどう作り替えられたか。' },
  { key: '死者と記憶', question: '死者はなぜ舞台に戻ってくるのか。' },
  { key: '文学と再解釈', question: '既存の文学作品は、能によってどう読み替えられたか。' },
  { key: '王権と周縁', question: '中央から見た「外側の人々」は、どう描かれたか。' },
  { key: 'カミ・仏・異類', question: '超常的な存在を、どう分類し、翻訳し、土着化したか。' },
  { key: '土地と旅', question: '物語は、なぜこの土地に結びついたのか。' },
  { key: '芸能・音楽・身体', question: '能は、どのような身体・音・時間の構造を持つか。' },
  { key: '生業・季節・共同体', question: '農業・祭礼・共同体と芸能は、どう関係したか。' },
  { key: '家族・親子・家', question: '中世社会において、家族とは何だったのか。' },
  { key: '語る者・作る者・見る者', question: '誰が、誰に向かって、この物語を語ったのか。' },
] as const

export type AxisKey = (typeof AXES)[number]['key']

export interface FeatureRef {
  slug: string
  number: string
  /** 一覧や絞り込みに出す短い名前 */
  short: string
  title: string
  subtitle: string
  lede: string
  status: '公開' | '準備中'
  axes: AxisKey[]
  /** 扱う予定の演目・主題。準備中の特集では、企画の骨格にあたる。 */
  topics: string[]
  journey?: Journey
  /** この特集が扱う土地。準備中のあいだは空にしておく。 */
  placeSlugs: string[]
  /** この特集が扱う演目。準備中のあいだは空にしておく。 */
  playSlugs: string[]
}

export const FEATURES: FeatureRef[] = [
  {
    slug: FEATURE_YOSHITSUNE.slug,
    number: FEATURE_YOSHITSUNE.number,
    short: '義経と弁慶',
    title: FEATURE_YOSHITSUNE.title,
    subtitle: FEATURE_YOSHITSUNE.subtitle,
    lede: FEATURE_YOSHITSUNE.lede.join(' '),
    status: '公開',
    axes: ['歴史と物語', '土地と旅'],
    topics: ['鞍馬天狗', '橋弁慶', '烏帽子折', '熊坂', '八島', '正尊', '船弁慶', '吉野静', '安宅', '摂待', '錦戸'],
    journey: JOURNEY_YOSHITSUNE,
    placeSlugs: [...new Set(chapters.map((c) => c.placeSlug))],
    playSlugs: chapters.flatMap((c) => c.plays.map((p) => p.slug).filter(Boolean) as string[]),
  },

  {
    slug: 'genji-to-noh',
    number: 'FEATURE 02',
    short: '源氏物語と能',
    title: '源氏物語の女たちは、死後に何を語ったのか。',
    subtitle: '能に読み替えられた『源氏物語』',
    lede: '能になった『源氏物語』は、原作とはずいぶん違う顔をしています。作者たちが拾ったのは筋ではなく、原作では語られなかった側の声ではないでしょうか。',
    status: '準備中',
    axes: ['文学と再解釈', '死者と記憶'],
    topics: ['葵上', '半蔀', '玉鬘', '浮舟', '野宮', '須磨源氏', '源氏供養'],
    placeSlugs: [],
    playSlugs: [],
  },

  {
    slug: 'oken-no-sotogawa',
    number: 'FEATURE 03',
    short: '王権の外側',
    title: '周縁の民は、どうやって鬼になったのか。',
    subtitle: '土蜘蛛・国栖・山人をめぐって',
    lede: '中央から見た「外側の人々」は、排除され、神格化され、異類にされました。「従わない者イコール妖怪」と単純に読むと、大事なところを取り落とします。',
    status: '準備中',
    axes: ['王権と周縁'],
    topics: ['土蜘蛛', '国栖', '葛城', '山人', '鬼', '天狗'],
    placeSlugs: [],
    playSlugs: [],
  },

  {
    slug: 'kami-no-yurai',
    number: 'FEATURE 04',
    short: 'カミの由来',
    title: 'カミは、どこから来て、何者になったのか。',
    subtitle: '海を渡り、土地と出会い、姿を変えた神々',
    lede: 'インドや中国から渡ってきた神格が、この土地で名前も姿も変えていきます。神仏習合という一語では足りません。',
    status: '準備中',
    axes: ['カミ・仏・異類'],
    topics: ['賀茂', '三輪', '竹生島', '春日龍神', '弁才天', '七福神', '龍神', '権現'],
    placeSlugs: [],
    playSlugs: [],
  },

  {
    slug: 'yurei-no-tanjo',
    number: 'FEATURE 05',
    short: '幽霊の誕生',
    title: '幽霊は、いかにして生まれたのか。',
    subtitle: '日本人は死者をどう語ってきたか',
    lede: '幽霊は怪異である前に、死者をもう一度「その人」に戻すための装置だったのではないか。夢幻能から怪談まで、語りの形を追います。',
    status: '準備中',
    axes: ['死者と記憶'],
    topics: ['祖霊', '怨霊', '亡霊', '夢幻能', '修羅能', '供養', '成仏', '怪談'],
    placeSlugs: [],
    playSlugs: [],
  },

  {
    slug: 'bushi-to-noh',
    number: 'FEATURE 06',
    short: '武士と能',
    title: '武士は、なぜ能を必要としたのか。',
    subtitle: '戦乱・死者・教養から読む能楽史',
    lede: '自分たちが地獄へ落ちる芝居を、武士は繰り返し観ました。勝っても救われない話が、なぜ武家に好まれたのでしょうか。',
    status: '準備中',
    axes: ['語る者・作る者・見る者', '死者と記憶'],
    topics: ['敦盛', '清経', '忠度', '頼政', '実盛', '修羅道', '和歌', '武家教養', '式楽'],
    placeSlugs: [],
    playSlugs: [],
  },

  {
    slug: 'tsumi-to-sukui',
    number: 'FEATURE 07',
    short: '罪と救済',
    title: '生きるために獣を殺した猟師は、なぜ地獄へ行くのか。',
    subtitle: '能に描かれた罪・業・救済',
    lede: '殺生を戒める教えと、生きるために殺す生活。この矛盾を、能はごまかさずに舞台へ載せました。',
    status: '準備中',
    axes: ['カミ・仏・異類', '死者と記憶'],
    topics: ['善知鳥', '鵜飼', '卒都婆小町', '俊寛', '修羅能'],
    placeSlugs: [],
    playSlugs: [],
  },

  {
    slug: 'na-mo-naki-hitobito',
    number: 'FEATURE 08',
    short: '名もなき人々',
    title: '名もなき人々は、なぜ能の主人公になったのか。',
    subtitle: '家族・別離・旅から読む中世社会',
    lede: '子を探して歩く母、狂って旅をする女。能の主人公には、歴史に名前の残らない人がたくさんいます。',
    status: '準備中',
    axes: ['家族・親子・家'],
    topics: ['隅田川', '百万', '三井寺', '桜川', '砧'],
    placeSlugs: [],
    playSlugs: [],
  },

  {
    slug: 'ta-kara-butai-e',
    number: 'FEATURE 09',
    short: '田から舞台へ',
    title: '田の神事は、どうやって舞台になったのか。',
    subtitle: '稲作・祭礼・田楽から能楽を考える',
    lede: '田楽から猿楽、そして能へ。一直線の進化として語られがちですが、実際はもっと入り組んでいます。',
    status: '準備中',
    axes: ['生業・季節・共同体', '芸能・音楽・身体'],
    topics: ['稲作', '田遊び', '田楽', '猿楽', '神事芸能', '初番目物', '五穀豊穣'],
    placeSlugs: [],
    playSlugs: [],
  },

  {
    slug: 'hito-narazaru-mono',
    number: 'FEATURE 10',
    short: '人ならざるもの',
    title: '人ならざるものは、何のために舞台へ現れるのか。',
    subtitle: '神、鬼、天狗、龍',
    lede: '能の舞台には、人でないものが頻繁に出てきます。何のために呼び出されるのかを、種類ごとに見ていきます。',
    status: '準備中',
    axes: ['カミ・仏・異類', '王権と周縁'],
    topics: ['神', '鬼', '天狗', '龍', '異類'],
    placeSlugs: [],
    playSlugs: [],
  },

  {
    slug: 'dare-ga-tsukutta-noka',
    number: 'FEATURE 11',
    short: '誰が作ったのか',
    title: '誰が、誰に向けて、この物語を作ったのか。',
    subtitle: '能作者・能楽師・パトロン・観客',
    lede: '能は芸術家の個人的な創作ではありません。座があり、パトロンがあり、競争があり、市場がありました。',
    status: '準備中',
    axes: ['語る者・作る者・見る者'],
    topics: ['観阿弥', '世阿弥', '足利義満', '義持', '義教', '座', '寺社', '武家', '芸能市場'],
    placeSlugs: [],
    playSlugs: [],
  },
]

export const featureBySlug = (slug: string) => FEATURES.find((f) => f.slug === slug)

export const PUBLISHED_FEATURES = FEATURES.filter((f) => f.status === '公開')
export const PLANNED_FEATURES = FEATURES.filter((f) => f.status === '準備中')

/** その土地・演目を扱っている特集（複数ありうる） */
export const featuresForPlace = (slug: string) =>
  FEATURES.filter((f) => f.placeSlugs.includes(slug))
export const featuresForPlay = (slug: string) =>
  FEATURES.filter((f) => f.playSlugs.includes(slug))

/** ある思想軸を扱う特集 */
export const featuresForAxis = (axis: AxisKey) =>
  FEATURES.filter((f) => (f.axes as readonly string[]).includes(axis))
