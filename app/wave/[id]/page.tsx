'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPokemonById, getGenerationById, Pokemon } from '@/lib/pokemon'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'

export default function WavePage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)
  const id = params.id as string
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pokemon = getPokemonById(id)

  const getPokemonName = (pokemon: Pokemon | undefined) => {
    if (!pokemon) return ''
    return language === 'en' ? pokemon.nameEn : pokemon.name
  }

  useEffect(() => {
    if (!pokemon) {
      setError(getTranslation(language, 'wave.notFound'))
      setLoading(false)
      return
    }

    let cancelled = false
    let audioCtx: AudioContext | null = null

    const drawWaveform = async () => {
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const response = await fetch(pokemon.soundPath)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

        if (cancelled) return
        
        const canvas = canvasRef.current
        if (!canvas) { setLoading(false); return }

        const ctx = canvas.getContext('2d')
        if (!ctx) { setLoading(false); return }

        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)

        const width = rect.width
        const height = rect.height
        const channelData = audioBuffer.getChannelData(0)
        const dataLength = channelData.length

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)

        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        const gridLines = 5
        for (let i = 0; i <= gridLines; i++) {
          const y = (height / gridLines) * i
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }

        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
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
          const y1 = centerY + min * centerY * 0.8
          const y2 = centerY + max * centerY * 0.8
          if (x === 0) ctx.moveTo(x, y1)
          else ctx.lineTo(x, y1)
          ctx.lineTo(x, y2)
        }

        ctx.stroke()

        ctx.strokeStyle = '#9ca3af'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, centerY)
        ctx.lineTo(width, centerY)
        ctx.stroke()

        setLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('波形描画エラー:', err)
        setError(getTranslation(language, 'wave.error'))
        setLoading(false)
      }
    }

    drawWaveform()

    return () => {
      cancelled = true
      if (audioCtx) audioCtx.close().catch(() => {})
    }
  }, [pokemon, language])

  if (!pokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('wave.notFound')}</p>
          <button
            onClick={() => router.push('/list')}
            className="bg-black hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
          >
            {t('wave.backToList')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface rounded-apple shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center mb-2">
              {getPokemonName(pokemon)}{t('wave.title')}
            </h1>
            <p className="text-center text-secondary mb-1">No. {pokemon.id}</p>
            {(() => {
              const gen = getGenerationById(pokemon.generation)
              return gen ? (
                <p className="text-center text-secondary text-sm mb-4">
                  {language === 'en' ? `${gen.nameEn} - ${gen.regionEn}` : `${gen.name} - ${gen.region}`}
                </p>
              ) : null
            })()}
            
            <div className="flex justify-center mb-4">
              <img
                src={pokemon.imagePath}
                alt={getPokemonName(pokemon)}
                className="w-32 h-32 object-contain"
              />
            </div>

            <div className="flex justify-center mb-4">
              <audio controls className="w-full max-w-md">
                <source src={pokemon.soundPath} type={pokemon.soundPath.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav'} />
                {t('quiz.audioNotSupported')}
              </audio>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <p className="text-secondary">{t('wave.loading')}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-background rounded-xl p-4 mb-6">
            <canvas
              ref={canvasRef}
              className="w-full border border-gray-200 rounded-xl"
              style={{ width: '100%', height: '300px' }}
            />
          </div>

          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="bg-black hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              {t('wave.back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

