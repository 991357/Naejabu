'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import AlertModal from '@/components/AlertModal';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const WritePostPage = () => {
  const { user, getAuthHeaders, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'general');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState('');

  useEffect(() => {
    const restrictedCategories = ['notice', 'jobs'];
    if (!authLoading && user?.is_admin !== 1 && restrictedCategories.includes(category)) {
      setAlertModalMessage('권한이 없습니다.');
      setAlertModalOpen(true);
    }
  }, [user, authLoading, category, router]);

  const handleModalClose = () => {
    setAlertModalOpen(false);
    router.push('/community');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content, category }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create post');
      }

      const data = await response.json();
      router.push(`/community/post/${data.id}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <AlertModal isOpen={alertModalOpen} onClose={handleModalClose} message={alertModalMessage} />
      <h1 className="text-5xl font-bold text-primary font-heading mb-10">새 글 작성</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-8">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
        
        <div>
          <label className="block text-gray-800 text-lg font-semibold mb-3" htmlFor="category">
            카테고리
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="shadow-md appearance-none border rounded-lg w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent transition-shadow bg-white"
            disabled={user?.is_admin !== 1 && (category === 'notice' || category === 'jobs')}
          >
            <option value="general">자유게시판</option>
            <option value="inquiry">문의/건의</option>
            <option value="mentor-apply">멘토 등록 신청</option>
            {user?.is_admin === 1 && <option value="notice">공지사항</option>}
            {user?.is_admin === 1 && <option value="jobs">채용공고</option>}
          </select>
        </div>

        <div>
          <label className="block text-gray-800 text-lg font-semibold mb-3" htmlFor="title">
            제목
          </label>
          <input
            id="title"
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow-md appearance-none border rounded-lg w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
            required
          />
        </div>

        <div>
          <label className="block text-gray-800 text-lg font-semibold mb-3" htmlFor="content">
            내용
          </label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="내용을 입력하세요"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:bg-gray-400"
          >
            {submitting ? '등록 중...' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default withAuth(WritePostPage);
