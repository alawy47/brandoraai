import { useEffect, useMemo, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useProjects } from '../../store/ProjectsContext';
import { rgbString, cmykString, contrastRatio, readableOn, colorName } from '../../lib/color';
import { paletteMap } from '../../lib/brand';
import { fontStack } from '../../data/fonts';
import { FONT_LIBRARY, FONT_CATEGORIES, PAIRINGS, PAIRINGS_AR, loadLibraryFont } from '../../data/fontLibrary';
import { paletteAse, paletteGpl, paletteCss, paletteJson, typographySpec } from '../../lib/specExport';
import { downloadBlob } from '../../lib/download';
import { slugify } from '../../lib/generator';
import Button from '../../components/ui/Button';
import Segmented from '../../components/ui/Segmented';
import { Heading, CopyButton } from './shared';

const SPECIMEN = {
  en: { head: 'Designed with intent', body: 'Good typography is invisible. It sets the pace of reading, gives your story a voice and makes every message feel like it came from the same place.' },
  ar: { head: 'تصميم بهدف واضح', body: 'الطباعة الجيدة لا تُلاحظ. فهي تضبط إيقاع القراءة، وتمنح قصتك صوتًا، وتجعل كل رسالة تبدو صادرة من المكان نفسه.' },
};
const fileBtn = 'inline-flex h-8 items-center rounded-lg border border-line px-3 text-xs font-medium text-soft transition-colors hover:border-lilac/50 hover:text-paper';

