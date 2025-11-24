'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getRandomPokemon, Pokemon } from '@/lib/pokemon'
import { addToWeakList } from '@/lib/storage'

export default function QuizInputPage() {
  const router = useRouter()
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [waveformLoading, setWaveformLoading] = useState(false)
  const [waveformError, setWaveformError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadNewQuestion()
  }, [])

  useEffect(() => {
    // 新しい問題が読み込まれたら入力欄にフォーカス
    if (inputRef.current && !showResult) {
      inputRef.current.focus()
    }
  }, [currentPokemon, showResult])

  useEffect(() => {
    // 波形を描画
    if (!currentPokemon) return

    const drawWaveform = async () => {
      try {
        setWaveformLoading(true)
        setWaveformError(null)
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const response = await fetch(currentPokemon.soundPath)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        const canvas = canvasRef.current
        if (!canvas) {
          setWaveformLoading(false)
          return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setWaveformLoading(false)
          return
        }

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

        setWaveformLoading(false)
      } catch (err) {
        console.error('波形描画エラー:', err)
        setWaveformError('波形の描画に失敗しました')
        setWaveformLoading(false)
      }
    }

    drawWaveform()
  }, [currentPokemon])

  const loadNewQuestion = () => {
    const pokemon = getRandomPokemon()
    setCurrentPokemon(pokemon)
    setUserAnswer('')
    setIsCorrect(null)
    setShowResult(false)
    
    // 音声をリセット
    if (audioRef.current) {
      audioRef.current.load()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPokemon || userAnswer.trim() === '') return
    
    const correct = userAnswer.trim() === currentPokemon.name
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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            ポケモン鳴き声クイズ（名前入力）
          </h1>

          <div className="mb-6">
            <p className="text-center text-gray-600 mb-4">
              このポケモンの鳴き声を聞いて、名前を入力してください
            </p>
            <div className="flex justify-center mb-4">
              <audio 
                ref={audioRef}
                key={currentPokemon.id}
                controls 
                className="w-full max-w-md"
                autoPlay={false}
              >
                <source src={currentPokemon.soundPath} type="audio/wav" />
                お使いのブラウザは音声再生に対応していません。
              </audio>
            </div>
            
            {/* 波形表示 */}
            <div className="bg-gray-100 rounded-lg p-4">
              {waveformLoading && (
                <div className="text-center py-4">
                  <p className="text-gray-600 text-sm">波形を読み込んでいます...</p>
                </div>
              )}
              {waveformError && (
                <div className="text-center py-4">
                  <p className="text-red-600 text-sm">{waveformError}</p>
                </div>
              )}
              {!waveformLoading && !waveformError && (
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className="w-full h-auto border border-gray-300 rounded"
                />
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="pokemon-name" className="block text-gray-700 font-semibold mb-2">
                ポケモンの名前
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
                placeholder="例: ピカチュウ"
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
                  回答する
                </button>
              </div>
            )}
          </form>

          {showResult && (
            <div className="mb-6">
              {isCorrect ? (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700 mb-2">✓ 正解！</p>
                  <img
                    src={currentPokemon.imagePath}
                    alt={currentPokemon.name}
                    className="w-32 h-32 mx-auto object-contain"
                  />
                  <p className="text-lg text-gray-700 mt-2">{currentPokemon.name}</p>
                </div>
              ) : (
                <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-700 mb-2">✗ 不正解</p>
                  <p className="text-lg text-gray-700 mb-2">
                    あなたの回答: <span className="font-bold">{userAnswer}</span>
                  </p>
                  <p className="text-lg text-gray-700">
                    正解は <span className="font-bold">{currentPokemon.name}</span> でした
                  </p>
                  <img
                    src={currentPokemon.imagePath}
                    alt={currentPokemon.name}
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
                次の問題へ
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

