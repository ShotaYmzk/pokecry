'use client'

import { useLanguage } from '@/lib/LanguageContext'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage()

  return (
    <div className={`flex items-center bg-gray-100/80 backdrop-blur-sm p-1 rounded-lg ${className}`}>
      <button
        onClick={() => setLanguage('ja')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          language === 'ja'
            ? 'bg-white text-black shadow-sm'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        日本語
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          language === 'en'
            ? 'bg-white text-black shadow-sm'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        English
      </button>
    </div>
  )
}
