'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRandomPokemon, getRandomPokemons, shuffleArray, Pokemon } from '@/lib/pokemon'
import { addToWeakList } from '@/lib/storage'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'
import { GenerationSelector } from '@/components/GenerationSelector'

export default function QuizEnPage() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [choices, setChoices] = useState<Pokemon[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [generation, setGeneration] = useState<number | undefined>(undefined)

  useEffect(() => {
    loadNewQuestion()
  }, [])

  const handleGenerationChange = useCallback((gen: number | undefined) => {
    setGeneration(gen)
    const pokemon = getRandomPokemon(gen)
    const wrongChoices = getRandomPokemons(3, pokemon.id, gen)
    const allChoices = shuffleArray([pokemon, ...wrongChoices])
    setCurrentPokemon(pokemon)
    setChoices(allChoices)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setShowResult(false)
  }, [])

  const loadNewQuestion = () => {
    const pokemon = getRandomPokemon(generation)
    const wrongChoices = getRandomPokemons(3, pokemon.id, generation)
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

    if (!correct && currentPokemon) {
      addToWeakList(currentPokemon.id)
    }
  }

  const getPokemonName = (pokemon: Pokemon) => {
    return pokemon.nameEn // Always English for choices
  }

  if (!currentPokemon) return null

  return (
    <div className="p-6 md:p-8 min-h-screen md:h-screen md:overflow-hidden flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 flex-1 h-full">
        
        {/* Center Column: Question Visual */}
        <div className="flex flex-col items-center justify-center bg-surface rounded-apple shadow-sm p-8 md:h-full relative overflow-hidden">
          <header className="mb-8 text-center absolute top-8 z-10 w-full px-8">
             <span className="inline-block px-3 py-1 bg-blue-50 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider">{t('quizEn.englishQuiz')}</span>
             <h1 className="text-2xl font-bold mt-2">{t('quizEn.title')}</h1>
             <div className="mt-3 flex justify-center">
               <GenerationSelector value={generation} onChange={handleGenerationChange} />
             </div>
          </header>

          <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
            <div className="bg-white rounded-apple shadow-float p-10 w-full text-center mb-8">
                <p className="text-sm text-secondary uppercase tracking-wider mb-2">{t('quizEn.japaneseName')}</p>
                <h2 className="text-4xl md:text-5xl font-bold text-primary">{currentPokemon.name}</h2>
            </div>
            <p className="text-secondary font-medium">
              {t('quizEn.instruction')}
            </p>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gray-100 rounded-full -z-0" />
        </div>

        {/* Right Column: Controls */}
        <div className="flex flex-col justify-center h-full">
          <div className="bg-surface rounded-apple p-6 shadow-float md:h-auto">
             <h3 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wider">{t('quizEn.selectEnglishName')}</h3>
             <div className="grid grid-cols-1 gap-3">
                {choices.map((choice) => {
                  const isSelected = selectedAnswer === choice.id
                  const isCorrectChoice = choice.id === currentPokemon.id
                  let buttonClass = 'w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 border-2 text-left '

                  if (showResult) {
                    if (isCorrectChoice) {
                      buttonClass += 'bg-green-50 border-green-500 text-green-700'
                    } else if (isSelected) {
                      buttonClass += 'bg-red-50 border-red-500 text-red-700'
                    } else {
                      buttonClass += 'bg-background border-transparent text-secondary opacity-50'
                    }
                  } else {
                    buttonClass += 'bg-background border-transparent hover:bg-gray-50 hover:border-gray-200 active:scale-[0.98]'
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
                        <p className="text-sm text-primary">
                          {getPokemonName(currentPokemon)}
                        </p>
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
