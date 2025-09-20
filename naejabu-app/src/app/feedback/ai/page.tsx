'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import AlertModal from '@/components/AlertModal';

interface Resume {
  id: number;
  company_name: string;
  deadline: string;
  updated_at: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

const AIFeedbackPage = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
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
  };

  const handleSubmit = () => {
    if (!selectedResumeId) {
        setAlertModalMessage('첨삭받을 이력서를 선택해주세요.');
        setAlertModalOpen(true);
        return;
    }
    // AI 기능은 준비 중
    setAlertModalMessage('기능 준비 중입니다. 빠른 시일 내에 찾아뵙겠습니다!');
    setAlertModalOpen(true);
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-heading">AI에게 첨삭받기</h1>
              <p className="text-lg text-gray-600 mt-4">첨삭받고 싶은 자소서를 하나 선택해주세요.</p>
            </div>

            {loading ? (
              <div className="text-center"><p>이력서를 불러오는 중...</p></div>
            ) : resumes.length > 0 ? (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => handleSelectResume(resume.id)}
                    className={`p-6 bg-white rounded-xl shadow-md cursor-pointer transition-all duration-200 ${
                      selectedResumeId === resume.id
                        ? 'ring-4 ring-accent ring-opacity-75'
                        : 'hover:shadow-lg hover:scale-105'
                    }`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{resume.company_name}</h2>
                            <p className="text-sm text-gray-500 mt-1">마감일: {new Date(resume.deadline).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs text-gray-400">최종수정: {new Date(resume.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <p className="text-gray-500">작성된 이력서가 없습니다.</p>
                <p className="text-gray-500 mt-2">먼저 이력서를 작성해주세요.</p>
              </div>
            )}

            <div className="mt-12 text-center">
              <button
                onClick={handleSubmit}
                disabled={!selectedResumeId || loading}
                className="bg-accent text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 shadow-lg"
              >
                AI 첨삭받기
              </button>
            </div>
          </div>
        </div>
      </div>
      <AlertModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} message={alertModalMessage} />
    </>
  );
};

export default withAuth(AIFeedbackPage);
