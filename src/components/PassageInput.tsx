import React, { useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  BookMarked,
  ArrowRight,
  FileText,
  Info,
  AlertCircle,
  Bookmark,
  Target,
  FileUp,
  Layers,
  HelpCircle,
  PenTool,
} from 'lucide-react';
import { SAMPLE_PASSAGES, SamplePassage } from '../data/samplePassages';
import { AnalysisMode } from '../types';
import { NaesinInputSection } from './NaesinInputSection';
import { parseExamText } from '../utils/suneungParser';

interface PassageInputProps {
  mode: AnalysisMode;
  setMode: (mode: AnalysisMode) => void;
  passageText: string;
  setPassageText: (text: string) => void;
  gradeLevel: string;
  setGradeLevel: (grade: string) => void;
  questionPrompt: string;
  setQuestionPrompt: (prompt: string) => void;
  choices: [string, string, string, string, string];
  setChoices: React.Dispatch<React.SetStateAction<[string, string, string, string, string]>>;
  // Naesin specific props
  questionTitle: string;
  setQuestionTitle: (val: string) => void;
  questionType: string;
  setQuestionType: (val: string) => void;
  studentAnswer: string;
  setStudentAnswer: (val: string) => void;
  correctAnswer: string;
  setCorrectAnswer: (val: string) => void;
  onOcrSuccess: (extracted: {
    passage?: string;
    questionPrompt?: string;
    choices?: string[];
    questionType?: string;
    detectedStudentAnswer?: string;
  }) => void;
  onOpenSmartImport: () => void;
  isLoading: boolean;
  onAnalyze: () => void;
  onSelectSample: (sample: SamplePassage) => void;
  onClear: () => void;
  onOpenSaved?: () => void;
  savedCount?: number;
}

const MAX_RECOMMENDED_CHARS = 3000;

