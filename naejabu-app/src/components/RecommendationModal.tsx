import React from 'react';
import Modal from './Modal'; // Assuming a generic Modal component exists

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  onRefresh?: () => void; // New prop for refreshing suggestions
}

const RecommendationModal: React.FC<RecommendationModalProps> = ({ isOpen, onClose, title, suggestions, onSelect, onRefresh }) => {
  const handleSelect = (suggestion: string) => {
    onSelect(suggestion);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary mb-4 font-heading">{title} 추천</h2>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="bg-gray-200 hover:bg-accent hover:text-white text-gray-800 font-medium py-2 px-4 rounded-full transition-colors duration-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="flex justify-end items-center mt-6 space-x-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 rounded bg-accent text-white hover:bg-opacity-80"
            >
              다시 추천받기
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RecommendationModal;
