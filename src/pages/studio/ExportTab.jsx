import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileDown, FileImage, Images } from 'lucide-react';
import Button from '../../components/ui/Button';
import Logo from '../../components/brand/Logo';
import BrandBook from '../../components/export/BrandBook';
import { useI18n } from '../../i18n/I18nContext';
import { useToast } from '../../components/ui/Toast';
import { useProjects } from '../../store/ProjectsContext';
import { downloadLogo } from '../../lib/download';
import { paletteMap } from '../../lib/brand';
import { DownloadButtons, useAsyncAction } from './shared';

export default function ExportTab({ project, concept }) {
  const { t } = useI18n();
  const toast = useToast();
  const { updateProject } = useProjects();
  const [busy, run] = useAsyncAction();
  const [pdf, setPdf] = useState(null); // { page, total } while exporting
  const bookRef = useRef(null);
  const P = paletteMap(concept);
  const name = project.input.name;

  const exportPdf = async () => {
    setPdf({ page: 0, total: 8 });
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 400)));
    try {
      const { exportBrandBook } = await import('../../lib/exportPdf');
      if (!bookRef.current) throw new Error('Brand book did not render');
      await exportBrandBook(bookRef.current, { name, onProgress: (page, total) => setPdf({ page, total }) });
      updateProject(project.id, { status: 'completed' });
      toast(t('studio.pdfDone'));
    } catch (e) {
      console.error(e);
      toast('PDF export failed. Reload the page and try again.', 'error');
    } finally {
      setPdf(null);
    }
  };

  const files = [
    { id: 'h', label: t('studio.horizontal'), layout: 'horizontal', variant: 'primary', bg: P.light },
    { id: 's', label: t('studio.stacked'), layout: 'stacked', variant: 'primary', bg: P.light },
    { id: 'i', label: t('studio.icon'), layout: 'icon', variant: 'primary', bg: P.light },
    { id: 'd', label: t('studio.onDark'), layout: 'horizontal', variant: 'inverse', bg: P.dark },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="panel overflow-hidden lg:col-span-3">
        <div className="relative flex h-72 items-center justify-center overflow-hidden" style={{ background: `linear-gradient(150deg, ${P.primary}, ${P.dark})` }}>
          {[2, 1, 0].map((k) => (
            <div key={k} className="absolute flex aspect-[297/210] w-[52%] items-center justify-center rounded-md shadow-2xl"
              style={{ background: k === 0 ? P.dark : k === 1 ? P.light : P.secondary, transform: `translate(${k * 22}px, ${k * -16}px) rotate(${k * 2.5}deg)` }}>
              {k === 0 && <Logo name={name} concept={concept} variant="inverse" layout="stacked" className="h-24 w-48" />}
            </div>
          ))}
        </div>
        <div className="p-6">
          <h2 className="font-display text-2xl font-semibold">{t('studio.pdfTitle')}</h2>
          <p className="mt-2 max-w-lg text-mute">{t('studio.pdfDesc')}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={exportPdf} loading={!!pdf}>{!pdf && <FileDown className="h-5 w-5" />}{pdf ? `${t('studio.pdfWorking')} ${pdf.page}/${pdf.total}` : t('studio.pdfBtn')}</Button>
            {pdf && <div className="h-1.5 w-40 overflow-hidden rounded-full bg-line"><div className="h-full bg-lilac transition-all" style={{ width: `${(pdf.page / pdf.total) * 100}%` }} /></div>}
          </div>
        </div>
      </div>

      <div className="panel p-6 lg:col-span-2">
        <div className="flex items-center gap-2"><FileImage className="h-5 w-5 text-lilac" /><h2 className="font-display text-lg font-semibold">{t('studio.logoFiles')}</h2></div>
        <p className="mt-1 text-sm text-mute">{t('studio.logoFilesDesc')}</p>
        <ul className="mt-5 divide-y divide-line">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-3">
              <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg p-1.5" style={{ background: f.bg }}>
                <Logo name={name} concept={concept} layout={f.layout} variant={f.variant} className="h-full w-full" />
              </span>
              <span className="flex-1 text-sm">{f.label}</span>
              <DownloadButtons id={f.id} busy={busy}
                onPng={() => run(`${f.id}-png`, () => downloadLogo({ format: 'png', name, concept, layout: f.layout, variant: f.variant }))}
                onSvg={() => run(`${f.id}-svg`, () => downloadLogo({ format: 'svg', name, concept, layout: f.layout, variant: f.variant }))} />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-ink-2 p-3 text-xs text-mute"><Images className="mt-0.5 h-4 w-4 shrink-0" />{t('studio.otherFiles')}</div>
      </div>

      {pdf && createPortal(
        <div aria-hidden style={{ position: 'fixed', top: 0, left: -20000, pointerEvents: 'none' }}>
          <BrandBook ref={bookRef} project={project} concept={concept} />
        </div>,
        document.body,
      )}
    </div>
  );
}
