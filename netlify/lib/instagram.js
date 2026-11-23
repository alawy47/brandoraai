// Instagram API with Instagram Login (official). The account owner signs in on instagram.com and approves;
// we then read their own profile and recent posts. It cannot read other people's accounts.
//
//   GET  /api/instagram/status          is it configured, and which URLs to register in the Meta app
//   GET  /api/instagram/login           → { url } to send the browser to instagram.com
//   GET  /api/instagram/callback        Instagram sends the browser back here with ?code&state
//   GET  /api/instagram/account         profile + recent posts (header x-ig-conn)
//   POST /api/instagram/disconnect      forget the connection
//   POST /api/instagram/deauthorize     Meta callback: the user removed the app
//   POST /api/instagram/data-deletion   Meta callback: the user asked us to delete their data
//
// The long-lived token stays on the server (Netlify Blobs). The browser only holds an opaque random
// connection id, so a leaked page cannot reveal the token.
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

const AUTH_URL = 'https://www.instagram.com/oauth/authorize';
const TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const GRAPH = 'https://graph.instagram.com';
const SCOPE = 'instagram_business_basic';
const STATE_TTL = 10 * 60 * 1000;
const REFRESH_WITHIN = 10 * 24 * 60 * 60 * 1000;
const PROFILE_FIELDS = 'user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count,biography';
const MEDIA_FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const redirect = (to) => new Response(null, { status: 302, headers: { location: to, 'cache-control': 'no-store' } });
export const instagramConfigured = (env) => Boolean(env.INSTAGRAM_APP_ID && env.INSTAGRAM_APP_SECRET);
const version = (env) => (env.INSTAGRAM_API_VERSION ? `/${env.INSTAGRAM_API_VERSION}` : '');
const origin = (req, env) => (env.SITE_URL || new URL(req.url).origin).replace(/\/+$/, '');
const secureEq = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

class IgError extends Error { constructor(m, { status = 502, auth = false } = {}) { super(m); this.status = status; this.auth = auth; } }

async function graph(fetchFn, url, init) {
  let res;
  try { res = await fetchFn(url, init); } catch { throw new IgError('Instagram could not be reached. Try again.'); }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error || body.error_message) {
    const code = body.error?.code ?? body.code;
    // 190 = invalid or expired token; 10 / 200-299 = permission not granted
    const auth = res.status === 401 || code === 190 || code === 10 || (code >= 200 && code < 300);
    throw new IgError(auth ? 'The Instagram connection expired. Connect again.' : (body.error?.message || body.error_message || `Instagram answered ${res.status}.`), { status: auth ? 401 : 502, auth });
  }
  return body;
}

