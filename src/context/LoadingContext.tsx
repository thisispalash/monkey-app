'use client';

import Script from 'next/script';
import { createContext, useContext, useState, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  addLoadingSource: (source: string) => void;
  removeLoadingSource: (source: string) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export default function LoadingProvider({ children }: { children: React.ReactNode }) {

  const [isLoading, setIsLoading] = useState(true);
  const [loadingSources, setLoadingSources] = useState<Set<string>>(new Set(['goatcounter']));

  const addLoadingSource = (source: string) => {
    console.log('addLoadingSource', source);
    setLoadingSources((prev) => {
      const newSet = new Set(prev);
      newSet.add(source);
      return newSet;
    });
  };

  const removeLoadingSource = (source: string) => {
    console.log('removeLoadingSource', source);
    setLoadingSources((prev) => {
      const newSet = new Set(prev);
      newSet.delete(source);
      return newSet;
    });
  };

  useEffect(() => {
    console.log('loadingSources', loadingSources);
    setIsLoading(loadingSources.size > 0);
  }, [loadingSources]);

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        setIsLoading, 
        addLoadingSource, 
        removeLoadingSource 
      }}
    >
      <Script
        async
        src="/js/goat.js"
        data-goatcounter="https://monkey.goatcounter.com/count"
        onLoad={() => removeLoadingSource('goatcounter')}
      />
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}