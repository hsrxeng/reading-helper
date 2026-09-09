import { SyntaxToken } from '../types';

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';

export interface PosStyleInfo {
  pos: PartOfSpeech;
  label: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  hexColor: string;
}

export const POS_CONFIG: Record<PartOfSpeech, PosStyleInfo> = {
  noun: {
    pos: 'noun',
    label: '명사',
    textColor: 'text-red-600 font-bold',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    badgeText: 'text-red-700',
    hexColor: '#dc2626', // Red
  },
  verb: {
    pos: 'verb',
    label: '서술어(동사)',
    textColor: 'text-blue-600 font-bold',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    hexColor: '#2563eb', // Blue
  },
  adjective: {
    pos: 'adjective',
    label: '형용사',
    textColor: 'text-orange-600 font-bold',
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-orange-200',
    badgeText: 'text-orange-700',
    hexColor: '#ea580c', // Orange
  },
  adverb: {
    pos: 'adverb',
    label: '부사',
    textColor: 'text-purple-600 font-bold',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-700',
    hexColor: '#9333ea', // Purple
  },
  other: {
    pos: 'other',
    label: '기타',
    textColor: 'text-slate-800 font-semibold',
    badgeBg: 'bg-slate-50',
    badgeBorder: 'border-slate-200',
    badgeText: 'text-slate-600',
    hexColor: '#334155',
  },
};

// Clean word for heuristic checking (null-safe)
function cleanWord(str?: any): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[^\w\s-]/g, '').trim().toLowerCase();
}

/**
 * Determine the part of speech for a token or word
 */
export function detectPos(token?: SyntaxToken | null): PartOfSpeech {
  if (!token) return 'other';
  if (token.pos && typeof token.pos === 'string') {
    const p = token.pos.toLowerCase();
    if (p.includes('noun') || p === 'n' || p.includes('명사')) return 'noun';
    if (p.includes('verb') || p === 'v' || p.includes('동사') || p.includes('서술어')) return 'verb';
    if (p.includes('adj') || p === 'a' || p.includes('형용사')) return 'adjective';
    if (p.includes('adv') || p.includes('부사')) return 'adverb';
  }

  const role = typeof token.role === 'string' ? token.role.toUpperCase() : '';
  const tag = typeof token.tagTop === 'string' ? token.tagTop : '';
  const textClean = cleanWord(token.text);

  // Check tagTop hints
  if (tag.includes('서술어') || tag.includes('동사')) return 'verb';
  if (tag.includes('명사')) return 'noun';
  if (tag.includes('형용사')) return 'adjective';
  if (tag.includes('부사')) return 'adverb';

  // Check role hints
  if (role.startsWith('V')) return 'verb';

  // Adverb checks
  if (role === 'M' && (textClean.endsWith('ly') || textClean === 'greatly' || textClean === 'even' || textClean === 'not')) {
    return 'adverb';
  }
  if (textClean.endsWith('ly') && !['friendly', 'lovely', 'lonely', 'likely'].includes(textClean)) {
    return 'adverb';
  }
  if (['greatly', 'even', 'however', 'also', 'often', 'never', 'always', 'already', 'still', 'yet', 'quite', 'very', 'just', 'too'].includes(textClean)) {
    return 'adverb';
  }

  // Adjective checks
  if (
    ['superhuman', 'popular', 'famous', 'great', 'important', 'cultural', 'economic', 'natural', 'different', 'difficult'].includes(textClean) ||
    textClean.endsWith('ous') ||
    textClean.endsWith('ful') ||
    textClean.endsWith('ive') ||
    textClean.endsWith('able') ||
    textClean.endsWith('ible') ||
    (role === 'C' && (textClean.endsWith('al') || textClean.endsWith('ic') || textClean.endsWith('ant') || textClean.endsWith('ent')))
  ) {
    return 'adjective';
  }

  // Noun checks
  if (role.startsWith('S') || role.startsWith('O')) {
    return 'noun';
  }
  if (
    textClean.endsWith('tion') ||
    textClean.endsWith('sion') ||
    textClean.endsWith('ment') ||
    textClean.endsWith('ness') ||
    textClean.endsWith('ity') ||
    textClean.endsWith('ty') ||
    textClean.endsWith('ence') ||
    textClean.endsWith('ance') ||
    textClean.endsWith('er') ||
    textClean.endsWith('ers') ||
    textClean.endsWith('or')
  ) {
    return 'noun';
  }

  return 'other';
}

