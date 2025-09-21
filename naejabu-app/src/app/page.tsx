'use client';

import Link from 'next/link';
import { FileText, Users, CheckCircle, ArrowRight, PlusCircle } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

// Logged-out Homepage Component
const LoggedOutHome = () => (
  <div className="bg-background">
    {/* Hero Section */}
    <section className="relative bg-secondary py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-text mb-4 font-sans">
            당신의 커리어를 위한 첫 걸음, 내자부
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI와 함께 당신의 잠재력을 자소서에 담아내세요. 커뮤니티에서 소통하며 더 나은 기회를 만들어보세요.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg">
            로그인하고 시작하기 <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text">주요 기능</h2>
            <p className="text-gray-500 mt-2">내자부의 핵심 기능들을 만나보세요.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center">
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <FileText className="text-primary" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-text">AI 자소서 작성</h3>
              <p className="text-gray-600 mb-4 flex-grow">몇 가지 키워드만으로 AI가 매력적인 자기소개서를 완성해줍니다. 다양한 템플릿과 수정 기능을 활용해 나만의 자소서를 만들어보세요.</p>
              <Link href="/resumes" className="font-bold text-primary hover:underline flex items-center gap-1">
                자소서 바로가기 <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center">
              <div className="p-4 bg-green-100 rounded-full mb-4">
                <Users className="text-accent" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-text">커뮤니티</h3>
              <p className="text-gray-600 mb-4 flex-grow">취업 정보, 합격 후기 등 다양한 이야기를 나누는 공간입니다. 다른 사람들과 소통하며 취업 준비의 어려움을 함께 해결해나가세요.</p>
              <Link href="/community" className="font-bold text-primary hover:underline flex items-center gap-1">
                커뮤니티 바로가기 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    {/* Value Proposition Section */}
    <section className="bg-secondary py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-12">내자부가 특별한 이유</h2>
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div className="flex flex-col items-center">
            <CheckCircle className="text-primary mb-3" size={32} />
            <h3 className="text-xl font-bold mb-2">간편함</h3>
            <p className="text-gray-600">복잡한 과정 없이 누구나 쉽게 AI의 도움을 받아 자소서를 작성할 수 있습니다.</p>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle className="text-primary mb-3" size={32} />
            <h3 className="text-xl font-bold mb-2">전문성</h3>
            <p className="text-gray-600">다양한 직무에 최적화된 표현과 구조를 AI가 제안하여 자소서의 완성도를 높여줍니다.</p>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle className="text-primary mb-3" size={32} />
            <h3 className="text-xl font-bold mb-2">소통</h3>
            <p className="text-gray-600">커뮤니티를 통해 다른 사용자들과 정보를 교류하고 서로에게 동기부여가 될 수 있습니다.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-white py-8">
      <div className="container mx-auto px-6 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} 내자부. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

// Logged-in Homepage Component
const LoggedInHome = ({ user }) => {
  const [resumes, setResumes] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch resumes
      try {
        const resResumes = await fetch('/api/resumes', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (resResumes.ok) {
          const data = await resResumes.json();
          setResumes(data.slice(0, 3)); // Show latest 3
        }
      } catch (error) {
        console.error('Failed to fetch resumes', error);
      }

      // Fetch community posts
      try {
        const resPosts = await fetch('/api/posts/latest-by-category');
        if (resPosts.ok) {
          const data = await resPosts.json();
          // Flatten posts from all categories and take latest 4
          const allPosts = Object.values(data).flat();
          setPosts(allPosts.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch posts', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-secondary min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-8">
          안녕하세요, <span className="text-primary">{user.nickname}</span>님!
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Link href="/resumes" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center text-center text-xl font-bold text-primary hover:text-opacity-80">
                <PlusCircle className="mr-3" size={24} />
                새 자소서 작성하기
            </Link>
            <Link href="/community" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center text-center text-xl font-bold text-accent hover:text-opacity-80">
                <Users className="mr-3" size={24} />
                커뮤니티 둘러보기
            </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Recent Resumes */}
          <div>
            <h2 className="text-2xl font-bold text-text mb-4">최근 작업한 자소서</h2>
            <div className="space-y-4">
              {resumes.length > 0 ? (
                resumes.map(resume => (
                  <Link key={resume.id} href={`/resumes/${resume.id}`} className="block bg-white p-4 rounded-lg shadow hover:bg-gray-50 transition-colors">
                    <h3 className="font-bold truncate">{resume.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(resume.updated_at).toLocaleDateString()} 수정됨</p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">아직 작성한 자소서가 없습니다.</p>
              )}
            </div>
          </div>

          {/* Recent Community Posts */}
          <div>
            <h2 className="text-2xl font-bold text-text mb-4">최신 커뮤니티 글</h2>
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map(post => (
                  <Link key={post.id} href={`/community/post/${post.id}`} className="block bg-white p-4 rounded-lg shadow hover:bg-gray-50 transition-colors">
                    <h3 className="font-bold truncate">{post.title}</h3>
                    <p className="text-sm text-gray-500">{post.author_name} - {new Date(post.created_at).toLocaleDateString()}</p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">최신 글이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { user } = useAuth();

  return user ? <LoggedInHome user={user} /> : <LoggedOutHome />;
}
