import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Loader2, Wand2, X, Pipette } from 'lucide-react';
import Button from '../components/ui/Button';
import Segmented from '../components/ui/Segmented';
import Icon from '../components/ui/Icon';
import { useI18n } from '../i18n/I18nContext';
import { useProjects } from '../store/ProjectsContext';
import { useToast } from '../components/ui/Toast';
import { CATEGORIES, PERSONALITIES, COLOR_FAMILIES, AUDIENCE_SUGGESTIONS } from '../data/options';
import { GENERATION_STEPS } from '../lib/generator';
import { generateBrand, apiConfigured } from '../services/ai';
import { SampleNotice } from '../components/layout/Workflow';

function Field({ label, hint, error, children, htmlFor }) {
  return (
    <div className="border-t border-line py-7 first:border-t-0 first:pt-0">
      <label htmlFor={htmlFor} className="block font-display text-[17px] font-semibold">{label}</label>
      {hint && <p className="mt-1 text-sm text-mute">{hint}</p>}
      <div className="mt-4">{children}</div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

// The server reports progress only at the start and the end of an AI call, which can take a minute. So the screen also
// advances with elapsed time on an easing curve: quick at first, slower later, and never finished until the result arrives.
function useElapsed(active) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!active) { setSec(0); return undefined; }
    const t0 = Date.now();
    const id = setInterval(() => setSec((Date.now() - t0) / 1000), 400);
    return () => clearInterval(id);
  }, [active]);
  return sec;
}

