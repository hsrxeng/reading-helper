import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { PassageInput } from './components/PassageInput';
import { DisplaySettings } from './components/DisplaySettings';
import { SentenceCard } from './components/SentenceCard';
import { LegendModal } from './components/LegendModal';
import { PrintModal } from './components/PrintModal';
import { HistoryModal } from './components/HistoryModal';
import { SmartExamImportModal } from './components/SmartExamImportModal';
import { SuneungAnalysisView } from './components/SuneungAnalysisView';
import { StyleComparisonPreview } from './components/StyleComparisonPreview';
import { SAMPLE_PASSAGES, SamplePassage } from './data/samplePassages';
import { generateClientRuleBasedAnalysis } from './utils/clientFallbackAnalyzer';
import {
  PassageAnalysisResult,
  DisplaySettingsState,
  HistoryItem,
  AnalysisMode,
} from './types';
import {
  Sparkles,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Check,
  RefreshCw,
  Target,
} from 'lucide-react';

const STORAGE_KEY_SETTINGS = 'syntax_analyzer_settings';
const STORAGE_KEY_SAVED_PASSAGES = 'saved_english_passages_v1';
const MAX_SAVED_PASSAGES = 10;

export default function App() {
  // Default to the first sample passage so the user sees immediate results
  const defaultSample = SAMPLE_PASSAGES[0];
  const [mode, setMode] = useState<AnalysisMode>('general');
  const [passageText, setPassageText] = useState(defaultSample.passage);
  const [gradeLevel, setGradeLevel] = useState('중급자');
  const [questionPrompt, setQuestionPrompt] = useState(
    defaultSample.suneungData?.questionPrompt || ''
  );
  const [choices, setChoices] = useState<[string, string, string, string, string]>(
    (defaultSample.suneungData?.choices as [string, string, string, string, string]) || [
      '',
      '',
      '',
      '',
      '',
    ]
  );
  const [analysisResult, setAnalysisResult] = useState<PassageAnalysisResult | null>(
    defaultSample.presetAnalysis
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quota & Auto-retry state
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const retryTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const cancelAutoRetry = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setRetryCountdown(null);
  };

  useEffect(() => {
    return () => {
      cancelAutoRetry();
    };
  }, []);

  // Modals state
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(true);

  // Display Settings
  const [displaySettings, setDisplaySettings] = useState<DisplaySettingsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          showRoles: parsed.showRoles ?? true,
          showMeanings: parsed.showMeanings ?? true,
          showDirectTranslation: parsed.showDirectTranslation ?? true,
          showPolishedTranslation: parsed.showPolishedTranslation ?? true,
          showGrammarPoints: parsed.showGrammarPoints ?? true,
          showVocabulary: parsed.showVocabulary ?? true,
          showPosColors: parsed.showPosColors ?? true,
          posColorMode: parsed.posColorMode || 'underline',
          fontSize: parsed.fontSize || 'base',
          themeColor: parsed.themeColor || 'indigo',
        };
      }
    } catch (e) {
      // ignore
    }
    return {
      showRoles: true,
      showMeanings: true,
      showDirectTranslation: true,
      showPolishedTranslation: true,
      showGrammarPoints: true,
      showVocabulary: true,
      showPosColors: true,
      posColorMode: 'underline',
      fontSize: 'base',
      themeColor: 'indigo',
    };
  });

  // Saved passages state (limited strictly to MAX_SAVED_PASSAGES = 10)
  const [savedPassages, setSavedPassages] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_PASSAGES);
      if (saved) {
        const parsed: HistoryItem[] = JSON.parse(saved);
        return parsed.slice(0, MAX_SAVED_PASSAGES);
      }
      const oldSaved = localStorage.getItem('syntax_analyzer_history');
      if (oldSaved) {
        const parsed: HistoryItem[] = JSON.parse(oldSaved);
        return parsed.slice(0, MAX_SAVED_PASSAGES);
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Save settings changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(displaySettings));
    } catch (e) {
      // ignore
    }
  }, [displaySettings]);

  // Save passages changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_SAVED_PASSAGES,
        JSON.stringify(savedPassages.slice(0, MAX_SAVED_PASSAGES))
      );
    } catch (e) {
      // ignore
    }
  }, [savedPassages]);

  // Check if current active passage is already saved in storage
  const isCurrentSaved = useMemo(() => {
    if (!analysisResult) return false;
    const currentFirstSent = analysisResult.sentences?.[0]?.originalText?.trim();
    return savedPassages.some((item) => {
      if (
        passageText &&
        item.originalPassage &&
        item.originalPassage.trim() === passageText.trim()
      ) {
        return true;
      }
      if (
        currentFirstSent &&
        item.data?.sentences?.[0]?.originalText?.trim() === currentFirstSent
      ) {
        return true;
      }
      return false;
    });
  }, [analysisResult, savedPassages, passageText]);

  // Explicitly save current passage to storage
  const handleSaveCurrentPassage = () => {
    if (!analysisResult) return;

    if (isCurrentSaved) {
      showToast('이미 지문 보관함에 저장되어 있는 지문입니다.');
      return;
    }

    const passageStr =
      passageText.trim() ||
      (analysisResult.sentences || []).map((s) => s.originalText).join(' ');
    const title =
      analysisResult.title ||
      (analysisResult.summary
        ? analysisResult.summary.slice(0, 35) + '...'
        : `${gradeLevel} 영어 지문`);

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      previewText: passageStr.slice(0, 140) + '...',
      originalPassage: passageStr,
      gradeLevel,
      customTitle: title,
      data: analysisResult,
    };

    setSavedPassages((prev) => {
      const filtered = prev.filter(
        (item) =>
          item.originalPassage?.trim() !== passageStr.trim() &&
          item.data?.sentences?.[0]?.originalText?.trim() !==
            analysisResult.sentences?.[0]?.originalText?.trim()
      );
      const updated = [newItem, ...filtered];
      if (updated.length > MAX_SAVED_PASSAGES) {
        showToast(
          `보관함 최대 개수(${MAX_SAVED_PASSAGES}개)에 도달하여 가장 오래된 지문이 교체되었습니다.`
        );
        return updated.slice(0, MAX_SAVED_PASSAGES);
      } else {
        showToast(`지문 보관함에 저장되었습니다 (${updated.length}/${MAX_SAVED_PASSAGES}개)`);
        return updated;
      }
    });
  };

  // Switch between 'general' and 'suneung' mode
  const handleToggleMode = (newMode: AnalysisMode) => {
    setMode(newMode);
    if (newMode === 'suneung') {
      const matchingSample = SAMPLE_PASSAGES.find(
        (s) => s.passage.trim() === passageText.trim()
      );
      if (matchingSample?.suneungData) {
        setQuestionPrompt(matchingSample.suneungData.questionPrompt);
        setChoices(
          matchingSample.suneungData.choices as [string, string, string, string, string]
        );
        if (!analysisResult?.suneungAnalysis && matchingSample.suneungData.suneungAnalysis) {
          setAnalysisResult((prev) =>
            prev
              ? {
                  ...prev,
                  mode: 'suneung',
                  suneungAnalysis: matchingSample.suneungData!.suneungAnalysis,
                }
              : prev
          );
        }
      } else if (!questionPrompt.trim()) {
        setQuestionPrompt('다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?');
      }
      showToast('수능·모의고사 실전 풀이 모드가 활성화되었습니다.');
    } else {
      showToast('일반 구문독해 모드로 전환되었습니다.');
    }
  };

  // Handle Analysis trigger with automatic quota retry
  const handleAnalyze = async (isAutoRetry = false, retryAttempt = 0) => {
    if (!passageText.trim()) return;

    cancelAutoRetry();
    setIsLoading(true);
    setErrorMessage(null);
    if (!isAutoRetry) {
      setQuotaNotice(null);
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage: passageText,
          gradeLevel,
          mode,
          questionPrompt: mode === 'suneung' ? questionPrompt : undefined,
          choices: mode === 'suneung' ? choices : undefined,
        }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch (parseErr) {
        // If the server returned an HTML error page (e.g. 404 on static GitHub Pages)
        json = { success: false, error: 'Server endpoint returned non-JSON response (404/static environment)' };
      }

      if (!res.ok || !json.success) {
        // If running in a static environment where /api/analyze is 404 (e.g., GitHub Pages)
        if (res.status === 404 || !res.ok) {
          const matchingSample = SAMPLE_PASSAGES.find(
            (s) => s.passage.trim() === passageText.trim()
          );

          if (matchingSample) {
            if (mode === 'suneung' && matchingSample.suneungData?.suneungAnalysis) {
              setAnalysisResult({
                ...matchingSample.presetAnalysis,
                mode: 'suneung',
                suneungAnalysis: matchingSample.suneungData.suneungAnalysis,
              });
            } else {
              setAnalysisResult(matchingSample.presetAnalysis);
            }
          } else {
            const fallbackResult = generateClientRuleBasedAnalysis(
              passageText,
              gradeLevel,
              mode,
              questionPrompt,
              choices
            );
            setAnalysisResult(fallbackResult);
          }

          setQuotaNotice(
            'ℹ️ 정적 호스팅(GitHub Pages) 안내: Node.js 백엔드 서버가 구동되지 않는 정적 웹 환경에서는 브라우저 내장 규칙 기반 엔진으로 즉시 분석됩니다. Gemini 3.1 AI 실시간 분석을 사용하려면 로컬(npm run dev) 또는 클라우드 서버에서 실행해 주세요.'
          );
          return;
        }

        const isQuota =
          res.status === 429 ||
          json.error?.includes('429') ||
          json.error?.includes('할당량') ||
          json.error?.includes('RESOURCE_EXHAUSTED') ||
          json.error?.includes('quota');

        if (isQuota && retryAttempt < 2) {
          const nextAttempt = retryAttempt + 1;
          const waitSeconds = 4;
          setRetryCountdown(waitSeconds);
          setQuotaNotice(
            `Gemini API 사용량 한도(429 분당 요청 제한) 초과 감지: ${waitSeconds}초 후 자동으로 재시도합니다... (재시도 ${nextAttempt}/2)`
          );

          let count = waitSeconds;
          countdownIntervalRef.current = setInterval(() => {
            count -= 1;
            if (count > 0) {
              setRetryCountdown(count);
              setQuotaNotice(
                `Gemini API 사용량 한도(429 분당 요청 제한) 초과 감지: ${count}초 후 자동으로 재시도합니다... (재시도 ${nextAttempt}/2)`
              );
            } else {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
            }
          }, 1000);

          retryTimerRef.current = setTimeout(() => {
            handleAnalyze(true, nextAttempt);
          }, waitSeconds * 1000);

          return;
        }

        const matchingSample = SAMPLE_PASSAGES.find(
          (s) => s.passage.trim() === passageText.trim()
        );

        if (matchingSample) {
          if (mode === 'suneung' && matchingSample.suneungData?.suneungAnalysis) {
            setAnalysisResult({
              ...matchingSample.presetAnalysis,
              mode: 'suneung',
              suneungAnalysis: matchingSample.suneungData.suneungAnalysis,
            });
          } else {
            setAnalysisResult(matchingSample.presetAnalysis);
          }
          return;
        }

        throw new Error(json.error || '지문 구문 분석 요청이 실패했습니다.');
      }

      setAnalysisResult(json.data);
      if (json.quotaExceeded || json.isFallback) {
        setQuotaNotice(
          json.notice ||
            'Gemini API 할당량(429) 한도 초과로 규칙 기반 구문분석 엔진으로 즉시 생성되었습니다. 잠시 후 [AI로 다시 분석]을 눌러 실시간 재시도할 수 있습니다.'
        );
      } else {
        setQuotaNotice(null);
      }
    } catch (err: any) {
      console.error(err);
      const isQuota =
        err.message?.includes('429') ||
        err.message?.includes('할당량') ||
        err.message?.includes('RESOURCE_EXHAUSTED');

      if (isQuota && retryAttempt < 2) {
        const nextAttempt = retryAttempt + 1;
        const waitSeconds = 4;
        setRetryCountdown(waitSeconds);
        setQuotaNotice(
          `Gemini API 사용량 한도(429) 감지: ${waitSeconds}초 후 자동으로 재시도합니다... (재시도 ${nextAttempt}/2)`
        );

        let count = waitSeconds;
        countdownIntervalRef.current = setInterval(() => {
          count -= 1;
          if (count > 0) {
            setRetryCountdown(count);
            setQuotaNotice(
              `Gemini API 사용량 한도(429) 감지: ${count}초 후 자동으로 재시도합니다... (재시도 ${nextAttempt}/2)`
            );
          } else {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
          }
        }, 1000);

        retryTimerRef.current = setTimeout(() => {
          handleAnalyze(true, nextAttempt);
        }, waitSeconds * 1000);

        return;
      }

      const matchingSample = SAMPLE_PASSAGES.find((s) =>
        passageText.includes(s.passage.slice(0, 30))
      );
      if (matchingSample) {
        if (mode === 'suneung' && matchingSample.suneungData?.suneungAnalysis) {
          setAnalysisResult({
            ...matchingSample.presetAnalysis,
            mode: 'suneung',
            suneungAnalysis: matchingSample.suneungData.suneungAnalysis,
          });
        } else {
          setAnalysisResult(matchingSample.presetAnalysis);
        }
        setErrorMessage(
          'API 연결 중 지연이 발생하여 내장된 정밀 구문분석 데이터로 표시합니다.'
        );
      } else {
        try {
          const clientResult = generateClientRuleBasedAnalysis(
            passageText,
            gradeLevel,
            mode,
            questionPrompt,
            choices
          );
          setAnalysisResult(clientResult);
          setQuotaNotice(
            '네트워크 연결 또는 서버 응답 지연으로 인해 브라우저 내장 규칙 기반 분석으로 표시되었습니다.'
          );
        } catch {
          setErrorMessage(err.message || '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: SamplePassage) => {
    setPassageText(sample.passage);
    // Map sample grade to DifficultyLevel
    const mappedLevel = sample.grade === '고1' ? '초급자' : sample.grade === '고3' ? '상급자' : '중급자';
    setGradeLevel(mappedLevel);
    if (sample.suneungData) {
      setQuestionPrompt(sample.suneungData.questionPrompt);
      setChoices(
        sample.suneungData.choices as [string, string, string, string, string]
      );
      if (mode === 'suneung' && sample.suneungData.suneungAnalysis) {
        setAnalysisResult({
          ...sample.presetAnalysis,
          mode: 'suneung',
          suneungAnalysis: sample.suneungData.suneungAnalysis,
        });
        setErrorMessage(null);
        return;
      }
    }
    setAnalysisResult(sample.presetAnalysis);
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPassageText('');
    setQuestionPrompt('');
    setChoices(['', '', '', '', '']);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleApplySmartImport = (parsed: {
    prompt: string;
    passage: string;
    choices: [string, string, string, string, string];
  }) => {
    if (parsed.prompt) setQuestionPrompt(parsed.prompt);
    if (parsed.passage) setPassageText(parsed.passage);
    if (parsed.choices) setChoices(parsed.choices);
    setMode('suneung');
    setIsSmartImportOpen(false);
    showToast('시험지 문제가 발문, 지문, 5개 선지로 자동 분리되었습니다.');
  };

  const handleScrollToSentence = (sentenceNumber: number) => {
    const el = document.getElementById(`sentence-card-${sentenceNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-amber-400');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-amber-400');
      }, 2200);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setPassageText(item.originalPassage || item.previewText);
    setGradeLevel(item.gradeLevel);
    setAnalysisResult(item.data);
    if (item.data?.suneungAnalysis) {
      setMode('suneung');
      setQuestionPrompt(item.data.suneungAnalysis.questionPrompt);
      const reconstructedChoices = item.data.suneungAnalysis.choices.map(
        (c) => c.text
      ) as [string, string, string, string, string];
      if (reconstructedChoices.length === 5) {
        setChoices(reconstructedChoices);
      }
    }
    setErrorMessage(null);
    setIsHistoryOpen(false);
    showToast(`'${item.customTitle || '보관 지문'}'을(를) 불러왔습니다.`);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setSavedPassages((prev) => prev.filter((item) => item.id !== id));
    showToast('지문이 보관함에서 삭제되었습니다.');
  };

  const handleClearAllHistory = () => {
    setSavedPassages([]);
    showToast('지문 보관함이 모두 비워졌습니다.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200 no-print border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentAnalysis={analysisResult}
        onOpenLegend={() => setIsLegendOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
        historyCount={savedPassages.length}
        onSaveCurrent={handleSaveCurrentPassage}
        isCurrentSaved={isCurrentSaved}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Intro banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md no-print">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-md">
                  문장 구조 &amp; 직독직해
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-md flex items-center gap-1 ${
                    mode === 'suneung'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-700/60 text-slate-300'
                  }`}
                >
                  <Target className="w-3 h-3" />
                  <span>
                    {mode === 'suneung' ? '수능 실전 풀이 분석 ON' : '일반 구문독해'}
                  </span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                영어 지문 분석기
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
                {mode === 'suneung'
                  ? '수능 및 모의고사 문제의 발문과 5지선다를 분석하여 정답 도출 핵심 논리, 논리 전개도, 선지별 소거법 분석, 단서 문장 및 패러프레이징 비교를 제공합니다.'
                  : '영어 지문을 입력하면 문장 성분(S, V, O, C, M)과 절 구조를 직관적으로 분석하고, 끊어 읽기 직독직해, 자연스러운 완역 및 핵심 문법을 제공합니다.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsLegendOpen(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-indigo-300" />
                <span>기호 및 표기법</span>
              </button>
            </div>
          </div>
        </div>

        {/* Passage Input Section */}
        <PassageInput
          mode={mode}
          setMode={handleToggleMode}
          passageText={passageText}
          setPassageText={setPassageText}
          gradeLevel={gradeLevel}
          setGradeLevel={setGradeLevel}
          questionPrompt={questionPrompt}
          setQuestionPrompt={setQuestionPrompt}
          choices={choices}
          setChoices={setChoices}
          onOpenSmartImport={() => setIsSmartImportOpen(true)}
          isLoading={isLoading}
          onAnalyze={handleAnalyze}
          onSelectSample={handleSelectSample}
          onClear={handleClear}
          onOpenSaved={() => setIsHistoryOpen(true)}
          savedCount={savedPassages.length}
        />

        {/* Quota / Rate limit notice or countdown */}
        {quotaNotice && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm no-print transition-all shadow-xs">
            <div className="flex items-start gap-3">
              <RefreshCw
                className={`w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 ${
                  retryCountdown !== null ? 'animate-spin' : ''
                }`}
              />
              <div>
                <p className="font-semibold">{quotaNotice}</p>
                {retryCountdown !== null ? (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    API 호출량이 일시적으로 몰려 안전 대기 후 자동으로 재연결을 시도합니다.
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    분당 요청 한도(429)가 안정화된 후 버튼을 누르면 AI 정밀 분석을 다시 수행합니다.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {retryCountdown !== null ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleAnalyze(false, 0)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    지금 즉시 재시도
                  </button>
                  <button
                    type="button"
                    onClick={cancelAutoRetry}
                    className="px-2.5 py-1.5 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAnalyze(false, 0)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI로 다시 분석</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs sm:text-sm no-print">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMessage}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                상단의 추천 기출 버튼을 클릭하면 분석 결과를 즉시 확인하실 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAnalyze(false, 0)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Analysis Results View */}
        {analysisResult && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Suneung Mode Exclusive Dashboard View */}
            {mode === 'suneung' && analysisResult.suneungAnalysis && (
              <SuneungAnalysisView
                analysis={analysisResult.suneungAnalysis}
                onScrollToSentence={handleScrollToSentence}
              />
            )}

            {/* Control & Summary Bar */}
            <div className="flex flex-col space-y-3">
              {/* Display settings toggles */}
              <DisplaySettings
                settings={displaySettings}
                onChange={setDisplaySettings}
                onToggleComparison={() => setIsComparisonOpen(!isComparisonOpen)}
                isComparisonOpen={isComparisonOpen}
              />

              {/* Style Comparison Preview Banner (밑줄 모드 vs 파스텔 모드 예시) */}
              {isComparisonOpen && (
                <StyleComparisonPreview
                  currentMode={displaySettings.posColorMode}
                  onSelectMode={(selectedMode) =>
                    setDisplaySettings({
                      ...displaySettings,
                      showPosColors: true,
                      posColorMode: selectedMode,
                    })
                  }
                  onClose={() => setIsComparisonOpen(false)}
                />
              )}

              {/* Passage Summary Card */}
              {analysisResult.summary && (
                <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl p-4 text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-indigo-950 dark:text-indigo-200">
                        지문 핵심 요지 &amp; 주제 (Theme &amp; Topic)
                      </span>
                      {(analysisResult.difficulty || analysisResult.gradeLevel) && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold tracking-tight inline-flex items-center gap-1 ${
                            String(analysisResult.difficulty || analysisResult.gradeLevel).includes('초급')
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800'
                              : String(analysisResult.difficulty || analysisResult.gradeLevel).includes('상급')
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300/80 dark:border-purple-800'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300/80 dark:border-indigo-800'
                          }`}
                        >
                          {analysisResult.difficulty || analysisResult.gradeLevel} 맞춤 분석
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {analysisResult.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sentences List */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    총{' '}
                    <strong className="text-slate-900 dark:text-slate-100">
                      {analysisResult.sentences.length}개
                    </strong>{' '}
                    문장 분석 완료
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveCurrentPassage}
                    disabled={isCurrentSaved}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                      isCurrentSaved
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 cursor-default'
                        : 'bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-xs'
                    }`}
                    title={
                      isCurrentSaved
                        ? '보관함에 저장되어 있음'
                        : '현재 분석된 지문을 보관함에 저장 (최대 10개)'
                    }
                  >
                    {isCurrentSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>보관함 저장됨</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          지문 보관함에 저장 ({savedPassages.length}/{MAX_SAVED_PASSAGES})
                        </span>
                      </>
                    )}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  문장 카드의 듣기 버튼으로 원어민 TTS 음성을 들을 수 있습니다.
                </span>
              </div>

              {analysisResult.sentences.map((sentence, idx) => {
                const isClue =
                  mode === 'suneung' &&
                  Boolean(
                    analysisResult.suneungAnalysis?.clueSentenceNumbers?.includes(
                      sentence.sentenceNumber || idx + 1
                    )
                  );
                return (
                  <SentenceCard
                    key={sentence.sentenceNumber || idx}
                    sentence={sentence}
                    index={idx}
                    settings={displaySettings}
                    isClueSentence={isClue}
                    gradeLevel={analysisResult.difficulty || analysisResult.gradeLevel || gradeLevel}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state if no result yet */}
        {!analysisResult && !isLoading && (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              분석할 영어 지문을 입력해 주세요
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              교과서, 부교재, 모의고사, 수능특강 등 분석하고 싶은 지문을 붙여넣거나 상단의 예시를
              선택하세요.
            </p>
            <button
              onClick={() => handleSelectSample(SAMPLE_PASSAGES[0])}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
              예시 지문 불러오기
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-7xl mx-auto space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            영어 지문 분석기 (English Sentence &amp; Grammar Analyzer)
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-[11px]">
            영어 문장 성분(S, V, O, C, M) 분석, 직독직해, 수능·모의고사 실전 풀이 분석 및 자연스러운 완역 학습 도구
          </p>
        </div>
      </footer>

      {/* Modals */}
      <LegendModal isOpen={isLegendOpen} onClose={() => setIsLegendOpen(false)} />
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        analysis={analysisResult}
        settings={displaySettings}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={savedPassages}
        onSelect={handleSelectHistoryItem}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
        canSaveCurrent={!!analysisResult}
        onSaveCurrent={handleSaveCurrentPassage}
        isCurrentSaved={isCurrentSaved}
      />
      <SmartExamImportModal
        isOpen={isSmartImportOpen}
        onClose={() => setIsSmartImportOpen(false)}
        onApply={handleApplySmartImport}
      />
    </div>
  );
}
