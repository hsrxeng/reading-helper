import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  RefreshCw,
  Edit3,
  X,
  Target,
} from 'lucide-react';

interface NaesinInputSectionProps {
  questionTitle: string;
  setQuestionTitle: (val: string) => void;
  questionType: string;
  setQuestionType: (val: string) => void;
  questionPrompt: string;
  setQuestionPrompt: (val: string) => void;
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
  isLoading: boolean;
}

const COMMON_NAESIN_TYPES = [
  '원문 어휘 변형 (반의어/유의어)',
  '어법상 틀린 것 고치기',
  '문맥상 무관한 문장',
  '빈칸추론 변형',
  '문장 삽입 / 순서 배열',
  '서술형 조건영작 / 빈칸 채우기',
  '요약문 빈칸 완성',
];

export const NaesinInputSection: React.FC<NaesinInputSectionProps> = ({
  questionTitle,
  setQuestionTitle,
  questionType,
  setQuestionType,
  questionPrompt,
  setQuestionPrompt,
  studentAnswer,
  setStudentAnswer,
  correctAnswer,
  setCorrectAnswer,
  onOcrSuccess,
  isLoading,
}) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('이미지 파일(JPG, PNG 등)만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('이미지 크기는 10MB 이하만 가능합니다.');
      return;
    }

    setUploadError(null);
    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setPreviewImage(base64Data);

      try {
        const res = await fetch('/api/ocr-extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type,
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || '시험지 인식에 실패했습니다.');
        }

        if (json.data) {
          onOcrSuccess(json.data);
        }
      } catch (err: any) {
        setUploadError(err.message || '사진 속 문제를 인식하는 중 오류가 발생했습니다. 직접 입력하실 수도 있습니다.');
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const circledNumbers = ['①', '②', '③', '④', '⑤'];

  return (
    <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200/60 dark:border-emerald-800/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            오답
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
              <span>내신 기출 오답노트 &amp; 함정 분석기</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                사진 인식 지원
              </span>
            </h3>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              시험지 사진을 찍어 올리거나, 문제와 함께 <strong>[내가 고른 오답]</strong>과 <strong>[실제 정답]</strong>을 입력하면 출제자의 함정과 틀린 이유를 분석합니다.
            </p>
          </div>
        </div>

        {/* OCR Photo Upload Trigger */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage || isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploadingImage ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>시험지 AI 판독 중...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>시험지/문제 사진 올리기 (OCR)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Uploaded Photo Preview & Clear */}
      {previewImage && (
        <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs">
          <img
            src={previewImage}
            alt="시험지 사진 미리보기"
            className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 block truncate">
              시험지 사진이 인식되었습니다
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              추출된 지문과 발문, 선지가 아래 입력란에 자동으로 채워졌습니다.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPreviewImage(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title="사진 제거"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Problem Meta: Type & Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <span>내신 문제 유형:</span>
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              placeholder="예: 원문 어휘 변형, 어법상 틀린 것 고치기"
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-emerald-200 dark:border-emerald-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {COMMON_NAESIN_TYPES.slice(0, 4).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setQuestionType(t)}
                className={`px-1.5 py-0.5 text-[10px] rounded border transition-all cursor-pointer ${
                  questionType === t
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                {t.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <span>문제 번호 또는 출처:</span>
          </label>
          <input
            type="text"
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            placeholder="예: 중간고사 14번 (교과서 3과 변형), 기말 21번"
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-emerald-200 dark:border-emerald-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Question Prompt */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
          <span>문제 발문 / 조건 (Prompt):</span>
          <span className="text-[11px] text-slate-400 font-normal">
            예: 다음 글의 밑줄 친 (A)~(E) 중 어법상 틀린 것의 개수는?
          </span>
        </label>
        <input
          type="text"
          value={questionPrompt}
          onChange={(e) => setQuestionPrompt(e.target.value)}
          placeholder="문제 발문 또는 서술형 조건 (예: 윗글의 요지를 [조건]에 맞추어 8단어로 영작하시오.)"
          className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-emerald-200 dark:border-emerald-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {/* Two Core Columns: [내가 고른 오답] vs [실제 정답] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-900 border border-emerald-200/90 dark:border-emerald-800/80 rounded-xl shadow-2xs">
        {/* Student's Wrong Answer */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>내가 고른 오답 (Student's Choice):</span>
            </span>
            <span className="text-[10px] text-rose-500 font-normal">오답 선택 필수</span>
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="예: 1번 (또는 작성한 오답 문구)"
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-rose-50/40 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 border border-rose-200 dark:border-rose-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
          {/* Quick Choice Buttons */}
          <div className="flex items-center gap-1 pt-0.5">
            <span className="text-[10px] text-slate-400 mr-1">객관식:</span>
            {circledNumbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setStudentAnswer(`${num}번`)}
                className={`w-7 h-6 text-xs font-bold rounded transition-all cursor-pointer ${
                  studentAnswer.includes(num)
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-100 hover:text-rose-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Real Correct Answer */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>실제 정답 / 모범답안 (Correct Answer):</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-normal">정답 필수</span>
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="예: 5번 (또는 실제 모범답안 문장)"
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          {/* Quick Choice Buttons */}
          <div className="flex items-center gap-1 pt-0.5">
            <span className="text-[10px] text-slate-400 mr-1">객관식:</span>
            {circledNumbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCorrectAnswer(`${num}번`)}
                className={`w-7 h-6 text-xs font-bold rounded transition-all cursor-pointer ${
                  correctAnswer.includes(num)
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-100 hover:text-emerald-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
