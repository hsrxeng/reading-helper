import React, { useState } from 'react';
import { X, Bookmark, Trash2, ArrowRight, BookOpen, Clock, Plus, Check } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  canSaveCurrent?: boolean;
  onSaveCurrent?: () => void;
  isCurrentSaved?: boolean;
}

const MAX_SAVED_ITEMS = 10;

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onDelete,
  onClearAll,
  canSaveCurrent,
  onSaveCurrent,
  isCurrentSaved,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="history-modal-dialog"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">지문 보관함</h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  items.length >= MAX_SAVED_ITEMS
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {items.length} / {MAX_SAVED_ITEMS}개
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                자주 사용하는 지문을 최대 {MAX_SAVED_ITEMS}개까지 저장하고 불러올 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar: Save current passage if available */}
        {canSaveCurrent && onSaveCurrent && (
          <div className="px-6 py-2.5 bg-indigo-50/60 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs">
            <span className="text-indigo-900 dark:text-indigo-200 font-medium">현재 화면의 지문을 보관함에 저장할까요?</span>
            <button
              type="button"
              onClick={onSaveCurrent}
              disabled={isCurrentSaved}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                isCurrentSaved
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-xs'
              }`}
            >
              {isCurrentSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>저장됨</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>현재 지문 저장 (+1)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* List of saved passages */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">보관된 지문이 없습니다.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                지문을 입력하고 분석한 후 <strong>[지문 저장]</strong> 버튼을 누르면 최대 {MAX_SAVED_ITEMS}개까지 여기에 보관됩니다.
              </p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-xl transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md">
                      {item.gradeLevel}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleString('ko-KR', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      • {item.data.sentences.length}개 문장
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="지문 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title / Summary */}
                <div className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                  {item.customTitle || item.data.title || item.data.summary || '영어 지문 분석'}
                </div>

                {/* Preview text */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800 font-serif">
                  {item.previewText}
                </p>

                {/* Bottom actions */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    <span>이 지문 불러오기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          {items.length > 0 ? (
            <button
              onClick={onClearAll}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium transition-colors cursor-pointer"
            >
              전체 비우기
            </button>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">최대 {MAX_SAVED_ITEMS}개 보관 가능</span>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
