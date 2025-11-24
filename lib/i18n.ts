export type Language = 'ja' | 'en';

export const translations = {
  ja: {
    title: 'ポケモン鳴き声クイズ',
    description: 'ポケモンの鳴き声だけでポケモンを当てるゲーム',
    home: {
      title: 'ポケモン鳴き声クイズ',
      description: 'ポケモンの鳴き声だけでポケモンを当てるゲームです',
      quiz: '鳴き声クイズ',
      selectFromChoices: '選択肢から選ぶ',
      inputName: '名前を入力する',
      quizEn: '英語名クイズ',
      selectEnFromChoices: '英語名を選択肢から選ぶ',
      inputEnName: '英語名を入力する',
      pokemonList: 'ポケモン一覧（鳴き声図鑑）',
      compareSounds: '鳴き声聴き比べ',
      weakPokemonQuiz: '苦手ポケモンだけでクイズ',
    },
    quiz: {
      title: 'ポケモン鳴き声クイズ',
      instruction: 'このポケモンの鳴き声を聞いて、正しい名前を選んでください',
      correct: '✓ 正解！',
      incorrect: '✗ 不正解',
      correctAnswer: '正解は',
      was: 'でした',
      nextQuestion: '次の問題へ',
      backToHome: 'ホームに戻る',
      audioNotSupported: 'お使いのブラウザは音声再生に対応していません。',
    },
    quizInput: {
      title: 'ポケモン鳴き声クイズ（名前入力）',
      instruction: 'このポケモンの鳴き声を聞いて、名前を入力してください',
      pokemonName: 'ポケモンの名前',
      placeholder: '例: ピカチュウ',
      submit: '回答する',
      yourAnswer: 'あなたの回答:',
      loadingWaveform: '波形を読み込んでいます...',
      waveformError: '波形の描画に失敗しました',
      loading: '読み込み中...',
    },
    quizEn: {
      title: 'ポケモン英語名クイズ',
      instruction: '表示された日本語名に対応する英語名を選んでください',
      loading: '読み込み中...',
    },
    quizEnInput: {
      title: 'ポケモン英語名クイズ（入力）',
      instruction: '表示された日本語名に対応する英語名を入力してください',
      pokemonName: 'ポケモンの英語名',
      placeholder: '例: Pikachu',
      loading: '読み込み中...',
    },
    list: {
      title: 'ポケモン一覧（鳴き声図鑑）',
      instruction: '画像をクリック/タップで鳴き声を再生。長押しで波形を表示します。',
      backToHome: 'ホームに戻る',
    },
    compare: {
      title: 'ポケモン鳴き声聴き比べ',
      selectedPokemon: '選択中のポケモン',
      playAll: '全て順番に再生',
      playing: '再生中...',
      stop: '停止',
      clear: 'クリア',
      play: '再生',
      selectInstruction: '下のリストからポケモンを選択してください（最大10匹）',
      pokemonList: 'ポケモン一覧',
      maxSelection: '最大10匹まで選択できます',
      delete: '削除',
      backToHome: 'ホームに戻る',
    },
    weak: {
      title: '苦手ポケモンクイズ',
      weakList: '苦手リスト',
      count: '匹',
      emptyMessage: '苦手リストが空です。',
      emptyDescription: '通常クイズで間違えたポケモンが自動的に追加されます。',
      startNormalQuiz: '通常クイズを始める',
      backToHome: 'ホームに戻る',
      loading: '読み込み中...',
    },
    wave: {
      title: 'の波形',
      back: '戻る',
      notFound: 'ポケモンが見つかりません',
      backToList: '一覧に戻る',
      loading: '波形を読み込んでいます...',
      error: '波形の描画に失敗しました',
    },
  },
  en: {
    title: 'Pokemon Cry Quiz',
    description: 'A game to guess Pokemon by their cries alone',
    home: {
      title: 'Pokemon Cry Quiz',
      description: 'A game to guess Pokemon by their cries alone',
      quiz: 'Cry Quiz',
      selectFromChoices: 'Select from Choices',
      inputName: 'Input Name',
      quizEn: 'English Name Quiz',
      selectEnFromChoices: 'Select English Name from Choices',
      inputEnName: 'Input English Name',
      pokemonList: 'Pokemon List (Cry Pokedex)',
      compareSounds: 'Compare Cries',
      weakPokemonQuiz: 'Weak Pokemon Quiz',
    },
    quiz: {
      title: 'Pokemon Cry Quiz',
      instruction: 'Listen to this Pokemon\'s cry and select the correct name',
      correct: '✓ Correct!',
      incorrect: '✗ Incorrect',
      correctAnswer: 'The correct answer is',
      was: 'was',
      nextQuestion: 'Next Question',
      backToHome: 'Back to Home',
      audioNotSupported: 'Your browser does not support audio playback.',
    },
    quizInput: {
      title: 'Pokemon Cry Quiz (Input Name)',
      instruction: 'Listen to this Pokemon\'s cry and enter its name',
      pokemonName: 'Pokemon Name',
      placeholder: 'e.g., Pikachu',
      submit: 'Submit',
      yourAnswer: 'Your answer:',
      loadingWaveform: 'Loading waveform...',
      waveformError: 'Failed to draw waveform',
      loading: 'Loading...',
    },
    quizEn: {
      title: 'Pokemon English Name Quiz',
      instruction: 'Select the English name that corresponds to the displayed Japanese name',
      loading: 'Loading...',
    },
    quizEnInput: {
      title: 'Pokemon English Name Quiz (Input)',
      instruction: 'Enter the English name that corresponds to the displayed Japanese name',
      pokemonName: 'Pokemon English Name',
      placeholder: 'e.g., Pikachu',
      loading: 'Loading...',
    },
    list: {
      title: 'Pokemon List (Cry Pokedex)',
      instruction: 'Click/tap image to play cry. Long press to show waveform.',
      backToHome: 'Back to Home',
    },
    compare: {
      title: 'Compare Pokemon Cries',
      selectedPokemon: 'Selected Pokemon',
      playAll: 'Play All Sequentially',
      playing: 'Playing...',
      stop: 'Stop',
      clear: 'Clear',
      play: 'Play',
      selectInstruction: 'Select Pokemon from the list below (max 10)',
      pokemonList: 'Pokemon List',
      maxSelection: 'You can select up to 10 Pokemon',
      delete: 'Delete',
      backToHome: 'Back to Home',
    },
    weak: {
      title: 'Weak Pokemon Quiz',
      weakList: 'Weak List',
      count: 'Pokemon',
      emptyMessage: 'Weak list is empty.',
      emptyDescription: 'Pokemon you answered incorrectly in the normal quiz will be automatically added.',
      startNormalQuiz: 'Start Normal Quiz',
      backToHome: 'Back to Home',
      loading: 'Loading...',
    },
    wave: {
      title: '\'s Waveform',
      back: 'Back',
      notFound: 'Pokemon not found',
      backToList: 'Back to List',
      loading: 'Loading waveform...',
      error: 'Failed to draw waveform',
    },
  },
} as const;

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to Japanese if translation is missing
      value = translations.ja;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }
  
  return value || key;
}

