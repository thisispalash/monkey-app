/**
 * @module supabase-user-store
 * @note all passwords must be hashed before sending to this module
 * 
 * @dev TODOs
 * - [ ] custom auth errors to surface to client
 * - [ ] deploy persona contract on Base, along with ens support
 */

import { supabaseAdmin, handleSupabaseError } from './_client';
import { Ingress } from '@/lib/api/session';


export type MonkeyUser = {
  id: string;
  username: string;
  password: string; // hashed
  ingress: Ingress;
  created_at: Date;
  discord: string;
  telegram: string;
}


export async function getUserByUsername(username: string): Promise<MonkeyUser | null> {

  const { data, error } = await supabaseAdmin
    .from('monkey_users')
    .select('*')
    .eq('username', username)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) handleSupabaseError(error);

  return data;
}

export async function registerUser(username: string, password: string, ingress: Ingress): Promise<MonkeyUser> {

  const { data, error } = await supabaseAdmin
    .from('monkey_users')
    .insert({ username, password, ingress })
    .select('*')
    .single();

  if (error?.code === '23505') {
    // unique constraint violation
    throw new Error('username already exists');
  }

  if (error) handleSupabaseError(error);

  return data;
}

export async function verifyUser(username: string, password: string): Promise<MonkeyUser | null> {

  const { data, error } = await supabaseAdmin
    .from('monkey_users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();
  
  if (error?.code === 'PGRST116') return null;
  if (error) handleSupabaseError(error);

  return data;
}