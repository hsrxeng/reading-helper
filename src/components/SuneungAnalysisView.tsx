import React from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Target,
  GitBranch,
  ArrowRight,
  Sparkles,
  Repeat,
  AlertTriangle,
  Lightbulb,
  Compass,
} from 'lucide-react';
import { SuneungAnalysis } from '../types';

interface SuneungAnalysisViewProps {
  analysis: SuneungAnalysis;
  onScrollToSentence: (sentenceNumber: number) => void;
}

export const SuneungAnalysisView: React.FC<SuneungAnalysisViewProps> = ({
  analysis,
  onScrollToSentence,
}) => {
  const {
    questionType,
    questionPrompt,
    correctChoiceNumber,
    clueSentenceNumbers,
    coreLogicSummary,
    passageFlow,
    choices,
    paraphrasePairs,
  } = analysis;

  const circledNumbers = ['①', '②', '③', '④', '⑤'];

  return (
    <div className="space-y-4 my-4 animate-in fade-in duration-300">
      {/* 1. Header & Core Solution Logic Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-indigo-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-indigo-950/20 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
              <Target className="w-3.5 h-3.5" />
              수능·모의고사 실전 풀이 분석
            </span>
            {questionType && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                유형: {questionType}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">정답:</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-sm sm:text-base shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {circledNumbers[correctChoiceNumber - 1] || `${correctChoiceNumber}번`} 정답
              </span>
            </div>
          </div>
        </div>

        {/* Question Prompt */}
        {questionPrompt && (
          <div className="mt-3.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-indigo-600 dark:text-indigo-400 mr-1.5">[발문]</span>
            {questionPrompt}
          </div>
        )}

        {/* Core Logic Summary */}
        <div className="mt-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl p-4 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950 dark:text-amber-200 block text-xs">
                정답 도출 핵심 출제 논리 (Core Logic):
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {coreLogicSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Clue sentence quick-jumps */}
        {clueSentenceNumbers && clueSentenceNumbers.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              결정적 정답 단서 문장 (클릭 시 이동):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {clueSentenceNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onScrollToSentence(num)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title={`문장 #${num} 카드로 스크롤 이동`}
                >
                  <span>🎯 단서 문장 #{num}</span>
                  <ArrowRight className="w-3 h-3 text-amber-600" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Passage Logical Flow Diagram (논리 전개도) */}
      {passageFlow && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <GitBranch className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              지문 논리 전개도 (Passage Flow)
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              도입 → 전개 → 전환점 → 결론
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Step 1: Intro */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">
                  <span>1. 도입 / 화제 제시</span>
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">
                    1
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {passageFlow.topicIntro || '화제 소개 및 중심 소재 진술'}
                </p>
              </div>
            </div>

            {/* Step 2: Development */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1.5">
                  <span>2. 본론 전개 / 상술</span>
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[10px]">
                    2
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {passageFlow.development || '구체적 예시, 근거 및 부연 설명'}
                </p>
              </div>
            </div>

            {/* Step 3: Turning Point */}
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/60 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1.5">
                  <span>3. 역접 / 전환점</span>
                  <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-[10px]">
                    3
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {passageFlow.turningPoint || 'However, But 등 관점 전환 또는 반론 제시'}
                </p>
              </div>
            </div>

            {/* Step 4: Conclusion */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/60 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">
                  <span>4. 결론 및 요지</span>
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px]">
                    4
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {passageFlow.conclusion || '핵심 주제 요약 및 글의 최종 시사점'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Elimination Method Analysis Cards (1~5번 선지 소거법 분석) */}
      {choices && choices.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                1~5번 선지 소거법 정밀 분석 (Choices Elimination)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              오답 함정 유형(과도한 일반화, 본문 무관, 인과 왜곡 등) 파악
            </span>
          </div>

          <div className="space-y-3">
            {choices.map((choice) => {
              const isAns = choice.number === correctChoiceNumber || choice.isCorrect;
              return (
                <div
                  key={choice.number}
                  className={`rounded-xl border p-4 transition-all ${
                    isAns
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/80 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isAns
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {circledNumbers[choice.number - 1] || choice.number}
                      </span>
                      <span className="font-serif font-medium text-sm sm:text-base text-slate-900 dark:text-slate-100">
                        {choice.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {isAns ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          정답 (Correct)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3.5 h-3.5" />
                          오답 소거
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Explanation / Trap logic */}
                  <div className="pl-8 text-xs sm:text-[13px] leading-relaxed">
                    <p
                      className={
                        isAns
                          ? 'text-emerald-900 dark:text-emerald-200 font-medium'
                          : 'text-slate-600 dark:text-slate-400'
                      }
                    >
                      {choice.analysis}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Paraphrase Pairs Table (재진술 짝꿍 비교) */}
      {paraphrasePairs && paraphrasePairs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Repeat className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              지문 ↔ 정답 선지 재진술(Paraphrasing) 짝꿍
            </h4>
            <span className="text-[11px] text-slate-400">
              출제자가 지문 원문을 정답 선지로 바꿔 쓴 핵심 표현 매칭
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paraphrasePairs.map((pair, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] shrink-0">
                    지문 원문 표현
                  </span>
                  <span className="font-serif text-slate-800 dark:text-slate-200 font-medium">
                    "{pair.passageExpr}"
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] pl-2">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>재진술(Paraphrased) 변형</span>
                </div>
                <div className="flex items-start gap-2 bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] shrink-0">
                    정답 선지 표현
                  </span>
                  <span className="font-serif text-emerald-950 dark:text-emerald-200 font-medium">
                    "{pair.choiceExpr}"
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
