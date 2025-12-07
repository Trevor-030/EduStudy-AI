import React, { useState } from 'react';
import type { InteractiveData } from '../types/chat';

interface InteractiveDialogueComponentProps {
  interactiveData: InteractiveData;
  onSelect?: (choice: string) => void;
}

const InteractiveDialogueComponent: React.FC<InteractiveDialogueComponentProps> = ({ interactiveData, onSelect }) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const handleChoiceClick = (choice: string) => {
    setSelectedChoice(choice);
    onSelect?.(choice);
  };

  return (
    <div className="card w-full max-w-md mx-auto">
      <p className="text-base mb-6 text-gray-900 font-medium">{interactiveData.prompt}</p>
      <div className="space-y-3">
        {interactiveData.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleChoiceClick(choice)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
              selectedChoice === choice
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg'
                : 'bg-gray-50 text-gray-900 border-gray-300 hover:bg-gray-100 hover:border-blue-300'
            }`}
            disabled={selectedChoice !== null}
          >
            {choice}
          </button>
        ))}
      </div>
      {selectedChoice && (
        <p className="mt-6 text-sm text-green-600 font-medium bg-green-50 p-3 rounded-lg">
          ✓ You chose: {selectedChoice}
        </p>
      )}
    </div>
  );
};

export default InteractiveDialogueComponent;