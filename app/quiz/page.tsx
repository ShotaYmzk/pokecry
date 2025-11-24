'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getRandomPokemon, getRandomPokemons, shuffleArray, Pokemon } from '@/lib/pokemon'
import { addToWeakList } from '@/lib/storage'

export default function QuizPage() {
  const router = useRouter()
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [choices, setChoices] = useState<Pokemon[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    loadNewQuestion()
  }, [])

  const loadNewQuestion = () => {
    const pokemon = getRandomPokemon()
    const wrongChoices = getRandomPokemons(3, pokemon.id)
    const allChoices = shuffleArray([pokemon, ...wrongChoices])
    
    setCurrentPokemon(pokemon)
    setChoices(allChoices)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setShowResult(false)
  }

  const handleAnswer = (choiceId: string) => {
    if (selectedAnswer !== null) return // 既に回答済み
    
    const correct = choiceId === currentPokemon?.id
    setSelectedAnswer(choiceId)
    setIsCorrect(correct)
    setShowResult(true)

    // 不正解の場合、weakListに追加
    if (!correct && currentPokemon) {
      addToWeakList(currentPokemon.id)
    }
  }

  const handleNext = () => {
    loadNewQuestion()
  }

  if (!currentPokemon) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            ポケモン鳴き声クイズ
          </h1>

          <div className="mb-6">
            <p className="text-center text-gray-600 mb-4">
              このポケモンの鳴き声を聞いて、正しい名前を選んでください
            </p>
            <div className="flex justify-center">
              <audio 
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
                buttonClass += 'bg-blue-500 hover:bg-blue-600 text-white'
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

