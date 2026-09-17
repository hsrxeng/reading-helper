import React from 'react';
import {
  AlertCircle,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Compass,
  FileText,
  Target,
  FileQuestion,
  TrendingUp,
  Bookmark,
} from 'lucide-react';
import { NaesinWrongNoteAnalysis } from '../types';

interface NaesinWrongNoteViewProps {
  analysis: NaesinWrongNoteAnalysis;
  onScrollToSentence?: (sentenceNumber: number) => void;
}

export const NaesinWrongNoteView: React.FC<NaesinWrongNoteViewProps> = ({
  analysis,
  onScrollToSentence,
}) => {
  const {
    questionTitle,
    questionType,
    questionPrompt,
    studentAnswer,
    correctAnswer,
    wrongReasonAnalysis,
    clueSentenceInPassage,
    originalVsModified,
    actionItemForNextExam,
    relatedGrammarOrVocab = [],
  } = analysis;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden mb-6 transition-all">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs border border-white/30">
                내신 오답노트 &amp; 함정 분석
              </span>
              {questionType && (
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-800/80 text-emerald-100 border border-emerald-400/30">
                  {questionType}
                </span>
              )}
              {questionTitle && (
                <span className="text-xs text-emerald-100 font-medium">
                  {questionTitle}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{questionPrompt || '내신 기출 문항 오답 원인 정밀 분석'}</span>
            </h2>
          </div>

          {/* Quick Score/Choice Badge */}
          <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl backdrop-blur-xs border border-white/20 shrink-0">
            <div className="px-2.5 py-1 rounded-lg bg-rose-500/90 text-white text-xs font-bold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>내 오답: {studentAnswer}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/70" />
            <div className="px-2.5 py-1 rounded-lg bg-emerald-400 text-emerald-950 text-xs font-bold flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" />
              <span>실제 정답: {correctAnswer}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* 1. Trap & Psychological Cause Deep-Dive (내가 왜 이 오답에 끌렸을까?) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Psychological Trap (학생 착각 분석) */}
          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/90 dark:border-rose-900/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs sm:text-sm">
              <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span>오답 선택 심리 역추적 (내가 왜 {studentAnswer}번에 끌렸을까?)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
              {wrongReasonAnalysis.psychologicalTrap}
            </p>
          </div>

          {/* Card 2: School Exam Trap Type (출제자의 내신 변형 함정) */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-900/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs sm:text-sm">
              <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
                <Compass className="w-4 h-4" />
              </div>
              <span>출제자의 내신 시험 변형 함정</span>
            </div>
            <div className="pl-8 space-y-1">
              <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                {wrongReasonAnalysis.schoolExamTrapType}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                {wrongReasonAnalysis.detailedComparison}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Original vs Modified Comparison (if present) */}
        {originalVsModified && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-indigo-500" />
              <span>원문 vs 내신 시험 변형 포인트 비교</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  [모의고사/교과서 원문 표현]
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-serif">
                  {originalVsModified.originalText}
                </p>
              </div>
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                  [학교 시험 변형 출제 표현]
                </span>
                <p className="text-emerald-950 dark:text-emerald-200 font-serif font-medium">
                  {originalVsModified.modifiedText}
                </p>
              </div>
            </div>
            {originalVsModified.point && (
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <strong>💡 변형 포인트:</strong> {originalVsModified.point}
              </p>
            )}
          </div>
        )}

        {/* 3. Decisive Clue Sentence in Passage */}
        {clueSentenceInPassage && (
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>지문 속 정답의 결정적 판별 단서 문장</span>
                {clueSentenceInPassage.sentenceNumber && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                    문장 #{clueSentenceInPassage.sentenceNumber}
                  </span>
                )}
              </span>
              {clueSentenceInPassage.sentenceNumber && onScrollToSentence && (
                <button
                  type="button"
                  onClick={() => onScrollToSentence(clueSentenceInPassage.sentenceNumber!)}
                  className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 underline font-medium cursor-pointer"
                >
                  해당 문장 분석으로 바로가기 &darr;
                </button>
              )}
            </div>
            {clueSentenceInPassage.sentenceText && (
              <blockquote className="p-3 bg-white dark:bg-slate-900 rounded-lg border-l-4 border-emerald-500 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-serif italic">
                "{clueSentenceInPassage.sentenceText}"
              </blockquote>
            )}
            <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 leading-relaxed">
              {clueSentenceInPassage.explanation}
            </p>
          </div>
        )}

        {/* 4. Action Item for Next Exam (다음 시험 처방전) & Related Vocab/Grammar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>다음 내신 시험 대비 처방전 (Action Item)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {actionItemForNextExam}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold text-xs">
              <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>함께 챙길 내신 필수 포인트</span>
            </div>
            <div className="space-y-1">
              {relatedGrammarOrVocab.map((item, idx) => (
                <div
                  key={idx}
                  className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5"
                >
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
