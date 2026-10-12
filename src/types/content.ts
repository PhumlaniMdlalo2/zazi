export type UnitTheme = 'green' | 'gold' | 'blue' | 'red';

export type Language = {
  id: string;
  name: string;
  nativeName: string;
  flagEmoji: string;
};

export type Unit = {
  id: string;
  languageId: string;
  order: number;
  title: string;
  description: string;
  theme: UnitTheme;
};

export type GrammarTipExample = {
  xhosa: string;
  english: string;
};

export type GrammarTip = {
  title: string;
  body: string;
  examples: GrammarTipExample[];
};

export type Lesson = {
  id: string;
  unitId: string;
  order: number;
  title: string;
  xpReward: number;
  /** Short "teach" screen tips shown before an uncompleted lesson. */
  grammarTips?: GrammarTip[];
};

export type ExerciseType = 'multiple_choice' | 'translate' | 'word_bank' | 'match_pairs';

type BaseExercise = {
  id: string;
  lessonId: string;
  order: number;
  prompt: string;
  /** Remote audio clip for this exercise (Firebase Storage, see audioUrlFor). */
  audioUrl?: string;
};

export type MultipleChoiceExercise = BaseExercise & {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctIndex: number;
};

export type TranslateExercise = BaseExercise & {
  type: 'translate';
  sourceText: string;
  acceptedAnswers: string[];
};

export type WordBankExercise = BaseExercise & {
  type: 'word_bank';
  sourceText: string;
  wordBank: string[];
  correctSequence: string[];
};

export type MatchPairsExercise = BaseExercise & {
  type: 'match_pairs';
  pairs: { left: string; right: string }[];
};

export type Exercise = MultipleChoiceExercise | TranslateExercise | WordBankExercise | MatchPairsExercise;
