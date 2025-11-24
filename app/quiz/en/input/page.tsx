'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getRandomPokemon, Pokemon } from '@/lib/pokemon'
import { addToWeakList } from '@/lib/storage'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'

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
    if (inputRef.current && !showResult) {
      inputRef.current.focus()
    }
  }, [currentPokemon, showResult])

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
    
    const correct = userAnswer.trim().toLowerCase() === getPokemonName(currentPokemon).toLowerCase()
    setIsCorrect(correct)
    setShowResult(true)

    if (!correct) {
      addToWeakList(currentPokemon.id)
    }
  }

  if (!currentPokemon) return null

  return (
    <div className="p-6 md:p-8 min-h-screen md:h-screen md:overflow-hidden flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 flex-1 h-full">
        
        {/* Center Column: Question Visual */}
        <div className="flex flex-col items-center justify-center bg-surface rounded-apple shadow-sm p-8 md:h-full relative overflow-hidden">
          <header className="mb-8 text-center absolute top-8 z-10">
             <span className="inline-block px-3 py-1 bg-blue-50 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider">English Input</span>
             <h1 className="text-2xl font-bold mt-2">{t('quizEnInput.title')}</h1>
          </header>

          <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
             <div className="bg-white rounded-apple shadow-float p-10 w-full text-center mb-8">
                <p className="text-sm text-secondary uppercase tracking-wider mb-2">Japanese Name</p>
                <h2 className="text-4xl md:text-5xl font-bold text-primary">{currentPokemon.name}</h2>
            </div>
             <p className="mt-4 text-secondary text-sm">
                {t('quizEnInput.instruction')}
             </p>
          </div>
        </div>

        {/* Right Column: Input Controls */}
        <div className="flex flex-col justify-center h-full">
          <div className="bg-surface rounded-apple p-6 shadow-float">
             <h3 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wider">Your Answer (English)</h3>
             
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="pokemon-name" className="sr-only">Pokemon Name</label>
                    <input
                        ref={inputRef}
                        id="pokemon-name"
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={showResult}
                        className="w-full px-4 py-4 bg-background rounded-xl border-2 border-transparent focus:border-accent focus:bg-white transition-all outline-none text-lg font-medium placeholder-gray-400"
                        placeholder={t('quizEnInput.placeholder')}
                        autoComplete="off"
                    />
                </div>
                
                {!showResult && (
                    <button
                        type="submit"
                        disabled={!userAnswer.trim()}
                        className="w-full bg-black text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-all hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('quizInput.submit')}
                    </button>
                )}
             </form>

             {showResult && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-slide-up">
                   <div className="flex items-center gap-4 mb-4">
                      <img 
                        src={currentPokemon.imagePath} 
                        alt={getPokemonName(currentPokemon)}
                        className="w-16 h-16 object-contain bg-background rounded-lg p-2"
                      />
                      <div>
                        <p className={`text-lg font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {isCorrect ? t('quiz.correct') : t('quiz.incorrect')}
                        </p>
                        {!isCorrect && (
                            <div className="text-sm">
                                <p className="text-secondary line-through">{userAnswer}</p>
                                <p className="font-bold text-primary">{getPokemonName(currentPokemon)}</p>
                            </div>
                        )}
                        {isCorrect && (
                            <p className="text-sm text-primary">{getPokemonName(currentPokemon)}</p>
                        )}
                      </div>
                   </div>
                   <button
                    onClick={loadNewQuestion}
                    className="w-full bg-black text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-transform hover:bg-gray-900"
                  >
                    {t('quiz.nextQuestion')}
                  </button>
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  )
}
