'use client';

import { useState, useEffect } from 'react';
import LoggedInHeader from '../../components/LoggedInHeader';
import withAuth from '../../components/withAuth';
import RecommendationModal from '../../components/RecommendationModal';

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

const MyPage = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [hanjaName, setHanjaName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [hobby, setHobby] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [motto, setMotto] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [recType, setRecType] = useState<'hobby' | 'specialty' | null>(null);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/me', { headers: getAuthHeaders() });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setName(userData.name || '');
          setEnglishName(userData.english_name || '');
          setHanjaName(userData.hanja_name || '');
          setBirthdate(userData.birthdate || '');
          setHobby(userData.hobby || '');
          setSpecialty(userData.specialty || '');
          setMotto(userData.motto || '');
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification({ message: '', type: '' });
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, english_name: englishName, hanja_name: hanjaName, birthdate, hobby, specialty, motto }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setNotification({ message: '성공적으로 저장되었습니다!', type: 'success' });
      } else {
        throw new Error('Failed to save data');
      }
    } catch (error) {
      console.error('Failed to save user data', error);
      setNotification({ message: '저장에 실패했습니다. 다시 시도해주세요.', type: 'error' });
    }
  };

  const handleOpenRecs = (type: 'hobby' | 'specialty') => {
    setRecType(type);
    if (type === 'hobby') {
      setCurrentSuggestions(getRandomSuggestions(hobbyMasterList, 10));
    } else {
      setCurrentSuggestions(getRandomSuggestions(specialtyMasterList, 10));
    }
    setIsRecModalOpen(true);
  };

  const handleRefreshSuggestions = () => {
    if (recType === 'hobby') {
      setCurrentSuggestions(getRandomSuggestions(hobbyMasterList, 10));
    } else if (recType === 'specialty') {
      setCurrentSuggestions(getRandomSuggestions(specialtyMasterList, 10));
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (recType === 'hobby') {
      setHobby(suggestion);
    } else if (recType === 'specialty') {
      setSpecialty(suggestion);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <LoggedInHeader />
        <main className="container mx-auto p-8">
          <h1 className="font-heading text-4xl font-bold text-primary mb-8">마이페이지</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="font-heading text-2xl font-bold text-primary border-b pb-3">기본 정보</h2>
                <div className="mt-4 space-y-2">
                  <p><span className="font-semibold">이름:</span> {user?.name}</p>
                  <p><span className="font-semibold">이메일:</span> {user?.email}</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <form onSubmit={handleSave} className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="font-heading text-2xl font-bold text-primary border-b pb-3 mb-6">내 정보 관리</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-800 text-lg font-semibold mb-2" htmlFor="englishName">영문 이름</label>
                      <input id="englishName" type="text" value={englishName} onChange={(e) => setEnglishName(e.target.value)} className="shadow-md appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="예: Gildong Hong" />
                    </div>
                    <div>
                      <label className="block text-gray-800 text-lg font-semibold mb-2" htmlFor="hanjaName">한자 이름</label>
                      <input id="hanjaName" type="text" value={hanjaName} onChange={(e) => setHanjaName(e.target.value)} className="shadow-md appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="예: 洪吉童" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-800 text-lg font-semibold mb-2" htmlFor="birthdate">생년월일</label>
                    <input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="shadow-md appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" />
                  </div>
                  <hr/>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-800 text-lg font-semibold" htmlFor="hobby">취미</label>
                      <button type="button" onClick={() => handleOpenRecs('hobby')} className="text-sm text-accent font-semibold hover:underline">추천받기</button>
                    </div>
                    <input id="hobby" type="text" value={hobby} onChange={(e) => setHobby(e.target.value)} className="shadow-md appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="예: 독서, 영화 감상" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-800 text-lg font-semibold" htmlFor="specialty">특기</label>
                      <button type="button" onClick={() => handleOpenRecs('specialty')} className="text-sm text-accent font-semibold hover:underline">추천받기</button>
                    </div>
                    <input id="specialty" type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="shadow-md appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="예: 데이터 분석, 문제 해결" />
                  </div>
                  <div>
                    <label className="block text-gray-800 text-lg font-semibold mb-2" htmlFor="motto">좌우명</label>
                    <input id="motto" type="text" value={motto} onChange={(e) => setMotto(e.target.value)} className="shadow-md appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" placeholder="예: 오늘을 즐기자" />
                  </div>
                </div>
                <div className="mt-8 flex justify-end items-center">
                  {notification.message && <p className={`mr-4 text-sm ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{notification.message}</p>}
                  <button type="submit" className="bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">저장하기</button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
      <RecommendationModal
        isOpen={isRecModalOpen}
        onClose={() => setIsRecModalOpen(false)}
        title={recType === 'hobby' ? '취미' : '특기'}
        suggestions={currentSuggestions}
        onSelect={handleSelectSuggestion}
        onRefresh={handleRefreshSuggestions}
      />
    </>
  );
};

export default withAuth(MyPage);
