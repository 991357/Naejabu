'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useState } from 'react';
import AlertModal from './AlertModal';
import NotificationIcon from './NotificationIcon';

const GlobalHeader = () => {
  const { user, setUser, setToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      router.push('/');
    }
  };

  const navLinks = [
    { href: '/resumes', label: '자소서' },
    { href: '/community', label: '커뮤니티' },
    { href: '/feedback', label: '첨삭받기' },
    { href: '/trash', label: '휴지통' },
  ];

  return (
    <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold text-primary dark:text-blue-400 font-heading">
          내자부
        </Link>
        
        {user && (
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-semibold transition-colors duration-300 ${pathname.startsWith(link.href) ? 'text-primary dark:text-blue-400' : 'text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400'}`}>
                  {link.label}
                </Link>
              ))}
            </div>
        )}

        <div className="flex items-center space-x-4">
          {user ? (
            <>
                <NotificationIcon />
                <Link href="/mypage" className="font-semibold text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-300">마이페이지</Link>
                <button onClick={handleLogout} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300">
                    로그아웃
                </button>
            </>
          ) : (
            <>
              <Link href="/login" className="font-semibold text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-300">로그인</Link>
              <Link href="/register" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300">
                회원가입
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default GlobalHeader;
