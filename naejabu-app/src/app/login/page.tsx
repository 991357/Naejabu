'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLoading } from '../../context/LoadingContext'; // Import useLoading

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { isLoading, setIsLoading } = useLoading(); // Use global loading state
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    setIsLoading(true); // Start loading
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        router.push('/resumes');
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
        setError('An unexpected error occurred. Please try again.');
    } finally {
        setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative bg-gray-100">
      <div className="absolute top-8 left-8">
        <Link href="/" className="bg-white hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
            홈으로
        </Link>
      </div>
      <div className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <h1 className="font-heading text-3xl font-bold text-center mb-8 text-primary">로그인</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            이메일
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            비밀번호
          </label>
          <div className="relative">
            <input
              className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent pr-10"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <button
            className="bg-accent hover:bg-opacity-80 text-white font-bold py-3 px-5 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-400"
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </div>
        <div className="text-center">
          <Link href="/register" className="inline-block align-baseline font-bold text-sm text-accent hover:text-opacity-80 mr-4">
            회원가입
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/find-id" className="inline-block align-baseline font-bold text-sm text-gray-600 hover:text-accent ml-4 mr-4">
            아이디 찾기
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/find-password" className="inline-block align-baseline font-bold text-sm text-gray-600 hover:text-accent ml-4">
            비밀번호 찾기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
