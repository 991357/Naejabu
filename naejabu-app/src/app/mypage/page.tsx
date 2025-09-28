"use client";

import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import withAuth from '../../components/withAuth';
import PasswordChangePopup from '../../components/PasswordChangePopup';
import { useLoading } from '../../context/LoadingContext';
import AlertModal from '../../components/AlertModal';
import { useTheme } from '../../context/ThemeContext';
import RecommendationModal from '../../components/RecommendationModal';
import Modal from '../../components/Modal';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

const hobbyMasterList = ['사진 촬영', '등산', '캠핑', '요리', '베이킹', '악기 연주', '블로그 운영', '유튜브 채널 운영', '캘리그라피', '뜨개질', '독서 토론', '영화 비평', '보드게임', '방탈출', '마라톤', '헬스', '요가', '필라테스', '자전거 타기', '수영', '배드민턴', '테니스', '볼링', '코딩', '오픈소스 기여', '외국어 학습', '재테크 공부', '식물 키우기', '목공', '가죽 공예', '여행', '맛집 탐방', '전시회 관람', '뮤지컬 관람', '봉사활동'];
const specialtyMasterList = ['데이터 분석', '문제 해결 능력', '창의적 사고', '전략적 사고', '커뮤니케이션 스킬', '협업 능력', '리더십', '프로젝트 관리', '시간 관리 능력', '프레젠테이션 스킬', '문서 작성 능력', '정보 검색 능력', '빠른 학습 능력', '디테일 관리', '위기 대처 능력', '고객 응대 능력', '협상 능력', '외국어 구사 능력 (영어, 중국어 등)', '컴퓨터 활용 능력 (MS Office, 한컴 등)', '프로그래밍 (Python, Java, etc.)', '데이터 시각화', 'UX/UI 디자인', '콘텐츠 제작', '디지털 마케팅', 'SEO/SEM', '재무 분석'];

