// Instagram connection (official Instagram API with Instagram Login, handled by the Netlify API).
// The browser only keeps an opaque connection id; the Instagram token never leaves the server.
import { apiRequest, runTask } from './ai';

const KEY = 'brandora.ig.conn';
export const getConn = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
export const setConn = (v) => { try { localStorage.setItem(KEY, v); } catch { /* storage blocked */ } };
export const clearConn = () => { try { localStorage.removeItem(KEY); } catch { /* storage blocked */ } };

export const igStatus = async () => (await apiRequest('/api/instagram/status')).data;

export async function igLogin() {
  const r = await apiRequest('/api/instagram/login');
  if (!r.ok) throw new Error(r.data.error || 'Could not start the Instagram connection.');
  return r.data.url;
}

/** @returns {{ profile, posts } | null} null when there is no (longer a) connection */
export async function igAccount() {
  const conn = getConn();
  if (!conn) return null;
  const r = await apiRequest('/api/instagram/account', { headers: { 'x-ig-conn': conn } });
  if (r.status === 401) { clearConn(); return null; }
  if (!r.ok) throw new Error(r.data.error || 'Could not read the Instagram account.');
  return r.data;
}

export async function igDisconnect() {
  const conn = getConn();
  clearConn();
  if (conn) await apiRequest('/api/instagram/disconnect', { method: 'POST', headers: { 'x-ig-conn': conn } });
}

/** Three post ideas. Only the profile and captions are sent to the language model, never the token. */
export function igIdeas({ account, project }) {
  const { profile, posts } = account;
  return runTask('instagram', {
    profile: { username: profile.username, name: profile.name || '', biography: profile.biography || '', account_type: profile.account_type || '', followers_count: profile.followers_count, media_count: profile.media_count },
    posts: posts.slice(0, 20).map((p) => ({ caption: p.caption || '', media_type: p.media_type || '', like_count: p.like_count, comments_count: p.comments_count, timestamp: p.timestamp })),
    brand: { name: project?.input.name || '', category: project?.input.category || '', language: project?.input.language === 'ar' ? 'ar' : 'en' },
  });
}
