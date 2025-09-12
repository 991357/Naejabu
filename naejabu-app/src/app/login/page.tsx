'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
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
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative">
      <div className="absolute top-8 left-8">
        <Link href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">
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
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            비밀번호
          </label>
          <input
            className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-accent hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="button"
            onClick={handleLogin}
          >
            로그인
          </button>
        </div>
        <div className="text-center mt-4">
          <Link href="/register" className="inline-block align-baseline font-bold text-sm text-accent hover:text-opacity-80">
            회원이 아니신가요?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
