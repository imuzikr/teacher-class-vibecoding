import './style.css';
import { appName, courseLabel, courseLessons } from './data.ts';
import {
  clearLessonPreview,
  getLessonPreview,
  getLessonSubmission,
  getState,
  isLessonComplete,
  resetProgress,
  setLastVisitedLesson,
  toggleLessonComplete,
  updateLessonPreview,
  updateLessonSubmission,
} from './storage.ts';
import type { AppRoute, CourseLesson, LinkPreviewData } from './types.ts';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('앱 루트를 찾을 수 없습니다.');
}

document.documentElement.lang = 'ko';
document.title = `${appName} | 초보자용 8차시 코스`;

const app = appRoot;
const totalLessons = courseLessons.length;
let lastSavedSubmissionKey: string | null = null;
let lastPreviewStatus: { lessonId: string; state: 'idle' | 'loading' | 'success' | 'error'; message: string } | null = null;

function parseRoute(): AppRoute {
  const hash = window.location.hash.replace(/^#/, '');

  if (hash === '/classroom') {
    return { view: 'classroom' };
  }

  if (hash.startsWith('/lesson/')) {
    const lessonId = hash.replace('/lesson/', '').trim();
    const lesson = courseLessons.find((item) => item.id === lessonId);
    if (lesson) {
      return { view: 'lesson', lessonId: lesson.id };
    }
  }

  return { view: 'landing' };
}

function navigateTo(route: string) {
  if (window.location.hash === route) {
    render();
    return;
  }

  window.location.hash = route;
}

function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  const stickyHeader = document.querySelector<HTMLElement>('.lesson-shell-topbar, .topbar');
  const headerOffset = stickyHeader ? stickyHeader.getBoundingClientRect().height : 0;
  const top = window.scrollY + target.getBoundingClientRect().top - headerOffset - 24;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: 'smooth',
  });
}

