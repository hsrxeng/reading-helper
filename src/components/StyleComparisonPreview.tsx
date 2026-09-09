import React from 'react';
import { Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { PosColorMode } from '../utils/posHelper';

interface StyleComparisonPreviewProps {
  currentMode: PosColorMode;
  onSelectMode: (mode: PosColorMode) => void;
  onClose?: () => void;
}

export const StyleComparisonPreview: React.FC<StyleComparisonPreviewProps> = ({
  currentMode,
  onSelectMode,
  onClose,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 my-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>주어(빨강) · 서술어(파랑) 핵심 스타일 비교</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                2가지 모드 선택 가능
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              핵심 뼈대인 주어(S)와 서술어(V)만 깔끔하게 강조하여 문장 구조가 한눈에 파악됩니다.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. 밑줄 모드 */}
        <div
          onClick={() => onSelectMode('underline')}
          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
            currentMode === 'underline'
              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/40 shadow-xs'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>1. 컬러 밑줄 모드</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold rounded">
                  가장 깔끔함
                </span>
              </span>
            </div>
            {currentMode === 'underline' ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> 적용 중
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                클릭하여 선택
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
            글자는 <strong>짙은 먹색</strong>으로 읽기 편안하며, <strong>주어에는 빨간 밑줄</strong>, <strong>서술어에는 파란 밑줄</strong>만 단정하게 표시됩니다.
          </p>

          {/* Actual Sample Rendering */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg space-y-2">
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">미리보기:</div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2 text-sm">
              <span className="text-slate-900 dark:text-slate-100 font-bold border-b-[2.5px] border-rose-500 dark:border-rose-400 pb-0.5">
                Popeye <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono font-normal">(S)</span>
              </span>
              <span className="text-slate-900 dark:text-slate-100 font-extrabold border-b-[2.5px] border-blue-600 dark:border-sky-400 pb-0.5">
                gained <span className="text-[10px] text-blue-600 dark:text-sky-400 font-mono font-normal">(V)</span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">superhuman strength</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs">and</span>
              <span className="text-slate-900 dark:text-slate-100 font-extrabold border-b-[2.5px] border-blue-600 dark:border-sky-400 pb-0.5">
                contributed <span className="text-[10px] text-blue-600 dark:text-sky-400 font-mono font-normal">(V)</span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">greatly to endurance.</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-0.5 bg-rose-500 dark:bg-rose-400 inline-block"></span> 주어 (S)
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-sky-400">
                <span className="w-2.5 h-0.5 bg-blue-600 dark:bg-sky-400 inline-block"></span> 서술어 (V)
              </span>
            </span>
            <button
              type="button"
              className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
            >
              선택하기 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 2. 소프트 파스텔 모드 */}
        <div
          onClick={() => onSelectMode('pastel')}
          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
            currentMode === 'pastel'
              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/40 shadow-xs'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>2. 소프트 파스텔 모드</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-semibold rounded">
                  부드러운 하이라이트
                </span>
              </span>
            </div>
            {currentMode === 'pastel' ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> 적용 중
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                클릭하여 선택
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
            원색의 쨍함을 뺀 <strong>은은한 로즈 핑크(주어)</strong>와 <strong>스카이블루(서술어)</strong> 배경 박스로 핵심 어휘가 돋보입니다.
          </p>

          {/* Actual Sample Rendering */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg space-y-2">
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">미리보기:</div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2 text-sm">
              <span className="text-rose-800 dark:text-rose-300 bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/70 font-bold rounded px-1.5 py-0.5">
                Popeye <span className="text-[10px] opacity-80 font-normal font-mono">(S)</span>
              </span>
              <span className="text-blue-800 dark:text-sky-300 bg-blue-50/90 dark:bg-sky-950/50 border border-blue-200/80 dark:border-sky-900/70 font-extrabold rounded px-1.5 py-0.5">
                gained <span className="text-[10px] opacity-80 font-normal font-mono">(V)</span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">superhuman strength</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs">and</span>
              <span className="text-blue-800 dark:text-sky-300 bg-blue-50/90 dark:bg-sky-950/50 border border-blue-200/80 dark:border-sky-900/70 font-extrabold rounded px-1.5 py-0.5">
                contributed <span className="text-[10px] opacity-80 font-normal font-mono">(V)</span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">greatly to endurance.</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-200 dark:bg-rose-900/80 inline-block border border-rose-300 dark:border-rose-800"></span> 주어 (S)
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-sky-400">
                <span className="w-2.5 h-2.5 rounded bg-blue-200 dark:bg-sky-900/80 inline-block border border-blue-300 dark:border-sky-800"></span> 서술어 (V)
              </span>
            </span>
            <button
              type="button"
              className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
            >
              선택하기 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
