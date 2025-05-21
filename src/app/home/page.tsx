'use client';

import { useRef, useState } from 'react';
import { useAPI } from '@/context/APIContext';
import cn from '@/lib/cn';

import Monkey from '@/component/Monkey';
import Masonry from '@/component/Masonry';
import Chat from '@/component/Chat';

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState(0);
  const [ monkeyState, setMonkeyState ] = useState<string | null>(null);
  const { upload } = useAPI();

  const handleUploadClick = async () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const res = await fetch('/api/monkey/upload-demo', {
      method: 'POST',
      body: JSON.stringify({
        index,
      }),
    });
    const data = await res.json();
    setMonkeyState(data.state);
    setIndex(index + 1);
  }

  return <>
    
    <div className={cn(
      'w-full h-full overflow-hidden',
      'flex flex-col justify-between',
      'md:hidden'
    )}>
      <div className="flex flex-row justify-between h-1/6">
        <p className=" font-semibold text-2xl">demo01.dmk</p>

        {/* upload button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleUpload}
            multiple
          />
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 border border-foreground rounded-lg hover:bg-foreground hover:text-background transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <Monkey monkeyState={monkeyState} />
      <Chat />
    </div>

    <div className={cn(
      'w-full h-full overflow-hidden',
      'min-h-screen',
      'flex flex-row gap-4',
      'hidden md:flex',
    )}>
      
      {/* Sidebar */}
      <div className={cn(
        'h-full w-1/4',
        'flex flex-col justify-between',
      )}>

        <div className="flex flex-row justify-between h-1/6">
          <p className=" font-semibold text-2xl">demo01.dmk</p>

          {/* upload button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleUpload}
              multiple
            />
            <button
              onClick={handleUploadClick}
              className="px-4 py-2 border border-foreground rounded-lg hover:bg-foreground hover:text-background transition-colors"
            >
              Add
            </button>
          </div>
        </div>


        <Monkey monkeyState={monkeyState} />

        <Chat />

      </div>

      <div className="flex h-full w-full overflow-y-auto">
        <Masonry />
      </div>



    </div>
  </>;
}