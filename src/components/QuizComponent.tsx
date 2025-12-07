import React, { useState } from 'react';
import type { QuizData } from '../types/chat';

interface QuizComponentProps {
  quizData: QuizData;
  onSelect?: (option: string) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quizData, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    onSelect?.(option);
  };

  return (
    <div className="card w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-6 text-gray-900">{quizData.question}</h3>
      <div className="space-y-3">
        {quizData.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
              selectedOption === option
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500 shadow-lg'
                : 'bg-gray-50 text-gray-900 border-gray-300 hover:bg-gray-100 hover:border-blue-300'
            }`}
            disabled={selectedOption !== null}
          >
            {option}
          </button>
        ))}
      </div>
      {selectedOption && (
        <p className="mt-6 text-sm text-blue-600 font-medium bg-blue-50 p-3 rounded-lg">
          ✓ You selected: {selectedOption}
        </p>
      )}
    </div>
  );
};

export default QuizComponent;