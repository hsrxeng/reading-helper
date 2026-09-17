import { PassageAnalysisResult, AnalysisMode } from '../types';

function normalizeLevel(level?: string): '초급자' | '중급자' | '상급자' {
  if (!level) return '중급자';
  if (level.includes('초급') || level === '고1') return '초급자';
  if (level.includes('상급') || level.includes('수능') || level.includes('심화') || level === '고3') return '상급자';
  return '중급자';
}

/**
 * Client-side rule-based fallback analyzer
 * Used when running in purely static environments (such as GitHub Pages)
 * where a Node.js Express server is not available.
 */
export function generateClientRuleBasedAnalysis(
  passage: string,
  gradeLevel: string = '중급자',
  mode: AnalysisMode = 'general',
  questionPrompt: string = '',
  choicesInput: string[] = [],
  studentAnswer: string = '',
  correctAnswer: string = '',
  questionType: string = ''
): PassageAnalysisResult {
  const targetLevel = normalizeLevel(gradeLevel);
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

    // Middle-school high-frequency beginner vocabulary bank with friendly explanations
    const middleSchoolVocabBank: Record<string, string> = {
      allow: '허락하다, 가능하게 하다 (동사: allow A to V 형태 자주 쓰임)',
      improve: '향상시키다, 개선되다 (동사)',
      notice: '알아차리다, 주목하다 (동사) / 안내문 (명사)',
      effect: '효과, 영향, 결과 (명사: have an effect on)',
      affect: '영향을 미치다 (동사)',
      result: '결과 (명사) / 발생하다 (동사: result in ~을 낳다)',
      cause: '원인 (명사) / 유발하다, 일으키다 (동사)',
      create: '만들다, 창조하다 (동사)',
      decide: '결정하다, 결심하다 (동사)',
      support: '지지하다, 후원하다, 지탱하다 (동사/명사)',
      common: '흔한, 공통의 (형용사)',
      difficult: '어려운, 힘든 (형용사)',
      different: '다른, 차이가 나는 (형용사)',
      important: '중요한, 중대한 (형용사)',
      require: '필요로 하다, 요구하다 (동사)',
      include: '포함하다 (동사)',
      increase: '증가하다, 늘리다 (동사/명사)',
      decrease: '감소하다, 줄이다 (동사/명사)',
      experience: '경험 (명사) / 겪다, 경험하다 (동사)',
      situation: '상황, 처지 (명사)',
      opportunity: '기회 (명사: chance와 같은 뜻)',
      challenge: '도전, 어려운 과제 (명사)',
      successful: '성공적인 (형용사)',
      protect: '보호하다, 지키다 (동사)',
      produce: '생산하다, 만들어내다 (동사)',
      provide: '제공하다, 주다 (동사: provide A with B)',
      reduce: '줄이다, 낮추다 (동사)',
      suggest: '제안하다, 암시하다 (동사)',
      develop: '발달시키다, 개발하다 (동사)',
      prepare: '준비하다, 대비하다 (동사)',
      remember: '기억하다 (동사)',
      forget: '잊어버리다 (동사)',
      understand: '이해하다, 알아듣다 (동사)',
      information: '정보 (명사)',
      continue: '계속하다, 이어지다 (동사)',
      expect: '기대하다, 예상하다 (동사)',
      discover: '발견하다, 알아내다 (동사)',
      prevent: '예방하다, 막다 (동사: prevent A from -ing)',
      various: '다양한, 여러 가지의 (형용사)',
      benefit: '이익, 혜택 (명사) / 도움이 되다 (동사)',
    };

    let foundVerb = false;
    let foundSubject = false;

    const lowerSent = sent.toLowerCase();

    if (targetLevel === '초급자') {
      grammarPoints.push('[초급 기초] 문장의 5형식 뼈대: 주어(S) + 서술어(V) 핵심 성분 찾기');
      grammarPoints.push('[초급 기초] 수식어 거품 괄호 묶기 ( ): 전치사구(M)를 걷어내어 문장 구조 단순화');
      if (lowerSent.includes('is') || lowerSent.includes('are') || lowerSent.includes('was') || lowerSent.includes('were')) {
        grammarPoints.push('[초급 기초] be동사 수일치: 주어의 단수/복수에 맞춘 동사 형태');
      } else {
        grammarPoints.push('[초급 기초] 일반동사의 시제와 3인칭 단수 -s 규칙');
      }
    } else if (targetLevel === '상급자') {
      grammarPoints.push('[수능 1등급] 거시적 구문 분석: 주절과 종속절의 논리적 상관관계 및 주제문 규정');
      if (lowerSent.includes('which') || lowerSent.includes('who') || lowerSent.includes('that')) {
        grammarPoints.push('[평가원 킬러] 복합 관계사절 수식 구조 및 선행사 판별 오답 함정');
      }
      if (/\b\w+ing\b/i.test(sent) || /\b(is|are|was|were)\s+\w+ed\b/i.test(sent)) {
        grammarPoints.push('[수능 어법 핵심] 능동(현재분사) vs 수동(과거분사) 판별 및 의미상 주체 추론');
      } else {
        grammarPoints.push('[논리 독해] 핵심 키워드의 문맥적 재진술(Paraphrasing) 및 대립항 도출');
      }
    } else {
      if (lowerSent.includes('which') || lowerSent.includes('who') || (lowerSent.includes('that') && !lowerSent.includes('that is'))) {
        grammarPoints.push('관계사절(선행사 수식) 및 접속사 that vs what 구분');
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
      if (grammarPoints.length === 0) {
        grammarPoints.push('주어-동사 수일치 (핵심 주어와 술어동사의 수 일치)');
        grammarPoints.push('문장의 5형식 문형 구조 및 수식어 거품 걷어내기');
      }
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
        tagTop = targetLevel === '초급자' ? '수식어 거품 (전치사구)' : '전치사구';
      } else if (relatives.has(clean)) {
        pos = 'other';
        role = '';
        clauseType = 'relative';
        tagTop = targetLevel === '초급자' ? '연결다리 [관계사]' : '관계사절';
      } else if (modals.has(clean) || beVerbs.has(clean) || (!foundVerb && wIdx > 0 && wIdx <= 3 && /^[a-z]+(s|ed|ing)?$/i.test(clean))) {
        pos = 'verb';
        role = 'V';
        tagTop = targetLevel === '초급자' ? '서술어 [동사]' : '술어동사';
        foundVerb = true;
      } else if (!foundSubject && wIdx === 0) {
        pos = 'noun';
        role = 'S';
        tagTop = targetLevel === '초급자' ? '주어 [명사]' : targetLevel === '상급자' ? '주어 [핵심 화제]' : '주어';
        foundSubject = true;
      } else if (foundVerb && !role) {
        if (wIdx === words.length - 1 && clean.length > 2) {
          pos = 'noun';
          role = 'O';
          tagTop = targetLevel === '초급자' ? '목적어 [동작 대상]' : '목적어';
        } else if (wIdx >= 2 && !foundSubject) {
          pos = 'noun';
          role = 'O';
          tagTop = targetLevel === '초급자' ? '목적어 [동작 대상]' : '목적어';
        }
      }

      const minLen = targetLevel === '초급자' ? 3 : targetLevel === '상급자' ? 6 : 5;
      const maxVocabCount = targetLevel === '초급자' ? 7 : targetLevel === '상급자' ? 3 : 4;
      const cleanLower = clean.toLowerCase();

      if (clean.length >= minLen && vocabulary.length < maxVocabCount) {
        if (!vocabulary.some((v) => v.word.toLowerCase() === cleanLower)) {
          let vocabMeaning = '';
          if (targetLevel === '초급자') {
            if (middleSchoolVocabBank[cleanLower]) {
              vocabMeaning = middleSchoolVocabBank[cleanLower];
            } else {
              vocabMeaning = `${clean} (초보 필수 어휘 및 상세 뜻풀이)`;
            }
          } else if (targetLevel === '상급자') {
            vocabMeaning = `${clean} (수능 고난도 어휘 및 문맥적 함의/패러프레이징)`;
          } else {
            vocabMeaning = middleSchoolVocabBank[cleanLower] || `${clean} (고교 필수 어휘)`;
          }

          vocabulary.push({
            word: clean,
            meaning: vocabMeaning,
          });
        }
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

    const chunkInterval = targetLevel === '초급자' ? 2 : targetLevel === '상급자' ? 5 : 3;
    const directChunk = words.reduce((acc, curr, idx) => {
      return acc + (idx > 0 && idx % chunkInterval === 0 ? ' / ' : ' ') + curr;
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
    title: mode === 'suneung' ? `[${targetLevel}] 수능·모의고사 실전 풀이 및 정밀 구문분석` : `[${targetLevel}] 영어 지문 정밀 구문분석`,
    gradeLevel: targetLevel,
    difficulty: targetLevel,
    mode: mode === 'suneung' ? 'suneung' : 'general',
    summary: targetLevel === '초급자'
      ? '지문의 5형식 기본 문장 성분(S·V·O·C) 및 수식어 거품 괄호 묶기 집중 분석'
      : targetLevel === '상급자'
      ? '지문의 거시적 논리 전개 및 평가원 킬러 구문·재진술(Paraphrasing) 심층 분석'
      : '지문의 문장 성분(S·V·O·C) 및 내신 빈출 어법 구조 정밀 분석',
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
  } else if (mode === 'naesin') {
    const sAns = studentAnswer || '1번';
    const cAns = correctAnswer || '5번';
    const qT = questionType || '원문 어휘 변형 (반의어/유의어)';
    const clueSentence = sentences[0] || { sentenceNumber: 1, originalText: passage.slice(0, 80) };

    result.naesinAnalysis = {
      questionPrompt: questionPrompt || '다음 글을 읽고 물음에 답하시오.',
      questionType: qT,
      studentAnswer: sAns,
      correctAnswer: cAns,
      clueSentenceInPassage: {
        sentenceNumber: clueSentence.sentenceNumber || 1,
        sentenceText: clueSentence.originalText || passage.slice(0, 80),
        explanation: '정답과 오답을 판가름하는 결정적인 문맥적 단서가 들어있는 본문 핵심 문장입니다.',
      },
      wrongReasonAnalysis: {
        psychologicalTrap: `학생이 [${sAns}]을(를) 선택하게 된 주된 심리적 요인은 본문 속 친숙한 단어 매칭에 이끌려 전체 문맥과 술어 관계를 놓쳤기 때문입니다.`,
        schoolExamTrapType: '원문 키워드 함정 및 논리적 맥락 비틀기 (Contextual Reversal)',
        detailedComparison: `학생이 선택한 [${sAns}]은(는) 지문의 일부 단어와 표면적으로 유사하지만 전체 맥락과 상충되며, 실제 정답인 [${cAns}]은(는) 지문의 핵심 문맥 및 논리적 인과관계를 충족하는 올바른 해답입니다.`,
      },
      originalVsModified: {
        originalText: '지문 원문 표현 (Original Text Flow)',
        modifiedText: '시험 문제 변형 선지/어구 (Exam Modification)',
        point: '학교 시험에서는 원문의 단어를 그대로 내지 않고, 유의어로 치환하거나 전체 문장 구조를 전환하여 출제합니다.',
      },
      actionItemForNextExam: '다음 내신 시험에서는 지문에서 눈에 익은 단어가 보인다고 해서 즉시 정답으로 단정하지 말고, 반드시 해당 문장의 전체 술어 동사와 접속사(However, Although 등)의 방향을 끝까지 확인한 뒤 답을 고르는 습관을 훈련해야 합니다.',
      relatedGrammarOrVocab: ['원문 변형 유의어/반의어 대조', '수일치 및 능동/수동태 확인', '접속사 전후의 논리적 순접/역접 확인'],
    };
  }

  return result;
}
