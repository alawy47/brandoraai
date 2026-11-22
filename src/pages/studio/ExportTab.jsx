import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, FileDown, FileImage, Package } from 'lucide-react';
import Button from '../../components/ui/Button';
import Logo from '../../components/brand/Logo';
import BrandBook, { PAGE_W, PAGE_H } from '../../components/export/BrandBook';
import ScaledFrame from '../../components/social/ScaledFrame';
import { useI18n } from '../../i18n/I18nContext';
import { useToast } from '../../components/ui/Toast';
import { useProjects } from '../../store/ProjectsContext';
import { downloadLogo, downloadBlob } from '../../lib/download';
import { descriptorFor } from '../../lib/logoDirections';
import { slugify } from '../../lib/generator';
import { paletteMap } from '../../lib/brand';
import { DownloadButtons, Heading, useAsyncAction } from './shared';

const PAGES = 9;
const waitFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 400)));

/** Brand guideline viewer: the same pages as the PDF, one at a time. */
function GuidelineViewer({ project, concept, k }) {
  const [page, setPage] = useState(0);
  return (
    <div className="panel overflow-hidden">
      <div className="bg-ink-2 p-4">
        <ScaledFrame width={PAGE_W} height={PAGE_H} className="rounded-lg shadow-2xl">
          <div style={{ transform: `translateY(${-page * (PAGE_H + 20)}px)` }}><BrandBook project={project} concept={concept} /></div>
        </ScaledFrame>
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
        <Button size="icon" variant="ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label={k('prev')}><ChevronLeft className="h-4 w-4 rtl:rotate-180" /></Button>
        <div className="flex gap-1.5">
          {Array.from({ length: PAGES }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} aria-label={`${k('page')} ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === page ? 'w-6 bg-lilac' : 'w-1.5 bg-line-2 hover:bg-mute'}`} />
          ))}
        </div>
        <Button size="icon" variant="ghost" onClick={() => setPage((p) => Math.min(PAGES - 1, p + 1))} disabled={page === PAGES - 1} aria-label={k('next')}><ChevronRight className="h-4 w-4 rtl:rotate-180" /></Button>
      </div>
    </div>
  );
}

