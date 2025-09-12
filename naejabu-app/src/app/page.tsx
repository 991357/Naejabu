'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Link from 'next/link';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null') {
      router.push('/resumes');
    }
  }, [router]);

  return (
    <div className="min-h-screen">
      <Header />
      <main
        className="flex flex-col items-center justify-center text-center p-8"
        style={{
          height: 'calc(100vh - 64px)',
          backgroundImage: 'url(/background.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-60 rounded-lg shadow-2xl text-white p-12 animate-fade-in-down">
          <h1 className="font-nanum text-7xl font-extrabold mb-4">내 손으로 완성하는 특별한 이야기</h1>
          <p className="text-2xl mb-2 font-light">나만의 자소서를 손쉽게, 내자부</p>
          <p className="text-lg mb-8 font-light">AI와 함께 당신의 강점을 발견하고, 매력적인 자기소개서를 만들어보세요.</p>
          <hr className="w-1/4 my-4 border-gray-400" />
          <div className="flex space-x-4">
            <Link href="/login" className="flex items-center space-x-2 bg-white text-primary font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition duration-300 ease-in-out transform hover:scale-110">
              <FaSignInAlt />
              <span>로그인</span>
            </Link>
            <Link href="/register" className="flex items-center space-x-2 bg-accent text-white font-bold py-3 px-6 rounded-full hover:bg-green-400 transition duration-300 ease-in-out transform hover:scale-110 animate-pulse">
              <FaUserPlus />
              <span>지금 시작하기</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
