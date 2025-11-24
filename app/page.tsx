'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function Home() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <LanguageSwitcher />
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {t('home.title')}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {t('home.description')}
        </p>
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-4 mb-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">{t('home.quiz')}</h2>
            <div className="space-y-2">
              <Link
                href="/quiz"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {t('home.selectFromChoices')}
              </Link>
              <Link
                href="/quiz/input"
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {t('home.inputName')}
              </Link>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 mb-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">{t('home.quizEn')}</h2>
            <div className="space-y-2">
              <Link
                href="/quiz/en"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {t('home.selectEnFromChoices')}
              </Link>
              <Link
                href="/quiz/en/input"
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {t('home.inputEnName')}
              </Link>
            </div>
          </div>
          <Link
            href="/list"
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
          >
            {t('home.pokemonList')}
          </Link>
          <Link
            href="/compare"
            className="block w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
          >
            {t('home.compareSounds')}
          </Link>
          <Link
            href="/weak"
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
          >
            {t('home.weakPokemonQuiz')}
          </Link>
        </div>
      </div>
    </div>
  )
}

