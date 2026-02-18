'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { GENERATIONS } from '@/lib/pokemon'

export default function Home() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  return (
    <div className="p-6 md:p-10 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 h-full">
        
        {/* Center Column: Main View */}
        <div className="space-y-8">
          <header className="md:hidden flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold tracking-tight">PokeWav</h1>
            <LanguageSwitcher />
          </header>

          <div className="hidden md:block mb-8">
            <h2 className="text-4xl font-bold tracking-tight mb-2">{t('home.welcome')}</h2>
            <p className="text-secondary">{t('home.welcomeMessage')}</p>
          </div>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary md:text-2xl">
              {t('home.mainModes')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <Link
                href="/quiz"
                className="group relative overflow-hidden rounded-apple bg-surface p-6 md:p-8 shadow-sm hover:shadow-float transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative z-10">
                  <span className="inline-block p-3 rounded-full bg-blue-50 text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  <h3 className="text-2xl font-bold mb-2">{t('home.quiz')}</h3>
                  <p className="text-secondary">{t('home.selectFromChoices')}</p>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
              </Link>

              <Link
                href="/quiz/input"
                className="group relative overflow-hidden rounded-apple bg-surface p-6 md:p-8 shadow-sm hover:shadow-float transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative z-10">
                   <span className="inline-block p-3 rounded-full bg-purple-50 text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </span>
                  <h3 className="text-2xl font-bold mb-2">{t('home.expert')}</h3>
                  <p className="text-secondary">{t('home.inputName')}</p>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
              </Link>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary md:text-2xl">
              {t('home.generationPokedex')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {GENERATIONS.map((gen) => (
                <Link
                  key={gen.id}
                  href={`/list?gen=${gen.id}`}
                  className="group rounded-apple bg-surface p-4 hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  <p className="text-xs font-bold text-accent mb-1">
                    {language === 'en' ? gen.nameEn : gen.name}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {language === 'en' ? gen.regionEn : gen.region}
                  </p>
                  <p className="text-[10px] text-secondary mt-1">
                    No.{String(gen.range[0]).padStart(3, '0')} - {String(gen.range[1]).padStart(3, '0')}
                  </p>
                  <p className="text-[10px] text-secondary mt-0.5">
                    {language === 'en' ? gen.gamesEn : gen.games}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary md:text-2xl">
              {t('home.englishModes')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              <Link
                href="/quiz/en"
                className="group relative overflow-hidden rounded-apple bg-surface p-5 hover:shadow-md transition-all duration-300"
              >
                <h3 className="font-bold mb-1 text-sm md:text-base">{t('home.quizEn')}</h3>
                <p className="text-xs text-secondary">{t('home.selectAnswer')}</p>
              </Link>
              <Link
                href="/quiz/en/input"
                className="group relative overflow-hidden rounded-apple bg-surface p-5 hover:shadow-md transition-all duration-300"
              >
                <h3 className="font-bold mb-1 text-sm md:text-base">{t('quizEnInput.englishInput')}</h3>
                <p className="text-xs text-secondary">{t('home.typeName')}</p>
              </Link>
            </div>
          </section>
        </div>

        {/* Right Column: Status & Info (Desktop Only) */}
        <div className="hidden md:block space-y-6">
          <div className="bg-surface rounded-apple p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">{t('home.settings')}</h3>
                <LanguageSwitcher />
             </div>
             <div className="space-y-4">
                <div className="p-4 bg-background rounded-xl flex items-center gap-3">
                   <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                   </div>
                   <div>
                      <p className="text-xs font-bold">{t('home.soundCheck')}</p>
                      <p className="text-[10px] text-secondary">{t('home.soundCheckDescription')}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-surface rounded-apple p-6 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-4">{t('home.tips')}</h3>
             <p className="text-sm text-secondary leading-relaxed">
               {t('home.tipsDescription')}
             </p>
             <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href="/weak" className="text-accent text-sm font-medium hover:underline">
                  {t('home.reviewWeak')}
                </Link>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
