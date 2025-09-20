'use client';

import { useState, useEffect, useCallback } from 'react';
import withAuth from '@/components/withAuth';
import AlertModal from '@/components/AlertModal';

interface Resume {
  id: number;
  company_name: string;
  deadline: string;
  updated_at: string;
  mentoring_status?: 'pending' | 'completed' | 'canceled';
  feedback_count: number;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

const MentorRequestPage = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState('');

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback/resumes-with-status', { headers: getAuthHeaders() });
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
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleSelectResume = (resume: Resume) => {
    if (resume.mentoring_status === 'pending' || resume.mentoring_status === 'completed') {
        return; // Do not select if already requested or completed
    }
    setSelectedResumeId(resume.id);
  };

  const handleSubmit = async () => {
    if (!selectedResumeId) {
        setAlertModalMessage('첨삭을 요청할 이력서를 선택해주세요.');
        setAlertModalOpen(true);
        return;
    }
    
    setSubmitting(true);
    try {
        const response = await fetch('/api/feedback/mentor-request', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ resume_id: selectedResumeId }),
        });

        if (response.ok) {
            setAlertModalMessage('멘토에게 첨삭 요청이 성공적으로 등록되었습니다!');
            setAlertModalOpen(true);
            setSelectedResumeId(null);
            fetchResumes(); // Refresh the list
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit request');
        }
    } catch (error: any) {
        console.error(error);
        setAlertModalMessage(error.message || '첨삭 요청에 실패했습니다.');
        setAlertModalOpen(true);
    } finally {
        setSubmitting(false);
    }
  };

  const getStatusBadge = (resume: Resume) => {
      const { mentoring_status, feedback_count } = resume;
      
      if (mentoring_status === 'canceled') {
          // This status is not expected on this page, but handle for robustness
          return <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">취소됨</span>;
      }

      if (mentoring_status === 'pending' || mentoring_status === 'completed') {
          if (feedback_count > 0) {
              return <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">첨삭 진행중</span>;
          } else {
              return <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">요청중</span>;
          }
      }
      
      return null;
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-heading">멘토에게 첨삭받기</h1>
              <p className="text-lg text-gray-600 mt-4">첨삭받고 싶은 자소서를 하나 선택하여 요청해주세요.</p>
            </div>

            {loading ? (
              <div className="text-center"><p>이력서를 불러오는 중...</p></div>
            ) : resumes.length > 0 ? (
              <div className="space-y-4">
                {resumes.map((resume) => {
                    const isSelectable = !(resume.mentoring_status === 'pending' || resume.mentoring_status === 'completed');
                    return (
                        <div
                            key={resume.id}
                            onClick={() => isSelectable && handleSelectResume(resume)}
                            className={`p-6 bg-white rounded-xl shadow-md transition-all duration-200 ${
                                !isSelectable ? 'bg-gray-100 cursor-not-allowed opacity-70' :
                                selectedResumeId === resume.id ? 'ring-4 ring-accent ring-opacity-75' : 'cursor-pointer hover:shadow-lg hover:scale-105'
                            }`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{resume.company_name}</h2>
                                    <p className="text-sm text-gray-500 mt-1">마감일: {new Date(resume.deadline).toLocaleDateString()}</p>
                                </div>
                                <div className='text-right'>
                                    {getStatusBadge(resume)}
                                    <p className="text-xs text-gray-400 mt-1">최종수정: {new Date(resume.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
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
                disabled={!selectedResumeId || loading || submitting}
                className="bg-accent text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 shadow-lg"
              >
                {submitting ? '요청하는 중...' : '멘토에게 첨삭 요청하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <AlertModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} message={alertModalMessage} />
    </>
  );
};

export default withAuth(MentorRequestPage);
