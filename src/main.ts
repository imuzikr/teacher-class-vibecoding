import './style.css';
import { appName, courseLabel, courseLessons } from './data.ts';
import {
  clearLessonThumbnail,
  fetchGalleryRecords,
  getCurrentUserIdToken,
  hasFirebaseConfig,
  loadUserState,
  saveLessonThumbnail,
  saveUserState,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  signOutFromFirebase,
  subscribeToAuth,
} from './firebase.ts';
import {
  clearLessonPreview,
  getState,
  getLessonPreview,
  getLessonSubmission,
  replaceState,
  setLastVisitedLesson,
  updateLessonPreview,
  updateLessonSubmission,
} from './storage.ts';
import type {
  AppRoute,
  AuthenticatedUser,
  CourseLesson,
  FirebaseGalleryRecord,
  GalleryStudent,
  GallerySubmission,
  LinkPreviewData,
} from './types.ts';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('앱 루트를 찾을 수 없습니다.');
}

document.documentElement.lang = 'ko';
document.title = `${appName} | 초보자용 8차시 코스`;

const app = appRoot;
const totalLessons = courseLessons.length;
const savedSubmissionKeys = new Set<string>();
let lastPreviewStatus: { lessonId: string; state: 'idle' | 'loading' | 'success' | 'error'; message: string } | null = null;
let currentUser: AuthenticatedUser | null = null;
let authReady = !hasFirebaseConfig;
let hydratedUserId: string | null = null;
let firebaseGalleryStudents: GalleryStudent[] = [];
let authModalOpen = false;
let authMode: 'login' | 'signup' = 'login';
let authSubmitting = false;
let authErrorMessage = '';
let pendingTopbarScrollReset = false;
let publicLandingCleanup: (() => void) | null = null;
let galleryDetailModal:
  | {
      label: string;
      title: string;
      content: string;
    }
  | null = null;
const serverlessApiBase =
  window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'https://teacher-class-vibecoding.vercel.app'
    : '';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function submissionFieldKey(lessonId: string, field: string) {
  return `${lessonId}:${field}`;
}

function submissionFieldMessages(field: string) {
  switch (field) {
    case 'problemStatement':
      return {
        idle: '입력 후 저장 버튼을 눌러 반영하세요.',
        saved: '문제 정의가 저장되었습니다.',
      };
    case 'promptText':
      return {
        idle: '입력 후 저장 버튼을 눌러 반영하세요.',
        saved: '프롬프트가 저장되었습니다.',
      };
    case 'resultLink':
      return {
        idle: '링크 저장 후 결과물 카드가 업데이트됩니다.',
        saved: '결과물 링크가 저장되었습니다. 아래 미리보기를 확인해 보세요.',
      };
    case 'reflectionNote':
      return {
        idle: '입력 후 저장 버튼을 눌러 반영하세요.',
        saved: '오늘 남기는 한 마디가 저장되었습니다.',
      };
    default:
      return {
        idle: '입력 후 저장 버튼을 눌러 반영하세요.',
        saved: '저장되었습니다.',
      };
  }
}

function isProtectedRoute(route: AppRoute) {
  return route.view === 'lesson' || route.view === 'gallery';
}

function openAuthModal(mode: 'login' | 'signup') {
  authModalOpen = true;
  authMode = mode;
  authErrorMessage = '';
  render();
}

function closeAuthModal() {
  authModalOpen = false;
  authErrorMessage = '';
  authSubmitting = false;
}

function authErrorToMessage(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = String((error as { code?: string }).code ?? '');
    switch (code) {
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다.';
      case 'auth/invalid-email':
        return '이메일 형식을 다시 확인해 주세요.';
      case 'auth/weak-password':
        return '비밀번호는 조금 더 길고 안전하게 설정해 주세요.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return '이메일 또는 비밀번호를 다시 확인해 주세요.';
      case 'auth/popup-closed-by-user':
        return '로그인 창이 닫혔습니다. 다시 시도해 주세요.';
      case 'auth/popup-blocked':
        return '브라우저에서 로그인 팝업이 차단되었습니다.';
      default:
        break;
    }
  }

  return '인증 처리 중 오류가 발생했습니다. 다시 시도해 주세요.';
}

