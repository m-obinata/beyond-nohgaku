import type { Metadata } from 'next'
import { PlayArticle } from '@/components/PlayArticle'
import { PLAY_ARTICLES } from '@/content/articles'
import Body from './body.mdx'

export const metadata: Metadata = {
  title: '橋弁慶',
  description: PLAY_ARTICLES['hashi-benkei'].lede,
}

export default function Page() {
  return (
    <PlayArticle slug="hashi-benkei">
      <Body />
    </PlayArticle>
  )
}
