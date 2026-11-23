import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Download, Link2Off, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import ScaledFrame from '../components/social/ScaledFrame';
import { InstagramPost } from '../components/social/SocialDesigns';
import { CopyButton, DownloadButtons, useAsyncAction } from './studio/shared';
import { useI18n } from '../i18n/I18nContext';
import { useProjects } from '../store/ProjectsContext';
import { useToast } from '../components/ui/Toast';
import { useBackend } from '../services/useBackend';
import { igStatus, igLogin, igAccount, igDisconnect, igIdeas, setConn } from '../services/instagram';
import { downloadNode } from '../lib/download';
import { slugify } from '../lib/generator';

function toPost(v, lang) {
  const base = { type: v.template, kicker: v.kicker, headline: v.headline, sub: v.sub, cta: v.cta };
  if (v.template === 'quote') return { type: 'quote', headline: lang === 'ar' ? `«${v.headline}»` : `“${v.headline}”`, sub: v.sub };
  if (v.template === 'sale') return { ...base, big: v.big || '' };
  if (v.template === 'tips') return { ...base, items: (v.items || []).slice(0, 3) };
  if (v.template === 'testimonial') return { ...base, author: v.author || '' };
  return base;
}

function IdeaCard({ idea, project, concept, lang, busy, run, k, slug, index }) {
  const ref = useRef(null);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const tags = idea.hashtags.join(' ');
  return (
    <div className="panel overflow-hidden">
      <div className="relative">
        <ScaledFrame ref={ref} width={540} height={540}><InstagramPost project={project} concept={concept} post={toPost(idea.visual, lang)} /></ScaledFrame>
        <div className="absolute end-3 top-3"><DownloadButtons id={`idea${index}`} busy={busy} onPng={() => run(`idea${index}-png`, () => downloadNode(ref.current, `${slug}-idea-${index + 1}.png`, 2))} /></div>
      </div>
      <div className="space-y-3 p-4" dir={dir}>
        <h3 className="font-display text-lg font-semibold">{idea.title}</h3>
        <p className="text-sm leading-relaxed text-mute">{idea.why}</p>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-mute"><span>{k('caption')}</span><CopyButton value={`${idea.caption}\n\n${tags}`} label={k('copy')} className="text-soft hover:text-paper" /></div>
          <p className="text-sm leading-relaxed text-soft">{idea.caption}</p>
          <p className="mt-2 text-sm text-lilac">{tags}</p>
        </div>
      </div>
    </div>
  );
}

