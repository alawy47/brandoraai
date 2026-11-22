import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Pencil, FileDown, CheckCircle2, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import Segmented from '../components/ui/Segmented';
import { useI18n } from '../i18n/I18nContext';
import { useProjects } from '../store/ProjectsContext';
import { findCategory, findPersonality } from '../data/options';
import ConceptsTab from './studio/ConceptsTab';
import LogoTab from './studio/LogoTab';
import IdentityTab from './studio/IdentityTab';
import SocialTab from './studio/SocialTab';
import MockupsTab from './studio/MockupsTab';
import ExportTab from './studio/ExportTab';
import AssetsTab from './studio/AssetsTab';

const TABS = ['concepts', 'logo', 'identity', 'assets', 'social', 'mockups', 'export'];
const VIEWS = { concepts: ConceptsTab, logo: LogoTab, identity: IdentityTab, social: SocialTab, mockups: MockupsTab, export: ExportTab, assets: AssetsTab };

export default function Studio() {
  const { id } = useParams();
  const { t, pick } = useI18n();
  const { getProject, updateProject, toggleFavorite } = useProjects();
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'concepts';
  const setTab = (v) => setParams((p) => { p.set('tab', v); return p; }, { replace: true });
  const project = getProject(id);
  const [ci, setCi] = useState(project?.selected ?? 0);

  useEffect(() => { if (project) setCi(project.selected); }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { window.scrollTo({ top: 0 }); }, [tab]);

  if (!project) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-32 text-center">
        <p className="text-lg text-soft">{t('studio.notFound')}</p>
        <Button className="mt-6" to="/dashboard">{t('studio.toDashboard')}</Button>
      </div>
    );
  }

  const concept = project.concepts[ci];
  const View = VIEWS[tab];
  const selectConcept = (i) => { setCi(i); updateProject(project.id, { selected: i }); };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-paper"><ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t('nav.dashboard')}</Link>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="truncate font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl" dir="auto">{project.input.name}</h1>
            <button onClick={() => toggleFavorite(project.id)} aria-label={project.favorite ? t('dash.unfavorite') : t('dash.favorite')} className="rounded-lg p-1.5 text-mute hover:text-champagne">
              <Star className={`h-5 w-5 ${project.favorite ? 'fill-champagne text-champagne' : ''}`} />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-mute">
            <span>{pick(findCategory(project.input.category))}</span>
            <span className="h-1 w-1 rounded-full bg-line-2" />
            <span>{pick(findPersonality(project.input.personality))}</span>
            <span className="h-1 w-1 rounded-full bg-line-2" />
            <span>{project.input.language === 'ar' ? 'العربية' : 'English'}</span>
            <span className={`ms-1 rounded-full px-2.5 py-0.5 text-xs ${project.status === 'completed' ? 'bg-success/10 text-success' : 'bg-amethyst/15 text-lilac'}`}>{t(`studio.status.${project.status}`)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="subtle" size="sm" to={`/create?from=${project.id}`}><Pencil className="h-4 w-4" />{t('studio.editBrief')}</Button>
          {project.status !== 'completed' && (
            <Button variant="subtle" size="sm" onClick={() => updateProject(project.id, { status: 'completed' })}><CheckCircle2 className="h-4 w-4" />{t('studio.markComplete')}</Button>
          )}
          <Button size="sm" onClick={() => setTab('export')}><FileDown className="h-4 w-4" />{t('studio.pdfBtn')}</Button>
        </div>
      </div>

      {/* Concept switcher + tabs */}
      <div className="sticky top-16 z-30 -mx-4 mt-6 flex flex-col gap-3 border-b border-line bg-ink/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {project.concepts.map((c, i) => (
            <button key={c.id} onClick={() => selectConcept(i)} aria-pressed={ci === i}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-all ${ci === i ? 'border-amethyst/70 bg-amethyst/10 text-paper' : 'border-line text-mute hover:text-soft'}`}>
              <span className="flex -space-x-1 rtl:space-x-reverse">{c.palette.slice(0, 3).map((s) => <span key={s.role} className="h-3.5 w-3.5 rounded-full ring-2 ring-ink" style={{ background: s.hex }} />)}</span>
              <span className="whitespace-nowrap">{c.title}</span>
            </button>
          ))}
        </div>
        <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
          <Segmented size="sm" layoutId="studio-tab" value={tab} onChange={setTab} options={TABS.map((k) => ({ value: k, label: t(`studio.tabs.${k}`) }))} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${tab}-${ci}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="pt-8">
          <View project={project} concept={concept} ci={ci} selectConcept={selectConcept} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
