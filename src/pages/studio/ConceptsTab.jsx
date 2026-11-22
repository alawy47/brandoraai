import { RefreshCw, Check } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import PaletteStrip from '../../components/brand/PaletteStrip';
import Button from '../../components/ui/Button';
import { useI18n } from '../../i18n/I18nContext';
import { useProjects } from '../../store/ProjectsContext';
import { useToast } from '../../components/ui/Toast';
import { generateBrand } from '../../services/ai';
import { paletteMap, brandFonts } from '../../lib/brand';
import { useAsyncAction } from './shared';

export default function ConceptsTab({ project, concept, ci, selectConcept }) {
  const { t } = useI18n();
  const { updateProject } = useProjects();
  const toast = useToast();
  const [busy, run] = useAsyncAction();
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const f = brandFonts(concept, lang);
  const P = paletteMap(concept);

  const regenerate = () => run('regen', async () => {
    const { seed, concepts } = await generateBrand(project.input);
    updateProject(project.id, { concepts, seed, selected: 0 });
    selectConcept(0);
    toast(t('studio.regenerate'));
  });

  return (
    <div className="space-y-14">
      <div>
        <div className="mb-5 flex justify-end">
          <Button variant="outline" size="sm" onClick={regenerate} loading={busy === 'regen'}>{busy !== 'regen' && <RefreshCw className="h-4 w-4" />}{busy === 'regen' ? t('studio.regenerating') : t('studio.regenerate')}</Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {project.concepts.map((c, i) => {
            const cp = paletteMap(c);
            const active = i === ci;
            return (
              <article key={c.id} className={`panel flex flex-col overflow-hidden transition-colors ${active ? '!border-amethyst/70 ring-1 ring-amethyst/30' : ''}`}>
                <button onClick={() => selectConcept(i)} className="flex h-48 items-center justify-center px-8" style={{ background: cp.light }} aria-label={c.title}>
                  <Logo name={project.input.name} concept={c} className="h-20 w-full max-w-[280px]" />
                </button>
                <PaletteStrip palette={c.palette} className="h-2.5" rounded="" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs text-mute">{t('studio.concept')} {i + 1}</span>
                      <h3 className="font-display text-xl font-semibold">{c.title}</h3>
                    </div>
                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs text-success">{c.match}% {t('studio.match')}</span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-mute" dir={dir}>{c.summary}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 text-xs text-soft">
                    <span className="truncate">{lang === 'ar' ? c.fonts.headingAr : c.fonts.heading} + {lang === 'ar' ? c.fonts.bodyAr : c.fonts.body}</span>
                  </div>
                  <Button className="mt-4 w-full" variant={active ? 'primary' : 'subtle'} size="sm" onClick={() => selectConcept(i)}>
                    {active && <Check className="h-4 w-4" />}{active ? t('studio.chosen') : t('studio.choose')}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Strategy for the selected concept, written in the brand language */}
      <section dir={dir} className="grid gap-4 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-[20px] p-8 sm:p-10 lg:col-span-3" style={{ background: P.primary, color: P.light }}>
          <span className="text-sm opacity-70">{t('studio.tagline')}</span>
          <p className="mt-4 text-4xl font-bold leading-[1.2] sm:text-5xl" style={{ fontFamily: f.heading }}>{concept.tagline}</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h4 className="text-sm opacity-70">{t('studio.story')}</h4>
              <p className="mt-2 leading-relaxed" style={{ fontFamily: f.body }}>{concept.story}</p>
            </div>
            <div>
              <h4 className="text-sm opacity-70">{t('studio.mission')}</h4>
              <p className="mt-2 leading-relaxed" style={{ fontFamily: f.body }}>{concept.mission}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 lg:col-span-2">
          <div className="panel p-6">
            <h4 className="text-sm text-mute">{t('studio.values')}</h4>
            <ul className="mt-3 space-y-2">
              {concept.values.map((v) => <li key={v} className="flex items-center gap-3 font-display text-xl"><span className="h-2 w-2 rounded-full" style={{ background: P.accent }} />{v}</li>)}
            </ul>
          </div>
          <div className="panel p-6">
            <h4 className="text-sm text-mute">{t('studio.voice')}</h4>
            <div className="mt-3 flex flex-wrap gap-2">{concept.voice.traits.map((v) => <span key={v} className="rounded-full border border-line-2 px-3 py-1 text-sm">{v}</span>)}</div>
            <h4 className="mt-5 text-sm text-mute">{t('studio.voiceSample')}</h4>
            <p className="mt-1 text-lg text-soft">“{concept.voice.sample}”</p>
          </div>
        </div>
      </section>
    </div>
  );
}
