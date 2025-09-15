'use client';

import { useState } from 'react';
import Link from 'next/link';

const FindIdPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [foundEmail, setFoundEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setFoundEmail('');

        try {
            const res = await fetch('/api/auth/find-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });

            const data = await res.json();

            if (res.ok) {
                setFoundEmail(data.email);
                setMessage('회원님의 아이디(이메일)입니다.');
            } else {
                setMessage(data.message || '아이디를 찾지 못했습니다.');
            }
        } catch (error) {
            setMessage('오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary">아이디 찾기</h1>
                
                {foundEmail ? (
                    <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-gray-700">{message}</p>
                        <p className="text-2xl font-semibold text-accent my-2">{foundEmail}</p>
                        <Link href="/login" className="inline-block mt-4 bg-accent text-white font-bold py-2 px-4 rounded hover:bg-opacity-80">
                            로그인하기
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                            />
                        </div>
                        
                        {message && <p className="text-sm text-red-600 text-center">{message}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-400"
                            >
                                {isLoading ? '찾는 중...' : '아이디 찾기'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-sm text-center">
                    <Link href="/login" className="font-medium text-accent hover:underline">로그인 페이지로 돌아가기</Link>
                </div>
            </div>
        </div>
    );
};

export default FindIdPage;
