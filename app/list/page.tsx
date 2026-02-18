'use client'

import { Suspense, useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { POKEMON_LIST, GENERATIONS, Pokemon } from '@/lib/pokemon'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'

export default function ListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-secondary">Loading...</div>}>
      <ListPageContent />
    </Suspense>
  )
}

function ListPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null)

  useEffect(() => {
    const genParam = searchParams.get('gen')
    if (genParam) {
      const genId = parseInt(genParam, 10)
      if ([1, 2, 3, 4, 5].includes(genId)) {
        setSelectedGeneration(genId)
      }
    }
  }, [searchParams])
  
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isTouchDeviceRef = useRef(false)

  const getPokemonName = (pokemon: typeof POKEMON_LIST[0]) => {
    return language === 'en' ? pokemon.nameEn : pokemon.name
  }

  // Helper for Japanese search normalization
  const hiraganaToKatakana = (str: string): string => {
    return str.replace(/[\u3041-\u3096]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) + 0x60)
    })
  }
  const katakanaToHiragana = (str: string): string => {
    return str.replace(/[\u30A1-\u30F6]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0x60)
    })
  }
  const normalizeJapanese = (str: string): string[] => {
    const katakana = hiraganaToKatakana(str)
    const hiragana = katakanaToHiragana(str)
    return [str, katakana, hiragana].filter((s, i, arr) => arr.indexOf(s) === i)
  }

  const filteredPokemon = useMemo(() => {
    let list = POKEMON_LIST
    if (selectedGeneration !== null) {
      list = list.filter(p => p.generation === selectedGeneration)
    }
    if (!searchQuery.trim()) return list
    
    const query = searchQuery.trim()
    const normalizedQueries = normalizeJapanese(query.toLowerCase())
    
    return list.filter((pokemon) => {
      const name = pokemon.name
      const nameLower = name.toLowerCase()
      const nameEn = pokemon.nameEn.toLowerCase()
      const id = pokemon.id.toLowerCase()
      const normalizedNames = normalizeJapanese(nameLower)
      
      const matchesJapanese = normalizedQueries.some(q => normalizedNames.some(n => n.includes(q)))
      return matchesJapanese || nameEn.includes(query.toLowerCase()) || id.includes(query.toLowerCase())
    })
  }, [searchQuery, selectedGeneration])

  const playSound = (id: string, soundPath: string) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    const audio = new Audio(soundPath)
    audioRef.current = audio
    audio.play().catch(() => setPlayingId(null))
    setPlayingId(id)
    audio.onended = () => setPlayingId(null)
  }

  const handlePokemonClick = (pokemon: Pokemon, e: React.MouseEvent | React.TouchEvent) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false
      return
    }

    setSelectedPokemon(pokemon)
    playSound(pokemon.id, pokemon.soundPath)
  }

  const handleLongPress = (id: string) => {
    isLongPressRef.current = true
    router.push(`/wave/${id}`)
  }

  const cancelPress = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }, [])

  const handleMouseDown = (id: string) => {
    if (isTouchDeviceRef.current) return
    isLongPressRef.current = false
    cancelPress()
    pressTimerRef.current = setTimeout(() => handleLongPress(id), 500)
  }
  const handleMouseUp = () => {
    if (isTouchDeviceRef.current) return
    cancelPress()
  }
  const handleTouchStart = (id: string) => {
    isTouchDeviceRef.current = true
    isLongPressRef.current = false
    cancelPress()
    pressTimerRef.current = setTimeout(() => handleLongPress(id), 500)
  }
  const handleTouchEnd = () => {
    cancelPress()
  }

  return (
    <div className="p-4 md:p-8 min-h-screen h-full">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 h-full">
        
        {/* Center Column: List */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{t('list.title')}</h1>
            <div className="hidden md:block">
              <Link
                href="/compare"
                className="text-accent font-medium text-sm hover:opacity-70 transition-opacity"
              >
                {t('list.compareSounds')}
              </Link>
            </div>
          </div>
          
          <div className="mb-6 sticky top-0 z-20 bg-surface/80 backdrop-blur-md py-3 px-4 -mx-4 rounded-2xl space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedGeneration(null)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedGeneration === null
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-background text-secondary hover:bg-gray-200'
                }`}
              >
                {t('generation.all')}
              </button>
              {GENERATIONS.map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => setSelectedGeneration(gen.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedGeneration === gen.id
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-background text-secondary hover:bg-gray-200'
                  }`}
                >
                  {language === 'en' ? gen.regionEn : gen.region}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('list.searchPlaceholder')}
              className="w-full px-4 py-3 bg-background rounded-xl border-none text-sm focus:ring-2 focus:ring-accent/50 outline-none transition-all"
            />
          </div>

          {filteredPokemon.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary text-lg mb-4">{t('list.noResults')}</p>
              <button onClick={() => setSearchQuery('')} className="text-accent hover:underline">
                {t('list.clearSearch')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-24 md:pb-0">
              {filteredPokemon.map((pokemon) => {
                const isSelected = selectedPokemon?.id === pokemon.id;
                return (
                  <div
                    key={pokemon.id}
                    className={`relative group cursor-pointer flex flex-col items-center p-2 rounded-xl transition-all ${isSelected ? 'bg-accent/5 ring-2 ring-accent/20' : 'hover:bg-gray-50'}`}
                    onClick={(e) => handlePokemonClick(pokemon, e)}
                    onMouseDown={() => handleMouseDown(pokemon.id)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={() => handleTouchStart(pokemon.id)}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="relative w-full aspect-square bg-background rounded-apple mb-2 flex items-center justify-center transition-transform active:scale-95">
                      <img
                        src={pokemon.imagePath}
                        alt={getPokemonName(pokemon)}
                        className="w-3/4 h-3/4 object-contain"
                        loading="lazy"
                      />
                      {playingId === pokemon.id && (
                        <div className="absolute inset-0 rounded-apple border-2 border-accent animate-pulse" />
                      )}
                    </div>
                    <p className="text-[10px] text-secondary font-medium">{pokemon.id}</p>
                    <p className="text-xs font-semibold text-center line-clamp-1">{getPokemonName(pokemon)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detail View (Desktop) */}
        <div className="hidden md:block">
          <div className="sticky top-8 bg-surface rounded-apple p-6 shadow-float h-fit border border-gray-100">
            {selectedPokemon ? (
              <div className="text-center animate-fade-in">
                 <div className="w-full aspect-square bg-background rounded-apple mb-6 flex items-center justify-center">
                    <img 
                      src={selectedPokemon.imagePath} 
                      alt={getPokemonName(selectedPokemon)}
                      className="w-2/3 h-2/3 object-contain"
                    />
                 </div>
                 <h2 className="text-2xl font-bold mb-1">{getPokemonName(selectedPokemon)}</h2>
                 <p className="text-secondary font-mono mb-6">No. {selectedPokemon.id}</p>
                 
                 <button
                    onClick={() => playSound(selectedPokemon.id, selectedPokemon.soundPath)}
                    className="w-full py-3 bg-black text-white rounded-xl font-bold mb-4 active:scale-95 transition-transform flex items-center justify-center gap-2"
                 >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    {t('list.playCry')}
                 </button>

                 <Link 
                    href={`/wave/${selectedPokemon.id}`}
                    className="block w-full py-3 bg-background text-primary rounded-xl font-medium hover:bg-gray-200 transition-colors text-center"
                 >
                    {t('list.viewWaveform')}
                 </Link>
              </div>
            ) : (
              <div className="text-center py-20 text-secondary">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p>{t('list.selectToView')}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
