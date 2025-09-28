'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Image from 'next/image';
import AlertModal from '@/components/AlertModal';

interface Resume {
    id: number;
    company_name: string;
    deadline: string;
    deleted_at: string;
}

const TrashPage = () => {
    const [trashedResumes, setTrashedResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [alertModalMessage, setAlertModalMessage] = useState('');

    const openAlertModal = (message: string) => {
        setAlertModalMessage(message);
        setAlertModalOpen(true);
    };

    useEffect(() => {
        const fetchTrashedResumes = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('/api/trash', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('휴지통을 불러오는데 실패했습니다.');
                }

                const data = await res.json();
                setTrashedResumes(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrashedResumes();
    }, [router]);

    const handleRestore = async (id: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(`/api/resumes/${id}/restore`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('자기소개서 복원에 실패했습니다.');
            }

            // Refresh the list after restoring
            setTrashedResumes(trashedResumes.filter(resume => resume.id !== id));

        } catch (err: any) {
            openAlertModal(err.message);
        }
    };
    
    const calculateDaysLeft = (deletedAt: string) => {
        const deletedDate = new Date(deletedAt);
        const sevenDaysLater = new Date(deletedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diffTime = sevenDaysLater.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <AlertModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} message={alertModalMessage} />
            <main className="container mx-auto p-8 font-sans">
                <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">휴지통</h1>

                {isLoading && <p className="text-center dark:text-gray-300">로딩 중...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!isLoading && !error && trashedResumes.length === 0 && (
                    <div className="text-center p-10 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                        <Image
                            src="/mascot.png"
                            alt="Mascot"
                            width={150}
                            height={150}
                            className="mx-auto mb-4"
                        />
                        <p className="text-xl text-gray-600 dark:text-gray-300">휴지통이 비어있어요!</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">삭제된 자기소개서가 여기에 7일간 보관됩니다.</p>
                    </div>
                )}

                {!isLoading && !error && trashedResumes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trashedResumes.map((resume) => (
                            <div key={resume.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{resume.company_name}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">삭제된 날짜: {new Date(resume.deleted_at).toLocaleDateString()}</p>
                                    <p className="text-sm font-medium text-red-500">
                                        영구 삭제까지 {calculateDaysLeft(resume.deleted_at)}일 남음
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => handleRestore(resume.id)}
                                        className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-opacity-80"
                                    >
                                        복원
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TrashPage;
