import type { CourseLesson, GalleryStudent, HighlightCard, LearnerPromise } from './types.ts';

export const appName = 'Vibe Coding for Teacher';
export const courseLabel = '교사 개발자가 되기 위한 8차시 Vibe Coding 코스';

export const landingHighlights: HighlightCard[] = [
  {
    title: '도구 소개가 아니라 실제 주제로 배워요',
    body: '바이브 코딩, 메일머지, Antigravity, Firebase, API, 서버리스와 CDN까지 초보자가 자주 궁금해하는 주제로 이어집니다.',
  },
  {
    title: '매 차시마다 읽을거리와 실습 과제가 있어요',
    body: '학습 목표를 먼저 확인하고, 공식 자료 2개를 읽은 뒤, 바로 따라할 수 있는 실습 과제와 제출물로 마무리합니다.',
  },
  {
    title: '비개발자 눈높이로 끝까지 연결해요',
    body: '설명만 듣고 끝나는 것이 아니라, 자동화에서 데이터베이스와 로그인, API 보안까지 단계적으로 확장합니다.',
  },
];

export const learnerPromises: LearnerPromise[] = [
  {
    label: '누구를 위한 코스인가요?',
    title: '기획자, 강사, 운영자, 비전공자에게 맞춘 흐름',
    body: '코드를 전문적으로 배우려는 사람보다, AI로 업무와 서비스를 만들고 싶은 초보자에게 맞춘 코스입니다.',
  },
  {
    label: '어떻게 배우나요?',
    title: '읽기와 실습이 균형 잡힌 러닝 구조',
    body: '각 차시는 학습 목표 확인, 공식 문서 읽기, 쉬운 용어 번역, 실습 과제 수행, 제출물 정리의 흐름으로 진행됩니다.',
  },
  {
    label: '무엇이 남나요?',
    title: '8차시가 끝나면 도구를 고를 기준이 생깁니다',
    body: '어떤 작업은 AI 프롬프트로 해결하고, 어떤 작업은 Firebase나 API, 서버리스나 CDN이 필요한지 판단할 수 있게 됩니다.',
  },
];

