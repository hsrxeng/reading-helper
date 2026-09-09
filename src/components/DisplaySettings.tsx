import React from 'react';
import { SlidersHorizontal, Type, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { DisplaySettingsState, HighlightTarget } from '../types';
import { PosColorMode } from '../utils/posHelper';

interface DisplaySettingsProps {
  settings: DisplaySettingsState;
  onChange: (newSettings: DisplaySettingsState) => void;
  onToggleComparison?: () => void;
  isComparisonOpen?: boolean;
}

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  settings,
  onChange,
  onToggleComparison,
  isComparisonOpen,
}) => {
  // Mobile/desktop friendly collapsible state
  const [isExpanded, setIsExpanded] = React.useState(true);

  const toggleKey = (key: keyof DisplaySettingsState) => {
    onChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const setPosMode = (mode: PosColorMode) => {
    onChange({
      ...settings,
      showPosColors: true,
      posColorMode: mode,
    });
  };

  const setHighlightTarget = (target: HighlightTarget) => {
    onChange({
      ...settings,
      showPosColors: true,
      highlightTarget: target,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs no-print transition-all">
      {/* Header bar: Title, Quick Badges when collapsed, and Toggle Button */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          id="toggle-options-expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left cursor-pointer group flex-1 min-w-0"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                분석지 보기 옵션
              </span>
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                {isExpanded ? '접어서 본문 집중' : '옵션 열기'}
              </span>
            </div>

            {/* Quick summary chips shown when collapsed */}
            {!isExpanded && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {settings.showPosColors && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    {settings.highlightTarget === 'sv_only' ? 'S·V 강조' : '전체 품사'} (
                    {settings.posColorMode === 'underline' ? '밑줄' : '파스텔'})
                  </span>
                )}
                {settings.showRoles && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[10px]">
                    S·V·O·C
                  </span>
                )}
                {settings.showDirectTranslation && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-[10px]">
                    직독직해
                  </span>
                )}
                {settings.showPolishedTranslation && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 text-[10px]">
                    윤문
                  </span>
                )}
                {settings.showGrammarPoints && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-[10px]">
                    어법
                  </span>
                )}
              </div>
            )}
          </div>
        </button>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
          title={isExpanded ? '옵션 접기' : '옵션 펼치기'}
        >
          <span>{isExpanded ? '옵션 접기' : '옵션 펼치기'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      </div>

      {/* Expanded Controls Drawer */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          {/* Main items and highlighters flex container */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                id="toggle-roles-btn"
                onClick={() => toggleKey('showRoles')}
                className={`px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                  settings.showRoles
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                S·V·O·C 성분
              </button>

              <button
                id="toggle-meanings-btn"
                onClick={() => toggleKey('showMeanings')}
                className={`px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                  settings.showMeanings
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                단어 뜻 / 상단 태그
              </button>

              <button
                id="toggle-direct-trans-btn"
                onClick={() => toggleKey('showDirectTranslation')}
                className={`px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                  settings.showDirectTranslation
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                직독직해 (끊어 읽기)
              </button>

              <button
                id="toggle-polished-trans-btn"
                onClick={() => toggleKey('showPolishedTranslation')}
                className={`px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                  settings.showPolishedTranslation
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                윤문 (자연스러운 완역)
              </button>

              <button
                id="toggle-grammar-btn"
                onClick={() => toggleKey('showGrammarPoints')}
                className={`px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer ${
                  settings.showGrammarPoints
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                문법 포인트 해설
              </button>

              <button
                id="toggle-pos-colors-btn"
                onClick={() => toggleKey('showPosColors')}
                className={`px-2.5 py-1 rounded-lg font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  settings.showPosColors
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </span>
                <span>주어·서술어 강조</span>
              </button>

              {/* Sub-options when Pos Colors are enabled */}
              {settings.showPosColors && (
                <div className="inline-flex rounded-lg border border-slate-200/90 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-[11px] items-center">
                  <button
                    type="button"
                    id="pos-mode-underline-btn"
                    onClick={() => setPosMode('underline')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                      settings.posColorMode === 'underline'
                        ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/70 dark:border-slate-600'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="글자는 편안한 먹색으로 유지하고 주어(빨강)·서술어(파랑) 밑줄 표시"
                  >
                    밑줄 모드
                  </button>
                  <button
                    type="button"
                    id="pos-mode-pastel-btn"
                    onClick={() => setPosMode('pastel')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                      settings.posColorMode === 'pastel'
                        ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/70 dark:border-slate-600'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="주어는 은은한 로즈 틴트, 서술어는 스카이블루 틴트로 표시"
                  >
                    소프트 파스텔
                  </button>
                </div>
              )}

              {/* Target selector: S·V 집중 vs 전체 */}
              {settings.showPosColors && (
                <div className="inline-flex rounded-lg border border-slate-200/90 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-[11px] items-center">
                  <button
                    type="button"
                    id="target-sv-only-btn"
                    onClick={() => setHighlightTarget('sv_only')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                      (settings.highlightTarget || 'sv_only') === 'sv_only'
                        ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/70 dark:border-slate-600'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="주어(빨강)와 서술어(파랑)만 핵심 집중 강조"
                  >
                    S·V 핵심만
                  </button>
                  <button
                    type="button"
                    id="target-all-btn"
                    onClick={() => setHighlightTarget('all')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                      settings.highlightTarget === 'all'
                        ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/70 dark:border-slate-600'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="명사, 동사, 형용사, 부사 전체 품사 강조"
                  >
                    전체 품사
                  </button>
                </div>
              )}

              {/* Style Comparison Trigger */}
              {onToggleComparison && (
                <button
                  type="button"
                  id="toggle-style-comparison-btn"
                  onClick={onToggleComparison}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                    isComparisonOpen
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                  }`}
                  title="밑줄 모드 vs 파스텔 모드 예시 비교"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>스타일 예시 비교</span>
                </button>
              )}
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center gap-1.5 border-t lg:border-t-0 pt-2 lg:pt-0 w-full lg:w-auto justify-end dark:border-slate-800 shrink-0">
              <Type className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium mr-1">글자 크기:</span>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                {(['sm', 'base', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    id={`font-size-${size}-btn`}
                    onClick={() => onChange({ ...settings, fontSize: size })}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      settings.fontSize === size
                        ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-slate-600'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {size === 'sm' ? '작게' : size === 'base' ? '보통' : '크게'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
