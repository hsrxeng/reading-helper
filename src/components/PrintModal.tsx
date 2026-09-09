import React, { useState } from 'react';
import { X, Printer, Check, Settings2, FileText, Download } from 'lucide-react';
import { PassageAnalysisResult, DisplaySettingsState } from '../types';
import { getTokenPosStyle } from '../utils/posHelper';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: PassageAnalysisResult | null;
  settings: DisplaySettingsState;
}

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, analysis, settings }) => {
  const [printMode, setPrintMode] = useState<'standard' | 'grayscale' | 'workbook'>('standard');
  const [worksheetTitle, setWorksheetTitle] = useState('영어 지문 구문분석 학습지');
  const [studentName, setStudentName] = useState('');

  if (!isOpen || !analysis) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="print-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">A4 인쇄 &amp; PDF 내보내기 미리보기</h3>
              <p className="text-xs text-slate-500">
                A4 규격 인쇄 및 PDF 저장용 레이아웃
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="execute-print-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>지금 인쇄 / PDF 저장</span>
            </button>
            <button
              id="close-print-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Toolbar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">인쇄 스타일:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
              <button
                type="button"
                onClick={() => setPrintMode('standard')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  printMode === 'standard' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                컬러 인쇄
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('grayscale')}
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  printMode === 'grayscale' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                흑백 잉크절약
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="학생 이름 (선택 사항)"
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Printable Preview Paper Sheet (A4 format style) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center">
          <div
            id="printable-sheet"
            className={`w-full max-w-[210mm] bg-white shadow-lg p-8 sm:p-12 border border-slate-300 rounded-sm text-slate-900 ${
              printMode === 'grayscale' ? 'filter grayscale contrast-110' : ''
            }`}
          >
            {/* Sheet Header */}
            <div className="border-b-2 border-slate-900 pb-3 mb-6">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{analysis.gradeLevel || '영어 지문'}</span>
                <span>이름: {studentName ? studentName : '____________________'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {analysis.title || worksheetTitle}
              </h2>
              {analysis.summary && (
                <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                  <strong className="text-indigo-900">■ 지문 요지 / 주제:</strong> {analysis.summary}
                </div>
              )}

              {settings.showPosColors && printMode !== 'grayscale' && (
                <div className="flex items-center gap-3 text-[10px] text-slate-600 mt-2.5 pt-2 border-t border-slate-100 font-medium">
                  <span className="font-semibold text-slate-700">[구문 색상 안내]</span>
                  <span className="text-red-600 font-bold">● 주어·S(빨강)</span>
                  <span className="text-blue-600 font-bold">● 서술어·V(파랑)</span>
                  <span className="text-orange-600 font-bold">● 형용사(주황)</span>
                  <span className="text-purple-600 font-bold">● 부사(보라)</span>
                </div>
              )}
            </div>

            {/* Sentences list in Print Format */}
            <div className="space-y-6">
              {analysis.sentences.map((sentence) => (
                <div key={sentence.sentenceNumber} className="border-b border-slate-200 pb-5 avoid-break">
                  {/* Sentence header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-bold text-xs rounded">
                      Sentence {sentence.sentenceNumber}
                    </span>
                    {sentence.sentencePattern && (
                      <span className="text-xs font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {sentence.sentencePattern}
                      </span>
                    )}
                  </div>

                  {/* Word by word ruby/blocks */}
                  <div className="flex flex-wrap items-end gap-x-2 gap-y-4 my-3 p-2.5 bg-slate-50/70 border border-slate-200 rounded">
                    {(sentence.tokens || []).map((token, idx) => {
                      if (!token) return null;
                      const posStyle = getTokenPosStyle(
                        token,
                        settings.showPosColors && printMode !== 'grayscale',
                        settings.posColorMode
                      );
                      return (
                        <div key={idx} className="inline-flex flex-col items-center">
                          <span className="text-[10px] text-slate-600 font-medium h-4 leading-none">
                            {token.tagTop || token.meaning || ''}
                          </span>
                          <span className={`text-sm border-b border-slate-400 px-0.5 ${posStyle}`}>
                            {token.text || ''}
                          </span>
                          <span className={`text-[10px] font-mono font-bold h-4 leading-none mt-0.5 ${
                            (token.role || '').toUpperCase().startsWith('S')
                              ? 'text-red-700'
                              : (token.role || '').toUpperCase().startsWith('V')
                              ? 'text-blue-700'
                              : 'text-indigo-700'
                          }`}>
                            {token.role || ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Direct translation */}
                  <div className="text-xs text-slate-700 bg-emerald-50/50 p-2 rounded border border-emerald-100 mb-2">
                    <strong className="text-emerald-900">[직독직해]</strong> {sentence.directTranslation}
                  </div>

                  {/* Polished translation */}
                  <div className="text-xs text-slate-900 bg-slate-50 p-2 rounded border border-slate-200 mb-2">
                    <strong className="text-indigo-900">[완역]</strong> {sentence.polishedTranslation}
                  </div>

                  {/* Grammar points & Vocab */}
                  {sentence.grammarPoints && sentence.grammarPoints.length > 0 && (
                    <div className="text-[11px] text-slate-600 pl-2">
                      <strong className="text-slate-800">• 어법:</strong> {sentence.grammarPoints.join(' | ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sheet Footer */}
            <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-400">
              수능·모의고사 영어 구문분석 학습지 (S·V·O·C 정밀 분석 &amp; 직독직해)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
