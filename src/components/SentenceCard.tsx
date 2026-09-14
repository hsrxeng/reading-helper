import React from 'react';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Layers,
  Palette,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { SentenceAnalysis, DisplaySettingsState, SyntaxToken } from '../types';
import { getTokenPosStyle, detectPos, detectVocabPos, POS_CONFIG } from '../utils/posHelper';
import { getGrammarGist } from '../utils/grammarGistHelper';

interface SentenceCardProps {
  sentence: SentenceAnalysis;
  index: number;
  settings: DisplaySettingsState;
  isClueSentence?: boolean;
  gradeLevel?: string;
}

export const SentenceCard: React.FC<SentenceCardProps> = ({
  sentence,
  index,
  settings,
  isClueSentence = false,
  gradeLevel,
}) => {
  const isBeginner = gradeLevel?.includes('초급') || gradeLevel === '고1';
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  // Track which grammar point gist cards are expanded by index
  const [expandedGists, setExpandedGists] = React.useState<Record<number, boolean>>({});

  const toggleGist = (idx: number) => {
    setExpandedGists((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleAllGists = () => {
    if (!sentence.grammarPoints?.length) return;
    const allOpen = sentence.grammarPoints.every((_, i) => expandedGists[i]);
    const nextState: Record<number, boolean> = {};
    sentence.grammarPoints.forEach((_, i) => {
      nextState[i] = !allOpen;
    });
    setExpandedGists(nextState);
  };

  // Text to Speech playback
  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('브라우저가 음성 재생(TTS)을 지원하지 않습니다.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentence.originalText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // 조금 천천히 명확하게 읽기

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopySentence = () => {
    let text = `[문장 ${sentence.sentenceNumber}] ${sentence.sentencePattern || ''}\n`;
    text += `원문: ${sentence.originalText}\n\n`;
    text += `■ 직독직해:\n${sentence.directTranslation}\n\n`;
    text += `■ 윤문 완역:\n${sentence.polishedTranslation}\n`;

    if (sentence.grammarPoints?.length) {
      text += `\n■ 어법 포인트:\n${sentence.grammarPoints.map((g) => `- ${g}`).join('\n')}\n`;
    }

    if (sentence.vocabulary?.length) {
      text += `\n■ 핵심 어휘:\n${sentence.vocabulary.map((v) => `- ${v.word} : ${v.meaning}`).join('\n')}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Role badge color helper: 주어(S)는 빨강, 서술어(V)는 파랑
  const getRoleStyle = (role: string = '') => {
    const r = role.toUpperCase().trim();
    if (r === 'SC' || r === 'OC' || (r.startsWith('C') && !r.startsWith('CL'))) {
      return 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800 font-bold';
    }
    if (r.startsWith('S')) {
      return 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold';
    }
    if (r.startsWith('V')) {
      return 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold';
    }
    if (r.startsWith('O')) {
      return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold';
    }
    if (r.startsWith('M')) {
      return 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-medium';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  };

  // Clause container background style helper
  const getClauseStyle = (clauseType: string = 'none') => {
    switch (clauseType) {
      case 'relative':
        return 'bg-indigo-50/60 border-b-2 border-indigo-300';
      case 'noun':
        return 'bg-emerald-50/60 border-b-2 border-emerald-300';
      case 'prepositional':
      case 'adverb':
        return 'bg-amber-50/60 border-b-2 border-amber-300';
      default:
        return 'border-b-2 border-slate-300';
    }
  };

  // Font size classes
  const fontSizes = {
    sm: {
      text: 'text-sm sm:text-base',
      top: 'text-[10px]',
      role: 'text-[10px]',
    },
    base: {
      text: 'text-base sm:text-lg',
      top: 'text-[11px]',
      role: 'text-[11px]',
    },
    lg: {
      text: 'text-lg sm:text-xl',
      top: 'text-xs',
      role: 'text-xs',
    },
  }[settings.fontSize];

  return (
    <article
      id={`sentence-card-${sentence.sentenceNumber}`}
      className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-xs overflow-hidden transition-all duration-200 avoid-break ${
        isClueSentence
          ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/80 dark:ring-amber-500/80 shadow-md'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40'
      }`}
    >
      {/* Golden Clue Banner if designated as key clue */}
      {isClueSentence && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>🎯 수능 정답의 결정적 단서 문장 (Key Clue Sentence)</span>
          </div>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-semibold">
            정답 판별 핵심 근거
          </span>
        </div>
      )}

      {/* Card Header: Sentence # & Pattern */}
      <div className="bg-slate-50/80 dark:bg-slate-800/80 px-4 sm:px-6 py-2.5 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 dark:bg-indigo-600 text-white font-mono text-xs font-bold">
            {String(sentence.sentenceNumber).padStart(2, '0')}
          </span>

          {sentence.sentencePattern && (
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 rounded-md">
              {sentence.sentencePattern}
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 no-print">
          <button
            type="button"
            onClick={handlePlayAudio}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              isPlayingAudio
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="원어민 발음 듣기"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPlayingAudio ? '중지' : '듣기'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopySentence}
            className="p-1.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="문장 분석 내용 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Section 1: Syntactic Ruby/Block Word Layout (정밀 구문분석 핵심 레이아웃) */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>정밀 문장 성분 분해 (S·V·O·C 첨자 표기)</span>
            </div>

            {/* 핵심 성분(주어 빨강, 서술어 파랑) 또는 품사 인디케이터 */}
            {settings.showPosColors && (
              <div className="flex items-center gap-2 text-[11px] bg-slate-100/90 dark:bg-slate-800/90 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 font-medium">
                <Palette className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold hidden sm:inline">
                  {settings.posColorMode === 'underline'
                    ? '[밑줄 모드]'
                    : settings.posColorMode === 'pastel'
                    ? '[파스텔 모드]'
                    : '[원색 모드]'}
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className={`inline-block ${
                      settings.posColorMode === 'underline'
                        ? 'w-2.5 h-0.5 bg-rose-500 dark:bg-rose-400'
                        : 'w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400'
                    }`}
                  ></span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">주어 (S)</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`inline-block ${
                      settings.posColorMode === 'underline'
                        ? 'w-2.5 h-0.5 bg-blue-600 dark:bg-sky-400'
                        : 'w-2 h-2 rounded-full bg-blue-600 dark:bg-sky-400'
                    }`}
                  ></span>
                  <span className="text-blue-600 dark:text-sky-400 font-bold">서술어 (V)</span>
                </span>
              </div>
            )}
          </div>

          {/* Tokens row with wrap */}
          <div className="flex flex-wrap items-end gap-x-2 gap-y-5 py-3 px-3 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800/80 overflow-x-auto">
            {(sentence.tokens || []).map((token, tIdx) => {
              if (!token) return null;
              const hasTop = settings.showMeanings && (token.tagTop || token.meaning);
              const hasRole = settings.showRoles && token.role;
              const posStyle = getTokenPosStyle(
                token,
                settings.showPosColors,
                settings.posColorMode,
                settings.highlightTarget || 'sv_only'
              );

              return (
                <div
                  key={tIdx}
                  className="inline-flex flex-col items-center justify-end group transition-all"
                  style={{ minWidth: 'fit-content' }}
                >
                  {/* Top Annotation: Korean Meaning or Grammar Clause Tag */}
                  {settings.showMeanings ? (
                    <div
                      className={`h-5 flex items-center justify-center font-medium ${fontSizes.top} transition-opacity ${
                        token.tagTop || token.meaning ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {token.tagTop ? (
                        <span className="text-indigo-600 font-semibold bg-indigo-50/80 px-1 rounded text-[10px]">
                          {token.tagTop}
                        </span>
                      ) : token.meaning ? (
                        <span className="text-slate-600 truncate max-w-[130px]" title={token.meaning}>
                          {token.meaning}
                        </span>
                      ) : (
                        <span>&nbsp;</span>
                      )}
                    </div>
                  ) : null}

                  {/* Middle: English Main Word/Chunk - 품사별 색상 적용 (명사 빨강, 서술어 파랑, 형용사 주황, 부사 보라) */}
                  <div
                    className={`tracking-normal px-1 py-0.5 rounded-sm transition-colors ${
                      fontSizes.text
                    } ${posStyle} ${getClauseStyle(token.clauseType)}`}
                  >
                    {token.text || ''}
                  </div>

                  {/* Bottom: Sentence Role Tag (S, V, O, C, M, S', V') */}
                  {settings.showRoles ? (
                    <div className="h-5 flex items-center justify-center mt-1">
                      {token.role ? (
                        <span
                          className={`inline-block px-1.5 py-0.2 font-mono rounded border shadow-2xs ${
                            fontSizes.role
                          } ${getRoleStyle(token.role)}`}
                        >
                          {token.role}
                        </span>
                      ) : (
                        <span className="text-[10px] text-transparent select-none">-</span>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Direct Translation (직독직해 - 끊어 읽기) */}
        {settings.showDirectTranslation && sentence.directTranslation && (
          <div className="p-3.5 sm:p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/70 dark:border-emerald-900/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>직독직해 (끊어 읽기 단위 해석)</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans whitespace-pre-line leading-relaxed pl-3.5 border-l-2 border-emerald-400 dark:border-emerald-500">
              {sentence.directTranslation}
            </div>
          </div>
        )}

        {/* Section 3: Polished Translation (자연스러운 완역) */}
        {settings.showPolishedTranslation && sentence.polishedTranslation && (
          <div className="p-3.5 sm:p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/70 dark:border-indigo-900/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>자연스러운 완역 (해설 번역)</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed pl-3.5 border-l-2 border-indigo-500 dark:border-indigo-400">
              {sentence.polishedTranslation}
            </div>
          </div>
        )}

        {/* Section 4: Grammar Points & Vocabulary (어법 포인트 & 핵심 어휘) */}
        {((settings.showGrammarPoints && sentence.grammarPoints?.length) ||
          (settings.showVocabulary && sentence.vocabulary?.length)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            {/* Grammar points */}
            {settings.showGrammarPoints && sentence.grammarPoints && sentence.grammarPoints.length > 0 && (
              <div className="bg-amber-50/50 dark:bg-amber-950/30 p-3 sm:p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>수능/내신 출제 문법 포인트</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/70 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold">
                      클릭시 포인트 상세 해설
                    </span>
                  </div>
                  {sentence.grammarPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={toggleAllGists}
                      className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 hover:underline cursor-pointer"
                    >
                      {sentence.grammarPoints.every((_, i) => expandedGists[i]) ? '포인트 모두 접기' : '포인트 전체 보기'}
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {sentence.grammarPoints.map((gp, gIdx) => {
                    const isOpen = !!expandedGists[gIdx];
                    const gist = getGrammarGist(gp, sentence.originalText);

                    return (
                      <div
                        key={gIdx}
                        className="rounded-lg border border-amber-200/70 dark:border-amber-900/50 bg-white/80 dark:bg-slate-900/70 overflow-hidden transition-all shadow-2xs"
                      >
                        {/* Grammar Point Clickable Row */}
                        <button
                          type="button"
                          onClick={() => toggleGist(gIdx)}
                          className="w-full text-left p-2.5 flex items-center justify-between gap-2 hover:bg-amber-100/50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                            <span>{gp}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5 ${
                                isOpen
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 group-hover:bg-amber-200 dark:group-hover:bg-amber-900'
                              }`}
                            >
                              <Lightbulb className="w-3 h-3" />
                              <span>{isOpen ? '해설 닫기' : '포인트 해설'}</span>
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            )}
                          </div>
                        </button>

                        {/* Expandable Grammar Point Card */}
                        {isOpen && (
                          <div className="p-3 border-t border-amber-200/60 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/70 to-orange-50/20 dark:from-slate-900/90 dark:to-slate-900/60 text-xs space-y-2.5">
                            {/* Category Header */}
                            <div className="flex items-center justify-between gap-2 pb-1 border-b border-amber-200/50 dark:border-slate-800">
                              <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1 text-[11px]">
                                <span>📌 {gist.category}</span>
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                {gist.badge}
                              </span>
                            </div>

                            {/* 1. 핵심 요약 (Core Point) */}
                            <div className="p-2 rounded-lg bg-white/95 dark:bg-slate-800/90 border border-amber-200/60 dark:border-slate-700 space-y-0.5">
                              <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <span>💡 핵심 문법 포인트 요약</span>
                              </div>
                              <p className="text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed">
                                {gist.corePoint || gist.coreGist}
                              </p>
                            </div>

                            {/* 2. 3초 판별 공식 (Rule & Formula) */}
                            <div className="p-2 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-900/60 space-y-0.5">
                              <div className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                                <span>🎯 3초 판별 공식 (Rule & Formula)</span>
                              </div>
                              <div className="text-[11px] text-indigo-950 dark:text-indigo-200 font-mono leading-relaxed whitespace-pre-line bg-white/70 dark:bg-slate-950/70 p-1.5 rounded border border-indigo-100 dark:border-indigo-900/80">
                                {gist.ruleFormula}
                              </div>
                            </div>

                            {/* 3. 출제 함정 (Exam Trap) */}
                            <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 space-y-0.5">
                              <div className="text-[10px] font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1">
                                <span>⚠️ 시험 빈출 함정 & 오답 패턴</span>
                              </div>
                              <p className="text-[11px] text-rose-950 dark:text-rose-200 leading-relaxed">
                                {gist.examTrap}
                              </p>
                            </div>

                            {/* 4. 본문 적용 가이드 */}
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 pl-2 border-l-2 border-amber-400 dark:border-amber-500 font-sans">
                              <strong className="text-amber-900 dark:text-amber-300">문장 검토 팁:</strong>{' '}
                              {gist.actionTip}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Vocabulary */}
            {settings.showVocabulary && sentence.vocabulary && sentence.vocabulary.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span>핵심 어휘 및 숙어 정리</span>
                    {isBeginner && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        초보 필수 어휘 &amp; 상세 뜻풀이
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">
                    총 {sentence.vocabulary.length}개 수록
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(sentence.vocabulary || []).map((vocab, vIdx) => {
                    if (!vocab) return null;
                    const pos = detectVocabPos(vocab.word, vocab.meaning, vocab.pos);
                    const posInfo = POS_CONFIG[pos] || POS_CONFIG.other;

                    return (
                      <div
                        key={vIdx}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-900 border rounded-md text-xs shadow-2xs ${
                          settings.showPosColors ? posInfo.badgeBorder : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {settings.showPosColors && (
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-bold ${posInfo.badgeBg} ${posInfo.badgeText}`}
                          >
                            {posInfo.label}
                          </span>
                        )}
                        <span
                          className={`font-semibold ${
                            settings.showPosColors ? posInfo.textColor : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {vocab.word}
                        </span>
                        <span className="text-slate-400">:</span>
                        <span className="text-slate-600 dark:text-slate-300">{vocab.meaning}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
