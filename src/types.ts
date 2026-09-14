export interface SyntaxToken {
  text: string;
  role?: string; // S, V, O, C, M, S', V', O', C', V1, V2, S1, S2, etc.
  pos?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other' | string; // 명사(빨강), 서술어(파랑), 형용사(주황), 부사(보라)
  tagTop?: string; // 어휘 뜻 또는 문법 태그 (예: "초인적인 힘", "관계절", "동명사구", "분사구문", "전치사구", "가주어")
  meaning?: string; // 단어/구문 한글 뜻
  clauseType?: 'none' | 'relative' | 'noun' | 'adverb' | 'prepositional' | 'parenthesis';
  isBold?: boolean;
}

export interface VocabularyItem {
  word: string;
  meaning: string;
  pos?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other' | string;
}

export interface SentenceAnalysis {
  sentenceNumber: number;
  originalText: string;
  sentencePattern?: string; // e.g. "3형식 (S + V + O)", "5형식 (S + V + O + OC)"
  tokens: SyntaxToken[];
  directTranslation: string; // 끊어 읽기 (슬래시 표시와 매칭 해석)
  polishedTranslation: string; // 윤문 (자연스러운 완역)
  grammarPoints?: string[]; // 핵심 문법 포인트
  vocabulary?: VocabularyItem[]; // 주요 어휘
}

export interface SuneungChoiceAnalysis {
  number: number;
  text: string;
  isCorrect: boolean;
  analysis: string; // 정답 이유 또는 매력적 오답 함정 논리 (과도한 일반화, 본문 무관, 인과 왜곡 등)
}

export interface ParaphrasePair {
  passageExpr: string; // 지문 속 원문 표현
  choiceExpr: string; // 정답 선지의 패러프레이징 표현
}

export interface PassageFlow {
  topicIntro?: string; // 도입/화제 제시
  development?: string; // 본론 전개/상술
  turningPoint?: string; // 역접/전환점 (However 등)
  conclusion?: string; // 결론 및 시사점
}

export interface SuneungAnalysis {
  questionType: string; // 문제 유형 (예: 빈칸추론, 글의 제목, 문장삽입, 어법 등)
  questionPrompt: string; // 문제 발문
  correctChoiceNumber: number; // 정답 번호 (1 ~ 5)
  clueSentenceNumbers: number[]; // 정답의 결정적 단서가 된 지문 속 문장 번호 배열 (예: [2, 5])
  coreLogicSummary: string; // 정답 도출 핵심 논리 요약 (1~2줄)
  passageFlow: PassageFlow; // 지문 논리 전개도
  choices: SuneungChoiceAnalysis[]; // 선지별 소거법 분석
  paraphrasePairs?: ParaphrasePair[]; // 재진술(Paraphrasing) 짝꿍
}

export type AnalysisMode = 'general' | 'suneung';

export type DifficultyLevel = '초급자' | '중급자' | '상급자';

export interface PassageAnalysisResult {
  title?: string;
  gradeLevel?: string;
  difficulty?: DifficultyLevel;
  summary?: string; // 지문 핵심 요지 / 주제
  sentences: SentenceAnalysis[];
  mode?: AnalysisMode;
  suneungAnalysis?: SuneungAnalysis;
}

export type HighlightTarget = 'sv_only' | 'all';

export interface DisplaySettingsState {
  showRoles: boolean; // S, V, O, C, M 태그 표시 여부
  showMeanings: boolean; // 단어 뜻/주석 표시 여부
  showDirectTranslation: boolean; // 직독직해 표시 여부
  showPolishedTranslation: boolean; // 윤문 완역 표시 여부
  showGrammarPoints: boolean; // 문법 팁 표시 여부
  showVocabulary: boolean; // 핵심 어휘 표시 여부
  showPosColors: boolean; // 강조 표시 여부
  posColorMode: 'underline' | 'pastel' | 'vibrant'; // 밑줄 모드, 소프트 파스텔 모드
  highlightTarget: HighlightTarget; // 'sv_only' (주어 빨강, 서술어 파랑만 집중) vs 'all' (전체)
  isDarkMode: boolean; // 다크 모드 활성화 여부
  fontSize: 'sm' | 'base' | 'lg';
  themeColor: 'indigo' | 'slate' | 'emerald';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  previewText: string;
  originalPassage?: string;
  gradeLevel: string;
  customTitle?: string;
  data: PassageAnalysisResult;
}
