/**
 * High School English Mock Exam & Naesin (School Exam) Question Smart Parser
 * Automatically parses raw exam text into Question Title, Question Type, Prompt, Passage, 5 Choices, and Student/Correct answers.
 */

export interface ParsedExamQuestion {
  prompt: string;
  passage: string;
  choices: [string, string, string, string, string];
  hasParsedChoices: boolean;
  questionTitle?: string;
  questionType?: string;
  studentAnswer?: string;
  correctAnswer?: string;
}

const CIRCLED_NUMS = ['①', '②', '③', '④', '⑤'];

export function detectQuestionType(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/어법|문법|어색한\s*것|틀린\s*어법|gramm/i.test(p)) {
    return '어법상 틀린 것 고치기';
  }
  if (/낱말|어휘|문맥상|반의어|유의어|적절하지\s*않은\s*낱말|단어/i.test(p)) {
    return '원문 어휘 변형 (반의어/유의어)';
  }
  if (/무관한\s*문장|흐름과\s*관계\s*없는|관계없는\s*문장/i.test(p)) {
    return '문맥상 무관한 문장';
  }
  if (/빈칸|들어갈\s*말로/i.test(p)) {
    return '빈칸추론 변형';
  }
  if (/순서|이어질\s*글|삽입|들어갈\s*위치|주어진\s*문장/i.test(p)) {
    return '문장 삽입 / 순서 배열';
  }
  if (/서술형|조건|영작|쓰시오|작성하시오/i.test(p)) {
    return '서술형 조건영작 / 빈칸 채우기';
  }
  if (/요약|한\s*문장으로/i.test(p)) {
    return '요약문 빈칸 완성';
  }
  if (/제목|주제|요지|주장/i.test(p)) {
    return '대의파악 (주제·제목·요지)';
  }
  return '원문 어휘 변형 (반의어/유의어)';
}

export function extractQuestionTitle(text: string): { title: string; cleanedText: string } {
  let title = '';
  let cleaned = text;

  // Pattern 1: [중간고사 14번], [2024년 기말 5번], [서술형 2번], [15번]
  const bracketMatch = cleaned.match(/^\[([^\]]*(?:중간|기말|모의|수능|서술형|문제|\d+번)[^\]]*)\]\s*/i);
  if (bracketMatch) {
    title = bracketMatch[0].trim();
    cleaned = cleaned.replace(bracketMatch[0], '').trim();
    return { title, cleanedText: cleaned };
  }

  // Pattern 2: 14., 23번., [14], 14)
  const numMatch = cleaned.match(/^(\d{1,2}\s*번(?:[.)\-:]|\s)|\d{1,2}\.\s*|\(\d{1,2}\)\s*|\[\d{1,2}\]\s*)/);
  if (numMatch) {
    title = numMatch[0].trim();
    cleaned = cleaned.replace(numMatch[0], '').trim();
    return { title, cleanedText: cleaned };
  }

  return { title: '', cleanedText: text };
}

function normalizeAnswerString(raw: string): string {
  const trimmed = raw.trim();
  const map: Record<string, string> = {
    '①': '1번', '②': '2번', '③': '3번', '④': '4번', '⑤': '5번',
    '1': '1번', '2': '2번', '3': '3번', '4': '4번', '5': '5번',
    '1번': '1번', '2번': '2번', '3번': '3번', '4번': '4번', '5번': '5번',
  };
  return map[trimmed] || trimmed;
}

