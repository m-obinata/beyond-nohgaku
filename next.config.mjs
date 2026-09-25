import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // dev サーバーを止めずに本番ビルドを検証できるよう、出力先を差し替え可能にする
  distDir: process.env.NEXT_DIST_DIR || '.next',
}

const withMDX = createMDX({ options: { remarkPlugins: [], rehypePlugins: [] } })

export default withMDX(nextConfig)
