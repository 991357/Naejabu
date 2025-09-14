'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  useEffect(() => {
    setIsEmailValid(validateEmail(email));
  }, [email]);

  const handleSendCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsEmailSent(true);
        setSuccess('인증 코드를 이메일로 보냈습니다.');
      } else {
        setError(data.message || '인증 코드 전송에 실패했습니다.');
      }
    } catch (err) {
      setError('인증 코드 전송 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsVerified(true);
        setSuccess('이메일 인증에 성공했습니다!');
        setError('');
      } else {
        setError(data.message || '인증에 실패했습니다.');
      }
    } catch (err) {
      setError('인증 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (password !== passwordConfirmation) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  const isRegisterDisabled = !isVerified || !password || !passwordConfirmation || password !== passwordConfirmation;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative bg-gray-50">
      <div className="absolute top-8 left-8">
        <Link href="/" className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">
            홈으로
        </Link>
      </div>
      <div className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <h1 className="font-heading text-3xl font-bold text-center mb-8 text-primary">회원가입</h1>
        {error && <p className="text-red-500 text-center mb-4 font-semibold">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4 font-semibold">{success}</p>}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">이름/닉네임</label>
          <input 
            className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
            id="name" type="text" placeholder="홍길동"
            value={name} onChange={(e) => setName(e.target.value)}
            disabled={isVerified}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">이메일</label>
          <div className="flex items-center space-x-2">
            <input 
              className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
              id="email" type="email" placeholder="email@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={isEmailSent}
            />
            <button 
              onClick={handleSendCode}
              disabled={!isEmailValid || isEmailSent || isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '전송중...' : '인증번호 발송'}
            </button>
          </div>
        </div>

        {isEmailSent && !isVerified && (
          <div className="mb-4 transition-all duration-500 ease-in-out">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">인증 코드</label>
            <div className="flex items-center space-x-2">
              <input 
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
                id="code" type="text" placeholder="6자리 코드 입력"
                value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button 
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6 || isLoading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '확인중...' : '인증하기'}
              </button>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="transition-all duration-500 ease-in-out">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">비밀번호</label>
              <input 
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
                id="password" type="password" placeholder="******************"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="passwordConfirmation">비밀번호 확인</label>
              <input 
                className={`shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 ${password !== passwordConfirmation && passwordConfirmation ? 'border-red-500 focus:ring-red-500' : 'focus:ring-accent'}`}
                id="passwordConfirmation" type="password" placeholder="******************"
                value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
              {password !== passwordConfirmation && passwordConfirmation && (
                <p className="text-red-500 text-xs italic">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button 
            className="bg-accent hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
            type="button"
            onClick={handleRegister}
            disabled={isRegisterDisabled || isLoading}
          >
            {isLoading ? '가입 처리중...' : '회원가입'}
          </button>
        </div>

        <div className="text-center mt-6">
          <Link href="/login" className="inline-block align-baseline font-bold text-sm text-accent hover:text-opacity-80">
            이미 계정이 있으신가요?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;