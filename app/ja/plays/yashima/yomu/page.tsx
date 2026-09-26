import type { Metadata } from 'next'
import { PlayArticle } from '@/components/PlayArticle'
import { PLAY_ARTICLES } from '@/content/articles'
import Body from '../body.mdx'

export const metadata: Metadata = {
  title: '八島',
  description: PLAY_ARTICLES['yashima'].lede,
}

export default function Page() {
  return (
    <PlayArticle slug="yashima">
      <Body />
    </PlayArticle>
  )
}
