import type { Metadata } from 'next'
import { PlayArticle } from '@/components/PlayArticle'
import { PLAY_ARTICLES } from '@/content/articles'
import Body from '../body.mdx'

export const metadata: Metadata = {
  title: '船弁慶',
  description: PLAY_ARTICLES['funabenkei'].lede,
}

export default function Page() {
  return (
    <PlayArticle slug="funabenkei">
      <Body />
    </PlayArticle>
  )
}
