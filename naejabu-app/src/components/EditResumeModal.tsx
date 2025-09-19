import React, { useState, useEffect } from 'react';

interface EditResumeModalProps {
  resume: any; // Replace 'any' with a proper type later
  onClose: () => void;
  onSave: (data: any) => void; // Replace 'any' with a proper type later
}

const EditResumeModal: React.FC<EditResumeModalProps> = ({ resume, onClose, onSave }) => {
  const [companyName, setCompanyName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (resume) {
      setCompanyName(resume.company_name);
      setDeadline(new Date(resume.deadline).toISOString().slice(0, 16));
      setQuestions(resume.questions || []);
    }
  }, [resume]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Date.now(), question_text: '', answer_text: '', char_limit: 1000 }]);
  };

  const handleQuestionChange = (id: number, value: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, question_text: value } : q));
  };

  const handleAnswerChange = (id: number, value: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, answer_text: value } : q));
  };

  const handleCharLimitChange = (id: number, charLimit: number) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, char_limit: charLimit } : q));
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...resume,
      company_name: companyName,
      deadline,
      questions,
    });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h2 className="text-4xl font-bold text-primary font-heading mb-8">자소서 수정</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-gray-800 text-lg font-semibold mb-3" htmlFor="companyName">
            회사명
          </label>
          <input
            className="shadow-lg appearance-none border rounded-lg w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-800 text-lg font-semibold mb-3" htmlFor="deadline">
            마감일자
          </label>
          <input
            className="shadow-lg appearance-none border rounded-lg w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4 text-primary font-heading">자소서 문항</h3>
          <div className="space-y-4 max-h-72 overflow-y-auto pr-3 -mr-3">
            {questions.map((q, index) => (
              <div key={q.id} className="p-5 border rounded-xl bg-white shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-gray-800 font-semibold">질문 {index + 1}</label>
                  <button type="button" onClick={() => handleRemoveQuestion(q.id)} className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">
                    삭제
                  </button>
                </div>
                <textarea
                  className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                  placeholder="질문 내용을 입력하세요."
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                  rows={2}
                />
                <textarea
                  className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent transition-shadow mt-4"
                  placeholder="답변을 입력하세요."
                  value={q.answer_text}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  rows={5}
                  maxLength={q.char_limit}
                />
                <div className="text-right text-sm text-gray-500 mt-2">
                  ({q.answer_text?.length || 0}/{q.char_limit}자)
                </div>
                <div className="flex justify-end items-center mt-2 space-x-2">
                    <input
                        type="number"
                        value={q.char_limit}
                        onChange={(e) => handleCharLimitChange(q.id, parseInt(e.target.value, 10))}
                        className="w-24 text-right text-sm text-gray-500 border-b focus:outline-none focus:ring-0 focus:border-accent"
                    />
                    <span className="text-sm text-gray-500">자</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-6">
            <button type="button" onClick={handleAddQuestion} className="flex items-center text-lg text-accent hover:underline font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                질문 추가
            </button>
        </div>

        <div className="mt-10 flex items-center justify-between">
            <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                type="button"
                onClick={onClose}
            >
                취소
            </button>
            <button
                className="bg-accent hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-lg focus:outline-none focus:shadow-outline w-full transition-all duration-300 transform hover:scale-105 ml-4"
                type="submit"
            >
                저장
            </button>
        </div>
      </form>
    </div>
  );
};

export default EditResumeModal;