'use client';

import useAuth from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import Link from 'next/link';
import { FaRobot, FaUserGraduate, FaClipboardCheck, FaPenFancy } from 'react-icons/fa';

const FeedbackHomePage = () => {
  const { user, loading } = useAuth();

  const menteeOptions = [
    { title: 'AI에게 첨삭받기', description: 'AI가 신속하고 정확하게 자소서를 분석해 드립니다.', href: '/feedback/ai', icon: <FaRobot className="h-12 w-12" /> },
    { title: '멘토에게 첨삭받기', description: '현직자 멘토의 경험과 노하우가 담긴 피드백을 받아보세요.', href: '/feedback/mentor-request', icon: <FaUserGraduate className="h-12 w-12" /> },
    { title: '첨삭 결과 확인하기', description: 'AI 및 멘토에게 받은 첨삭 결과를 확인합니다.', href: '/feedback/results', icon: <FaClipboardCheck className="h-12 w-12" /> },
  ];

  const mentorOptions = [
    { title: 'AI에게 첨삭받기', description: 'AI가 신속하고 정확하게 자소서를 분석해 드립니다.', href: '/feedback/ai', icon: <FaRobot className="h-12 w-12" /> },
    { title: '멘토에게 첨삭받기', description: '다른 멘토의 경험과 노하우가 담긴 피드백을 받아보세요.', href: '/feedback/mentor-request', icon: <FaUserGraduate className="h-12 w-12" /> },
    { title: '첨삭 결과 확인하기', description: '내가 요청한 첨삭의 진행 상태와 결과를 확인합니다.', href: '/feedback/results', icon: <FaClipboardCheck className="h-12 w-12" /> },
    { title: '첨삭하기', description: '멘티들의 자소서를 검토하고 소중한 피드백을 남겨주세요.', href: '/feedback/mentor-give', icon: <FaPenFancy className="h-12 w-12" /> },
  ];

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }

  const options = user?.role === 'mentor' ? mentorOptions : menteeOptions;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary font-heading">첨삭받기</h1>
          <p className="text-lg text-gray-600 mt-4">AI와 현직자 멘토에게 자소서 피드백을 받아보세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {options.map((option) => (
            <Link href={option.href} key={option.title} className="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mx-auto mb-6">
                {option.icon}
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{option.title}</h2>
              <p className="text-center text-gray-500">{option.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default withAuth(FeedbackHomePage);
