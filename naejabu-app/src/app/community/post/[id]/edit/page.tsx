'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useRouter, useParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const EditPostPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) throw new Error('Post not found');
        const data = await response.json();
        setTitle(data.title);
        setContent(data.content || '');
        setCategory(data.category);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, content, category }),
      });
      if (!response.ok) throw new Error('Failed to update post');
      router.push(`/community/post/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold text-primary font-heading mb-10">게시글 수정</h1>
      
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
          >
            <option value="general">자유게시판</option>
            <option value="inquiry">문의/건의</option>
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
            {submitting ? '수정 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default withAuth(EditPostPage);
