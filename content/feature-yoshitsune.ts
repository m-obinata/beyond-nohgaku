/** FEATURE 01（指示書 11・25・26） */

export interface FeatureChapter {
  no: string
  place: string
  placeSlug: string
  romaji: string
  plays: { name: string; slug?: string }[]
  summary: string
  status: '公開' | '準備中'
}

export const FEATURE_YOSHITSUNE = {
  slug: 'yoshitsune-benkei',
  number: 'FEATURE 01',
  title: '義経は、どのように義経になったのか。',
  subtitle: '弁慶とたどる、鞍馬から平泉への旅',
  lede: [
    '英雄だったから物語になったのか。物語になったから英雄になったのか。',
    '史実の源義経と、後世に作られた義経像。鞍馬から平泉まで、能楽と土地をたどりながら考える。',
  ],
  cta: '旅をはじめる',
  /** 特集全体で追う問い（指示書 26） */
  questions: [
    {
      key: '史実',
      en: 'HISTORY',
      body: '実際の義経について、同時代の史料から何が確認できるのか。確認できるのは、意外なほど短い期間に限られています。',
    },
    {
      key: '物語',
      en: 'STORY',
      body: '後世の物語は、どの部分を作り足したのか。足されたのは合戦ではなく、少年期と逃亡期でした。',
    },
    {
      key: '人物像',
      en: 'CHARACTER',
      body: '義経と弁慶の人物像は、どう作られたのか。弁慶はほとんど、あとから書かれた人物です。',
    },
    {
      key: '政治',
      en: 'POLITICS',
      body: '頼朝との対立は、兄弟の感情としてではなく、鎌倉と京という二つの権力の関係として読める。',
    },
    {
      key: '地理',
      en: 'GEOGRAPHY',
      body: '義経はどのように日本列島を移動したのか。西へ、そして北へ。移動の形そのものが、物語の形になりました。',
    },
    {
      key: '芸能',
      en: 'PERFORMANCE',
      body: '能楽はどの場面を選び、何を変えたのか。選ばれたのは勝った場面ではなく、その多くが別れと逃亡の場面です。',
    },
    {
      key: '受容',
      en: 'RECEPTION',
      body: 'なぜ義経は繰り返し物語化されたのか。問いは「義経とは誰だったのか」から、「日本人は義経を何者にしてきたのか」へ移る。',
    },
  ],
  chapters: [
    {
      no: '01',
      place: '鞍馬',
      placeSlug: 'kurama',
      romaji: 'KURAMA',
      plays: [{ name: '鞍馬天狗', slug: 'kurama-tengu' }],
      summary: '牛若丸が預けられた山寺です。この時期の記録は何も残っておらず、物語は空白を埋めるために、天狗という最初の師をあてがいました。',
      status: '公開',
    },
    {
      no: '02',
      place: '五条',
      placeSlug: 'gojo',
      romaji: 'GOJO',
      plays: [{ name: '橋弁慶', slug: 'hashi-benkei' }],
      summary: '牛若丸と弁慶が橋の上で出会います。ただし能では、夜ごと人を斬っているのは牛若丸のほうで、弁慶はそれを鎮めに来る側です。',
      status: '公開',
    },
    {
      no: '03',
      place: '近江・鏡',
      placeSlug: 'omi-kagami',
      romaji: 'KAGAMI',
      plays: [
        { name: '烏帽子折', slug: 'eboshi-ori' },
        { name: '熊坂', slug: 'kumasaka' },
      ],
      summary: '牛若丸が東山道の宿で元服します。その夜に盗賊の熊坂長範を討った一件が、討つ側の「烏帽子折」と討たれる側の「熊坂」に分かれています。',
      status: '公開',
    },
    {
      no: '04',
      place: '黄瀬川',
      placeSlug: 'kisegawa',
      romaji: 'KISEGAWA',
      plays: [],
      summary: '義経が兄頼朝の陣に加わります。義経が同時代の記録に現れはじめるのは、ここからです。',
      status: '公開',
    },
    {
      no: '05',
      place: '一ノ谷',
      placeSlug: 'ichinotani',
      romaji: 'ICHINOTANI',
      plays: [],
      summary: '山が海に迫る隘路での戦いです。戦果そのものよりも、この地形の記憶のほうが長く語り継がれました。',
      status: '公開',
    },
    {
      no: '06',
      place: '屋島',
      placeSlug: 'yashima',
      romaji: 'YASHIMA',
      plays: [{ name: '八島', slug: 'yashima' }],
      summary: '義経が勝った戦いです。能ではその義経自身が亡霊となり、修羅道で戦い続けながらこの海を語り直します。',
      status: '公開',
    },
    {
      no: '07',
      place: '壇ノ浦',
      placeSlug: 'dannoura',
      romaji: 'DANNOURA',
      plays: [],
      summary: '平家が滅びます。この日を境に、義経が向き合う相手は、西の平家から東の鎌倉に変わります。',
      status: '公開',
    },
    {
      no: '08',
      place: '京都',
      placeSlug: 'kyoto',
      romaji: 'KYOTO',
      plays: [{ name: '正尊', slug: 'shozon' }],
      summary: '義経の堀川の館が、夜襲を受けます。頼朝との対立が、言葉から実力に変わった夜です。',
      status: '公開',
    },
    {
      no: '09',
      place: '大物浦',
      placeSlug: 'daimotsu',
      romaji: 'DAIMOTSU',
      plays: [{ name: '船弁慶', slug: 'funabenkei' }],
      summary: '西国へ向かう義経の船が、嵐で引き返します。「船弁慶」の作者はその嵐を、義経が壇ノ浦で滅ぼした平知盛の怨霊に置き換えました。',
      status: '公開',
    },
    {
      no: '10',
      place: '吉野',
      placeSlug: 'yoshino',
      romaji: 'YOSHINO',
      plays: [{ name: '吉野静', slug: 'yoshino-shizuka' }, { name: '忠信' }],
      summary: '義経が山に身を隠し、静御前と別れます。ここから先、義経は逃げ続ける側に、静御前は捕らえられる側に分かれます。',
      status: '公開',
    },
    {
      no: '11',
      place: '安宅',
      placeSlug: 'ataka',
      romaji: 'ATAKA',
      plays: [{ name: '安宅', slug: 'ataka' }],
      summary: '山伏に化けた一行が関を越えます。この詮議の場面は同時代の記録に見えず、「安宅」の作者による創作と考えられます。',
      status: '公開',
    },
    {
      no: '12',
      place: '信夫',
      placeSlug: 'shinobu',
      romaji: 'SHINOBU',
      plays: [{ name: '摂待', slug: 'settai' }],
      summary: '義経のために息子を死なせた老母が、その主君と知らずに一行をもてなします。この旅のなかで、残された家族の側に視点が置かれる数少ない曲です。',
      status: '公開',
    },
    {
      no: '13',
      place: '平泉',
      placeSlug: 'hiraizumi',
      romaji: 'HIRAIZUMI',
      plays: [{ name: '錦戸', slug: 'nishikido' }],
      summary: '一一八九年、義経は平泉の衣川館で藤原泰衡に攻められ、自害したと記録されています。ところが後世の伝説はこの死を認めず、さらに北へ逃げ延びたという話を作りました。',
      status: '公開',
    },
  ] satisfies FeatureChapter[],
}

/** 章の行き先。記事が未執筆の章は土地のページへ送る。 */
export const chapterHref = (c: FeatureChapter) => {
  const playSlug = c.plays.find((p) => p.slug)?.slug
  return c.status === '公開' && playSlug ? '/ja/plays/' + playSlug : '/ja/places/' + c.placeSlug
}

export const chapters = FEATURE_YOSHITSUNE.chapters as FeatureChapter[]

/** 演目 / 土地 から、その章が特集のどこにあたるかを引く */
export const chapterIndexByPlay = (slug: string) =>
  chapters.findIndex((c) => c.plays.some((p) => p.slug === slug))

export const chapterIndexByPlace = (slug: string) =>
  chapters.findIndex((c) => c.placeSlug === slug)