export const PassageInput: React.FC<PassageInputProps> = ({
  mode,
  setMode,
  passageText,
  setPassageText,
  gradeLevel,
  setGradeLevel,
  questionPrompt,
  setQuestionPrompt,
  choices,
  setChoices,
  questionTitle,
  setQuestionTitle,
  questionType,
  setQuestionType,
  studentAnswer,
  setStudentAnswer,
  correctAnswer,
  setCorrectAnswer,
  onOcrSuccess,
  onOpenSmartImport,
  isLoading,
  onAnalyze,
  onSelectSample,
  onClear,
  onOpenSaved,
  savedCount = 0,
}) => {
  const wordCount = passageText.trim() ? passageText.trim().split(/\s+/).length : 0;
  const charCount = passageText.length;
  const isOverRecommended = charCount > MAX_RECOMMENDED_CHARS;

  const circledNumbers = ['①', '②', '③', '④', '⑤'];

  const handleChoiceChange = (idx: number, value: string) => {
    setChoices((prev) => {
      const updated = [...prev] as [string, string, string, string, string];
      updated[idx] = value;
      return updated;
    });
  };

  // Quick detect if passageText contains a full raw exam question with prompt or choices
  const isFullExamPasted = useMemo(() => {
    if (!passageText || passageText.length < 35) return false;
    const hasCircled = /[①-⑤]/.test(passageText) || /\([1-5]\)/.test(passageText);
    const hasPromptKeywords = /(?:다음\s*글|가장\s*적절|밑줄\s*친|문맥상|\[(?:중간|기말|모의|수능|서술형)|\b\d{1,2}\s*[.번])/.test(passageText);
    return hasCircled || hasPromptKeywords;
  }, [passageText]);

  const handleQuickSplitPasted = () => {
    const parsed = parseExamText(passageText);
    if (parsed.passage) setPassageText(parsed.passage);
    if (parsed.prompt) setQuestionPrompt(parsed.prompt);
    if (parsed.hasParsedChoices) setChoices(parsed.choices);
    if (parsed.questionTitle) setQuestionTitle(parsed.questionTitle);
    if (parsed.questionType) setQuestionType(parsed.questionType);
    if (parsed.studentAnswer) setStudentAnswer(parsed.studentAnswer);
    if (parsed.correctAnswer) setCorrectAnswer(parsed.correctAnswer);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-6 no-print transition-colors">
      {/* Mode Switch Header (일반 구문독해 ↔ 모고 실전풀이 ↔ 내신 오답노트) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">분석 모드:</span>
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 gap-1 flex-wrap">
            {/* 1. 일반 구문독해 */}
            <button
              id="mode-tab-general"
              type="button"
              onClick={() => setMode('general')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'general'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>일반 구문독해</span>
            </button>

            {/* 2. 모의고사 실전풀이 (수능에서 모고 실전풀이로 변경) */}
            <button
              id="mode-tab-suneung"
              type="button"
              onClick={() => setMode('suneung')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'suneung'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>모고 실전풀이</span>
            </button>

            {/* 3. 내신 오답노트 */}
            <button
              id="mode-tab-naesin"
              type="button"
              onClick={() => setMode('naesin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'naesin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>내신 오답노트</span>
              <span className="px-1 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                NEW
              </span>
            </button>
          </div>
        </div>

        {/* 1-click Presets & Saved Passages CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSaved && (
            <button
              id="open-saved-passages-btn"
              type="button"
              onClick={onOpenSaved}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-all cursor-pointer"
              title="저장된 지문 보관함 열기 (최대 10개)"
            >
              <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>지문 보관함</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  savedCount >= 10
                    ? 'bg-amber-600 text-white'
                    : 'bg-indigo-600 dark:bg-indigo-500 text-white'
                }`}
              >
                {savedCount}/10
              </span>
            </button>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-slate-400 flex items-center gap-1 font-medium">
              <BookMarked className="w-3.5 h-3.5" />
              추천 기출:
            </span>
            {SAMPLE_PASSAGES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-200 dark:border-indigo-800 border border-slate-200/80 dark:border-slate-700 rounded-md transition-all cursor-pointer"
              >
                {sample.title.split(':')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Difficulty Level Selector Row */}
      <div className="flex flex-col gap-2.5 mb-3.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>분석 난이도 / 수준:</span>
            </span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 gap-1">
              {[
                { key: '초급자', label: '초급자', sub: '기초 구문', icon: '🟢', color: 'emerald' },
                { key: '중급자', label: '중급자', sub: '실전 내신', icon: '🟡', color: 'indigo' },
                { key: '상급자', label: '상급자', sub: '수능 1등급', icon: '🔴', color: 'purple' },
              ].map((lvl) => {
                const isSelected =
                  gradeLevel === lvl.key ||
                  (lvl.key === '초급자' && gradeLevel === '고1') ||
                  (lvl.key === '중급자' && gradeLevel === '고2') ||
                  (lvl.key === '상급자' && (gradeLevel === '고3' || gradeLevel.includes('수능') || gradeLevel.includes('심화')));

                return (
                  <button
                    key={lvl.key}
                    type="button"
                    onClick={() => setGradeLevel(lvl.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{lvl.icon}</span>
                    <span>{lvl.label}</span>
                    <span className="text-[10px] font-normal px-1.5 py-0.2 bg-slate-200/70 dark:bg-slate-700/70 rounded text-slate-600 dark:text-slate-300">
                      {lvl.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smart Import Button for Suneung & Naesin */}
          {(mode === 'suneung' || mode === 'naesin') && (
            <button
              type="button"
              onClick={onOpenSmartImport}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs ${
                mode === 'naesin'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
              }`}
            >
              <FileUp className={`w-3.5 h-3.5 ${mode === 'naesin' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
              <span>{mode === 'naesin' ? '내신 시험지 통째로 붙여넣기 (스마트 분리)' : '시험지 통째로 붙여넣기 (스마트 분리)'}</span>
            </button>
          )}
        </div>

        {/* Dynamic Level Description Helper Banner */}
        <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
          {gradeLevel === '초급자' || gradeLevel === '고1' ? (
            <>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">🟢 초급자 모드:</span>
              <span>2~3단어 단위로 잘게 끊어 읽기 · 전치사구/수식어 거품 괄호 <code>( )</code> · <strong>초보 기초 필수 단어 상세 뜻풀이 집중</strong> · 친절한 5형식 기초 어법</span>
            </>
          ) : gradeLevel === '상급자' || gradeLevel === '고3' || gradeLevel.includes('수능') ? (
            <>
              <span className="font-bold text-purple-600 dark:text-purple-400">🔴 상급자 모드:</span>
              <span>거시적 호흡의 속독형 직독직해 · 도치/특수구문 집중 분석 · 지문-선지 논리적 재진술(Paraphrasing) 심화</span>
            </>
          ) : (
            <>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">🟡 중급자 모드:</span>
              <span>자연스러운 의미 덩어리 직독직해 · 고교 내신 서술형 빈출 어법(수일치/관계사/태) · 고교 필수 다의어</span>
            </>
          )}
        </div>
      </div>

      {/* Naesin Wrong Note Exclusive Section (OCR Upload, Student Answer, Correct Answer) */}
      {mode === 'naesin' && (
        <div className="mb-4">
          <NaesinInputSection
            questionTitle={questionTitle}
            setQuestionTitle={setQuestionTitle}
            questionType={questionType}
            setQuestionType={setQuestionType}
            questionPrompt={questionPrompt}
            setQuestionPrompt={setQuestionPrompt}
            studentAnswer={studentAnswer}
            setStudentAnswer={setStudentAnswer}
            correctAnswer={correctAnswer}
            setCorrectAnswer={setCorrectAnswer}
            onOcrSuccess={onOcrSuccess}
            onOpenSmartImport={onOpenSmartImport}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Suneung (모의고사) Specific Inputs: Question Prompt */}
      {mode === 'suneung' && (
        <div className="mb-3.5 p-3.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-xl space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <label
              htmlFor="suneung-prompt-input"
              className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span>모의고사 문제 발문 (Question Prompt):</span>
            </label>
            <span className="text-[11px] text-amber-700 dark:text-amber-400">
              예: 다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?
            </span>
          </div>
          <input
            id="suneung-prompt-input"
            type="text"
            value={questionPrompt}
            onChange={(e) => setQuestionPrompt(e.target.value)}
            placeholder="문제 발문을 입력하세요 (예: 다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?)"
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-amber-200 dark:border-amber-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      )}

      {/* Passage Textarea */}
      <div className="relative">
        {/* Full Exam Detected Quick Split Banner */}
        {isFullExamPasted && (
          <div className="mb-2.5 p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-indigo-950/50 border border-emerald-300/80 dark:border-emerald-700/80 rounded-xl flex items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">시험지 원문(발문·지문·선지)이 감지되었습니다!</span>
                <span className="hidden sm:inline text-emerald-700 dark:text-emerald-400 ml-1">
                  클릭 한 번으로 발문, 본문, 선지, 오답/정답으로 자동 분리합니다.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickSplitPasted}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-lg shadow-xs transition-all cursor-pointer text-xs"
            >
              <span>원클릭 자동 분리</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="passage-textarea"
            className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>영어 본문 지문 (Passage):</span>
          </label>
          {passageText && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
            >
              지문 지우기
            </button>
          )}
        </div>
        <textarea
          id="passage-textarea"
          value={passageText}
          onChange={(e) => setPassageText(e.target.value)}
          placeholder={`분석할 영어 지문을 여기에 붙여넣으세요 (교과서, 모의고사, 부교재, 수능특강, 영문 기사 등)...\n\n예: Popeye, who gained superhuman strength and defended himself by eating spinach, contributed greatly to its endurance in popular culture...`}
          className="w-full min-h-[140px] max-h-[320px] p-4 text-sm sm:text-base text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-serif leading-relaxed transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          rows={5}
        />
      </div>

      {/* Suneung or Naesin 5 Choices (① ~ ⑤) */}
      {(mode === 'suneung' || mode === 'naesin') && (
        <div className="mt-4 p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>5지선다 보기 입력 (선택사항, 객관식인 경우):</span>
            </label>
            <span className="text-[11px] text-slate-400">
              선지를 입력하시면 각 선지별 소거 이유와 정답 근거를 심층 분석합니다.
            </span>
          </div>

          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                  {circledNumbers[idx]}
                </span>
                <input
                  type="text"
                  value={choices[idx]}
                  onChange={(e) => handleChoiceChange(idx, e.target.value)}
                  placeholder={`선지 ${idx + 1}번 내용 (영어/한국어 모두 가능)`}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer controls: counts & Analyze CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 w-full sm:w-auto flex-wrap">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            단어수: <strong className="text-slate-700 dark:text-slate-200">{wordCount}단어</strong>
          </span>
          <span>•</span>
          <span>
            글자수:{' '}
            <strong
              className={
                isOverRecommended
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-700 dark:text-slate-200'
              }
            >
              {charCount}자
            </strong>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-1">
              / 최대 3,000자 권장
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            id="analyze-passage-btn"
            type="button"
            disabled={isLoading || !passageText.trim()}
            onClick={onAnalyze}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-md cursor-pointer ${
              isLoading || !passageText.trim()
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed shadow-none'
                : mode === 'naesin'
                ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none hover:shadow-lg active:scale-98'
                : mode === 'suneung'
                ? 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 shadow-amber-200 dark:shadow-none hover:shadow-lg active:scale-98'
                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-indigo-200 dark:shadow-none hover:shadow-lg active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>
                  {mode === 'naesin'
                    ? '내신 오답 원인 및 함정 분석 중...'
                    : mode === 'suneung'
                    ? '모의고사 실전 논리 및 구문 분석 중...'
                    : '문장 성분 & 직독직해 분석 중...'}
                </span>
              </>
            ) : (
              <>
                {mode === 'naesin' ? (
                  <>
                    <PenTool className="w-4 h-4 text-white" />
                    <span>내신 오답 원인 및 함정 분석하기</span>
                  </>
                ) : mode === 'suneung' ? (
                  <>
                    <Target className="w-4 h-4 text-white" />
                    <span>모의고사 실전 풀이 &amp; 구문 분석하기</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>지문 분석하기</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Capacity & Length Guide Note */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
        <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-slate-700 dark:text-slate-200 font-medium">
            <strong>모드 안내:</strong> 기본 <strong>[일반 구문독해]</strong> 모드는 문장 성분(S·V·O·C) 및 직독직해를 분석하며, <strong>[모고 실전풀이]</strong> 모드는 정답 도출 논리/소거법/패러프레이징을 종합 분석하고, <strong>[내신 오답노트]</strong> 모드는 내가 고른 오답과 실제 정답을 심층 대조하여 출제자의 함정과 학생의 착각 원인을 날카롭게 분석합니다.
          </p>
        </div>
      </div>

      {/* Over-capacity warning badge if user pasted > 3,000 chars */}
      {isOverRecommended && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200/80 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            현재 <strong>{charCount}자</strong>로 권장 분량(3,000자)을 초과했습니다. 분석은 가능하지만, 정확하고 빠른 처리를 위해 문단 단위로 나누어 입력하는 것을 권장합니다.
          </span>
        </div>
      )}
    </div>
  );
};
