import { NextRequest, NextResponse } from 'next/server';

import { revokeRefreshToken } from '@/lib/supabase/session';

export async function POST(request: NextRequest) {
  const { refreshToken } = await request.json();

  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
  }

  await revokeRefreshToken(refreshToken);

  return NextResponse.json({ message: 'Logged out' });
}