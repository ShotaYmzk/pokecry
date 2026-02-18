'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { POKEMON_LIST, GENERATIONS, Pokemon } from '@/lib/pokemon'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'

export default function ComparePage() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [selectedPokemons, setSelectedPokemons] = useState<Pokemon[]>([])
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isPlayingAll, setIsPlayingAll] = useState(false)
  const [filterGeneration, setFilterGeneration] = useState<number | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const playAllTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playAllCancelledRef = useRef(false)

  const displayList = useMemo(() => {
    if (filterGeneration === null) return POKEMON_LIST
    return POKEMON_LIST.filter(p => p.generation === filterGeneration)
  }, [filterGeneration])

  const getPokemonName = (pokemon: Pokemon) => {
    return language === 'en' ? pokemon.nameEn : pokemon.name
  }

  const togglePokemon = (pokemon: Pokemon) => {
    const isSelected = selectedPokemons.some(p => p.id === pokemon.id)
    if (isSelected) {
      setSelectedPokemons(selectedPokemons.filter(p => p.id !== pokemon.id))
    } else {
      if (selectedPokemons.length < 10) {
        setSelectedPokemons([...selectedPokemons, pokemon])
      } else {
        alert(t('compare.maxSelection'))
      }
    }
  }

  const removePokemon = (id: string) => {
    const audio = audioRefs.current[id]
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    delete audioRefs.current[id]
    setSelectedPokemons(selectedPokemons.filter(p => p.id !== id))
    if (playingId === id) {
      setPlayingId(null)
    }
  }

  const playPokemon = async (pokemon: Pokemon) => {
    stopAll()

    const audio = audioRefs.current[pokemon.id]
    if (audio) {
      audio.currentTime = 0
      setPlayingId(pokemon.id)
      audio.play().catch(() => setPlayingId(null))
      audio.onended = () => setPlayingId(null)
    }
  }

  const playAllSequentially = async () => {
    if (selectedPokemons.length === 0) return

    stopAll()
    playAllCancelledRef.current = false
    setIsPlayingAll(true)

    for (let i = 0; i < selectedPokemons.length; i++) {
      if (playAllCancelledRef.current) break

      const pokemon = selectedPokemons[i]
      const audio = audioRefs.current[pokemon.id]
      
      if (audio) {
        setPlayingId(pokemon.id)
        audio.currentTime = 0
        
        await new Promise<void>((resolve) => {
          audio.onended = () => {
            setPlayingId(null)
            resolve()
          }
          audio.onerror = () => resolve()
          audio.play().catch(() => resolve())
        })

        if (playAllCancelledRef.current) break

        if (i < selectedPokemons.length - 1) {
          await new Promise<void>(resolve => {
            playAllTimeoutRef.current = setTimeout(resolve, 500)
          })
        }
      }
    }

    setIsPlayingAll(false)
    setPlayingId(null)
  }

  const stopAll = () => {
    playAllCancelledRef.current = true
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
        audio.onended = null
      }
    })
    setPlayingId(null)
    setIsPlayingAll(false)
    if (playAllTimeoutRef.current) {
      clearTimeout(playAllTimeoutRef.current)
      playAllTimeoutRef.current = null
    }
  }

  const clearSelection = () => {
    stopAll()
    setSelectedPokemons([])
  }

  useEffect(() => {
    // クリーンアップ
    return () => {
      stopAll()
    }
  }, [])

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t('compare.title')}</h1>
          <Link
            href="/"
            className="text-accent font-medium text-sm hover:opacity-70 transition-opacity"
          >
            {t('compare.backToHome')}
          </Link>
        </div>

        <div className="mb-6 bg-surface rounded-apple shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {t('compare.selectedPokemon')} ({selectedPokemons.length}/10)
            </h2>
            {selectedPokemons.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={playAllSequentially}
                  disabled={isPlayingAll}
                  className="bg-black hover:bg-gray-900 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
                >
                  {isPlayingAll ? t('compare.playing') : t('compare.playAll')}
                </button>
                <button
                  onClick={stopAll}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
                >
                  {t('compare.stop')}
                </button>
                <button
                  onClick={clearSelection}
                  className="bg-background hover:bg-gray-200 text-secondary font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
                >
                  {t('compare.clear')}
                </button>
              </div>
            )}
          </div>

          {selectedPokemons.length === 0 ? (
            <p className="text-secondary text-center py-8">
              {t('compare.selectInstruction')}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {selectedPokemons.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className="bg-background rounded-xl p-4 border-2 border-accent/30 relative"
                >
                  <button
                    onClick={() => removePokemon(pokemon.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    title={t('compare.delete')}
                  >
                    ×
                  </button>
                  <img
                    src={pokemon.imagePath}
                    alt={getPokemonName(pokemon)}
                    className="w-20 h-20 object-contain mx-auto mb-2"
                  />
                  <p className="text-xs text-center text-secondary font-semibold mb-1">{pokemon.id}</p>
                  <p className="text-sm text-center font-semibold mb-3">{getPokemonName(pokemon)}</p>
                  <button
                    onClick={() => playPokemon(pokemon)}
                    disabled={playingId === pokemon.id || isPlayingAll}
                    className={`w-full py-2 px-3 rounded-xl font-semibold text-sm transition-colors ${
                      playingId === pokemon.id
                        ? 'bg-accent text-white'
                        : 'bg-black hover:bg-gray-900 text-white disabled:bg-gray-300'
                    }`}
                  >
                    {playingId === pokemon.id ? t('compare.playing') : t('compare.play')}
                  </button>
                  <audio
                    ref={(el) => {
                      if (el) audioRefs.current[pokemon.id] = el
                    }}
                    src={pokemon.soundPath}
                    preload="auto"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-apple shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('compare.pokemonList')}</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
            <button
              onClick={() => setFilterGeneration(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterGeneration === null ? 'bg-black text-white shadow-sm' : 'bg-background text-secondary hover:bg-gray-200'
              }`}
            >
              {t('generation.all')}
            </button>
            {GENERATIONS.map((gen) => (
              <button
                key={gen.id}
                onClick={() => setFilterGeneration(gen.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterGeneration === gen.id ? 'bg-black text-white shadow-sm' : 'bg-background text-secondary hover:bg-gray-200'
                }`}
              >
                {language === 'en' ? gen.regionEn : gen.region}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
            {displayList.map((pokemon) => {
              const isSelected = selectedPokemons.some(p => p.id === pokemon.id)
              return (
                <div
                  key={pokemon.id}
                  onClick={() => togglePokemon(pokemon)}
                  className={`relative cursor-pointer bg-surface rounded-xl p-2 border-2 transition-colors ${
                    isSelected
                      ? 'border-accent bg-accent/5'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-accent text-white rounded-full flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                  <img
                    src={pokemon.imagePath}
                    alt={getPokemonName(pokemon)}
                    className="w-16 h-16 object-contain mx-auto"
                  />
                  <p className="text-xs text-center mt-1 text-secondary font-semibold">{pokemon.id}</p>
                  <p className="text-xs text-center mt-1">{getPokemonName(pokemon)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

