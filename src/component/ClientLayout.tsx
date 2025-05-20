'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import cn from '@/lib/cn';

import LoadingProvider, { useLoading } from '@/context/LoadingContext';
import AuthProvider, { useAuth } from '@/context/AuthContext';
import APIProvider from '@/context/APIContext';

import Loader from '@/component/Loader';

export default function ClientLayout({ children }: { children: React.ReactNode }) {

  return (
    <LoadingProvider>
      <AuthProvider>
        <APIProvider>
          <Loader />
          <ClientLayoutContent>{children}</ClientLayoutContent>
        </APIProvider>
      </AuthProvider>
    </LoadingProvider>
  );
}

function ClientLayoutContent({ children }: { children: React.ReactNode }) {

  const { isLoading } = useLoading();
  const { isLoggedIn } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [ isLoggedIn ]);

  return (
    <main className={cn(
      'flex min-h-screen w-full p-6',
      'transition-opacity duration-1000',
      isLoading ? 'opacity-0' : 'opacity-100',
      'flex flex-col gap-4'
    )}>
      {children}
    </main>
  );
} 