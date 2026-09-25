import type { Metadata } from 'next'
import { PlayArticle } from '@/components/PlayArticle'
import { PLAY_ARTICLES } from '@/content/articles'
import Body from './body.mdx'

export const metadata: Metadata = {
  title: '熊坂',
  description: PLAY_ARTICLES['kumasaka'].lede,
}

export default function Page() {
  return (
    <PlayArticle slug="kumasaka">
      <Body />
    </PlayArticle>
  )
}
