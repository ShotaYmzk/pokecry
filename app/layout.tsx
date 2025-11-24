import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/lib/LanguageContext'
import { Navigation } from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'ポケモン鳴き声クイズ',
  description: 'ポケモンの鳴き声だけでポケモンを当てるゲーム',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-background text-primary antialiased">
        <LanguageProvider>
          <div className="min-h-screen md:flex">
            <Navigation />
            {/* Mobile: Bottom padding for nav. Desktop: Left margin for sidebar. */}
            <main className="flex-1 pb-24 md:pb-0 md:pl-64 transition-all duration-300">
              <div className="max-w-7xl mx-auto min-h-screen">
                {children}
              </div>
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}
