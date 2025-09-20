'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import Link from 'next/link';
import AlertModal from '@/components/AlertModal';

interface PendingRequest {
  request_id: number;
  company_name: string;
  mentee_nickname: string;
  created_at: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

const MentorGiveFeedbackPage = () => {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/feedback/mentor-give/pending-requests', { headers: getAuthHeaders() });
        if (response.status === 403) {
            throw new Error('이 페이지에 접근할 권한이 없습니다. 멘토만 접근 가능합니다.');
        }
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        } else {
          throw new Error('첨삭 요청 목록을 불러오는 데 실패했습니다.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-heading">첨삭하기</h1>
              <p className="text-lg text-gray-600 mt-4">멘티들의 이력서를 검토하고 피드백을 남겨주세요.</p>
            </div>

            {loading ? (
              <div className="text-center"><p>요청 목록을 불러오는 중...</p></div>
            ) : error ? (
                <AlertModal isOpen={true} onClose={() => setError(null)} message={error} />
            ) : requests.length > 0 ? (
              <div className="bg-white shadow-lg rounded-xl">
                <ul className="divide-y divide-gray-200">
                  {requests.map((req) => (
                    <li key={req.request_id}>
                      <Link href={`/feedback/mentor-give/${req.request_id}`} className="block p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-primary">{req.company_name}</h3>
                                <p className="text-sm text-gray-600 mt-1">신청자: {req.mentee_nickname}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString()}</p>
                                <span className="text-accent font-semibold mt-1 block">첨삭하기 &rarr;</span>
                            </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <p className="text-gray-500 text-lg">현재 대기 중인 첨삭 요청이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(MentorGiveFeedbackPage);
