import type { SourceText } from '@/lib/types'

/** 出典。記事中の記述は、かならずいずれかのレイヤーに紐づけます。 */
export const SOURCES: SourceText[] = [
  {
    slug: 'gyokuyo',
    name: '玉葉',
    reading: 'ぎょくよう',
    romaji: 'GYOKUYO',
    layer: 'history',
    period: '12世紀後半（同時代）',
    summary:
      '九条兼実の日記です。事件と同じ時期に書かれているので、義経の動向を追ううえでは、もっとも確度の高い記録のひとつになります。',
  },
  {
    slug: 'azuma-kagami',
    name: '吾妻鏡',
    reading: 'あづまかがみ',
    romaji: 'AZUMA-KAGAMI',
    layer: 'chronicle',
    period: '鎌倉時代後期成立',
    summary:
      '鎌倉幕府の側でまとめられた歴史記録です。出来事から一世紀近くのちの編纂で、幕府の立場が反映されている点を差し引いて読む必要があります。',
  },
  {
    slug: 'heike-monogatari',
    name: '平家物語',
    reading: 'へいけものがたり',
    romaji: 'HEIKE-MONOGATARI',
    layer: 'story',
    period: '13世紀前半頃',
    summary:
      '語り物として広まった軍記物語です。能の二番目物の多くが、ここから場面を取っています。',
  },
  {
    slug: 'gikeiki',
    name: '義経記',
    reading: 'ぎけいき',
    romaji: 'GIKEIKI',
    layer: 'story',
    period: '室町時代前期頃',
    summary:
      '義経の生涯を一代記として語る物語です。合戦そのものよりも、少年期と逃亡期に紙幅を割いています。後世の義経像の大部分は、ここに発しています。',
  },
  {
    slug: 'heiji-monogatari',
    name: '平治物語',
    reading: 'へいじものがたり',
    romaji: 'HEIJI-MONOGATARI',
    layer: 'story',
    period: '13世紀頃',
    summary: '平治の乱を扱う軍記物語です。義朝の敗死と、その子らの処遇が語られます。',
  },
  {
    slug: 'ise-monogatari',
    name: '伊勢物語',
    reading: 'いせものがたり',
    romaji: 'ISE-MONOGATARI',
    layer: 'story',
    period: '10世紀頃',
    summary:
      '歌と、その背景の短い物語を連ねた作品です。能「井筒」の筒井筒の段も、ここに含まれます。',
  },
  {
    slug: 'kanjincho',
    name: '勧進帳',
    reading: 'かんじんちょう',
    romaji: 'KANJINCHO',
    layer: 'stage',
    period: '1840年 初演',
    summary:
      '歌舞伎十八番のひとつです。能「安宅」を歌舞伎に移したもので、いまひろく知られる弁慶像は、ここで決定的になりました。',
  },
]

export const sourceBySlug = (slug: string) => SOURCES.find((s) => s.slug === slug)
export const sourcesBySlugs = (slugs: string[]) =>
  slugs.map(sourceBySlug).filter((s): s is SourceText => Boolean(s))
