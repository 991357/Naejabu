"use client";

import React from 'react';

interface ResumeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ value, onChange, placeholder, maxLength }) => {
  const characterCount = value.length;

  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '내용을 입력하세요...'}
        maxLength={maxLength}
        className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600 transition-shadow duration-200 ease-in-out shadow-sm"
      />
      <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">
        {characterCount}{maxLength && ` / ${maxLength}`}
      </div>
    </div>
  );
};

export default ResumeEditor;