export type PosColorMode = 'underline' | 'pastel' | 'vibrant';
export type HighlightTarget = 'sv_only' | 'all';

/**
 * Check if token acts as Subject (주어)
 */
export function isSubjectToken(token?: SyntaxToken | null): boolean {
  if (!token) return false;
  const role = typeof token.role === 'string' ? token.role.toUpperCase().trim() : '';
  const tag = typeof token.tagTop === 'string' ? token.tagTop.trim() : '';
  if (role === 'SC') return false; // Subject Complement is Complement
  if (
    role === 'S' ||
    role === "S'" ||
    role.startsWith('S·') ||
    role.startsWith('S ') ||
    role.startsWith('S/') ||
    role.startsWith('S1') ||
    role.startsWith('S2')
  ) {
    return true;
  }
  if (tag.includes('주어') || (tag.startsWith('S') && !tag.startsWith('SC'))) return true;
  return false;
}

/**
 * Check if token acts as Predicate / Main Verb (서술어)
 */
export function isPredicateToken(token?: SyntaxToken | null): boolean {
  if (!token) return false;
  const role = typeof token.role === 'string' ? token.role.toUpperCase().trim() : '';
  const tag = typeof token.tagTop === 'string' ? token.tagTop.trim() : '';
  
  if (
    role === 'V' ||
    role === "V'" ||
    role.startsWith('V·') ||
    role.startsWith('V ') ||
    role.startsWith('V/') ||
    role.startsWith('V1') ||
    role.startsWith('V2')
  ) {
    return true;
  }
  // If role is explicitly O, C, M, S etc., it is not the predicate verb
  if (role && !role.startsWith('V')) {
    return false;
  }

  if (tag.includes('본동사') || tag.includes('서술어') || tag.includes('동사 [서술어]') || tag.startsWith('V')) return true;
  const pos = detectPos(token);
  if (pos === 'verb' && !tag.includes('분사') && !tag.includes('동명사')) return true;
  return false;
}

/**
 * Returns token styling based on POS/Role, mode, and target (sv_only vs all)
 */
export function getTokenPosStyle(
  token?: SyntaxToken | null,
  enabled: boolean = true,
  mode: PosColorMode = 'underline',
  target: HighlightTarget = 'sv_only'
): string {
  if (!token) return '';
  if (!enabled) {
    return 'text-slate-900 dark:text-slate-100 font-semibold';
  }

  // A. 주어/서술어 집중 모드 (S: 빨강, V: 파랑만 강조, 나머지는 차분한 일반 텍스트)
  if (target === 'sv_only') {
    const isS = isSubjectToken(token);
    const isV = isPredicateToken(token);

    if (!isS && !isV) {
      return 'text-slate-900 dark:text-slate-100 font-semibold';
    }

    if (mode === 'underline') {
      if (isS) {
        return 'text-slate-900 dark:text-slate-100 font-semibold border-b-[2.5px] border-rose-500 dark:border-rose-400 pb-[1px] hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors';
      }
      if (isV) {
        return 'text-slate-900 dark:text-slate-100 font-bold border-b-[2.5px] border-blue-600 dark:border-sky-400 pb-[1px] hover:bg-blue-50/50 dark:hover:bg-sky-950/30 transition-colors';
      }
    }

    if (mode === 'pastel') {
      if (isS) {
        return 'text-rose-800 dark:text-rose-300 bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/70 font-semibold rounded px-1.5 py-0.5';
      }
      if (isV) {
        return 'text-blue-800 dark:text-sky-300 bg-blue-50/90 dark:bg-sky-950/50 border border-blue-200/80 dark:border-sky-900/70 font-bold rounded px-1.5 py-0.5';
      }
    }

    // vibrant mode
    if (isS) return 'text-rose-600 dark:text-rose-400 font-bold';
    if (isV) return 'text-blue-600 dark:text-sky-400 font-bold';
  }

  // B. 전체 품사 강조 모드 (기존 4품사)
  const pos = detectPos(token);
  if (pos === 'other') {
    return 'text-slate-800 dark:text-slate-200 font-semibold';
  }

  // 1. 밑줄 모드: 글자는 짙고 편안한 먹색, 아래에 품사별 세련된 컬러 라인
  if (mode === 'underline') {
    switch (pos) {
      case 'noun':
        return 'text-slate-900 dark:text-slate-100 font-semibold border-b-[2.5px] border-rose-500 dark:border-rose-400 pb-[1px] hover:bg-rose-50/40 dark:hover:bg-rose-950/30 transition-colors';
      case 'verb':
        return 'text-slate-900 dark:text-slate-100 font-bold border-b-[2.5px] border-blue-600 dark:border-sky-400 pb-[1px] hover:bg-blue-50/40 dark:hover:bg-sky-950/30 transition-colors';
      case 'adjective':
        return 'text-slate-900 dark:text-slate-100 font-semibold border-b-[2.5px] border-amber-500 dark:border-amber-400 pb-[1px] hover:bg-amber-50/40 dark:hover:bg-amber-950/30 transition-colors';
      case 'adverb':
        return 'text-slate-900 dark:text-slate-100 font-semibold border-b-[2.5px] border-purple-500 dark:border-purple-400 pb-[1px] hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition-colors';
    }
  }

  // 2. 소프트 파스텔 모드: 쨍하지 않은 은은한 배경 틴트 + 소프트 톤다운 글자색
  if (mode === 'pastel') {
    switch (pos) {
      case 'noun':
        return 'text-rose-800 dark:text-rose-300 bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200/70 dark:border-rose-900/60 font-semibold rounded px-1 py-0.5';
      case 'verb':
        return 'text-blue-800 dark:text-sky-300 bg-blue-50/90 dark:bg-sky-950/50 border border-blue-200/70 dark:border-sky-900/60 font-bold rounded px-1 py-0.5';
      case 'adjective':
        return 'text-amber-900 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-900/60 font-semibold rounded px-1 py-0.5';
      case 'adverb':
        return 'text-purple-800 dark:text-purple-300 bg-purple-50/90 dark:bg-purple-950/50 border border-purple-200/70 dark:border-purple-900/60 font-semibold rounded px-1 py-0.5';
    }
  }

  // 3. 선명한 원색 글자 모드 (vibrant)
  return POS_CONFIG[pos]?.textColor || POS_CONFIG.other.textColor;
}

