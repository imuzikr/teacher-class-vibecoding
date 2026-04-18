import type { LessonSubmissionDraft, LinkPreviewData, PersistedState } from './types.ts';

const STORAGE_KEY = 'vibe-coding-starter-progress-v1';

const emptySubmissionDraft: LessonSubmissionDraft = {
  problemStatement: '',
  promptText: '',
  reflectionNote: '',
  resultLink: '',
};

const initialState: PersistedState = {
  completedLessonIds: [],
  lastVisitedLessonId: null,
  submissionsByLesson: {},
  previewsByLesson: {},
};

let state = loadState();

function normalizeState(parsed: Partial<PersistedState> | null | undefined): PersistedState {
  return {
    completedLessonIds: Array.isArray(parsed?.completedLessonIds) ? parsed.completedLessonIds : [],
    lastVisitedLessonId: parsed?.lastVisitedLessonId ?? null,
    submissionsByLesson:
      parsed?.submissionsByLesson && typeof parsed.submissionsByLesson === 'object' ? parsed.submissionsByLesson : {},
    previewsByLesson:
      parsed?.previewsByLesson && typeof parsed.previewsByLesson === 'object' ? parsed.previewsByLesson : {},
  };
}

function loadState(): PersistedState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    persist(initialState);
    return { ...initialState };
  }

  try {
    const parsed = JSON.parse(raw) as PersistedState;
    return normalizeState(parsed);
  } catch {
    persist(initialState);
    return { ...initialState };
  }
}

function persist(nextState: PersistedState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

function sync(nextState: PersistedState) {
  state = nextState;
  persist(state);
}

export function getState() {
  return state;
}

export function replaceState(nextState: Partial<PersistedState>) {
  sync(normalizeState(nextState));
}

export function isLessonComplete(lessonId: string) {
  return state.completedLessonIds.includes(lessonId);
}

export function toggleLessonComplete(lessonId: string) {
  const completedLessonIds = isLessonComplete(lessonId)
    ? state.completedLessonIds.filter((id) => id !== lessonId)
    : [...state.completedLessonIds, lessonId];

  sync({
    ...state,
    completedLessonIds,
  });
}

export function setLastVisitedLesson(lessonId: string) {
  sync({
    ...state,
    lastVisitedLessonId: lessonId,
  });
}

export function getLessonSubmission(lessonId: string) {
  const stored = state.submissionsByLesson[lessonId];
  return {
    ...emptySubmissionDraft,
    ...stored,
  };
}

export function updateLessonSubmission(lessonId: string, patch: Partial<LessonSubmissionDraft>) {
  sync({
    ...state,
    submissionsByLesson: {
      ...state.submissionsByLesson,
      [lessonId]: {
        ...getLessonSubmission(lessonId),
        ...patch,
      },
    },
  });
}

export function getLessonPreview(lessonId: string) {
  return state.previewsByLesson[lessonId] ?? null;
}

export function updateLessonPreview(lessonId: string, preview: LinkPreviewData) {
  sync({
    ...state,
    previewsByLesson: {
      ...state.previewsByLesson,
      [lessonId]: preview,
    },
  });
}

export function clearLessonPreview(lessonId: string) {
  const nextPreviews = { ...state.previewsByLesson };
  delete nextPreviews[lessonId];

  sync({
    ...state,
    previewsByLesson: nextPreviews,
  });
}

export function resetProgress() {
  sync({ ...initialState });
}