function parseRoute(): AppRoute {
  const hash = window.location.hash.replace(/^#/, '');

  if (hash === '/classroom') {
    return { view: 'classroom' };
  }

  if (hash === '/gallery') {
    return { view: 'gallery', mode: 'student' };
  }

  if (hash.startsWith('/gallery/student/')) {
    const studentId = hash.replace('/gallery/student/', '').trim();
    if (studentId) {
      return { view: 'gallery', mode: 'student', studentId };
    }
  }

  if (hash === '/gallery/student') {
    return { view: 'gallery', mode: 'student' };
  }

  if (hash.startsWith('/gallery/lesson/')) {
    const lessonId = hash.replace('/gallery/lesson/', '').trim();
    const lesson = courseLessons.find((item) => item.id === lessonId);
    if (lesson) {
      return { view: 'gallery', mode: 'lesson', lessonId: lesson.id };
    }
  }

  if (hash === '/gallery/lesson') {
    return { view: 'gallery', mode: 'lesson' };
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
  const nextHash = route.replace(/^#/, '');
  galleryDetailModal = null;
  if (!currentUser && (nextHash.startsWith('/lesson/') || nextHash.startsWith('/gallery'))) {
    openAuthModal('login');
    return;
  }

  const shouldResetScroll = nextHash === '/' || nextHash.startsWith('/gallery');

  if (window.location.hash === route) {
    if (shouldResetScroll) {
      pendingTopbarScrollReset = true;
    }
    render();
    return;
  }

  if (shouldResetScroll) {
    pendingTopbarScrollReset = true;
  }
  window.location.hash = route;
}

function resetFieldSaveVisual(target: HTMLElement) {
  const fieldElement = target.closest<HTMLTextAreaElement | HTMLInputElement>('[data-submission-field]');
  if (!fieldElement) {
    return;
  }

  const lessonId = fieldElement.dataset.submissionLesson;
  const field = fieldElement.dataset.submissionField;
  if (!lessonId || !field) {
    return;
  }

  savedSubmissionKeys.delete(submissionFieldKey(lessonId, field));

  const fieldContainer = fieldElement.closest('.lesson-form-field');
  if (!fieldContainer) {
    return;
  }

  const saveButton = fieldContainer.querySelector<HTMLButtonElement>('.lesson-inline-save-button');
  const statusText = fieldContainer.querySelector<HTMLElement>('.lesson-inline-save-status');

  saveButton?.classList.remove('is-saved');
  if (saveButton) {
    saveButton.textContent = 'Save';
  }

  if (statusText) {
    statusText.classList.remove('visible');
    statusText.textContent = statusText.dataset.defaultStatus ?? '입력 후 저장 버튼을 눌러 반영하세요.';
  }
}

function teardownPublicLandingScene() {
  if (publicLandingCleanup) {
    publicLandingCleanup();
    publicLandingCleanup = null;
  }
}

function setupPublicLandingScene() {
  teardownPublicLandingScene();

  const stage = app.querySelector<HTMLElement>('.public-particle-hero');
  const canvas = app.querySelector<HTMLCanvasElement>('.public-particle-canvas');
  if (!stage || !canvas) {
    teardownPublicLandingScene();
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  const stageElement = stage;
  const canvasElement = canvas;
  const drawingContext = context;

  let animationFrame = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  const mouse = { x: -9999, y: -9999 };
  let targets: { x: number; y: number }[] = [];
  let particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    g: number;
    b: number;
    life: number;
    speed: number;
    angle: number;
    orbitR: number;
  }[] = [];

  const heroText = ['교사를 위한', 'Vibe Coding', '학습 여정'];
  const colorA: [number, number, number] = [133, 255, 214];
  const colorB: [number, number, number] = [132, 55, 195];
  const particleCount = 5600;
  const particleSize = 1.7;
  const speed = 0.11;
  const mouseRepel = 120;

  function lerpColor(left: [number, number, number], right: [number, number, number], ratio: number) {
    return [
      Math.round(left[0] + (right[0] - left[0]) * ratio),
      Math.round(left[1] + (right[1] - left[1]) * ratio),
      Math.round(left[2] + (right[2] - left[2]) * ratio),
    ] as const;
  }

  function resize() {
    const rect = stageElement.getBoundingClientRect();
    width = Math.max(320, Math.floor(rect.width));
    height = Math.max(360, Math.floor(rect.height));
    dpr = window.devicePixelRatio || 1;

    canvasElement.width = width * dpr;
    canvasElement.height = height * dpr;
    canvasElement.style.width = `${width}px`;
    canvasElement.style.height = `${height}px`;
    drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildTargets();
    if (!particles.length) {
      reinitParticles();
    }
  }

  function buildTargets() {
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offscreenContext = offscreen.getContext('2d');
    if (!offscreenContext) {
      return;
    }

    const fontSize = Math.min(Math.max(52, width * 0.104), 132);
    const lineHeight = fontSize * 1.02;
    const totalHeight = heroText.length * lineHeight;
    const startY = height / 2 - totalHeight / 2 + lineHeight * 0.5;

    offscreenContext.clearRect(0, 0, width, height);
    offscreenContext.fillStyle = '#ffffff';
    offscreenContext.textAlign = 'center';
    offscreenContext.textBaseline = 'middle';
    offscreenContext.font = `800 ${fontSize}px Pretendard Variable, Pretendard, SUIT Variable, Noto Sans KR, sans-serif`;

    heroText.forEach((line, index) => {
      offscreenContext.fillText(line, width / 2, startY + index * lineHeight);
    });

    const image = offscreenContext.getImageData(0, 0, width, height).data;
    const points: { x: number; y: number }[] = [];
    const step = Math.max(2, Math.floor(width / 340));
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const imageIndex = (y * width + x) * 4;
        if (image[imageIndex + 3] > 96) {
          points.push({ x, y });
        }
      }
    }

    for (let index = points.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [points[index], points[swapIndex]] = [points[swapIndex], points[index]];
    }

    targets = points;
  }

  function reinitParticles() {
    particles = Array.from({ length: particleCount }, (_, index) => {
      const ratio = index / particleCount;
      const [r, g, b] = lerpColor(colorA, colorB, ratio);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        r,
        g,
        b,
        life: Math.random(),
        speed: 0.5 + Math.random() * 1.5,
        angle: Math.random() * Math.PI * 2,
        orbitR: 20 + Math.random() * 72,
      };
    });
  }

  function tick() {
    animationFrame = window.requestAnimationFrame(tick);
    drawingContext.clearRect(0, 0, width, height);
    frame += 1;

    if (!targets.length) {
      return;
    }

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      const target = targets[index % targets.length];

      particle.angle += 0.012 * particle.speed;
      const targetX = target.x + Math.cos(particle.angle) * (10 + particle.orbitR * 0.18);
      const targetY = target.y + Math.sin(particle.angle) * (6 + particle.orbitR * 0.1);
      let accelerationX = (targetX - particle.x) * speed * 1.35;
      let accelerationY = (targetY - particle.y) * speed * 1.35;

      const diffX = particle.x - mouse.x;
      const diffY = particle.y - mouse.y;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);
      if (distance > 0 && distance < mouseRepel) {
        const force = (mouseRepel - distance) / mouseRepel;
        accelerationX += (diffX / distance) * force * 8;
        accelerationY += (diffY / distance) * force * 8;
      }

      particle.vx = (particle.vx + accelerationX) * 0.88;
      particle.vy = (particle.vy + accelerationY) * 0.88;
      particle.x += particle.vx;
      particle.y += particle.vy;

      particle.life += 0.005 * particle.speed;
      const alpha = 0.62 + 0.34 * Math.sin(particle.life * Math.PI * 2 + frame * 0.002);

      drawingContext.beginPath();
      drawingContext.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
      drawingContext.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${alpha.toFixed(2)})`;
      drawingContext.fill();
    }
  }

  function handleMouseMove(event: MouseEvent) {
    const rect = canvasElement.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  }

  function handleMouseLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
    reinitParticles();
  });

  resize();
  reinitParticles();
  tick();

  resizeObserver.observe(stageElement);
  window.addEventListener('resize', resize);
  stageElement.addEventListener('mousemove', handleMouseMove);
  stageElement.addEventListener('mouseleave', handleMouseLeave);

  publicLandingCleanup = () => {
    window.cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    window.removeEventListener('resize', resize);
    stageElement.removeEventListener('mousemove', handleMouseMove);
    stageElement.removeEventListener('mouseleave', handleMouseLeave);
  };
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

async function authorizedApiHeaders() {
  const idToken = await getCurrentUserIdToken();

  if (!idToken) {
    throw new Error('로그인이 필요합니다.');
  }

  return {
    authorization: `Bearer ${idToken}`,
  };
}

async function fetchLinkPreview(link: string) {
  const normalized = normalizeUrl(link);
  if (!normalized) {
    throw new Error('링크가 비어 있습니다.');
  }

  const headers = await authorizedApiHeaders();
  const response = await fetch(`${serverlessApiBase}/api/link-preview?url=${encodeURIComponent(normalized)}`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('미리보기 정보를 가져오지 못했습니다.');
  }

  return (await response.json()) as LinkPreviewData;
}

async function fetchLinkThumbnail(link: string) {
  const normalized = normalizeUrl(link);
  if (!normalized) {
    throw new Error('링크가 비어 있습니다.');
  }

  const headers = await authorizedApiHeaders();
  const response = await fetch(`${serverlessApiBase}/api/link-thumbnail?url=${encodeURIComponent(normalized)}`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('썸네일 이미지를 가져오지 못했습니다.');
  }

  return (await response.json()) as { imageDataUrl: string; capturedUrl: string };
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

function truncateSessionLabel(title: string, maxLength = 22) {
  if (title.length <= maxLength) {
    return title;
  }

  return `${title.slice(0, maxLength).trimEnd()}...`;
}

function galleryEmptyTextClass(text: string) {
  return text.trim().startsWith('아직 ') ? ' is-empty' : '';
}

function renderSessionArtwork(lesson: CourseLesson) {
  const generatedImagePath = `/session-artworks/${lesson.id}.png`;

  return `
    <div class="lesson-canvas-artwork" aria-hidden="true">
      <img
        class="lesson-canvas-generated-artwork"
        src="${generatedImagePath}"
        alt=""
        loading="lazy"
        onerror="this.remove()"
      />
    </div>
  `;
}

function lessonHasSavedWork(lessonId: string) {
  const state = getState();
  const draft = state.submissionsByLesson[lessonId];
  const preview = state.previewsByLesson[lessonId];

  return Boolean(
    draft?.problemStatement?.trim() ||
      draft?.promptText?.trim() ||
      draft?.reflectionNote?.trim() ||
      draft?.resultLink?.trim() ||
      preview?.title?.trim() ||
      preview?.description?.trim() ||
      preview?.image?.trim() ||
      preview?.url?.trim(),
  );
}

function progressSummary() {
  const completedCount = courseLessons.filter((lesson) => lessonHasSavedWork(lesson.id)).length;
  const percent = Math.round((completedCount / totalLessons) * 100);

  return {
    completedCount,
    percent,
    remainingCount: totalLessons - completedCount,
  };
}

function galleryRoleFromEmail(email: string) {
  if (!email) {
    return '수강생';
  }

  const normalized = email.toLowerCase();
  if (normalized.includes('teacher') || normalized.includes('school')) {
    return '교사';
  }

  return '수강생';
}

function toGallerySubmission(record: FirebaseGalleryRecord, lesson: CourseLesson): GallerySubmission {
  const draft = record.state?.submissionsByLesson?.[lesson.id];
  const preview = record.state?.previewsByLesson?.[lesson.id];
  const previewImage = record.thumbnailsByLesson[lesson.id] || preview?.image?.trim() || '';
  const previewDomain =
    preview?.siteName?.trim() || extractHostname(draft?.resultLink?.trim() || '') || '링크 미입력';
  const hasAnyDraft = Boolean(
    draft?.problemStatement?.trim() ||
      draft?.promptText?.trim() ||
      draft?.reflectionNote?.trim() ||
      draft?.resultLink?.trim(),
  );

  const previewStatus: GallerySubmission['previewStatus'] = draft?.resultLink?.trim()
    ? 'published'
    : hasAnyDraft
      ? 'reviewing'
      : 'draft';

  return {
    lessonId: lesson.id,
    problemStatement: draft?.problemStatement?.trim() || '아직 문제 정의를 제출하지 않았습니다.',
    promptText: draft?.promptText?.trim() || '아직 프롬프트를 제출하지 않았습니다.',
    reflectionNote: draft?.reflectionNote?.trim() || '아직 오늘 남기는 한 마디를 작성하지 않았습니다.',
    resultLink: draft?.resultLink?.trim() || '',
    previewStatus,
    previewTitle: preview?.title?.trim() || lesson.title,
    previewNote:
      draft?.reflectionNote?.trim() ||
      preview?.description?.trim() ||
      (previewStatus === 'draft'
        ? '아직 제출 전 단계입니다.'
        : '수업 중 남긴 기록을 바탕으로 결과물을 정리하고 있습니다.'),
    previewImage,
    previewDomain,
  };
}

function toGalleryStudent(record: FirebaseGalleryRecord): GalleryStudent {
  const completedCount = courseLessons.filter((lesson) => {
    const draft = record.state?.submissionsByLesson?.[lesson.id];
    const preview = record.state?.previewsByLesson?.[lesson.id];

    return Boolean(
      draft?.problemStatement?.trim() ||
        draft?.promptText?.trim() ||
        draft?.reflectionNote?.trim() ||
        draft?.resultLink?.trim() ||
        preview?.title?.trim() ||
        preview?.description?.trim() ||
        preview?.image?.trim() ||
        preview?.url?.trim(),
    );
  }).length;

  return {
    id: record.uid,
    name: record.displayName || record.email || '학습자',
    role: galleryRoleFromEmail(record.email),
    cohort: '2026 상반기',
    focus: completedCount > 0 ? `${completedCount}개 차시 진행 중` : '첫 제출을 준비 중인 학습자',
    note:
      completedCount > 0
        ? `총 ${completedCount}개 차시의 저장 기록이 있습니다. 제출 흐름과 결과물을 한 번에 확인할 수 있습니다.`
        : '아직 본격적인 제출 전 단계이지만, Firebase에 계정과 작업 공간이 연결되어 있습니다.',
    submissions: courseLessons.map((lesson) => toGallerySubmission(record, lesson)),
  };
}

function activeGalleryStudents() {
  return firebaseGalleryStudents;
}

async function refreshGalleryStudents() {
  if (!hasFirebaseConfig || !currentUser) {
    firebaseGalleryStudents = [];
    render();
    return;
  }

  try {
    const records = await fetchGalleryRecords();
    firebaseGalleryStudents = records
      .map((record) => toGalleryStudent(record))
      .sort((left, right) => {
        if (left.id === currentUser?.uid) {
          return -1;
        }
        if (right.id === currentUser?.uid) {
          return 1;
        }
        return left.name.localeCompare(right.name, 'ko');
      });
  } catch {
    firebaseGalleryStudents = [];
  }

  render();
}

function userInitials(user: AuthenticatedUser | null) {
  if (!user?.displayName.trim()) {
    return 'VC';
  }

  return user.displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('');
}

function authActionsMarkup(compact = false) {
  const userName = currentUser?.displayName?.trim() || 'Teachers';
  const avatarLabel = userInitials(currentUser);
  const className = compact ? 'auth-button compact' : 'auth-button';

  if (!currentUser) {
    return `
      <div class="auth-action-group">
        <button class="${className} ghost" type="button" data-action="open-auth" data-auth-mode="login" ${!authReady ? 'disabled' : ''}>
          Login
        </button>
        <button class="${className}" type="button" data-action="open-auth" data-auth-mode="signup" ${!authReady ? 'disabled' : ''}>
          회원가입
        </button>
      </div>
    `;
  }

  return `
    <div class="auth-action-group">
      <button class="${className} ghost" type="button" data-action="sign-out" ${!authReady ? 'disabled' : ''}>
        Sign Out
      </button>
      <div class="lesson-shell-avatar" title="${userName}">${avatarLabel}</div>
    </div>
  `;
}

function renderAuthModal() {
  if (!authModalOpen) {
    return '';
  }

  return `
    <div class="auth-modal-backdrop" data-action="close-auth-modal">
      <section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button class="auth-modal-close" type="button" data-action="close-auth-modal" aria-label="닫기">×</button>
        <p class="auth-modal-kicker">Member Access</p>
        <h2 id="auth-modal-title">${authMode === 'signup' ? '회원가입' : '로그인'}</h2>
        <p class="auth-modal-copy">
          ${authMode === 'signup'
            ? '계정을 만들면 차시별 과제를 저장하고, 갤러리에서 제출 결과를 함께 확인할 수 있습니다.'
            : '로그인하면 차시 상세 페이지와 갤러리에서 저장된 결과물을 이어서 확인할 수 있습니다.'}
        </p>
        <div class="auth-mode-tabs" role="tablist" aria-label="인증 모드 전환">
          <button class="auth-mode-tab ${authMode === 'login' ? 'active' : ''}" type="button" data-action="switch-auth-mode" data-auth-mode="login">로그인</button>
          <button class="auth-mode-tab ${authMode === 'signup' ? 'active' : ''}" type="button" data-action="switch-auth-mode" data-auth-mode="signup">회원가입</button>
        </div>
        <form class="auth-form" data-auth-form="${authMode}">
          ${
            authMode === 'signup'
              ? `
                <label class="auth-form-field">
                  <span>이름</span>
                  <input type="text" name="displayName" placeholder="이름을 입력해 주세요" required />
                </label>
              `
              : ''
          }
          <label class="auth-form-field">
            <span>이메일</span>
            <input type="email" name="email" placeholder="teacher@example.com" required />
          </label>
          <label class="auth-form-field">
            <span>비밀번호</span>
            <input type="password" name="password" placeholder="비밀번호를 입력해 주세요" required />
          </label>
          ${
            authErrorMessage
              ? `<p class="auth-form-error" role="alert">${authErrorMessage}</p>`
              : ''
          }
          <button class="auth-submit-button" type="submit" ${authSubmitting ? 'disabled' : ''}>
            ${authSubmitting ? '처리 중...' : authMode === 'signup' ? '회원가입하기' : '로그인하기'}
          </button>
        </form>
        <div class="auth-divider"><span>또는</span></div>
        <button class="auth-google-button" type="button" data-action="auth-google" ${authSubmitting ? 'disabled' : ''}>
          Google로 계속하기
        </button>
      </section>
    </div>
  `;
}

function renderGalleryDetailModal() {
  if (!galleryDetailModal) {
    return '';
  }

  return `
    <div class="gallery-detail-modal-backdrop" data-action="close-gallery-detail">
      <section class="gallery-detail-modal" role="dialog" aria-modal="true" aria-labelledby="gallery-detail-title">
        <button class="gallery-detail-modal-close" type="button" data-action="close-gallery-detail" aria-label="닫기">×</button>
        <p class="gallery-detail-modal-label">${escapeHtml(galleryDetailModal.label)}</p>
        <h2 id="gallery-detail-title">${escapeHtml(galleryDetailModal.title)}</h2>
        <div class="gallery-detail-modal-content">${escapeHtml(galleryDetailModal.content)}</div>
      </section>
    </div>
  `;
}

async function syncStateToCloud() {
  if (!currentUser || !hasFirebaseConfig) {
    return;
  }

  try {
    await saveUserState(currentUser.uid, getState(), currentUser);
  } catch {}

  await refreshGalleryStudents();
  render();
}

async function hydrateUserState(user: AuthenticatedUser) {
  if (!hasFirebaseConfig) {
    return;
  }

  try {
    const remoteState = await loadUserState(user.uid);

    if (remoteState) {
      replaceState(remoteState);
    } else {
      await saveUserState(user.uid, getState(), user);
    }

    hydratedUserId = user.uid;
    await refreshGalleryStudents();
  } catch {}

  render();
}

function currentLesson(route: AppRoute) {
  if (route.view !== 'lesson') {
    return null;
  }

  return courseLessons.find((lesson) => lesson.id === route.lessonId) ?? null;
}

function previousLessonFor(lesson: CourseLesson) {
  return courseLessons[lesson.session - 2] ?? null;
}

function currentGalleryStudent(route: AppRoute, studentList: GalleryStudent[]) {
  if (route.view !== 'gallery' || route.mode !== 'student') {
    return null;
  }

  if (route.studentId) {
    return studentList.find((student) => student.id === route.studentId) ?? studentList[0] ?? null;
  }

  return studentList[0] ?? null;
}

function currentGalleryLesson(route: AppRoute) {
  if (route.view !== 'gallery' || route.mode !== 'lesson') {
    return null;
  }

  if (route.lessonId) {
    return courseLessons.find((lesson) => lesson.id === route.lessonId) ?? courseLessons[0];
  }

  return courseLessons[0];
}

function navIcon(type: 'home' | 'gallery') {
  if (type === 'home') {
    return `
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M3.5 8.4 10 3l6.5 5.4v7.1a1 1 0 0 1-1 1H12v-4.2H8v4.2H4.5a1 1 0 0 1-1-1Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="5.2" height="5.2" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <rect x="11.8" y="4" width="5.2" height="5.2" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <rect x="3" y="10.8" width="5.2" height="5.2" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <rect x="11.8" y="10.8" width="5.2" height="5.2" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/>
    </svg>
  `;
}

function nextLessonFor(lesson: CourseLesson) {
  return courseLessons[lesson.session] ?? null;
}

function header(route: AppRoute) {
  if (route.view === 'landing' && !currentUser) {
    return `
      <header class="public-topbar">
        <a class="public-brand" href="#/" data-route="#/">
          <strong>${appName}</strong>
          <small>${courseLabel}</small>
        </a>
        <div class="public-topbar-actions">
          ${authActionsMarkup()}
        </div>
      </header>
    `;
  }

  if (route.view === 'lesson') {
    return `
      <header class="lesson-shell-topbar">
        <a class="lesson-topbar-brand" href="#/" data-route="#/">
          <strong>${appName}</strong>
          <small>${courseLabel}</small>
        </a>
        <nav class="lesson-shell-nav" aria-label="주요 탐색">
          <button class="lesson-shell-link active" type="button" data-route="#/">${navIcon('home')}<span>Home</span></button>
          <button class="lesson-shell-link" type="button" data-route="#/gallery">${navIcon('gallery')}<span>Gallery</span></button>
        </nav>
        <div class="lesson-shell-actions">
          ${authActionsMarkup()}
        </div>
      </header>
    `;
  }

  if (route.view === 'gallery') {
    return `
      <header class="lesson-shell-topbar">
        <a class="lesson-topbar-brand" href="#/" data-route="#/">
          <strong>${appName}</strong>
          <small>${courseLabel}</small>
        </a>
        <nav class="lesson-shell-nav" aria-label="주요 탐색">
          <button class="lesson-shell-link" type="button" data-route="#/">${navIcon('home')}<span>Home</span></button>
          <button class="lesson-shell-link active" type="button" data-route="#/gallery">${navIcon('gallery')}<span>Gallery</span></button>
        </nav>
        <div class="lesson-shell-actions">
          ${authActionsMarkup()}
        </div>
      </header>
    `;
  }

  if (route.view === 'landing' || route.view === 'classroom') {
    return `
      <header class="topbar">
        <div class="topbar-start">
          <strong class="topbar-title">Course Dashboard</strong>
        </div>
        <nav class="topnav topnav-centered" aria-label="주요 탐색">
          <button class="nav-link active" type="button" data-route="#/">${navIcon('home')}<span>Home</span></button>
          <button class="nav-link" type="button" data-route="#/gallery">${navIcon('gallery')}<span>Gallery</span></button>
        </nav>
        <div class="topbar-end">
          ${authActionsMarkup(true)}
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
        <nav class="topnav" aria-label="주요 탐색">
          <button class="nav-link active" type="button" data-route="#/">${navIcon('home')}<span>Home</span></button>
          <button class="nav-link" type="button" data-route="#/gallery">${navIcon('gallery')}<span>Gallery</span></button>
        </nav>
      </div>
      <label class="topbar-search" aria-label="커리큘럼 검색">
        <span class="search-icon">⌕</span>
        <input type="text" placeholder="Search curriculum..." />
      </label>
      <div class="topbar-end">
        ${authActionsMarkup(true)}
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
  return `
    <aside class="dashboard-sidebar">
      <div class="dashboard-sidebar-head">
        <strong>${appName}</strong>
        <p><span>교사 개발자가 되기 위한 8차시</span><span>Vibe Coding 코스</span></p>
      </div>
      <nav class="dashboard-session-nav" aria-label="세션 탐색">
        ${courseLessons
          .map((lesson) => {
            return `
              <button
                class="dashboard-session-link"
                type="button"
                data-route="#/lesson/${lesson.id}"
              >
                <span class="dashboard-session-number">${lesson.session}차시</span>
              </button>
            `;
          })
          .join('')}
      </nav>
      <div class="dashboard-sidebar-tools">
        <button class="dashboard-resource-button" type="button" data-route="#/gallery">Gallery</button>
        <button class="dashboard-tool-link" type="button" data-route="#/">Docs</button>
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
            const completed = lessonHasSavedWork(lesson.id);
            return `
              <article class="curriculum-card ${completed ? 'completed' : ''}" data-route="#/lesson/${lesson.id}" tabindex="0" role="link" aria-label="${lesson.title} 상세 페이지로 이동">
                <span class="curriculum-card-label">${lesson.session}차시</span>
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
          <span>© 2026 ${appName}</span>
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
  if (currentUser) {
    return renderClassroom();
  }

  return `
    <main class="public-landing-page">
        <section class="public-particle-hero">
          <canvas class="public-particle-canvas" aria-hidden="true"></canvas>
          <div class="public-particle-copy">
            <h1 aria-label="교사를 위한 바이브 코딩 학습 여정">
              <span>교사를 위한</span>
              <span>Vibe Coding</span>
              <span>학습 여정</span>
            </h1>
            <p>
              <span>메일머지, Antigravity, Firebase, API, 서버리스와 CDN까지.</span>
              <span>수업과 업무 흐름 속에서 바로 써볼 수 있는 AI 서비스 제작 여정을 8차시에 걸쳐 차근차근 따라갑니다.</span>
            </p>
          </div>
        </section>
      <section class="public-landing-footnote">
        <div class="public-landing-stat">
          <strong>8차시</strong>
          <span>기초부터 서비스 운영 감각까지</span>
        </div>
        <div class="public-landing-stat">
          <strong>실습 중심</strong>
          <span>문제 정의, 프롬프트, 결과물 제출까지</span>
        </div>
        <div class="public-landing-stat">
          <strong>교사 맞춤</strong>
          <span>수업과 업무 흐름에 바로 연결하는 바이브 코딩</span>
        </div>
      </section>
    </main>
  `;
}

