import type { Metadata } from 'next'
import { PlayArticle } from '@/components/PlayArticle'
import { PLAY_ARTICLES } from '@/content/articles'
import Body from './body.mdx'

export const metadata: Metadata = {
  title: '烏帽子折',
  description: PLAY_ARTICLES['eboshi-ori'].lede,
}

export default function Page() {
  return (
    <PlayArticle slug="eboshi-ori">
      <Body />
    </PlayArticle>
  )
}
