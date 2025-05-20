import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { verifyUser } from '@/lib/supabase/user';
import { storeRefreshToken } from '@/lib/supabase/session';
import { generateAccessToken, generateRefreshToken } from '@/lib/server/session';
import { getIngress } from '@/lib/server/http';

import type { MonkeyUser } from '@/lib/supabase/user';
import type { User, Ingress } from '@/lib/server/session';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const headersList = await headers();
  const userAgent = headersList.get('user-agent');
  const ingress = userAgent ? getIngress(userAgent) : 'web';

  const data: MonkeyUser | null = await verifyUser(username, password);

  if (!data) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const user: User = {
    sub: data.id,
    username: data.username,
    ingress: ingress as Ingress,
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await storeRefreshToken(user.username, refreshToken);

  const response = NextResponse.json({
    accessToken,
    refreshToken,
  });

  return response;
}