function renderGallery() {
  const route = parseRoute();
  const isStudentMode = route.view === 'gallery' && route.mode === 'student';
  const galleryStudentList = activeGalleryStudents();
  const selectedStudent = currentGalleryStudent(route, galleryStudentList) ?? galleryStudentList[0];
  const selectedLesson = currentGalleryLesson(route) ?? courseLessons[0];

  if (galleryStudentList.length === 0) {
    return `
      <main class="gallery-page">
        <aside class="gallery-sidebar">
          <div class="gallery-sidebar-head">
            <strong>수강생 Gallery</strong>
            <p>학생별 결과물과 차시별 결과물을 두 가지 관점으로 비교해 볼 수 있습니다.</p>
          </div>
          <div class="gallery-sidebar-tabs" role="tablist" aria-label="갤러리 보기 전환">
            <button class="gallery-sidebar-tab ${isStudentMode ? 'active' : ''}" type="button" data-route="#/gallery/student">학생</button>
            <button class="gallery-sidebar-tab ${!isStudentMode ? 'active' : ''}" type="button" data-route="#/gallery/lesson">차시</button>
          </div>
        </aside>
        <section class="gallery-main">
          <section class="gallery-hero">
            <div class="gallery-hero-copy">
              <span class="gallery-kicker">${isStudentMode ? 'Student Gallery' : 'Session Gallery'}</span>
              <h1>아직 불러온 수강생 데이터가 없습니다</h1>
              <p>로그인 후 차시 제출을 저장하면 이 영역에 실제 수강생 목록과 차시별 결과물이 표시됩니다.</p>
            </div>
          </section>
        </section>
      </main>
    `;
  }

  const studentSubmissionCards = courseLessons
    .map((lesson) => {
      const submission = selectedStudent.submissions.find((item) => item.lessonId === lesson.id);
      if (!submission) {
        return '';
      }

      const statusLabel =
        submission.previewStatus === 'published'
          ? 'Published'
          : submission.previewStatus === 'reviewing'
            ? 'Reviewing'
            : 'Draft';

      return `
        <article class="gallery-submission-card">
          <div class="gallery-submission-head">
            <div>
              <span class="gallery-submission-label">${lesson.session}차시</span>
              <h3>${lesson.title}</h3>
            </div>
            <span class="gallery-status ${submission.previewStatus}">${statusLabel}</span>
          </div>
          <div class="gallery-submission-layout">
            <div class="gallery-submission-copy">
              <button
                class="gallery-detail-block gallery-detail-trigger"
                type="button"
                data-action="open-gallery-detail"
                data-detail-label="문제 정의와 해결 방향"
                data-detail-title="${lesson.session}차시 · ${escapeHtml(lesson.title)}"
                data-detail-content="${encodeURIComponent(submission.problemStatement)}"
              >
                <span>문제 정의와 해결 방향</span>
                <p class="gallery-detail-text${galleryEmptyTextClass(submission.problemStatement)}">${submission.problemStatement}</p>
              </button>
              <button
                class="gallery-detail-block gallery-detail-trigger"
                type="button"
                data-action="open-gallery-detail"
                data-detail-label="프롬프트"
                data-detail-title="${lesson.session}차시 · ${escapeHtml(lesson.title)}"
                data-detail-content="${encodeURIComponent(submission.promptText)}"
              >
                <span>프롬프트</span>
                <p class="gallery-detail-text${galleryEmptyTextClass(submission.promptText)}">${submission.promptText}</p>
              </button>
              <button
                class="gallery-detail-block gallery-detail-trigger"
                type="button"
                data-action="open-gallery-detail"
                data-detail-label="오늘 남기는 한 마디"
                data-detail-title="${lesson.session}차시 · ${escapeHtml(lesson.title)}"
                data-detail-content="${encodeURIComponent(submission.reflectionNote)}"
              >
                <span>오늘 남기는 한 마디</span>
                <p class="gallery-detail-text${galleryEmptyTextClass(submission.reflectionNote)}">${submission.reflectionNote}</p>
              </button>
              <div class="gallery-detail-block gallery-detail-link-block">
                <button
                  class="gallery-detail-trigger"
                  type="button"
                  data-action="open-gallery-detail"
                  data-detail-label="URL"
                  data-detail-title="${lesson.session}차시 · ${escapeHtml(lesson.title)}"
                  data-detail-content="${encodeURIComponent(submission.resultLink || '아직 링크가 입력되지 않았습니다.')}"
                >
                  <span>URL</span>
                  <p class="gallery-detail-text${galleryEmptyTextClass(submission.resultLink || '아직 링크가 입력되지 않았습니다.')}">${submission.resultLink || '아직 링크가 입력되지 않았습니다.'}</p>
                </button>
                ${
                  submission.resultLink
                    ? `<a class="gallery-detail-linkout" href="${submission.resultLink}" target="_blank" rel="noreferrer">열기 ↗</a>`
                    : ''
                }
              </div>
            </div>
            <div class="gallery-preview-card">
              <div class="gallery-preview-visual">
                <img
                  src="${submission.previewImage || `/session-artworks/${lesson.id}.png`}"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="gallery-preview-body">
                <strong>${submission.previewTitle}</strong>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  const lessonSubmissionCards = galleryStudentList
    .map((student) => {
      const submission = student.submissions.find((item) => item.lessonId === selectedLesson.id);
      if (!submission) {
        return '';
      }

      const statusLabel =
        submission.previewStatus === 'published'
          ? 'Published'
          : submission.previewStatus === 'reviewing'
            ? 'Reviewing'
            : 'Draft';

      return `
        <article class="gallery-submission-card">
          <div class="gallery-submission-head">
            <div>
              <span class="gallery-submission-label">${student.name}</span>
              <h3>${student.focus}</h3>
            </div>
            <span class="gallery-status ${submission.previewStatus}">${statusLabel}</span>
          </div>
          <div class="gallery-submission-layout">
            <div class="gallery-submission-copy">
              <button
                class="gallery-detail-block gallery-detail-trigger"
                type="button"
                data-action="open-gallery-detail"
                data-detail-label="문제 정의와 해결 방향"
                data-detail-title="${selectedLesson.session}차시 · ${escapeHtml(student.name)}"
                data-detail-content="${encodeURIComponent(submission.problemStatement)}"
              >
                <span>문제 정의와 해결 방향</span>
                <p class="gallery-detail-text${galleryEmptyTextClass(submission.problemStatement)}">${submission.problemStatement}</p>
              </button>
              <button
                class="gallery-detail-block gallery-detail-trigger"
                type="button"
                data-action="open-gallery-detail"
                data-detail-label="프롬프트"
                data-detail-title="${selectedLesson.session}차시 · ${escapeHtml(student.name)}"
                data-detail-content="${encodeURIComponent(submission.promptText)}"
              >
                <span>프롬프트</span>
                <p class="gallery-detail-text${galleryEmptyTextClass(submission.promptText)}">${submission.promptText}</p>
              </button>
              <button
                class="gallery-detail-block gallery-detail-trigger"
                type="button"
                data-action="open-gallery-detail"
                data-detail-label="오늘 남기는 한 마디"
                data-detail-title="${selectedLesson.session}차시 · ${escapeHtml(student.name)}"
                data-detail-content="${encodeURIComponent(submission.reflectionNote)}"
              >
                <span>오늘 남기는 한 마디</span>
                <p class="gallery-detail-text${galleryEmptyTextClass(submission.reflectionNote)}">${submission.reflectionNote}</p>
              </button>
              <div class="gallery-detail-block gallery-detail-link-block">
                <button
                  class="gallery-detail-trigger"
                  type="button"
                  data-action="open-gallery-detail"
                  data-detail-label="URL"
                  data-detail-title="${selectedLesson.session}차시 · ${escapeHtml(student.name)}"
                  data-detail-content="${encodeURIComponent(submission.resultLink || '아직 링크가 입력되지 않았습니다.')}"
                >
                  <span>URL</span>
                  <p class="gallery-detail-text${galleryEmptyTextClass(submission.resultLink || '아직 링크가 입력되지 않았습니다.')}">${submission.resultLink || '아직 링크가 입력되지 않았습니다.'}</p>
                </button>
                ${
                  submission.resultLink
                    ? `<a class="gallery-detail-linkout" href="${submission.resultLink}" target="_blank" rel="noreferrer">열기 ↗</a>`
                    : ''
                }
              </div>
            </div>
            <div class="gallery-preview-card">
              <div class="gallery-preview-visual">
                <img
                  src="${submission.previewImage || `/session-artworks/${selectedLesson.id}.png`}"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="gallery-preview-body">
                <strong>${submission.previewTitle}</strong>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  return `
    <main class="gallery-page">
      <aside class="gallery-sidebar">
        <div class="gallery-sidebar-head">
          <strong>수강생 Gallery</strong>
          <p>학생별 결과물과 차시별 결과물을 두 가지 관점으로 비교해 볼 수 있습니다.</p>
        </div>
        <div class="gallery-sidebar-tabs" role="tablist" aria-label="갤러리 보기 전환">
          <button class="gallery-sidebar-tab ${isStudentMode ? 'active' : ''}" type="button" data-route="#/gallery/student">학생</button>
          <button class="gallery-sidebar-tab ${!isStudentMode ? 'active' : ''}" type="button" data-route="#/gallery/lesson">차시</button>
        </div>
        <nav class="gallery-student-nav" aria-label="${isStudentMode ? '수강생 목록' : '차시 목록'}">
          ${
            isStudentMode
              ? galleryStudentList
                  .map(
                    (student) => `
                      <button
                        class="gallery-student-link ${student.id === selectedStudent.id ? 'active' : ''}"
                        type="button"
                        data-route="#/gallery/student/${student.id}"
                      >
                        <strong>${student.name}</strong>
                        <span>${student.role}</span>
                      </button>
                    `,
                  )
                  .join('')
              : courseLessons
                  .map(
                    (lesson) => `
                      <button
                        class="gallery-student-link ${lesson.id === selectedLesson.id ? 'active' : ''}"
                        type="button"
                        data-route="#/gallery/lesson/${lesson.id}"
                      >
                        <strong>${lesson.session}차시</strong>
                        <span>${lesson.title}</span>
                      </button>
                    `,
                  )
                  .join('')
          }
        </nav>
      </aside>

      <section class="gallery-main">
        <section class="gallery-hero">
          <div class="gallery-hero-copy">
            <span class="gallery-kicker">${isStudentMode ? 'Student Gallery' : 'Session Gallery'}</span>
            <h1>${
              isStudentMode
                ? `${selectedStudent.name}의 1차시~8차시`
                : `${selectedLesson.session}차시 · ${selectedLesson.title}`
            }</h1>
            <p>${isStudentMode ? selectedStudent.note : selectedLesson.summary}</p>
          </div>
          <div class="gallery-hero-meta">
            ${
              isStudentMode
                ? `
                  <article>
                    <span>역할</span>
                    <strong>${selectedStudent.role}</strong>
                  </article>
                  <article>
                    <span>기수</span>
                    <strong>${selectedStudent.cohort}</strong>
                  </article>
                  <article>
                    <span>주제</span>
                    <strong>${selectedStudent.focus}</strong>
                  </article>
                `
                : `
                  <article>
                    <span>차시</span>
                    <strong>${selectedLesson.session}차시</strong>
                  </article>
                  <article>
                    <span>단계</span>
                    <strong>${selectedLesson.stageLabel}</strong>
                  </article>
                  <article>
                    <span>제출 수</span>
                    <strong>${galleryStudentList.length}명</strong>
                  </article>
                `
            }
          </div>
        </section>

        <section class="gallery-content">
          ${isStudentMode ? studentSubmissionCards : lessonSubmissionCards}
        </section>
      </section>
    </main>
  `;
}

function renderLesson(lesson: CourseLesson) {
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
  const problemSaved = savedSubmissionKeys.has(submissionFieldKey(lesson.id, 'problemStatement'));
  const promptSaved = savedSubmissionKeys.has(submissionFieldKey(lesson.id, 'promptText'));
  const reflectionSaved = savedSubmissionKeys.has(submissionFieldKey(lesson.id, 'reflectionNote'));
  const linkSaved = savedSubmissionKeys.has(submissionFieldKey(lesson.id, 'resultLink'));
  const previewState = lastPreviewStatus?.lessonId === lesson.id ? lastPreviewStatus : null;
  const problemMessages = submissionFieldMessages('problemStatement');
  const promptMessages = submissionFieldMessages('promptText');
  const resultLinkMessages = submissionFieldMessages('resultLink');
  const reflectionMessages = submissionFieldMessages('reflectionNote');

  return `
    <main class="lesson-workspace-page">
      <aside class="lesson-workspace-rail">
        <section class="lesson-session-picker-panel">
          <p class="lesson-session-picker-label">학습 주차 선택</p>
          <details class="lesson-session-picker">
            <summary class="lesson-session-picker-trigger">
              <span>${`${lesson.session}차시 · ${truncateSessionLabel(lesson.title, 14)}`}</span>
            </summary>
            <div class="lesson-session-picker-menu" role="listbox" aria-label="학습 주차 목록">
              ${courseLessons
                .map(
                  (item) => `
                    <button
                      class="lesson-session-option ${item.id === lesson.id ? 'active' : ''}"
                      type="button"
                      data-route="#/lesson/${item.id}"
                      title="${item.session}차시 · ${item.title}"
                    >
                      ${`${item.session}차시 · ${truncateSessionLabel(item.title, 24)}`}
                    </button>
                  `,
                )
                .join('')}
            </div>
          </details>
        </section>
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
            <span>${lesson.session}차시</span>
          </div>
          <h1>${lesson.session}차시: ${lesson.title}</h1>
          <p>${lesson.summary}</p>
        </section>

        <section class="lesson-top-grid">
          <article class="lesson-canvas-panel">
            <div class="lesson-canvas-copy">
              <p class="lesson-panel-label">Session Canvas</p>
              <h2>${lesson.promise}</h2>
              <p>${lesson.learningGoal}</p>
            </div>
            ${renderSessionArtwork(lesson)}
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
                이번 차시의 문제 정의부터 실습에 사용한 프롬프트, 오늘 활동에 대한 한 마디, 최종 결과물 링크까지 한 번에 정리해 두세요.
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
                      class="lesson-inline-save-button ${problemSaved ? 'is-saved' : ''}"
                      type="button"
                      data-action="save-submission-field"
                      data-lesson-id="${lesson.id}"
                      data-submission-field="problemStatement"
                    >
                      ${problemSaved ? 'Saved' : 'Save'}
                    </button>
                    <span
                      class="lesson-inline-save-status ${problemSaved ? 'visible' : ''}"
                      data-default-status="${problemMessages.idle}"
                      data-saved-status="${problemMessages.saved}"
                    >
                      ${problemSaved ? problemMessages.saved : problemMessages.idle}
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
                      class="lesson-inline-save-button ${promptSaved ? 'is-saved' : ''}"
                      type="button"
                      data-action="save-submission-field"
                      data-lesson-id="${lesson.id}"
                      data-submission-field="promptText"
                    >
                      ${promptSaved ? 'Saved' : 'Save'}
                    </button>
                    <span
                      class="lesson-inline-save-status ${promptSaved ? 'visible' : ''}"
                      data-default-status="${promptMessages.idle}"
                      data-saved-status="${promptMessages.saved}"
                    >
                      ${promptSaved ? promptMessages.saved : promptMessages.idle}
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
                      class="lesson-inline-save-button ${linkSaved ? 'is-saved' : ''}"
                      type="button"
                      data-action="save-submission-field"
                      data-lesson-id="${lesson.id}"
                      data-submission-field="resultLink"
                    >
                      ${linkSaved ? 'Saved' : 'Save'}
                    </button>
                    <span
                      class="lesson-inline-save-status ${linkSaved ? 'visible' : ''}"
                      data-default-status="${resultLinkMessages.idle}"
                      data-saved-status="${resultLinkMessages.saved}"
                    >
                      ${linkSaved ? resultLinkMessages.saved : resultLinkMessages.idle}
                    </span>
                  </div>
                </label>
                <label class="lesson-form-field">
                  <span>오늘 남기는 한 마디</span>
                  <small>수업을 마친 뒤 오늘의 활동에서 느낀 점이나 기억에 남는 배움을 짧게 남겨보세요.</small>
                  <textarea
                    rows="4"
                    data-submission-lesson="${lesson.id}"
                    data-submission-field="reflectionNote"
                    placeholder="오늘 활동을 돌아보며 한 마디를 남겨보세요."
                  >${submission.reflectionNote}</textarea>
                  <div class="lesson-field-actions">
                    <button
                      class="lesson-inline-save-button ${reflectionSaved ? 'is-saved' : ''}"
                      type="button"
                      data-action="save-submission-field"
                      data-lesson-id="${lesson.id}"
                      data-submission-field="reflectionNote"
                    >
                      ${reflectionSaved ? 'Saved' : 'Save'}
                    </button>
                    <span
                      class="lesson-inline-save-status ${reflectionSaved ? 'visible' : ''}"
                      data-default-status="${reflectionMessages.idle}"
                      data-saved-status="${reflectionMessages.saved}"
                    >
                      ${reflectionSaved ? reflectionMessages.saved : reflectionMessages.idle}
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

            <article class="lesson-side-panel">
              <div class="lesson-panel-head">
                <h2>Next Step</h2>
              </div>
              <p class="lesson-completion-copy">현재 차시 저장이 끝나면 다음 차시로 넘어가거나 대시보드로 돌아가 흐름을 이어갈 수 있습니다.</p>
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
  let route = parseRoute();

  if (!currentUser && isProtectedRoute(route)) {
    authModalOpen = true;
    if (window.location.hash !== '#/') {
      window.location.hash = '#/';
      return;
    }
    route = { view: 'landing' };
  }

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
    case 'gallery':
      page = renderGallery();
      break;
  }

  const isDashboardShell =
    route.view === 'classroom' ||
    route.view === 'lesson' ||
    route.view === 'gallery' ||
    (route.view === 'landing' && !!currentUser);
  const isPublicLanding = route.view === 'landing' && !currentUser;

  app.innerHTML = `
    <div class="app-frame ${isDashboardShell ? 'dashboard-app' : ''} ${isPublicLanding ? 'public-app' : ''}">
      ${header(route)}
      ${page}
      ${renderAuthModal()}
      ${renderGalleryDetailModal()}
    </div>
  `;

  if (isPublicLanding) {
    setupPublicLandingScene();
  } else {
    teardownPublicLandingScene();
  }

  if (pendingTopbarScrollReset) {
    pendingTopbarScrollReset = false;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }
}

app.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const currentPicker = target.closest<HTMLElement>('.lesson-session-picker');
  app.querySelectorAll<HTMLDetailsElement>('.lesson-session-picker[open]').forEach((picker) => {
    if (picker !== currentPicker) {
      picker.open = false;
    }
  });

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
  if (action === 'open-auth') {
    const nextMode = actionTarget.dataset.authMode === 'signup' ? 'signup' : 'login';
    openAuthModal(nextMode);
    return;
  }

  if (action === 'close-auth-modal') {
    if (target === actionTarget || target.classList.contains('auth-modal-close')) {
      closeAuthModal();
      render();
    }
    return;
  }

  if (action === 'open-gallery-detail') {
    galleryDetailModal = {
      label: actionTarget.dataset.detailLabel ?? '상세 내용',
      title: actionTarget.dataset.detailTitle ?? '제출 내용',
      content: decodeURIComponent(actionTarget.dataset.detailContent ?? ''),
    };
    render();
    return;
  }

  if (action === 'close-gallery-detail') {
    if (target === actionTarget || target.classList.contains('gallery-detail-modal-close')) {
      galleryDetailModal = null;
      render();
    }
    return;
  }

  if (action === 'switch-auth-mode') {
    authMode = actionTarget.dataset.authMode === 'signup' ? 'signup' : 'login';
    authErrorMessage = '';
    render();
    return;
  }

  if (action === 'sign-in') {
    try {
      render();
      await signInWithGoogle();
    } catch {
      render();
    }
    return;
  }

  if (action === 'auth-google') {
    try {
      authSubmitting = true;
      authErrorMessage = '';
      render();
      await signInWithGoogle();
      authModalOpen = false;
    } catch (error) {
      authErrorMessage = authErrorToMessage(error);
    } finally {
      authSubmitting = false;
      render();
    }
    return;
  }

  if (action === 'sign-out') {
    try {
      await signOutFromFirebase();
    } catch {}
    render();
    return;
  }

  if (action === 'save-submission-field') {
    const lessonId = actionTarget.dataset.lessonId;
    const field = actionTarget.dataset.submissionField;
    if (
      !lessonId ||
      (field !== 'problemStatement' &&
        field !== 'promptText' &&
        field !== 'reflectionNote' &&
        field !== 'resultLink')
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

    savedSubmissionKeys.add(submissionFieldKey(lessonId, field));
    if (field === 'resultLink') {
      const normalizedLink = normalizeUrl(fieldElement.value);
      const existingPreview = getLessonPreview(lessonId);
      if (!normalizedLink) {
        clearLessonPreview(lessonId);
        if (currentUser) {
          void clearLessonThumbnail(currentUser.uid, lessonId);
        }
        lastPreviewStatus = {
          lessonId,
          state: 'idle',
          message: '링크를 입력하면 미리보기를 시도할 수 있습니다.',
        };
        void syncStateToCloud();
        render();
        return;
      }

      if (existingPreview?.url?.trim() === normalizedLink) {
        lastPreviewStatus = {
          lessonId,
          state: 'success',
          message: '같은 링크가 이미 저장되어 있어 기존 미리보기를 재사용했습니다.',
        };
        void syncStateToCloud();
        render();
        return;
      }

      lastPreviewStatus = {
        lessonId,
        state: 'loading',
        message: '링크 미리보기와 썸네일을 생성하고 있습니다.',
      };
      render();

      try {
        const preview = await fetchLinkPreview(normalizedLink);
        updateLessonPreview(lessonId, preview);
        if (currentUser) {
          try {
            const thumbnail = await fetchLinkThumbnail(normalizedLink);
            if (thumbnail.imageDataUrl) {
              await saveLessonThumbnail(currentUser.uid, lessonId, thumbnail.imageDataUrl, thumbnail.capturedUrl);
            }
          } catch {}
        }
        lastPreviewStatus = {
          lessonId,
          state: 'success',
          message: '링크 미리보기와 썸네일 생성을 시도했습니다.',
        };
      } catch {
        clearLessonPreview(lessonId);
        lastPreviewStatus = {
          lessonId,
          state: 'error',
          message: '로컬 환경에서는 미리보기 API가 없어 fallback 카드로 표시됩니다.',
        };
      }

      void syncStateToCloud();
      render();
      return;
    }

    lastPreviewStatus = null;
    void syncStateToCloud();
    render();
    return;
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

app.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  resetFieldSaveVisual(target);
});

app.addEventListener('submit', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLFormElement)) {
    return;
  }

  const mode = target.dataset.authForm;
  if (mode !== 'login' && mode !== 'signup') {
    return;
  }

  event.preventDefault();

  const formData = new FormData(target);
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();
  const displayName = String(formData.get('displayName') ?? '').trim();

  authSubmitting = true;
  authErrorMessage = '';
  render();

  try {
    if (mode === 'signup') {
      await signUpWithEmail(displayName, email, password);
    } else {
      await signInWithEmail(email, password);
    }

    authModalOpen = false;
  } catch (error) {
    authErrorMessage = authErrorToMessage(error);
  } finally {
    authSubmitting = false;
    render();
  }
});

window.addEventListener('hashchange', render);

if (!window.location.hash) {
  window.location.hash = '#/';
}

subscribeToAuth(async (user) => {
  authReady = true;
  currentUser = user;

  if (!user) {
    hydratedUserId = null;
    firebaseGalleryStudents = [];
    render();
    return;
  }

  authModalOpen = false;
  authErrorMessage = '';

  if (hydratedUserId === user.uid) {
    render();
    return;
  }

  await hydrateUserState(user);
});

render();
