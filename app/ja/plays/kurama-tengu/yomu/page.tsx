import type { Metadata } from 'next'
import { PlayArticle } from '@/components/PlayArticle'
import { PLAY_ARTICLES } from '@/content/articles'
import Body from '../body.mdx'

export const metadata: Metadata = {
  title: '鞍馬天狗',
  description: PLAY_ARTICLES['kurama-tengu'].lede,
}

export default function Page() {
  return (
    <PlayArticle slug="kurama-tengu">
      <Body />
    </PlayArticle>
  )
}
