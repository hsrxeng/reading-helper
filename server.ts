import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy GoogleGenAI initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to detect quota and rate limit errors (429 / RESOURCE_EXHAUSTED)
function isQuotaOrRateLimitError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.statusCode || err.code || err?.error?.code;
  if (status === 429 || status === 'RESOURCE_EXHAUSTED') return true;
  const msg = (err.message || err.toString() || '').toLowerCase();
  return (
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('rate_limit') ||
    msg.includes('429') ||
    msg.includes('too many requests')
  );
}

// Helper to detect server temporary overload (503 / 504 / UNAVAILABLE)
function isServerOverloadError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.statusCode || err.code || err?.error?.code;
  if (status === 503 || status === 504 || status === 'UNAVAILABLE') return true;
  const msg = (err.message || err.toString() || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('timed out')
  );
}

/**
 * Robustly extracts and parses JSON from AI model responses,
 * handling markdown code fences, trailing comments, extra whitespace,
 * or unexpected characters after closing braces.
 */
function extractAndParseJSON(rawText: string): any {
  if (!rawText || !rawText.trim()) {
    throw new Error('Empty response from AI model');
  }

  const trimmed = rawText.trim();

  // 1. Attempt direct parse
  try {
    return JSON.parse(trimmed);
  } catch (_) {}

  // 2. Extract content from markdown code fences: ```json ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(trimmed)) !== null) {
    const candidate = match[1].trim();
    try {
      return JSON.parse(candidate);
    } catch (_) {}
  }

  // 3. Find outermost matching { ... } or [ ... ] with string/escape tracking
  const firstBrace = trimmed.indexOf('{');
  const firstBracket = trimmed.indexOf('[');

  let startChar: '{' | '[' | null = null;
  let startIndex = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startChar = '{';
    startIndex = firstBrace;
  } else if (firstBracket !== -1) {
    startChar = '[';
    startIndex = firstBracket;
  }

  if (startIndex !== -1 && startChar) {
    const endChar = startChar === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escape = false;
    let endIndex = -1;

    for (let i = startIndex; i < trimmed.length; i++) {
      const char = trimmed[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === startChar) {
          depth++;
        } else if (char === endChar) {
          depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }
      }
    }

    if (endIndex !== -1) {
      const candidate = trimmed.substring(startIndex, endIndex + 1);
      try {
        return JSON.parse(candidate);
      } catch (_) {
        const cleaned = candidate.replace(/,\s*([}\]])/g, '$1');
        try {
          return JSON.parse(cleaned);
        } catch (_) {}
      }
    }

    // Fallback: search backwards for the last matching endChar
    const lastEndIndex = trimmed.lastIndexOf(endChar);
    if (lastEndIndex > startIndex) {
      const candidate = trimmed.substring(startIndex, lastEndIndex + 1);
      try {
        return JSON.parse(candidate);
      } catch (_) {
        const cleaned = candidate.replace(/,\s*([}\]])/g, '$1');
        try {
          return JSON.parse(cleaned);
        } catch (_) {}
      }
    }
  }

  // 4. Clean standard markdown delimiters and try once more
  const cleaned = trimmed
    .replace(/^```json\s*/gi, '')
    .replace(/^```\s*/gi, '')
    .replace(/```\s*$/gi, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

function normalizeLevel(level?: string): '초급자' | '중급자' | '상급자' {
  if (!level) return '중급자';
  if (level.includes('초급') || level === '고1') return '초급자';
  if (level.includes('상급') || level.includes('수능') || level.includes('심화') || level === '고3') return '상급자';
  return '중급자';
}

// Analyze English passage endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const {
      passage,
      gradeLevel = '중급자',
      mode = 'general',
      questionPrompt = '',
      choices = [],
    } = req.body;

    if (!passage || typeof passage !== 'string' || !passage.trim()) {
      return res.status(400).json({
        error: '분석할 영어 지문을 입력해 주세요.',
      });
    }

    const targetLevel = normalizeLevel(gradeLevel);

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback rule-based analyzer when API key is missing
      const fallbackData = generateRuleBasedAnalysis(passage, targetLevel, mode, questionPrompt, choices);
      return res.json({
        success: true,
        data: fallbackData,
        isFallback: true,
        notice: 'Gemini API 키가 설정되지 않아 규칙 기반 분석 엔진으로 생성되었습니다. 정밀 AI 분석을 원하시면 Settings에서 GEMINI_API_KEY를 설정하세요.',
      });
    }

    const isSuneung = mode === 'suneung';

    let levelSpecificInstruction = '';
    if (targetLevel === '초급자') {
      levelSpecificInstruction = `
[★ 핵심 난이도 타겟: 초급자 (기초 구문 다지기 & 중학 기초 연계 & 영포자 탈출 모드) ★]
1. tokens 청크 분할: 문장을 2~3단어 단위, 전치사구 앞, to부정사/동명사 앞 등 아주 잘게 쪼개어 배치할 것.
   - 전치사구는 반드시 clauseType: 'prepositional' 및 role: 'M'으로 지정하여 UI 상에서 수식어 거품 괄호 ( )로 묶여 보이도록 할 것.
   - 주어(S), 서술어(V), 목적어(O), 보어(C) 뼈대 단어는 명확하게 role을 부여하고, 수식어구(M)는 철저히 분리할 것.
2. tagTop (상단 라벨): 어려운 한자 문법 용어 대신 알기 쉬운 풀이말을 제공할 것.
   - 예: '주어 [명사]', '서술어 [동사]', '목적어 [동작 대상]', '수식어 거품 [전치사구]', '연결다리 [관계사]', '동작 덩어리 [to부정사]'
3. directTranslation (직독직해): 빗금(/)을 2~3단어마다 촘촘하게 배치하여, 영어를 읽는 순서 그대로 한국어로 즉시 직독직해할 수 있도록 세밀하게 끊어 쓸 것.
4. grammarPoints (핵심 어법): 중학~고1 수준의 기초 필수 어법 2~3개 (문장의 5형식 뼈대 잡기, be동사 vs 일반동사, 주어-동사 기본 수일치, to부정사 용법 등)를 누구나 이해할 수 있게 매우 친절하고 기초적인 언어로 설명할 것.
5. vocabulary (어휘 - ★매우 중요: 중학생 필수 기초 어휘 및 상세 뜻풀이★):
   - 영어에 자신 없는 중하위권 학생, 영포자 학생의 시각에 맞춰 "이것도 모를 수 있다"고 가정하고 문장당 4~7개 이상 충분히 풍성하게 추출할 것.
   - 고교생에게 당연해 보이는 중학 필수 단어(예: allow, improve, notice, effect, result, create, decide, cause, support, common 등) 및 불규칙 과거분사, 전치사구 숙어(예: because of, in order to, lead to, rely on 등)를 빠짐없이 수록할 것.
   - 뜻(meaning)은 단어장식의 무미건조한 1단어 뜻에 그치지 않고, [품사]와 본문 문맥에서의 자연스러운 뜻, 그리고 필요 시 유용한 짝꿍 표현이나 기초 팁을 덧붙여 매우 친절하게 작성할 것 (예: "허락하다, 가능하게 하다 (allow A to V 형태)", "결과, 영향 (~에 미치는 영향)", "이끌다, 유발하다 (전치사 to와 함께 씀)").`;
    } else if (targetLevel === '상급자') {
      levelSpecificInstruction = `
[★ 핵심 난이도 타겟: 상급자 (수능 1등급 / 킬러 문항 / 논리 독해 모드) ★]
1. tokens 청크 분할: 자잘한 끊어읽기 대신 주절과 종속절, 대등절, 핵심 삽입구 위주로 대범하고 거시적으로 묶을 것.
   - 단순 전치사구는 본동사나 목적어와 함께 하나의 큰 의미 단위로 묶고, 도치·가정법·분사구문·이중관계사 등 고난도 구문만 정밀 추출할 것.
2. tagTop (상단 라벨): 고난도 구조 및 논리적 기능을 명시할 것.
   - 예: '부정어 도치 구문', '가정법 도치', '동격 명사절', '결정적 정답 근거문', '대조(Contrast) 전환부', '양보 부사절'
3. directTranslation (직독직해): 시험장에서 필요한 빠른 속독속해(Skimming/Scanning) 호흡으로 핵심 논리 흐름을 살려 직독할 것.
4. grammarPoints (핵심 어법): 기초 문법(be동사, 단순 3형식 등)은 일체 생략하고, 수능 킬러 문항에서 해석을 왜곡하기 쉬운 고난도 구조(도치, 무생물 주어, 복합 분사구문, 삽입절, 생략 구문) 및 평가원 함정 패턴 위주로 심도 있게 분석할 것.
5. vocabulary (어휘): 기초 단어는 생략하고, 평가원 빈출 고난도 어휘, 문맥적 비유 표현, 학술적 전문 용어, 동의어/반의어 및 선지 패러프레이징(Paraphrasing) 연계 어휘 위주로 심층 정리할 것.
6. suneungAnalysis (수능 모드 시): 지문과 선지 사이의 재진술(Paraphrase) 짝꿍을 3쌍 이상 정밀 분석하고, 매력적 오답의 논리적 함정(과도한 일반화, 인과 전도, 지문 언급 무관 등)을 평가원 출제자의 시각에서 날카롭게 소거할 것.`;
    } else {
      levelSpecificInstruction = `
[★ 핵심 난이도 타겟: 중급자 (고교 내신 & 기본 모의고사 표준 모드) ★]
1. tokens 청크 분할: 자연스러운 고교 수준 의미 덩어리(구/절 단위)로 묶어 문장 구조를 직관적으로 파악할 수 있도록 구성할 것.
2. tagTop (상단 라벨): 고교 내신 표준 문법 용어 ('주격관계대명사절', '동명사 목적어', '상관접속사 병렬', '분사구문') 활용.
3. directTranslation (직독직해): 고교 영어 시험 직독직해 표준 호흡으로 끊어 읽기 제공.
4. grammarPoints (핵심 어법): 고교 내신 서술형 및 모의고사 빈출 어법 (주어-동사 수일치, 관계사 that vs what, 능동 vs 수동태, 등위접속사 병렬) 중심 2~3개 요약.
5. vocabulary (어휘): 고교 필수 어휘 및 문맥 속 다의어 중심 정리.`;
    }

    let systemInstruction = `당신은 대한민국 고교 영어 교육 및 수능/모의고사 출제 및 구문 분석 전문가입니다.
제공된 영어 지문(교과서, 모의고사, 부교재, 영문 기사 등)을 문장별 정밀 구문분석 JSON으로 분석하여 반환해야 합니다.

${levelSpecificInstruction}

[분석 공통 원칙]
1. 원문의 모든 문장을 한 문장도 빠짐없이 순서대로 분석할 것 (sentenceNumber: 1, 2, 3...)
2. 각 문장의 형식(1형식~5형식 및 변형)을 파악할 것.
3. tokens 배열은 문장을 의미 있는 단어/어구 덩어리(chunk)로 나누어 상단/하단에 겹쳐 표시할 수 있도록 구성:
   - text: 영어 본문 조각 (문장부호 포함)
   - role: 문장성분 ('S', 'V', 'O', 'C', 'M', "S'", "V'", "O'", "C'", "M'", 'S1', 'V1', 'O1', 'V2', 'O2' 등). 성분이 없는 접속사 등은 ''로 처리.
   - pos: 품사 분류 ('noun' | 'verb' | 'adjective' | 'adverb' | 'other').
     * 'noun': 명사/대명사 (빨간색 계열)
     * 'verb': 서술어/동사 (파란색 계열)
     * 'adjective': 형용사/명사수식분사 (주황색 계열)
     * 'adverb': 부사/부사적수식어 (보라색 계열)
     * 'other': 전치사, 접속사, 관사 등
   - tagTop: 상단에 띄울 문법 태그나 짧은 역할 설명
   - meaning: 해당 어구 덩어리의 한국어 직독 해석
   - clauseType: 괄호 및 하이라이트 스타일용 ('none' | 'relative' [관계절대괄호] | 'noun' <명사절꺾쇠> | 'adverb' (부사절/구소괄호) | 'prepositional' (전치사구) | 'parenthesis')
4. directTranslation: 슬래시(/)로 끊어 읽기 표기된 영문 + 바로 아래 한국어 끊어읽기 직독직해.
5. polishedTranslation: 자연스러운 한국어 완역 (해설지 스타일).
6. grammarPoints: 문장에 포함된 핵심 어법 및 구문 포인트 2~4개 요약.
7. vocabulary: 해당 문장의 핵심 어휘 및 숙어.

[반환 최상위 JSON 스키마]:
반드시 최상위 JSON 객체에 "sentences" 배열을 포함해야 합니다:
{
  "title": "[${targetLevel}] 영어 지문 정밀 구문분석",
  "gradeLevel": "${targetLevel}",
  "difficulty": "${targetLevel}",
  "summary": "지문 핵심 요약 1~2줄",
  "sentences": [
    {
      "sentenceNumber": 1,
      "originalText": "원문 문장",
      "sentencePattern": "3형식",
      "tokens": [
        { "text": "단어/어구", "role": "S", "pos": "noun", "tagTop": "주어", "meaning": "직독해", "clauseType": "none" }
      ],
      "directTranslation": "직독직해",
      "polishedTranslation": "자연스러운 완역",
      "grammarPoints": ["어법 1", "어법 2"],
      "vocabulary": [{ "word": "어휘", "meaning": "뜻" }]
    }
  ]
}`;

    if (isSuneung) {
      systemInstruction += `

[수능 실전 풀이 분석 (suneungAnalysis) 필수 스키마]:
본 요청은 수능 실전 모드이므로, 최상위 JSON 객체 안에 "suneungAnalysis" 객체를 반드시 포함해야 합니다:
{
  "title": "${gradeLevel} 수능·모의고사 실전 풀이 및 정밀 구문분석",
  "gradeLevel": "${gradeLevel}",
  "mode": "suneung",
  "summary": "지문 핵심 요약",
  "suneungAnalysis": {
    "questionType": "문제 유형 (예: '빈칸추론 (3점)', '글의 제목', '주제 파악', '문장 삽입', '글의 순서' 등)",
    "questionPrompt": "문제 발문",
    "correctChoiceNumber": 정답 선지 번호 (1~5 정수),
    "clueSentenceNumbers": [정답 도출의 핵심 단서가 된 본문 속 문장 번호들 (예: [1, 2])],
    "coreLogicSummary": "정답 도출 핵심 논리 1~2줄 요약 (출제 의도 및 정답 결정 사유)",
    "passageFlow": {
      "topicIntro": "도입: 중심 화제 및 배경 제시",
      "development": "전개: 본론 상술 및 근거 제시",
      "turningPoint": "전환/심화: 역접 또는 논리적 심화 연결",
      "conclusion": "결론: 핵심 요지 도출 및 시사점"
    },
    "choices": [
      {
        "number": 1,
        "text": "선지 1번 내용",
        "isCorrect": false,
        "analysis": "오답 이유 (예: '오답(본문 무관): 본문에서 다루지 않은 엉뚱한 정보')"
      },
      ...5번까지 5개 모두 포함. 정답 선지는 isCorrect: true 및 정답 이유 명시
    ],
    "paraphrasePairs": [
      {
        "passageExpr": "지문 속 원문 표현",
        "choiceExpr": "정답 선지의 재진술(Paraphrase) 표현"
      }
    ]
  },
  "sentences": [ ...각 문장 분석 배열... ]
}`;
    }

    systemInstruction += `

반드시 유효한 단 하나의 순수 JSON 객체만 반환하세요. Markdown 코드 블록(\`\`\`json)이나 JSON 전후의 추가 설명/주석 텍스트를 절대로 포함하지 마십시오.`;

    let prompt = '';
    if (isSuneung) {
      const cleanChoices = Array.isArray(choices) && choices.length > 0
        ? choices.map((c: string, idx: number) => `(${idx + 1}) ${c || '(미입력)'}`).join('\n')
        : '(사용자가 선지를 직접 입력하지 않았으므로 지문 내용을 바탕으로 5지선다 보기와 정답을 추론하여 분석하세요)';

      prompt = `[분석 모드]: 수능·모의고사 실전 풀이 분석 모드
[분석 대상 학년]: ${gradeLevel}
[문제 발문]: ${questionPrompt.trim() || '다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?'}
[5지선다 선지 (①~⑤)]:
${cleanChoices}
[분석 대상 영어 지문]:
${passage.trim()}`;
    } else {
      prompt = `[분석 대상 학년]: ${gradeLevel}
[분석 대상 지문]:
${passage.trim()}`;
    }

    // Valid active models supported by @google/genai SDK
    // Order: gemini-3.8-flash (official primary) -> gemini-3.1-flash-lite -> gemini-flash-latest
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let responseText = '';
    let hitQuotaError = false;

    modelLoop: for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
      const modelName = modelsToTry[mIdx];
      const isLastModel = mIdx === modelsToTry.length - 1;
      const maxRetries = 1;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempting analysis with model: ${modelName} (attempt ${attempt + 1})`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.2,
              responseMimeType: 'application/json',
              maxOutputTokens: 8192,
            },
          });

          if (response.text && response.text.trim()) {
            responseText = response.text.trim();
            console.log(`Analysis succeeded with model: ${modelName} on attempt ${attempt + 1}`);
            break modelLoop;
          }
        } catch (modelErr: any) {
          const isQuota = isQuotaOrRateLimitError(modelErr);
          const isOverload = isServerOverloadError(modelErr);
          if (isQuota) {
            hitQuotaError = true;
          }
          console.warn(
            `Model ${modelName} attempt ${attempt + 1} failed (quota: ${isQuota}, overload: ${isOverload}):`,
            modelErr?.status || modelErr?.message || modelErr
          );

          // If server is overloaded (503/504) or model not found (404), switch to next model immediately
          if (isOverload || modelErr?.status === 404) {
            break;
          }

          // If quota exceeded and another fallback model exists, switch to next model immediately
          if (isQuota && !isLastModel) {
            break;
          }

          // If quota exceeded on the last model, wait briefly and retry once
          if (attempt < maxRetries && isQuota) {
            const delayMs = 1200;
            console.log(`Retrying model ${modelName} in ${delayMs}ms due to quota limit...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            break;
          }
        }
      }
    }

    if (!responseText) {
      console.warn('AI models were temporarily unavailable after retries, generating rule-based fallback analysis...');
      const fallbackData = generateRuleBasedAnalysis(passage, gradeLevel, mode, questionPrompt, choices);
      return res.json({
        success: true,
        data: fallbackData,
        isFallback: true,
        quotaExceeded: hitQuotaError,
        notice: hitQuotaError
          ? 'Gemini API 할당량(429/분당 요청 한도)에 도달하여 규칙 기반 구문분석 엔진으로 즉시 생성되었습니다. 잠시 후 상단의 [AI로 다시 분석]을 누르시면 실시간 재시도됩니다.'
          : 'AI 서버 트래픽 지연으로 인해 고등 영어 구문 규칙 기반 분석 엔진으로 즉시 생성되었습니다.',
      });
    }

    let parsedResult: any = null;
    try {
      parsedResult = extractAndParseJSON(responseText);
    } catch (parseErr: any) {
      console.warn('Failed to parse AI JSON response, falling back gracefully:', parseErr?.message || parseErr);
      const fallbackData = generateRuleBasedAnalysis(passage, gradeLevel, mode, questionPrompt, choices);
      return res.json({
        success: true,
        data: fallbackData,
        isFallback: true,
        notice: 'AI 응답 데이터 파싱 중 일시적 오류가 발생하여 내장 정밀 구문분석 엔진으로 즉시 생성되었습니다. [AI로 다시 분석]을 눌러 재시도하실 수 있습니다.',
      });
    }

    // Uniform format normalization
    let normalizedData: any = {};
    if (Array.isArray(parsedResult)) {
      normalizedData = {
        title: `${gradeLevel} 영어 모의고사 지문 정밀 구문분석`,
        gradeLevel,
        sentences: parsedResult,
      };
    } else if (parsedResult && typeof parsedResult === 'object') {
      normalizedData = {
        title: parsedResult.title || `${gradeLevel} 영어 모의고사 지문 정밀 구문분석`,
        gradeLevel: parsedResult.gradeLevel || gradeLevel,
        summary: parsedResult.summary || '',
        sentences: Array.isArray(parsedResult.sentences)
          ? parsedResult.sentences
          : Array.isArray(parsedResult.data)
          ? parsedResult.data
          : Array.isArray(parsedResult.analysis)
          ? parsedResult.analysis
          : [],
      };
    }

    // If sentences array is empty, check if parsedResult itself is a single sentence object
    if (!Array.isArray(normalizedData.sentences) || normalizedData.sentences.length === 0) {
      if (parsedResult && typeof parsedResult === 'object') {
        if (
          Array.isArray(parsedResult.tokens) ||
          parsedResult.originalSentence ||
          parsedResult.originalText ||
          parsedResult.sentenceNumber
        ) {
          normalizedData.sentences = [parsedResult];
        } else {
          for (const key of Object.keys(parsedResult)) {
            const val = parsedResult[key];
            if (Array.isArray(val) && val.length > 0 && (val[0]?.tokens || val[0]?.originalSentence || val[0]?.originalText || val[0]?.sentenceNumber)) {
              normalizedData.sentences = val;
              break;
            }
          }
        }
      }
    }

    // Fallback if no sentences extracted
    if (!Array.isArray(normalizedData.sentences) || normalizedData.sentences.length === 0) {
      const fallbackData = generateRuleBasedAnalysis(passage, gradeLevel, mode, questionPrompt, choices);
      normalizedData.sentences = fallbackData.sentences;
      if (!normalizedData.summary) normalizedData.summary = fallbackData.summary;
    }

    // Normalize each sentence
    normalizedData.sentences = (normalizedData.sentences || []).map((s: any, idx: number) => {
      const rawTokens = Array.isArray(s?.tokens) ? s.tokens : [];
      let cleanTokens = rawTokens.map((t: any) => {
        const textVal = typeof t === 'string' ? t : (t?.text || t?.word || t?.token || '');
        const rawPos = typeof t?.pos === 'string' ? t.pos.toLowerCase() : 'other';
        const pos = ['noun', 'verb', 'adjective', 'adverb', 'other'].includes(rawPos) ? rawPos : 'other';
        return {
          text: String(textVal || ''),
          role: typeof t?.role === 'string' ? t.role : '',
          pos,
          tagTop: typeof t?.tagTop === 'string' ? t.tagTop : (typeof t?.tag === 'string' ? t.tag : ''),
          meaning: typeof t?.meaning === 'string' ? t.meaning : '',
          clauseType: typeof t?.clauseType === 'string' ? t.clauseType : 'none',
        };
      }).filter((t: any) => t.text.trim().length > 0);

      const sentenceText = s?.originalText || s?.originalSentence || s?.sentence || cleanTokens.map((t: any) => t.text).join(' ');

      // If tokens array is empty, reconstruct from sentenceText
      if (cleanTokens.length === 0) {
        const words = sentenceText.split(/\s+/).filter(Boolean);
        cleanTokens = words.map((w: string, wIdx: number) => ({
          text: w,
          role: wIdx === 0 ? 'S' : wIdx === 1 ? 'V' : '',
          pos: wIdx === 0 ? 'noun' : wIdx === 1 ? 'verb' : 'other',
          tagTop: '',
          meaning: '',
          clauseType: 'none',
        }));
      }

      const rawVocab = Array.isArray(s?.vocabulary) ? s.vocabulary : [];
      const cleanVocab = rawVocab.map((v: any) => {
        const wordVal = typeof v === 'string' ? v : (v?.word || v?.term || '');
        const meaningVal = typeof v?.meaning === 'string' ? v.meaning : (typeof v?.def === 'string' ? v.def : '');
        return {
          word: String(wordVal || ''),
          meaning: String(meaningVal || ''),
          pos: typeof v?.pos === 'string' ? v.pos : undefined,
        };
      });

      return {
        sentenceNumber: s?.sentenceNumber || idx + 1,
        originalText: sentenceText,
        sentencePattern: s?.sentencePattern || s?.form || s?.structure || s?.pattern || '',
        tokens: cleanTokens,
        directTranslation: typeof s?.directTranslation === 'string' ? s.directTranslation : '',
        polishedTranslation: typeof s?.polishedTranslation === 'string' ? s.polishedTranslation : (typeof s?.translation === 'string' ? s.translation : ''),
        grammarPoints: Array.isArray(s?.grammarPoints) ? s.grammarPoints : [],
        vocabulary: cleanVocab,
      };
    });

    // Suneung Analysis Normalization
    if (isSuneung) {
      normalizedData.mode = 'suneung';
      const rawSa = parsedResult?.suneungAnalysis || {};
      const choicesList = Array.isArray(rawSa.choices) ? rawSa.choices : [];

      const normalizedChoices = [1, 2, 3, 4, 5].map((num) => {
        const found = choicesList.find((c: any) => c?.number === num) || choicesList[num - 1] || {};
        const choiceFallbackText = (Array.isArray(choices) && choices[num - 1]) || `선지 ${num}번 내용`;
        return {
          number: num,
          text: typeof found?.text === 'string' && found.text.trim() ? found.text : choiceFallbackText,
          isCorrect: typeof found?.isCorrect === 'boolean' ? found.isCorrect : num === (rawSa.correctChoiceNumber || 2),
          analysis: typeof found?.analysis === 'string' && found.analysis.trim()
            ? found.analysis
            : found.isCorrect
            ? '정답: 본문의 핵심 논리 및 문맥적 단서를 정확히 반영한 정답 선지입니다.'
            : '오답 소거: 본문 내용과 무관하거나 중심 논지를 왜곡한 함정 선지입니다.',
        };
      });

      let correctNum = typeof rawSa.correctChoiceNumber === 'number' && rawSa.correctChoiceNumber >= 1 && rawSa.correctChoiceNumber <= 5
        ? rawSa.correctChoiceNumber
        : normalizedChoices.find((c) => c.isCorrect)?.number || 2;

      normalizedChoices.forEach((c) => {
        c.isCorrect = c.number === correctNum;
      });

      const rawClues = Array.isArray(rawSa.clueSentenceNumbers) ? rawSa.clueSentenceNumbers : [1];
      const clueNumbers = rawClues
        .map((n: any) => Number(n))
        .filter((n: number) => !isNaN(n) && n >= 1 && n <= normalizedData.sentences.length);

      const rawPairs = Array.isArray(rawSa.paraphrasePairs) ? rawSa.paraphrasePairs : [];
      const paraphrasePairs = rawPairs
        .map((p: any) => ({
          passageExpr: String(p?.passageExpr || ''),
          choiceExpr: String(p?.choiceExpr || ''),
        }))
        .filter((p: any) => p.passageExpr && p.choiceExpr);

      normalizedData.suneungAnalysis = {
        questionType: rawSa.questionType || '수능 독해 실전 유형',
        questionPrompt: questionPrompt.trim() || rawSa.questionPrompt || '다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?',
        correctChoiceNumber: correctNum,
        clueSentenceNumbers: clueNumbers.length > 0 ? clueNumbers : [1],
        coreLogicSummary: rawSa.coreLogicSummary || '지문의 핵심 논리 및 문맥적 단서를 종합하여 정답을 도출합니다.',
        passageFlow: {
          topicIntro: rawSa?.passageFlow?.topicIntro || '지문의 도입부 및 화제 제시',
          development: rawSa?.passageFlow?.development || '본론 전개 및 근거 상술',
          turningPoint: rawSa?.passageFlow?.turningPoint || '전환점 및 관점 구체화',
          conclusion: rawSa?.passageFlow?.conclusion || '결론 도출 및 시사점',
        },
        choices: normalizedChoices,
        paraphrasePairs: paraphrasePairs.length > 0 ? paraphrasePairs : [
          {
            passageExpr: normalizedData.sentences[0]?.tokens?.slice(0, 4)?.map((t: any) => t.text).join(' ') || 'core concept',
            choiceExpr: normalizedChoices.find(c => c.isCorrect)?.text?.slice(0, 35) || 'paraphrased key phrase',
          }
        ],
      };
    } else {
      normalizedData.mode = 'general';
    }

    res.json({
      success: true,
      data: normalizedData,
    });
  } catch (err: any) {
    console.error('Analysis error:', err);
    try {
      const {
        passage,
        gradeLevel = '고2',
        mode = 'general',
        questionPrompt = '',
        choices = [],
      } = req.body || {};
      if (passage && typeof passage === 'string') {
        const fallbackData = generateRuleBasedAnalysis(passage, gradeLevel, mode, questionPrompt, choices);
        return res.json({
          success: true,
          data: fallbackData,
          isFallback: true,
          notice: 'AI 서버 일시 지연으로 인해 고등 영어 구문 규칙 기반 분석 엔진으로 복구되었습니다.',
        });
      }
    } catch (fbErr) {
      // ignore
    }
    res.status(500).json({
      error: err.message || '지문 구문 분석 처리 중 오류가 발생했습니다.',
    });
  }
});

