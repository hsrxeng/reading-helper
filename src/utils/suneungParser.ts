/**
 * High School English Mock Exam & CSAT Question Smart Parser
 * Automatically parses pasted raw exam text into Prompt, Passage, and 5 Choices (① ~ ⑤).
 */

export interface ParsedExamQuestion {
  prompt: string;
  passage: string;
  choices: [string, string, string, string, string];
  hasParsedChoices: boolean;
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

  // 1. Detect choices pattern
  // Check for circled numbers ① ~ ⑤
  const circledRegex = /(?:[①-⑤]|\([1-5]\)|(?:\n|^)\s*[1-5][.)]\s*)/g;

  // Let's find all choice marker indices
  // We look for 5 choices specifically
  const circledMatches: { index: number; num: number; match: string }[] = [];

  // Match ①, ②, ③, ④, ⑤
  const circledChars = ['①', '②', '③', '④', '⑤'];
  let allCircledFound = true;
  for (let i = 0; i < 5; i++) {
    const ch = circledChars[i];
    const idx = text.indexOf(ch);
    if (idx !== -1) {
      circledMatches.push({ index: idx, num: i + 1, match: ch });
    } else {
      allCircledFound = false;
    }
  }

  let choicePositions: { index: number; num: number; matchLen: number }[] = [];

  if (allCircledFound && circledMatches.length === 5) {
    // Sort by position
    circledMatches.sort((a, b) => a.index - b.index);
    // Verify order 1, 2, 3, 4, 5
    if (circledMatches.every((m, idx) => m.num === idx + 1)) {
      choicePositions = circledMatches.map((m) => ({
        index: m.index,
        num: m.num,
        matchLen: m.match.length,
      }));
    }
  }

  // If circled not found in order, try (1) ~ (5) or 1. ~ 5. or 1) ~ 5)
  if (choicePositions.length < 5) {
    const patternAlt = /(?:\n|^|\s)(?:\(([1-5])\)|([1-5])\.\s*|([1-5])\)\s*)/g;
    const matches: { index: number; num: number; matchLen: number }[] = [];
    let match: RegExpExecArray | null;

    while ((match = patternAlt.exec(text)) !== null) {
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

    // Check if we have 1, 2, 3, 4, 5 in ascending sequence
    if (matches.length >= 5) {
      // Find subsequence 1, 2, 3, 4, 5
      let currentExpected = 1;
      const sequence: typeof matches = [];
      for (const m of matches) {
        if (m.num === currentExpected) {
          sequence.push(m);
          currentExpected++;
          if (currentExpected > 5) break;
        }
      }
      if (sequence.length === 5) {
        choicePositions = sequence;
      }
    }
  }

  // If choices detected
  let prompt = '';
  let passage = '';
  const choices: [string, string, string, string, string] = ['', '', '', '', ''];
  let hasParsedChoices = false;

  let bodyBeforeChoices = text;

  if (choicePositions.length === 5) {
    hasParsedChoices = true;
    const firstChoiceIdx = choicePositions[0].index;
    bodyBeforeChoices = text.slice(0, firstChoiceIdx).trim();

    for (let i = 0; i < 5; i++) {
      const start = choicePositions[i].index + choicePositions[i].matchLen;
      const end = i < 4 ? choicePositions[i + 1].index : text.length;
      choices[i] = text.slice(start, end).trim();
    }
  }

  // Now split bodyBeforeChoices into Prompt and Passage
  // Typical prompts:
  // - "다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?"
  // - "다음 글의 요지로 가장 적절한 것은?"
  // - "31. 다음 글의 제목으로 가장 적절한 것은? [3점]"
  // - "다음 글에서 전체 흐름과 관계 없는 문장은?"
  // - Lines that are Korean instructions before the English passage starts
  const lines = bodyBeforeChoices.split('\n').map((l) => l.trim()).filter(Boolean);

  if (lines.length > 0) {
    // Find where the English passage begins
    // English passage starts when a line is primarily English characters
    let firstEnglishLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check if line contains predominantly English (Latin) characters
      const englishChars = (line.match(/[a-zA-Z]/g) || []).length;
      const koreanChars = (line.match(/[\uAC00-\uD7AF\u1100-\u11FF]/g) || []).length;
      
      // If line has strong English content (more than 10 letters or >60% english)
      if (englishChars >= 10 && englishChars > koreanChars) {
        firstEnglishLineIdx = i;
        break;
      }
    }

    if (firstEnglishLineIdx > 0) {
      prompt = lines.slice(0, firstEnglishLineIdx).join(' ').trim();
      passage = lines.slice(firstEnglishLineIdx).join('\n').trim();
    } else if (firstEnglishLineIdx === 0) {
      // No prompt found in front, check if first line looks like prompt despite English or Korean
      const firstLine = lines[0];
      if (/다음\s*글|가장\s*적절|제목|요지|주제|빈칸|순서|흐름|밑줄|\b\d{1,2}\s*[.번]/.test(firstLine)) {
        prompt = firstLine;
        passage = lines.slice(1).join('\n').trim();
      } else {
        passage = lines.join('\n').trim();
      }
    } else {
      // If no predominantly English line found, could be just raw passage
      passage = bodyBeforeChoices;
    }
  }

  // Clean prompt: remove leading numbers like "31. " or "23번 "
  prompt = prompt.replace(/^\s*\d{1,2}\s*[.번)\-]\s*/, '').trim();

  return {
    prompt,
    passage,
    choices,
    hasParsedChoices,
  };
}
