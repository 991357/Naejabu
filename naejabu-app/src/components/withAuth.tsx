'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
      // user 상태가 명시적으로 null일 때 (초기 상태 또는 로그아웃 후) 리디렉션합니다.
      if (user === null) {
        router.replace('/login');
      }
    }, [user, router]);

    // user가 아직 설정되지 않았다면 로딩 스피너를 보여주거나 아무것도 보여주지 않습니다.
    if (!user) {
      return <LoadingSpinner />;
    }

    // user가 존재하면 실제 컴포넌트를 렌더링합니다.
    return <WrappedComponent {...props} />;
  };

  Wrapper.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return Wrapper;
};

export default withAuth;
