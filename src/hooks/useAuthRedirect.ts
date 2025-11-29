// hooks/useAuthRedirect.ts
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

type RedirectOptions = {
  to: string;
  if: 'authenticated' | 'unauthenticated';
};

export function useAuthRedirect({ to, if: condition }: RedirectOptions) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user status is determined
    }

    if (condition === 'authenticated' && user) {
      router.push(to);
    }

    if (condition === 'unauthenticated' && !user) {
      router.push(to);
    }
  }, [user, isUserLoading, router, to, condition]);
}
