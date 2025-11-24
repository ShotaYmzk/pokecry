'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { POKEMON_LIST, shuffleArray, Pokemon, getPokemonById } from '@/lib/pokemon'
import { getWeakList, addToWeakList } from '@/lib/storage'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'

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
  const [isPlaying, setIsPlaying] = useState(false)

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

    const randomId = weakIds[Math.floor(Math.random() * weakIds.length)]
    const pokemon = getPokemonById(randomId)
    
    if (!pokemon) return

    const availableForChoices = POKEMON_LIST.filter(p => p.id !== pokemon.id)
    const wrongChoices = shuffleArray(availableForChoices).slice(0, 3)
    const allChoices = shuffleArray([pokemon, ...wrongChoices])
    
    setCurrentPokemon(pokemon)
    setChoices(allChoices)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setShowResult(false)
    setIsPlaying(false)
    
    setTimeout(() => playSound(pokemon.soundPath), 500)
  }

  const playSound = (path: string) => {
    const audio = new Audio(path)
    setIsPlaying(true)
    audio.play()
    audio.onended = () => setIsPlaying(false)
  }

  const handleAnswer = (choiceId: string) => {
    if (selectedAnswer !== null) return
    
    const correct = choiceId === currentPokemon?.id
    setSelectedAnswer(choiceId)
    setIsCorrect(correct)
    setShowResult(true)

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
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-float">
          <span className="text-4xl">🎉</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{t('weak.title')}</h1>
        <p className="text-secondary mb-8 max-w-xs mx-auto">
            {t('weak.emptyMessage')}<br />
            {t('weak.emptyDescription')}
          </p>
          <button
            onClick={() => router.push('/quiz')}
          className="bg-black text-white font-bold py-3 px-8 rounded-apple active:scale-[0.98] transition-transform hover:bg-gray-900"
          >
            {t('weak.startNormalQuiz')}
          </button>
      </div>
    )
  }

  if (!currentPokemon) return null

  return (
    <div className="p-6 md:p-8 min-h-screen md:h-screen md:overflow-hidden flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 flex-1 h-full">
        
        {/* Center Column: Training Visual */}
        <div className="flex flex-col items-center justify-center bg-surface rounded-apple shadow-sm p-8 md:h-full relative overflow-hidden">
          <header className="mb-8 text-center absolute top-8 z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-2">
               <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
               <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Weak List: {weakList.length}</span>
             </div>
             <h1 className="text-2xl font-bold">{t('weak.title')}</h1>
          </header>

          <div className="relative z-10 flex flex-col items-center">
            <button
              onClick={() => playSound(currentPokemon.soundPath)}
              className={`w-40 h-40 md:w-64 md:h-64 rounded-full bg-background flex items-center justify-center shadow-float transition-all active:scale-95 group ${isPlaying ? 'scale-105 ring-4 ring-accent/20' : 'hover:scale-105'}`}
            >
              <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full bg-white flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                 <svg 
                  className={`w-12 h-12 md:w-20 md:h-20 text-orange-500 transition-transform ${isPlaying ? 'scale-110' : 'group-hover:scale-110'}`} 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                   <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </button>
            <p className="mt-8 text-secondary font-medium animate-pulse">
              {isPlaying ? t('quiz.playing') : t('quiz.instruction')}
            </p>
          </div>

           {/* Decorative background */}
           <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-100 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-50 rounded-full blur-3xl" />
           </div>
        </div>

        {/* Right Column: Controls */}
        <div className="flex flex-col justify-center h-full">
          <div className="bg-surface rounded-apple p-6 shadow-float md:h-auto">
             <h3 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wider">Identify Pokemon</h3>
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
                onClick={handleNext}
                    className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-transform hover:bg-orange-600 shadow-lg shadow-orange-500/20"
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
