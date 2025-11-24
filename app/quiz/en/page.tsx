'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getRandomPokemon, getRandomPokemons, shuffleArray, Pokemon } from '@/lib/pokemon'
import { addToWeakList } from '@/lib/storage'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function QuizEnPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [choices, setChoices] = useState<Pokemon[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LanguageSwitcher />
        {t('quizEn.loading')}
      </div>
    )
  }

  // 英語名を常に使用
  const getPokemonName = (pokemon: Pokemon) => {
    return pokemon.nameEn
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <LanguageSwitcher />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {t('quizEn.title')}
          </h1>

          <div className="mb-6">
            <p className="text-center text-gray-600 mb-4">
              {t('quizEn.instruction')}
            </p>
            <div className="flex justify-center mb-6">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <p className="text-3xl font-bold text-center text-gray-800">
                  {currentPokemon.name}
                </p>
              </div>
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
                  {getPokemonName(choice)}
                </button>
              )
            })}
          </div>

          {showResult && (
            <div className="mb-6">
              {isCorrect ? (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700 mb-2">{t('quiz.correct')}</p>
                  <img
                    src={currentPokemon.imagePath}
                    alt={getPokemonName(currentPokemon)}
                    className="w-32 h-32 mx-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setIsImageModalOpen(true)}
                  />
                  <p className="text-lg text-gray-700 mt-2">{getPokemonName(currentPokemon)}</p>
                  <p className="text-sm text-gray-500 mt-1">{currentPokemon.name}</p>
                </div>
              ) : (
                <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-700 mb-2">{t('quiz.incorrect')}</p>
                  <p className="text-lg text-gray-700">
                    {t('quiz.correctAnswer')} <span className="font-bold">{getPokemonName(currentPokemon)}</span> {t('quiz.was')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{currentPokemon.name}</p>
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
                {t('quiz.nextQuestion')}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              {t('quiz.backToHome')}
            </button>
          </div>
        </div>
      </div>

      {/* 画像拡大モーダル */}
      {isImageModalOpen && currentPokemon && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={currentPokemon.imagePath}
              alt={getPokemonName(currentPokemon)}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

