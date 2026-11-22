// Optional cloud persistence and auth (Supabase). Active only when VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY are set; otherwise projects stay in this browser's storage.
const URL_ = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const cloudEnabled = Boolean(URL_ && KEY);

let clientPromise;
const client = () => (clientPromise ||= import('@supabase/supabase-js').then(({ createClient }) => createClient(URL_, KEY)));

let currentSession = null;
export const accessToken = () => currentSession?.access_token;

export async function onAuthChange(cb) {
  if (!cloudEnabled) return () => {};
  const sb = await client();
  const { data } = await sb.auth.getSession();
  currentSession = data.session; cb(currentSession);
  const { data: sub } = sb.auth.onAuthStateChange((_e, session) => { currentSession = session; cb(session); });
  return () => sub.subscription.unsubscribe();
}

export async function signInWithEmail(email) {
  const sb = await client();
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/dashboard' } });
  if (error) throw new Error(error.message);
}
export async function signOut() { await (await client()).auth.signOut(); }

const toRow = (p, userId) => ({
  id: p.id, user_id: userId, name: p.input.name, input: p.input, concepts: p.concepts, brief: p.brief ?? null, selected: p.selected,
  status: p.status, favorite: !!p.favorite, seed: p.seed ?? null, meta: { visited: p.visited || [], exported: !!p.exported },
  created_at: new Date(p.createdAt).toISOString(), updated_at: new Date(p.updatedAt).toISOString(),
});
const fromRow = (r) => ({
  id: r.id, input: r.input, concepts: r.concepts, brief: r.brief ?? undefined, selected: r.selected, status: r.status, favorite: r.favorite, seed: r.seed,
  visited: r.meta?.visited, exported: r.meta?.exported, createdAt: Date.parse(r.created_at), updatedAt: Date.parse(r.updated_at),
});

export async function loadProjects() {
  const sb = await client();
  const { data, error } = await sb.from('projects').select('*').order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(fromRow);
}
export async function saveProjects(projects, userId) {
  if (!projects.length) return;
  const sb = await client();
  const { error } = await sb.from('projects').upsert(projects.map((p) => toRow(p, userId)));
  if (error) throw new Error(error.message);
}
export async function removeProjects(ids) {
  if (!ids.length) return;
  const sb = await client();
  const { error } = await sb.from('projects').delete().in('id', ids);
  if (error) throw new Error(error.message);
}