function extractHostname(link: string) {
  if (!link.trim()) {
    return '';
  }

  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function buildFaviconUrl(hostname: string) {
  if (!hostname) {
    return '';
  }

  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
}

function normalizeUrl(link: string) {
  const trimmed = link.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

async function fetchLinkPreview(link: string) {
  const normalized = normalizeUrl(link);
  if (!normalized) {
    throw new Error('링크가 비어 있습니다.');
  }

  const response = await fetch(`/api/link-preview?url=${encodeURIComponent(normalized)}`);
  if (!response.ok) {
    throw new Error('미리보기 정보를 가져오지 못했습니다.');
  }

  return (await response.json()) as LinkPreviewData;
}

function renderInlineReadings(lesson: CourseLesson) {
  return `
    <article class="lesson-dark-panel" id="lesson-readings">
      <div class="lesson-panel-head">
        <h2>Reading Notes</h2>
      </div>
      <div class="lesson-inline-reading-grid">
        ${lesson.readings
          .map(
            (reading) => `
              <article class="lesson-inline-reading-card">
                <p class="lesson-inline-reading-label">읽기 자료</p>
                <div class="lesson-inline-reading-title">${reading.title}</div>
                <p>${reading.summary}</p>
                <p><strong>왜 중요한가:</strong> ${reading.whyImportant}</p>
                ${reading.body.map((paragraph) => `<p>${paragraph}</p>`).join('')}
              </article>
            `,
          )
          .join('')}
      </div>
    </article>
  `;
}

function progressSummary() {
  const completedCount = courseLessons.filter((lesson) => isLessonComplete(lesson.id)).length;
  const percent = Math.round((completedCount / totalLessons) * 100);

  return {
    completedCount,
    percent,
    remainingCount: totalLessons - completedCount,
  };
}

function currentLesson(route: AppRoute) {
  if (route.view !== 'lesson') {
    return null;
  }

  return courseLessons.find((lesson) => lesson.id === route.lessonId) ?? null;
}

function nextLesson() {
  return courseLessons.find((lesson) => !isLessonComplete(lesson.id)) ?? courseLessons[courseLessons.length - 1];
}

function previousLessonFor(lesson: CourseLesson) {
  return courseLessons[lesson.session - 2] ?? null;
}

function nextLessonFor(lesson: CourseLesson) {
  return courseLessons[lesson.session] ?? null;
}

function header(route: AppRoute) {
  const summary = progressSummary();

  if (route.view === 'lesson') {
    return `
      <header class="lesson-shell-topbar">
        <a class="lesson-topbar-brand" href="#/" data-route="#/">
          <strong>${appName}</strong>
          <small>${courseLabel}</small>
        </a>
        <nav class="lesson-shell-nav" aria-label="주요 탐색">
          <button class="lesson-shell-link active" type="button" data-route="#/">Curriculum</button>
          <button class="lesson-shell-link" type="button" data-route="#/lesson/${route.lessonId}">Workspace</button>
          <button class="lesson-shell-link" type="button" data-route="#/classroom">Community</button>
          <button class="lesson-shell-link" type="button" data-route="#/classroom">Resources</button>
        </nav>
        <div class="lesson-shell-actions">
          <button class="lesson-shell-icon" type="button" aria-label="알림">◌</button>
          <button class="lesson-shell-icon" type="button" aria-label="설정">✦</button>
          <div class="lesson-shell-avatar">VC</div>
        </div>
      </header>
    `;
  }

  if (route.view === 'landing' || route.view === 'classroom') {
    return `
      <header class="topbar">
        <strong class="topbar-title">Course Dashboard</strong>
        <label class="topbar-search" aria-label="커리큘럼 검색">
          <span class="search-icon">⌕</span>
          <input type="text" placeholder="Search curriculum..." />
        </label>
        <div class="topbar-end">
          <nav class="topnav" aria-label="주요 탐색">
            <button class="nav-link active" type="button" data-route="#/">Overview</button>
            <button class="nav-link" type="button" data-route="#/classroom">Resources</button>
            <button class="nav-link" type="button" data-route="#/classroom">Community</button>
          </nav>
          <div class="topbar-icons" aria-label="빠른 메뉴">
            <button class="topbar-icon" type="button" aria-label="알림">◌</button>
            <button class="topbar-icon" type="button" aria-label="프로필">◎</button>
          </div>
        </div>
      </header>
    `;
  }

  return `
    <header class="topbar">
      <div class="topbar-start">
        <a class="brand-link" href="#/" data-route="#/">
          <span class="brand-mark">VC</span>
          <span>
            <strong>${appName}</strong>
            <small>${courseLabel}</small>
          </span>
        </a>
        <strong class="topbar-title">Course Dashboard</strong>
      </div>
      <label class="topbar-search" aria-label="커리큘럼 검색">
        <span class="search-icon">⌕</span>
        <input type="text" placeholder="Search curriculum..." />
      </label>
      <div class="topbar-end">
        <nav class="topnav" aria-label="주요 탐색">
          <button class="nav-link" type="button" data-route="#/">Dashboard</button>
          <button class="nav-link active" type="button" data-route="#/lesson/${nextLesson().id}">Lesson Detail</button>
          <button class="nav-link" type="button" data-route="#/classroom">Overview</button>
        </nav>
        <div class="topbar-progress">
          <span>${summary.percent}% Complete</span>
          <strong>${summary.completedCount}/${totalLessons}</strong>
        </div>
      </div>
    </header>
  `;
}

function classroomHero() {
  return `
    <section class="dashboard-hero">
      <div class="dashboard-kicker-row">
        <span class="dashboard-kicker">Summer 2026</span>
        <div class="dashboard-line"></div>
      </div>
      <h1>Curriculum Journey</h1>
      <p>
        바이브 코딩의 기초부터 Firebase, API, 서버리스와 CDN까지 초보자도 차근차근 따라갈 수 있도록
        설계한 8차시 학습 여정입니다.
      </p>
    </section>
  `;
}

function classroomSidebar() {
  const activeLessonId = getState().lastVisitedLessonId ?? nextLesson().id;

  return `
    <aside class="dashboard-sidebar">
      <div class="dashboard-sidebar-head">
        <strong>${appName}</strong>
        <p>Vibe Coding Workshop</p>
      </div>
      <nav class="dashboard-session-nav" aria-label="세션 탐색">
        ${courseLessons
          .map((lesson) => {
            const active = lesson.id === activeLessonId;
            return `
              <button
                class="dashboard-session-link ${active ? 'active' : ''}"
                type="button"
                data-route="#/lesson/${lesson.id}"
              >
                <span class="dashboard-session-number">Session ${String(lesson.session).padStart(2, '0')}</span>
              </button>
            `;
          })
          .join('')}
      </nav>
      <div class="dashboard-sidebar-tools">
        <button class="dashboard-resource-button" type="button" data-route="#/lesson/${nextLesson().id}">Resources</button>
        <button class="dashboard-tool-link" type="button" data-route="#/">Docs</button>
        <button class="dashboard-tool-link" type="button" data-action="reset-progress">Reset Progress</button>
      </div>
      <div class="dashboard-profile">
        <div class="dashboard-profile-avatar">VC</div>
        <div>
          <strong>Vibe Coder</strong>
          <p>Beginner Track</p>
        </div>
      </div>
    </aside>
  `;
}

function classroomCards() {
  const summary = progressSummary();
  const readingCount = courseLessons.reduce((count, lesson) => count + lesson.readings.length, 0);

  return `
    <section class="dashboard-card-grid">
      ${courseLessons
        .map((lesson) => {
            const completed = isLessonComplete(lesson.id);
            return `
              <article class="curriculum-card ${completed ? 'completed' : ''}" data-route="#/lesson/${lesson.id}" tabindex="0" role="link" aria-label="${lesson.title} 상세 페이지로 이동">
                <span class="curriculum-card-label">Session ${String(lesson.session).padStart(2, '0')}</span>
                <h3>${lesson.title}</h3>
                <div class="curriculum-section">
                  <p>Objectives</p>
                  <ul>
                    ${lesson.steps
                      .slice(0, 2)
                      .map((step) => `<li>${step}</li>`)
                      .join('')}
                  </ul>
                </div>
                <div class="curriculum-section">
                  <p>Readings</p>
                  <div class="curriculum-reading-list">
                    ${lesson.readings
                      .slice(0, 2)
                      .map((reading) => `<span>${reading.title}</span>`)
                      .join('')}
                  </div>
                </div>
                <button class="module-button" type="button" data-route="#/lesson/${lesson.id}">Explore Module</button>
              </article>
            `;
          })
          .join('')}
    </section>

    <section class="dashboard-lower">
      <article class="instructor-insight">
        <p class="dashboard-section-label">Instructor Insight</p>
        <div class="insight-body">
          <div class="insight-avatar">VC</div>
          <div>
            <p>
              "바이브 코딩은 단순한 기술이 아니라, 코드와 직관을 연결하는 작업 방식입니다.
              여덟 번의 세션을 통해 당신만의 흐름을 완성해 보세요."
            </p>
            <span>Lead Curator</span>
          </div>
        </div>
      </article>
      <section class="learning-milestone">
        <div class="milestone-head">
          <p class="dashboard-section-label">Learning Milestone</p>
          <span>${summary.percent}% Complete</span>
        </div>
        <div class="milestone-track">
          <span style="width: ${summary.percent}%"></span>
        </div>
        <div class="milestone-stats">
          <article>
            <strong>${String(totalLessons).padStart(2, '0')}</strong>
            <span>Total Sessions</span>
          </article>
          <article>
            <strong>${String(readingCount).padStart(2, '0')}</strong>
            <span>Resources</span>
          </article>
          <article>
            <strong>${String(summary.completedCount).padStart(2, '0')}</strong>
            <span>Completed</span>
          </article>
        </div>
      </section>
    </section>
  `;
}

function renderClassroom() {
  return `
    <main class="dashboard-page">
      ${classroomSidebar()}
      <section class="dashboard-main">
        ${classroomHero()}
        ${classroomCards()}
        <footer class="dashboard-footer">
          <span>© 2026 Vibe Coding Starter</span>
          <div>
            <span>Privacy</span>
            <span>Terms</span>
            <span>System Status</span>
          </div>
        </footer>
      </section>
    </main>
  `;
}

function renderLanding() {
  return renderClassroom();
}

function renderLesson(lesson: CourseLesson) {
  const completed = isLessonComplete(lesson.id);
  const prevLesson = previousLessonFor(lesson);
  const upcomingLesson = nextLessonFor(lesson);
  const summary = progressSummary();
  const objectiveItems = lesson.checklist.slice(0, 3);
  const submission = getLessonSubmission(lesson.id);
  const resultHostname = extractHostname(submission.resultLink);
  const faviconUrl = buildFaviconUrl(resultHostname);
  const preview = getLessonPreview(lesson.id);
  const previewImage = preview?.image?.trim() ?? '';
  const previewTitle = preview?.title?.trim() || lesson.title;
  const previewDescription =
    preview?.description?.trim() ||
    (submission.problemStatement.trim()
      ? submission.problemStatement.trim()
      : '문제 정의를 입력하면 이 카드에 함께 표시됩니다.');
  const previewDomain = preview?.siteName?.trim() || resultHostname || '링크 미입력';
  const previewFavicon = preview?.favicon?.trim() || faviconUrl;
  const problemSaved = lastSavedSubmissionKey === `${lesson.id}:problemStatement`;
  const promptSaved = lastSavedSubmissionKey === `${lesson.id}:promptText`;
  const linkSaved = lastSavedSubmissionKey === `${lesson.id}:resultLink`;
  const previewState = lastPreviewStatus?.lessonId === lesson.id ? lastPreviewStatus : null;

  return `
    <main class="lesson-workspace-page">
      <aside class="lesson-workspace-rail">
        <section class="lesson-path-panel">
          <p class="lesson-panel-label">Workshop Path</p>
          <strong>${summary.percent}% Complete</strong>
          <div class="lesson-progress-track"><span style="width:${summary.percent}%"></span></div>
        </section>
        <nav class="lesson-anchor-nav" aria-label="차시 섹션">
          <button class="lesson-anchor-link active" type="button" data-jump="lesson-overview">Introduction</button>
          <button class="lesson-anchor-link" type="button" data-jump="lesson-objectives">Lesson Objectives</button>
          <button class="lesson-anchor-link" type="button" data-jump="lesson-practice">Practice Flow</button>
          <button class="lesson-anchor-link" type="button" data-jump="lesson-readings">Reading Notes</button>
          <button class="lesson-anchor-link" type="button" data-jump="lesson-submission">Project Submission</button>
          <button class="lesson-anchor-link" type="button" data-jump="lesson-completion">Completion</button>
        </nav>
        <article class="lesson-nextup-panel">
          <p>Next up: ${upcomingLesson ? upcomingLesson.title : '강의실 돌아가기'}</p>
          <button class="lesson-continue-button" type="button" data-route="${upcomingLesson ? `#/lesson/${upcomingLesson.id}` : '#/classroom'}">
            Continue Session
          </button>
        </article>
      </aside>

      <section class="lesson-workspace-main">
        <section class="lesson-overview" id="lesson-overview">
          <div class="lesson-overview-breadcrumbs">
            <span>Curriculum</span>
            <span>›</span>
            <span>Session ${String(lesson.session).padStart(2, '0')}</span>
          </div>
          <h1>Session ${String(lesson.session).padStart(2, '0')}: ${lesson.title}</h1>
          <p>${lesson.summary}</p>
        </section>

        <section class="lesson-top-grid">
          <article class="lesson-canvas-panel">
            <div class="lesson-canvas-copy">
              <p class="lesson-panel-label">Session Canvas</p>
              <h2>${lesson.promise}</h2>
              <p>${lesson.learningGoal}</p>
            </div>
            <div class="lesson-canvas-meta">
              <div>
                <span>Duration</span>
                <strong>${lesson.duration}</strong>
              </div>
              <div>
                <span>Deliverable</span>
                <strong>${lesson.output}</strong>
              </div>
              <div>
                <span>Warm-up</span>
                <strong>${lesson.warmup}</strong>
              </div>
            </div>
          </article>

          <div class="lesson-right-stack">
            <article class="lesson-side-panel workspace-panel">
              <p class="lesson-panel-label">Live Workspace</p>
              <div class="workspace-code">
                <code>
                  ${`const session = "${lesson.title}";`}
                  <br />
                  ${`const goal = "${lesson.promise}";`}
                  <br />
                  <br />
                  ${'// Current session insight'}
                  <br />
                  ${`"${lesson.prompts[0] ?? lesson.assignment}"`}
                </code>
              </div>
            </article>

            <article class="lesson-side-panel pulse-panel">
              <p class="lesson-panel-label">Today's Pulse</p>
              <div class="pulse-items">
                <span>${lesson.readings.length} readings</span>
                <span>${lesson.prepItems.length} prep items</span>
                <span>${lesson.prompts.length} prompts</span>
              </div>
            </article>
          </div>
        </section>

        <section class="lesson-content-grid">
          <div class="lesson-content-main">
            <article class="lesson-dark-panel" id="lesson-objectives">
              <div class="lesson-panel-head">
                <h2>Lesson Objectives</h2>
              </div>
              <div class="lesson-objective-list">
                ${objectiveItems
                  .map(
                    (item, index) => `
                      <div class="lesson-objective-item">
                        <span>${String(index + 1).padStart(2, '0')}</span>
                        <p>${item}</p>
                      </div>
                    `,
                  )
                  .join('')}
              </div>
            </article>

            <article class="lesson-dark-panel" id="lesson-practice">
              <div class="lesson-panel-head">
                <h2>Practice Flow</h2>
              </div>
              <ol class="lesson-flow-list">
                ${lesson.steps.map((step) => `<li>${step}</li>`).join('')}
              </ol>
            </article>

            ${renderInlineReadings(lesson)}

            <article class="lesson-dark-panel" id="lesson-submission">
              <div class="lesson-panel-head">
                <h2>Project Submission</h2>
              </div>
              <p class="lesson-submission-intro">
                이번 차시의 문제 정의부터 실습에 사용한 프롬프트, 최종 결과물 링크까지 한 번에 정리해 두세요.
              </p>
              <div class="lesson-submission-form" data-submission-form="${lesson.id}">
                <label class="lesson-form-field">
                  <span>문제 정의와 해결 방향</span>
                  <small>무엇이 문제인지, 그리고 어떻게 해결하고 싶은지 적어보세요.</small>
                  <textarea
                    rows="5"
                    data-submission-lesson="${lesson.id}"
                    data-submission-field="problemStatement"
                    placeholder="${lesson.assignment}"
                  >${submission.problemStatement}</textarea>
                  <div class="lesson-field-actions">
                    <button
                      class="lesson-inline-save-button"
                      type="button"
                      data-action="save-submission-field"
                      data-lesson-id="${lesson.id}"
                      data-submission-field="problemStatement"
                    >
                      Save
                    </button>
                    <span class="lesson-inline-save-status ${problemSaved ? 'visible' : ''}">
                      ${problemSaved ? '문제 정의가 저장되었습니다.' : '입력 후 저장 버튼을 눌러 반영하세요.'}
                    </span>
                  </div>
                </label>
                <label class="lesson-form-field">
                  <span>실습에 사용한 프롬프트</span>
                  <small>실습 중 실제로 입력한 프롬프트를 복사해 두면 나중에 다시 활용하기 좋습니다.</small>
                  <textarea
                    rows="5"
                    data-submission-lesson="${lesson.id}"
                    data-submission-field="promptText"
                    placeholder="${lesson.prompts[0] ?? '실습에 사용한 프롬프트를 입력하세요.'}"
                  >${submission.promptText}</textarea>
                  <div class="lesson-field-actions">
                    <button
                      class="lesson-inline-save-button"
                      type="button"
                      data-action="save-submission-field"
                      data-lesson-id="${lesson.id}"
                      data-submission-field="promptText"
                    >
                      Save
                    </button>
                    <span class="lesson-inline-save-status ${promptSaved ? 'visible' : ''}">
                      ${promptSaved ? '프롬프트가 저장되었습니다.' : '입력 후 저장 버튼을 눌러 반영하세요.'}
                    </span>
                  </div>
                </label>
                <label class="lesson-form-field">
                  <span>최종 결과물 링크</span>
                  <small>배포한 웹 앱, 문서, 시연 페이지 등 최종 결과물을 확인할 수 있는 링크를 남겨보세요.</small>
                  <input
                    type="url"
                    data-submission-lesson="${lesson.id}"
                    data-submission-field="resultLink"
                    placeholder="https://"
                    value="${submission.resultLink}"
                  />
                  <div class="lesson-field-actions">
                    <button
                      class="lesson-inline-save-button"
                      type="button"
                      data-action="save-submission-field"
                      data-lesson-id="${lesson.id}"
                      data-submission-field="resultLink"
                    >
                      Save
                    </button>
                    <span class="lesson-inline-save-status ${linkSaved ? 'visible' : ''}">
                      ${linkSaved ? '결과물 링크가 저장되었습니다. 아래 미리보기를 확인해 보세요.' : '링크 저장 후 결과물 카드가 업데이트됩니다.'}
                    </span>
                  </div>
                </label>
                <article class="result-preview-card ${submission.resultLink.trim() ? 'filled' : 'empty'}">
                  <div class="result-preview-visual">
                    ${
                      previewImage
                        ? `
                          <img class="result-preview-image" src="${previewImage}" alt="${previewTitle} preview" />
                          <div class="result-preview-badge">
                            ${previewFavicon ? `<img src="${previewFavicon}" alt="${previewDomain} favicon" />` : ''}
                            <span>${previewDomain}</span>
                          </div>
                        `
                        : resultHostname
                        ? `
                          <div class="result-preview-badge">
                            ${previewFavicon ? `<img src="${previewFavicon}" alt="${previewDomain} favicon" />` : ''}
                            <span>${previewDomain}</span>
                          </div>
                          <strong>${previewTitle}</strong>
                          <p>${previewDomain}</p>
                        `
                        : `
                          <div class="result-preview-placeholder">
                            <span>Preview</span>
                          </div>
                          <strong>링크를 저장하면 결과물 카드가 활성화됩니다.</strong>
                          <p>대표 이미지는 없어도 도메인과 링크 정보를 중심으로 미리보기를 보여줍니다.</p>
                        `
                    }
                  </div>
                  <div class="result-preview-meta">
                    <span class="result-preview-label">Result Preview</span>
                    <strong>${previewTitle}</strong>
                    <p>${previewDescription}</p>
                  </div>
                  <div class="result-preview-footer">
                    <div>
                      <span class="result-preview-domain">${previewDomain}</span>
                      <small>${submission.resultLink.trim() || '최종 결과물 링크를 입력하면 바로가기 버튼이 활성화됩니다.'}</small>
                      ${
                        previewState
                          ? `<small class="result-preview-status ${previewState.state}">${previewState.message}</small>`
                          : ''
                      }
                    </div>
                    ${
                      submission.resultLink.trim()
                        ? `<a class="result-preview-button" href="${submission.resultLink}" target="_blank" rel="noreferrer">Open App ↗</a>`
                        : `<span class="result-preview-button disabled">Open App ↗</span>`
                    }
                  </div>
                </article>
              </div>
            </article>
          </div>

          <aside class="lesson-content-side">
            <article class="lesson-side-panel">
              <div class="lesson-panel-head">
                <h2>Coach Notes</h2>
              </div>
              <div class="lesson-reading-stack">
                ${lesson.coachNotes
                  .map(
                    (note) => `
                      <article class="lesson-reading-card">
                        <strong>코치 메모</strong>
                        <p>${note}</p>
                      </article>
                    `,
                  )
                  .join('')}
              </div>
            </article>

            <article class="lesson-side-panel">
              <div class="lesson-panel-head">
                <h2>준비물</h2>
              </div>
              <div class="lesson-kit-list">
                ${lesson.prepItems.map((item) => `<span>${item}</span>`).join('')}
              </div>
              <div class="lesson-vocab-stack">
                ${lesson.vocabulary
                  .map(
                    (item) => `
                      <div>
                        <strong>${item.term}</strong>
                        <p>${item.easyMeaning}</p>
                      </div>
                    `,
                  )
                  .join('')}
              </div>
            </article>

            <article class="lesson-side-panel" id="lesson-completion">
              <div class="lesson-panel-head">
                <h2>Completion</h2>
              </div>
              <p class="lesson-completion-copy">${completed ? '완료한 차시입니다. 필요하면 다시 학습해도 좋습니다.' : '완료 체크를 남기면 대시보드 진행률에 바로 반영됩니다.'}</p>
              <button class="lesson-complete-button" type="button" data-action="toggle-complete" data-lesson-id="${lesson.id}">
                ${completed ? 'Mark as In Progress' : 'Mark as Complete'}
              </button>
              <div class="lesson-nav-buttons">
                ${
                  prevLesson
                    ? `<button class="lesson-nav-button secondary" type="button" data-route="#/lesson/${prevLesson.id}">Previous Session</button>`
                    : `<button class="lesson-nav-button secondary" type="button" data-route="#/">Back to Dashboard</button>`
                }
                ${
                  upcomingLesson
                    ? `<button class="lesson-nav-button" type="button" data-route="#/lesson/${upcomingLesson.id}">Next Session</button>`
                    : `<button class="lesson-nav-button" type="button" data-route="#/classroom">Course Overview</button>`
                }
              </div>
            </article>
          </aside>
        </section>
      </section>
    </main>
  `;
}

function render() {
  const route = parseRoute();
  const lesson = currentLesson(route);

  if (lesson) {
    setLastVisitedLesson(lesson.id);
  }

  let page = '';
  switch (route.view) {
    case 'landing':
      page = renderLanding();
      break;
    case 'classroom':
      page = renderClassroom();
      break;
    case 'lesson':
      page = lesson ? renderLesson(lesson) : renderLanding();
      break;
  }

  app.innerHTML = `
    <div class="app-frame ${route.view === 'classroom' || route.view === 'landing' || route.view === 'lesson' ? 'dashboard-app' : ''}">
      ${header(route)}
      ${page}
    </div>
  `;
}

app.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const routeTarget = target.closest<HTMLElement>('[data-route]');
  if (routeTarget) {
    const route = routeTarget.dataset.route;
    if (route) {
      navigateTo(route);
      return;
    }
  }

  const jumpTarget = target.closest<HTMLElement>('[data-jump]');
  if (jumpTarget) {
    const jumpId = jumpTarget.dataset.jump;
    if (jumpId) {
      scrollToSection(jumpId);
    }
    return;
  }

  const actionTarget = target.closest<HTMLElement>('[data-action]');
  if (!actionTarget) {
    return;
  }

  const action = actionTarget.dataset.action;
  if (action === 'save-submission-field') {
    const lessonId = actionTarget.dataset.lessonId;
    const field = actionTarget.dataset.submissionField;
    if (
      !lessonId ||
      (field !== 'problemStatement' && field !== 'promptText' && field !== 'resultLink')
    ) {
      return;
    }

    const container = app.querySelector<HTMLElement>(`[data-submission-form="${lessonId}"]`);
    if (!container) {
      return;
    }

    const fieldElement = container.querySelector<HTMLTextAreaElement | HTMLInputElement>(
      `[data-submission-field="${field}"]`,
    );
    if (!fieldElement) {
      return;
    }

    updateLessonSubmission(lessonId, {
      [field]: fieldElement.value,
    });

    lastSavedSubmissionKey = `${lessonId}:${field}`;
    if (field === 'resultLink') {
      const normalizedLink = normalizeUrl(fieldElement.value);
      if (!normalizedLink) {
        clearLessonPreview(lessonId);
        lastPreviewStatus = {
          lessonId,
          state: 'idle',
          message: '링크를 입력하면 미리보기를 시도할 수 있습니다.',
        };
        render();
        return;
      }

      lastPreviewStatus = {
        lessonId,
        state: 'loading',
        message: '배포 후에는 이 링크의 메타데이터를 불러와 미리보기를 보여줍니다.',
      };
      render();

      try {
        const preview = await fetchLinkPreview(normalizedLink);
        updateLessonPreview(lessonId, preview);
        lastPreviewStatus = {
          lessonId,
          state: 'success',
          message: '링크 미리보기 정보를 불러왔습니다.',
        };
      } catch {
        clearLessonPreview(lessonId);
        lastPreviewStatus = {
          lessonId,
          state: 'error',
          message: '로컬 환경에서는 미리보기 API가 없어 fallback 카드로 표시됩니다.',
        };
      }

      render();
      return;
    }

    lastPreviewStatus = null;
    render();
    return;
  }

  if (action === 'toggle-complete') {
    const lessonId = actionTarget.dataset.lessonId;
    if (!lessonId) {
      return;
    }
    toggleLessonComplete(lessonId);
    render();
    return;
  }

  if (action === 'reset-progress') {
    resetProgress();
    render();
  }
});

app.addEventListener('keydown', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const routeTarget = target.closest<HTMLElement>('[data-route][tabindex="0"]');
  if (!routeTarget) {
    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    const route = routeTarget.dataset.route;
    if (route) {
      navigateTo(route);
    }
  }
});

window.addEventListener('hashchange', render);

if (!window.location.hash) {
  window.location.hash = '#/';
}

render();