export async function handleInstagram(req, path, { stores, env = process.env, fetch: fetchFn = globalThis.fetch }) {
  const url = new URL(req.url);
  const site = origin(req, env);
  const redirectUri = `${site}/api/instagram/callback`;
  const sub = path.replace(/^\/instagram/, '') || '/';
  const m = req.method;

  try {
    if (m === 'GET' && sub === '/status') {
      return json({ configured: instagramConfigured(env), redirectUri, deauthorizeUrl: `${site}/api/instagram/deauthorize`, dataDeletionUrl: `${site}/api/instagram/data-deletion`, scope: SCOPE });
    }
    if (!instagramConfigured(env) && !['/deauthorize', '/data-deletion'].includes(sub)) return json({ error: 'Instagram is not set up on this site yet.', code: 'not_configured' }, 503);

    if (m === 'GET' && sub === '/login') {
      const state = randomBytes(24).toString('hex');
      await stores('ig-state').set(state, { t: Date.now() });
      const q = new URLSearchParams({ client_id: env.INSTAGRAM_APP_ID, redirect_uri: redirectUri, response_type: 'code', scope: SCOPE, state });
      return json({ url: `${AUTH_URL}?${q}` });
    }

    if (m === 'GET' && sub === '/callback') {
      if (url.searchParams.get('error')) return redirect('/instagram?error=denied');
      const state = url.searchParams.get('state') || '';
      const code = (url.searchParams.get('code') || '').replace(/#_$/, '');
      const st = await stores('ig-state').get(state);
      if (!/^[a-f0-9]{48}$/.test(state) || !st || Date.now() - st.t > STATE_TTL || !code) return redirect('/instagram?error=state');
      await stores('ig-state').del(state); // single use

      const short = await graph(fetchFn, TOKEN_URL, { method: 'POST', body: new URLSearchParams({ client_id: env.INSTAGRAM_APP_ID, client_secret: env.INSTAGRAM_APP_SECRET, grant_type: 'authorization_code', redirect_uri: redirectUri, code }) });
      const long = await graph(fetchFn, `${GRAPH}/access_token?${new URLSearchParams({ grant_type: 'ig_exchange_token', client_secret: env.INSTAGRAM_APP_SECRET, access_token: short.access_token })}`);
      const me = await graph(fetchFn, `${GRAPH}${version(env)}/me?${new URLSearchParams({ fields: 'user_id,username', access_token: long.access_token })}`);
      const userId = String(me.user_id || short.user_id);

      const old = await stores('ig-user').get(userId); // one live connection per account
      if (old?.conn) await stores('ig-conn').del(old.conn);
      const conn = randomBytes(32).toString('hex');
      await stores('ig-conn').set(conn, { token: long.access_token, userId, username: me.username, expiresAt: Date.now() + (long.expires_in || 5184000) * 1000, createdAt: Date.now() });
      await stores('ig-user').set(userId, { conn });
      return redirect(`/instagram#c=${conn}`);
    }

    if (sub === '/deauthorize' || sub === '/data-deletion') {
      if (m !== 'POST') return json({ error: 'Not found.' }, 404);
      const signed = new URLSearchParams(await req.text()).get('signed_request') || '';
      const payload = verifySignedRequest(signed, env.INSTAGRAM_APP_SECRET || '');
      if (!payload?.user_id) return json({ error: 'Invalid request.' }, 400);
      const userId = String(payload.user_id);
      const rec = await stores('ig-user').get(userId);
      if (rec?.conn) await stores('ig-conn').del(rec.conn);
      await stores('ig-user').del(userId);
      if (sub === '/data-deletion') { const code = randomBytes(8).toString('hex'); return json({ url: `${site}/instagram?deleted=${code}`, confirmation_code: code }); }
      return json({ ok: true });
    }

    const conn = req.headers.get('x-ig-conn') || '';
    const rec = /^[a-f0-9]{64}$/.test(conn) ? await stores('ig-conn').get(conn) : null;

    if (m === 'POST' && sub === '/disconnect') {
      if (rec) { await stores('ig-conn').del(conn); await stores('ig-user').del(rec.userId); }
      return json({ ok: true });
    }

    if (m === 'GET' && sub === '/account') {
      if (!rec) return json({ error: 'Not connected.', code: 'not_connected' }, 401);
      try {
        if (rec.expiresAt - Date.now() < REFRESH_WITHIN) { // long-lived tokens last 60 days and can be refreshed
          const r = await graph(fetchFn, `${GRAPH}/refresh_access_token?${new URLSearchParams({ grant_type: 'ig_refresh_token', access_token: rec.token })}`);
          rec.token = r.access_token; rec.expiresAt = Date.now() + (r.expires_in || 5184000) * 1000;
          await stores('ig-conn').set(conn, rec);
        }
        const [profile, media] = await Promise.all([
          graph(fetchFn, `${GRAPH}${version(env)}/me?${new URLSearchParams({ fields: PROFILE_FIELDS, access_token: rec.token })}`),
          graph(fetchFn, `${GRAPH}${version(env)}/me/media?${new URLSearchParams({ fields: MEDIA_FIELDS, limit: '12', access_token: rec.token })}`),
        ]);
        return json({ profile, posts: media.data || [], expiresAt: rec.expiresAt });
      } catch (e) {
        if (e.auth) { await stores('ig-conn').del(conn); await stores('ig-user').del(rec.userId); return json({ error: e.message, code: 'expired' }, 401); }
        throw e;
      }
    }
    return json({ error: 'Not found.' }, 404);
  } catch (e) {
    console.error('instagram:', e.message.replace(/access_token=[^&\s]+/g, 'access_token=…'));
    return json({ error: e instanceof IgError ? e.message : 'Something went wrong with Instagram. Try again.' }, e.status || 500);
  }
}

/** Meta signs deauthorize/deletion callbacks: base64url(signature).base64url(payload), HMAC-SHA256 with the app secret. */
export function verifySignedRequest(signed, secret) {
  const [sig, payload] = signed.split('.');
  if (!sig || !payload || !secret) return null;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  if (!secureEq(sig, expected)) return null;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { return null; }
}
