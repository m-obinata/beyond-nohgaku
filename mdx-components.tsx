import type { MDXComponents } from 'mdx/types'
import { Sec, Layer, Q, Fig, Note, Compare, Guide, View, Contrast } from '@/components/Article'

/** MDX 本文から、章立てとレイヤー表示の部品を直接使えるようにする */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { Sec, Layer, Q, Fig, Note, Compare, Guide, View, Contrast, ...components }
}
