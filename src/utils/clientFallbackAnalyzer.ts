import { PassageAnalysisResult, AnalysisMode } from '../types';

/**
 * Client-side rule-based fallback analyzer
 * Used when running in purely static environments (such as GitHub Pages)
 * where a Node.js Express server is not available.
 */
export function generateClientRuleBasedAnalysis(
  passage: string,
  gradeLevel: string = '고2',
  mode: AnalysisMode = 'general',
  questionPrompt: string = '',
  choicesInput: string[] = []
): PassageAnalysisResult {
  const safePassage = typeof passage === 'string' ? passage : String(passage || '');
  const rawSentences = safePassage
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .split(/(?<=[.?!])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const sentences = (rawSentences.length > 0 ? rawSentences : [safePassage.trim()]).map((sent, sIdx) => {
    const words = sent.split(/\s+/).filter(Boolean);
    const tokens: any[] = [];
    const grammarPoints: string[] = [];
    const vocabulary: { word: string; meaning: string }[] = [];

    const preps = new Set(['in', 'on', 'at', 'by', 'for', 'with', 'about', 'from', 'to', 'into', 'through', 'between', 'among', 'under', 'over']);
    const modals = new Set(['can', 'could', 'may', 'might', 'will', 'would', 'shall', 'should', 'must']);
    const beVerbs = new Set(['is', 'are', 'was', 'were', 'be', 'been', 'being', "'s", "'re"]);
    const relatives = new Set(['who', 'which', 'that', 'whom', 'whose', 'where', 'when', 'why', 'how']);

    let foundVerb = false;
    let foundSubject = false;

    const lowerSent = sent.toLowerCase();
    if (lowerSent.includes('which') || lowerSent.includes('who') || (lowerSent.includes('that') && !lowerSent.includes('that is'))) {
      grammarPoints.push('관계사절(선행사 수식) 및 접속사 구분');
    }
    if (/\b(is|are|was|were|been|being)\s+\w+ed\b/i.test(sent)) {
      grammarPoints.push('수동태 문형 (be + p.p. / 능동 vs 수동 관계)');
    }
    if (/\bto\s+[a-z]{3,}\b/i.test(sent)) {
      grammarPoints.push('to부정사의 용법 (목적·명사수식 형용사적 용법)');
    }
    if (/\b\w+ing\b/i.test(sent)) {
      grammarPoints.push('분사구문(-ing) 또는 동명사구의 역할 판별');
    }
    if (/\b(and|but|or)\b/i.test(sent)) {
      grammarPoints.push('등위접속사 병렬 구조 (어구 형태 및 시제 일치)');
    }
    if (/\b(more|less|-er)\b.*than/i.test(sent) || /\bas\s+\w+\s+as\b/i.test(sent)) {
      grammarPoints.push('비교급 구문 및 비교 대상의 대등성');
    }
    if (/\b(if|unless)\b/i.test(sent)) {
      grammarPoints.push('조건 부사절 (시간·조건 부사절에서는 현재시제가 미래를 대신함)');
    }
    if (grammarPoints.length === 0) {
      grammarPoints.push('주어-동사 수일치 (핵심 주어와 술어동사의 수 일치)');
      grammarPoints.push('문장의 5형식 문형 구조 및 수식어 거품 걷어내기');
    }

    words.forEach((w, wIdx) => {
      const clean = w.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
      let role = '';
      let pos: any = 'other';
      let tagTop = '';
      let clauseType: any = 'none';

      if (preps.has(clean)) {
        pos = 'other';
        role = 'M';
        clauseType = 'prepositional';
        tagTop = '전치사';
      } else if (relatives.has(clean)) {
        pos = 'other';
        role = '';
        clauseType = 'relative';
        tagTop = '관계사';
      } else if (modals.has(clean) || beVerbs.has(clean) || (!foundVerb && wIdx > 0 && wIdx <= 3 && /^[a-z]+(s|ed|ing)?$/i.test(clean))) {
        pos = 'verb';
        role = 'V';
        tagTop = '술어동사';
        foundVerb = true;
      } else if (!foundSubject && wIdx === 0) {
        pos = 'noun';
        role = 'S';
        tagTop = '주어';
        foundSubject = true;
      } else if (foundVerb && !role) {
        if (wIdx === words.length - 1 && clean.length > 2) {
          pos = 'noun';
          role = 'O';
          tagTop = '목적어';
        } else if (wIdx >= 2 && !foundSubject) {
          pos = 'noun';
          role = 'O';
          tagTop = '목적어';
        }
      }

      if (clean.length > 5 && vocabulary.length < 4) {
        vocabulary.push({
          word: clean,
          meaning: `${clean} (본문 주요 어휘)`,
        });
      }

      tokens.push({
        text: w,
        role: role as any,
        pos,
        tagTop,
        meaning: '',
        clauseType,
      });
    });

    const directChunk = words.reduce((acc, curr, idx) => {
      return acc + (idx > 0 && idx % 3 === 0 ? ' / ' : ' ') + curr;
    }, '').trim();

    return {
      sentenceNumber: sIdx + 1,
      originalText: sent,
      sentencePattern: foundVerb ? '3형식' : '1형식',
      tokens,
      directTranslation: `${directChunk}`,
      polishedTranslation: `${sent}`,
      grammarPoints,
      vocabulary: vocabulary.length > 0 ? vocabulary : [{ word: 'key vocabulary', meaning: '주요 어휘' }],
    };
  });

  const result: PassageAnalysisResult = {
    title: mode === 'suneung' ? `${gradeLevel} 수능·모의고사 실전 풀이 및 정밀 구문분석` : `${gradeLevel} 영어 지문 정밀 구문분석`,
    gradeLevel,
    mode: mode === 'suneung' ? 'suneung' : 'general',
    summary: '지문의 문장 성분(S·V·O·C) 및 어법 구조 정밀 분석 (정적 환경 규칙 기반 모드)',
    sentences,
  };

  if (mode === 'suneung') {
    const defaultPrompt = (questionPrompt && questionPrompt.trim()) || '다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?';
    let qType = '수능 실전 독해 유형';
    if (defaultPrompt.includes('빈칸')) qType = '빈칸추론 (Blank Inference)';
    else if (defaultPrompt.includes('제목')) qType = '글의 제목 (Title)';
    else if (defaultPrompt.includes('요지')) qType = '글의 요지 (Main Idea)';
    else if (defaultPrompt.includes('주제')) qType = '글의 주제 (Topic)';
    else if (defaultPrompt.includes('순서')) qType = '글의 순서 (Sequence)';
    else if (defaultPrompt.includes('흐름')) qType = '문맥상 무관한 문장';
    else if (defaultPrompt.includes('삽입') || defaultPrompt.includes('들어가기')) qType = '문장 삽입 (Sentence Insertion)';
    else if (defaultPrompt.includes('어법')) qType = '어법상 틀린 것 (Grammar)';

    const passageLower = passage.toLowerCase();
    let bestChoiceNum = 1;
    let maxMatchScore = -1;

    [1, 2, 3, 4, 5].forEach((num) => {
      const text = (choicesInput[num - 1] || '').trim().toLowerCase();
      if (!text) return;
      const tokens = text.split(/\W+/).filter((w: string) => w.length > 2);
      let score = 0;
      tokens.forEach((tok: string) => {
        if (passageLower.includes(tok)) score += 3;
      });
      if (score > maxMatchScore) {
        maxMatchScore = score;
        bestChoiceNum = num;
      }
    });

    const correctChoiceNumber = bestChoiceNum;
    const clueSentenceNumbers = [1, Math.min(2, sentences.length)];

    const choices = [1, 2, 3, 4, 5].map((num) => {
      const userText = choicesInput[num - 1]?.trim();
      const isCorrect = num === correctChoiceNumber;
      return {
        number: num,
        text: userText || `선지 ${num}번 내용`,
        isCorrect,
        analysis: isCorrect
          ? '정답: 본문의 핵심 논리 및 문맥적 단서와 가장 부합하는 정답 선지입니다.'
          : '오답 소거: 본문 내용과 상반되거나 핵심 논점에서 벗어난 함정 선지입니다.',
      };
    });

    result.suneungAnalysis = {
      questionType: qType,
      questionPrompt: defaultPrompt,
      correctChoiceNumber,
      clueSentenceNumbers,
      coreLogicSummary: maxMatchScore > 0
        ? `지문의 핵심 단서 및 연관 어휘 분석을 바탕으로 ${correctChoiceNumber}번 선지가 가장 타당합니다.`
        : '지문의 중심 소재와 논리적 인과관계를 바탕으로 분석한 결과입니다. (Node.js 백엔드 구동 환경에서는 Gemini 3.1 실시간 AI 분석이 작동합니다.)',
      passageFlow: {
        topicIntro: '글의 서두에서 중심 소재 및 화제를 제시하며 배경을 형성함',
        development: '구체적인 근거와 설명을 통해 중심 논지를 확장 전개함',
        turningPoint: '논리적 전환 또는 심화 진술을 통해 핵심 논점을 부각함',
        conclusion: '글의 전개 내용을 종합하여 최종 결론 및 시사점을 도출함',
      },
      choices,
      paraphrasePairs: [
        {
          passageExpr: sentences[0]?.tokens?.slice(0, 3)?.map((t) => t.text)?.join(' ') || 'core concept in passage',
          choiceExpr: choices[correctChoiceNumber - 1]?.text?.slice(0, 30) || 'paraphrased expression',
        },
      ],
    };
  }

  return result;
}
