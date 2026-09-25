import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'

export const metadata: Metadata = {
  title: {
    default: '能楽の向こう側 — 日本の物語と土地を旅する',
    template: '%s — 能楽の向こう側',
  },
  description:
    '能楽を入口に、歴史と土地に残された物語をたどります。一曲の能の向こう側にある、日本の歴史・土地・記憶をたどるデジタル文化誌です。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+JP:wght@400;500;600&family=Noto+Serif+JP:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a
          href="#main"
          className="bg-canvas border-accent focus:ring-accent sr-only rounded-none border px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100"
        >
          本文へスキップ
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
