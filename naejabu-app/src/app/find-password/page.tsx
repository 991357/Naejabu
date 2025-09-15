'use client';

import { useState } from 'react';
import Link from 'next/link';

const FindPasswordPage = () => {
    const [step, setStep] = useState('request_code'); // 'request_code', 'verify_code', 'show_password'
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/send-password-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                setStep('verify_code');
            } else {
                throw new Error(data.message || 'Failed to send code');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (res.ok) {
                setTempPassword(data.tempPassword);
                setStep('show_password');
            } else {
                throw new Error(data.message || 'Failed to reset password');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary">비밀번호 찾기</h1>

                {step === 'request_code' && (
                    <form onSubmit={handleRequestCode} className="space-y-6">
                        <p className="text-center text-gray-600">가입 시 사용한 이메일을 입력하시면, 비밀번호 재설정을 위한 인증 코드를 보내드립니다.</p>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent" />
                        </div>
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 disabled:bg-gray-400">
                                {isLoading ? '전송 중...' : '인증 코드 전송'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'verify_code' && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <p className="text-center text-gray-600"><b>{email}</b>(으)로 전송된 인증 코드를 입력해주세요.</p>
                        {message && <p className="text-sm text-green-600 text-center">{message}</p>}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">인증 코드</label>
                            <input id="code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent" />
                        </div>
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 disabled:bg-gray-400">
                                {isLoading ? '확인 중...' : '비밀번호 재설정'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'show_password' && (
                    <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-gray-700">비밀번호가 성공적으로 재설정되었습니다.</p>
                        <p className="text-gray-600 mt-2">아래 임시 비밀번호로 로그인해주세요.</p>
                        <p className="text-2xl font-bold text-accent my-3 p-3 bg-gray-100 rounded">{tempPassword}</p>
                        <p className="text-sm text-red-500 font-medium">로그인 후 마이페이지에서 반드시 비밀번호를 변경해주세요!</p>
                        <Link href="/login" className="inline-block mt-4 bg-accent text-white font-bold py-2 px-4 rounded hover:bg-opacity-80">
                            로그인하기
                        </Link>
                    </div>
                )}

                <div className="text-sm text-center">
                    <Link href="/login" className="font-medium text-accent hover:underline">로그인 페이지로 돌아가기</Link>
                </div>
            </div>
        </div>
    );
};

export default FindPasswordPage;
