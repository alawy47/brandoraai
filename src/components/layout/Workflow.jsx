import { Link } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useBackend } from '../../services/useBackend';

/** The nine workflow steps. Each links to where the work happens and shows whether it is done. */
export function WorkflowSteps({ project, concept, onTab }) {
  const { t } = useI18n();
  const v = project.visited || [];
  const steps = [
    { id: 'brief', done: true, to: `/create?from=${project.id}` },
    { id: 'creative', done: !!project.brief, tab: 'concepts' },
    { id: 'directions', done: project.concepts.length > 0, tab: 'concepts' },
    { id: 'logos', done: !!concept.logoConcepts, tab: 'logo' },
    { id: 'select', done: !!concept.logo?.style, tab: 'logo' },
    { id: 'refine', done: !!concept.logo?.edited, tab: 'logo' },
    { id: 'identity', done: v.includes('identity') || v.includes('assets'), tab: 'identity' },
    { id: 'mockups', done: v.includes('mockups'), tab: 'mockups' },
    { id: 'export', done: !!project.exported, tab: 'export' },
  ];
  const next = steps.find((s) => !s.done);
  return (
    <ol className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" aria-label={t('wf.label')}>
      {steps.map((s, i) => {
        const current = s === next;
        const cls = `group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs transition-colors ${current ? 'border-amethyst/70 bg-amethyst/10 text-paper' : s.done ? 'border-line text-soft hover:text-paper' : 'border-line/60 text-mute hover:text-soft'}`;
        const inner = (
          <>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${s.done ? 'bg-amethyst text-white' : current ? 'border border-lilac text-lilac' : 'border border-line-2'}`}>{s.done ? <Check className="h-3 w-3" /> : i + 1}</span>
            {t(`wf.${s.id}`)}
          </>
        );
        return <li key={s.id}>{s.to ? <Link to={s.to} className={cls}>{inner}</Link> : <button onClick={() => onTab(s.tab)} className={cls}>{inner}</button>}</li>;
      })}
    </ol>
  );
}

/** Shown whenever results come from the built-in sample engine instead of an AI model. */
export function SampleNotice({ className = '' }) {
  const { t } = useI18n();
  const b = useBackend();
  if (b.checking || b.text) return null; // checking, or a language model is connected
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-champagne/25 bg-champagne/[.06] px-4 py-2.5 text-xs text-soft sm:text-sm ${className}`}>
      <Info className="hidden h-4 w-4 shrink-0 text-champagne sm:block" />
      <span className="min-w-0 basis-full sm:basis-auto sm:flex-1">{b.reachable ? t('wf.noKeys') : t('wf.sample')}</span>
      <Link to="/settings" className="font-medium text-champagne hover:underline">{t('wf.setup')}</Link>
    </div>
  );
}