export default function ExportTab({ project, concept }) {
  const { t } = useI18n();
  const k = (key) => t(`studio.ex.${key}`);
  const toast = useToast();
  const { updateProject } = useProjects();
  const [busy, run] = useAsyncAction();
  const [job, setJob] = useState(null); // { kind: 'pdf' | 'zip', step, total }
  const bookRef = useRef(null);
  const P = paletteMap(concept);
  const name = project.input.name;
  const slug = slugify(name);
  const descriptor = descriptorFor(project);

  const renderPdf = async (save) => {
    await waitFrame();
    if (!bookRef.current) throw new Error('The guideline pages did not render. Reload the page and try again.');
    const { exportBrandBook } = await import('../../lib/exportPdf');
    return exportBrandBook(bookRef.current, { name, save, onProgress: (step, total) => setJob((j) => ({ ...j, step, total })) });
  };

  const exportPdf = async () => {
    setJob({ kind: 'pdf', step: 0, total: PAGES });
    try {
      await renderPdf(true);
      updateProject(project.id, { status: 'completed', exported: true });
      toast(t('studio.pdfDone'));
    } catch (e) { console.error(e); toast(e.message || 'PDF export failed. Try again.', 'error'); } finally { setJob(null); }
  };

  const exportZip = async () => {
    setJob({ kind: 'zip', step: 0, total: PAGES, label: k('stepPdf') });
    try {
      const pdfBlob = await renderPdf(false);
      const { buildBrandPackage } = await import('../../lib/exportPackage');
      const blob = await buildBrandPackage({ project, concept, pdfBlob, onProgress: (step, total) => setJob({ kind: 'zip', step, total, label: k('stepFiles') }) });
      downloadBlob(blob, `${slug}-brand-package.zip`);
      updateProject(project.id, { status: 'completed', exported: true });
      toast(k('zipDone'));
    } catch (e) { console.error(e); toast(e.message || 'Package export failed. Try again.', 'error'); } finally { setJob(null); }
  };

  const files = [
    { id: 'p', label: k('primary'), layout: undefined, variant: 'primary', bg: P.light },
    { id: 'h', label: t('studio.horizontal'), layout: 'horizontal', variant: 'primary', bg: P.light },
    { id: 's', label: t('studio.stacked'), layout: 'stacked', variant: 'primary', bg: P.light },
    { id: 'i', label: t('studio.icon'), layout: 'icon', variant: 'primary', bg: P.light },
    { id: 'd', label: t('studio.onDark'), layout: undefined, variant: 'inverse', bg: P.dark },
    { id: 'm', label: t('studio.mono'), layout: undefined, variant: 'mono', bg: '#FFFFFF' },
  ];
  const progress = job ? `${job.step}/${job.total}` : '';

  return (
    <div className="space-y-14">
      <section className="grid gap-4 lg:grid-cols-2">
        {/* ZIP package */}
        <div className="panel flex flex-col p-6">
          <div className="flex items-center gap-2"><Package className="h-5 w-5 text-lilac" /><h2 className="font-display text-xl font-semibold">{k('zipTitle')}</h2></div>
          <p className="mt-2 text-sm leading-relaxed text-mute">{k('zipDesc')}</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-soft">
            {['incLogos', 'incIcons', 'incPalette', 'incType', 'incBg', 'incPdf'].map((x) => <li key={x} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lilac" />{k(x)}</li>)}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
            <Button size="lg" onClick={exportZip} loading={job?.kind === 'zip'} disabled={!!job}>{job?.kind !== 'zip' && <Package className="h-5 w-5" />}{job?.kind === 'zip' ? `${job.label} ${progress}` : k('zipBtn')}</Button>
            {job?.kind === 'zip' && <div className="h-1.5 w-40 overflow-hidden rounded-full bg-line"><div className="h-full bg-lilac transition-all" style={{ width: `${(job.step / job.total) * 100}%` }} /></div>}
          </div>
        </div>
        {/* PDF only */}
        <div className="panel flex flex-col p-6">
          <div className="flex items-center gap-2"><FileDown className="h-5 w-5 text-lilac" /><h2 className="font-display text-xl font-semibold">{t('studio.pdfTitle')}</h2></div>
          <p className="mt-2 text-sm leading-relaxed text-mute">{t('studio.pdfDesc')}</p>
          <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
            <Button size="lg" variant="subtle" onClick={exportPdf} loading={job?.kind === 'pdf'} disabled={!!job}>{job?.kind !== 'pdf' && <FileDown className="h-5 w-5" />}{job?.kind === 'pdf' ? `${t('studio.pdfWorking')} ${progress}` : t('studio.pdfBtn')}</Button>
          </div>
        </div>
      </section>

      <section>
        <Heading title={k('viewerTitle')} sub={k('viewerSub')} />
        <GuidelineViewer project={project} concept={concept} k={k} />
      </section>

      <section>
        <Heading title={t('studio.logoFiles')} sub={t('studio.logoFilesDesc')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
              <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg p-1.5" style={{ background: f.bg }}>
                <Logo name={name} concept={concept} layout={f.layout} variant={f.variant} descriptor={descriptor} className="h-full w-full" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{f.label}</span>
              <DownloadButtons id={f.id} busy={busy}
                onPng={() => run(`${f.id}-png`, () => downloadLogo({ format: 'png', name, concept, layout: f.layout, variant: f.variant, descriptor }))}
                onSvg={() => run(`${f.id}-svg`, () => downloadLogo({ format: 'svg', name, concept, layout: f.layout, variant: f.variant, descriptor }))} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-ink-2 p-3 text-xs text-mute"><FileImage className="mt-0.5 h-4 w-4 shrink-0" />{t('studio.otherFiles')}</div>
      </section>

      {job && createPortal(
        <div aria-hidden style={{ position: 'fixed', top: 0, left: -20000, pointerEvents: 'none' }}>
          <BrandBook ref={bookRef} project={project} concept={concept} />
        </div>,
        document.body,
      )}
    </div>
  );
}