/**
 * Determine the part of speech for a vocabulary item
 */
export function detectVocabPos(word?: string, meaning: string = '', explicitPos?: string): PartOfSpeech {
  if (explicitPos && typeof explicitPos === 'string') {
    const p = explicitPos.toLowerCase();
    if (p.includes('noun') || p === 'n' || p.includes('명사')) return 'noun';
    if (p.includes('verb') || p === 'v' || p.includes('동사') || p.includes('서술어')) return 'verb';
    if (p.includes('adj') || p === 'a' || p.includes('형용사')) return 'adjective';
    if (p.includes('adv') || p.includes('부사')) return 'adverb';
  }

  const clean = cleanWord(word);
  const m = typeof meaning === 'string' ? meaning.trim() : '';

  // Meaning hints in Korean
  if (m.endsWith('다') || m.includes('~하다') || m.includes('시키다') || m.includes('되다')) {
    return 'verb';
  }
  if (m.endsWith('게') || m.endsWith('히') || m.endsWith('으로') || m.endsWith('로써')) {
    return 'adverb';
  }
  if (m.endsWith('ㄴ') || m.endsWith('는') || m.endsWith('의') || m.endsWith('적') || m.endsWith('적인')) {
    return 'adjective';
  }

  // Word heuristics
  if (clean.endsWith('ly')) return 'adverb';
  if (
    clean.endsWith('ous') ||
    clean.endsWith('ful') ||
    clean.endsWith('ive') ||
    clean.endsWith('able') ||
    clean.endsWith('ible') ||
    clean.endsWith('al') ||
    clean.endsWith('ic') ||
    ['superhuman', 'popular', 'famous', 'adaptive', 'costly', 'novel', 'cognitive', 'essential'].includes(clean)
  ) {
    return 'adjective';
  }
  if (
    clean.endsWith('tion') ||
    clean.endsWith('ment') ||
    clean.endsWith('ness') ||
    clean.endsWith('ity') ||
    clean.endsWith('ence') ||
    clean.endsWith('ance') ||
    clean.endsWith('er') ||
    clean.endsWith('or') ||
    ['spinach', 'statue', 'grower', 'strength', 'culture', 'endurance', 'habit', 'model', 'algorithm', 'chamber'].includes(clean)
  ) {
    return 'noun';
  }

  return 'noun';
}

