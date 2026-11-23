import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Columns2, Heart, Maximize2, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Segmented from '../../components/ui/Segmented';
import { useI18n } from '../../i18n/I18nContext';
import { useProjects } from '../../store/ProjectsContext';
import { useToast } from '../../components/ui/Toast';
import { refineLogo, generateDirectionLogos, generateCustomSymbol } from '../../services/ai';
import { useBackend } from '../../services/useBackend';
import { Link } from 'react-router-dom';
import { downloadLogo } from '../../lib/download';
import { paletteMap } from '../../lib/brand';
import { DIRECTIONS, findDirection, generateLogoConcepts, descriptorFor, logoForDirection } from '../../lib/logoDirections';
import { FONT_LIBRARY, FONT_CATEGORIES, findLibraryFont, loadLibraryFont } from '../../data/fontLibrary';
import { MARKS, isArabicText } from '../../lib/generator';
import { Heading, DownloadButtons, useAsyncAction } from './shared';

const SYMBOLS = ['initials', 'mascot-fox', 'mascot-owl', 'mascot-bear', ...MARKS];
const LAYOUTS = ['horizontal', 'stacked', 'icon', 'wordmark', 'crest', 'badge', 'emblem', 'box', 'corporate'];

function Stage({ bg, children, className = '' }) {
  return <div className={`flex items-center justify-center ${className}`} style={{ background: bg }}>{children}</div>;
}

