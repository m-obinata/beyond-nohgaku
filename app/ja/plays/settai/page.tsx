import type { Metadata } from 'next'
import { PlayArticle } from '@/components/PlayArticle'
import { PLAY_ARTICLES } from '@/content/articles'
import Body from './body.mdx'

export const metadata: Metadata = {
  title: '摂待',
  description: PLAY_ARTICLES['settai'].lede,
}

export default function Page() {
  return (
    <PlayArticle slug="settai">
      <Body />
    </PlayArticle>
  )
}
