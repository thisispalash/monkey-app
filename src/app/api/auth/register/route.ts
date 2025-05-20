import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { registerUser } from '@/lib/supabase/user';
import { getIngress } from '@/lib/server/http';

export async function POST(request: NextRequest) {

  const { username, password } = await request.json();

  const headersList = await headers();
  const userAgent = headersList.get('user-agent');
  const ingress = userAgent ? getIngress(userAgent) : 'web';

  try {
    const user = await registerUser(username, password, ingress);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}