'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import AlertModal from '@/components/AlertModal';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Resume {
  id: number;
  company_name: string;
  deadline: string;
  updated_at: string;
}

interface Feedback {
  overall: string;
  suggestions: {
    original: string;
    suggestion: string;
    comment: string;
  }[];
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

const FeedbackDisplay = ({ feedback }: { feedback: Feedback }) => (
  <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-fade-in">
    <h3 className="text-2xl font-bold text-primary dark:text-blue-400 mb-4">AI 첨삭 결과</h3>
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">총평</h4>
      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{feedback.overall}</p>
    </div>
    <div>
      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">개선 제안</h4>
      <div className="space-y-4">
        {feedback.suggestions.map((item, index) => (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">원본 내용</p>
            <p className="text-gray-700 dark:text-gray-300 line-through">{item.original}</p>
            <hr className="my-3 border-gray-200 dark:border-gray-600" />
            <p className="text-sm text-green-600 dark:text-green-400 mb-2">추천 수정안</p>
            <p className="text-gray-800 dark:text-gray-100 font-semibold">{item.suggestion}</p>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-blue-800 dark:text-blue-300"><span className="font-bold">코멘트:</span> {item.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AIFeedbackPage = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<Feedback | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState('');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/resumes', { headers: getAuthHeaders() });
        if (response.ok) {
          const data = await response.json();
          setResumes(data);
        } else {
          throw new Error('Failed to fetch resumes');
        }
      } catch (error) {
        console.error(error);
        setAlertModalMessage('이력서를 불러오는 데 실패했습니다.');
        setAlertModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const handleSelectResume = (id: number) => {
    setSelectedResumeId(id);
    setAiFeedback(null); // 이력서 선택 변경 시 이전 피드백 숨기기
  };

  const handleSubmit = async () => {
    if (!selectedResumeId) {
        setAlertModalMessage('첨삭받을 이력서를 선택해주세요.');
        setAlertModalOpen(true);
        return;
    }

    setIsAiLoading(true);
    setAiFeedback(null);

    try {
      // 1. 선택된 이력서의 전체 내용 가져오기
      const resumeRes = await fetch(`/api/resumes/${selectedResumeId}`, { headers: getAuthHeaders() });
      if (!resumeRes.ok) throw new Error('선택된 이력서의 내용을 가져오는 데 실패했습니다.');
      const resumeData = await resumeRes.json();

      // 이력서 질문과 답변을 하나의 문자열로 합칩니다.
      const resumeContent = resumeData.questions && resumeData.questions
        .map((q: { question_text: string; answer_text: string }) => `질문: ${q.question_text}\n답변: ${q.answer_text || ''}`)
        .join('\n\n');

      if (!resumeContent || resumeContent.trim() === '') {
        throw new Error('이력서 내용이 비어있습니다. 질문에 대한 답변을 먼저 작성해주세요.');
      }

      // 2. AI 첨삭 API 호출
      const aiRes = await fetch('/api/feedback/ai', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ resumeContent }),
      });

      if (!aiRes.ok) {
        const errorData = await aiRes.json();
        throw new Error(errorData.error || 'AI 첨삭에 실패했습니다.');
      }

      const { feedback } = await aiRes.json();
      setAiFeedback(feedback);

    } catch (error: any) {
      console.error(error);
      setAlertModalMessage(error.message || '오류가 발생했습니다.');
      setAlertModalOpen(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary dark:text-blue-400 font-heading">AI에게 첨삭받기</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-4">첨삭받고 싶은 자소서를 하나 선택해주세요.</p>
            </div>

            {loading ? (
              <div className="text-center dark:text-gray-300"><p>이력서를 불러오는 중...</p></div>
            ) : resumes.length > 0 ? (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => handleSelectResume(resume.id)}
                    className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md cursor-pointer transition-all duration-200 ${
                      selectedResumeId === resume.id
                        ? 'ring-4 ring-accent ring-opacity-75'
                        : 'hover:shadow-lg hover:scale-105'
                    }`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{resume.company_name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">마감일: {new Date(resume.deadline).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">최종수정: {new Date(resume.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <p className="text-gray-500 dark:text-gray-400">작성된 이력서가 없습니다.</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">먼저 이력서를 작성해주세요.</p>
              </div>
            )}

            <div className="mt-12 text-center">
              <button
                onClick={handleSubmit}
                disabled={!selectedResumeId || loading || isAiLoading}
                className="bg-accent text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 shadow-lg"
              >
                {isAiLoading ? 'AI가 분석 중...' : 'AI 첨삭받기'}
              </button>
            </div>

            {isAiLoading && <LoadingSpinner />}
            {aiFeedback && <FeedbackDisplay feedback={aiFeedback} />}

          </div>
        </div>
      </div>
      <AlertModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} message={alertModalMessage} />
    </>
  );
};

export default withAuth(AIFeedbackPage);
