import { useState } from 'react';
import { CheckCircle, Circle, Sparkles, Zap, Star } from 'lucide-react';

interface InteractiveData {
  prompt: string;
  choices: string[];
}

interface InteractiveDialogueComponentProps {
  interactiveData: InteractiveData;
  onSelect?: (choice: string) => void;
}

const InteractiveDialogueComponent = ({ interactiveData, onSelect }: InteractiveDialogueComponentProps) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [hoveredChoice, setHoveredChoice] = useState<string | null>(null);

  const handleChoiceClick = (choice: string) => {
    setSelectedChoice(choice);
    onSelect?.(choice);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto p-8 bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-3xl shadow-2xl border-2 border-indigo-200 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-4 right-4 opacity-20">
        <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse" style={{ animationDuration: '3s' }} />
      </div>
      <div className="absolute bottom-4 left-4 opacity-20">
        <Star className="h-6 w-6 text-purple-400 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }} />
      </div>

      {/* Prompt Section */}
      <div className="mb-8 relative">
        <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
        <div className="flex items-start gap-3 pl-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2 shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-600 mb-1 uppercase tracking-wide">Question</h3>
            <p className="text-lg font-medium text-gray-900 leading-relaxed">{interactiveData.prompt}</p>
          </div>
        </div>
      </div>

      {/* Choices Section */}
      <div className="space-y-3">
        {interactiveData.choices.map((choice, index) => {
          const isSelected = selectedChoice === choice;
          const isHovered = hoveredChoice === choice;

          return (
            <button
              key={index}
              onClick={() => handleChoiceClick(choice)}
              onMouseEnter={() => setHoveredChoice(choice)}
              onMouseLeave={() => setHoveredChoice(null)}
              disabled={selectedChoice !== null}
              className={`relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 transform group ${
                isSelected
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 shadow-xl scale-[1.02]'
                  : 'bg-white text-gray-900 border-gray-200 hover:border-indigo-400 hover:shadow-lg hover:scale-[1.01] disabled:hover:scale-100'
              } ${selectedChoice !== null && !isSelected ? 'opacity-50' : ''}`}
            >
              {/* Hover Glow Effect */}
              {isHovered && !isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl opacity-50 transition-opacity"></div>
              )}

              <div className="relative flex items-center gap-4">
                {/* Choice Number Badge */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  isSelected
                    ? 'bg-white text-green-600'
                    : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 group-hover:from-indigo-200 group-hover:to-purple-200'
                }`}>
                  {isSelected ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>

                {/* Choice Text */}
                <p className={`flex-1 font-medium transition-all ${
                  isSelected ? 'text-white' : 'text-gray-900'
                }`}>
                  {choice}
                </p>

                {/* Icon Indicator */}
                <div className={`flex-shrink-0 transition-all ${
                  isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}>
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Selection Glow */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 opacity-20 blur-xl"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirmation Message */}
      {selectedChoice && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-2 shadow-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">Great choice!</p>
              <p className="text-sm text-green-700 mt-0.5">You selected: <span className="font-medium">{selectedChoice}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveDialogueComponent;