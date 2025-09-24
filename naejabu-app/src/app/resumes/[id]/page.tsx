'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import withAuth from '../../../components/withAuth';
import Modal from '../../../components/Modal';
import EditResumeModal from '../../../components/EditResumeModal';
import SpellCheckModal from '../../../components/SpellCheckModal';
import AlertModal from '../../../components/AlertModal';
import ResumeEditor from '../../../components/ResumeEditor'; // ReactQuill 대신 ResumeEditor를 임포트

import VersionHistoryModal from '../../../components/VersionHistoryModal';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

const ResumeDetailPage = () => {
  const [resume, setResume] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [spellCheckResults, setSpellCheckResults] = useState<{ [key: number]: any[] }>({});
  const [spellCheckLoading, setSpellCheckLoading] = useState<{ [key: number]: boolean }>({});
  const [isSpellCheckModalOpen, setIsSpellCheckModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{ id: number; text: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const openAlertModal = (message: string) => {
    setAlertModalMessage(message);
    setAlertModalOpen(true);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const fetchResumeDetail = async () => {
    if (id) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/resumes/${id}`, { headers: getAuthHeaders() });
        if (!response.ok) {
          throw new Error('Failed to fetch resume details');
        }
        const data = await response.json();
        setResume(data);
        const initialAnswers: { [key: number]: string } = {};
        data.questions.forEach((q: any) => {
          initialAnswers[q.id] = q.answer_text || '';
        });
        setAnswers(initialAnswers);
        setIsDirty(false);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchResumeDetail();
  }, [id]);

  useEffect(() => {
    if (!resume) return;

    const interval = setInterval(() => {
      const now = new Date();
      const deadline = new Date(resume.deadline);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('마감되었습니다.');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`D-${days} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [resume]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    const updatedQuestions = resume.questions.map((q: any) => ({
      ...q,
      answer_text: answers[q.id] || '',
    }));

    const response = await fetch(`/api/resumes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        company_name: resume.company_name,
        deadline: resume.deadline,
        questions: updatedQuestions 
      }),
    });

    if (response.ok) {
      setIsDirty(false);
      openAlertModal('저장되었습니다. 새로운 버전이 생성되었습니다.');
      // Optionally re-fetch versions if the modal is open, but for now just a message is fine.
    } else {
      openAlertModal('저장에 실패했습니다.');
    }
  };

  const handleSaveEdit = async (updatedData: any) => {
    // 현재 answers 상태를 보존하기 위해 PUT 요청 body에 answers를 포함시킵니다.
    const questionsWithCurrentAnswers = updatedData.questions.map((q: any) => {
      const existingAnswer = answers[q.id];
      return {
        ...q,
        // 새 질문이거나 기존 질문에 답변이 없는 경우를 처리합니다.
        answer_text: existingAnswer || ''
      };
    });

    const payload = {
      ...updatedData,
      questions: questionsWithCurrentAnswers,
    };

    const response = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    if (response.ok) {
        const newResumeData = await response.json();
        // 서버로부터 받은 최신 데이터로 resume 상태를 업데이트합니다.
        // 이렇게 하면 새로 생성된 질문의 ID도 정확히 반영됩니다.
        setResume(newResumeData);
        
        // answers 상태도 서버 응답 기준으로 업데이트하여 일관성을 유지합니다.
        const newAnswers: { [key: number]: string } = {};
        newResumeData.questions.forEach((q: any) => {
          newAnswers[q.id] = q.answer_text || '';
        });
        setAnswers(newAnswers);

        setIsEditModalOpen(false);
        openAlertModal('수정되었습니다. 새로운 버전이 생성되었습니다.');
    } else {
        openAlertModal('수정에 실패했습니다.');
    }
  };

  const handleSpellCheck = async (questionId: number) => {
    setSpellCheckLoading(prev => ({ ...prev, [questionId]: true }));
    const text = answers[questionId];
    const response = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    if (response.ok) {
        const results = await response.json();
        setSpellCheckResults(prev => ({ ...prev, [questionId]: results }));
        setCurrentQuestion({ id: questionId, text });
        setIsSpellCheckModalOpen(true);
    }
    setSpellCheckLoading(prev => ({ ...prev, [questionId]: false }));
  };

  const handleCorrectAll = (questionId: number, correctedText: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: correctedText }));
    setIsDirty(true);
    setIsSpellCheckModalOpen(false);
  };

  const handleNavigate = (url: string) => {
    if (isDirty) {
      setNextUrl(url);
      setShowUnsavedChangesModal(true);
    } else {
      router.push(url);
    }
  };

  const confirmNavigation = () => {
    if (nextUrl) {
      setIsDirty(false);
      router.push(nextUrl);
    }
  };

  const handleRestoreVersion = (restoredQuestions: any[]) => {
    // The questions from the version might not match the current questions.
    // We need to update the resume's questions and the answers state.
    const newAnswers: { [key: number]: string } = {};
    const newQuestions = restoredQuestions.map((q, index) => {
      // The old questions don't have a real ID in the context of the current resume,
      // so we use the existing question ID if available at the same index, or a temporary one.
      const existingQuestion = resume.questions[index];
      const id = existingQuestion ? existingQuestion.id : `temp-${index}`;
      newAnswers[id] = q.answer_text || '';
      return {
        ...q,
        id: id, 
      };
    });

    // We need to create a new set of questions for the resume state
    setResume((prev: any) => ({ ...prev, questions: newQuestions }));
    setAnswers(newAnswers);
    setIsDirty(true);
    openAlertModal('선택한 버전으로 복원되었습니다. 저장하여 새 버전으로 만드세요.');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p className="dark:text-white">Loading...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen"><p className="text-red-500">{error}</p></div>;
  }

  if (!resume) {
    return <div className="flex justify-center items-center min-h-screen"><p className="dark:text-white">Resume not found.</p></div>;
  }

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <AlertModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} message={alertModalMessage} />
      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-heading text-4xl font-bold text-primary dark:text-blue-400">{resume.company_name}</h1>
            <p className="text-red-500 font-semibold mt-2 text-xl">{timeLeft}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowVersionModal(true)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105">
                버전
            </button>
            <button onClick={() => setIsEditModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105">
                수정하기
            </button>
            <button onClick={handleSave} className="bg-accent hover:bg-opacity-80 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105">
                저장하기
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {resume.questions.map((q: any, index: number) => (
            <div
              key={q.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-fade-in-down"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <label className="block font-heading text-primary dark:text-blue-400 text-2xl font-bold mb-4">{index + 1}. {q.question_text}</label>
              <ResumeEditor
                value={answers[q.id] || ''}
                onChange={(value) => handleAnswerChange(q.id, value)}
                placeholder={`${q.char_limit || 1000}자 이내로 작성해주세요.`}
                maxLength={q.char_limit || 1000}
              />
              <div className="flex justify-end items-center mt-2 text-sm text-gray-500">
                <button
                  onClick={() => handleSpellCheck(q.id)}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-1 px-3 rounded text-xs"
                  disabled={spellCheckLoading[q.id]}
                >
                  {spellCheckLoading[q.id] ? '검사 중...' : '맞춤법 검사'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <EditResumeModal
            resume={resume}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEdit}
        />
      </Modal>
      {currentQuestion && (
        <SpellCheckModal
            isOpen={isSpellCheckModalOpen}
            onClose={() => setIsSpellCheckModalOpen(false)}
            text={currentQuestion.text}
            results={spellCheckResults[currentQuestion.id] || []}
            onCorrectAll={(correctedText) => handleCorrectAll(currentQuestion.id, correctedText)}
        />
      )}
      <Modal isOpen={showUnsavedChangesModal} onClose={() => setShowUnsavedChangesModal(false)}>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">저장하지 않은 변경사항</h2>
            <p className="dark:text-gray-300">저장하지 않은 변경사항이 있습니다. 페이지를 벗어나시겠습니까?</p>
            <div className="flex justify-end mt-6">
                <button
                    onClick={() => setShowUnsavedChangesModal(false)}
                    className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                >
                    머무르기
                </button>
                <button
                    onClick={confirmNavigation}
                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                >
                    페이지 벗어나기
                </button>
            </div>
        </div>
      </Modal>
      {showVersionModal && (
        <VersionHistoryModal
          isOpen={showVersionModal}
          onClose={() => setShowVersionModal(false)}
          resumeId={parseInt(id as string, 10)}
          onRestore={handleRestoreVersion}
        />
      )}
    </div>
  );
};

export default withAuth(ResumeDetailPage);
