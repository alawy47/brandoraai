import { useState } from 'react';
import { Check, Copy, Download, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useToast } from '../../components/ui/Toast';

export function Heading({ title, sub, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.01em]">{title}</h2>
        {sub && <p className="mt-1 max-w-xl text-sm text-mute">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function useAsyncAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(null);
  const run = async (key, fn, okMsg) => {
    setBusy(key);
    try { await fn(); if (okMsg) toast(okMsg); } catch (e) { console.error(e); toast(e.message || 'Export failed. Try again.', 'error'); } finally { setBusy(null); }
  };
  return [busy, run];
}

export function DownloadButtons({ onPng, onSvg, busy, id }) {
  const btn = 'inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-ink/60 px-2.5 text-xs font-medium text-soft backdrop-blur transition-colors hover:border-lilac/50 hover:text-paper disabled:opacity-50';
  return (
    <div className="flex gap-1.5">
      {onPng && <button className={btn} onClick={onPng} disabled={!!busy}>{busy === `${id}-png` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}PNG</button>}
      {onSvg && <button className={btn} onClick={onSvg} disabled={!!busy}>{busy === `${id}-svg` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}SVG</button>}
    </div>
  );
}

export function CopyButton({ value, label, className = '' }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); } catch { /* clipboard blocked */ }
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };
  return (
    <button onClick={copy} className={`inline-flex items-center gap-1.5 transition-colors ${className}`} aria-label={`${t('common.copy')} ${label || value}`}>
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 opacity-60" />}
      <span dir="ltr">{done ? t('common.copied') : label || value}</span>
    </button>
  );
}
