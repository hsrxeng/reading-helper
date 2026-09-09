import React, { useState, useMemo } from 'react';
import { X, Sparkles, Check, FileText, ListOrdered, ArrowRight, AlertCircle, HelpCircle } from 'lucide-react';
import { parseExamText, ParsedExamQuestion } from '../utils/suneungParser';

interface SmartExamImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: {
    prompt: string;
    passage: string;
    choices: [string, string, string, string, string];
  }) => void;
}

export const SmartExamImportModal: React.FC<SmartExamImportModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [pastedText, setPastedText] = useState('');

  const parsed: ParsedExamQuestion = useMemo(() => {
    return parseExamText(pastedText);
  }, [pastedText]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      prompt: parsed.prompt,
      passage: parsed.passage,
      choices: parsed.choices,
    });
    onClose();
  };

  const sampleMockText = `31. 다음 글의 빈칸에 들어갈 말로 가장 적절한 것은? [3점]
Our tastes are social. Even when you first drank milk, there was the milk, yes, but there was also the person behind the milk who will have presumably either made or messed up your relationship with food for the couple of decades after that. We learn to eat from our families and friends, at school and in work. Our food choices reflect the relationships we have, and tastes spread from person to person like viruses, often irrespective of the food's actual qualities.
① social
② fixed
③ simple
④ objective
⑤ biological`;

  const handleLoadSample = () => {
    setPastedText(sampleMockText);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>시험지 문제 통째로 붙여넣기</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-md">
                  스마트 자동 분리
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                발문 + 지문 + 5지선다(①~⑤)를 통째로 붙여넣으면 각 필드에 맞게 자동 분리합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Instructions & sample helper */}
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="smart-import-textarea" className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              모의고사·수능 원문 문제 붙여넣기:
            </label>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              예시 시험지 텍스트 채우기
            </button>
          </div>

          <textarea
            id="smart-import-textarea"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={`여기에 시험지 문제를 통째로 붙여넣으세요...\n\n예시:\n31. 다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?\nPopeye, who gained superhuman strength...\n① choice 1\n② choice 2\n③ choice 3\n④ choice 4\n⑤ choice 5`}
            rows={7}
            className="w-full p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed"
          />

          {/* Realtime Parsing Preview */}
          {pastedText.trim() && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  실시간 자동 분리 결과 미리보기:
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                  parsed.hasParsedChoices
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  {parsed.hasParsedChoices ? '5지선다 5개 모두 감지 완료' : '선지 번호(①~⑤)를 확인해 주세요'}
                </span>
              </div>

              {/* Prompt preview */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
                  1. 발문 (Question Prompt):
                </div>
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  {parsed.prompt || <span className="text-slate-400 italic">(발문이 감지되지 않음 - 기본 발문 유지)</span>}
                </div>
              </div>

              {/* Passage preview */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
                  2. 영어 본문 지문 (Passage):
                </div>
                <div className="text-slate-700 dark:text-slate-300 font-serif line-clamp-3 leading-relaxed">
                  {parsed.passage || <span className="text-slate-400 italic">(본문 지문 없음)</span>}
                </div>
              </div>

              {/* Choices preview */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
                  3. 5지선다 선지 (① ~ ⑤ Choices):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {parsed.choices.map((choice, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800"
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold shrink-0">
                        {['①', '②', '③', '④', '⑤'][i]}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 truncate text-[11px]">
                        {choice || <span className="text-slate-400 italic">(비어 있음)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!parsed.passage && !parsed.prompt}
            onClick={handleApply}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-xs cursor-pointer ${
              !parsed.passage && !parsed.prompt
                ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
            }`}
          >
            <span>각 입력칸에 자동 분리 적용</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
