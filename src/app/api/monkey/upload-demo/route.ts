import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  
  const { index } = await request.json();

  console.log(index);
  
  switch (index) {
    case 0:
      return NextResponse.json({ state: 'JITTERS' });
    case 1:
      return NextResponse.json({ state: 'GLOW' });
    case 2:
      return NextResponse.json({ state: 'ALCOHOL' });
    default: 
      return NextResponse.json({ state: 'SMART' });
  }
}