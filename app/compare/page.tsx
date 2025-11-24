'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { POKEMON_LIST, Pokemon } from '@/lib/pokemon'
import Link from 'next/link'

export default function ComparePage() {
  const router = useRouter()
  const [selectedPokemons, setSelectedPokemons] = useState<Pokemon[]>([])
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isPlayingAll, setIsPlayingAll] = useState(false)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const playAllTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const togglePokemon = (pokemon: Pokemon) => {
    const isSelected = selectedPokemons.some(p => p.id === pokemon.id)
    if (isSelected) {
      setSelectedPokemons(selectedPokemons.filter(p => p.id !== pokemon.id))
    } else {
      if (selectedPokemons.length < 10) {
        setSelectedPokemons([...selectedPokemons, pokemon])
      } else {
        alert('最大10匹まで選択できます')
      }
    }
  }

  const removePokemon = (id: string) => {
    setSelectedPokemons(selectedPokemons.filter(p => p.id !== id))
    // 再生中の場合は停止
    if (playingId === id) {
      const audio = audioRefs.current[id]
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      setPlayingId(null)
    }
  }

  const playPokemon = async (pokemon: Pokemon) => {
    // 他の再生を停止
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    })
    setPlayingId(null)
    setIsPlayingAll(false)

    // 選択したポケモンの音声を再生
    const audio = audioRefs.current[pokemon.id]
    if (audio) {
      audio.currentTime = 0
      await audio.play()
      setPlayingId(pokemon.id)
      audio.onended = () => setPlayingId(null)
    }
  }

  const playAllSequentially = async () => {
    if (selectedPokemons.length === 0) return

    // 全ての再生を停止
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    })
    setPlayingId(null)
    setIsPlayingAll(true)

    for (let i = 0; i < selectedPokemons.length; i++) {
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
          audio.play().catch(() => resolve())
        })

        // 次の音声までの間隔（0.5秒）
        if (i < selectedPokemons.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }

    setIsPlayingAll(false)
    setPlayingId(null)
  }

  const stopAll = () => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">ポケモン鳴き声聴き比べ</h1>
          <Link
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            ホームに戻る
          </Link>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              選択中のポケモン ({selectedPokemons.length}/10)
            </h2>
            {selectedPokemons.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={playAllSequentially}
                  disabled={isPlayingAll}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {isPlayingAll ? '再生中...' : '全て順番に再生'}
                </button>
                <button
                  onClick={stopAll}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  停止
                </button>
                <button
                  onClick={clearSelection}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  クリア
                </button>
              </div>
            )}
          </div>

          {selectedPokemons.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              下のリストからポケモンを選択してください（最大10匹）
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {selectedPokemons.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className="bg-gray-50 rounded-lg p-4 border-2 border-blue-300 relative"
                >
                  <button
                    onClick={() => removePokemon(pokemon.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    title="削除"
                  >
                    ×
                  </button>
                  <img
                    src={`/poke_pic/${pokemon.id}.png`}
                    alt={pokemon.name}
                    className="w-20 h-20 object-contain mx-auto mb-2"
                  />
                  <p className="text-xs text-center text-gray-500 font-semibold mb-1">{pokemon.id}</p>
                  <p className="text-sm text-center text-gray-700 font-semibold mb-3">{pokemon.name}</p>
                  <button
                    onClick={() => playPokemon(pokemon)}
                    disabled={playingId === pokemon.id || isPlayingAll}
                    className={`w-full py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                      playingId === pokemon.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300'
                    }`}
                  >
                    {playingId === pokemon.id ? '再生中...' : '再生'}
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

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">ポケモン一覧</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
            {POKEMON_LIST.map((pokemon) => {
              const isSelected = selectedPokemons.some(p => p.id === pokemon.id)
              return (
                <div
                  key={pokemon.id}
                  onClick={() => togglePokemon(pokemon)}
                  className={`relative cursor-pointer bg-white rounded-lg p-2 border-2 transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                  <img
                    src={`/poke_pic/${pokemon.id}.png`}
                    alt={pokemon.name}
                    className="w-16 h-16 object-contain mx-auto"
                  />
                  <p className="text-xs text-center mt-1 text-gray-500 font-semibold">{pokemon.id}</p>
                  <p className="text-xs text-center mt-1 text-gray-700">{pokemon.name}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

