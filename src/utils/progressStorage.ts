import type { ProgressState } from '../types/progress';

const PROGRESS_STORAGE_KEY = 'educational_app_progress';

export const saveProgressToStorage = (progress: ProgressState): void => {
  try {
    // Convert dates to ISO strings for storage
    const serializedProgress = {
      ...progress,
      quizResults: progress.quizResults.map(result => ({
        ...result,
        timestamp: result.timestamp.toISOString(),
      })),
      lessonCompletions: progress.lessonCompletions.map(completion => ({
        ...completion,
        completedAt: completion.completedAt.toISOString(),
      })),
      conversationHistory: progress.conversationHistory.map(conversation => ({
        ...conversation,
        startTime: conversation.startTime.toISOString(),
        endTime: conversation.endTime?.toISOString(),
      })),
      achievements: progress.achievements.map(achievement => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt.toISOString(),
      })),
      milestones: progress.milestones.map(milestone => ({
        ...milestone,
        completedAt: milestone.completedAt?.toISOString(),
      })),
    };

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(serializedProgress));
  } catch (error) {
    console.error('Failed to save progress to localStorage:', error);
  }
};

export const loadProgressFromStorage = (): ProgressState | null => {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Convert ISO strings back to Date objects
    return {
      ...parsed,
      quizResults: parsed.quizResults.map((result: any) => ({
        ...result,
        timestamp: new Date(result.timestamp),
      })),
      lessonCompletions: parsed.lessonCompletions.map((completion: any) => ({
        ...completion,
        completedAt: new Date(completion.completedAt),
      })),
      conversationHistory: parsed.conversationHistory.map((conversation: any) => ({
        ...conversation,
        startTime: new Date(conversation.startTime),
        endTime: conversation.endTime ? new Date(conversation.endTime) : undefined,
      })),
      achievements: parsed.achievements.map((achievement: any) => ({
        ...achievement,
        unlockedAt: new Date(achievement.unlockedAt),
      })),
      milestones: parsed.milestones.map((milestone: any) => ({
        ...milestone,
        completedAt: milestone.completedAt ? new Date(milestone.completedAt) : undefined,
      })),
    };
  } catch (error) {
    console.error('Failed to load progress from localStorage:', error);
    return null;
  }
};

export const clearProgressFromStorage = (): void => {
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear progress from localStorage:', error);
  }
};