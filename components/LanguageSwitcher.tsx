'use client'

import { useLanguage } from '@/lib/LanguageContext'
import { Language } from '@/lib/i18n'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setLanguage('ja')}
          className={`px-3 py-1 rounded transition-colors ${
            language === 'ja'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          日本語
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded transition-colors ${
            language === 'en'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          English
        </button>
      </div>
    </div>
  )
}

