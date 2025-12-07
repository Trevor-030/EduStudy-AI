import React from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping }) => {
  if (!isTyping) return null;

  return (
    <div className="flex items-center space-x-3 p-4" aria-live="polite" aria-label="AI is typing">
      <div className="flex space-x-1">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce shadow-sm"></div>
        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm text-gray-600 font-medium">AI is thinking...</span>
    </div>
  );
};

export default TypingIndicator;