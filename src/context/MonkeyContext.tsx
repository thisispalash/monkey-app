'use client';

import { createContext, useContext, useState } from 'react';

export const STATE_LOOKUP = {
  ZEN: {},
  GLOW: {},
  ALCOHOL: {},
  JITTERS: {},
  OBESE: {},
  BROKE: {},
  FRUGAL: {},
  SMART: {},
}

interface MonkeyContextType {
  state: keyof typeof STATE_LOOKUP;
  setState: (state: keyof typeof STATE_LOOKUP) => void;
}

const MonkeyContext = createContext<MonkeyContextType | null>(null);

export default function MonkeyProvider({ children }: { children: React.ReactNode }) {
  const [ state, setState ] = useState<keyof typeof STATE_LOOKUP>('ZEN');

  return (
    <MonkeyContext.Provider 
      value={{ 
        state, 
        setState 
      }}
    >
      {children}
    </MonkeyContext.Provider>
  );
}

export function useMonkey() {
  const context = useContext(MonkeyContext);
  if (!context) throw new Error('useMonkey must be used within a MonkeyProvider');
  return context;
}