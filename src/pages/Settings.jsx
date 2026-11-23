import { CheckCircle2, CircleDashed, RefreshCw, Server } from 'lucide-react';
import Button from '../components/ui/Button';
import { useI18n } from '../i18n/I18nContext';
import { apiConfigured, apiUrl, probeBackend } from '../services/ai';
import { useBackend } from '../services/useBackend';

const TASKS = ['text', 'image', 'edit', 'vector', 'fonts'];
const ENV = [
  ['VITE_API_URL', 'build-time, not secret: /'],
  ['ANTHROPIC_API_KEY', 'text'], ['OPENAI_API_KEY', 'text · image · edit'], ['GEMINI_API_KEY', 'text · image · edit'],
  ['VECTORIZER_API_ID / VECTORIZER_API_SECRET', 'vector'], ['GOOGLE_FONTS_API_KEY', 'fonts'],
  ['TEXT_PROVIDERS, IMAGE_PROVIDERS, EDIT_PROVIDERS, VECTOR_PROVIDERS', 'routing order'], ['PRICE_*', 'cost estimates'],
];

function Code({ children }) {
  return <pre dir="ltr" className="overflow-x-auto rounded-xl border border-line bg-ink-2 p-4 text-start text-[13px] leading-relaxed text-soft"><code>{children}</code></pre>;
}

export default function Settings() {
  const { t } = useI18n();
  const k = (key) => t(`settings.${key}`);
  const b = useBackend();
  const data = b.status;
  const keysSet = b.text || b.image || b.edit;
  const tone = b.reachable && keysSet ? 'ok' : b.reachable ? 'warn' : apiConfigured ? 'bad' : 'warn';
  const title = b.checking ? k('checking') : b.reachable ? (keysSet ? k('connected') : k('noKeysTitle')) : apiConfigured ? k('unreachableTitle') : k('sampleMode');
  const sub = b.checking ? '' : b.reachable ? (keysSet ? apiUrl : k('noKeysSub')) : apiConfigured ? b.error : k('sampleModeSub');

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.02em]">{k('title')}</h1>
          <p className="mt-2 max-w-2xl text-mute">{k('sub')}</p>
        </div>
        {apiConfigured && <Button variant="outline" size="sm" onClick={probeBackend} loading={b.checking}>{!b.checking && <RefreshCw className="h-4 w-4" />}{k('refresh')}</Button>}
      </div>

      <div className={`mt-8 flex items-center gap-3 rounded-2xl border px-5 py-4 ${tone === 'ok' ? 'border-success/30 bg-success/[.06]' : tone === 'bad' ? 'border-danger/30 bg-danger/[.06]' : 'border-champagne/25 bg-champagne/[.06]'}`}>
        <Server className={`h-5 w-5 ${tone === 'ok' ? 'text-success' : tone === 'bad' ? 'text-danger' : 'text-champagne'}`} />
        <div className="text-sm">
          <div className="font-medium">{title}</div>
          <div dir="auto" className="text-mute">{sub}</div>
        </div>
      </div>

      {data && (
        <>
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">{k('routing')}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {TASKS.map((task) => (
                <div key={task} className="panel p-4">
                  <div className="text-xs text-mute">{k(`task_${task}`)}</div>
                  <div className="mt-2 space-y-1 text-sm">
                    {(data.routing?.[task] || []).length ? data.routing[task].map((id, i) => <div key={id} className="flex items-center gap-2"><span className="text-xs text-mute">{i + 1}</span>{id}</div>) : <span className="text-danger">{k('none')}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">{k('providers')}</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-surface text-xs text-mute"><tr>{['provider', 'models', 'calls', 'failures', 'avgMs', 'cost'].map((h) => <th key={h} className="px-4 py-3 text-start font-medium">{k(`col_${h}`)}</th>)}</tr></thead>
                <tbody className="divide-y divide-line">
                  {data.providers.map((p) => {
                    const u = data.usage[p.id] || {};
                    return (
                      <tr key={p.id}>
                        <td className="px-4 py-3"><span className="flex items-center gap-2">{p.configured ? <CheckCircle2 className="h-4 w-4 text-success" /> : <CircleDashed className="h-4 w-4 text-mute" />}{p.label}{p.coolingDown && <span className="rounded bg-danger/15 px-1.5 text-xs text-danger">{k('cooling')}</span>}</span></td>
                        <td dir="ltr" className="px-4 py-3 text-xs text-mute">{Object.entries(p.models).map(([kk, v]) => `${kk}: ${v}`).join(', ')}</td>
                        <td className="px-4 py-3 tabular-nums">{u.calls || 0}</td>
                        <td className="px-4 py-3 tabular-nums">{u.failures || 0}</td>
                        <td className="px-4 py-3 tabular-nums">{u.avgMs ? `${u.avgMs} ms` : '–'}</td>
                        <td className="px-4 py-3 tabular-nums">{u.calls ? `$${(u.costUsd || 0).toFixed(4)}${u.costUnknown ? ` + ${u.costUnknown} ${k('unpriced')}` : ''}` : '–'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-mute">{k('cache')}: {data.cache.hits} {k('hits')}, {data.cache.shared} {k('shared')}. {k('jobs')}: {data.jobs.running} {k('running')}, {data.jobs.queued} {k('queued')}.</p>
          </section>
        </>
      )}

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">{k('setupTitle')}</h2>
        <h3 className="mt-6 font-medium">{k('netlifyTitle')}</h3>
        <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-relaxed text-soft">
          {['n1', 'n2', 'n3', 'n4', 'n5'].map((x) => <li key={x}>{k(x)}</li>)}
        </ol>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm"><tbody className="divide-y divide-line">
            {ENV.map(([name, role]) => <tr key={name}><td dir="ltr" className="px-4 py-2.5 font-mono text-xs text-soft">{name}</td><td className="px-4 py-2.5 text-xs text-mute">{role}</td></tr>)}
          </tbody></table>
        </div>
        <p className="mt-2 text-xs text-mute">{k('step2Note')}</p>

        <h3 className="mt-10 font-medium">{k('otherTitle')}</h3>
        <p className="mt-2 text-sm text-mute">{k('otherSub')}</p>
        <div className="mt-3"><Code>{'cd server && npm install && cp .env.example .env\nnode --env-file=.env index.js\n\n# project root .env\nVITE_API_URL=http://localhost:8787'}</Code></div>
      </section>
    </div>
  );
}
