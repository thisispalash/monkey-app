'use client';

import cn from '@/lib/cn';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  isDisabled?: boolean;
}

export default function Button({
  children,
  onClick,
  className,
  isDisabled = false,
}: ButtonProps) {
  
  return (
    <button
      className={cn(
        'w-fit p-2 cursor-pointer whitespace-nowrap',
        'flex items-center justify-center',
        'border border-foreground rounded-md',
        'hover:bg-foreground hover:text-background',
        'focus:outline-none focus:ring-none focus:ring-foreground',
        'transition-all duration-300 ease-in-out',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}
