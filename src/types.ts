export type AppRoute =
  | { view: 'landing' }
  | { view: 'classroom' }
  | { view: 'lesson'; lessonId: string };

export interface LessonVocabulary {
  term: string;
  easyMeaning: string;
}

export interface LessonReading {
  title: string;
  summary: string;
  whyImportant: string;
  body: string[];
}

export interface CourseLesson {
  id: string;
  session: number;
  stage: string;
  stageLabel: string;
  difficulty: string;
  title: string;
  summary: string;
  promise: string;
  learningGoal: string;
  assignment: string;
  output: string;
  duration: string;
  warmup: string;
  mindsetTip: string;
  prepItems: string[];
  vocabulary: LessonVocabulary[];
  readings: LessonReading[];
  steps: string[];
  prompts: string[];
  checklist: string[];
  coachNotes: string[];
}

export interface HighlightCard {
  title: string;
  body: string;
}

export interface LearnerPromise {
  label: string;
  title: string;
  body: string;
}

export interface LessonSubmissionDraft {
  problemStatement: string;
  promptText: string;
  resultLink: string;
}

export interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
  url: string;
}

export interface PersistedState {
  completedLessonIds: string[];
  lastVisitedLessonId: string | null;
  submissionsByLesson: Record<string, LessonSubmissionDraft>;
  previewsByLesson: Record<string, LinkPreviewData>;
}
