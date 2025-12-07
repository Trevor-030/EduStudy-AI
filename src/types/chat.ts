export type MessageType = 'text' | 'quiz' | 'lesson' | 'interactive';

export interface QuizData {
  question: string;
  options: string[];
}

export interface LessonData {
  title: string;
  content: string;
}

export interface InteractiveData {
  prompt: string;
  choices: string[];
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  avatar?: string;
  quizData?: QuizData;
  lessonData?: LessonData;
  interactiveData?: InteractiveData;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  conversationId?: string;
}