export const courseLessons: CourseLesson[] = [
  {
    id: 'session-1',
    session: 1,
    stage: 'discover',
    stageLabel: '시작 준비',
    difficulty: '입문',
    title: '바이브 코딩이란?',
    summary: '바이브 코딩이 무엇인지 이해하고, 비개발자도 AI와 함께 서비스를 만드는 기본 감각을 익힙니다.',
    promise: '코드를 다 몰라도 만들 수 있다는 자신감을 얻고, 좋은 요청이 좋은 결과를 만든다는 흐름을 이해합니다.',
    learningGoal: '바이브 코딩의 개념, 장점, 한계, 그리고 초보자가 안전하게 시작하는 방법을 이해하는 것이 목표입니다.',
    assignment: '내가 만들고 싶은 서비스나 자동화 아이디어를 한 줄 소개와 세 줄 소개로 각각 작성하고, 첫 프롬프트를 완성해 보세요.',
    output: '내가 만들고 싶은 서비스 아이디어 한 줄과 첫 프롬프트 초안',
    duration: '45분',
    warmup: '“AI와 함께 만들고 싶은 것”을 한 문장으로 적어보세요. 서비스, 자동화, 웹페이지 어떤 것이어도 괜찮습니다.',
    mindsetTip: '바이브 코딩은 코드를 외우는 방식이 아니라 원하는 결과를 말로 잘 설명하는 방식에 가깝습니다.',
    prepItems: ['메모 앱 또는 노트', '아이디어 1개', 'AI 채팅 도구'],
    vocabulary: [
      { term: '바이브 코딩', easyMeaning: '원하는 결과를 말로 설명하고 AI와 함께 만드는 방식' },
      { term: '프롬프트', easyMeaning: 'AI에게 부탁하는 문장' },
      { term: '프로토타입', easyMeaning: '빠르게 만들어 보는 첫 버전' },
    ],
    readings: [
      {
        title: '바이브 코딩이란 무엇인가',
        summary: 'AI와 함께 문제를 정의하고 결과를 빠르게 수정해 가는 작업 방식을 소개합니다.',
        whyImportant: '이번 과정의 핵심은 문법 암기보다 문제 해결 흐름을 익히는 데 있기 때문입니다.',
        body: [
          '바이브 코딩은 코드를 한 줄씩 외워서 작성하는 방식보다, 만들고 싶은 결과를 말로 설명하고 AI와 함께 빠르게 시도해 보는 작업 방식에 가깝습니다.',
          '중요한 것은 완벽한 코드를 처음부터 만드는 일이 아니라, 문제를 정의하고 초안을 만들고 다시 다듬는 반복을 경험하는 것입니다.',
        ],
      },
      {
        title: 'HTML, CSS, JS의 역할 이해하기',
        summary: '화면 구조, 화면 스타일, 동작 처리의 차이를 쉬운 예시로 정리합니다.',
        whyImportant: 'AI가 만든 화면을 수정하려면 어떤 부분을 손봐야 하는지 감을 잡아야 하기 때문입니다.',
        body: [
          'HTML은 화면의 뼈대, CSS는 화면의 모양, JavaScript는 버튼 클릭이나 데이터 처리 같은 동작을 맡습니다.',
          '이 세 가지 역할만 구분할 수 있어도 AI가 만든 결과물을 볼 때 무엇을 수정해야 할지 훨씬 빠르게 판단할 수 있습니다.',
        ],
      },
    ],
    steps: [
      '바이브 코딩이 “말로 설명해서 만드는 방식”이라는 점을 쉬운 예시로 이해합니다.',
      '직접 만들고 싶은 결과를 서비스, 자동화, 문서 작업 중 하나로 정합니다.',
      'AI에게 어떤 정보를 주면 더 좋은 결과가 나오는지 예시 프롬프트를 살펴봅니다.',
      '내 아이디어를 한 줄 설명과 세 줄 설명으로 각각 적어보며 요청 문장을 다듬습니다.',
    ],
    prompts: [
      '비개발자도 이해할 수 있게 바이브 코딩이 무엇인지 쉬운 말로 설명해줘.',
      '내가 만들고 싶은 아이디어를 초보자용 웹서비스 기획 한 줄로 다듬어줘.',
    ],
    checklist: [
      '바이브 코딩을 한 문장으로 설명할 수 있다.',
      '내가 만들고 싶은 결과를 한 줄로 정리할 수 있다.',
      'AI에게 보낼 첫 프롬프트를 직접 쓸 수 있다.',
    ],
    coachNotes: [
      '처음부터 큰 서비스를 만들려 하지 않아도 괜찮습니다. 한 화면짜리 결과물도 충분한 시작입니다.',
      'AI 설명이 어렵게 느껴지면 “초등학생도 이해하게 다시 설명해줘”라고 요청해도 됩니다.',
    ],
  },
  {
    id: 'session-2',
    session: 2,
    stage: 'discover',
    stageLabel: '시작 준비',
    difficulty: '입문',
    title: '바이브 코딩으로 메일머지 실습하기',
    summary: 'AI의 도움을 받아 메일머지 문구를 만들고, 사람마다 다른 내용을 보내는 자동화 감각을 익힙니다.',
    promise: '실무에서 바로 써먹을 수 있는 작은 자동화 경험을 통해 바이브 코딩의 효용을 체감합니다.',
    learningGoal: '메일머지의 개념을 이해하고, 스프레드시트 데이터와 이메일 초안을 연결하는 흐름을 익히는 것이 목표입니다.',
    assignment: '행사 안내나 수강 안내 중 하나를 골라, 수신자 정보 표와 메일머지용 본문 초안을 직접 만들어 보세요.',
    output: '메일머지용 제목/본문 초안과 수신자 데이터 예시 시트',
    duration: '50분',
    warmup: '이름만 바꿔서 여러 사람에게 보내고 싶은 이메일이 있다면 어떤 상황인지 떠올려보세요.',
    mindsetTip: '메일머지는 코딩보다 “반복 작업을 줄이는 사고”에 더 가깝습니다. 먼저 어떤 정보가 바뀌는지부터 찾으면 됩니다.',
    prepItems: ['Gmail 계정', 'Google Docs 또는 Sheets', '수신자 정보 예시 3명'],
    vocabulary: [
      { term: '메일머지', easyMeaning: '같은 메일에 사람별 정보만 바꿔 여러 명에게 보내는 방식' },
      { term: '머지 태그', easyMeaning: '이름이나 회사명처럼 사람마다 바뀌는 자리표시자' },
      { term: '스프레드시트', easyMeaning: '이름, 이메일 같은 정보를 표로 정리한 문서' },
    ],
    readings: [
      {
        title: 'Google Sheets와 Apps Script로 구조 보기',
        summary: '입력 화면과 데이터 처리 구조를 한 흐름으로 이해합니다.',
        whyImportant: '데이터가 움직이는 길을 알아야 메일 머지도 덜 막히기 때문입니다.',
        body: [
          '메일 머지는 단순히 메일을 여러 통 보내는 기능이 아니라, Google Sheets의 한 줄 데이터가 메일 본문과 연결되는 흐름입니다.',
          '이때 Google Sheets는 단순한 표가 아니라 이름, 이메일, 날짜, 링크 같은 정보를 저장해 두는 작은 데이터베이스 역할을 합니다. 즉 메일을 보내기 전에 필요한 정보를 한곳에 모아 두는 저장소라고 이해하면 쉽습니다.',
          '표 안의 값이 어디에서 읽히고 어떤 문장 안에 들어가는지 이해하면, 나중에 Firebase 같은 진짜 데이터베이스를 배울 때도 “데이터를 저장하고 불러와서 화면이나 메일에 넣는다”는 같은 구조로 연결해서 볼 수 있습니다.',
        ],
      },
      {
        title: '메일 머지 이해하기',
        summary: '시트 데이터가 이메일 발송으로 이어지는 기본 구조를 이해합니다.',
        whyImportant: '메일 머지는 자동화 흐름을 가장 직관적으로 경험할 수 있는 좋은 실습이기 때문입니다.',
        body: [
          '메일 머지는 같은 형식의 안내 메일을 여러 사람에게 보내되, 이름이나 일정처럼 바뀌는 정보만 각자 다르게 넣는 방식입니다.',
          '실습에서는 보통 `index.html`이 입력 화면과 버튼 같은 구조를 보여 주고, `code.js`가 시트 데이터를 읽어서 각 사람에게 맞는 문장을 조합하는 동작을 맡게 됩니다.',
          '즉, 사람이 매번 복사해서 붙여넣던 일을 구조화해서 자동으로 처리하는 경험을 할 수 있다는 점이 핵심입니다.',
        ],
      },
    ],
    steps: [
      '메일머지가 왜 필요한지, 일반 메일과 무엇이 다른지 예시로 이해합니다.',
      '수신자 이름, 이메일, 소속처럼 바뀌는 정보를 열 단위로 정리합니다.',
      'AI에게 행사 안내, 수강 안내, 감사 메일 같은 실습용 메일 초안을 부탁합니다.',
      '메일 제목과 본문에서 고정 문장과 개인화 문장을 구분해봅니다.',
    ],
    prompts: [
      '수강생 이름과 강의 날짜가 들어가는 메일머지용 안내 메일을 친절한 톤으로 작성해줘.',
      '메일머지에 넣을 수신자 데이터 열 이름을 초보자도 이해하기 쉽게 추천해줘.',
    ],
    checklist: [
      '메일머지가 무엇인지 설명할 수 있다.',
      '바뀌는 정보와 고정 문장을 구분할 수 있다.',
      '실습용 메일 초안을 AI와 함께 만들 수 있다.',
    ],
    coachNotes: [
      '처음에는 실제 발송보다 문안 만들기와 데이터 열 설계까지만 해도 충분합니다.',
      '사람 이름, 날짜, 링크처럼 반복해서 바뀌는 값부터 찾으면 구조가 쉬워집니다.',
    ],
  },
  {
    id: 'session-3',
    session: 3,
    stage: 'build',
    stageLabel: '화면 만들기',
    difficulty: '기초',
    title: 'Antigravity는 뭐에요?',
    summary: 'Antigravity가 어떤 도구인지, 기존의 채팅형 AI 도구와 무엇이 다른지 이해합니다.',
    promise: 'Antigravity를 단순한 채팅창이 아니라 여러 작업을 맡길 수 있는 작업 환경으로 바라보게 됩니다.',
    learningGoal: 'Antigravity의 핵심 개념과 사용 맥락을 초보자 눈높이에서 이해하는 것이 목표입니다.',
    assignment: 'Antigravity의 핵심 기능 3가지를 골라 “무엇을 대신해주는가” 기준으로 쉬운 말 메모를 작성해 보세요.',
    output: 'Antigravity의 핵심 기능 3가지 정리 노트',
    duration: '55분',
    warmup: 'AI에게 “대답만 듣는 것”과 “실제로 일을 맡기는 것”은 무엇이 다를지 생각해보세요.',
    mindsetTip: '새 도구를 배울 때는 모든 기능을 외우기보다 “이 도구가 어떤 일을 대신해 주는가”를 먼저 잡는 것이 좋습니다.',
    prepItems: ['Antigravity 소개 문서', '비교할 AI 도구 1개', '정리용 메모'],
    vocabulary: [
      { term: 'Agent-First', easyMeaning: 'AI가 먼저 일을 계획하고 실행하는 방식' },
      { term: 'Artifacts', easyMeaning: 'AI가 작업하며 남기는 결과물과 기록' },
      { term: '멀티 서피스', easyMeaning: '에디터, 터미널, 브라우저를 함께 다루는 방식' },
    ],
    readings: [
      {
        title: 'Global Rule과 Workspace Rule 이해하기',
        summary: 'AI가 따르는 공통 규칙과 프로젝트별 규칙의 차이를 이해합니다.',
        whyImportant: '규칙을 알아야 왜 그런 결과가 나왔는지 설명하고 수정 요청도 더 정확하게 할 수 있습니다.',
        body: [
          'Global Rule은 도구 전반에 공통으로 적용되는 기본 원칙이고, Workspace Rule은 현재 프로젝트 안에서만 적용되는 작업 규칙입니다.',
          '이 차이를 이해하면 결과물이 왜 특정 톤이나 방식으로 나왔는지 설명할 수 있고, 원하는 방향으로 더 정확히 수정 요청을 보낼 수 있습니다.',
        ],
      },
      {
        title: 'Plan 모드와 Fast 모드, 언제 무엇을 쓸까',
        summary: '작업 속도와 정리 깊이에 따라 어떤 모드가 맞는지 살펴봅니다.',
        whyImportant: '상황에 맞는 모드를 고르면 더 빠르고 안정적으로 초안을 만들 수 있기 때문입니다.',
        body: [
          'Plan 모드는 큰 흐름을 먼저 정리하거나 복잡한 요청을 다듬을 때 유리하고, Fast 모드는 빠르게 시도하고 바로 확인할 때 유리합니다.',
          '즉, 도구를 잘 쓰는 핵심은 기능 이름을 외우는 것보다 지금 어떤 작업을 하려는지에 맞는 모드를 고르는 판단에 있습니다.',
        ],
      },
    ],
    steps: [
      'Antigravity가 일반 AI 채팅과 어떻게 다른지 사례 중심으로 이해합니다.',
      'Antigravity가 할 수 있는 일과 사람이 직접 판단해야 하는 일을 나눠봅니다.',
      '문서에 나온 핵심 기능 중 초보자에게 특히 중요한 기능 3가지를 정리합니다.',
      '내가 써보고 싶은 장면을 떠올리며 “언제 Antigravity를 쓰면 좋은가”를 적어봅니다.',
    ],
    prompts: [
      'Antigravity가 무엇인지 비개발자도 이해할 수 있게 쉬운 말로 설명해줘.',
      'Antigravity와 일반 AI 챗봇의 차이를 표로 정리해줘.',
    ],
    checklist: [
      'Antigravity의 핵심 역할을 설명할 수 있다.',
      '일반 AI 채팅과 다른 점을 2가지 이상 말할 수 있다.',
      '내 작업에서 어디에 써볼지 상상할 수 있다.',
    ],
    coachNotes: [
      '새 도구는 기능 목록보다 사용 장면으로 이해하면 훨씬 빨리 익숙해집니다.',
      '문서가 어렵게 느껴지면 한 문단씩 읽고 AI에게 다시 풀어달라고 해도 좋습니다.',
    ],
  },
  {
    id: 'session-4',
    session: 4,
    stage: 'build',
    stageLabel: '화면 만들기',
    difficulty: '기초',
    title: 'Antigravity 정복하기',
    summary: 'Antigravity에서 실제로 작업을 시작하고, 프롬프트 작성부터 검토까지의 흐름을 익힙니다.',
    promise: '도구 소개를 넘어 실제 사용 흐름을 이해하고, 초보자답게 안전하게 활용하는 루틴을 만듭니다.',
    learningGoal: 'Antigravity에서 작업을 지시하고 결과를 검토하는 기본 사용법을 익히는 것이 목표입니다.',
    assignment: '랜딩 페이지 초안 만들기처럼 짧은 작업 하나를 정하고, Antigravity에 보낼 첫 작업 요청 프롬프트를 완성해 보세요.',
    output: 'Antigravity 실습 루틴 메모와 첫 작업 요청 프롬프트',
    duration: '55분',
    warmup: 'AI에게 “막연한 부탁”을 했을 때와 “구체적인 부탁”을 했을 때 결과가 어떻게 달라질지 떠올려보세요.',
    mindsetTip: '도구를 잘 쓰는 핵심은 완벽한 프롬프트보다 점점 더 구체적으로 다듬어 가는 습관에 있습니다.',
    prepItems: ['Antigravity 실행 환경', '작업 주제 1개', '결과 검토 체크리스트'],
    vocabulary: [
      { term: 'Task', easyMeaning: 'AI에게 맡기는 구체적인 작업' },
      { term: 'Verify', easyMeaning: 'AI가 한 일을 사람이 다시 확인하는 과정' },
      { term: 'Iteration', easyMeaning: '한 번에 끝내지 않고 계속 다듬는 반복 작업' },
    ],
    readings: [
      {
        title: 'Skills는 왜 만들고 어떻게 로드될까',
        summary: 'YAML frontmatter, SKILL.md, 추가 파일이 단계적으로 로드되며 context window를 관리하는 방식을 이해합니다.',
        whyImportant: '좋은 Skills는 필요한 정보만 순서대로 불러와 context window를 아끼면서도, 반복 작업의 기준을 안정적으로 제공하기 때문입니다.',
        body: [
          'Skills는 자주 반복되는 작업을 더 잘 수행할 수 있도록 정리해 둔 작업용 가이드입니다. 핵심은 사용자가 직접 일일이 읽는 것이 아니라, AI가 현재 작업과의 관련성을 보고 필요할 때 순서대로 불러온다는 점입니다.',
          '이런 구조를 Progressive Disclosure와 연결해서 이해하면, 왜 도구가 한꺼번에 모든 문서를 읽지 않고 필요한 만큼만 가져오는지 감을 잡을 수 있습니다.',
        ],
      },
      {
        title: 'Git과 GitHub로 작업 기록 남기기',
        summary: '변경 이력을 남기고 되돌아볼 수 있는 기본 기록 흐름을 이해합니다.',
        whyImportant: '조금 더 복잡한 작업일수록 기록 습관이 있어야 수정과 확장이 쉬워지기 때문입니다.',
        body: [
          'Antigravity로 작업하더라도 결국 프로젝트는 계속 수정되고 다듬어집니다. 이때 Git은 무엇이 바뀌었는지 남겨 주는 기록 도구 역할을 합니다.',
          '예를 들어 버튼 색을 바꾸고 문구를 수정한 뒤 “여기까지 작업했다”라고 남기는 저장 지점이 바로 commit입니다. commit을 해두면 그 시점의 작업 내용을 나중에 다시 확인하거나, 문제가 생겼을 때 어디까지 바뀌었는지 되짚어볼 수 있습니다.',
          '이렇게 내 컴퓨터 안에 남긴 commit 기록을 GitHub 같은 원격 저장소로 올리는 과정이 push입니다. 즉 commit이 내 작업 과정을 한 단계씩 정리해 두는 기록이라면, push는 그 기록을 온라인에 백업하고 다른 사람과도 공유 가능한 상태로 옮기는 흐름이라고 이해하면 자연스럽습니다.',
          '초보자에게는 복잡한 협업 기능보다도, 실수했을 때 돌아갈 수 있고 진행 과정을 남길 수 있다는 점을 먼저 이해하는 것이 중요합니다.',
        ],
      },
    ],
    steps: [
      'Antigravity에서 작업을 시작할 때 필요한 정보가 무엇인지 정리합니다.',
      '좋은 작업 요청의 예시와 나쁜 작업 요청의 예시를 비교해봅니다.',
      '작업 결과를 바로 믿기보다 무엇을 확인해야 하는지 체크리스트를 만듭니다.',
      '첫 실습용 작업 요청 프롬프트를 짧고 구체적으로 작성합니다.',
    ],
    prompts: [
      'Antigravity에게 랜딩 페이지 초안을 맡기려는데, 초보자도 쓰기 쉬운 프롬프트로 바꿔줘.',
      'AI가 만든 결과물을 검토할 때 확인할 항목 5개를 쉬운 말로 정리해줘.',
    ],
    checklist: [
      'Antigravity에 작업을 맡길 때 필요한 정보를 말할 수 있다.',
      '결과 검토가 왜 필요한지 이해할 수 있다.',
      '첫 작업 요청 프롬프트를 직접 만들 수 있다.',
    ],
    coachNotes: [
      'AI가 똑똑해 보여도 처음부터 완벽하진 않습니다. 짧게 요청하고 확인하며 다듬는 것이 더 빠릅니다.',
      '“무엇을 만들지, 누가 쓸지, 어떤 톤인지” 세 가지만 넣어도 결과가 훨씬 좋아집니다.',
    ],
  },
  {
    id: 'session-5',
    session: 5,
    stage: 'build',
    stageLabel: '화면 만들기',
    difficulty: '중급 입문',
    title: 'Firebase로 데이터베이스 연결하기',
    summary: 'Firebase를 이용해 앱에 데이터를 저장하고 불러오는 흐름을 초보자 눈높이에서 이해합니다.',
    promise: '앱이 더 이상 고정된 화면이 아니라, 데이터를 담고 보여주는 서비스처럼 느껴지게 됩니다.',
    learningGoal: 'Firebase 프로젝트 연결과 Firestore 데이터 읽기/쓰기의 기본 흐름을 이해하는 것이 목표입니다.',
    assignment: '사용자, 신청 내역, 강의 정보 중 하나를 골라 Firestore에 저장할 데이터 구조를 표로 설계해 보세요.',
    output: 'Firebase 연결 메모와 저장할 데이터 구조 초안',
    duration: '60분',
    warmup: '앱이 기억해주면 좋을 정보 3가지를 떠올려보세요. 예: 이름, 신청 내역, 완료 여부.',
    mindsetTip: '데이터베이스는 어렵게 생각하면 멀게 느껴집니다. 우선은 “앱이 기억하는 공간”이라고 생각해도 충분합니다.',
    prepItems: ['Firebase 계정', '저장할 데이터 예시', '프로젝트 구조 메모'],
    vocabulary: [
      { term: 'Firebase', easyMeaning: '앱 만들 때 자주 쓰는 구글의 백엔드 서비스 모음' },
      { term: 'Firestore', easyMeaning: '데이터를 저장하고 불러오는 Firebase 데이터베이스' },
      { term: '컬렉션', easyMeaning: '비슷한 데이터 문서를 모아두는 폴더 같은 개념' },
    ],
    readings: [
      {
        title: '데이터베이스는 왜 필요할까',
        summary: '앱에서 데이터를 저장해야 하는 이유와 데이터베이스의 역할을 쉬운 예시로 이해합니다.',
        whyImportant: '입력한 값이 사라지지 않고 다시 불러와지려면 저장 구조를 먼저 이해해야 하기 때문입니다.',
        body: [
          '앱을 만들다 보면 사용자가 입력한 값이 새로고침만 해도 사라지는 경우가 있습니다. 이때 필요한 것이 데이터베이스입니다.',
          '데이터베이스는 앱에서 만들어진 정보를 저장하고, 나중에 다시 꺼내 쓸 수 있게 해 주는 공간입니다. 먼저 이 개념을 이해해야 Firebase도 덜 어렵게 느껴집니다.',
        ],
      },
      {
        title: 'Firebase 데이터베이스 소개',
        summary: 'Firebase를 통해 초보자도 빠르게 데이터 저장 구조를 이해할 수 있도록 기본 개념을 살펴봅니다.',
        whyImportant: '복잡한 서버 구축 전에도 데이터 저장 흐름을 경험해 볼 수 있는 대표 도구이기 때문입니다.',
        body: [
          'Firebase는 Google에서 제공하는 서비스로, 초보자도 비교적 빠르게 앱과 데이터 저장 구조를 연결해 볼 수 있게 도와줍니다.',
          '복잡한 서버를 직접 만드는 대신, 먼저 저장 흐름을 경험해 보기에 좋은 도구라는 점에서 입문용으로 자주 선택됩니다.',
        ],
      },
    ],
    steps: [
      '앱에 어떤 데이터를 저장할지 사용자 기준으로 먼저 적어봅니다.',
      'Firebase 프로젝트와 웹 앱 연결이 어떤 순서로 일어나는지 이해합니다.',
      'Firestore의 컬렉션과 문서 구조를 쉬운 예시로 정리합니다.',
      '저장할 데이터 한 건을 샘플로 써보며 화면과 데이터의 연결을 상상합니다.',
    ],
    prompts: [
      '초보자용 학습 서비스에 맞는 Firestore 데이터 구조를 쉽게 제안해줘.',
      'Firebase와 Firestore의 차이를 비개발자도 이해하게 설명해줘.',
    ],
    checklist: [
      '왜 데이터베이스가 필요한지 설명할 수 있다.',
      'Firestore의 컬렉션과 문서 개념을 이해할 수 있다.',
      '저장할 데이터 예시를 직접 적을 수 있다.',
    ],
    coachNotes: [
      '처음부터 복잡한 구조를 만들지 말고 사용자, 강의, 신청처럼 큰 덩어리부터 나누세요.',
      '화면을 먼저 만들고 나중에 데이터를 얹는 방식도 초보자에게는 좋은 접근입니다.',
    ],
  },
  {
    id: 'session-6',
    session: 6,
    stage: 'ship',
    stageLabel: '서비스 완성',
    difficulty: '중급 입문',
    title: 'Firebase로 로그인 기능 구현하기',
    summary: 'Firebase Authentication으로 회원가입과 로그인의 기본 흐름을 이해하고 서비스 접근 구조를 만듭니다.',
    promise: '누가 로그인했는지에 따라 다른 화면과 데이터를 보여주는 서비스 감각을 익힙니다.',
    learningGoal: '이메일/비밀번호 기반 로그인 흐름과 인증 상태 관리의 기본을 이해하는 것이 목표입니다.',
    assignment: '회원가입, 로그인, 로그아웃, 실패 안내까지 포함한 사용자 흐름을 4단계로 정리해 보세요.',
    output: '로그인 화면 구조 메모와 사용자 흐름 초안',
    duration: '55분',
    warmup: '로그인한 사용자와 로그인하지 않은 사용자에게 보여줄 화면이 어떻게 다르면 좋을지 떠올려보세요.',
    mindsetTip: '로그인은 단순히 문을 여는 기능이 아니라, 사용자별로 다른 경험을 제공하는 시작점입니다.',
    prepItems: ['Firebase Authentication 설정 화면', '로그인 예시 문구', '사용자 흐름 메모'],
    vocabulary: [
      { term: 'Authentication', easyMeaning: '사용자가 누구인지 확인하는 과정' },
      { term: '회원가입', easyMeaning: '새 사용자 계정을 만드는 것' },
      { term: '인증 상태', easyMeaning: '지금 로그인되어 있는지 아닌지의 상태' },
    ],
    readings: [
      {
        title: '로그인 기능은 왜 필요할까',
        summary: '앱에서 로그인 기능이 필요한 이유와 사용자를 구분하는 기본 개념을 쉬운 예시로 이해합니다.',
        whyImportant: '데이터를 저장하는 것에서 한 걸음 더 나아가, 누구의 데이터인지 구분하는 흐름을 이해해야 하기 때문입니다.',
        body: [
          '앱을 만들다 보면 “이 기능은 누구를 위한 것일까?”라는 질문을 하게 됩니다. 로그인 기능은 사용자를 구분하고, 각자에게 맞는 정보를 보여 주기 위해 필요합니다.',
          '즉 로그인은 단순히 비밀번호를 넣는 과정이 아니라, 앱이 사용자를 알아보게 만드는 출발점입니다.',
        ],
      },
      {
        title: 'Firebase Authentication 소개',
        summary: 'Firebase Authentication을 통해 초보자도 로그인 기능의 기본 구조를 쉽게 이해할 수 있도록 핵심 개념을 살펴봅니다.',
        whyImportant: '복잡한 인증 시스템을 직접 만들기 전에, 로그인 흐름을 빠르게 경험해 볼 수 있는 대표 도구이기 때문입니다.',
        body: [
          'Firebase Authentication은 Google에서 제공하는 사용자 인증 서비스입니다. 초보자도 비교적 빠르게 로그인 기능의 흐름을 경험해 볼 수 있게 도와줍니다.',
          '복잡한 인증 시스템을 처음부터 직접 만드는 대신, 먼저 로그인 구조를 이해하는 데 좋은 출발점이 됩니다.',
        ],
      },
    ],
    steps: [
      '회원가입, 로그인, 로그아웃이 각각 어떤 경험인지 사용자 기준으로 정리합니다.',
      'Firebase Authentication에서 이메일/비밀번호 방식을 어떻게 쓰는지 이해합니다.',
      '로그인 상태에 따라 보여줄 화면과 숨길 화면을 구분해봅니다.',
      '로그인 실패, 비밀번호 오류, 첫 가입 같은 예외 상황도 함께 생각합니다.',
    ],
    prompts: [
      '초보자용 서비스에 맞는 로그인 화면 문구를 친절한 톤으로 써줘.',
      '회원가입, 로그인, 로그아웃 흐름을 비개발자도 이해하게 순서대로 설명해줘.',
    ],
    checklist: [
      'Firebase 로그인 흐름을 설명할 수 있다.',
      '로그인 상태에 따라 달라질 화면을 구분할 수 있다.',
      '예외 상황까지 함께 생각할 수 있다.',
    ],
    coachNotes: [
      '로그인 기능은 잘 되는 경우보다 안 되는 경우의 안내가 더 중요할 때가 많습니다.',
      '처음에는 소셜 로그인보다 이메일/비밀번호부터 이해하면 훨씬 쉽습니다.',
    ],
  },
  {
    id: 'session-7',
    session: 7,
    stage: 'ship',
    stageLabel: '서비스 완성',
    difficulty: '중급',
    title: 'API 배우기',
    summary: 'API가 무엇인지 이해하고, 프론트엔드가 외부 데이터와 연결되는 기본 흐름을 배웁니다.',
    promise: '이제 앱이 내부 데이터뿐 아니라 바깥 세상과도 연결될 수 있다는 감각을 갖게 됩니다.',
    learningGoal: 'API의 개념과 요청/응답 흐름, 그리고 fetch를 이용한 기본 호출 구조를 이해하는 것이 목표입니다.',
    assignment: '날씨, 번역, 지도 중 하나를 골라 내 서비스에 붙이고 싶은 API 활용 아이디어를 요청-응답 구조로 써보세요.',
    output: 'API 요청 흐름 메모와 예시 요청 문장',
    duration: '45분',
    warmup: '날씨, 번역, 지도 같은 정보를 앱에서 가져오려면 어디에 물어봐야 할지 떠올려보세요.',
    mindsetTip: 'API는 어려운 기술보다 “다른 서비스에게 정보를 부탁하는 창구”라고 생각하면 이해가 쉬워집니다.',
    prepItems: ['외부 데이터 아이디어 1개', '브라우저 개발자도구 또는 예시 코드', '요청 흐름 메모'],
    vocabulary: [
      { term: 'API', easyMeaning: '다른 서비스와 정보를 주고받는 약속된 창구' },
      { term: 'Request', easyMeaning: '정보를 달라고 보내는 요청' },
      { term: 'Response', easyMeaning: '요청에 대한 대답으로 돌아오는 결과' },
    ],
    readings: [
      {
        title: 'API는 무엇이고 왜 필요할까',
        summary: 'API를 어렵지 않게 이해하고, 앱이 외부 서비스와 연결되는 이유를 살펴봅니다.',
        whyImportant: '데이터 저장과 로그인 다음 단계로, 앱이 다른 서비스와 소통하는 구조를 이해해야 하기 때문입니다.',
        body: [
          '앱을 만들다 보면 내 앱 안에 있는 데이터만으로는 부족한 순간이 많습니다. 날씨를 가져오거나, 검색 결과를 보여주거나, 다른 곳에 저장된 정보를 불러오려면 외부 서비스와 연결되어야 합니다.',
          '이때 사용하는 약속된 연결 통로가 바로 API입니다. API를 이해하면 앱이 혼자 움직이는 것이 아니라, 바깥 세상과도 연결될 수 있다는 감각을 얻게 됩니다.',
        ],
      },
      {
        title: 'API 요청과 응답의 기본 흐름 이해하기',
        summary: '앱이 요청을 보내고 서버가 응답을 돌려주는 기본 흐름을 쉬운 예시로 배웁니다.',
        whyImportant: '앞으로 fetch 같은 실제 코드 학습으로 넘어가기 전에 요청과 응답 구조를 먼저 이해해야 하기 때문입니다.',
        body: [
          'API를 이해했다면 다음은 요청과 응답이 어떤 순서로 움직이는지 보는 것이 중요합니다. 앱은 그냥 결과를 얻는 것이 아니라, 먼저 요청을 보내고 응답을 받은 뒤 화면을 바꿉니다.',
          '이 흐름을 이해하면 나중에 fetch 같은 코드도 훨씬 쉽게 배울 수 있고, 에러가 났을 때 어디에서 문제가 생겼는지도 더 잘 짐작할 수 있습니다.',
        ],
      },
    ],
    steps: [
      'API가 필요한 상황을 실생활 예시로 먼저 이해합니다.',
      '요청과 응답이 어떤 흐름으로 오가는지 그림처럼 정리합니다.',
      'fetch가 어떤 역할을 하는지 예시 코드와 함께 가볍게 살펴봅니다.',
      '내 서비스에서 붙여보고 싶은 외부 정보 하나를 정해봅니다.',
    ],
    prompts: [
      'API가 무엇인지 비개발자도 이해할 수 있게 비유로 설명해줘.',
      'fetch로 데이터를 가져오는 흐름을 초보자용 단계별 설명으로 바꿔줘.',
    ],
    checklist: [
      'API와 fetch의 역할을 설명할 수 있다.',
      '요청과 응답 흐름을 이해할 수 있다.',
      '내 서비스에 붙여볼 외부 데이터 아이디어를 정할 수 있다.',
    ],
    coachNotes: [
      'API는 처음엔 무섭지만 결국 “질문하고 답받는 구조”입니다. 구조를 먼저 이해하면 코드가 훨씬 쉬워집니다.',
      '바로 실제 API를 붙이지 않아도, 어떤 데이터를 왜 가져올지 정리하는 것만으로도 큰 진전입니다.',
    ],
  },
  {
    id: 'session-8',
    session: 8,
    stage: 'ship',
    stageLabel: '서비스 완성',
    difficulty: '중급',
    title: '서버리스와 CDN',
    summary: 'API 키를 숨기고 빠른 응답을 제공하기 위해 왜 서버리스와 CDN이 필요한지 이해합니다.',
    promise: '클라이언트에 비밀 정보를 그대로 두지 않고, 사용자에게는 더 빠른 화면을 제공하는 운영 감각을 익히며 과정을 마무리합니다.',
    learningGoal: '서버리스와 CDN의 역할, 차이점, 그리고 API 보안 및 성능과의 관계를 이해하는 것이 목표입니다.',
    assignment: '내 서비스에서 공개하면 안 되는 값 1개와 빠르게 보여주고 싶은 화면 1개를 정하고, 각각 서버리스와 CDN으로 어떻게 나눌지 글로 설명해 보세요.',
    output: 'API 보안 구조 메모와 서버리스/CDN 역할 구분표',
    duration: '60분',
    warmup: 'API 키를 브라우저에 그대로 넣으면 왜 위험할지 한 번 상상해보세요.',
    mindsetTip: '보안과 속도는 결국 “무엇을 숨기고, 무엇을 빠르게 전달할 것인가”를 나누는 판단에서 시작합니다.',
    prepItems: ['API 키 예시', '배포 환경 메모', '서버리스/CDN 비교표'],
    vocabulary: [
      { term: '서버리스 함수', easyMeaning: '필요할 때만 서버처럼 실행되는 코드' },
      { term: 'CDN', easyMeaning: '사용자와 가까운 서버에서 정적 파일을 빠르게 전송하는 네트워크' },
      { term: '환경 변수', easyMeaning: '코드에 직접 쓰지 않고 따로 숨겨서 관리하는 비밀 값' },
    ],
    readings: [
      {
        title: '서버리스는 왜 필요할까',
        summary: '서버리스가 앱 뒤에서 필요한 서버 기능을 필요할 때 실행하도록 맡기는 방식이라는 점을 이해합니다.',
        whyImportant: '초보자도 로그인 확인, 데이터 저장, 외부 API 호출 같은 서버 역할을 직접 서버를 운영하지 않고 구현할 수 있는 구조를 이해해야 하기 때문입니다.',
        body: [
          '서버리스는 앱 뒤에서 필요한 서버 기능을 클라우드 서비스가 대신 실행해 주는 방식입니다. 즉, 내가 직접 서버를 24시간 운영하지 않아도 필요한 순간에만 코드가 실행되어 로그인 확인, 데이터 저장, 폼 제출 처리, 외부 API 호출 같은 일을 맡길 수 있습니다.',
          '초보자 입장에서는 무거운 백엔드를 처음부터 직접 구축하기보다, 필요한 서버 기능을 작은 단위로 붙여 보는 방식이 훨씬 이해하기 쉽습니다. 예를 들어 사용자가 회원가입을 하거나, 문의 폼을 제출하거나, 외부 서비스의 데이터를 불러와야 할 때 이런 작업을 서버리스 함수가 처리할 수 있습니다.',
          '또한 서버리스는 환경 변수 같은 비밀 값을 함께 다루기 좋아서 외부 API와 연결할 때도 자주 사용됩니다. 사용자의 요청을 받은 뒤 필요한 데이터를 저장하고, 외부 API를 호출하고, 결과만 다시 화면으로 돌려주는 흐름을 작게 나누어 구현할 수 있다는 점이 핵심입니다.',
        ],
      },
      {
        title: 'CDN은 왜 빠를까',
        summary: '정적 파일을 사용자와 가까운 위치에서 전달하는 CDN의 역할을 이해합니다.',
        whyImportant: '보안만큼이나 중요한 것이 사용자에게 빠르게 화면을 보여주는 일이며, 이때 CDN이 핵심 역할을 하기 때문입니다.',
        body: [
          'CDN은 이미지, HTML, CSS, JS 같은 정적 파일을 여러 지역에 복제해 두고 사용자와 가까운 곳에서 빠르게 전달하는 구조입니다.',
          '실제 서비스에서는 CDN과 서버리스 함수가 함께 쓰이는 경우가 많습니다. 첫 화면에 보이는 HTML, CSS, 이미지 같은 파일은 CDN이 빠르게 전달하고, 로그인 확인이나 데이터 저장, 외부 API 호출처럼 계산이 필요한 작업은 서버리스 함수가 처리하는 식입니다.',
          '즉 CDN은 “빠르게 보여줘야 하는 파일”을 맡고, 서버리스 함수는 “요청이 들어왔을 때 뒤에서 처리해야 하는 일”을 맡는다고 이해하면 초보자도 구조를 쉽게 나눌 수 있습니다.',
        ],
      },
    ],
    steps: [
      '클라이언트와 서버의 역할을 API 키 예시로 다시 정리합니다.',
      '왜 API 키를 브라우저 코드에 직접 넣으면 안 되는지 이해합니다.',
      '서버리스와 CDN이 각각 잘 맞는 상황을 구분해봅니다.',
      '내가 만들 서비스에서 어느 부분을 서버리스로 숨기고, 어느 부분을 CDN으로 빠르게 전달할지 적어봅니다.',
    ],
    prompts: [
      '서버리스와 CDN의 차이를 초보자도 이해할 수 있게 표로 정리해줘.',
      'API 키를 안전하게 관리하고 화면은 빠르게 보여주는 구조를 비개발자 기준으로 설명해줘.',
    ],
    checklist: [
      'API 키를 왜 숨겨야 하는지 설명할 수 있다.',
      '서버리스와 CDN의 차이를 이해할 수 있다.',
      '내 서비스에 적용할 보안과 속도 개선 아이디어를 하나 이상 정할 수 있다.',
    ],
    coachNotes: [
      '처음부터 모든 보안을 완벽히 아는 사람은 없습니다. 중요한 것은 비밀 값을 공개 코드에 두지 않는 습관입니다.',
      '빠르게 보여줘야 하는 파일인지, 비밀 값을 숨겨야 하는 요청인지에 따라 서버리스와 CDN의 역할이 달라질 수 있습니다.',
    ],
  },
];

