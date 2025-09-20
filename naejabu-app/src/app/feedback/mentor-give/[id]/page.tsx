'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import AlertModal from '@/components/AlertModal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Define interfaces for the data structure
interface Question {
    id: number;
    question_text: string;
    answer_text: string;
}

interface Feedback {
    id: number;
    mentor_nickname: string;
    comment: string;
    created_at: string;
}

interface RequestDetails {
    request_id: number;
    status: string;
    company_name: string;
    deadline: string;
    mentee_nickname: string;
    questions: Question[];
    feedback: Feedback[];
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline','strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
};

const MentorFeedbackDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [details, setDetails] = useState<RequestDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/feedback/mentor-give/${id}`, { headers: getAuthHeaders() });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to fetch details');
                }
                const data = await response.json();
                setDetails(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleSubmitFeedback = async () => {
        if (newComment.trim() === '') {
            setError('피드백 내용이 비어있습니다.');
            return;
        }
        setSubmitting(true);
        try {
            const response = await fetch(`/api/feedback/mentor-give/${id}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ comment: newComment }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to submit feedback');
            }
            // On success, show alert and redirect
            alert('피드백이 성공적으로 등록되었습니다.');
            router.push('/feedback/mentor-give');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <>
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4">
                    {details ? (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
                                <h1 className="text-3xl font-bold text-primary mb-2">{details.company_name}</h1>
                                <p className="text-gray-600">신청자: {details.mentee_nickname}</p>
                                <p className="text-sm text-gray-500">마감일: {new Date(details.deadline).toLocaleDateString()}</p>
                                {details.status === 'completed' && <span className="mt-2 inline-block text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">첨삭완료</span>}
                            </div>

                            <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">자소서 내용</h2>
                                {details.questions.map((q, index) => (
                                    <div key={q.id} className="mb-6">
                                        <h3 className="font-semibold text-lg text-gray-700">{index + 1}. {q.question_text}</h3>
                                        <div className="prose max-w-none mt-2 p-4 bg-gray-50 rounded-lg" dangerouslySetInnerHTML={{ __html: q.answer_text || '<p>미작성</p>' }} />
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">다른 멘토들의 피드백</h2>
                                {details.feedback.length > 0 ? (
                                    <div className="space-y-6">
                                        {details.feedback.map(f => (
                                            <div key={f.id} className="border-l-4 border-accent pl-4">
                                                <p className="font-bold">{f.mentor_nickname} 멘토</p>
                                                <div className="prose max-w-none text-sm mt-1" dangerouslySetInnerHTML={{ __html: f.comment }} />
                                                <p className="text-xs text-gray-400 mt-2">{new Date(f.created_at).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500">아직 등록된 피드백이 없습니다.</p>}
                            </div>

                            {details.status === 'pending' && (
                                <div className="bg-white shadow-xl rounded-2xl p-8">
                                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">피드백 작성하기</h2>
                                    <ReactQuill theme="snow" value={newComment} onChange={setNewComment} modules={modules} className="bg-white" />
                                    <div className="text-right mt-6">
                                        <button onClick={handleSubmitFeedback} disabled={submitting} className="bg-accent text-white font-bold py-3 px-8 rounded-lg transition-colors hover:bg-opacity-90 disabled:bg-gray-400">
                                            {submitting ? '등록 중...' : '피드백 등록'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-md">
                            <p className="text-gray-500 text-lg">첨삭 요청을 찾을 수 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
            {error && <AlertModal isOpen={true} onClose={() => setError(null)} message={error} />}
        </>
    );
};

export default withAuth(MentorFeedbackDetailPage);
