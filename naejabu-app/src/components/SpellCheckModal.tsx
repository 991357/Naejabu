import React, { useState, useEffect } from 'react';

interface SpellCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  results: any[];
  onCorrectAll: (correctedText: string) => void;
}

const SpellCheckModal: React.FC<SpellCheckModalProps> = ({ isOpen, onClose, text, results, onCorrectAll }) => {
  const [correctedText, setCorrectedText] = useState(text);
  const [selectedError, setSelectedError] = useState<any>(null);

  useEffect(() => {
    setCorrectedText(text);
  }, [text]);

  if (!isOpen) {
    return null;
  }

  const handleCorrection = (from: string, to: string) => {
    setCorrectedText(prev => prev.replace(from, to));
  };

  const renderHighlightedText = () => {
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];
    results.forEach((result, i) => {
        const token = result.token;
        const index = correctedText.indexOf(token, lastIndex);
        if (index > lastIndex) {
            parts.push(correctedText.substring(lastIndex, index));
        }
        parts.push(
            <span key={i} className={`px-1 rounded ${selectedError?.token === token ? 'bg-yellow-200 dark:bg-yellow-700 dark:text-yellow-100' : 'bg-red-200 dark:bg-red-700 dark:text-red-100'}`}>
                {token}
            </span>
        );
        lastIndex = index + token.length;
    });
    if (lastIndex < correctedText.length) {
        parts.push(correctedText.substring(lastIndex));
    }
    return parts;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-4/5 flex flex-col">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold dark:text-white">맞춤법 검사</h2>
        </div>
        <div className="flex-grow flex p-6 overflow-hidden">
          {/* Left side: Text */}
          <div className="w-1/2 pr-6 overflow-y-auto">
            <div className="text-lg leading-relaxed whitespace-pre-wrap dark:text-gray-300">
                {renderHighlightedText()}
            </div>
          </div>
          {/* Right side: Error list */}
          <div className="w-1/2 pl-6 border-l dark:border-gray-700 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">수정 제안</h3>
            <div className="space-y-4">
              {results.map((result, i) => (
                <div 
                    key={i} 
                    className={`p-4 border rounded-lg cursor-pointer dark:border-gray-700 ${selectedError?.token === result.token ? 'border-blue-500 dark:border-blue-400' : ''}`}
                    onClick={() => setSelectedError(result)}
                >
                  <p className="text-red-500 dark:text-red-400 font-semibold">{result.token}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{result.info}</p>
                  {result.suggestions.map((suggestion: string, j: number) => (
                    <button
                      key={j}
                      onClick={() => handleCorrection(result.token, suggestion)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200 text-sm font-semibold py-1 px-3 rounded-full mr-2 mb-2"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t dark:border-gray-700 flex justify-end">
          <button onClick={onClose} className="mr-4 px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
            취소
          </button>
          <button onClick={() => onCorrectAll(correctedText)} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
            수정 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpellCheckModal;
