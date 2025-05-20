import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { registerUser } from '@/lib/supabase/user';
import { getIngress } from '@/lib/server/http';
import { storeRefreshToken } from '@/lib/supabase/session';
import { generateAccessToken, generateRefreshToken } from '@/lib/server/session';

export async function POST(request: NextRequest) {

  const { username, password } = await request.json();

  const headersList = await headers();
  const userAgent = headersList.get('user-agent');
  const ingress = userAgent ? getIngress(userAgent) : 'web';

  try {
    const user = await registerUser(username, password, ingress);

    const accessToken = generateAccessToken({
      sub: user.id,
      username: user.username,
      ingress,
    });
    const refreshToken = generateRefreshToken();
  
    await storeRefreshToken(user.username, refreshToken);
    return NextResponse.json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}