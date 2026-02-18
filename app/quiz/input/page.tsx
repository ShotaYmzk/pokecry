'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getRandomPokemon, Pokemon } from '@/lib/pokemon'
import { addToWeakList } from '@/lib/storage'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'
import { GenerationSelector } from '@/components/GenerationSelector'

export default function QuizInputPage() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [waveformLoading, setWaveformLoading] = useState(false)
  const [waveformError, setWaveformError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generation, setGeneration] = useState<number | undefined>(undefined)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initial Load
  useEffect(() => {
    loadNewQuestion()
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    }
  }, [])

  // Focus input on new question
  useEffect(() => {
    if (inputRef.current && !showResult) {
      inputRef.current.focus()
    }
  }, [currentPokemon, showResult])

  // Draw waveform
  useEffect(() => {
    if (!currentPokemon) return

    let cancelled = false
    let audioCtx: AudioContext | null = null

    const drawWaveform = async () => {
      try {
        setWaveformLoading(true)
        setWaveformError(null)
        
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const response = await fetch(currentPokemon.soundPath)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

        if (cancelled) return
        
        const canvas = canvasRef.current
        if (!canvas) { setWaveformLoading(false); return }

        const ctx = canvas.getContext('2d')
        if (!ctx) { setWaveformLoading(false); return }

        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)

        const width = rect.width
        const height = rect.height
        const channelData = audioBuffer.getChannelData(0)
        const dataLength = channelData.length

        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = '#F5F5F7'
        ctx.fillRect(0, 0, width, height)

        ctx.strokeStyle = '#E5E5E5'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
        ctx.stroke()

        ctx.strokeStyle = '#007AFF'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.beginPath()

        const centerY = height / 2
        const samplesPerPixel = Math.floor(dataLength / width)

        for (let x = 0; x < width; x++) {
          const start = x * samplesPerPixel
          const end = Math.min(start + samplesPerPixel, dataLength)
          let min = 0, max = 0
          for (let i = start; i < end; i++) {
            const value = channelData[i]
            if (value < min) min = value
            if (value > max) max = value
          }
          ctx.moveTo(x, centerY + min * centerY * 0.9)
          ctx.lineTo(x, centerY + max * centerY * 0.9)
        }

        ctx.stroke()
        setWaveformLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('Waveform error:', err)
        setWaveformError(getTranslation(language, 'quizInput.waveformError'))
        setWaveformLoading(false)
      }
    }

    requestAnimationFrame(() => { drawWaveform() })

    return () => {
      cancelled = true
      if (audioCtx) audioCtx.close().catch(() => {})
    }
  }, [currentPokemon, language])

  const getPokemonName = (pokemon: Pokemon) => {
    return language === 'en' ? pokemon.nameEn : pokemon.name
  }

  const handleGenerationChange = useCallback((gen: number | undefined) => {
    setGeneration(gen)
    const pokemon = getRandomPokemon(gen)
    setCurrentPokemon(pokemon)
    setUserAnswer('')
    setIsCorrect(null)
    setShowResult(false)
    setIsPlaying(false)
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
    autoPlayTimerRef.current = setTimeout(() => playSound(pokemon.soundPath), 500)
  }, [])

  const loadNewQuestion = () => {
    const pokemon = getRandomPokemon(generation)
    setCurrentPokemon(pokemon)
    setUserAnswer('')
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
        
        {/* Center Column: Visuals */}
        <div className="flex flex-col items-center justify-center bg-surface rounded-apple shadow-sm p-8 relative overflow-hidden">
          <header className="mb-8 text-center absolute top-8 z-10 w-full px-8">
             <span className="inline-block px-3 py-1 bg-purple-50 rounded-full text-xs font-bold text-purple-600 uppercase tracking-wider">{t('quizInput.expertMode')}</span>
             <h1 className="text-2xl font-bold mt-2">{t('quizInput.title')}</h1>
             <div className="mt-3 flex justify-center">
               <GenerationSelector value={generation} onChange={handleGenerationChange} />
             </div>
          </header>

          <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
            <button
              onClick={() => playSound(currentPokemon.soundPath)}
              className={`w-32 h-32 md:w-48 md:h-48 rounded-full bg-background flex items-center justify-center shadow-float transition-all active:scale-95 mb-8 group ${isPlaying ? 'scale-105 ring-4 ring-accent/20' : 'hover:scale-105'}`}
            >
              <div className={`w-24 h-24 md:w-36 md:h-36 rounded-full bg-white flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                 <svg 
                  className={`w-10 h-10 md:w-16 md:h-16 text-accent transition-transform ${isPlaying ? 'scale-110' : 'group-hover:scale-110'}`} 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                   <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>

            {/* Waveform Canvas Container */}
            <div className="w-full h-32 md:h-48 bg-background rounded-xl relative overflow-hidden shadow-inner">
                {waveformLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-secondary text-sm">
                        {t('quizInput.loading')}
                    </div>
                )}
                <canvas 
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
             <p className="mt-4 text-secondary text-sm">
                {t('quizInput.instruction')}
             </p>
          </div>
        </div>

        {/* Right Column: Input Controls */}
        <div className="flex flex-col justify-center h-full">
          <div className="bg-surface rounded-apple p-6 shadow-float">
             <h3 className="text-sm font-bold text-secondary mb-4 uppercase tracking-wider">{t('quizInput.yourAnswer')}</h3>
             
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
                        placeholder={t('quizInput.placeholder')}
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
