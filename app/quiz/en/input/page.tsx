'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getRandomPokemon, Pokemon } from '@/lib/pokemon'
import { addToWeakList } from '@/lib/storage'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function QuizEnInputPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadNewQuestion()
  }, [])

  useEffect(() => {
    // 新しい問題が読み込まれたら入力欄にフォーカス
    if (inputRef.current && !showResult) {
      inputRef.current.focus()
    }
  }, [currentPokemon, showResult])


  // 英語名を常に使用
  const getPokemonName = (pokemon: Pokemon) => {
    return pokemon.nameEn
  }

  const loadNewQuestion = () => {
    const pokemon = getRandomPokemon()
    setCurrentPokemon(pokemon)
    setUserAnswer('')
    setIsCorrect(null)
    setShowResult(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPokemon || userAnswer.trim() === '') return
    
    // 英語名で比較（大文字小文字を無視）
    const correct = userAnswer.trim().toLowerCase() === getPokemonName(currentPokemon).toLowerCase()
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LanguageSwitcher />
        {t('quizEnInput.loading')}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <LanguageSwitcher />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {t('quizEnInput.title')}
          </h1>

          <div className="mb-6">
            <p className="text-center text-gray-600 mb-4">
              {t('quizEnInput.instruction')}
            </p>
            <div className="flex justify-center mb-6">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <p className="text-3xl font-bold text-center text-gray-800">
                  {currentPokemon.name}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="pokemon-name" className="block text-gray-700 font-semibold mb-2">
                {t('quizEnInput.pokemonName')}
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
                placeholder={t('quizEnInput.placeholder')}
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
                  {t('quizInput.submit')}
                </button>
              </div>
            )}
          </form>

          {showResult && (
            <div className="mb-6">
              {isCorrect ? (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700 mb-2">{t('quiz.correct')}</p>
                  <img
                    src={currentPokemon.imagePath}
                    alt={getPokemonName(currentPokemon)}
                    className="w-32 h-32 mx-auto object-contain"
                  />
                  <p className="text-lg text-gray-700 mt-2">{getPokemonName(currentPokemon)}</p>
                  <p className="text-sm text-gray-500 mt-1">{currentPokemon.name}</p>
                </div>
              ) : (
                <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-700 mb-2">{t('quiz.incorrect')}</p>
                  <p className="text-lg text-gray-700 mb-2">
                    {t('quizInput.yourAnswer')} <span className="font-bold">{userAnswer}</span>
                  </p>
                  <p className="text-lg text-gray-700">
                    {t('quiz.correctAnswer')} <span className="font-bold">{getPokemonName(currentPokemon)}</span> {t('quiz.was')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{currentPokemon.name}</p>
                  <img
                    src={currentPokemon.imagePath}
                    alt={getPokemonName(currentPokemon)}
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
    </div>
  )
}

