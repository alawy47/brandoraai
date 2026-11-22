import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import { slugify } from './generator';
import { withSvgFontProbe } from './download';

const PAGE_W = 1123, PAGE_H = 794;

// Captures each [data-pdf-page] node and assembles a landscape A4 PDF.
/** @returns {Promise<Blob>} the PDF; also saved to disk unless save is false */
export async function exportBrandBook(container, { name, onProgress, save = true } = {}) {
  await document.fonts?.ready;
  await new Promise((r) => setTimeout(r, 250)); // let images inside SVGs settle
  const pages = [...container.querySelectorAll('[data-pdf-page]')];
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [PAGE_W, PAGE_H], hotfixes: ['px_scaling'], compress: true });
  pdf.setProperties({ title: `${name} brand guidelines`, creator: 'BRANDORA' });
  for (let i = 0; i < pages.length; i++) {
    onProgress?.(i + 1, pages.length);
    const img = await withSvgFontProbe(pages[i], () => toJpeg(pages[i], { quality: 0.92, pixelRatio: 2, width: PAGE_W, height: PAGE_H, cacheBust: true }));
    if (i > 0) pdf.addPage([PAGE_W, PAGE_H], 'landscape');
    pdf.addImage(img, 'JPEG', 0, 0, PAGE_W, PAGE_H, undefined, 'FAST');
  }
  if (save) pdf.save(`${slugify(name)}-brand-guidelines.pdf`);
  return pdf.output('blob');
}
