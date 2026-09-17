import React, { useState } from 'react';
import {
  X,
  Check,
  Target,
  Edit3,
  Lightbulb,
} from 'lucide-react';
import { SuneungAnalysis, SuneungChoiceAnalysis } from '../types';

interface SuneungEditModalProps {
  analysis: SuneungAnalysis;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: SuneungAnalysis) => void;
}

export const SuneungEditModal: React.FC<SuneungEditModalProps> = ({
  analysis,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [questionType, setQuestionType] = useState(analysis.questionType || '글의 흐름과 관계 없는 문장 찾기');
  const [questionPrompt, setQuestionPrompt] = useState(analysis.questionPrompt || '');
  const [correctChoiceNumber, setCorrectChoiceNumber] = useState<number>(
    analysis.correctChoiceNumber || 1
  );
  const [coreLogicSummary, setCoreLogicSummary] = useState(
    analysis.coreLogicSummary || ''
  );
  const [clueSentenceNumbersStr, setClueSentenceNumbersStr] = useState(
    (analysis.clueSentenceNumbers || []).join(', ')
  );
  const [choices, setChoices] = useState<SuneungChoiceAnalysis[]>(
    JSON.parse(JSON.stringify(analysis.choices || []))
  );

  const handleCorrectChoiceChange = (newNum: number) => {
    setCorrectChoiceNumber(newNum);
    setChoices((prev) =>
      prev.map((c) => ({
        ...c,
        isCorrect: c.number === newNum,
      }))
    );
  };

  const handleChoiceTextChange = (index: number, text: string) => {
    setChoices((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], text };
      return copy;
    });
  };

  const handleChoiceAnalysisChange = (index: number, val: string) => {
    setChoices((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], analysis: val };
      return copy;
    });
  };

  const handleSave = () => {
    const clueNumbers = clueSentenceNumbersStr
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const updated: SuneungAnalysis = {
      ...analysis,
      questionType,
      questionPrompt,
      correctChoiceNumber,
      coreLogicSummary,
      clueSentenceNumbers: clueNumbers.length > 0 ? clueNumbers : [correctChoiceNumber],
      choices: choices.map((c) => ({
        ...c,
        isCorrect: c.number === correctChoiceNumber,
      })),
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
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
              <Target className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>수능 정답 및 해설 논리 직접 수정</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI가 정답 번호나 오답 소거 논리를 잘못 판별한 경우 직접 교정할 수 있습니다.
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
          {/* Question Type & Correct Choice Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                문제 유형
              </label>
              <input
                type="text"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                placeholder="예: 글의 흐름과 관계 없는 문장 찾기, 빈칸추론 등"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                실제 정답 번호 (1~5번)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleCorrectChoiceChange(num)}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                      correctChoiceNumber === num
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num}번
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Core Logic Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              정답 도출 핵심 출제 논리 (Core Logic)
            </label>
            <textarea
              rows={3}
              value={coreLogicSummary}
              onChange={(e) => setCoreLogicSummary(e.target.value)}
              placeholder="예: 지문의 중심 화제(마오리족 족보의 화재 소실과 상실감)와 달리, 5번 문장은 본문의 논리적 흐름과 무관한 서술임."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* Clue sentence numbers */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              결정적 정답 단서 문장 번호 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={clueSentenceNumbersStr}
              onChange={(e) => setClueSentenceNumbersStr(e.target.value)}
              placeholder="예: 5 또는 1, 5"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Choices 1~5 Edit List */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              선지별(①~⑤) 내용 및 정답/오답 소거 해설
            </label>
            <div className="space-y-3">
              {choices.map((choice, idx) => {
                const isSelectedAsCorrect = choice.number === correctChoiceNumber;
                return (
                  <div
                    key={choice.number}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelectedAsCorrect
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelectedAsCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {choice.number}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {choice.number}번 선지
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCorrectChoiceChange(choice.number)}
                        className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          isSelectedAsCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                        }`}
                      >
                        {isSelectedAsCorrect ? '✓ 정답으로 지정됨' : '정답으로 변경'}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => handleChoiceTextChange(idx, e.target.value)}
                        placeholder="선지 본문 내용"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100"
                      />
                      <input
                        type="text"
                        value={choice.analysis}
                        onChange={(e) =>
                          handleChoiceAnalysisChange(idx, e.target.value)
                        }
                        placeholder="정답 이유 또는 오답 소거 논리"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-slate-100"
                      />
                    </div>
                  </div>
                );
              })}
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
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>수정 사항 저장</span>
          </button>
        </div>
      </div>
    </div>
  );
};
