import React, { useState } from 'react';
import {
  X,
  Check,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  BookOpen,
  Edit3,
} from 'lucide-react';
import { SentenceAnalysis, SyntaxToken, VocabularyItem } from '../types';

interface SentenceEditModalProps {
  sentence: SentenceAnalysis;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: SentenceAnalysis) => void;
}

const COMMON_ROLES = ['', 'S', 'V', 'O', 'C', 'M', "S'", "V'", "O'", "C'", "M'", 'S1', 'V1', 'O1', 'V2', 'O2'];
const CLAUSE_TYPES = [
  { value: 'none', label: '일반 (없음)' },
  { value: 'relative', label: '관계절 [대괄호]' },
  { value: 'noun', label: '명사절 <꺾쇠>' },
  { value: 'prepositional', label: '전치사구 (소괄호)' },
  { value: 'adverb', label: '부사절/구 (소괄호)' },
  { value: 'parenthesis', label: '삽입구' },
];

export const SentenceEditModal: React.FC<SentenceEditModalProps> = ({
  sentence,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [pattern, setPattern] = useState(sentence.sentencePattern || '3형식');
  const [tokens, setTokens] = useState<SyntaxToken[]>(
    JSON.parse(JSON.stringify(sentence.tokens || []))
  );
  const [directTranslation, setDirectTranslation] = useState(
    sentence.directTranslation || ''
  );
  const [polishedTranslation, setPolishedTranslation] = useState(
    sentence.polishedTranslation || ''
  );
  const [grammarPoints, setGrammarPoints] = useState<string[]>(
    [...(sentence.grammarPoints || [])]
  );
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(
    JSON.parse(JSON.stringify(sentence.vocabulary || []))
  );

  const handleUpdateToken = (
    index: number,
    field: keyof SyntaxToken,
    value: any
  ) => {
    setTokens((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddGrammarPoint = () => {
    setGrammarPoints((prev) => [...prev, '새로운 어법 설명']);
  };

  const handleRemoveGrammarPoint = (idx: number) => {
    setGrammarPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGrammarChange = (idx: number, val: string) => {
    setGrammarPoints((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleAddVocab = () => {
    setVocabulary((prev) => [...prev, { word: '', meaning: '' }]);
  };

  const handleRemoveVocab = (idx: number) => {
    setVocabulary((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVocabChange = (
    idx: number,
    field: 'word' | 'meaning',
    val: string
  ) => {
    setVocabulary((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSave = () => {
    const updated: SentenceAnalysis = {
      ...sentence,
      sentencePattern: pattern,
      tokens,
      directTranslation,
      polishedTranslation,
      grammarPoints: grammarPoints.filter((g) => g.trim().length > 0),
      vocabulary: vocabulary.filter((v) => v.word.trim().length > 0),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold">
              {String(sentence.sentenceNumber).padStart(2, '0')}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>문장 분석 결과 직접 수정</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI 분석이 어색하거나 틀린 성분, 어휘, 번역을 선생님 취향대로 즉시 교정하세요.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Sentence Original Text */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              원문 영어 문장
            </span>
            <p className="text-slate-800 dark:text-slate-200 font-medium">
              {sentence.originalText}
            </p>
          </div>

          {/* Sentence Pattern */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              문장 형식 (Pattern)
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="예: 3형식 (S + V + O) 또는 5형식 (S + V + O + OC)"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
            />
          </div>

          {/* Word / Token Syntax Role Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                단어/구문 성분(S·V·O·C·M) 및 역할 라벨 수정
              </label>
              <span className="text-[11px] text-slate-400">
                각 어구 아래의 문장 성분을 변경할 수 있습니다.
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 max-h-56 overflow-y-auto space-y-2">
              {tokens.map((tok, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono min-w-[100px]">
                    {tok.text}
                  </span>

                  {/* Role Selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">성분:</span>
                    <select
                      value={tok.role || ''}
                      onChange={(e) =>
                        handleUpdateToken(idx, 'role', e.target.value)
                      }
                      className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-hidden"
                    >
                      {COMMON_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r === '' ? '(없음)' : r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TagTop or meaning */}
                  <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                    <span className="text-slate-400">상단/뜻:</span>
                    <input
                      type="text"
                      value={tok.tagTop || tok.meaning || ''}
                      onChange={(e) =>
                        handleUpdateToken(idx, 'tagTop', e.target.value)
                      }
                      placeholder="상단 표시 라벨"
                      className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded"
                    />
                  </div>

                  {/* Clause type */}
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">괄호:</span>
                    <select
                      value={tok.clauseType || 'none'}
                      onChange={(e) =>
                        handleUpdateToken(idx, 'clauseType', e.target.value)
                      }
                      className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[11px]"
                    >
                      {CLAUSE_TYPES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Translation (직독직해) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              직독직해 (끊어 읽기 단위 해석)
            </label>
            <textarea
              rows={2}
              value={directTranslation}
              onChange={(e) => setDirectTranslation(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
            />
          </div>

          {/* Polished Translation (자연스러운 완역) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              자연스러운 완역 (해설지 번역)
            </label>
            <textarea
              rows={2}
              value={polishedTranslation}
              onChange={(e) => setPolishedTranslation(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
            />
          </div>

          {/* Grammar Points */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                어법 포인트 (문법 설명)
              </label>
              <button
                type="button"
                onClick={handleAddGrammarPoint}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>항목 추가</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {grammarPoints.map((gp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={gp}
                    onChange={(e) => handleGrammarChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGrammarPoint(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Vocabulary */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                핵심 어휘 목록
              </label>
              <button
                type="button"
                onClick={handleAddVocab}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>어휘 추가</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {vocabulary.map((voc, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="단어 (예: require)"
                    value={voc.word}
                    onChange={(e) =>
                      handleVocabChange(idx, 'word', e.target.value)
                    }
                    className="w-1/3 px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100 font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="뜻 (예: 요구하다, 필요로 하다)"
                    value={voc.meaning}
                    onChange={(e) =>
                      handleVocabChange(idx, 'meaning', e.target.value)
                    }
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVocab(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>수정 사항 저장</span>
          </button>
        </div>
      </div>
    </div>
  );
};
