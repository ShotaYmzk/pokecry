'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Language } from './i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ja')

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('pokewav-language') as Language | null
      if (savedLanguage === 'ja' || savedLanguage === 'en') {
        setLanguageState(savedLanguage)
      }
    } catch {
      // localStorage unavailable (private browsing, etc.)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('pokewav-language', lang)
    } catch {
      // Storage full or unavailable
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}


