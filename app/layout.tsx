import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ポケモン鳴き声クイズ',
  description: 'ポケモンの鳴き声だけでポケモンを当てるゲーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}

