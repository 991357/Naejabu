'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import AlertModal from '@/components/AlertModal';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';

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

interface ResultDetails {
    request_id: number;
    status: string;
    company_name: string;
    deadline: string;
    questions: Question[];
    feedback: Feedback[];
}

const MenteeResultDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { getAuthHeaders } = useAuth();

    const [details, setDetails] = useState<ResultDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/feedback/results/${id}`, { headers: getAuthHeaders() });
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
    }, [id, getAuthHeaders]);

    const getStatusComponent = (status: ResultDetails['status']) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            canceled: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        };
        const text = {
            pending: '요청중',
            completed: '첨삭완료',
            canceled: '취소됨',
        };
        return <span className={`mt-2 inline-block text-sm font-bold px-3 py-1 rounded-full ${styles[status]}`}>{text[status]}</span>;
    }

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <>
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
                <div className="container mx-auto px-4">
                    {details ? (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 mb-8">
                                <h1 className="text-3xl font-bold text-primary mb-2">{details.company_name}</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">마감일: {new Date(details.deadline).toLocaleDateString()}</p>
                                {getStatusComponent(details.status)}
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-3 mb-6">제출한 자소서 내용</h2>
                                {details.questions.map((q, index) => (
                                    <div key={q.id} className="mb-6">
                                        <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">{index + 1}. {q.question_text}</h3>
                                        <div className="prose dark:prose-invert max-w-none mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg" dangerouslySetInnerHTML={{ __html: q.answer_text || '<p>미작성</p>' }} />
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-3 mb-6">멘토들의 피드백</h2>
                                {details.feedback.length > 0 ? (
                                    <div className="space-y-6">
                                        {details.feedback.map(f => (
                                            <div key={f.id} className="border-l-4 border-accent pl-4 py-2 bg-blue-50/50 dark:bg-blue-900/50 rounded-r-lg">
                                                <p className="font-bold text-blue-800 dark:text-blue-300">{f.mentor_nickname} 멘토</p>
                                                <div className="prose dark:prose-invert max-w-none text-sm mt-1" dangerouslySetInnerHTML={{ __html: f.comment }} />
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">{new Date(f.created_at).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500 dark:text-gray-400">아직 등록된 피드백이 없습니다. {details.status === 'pending' && '멘토들이 검토 중입니다.'}</p>}
                            </div>
                            <div className="mt-8 text-center">
                                <Link href="/feedback/results" className="bg-primary text-white font-bold py-3 px-8 rounded-lg transition-colors hover:bg-opacity-90">
                                    목록으로 돌아가기
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">첨삭 요청을 찾을 수 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
            {error && <AlertModal isOpen={true} onClose={() => setError(null)} message={error} />}
        </>
    );
};

export default withAuth(MenteeResultDetailPage);