export default function Instagram() {
  const { t, lang: uiLang } = useI18n();
  const k = (key) => t(`ig.${key}`);
  const toast = useToast();
  const backend = useBackend();
  const { projects } = useProjects();
  const [busy, run] = useAsyncAction();
  const [status, setStatus] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectId, setProjectId] = useState('');
  const [ideas, setIdeas] = useState(null);
  const [thinking, setThinking] = useState(false);

  const project = projects.find((p) => p.id === projectId) || projects.find((p) => !p.sample) || projects[0];
  const concept = project?.concepts[project.selected] || project?.concepts[0];
  const lang = project?.input.language === 'ar' ? 'ar' : 'en';

  const load = async () => {
    setLoading(true); setError('');
    try { setAccount(await igAccount()); } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => {
    const m = window.location.hash.match(/^#c=([a-f0-9]{64})$/);
    if (m) { setConn(m[1]); window.history.replaceState(null, '', window.location.pathname); toast(k('connected')); }
    const q = new URLSearchParams(window.location.search);
    if (q.get('error')) setError(k(q.get('error') === 'denied' ? 'denied' : 'stateError'));
    if (q.get('deleted')) toast(k('deleted'));
    if (q.get('error') || q.get('deleted')) window.history.replaceState(null, '', window.location.pathname);
    igStatus().then(setStatus).catch(() => setStatus({ configured: false, unreachable: true }));
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = () => run('login', async () => { window.location.href = await igLogin(); });
  const disconnect = async () => { await igDisconnect(); setAccount(null); setIdeas(null); toast(k('disconnected')); };
  const suggest = async () => {
    setThinking(true); setError('');
    try { setIdeas(await igIdeas({ account, project })); } catch (e) { setError(e.message); } finally { setThinking(false); }
  };

  const reachable = backend.reachable;
  const configured = status?.configured;
  const p = account?.profile;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-[-0.02em]">{k('title')}</h1>
      <p className="mt-2 max-w-2xl text-mute">{k('sub')}</p>

      {error && <p className="mt-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">{error}</p>}

      {!backend.checking && !reachable && (
        <div className="mt-8 rounded-2xl border border-champagne/25 bg-champagne/[.06] p-5 text-sm text-soft">{k('needsApi')} <Link to="/settings" className="text-champagne hover:underline">{t('wf.setup')}</Link></div>
      )}

      {reachable && !loading && !account && configured === false && (
        <section className="panel mt-8 p-6">
          <h2 className="font-display text-xl font-semibold">{k('setupTitle')}</h2>
          <p className="mt-1 text-sm text-mute">{k('setupSub')}</p>
          <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm leading-relaxed text-soft">{['s1', 's2', 's3', 's4', 's5'].map((x) => <li key={x}>{k(x)}</li>)}</ol>
          {status?.redirectUri && (
            <dl className="mt-5 space-y-2 text-sm">
              {[['redirect', status.redirectUri], ['deauth', status.deauthorizeUrl], ['deletion', status.dataDeletionUrl]].map(([key, v]) => (
                <div key={key} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-ink-2 px-3 py-2"><dt className="text-mute">{k(key)}</dt><dd><CopyButton value={v} className="font-mono text-xs text-soft hover:text-paper" /></dd></div>
              ))}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-ink-2 px-3 py-2"><dt className="text-mute">{k('envVars')}</dt><dd dir="ltr" className="font-mono text-xs text-soft">INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET</dd></div>
            </dl>
          )}
        </section>
      )}

      {reachable && !loading && !account && configured && (
        <section className="panel mt-8 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl"><h2 className="font-display text-xl font-semibold">{k('connectTitle')}</h2><p className="mt-1 text-sm text-mute">{k('connectSub')}</p></div>
          <Button size="lg" onClick={connect} loading={busy === 'login'}>{busy !== 'login' && <Camera className="h-5 w-5" />}{k('connectBtn')}</Button>
        </section>
      )}

      {loading && reachable && <div className="mt-10 flex items-center gap-2 text-mute"><Loader2 className="h-4 w-4 animate-spin" />{k('loading')}</div>}

      {account && p && (
        <>
          <section className="panel mt-8 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-4">
              {p.profile_picture_url ? <img src={p.profile_picture_url} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-surface-2" />}
              <div className="min-w-0 flex-1">
                <div dir="ltr" className="font-display text-xl font-semibold rtl:text-end">@{p.username}</div>
                <div className="text-sm text-mute">{[p.followers_count != null && `${p.followers_count.toLocaleString(uiLang)} ${k('followers')}`, p.media_count != null && `${p.media_count.toLocaleString(uiLang)} ${k('postsCount')}`].filter(Boolean).join(' · ')}</div>
                {p.biography && <p className="mt-1 text-sm text-soft" dir="auto">{p.biography}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="subtle" size="sm" onClick={load}><RefreshCw className="h-4 w-4" />{k('refresh')}</Button>
                <Button variant="ghost" size="sm" onClick={disconnect}><Link2Off className="h-4 w-4" />{k('disconnect')}</Button>
              </div>
            </div>
            {account.posts.length > 0 && (
              <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
                {account.posts.slice(0, 12).map((post) => (
                  <a key={post.id} href={post.permalink} target="_blank" rel="noreferrer" className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2" title={post.caption || ''}>
                    {(post.media_url || post.thumbnail_url) && <img src={post.thumbnail_url || post.media_url} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />}
                    {post.like_count != null && <span className="absolute bottom-1 start-1 rounded bg-black/60 px-1.5 text-[10px] text-white">♥ {post.like_count}</span>}
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">{k('ideasTitle')}</h2>
            <p className="mt-1 max-w-2xl text-sm text-mute">{k('ideasSub')}</p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="text-xs text-mute">{k('designWith')}
                <select className="field mt-1 !h-10 !w-auto !py-0 text-sm" value={project?.id || ''} onChange={(e) => setProjectId(e.target.value)}>
                  {projects.map((pr) => <option key={pr.id} value={pr.id}>{pr.input.name}</option>)}
                </select>
              </label>
              <Button onClick={suggest} loading={thinking} disabled={!backend.text || !project}>{!thinking && <Sparkles className="h-4 w-4" />}{ideas ? k('again') : k('suggest')}</Button>
              {!projects.length && <Button variant="outline" to="/create">{t('nav.create')}</Button>}
            </div>
            {!backend.text && <p className="mt-3 text-sm text-champagne">{k('needsText')} <Link to="/settings" className="underline">{t('wf.setup')}</Link></p>}

            {ideas && concept && (
              <div className="mt-8 space-y-6">
                <div className="panel p-5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-display text-lg font-semibold">{k('analysis')}</h3>
                  <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                    {[['niche', ideas.analysis.niche], ['tone', ideas.analysis.tone], ['audience', ideas.analysis.audience], ['opportunity', ideas.analysis.opportunity]].map(([key, v]) => <div key={key}><dt className="text-xs text-mute">{k(key)}</dt><dd className="mt-1 text-soft">{v}</dd></div>)}
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">{ideas.analysis.themes.map((th) => <span key={th} className="rounded-full border border-line-2 px-3 py-1 text-sm">{th}</span>)}</div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {ideas.ideas.map((idea, i) => <IdeaCard key={i} idea={idea} index={i} project={project} concept={concept} lang={lang} busy={busy} run={run} k={k} slug={slugify(p.username)} />)}
                </div>
                <p className="text-xs text-mute"><Download className="me-1 inline h-3 w-3" />{k('note')}</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
