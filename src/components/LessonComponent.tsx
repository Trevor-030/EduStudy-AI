import React from 'react';
import type { LessonData } from '../types/chat';

interface LessonComponentProps {
  lessonData: LessonData;
}

const LessonComponent: React.FC<LessonComponentProps> = ({ lessonData }) => {
  return (
    <div className="card w-full max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{lessonData.title}</h3>
      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
        {lessonData.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-base">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default LessonComponent;