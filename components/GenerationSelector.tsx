'use client'

import { GENERATIONS } from '@/lib/pokemon'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'

interface GenerationSelectorProps {
  value: number | undefined
  onChange: (gen: number | undefined) => void
  className?: string
}

export function GenerationSelector({ value, onChange, className = '' }: GenerationSelectorProps) {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  return (
    <div className={`flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide ${className}`}>
      <button
        onClick={() => onChange(undefined)}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          value === undefined
            ? 'bg-accent text-white shadow-sm'
            : 'bg-background text-secondary hover:bg-gray-200'
        }`}
      >
        {t('generation.all')}
      </button>
      {GENERATIONS.map((gen) => (
        <button
          key={gen.id}
          onClick={() => onChange(gen.id)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            value === gen.id
              ? 'bg-accent text-white shadow-sm'
              : 'bg-background text-secondary hover:bg-gray-200'
          }`}
        >
          {language === 'en' ? gen.regionEn : gen.region}
        </button>
      ))}
    </div>
  )
}
