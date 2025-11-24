'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { POKEMON_LIST, getRandomPokemons, shuffleArray, Pokemon, getPokemonById } from '@/lib/pokemon'
import { getWeakList, addToWeakList } from '@/lib/storage'

export default function WeakPage() {
  const router = useRouter()
  const [weakList, setWeakList] = useState<string[]>([])
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [choices, setChoices] = useState<Pokemon[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    const weak = getWeakList()
    setWeakList(weak)
    
    if (weak.length > 0) {
      loadNewQuestion(weak)
    }
  }, [])

  const loadNewQuestion = (weakIds: string[]) => {
    if (weakIds.length === 0) return

    // weakListからランダムに1体を選択
    const randomId = weakIds[Math.floor(Math.random() * weakIds.length)]
    const pokemon = getPokemonById(randomId)
    
    if (!pokemon) return

    // 他の選択肢を生成（weakList以外からも選べる）
    const availableForChoices = POKEMON_LIST.filter(p => p.id !== pokemon.id)
    const wrongChoices = shuffleArray(availableForChoices).slice(0, 3)
    const allChoices = shuffleArray([pokemon, ...wrongChoices])
    
    setCurrentPokemon(pokemon)
    setChoices(allChoices)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setShowResult(false)
  }

  const handleAnswer = (choiceId: string) => {
    if (selectedAnswer !== null) return
    
    const correct = choiceId === currentPokemon?.id
    setSelectedAnswer(choiceId)
    setIsCorrect(correct)
    setShowResult(true)

    // 不正解の場合のみ、weakListに再追加（重複は防ぐ）
    if (!correct && currentPokemon) {
      addToWeakList(currentPokemon.id)
      const updatedWeak = getWeakList()
      setWeakList(updatedWeak)
    }
  }

  const handleNext = () => {
    loadNewQuestion(weakList)
  }

  if (weakList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">苦手ポケモンクイズ</h1>
          <p className="text-gray-600 mb-6">
            苦手リストが空です。<br />
            通常クイズで間違えたポケモンが自動的に追加されます。
          </p>
          <button
            onClick={() => router.push('/quiz')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            通常クイズを始める
          </button>
          <div className="mt-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentPokemon) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
            苦手ポケモンクイズ
          </h1>
          <p className="text-center text-gray-500 mb-6 text-sm">
            苦手リスト: {weakList.length}匹
          </p>

          <div className="mb-6">
            <p className="text-center text-gray-600 mb-4">
              このポケモンの鳴き声を聞いて、正しい名前を選んでください
            </p>
            <div className="flex justify-center">
              <audio controls className="w-full max-w-md">
                <source src={currentPokemon.soundPath} type="audio/wav" />
                お使いのブラウザは音声再生に対応していません。
              </audio>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {choices.map((choice) => {
              const isSelected = selectedAnswer === choice.id
              const isCorrectChoice = choice.id === currentPokemon.id
              let buttonClass = 'w-full py-4 px-6 rounded-lg font-semibold transition-colors '

              if (showResult) {
                if (isCorrectChoice) {
                  buttonClass += 'bg-green-500 text-white'
                } else if (isSelected) {
                  buttonClass += 'bg-red-500 text-white'
                } else {
                  buttonClass += 'bg-gray-200 text-gray-600'
                }
              } else {
                buttonClass += 'bg-orange-500 hover:bg-orange-600 text-white'
              }

              return (
                <button
                  key={choice.id}
                  onClick={() => handleAnswer(choice.id)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  {choice.name}
                </button>
              )
            })}
          </div>

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
                  <p className="text-lg text-gray-700">
                    正解は <span className="font-bold">{currentPokemon.name}</span> でした
                  </p>
                </div>
              )}
            </div>
          )}

          {showResult && (
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
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

