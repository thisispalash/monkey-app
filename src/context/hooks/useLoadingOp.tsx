'use client';

import { useLoading } from '@/context/LoadingContext';

export default function useLoadingOp(source: string) {

  const { addLoadingSource, removeLoadingSource } = useLoading();

  const withLoading = async (fn: () => Promise<void>) => {

    addLoadingSource(source);

    try {
      await fn();
    } finally {
      removeLoadingSource(source);
    }
  }

  return withLoading;
}
  
  