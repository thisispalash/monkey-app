'use client';

import { useState } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import cn from '@/lib/cn';

const Grid = WidthProvider(RGL);

const shapes: Record<string, [number, number]> = {
  '1x1': [1, 1], '1x2': [1, 2], '2x1': [2, 1], '2x2': [2, 2],
  '4x4': [4, 4], '1x4': [1, 4], '4x1': [4, 1], '2x4': [2, 4], '4x2': [4, 2],
};

const palette = ['#e2e8f0','#cbd5e1','#a3bffa','#f9a8d4','#fcd34d'];

const makeLayout = () =>
  Object.entries(shapes).map(([label, [w, h]], i) => ({
    i: label, x: i % 4, y: 0, w, h, static: false,
  }));

// Fake cards = id + label + bg colour
// const cards = Object.keys(shapes).map((k, i) => ({
//   id: `card-${i}`,
//   label: k,
//   color: [`#e2e8f0`, `#cbd5e1`, `#a3bffa`, `#f9a8d4`, `#fcd34d`][i % 5],
// }));

const cards = [
  {
    id: 'total-money',
    shape: '2x1',
    label: 'Balance: US$ 2,333.43',
  },
  {
    id: 'chase-money',
    shape: '2x1',
    label: (
      <div className="flex flex-row gap-2">
        <p>Chase:</p>
        <p className="text-red">US$ 123.21</p>
      </div>
    )
  },
  {
    id: 'categories',
    shape: '2x4',
    label: (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <p>Groceries</p>
          <p>US$ 100.21</p>
        </div>
        <div className="flex flex-row gap-2">
          <p>Travel</p>
          <p>US$ 48.21</p>
        </div>
        <div className="flex flex-row gap-2">
          <p>Impulse</p>
          <p>US$ 231.21</p>
        </div>
      </div>
    )
  },
  {
    id: 'apple-money',
    shape: '2x1',
    label: (
      <div className="flex flex-row gap-2">
        <p>Apple Card:</p>
        <p className="text-red">US$ 123.21</p>
      </div>
    )
  },
]

export default function Masonry() {
  
  // const [layout, setLayout] = useState(makeLayout());

  const layout = cards.map((c, i) => {
    const [w, h] = shapes[c.shape];
    return { i: c.id, x: (i % 4) * 1, y: Infinity, w, h };
  });

  return (   
    <Grid
      className="w-full"
      cols={4}
      rowHeight={90}
      margin={[12, 12]}
      layout={layout}
    >
      {cards.map(c => (
        <div key={c.id}
          className={cn(
            'rounded-xl shadow-md flex items-center justify-center',
            'font-semibold',
            'border border-foreground',
            'hover:text-background hover:bg-foreground',
          )}
        >
          {c.label}
        </div>
      ))}
    </Grid>
  );
  
}
