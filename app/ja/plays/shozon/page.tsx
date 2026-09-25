import type { Metadata } from 'next'
import { PlayArticle } from '@/components/PlayArticle'
import { PLAY_ARTICLES } from '@/content/articles'
import Body from './body.mdx'

export const metadata: Metadata = {
  title: '正尊',
  description: PLAY_ARTICLES['shozon'].lede,
}

export default function Page() {
  return (
    <PlayArticle slug="shozon">
      <Body />
    </PlayArticle>
  )
}
