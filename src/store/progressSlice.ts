import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  ProgressState,
  QuizResult,
  LessonCompletion,
  ConversationHistory,
  Achievement,
  LearningMilestone,
  QuizSubmission,
  LessonCompletionData,
  ConversationData,
} from '../types/progress';
import { saveProgressToStorage } from '../utils/progressStorage';

const initialStats = {
  totalQuizzes: 0,
  correctAnswers: 0,
  averageScore: 0,
  totalLessons: 0,
  completedLessons: 0,
  totalConversations: 0,
  totalConversationTime: 0,
  achievementsUnlocked: 0,
  currentStreak: 0,
  longestStreak: 0,
};

const initialState: ProgressState = {
  quizResults: [],
  lessonCompletions: [],
  conversationHistory: [],
  achievements: [],
  milestones: [],
  stats: initialStats,
  loading: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    // Quiz actions
    submitQuizResult: (state, action: PayloadAction<QuizSubmission>) => {
      const { quizId, question, selectedAnswer, correctAnswer, score } = action.payload;
      const isCorrect = selectedAnswer === correctAnswer;

      const quizResult: QuizResult = {
        id: `${quizId}-${Date.now()}`,
        quizId,
        question,
        selectedAnswer,
        correctAnswer,
        isCorrect,
        score,
        timestamp: new Date(),
      };

      state.quizResults.push(quizResult);

      // Update stats
      state.stats.totalQuizzes += 1;
      if (isCorrect) {
        state.stats.correctAnswers += 1;
      }
      state.stats.averageScore = (state.stats.averageScore * (state.stats.totalQuizzes - 1) + score) / state.stats.totalQuizzes;

      // Check for achievements
      checkAchievements(state);
    },

    // Lesson actions
    completeLesson: (state, action: PayloadAction<LessonCompletionData>) => {
      const { lessonId, title, timeSpent } = action.payload;

      const lessonCompletion: LessonCompletion = {
        id: `${lessonId}-${Date.now()}`,
        lessonId,
        title,
        completedAt: new Date(),
        timeSpent,
      };

      state.lessonCompletions.push(lessonCompletion);

      // Update stats
      state.stats.completedLessons += 1;

      // Check for achievements
      checkAchievements(state);
    },

    // Conversation actions
    addConversation: (state, action: PayloadAction<ConversationData>) => {
      const { conversationId, messages, duration } = action.payload;

      const conversation: ConversationHistory = {
        id: conversationId,
        conversationId,
        messages,
        startTime: new Date(),
        endTime: new Date(),
        duration,
      };

      state.conversationHistory.push(conversation);

      // Update stats
      state.stats.totalConversations += 1;
      state.stats.totalConversationTime += duration;

      // Check for achievements
      checkAchievements(state);
    },

    // Achievement actions
    unlockAchievement: (state, action: PayloadAction<Achievement>) => {
      const achievement = action.payload;
      if (!state.achievements.find(a => a.id === achievement.id)) {
        state.achievements.push(achievement);
        state.stats.achievementsUnlocked += 1;
      }
    },

    // Milestone actions
    updateMilestone: (state, action: PayloadAction<{ id: string; current: number }>) => {
      const { id, current } = action.payload;
      const milestone = state.milestones.find(m => m.id === id);
      if (milestone) {
        milestone.current = current;
        if (current >= milestone.target && !milestone.completed) {
          milestone.completed = true;
          milestone.completedAt = new Date();
        }
      }
    },

    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Reset progress (for testing or user request)
    resetProgress: (state) => {
      state.quizResults = [];
      state.lessonCompletions = [];
      state.conversationHistory = [];
      state.achievements = [];
      state.milestones = [];
      state.stats = initialStats;
    },

    // Load from localStorage
    loadProgress: (state, action: PayloadAction<ProgressState>) => {
      return action.payload;
    },
  },
});

// Helper function to check and unlock achievements
function checkAchievements(state: ProgressState) {
  const achievements: Achievement[] = [];

  // Quiz achievements
  if (state.stats.totalQuizzes >= 1 && !state.achievements.find(a => a.id === 'first-quiz')) {
    achievements.push({
      id: 'first-quiz',
      name: 'First Quiz',
      description: 'Completed your first quiz',
      icon: '🎯',
      unlockedAt: new Date(),
      category: 'quiz',
    });
  }

  if (state.stats.correctAnswers >= 10 && !state.achievements.find(a => a.id === 'quiz-master')) {
    achievements.push({
      id: 'quiz-master',
      name: 'Quiz Master',
      description: 'Got 10 correct answers',
      icon: '🏆',
      unlockedAt: new Date(),
      category: 'quiz',
    });
  }

  // Lesson achievements
  if (state.stats.completedLessons >= 1 && !state.achievements.find(a => a.id === 'first-lesson')) {
    achievements.push({
      id: 'first-lesson',
      name: 'First Lesson',
      description: 'Completed your first lesson',
      icon: '📚',
      unlockedAt: new Date(),
      category: 'lesson',
    });
  }

  // Conversation achievements
  if (state.stats.totalConversations >= 5 && !state.achievements.find(a => a.id === 'conversationalist')) {
    achievements.push({
      id: 'conversationalist',
      name: 'Conversationalist',
      description: 'Had 5 conversations',
      icon: '💬',
      unlockedAt: new Date(),
      category: 'conversation',
    });
  }

  // Add achievements to state
  achievements.forEach(achievement => {
    if (!state.achievements.find(a => a.id === achievement.id)) {
      state.achievements.push(achievement);
      state.stats.achievementsUnlocked += 1;
    }
  });
}

export const {
  submitQuizResult,
  completeLesson,
  addConversation,
  unlockAchievement,
  updateMilestone,
  setLoading,
  setError,
  resetProgress,
  loadProgress,
} = progressSlice.actions;

export default progressSlice.reducer;