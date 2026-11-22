import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Check } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import Button from '../../components/ui/Button';
import { useI18n } from '../../i18n/I18nContext';
import { useProjects } from '../../store/ProjectsContext';
import { useToast } from '../../components/ui/Toast';
import { generateLogos } from '../../services/ai';
import { downloadLogo } from '../../lib/download';
import { paletteMap } from '../../lib/brand';
import { Heading, DownloadButtons, useAsyncAction } from './shared';

export default function LogoTab({ project, concept, ci }) {
  const { t } = useI18n();
  const { updateConcept } = useProjects();
  const toast = useToast();
  const [busy, run] = useAsyncAction();
  const [explorations, setExplorations] = useState([]);
  const P = paletteMap(concept);
  const name = project.input.name;
  const dir = project.input.language === 'ar' ? 'rtl' : 'ltr';

  const dl = (id, format, variant, layout, logo) => run(`${id}-${format}`, () => downloadLogo({ format, name, concept, variant, layout, logo }));

  const variations = [
    { id: 'light', label: t('studio.onLight'), variant: 'primary', layout: 'horizontal', bg: P.light },
    { id: 'dark', label: t('studio.onDark'), variant: 'inverse', layout: 'horizontal', bg: P.dark },
    { id: 'stacked', label: t('studio.stacked'), variant: 'primary', layout: 'stacked', bg: '#FFFFFF' },
    { id: 'brand', label: t('studio.reversed'), variant: 'onPrimary', layout: 'stacked', bg: P.primary },
    { id: 'icon', label: t('studio.icon'), variant: 'primary', layout: 'icon', bg: P.light },
    { id: 'mono', label: t('studio.mono'), variant: 'mono', layout: 'horizontal', bg: '#FFFFFF' },
    { id: 'wordmark', label: t('studio.wordmark'), variant: 'primary', layout: 'wordmark', bg: P.light },
    { id: 'white', label: t('studio.iconAccent'), variant: 'white', layout: 'icon', bg: P.accent },
    { id: 'emblem', label: t('studio.emblem'), variant: 'primary', layout: 'emblem', bg: P.light },
  ];

  const explore = () => run('explore', async () => setExplorations(await generateLogos(concept, project.input)));
  useEffect(() => { explore(); }, [concept.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const apply = (logo) => {
    updateConcept(project.id, ci, { logo: { ...concept.logo, ...logo } });
    toast(t('common.applied'));
  };

  return (
    <div className="space-y-14">
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="relative flex min-h-[320px] items-center justify-center rounded-[20px] p-10 lg:col-span-2" style={{ background: P.light }}>
          <Logo name={name} concept={concept} className="h-32 w-full max-w-[520px] sm:h-40" />
          <div className="absolute bottom-4 end-4"><DownloadButtons id="primary" busy={busy} onPng={() => dl('primary', 'png', 'primary')} onSvg={() => dl('primary', 'svg', 'primary')} /></div>
        </div>
        <div className="panel flex flex-col p-6">
          <h3 className="font-display text-lg font-semibold">{t('studio.rationale')}</h3>
          <p className="mt-3 leading-relaxed text-soft" dir={dir}>{concept.logo.rationale}</p>
          <div className="mt-auto grid grid-cols-3 gap-2 pt-6">
            {[P.primary, P.dark, P.accent].map((bg, i) => (
              <div key={i} className="flex aspect-square items-center justify-center rounded-xl" style={{ background: bg }}>
                <Logo name={name} concept={concept} layout="icon" variant={i === 2 ? 'white' : 'onPrimary'} className="h-12 w-12" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <Heading title={t('studio.variations')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {variations.map((v) => (
            <div key={v.id} className="group overflow-hidden rounded-2xl border border-line">
              <div className="relative flex h-44 items-center justify-center p-5" style={{ background: v.bg }}>
                <Logo name={name} concept={concept} variant={v.variant} layout={v.layout} className={v.layout === 'icon' ? 'h-20 w-20' : v.layout === 'emblem' ? 'h-32 w-32' : 'h-20 w-full'} />
              </div>
              <div className="flex items-center justify-between gap-2 bg-surface px-3 py-2.5">
                <span className="truncate text-sm text-soft">{v.label}</span>
                <DownloadButtons id={v.id} busy={busy} onPng={() => dl(v.id, 'png', v.variant, v.layout)} onSvg={() => dl(v.id, 'svg', v.variant, v.layout)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Heading title={t('studio.explorations')} sub={t('studio.exploreSub')}
          action={<Button size="sm" onClick={explore} loading={busy === 'explore'}>{busy !== 'explore' && <Sparkles className="h-4 w-4" />}{t('studio.explore')}</Button>} />
        <AnimatePresence>
          {explorations.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {explorations.map((logo, i) => {
                const current = logo.mark === concept.logo.mark && logo.layout === concept.logo.layout && (logo.colorway || 'primary') === (concept.logo.colorway || 'primary');
                return (
                  <motion.div key={`${logo.mark}-${i}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="panel overflow-hidden">
                    <div className="flex h-40 items-center justify-center p-6" style={{ background: P.light }}>
                      <Logo name={name} concept={concept} logo={logo} layout={logo.layout} className={logo.layout === 'emblem' ? 'h-32 w-32' : 'h-20 w-full'} />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3">
                      <p className="line-clamp-2 text-xs leading-relaxed text-mute" dir={dir}>{logo.rationale}</p>
                      <Button size="sm" variant={current ? 'primary' : 'subtle'} onClick={() => apply(logo)} className="shrink-0">{current && <Check className="h-4 w-4" />}{t('common.apply')}</Button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        {!explorations.length && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-[212px] animate-pulse rounded-[20px] bg-surface" />)}</div>
        )}
      </section>
    </div>
  );
}
