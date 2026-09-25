import type { Performance } from '@/lib/types'

/**
 * 公演情報は独立したデータとして管理し、Play ID と紐づける（指示書 22）。
 *
 * ※ 以下は UI 検証のためのサンプルであり、実在の公演ではない。
 *   本番ではこの配列を、出典 URL と取得日時つきの実データに差し替える。
 */
export const PERFORMANCES_ARE_SAMPLE = true

export const PERFORMANCES: Performance[] = [
  {
    date: '2026-11-14',
    dateLabel: '2026.11.14',
    venue: '□□能楽堂',
    prefecture: '東京都',
    play: '橋弁慶',
    playSlug: 'hashi-benkei',
    performer: '—',
    school: '観世流',
    price: '一般 5,000円 / 学生 2,500円',
    retrievedAt: '2026-09-23',
  },
  {
    date: '2026-12-06',
    dateLabel: '2026.12.06',
    venue: '○○能楽堂',
    prefecture: '京都府',
    play: '船弁慶',
    playSlug: 'funabenkei',
    performer: '—',
    school: '金剛流',
    price: '一般 6,000円',
    retrievedAt: '2026-09-23',
  },
  {
    date: '2027-02-21',
    dateLabel: '2027.02.21',
    venue: '△△能楽堂',
    prefecture: '石川県',
    play: '安宅',
    playSlug: 'ataka',
    performer: '—',
    school: '宝生流',
    price: '一般 4,500円',
    retrievedAt: '2026-09-23',
  },
  {
    date: '2027-03-07',
    dateLabel: '2027.03.07',
    venue: '□□能楽堂',
    prefecture: '東京都',
    play: '橋弁慶',
    playSlug: 'hashi-benkei',
    performer: '—',
    school: '宝生流',
    price: '一般 5,500円',
    retrievedAt: '2026-09-23',
  },
]

export const performancesForPlay = (slug: string) =>
  PERFORMANCES.filter((p) => p.playSlug === slug).sort((a, b) => a.date.localeCompare(b.date))
