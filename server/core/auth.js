// Optional sign-in check with Supabase. Without SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY every request is allowed.
import { createClient } from '@supabase/supabase-js';

let client;
export const authEnabled = (env = process.env) => Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

/** @returns {Promise<{ id: string } | null>} the user, null when auth is off; throws 401 when the token is missing or invalid */
export async function verifyUser(authorization, env = process.env) {
  if (!authEnabled(env)) return null;
  client ||= createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const token = authorization?.replace(/^Bearer /, '');
  const { data, error } = token ? await client.auth.getUser(token) : { data: null, error: true };
  if (error || !data?.user) { const e = new Error('Sign in to use the studio.'); e.status = 401; throw e; }
  return data.user;
}
