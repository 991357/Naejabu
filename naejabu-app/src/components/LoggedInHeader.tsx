'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationIcon from './NotificationIcon';
import useAuth from '@/hooks/useAuth';

interface LoggedInHeaderProps {
    onNavigate?: (url: string) => void;
}

const LoggedInHeader: React.FC<LoggedInHeaderProps> = ({ onNavigate }) => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleLinkClick = (url: string) => {
    if (onNavigate) {
      onNavigate(url);
    } else {
      router.push(url);
    }
  };

  return (
    <header className="bg-primary text-white p-4 shadow-md font-heading">
      <nav className="container mx-auto flex justify-between items-center">
        <button onClick={() => handleLinkClick('/resumes')} className="text-2xl font-bold">
          내자부
        </button>
        <div className="space-x-4 flex items-center">
          <button onClick={() => handleLinkClick('/community')} className="hover:text-gray-300">
            커뮤니티
          </button>
          <button onClick={() => handleLinkClick('/feedback')} className="hover:text-gray-300">
            첨삭 받기
          </button>
          <button onClick={() => handleLinkClick('/trash')} className="hover:text-gray-300">
            휴지통
          </button>
          <NotificationIcon />
          <button onClick={() => handleLinkClick('/mypage')} className="bg-accent text-white font-bold py-2 px-4 rounded hover:bg-opacity-80">
            마이페이지
          </button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
            로그아웃
          </button>
        </div>
      </nav>
    </header>
  );
};

export default LoggedInHeader;
