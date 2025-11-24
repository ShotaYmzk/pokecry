'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { POKEMON_LIST, getRandomPokemons, shuffleArray, Pokemon, getPokemonById } from '@/lib/pokemon'
import { getWeakList, addToWeakList } from '@/lib/storage'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function WeakPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [weakList, setWeakList] = useState<string[]>([])
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [choices, setChoices] = useState<Pokemon[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const getPokemonName = (pokemon: Pokemon) => {
    return language === 'en' ? pokemon.nameEn : pokemon.name
  }

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
        <LanguageSwitcher />
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">{t('weak.title')}</h1>
          <p className="text-gray-600 mb-6">
            {t('weak.emptyMessage')}<br />
            {t('weak.emptyDescription')}
          </p>
          <button
            onClick={() => router.push('/quiz')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t('weak.startNormalQuiz')}
          </button>
          <div className="mt-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              {t('weak.backToHome')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentPokemon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LanguageSwitcher />
        {t('weak.loading')}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <LanguageSwitcher />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
            {t('weak.title')}
          </h1>
          <p className="text-center text-gray-500 mb-6 text-sm">
            {t('weak.weakList')}: {weakList.length}{t('weak.count')}
          </p>

          <div className="mb-6">
            <p className="text-center text-gray-600 mb-4">
              {t('quiz.instruction')}
            </p>
            <div className="flex justify-center">
              <audio controls className="w-full max-w-md">
                <source src={currentPokemon.soundPath} type="audio/wav" />
                {t('quiz.audioNotSupported')}
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
                </div>
              ) : (
                <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-700 mb-2">{t('quiz.incorrect')}</p>
                  <p className="text-lg text-gray-700">
                    {t('quiz.correctAnswer')} <span className="font-bold">{getPokemonName(currentPokemon)}</span> {t('quiz.was')}
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
                {t('quiz.nextQuestion')}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              {t('weak.backToHome')}
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

