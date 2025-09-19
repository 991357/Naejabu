'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import withAuth from '@/components/withAuth';

const CategoryPage = () => {
  const params = useParams();
  const category = params.category as string;

  const [posts, setPosts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const categoryNames: { [key: string]: string } = {
    notice: '공지사항',
    general: '자유게시판',
    jobs: '채용공고',
    inquiry: '문의/건의',
  };

  useEffect(() => {
    if (!category) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/posts?category=${category}&query=${searchTerm}`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data.posts);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [category, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4 text-2xl font-bold text-primary font-heading">
            <Link href="/community" className="text-gray-400 hover:text-gray-600 transition-colors">커뮤니티 홈</Link>
            <span>&gt;</span>
            <h1 className="text-4xl">{categoryNames[category] || '게시판'}</h1>
        </div>
        <Link href={`/community/write?category=${category}`} className="bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
          글쓰기
        </Link>
      </div>

      <div className="mb-8">
        <input 
          type="text"
          placeholder="게시글 검색..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">번호</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">작성자</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">작성일</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <tr key={post.id} className={`transition-colors ${post.is_pinned ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold">
                      {post.is_pinned ? (
                        <span className="px-2 py-1 text-xs text-yellow-800 bg-yellow-200 rounded-full">고정</span>
                      ) : (
                        <span className="text-gray-500">{totalCount - index}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link href={`/community/post/${post.id}`} className="hover:underline">
                        {post.title}
                      </Link>
                      {post.comment_count > 0 && (
                        <span className="ml-2 text-xs text-gray-500">[{post.comment_count}]</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${post.author_is_admin ? 'font-bold text-red-500' : 'text-gray-500'}`}>{post.author_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">게시글이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default withAuth(CategoryPage);