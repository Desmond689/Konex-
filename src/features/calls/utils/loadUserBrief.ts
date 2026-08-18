import { supabase } from '../../../api/client/supabase.client';

export type UserBrief = {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_picture: string | null;
};

export async function loadUserBrief(userId: string): Promise<UserBrief | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('users')
    .select('id, username, display_name, profile_picture')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as UserBrief | null;
}

export function displayName(u: UserBrief | null | undefined, fallback = 'User') {
  if (!u) return fallback;
  return u.display_name || u.username || fallback;
}
