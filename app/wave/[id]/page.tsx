'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPokemonById, Pokemon } from '@/lib/pokemon'
import { useLanguage } from '@/lib/LanguageContext'
import { getTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

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

    const drawWaveform = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const response = await fetch(pokemon.soundPath)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = canvas.width
        const height = canvas.height
        const channelData = audioBuffer.getChannelData(0)
        const dataLength = channelData.length

        // 背景をクリア
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)

        // グリッド線を描画
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

        // 波形を描画
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.beginPath()

        const centerY = height / 2
        const samplesPerPixel = Math.floor(dataLength / width)

        for (let x = 0; x < width; x++) {
          const start = x * samplesPerPixel
          const end = Math.min(start + samplesPerPixel, dataLength)
          
          let min = 0
          let max = 0
          
          for (let i = start; i < end; i++) {
            const value = channelData[i]
            if (value < min) min = value
            if (value > max) max = value
          }

          const y1 = centerY + min * centerY * 0.8
          const y2 = centerY + max * centerY * 0.8

          if (x === 0) {
            ctx.moveTo(x, y1)
          } else {
            ctx.lineTo(x, y1)
          }
          ctx.lineTo(x, y2)
        }

        ctx.stroke()

        // 中央線を描画
        ctx.strokeStyle = '#9ca3af'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, centerY)
        ctx.lineTo(width, centerY)
        ctx.stroke()

        setLoading(false)
      } catch (err) {
        console.error('波形描画エラー:', err)
        setError(getTranslation(language, 'wave.error'))
        setLoading(false)
      }
    }

    drawWaveform()
  }, [pokemon, language])

  if (!pokemon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LanguageSwitcher className="fixed top-4 right-4 z-50" />
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('wave.notFound')}</p>
          <button
            onClick={() => router.push('/list')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            {t('wave.backToList')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <LanguageSwitcher className="fixed top-4 right-4 z-50" />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
              {getPokemonName(pokemon)}{t('wave.title')}
            </h1>
            <p className="text-center text-gray-500 mb-4">ID: {pokemon.id}</p>
            
            <div className="flex justify-center mb-4">
              <img
                src={pokemon.imagePath}
                alt={getPokemonName(pokemon)}
                className="w-32 h-32 object-contain"
              />
            </div>

            <div className="flex justify-center mb-4">
              <audio controls className="w-full max-w-md">
                <source src={pokemon.soundPath} type="audio/wav" />
                {t('quiz.audioNotSupported')}
              </audio>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">{t('wave.loading')}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <canvas
              ref={canvasRef}
              width={800}
              height={300}
              className="w-full h-auto border border-gray-300 rounded"
            />
          </div>

          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {t('wave.back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

