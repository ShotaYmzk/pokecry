'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { POKEMON_LIST } from '@/lib/pokemon'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function ListPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)

  const getPokemonName = (pokemon: typeof POKEMON_LIST[0]) => {
    return language === 'en' ? pokemon.nameEn : pokemon.name
  }

  // ひらがなをカタカナに変換
  const hiraganaToKatakana = (str: string): string => {
    return str.replace(/[\u3041-\u3096]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) + 0x60)
    })
  }

  // カタカナをひらがなに変換
  const katakanaToHiragana = (str: string): string => {
    return str.replace(/[\u30A1-\u30F6]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0x60)
    })
  }

  // 文字列を正規化（ひらがな・カタカナの両方の形式で比較可能にする）
  const normalizeJapanese = (str: string): string[] => {
    const katakana = hiraganaToKatakana(str)
    const hiragana = katakanaToHiragana(str)
    return [str, katakana, hiragana].filter((s, i, arr) => arr.indexOf(s) === i)
  }

  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) {
      return POKEMON_LIST
    }
    
    const query = searchQuery.trim()
    const normalizedQueries = normalizeJapanese(query.toLowerCase())
    
    return POKEMON_LIST.filter((pokemon) => {
      const name = pokemon.name
      const nameLower = name.toLowerCase()
      const nameEn = pokemon.nameEn.toLowerCase()
      const id = pokemon.id.toLowerCase()
      
      // 日本語名を正規化
      const normalizedNames = normalizeJapanese(nameLower)
      
      // 検索クエリの各正規化形式が、ポケモン名の各正規化形式に含まれるかチェック
      const matchesJapanese = normalizedQueries.some(q => 
        normalizedNames.some(n => n.includes(q))
      )
      
      return matchesJapanese || nameEn.includes(query.toLowerCase()) || id.includes(query.toLowerCase())
    })
  }, [searchQuery])

  const handlePokemonClick = (id: string, soundPath: string, e: React.MouseEvent | React.TouchEvent) => {
    // 長押しの場合はクリックイベントを無視
    if (isLongPressRef.current) {
      isLongPressRef.current = false
      return
    }

    const audio = new Audio(soundPath)
    audio.play()
    setPlayingId(id)
    audio.onended = () => setPlayingId(null)
  }

  const handleLongPress = (id: string) => {
    isLongPressRef.current = true
    router.push(`/wave/${id}`)
  }

  const handleMouseDown = (id: string) => {
    isLongPressRef.current = false
    pressTimerRef.current = setTimeout(() => {
      handleLongPress(id)
    }, 500)
  }

  const handleMouseUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }

  const handleTouchStart = (id: string) => {
    isLongPressRef.current = false
    pressTimerRef.current = setTimeout(() => {
      handleLongPress(id)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <LanguageSwitcher />
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{t('list.title')}</h1>
          <div className="flex gap-2">
            <Link
              href="/compare"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {t('list.compareSounds')}
            </Link>
            <Link
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {t('list.backToHome')}
            </Link>
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          {t('list.instruction')}
        </p>
        
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('list.searchPlaceholder')}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              {filteredPokemon.length} {t('list.searchResults')}
            </p>
          )}
        </div>

        {filteredPokemon.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('list.noResults')}</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-blue-500 hover:text-blue-600 underline"
            >
              {t('list.clearSearch')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-10 gap-2">
            {filteredPokemon.map((pokemon) => (
              <div
                key={pokemon.id}
                className="relative cursor-pointer bg-white rounded-lg p-2 hover:bg-gray-100 transition-colors"
                onClick={(e) => handlePokemonClick(pokemon.id, pokemon.soundPath, e)}
                onMouseDown={() => handleMouseDown(pokemon.id)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={() => handleTouchStart(pokemon.id)}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={`/poke_pic/${pokemon.id}.png`}
                  alt={getPokemonName(pokemon)}
                  className="w-20 h-20 object-contain mx-auto"
                />
                <p className="text-xs text-center mt-1 text-gray-500 font-semibold">{pokemon.id}</p>
                <p className="text-xs text-center mt-1 text-gray-700">{getPokemonName(pokemon)}</p>
                {playingId === pokemon.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-200 bg-opacity-50 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

