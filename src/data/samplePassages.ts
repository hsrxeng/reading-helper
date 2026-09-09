import { PassageAnalysisResult, SuneungAnalysis } from '../types';

export interface SamplePassage {
  id: string;
  title: string;
  grade: string;
  passage: string;
  presetAnalysis: PassageAnalysisResult;
  suneungData?: {
    questionPrompt: string;
    choices: [string, string, string, string, string];
    suneungAnalysis: SuneungAnalysis;
  };
}

export const SAMPLE_PASSAGES: SamplePassage[] = [
  {
    id: 'g1-2026-09-31',
    title: '고1 2026년 9월 학평 31번: 음식 취향의 사회적 본질 (Our tastes are social)',
    grade: '고1',
    passage: `Our tastes are social. Even when you first drank milk, there was the milk, yes, but there was also the person behind the milk who will have presumably either made or messed up your relationship with food for the couple of decades after that. We learn to eat from our families and friends, at school and in work. Our food choices reflect the relationships we have, and tastes spread from person to person like viruses, often irrespective of the food's actual qualities.`,
    presetAnalysis: {
      title: '고1 2026년 9월 31번: 음식 취향의 사회적 형성과 전파',
      gradeLevel: '고1 모의고사',
      summary: '우리의 음식 취향은 음식 자체의 물리적 속성에 국한되지 않고, 유아기 우유를 주던 보호자부터 가족, 친구 등 사회적 관계 속에서 상호작용하며 형성된다.',
      sentences: [
        {
          sentenceNumber: 1,
          originalText: 'Our tastes are social.',
          sentencePattern: '2형식 (S + V + C)',
          tokens: [
            { text: 'Our tastes', role: 'S', pos: 'noun', tagTop: '주어 [명사구]', meaning: '우리의 취향은' },
            { text: 'are', role: 'V', pos: 'verb', tagTop: '연결동사 [서술어]', meaning: '이다' },
            { text: 'social.', role: 'C', pos: 'adjective', tagTop: '주격보어 [형용사]', meaning: '사회적인' },
          ],
          directTranslation: 'Our tastes / are social.\n(우리의 취향은 / 사회적이다.)',
          polishedTranslation: '우리의 입맛과 취향은 사회적인 성격을 띤다.',
          grammarPoints: [
            '2형식 주격보어: be동사(are) 뒤 형용사 보어 social',
            '핵심 주제문 (Topic Sentence): 글 전체의 중심 논지를 집약적으로 제시'
          ],
          vocabulary: [
            { word: 'taste', meaning: '입맛, 취향, 기호' },
            { word: 'social', meaning: '사회적인, 관계적인' }
          ]
        },
        {
          sentenceNumber: 2,
          originalText: 'Even when you first drank milk, there was the milk, yes, but there was also the person behind the milk who will have presumably either made or messed up your relationship with food for the couple of decades after that.',
          sentencePattern: '1형식 (유도부사 there was 대등절 병렬 + 관계사절)',
          tokens: [
            { text: '[Even when you first drank milk],', role: 'M', pos: 'adverb', tagTop: '시간 부사절', meaning: '처음 우유를 마셨을 때조차도', clauseType: 'adverb' },
            { text: 'there was', role: 'V', pos: 'verb', tagTop: '유도부사 술어동사', meaning: '있었다' },
            { text: 'the milk,', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '우유가' },
            { text: 'yes,', role: 'M', pos: 'adverb', tagTop: '삽입어구', meaning: '그렇다' },
            { text: 'but', role: '', pos: 'other', tagTop: '등위접속사', meaning: '하지만' },
            { text: 'there was', role: 'V', pos: 'verb', tagTop: '술어동사', meaning: '있었다' },
            { text: 'also', role: 'M', pos: 'adverb', tagTop: '부사', meaning: '또한' },
            { text: 'the person', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '그 사람이' },
            { text: '(behind the milk)', role: 'M', pos: 'noun', tagTop: '전치사구', meaning: '우유 이면에 있는', clauseType: 'prepositional' },
            { text: '[who will have presumably', role: "S'", pos: 'other', tagTop: '주격관계대명사', meaning: '아마도 ~했을', clauseType: 'relative' },
            { text: 'either made or messed up', role: "V'", pos: 'verb', tagTop: '상관접속사 병렬', meaning: '형성하거나 망쳤을', clauseType: 'relative' },
            { text: 'your relationship', role: "O'", pos: 'noun', tagTop: '목적어 [명사]', meaning: '당신의 관계를', clauseType: 'relative' },
            { text: '(with food)', role: "M'", pos: 'noun', tagTop: '전치사구', meaning: '음식과의', clauseType: 'prepositional' },
            { text: '(for the couple of decades', role: "M'", pos: 'noun', tagTop: '시간 부사구', meaning: '두어 세월 동안', clauseType: 'prepositional' },
            { text: 'after that)].', role: "M'", pos: 'other', tagTop: '전치사구', meaning: '그 후로', clauseType: 'prepositional' }
          ],
          directTranslation: 'Even when you first drank milk, / there was the milk, yes, / but there was also the person behind the milk / [who will have presumably either made or messed up your relationship with food / for the couple of decades after that].\n(처음 우유를 마셨을 때조차도, / 우유가 있었습니다, 그렇습니다, / 하지만 우유 이면에 사람이 또한 있었습니다 / [그 후 수십 년 동안 음식과의 관계를 만들었거나 망쳤을지 모르는].)',
          polishedTranslation: '처음 우유를 마셨을 때조차도 우유 자체가 존재했지만, 그 우유 뒤에는 그 후 수십 년간 여러분과 음식의 관계를 긍정적으로 형성했거나 망쳐 놓았을 사람 또한 존재했습니다.',
          grammarPoints: [
            '유도부사 구문: there was + 주어(the milk / the person)',
            '주격 관계대명사 who절: 선행사 the person behind the milk 수식',
            '상관접속사: either A or B (made or messed up 병렬)',
            '추측 완료 표현: will have p.p. (~했을 것이다)'
          ],
          vocabulary: [
            { word: 'presumably', meaning: '짐작건대, 아마도' },
            { word: 'mess up', meaning: '망치다, 엉망으로 만들다' },
            { word: 'relationship with', meaning: '~와의 관계' },
            { word: 'a couple of decades', meaning: '20여 년, 수십 년' }
          ]
        },
        {
          sentenceNumber: 3,
          originalText: 'We learn to eat from our families and friends, at school and in work.',
          sentencePattern: '3형식 (S + V + O + 부사구 병렬)',
          tokens: [
            { text: 'We', role: 'S', pos: 'noun', tagTop: '주어 [대명사]', meaning: '우리는' },
            { text: 'learn', role: 'V', pos: 'verb', tagTop: '본동사 [서술어]', meaning: '배운다' },
            { text: '<to eat>', role: 'O', pos: 'verb', tagTop: 'to부정사 목적어', meaning: '먹는 법을', clauseType: 'noun' },
            { text: '(from our families and friends),', role: 'M', pos: 'noun', tagTop: '전치사구(출처)', meaning: '가족과 친구들로부터', clauseType: 'prepositional' },
            { text: '(at school and in work).', role: 'M', pos: 'noun', tagTop: '장소 부사구 병렬', meaning: '학교와 직장에서', clauseType: 'prepositional' }
          ],
          directTranslation: 'We learn to eat / from our families and friends, / at school and in work.\n(우리는 먹는 것을 배운다 / 가족과 친구들로부터, / 학교와 직장에서.)',
          polishedTranslation: '우리는 가족과 친구로부터, 그리고 학교와 직장에서 식사하는 방식을 배웁니다.',
          grammarPoints: [
            'learn + to부정사: ~하는 법을 배우다 (3형식 목적어)',
            '전치사구 병렬: from our families and friends, at school and in work'
          ],
          vocabulary: [
            { word: 'learn to V', meaning: '~하는 법을 배우다' }
          ]
        },
        {
          sentenceNumber: 4,
          originalText: "Our food choices reflect the relationships we have, and tastes spread from person to person like viruses, often irrespective of the food's actual qualities.",
          sentencePattern: '중문 (등위접속사 and로 연결된 두 개의 3형식/1형식 절)',
          tokens: [
            { text: 'Our food choices', role: 'S', pos: 'noun', tagTop: '주어 [명사구]', meaning: '우리의 음식 선택은' },
            { text: 'reflect', role: 'V', pos: 'verb', tagTop: '본동사 [서술어]', meaning: '반영한다' },
            { text: 'the relationships', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '관계들을' },
            { text: '[we have],', role: "M'", pos: 'noun', tagTop: '목적격관계사절', meaning: '우리가 맺고 있는', clauseType: 'relative' },
            { text: 'and', role: '', pos: 'other', tagTop: '등위접속사', meaning: '그리고' },
            { text: 'tastes', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '입맛은' },
            { text: 'spread', role: 'V', pos: 'verb', tagTop: '본동사 [서술어]', meaning: '퍼져나간다' },
            { text: '(from person to person)', role: 'M', pos: 'noun', tagTop: '부사구', meaning: '사람에서 사람으로', clauseType: 'prepositional' },
            { text: '(like viruses),', role: 'M', pos: 'noun', tagTop: '비유 전치사구', meaning: '바이러스처럼', clauseType: 'prepositional' },
            { text: '[often irrespective of', role: 'M', pos: 'other', tagTop: '전치사구 [양보/독립]', meaning: '~와는 상관없이', clauseType: 'prepositional' },
            { text: "the food's", role: 'M', pos: 'noun', tagTop: '소유격', meaning: '음식의' },
            { text: 'actual qualities].', role: 'M', pos: 'noun', tagTop: '전치사 목적어', meaning: '실제 품질과', clauseType: 'prepositional' }
          ],
          directTranslation: "Our food choices reflect the relationships [we have], / and tastes spread from person to person like viruses, / [often irrespective of the food's actual qualities].\n(우리의 음식 선택은 우리가 맺은 관계를 반영하며, / 입맛은 바이러스처럼 사람에게서 사람으로 전파된다, / [음식의 실제 품질과는 관계없이 흔히].)",
          polishedTranslation: '우리의 음식 선택은 우리가 맺고 있는 관계를 반영하며, 입맛은 음식의 실제 특성과는 관계없이 바이러스처럼 사람과 사람 사이로 퍼져나갑니다.',
          grammarPoints: [
            '목적격 관계대명사 생략: the relationships [(which/that) we have]',
            'irrespective of + 명사구: ~에 상관없이 (= regardless of)',
            '비유적 표현: like viruses (사회적 전파력 강조)'
          ],
          vocabulary: [
            { word: 'reflect', meaning: '반영하다, 나타내다' },
            { word: 'spread', meaning: '퍼지다, 전파되다' },
            { word: 'irrespective of', meaning: '~에 상관없이, 개의치 않고' },
            { word: 'actual quality', meaning: '실제 속성/품질' }
          ]
        }
      ]
    },
    suneungData: {
      questionPrompt: '31. 다음 글의 빈칸에 들어갈 말로 가장 적절한 것은? [3점]',
      choices: [
        'social',
        'fixed',
        'simple',
        'objective',
        'biological'
      ],
      suneungAnalysis: {
        questionType: '빈칸추론 (Blank Inference)',
        questionPrompt: '31. 다음 글의 빈칸에 들어갈 말로 가장 적절한 것은? [3점]',
        correctChoiceNumber: 1,
        clueSentenceNumbers: [2, 3, 4],
        coreLogicSummary: '음식 취향은 유아기 젖을 주던 보호자와의 관계부터 가족, 친구, 학교 등 타인과의 사회적 상호작용 속에서 전달되고 바이러스처럼 전염된다고 설명하므로, 빈칸의 정답은 ① social(사회적인)입니다.',
        passageFlow: {
          topicIntro: '우리의 입맛과 취향은 [사회적]이라는 핵심 주제문 제시',
          development: '최초의 우유 섭취 사례: 우유 자체보다 우유를 건넨 사람과의 관계가 평생의 음식 취향을 좌우함',
          turningPoint: '가족, 친구, 학교, 직장 등 사회적 환경을 통한 식습관의 전수와 습득',
          conclusion: '음식 선택은 인간관계를 반영하며, 입맛은 음식 자체 속성과 무관하게 바이러스처럼 사람 사이에 전염됨'
        },
        choices: [
          {
            number: 1,
            text: 'social',
            isCorrect: true,
            analysis: '정답: 사람과 사람 사이의 관계(person behind the milk, families, friends, from person to person)를 통해 전염되듯 형성된다는 본문 전체의 일관된 핵심 키워드입니다.'
          },
          {
            number: 2,
            text: 'fixed',
            isCorrect: false,
            analysis: '오답(정반대 함정): 취향은 사람 간 관계와 학습에 따라 끊임없이 변화하고 전파된다고 설명하므로 고정되어 있다는 진술은 본문 논리와 정반대입니다.'
          },
          {
            number: 3,
            text: 'simple',
            isCorrect: false,
            analysis: '오답(본문 무관): 취향 형성 과정의 단순함 여부는 본문에서 논의되지 않았습니다.'
          },
          {
            number: 4,
            text: 'objective',
            isCorrect: false,
            analysis: '오답(정반대 왜곡): 마지막 문장에서 "음식의 실제 객관적 속성과는 무관하게(irrespective of the food\'s actual qualities)" 사람 간 관계로 결정된다고 명시했으므로 객관적이라는 선지는 왜곡입니다.'
          },
          {
            number: 5,
            text: 'biological',
            isCorrect: false,
            analysis: '오답(매력적 오답): 우유와 미각 등 생물학적 소재가 언급되었으나, 글의 요지는 생물학적 본능이 아니라 사람과의 관계에서 학습되는 사회적 측면입니다.'
          }
        ],
        paraphrasePairs: [
          {
            passageExpr: 'the person behind the milk ... families and friends ... from person to person',
            choiceExpr: 'social'
          },
          {
            passageExpr: 'irrespective of the food\'s actual qualities',
            choiceExpr: 'not objective / not fixed'
          }
        ]
      }
    }
  },
  {
    id: 'g2-popeye',
    title: '고2 대표 지문: 뽀빠이와 시금치 일화',
    grade: '고2',
    passage: `Popeye, who gained superhuman strength and defended himself by eating spinach, contributed greatly to its endurance in popular culture. In the 1930s, the spinach growers of Texas even erected a statue of Popeye in Crystal City. However, a famous calculation error made in 1870 regarding the iron content in spinach had misled generations of parents into forcing their children to eat it.`,
    presetAnalysis: {
      title: '고2 대표 예시: 뽀빠이와 시금치 속 철분 함량 오류',
      gradeLevel: '고2 모의고사',
      summary: '뽀빠이 캐릭터가 시금치의 대중적 인기에 기여했으나, 부모들이 시금치를 강요하게 된 배경에는 1870년 철분 수치 계산 착오가 있었다.',
      sentences: [
        {
          sentenceNumber: 1,
          originalText: 'Popeye, who gained superhuman strength and defended himself by eating spinach, contributed greatly to its endurance in popular culture.',
          sentencePattern: '1형식 (S + V + M)',
          tokens: [
            { text: 'Popeye,', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '뽀빠이는' },
            { text: '[who', role: "S'", pos: 'other', tagTop: '주격관계대명사', meaning: '~했던', clauseType: 'relative' },
            { text: 'gained', role: "V'1", pos: 'verb', tagTop: '동사 [서술어]', meaning: '얻었고', clauseType: 'relative' },
            { text: 'superhuman', role: "M'", pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '초인적인', clauseType: 'relative' },
            { text: 'strength', role: "O'1", pos: 'noun', tagTop: '목적어 [명사]', meaning: '힘을', clauseType: 'relative' },
            { text: 'and', role: '', pos: 'other', tagTop: '등위접속사', meaning: '그리고', clauseType: 'relative' },
            { text: 'defended', role: "V'2", pos: 'verb', tagTop: '동사 [서술어]', meaning: '지켜냈다', clauseType: 'relative' },
            { text: 'himself', role: "O'2", pos: 'noun', tagTop: '재귀대명사 [명사]', meaning: '자신을', clauseType: 'relative' },
            { text: '(by eating', role: "M'", pos: 'verb', tagTop: '전치사+동명사', meaning: '먹음으로써', clauseType: 'prepositional' },
            { text: 'spinach)],', role: "M'", pos: 'noun', tagTop: '동명사 목적어 [명사]', meaning: '시금치를', clauseType: 'prepositional' },
            { text: 'contributed to', role: 'V', pos: 'verb', tagTop: '본동사 [서술어]', meaning: '~에 기여했다' },
            { text: 'greatly', role: 'M', pos: 'adverb', tagTop: '양태부사 [부사]', meaning: '크게' },
            { text: 'its endurance', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '그것의 지속성에' },
            { text: '(in', role: 'M', pos: 'other', tagTop: '전치사', meaning: '~에서', clauseType: 'prepositional' },
            { text: 'popular', role: 'M', pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '대중적인', clauseType: 'prepositional' },
            { text: 'culture).', role: 'M', pos: 'noun', tagTop: '명사구 [명사]', meaning: '문화 속에서', clauseType: 'prepositional' }
          ],
          directTranslation: 'Popeye, / [who gained superhuman strength and defended himself by eating spinach], / contributed greatly to its endurance / in popular culture.\n(뽀빠이는, / [시금치를 먹음으로써 초인적인 힘을 얻고 자신을 지켜냈던], / 그것의 지속성에 크게 기여했다 / 대중문화 속에서.)',
          polishedTranslation: '시금치를 먹음으로써 초인적인 힘을 얻고 자신을 지켜냈던 뽀빠이는 대중문화에서 시금치가 오래 사랑받는 데 크게 기여했다.',
          grammarPoints: [
            '주격 관계대명사절 [who ~ spinach]이 주어 Popeye를 수식하는 계속적/수식 구조',
            '동사 병렬 구조: gained(V\'1) and defended(V\'2)',
            'by + -ing: ~함으로써 (수단/방법)',
            'contribute to + 명사구: ~에 기여하다'
          ],
          vocabulary: [
            { word: 'superhuman', meaning: '초인적인' },
            { word: 'defend oneself', meaning: '자신을 방어하다, 지키다' },
            { word: 'contribute to', meaning: '~에 기여하다, 공헌하다' },
            { word: 'endurance', meaning: '지속, 인내' }
          ]
        },
        {
          sentenceNumber: 2,
          originalText: 'In the 1930s, the spinach growers of Texas even erected a statue of Popeye in Crystal City.',
          sentencePattern: '3형식 (S + V + O)',
          tokens: [
            { text: '(In the 1930s),', role: 'M', pos: 'adverb', tagTop: '시간 부사구 [부사]', meaning: '1930년대에', clauseType: 'adverb' },
            { text: 'the spinach', role: 'S', pos: 'noun', tagTop: '명사 수식', meaning: '시금치' },
            { text: 'growers', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '재배자들은' },
            { text: 'of Texas', role: 'M', pos: 'noun', tagTop: '전치사구', meaning: '텍사스의', clauseType: 'prepositional' },
            { text: 'even', role: 'M', pos: 'adverb', tagTop: '강조 부사 [부사]', meaning: '심지어' },
            { text: 'erected', role: 'V', pos: 'verb', tagTop: '과거동사 [서술어]', meaning: '건립했다' },
            { text: 'a statue', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '조각상을' },
            { text: 'of Popeye', role: 'M', pos: 'noun', tagTop: '명사수식', meaning: '뽀빠이의' },
            { text: '(in Crystal City).', role: 'M', pos: 'noun', tagTop: '장소 부사구', meaning: '크리스털 시티에', clauseType: 'prepositional' }
          ],
          directTranslation: 'In the 1930s, / the spinach growers of Texas / even erected a statue of Popeye / in Crystal City.\n(1930년대에, / 텍사스의 시금치 재배자들은 / 심지어 뽀빠이 동상을 세웠다 / 크리스털 시티에.)',
          polishedTranslation: '1930년대에 텍사스의 시금치 재배 농민들은 심지어 크리스털 시티에 뽀빠이 동상을 세우기까지 했다.',
          grammarPoints: [
            '단순 과거 시제 능동태 3형식 문장 (S + V + O)',
            '명사구 수식: growers [of Texas], statue [of Popeye]'
          ],
          vocabulary: [
            { word: 'grower', meaning: '재배자, 농가' },
            { word: 'erect', meaning: '세우다, 건립하다' },
            { word: 'statue', meaning: '조각상, 동상' }
          ]
        },
        {
          sentenceNumber: 3,
          originalText: 'However, a famous calculation error made in 1870 regarding the iron content in spinach had misled generations of parents into forcing their children to eat it.',
          sentencePattern: '5형식 변형 (S + V + O + 전치사구)',
          tokens: [
            { text: 'However,', role: 'M', pos: 'adverb', tagTop: '접속부사 [부사]', meaning: '그러나' },
            { text: 'a famous', role: 'M', pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '한 유명한' },
            { text: 'calculation error', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '계산 오류는' },
            { text: '[made in 1870]', role: "M'", pos: 'adjective', tagTop: '과거분사구 [형용사]', meaning: '1870년에 발생한', clauseType: 'relative' },
            { text: '(regarding', role: "M'", pos: 'other', tagTop: '전치사', meaning: '~에 관한', clauseType: 'prepositional' },
            { text: 'the iron', role: "M'", pos: 'noun', tagTop: '명사 수식', meaning: '철분', clauseType: 'prepositional' },
            { text: 'content', role: "M'", pos: 'noun', tagTop: '명사 [명사]', meaning: '함량', clauseType: 'prepositional' },
            { text: 'in spinach)', role: "M'", pos: 'noun', tagTop: '전치사구', meaning: '시금치 속의', clauseType: 'prepositional' },
            { text: 'had misled', role: 'V', pos: 'verb', tagTop: '과거완료 [서술어]', meaning: '잘못 이끌었다' },
            { text: 'generations of parents', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '여러 세대의 부모들을' },
            { text: '(into forcing', role: 'M', pos: 'verb', tagTop: '전치사+동명사 [서술어]', meaning: '강요하도록', clauseType: 'prepositional' },
            { text: 'their children', role: 'O', pos: 'noun', tagTop: '동명사의 의미상목적어 [명사]', meaning: '자녀들에게' },
            { text: 'to eat it).', role: 'OC', pos: 'verb', tagTop: '목적격보어 [서술어]', meaning: '그것을 먹도록', clauseType: 'prepositional' }
          ],
          directTranslation: 'However, / a famous calculation error [made in 1870 regarding the iron content in spinach] / had misled generations of parents / into forcing their children to eat it.\n(그러나, / [시금치 철분 함량에 관해 1870년에 저질러진] 유명한 계산 오류는 / 여러 세대의 부모들을 오도했다 / 자녀들에게 그것을 억지로 먹이도록.)',
          polishedTranslation: '그러나 시금치의 철분 함량과 관련해 1870년에 저질러진 한 유명한 계산 오류는 수세대에 걸쳐 부모들이 아이들에게 억지로 시금치를 먹이도록 잘못 이끌었다.',
          grammarPoints: [
            '과거분사 수식: calculation error [made in 1870] (which was made)',
            '전치사 regarding: ~에 관하여 (= about, concerning)',
            '과거완료 시제: had misled (1930년대 이전의 일어난 사건)',
            'mislead A into -ing: A를 속여/잘못 이끌어 ~하게 만들다',
            'force + O + to-V: O가 ~하도록 강요하다'
          ],
          vocabulary: [
            { word: 'calculation error', meaning: '계산 착오/오류' },
            { word: 'regarding', meaning: '~에 관하여' },
            { word: 'iron content', meaning: '철분 함량' },
            { word: 'mislead', meaning: '잘못 인도하다, 오도하다' },
            { word: 'force', meaning: '강요하다, 억지로 시키다' }
          ]
        }
      ]
    },
    suneungData: {
      questionPrompt: '다음 글의 빈칸에 들어갈 말로 가장 적절한 것은? [3점]',
      choices: [
        'historical artifacts preserved by agricultural communities',
        'a dietary misconception caused by a calculation error',
        'the proven biological benefits of natural superfoods',
        'the technological advancement of food canning in Crystal City',
        'parental efforts to encourage creative dietary habits'
      ],
      suneungAnalysis: {
        questionType: '빈칸추론 (Blank Inference)',
        questionPrompt: '다음 글의 빈칸에 들어갈 말로 가장 적절한 것은? [3점]',
        correctChoiceNumber: 2,
        clueSentenceNumbers: [1, 3],
        coreLogicSummary: '뽀빠이 캐릭터를 통해 시금치가 대중적 인기를 얻고 부모들이 아이들에게 억지로 먹이게 된 배경은 1870년에 발생한 철분 함량 계산 착오(calculation error) 때문이었다는 점이 핵심 논리입니다.',
        passageFlow: {
          topicIntro: '뽀빠이 캐릭터와 시금치의 지속적인 대중문화적 인기 소개',
          development: '1930년대 텍사스 재배 농가들이 크리스털 시티에 뽀빠이 동상을 세운 일화',
          turningPoint: 'However로 반전: 1870년 철분 함량 계산 오류 발생',
          conclusion: '수세대에 걸친 부모들이 아이들에게 시금치를 억지로 먹이도록 잘못 이끈 원인 규명'
        },
        choices: [
          {
            number: 1,
            text: 'historical artifacts preserved by agricultural communities',
            isCorrect: false,
            analysis: '오답(본문 무관): 텍사스 농부들이 동상을 세운 사실은 언급되었으나 글의 핵심인 시금치 강요의 원인과는 무관합니다.'
          },
          {
            number: 2,
            text: 'a dietary misconception caused by a calculation error',
            isCorrect: true,
            analysis: '정답: 3번 문장의 calculation error와 misled generations of parents into forcing...의 핵심을 정확히 반영한 식습관 오해(dietary misconception)입니다.'
          },
          {
            number: 3,
            text: 'the proven biological benefits of natural superfoods',
            isCorrect: false,
            analysis: '오답(정반대 진술): 실제로는 계산 착오로 인한 과장된 신화였으므로 입증된 생물학적 이점이라는 진술은 글의 취지와 정반대입니다.'
          },
          {
            number: 4,
            text: 'the technological advancement of food canning in Crystal City',
            isCorrect: false,
            analysis: '오답(과도한 일반화/왜곡): 통조림 기술 발전 등은 본문에 전혀 언급되지 않은 매력적 오답 장치입니다.'
          },
          {
            number: 5,
            text: 'parental efforts to encourage creative dietary habits',
            isCorrect: false,
            analysis: '오답(사실 왜곡): 창의적 식습관 장려가 아니라 억지로 먹이도록 오도(forcing their children)된 상황입니다.'
          }
        ],
        paraphrasePairs: [
          {
            passageExpr: 'calculation error regarding the iron content in spinach',
            choiceExpr: 'a calculation error'
          },
          {
            passageExpr: 'had misled generations of parents into forcing their children to eat it',
            choiceExpr: 'a dietary misconception'
          }
        ]
      }
    }
  },
  {
    id: 'g2-mock-sample',
    title: '고2 2024년 6월 학평 29번: 인간의 모방과 학습',
    grade: '고2',
    passage: `From the earliest times, humans have copied the behaviors of others to master essential skills. Imitation allows individuals to acquire adaptive habits without undergoing costly trial and error. Researchers emphasize that observing skilled models accelerates cognitive development, enabling learners to solve novel problems efficiently.`,
    presetAnalysis: {
      title: '고2 2024년 6월 29번 변형: 인간의 관찰 학습과 모방의 이점',
      gradeLevel: '고2 모의고사',
      summary: '인간은 태초부터 타인의 행동을 모방하여 막대한 시행착오 없이 적응적 기술을 습득하고 인지 발달을 가속해 왔다.',
      sentences: [
        {
          sentenceNumber: 1,
          originalText: 'From the earliest times, humans have copied the behaviors of others to master essential skills.',
          sentencePattern: '3형식 (S + V + O + M)',
          tokens: [
            { text: '(From the earliest times),', role: 'M', pos: 'adverb', tagTop: '전치사구 [부사구]', meaning: '아주 초기부터', clauseType: 'prepositional' },
            { text: 'humans', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '인간은' },
            { text: 'have copied', role: 'V', pos: 'verb', tagTop: '동사 [서술어]', meaning: '모방해 왔다' },
            { text: 'the behaviors', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '행동들을' },
            { text: 'of others', role: 'M', pos: 'noun', tagTop: '전치사구', meaning: '타인들의' },
            { text: '<to master essential skills>.', role: 'M', pos: 'verb', tagTop: 'to부정사(목적) [서술어]', meaning: '필수 기술을 숙달하기 위해', clauseType: 'noun' }
          ],
          directTranslation: 'From the earliest times, / humans have copied / the behaviors of others / to master essential skills.\n(아주 초기부터, / 인간은 모방해 왔다 / 타인들의 행동을 / 필수 기술을 숙달하기 위하여.)',
          polishedTranslation: '태초부터 인간은 필수적인 기술을 습득하기 위해 다른 사람들의 행동을 모방해 왔다.',
          grammarPoints: [
            '현재완료 시제 (have copied): 과거부터 현재까지 이어져 온 지속적 행동',
            'to부정사의 부사적 용법(목적): to master (~하기 위하여)'
          ],
          vocabulary: [
            { word: 'imitation', meaning: '모방' },
            { word: 'master', meaning: '숙달하다, 마스터하다' },
            { word: 'essential', meaning: '필수적인' }
          ]
        },
        {
          sentenceNumber: 2,
          originalText: 'Imitation allows individuals to acquire adaptive habits without undergoing costly trial and error.',
          sentencePattern: '5형식 (S + V + O + OC)',
          tokens: [
            { text: 'Imitation', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '모방은' },
            { text: 'allows', role: 'V', pos: 'verb', tagTop: '5형식 동사 [서술어]', meaning: '가능하게 한다' },
            { text: 'individuals', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '개인들이' },
            { text: 'to acquire', role: 'OC', pos: 'verb', tagTop: '목적격보어 [서술어]', meaning: '습득하도록' },
            { text: 'adaptive', role: 'M', pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '적응적인' },
            { text: 'habits', role: 'O', pos: 'noun', tagTop: '준동사 목적어 [명사]', meaning: '습관들을' },
            { text: '(without undergoing', role: 'M', pos: 'verb', tagTop: '전치사+동명사 [서술어]', meaning: '겪지 않고', clauseType: 'prepositional' },
            { text: 'costly', role: 'M', pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '비용이 큰' },
            { text: 'trial and error).', role: 'M', pos: 'noun', tagTop: '명사구 [명사]', meaning: '시행착오를', clauseType: 'prepositional' }
          ],
          directTranslation: 'Imitation allows individuals / to acquire adaptive habits / without undergoing costly trial and error.\n(모방은 개인들로 하여금 가능하게 한다 / 적응적 습관을 습득하도록 / 막대한 대가를 치르는 시행착오를 겪지 않고.)',
          polishedTranslation: '모방을 통해 개인들은 값비싼 대가를 치르는 시행착오를 겪지 않고도 적응에 유리한 습관을 체득할 수 있다.',
          grammarPoints: [
            'allow + 목적어(individuals) + to부정사(to acquire): 5형식 사역/유도 구조',
            'without + 동명사(-ing): ~하지 않고'
          ],
          vocabulary: [
            { word: 'adaptive', meaning: '적응적인' },
            { word: 'undergo', meaning: '겪다, 경험하다' },
            { word: 'costly', meaning: '비용/대가가 큰' },
            { word: 'trial and error', meaning: '시행착오' }
          ]
        },
        {
          sentenceNumber: 3,
          originalText: 'Researchers emphasize that observing skilled models accelerates cognitive development, enabling learners to solve novel problems efficiently.',
          sentencePattern: '3형식 (S + V + that명사절 [S\' + V\' + O\'] + 분사구문)',
          tokens: [
            { text: 'Researchers', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '연구자들은' },
            { text: 'emphasize', role: 'V', pos: 'verb', tagTop: '동사 [서술어]', meaning: '강조한다' },
            { text: '<that', role: "S'", pos: 'other', tagTop: '접속사', meaning: '~라는 점을', clauseType: 'noun' },
            { text: 'observing', role: "S'", pos: 'verb', tagTop: '동명사주어 [서술어]', meaning: '관찰하는 것이', clauseType: 'noun' },
            { text: 'skilled', role: "M'", pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '숙련된', clauseType: 'noun' },
            { text: 'models', role: "O'", pos: 'noun', tagTop: '동명사 목적어 [명사]', meaning: '모델들을', clauseType: 'noun' },
            { text: 'accelerates', role: "V'", pos: 'verb', tagTop: '절 내 동사 [서술어]', meaning: '가속한다고', clauseType: 'noun' },
            { text: 'cognitive', role: "M'", pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '인지의', clauseType: 'noun' },
            { text: 'development>,', role: "O'", pos: 'noun', tagTop: '목적어 [명사]', meaning: '발달을', clauseType: 'noun' },
            { text: '[enabling', role: 'M', pos: 'verb', tagTop: '분사구문 [서술어]', meaning: '가능하게 하면서', clauseType: 'adverb' },
            { text: 'learners', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '학습자들이', clauseType: 'adverb' },
            { text: 'to solve', role: 'OC', pos: 'verb', tagTop: '목적격보어 [서술어]', meaning: '해결하도록', clauseType: 'adverb' },
            { text: 'novel', role: 'M', pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '새로운', clauseType: 'adverb' },
            { text: 'problems', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '문제를', clauseType: 'adverb' },
            { text: 'efficiently].', role: 'M', pos: 'adverb', tagTop: '양태부사 [부사]', meaning: '효율적으로', clauseType: 'adverb' }
          ],
          directTranslation: 'Researchers emphasize / <that observing skilled models accelerates cognitive development>, / [enabling learners to solve novel problems efficiently].\n(연구자들은 강조한다 / <숙련된 모델을 관찰하는 것이 인지 발달을 촉진한다고>, / [학습자들이 새로운 문제를 효율적으로 해결할 수 있게 하면서].)',
          polishedTranslation: '연구자들은 숙련된 본보기를 관찰하는 것이 인지적 발달을 촉진하여, 학습자가 새로운 문제를 효율적으로 해결할 수 있게 해 준다고 강조한다.',
          grammarPoints: [
            '명사절 접속사 that절: emphasize의 목적어 역할',
            '동명사 주어 (observing skilled models)는 단수 취급 → 단수 동사 accelerates',
            '분사구문: enabling + 목적어(learners) + 목적격보어(to solve)',
            'novel: 형용사로서 \'새로운, 참신한\' 의미'
          ],
          vocabulary: [
            { word: 'accelerate', meaning: '가속하다, 촉진하다' },
            { word: 'cognitive', meaning: '인지의, 인지적인' },
            { word: 'novel', meaning: '새로운, 신기한' },
            { word: 'efficiently', meaning: '효율적으로' }
          ]
        }
      ]
    },
    suneungData: {
      questionPrompt: '다음 글의 제목으로 가장 적절한 것은?',
      choices: [
        'Trial and Error: The Inevitable Cost of Mastery',
        'Observational Learning: How Imitation Drives Human Efficiency',
        'Why Skilled Mentors Often Overlook Novice Errors',
        'The Genetic Limits of Instinctive Habit Formation',
        'Social Competition as a Prerequisite for Learning'
      ],
      suneungAnalysis: {
        questionType: '글의 제목 (Title)',
        questionPrompt: '다음 글의 제목으로 가장 적절한 것은?',
        correctChoiceNumber: 2,
        clueSentenceNumbers: [1, 2, 3],
        coreLogicSummary: '인간은 태초부터 모방(Imitation)을 통해 막대한 시행착오(trial and error)를 겪지 않고 적응적 습관과 인지 발달을 효율적으로 가속해 왔다는 내용이 전체를 관통하는 핵심 논리입니다.',
        passageFlow: {
          topicIntro: '태초부터 타인의 행동을 모방하여 필수 기술을 습득해 온 인간의 본성',
          development: '값비싼 시행착오 없이 적응적 습관을 획득하게 해 주는 모방의 실질적 이점',
          turningPoint: '순접 심화 전개: 관찰 학습의 인지적 메커니즘 상술',
          conclusion: '숙련된 모델 관찰이 인지 발달을 촉진하고 새로운 문제 해결 효율성을 극대화함'
        },
        choices: [
          {
            number: 1,
            text: 'Trial and Error: The Inevitable Cost of Mastery',
            isCorrect: false,
            analysis: '오답(정반대 진술): 본문은 시행착오 없이(without undergoing costly trial and error) 기술을 배운다고 강조하므로 피할 수 없는 대가라는 진술은 반대입니다.'
          },
          {
            number: 2,
            text: 'Observational Learning: How Imitation Drives Human Efficiency',
            isCorrect: true,
            analysis: '정답: 지문의 핵심 키워드인 관찰/모방(observing / imitation)과 효율성 증진(solve novel problems efficiently)을 포괄하는 가장 적절한 제목입니다.'
          },
          {
            number: 3,
            text: 'Why Skilled Mentors Often Overlook Novice Errors',
            isCorrect: false,
            analysis: '오답(본문 무관): 멘토가 초보자의 실수를 간과한다는 내용은 전혀 다루어지지 않았습니다.'
          },
          {
            number: 4,
            text: 'The Genetic Limits of Instinctive Habit Formation',
            isCorrect: false,
            analysis: '오답(과도한 일반화): 유전적 한계에 대한 논의는 본문에 없습니다.'
          },
          {
            number: 5,
            text: 'Social Competition as a Prerequisite for Learning',
            isCorrect: false,
            analysis: '오답(핵심 소재 왜곡): 사회적 경쟁(Competition)이 아니라 모방과 관찰(Imitation)이 핵심입니다.'
          }
        ],
        paraphrasePairs: [
          {
            passageExpr: 'observing skilled models accelerates cognitive development',
            choiceExpr: 'Observational Learning'
          },
          {
            passageExpr: 'without undergoing costly trial and error ... solve novel problems efficiently',
            choiceExpr: 'Drives Human Efficiency'
          }
        ]
      }
    }
  },
  {
    id: 'g3-csat-sample',
    title: '고3 / 수능 기출: 알고리즘과 확증 편향',
    grade: '고3 / 수능',
    passage: `Online algorithms prioritize information that reinforces users' preexisting convictions, creating echo chambers where dissenting viewpoints are filtered out. Consequently, individuals become increasingly entrenched in their own ideological silos, mistaking their personalized feeds for objective reality.`,
    presetAnalysis: {
      title: '고3/수능 모의고사: 알고리즘 필터 버블과 확증 편향',
      gradeLevel: '고3 수능',
      summary: '온라인 알고리즘이 기존 신념을 강화하는 정보만 우선 제공함으로써 반대 의견을 차단하고 확증 편향과 이념적 고립을 심화시킨다.',
      sentences: [
        {
          sentenceNumber: 1,
          originalText: "Online algorithms prioritize information that reinforces users' preexisting convictions, creating echo chambers where dissenting viewpoints are filtered out.",
          sentencePattern: '3형식 (S + V + O [관계사절] + 분사구문 [관계부사절])',
          tokens: [
            { text: 'Online', role: 'M', pos: 'adjective', tagTop: '형용사 [형용사]', meaning: '온라인' },
            { text: 'algorithms', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '알고리즘은' },
            { text: 'prioritize', role: 'V', pos: 'verb', tagTop: '동사 [서술어]', meaning: '우선시한다' },
            { text: 'information', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '정보를' },
            { text: "[that", role: "S'", pos: 'other', tagTop: '주격관계사', meaning: '~하는', clauseType: 'relative' },
            { text: "reinforces", role: "V'", pos: 'verb', tagTop: '절 내 동사 [서술어]', meaning: '강화하는', clauseType: 'relative' },
            { text: "users'", role: "M'", pos: 'noun', tagTop: '소유격', meaning: '사용자의', clauseType: 'relative' },
            { text: "preexisting", role: "M'", pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '기존의', clauseType: 'relative' },
            { text: "convictions],", role: "O'", pos: 'noun', tagTop: '목적어 [명사]', meaning: '신념을', clauseType: 'relative' },
            { text: '[creating', role: 'M', pos: 'verb', tagTop: '분사구문 [서술어]', meaning: '만들어내며', clauseType: 'adverb' },
            { text: 'echo chambers', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '반향실을', clauseType: 'adverb' },
            { text: '(where', role: "M'", pos: 'other', tagTop: '관계부사', meaning: '~하는 곳인', clauseType: 'relative' },
            { text: 'dissenting', role: "M'", pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '반대하는', clauseType: 'relative' },
            { text: 'viewpoints', role: "S'", pos: 'noun', tagTop: '주어 [명사]', meaning: '관점들이', clauseType: 'relative' },
            { text: 'are filtered out)].', role: "V'", pos: 'verb', tagTop: '수동태 동사 [서술어]', meaning: '걸러져 나가는', clauseType: 'relative' }
          ],
          directTranslation: "Online algorithms prioritize information / [that reinforces users' preexisting convictions], / [creating echo chambers] / (where dissenting viewpoints are filtered out).\n(온라인 알고리즘은 정보를 우선시한다 / [사용자의 기존 신념을 강화하는], / [반향실(동조 효과)을 생성하며] / (반대 관점들이 걸러져 나가는).)",
          polishedTranslation: '온라인 알고리즘은 사용자의 기존 신념을 강화하는 정보를 우선시하여, 다른 반대 관점들이 걸러져 버리는 반향실(echo chamber)을 만들어낸다.',
          grammarPoints: [
            '주격 관계대명사 that절: 선행사 information 수식',
            '현재분사구문 creating: 동시 동작 또는 결과 (~하면서, 그리하여 ~를 만든다)',
            '관계부사 where절: 선행사 echo chambers를 장소 개념으로 수식하는 완전한 수동태 문장'
          ],
          vocabulary: [
            { word: 'prioritize', meaning: '우선순위를 매기다, 우선하다' },
            { word: 'reinforce', meaning: '강화하다' },
            { word: 'preexisting', meaning: '기존의, 이전부터 존재하는' },
            { word: 'conviction', meaning: '신념, 확신' },
            { word: 'dissenting', meaning: '반대하는, 이의를 제기하는' },
            { word: 'filter out', meaning: '걸러내다, 배제하다' }
          ]
        },
        {
          sentenceNumber: 2,
          originalText: 'Consequently, individuals become increasingly entrenched in their own ideological silos, mistaking their personalized feeds for objective reality.',
          sentencePattern: '2형식 (M + S + V + C + 분사구문)',
          tokens: [
            { text: 'Consequently,', role: 'M', pos: 'adverb', tagTop: '연결부사 [부사]', meaning: '그 결과로' },
            { text: 'individuals', role: 'S', pos: 'noun', tagTop: '주어 [명사]', meaning: '개인들은' },
            { text: 'become', role: 'V', pos: 'verb', tagTop: '2형식 동사 [서술어]', meaning: '된다' },
            { text: 'increasingly', role: 'M', pos: 'adverb', tagTop: '정도부사 [부사]', meaning: '점점 더' },
            { text: 'entrenched', role: 'C', pos: 'adjective', tagTop: '주격보어(형용사/분사)', meaning: '굳어지게' },
            { text: '(in', role: 'M', pos: 'other', tagTop: '전치사', meaning: '~안에', clauseType: 'prepositional' },
            { text: 'their own', role: 'M', pos: 'adjective', tagTop: '수식어', meaning: '자신들만의', clauseType: 'prepositional' },
            { text: 'ideological', role: 'M', pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '이념적인', clauseType: 'prepositional' },
            { text: 'silos),', role: 'M', pos: 'noun', tagTop: '명사 [명사]', meaning: '사일로 속에', clauseType: 'prepositional' },
            { text: '[mistaking', role: 'M', pos: 'verb', tagTop: '분사구문 [서술어]', meaning: '착각하면서', clauseType: 'adverb' },
            { text: 'their', role: 'M', pos: 'noun', tagTop: '소유격', meaning: '자신의', clauseType: 'adverb' },
            { text: 'personalized', role: 'M', pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '개인화된', clauseType: 'adverb' },
            { text: 'feeds', role: 'O', pos: 'noun', tagTop: '목적어 [명사]', meaning: '피드를', clauseType: 'adverb' },
            { text: 'for', role: 'M', pos: 'other', tagTop: '전치사', meaning: '~로', clauseType: 'adverb' },
            { text: 'objective', role: 'M', pos: 'adjective', tagTop: '수식어 [형용사]', meaning: '객관적인', clauseType: 'adverb' },
            { text: 'reality].', role: 'M', pos: 'noun', tagTop: '전치사 목적어 [명사]', meaning: '현실로', clauseType: 'adverb' }
          ],
          directTranslation: 'Consequently, / individuals become increasingly entrenched / in their own ideological silos, / [mistaking their personalized feeds for objective reality].\n(그 결과, / 개인들은 점점 더 견고히 갇히게 된다 / 그들 자신의 이념적 사일로(장벽) 안에, / [그들의 개인화된 피드를 객관적인 현실로 착각한 채로].)',
          polishedTranslation: '그 결과, 개인들은 자신에게 맞춰진 피드를 객관적인 현실로 착각한 채 자신만의 이념적 고립 공간(silo) 속에 점점 더 완고하게 갇히게 된다.',
          grammarPoints: [
            'become + 형용사/과거분사(entrenched): ~한 상태가 되다',
            'mistake A for B: A를 B로 착각하다/오인하다',
            '현재분사구문 mistaking: 부대 상황(~하면서)'
          ],
          vocabulary: [
            { word: 'entrenched', meaning: '견고히 뿌리내린, 확립된' },
            { word: 'ideological', meaning: '이념적인' },
            { word: 'silo', meaning: '사일로, 고립된 공간/사고방식' },
            { word: 'objective', meaning: '객관적인' }
          ]
        }
      ]
    },
    suneungData: {
      questionPrompt: '다음 글의 빈칸에 들어갈 말로 가장 적절한 것은? [3점]',
      choices: [
        'embrace a diverse spectrum of dissenting viewpoints',
        'resist the subtle temptations of algorithmic convenience',
        'mistake their personalized feeds for objective reality',
        'rebuild fractured public consensus through digital empathy',
        'verify the computational accuracy of corporate data streams'
      ],
      suneungAnalysis: {
        questionType: '빈칸추론 (Blank Inference)',
        questionPrompt: '다음 글의 빈칸에 들어갈 말로 가장 적절한 것은? [3점]',
        correctChoiceNumber: 3,
        clueSentenceNumbers: [1, 2],
        coreLogicSummary: '온라인 알고리즘이 기존 신념만 강화하여 반향실(echo chamber)을 만들고, 그 결과 개인들이 각자의 사일로에 갇혀 자신의 개인화된 피드를 객관적 현실인 양 착각(mistake for objective reality)하게 된다는 점이 글의 핵심 결론입니다.',
        passageFlow: {
          topicIntro: '온라인 알고리즘이 기존 신념을 강화하는 정보만 선별 제공하는 현상',
          development: '반대 관점이 걸러지는 반향실(echo chambers)의 형성 메커니즘',
          turningPoint: 'Consequently(결과 연결): 이념적 고립(ideological silos) 심화',
          conclusion: '알고리즘이 맞춤 제공한 편향된 피드를 세상 전체의 객관적 진실로 착각하는 위험성'
        },
        choices: [
          {
            number: 1,
            text: 'embrace a diverse spectrum of dissenting viewpoints',
            isCorrect: false,
            analysis: '오답(정반대 진술): 반대 관점을 수용하기는커녕 걸러내어 차단(filtered out)당하는 상태입니다.'
          },
          {
            number: 2,
            text: 'resist the subtle temptations of algorithmic convenience',
            isCorrect: false,
            analysis: '오답(주제 반대): 저항하는 것이 아니라 알고리즘에 갇혀 순응하고 있는 부정적 상태를 기술해야 합니다.'
          },
          {
            number: 3,
            text: 'mistake their personalized feeds for objective reality',
            isCorrect: true,
            analysis: '정답: 2번 문장의 핵심 결론부인 개인화된 피드를 객관적 진실로 착각하는 인지적 오류를 정확히 짚어냈습니다.'
          },
          {
            number: 4,
            text: 'rebuild fractured public consensus through digital empathy',
            isCorrect: false,
            analysis: '오답(본문 무관/이상론): 합의 재건이나 공감 형성에 관한 내용은 본문에 전혀 언급되지 않았습니다.'
          },
          {
            number: 5,
            text: 'verify the computational accuracy of corporate data streams',
            isCorrect: false,
            analysis: '오답(초점 이탈): 알고리즘의 연산 정확성을 검증하는 기술적 문제가 아니라 사용자의 심리적 확증 편향이 핵심 문제입니다.'
          }
        ],
        paraphrasePairs: [
          {
            passageExpr: 'reinforces users preexisting convictions, creating echo chambers',
            choiceExpr: 'personalized feeds'
          },
          {
            passageExpr: 'entrenched in their own ideological silos',
            choiceExpr: 'mistake for objective reality'
          }
        ]
      }
    }
  }
];
