import { useMemo, useRef, useState } from 'react';
import { PackageOpen, Pencil } from 'lucide-react';
import ScaledFrame from '../../components/social/ScaledFrame';
import Button from '../../components/ui/Button';
import Segmented from '../../components/ui/Segmented';
import { Template, TEMPLATES, TEMPLATE_GROUPS, FIELD_LABELS } from '../../components/templates/Templates';
import { useI18n } from '../../i18n/I18nContext';
import { downloadNode, downloadBlob, nodeToPng } from '../../lib/download';
import { slugify } from '../../lib/generator';
import { templateDefaults } from '../../lib/templateCopy';
import { packIds, packCopy } from '../../lib/templatePacks';
import { CATEGORIES } from '../../data/options';
import { BG_STYLES, defaultBg } from '../../lib/backgrounds';
import { Heading, DownloadButtons, useAsyncAction } from './shared';

const input = 'w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper outline-none focus:border-lilac/60';

function TemplateCard({ tpl, project, concept, state, setState, nodes, busy, run, reset }) {
  const { pick } = useI18n();
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const slug = slugify(project.input.name);
  const set = (key, v) => setState({ ...state, text: { ...state.text, [key]: v } });
  return (
    <div className="panel overflow-hidden">
      <div className="relative">
        <ScaledFrame ref={(el) => { ref.current = el; if (el) nodes.current.set(tpl.id, { el, tpl }); }} width={tpl.w} height={tpl.h}>
          <Template id={tpl.id} project={project} concept={concept} text={state.text} bg={state.bg} />
        </ScaledFrame>
        <div className="absolute end-3 top-3"><DownloadButtons id={tpl.id} busy={busy} onPng={() => run(`${tpl.id}-png`, () => downloadNode(ref.current, `${slug}-${tpl.id}.png`, tpl.ratio))} /></div>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0"><div className="truncate text-sm font-medium">{pick({ en: tpl.en, ar: tpl.ar })}</div><div className="text-xs text-mute" dir="ltr">{tpl.w * tpl.ratio} × {tpl.h * tpl.ratio}</div></div>
        {(tpl.fields.length > 0 || tpl.bg) && <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-soft hover:text-paper"><Pencil className="h-3.5 w-3.5" />{lang === 'ar' ? 'تعديل' : 'Edit'}</button>}
      </div>
      {open && (
        <div className="space-y-3 border-t border-line p-4">
          {tpl.bg && (
            <label className="block text-xs text-mute">{lang === 'ar' ? 'الخلفية' : 'Background'}
              <select className={`${input} mt-1`} value={state.bg} onChange={(e) => setState({ ...state, bg: e.target.value })}>
                {BG_STYLES.map((b) => <option key={b.id} value={b.id}>{lang === 'ar' ? b.ar : b.en}</option>)}
              </select>
            </label>)}
          {tpl.fields.map((k) => (
            <label key={k} className="block text-xs text-mute">{FIELD_LABELS[k][lang]}
              {k === 'items' ? <textarea rows={4} dir="auto" className={`${input} mt-1`} value={state.text[k] || ''} onChange={(e) => set(k, e.target.value)} />
                : <input dir="auto" className={`${input} mt-1`} value={state.text[k] || ''} onChange={(e) => set(k, e.target.value)} />}
            </label>))}
          <button className="text-xs text-lilac hover:underline" onClick={() => setState({ text: reset(tpl), bg: state.bg })}>{lang === 'ar' ? 'استعادة النص الأصلي' : 'Reset text'}</button>
        </div>)}
    </div>
  );
}

export default function TemplatesTab({ project, concept }) {
  const { pick } = useI18n();
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const cat = project.input.category;
  const catInfo = CATEGORIES.find((x) => x.id === cat);
  const ids = packIds(cat);
  const [group, setGroup] = useState(ids.length ? 'pack' : 'all');
  const [busy, run] = useAsyncAction();
  const nodes = useRef(new Map());
  const [states, setStates] = useState({});
  const bg0 = defaultBg(project.input.personality);
  const startText = (tpl) => ({ ...templateDefaults(tpl.id, lang, cat), ...((tpl.id === 'bgquote' || tpl.id === 'qstory') && !packCopy(cat, tpl.id, lang).headline ? { headline: concept.tagline } : {}) });
  const get = (tpl) => states[tpl.id] || { text: startText(tpl), bg: bg0 };
  const list = useMemo(() => (group === 'pack' ? ids.map((id) => TEMPLATES.find((t) => t.id === id)).filter(Boolean) : TEMPLATES.filter((t) => group === 'all' || t.group === group)), [group, cat]); // eslint-disable-line react-hooks/exhaustive-deps
  const slug = slugify(project.input.name);

  const downloadAll = () => run('all', async () => {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    for (const tpl of list) {
      const entry = nodes.current.get(tpl.id);
      if (!entry?.el) continue;
      const data = (await nodeToPng(entry.el, tpl.ratio)).split(',')[1];
      zip.file(`${tpl.group}/${slug}-${tpl.id}.png`, data, { base64: true });
    }
    downloadBlob(await zip.generateAsync({ type: 'blob' }), `${slug}-templates.zip`);
  });

  return (
    <div className="space-y-8">
      <Heading title={lang === 'ar' ? 'القوالب' : 'Templates'}
        sub={group === 'pack' && catInfo ? (lang === 'ar' ? `مجموعة مصممة لنشاط «${catInfo.ar}»: تصاميم ونصوص جاهزة بألوان وخطوط وشعار علامتك. عدّل النص ونزّل PNG.` : `A set made for ${catInfo.en.toLowerCase()}: designs and starter text in your colors, fonts and logo. Edit the text and download PNG.`) : (lang === 'ar' ? 'قوالب جاهزة بألوان وخطوط وشعار علامتك. عدّل النص واختر الخلفية ثم نزّل PNG.' : 'Ready-made designs in your colors, fonts and logo. Edit the text, pick a background and download PNG.')}
        action={<Button size="sm" variant="outline" onClick={downloadAll} loading={busy === 'all'}><PackageOpen className="h-4 w-4" />{lang === 'ar' ? `تنزيل الكل (${list.length})` : `Download all (${list.length})`}</Button>} />
      <Segmented size="sm" layoutId="tpl-group" value={group} onChange={setGroup}
        options={[...(ids.length ? [{ value: 'pack', label: `★ ${catInfo ? pick(catInfo) : ''}` }] : []), { value: 'all', label: lang === 'ar' ? 'الكل' : 'All' }, ...TEMPLATE_GROUPS.map((g) => ({ value: g.id, label: pick(g) }))]} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((tpl) => (
          <div key={tpl.id} className={tpl.h > tpl.w * 1.4 && tpl.w < 300 ? '' : tpl.w > 450 && tpl.h < 350 ? 'sm:col-span-2 lg:col-span-1' : ''}>
            <TemplateCard tpl={tpl} project={project} concept={concept} state={get(tpl)} setState={(s) => setStates((o) => ({ ...o, [tpl.id]: s }))} nodes={nodes} busy={busy} run={run} reset={startText} />
          </div>))}
      </div>
    </div>
  );
}
