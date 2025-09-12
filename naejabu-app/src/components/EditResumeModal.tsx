import React, { useState, useEffect } from 'react';

interface EditResumeModalProps {
  resume: any; // Replace 'any' with a proper type later
  onClose: () => void;
  onSave: (data: any) => void; // Replace 'any' with a proper type later
}

const EditResumeModal: React.FC<EditResumeModalProps> = ({ resume, onClose, onSave }) => {
  const [companyName, setCompanyName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState<{ id: number; question_text: string }[]>([]);

  useEffect(() => {
    if (resume) {
      setCompanyName(resume.company_name);
      setDeadline(new Date(resume.deadline).toISOString().slice(0, 16));
      if (resume.questions && resume.questions.length > 0 && typeof resume.questions[0] === 'string') {
        setQuestions(resume.questions.map((q: string, index: number) => ({
            id: Date.now() + index,
            question_text: q,
            answer_text: ''
        })));
      } else {
        setQuestions(resume.questions);
      }
    }
  }, [resume]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Date.now(), question_text: '' }]);
  };

  const handleQuestionChange = (id: number, value: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, question_text: value } : q));
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      company_name: companyName,
      deadline,
      questions,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">자소서 수정</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">
            회사명
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="companyName"
            type="text"
            placeholder="예: 구글 (Google)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deadline">
            마감일자
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        <h3 className="text-lg font-semibold mb-3">자소서 문항</h3>
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {questions.map((q, index) => (
            <div key={q.id} className="flex items-center">
              <div className="flex-grow">
                <label className="block text-gray-700 text-sm font-bold mb-2">질문 {index + 1}</label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  placeholder="질문 내용을 입력하세요."
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveQuestion(q.id)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
            <button type="button" onClick={handleAddQuestion} className="text-sm text-blue-600 hover:underline">
                + 질문 추가
            </button>
        </div>

        <div className="flex items-center justify-between mt-8">
            <button
                className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={onClose}
            >
                취소
            </button>
            <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
