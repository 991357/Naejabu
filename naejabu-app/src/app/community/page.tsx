'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';

// 아이콘 컴포넌트들 (SVG)
const NoticeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.464 9.168-6.088 1.359-3.22.75-7.443-1.863-9.732-2.612-2.29-6.27-2.29-8.882 0L7 6.168v7.515z" /></svg>;
const GeneralIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h6l2-2h2l-2 2z" /></svg>;
const JobsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const InquiryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const CommunityHomePage = () => {
  const { user } = useAuth();
  const [postsByCategory, setPostsByCategory] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'notice', name: '공지사항', icon: <NoticeIcon />, color: 'bg-red-100 text-red-800' },
    { id: 'general', name: '자유게시판', icon: <GeneralIcon />, color: 'bg-blue-100 text-blue-800' },
    { id: 'jobs', name: '채용공고', icon: <JobsIcon />, color: 'bg-green-100 text-green-800' },
    { id: 'inquiry', name: '문의/건의', icon: <InquiryIcon />, color: 'bg-yellow-100 text-yellow-800' },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/posts/latest-by-category');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPostsByCategory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary font-heading">커뮤니티</h1>
          <p className="text-lg text-gray-600 mt-4">다양한 정보를 나누고 소통하는 공간입니다.</p>
        </div>

        {user && (
            <div className="flex justify-end mb-8 gap-4">
                <Link href="/resumes" className="inline-flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM6 3a3 3 0 00-3 3v11a3 3 0 003 3h8a3 3 0 003-3V6a3 3 0 00-3-3H6zm1 4a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" /></svg>
                    자소서 쓰기
                </Link>
                <Link href="/community/write" className="inline-flex items-center gap-2 bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    글쓰기
                </Link>
            </div>
        )}

        {loading ? (
          <div className="text-center"><p>Loading...</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map(category => (
              <section key={category.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${category.color}`}>{category.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                  </div>
                  <Link href={`/community/${category.id}`} className="text-sm font-semibold text-accent hover:underline">
                    더보기 &rarr;
                  </Link>
                </div>
                <div className="flex-grow space-y-2">
                  {(postsByCategory[category.id] && postsByCategory[category.id].length > 0) ? (
                    postsByCategory[category.id].map((post: any) => (
                      <Link key={post.id} href={`/community/post/${post.id}`} className="block p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <p className="truncate font-semibold text-gray-700">{post.title}</p>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{post.author_name}</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex-grow flex items-center justify-center text-center py-8 text-gray-500">
                      <p>아직 게시글이 없습니다.</p>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(CommunityHomePage);
