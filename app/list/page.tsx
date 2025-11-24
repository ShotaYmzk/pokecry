'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { POKEMON_LIST } from '@/lib/pokemon'
import Link from 'next/link'

export default function ListPage() {
  const router = useRouter()
  const [playingId, setPlayingId] = useState<string | null>(null)
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)

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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">ポケモン一覧（鳴き声図鑑）</h1>
          <Link
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
        <p className="text-gray-600 mb-4">
          画像をクリック/タップで鳴き声を再生。長押しで波形を表示します。
        </p>
        <div className="grid grid-cols-10 gap-2">
          {POKEMON_LIST.map((pokemon) => (
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
                alt={pokemon.name}
                className="w-20 h-20 object-contain mx-auto"
              />
              <p className="text-xs text-center mt-1 text-gray-500 font-semibold">{pokemon.id}</p>
              <p className="text-xs text-center mt-1 text-gray-700">{pokemon.name}</p>
              {playingId === pokemon.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-200 bg-opacity-50 rounded-lg">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