/**
 * Intelligent rule-based fallback analyzer for high school English passages
 */
function generateRuleBasedAnalysis(
  passage?: string,
  gradeLevel: string = '중급자',
  mode: string = 'general',
  questionPrompt: string = '',
  choicesInput: string[] = []
) {
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
      const safeW = typeof w === 'string' ? w : String(w || '');
      const clean = safeW.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
      let role = '';
      let pos = 'other';
      let tagTop = '';
      let clauseType = 'none';

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
        role,
        pos,
        tagTop,
        meaning: '',
        clauseType,
      });
    });

    // Chunking interval based on level
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

  const result: any = {
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

    // Smart heuristic choice matching for fallback mode
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
        : '지문의 중심 소재와 논리적 인과관계를 바탕으로 분석한 결과입니다. (상단의 "AI로 다시 분석"을 누르면 정밀 AI 해설을 확인하실 수 있습니다.)',
      passageFlow: {
        topicIntro: '글의 서두에서 중심 소재 및 화제를 제시하며 배경을 형성함',
        development: '구체적인 근거와 설명을 통해 중심 논지를 확장 전개함',
        turningPoint: '논리적 전환 또는 심화 진술을 통해 핵심 논점을 부각함',
        conclusion: '글의 전개 내용을 종합하여 최종 결론 및 시사점을 도출함',
      },
      choices,
      paraphrasePairs: [
        {
          passageExpr: sentences[0]?.tokens?.slice(0, 3)?.map((t: any) => t.text)?.join(' ') || 'core concept in passage',
          choiceExpr: choices[correctChoiceNumber - 1]?.text?.slice(0, 30) || 'paraphrased expression',
        },
      ],
    };
  }

  return result;
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