/* Full-screen preview with the tests a logo has to pass: backgrounds, small sizes, one colour. */
function PreviewModal({ open, onClose, project, concept, logo, descriptor, k }) {
  const P = paletteMap(concept);
  const [bg, setBg] = useState('light');
  if (!logo) return null;
  const name = project.input.name;
  const bgs = { light: [P.light, 'primary'], dark: [P.dark, 'inverse'], brand: [P.primary, 'onPrimary'], white: ['#FFFFFF', 'mono'] };
  const [color, variant] = bgs[bg];
  return (
    <Modal open={open} onClose={onClose} title={findDirection(logo.style)?.[k('lang')] || k('preview')} width="max-w-5xl">
      <div className="space-y-4">
        <Segmented size="sm" layoutId="pv-bg" value={bg} onChange={setBg} options={[{ value: 'light', label: k('bgLight') }, { value: 'dark', label: k('bgDark') }, { value: 'brand', label: k('bgBrand') }, { value: 'white', label: k('bgMono') }]} />
        <Stage bg={color} className="h-[46vh] min-h-64 rounded-2xl p-10">
          <Logo name={name} concept={concept} logo={logo} variant={variant} descriptor={descriptor} className="h-full w-full max-w-[640px]" />
        </Stage>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-line p-4">
            <div className="text-xs text-mute">{k('sizeTest')}</div>
            <div className="mt-3 flex items-end gap-5 rounded-xl bg-white p-4">
              {[128, 64, 32, 16].map((s) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <Logo name={name} concept={concept} logo={logo} layout="icon" style={{ width: s, height: s }} />
                  <span dir="ltr" className="text-[10px] text-neutral-500">{s}px</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line p-4">
            <div className="text-xs text-mute">{k('oneColour')}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stage bg="#FFFFFF" className="h-24 rounded-xl p-3"><Logo name={name} concept={concept} logo={logo} variant="mono" descriptor={descriptor} className="h-full w-full" /></Stage>
              <Stage bg="#111114" className="h-24 rounded-xl p-3"><Logo name={name} concept={concept} logo={logo} variant="white" descriptor={descriptor} className="h-full w-full" /></Stage>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CompareModal({ open, onClose, project, concept, logos, onPick, k, pick }) {
  const P = paletteMap(concept);
  return (
    <Modal open={open} onClose={onClose} title={k('compare')} width="max-w-6xl">
      <div className={`grid gap-3 ${logos.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {logos.map((l) => (
          <div key={l.id} className="overflow-hidden rounded-2xl border border-line">
            <Stage bg={P.light} className="h-56 p-6"><Logo name={project.input.name} concept={concept} logo={l} descriptor={descriptorFor(project)} className="h-full w-full" /></Stage>
            <div className="grid grid-cols-3 gap-px bg-line">
              <Stage bg={P.dark} className="h-20 p-3"><Logo name={project.input.name} concept={concept} logo={l} variant="inverse" layout="icon" className="h-full w-full" /></Stage>
              <Stage bg={P.primary} className="h-20 p-3"><Logo name={project.input.name} concept={concept} logo={l} variant="onPrimary" layout="icon" className="h-full w-full" /></Stage>
              <Stage bg="#fff" className="h-20 p-3"><Logo name={project.input.name} concept={concept} logo={l} variant="mono" layout="icon" style={{ width: 32, height: 32 }} /></Stage>
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <span className="text-sm text-soft">{pick(findDirection(l.style) || {})}</span>
              <Button size="sm" onClick={() => onPick(l)}>{k('useThis')}</Button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function ConceptCard({ project, concept, logo, selected, favorite, comparing, onUse, onPreview, onCompare, onFavorite, k, pick }) {
  const P = paletteMap(concept);
  const dir = findDirection(logo.style);
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`panel group flex flex-col overflow-hidden ${selected ? '!border-amethyst/70 ring-1 ring-amethyst/30' : ''}`}>
      <button onClick={onPreview} className="relative flex h-48 items-center justify-center p-6" style={{ background: P.light }} aria-label={`${k('preview')}: ${pick(dir || {})}`}>
        <Logo name={project.input.name} concept={concept} logo={logo} descriptor={descriptorFor(project)} className="h-full w-full max-w-[300px]" />
        <span className="absolute end-3 top-3 rounded-lg bg-black/40 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"><Maximize2 className="h-3.5 w-3.5" /></span>
      </button>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold">{pick(dir || {})}</h3>
          <button onClick={onFavorite} aria-label={k('favorite')} className="-m-1 rounded-lg p-1 text-mute hover:text-champagne"><Heart className={`h-4 w-4 ${favorite ? 'fill-champagne text-champagne' : ''}`} /></button>
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-mute">{dir ? pick(dir.idea) : logo.rationale}</p>
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant={selected ? 'primary' : 'subtle'} className="flex-1" onClick={onUse}>{selected && <Check className="h-4 w-4" />}{selected ? k('selected') : k('useThis')}</Button>
          <button onClick={onCompare} aria-pressed={comparing} title={k('addCompare')} className={`flex h-9 w-9 items-center justify-center rounded-[10px] border transition-colors ${comparing ? 'border-lilac bg-amethyst/15 text-lilac' : 'border-line text-mute hover:text-paper'}`}><Columns2 className="h-4 w-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}

function RefinePanel({ project, concept, logo, onPatch, k, pick, lang }) {
  const toast = useToast();
  const backend = useBackend();
  const [section, setSection] = useState('symbol');
  const [cat, setCat] = useState(findLibraryFont(logo.font)?.cat || 'all');
  const [request, setRequest] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [idea, setIdea] = useState('');
  const [symbolBusy, setSymbolBusy] = useState(false);
  const drawSymbol = async () => {
    setSymbolBusy(true);
    try {
      const r = await generateCustomSymbol({ project, idea, direction: logo.style });
      onPatch({ mark: 'custom', custom: r.custom });
      toast(`${k('symbolMade')} (${r.providers.image} + ${r.providers.vector})`);
    } catch (e) { toast(e.message, 'error'); } finally { setSymbolBusy(false); }
  };
  const arabicName = isArabicText(project.input.name);
  const fontKey = arabicName ? 'fontAr' : 'font';
  const currentFont = logo[fontKey] || (arabicName ? concept.fonts.headingAr : concept.fonts.heading);
  const fonts = FONT_LIBRARY.filter((f) => (arabicName ? f.script === 'arabic' : f.script === 'latin' && (cat === 'all' || f.cat === cat)));
  const fontMeta = findLibraryFont(currentFont);

  useEffect(() => { if (section === 'type') fonts.slice(0, 40).forEach((f) => loadLibraryFont(f.family, 400)); }, [section, cat]); // eslint-disable-line react-hooks/exhaustive-deps

  const ask = async () => {
    if (!request.trim()) return;
    setBusy(true);
    try {
      const r = await refineLogo({ project, logo, request, lang });
      if (Object.keys(r.patch || {}).length) onPatch(r.patch);
      setResult(r);
    } catch (e) {
      toast(e.message, 'error');
    } finally { setBusy(false); }
  };

  const label = 'mb-2 block text-xs text-mute';
  return (
    <div className="panel flex flex-col p-5">
      <Segmented size="sm" layoutId="refine-sec" value={section} onChange={setSection} className="self-start"
        options={[{ value: 'symbol', label: k('symbol') }, { value: 'type', label: k('type') }, { value: 'color', label: k('color') }, { value: 'ask', label: k('ask') }]} />
      <div className="mt-5 min-h-[300px]">
        {section === 'symbol' && (
          <>
            <span className={label}>{k('symbolHint')}</span>
            <div className="grid max-h-[330px] grid-cols-5 gap-2 overflow-y-auto pe-1 sm:grid-cols-6">
              {(logo.custom ? ['custom', ...SYMBOLS] : SYMBOLS).map((m) => (
                <button key={m} onClick={() => onPatch({ mark: m })} aria-pressed={logo.mark === m} title={m}
                  className={`flex aspect-square items-center justify-center rounded-xl border bg-white p-2 transition-all ${logo.mark === m ? 'border-amethyst ring-2 ring-amethyst/40' : 'border-transparent hover:border-line-2'}`}>
                  <Logo name={project.input.name} concept={concept} logo={{ ...logo, mark: m }} layout="icon" className="h-full w-full" />
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-line bg-ink-2 p-3">
              <span className={label}>{k('aiSymbol')}</span>
              {backend.image ? (
                <div className="flex gap-2">
                  <input className="field !py-2 text-sm" dir="auto" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder={k('aiSymbolPh')} />
                  <Button size="sm" onClick={drawSymbol} loading={symbolBusy} disabled={!idea.trim()}>{!symbolBusy && <Sparkles className="h-4 w-4" />}{k('draw')}</Button>
                </div>
              ) : (
                <p className="text-xs text-mute">{k('aiSymbolOffline')} <Link to="/settings" className="text-lilac hover:underline">{k('setup')}</Link></p>
              )}
            </div>
          </>
        )}
        {section === 'type' && (
          <div className="space-y-4">
            {!arabicName && (
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                {FONT_CATEGORIES.filter((c) => c.id !== 'arabic').map((c) => (
                  <button key={c.id} onClick={() => setCat(c.id)} className={`shrink-0 rounded-full border px-3 py-1 text-xs ${cat === c.id ? 'border-lilac/70 bg-white/[.06] text-paper' : 'border-line text-mute hover:text-soft'}`}>{pick(c)}</button>
                ))}
              </div>
            )}
            <div className="grid max-h-[190px] grid-cols-2 gap-1.5 overflow-y-auto pe-1">
              {fonts.map((f) => (
                <button key={f.family} onClick={() => { loadLibraryFont(f.family, logo.weight || 700); onPatch({ [fontKey]: f.family }); }}
                  className={`truncate rounded-lg border px-3 py-2 text-start text-[15px] ${currentFont === f.family ? 'border-amethyst bg-amethyst/10' : 'border-line hover:border-line-2'}`}
                  style={{ fontFamily: `'${f.family}'` }}>{arabicName ? project.input.name : f.family}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className={label}>{k('weight')}</span>
                <select className="field !py-2 text-sm" value={logo.weight || 700} onChange={(e) => onPatch({ weight: Number(e.target.value) })}>
                  {(fontMeta?.weights || [400, 700]).map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </label>
              <label className="block"><span className={label}>{k('spacing')} <span dir="ltr">{(logo.tracking ?? 0).toFixed(2)}em</span></span>
                <input type="range" min={-0.05} max={0.45} step={0.01} value={logo.tracking ?? 0} onChange={(e) => onPatch({ tracking: Number(e.target.value) })} className="w-full accent-[#9B6BFF]" />
              </label>
            </div>
            {!arabicName && (
              <div className="flex flex-wrap items-center gap-3">
                <Segmented size="sm" layoutId="case" value={logo.case || 'asis'} onChange={(v) => onPatch({ case: v })} options={[{ value: 'asis', label: 'Aa' }, { value: 'upper', label: 'AA' }, { value: 'lower', label: 'aa' }]} />
                <button onClick={() => onPatch({ italic: !logo.italic })} className={`h-8 rounded-lg border px-3 text-sm italic ${logo.italic ? 'border-lilac/70 text-paper' : 'border-line text-mute'}`}>{k('italic')}</button>
              </div>
            )}
          </div>
        )}
        {section === 'color' && (
          <div className="space-y-5">
            <div>
              <span className={label}>{k('colorway')}</span>
              <div className="grid grid-cols-3 gap-2">
                {[['primary', k('cwPrimary')], ['accent', k('cwAccent')], ['ink', k('cwInk')]].map(([cw, l]) => (
                  <button key={cw} onClick={() => onPatch({ colorway: cw })} className={`overflow-hidden rounded-xl border text-xs ${logo.colorway === cw || (!logo.colorway && cw === 'primary') ? 'border-amethyst ring-2 ring-amethyst/30' : 'border-line'}`}>
                    <div className="h-16 bg-white p-2"><Logo name={project.input.name} concept={concept} logo={{ ...logo, colorway: cw }} layout="icon" className="h-full w-full" /></div>
                    <div className="px-2 py-1.5 text-soft">{l}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className={label}>{k('layout')}</span>
              <div className="flex flex-wrap gap-1.5">
                {LAYOUTS.map((l) => (
                  <button key={l} onClick={() => onPatch({ layout: l })} className={`rounded-lg border px-3 py-1.5 text-xs ${logo.layout === l ? 'border-lilac/70 bg-white/[.06] text-paper' : 'border-line text-mute hover:text-soft'}`}>{k(`lay_${l}`)}</button>
                ))}
              </div>
            </div>
            {logo.layout === 'wordmark' && (
              <div>
                <span className={label}>{k('device')}</span>
                <Segmented size="sm" layoutId="device" value={logo.accent || 'none'} onChange={(v) => onPatch({ accent: v === 'none' ? undefined : v })}
                  options={[{ value: 'none', label: k('devNone') }, { value: 'dot', label: k('devDot') }, { value: 'lastLetter', label: k('devLetter') }, { value: 'underline', label: k('devLine') }]} />
              </div>
            )}
            <p className="text-xs text-mute">{k('paletteHint')}</p>
          </div>
        )}
        {section === 'ask' && (
          <div className="space-y-3">
            <span className={label}>{k('askHint')}</span>
            <textarea rows={4} className="field resize-none" dir="auto" value={request} onChange={(e) => setRequest(e.target.value)} placeholder={k('askPh')} />
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" onClick={ask} loading={busy} disabled={!request.trim()}>{!busy && <Wand2 className="h-4 w-4" />}{backend.text ? k('askAi') : k('askOffline')}</Button>
              {!backend.text && <span className="text-xs text-mute">{k('offlineNote')}</span>}
            </div>
            {result && (
              <div className="rounded-xl border border-line bg-ink-2 p-3 text-sm">
                {result.applied.length ? (
                  <ul className="space-y-1">{result.applied.map((a) => <li key={a} className="flex items-center gap-2 text-soft"><Check className="h-3.5 w-3.5 text-success" />{a}</li>)}</ul>
                ) : <p className="text-mute">{k('noChange')}</p>}
                {result.note && <p className="mt-2 text-mute">{result.note}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LogoTab({ project, concept, ci }) {
  const { t, pick, lang } = useI18n();
  const k = (key) => (key === 'lang' ? lang : t(`studio.ls.${key}`));
  const { updateConcept } = useProjects();
  const toast = useToast();
  const [busy, run] = useAsyncAction();
  const [preview, setPreview] = useState(null);
  const [compare, setCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [variations, setVariations] = useState({ dir: null, list: [], next: 1 });
  const [filter, setFilter] = useState('all');
  const P = paletteMap(concept);
  const name = project.input.name;
  const descriptor = descriptorFor(project);
  const concepts = useMemo(() => concept.logoConcepts || generateLogoConcepts(project), [concept.logoConcepts, project]);
  const favorites = concept.logoFavorites || [];
  const logo = concept.logo;

  useEffect(() => { if (!concept.logoConcepts) updateConcept(project.id, ci, { logoConcepts: concepts }); }, [concept.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const useLogo = (l) => { updateConcept(project.id, ci, { logo: { ...l } }); toast(k('applied')); setShowCompare(false); };
  const patch = (p) => updateConcept(project.id, ci, { logo: { ...logo, ...p, edited: true } });
  const toggleFav = (id) => updateConcept(project.id, ci, { logoFavorites: favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id] });
  const toggleCompare = (l) => setCompare((c) => (c.some((x) => x.id === l.id) ? c.filter((x) => x.id !== l.id) : [...c, l].slice(-3)));
  const moreInDirection = (dir) => run('more', async () => {
    const start = variations.dir === dir ? variations.next : 1;
    const list = await generateDirectionLogos({ project, direction: dir, start });
    setVariations({ dir, list: variations.dir === dir ? [...variations.list, ...list] : list, next: start + 12 });
  });
  const regenerateAll = () => run('regen', async () => {
    const seed = (concept.logoRound || 0) + 1;
    // A new round: every direction gets a different symbol, typeface and treatment.
    const fresh = DIRECTIONS.map((d) => logoForDirection(d.id, project, seed * 13));
    updateConcept(project.id, ci, { logoConcepts: fresh, logoRound: seed });
  });

  const shown = concepts.filter((l) => filter === 'all' || favorites.includes(l.id));
  const variationsLayout = [
    { id: 'light', label: t('studio.onLight'), variant: 'primary', layout: undefined, bg: P.light },
    { id: 'dark', label: t('studio.onDark'), variant: 'inverse', layout: undefined, bg: P.dark },
    { id: 'horizontal', label: t('studio.horizontal'), variant: 'primary', layout: 'horizontal', bg: '#FFFFFF' },
    { id: 'stacked', label: t('studio.stacked'), variant: 'primary', layout: 'stacked', bg: '#FFFFFF' },
    { id: 'icon', label: t('studio.icon'), variant: 'primary', layout: 'icon', bg: P.light },
    { id: 'brand', label: t('studio.reversed'), variant: 'onPrimary', layout: 'stacked', bg: P.primary },
    { id: 'mono', label: t('studio.mono'), variant: 'mono', layout: undefined, bg: '#FFFFFF' },
    { id: 'wordmark', label: t('studio.wordmark'), variant: 'primary', layout: 'wordmark', bg: P.light },
    { id: 'emblem', label: t('studio.emblem'), variant: 'primary', layout: 'emblem', bg: P.light },
  ];
  const dl = (id, format, variant, layout) => run(`${id}-${format}`, () => downloadLogo({ format, name, concept, variant, layout, descriptor }));

  return (
    <div className="space-y-14">
      {/* 12 creative directions */}
      <section>
        <Heading title={k('conceptsTitle')} sub={k('conceptsSub')} action={(
          <div className="flex flex-wrap gap-2">
            <Segmented size="sm" layoutId="logo-filter" value={filter} onChange={setFilter} options={[{ value: 'all', label: k('all') }, { value: 'fav', label: `${k('favorites')} ${favorites.length || ''}` }]} />
            <Button size="sm" variant="outline" disabled={compare.length < 2} onClick={() => setShowCompare(true)}><Columns2 className="h-4 w-4" />{k('compare')} {compare.length ? `(${compare.length})` : ''}</Button>
            <Button size="sm" variant="outline" onClick={regenerateAll} loading={busy === 'regen'}>{busy !== 'regen' && <RefreshCw className="h-4 w-4" />}{k('newConcepts')}</Button>
          </div>
        )} />
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-2 p-10 text-center text-sm text-mute">{k('noFavorites')}</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((l) => (
              <ConceptCard key={l.id} project={project} concept={concept} logo={l} k={k} pick={pick}
                selected={logo.id === l.id} favorite={favorites.includes(l.id)} comparing={compare.some((x) => x.id === l.id)}
                onUse={() => useLogo(l)} onPreview={() => setPreview(l)} onCompare={() => toggleCompare(l)} onFavorite={() => toggleFav(l.id)} />
            ))}
          </div>
        )}
      </section>

      {/* Refine the selected logo */}
      <section>
        <Heading title={k('refineTitle')} sub={k('refineSub')} />
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-3">
            <button onClick={() => setPreview(logo)} className="group relative flex min-h-[340px] flex-1 items-center justify-center rounded-[20px] p-10" style={{ background: P.light }} aria-label={k('preview')}>
              <Logo name={name} concept={concept} descriptor={descriptor} className="h-52 w-full max-w-[560px]" />
              <span className="absolute end-4 top-4 flex items-center gap-1.5 rounded-lg bg-black/45 px-2.5 py-1.5 text-xs text-white"><Maximize2 className="h-3.5 w-3.5" />{k('preview')}</span>
            </button>
            <div className="grid grid-cols-3 gap-3">
              {[[P.dark, 'inverse'], [P.primary, 'onPrimary'], ['#FFFFFF', 'mono']].map(([bg, v]) => (
                <Stage key={v} bg={bg} className="h-24 rounded-2xl p-4"><Logo name={name} concept={concept} variant={v} layout="icon" className="h-full w-full" /></Stage>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-mute" dir={project.input.language === 'ar' ? 'rtl' : 'ltr'}>{logo.rationale}</p>
          </div>
          <RefinePanel project={project} concept={concept} logo={logo} onPatch={patch} k={k} pick={pick} lang={lang} />
        </div>
      </section>

      {/* More options inside a direction */}
      <section>
        <Heading title={k('moreTitle')} sub={k('moreSub')} action={(
          <div className="flex flex-wrap gap-2">
            <select className="field !h-9 !w-auto !py-0 text-sm" value={variations.dir || logo.style || 'minimal'} onChange={(e) => moreInDirection(e.target.value)} aria-label={k('moreTitle')}>
              {DIRECTIONS.map((d) => <option key={d.id} value={d.id}>{pick(d)}</option>)}
            </select>
            <Button size="sm" onClick={() => moreInDirection(variations.dir || logo.style || 'minimal')} loading={busy === 'more'}>{busy !== 'more' && <Sparkles className="h-4 w-4" />}{k('generateMore')}</Button>
          </div>
        )} />
        <AnimatePresence>
          {variations.list.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {variations.list.map((l) => (
                <ConceptCard key={l.id} project={project} concept={concept} logo={l} k={k} pick={pick}
                  selected={logo.id === l.id} favorite={favorites.includes(l.id)} comparing={compare.some((x) => x.id === l.id)}
                  onUse={() => useLogo(l)} onPreview={() => setPreview(l)} onCompare={() => toggleCompare(l)} onFavorite={() => toggleFav(l.id)} />
              ))}
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line-2 p-8 text-center text-sm text-mute">{k('moreEmpty')}</div>
          )}
        </AnimatePresence>
      </section>

      {/* Lockups and downloads */}
      <section>
        <Heading title={t('studio.variations')} sub={k('lockupsSub')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {variationsLayout.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-2xl border border-line">
              <Stage bg={v.bg} className="h-40 p-5"><Logo name={name} concept={concept} variant={v.variant} layout={v.layout} descriptor={descriptor} className={v.layout === 'icon' ? 'h-20 w-20' : 'h-full w-full'} /></Stage>
              <div className="flex items-center justify-between gap-2 bg-surface px-3 py-2.5">
                <span className="truncate text-sm text-soft">{v.label}</span>
                <DownloadButtons id={v.id} busy={busy} onPng={() => dl(v.id, 'png', v.variant, v.layout)} onSvg={() => dl(v.id, 'svg', v.variant, v.layout)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <PreviewModal open={!!preview} onClose={() => setPreview(null)} project={project} concept={concept} logo={preview} descriptor={descriptor} k={k} />
      <CompareModal open={showCompare} onClose={() => setShowCompare(false)} project={project} concept={concept} logos={compare} onPick={useLogo} k={k} pick={pick} />
    </div>
  );
}