const getRandomSuggestions = (sourceArray: string[], count: number): string[] => {
  const shuffled = [...sourceArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

function MyPage() {
    const { user, changeNickname, logout, fetchUser } = useAuth();
    const { showLoading, hideLoading } = useLoading();
    const { theme, toggleTheme } = useTheme();

    const [newNickname, setNewNickname] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [englishName, setEnglishName] = useState('');
    const [hanjaName, setHanjaName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [motto, setMotto] = useState('');

    const [isHobbyModalOpen, setIsHobbyModalOpen] = useState(false);
    const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
    const [hobbySuggestions, setHobbySuggestions] = useState<string[]>([]);
    const [specialtySuggestions, setSpecialtySuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            setNewNickname(user.nickname || '');
            setEnglishName(user.english_name || '');
            setHanjaName(user.hanja_name || '');
            setBirthdate(user.birthdate || '');
            setHobbies(user.hobby ? user.hobby.split(', ') : []);
            setSpecialties(user.specialty ? user.specialty.split(', ') : []);
            setMotto(user.motto || '');
        }
    }, [user]);

    const handleNicknameChange = async () => {
        if (!newNickname.trim()) {
            setAlert({ message: '새 닉네임을 입력해주세요.', type: 'error' });
            return;
        }
        showLoading();
        try {
            await changeNickname(newNickname);
            setAlert({ message: '닉네임이 성공적으로 변경되었습니다.', type: 'success' });
        } catch (error) {
            setAlert({ message: '닉네임 변경에 실패했습니다.', type: 'error' });
        } finally {
            hideLoading();
        }
    };

    const handleUpdateProfile = async () => {
        showLoading();
        try {
            const response = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    english_name: englishName,
                    hanja_name: hanjaName,
                    birthdate,
                    hobby: hobbies.join(', '),
                    specialty: specialties.join(', '),
                    motto,
                }),
            });
            if (!response.ok) throw new Error('프로필 업데이트에 실패했습니다.');
            await fetchUser(); // Re-fetch user data to update context
            setAlert({ message: '프로필이 성공적으로 업데이트되었습니다.', type: 'success' });
        } catch (error: any) {
            setAlert({ message: error.message || '프로필 업데이트 중 오류가 발생했습니다.', type: 'error' });
        } finally {
            hideLoading();
        }
    };

    const handlePasswordChangeSuccess = () => {
        setAlert({ message: '비밀번호가 성공적으로 변경되었습니다.', type: 'success' });
    };

    const openHobbyModal = () => {
        setHobbySuggestions(getRandomSuggestions(hobbyMasterList, 10));
        setIsHobbyModalOpen(true);
    };

    const openSpecialtyModal = () => {
        setSpecialtySuggestions(getRandomSuggestions(specialtyMasterList, 10));
        setIsSpecialtyModalOpen(true);
    };

    if (!user) {
        return <div className="flex justify-center items-center h-screen dark:text-white">로그인 정보를 불러오는 중입니다...</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 dark:text-white">마이페이지</h1>

            {/* User Info Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">회원 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">아이디 (이메일)</label>
                        <p className="mt-1 text-lg dark:text-gray-200">{user.email}</p>
                    </div>
                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">역할</label>
                        <p className="mt-1 text-lg dark:text-gray-200">{user.role === 'mentor' ? '멘토' : '멘티'}</p>
                    </div>
                    {/* Nickname */}
                    <div>
                        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">닉네임</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input
                                type="text"
                                id="nickname"
                                value={newNickname}
                                onChange={(e) => setNewNickname(e.target.value)}
                                placeholder={user.nickname}
                                className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <button
                                onClick={handleNicknameChange}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                변경
                            </button>
                        </div>
                    </div>
                    {/* English Name */}
                    <div>
                        <label htmlFor="englishName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">영문 이름</label>
                        <input type="text" id="englishName" value={englishName} onChange={(e) => setEnglishName(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    {/* Hanja Name */}
                    <div>
                        <label htmlFor="hanjaName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">한자 이름</label>
                        <input type="text" id="hanjaName" value={hanjaName} onChange={(e) => setHanjaName(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    {/* Birthdate */}
                    <div>
                        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">생년월일</label>
                        <input type="date" id="birthdate" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    {/* Motto */}
                    <div>
                        <label htmlFor="motto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">좌우명</label>
                        <input type="text" id="motto" value={motto} onChange={(e) => setMotto(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    {/* Hobbies */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">취미</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="text" value={hobbies.join(', ')} readOnly className="flex-grow p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <button onClick={openHobbyModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">추천</button>
                        </div>
                    </div>
                    {/* Specialties */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">특기</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="text" value={specialties.join(', ')} readOnly className="flex-grow p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <button onClick={openSpecialtyModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">추천</button>
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button onClick={handleUpdateProfile} className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                        프로필 저장
                    </button>
                </div>
            </div>
            
            {/* Theme Settings Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">테마 설정</h2>
                <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">다크 모드</span>
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* Actions Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium dark:text-gray-100">계정 관리</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">비밀번호 변경 또는 로그아웃</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsPopupOpen(true)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                            비밀번호 변경
                        </button>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isPopupOpen && <PasswordChangePopup onClose={() => setIsPopupOpen(false)} onSuccess={handlePasswordChangeSuccess} />}
            {alert && <AlertModal message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            <RecommendationModal
                isOpen={isHobbyModalOpen}
                onClose={() => setIsHobbyModalOpen(false)}
                title="취미 추천"
                suggestions={hobbySuggestions}
                selectedItems={hobbies}
                onSelect={(item) => setHobbies(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
            />
            <RecommendationModal
                isOpen={isSpecialtyModalOpen}
                onClose={() => setIsSpecialtyModalOpen(false)}
                title="특기 추천"
                suggestions={specialtySuggestions}
                selectedItems={specialties}
                onSelect={(item) => setSpecialties(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}
            />
        </div>
    );
}

export default withAuth(MyPage);