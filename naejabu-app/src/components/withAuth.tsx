'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token || token === 'null') {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthorized(true);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('token'); // Clean up invalid token
          router.push('/login');
        }
      };

      checkAuth();
    }, [router]);

    if (!isAuthorized) {
      return null; // Or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  Wrapper.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return Wrapper;
};

export default withAuth;
