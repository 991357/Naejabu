'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoggedInHeader from '../../../components/LoggedInHeader';
import withAuth from '../../../components/withAuth';
import Modal from '../../../components/Modal';
import EditResumeModal from '../../../components/EditResumeModal';
import SpellCheckModal from '../../../components/SpellCheckModal';

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

  const params = useParams();
  const router = useRouter();
  const { id } = params;

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
      body: JSON.stringify({ questions: updatedQuestions }),
    });

    if (response.ok) {
      setIsDirty(false);
      alert('저장되었습니다.');
    } else {
      alert('저장에 실패했습니다.');
    }
  };

  const handleSaveEdit = async (updatedData: any) => {
    const response = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData),
    });

    if (response.ok) {
        fetchResumeDetail();
        setIsEditModalOpen(false);
        alert('수정되었습니다.');
    } else {
        alert('수정에 실패했습니다.');
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen"><p className="text-red-500">{error}</p></div>;
  }

  if (!resume) {
    return <div className="flex justify-center items-center min-h-screen"><p>Resume not found.</p></div>;
  }

  return (
    <div className="min-h-screen">
      <LoggedInHeader onNavigate={handleNavigate} />
      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-heading text-4xl font-bold text-primary">{resume.company_name}</h1>
            <p className="text-red-500 font-semibold mt-2 text-xl">{timeLeft}</p>
          </div>
          <div className="flex gap-4">
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
              className="bg-white p-6 rounded-lg shadow-md animate-fade-in-down"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <label className="block font-heading text-primary text-2xl font-bold mb-4">{index + 1}. {q.question_text}</label>
              <textarea
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent min-h-[250px] text-lg"
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              />
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <button
                  onClick={() => handleSpellCheck(q.id)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded text-xs"
                  disabled={spellCheckLoading[q.id]}
                >
                  {spellCheckLoading[q.id] ? '검사 중...' : '맞춤법 검사'}
                </button>
                <span>글자 수: {(answers[q.id] || '').length}</span>
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
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">저장하지 않은 변경사항</h2>
            <p>저장하지 않은 변경사항이 있습니다. 페이지를 벗어나시겠습니까?</p>
            <div className="flex justify-end mt-6">
                <button
                    onClick={() => setShowUnsavedChangesModal(false)}
                    className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
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
    </div>
  );
};

export default withAuth(ResumeDetailPage);