export function extractAnswers(text: string): {
  studentAnswer: string;
  correctAnswer: string;
  cleanedText: string;
} {
  let studentAnswer = '';
  let correctAnswer = '';
  let cleaned = text;

  // Regex for student answer
  // Matches: 내가 쓴 답: 2번, 내 답 1, 오답: 3, 학생답: ②, 내가 고른 답: 1번
  const studentRegex = /(?:(?:내가\s*(?:고른|선택한|쓴)\s*답|내\s*답|오답|학생\s*답|내답)[:\s]*([①-⑤]|[1-5]번?|[1-5]))/i;
  const sMatch = cleaned.match(studentRegex);
  if (sMatch) {
    studentAnswer = normalizeAnswerString(sMatch[1]);
    cleaned = cleaned.replace(sMatch[0], '').trim();
  }

  // Regex for correct answer
  // Matches: 실제 정답: 4번, 정답: ⑤, 답: 4, 모범답안: 3번
  const correctRegex = /(?:(?:실제\s*정답|정답|모범\s*답안|해설\s*답|답)[:\s]*([①-⑤]|[1-5]번?|[1-5]))/i;
  const cMatch = cleaned.match(correctRegex);
  if (cMatch) {
    correctAnswer = normalizeAnswerString(cMatch[1]);
    cleaned = cleaned.replace(cMatch[0], '').trim();
  }

  return { studentAnswer, correctAnswer, cleanedText: cleaned };
}

