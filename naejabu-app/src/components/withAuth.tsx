'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AlertModal from './AlertModal'; // AlertModal을 import 합니다.

const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [alertModalOpen, setAlertModalOpen] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token || token === 'null') {
          setAlertModalOpen(true); // 인증되지 않았으면 모달을 엽니다.
          return;
        }

        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            setIsAuthorized(true);
          } else {
            localStorage.removeItem('token');
            setAlertModalOpen(true); // 토큰이 유효하지 않아도 모달을 엽니다.
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          localStorage.removeItem('token');
          setAlertModalOpen(true);
        }
      };

      checkAuth();
    }, []);

    const handleCloseModal = () => {
      setAlertModalOpen(false);
      router.push('/login'); // 모달을 닫으면 로그인 페이지로 이동합니다.
    };

    if (!isAuthorized) {
      return (
        <>
          <AlertModal
            isOpen={alertModalOpen}
            onClose={handleCloseModal}
            message="로그인 후 이용해주세요."
          />
          {/* 로딩 스피너나 다른 플레이스홀더를 여기에 추가할 수 있습니다. */}
        </>
      );
    }

    return <WrappedComponent {...props} />;
  };

  Wrapper.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return Wrapper;
};

export default withAuth;
