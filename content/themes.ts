import type { Theme } from '@/lib/types'

export const THEMES: Theme[] = [
  {
    slug: 'haisha',
    name: '敗者',
    summary: '勝った側ではなく、滅びた側から語り直されます。',
  },
  {
    slug: 'onryo',
    name: '怨霊',
    summary: '死者が舞台に戻ってきて、生者に語りかけます。',
  },
  {
    slug: 'tabi',
    name: '旅',
    summary: '移動そのものが筋になります。道行という形式です。',
  },
  {
    slug: 'chugi',
    name: '忠義',
    summary: '主君に従う者の側から見た物語です。',
  },
  {
    slug: 'koi',
    name: '恋',
    summary: '待つこと、別れること、思い出すこと。',
  },
  {
    slug: 'chinkon',
    name: '鎮魂',
    summary: '語ることで死者を鎮める、という能の基本的な動機です。',
  },
  {
    slug: 'hangan-biiki',
    name: '判官贔屓',
    summary: '敗れた義経に寄り添う感情が、後世の物語を動かしました。',
  },
  {
    slug: 'shuju',
    name: '主従',
    summary: '主君と従者の関係が、物語の中心に据えられます。',
  },
  {
    slug: 'tobo',
    name: '逃亡',
    summary: '追われる側の時間です。到着ではなく、逃れ続けることが筋になります。',
  },
]

export const themeBySlug = (slug: string) => THEMES.find((t) => t.slug === slug)
export const themesBySlugs = (slugs: string[]) =>
  slugs.map(themeBySlug).filter((t): t is Theme => Boolean(t))