function PairCard({ heading, body, lang, colors, active, onUse, k }) {
  const s = SPECIMEN[lang];
  return (
    <div className={`overflow-hidden rounded-2xl border ${active ? 'border-amethyst/70 ring-1 ring-amethyst/30' : 'border-line'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-5" style={{ background: colors.light, color: colors.dark }}>
        <div className="text-2xl font-bold leading-tight" style={{ fontFamily: fontStack(heading) }}>{s.head}</div>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed opacity-80" style={{ fontFamily: fontStack(body) }}>{s.body}</p>
      </div>
      <div className="flex items-center justify-between gap-2 bg-surface px-4 py-2.5">
        <span className="truncate text-xs text-soft">{heading} + {body}</span>
        <Button size="sm" variant={active ? 'primary' : 'subtle'} onClick={onUse}>{active && <Check className="h-3.5 w-3.5" />}{active ? k('inUse') : k('use')}</Button>
      </div>
    </div>
  );
}

export default function IdentityTab({ project, concept, ci }) {
  const { t, pick } = useI18n();
  const k = (key) => t(`studio.ty.${key}`);
  const { updateConcept } = useProjects();
  const P = paletteMap(concept);
  const brandLang = project.input.language === 'ar' ? 'ar' : 'en';
  const slug = slugify(project.input.name);
  const [script, setScript] = useState(brandLang === 'ar' ? 'arabic' : 'latin');
  const [cat, setCat] = useState('all');
  const [sample, setSample] = useState(project.input.name);
  const [size, setSize] = useState(40);
  const [weight, setWeight] = useState(700);
  const [tracking, setTracking] = useState(0);
  const [limit, setLimit] = useState(24);

  const fonts = useMemo(() => FONT_LIBRARY.filter((f) => f.script === script && (script === 'arabic' || cat === 'all' || f.cat === cat)), [script, cat]);
  useEffect(() => { fonts.slice(0, limit).forEach((f) => loadLibraryFont(f.family, weight)); }, [fonts, limit, weight]);
  const pairs = useMemo(() => {
    const list = script === 'arabic' ? PAIRINGS_AR : PAIRINGS;
    const mine = list.filter((p) => p.moods.includes(project.input.personality));
    const rest = list.filter((p) => !p.moods.includes(project.input.personality));
    return [...mine, ...rest].slice(0, 6);
  }, [script, project.input.personality]);
  useEffect(() => { pairs.forEach((p) => { loadLibraryFont(p.heading, 700); loadLibraryFont(p.body, 400); }); }, [pairs]);

  const setFonts = (patch) => updateConcept(project.id, ci, { fonts: { ...concept.fonts, ...patch } });
  const setColor = (role, hex) => {
    const palette = concept.palette.map((c) => (c.role === role ? { ...c, hex: hex.toUpperCase(), name: colorName(hex) } : c));
    updateConcept(project.id, ci, { palette, paletteOriginal: concept.paletteOriginal || concept.palette });
  };
  const resetPalette = () => concept.paletteOriginal && updateConcept(project.id, ci, { palette: concept.paletteOriginal, paletteOriginal: undefined });
  const headKey = script === 'arabic' ? 'headingAr' : 'heading';
  const bodyKey = script === 'arabic' ? 'bodyAr' : 'body';
  const spec = () => typographySpec(project, concept);
  const pairs2 = [{ heading: concept.fonts.heading, body: concept.fonts.body, lang: 'en' }, { heading: concept.fonts.headingAr, body: concept.fonts.bodyAr, lang: 'ar' }];
  if (brandLang === 'ar') pairs2.reverse();
  const scale = [['Display', 64], ['H1', 44], ['H2', 30], ['H3', 22], ['Body', 16], ['Caption', 13]];
  const hf = brandLang === 'ar' ? concept.fonts.headingAr : concept.fonts.heading;
  const bf = brandLang === 'ar' ? concept.fonts.bodyAr : concept.fonts.body;

  return (
    <div className="space-y-14">
      {/* Palette editor */}
      <section>
        <Heading title={t('studio.palette')} sub={k('paletteSub')} action={(
          <div className="flex flex-wrap gap-1.5">
            {concept.paletteOriginal && <button className={fileBtn} onClick={resetPalette}><RotateCcw className="me-1.5 h-3.5 w-3.5" />{k('reset')}</button>}
            <button className={fileBtn} onClick={() => downloadBlob(new Blob([paletteAse(concept.palette, project.input.name)], { type: 'application/octet-stream' }), `${slug}-palette.ase`)}>ASE</button>
            <button className={fileBtn} onClick={() => downloadBlob(new Blob([paletteGpl(concept.palette, project.input.name)], { type: 'text/plain' }), `${slug}-palette.gpl`)}>GPL</button>
            <button className={fileBtn} onClick={() => downloadBlob(new Blob([paletteCss(concept.palette)], { type: 'text/css' }), `${slug}-palette.css`)}>CSS</button>
            <button className={fileBtn} onClick={() => downloadBlob(new Blob([paletteJson(concept.palette)], { type: 'application/json' }), `${slug}-palette.json`)}>JSON</button>
          </div>
        )} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {concept.palette.map((c) => {
            const fg = readableOn(c.hex);
            return (
              <div key={c.role} className="overflow-hidden rounded-2xl border border-line">
                <label className="relative flex h-40 cursor-pointer flex-col justify-between p-4" style={{ background: c.hex, color: fg }}>
                  <span className="flex items-center justify-between text-xs opacity-80"><span>{t(`studio.roles.${c.role}`)}</span><span>{k('edit')}</span></span>
                  <span className="font-display text-xl font-semibold">{c.name[brandLang]}</span>
                  <input type="color" value={c.hex} onChange={(e) => setColor(c.role, e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`${t(`studio.roles.${c.role}`)} ${k('edit')}`} />
                </label>
                <div className="space-y-1.5 bg-surface p-4 text-xs">
                  {[['HEX', c.hex], ['RGB', rgbString(c.hex)], ['CMYK', cmykString(c.hex)]].map(([kk, v]) => (
                    <div key={kk} className="flex items-center justify-between gap-2"><span className="text-mute">{kk}</span><CopyButton value={v} className="font-mono text-soft hover:text-paper" /></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[['primary', 'light'], ['dark', 'light'], ['light', 'primary'], ['dark', 'accent']].map(([fg, bg]) => {
            const r = contrastRatio(P[fg], P[bg]);
            const grade = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA Large' : k('lowContrast');
            return (
              <div key={fg + bg} className="flex items-center justify-between rounded-xl border border-line px-4 py-3" style={{ background: P[bg], color: P[fg] }}>
                <span className="font-display text-lg font-semibold">Aa</span>
                <span className="text-end text-xs"><span className="block font-medium" dir="ltr">{r.toFixed(1)}:1</span><span className="opacity-75">{grade}</span></span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Current system */}
      <section>
        <Heading title={t('studio.typography')} sub={k('systemSub')} action={(
          <div className="flex flex-wrap gap-1.5">
            <button className={fileBtn} onClick={() => downloadBlob(new Blob([spec().md], { type: 'text/markdown' }), `${slug}-typography.md`)}>{k('specMd')}</button>
            <button className={fileBtn} onClick={() => downloadBlob(new Blob([spec().css], { type: 'text/css' }), `${slug}-typography.css`)}>CSS</button>
            <button className={fileBtn} onClick={() => downloadBlob(new Blob([spec().json], { type: 'application/json' }), `${slug}-typography.json`)}>JSON</button>
          </div>
        )} />
        <div className="grid gap-4 lg:grid-cols-2">
          {pairs2.map((p) => (
            <div key={p.lang} className="overflow-hidden rounded-[20px] border border-line" dir={p.lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="p-7" style={{ background: P.light, color: P.dark }}>
                <div className="flex justify-between text-xs opacity-60"><span>{p.lang === 'ar' ? t('studio.arabicScript') : t('studio.latin')}</span></div>
                <div className="mt-4 flex items-end gap-6">
                  <span className="text-[84px] font-bold leading-[0.85]" style={{ fontFamily: fontStack(p.heading), color: P.primary }}>{p.lang === 'ar' ? 'أب' : 'Aa'}</span>
                  <div className="min-w-0">
                    <div className="text-2xl font-bold" style={{ fontFamily: fontStack(p.heading) }}>{SPECIMEN[p.lang].head}</div>
                    <p className="mt-2 text-sm leading-relaxed opacity-80" style={{ fontFamily: fontStack(p.body) }}>{SPECIMEN[p.lang].body}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-line bg-surface text-sm rtl:divide-x-reverse">
                <div className="p-4"><div className="text-xs text-mute">{t('studio.heading')}</div><div className="mt-0.5" style={{ fontFamily: fontStack(p.heading) }}>{p.heading}</div></div>
                <div className="p-4"><div className="text-xs text-mute">{t('studio.body')}</div><div className="mt-0.5" style={{ fontFamily: fontStack(p.body) }}>{p.body}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pairing comparison */}
      <section>
        <Heading title={k('pairsTitle')} sub={k('pairsSub')} action={<Segmented size="sm" layoutId="pair-script" value={script} onChange={setScript} options={[{ value: 'latin', label: 'English' }, { value: 'arabic', label: 'العربية' }]} />} />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {pairs.map((p) => (
            <PairCard key={p.heading + p.body} heading={p.heading} body={p.body} lang={script === 'arabic' ? 'ar' : 'en'} colors={P} k={k}
              active={concept.fonts[headKey] === p.heading && concept.fonts[bodyKey] === p.body}
              onUse={() => setFonts({ [headKey]: p.heading, [bodyKey]: p.body })} />
          ))}
        </div>
      </section>

      {/* Font library explorer */}
      <section>
        <Heading title={k('libraryTitle')} sub={`${FONT_LIBRARY.length} ${k('librarySub')}`} />
        <div className="panel space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <input className="field" dir="auto" value={sample} onChange={(e) => setSample(e.target.value)} aria-label={k('previewText')} placeholder={k('previewText')} />
            <label className="text-xs text-mute">{k('size')} {size}px<input type="range" min={20} max={72} value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-2 w-full accent-[#9B6BFF]" /></label>
            <label className="text-xs text-mute">{k('weight')}
              <select className="field mt-1 !py-1.5 text-sm" value={weight} onChange={(e) => setWeight(Number(e.target.value))}>{[300, 400, 600, 700, 800].map((w) => <option key={w}>{w}</option>)}</select>
            </label>
            <label className="text-xs text-mute">{k('spacing')} <span dir="ltr">{tracking.toFixed(2)}em</span><input type="range" min={-0.05} max={0.4} step={0.01} value={tracking} onChange={(e) => setTracking(Number(e.target.value))} className="mt-2 w-full accent-[#9B6BFF]" /></label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented size="sm" layoutId="lib-script" value={script} onChange={(v) => { setScript(v); setCat('all'); }} options={[{ value: 'latin', label: 'English' }, { value: 'arabic', label: 'العربية' }]} />
            {script === 'latin' && (
              <div className="no-scrollbar flex max-w-full gap-1.5 overflow-x-auto">
                {FONT_CATEGORIES.filter((c) => c.id !== 'arabic').map((c) => (
                  <button key={c.id} onClick={() => setCat(c.id)} className={`shrink-0 rounded-full border px-3 py-1 text-xs ${cat === c.id ? 'border-lilac/70 bg-white/[.06] text-paper' : 'border-line text-mute hover:text-soft'}`}>{pick(c)}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fonts.slice(0, limit).map((f) => {
            const w = f.weights.reduce((a, b) => (Math.abs(b - weight) < Math.abs(a - weight) ? b : a));
            return (
              <div key={f.family} className="panel flex flex-col overflow-hidden">
                <div className="flex min-h-28 items-center px-5 py-4" dir="auto" style={{ background: P.light, color: P.dark }}>
                  <span className="w-full truncate leading-tight" style={{ fontFamily: fontStack(f.family), fontSize: size, fontWeight: w, letterSpacing: `${tracking}em` }}>{sample || project.input.name}</span>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <div className="min-w-0"><div className="truncate text-sm">{f.family}</div><div className="text-xs text-mute">{pick(FONT_CATEGORIES.find((c) => c.id === (f.script === 'arabic' ? 'arabic' : f.cat)))} <span dir="ltr">{f.weights.join(' · ')}</span></div></div>
                  <div className="flex shrink-0 gap-1">
                    <button className={`${fileBtn} !h-7 !px-2`} onClick={() => setFonts({ [headKey]: f.family })} aria-pressed={concept.fonts[headKey] === f.family}>{concept.fonts[headKey] === f.family && <Check className="me-1 h-3 w-3" />}{k('asHeading')}</button>
                    <button className={`${fileBtn} !h-7 !px-2`} onClick={() => setFonts({ [bodyKey]: f.family })} aria-pressed={concept.fonts[bodyKey] === f.family}>{concept.fonts[bodyKey] === f.family && <Check className="me-1 h-3 w-3" />}{k('asBody')}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {fonts.length > limit && <div className="mt-4 flex justify-center"><Button variant="outline" size="sm" onClick={() => setLimit((l) => l + 24)}>{k('showMore')} ({fonts.length - limit})</Button></div>}
      </section>

      <section>
        <Heading title={t('studio.scale')} />
        <div className="panel divide-y divide-line" dir={brandLang === 'ar' ? 'rtl' : 'ltr'}>
          {scale.map(([label, sz]) => (
            <div key={label} className="flex items-baseline gap-6 overflow-hidden px-5 py-4">
              <span className="w-20 shrink-0 text-xs text-mute" dir="ltr">{label} {sz}px</span>
              <span className="truncate" style={{ fontFamily: fontStack(sz >= 22 ? hf : bf), fontSize: sz, fontWeight: sz >= 22 ? 700 : 400, lineHeight: 1.15 }}>{project.input.name} {concept.tagline}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