function gallerySubmission(
  lessonId: string,
  previewStatus: 'published' | 'reviewing' | 'draft',
  problemStatement: string,
  promptText: string,
  resultLink: string,
  previewTitle: string,
  previewNote: string,
) {
  return {
    lessonId,
    previewStatus,
    problemStatement,
    promptText,
    resultLink,
    previewTitle,
    previewNote,
  };
}

export const galleryStudents: GalleryStudent[] = [
  {
    id: 'soyeon-kim',
    name: '김소연',
    role: '초등 교사',
    cohort: '2026 상반기',
    focus: '읽기 습관 형성 앱',
    note: '저학년 독서 동기를 높이는 수업용 웹 앱을 만들고 있습니다.',
    submissions: [
      gallerySubmission('session-1', 'published', '학생들이 독서를 숙제처럼 느끼지 않게 만들고 싶다.', '초등학생이 책 읽기를 게임처럼 느끼게 하는 서비스 아이디어를 정리해줘.', 'https://reader-sprout.vercel.app', 'Reader Sprout', '아이디어 정의와 첫 화면 방향이 깔끔하게 연결되었습니다.'),
      gallerySubmission('session-2', 'published', '독서 미션 알림을 학생별로 다르게 보내고 싶다.', '학생 이름과 주간 미션을 넣어 메일머지용 안내 문구를 작성해줘.', 'https://reader-sprout.vercel.app/mail', 'Reader Mail Flow', '메일머지 구조와 학부모 알림 흐름을 정리했습니다.'),
      gallerySubmission('session-3', 'reviewing', 'Antigravity에서 어디부터 요청해야 할지 막막했다.', '초보 교사가 독서 기록 앱을 만들 때 Antigravity에 처음 요청할 문장을 정리해줘.', 'https://reader-sprout.vercel.app/plan', 'Prompt Starter', '도구 적응 단계라 계획 화면을 중심으로 점검 중입니다.'),
      gallerySubmission('session-4', 'published', '랜딩 페이지의 문구와 화면 구성이 계속 흔들렸다.', '초등 독서 앱 랜딩 페이지를 따뜻한 톤으로 구성하는 작업 요청 프롬프트를 만들어줘.', 'https://reader-sprout.vercel.app/landing', 'Landing Draft', '작업 요청과 수정 루틴이 잘 남아 있습니다.'),
      gallerySubmission('session-5', 'published', '학생별 기록을 저장해서 다시 보여주고 싶다.', '독서 앱에서 학생 이름, 읽은 책, 배지 상태를 저장하는 Firestore 구조를 제안해줘.', 'https://reader-sprout.vercel.app/dashboard', 'Reading Database', '기록 보드와 저장 구조가 서비스처럼 보이기 시작했습니다.'),
      gallerySubmission('session-6', 'reviewing', '학생과 교사를 구분해서 다른 화면을 보여주고 싶다.', '교사/학생 역할에 따라 다른 홈 화면을 보여주는 로그인 흐름을 설명해줘.', 'https://reader-sprout.vercel.app/login', 'Role-based Login', '권한 분기와 안내 문구를 조금 더 다듬는 중입니다.'),
      gallerySubmission('session-7', 'draft', '도서 정보 API를 붙여 추천 책을 보여주고 싶다.', '독서 앱에서 외부 책 정보를 요청하고 추천 카드로 보여주는 API 흐름을 정리해줘.', 'https://reader-sprout.vercel.app/api', 'Book API Flow', '외부 API 연결 전 단계의 요청 구조를 정리했습니다.'),
      gallerySubmission('session-8', 'published', 'API 키를 노출하지 않고 추천 결과를 빠르게 보여주고 싶다.', '도서 검색 요청은 서버리스로 보내고, 정적 화면은 빠르게 전달하는 구조를 설명해줘.', 'https://reader-sprout.vercel.app/infra', 'Safe Reading Infra', '서버리스와 CDN 역할 구분이 명확하게 정리되었습니다.'),
    ],
  },
  {
    id: 'minji-park',
    name: '박민지',
    role: '중등 영어 교사',
    cohort: '2026 상반기',
    focus: '영어 말하기 피드백 도구',
    note: '영어 말하기 과제를 학생별로 모으고 피드백하는 흐름을 만들고 있습니다.',
    submissions: [
      gallerySubmission('session-1', 'published', '학생들이 말하기 연습을 꾸준히 남기게 돕고 싶다.', '영어 말하기 과제를 기록하고 칭찬 피드백을 주는 서비스 아이디어를 한 줄로 정리해줘.', 'https://speak-bloom.vercel.app', 'Speak Bloom', '서비스 문제 정의가 분명하고 사용자가 잘 보입니다.'),
      gallerySubmission('session-2', 'published', '학생별 과제 안내를 개별 문구로 보내고 싶다.', '학생 이름, 과제 주제, 제출 마감일이 들어가는 메일머지 안내문을 작성해줘.', 'https://speak-bloom.vercel.app/mail', 'Assignment Mailer', '개인화 안내 흐름이 자연스럽게 정리됐습니다.'),
      gallerySubmission('session-3', 'reviewing', '새 도구를 어떤 순서로 써야 하는지 감이 필요했다.', '영어 말하기 피드백 앱을 만드는 교사 관점에서 Antigravity 사용 순서를 정리해줘.', 'https://speak-bloom.vercel.app/workflow', 'Tool Workflow', '도구 소개를 실제 작업 순서와 연결했습니다.'),
      gallerySubmission('session-4', 'published', '작업 요청을 구체적으로 쓰는 훈련이 필요했다.', '학생 말하기 과제 앱 첫 화면을 만드는 데 필요한 작업 지시 프롬프트를 작성해줘.', 'https://speak-bloom.vercel.app/prompt', 'Prompt Practice', '검토 포인트까지 함께 남겨둔 점이 좋습니다.'),
      gallerySubmission('session-5', 'published', '학생별 녹음 제출 여부와 교사 피드백을 저장하고 싶다.', '영어 말하기 제출 앱에서 학생, 과제, 피드백을 저장하는 Firestore 구조를 제안해줘.', 'https://speak-bloom.vercel.app/submissions', 'Submission Database', '데이터 구조가 비교적 안정적으로 설계되었습니다.'),
      gallerySubmission('session-6', 'published', '학생과 교사가 보는 페이지를 분리하고 싶다.', '학생과 교사가 각각 다른 홈 화면을 보는 Firebase 로그인 구조를 설명해줘.', 'https://speak-bloom.vercel.app/auth', 'Teacher / Student Login', '인증 흐름이 실제 서비스 느낌으로 정리되었습니다.'),
      gallerySubmission('session-7', 'reviewing', '음성 분석 API를 붙이는 흐름을 먼저 이해하고 싶다.', '녹음 파일 분석 API 요청과 응답 흐름을 초보자도 이해하게 설명해줘.', 'https://speak-bloom.vercel.app/api', 'Speech API Plan', 'API 연동 전 준비 단계가 잘 드러납니다.'),
      gallerySubmission('session-8', 'draft', '분석 요청은 안전하게 보내고 결과 화면은 빠르게 유지하고 싶다.', '학생 음성 분석 서비스에서 서버리스와 CDN을 어떻게 나누면 좋은지 정리해줘.', 'https://speak-bloom.vercel.app/infra', 'Delivery & Security', '마지막 인프라 정리 단계의 초안입니다.'),
    ],
  },
  {
    id: 'jiyoon-lee',
    name: '이지윤',
    role: '고등 정보 교사',
    cohort: '2026 상반기',
    focus: '수업 프로젝트 전시 갤러리',
    note: '학생 프로젝트를 학급별로 모아 보여주는 전시형 갤러리를 만들고 있습니다.',
    submissions: [
      gallerySubmission('session-1', 'published', '학생 결과물을 한눈에 보여주는 전시 공간이 필요하다.', '교사가 학생 작품을 모아 보여주는 프로젝트 갤러리 서비스 아이디어를 정리해줘.', 'https://class-showcase.vercel.app', 'Class Showcase', '문제 정의와 사용 장면이 선명합니다.'),
      gallerySubmission('session-2', 'reviewing', '학부모 초대 메일을 학생별로 다르게 보내고 싶다.', '학생 이름과 작품 제목이 들어가는 전시 초대 메일머지 문구를 작성해줘.', 'https://class-showcase.vercel.app/invite', 'Invite Flow', '이벤트 공지 흐름을 메일머지로 확장했습니다.'),
      gallerySubmission('session-3', 'published', 'Antigravity를 프로젝트 전시 화면 설계에 써보고 싶다.', '학생 작품 갤러리 제작에 Antigravity를 어떻게 쓰면 좋은지 초보자용으로 설명해줘.', 'https://class-showcase.vercel.app/explore', 'Gallery Setup', '도구 이해와 활용 장면이 잘 이어집니다.'),
      gallerySubmission('session-4', 'published', '초안 생성과 수정 요청을 반복하는 루틴을 만들고 싶다.', '학생 작품 갤러리 홈 화면을 만드는 구체적 작업 요청 프롬프트를 작성해줘.', 'https://class-showcase.vercel.app/iterate', 'Iteration Routine', '수정 과정을 잘 기록해 둔 사례입니다.'),
      gallerySubmission('session-5', 'published', '작품 설명, 팀명, 링크를 저장하는 구조가 필요하다.', '전시 갤러리 앱에 맞는 Firebase 데이터 구조를 제안해줘.', 'https://class-showcase.vercel.app/projects', 'Project Database', '데이터베이스 연결 이후 서비스 느낌이 크게 살아났습니다.'),
      gallerySubmission('session-6', 'reviewing', '학생 업로드와 교사 관리 화면을 분리하고 싶다.', '학생과 교사가 다른 기능을 쓰는 로그인 구조를 쉬운 말로 설명해줘.', 'https://class-showcase.vercel.app/login', 'Access Flow', '역할 분리 아이디어를 검토 중입니다.'),
      gallerySubmission('session-7', 'published', '외부 동영상 링크나 임베드 정보를 불러오고 싶다.', '외부 콘텐츠 정보를 가져와 카드형으로 보여주는 API 흐름을 설명해줘.', 'https://class-showcase.vercel.app/embed', 'Media API', 'API를 서비스 화면과 잘 연결했습니다.'),
      gallerySubmission('session-8', 'published', '전시 이미지는 빠르게 보여주고 민감 정보는 숨기고 싶다.', '전시 갤러리 서비스에서 CDN과 서버리스 함수를 어떻게 나눌지 정리해줘.', 'https://class-showcase.vercel.app/ops', 'Gallery Infra', '배포와 운영 구조를 비교적 안정적으로 설명했습니다.'),
    ],
  },
];
