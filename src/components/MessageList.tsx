import React, { useEffect, useRef } from 'react';
import type { Message } from '../types/chat';
import QuizComponent from './QuizComponent';
import LessonComponent from './LessonComponent';
import InteractiveDialogueComponent from './InteractiveDialogueComponent';

interface MessageListProps {
  messages: Message[];
  onSendMessage?: (content: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start space-x-3 ${
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.sender === 'ai' && (
            <img
              src={message.avatar || '/default-avatar.png'}
              alt="AI Avatar"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          )}
          <div
            className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 py-2 sm:px-4 sm:py-3 ${
              message.sender === 'user'
                ? 'chat-bubble-user'
                : 'chat-bubble-ai'
            }`}
          >
            {message.type === 'text' && <p className="text-sm">{message.content}</p>}
            {message.type === 'quiz' && message.quizData && (
              <QuizComponent quizData={message.quizData} onSelect={onSendMessage} />
            )}
            {message.type === 'lesson' && message.lessonData && (
              <LessonComponent lessonData={message.lessonData} />
            )}
            {message.type === 'interactive' && message.interactiveData && (
              <InteractiveDialogueComponent interactiveData={message.interactiveData} onSelect={onSendMessage} />
            )}
            <p
              className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {formatTime(message.timestamp)}
            </p>
          </div>
          {message.sender === 'user' && (
            <img
              src={message.avatar || '/default-user-avatar.png'}
              alt="User Avatar"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;