'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ポケモン鳴き声クイズ
        </h1>
        <p className="text-center text-gray-600 mb-8">
          ポケモンの鳴き声だけでポケモンを当てるゲームです
        </p>
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-4 mb-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">鳴き声クイズ</h2>
            <div className="space-y-2">
              <Link
                href="/quiz"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                選択肢から選ぶ
              </Link>
              <Link
                href="/quiz/input"
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                名前を入力する
              </Link>
            </div>
          </div>
          <Link
            href="/list"
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
          >
            ポケモン一覧（鳴き声図鑑）
          </Link>
          <Link
            href="/weak"
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
          >
            苦手ポケモンだけでクイズ
          </Link>
        </div>
      </div>
    </div>
  )
}

