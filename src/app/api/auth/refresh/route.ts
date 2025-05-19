import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { checkRefreshToken, storeRefreshToken, revokeRefreshToken } from '@/lib/supabase/session';
import { getUserByUsername } from '@/lib/supabase/user';
import { generateAccessToken, generateRefreshToken } from '@/lib/session';
import { getIngress } from '@/lib/api/http';

import type { User, Ingress } from '@/lib/session';

export async function POST(request: NextRequest) {
  const { refreshToken } = await request.json();
  
  const headersList = await headers();
  const userAgent = headersList.get('user-agent');
  const ingress = userAgent ? getIngress(userAgent) : 'web';

  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
  }
  
  const username = await checkRefreshToken(refreshToken);
  if (!username) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }

  const user = await getUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const payload: User = {
    sub: user.id,
    username: user.username,
    ingress: ingress as Ingress,
  }

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken();

  await storeRefreshToken(user.username, newRefreshToken);
  await revokeRefreshToken(refreshToken);

  const response = NextResponse.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });

  return response;
}
