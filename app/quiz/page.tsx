'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getRandomPokemon, getRandomPokemons, shuffleArray, Pokemon } from '@/lib/pokemon'
import { addToWeakList } from '@/lib/storage'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'
import { GenerationSelector } from '@/components/GenerationSelector'

export default function QuizPage() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [choices, setChoices] = useState<Pokemon[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generation, setGeneration] = useState<number | undefined>(undefined)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadNewQuestion()
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    }
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
    setIsPlaying(false)
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
    autoPlayTimerRef.current = setTimeout(() => playSound(pokemon.soundPath), 500)
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
    setIsPlaying(false)
    
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
    autoPlayTimerRef.current = setTimeout(() => playSound(pokemon.soundPath), 500)
  }

  const playSound = (path: string) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    const audio = new Audio(path)
    audioRef.current = audio
    setIsPlaying(true)
    audio.play().catch(() => setIsPlaying(false))
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
    }
  }

  const getPokemonName = (pokemon: Pokemon) => {
    return language === 'en' ? pokemon.nameEn : pokemon.name
  }

  if (!currentPokemon) return null

  return (
    <div className="p-6 md:p-8 min-h-screen md:h-screen md:overflow-hidden flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 flex-1 h-full">
        
        {/* Center Column: Battle Visual */}
        <div className="flex flex-col items-center justify-center bg-surface rounded-apple shadow-sm p-8 md:h-full relative overflow-hidden">
          <header className="mb-8 text-center absolute top-8 z-10 w-full px-8">
             <span className="inline-block px-3 py-1 bg-background rounded-full text-xs font-bold text-secondary uppercase tracking-wider">{t('quiz.battleMode')}</span>
             <h1 className="text-2xl font-bold mt-2">{t('quiz.title')}</h1>
             <div className="mt-3 flex justify-center">
               <GenerationSelector value={generation} onChange={handleGenerationChange} />
             </div>
          </header>

          <div className="relative z-10 flex flex-col items-center">
            <button
              onClick={() => playSound(currentPokemon.soundPath)}
              className={`w-40 h-40 md:w-64 md:h-64 rounded-full bg-background flex items-center justify-center shadow-float transition-all active:scale-95 group ${isPlaying ? 'scale-105 ring-4 ring-accent/20' : 'hover:scale-105'}`}
            >
              <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full bg-white flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                 <svg 
                  className={`w-12 h-12 md:w-20 md:h-20 text-accent transition-transform ${isPlaying ? 'scale-110' : 'group-hover:scale-110'}`} 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                   <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
            <p className="mt-8 text-secondary font-medium animate-pulse">
              {isPlaying ? t('quiz.playing') : t('quiz.instruction')}
            </p>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gray-100 rounded-full -z-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-gray-50 rounded-full -z-0" />
        </div>

        {/* Right Column: Controls */}
        <div className="flex flex-col justify-center h-full">
          <div className="bg-surface rounded-apple p-6 shadow-float md:h-auto">
             <h3 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wider">{t('quiz.selectAnswer')}</h3>
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
