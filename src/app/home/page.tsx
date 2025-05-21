'use client';

import { useState } from 'react';

import cn from '@/lib/cn';


const states = {
  
  ZEN: <>
    <img src="/img/state/layers/eyes/eyes-closed.svg"  className="absolute inset-0 w-full h-full object-contain" />
    <img src="/img/state/layers/mouth/mouth-smile.svg"  className="absolute inset-0 w-full h-full object-contain" />
  </>,

  GLOW: <>
    <img src="/img/state/layers/eyes/eyes-caret.svg"  className="absolute inset-0 w-full h-full object-contain" />
    <img src="/img/state/layers/mouth/mouth-smile.svg"  className="absolute inset-0 w-full h-full object-contain" />
  </>,

  ALCOHOL: <>
    <img src="/img/state/layers/eyes/eyes-spiral.svg"  className="absolute inset-0 w-full h-full object-contain" />
    <img src="/img/state/layers/mouth/mouth-zigzag.svg"  className="absolute inset-0 w-full h-full object-contain" />
  </>,
  
  JITTERS: <>
    <img src="/img/state/layers/eyes/eyes-wide.svg"  className="absolute inset-0 w-full h-full object-contain" />
    <img src="/img/state/layers/mouth/mouth-spiral.svg"  className="absolute inset-0 w-full h-full object-contain" />
  </>,
  
  OBESE: <>
    <img src="/img/state/layers/eyes/eyes-small.svg"  className="absolute inset-0 w-full h-full object-contain" />
    <img src="/img/state/layers/mouth/mouth-frown.svg"  className="absolute inset-0 w-full h-full object-contain" />
  </>,
  
  BROKE: <>
    <img src="/img/state/layers/eyes/eyes-stressed.svg"  className="absolute inset-0 w-full h-full object-contain" />
    <img src="/img/state/layers/mouth/mouth-zigzag.svg"  className="absolute inset-0 w-full h-full object-contain" />
  </>,
  
  FRUGAL: <>
    <img src="/img/state/layers/eyes/eyes-glasses.svg"  className="absolute inset-0 w-full h-full object-contain" />
    <img src="/img/state/layers/mouth/mouth-smile.svg"  className="absolute inset-0 w-full h-full object-contain" />
  </>,
  
  SMART: <>
    <img src="/img/state/layers/eyes/eyes-sunglasses.svg"  className="absolute inset-0 w-full h-full object-contain" />
    <img src="/img/state/layers/mouth/mouth-grin.svg"  className="absolute inset-0 w-full h-full object-contain" />
  </>,
}

export default function HomePage() {

  const [ state, setState ] = useState<keyof typeof states>('ZEN');

  return (
    <div className={cn(
      'w-full h-full',
      'flex flex-col gap-4',
      'items-center justify-center',
    )}>

      <div className="relative w-[200px] h-[200px]">
        <img src="/img/state/layers/body/base-fur.svg"  className="absolute inset-0 w-full h-full object-contain" />
        <img src="/img/state/layers/body/base-face.svg"  className="absolute inset-0 w-full h-full object-contain" />
        <img src="/img/state/layers/body/base-chest.svg"  className="absolute inset-0 w-full h-full object-contain" />
        <img src="/img/state/layers/body/base-ears.svg"  className="absolute inset-0 w-full h-full object-contain" />
        {states[state]}
      </div>



      <select onChange={(e) => setState(e.target.value as keyof typeof states)}>
        {Object.keys(states).map((key) => (
          <option value={key} className="lowercase" key={key}>{key}</option>
        ))}
      </select>



    </div>
  );
}