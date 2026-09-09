import React from 'react';
import { X, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface LegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegendModal: React.FC<LegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="legend-modal-dialog"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-slate-800 dark:text-slate-100 transition-colors"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">문장 성분 및 구문 표기 가이드</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">문장 성분(S·V·O·C), 절 괄호, 품사 색상 표기 안내</p>
            </div>
          </div>
          <button
            id="close-legend-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-6 text-sm">
          {/* 1. 문장 성분 */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2.5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              1. 주요 문장 성분 기호
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
                <span className="font-mono font-bold text-rose-700 dark:text-rose-300 text-base">S</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 ml-2 font-medium">주어 (Subject - 빨간색)</span>
              </div>
              <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl">
                <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-base">V</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 ml-2 font-medium">서술어·동사 (Verb - 파란색)</span>
              </div>
              <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl">
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-base">O</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 ml-2 font-medium">목적어 (Object)</span>
              </div>
              <div className="p-2.5 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-xl">
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-base">C</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 ml-2 font-medium">보어 (Complement)</span>
              </div>
              <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl">
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-base">M</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 ml-2 font-medium">수식어 (Modifier)</span>
              </div>
              <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl">
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 text-base">S' / V' / O'</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 ml-2 font-medium">종속절/관계절 성분</span>
              </div>
            </div>
          </div>

          {/* 2. 괄호 체계 */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              2. 괄호 및 절 묶음 표기법
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs shrink-0">
                  [ 관계사절 / 형용사절 ]
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  선행사(명사)를 수식하는 주격/목적격 관계대명사절, 관계부사절을 묶어 명확한 수식 관계를 보여줍니다.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs shrink-0">
                  &lt; 명사절 / to부정사구 &gt;
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  that절, whether/if절, 의문사절, 동명사구 등 문장의 주어/목적어/보어 역할을 하는 덩어리를 묶습니다.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs shrink-0">
                  ( 전치사구 / 부사절 / 분사구문 )
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  시간·장소·이유·조건 등을 수식하는 부사적 덩어리 및 부가 정보 수식어를 묶습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 3. 품사별 어휘 색상 규칙 */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2.5 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 via-blue-500 via-orange-500 to-purple-500 inline-block"></span>
              3. 품사별 어휘 색상 규칙
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-600 mb-1"></span>
                <div className="font-bold text-red-700 dark:text-red-300 text-sm">명사 (Noun)</div>
                <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-0.5">빨간색</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">주어, 목적어, 전치사의 목적어 등</div>
              </div>

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-600 mb-1"></span>
                <div className="font-bold text-blue-700 dark:text-blue-300 text-sm">서술어 (Predicate)</div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">파란색</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">본동사, 조동사, 술어 동사구</div>
              </div>

              <div className="p-3 bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 rounded-xl text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-600 mb-1"></span>
                <div className="font-bold text-orange-700 dark:text-orange-300 text-sm">형용사 (Adjective)</div>
                <div className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold mt-0.5">주황색</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">명사 수식어, 주격/목적격 보어</div>
              </div>

              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-xl text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-purple-600 mb-1"></span>
                <div className="font-bold text-purple-700 dark:text-purple-300 text-sm">부사 (Adverb)</div>
                <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">보라색</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">동사/형용사/문장 수식 부사구</div>
              </div>
            </div>
          </div>

          {/* 4. 3단 분해 카드 구조 안내 */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-slate-800/60 dark:to-indigo-950/40 p-4 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <h4 className="font-semibold text-indigo-950 dark:text-indigo-200 mb-2">4. 단어 카드 3단 구조 안내</h4>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg w-fit mx-auto shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">상단: 한국어 뜻 / 문법 태그</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 border-b-2 border-rose-500 pb-0.5 px-3">
                <span className="text-rose-600 font-bold">Subject(빨강)</span> &middot; <span className="text-blue-600 font-bold">Verb(파랑)</span>
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                하단 성분: <span className="text-rose-600 font-bold">S(빨강)</span> / <span className="text-blue-600 font-bold">V(파랑)</span> / O / C
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            id="confirm-legend-btn"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-xs cursor-pointer"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