export function parseExamText(rawText: string): ParsedExamQuestion {
  const text = rawText.trim();
  if (!text) {
    return {
      prompt: '',
      passage: '',
      choices: ['', '', '', '', ''],
      hasParsedChoices: false,
    };
  }

  // 1. Extract answers if written in text (e.g. "내 답: 2번", "정답: 4번")
  const { studentAnswer, correctAnswer, cleanedText: textWithoutAnswers } = extractAnswers(text);

  // 2. Extract Title / Question Number
  const { title: questionTitle, cleanedText: textWithoutTitle } = extractQuestionTitle(textWithoutAnswers);

  const workingText = textWithoutTitle.trim();

  // 3. Detect 5 choices (① ~ ⑤ or (1)~(5) or 1.~5.)
  // We want to distinguish between:
  // A) Choices block at the bottom of the problem
  // B) Inline underlined vocabulary/grammar numbers inside the passage
  let choices: [string, string, string, string, string] = ['', '', '', '', ''];
  let hasParsedChoices = false;
  let bodyBeforeChoices = workingText;

  // Let's check for circled numbers ① ~ ⑤
  // Find all occurrences of ① ~ ⑤
  const allCircled: { ch: string; num: number; index: number }[] = [];
  for (let i = 0; i < workingText.length; i++) {
    const ch = workingText[i];
    const num = CIRCLED_NUMS.indexOf(ch) + 1;
    if (num >= 1 && num <= 5) {
      allCircled.push({ ch, num, index: i });
    }
  }

  // Check if we have an ending sequence of 1, 2, 3, 4, 5
  let foundCircledSeq = false;
  if (allCircled.length >= 5) {
    // Check backwards from the end to find the last occurrence of 1, 2, 3, 4, 5 in order
    // Typically choices are clustered near the bottom
    for (let startIdx = allCircled.length - 5; startIdx >= 0; startIdx--) {
      const slice = allCircled.slice(startIdx, startIdx + 5);
      if (slice.every((item, idx) => item.num === idx + 1)) {
        // Verify this looks like a choices block
        const firstChoice = slice[0];
        const lastChoice = slice[4];
        
        // If choices are near the bottom (after the main passage or on separate lines)
        const candidateBefore = workingText.slice(0, firstChoice.index).trim();
        // Check if candidate before has some English words
        const hasEnglishBefore = /[a-zA-Z]{5,}/.test(candidateBefore);
        
        if (hasEnglishBefore || startIdx === allCircled.length - 5) {
          bodyBeforeChoices = candidateBefore;
          for (let c = 0; c < 5; c++) {
            const start = slice[c].index + 1;
            const end = c < 4 ? slice[c + 1].index : workingText.length;
            choices[c] = workingText.slice(start, end).trim();
          }
          hasParsedChoices = true;
          foundCircledSeq = true;
          break;
        }
      }
    }
  }

  // If no circled numbers choices block found, check alt pattern: (1)~(5) or 1.~5. at bottom
  if (!foundCircledSeq) {
    const patternAlt = /(?:\n|^|\s)(?:\(([1-5])\)|([1-5])\.\s*|([1-5])\)\s*)/g;
    const matches: { index: number; num: number; matchLen: number }[] = [];
    let match: RegExpExecArray | null;

    while ((match = patternAlt.exec(workingText)) !== null) {
      const numStr = match[1] || match[2] || match[3];
      const num = parseInt(numStr, 10);
      if (num >= 1 && num <= 5) {
        matches.push({
          index: match.index + (match[0].length - match[0].trimStart().length),
          num,
          matchLen: match[0].trim().length,
        });
      }
    }

    if (matches.length >= 5) {
      // Find subsequence 1, 2, 3, 4, 5
      for (let sIdx = matches.length - 5; sIdx >= 0; sIdx--) {
        const slice = matches.slice(sIdx, sIdx + 5);
        if (slice.every((m, idx) => m.num === idx + 1)) {
          bodyBeforeChoices = workingText.slice(0, slice[0].index).trim();
          for (let i = 0; i < 5; i++) {
            const start = slice[i].index + slice[i].matchLen;
            const end = i < 4 ? slice[i + 1].index : workingText.length;
            choices[i] = workingText.slice(start, end).trim();
          }
          hasParsedChoices = true;
          break;
        }
      }
    }
  }

  // Special Case: If it's an underline question where ① ~ ⑤ only appear inside the passage
  // and no choices block was extracted at the bottom
  if (!hasParsedChoices && allCircled.length === 5 && allCircled.every((c, idx) => c.num === idx + 1)) {
    // If prompt or text mentions 밑줄 or 어법 or 낱말
    if (/밑줄|어법|낱말|문맥상|틀린|적절하지\s*않은/.test(workingText)) {
      bodyBeforeChoices = workingText;
      choices = ['① 번 밑줄', '② 번 밑줄', '③ 번 밑줄', '④ 번 밑줄', '⑤ 번 밑줄'];
      hasParsedChoices = true;
    }
  }

  // 4. Split bodyBeforeChoices into Prompt and Passage
  let prompt = '';
  let passage = '';

  const lines = bodyBeforeChoices.split('\n').map((l) => l.trim()).filter(Boolean);

  if (lines.length > 0) {
    let firstEnglishLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const englishChars = (line.match(/[a-zA-Z]/g) || []).length;
      const koreanChars = (line.match(/[\uAC00-\uD7AF\u1100-\u11FF]/g) || []).length;

      // Check if line is predominantly English text (> 8 letters and more English than Korean)
      if (englishChars >= 8 && englishChars > koreanChars) {
        firstEnglishLineIdx = i;
        break;
      }
    }

    if (firstEnglishLineIdx > 0) {
      prompt = lines.slice(0, firstEnglishLineIdx).join(' ').trim();
      passage = lines.slice(firstEnglishLineIdx).join('\n').trim();
    } else if (firstEnglishLineIdx === 0) {
      // If the first line has both prompt and english or begins right away
      const firstLine = lines[0];
      if (/다음\s*글|가장\s*적절|제목|요지|주제|빈칸|순서|흐름|밑줄|어법|낱말|\b\d{1,2}\s*[.번]/.test(firstLine)) {
        prompt = firstLine;
        passage = lines.slice(1).join('\n').trim();
      } else {
        passage = lines.join('\n').trim();
      }
    } else {
      passage = bodyBeforeChoices;
    }
  }

  // Clean prompt: remove leading numbers like "31. " or "23번 "
  prompt = prompt.replace(/^\s*\d{1,2}\s*[.번)\-]\s*/, '').trim();

  // Detect Question Type
  const qType = detectQuestionType(prompt || workingText);

  return {
    prompt,
    passage,
    choices,
    hasParsedChoices,
    questionTitle: questionTitle || undefined,
    questionType: qType,
    studentAnswer: studentAnswer || undefined,
    correctAnswer: correctAnswer || undefined,
  };
}
