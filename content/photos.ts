import type { PhotoCredit } from '@/lib/types'

/**
 * 写真の出所を一元管理する。
 *
 * 素材サイトの写真は、商用利用可であっても条件が付く（再配布不可、
 * クレジット表示の要否、人物・私有地の扱いなど）。
 * 記事に直接ファイル名を書くのではなく、ここに出所と条件を登録してから使う。
 * /ja/about/credits がこの配列から自動で生成される。
 *
 * 使い方
 *   1. public/photos/ に画像を置く
 *   2. ここに一件追加する
 *   3. 記事の <Fig> に src="<id>" を足す
 */
export const PHOTOS: PhotoCredit[] = [
  // 例（実ファイルを入れたら有効にする）
  // {
  //   id: 'gojo-matsubara-bridge',
  //   file: '/photos/gojo-matsubara-bridge.jpg',
  //   width: 1600,
  //   height: 1067,
  //   alt: '松原橋から北を見た鴨川。両岸に街路樹が続く。',
  //   source: 'photoAC',
  //   author: '撮影者名',
  //   license: 'photoAC 利用規約に基づく（再配布不可）',
  //   retrievedAt: '2026-09-24',
  // },
]

export const photoById = (id: string) => PHOTOS.find((p) => p.id === id)
