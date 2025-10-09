'use client';

import { useState, useEffect, useCallback } from 'react';
import withAuth from '@/components/withAuth';
import Link from 'next/link';
import AlertModal from '@/components/AlertModal';
import useAuth from '@/hooks/useAuth';

interface MenteeRequest {
  request_id: number;
  company_name: string;
  status: 'pending' | 'completed' | 'canceled';
  created_at: string;
  feedback_count: number;
}

const FeedbackResultsPage = () => {
  const [requests, setRequests] = useState<MenteeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAuth();

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback/results', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('정말로 첨삭 요청을 취소하시겠습니까?')) return;

    try {
        const response = await fetch(`/api/feedback/results/${requestId}`,
         { method: 'PATCH', headers: getAuthHeaders() });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to cancel request');
        }
        alert('요청이 취소되었습니다.');
        fetchRequests(); // Refresh the list
    } catch (err: any) {
        setError(err.message);
    }
  };

  const getStatusComponent = (req: MenteeRequest) => {
      const { status, feedback_count } = req;

      if (status === 'canceled') {
          return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-700">취소됨</span>;
      }
      
      // Treat 'completed' from old data as a request with feedback
      if (status === 'pending' || status === 'completed') {
          if (feedback_count > 0) {
              return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">첨삭 진행중</span>;
          } else {
              return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">요청중</span>;
          }
      }
      return null;
  }

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary dark:text-blue-400 font-heading">첨삭 결과 확인</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-4">내가 요청한 자소서 첨삭 현황을 확인합니다.</p>
            </div>

            {loading ? (
              <div className="text-center dark:text-gray-300"><p>요청 목록을 불러오는 중...</p></div>
            ) : requests.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {requests.map((req) => (
                    <li key={req.request_id} className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div className="mb-4 sm:mb-0">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{req.company_name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">요청일: {new Date(req.created_at).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">달린 피드백: {req.feedback_count}개</p>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                {getStatusComponent(req)}
                                <Link href={`/feedback/results/${req.request_id}`} className="font-semibold text-primary dark:text-blue-400 hover:underline whitespace-nowrap">상세보기</Link>
                                {(req.status === 'pending' || req.status === 'completed') && (
                                    <button onClick={() => handleCancelRequest(req.request_id)} className="text-sm text-red-500 hover:underline whitespace-nowrap">
                                        {req.status === 'completed' ? '등록 해제' : '요청 취소'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <p className="text-gray-500 dark:text-gray-400 text-lg">아직 첨삭을 요청한 내역이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {error && <AlertModal isOpen={true} onClose={() => setError(null)} message={error} />}
    </>
  );
};

export default withAuth(FeedbackResultsPage);
