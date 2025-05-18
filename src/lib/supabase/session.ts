/**
 * @module supabase-session-store
 * 
 * @dev TODOs
 * 
 * - [ ] rotate refresh tokens
 * - [ ] store last_used every check or refresh
 * - [ ] store ip_address and user_agent with each session / check
 * - [ ] handle supabase errors gracefully
 */

import { hashRefreshToken } from '@/lib/session';
import { supabaseAdmin, handleSupabaseError } from './_client';


/****** Constants ******/

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days


/****** Functions ******/

export async function checkRefreshToken(token: string): Promise<string | null> {
  const hashed = hashRefreshToken(token);

  const { data, error } = await supabaseAdmin
    .from('monkey_sessions')
    .select('*')
    .eq('token_hash', hashed)
    .eq('revoked', false)
    .single();

  if (error || !data || new Date(data.expires_at) < new Date()) return null;
  return data.username;
}

export async function storeRefreshToken(username: string, token: string) {
  const hashed = hashRefreshToken(token);

  const { error } = await supabaseAdmin
    .from('semicolon_sessions')
    .insert({ 
      username, 
      token_hash: hashed, 
      expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL),
      revoked: false
    });

  if (error) handleSupabaseError(error);
}

export async function revokeRefreshToken(token: string) {
  const hashed = hashRefreshToken(token);

  const { error } = await supabaseAdmin
    .from('semicolon_sessions')
    .update({ revoked: true })
    .eq('token_hash', hashed);

  if (error) handleSupabaseError(error);
}

// @dev TODO: rotate refresh tokens
export async function refreshRefreshToken(token: string) {
  const hashed = hashRefreshToken(token);

  // revoke the old token
  const { error } = await supabaseAdmin
    .from('semicolon_sessions')
    .update({ expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL) })
    .eq('token_hash', hashed);

  if (error) handleSupabaseError(error);
}