function GeneratingOverlay({ open, step: reported, lang, t }) {
  const steps = GENERATION_STEPS[lang];
  const elapsed = useElapsed(open && apiConfigured);
  const eased = 1 - Math.exp(-elapsed / 32);
  const timeStep = Math.min(steps.length - 2, Math.floor((steps.length - 1) * eased));
  const step = Math.max(reported, timeStep);
  const fraction = Math.max((step + 1) / steps.length, elapsed ? 0.05 + 0.9 * (1 - Math.exp(-elapsed / 38)) : 0);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="panel w-full max-w-md p-7">
            <div className="relative mx-auto mb-6 h-20 w-20">
              <motion.div className="absolute inset-0 rounded-full border-2 border-amethyst/25 border-t-amethyst" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }} />
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-amethyst/10"><Wand2 className="h-7 w-7 text-lilac" /></div>
            </div>
            <h2 className="text-center font-display text-2xl font-semibold">{t('create.generatingTitle')}</h2>
            <p className="mt-1 text-center text-sm text-mute">{t('create.generatingSub')}</p>
            <ol className="mt-7 space-y-2.5">
              {steps.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 text-sm transition-colors ${i < step ? 'text-soft' : i === step ? 'text-paper' : 'text-mute/50'}`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full ${i < step ? 'bg-amethyst text-white' : 'border border-line-2'}`}>
                    {i < step ? <Check className="h-3 w-3" /> : i === step ? <Loader2 className="h-3 w-3 animate-spin text-lilac" /> : null}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-6 h-1 overflow-hidden rounded-full bg-line">
              <motion.div className="h-full bg-gradient-to-r from-amethyst-deep to-lilac rtl:bg-gradient-to-l" animate={{ width: `${Math.min(100, fraction * 100)}%` }} transition={{ ease: 'easeOut', duration: 0.5 }} />
            </div>
            {elapsed > 70 && step < steps.length && <p className="mt-4 text-center text-xs text-mute">{t('create.generatingSlow')}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Create() {
  const { t, lang, pick } = useI18n();
  const { createProject, updateProject, getProject } = useProjects();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = params.get('from');
  const existing = from ? getProject(from) : null;

  const [form, setForm] = useState(() => existing?.input ?? {
    name: '', category: '', audience: '', personality: '', colors: [], customColor: '', language: lang, description: '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const toggleColor = (id) => set('colors', form.colors.includes(id) ? form.colors.filter((c) => c !== id) : form.colors.length >= 3 ? [...form.colors.slice(1), id] : [...form.colors, id]);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = t('create.nameErr');
    if (!form.category) errs.category = t('create.categoryErr');
    if (!form.personality) errs.personality = t('create.personalityErr');
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setBusy(true);
    try {
      const input = { ...form, name: form.name.trim() };
      const { seed, concepts, brief } = await generateBrand(input, { onStep: setStep });
      setStep(7);
      let id = existing?.id;
      if (existing) updateProject(existing.id, { input, concepts, seed, brief, selected: 0 });
      else id = createProject(input, concepts, seed, { brief });
      navigate(`/project/${id}`);
    } catch (err) {
      toast(err.message, 'error');
      setBusy(false);
    }
  };

  const summary = useMemo(() => [
    [t('create.name'), form.name],
    [t('create.category'), form.category && pick(CATEGORIES.find((c) => c.id === form.category))],
    [t('create.audience'), form.audience],
    [t('create.personality'), form.personality && pick(PERSONALITIES.find((p) => p.id === form.personality))],
    [t('create.language'), form.language === 'ar' ? 'العربية' : 'English'],
  ], [form, t, pick]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">{t('create.title')}</h1>
        <p className="mt-3 text-lg text-mute">{t('create.sub')}</p>
      </div>
      <SampleNotice className="mt-6 max-w-3xl" />

      <form onSubmit={submit} noValidate className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="panel p-5 sm:p-8">
          <Field label={t('create.name')} error={errors.name} htmlFor="f-name">
            <input id="f-name" className="field text-lg" placeholder={t('create.namePh')} value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={28} autoComplete="off" dir="auto" />
          </Field>

          <Field label={t('create.category')} error={errors.category}>
            <div id="f-category" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map((c) => {
                const on = form.category === c.id;
                return (
                  <button type="button" key={c.id} onClick={() => set('category', c.id)} aria-pressed={on}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-start text-sm transition-all ${on ? 'border-amethyst bg-amethyst/10 text-paper' : 'border-line bg-ink-2 text-soft hover:border-line-2'}`}>
                    <Icon name={c.icon} className={`h-4 w-4 shrink-0 ${on ? 'text-lilac' : 'text-mute'}`} />
                    <span className="leading-tight">{pick(c)}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label={t('create.audience')} htmlFor="f-audience">
            <input id="f-audience" className="field" placeholder={t('create.audiencePh')} value={form.audience} onChange={(e) => set('audience', e.target.value)} dir="auto" />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-mute">{t('create.audienceHint')}</span>
              {AUDIENCE_SUGGESTIONS[form.language === 'ar' ? 'ar' : 'en'].map((a) => (
                <button type="button" key={a} onClick={() => set('audience', a)} className="rounded-full border border-line px-3 py-1 text-xs text-soft transition-colors hover:border-lilac/50 hover:text-paper">{a}</button>
              ))}
            </div>
          </Field>

          <Field label={t('create.personality')} error={errors.personality}>
            <div id="f-personality" className="grid gap-2 sm:grid-cols-2">
              {PERSONALITIES.map((p) => {
                const on = form.personality === p.id;
                return (
                  <button type="button" key={p.id} onClick={() => set('personality', p.id)} aria-pressed={on}
                    className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-start transition-all ${on ? 'border-amethyst bg-amethyst/10' : 'border-line bg-ink-2 hover:border-line-2'}`}>
                    <span>
                      <span className="block font-medium" style={{ fontFamily: `'${lang === 'ar' ? p.headingAr[0] : p.heading[0]}'` }}>{pick(p)}</span>
                      <span className="mt-0.5 block text-sm text-mute">{pick(p.desc)}</span>
                    </span>
                    <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${on ? 'border-amethyst bg-amethyst' : 'border-line-2'}`}>{on && <Check className="h-3 w-3 text-white" />}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label={t('create.colors')} hint={t('create.colorsHint')}>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_FAMILIES.map((c) => {
                const on = form.colors.includes(c.id);
                return (
                  <button type="button" key={c.id} onClick={() => toggleColor(c.id)} aria-pressed={on}
                    className={`flex items-center gap-2 rounded-full border py-1.5 pe-3.5 ps-1.5 text-sm transition-all ${on ? 'border-lilac/70 bg-white/[.06] text-paper' : 'border-line text-soft hover:border-line-2'}`}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-white/10" style={{ background: c.swatch }}>{on && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}</span>
                    {pick(c)}
                  </button>
                );
              })}
              <label className={`flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pe-3.5 ps-1.5 text-sm transition-all ${form.customColor ? 'border-lilac/70 bg-white/[.06]' : 'border-line text-soft hover:border-line-2'}`}>
                <span className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10" style={{ background: form.customColor || 'conic-gradient(#f43f5e,#f59e0b,#22c55e,#3b82f6,#a855f7,#f43f5e)' }}>
                  {!form.customColor && <Pipette className="h-3 w-3 text-white" />}
                  <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={form.customColor || '#9B6BFF'} onChange={(e) => set('customColor', e.target.value.toUpperCase())} aria-label={t('create.custom')} />
                </span>
                <span dir="ltr">{form.customColor || t('create.custom')}</span>
                {form.customColor && <button type="button" onClick={(e) => { e.preventDefault(); set('customColor', ''); }} className="text-mute hover:text-paper" aria-label={t('create.clearColors')}><X className="h-3.5 w-3.5" /></button>}
              </label>
            </div>
          </Field>

          <Field label={t('create.language')} hint={t('create.languageHint')}>
            <Segmented layoutId="lang-seg" value={form.language} onChange={(v) => set('language', v)} options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} />
          </Field>

          <Field label={t('create.description')} htmlFor="f-desc">
            <textarea id="f-desc" rows={3} className="field resize-none" placeholder={t('create.descriptionPh')} value={form.description} onChange={(e) => set('description', e.target.value)} dir="auto" />
          </Field>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-6">
            <h2 className="font-display text-lg font-semibold">{t('create.summary')}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {summary.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line pb-3">
                  <dt className="text-mute">{k}</dt>
                  <dd className={`truncate text-end ${v ? 'text-paper' : 'text-mute/50'}`} dir="auto">{v || t('create.empty')}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex h-10 overflow-hidden rounded-lg border border-line">
              {[...(form.customColor ? [form.customColor] : []), ...form.colors.map((id) => COLOR_FAMILIES.find((c) => c.id === id).swatch)].map((hex, i) => <span key={i} className="flex-1" style={{ background: hex }} />)}
              {!form.customColor && !form.colors.length && <span className="flex flex-1 items-center justify-center bg-ink-2 text-xs text-mute">{t('create.colors')}</span>}
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full" loading={busy}>{!busy && <Wand2 className="h-5 w-5" />}{t('create.generate')}</Button>
          </div>
        </aside>
      </form>
      <GeneratingOverlay open={busy} step={step} lang={lang} t={t} />
    </div>
  );
}
