'use client';

import cn from '@/lib/cn';
import Image from 'next/image';

import { useLoading } from '@/context/LoadingContext';

export default function Loader() {

  const { isLoading } = useLoading();

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'transition-all duration-1000',
      isLoading ? 'scale-100' : 'scale-[20] opacity-0 pointer-events-none'
    )}>
      <div className={cn(
        'h-full w-full relative',
        isLoading && 'animate-pulse'
      )}>
        <Image
          src="/img/circus-monkey.svg"
          alt="Loading.."
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}

