import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Search, Star, MoreHorizontal, LayoutGrid, List, Copy, Pencil, Trash2, ExternalLink, RotateCcw } from 'lucide-react';
import Button from '../components/ui/Button';
import Segmented from '../components/ui/Segmented';
import Modal from '../components/ui/Modal';
import Logo from '../components/brand/Logo';
import PaletteStrip from '../components/brand/PaletteStrip';
import { useI18n } from '../i18n/I18nContext';
import { useProjects } from '../store/ProjectsContext';
import { useToast } from '../components/ui/Toast';
import { findCategory } from '../data/options';
import { paletteMap } from '../lib/brand';

function useRelativeTime() {
  const { t, lang } = useI18n();
  return (ts) => {
    const s = (Date.now() - ts) / 1000;
    if (s < 60) return t('time.now');
    if (s < 3600) return `${Math.floor(s / 60)}${t('time.min')}`;
    if (s < 86400) return `${Math.floor(s / 3600)}${t('time.hour')}`;
    if (s < 86400 * 14) return `${Math.floor(s / 86400)}${t('time.day')}`;
    return new Date(ts).toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { day: 'numeric', month: 'short' });
  };
}

function CardMenu({ project, onRename, onDelete }) {
  const { t } = useI18n();
  const { duplicateProject } = useProjects();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  const item = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-soft hover:bg-white/5 hover:text-paper';
  return (
    <div ref={ref} className="relative">
      <button onClick={(e) => { e.preventDefault(); setOpen((o) => !o); }} className="rounded-lg p-1.5 text-mute hover:bg-white/5 hover:text-paper" aria-label={t('nav.menu')} aria-expanded={open}>
        <MoreHorizontal className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
            className="absolute end-0 top-9 z-20 w-44 rounded-xl border border-line-2 bg-surface-2 p-1 shadow-2xl">
            <button className={item} onClick={() => navigate(`/project/${project.id}`)}><ExternalLink className="h-4 w-4" />{t('common.open')}</button>
            <button className={item} onClick={() => { setOpen(false); onRename(); }}><Pencil className="h-4 w-4" />{t('common.rename')}</button>
            <button className={item} onClick={() => { duplicateProject(project.id); setOpen(false); toast(t('dash.duplicated')); }}><Copy className="h-4 w-4" />{t('common.duplicate')}</button>
            <button className={`${item} !text-danger`} onClick={() => { setOpen(false); onDelete(); }}><Trash2 className="h-4 w-4" />{t('common.delete')}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectCard({ project, view, onRename, onDelete }) {
  const { t, pick } = useI18n();
  const { toggleFavorite } = useProjects();
  const rel = useRelativeTime();
  const c = project.concepts[project.selected] || project.concepts[0];
  const P = paletteMap(c);
  const status = (
    <span className={`rounded-full px-2.5 py-0.5 text-xs ${project.status === 'completed' ? 'bg-success/10 text-success' : 'bg-amethyst/15 text-lilac'}`}>{t(`studio.status.${project.status}`)}</span>
  );
  const fav = (
    <button onClick={(e) => { e.preventDefault(); toggleFavorite(project.id); }} aria-label={project.favorite ? t('dash.unfavorite') : t('dash.favorite')} className="rounded-lg p-1.5 text-mute hover:text-champagne">
      <Star className={`h-4 w-4 ${project.favorite ? 'fill-champagne text-champagne' : ''}`} />
    </button>
  );

  if (view === 'list') {
    return (
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="panel flex items-center gap-4 p-3 !rounded-2xl">
        <Link to={`/project/${project.id}`} className="flex h-14 w-24 shrink-0 items-center justify-center rounded-xl p-2 sm:w-32" style={{ background: P.light }}>
          <Logo name={project.input.name} concept={c} className="h-full w-full" />
        </Link>
        <Link to={`/project/${project.id}`} className="min-w-0 flex-1">
          <div className="truncate font-medium" dir="auto">{project.input.name}</div>
          <div className="truncate text-sm text-mute">{pick(findCategory(project.input.category))}</div>
        </Link>
        <PaletteStrip palette={c.palette} className="hidden h-3 w-28 md:flex" />
        <div className="hidden sm:block">{status}</div>
        <span className="hidden w-20 text-end text-xs text-mute lg:block">{rel(project.updatedAt)}</span>
        {fav}
        <CardMenu project={project} onRename={onRename} onDelete={onDelete} />
      </motion.div>
    );
  }

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="panel group flex flex-col overflow-hidden transition-colors hover:border-line-2">
      <Link to={`/project/${project.id}`} className="relative block">
        <div className="flex h-44 items-center justify-center px-8" style={{ background: P.light }}>
          <Logo name={project.input.name} concept={c} className="h-16 w-full max-w-[240px] transition-transform duration-500 group-hover:scale-[1.04]" />
        </div>
        <div className="absolute bottom-3 end-3 flex gap-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: P.primary }}><Logo name={project.input.name} concept={c} layout="icon" variant="onPrimary" className="h-6 w-6" /></span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: P.dark }}><Logo name={project.input.name} concept={c} layout="icon" variant="inverse" className="h-6 w-6" /></span>
        </div>
        <PaletteStrip palette={c.palette} className="h-1.5" rounded="" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/project/${project.id}`} className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold" dir="auto">{project.input.name}</h3>
            <p className="truncate text-sm text-mute">{pick(findCategory(project.input.category))}</p>
          </Link>
          <div className="-me-1.5 flex items-center">{fav}<CardMenu project={project} onRename={onRename} onDelete={onDelete} /></div>
        </div>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-mute">
          {status}
          <span>{t('dash.updated')} {rel(project.updatedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { t } = useI18n();
  const { projects, updateProject, deleteProject, resetSamples } = useProjects();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('updated');
  const [view, setView] = useState(() => { try { return localStorage.getItem('brandora.view') || 'grid'; } catch { return 'grid'; } });
  const [renaming, setRenaming] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [newName, setNewName] = useState('');

  useEffect(() => { try { localStorage.setItem('brandora.view', view); } catch { /* ignore */ } }, [view]);

  const stats = useMemo(() => ({
    total: projects.length,
    completed: projects.filter((p) => p.status === 'completed').length,
    concepts: projects.reduce((n, p) => n + p.concepts.length, 0),
    favorites: projects.filter((p) => p.favorite).length,
  }), [projects]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return projects
      .filter((p) => (filter === 'all' ? true : filter === 'favorites' ? p.favorite : p.status === filter))
      .filter((p) => !s || p.input.name.toLowerCase().includes(s) || p.concepts.some((c) => c.title.toLowerCase().includes(s)))
      .sort((a, b) => (sort === 'name' ? a.input.name.localeCompare(b.input.name) : sort === 'created' ? b.createdAt - a.createdAt : b.updatedAt - a.updatedAt));
  }, [projects, q, filter, sort]);

  const doRename = () => {
    if (newName.trim()) updateProject(renaming.id, (p) => ({ input: { ...p.input, name: newName.trim() } }));
    setRenaming(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.02em]">{t('dash.title')}</h1>
          <p className="mt-2 text-mute">{t('dash.sub')}</p>
        </div>
        <Button to="/create"><Plus className="h-4 w-4" />{t('dash.newBrand')}</Button>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="bg-ink-2 px-5 py-4">
            <dt className="text-sm text-mute">{t(`dash.stats.${k}`)}</dt>
            <dd className="mt-1 font-display text-3xl font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} className="field !ps-10" aria-label={t('common.search')} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="no-scrollbar max-w-full overflow-x-auto">
            <Segmented size="sm" layoutId="dash-filter" value={filter} onChange={setFilter} options={['all', 'progress', 'completed', 'favorites'].map((k) => ({ value: k, label: t(`dash.filters.${k}`) }))} />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="field !h-10 !w-auto !py-0 text-sm" aria-label="Sort">
            {['updated', 'name', 'created'].map((k) => <option key={k} value={k}>{t(`dash.sort.${k}`)}</option>)}
          </select>
          <Segmented size="sm" layoutId="dash-view" value={view} onChange={setView}
            options={[{ value: 'grid', label: <span className="sr-only">{t('dash.grid')}</span>, icon: <LayoutGrid className="h-4 w-4" /> }, { value: 'list', label: <span className="sr-only">{t('dash.list')}</span>, icon: <List className="h-4 w-4" /> }]} />
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-[20px] border border-dashed border-line-2 px-6 py-20 text-center">
          <h2 className="font-display text-2xl font-semibold">{t('dash.emptyAll')}</h2>
          <p className="mt-2 max-w-md text-mute">{t('dash.emptyAllSub')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button to="/create"><Plus className="h-4 w-4" />{t('dash.newBrand')}</Button>
            <Button variant="subtle" onClick={resetSamples}><RotateCcw className="h-4 w-4" />{t('dash.resetSamples')}</Button>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="mt-10 rounded-[20px] border border-dashed border-line-2 px-6 py-16 text-center">
          <h2 className="font-display text-xl font-semibold">{t('dash.emptyTitle')}</h2>
          <p className="mt-2 text-mute">{t('dash.emptySub')}</p>
        </div>
      ) : (
        <motion.div layout className={`mt-6 grid gap-4 ${view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}`}>
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <ProjectCard key={p.id} project={p} view={view}
                onRename={() => { setRenaming(p); setNewName(p.input.name); }}
                onDelete={() => setDeleting(p)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={!!renaming} onClose={() => setRenaming(null)} title={t('common.rename')}>
        <form onSubmit={(e) => { e.preventDefault(); doRename(); }}>
          <label className="text-sm text-mute" htmlFor="rename">{t('dash.renamePrompt')}</label>
          <input id="rename" autoFocus className="field mt-2" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={28} dir="auto" />
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setRenaming(null)}>{t('common.cancel')}</Button>
            <Button type="submit">{t('common.save')}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title={deleting ? `${t('common.delete')} ${deleting.input.name}` : ''}>
        <p className="text-soft">{t('dash.confirmDelete')}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={() => { deleteProject(deleting.id); setDeleting(null); toast(t('dash.deleted')); }}><Trash2 className="h-4 w-4" />{t('common.delete')}</Button>
        </div>
      </Modal>
    </div>
  );
}
