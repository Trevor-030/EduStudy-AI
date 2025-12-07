export interface QuizResult {
  id: string;
  quizId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  timestamp: Date;
}

export interface LessonCompletion {
  id: string;
  lessonId: string;
  title: string;
  completedAt: Date;
  timeSpent: number; // in minutes
}

export interface ConversationHistory {
  id: string;
  conversationId: string;
  messages: number;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'quiz' | 'lesson' | 'conversation' | 'milestone';
}

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  completedAt?: Date;
  category: 'quizzes' | 'lessons' | 'conversations' | 'score';
}

export interface ProgressStats {
  totalQuizzes: number;
  correctAnswers: number;
  averageScore: number;
  totalLessons: number;
  completedLessons: number;
  totalConversations: number;
  totalConversationTime: number;
  achievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ProgressState {
  quizResults: QuizResult[];
  lessonCompletions: LessonCompletion[];
  conversationHistory: ConversationHistory[];
  achievements: Achievement[];
  milestones: LearningMilestone[];
  stats: ProgressStats;
  loading: boolean;
  error: string | null;
}

export interface QuizSubmission {
  quizId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  score: number;
}

export interface LessonCompletionData {
  lessonId: string;
  title: string;
  timeSpent: number;
}

export interface ConversationData {
  conversationId: string;
  messages: number;
  duration: number;
}