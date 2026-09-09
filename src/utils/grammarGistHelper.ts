export interface GrammarGist {
  category: string;
  badge: string;
  corePoint?: string; // 핵심 문법 포인트
  coreGist: string; // 핵심 요점
  ruleFormula: string; // 3초 판별 공식
  examTrap: string; // 출제 함정 & 오답 패턴
  actionTip: string; // 본문 적용 및 검토 팁
}

export type GrammarPointDetail = GrammarGist;

/**
 * High school CSAT & School Exam Grammar Point Dictionary & Intelligent Analyzer
 */
export function getGrammarPointDetail(grammarPointText: string, contextSentence?: string): GrammarPointDetail {
  return getGrammarGist(grammarPointText, contextSentence);
}

export function getGrammarGist(grammarPointText: string, contextSentence?: string): GrammarGist {
  const text = grammarPointText.toLowerCase();

  // 1. 관계대명사 / 관계사 / that vs what
  if (
    text.includes('관계대명사') ||
    text.includes('관계사') ||
    text.includes('관계부사') ||
    text.includes('that vs what') ||
    text.includes('who') ||
    text.includes('which')
  ) {
    const isSubjective = text.includes('주격') || text.includes('who');
    const isObjective = text.includes('목적격');
    return {
      category: isSubjective ? '주격 관계대명사' : isObjective ? '목적격 관계대명사' : '관계사 / 접속사 구분',
      badge: '수능 1순위 빈출',
      coreGist: '관계대명사는 [접속사 + 대명사] 역할을 하며, 선행사(명사)를 뒤에서 수식하고 관계사절 내부는 주어 또는 목적어가 빠진 [불완전한 문장]입니다.',
      ruleFormula: '선행사(명사) O + 뒷문장 불완전(주어/목적어 없음) → that / which / who\n선행사(명사) X + 뒷문장 불완전 → what (~하는 것)\n선행사(명사) X + 뒷문장 완전 → 접속사 that',
      examTrap: '선행사가 있는데 what으로 바꿔놓거나, 관계사절 내부에 주어가 이미 있는데 who/which 뒤에 중복 대명사(it/they)를 써놓는 함정이 자주 출제됩니다.',
      actionTip: '관계사 바로 뒤에 동사가 오면 주격, [주어+동사]가 오고 목적어가 없으면 목적격입니다. 계속적 용법(, which / , who) 자리에는 that을 쓸 수 없습니다.'
    };
  }

  // 2. 동사 병렬 구조
  if (text.includes('병렬') || text.includes('parallel') || text.includes('등위접속사') || text.includes('and') && text.includes('동사')) {
    return {
      category: '등위접속사 병렬 구조 (Parallelism)',
      badge: '내신 서술형 단골',
      coreGist: '등위접속사(and, but, or)로 연결되는 요소는 문법적 형태와 품사(시제, to부정사, -ing 등)가 반드시 대등하게 일치해야 합니다.',
      ruleFormula: '주어 + [동사1 (과거형)] ... and + [동사2 (과거형)]\n동명사구(A) and 동명사구(B) / to-V(A) and (to-)V(B)',
      examTrap: '앞선 동사와 거리가 멀리 떨어져 있을 때 뒤쪽 동사를 동명사(-ing)나 현재분사 형태로 슬쩍 왜곡하여 출제합니다. (예: gained ... and *contributing [X] -> contributed [O])',
      actionTip: '접속사 and 뒤의 단어가 누구와 짝을 이루는지 [해석상 주체]를 먼저 찾아서 같은 시제/형태인지 확인하세요.'
    };
  }

  // 3. 분사구문 / 능동 vs 수동
  if (text.includes('분사') || text.includes('participle') || text.includes('능동') || text.includes('수동')) {
    return {
      category: '분사구문 & 능동/수동 판별',
      badge: '어법 단골 킬러',
      coreGist: '분사는 형용사 역할을 하며, 분사구문은 부사절의 접속사와 주어를 생략한 구문입니다. 수식받는 명사(또는 주절의 주어)가 직접 동작을 하면 -ing(현재분사), 당하면 p.p.(과거분사)를 씁니다.',
      ruleFormula: '의미상 주어가 동작을 직접 행함 (능동 + 목적어 수반) → V-ing\n의미상 주어가 동작의 대상이 됨 (수동 + 목적어 없음) → p.p.',
      examTrap: '뒤에 목적어 명사가 있는지 확인하고, 자동사는 수동태(p.p.)가 불가능하다는 점에 유의하세요. (예: regarding, including 등은 전치사처럼 굳어진 분사)',
      actionTip: '주절의 주어를 분사 앞에 넣고 능동으로 해석되는지("~하면서"), 수동으로 해석되는지("~되면서") 문맥을 짚어보세요.'
    };
  }

  // 4. 주어-동사 수일치
  if (text.includes('수일치') || text.includes('단수') || text.includes('복수') || text.includes('agreement')) {
    return {
      category: '주어-동사 수일치 (Subject-Verb Agreement)',
      badge: '수능/내신 최다 출제',
      coreGist: '주어와 동사 사이에 긴 수식어구(전치사구, 관계대명사절, 분사구)가 끼어들어도 본동사의 수는 오직 [진짜 핵심 주어]에 맞추어야 합니다.',
      ruleFormula: '핵심 단수주어 + (전치사구 / 관계절 수식어) + 단수동사 (is / was / -s)\n핵심 복수주어 + (전치사구 / 관계절 수식어) + 복수동사 (are / were / 원형)',
      examTrap: '동사 바로 앞의 명사가 복수형(예: growers of *Texas*)이라고 해서 동사를 단수로 착각하게 만들거나, 단수 명사 뒤에 복수동사를 두는 함정입니다.',
      actionTip: '문장의 첫 명사를 찾고, 괄호()로 수식어구를 묶어 지워내면 주어와 동사 뼈대만 남아 수일치가 바로 보입니다.'
    };
  }

  // 5. 전치사 + 동명사 / 숙어
  if (text.includes('전치사') || text.includes('동명사') || text.includes('by -ing') || text.includes('by eating') || text.includes('contribute to')) {
    return {
      category: '전치사의 목적어 (전치사 + 동명사/-ing)',
      badge: '기초 필수 어법',
      coreGist: '전치사(by, in, on, at, to, without 등) 뒤에는 동사원형이 올 수 없으며, 반드시 명사 또는 동명사(-ing)가 목적어로 옵니다.',
      ruleFormula: 'by + V-ing : ~함으로써 (수단/방법)\nwithout + V-ing : ~하지 않고서\nin + V-ing : ~하는 데 있어서 / ~할 때\ncontribute to + [명사/동명사] : ~에 기여하다 (여기서 to는 전치사)',
      examTrap: 'to부정사의 to와 전치사 to를 혼동시켜 동사원형을 쓰도록 유도하는 패턴(예: look forward to -ing, object to -ing, contribute to -ing)이 대표적입니다.',
      actionTip: 'to 뒤에 목적어(명사)가 자연스럽게 붙는 표현인지 점검하세요.'
    };
  }

  // 6. 가주어 - 진주어 / 가목적어
  if (text.includes('가주어') || text.includes('진주어') || text.includes('가목적어') || text.includes('it ~ that') || text.includes('it ~ to')) {
    return {
      category: '가주어·가목적어 it 구문',
      badge: '서술형 영작 1순위',
      coreGist: '주어나 목적어 자리에 to부정사나 that절이 와서 너무 길어질 때, 그 자리에 형식적인 it을 두고 진짜 내용(to-V / that절)은 문장 뒤로 보냅니다.',
      ruleFormula: 'It(가주어) + be동사 + 형용사 + to-V / that절 (진주어)\n주어 + make / find / think / consider + it(가목적어) + 형용사(목적보어) + to-V (진목적어)',
      examTrap: '가주어/가목적어 it 자리에 this나 that을 쓰면 틀립니다. 또한 가목적어 뒤 목적보어 자리에 부사를 쓰면 오답입니다(형용사 필수).',
      actionTip: '문두의 it이 가리키는 대상이 앞 문장에 없다면 뒤쪽에 to부정사나 that절이 진주어로 있는지 확인하세요.'
    };
  }

  // 7. 사역동사 / 지각동사 / 5형식 목적격보어
  if (text.includes('사역동사') || text.includes('지각동사') || text.includes('목적격보어') || text.includes('5형식') || text.includes('force')) {
    return {
      category: '5형식 목적격 보어의 형태',
      badge: '내신 문법 단골',
      coreGist: '동사의 종류(사역/지각/일반 유도동사)와 목적어의 능동/수동 관계에 따라 목적격보어의 형태(동사원형, to-V, -ing, p.p.)가 엄격히 결정됩니다.',
      ruleFormula: 'force / cause / enable / allow / persuade + O + to-V (강제·유도동사)\nmake / have / let + O + 동사원형 (사역동사)\nsee / hear / watch + O + 동사원형 / -ing (지각동사)\n목적어가 당하는 입장이면 동사 종류 불문 p.p.',
      examTrap: 'force A to-V 구조에서 to-V 자리에 동사원형이나 동명사를 써놓는 형태가 가장 흔한 오답입니다.',
      actionTip: '동사가 일반 미래지향 유도동사인지, 사역동사인지 확인하고 목적어와 보어의 의미상 주술 관계를 따지세요.'
    };
  }

  // 8. 시제 (대과거 had p.p. / 완료 시제)
  if (text.includes('시제') || text.includes('had p.p') || text.includes('과거완료') || text.includes('대과거') || text.includes('현재완료')) {
    return {
      category: '완료 시제 & 대과거 (had + p.p.)',
      badge: '흐름/순서 어법',
      coreGist: '기준이 되는 과거 시점보다 [더 이전에 일어난 일]을 명시하여 사건의 선후 관계를 분명하게 드러낼 때 had + p.p.(과거완료)를 씁니다.',
      ruleFormula: '대과거 (had + p.p.) ──먼저 발생──> 기준 과거 (과거동사) ──나중 발생\n현재완료 (have/has + p.p.) : 과거의 동작이 현재까지 지속/영향',
      examTrap: '단순 과거 시제로도 충분한 곳에 had p.p.를 오남용하거나, 분명히 더 먼저 일어난 원인 사건인데 단순 현재/과거로 뭉개는 오류를 묻습니다.',
      actionTip: '문맥상 어느 사건이 시간상 먼저 일어났는지 타임라인을 그려보세요.'
    };
  }

  // 9. to부정사의 다양한 용법 (명사적/형용사적/부사적)
  if (text.includes('to부정사') || text.includes('to 부정사') || text.includes('infinitive') || text.includes('to-v')) {
    return {
      category: 'to부정사의 역할 (명사/형용사/부사적 용법)',
      badge: '수능 기초·심화 필수',
      coreGist: 'to부정사는 문맥에 따라 주어/목적어/보어(명사적), 명사 수식(형용사적), 목적/원인/결과(부사적)로 다양하게 쓰입니다.',
      ruleFormula: '명사 수식: 명사 + to-V (~할 명사)\n목적 부사: in order to-V / so as to-V (~하기 위하여)\n동사 목적어: want, decide, promise, refuse + to-V',
      examTrap: '동명사를 목적어로 취하는 동사(enjoy, avoid, suggest 등)와 to부정사를 취하는 동사를 뒤바꾸어 출제하는 패턴을 주의하세요.',
      actionTip: 'to부정사 앞에 수식할 명사가 있는지, 혹은 동사의 목적어 자리인지 문장 위치를 먼저 파악하세요.'
    };
  }

  // 10. 수동태 (be + p.p.)
  if (text.includes('수동태') || text.includes('수동') || text.includes('passive') || text.includes('be p.p')) {
    return {
      category: '수동태 문형 (be + p.p.)',
      badge: '어법 1순위 빈출',
      coreGist: '주어가 동작의 주체가 아니라 대상(수혜자/피해자)일 때 be + 과거분사(p.p.)로 표현하며, 일반적으로 뒤에 목적어 명사가 남지 않습니다.',
      ruleFormula: '능동태: 주어(행위자) + 타동사 + 목적어(대상)\n수동태: 목적어(대상) + be + p.p. (+ by 행위자 [생략 가능])',
      examTrap: '목적어를 가질 수 없는 자동사(occur, happen, appear, disappear, consist of)는 절대 수동태(be occurred 등)로 쓸 수 없습니다.',
      actionTip: '주어가 스스로 동작을 하는지(능동), 동작을 받는지(수동) 주어와 동사의 관계를 따져보세요.'
    };
  }

  // 11. 가정법 (가정법 과거 / 과거완료)
  if (text.includes('가정법') || text.includes('subjunctive') || text.includes('without') && text.includes('가정')) {
    return {
      category: '가정법 (현재·과거 사실의 반대)',
      badge: '내신 킬러 & 서술형',
      coreGist: '현재나 과거의 사실과 반대되는 상상, 가정, 소망을 표현할 때 시제를 한 단계 과거로 후퇴시켜 표현합니다.',
      ruleFormula: '가정법 과거: If + S + 과거동사(were), S + would/could + 동사원형 (현재 사실 반대)\n가정법 과거완료: If + S + had p.p., S + would/could + have p.p. (과거 사실 반대)',
      examTrap: 'If절과 주절의 시제 짝맞추기(If had p.p.인데 주절에 would 원형을 쓰는 오류 등, 단 혼합가정법 제외)가 단골 출제됩니다.',
      actionTip: 'If절의 동사 형태와 주절의 조동사(would/could) 뒤 형태가 일치하는지 먼저 공식으로 대조하세요.'
    };
  }

  // 12. 도치 구문 (부정어 도치 / 장소부사구 도치)
  if (text.includes('도치') || text.includes('inversion') || text.includes('부정어')) {
    return {
      category: '도치 구문 (Inversion)',
      badge: '핵심 어순 어법',
      coreGist: '문두에 부정어(Never, Seldom, Little, Not only 등)나 장소·방향 부사구가 강조를 위해 나갈 때 [동사 + 주어]로 어순이 역전됩니다.',
      ruleFormula: '부정어 문두: 부정어 + [조동사/do/be] + 주어 + 동사원형 (의문문 어순!)\n장소부사구 문두: 장소전치사구 + 일반동사 + 주어 (단순 도치)',
      examTrap: '부정어 도치 시 일반동사를 주어 앞으로 바로 보내는 오류(예: *Little knew he [X] -> Little did he know [O])가 빈출됩니다.',
      actionTip: '문두가 Not, Never, Hardly, Only 등으로 시작하면 주어보다 조동사/be동사가 먼저 나왔는지 의문문 어순을 확인하세요.'
    };
  }

  // 13. 간접의문문 (의문사 + 주어 + 동사)
  if (text.includes('간접의문문') || text.includes('의문사절') || text.includes('의문사')) {
    return {
      category: '간접의문문 명사절 (어순 주의)',
      badge: '중·고등 공통 필수',
      coreGist: '의문문이 다른 문장의 목적어나 주어 등 명사절로 안길 때는 의문문 어순이 아니라 평서문 어순 [의문사 + 주어 + 동사]로 바뀝니다.',
      ruleFormula: '주절 동사 + [의문사 + 주어 + 동사 (평서문 어순)]\n예: I wonder [what he wants] (O) vs [what does he want] (X)',
      examTrap: '간접의문문 자리에 do, does, did와 같은 의문문 조동사를 그대로 남겨두어 출제합니다.',
      actionTip: '의문사 바로 뒤에 동사가 아닌 주어 명사가 먼저 나오는지 어순을 체크하세요.'
    };
  }

  // 14. 조동사 + have p.p.
  if (text.includes('조동사') || text.includes('should have') || text.includes('must have') || text.includes('cannot have')) {
    return {
      category: '조동사 + have p.p. (과거에 대한 추측/후회)',
      badge: '어휘·문법 복합 빈출',
      coreGist: '과거 사실에 대한 화자의 추측, 가능성, 후회, 유감을 나타낼 때 [조동사 + have p.p.]를 사용합니다.',
      ruleFormula: 'should have p.p. : ~했어야 했는데 (안 해서 후회)\nmust have p.p. : ~했음에 틀림없다 (확신에 찬 과거 추측)\ncannot have p.p. : ~했을 리가 없다 (부정적 확신)',
      examTrap: 'should have p.p.(후회)와 must have p.p.(강한 확신)의 문맥적 의미 차이를 묻는 문제가 자주 출제됩니다.',
      actionTip: '문맥에서 화자가 과거의 행동에 대해 아쉬워하는지, 아니면 확신을 갖고 추측하는지 글의 어조를 살피세요.'
    };
  }

  // 15. 비교급 구문 (the 비교급, 원급비교)
  if (text.includes('비교') || text.includes('comparative') || text.includes('the 비교급') || text.includes('as ~ as')) {
    return {
      category: '비교 구문 (The 비교급 / 원급 비교)',
      badge: '서술형 영작 단골',
      coreGist: '비교급은 두 대상을 비교하여 우열이나 비례 관계를 드러내며, 비교 대상은 문법적·의미적으로 대등해야 합니다.',
      ruleFormula: 'The + 비교급 ..., the + 비교급 ... : ~하면 할수록 더욱더 ~하다\nas + 형용사/부사 원형 + as : ~만큼 ~한/하게\n비교급 + than : ~보다 더 ~한',
      examTrap: 'as ~ as 사이에 비교급(-er, more)을 집어넣거나, 비교 대상의 품사/격(that of, those of)을 일치시키지 않는 오류가 빈출됩니다.',
      actionTip: 'the 비교급 뒤에는 주어+동사가 이어지며, 비교 대상인 두 명사의 수가 일치하는지 대명사(that/those)를 확인하세요.'
    };
  }

  // 16. 동격 that vs 관계대명사 that
  if (text.includes('동격') || text.includes('that') && text.includes('접속사')) {
    return {
      category: '동격의 that vs 관계대명사 that',
      badge: '수능 어법 킬러',
      coreGist: '추상명사(fact, idea, news, belief, evidence 등) 뒤의 that은 뒷문장이 완전할 때 명사의 구체적 내용을 보충 설명하는 [동격 접속사]입니다.',
      ruleFormula: '동격 that: 추상명사 + that + 완전한 문장 (주어+동사+목적어 모두 갖춤)\n관계대명사 that: 선행사 명사 + that + 불완전한 문장 (주어/목적어 빠짐)',
      examTrap: '동격 that 자리에 위치(which)를 대신 써놓는 함정이 매우 빈번하게 출제됩니다.',
      actionTip: 'that 뒤 문장의 뼈대(S, V, O/C)가 완전히 갖추어져 있는지 가장 먼저 성분을 분석하세요.'
    };
  }

  // 17. 대명사의 수일치 (that vs those, it vs them)
  if (text.includes('대명사') || text.includes('it vs them') || text.includes('that vs those') || text.includes('재귀대명사')) {
    return {
      category: '대명사의 일치 (수일치 & 재귀대명사)',
      badge: '수능 빈출',
      coreGist: '대명사는 가리키는 대상(지칭 명사)의 수(단수/복수)와 성, 격에 정확히 일치해야 하며, 주어와 목적어가 같을 때는 재귀대명사를 씁니다.',
      ruleFormula: '단수 명사 지칭 → it, its / that of\n복수 명사 지칭 → they, them, their / those of\n주어 = 목적어 (동일인) → -self / -selves',
      examTrap: '앞의 복수 명사를 받아 비교할 때 that of(단수)를 써놓거나, 주어와 같은 대상을 일반 목적격 him/them으로 써놓는 함정을 주의하세요.',
      actionTip: '대명사가 가리키는 본래 명사가 단수인지 복수인지 앞 문맥에서 명확히 찾아 대입해 보세요.'
    };
  }

  // Default fallback for any other custom grammar point
  return {
    category: '핵심 문법 및 구문 해석 포인트',
    badge: '어법 핵심 정리',
    coreGist: grammarPointText,
    ruleFormula: '문장의 주어와 본동사를 찾고, 수식 거품(전치사구/수식절)을 걷어내면 문법적 인과관계가 명확해집니다.',
    examTrap: '수능 어법은 항상 [자리 찾기(동사 vs 준동사)], [모양 일치(수일치/병렬)], [관계 짓기(능동/수동, that/what)]의 3대 축에서 출제됩니다.',
    actionTip: '이 구문이 문장의 뼈대 성분(S, V, O, C)인지 수식어(M)인지 파악하고 문맥 속에서 정확한 의미를 해석하세요.'
  };
}
