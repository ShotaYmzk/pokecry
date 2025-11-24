'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getRandomPokemon, Pokemon } from '@/lib/pokemon'
import { addToWeakList } from '@/lib/storage'

export default function QuizInputPage() {
  const router = useRouter()
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    loadNewQuestion()
  }, [])

  useEffect(() => {
    // 新しい問題が読み込まれたら入力欄にフォーカス
    if (inputRef.current && !showResult) {
      inputRef.current.focus()
    }
  }, [currentPokemon, showResult])

  const loadNewQuestion = () => {
    const pokemon = getRandomPokemon()
    setCurrentPokemon(pokemon)
    setUserAnswer('')
    setIsCorrect(null)
    setShowResult(false)
    
    // 音声をリセット
    if (audioRef.current) {
      audioRef.current.load()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPokemon || userAnswer.trim() === '') return
    
    const correct = userAnswer.trim() === currentPokemon.name
    setIsCorrect(correct)
    setShowResult(true)

    // 不正解の場合、weakListに追加
    if (!correct) {
      addToWeakList(currentPokemon.id)
    }
  }

  const handleNext = () => {
    loadNewQuestion()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit(e)
    }
  }

  if (!currentPokemon) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            ポケモン鳴き声クイズ（名前入力）
          </h1>

          <div className="mb-6">
            <p className="text-center text-gray-600 mb-4">
              このポケモンの鳴き声を聞いて、名前を入力してください
            </p>
            <div className="flex justify-center">
              <audio 
                ref={audioRef}
                key={currentPokemon.id}
                controls 
                className="w-full max-w-md"
                autoPlay={false}
              >
                <source src={currentPokemon.soundPath} type="audio/wav" />
                お使いのブラウザは音声再生に対応していません。
              </audio>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="pokemon-name" className="block text-gray-700 font-semibold mb-2">
                ポケモンの名前
              </label>
              <input
                ref={inputRef}
                id="pokemon-name"
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={showResult}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="例: ピカチュウ"
                autoComplete="off"
              />
            </div>
            {!showResult && (
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={userAnswer.trim() === ''}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  回答する
                </button>
              </div>
            )}
          </form>

          {showResult && (
            <div className="mb-6">
              {isCorrect ? (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700 mb-2">✓ 正解！</p>
                  <img
                    src={currentPokemon.imagePath}
                    alt={currentPokemon.name}
                    className="w-32 h-32 mx-auto object-contain"
                  />
                  <p className="text-lg text-gray-700 mt-2">{currentPokemon.name}</p>
                </div>
              ) : (
                <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-700 mb-2">✗ 不正解</p>
                  <p className="text-lg text-gray-700 mb-2">
                    あなたの回答: <span className="font-bold">{userAnswer}</span>
                  </p>
                  <p className="text-lg text-gray-700">
                    正解は <span className="font-bold">{currentPokemon.name}</span> でした
                  </p>
                  <img
                    src={currentPokemon.imagePath}
                    alt={currentPokemon.name}
                    className="w-32 h-32 mx-auto object-contain mt-4"
                  />
                </div>
              )}
            </div>
          )}

          {showResult && (
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                次の問題へ
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

