import React from 'react';
import { BookOpen, Printer, Copy, Bookmark, HelpCircle, GraduationCap, Check, Sun, Moon } from 'lucide-react';
import { PassageAnalysisResult } from '../types';

interface HeaderProps {
  currentAnalysis: PassageAnalysisResult | null;
  onOpenLegend: () => void;
  onOpenHistory: () => void;
  onOpenPrint: () => void;
  historyCount: number;
  onSaveCurrent?: () => void;
  isCurrentSaved?: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAnalysis,
  onOpenLegend,
  onOpenHistory,
  onOpenPrint,
  historyCount,
  onSaveCurrent,
  isCurrentSaved,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAll = () => {
    if (!currentAnalysis) return;

    let text = `[${currentAnalysis.title || '모의고사 영어 지문 정밀 구문분석본'}]\n`;
    if (currentAnalysis.summary) {
      text += `■ 핵심 요지: ${currentAnalysis.summary}\n\n`;
    }

    currentAnalysis.sentences.forEach((s) => {
      text += `--------------------------------------------------\n`;
      text += `[문장 ${s.sentenceNumber}] ${s.sentencePattern ? `(${s.sentencePattern})` : ''}\n`;
      text += `원문: ${s.originalText}\n\n`;
      text += `■ 구문 분해 (S/V/O/C):\n`;
      text += (s.tokens || [])
        .map((t) => {
          if (!t) return '';
          const roleStr = t.role ? `[${t.role}]` : '';
          const meaningStr = t.meaning ? `(${t.meaning})` : '';
          return `${t.text || ''}${roleStr}${meaningStr}`;
        })
        .filter(Boolean)
        .join(' ');
      text += `\n\n`;
      text += `■ 직독직해 (끊어 읽기):\n${s.directTranslation}\n\n`;
      text += `■ 윤문 완역 (해설지 스타일):\n${s.polishedTranslation}\n\n`;

      if (s.grammarPoints && s.grammarPoints.length > 0) {
        text += `■ 핵심 문법 포인트:\n`;
        s.grammarPoints.forEach((gp) => {
          text += `- ${gp}\n`;
        });
        text += `\n`;
      }

      if (s.vocabulary && s.vocabulary.length > 0) {
        text += `■ 주요 어휘:\n`;
        s.vocabulary.forEach((v) => {
          text += `- ${v.word} : ${v.meaning}\n`;
        });
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3.5 no-print transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                영어 지문 분석기
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md">
                구문 · 문법 분석
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              문장 성분(S·V·O·C) 분석, 끊어 읽기 직독직해, 자연스러운 완역
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Light / Dark Mode Toggle Button */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleDarkMode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                <span className="hidden sm:inline">라이트 모드</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="hidden sm:inline">다크 모드</span>
              </>
            )}
          </button>

          <button
            id="legend-open-btn"
            onClick={onOpenLegend}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="기호 및 구문 표기법 범례 안내"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>표기 범례</span>
          </button>

          <button
            id="history-open-btn"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="저장된 지문 보관함 (최대 10개)"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>지문 보관함</span>
            <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              historyCount >= 10 ? 'bg-amber-600 text-white' : 'bg-indigo-600 dark:bg-indigo-500 text-white'
            }`}>
              {historyCount}/10
            </span>
          </button>

          {currentAnalysis && (
            <>
              {onSaveCurrent && (
                <button
                  id="save-current-passage-btn"
                  onClick={onSaveCurrent}
                  disabled={isCurrentSaved}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                    isCurrentSaved
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                  }`}
                  title={isCurrentSaved ? '보관함에 저장됨' : '현재 지문을 보관함에 저장 (최대 10개)'}
                >
                  {isCurrentSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>저장됨</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>지문 저장</span>
                    </>
                  )}
                </button>
              )}
              <button
                id="copy-all-text-btn"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="한글(HWP) 및 블로그용 텍스트 전체 복사"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>전체 복사</span>
                  </>
                )}
              </button>

              <button
                id="print-export-btn"
                onClick={onOpenPrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                title="A4 내신/수능 분석지 인쇄 및 PDF 저장"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>A4 인쇄 / PDF</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
