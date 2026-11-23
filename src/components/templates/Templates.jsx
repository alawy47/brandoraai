// Template library: social posts, stories and print pieces, all drawn from the brand's palette, fonts, logo and backgrounds.
// Every template is a fixed-size design (the export target); the studio scales it to fit and exports it as PNG.
import { buildLogoSvg } from '../../lib/logoSvg';
import { brandFonts, paletteMap } from '../../lib/brand';
import { useFontsReady } from '../../lib/useFontsReady';
import { withAlpha, contrastRatio } from '../../lib/color';
import { Background } from '../brand/BrandKit';
import { plateColor, findBg } from '../../lib/backgrounds';
import { Svg, MarkOnly } from '../social/SocialDesigns';

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const num = (s) => Number(String(s).replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d)).replace(/[٬,]/g, '').replace(/[^\d.]/g, '')) || 0;
const toAr = (s) => String(s).replace(/\d/g, (d) => AR_DIGITS[d]);
const lines = (s) => String(s || '').split('\n').map((l) => l.trim()).filter(Boolean);
const pair = (l) => { const [a, ...b] = l.split('|'); return [a.trim(), b.join('|').trim()]; };

// The accent colour is chosen to pop, but on the primary colour it can be too close; fall back to the light colour then.
const accentOn = (P, bg) => (contrastRatio(P.accent, bg) >= 3 ? P.accent : P.light);

function useCtx(project, concept) {
  useFontsReady(concept, project.input.name);
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const P = paletteMap(concept);
  return { project, concept, lang, ar: lang === 'ar', dir: lang === 'ar' ? 'rtl' : 'ltr', P, A1: accentOn(P, P.primary), A2: accentOn(P, P.dark), f: brandFonts(concept, lang), name: project.input.name,
    handle: `@${concept.card.web.replace('.com', '')}`, card: concept.card };
}

// ---- building blocks ------------------------------------------------------------------------------------------
const Logo = (c, variant, h, layout = 'horizontal', maxW = 300) => <Svg html={buildLogoSvg({ name: c.name, concept: c.concept, variant, layout })} style={{ height: h, width: 'fit-content', maxWidth: maxW }} />;
const Box = (c, style, children) => <div style={{ direction: c.dir, fontFamily: c.f.body, position: 'relative', overflow: 'hidden', width: '100%', height: '100%', textAlign: 'start', ...style }}>{children}</div>;
// Arabic letterforms sit larger on the line than Latin ones, so headings are set about 14% smaller to keep the same visual weight.
const Head = (c, size, extra) => ({ fontFamily: c.f.heading, fontSize: c.ar ? Math.round(size * 0.86) : size, lineHeight: c.ar ? 1.3 : 1.04, fontWeight: 700, letterSpacing: c.ar ? 0 : '-0.02em', ...extra });
const Label = (c, color, size = 15) => ({ fontSize: size, fontWeight: 700, letterSpacing: c.ar ? 0 : '0.16em', textTransform: c.ar ? 'none' : 'uppercase', color });
const Pill = (c, text, bg, color, size = 15) => text ? <span style={{ display: 'inline-block', background: bg, color, borderRadius: 99, padding: `${size * 0.5}px ${size * 1.3}px`, fontSize: size, fontWeight: 700 }}>{text}</span> : null;
const Rule = (color, w = 56, h = 3, extra) => <div style={{ width: w, height: h, background: color, borderRadius: 2, ...extra }} />;
const Bg = (c, id, w, h) => <Background styleId={id} concept={c.concept} name={c.name} w={w} h={h} style={{ position: 'absolute', inset: 0 }} />;
const Plate = (c, id, style, children) => <div style={{ background: plateColor(id, c.concept.palette), borderRadius: 18, backdropFilter: 'blur(2px)', ...style }}>{children}</div>;
const toneText = (c, id) => (findBg(id).tone === 'light' ? c.P.dark : c.P.light);

// ---- social posts (540 × 540) ----------------------------------------------------------------------------------
const POSTS = {
  event: (c, t) => Box(c, { background: c.P.dark, color: c.P.light, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ position: 'absolute', top: 0, bottom: 0, insetInlineStart: 0, width: 14, background: c.P.accent }} />
    <MarkOnly concept={c.concept} name={c.name} variant="white" size={360} style={{ position: 'absolute', insetInlineEnd: -110, top: -90, opacity: 0.07 }} />
    {Logo(c, 'inverse', 40, 'horizontal', 240)}
    <div style={{ marginTop: 'auto' }}>
      <div style={Label(c, c.P.accent, 18)}>{t.kicker}</div>
      <div style={Head(c, 70, { marginTop: 14 })}>{t.headline}</div>
      {Rule(c.P.accent, 64, 4, { margin: '24px 0 18px' })}
      <div style={{ fontSize: 19, opacity: 0.82, maxWidth: 380, lineHeight: 1.45 }}>{t.sub}</div>
      <div style={{ marginTop: 26 }}>{Pill(c, t.cta, c.P.accent, c.P.dark, 16)}</div>
    </div></>),
  stat: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', border: `2px solid ${withAlpha(c.P.primary, 0.25)}`, insetInlineEnd: -190, bottom: -230 }} />
    <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: withAlpha(c.P.accent, 0.18), insetInlineEnd: -120, bottom: -150 }} />
    <div style={Label(c, c.P.primary, 16)}>{t.kicker}</div>
    <div style={{ marginTop: 'auto', position: 'relative' }}>
      <div style={Head(c, 132, { color: c.P.primary, letterSpacing: c.ar ? 0 : '-0.04em' })}>{t.big}</div>
      <div style={Head(c, 36, { marginTop: 6, maxWidth: 380 })}>{t.headline}</div>
      <div style={{ fontSize: 18, opacity: 0.7, marginTop: 12 }}>{t.sub}</div>
      <div style={{ marginTop: 28 }}>{Logo(c, 'primary', 32, 'horizontal', 200)}</div>
    </div></>),
  menu: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div><div style={Label(c, c.P.primary, 15)}>{t.kicker}</div><div style={Head(c, 54, { marginTop: 10 })}>{t.headline}</div></div>
      <MarkOnly concept={c.concept} name={c.name} variant="primary" size={64} />
    </div>
    <div style={{ marginTop: 'auto' }}>
      {lines(t.items).slice(0, 5).map((l, i) => { const [a, b] = pair(l); return (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '13px 0', borderTop: `1px solid ${withAlpha(c.P.dark, 0.16)}` }}>
          <span style={{ fontFamily: c.f.heading, fontSize: 24, fontWeight: 600 }}>{a}</span>
          <span style={{ flex: 1, borderBottom: `2px dotted ${withAlpha(c.P.dark, 0.25)}`, transform: 'translateY(-4px)' }} />
          <span style={{ fontFamily: c.f.heading, fontSize: 24, fontWeight: 700, color: c.P.primary }}>{b}</span>
        </div>); })}
      <div dir="ltr" style={{ marginTop: 14, fontSize: 14, opacity: 0.6, textAlign: c.ar ? 'right' : 'left' }}>{c.handle}</div>
    </div></>),
  giveaway: (c, t) => Box(c, { background: c.P.primary, color: c.P.light, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ position: 'absolute', width: 132, height: 132, borderRadius: '50%', background: c.P.accent, color: c.P.dark, insetInlineEnd: 40, top: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 10, fontFamily: c.f.heading, fontWeight: 800, fontSize: 25, lineHeight: 1.1, transform: 'rotate(-8deg)' }}>{t.kicker}</div>
    <div style={{ marginTop: 'auto' }}>
      <div style={Head(c, 66)}>{t.headline}</div>
      <div style={{ fontSize: 18, opacity: 0.85, margin: '14px 0 18px' }}>{t.sub}</div>
      {lines(t.items).slice(0, 3).map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0', fontSize: 21, fontWeight: 600 }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: c.P.light, color: c.P.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800 }}>{c.ar ? toAr(i + 1) : i + 1}</span>{l}
        </div>))}
      <div style={{ marginTop: 22, ...Label(c, c.A1, 14) }}>{t.cta}</div>
    </div></>),
  hiring: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, display: 'flex' }, <>
    <div style={{ width: 150, background: c.P.primary, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '44px 0' }}>
      <MarkOnly concept={c.concept} name={c.name} variant="onPrimary" size={72} />
      <div style={{ marginTop: 'auto', writingMode: 'vertical-rl', transform: 'rotate(180deg)', ...Label(c, c.P.light, 15) }}>{c.name}</div>
    </div>
    <div style={{ flex: 1, padding: '46px 40px', display: 'flex', flexDirection: 'column' }}>
      <div style={Label(c, c.P.primary, 16)}>{t.kicker}</div>
      <div style={Head(c, 58, { marginTop: 12 })}>{t.headline}</div>
      <div style={{ fontSize: 17, opacity: 0.72, marginTop: 14, lineHeight: 1.45 }}>{t.sub}</div>
      <div style={{ marginTop: 'auto' }}>
        {lines(t.items).slice(0, 4).map((l, i) => <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 18, padding: '6px 0' }}><span style={{ width: 9, height: 9, borderRadius: 2, background: c.P.accent, transform: 'rotate(45deg)' }} />{l}</div>)}
        <div style={{ marginTop: 20 }}>{Pill(c, t.cta, c.P.dark, c.P.light, 16)}</div>
      </div>
    </div></>),
  thanks: (c, t, bg) => Box(c, { color: toneText(c, bg), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 46 }, <>
    {Bg(c, bg, 540, 540)}
    {Plate(c, bg, { position: 'relative', padding: '46px 40px', textAlign: 'center', width: '100%' }, <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>{Logo(c, findBg(bg).tone === 'light' ? 'primary' : findBg(bg).tone === 'dark' ? 'inverse' : 'onPrimary', 40, 'horizontal', 220)}</div>
      <div style={{ ...Label(c, toneText(c, bg), 15), opacity: 0.75, marginTop: 26 }}>{t.kicker}</div>
      <div style={Head(c, 78, { marginTop: 8 })}>{t.headline}</div>
      <div style={{ fontSize: 19, opacity: 0.85, marginTop: 14, lineHeight: 1.45 }}>{t.sub}</div></>)}</>),
  bgquote: (c, t, bg) => Box(c, { color: toneText(c, bg), padding: 46, display: 'flex', flexDirection: 'column' }, <>
    {Bg(c, bg, 540, 540)}
    {Plate(c, bg, { position: 'relative', marginTop: 'auto', padding: '34px 34px 30px' }, <>
      <div style={{ fontFamily: c.f.heading, fontSize: 90, lineHeight: 0.6, color: c.P.accent, height: 40 }}>{c.ar ? '”' : '“'}</div>
      <div style={Head(c, 40, { fontWeight: 600, letterSpacing: c.ar ? 0 : '-0.01em' })}>{t.headline}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
        <span style={Label(c, toneText(c, bg), 13)}>{t.sub}</span>{Logo(c, findBg(bg).tone === 'light' ? 'primary' : findBg(bg).tone === 'dark' ? 'inverse' : 'onPrimary', 28, 'horizontal', 170)}
      </div></>)}</>),
  feature: (c, t) => Box(c, { background: c.P.dark, color: c.P.light, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={Label(c, c.P.accent, 15)}>{t.kicker}</div>
    <div style={Head(c, 50, { marginTop: 10, maxWidth: 400 })}>{t.headline}</div>
    <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {lines(t.items).slice(0, 4).map((l, i) => (
        <div key={i} style={{ border: `1px solid ${withAlpha(c.P.light, 0.18)}`, borderRadius: 16, padding: '18px 18px 20px', background: withAlpha(c.P.light, 0.04) }}>
          <div style={{ fontFamily: c.f.heading, fontSize: 30, fontWeight: 700, color: c.P.accent }}>{c.ar ? toAr(`0${i + 1}`) : `0${i + 1}`}</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 10, lineHeight: 1.25 }}>{l}</div>
        </div>))}
    </div></>),
  split: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, display: 'flex' }, <>
    <div style={{ flex: 1, padding: '46px 0 46px 46px', paddingInlineStart: 46, paddingInlineEnd: 20, display: 'flex', flexDirection: 'column' }}>
      <div>{Pill(c, t.kicker, c.P.accent, c.P.dark, 14)}</div>
      <div style={Head(c, 54, { marginTop: 22 })}>{t.headline}</div>
      <div style={{ fontSize: 18, opacity: 0.72, marginTop: 14, lineHeight: 1.45 }}>{t.sub}</div>
      <div style={{ marginTop: 'auto', ...Label(c, c.P.primary, 15), borderBottom: `2px solid ${c.P.primary}`, width: 'fit-content', paddingBottom: 4 }}>{t.cta}</div>
    </div>
    <div style={{ width: 220, background: c.P.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 22, border: `1.5px solid ${withAlpha(c.P.light, 0.3)}`, borderRadius: 120 }} />
      <MarkOnly concept={c.concept} name={c.name} variant="onPrimary" size={110} />
    </div></>),
};

// ---- 4:5 carousel cover (540 × 675) ------------------------------------------------------------------------------
const PORTRAIT = {
  carousel: (c, t, bg) => Box(c, { color: toneText(c, bg), padding: 46, display: 'flex', flexDirection: 'column' }, <>
    {Bg(c, bg, 540, 675)}
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, findBg(bg).tone === 'light' ? 'primary' : findBg(bg).tone === 'dark' ? 'inverse' : 'onPrimary', 36, 'horizontal', 220)}<span style={Label(c, toneText(c, bg), 13)}>{t.kicker}</span></div>
    {Plate(c, bg, { position: 'relative', marginTop: 'auto', padding: '36px 34px' }, <>
      <div style={Head(c, 64)}>{t.headline}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>{t.sub}</span>
        <span style={{ display: 'flex', gap: 7 }}>{[0, 1, 2, 3, 4, 5].map((i) => <i key={i} style={{ width: i === 0 ? 26 : 8, height: 8, borderRadius: 4, background: i === 0 ? c.P.accent : withAlpha(toneText(c, bg), 0.3) }} />)}</span>
      </div></>)}</>),
};

// ---- stories (270 × 480) ---------------------------------------------------------------------------------------
const STORIES = {
  qstory: (c, t, bg) => Box(c, { color: toneText(c, bg), padding: 26, display: 'flex', flexDirection: 'column' }, <>
    {Bg(c, bg, 270, 480)}
    <div style={{ position: 'relative' }}>{Logo(c, findBg(bg).tone === 'light' ? 'primary' : findBg(bg).tone === 'dark' ? 'inverse' : 'onPrimary', 24, 'horizontal', 150)}</div>
    {Plate(c, bg, { position: 'relative', margin: 'auto 0', padding: '26px 22px' }, <>
      <div style={{ fontFamily: c.f.heading, fontSize: 56, lineHeight: 0.6, height: 24, color: c.P.accent }}>{c.ar ? '”' : '“'}</div>
      <div style={Head(c, 27, { fontWeight: 600, letterSpacing: c.ar ? 0 : '-0.01em' })}>{t.headline}</div>
      <div style={{ ...Label(c, toneText(c, bg), 10), marginTop: 16, opacity: 0.8 }}>{t.sub}</div>
      <div dir="ltr" style={{ fontSize: 11, opacity: 0.6, marginTop: 6, textAlign: c.ar ? 'right' : 'left' }}>{c.handle}</div></>)}</>),
  countdown: (c, t) => Box(c, { background: c.P.primary, color: c.P.light, padding: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }, <>
    <MarkOnly concept={c.concept} name={c.name} variant="white" size={380} style={{ position: 'absolute', insetInlineStart: -130, bottom: -90, opacity: 0.08 }} />
    {Logo(c, 'onPrimary', 24, 'horizontal', 150)}
    <div style={{ margin: 'auto 0', position: 'relative' }}>
      <div style={Label(c, c.A1, 12)}>{t.kicker}</div>
      <div style={Head(c, 150, { letterSpacing: c.ar ? 0 : '-0.05em', lineHeight: 1 })}>{t.big}</div>
      <div style={{ ...Head(c, 30, { fontWeight: 600 }), marginTop: 4 }}>{t.headline}</div>
    </div>
    <div style={{ position: 'relative' }}>{Pill(c, t.cta, c.P.accent, c.P.dark, 12)}</div></>),
  tipstory: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, padding: 26, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'primary', 24, 'horizontal', 140)}<span style={Label(c, c.P.primary, 10)}>{t.kicker}</span></div>
    <div style={Head(c, 40, { marginTop: 40 })}>{t.headline}</div>
    <div style={{ marginTop: 'auto', marginBottom: 'auto', paddingTop: 18 }}>
      {lines(t.items).slice(0, 3).map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderTop: `1px solid ${withAlpha(c.P.dark, 0.14)}` }}>
          <span style={{ fontFamily: c.f.heading, fontSize: 32, fontWeight: 700, color: c.P.accent, minWidth: 36 }}>{c.ar ? toAr(i + 1) : i + 1}</span><span style={{ fontSize: 19, fontWeight: 600 }}>{l}</span>
        </div>))}
    </div>
    <div dir="ltr" style={{ fontSize: 11, opacity: 0.55, textAlign: 'center' }}>{c.handle}</div></>),
  menustory: (c, t) => Box(c, { background: c.P.dark, color: c.P.light, padding: 26, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ display: 'flex', justifyContent: 'center' }}>{Logo(c, 'inverse', 26, 'stacked', 150)}</div>
    <div style={{ textAlign: 'center', marginTop: 34 }}><div style={Label(c, c.P.accent, 11)}>{t.kicker}</div><div style={Head(c, 38, { marginTop: 8 })}>{t.headline}</div>{Rule(c.P.accent, 40, 3, { margin: '16px auto 0' })}</div>
    <div style={{ margin: 'auto 0' }}>
      {lines(t.items).slice(0, 5).map((l, i) => { const [a, b] = pair(l); return (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderBottom: `1px solid ${withAlpha(c.P.light, 0.15)}` }}>
          <span style={{ fontFamily: c.f.heading, fontSize: 19, fontWeight: 600 }}>{a}</span><span style={{ fontFamily: c.f.heading, fontSize: 19, fontWeight: 700, color: c.P.accent }}>{b}</span>
        </div>); })}
    </div></>),
  announce: (c, t, bg) => Box(c, { color: toneText(c, bg), padding: 26, display: 'flex', flexDirection: 'column' }, <>
    {Bg(c, bg, 270, 480)}
    <div style={{ position: 'relative' }}>{Logo(c, findBg(bg).tone === 'light' ? 'primary' : findBg(bg).tone === 'dark' ? 'inverse' : 'onPrimary', 24, 'horizontal', 150)}</div>
    {Plate(c, bg, { position: 'relative', marginTop: 'auto', padding: '26px 22px' }, <>
      <div style={Label(c, c.P.accent, 11)}>{t.kicker}</div>
      <div style={Head(c, 36, { marginTop: 10 })}>{t.headline}</div>
      <div style={{ fontSize: 14, opacity: 0.8, marginTop: 10 }}>{t.sub}</div>
      <div style={{ marginTop: 18 }}>{Pill(c, t.cta, c.P.accent, c.P.dark, 12)}</div></>)}</>),
  qa: (c, t) => Box(c, { background: c.P.primary, color: c.P.light, padding: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }, <>
    {Logo(c, 'onPrimary', 24, 'horizontal', 150)}
    <div style={{ margin: 'auto 0', width: '100%' }}>
      <div style={Label(c, c.A1, 12)}>{t.kicker}</div>
      <div style={Head(c, 34, { marginTop: 12 })}>{t.headline}</div>
      <div style={{ marginTop: 28, background: c.P.light, color: c.P.dark, borderRadius: 18, padding: '22px 18px', fontSize: 14, textAlign: 'start', opacity: 0.95 }}>
        <div style={{ ...Label(c, c.P.primary, 10), marginBottom: 10 }}>{c.name}</div><div style={{ opacity: 0.55 }}>{t.sub}</div>
      </div>
    </div>
    <div dir="ltr" style={{ fontSize: 11, opacity: 0.7 }}>{c.handle}</div></>),
};

// ---- print pieces ----------------------------------------------------------------------------------------------
const contactLine = (c) => [c.card.phone, c.card.email, c.card.web].filter(Boolean);
const PRINT = {
  poster: (c, t, bg) => Box(c, { color: toneText(c, bg), padding: 38, display: 'flex', flexDirection: 'column' }, <>
    {Bg(c, bg, 420, 594)}
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, findBg(bg).tone === 'light' ? 'primary' : findBg(bg).tone === 'dark' ? 'inverse' : 'onPrimary', 34, 'horizontal', 190)}<span style={Label(c, toneText(c, bg), 11)}>{t.cta}</span></div>
    {Plate(c, bg, { position: 'relative', marginTop: 'auto', padding: '34px 30px' }, <>
      <div style={Label(c, c.P.accent, 13)}>{t.kicker}</div>
      <div style={Head(c, 66, { marginTop: 14 })}>{t.headline}</div>
      {Rule(c.P.accent, 56, 4, { margin: '22px 0 16px' })}
      <div style={{ fontSize: 17, opacity: 0.85, lineHeight: 1.45 }}>{t.sub}</div>
      <div dir="ltr" style={{ marginTop: 22, fontSize: 12, opacity: 0.65 }}>{contactLine(c).join('   ·   ')}</div></>)}</>),
  flyer: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ background: c.P.primary, color: c.P.light, padding: '30px 34px 32px', position: 'relative', overflow: 'hidden' }}>
      <MarkOnly concept={c.concept} name={c.name} variant="white" size={250} style={{ position: 'absolute', insetInlineEnd: -60, top: -50, opacity: 0.09 }} />
      {Logo(c, 'onPrimary', 32, 'horizontal', 190)}
      <div style={{ ...Label(c, c.A1, 12), marginTop: 32 }}>{t.kicker}</div>
      <div style={Head(c, 48, { marginTop: 10 })}>{t.headline}</div>
    </div>
    <div style={{ padding: '24px 34px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 17, lineHeight: 1.45, opacity: 0.8 }}>{t.sub}</div>
      <div style={{ marginTop: 22 }}>{lines(t.items).slice(0, 4).map((l, i) => <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${withAlpha(c.P.dark, 0.12)}`, fontSize: 17, fontWeight: 600 }}><span style={{ width: 10, height: 10, background: c.P.accent, borderRadius: 2, transform: 'rotate(45deg)' }} />{l}</div>)}</div>
      <div style={{ marginTop: 'auto', paddingTop: 18 }}>{Pill(c, t.cta, c.P.dark, c.P.light, 15)}
        <div dir="ltr" style={{ marginTop: 16, fontSize: 12, opacity: 0.6, lineHeight: 1.6 }}>{contactLine(c).join('   ·   ')}</div></div>
    </div></>),
  menuprint: (c, t) => {
    const groups = []; lines(t.items).forEach((l) => { if (l.includes('|')) groups[groups.length - 1]?.rows.push(pair(l)); else groups.push({ title: l, rows: [] }); });
    return Box(c, { background: c.P.light, color: c.P.dark, padding: 40, display: 'flex', flexDirection: 'column' }, <>
      <div style={{ position: 'absolute', inset: 14, border: `1.5px solid ${withAlpha(c.P.primary, 0.5)}`, borderRadius: 4 }} />
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>{Logo(c, 'primary', 36, 'stacked', 170)}</div>
        <div style={{ ...Label(c, c.P.primary, 12), marginTop: 22 }}>{t.kicker}</div><div style={Head(c, 38, { marginTop: 6 })}>{t.headline}</div>{Rule(c.P.accent, 44, 3, { margin: '16px auto 0' })}
      </div>
      <div style={{ position: 'relative', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {groups.slice(0, 4).map((g, gi) => (
          <div key={gi}><div style={{ ...Label(c, c.P.primary, 12), marginBottom: 6 }}>{g.title}</div>
            {g.rows.slice(0, 3).map(([a, b], i) => <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 0', fontSize: 16 }}><span style={{ fontWeight: 600 }}>{a}</span><span style={{ flex: 1, borderBottom: `1.5px dotted ${withAlpha(c.P.dark, 0.3)}`, transform: 'translateY(-3px)' }} /><span style={{ fontWeight: 700, color: c.P.primary }}>{b}</span></div>)}
          </div>))}
      </div>
      <div dir="ltr" style={{ position: 'relative', marginTop: 'auto', textAlign: 'center', fontSize: 11, opacity: 0.6 }}>{contactLine(c).join('   ·   ')}</div></>);
  },
  certificate: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, padding: 28 }, <>
    <div style={{ position: 'absolute', inset: 16, border: `3px solid ${c.P.primary}` }} />
    <div style={{ position: 'absolute', inset: 24, border: `1px solid ${c.P.accent}` }} />
    {[[16, 16], [16, 'r'], ['b', 16], ['b', 'r']].map(([y, x], i) => <div key={i} style={{ position: 'absolute', width: 26, height: 26, background: c.P.accent, [y === 'b' ? 'bottom' : 'top']: 16, [x === 'r' ? 'right' : 'left']: 16, transform: 'rotate(45deg) scale(.5)' }} />)}
    <div dir={c.dir} style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '22px 60px' }}>
      <MarkOnly concept={c.concept} name={c.name} variant="primary" size={50} />
      <div style={{ ...Label(c, c.P.primary, 13), marginTop: 18 }}>{t.kicker}</div>
      <div style={Head(c, 54, { marginTop: 22, fontWeight: 600 })}>{t.headline}</div>
      {Rule(c.P.accent, 80, 2, { margin: '18px 0' })}
      <div style={{ fontSize: 16, maxWidth: 380, lineHeight: 1.5, opacity: 0.8 }}>{t.sub}</div>
      <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 12 }}>
        <div style={{ textAlign: 'center' }}><div style={{ width: 150, borderBottom: `1px solid ${c.P.dark}`, height: 24 }} /><div style={{ marginTop: 6, opacity: 0.65 }}>{t.cta}</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ width: 150, borderBottom: `1px solid ${c.P.dark}`, height: 24 }} /><div style={{ marginTop: 6, opacity: 0.65 }}>{c.ar ? 'التوقيع' : 'Signature'}</div></div>
      </div>
    </div></>),
  invoice: (c, t) => {
    const rows = lines(t.items).map(pair); const total = rows.reduce((s, [, v]) => s + num(v), 0);
    const fmt = (n) => (c.ar ? toAr(n.toLocaleString('en-US')) : n.toLocaleString('en-US'));
    return Box(c, { background: '#FFFFFF', color: '#16161A', padding: 38, display: 'flex', flexDirection: 'column' }, <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>{Logo(c, 'primary', 34, 'horizontal', 190)}<div style={{ textAlign: 'end' }}><div style={Head(c, 34, { color: c.P.primary })}>{t.kicker}</div><div dir="ltr" style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>{t.headline}</div></div></div>
      <div style={{ marginTop: 34, fontSize: 14, lineHeight: 1.6 }}><div style={{ ...Label(c, c.P.primary, 10), marginBottom: 4 }}>{c.ar ? 'إلى' : 'Billed to'}</div>{String(t.sub).replace(/^[^:]*:\s*/, '')}</div>
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: c.P.primary, color: c.P.light, ...Label(c, c.P.light, 10) }}><span>{c.ar ? 'البند' : 'Description'}</span><span>{c.ar ? 'المبلغ' : 'Amount'}</span></div>
        {rows.slice(0, 6).map(([a, b], i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '17px 12px', fontSize: 14, borderBottom: '1px solid #E7E7EC', background: i % 2 ? '#FAFAFC' : '#fff' }}><span>{a}</span><span style={{ fontWeight: 600 }}>{b}</span></div>)}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 12px', fontSize: 17, fontWeight: 800 }}><span>{c.ar ? 'الإجمالي' : 'Total'}</span><span style={{ color: c.P.primary }}>{fmt(total)}</span></div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `3px solid ${c.P.accent}`, fontSize: 12, opacity: 0.75, display: 'flex', justifyContent: 'space-between' }}><span>{t.cta}</span><span dir="ltr">{c.card.email}</span></div></>);
  },
  giftcard: (c, t, bg) => Box(c, { color: toneText(c, bg), padding: 28, display: 'flex', flexDirection: 'column', borderRadius: 18 }, <>
    {Bg(c, bg, 504, 288)}
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, findBg(bg).tone === 'light' ? 'primary' : findBg(bg).tone === 'dark' ? 'inverse' : 'onPrimary', 30, 'horizontal', 170)}<span style={Label(c, toneText(c, bg), 11)}>{t.kicker}</span></div>
    <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      {Plate(c, bg, { padding: '12px 20px' }, <><div style={Head(c, 66, { lineHeight: 1 })}>{t.big}</div></>)}
      {Plate(c, bg, { padding: '12px 18px', textAlign: 'end', fontSize: 13 }, <><div style={{ fontFamily: c.f.heading, fontSize: 19, fontWeight: 700 }}>{t.headline}</div><div style={{ opacity: 0.75, marginTop: 4 }}>{t.sub}</div></>)}
    </div></>),
  signature: (c) => Box(c, { background: '#FFFFFF', color: '#16161A', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18 }, <>
    <MarkOnly concept={c.concept} name={c.name} variant="primary" size={72} />
    <div style={{ width: 2, alignSelf: 'stretch', background: c.P.accent, borderRadius: 1 }} />
    <div style={{ lineHeight: 1.5 }}>
      <div style={{ fontFamily: c.f.heading, fontSize: 19, fontWeight: 700 }}>{c.card.name}</div>
      <div style={{ fontSize: 12.5, color: c.P.primary, fontWeight: 700, letterSpacing: c.ar ? 0 : '0.06em' }}>{c.card.title} · {c.name}</div>
      <div dir="ltr" style={{ fontSize: 12, opacity: 0.7, textAlign: c.ar ? 'right' : 'left' }}>{c.card.phone}  ·  {c.card.email}  ·  {c.card.web}</div>
    </div></>),
  thankscard: (c, t) => Box(c, { background: c.P.primary, color: c.P.light, padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }, <>
    <div style={{ position: 'absolute', inset: 12, border: `1px solid ${withAlpha(c.P.light, 0.35)}`, borderRadius: 4 }} />
    <MarkOnly concept={c.concept} name={c.name} variant="onPrimary" size={46} style={{ position: 'relative' }} />
    <div style={{ position: 'relative', margin: 'auto 0' }}>
      <div style={Label(c, c.A1, 11)}>{t.kicker}</div>
      <div style={Head(c, 34, { marginTop: 10, fontWeight: 600 })}>{t.headline}</div>
      <div style={{ fontSize: 14, opacity: 0.85, marginTop: 10 }}>{t.sub}</div>
    </div>
    <div dir="ltr" style={{ position: 'relative', fontSize: 11, opacity: 0.7 }}>{c.card.web}</div></>),
};

// ---- category designs: food, retail, tech, wellness, property, education, travel, agency ------------------------------
const tone = (c, id) => (findBg(id).tone === 'light' ? 'primary' : findBg(id).tone === 'dark' ? 'inverse' : 'onPrimary');
const num2 = (c, n) => (c.ar ? toAr(n) : n);
const rowsOf = (t, max = 6) => lines(t.items).slice(0, max).map(pair);

const PACK = {
  dish: (c, t) => Box(c, { background: c.P.dark, color: c.P.light, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: c.P.secondary, insetInlineEnd: -120, top: 56 }} />
    <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: `2px dashed ${withAlpha(c.P.dark, 0.45)}`, insetInlineEnd: -70, top: 106 }} />
    <MarkOnly concept={c.concept} name={c.name} variant="primary" size={150} style={{ position: 'absolute', insetInlineEnd: 20, top: 181 }} />
    <div style={{ position: 'relative' }}>{Logo(c, 'inverse', 34, 'horizontal', 200)}</div>
    <div style={{ position: 'absolute', insetInlineEnd: 38, top: 38, width: 108, height: 108, borderRadius: '50%', background: c.P.accent, color: c.P.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: c.f.heading, fontWeight: 800, fontSize: 32, transform: 'rotate(8deg)' }}>{t.big}</div>
    <div style={{ marginTop: 'auto', position: 'relative', maxWidth: 240 }}>
      <div style={Label(c, c.P.accent, 15)}>{t.kicker}</div>
      <div style={Head(c, 48, { marginTop: 12 })}>{t.headline}</div>
      <div style={{ fontSize: 17, opacity: 0.8, marginTop: 12, lineHeight: 1.45 }}>{t.sub}</div>
      <div style={{ marginTop: 22 }}>{Pill(c, t.cta, c.P.accent, c.P.dark, 15)}</div>
    </div></>),
  reserve: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'primary', 34, 'horizontal', 200)}<span style={Label(c, c.P.primary, 13)}>{t.kicker}</span></div>
    <div style={Head(c, 52, { marginTop: 26 })}>{t.headline}</div>
    <div style={{ fontSize: 16, opacity: 0.7, marginTop: 10 }}>{t.sub}</div>
    <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {rowsOf(t, 4).map(([a, b], i) => <div key={i} style={{ background: i === 0 ? c.P.primary : '#fff', color: i === 0 ? c.P.light : c.P.dark, border: `1px solid ${withAlpha(c.P.dark, 0.12)}`, borderRadius: 14, padding: '11px 14px' }}><div style={{ ...Label(c, i === 0 ? c.A1 : c.P.primary, 10.5) }}>{a}</div><div style={{ fontFamily: c.f.heading, fontSize: 19, fontWeight: 700, marginTop: 5, whiteSpace: 'nowrap' }}>{b}</div></div>)}
    </div>
    <div style={{ marginTop: 16 }}>{Pill(c, t.cta, c.P.dark, c.P.light, 15)}</div></>),
  delivery: (c, t) => Box(c, { background: c.P.primary, color: c.P.light, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ position: 'absolute', insetInline: -40, top: 190, height: 140, background: c.P.accent, transform: 'rotate(-6deg)' }} />
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'onPrimary', 34, 'horizontal', 200)}<span style={Label(c, c.P.light, 13)}>{t.kicker}</span></div>
    <div style={{ position: 'relative', marginTop: 84, color: c.P.dark, ...Head(c, 72, { transform: 'rotate(-6deg)', transformOrigin: c.ar ? 'right center' : 'left center' }) }}>{t.headline}</div>
    <div style={{ position: 'relative', marginTop: 'auto' }}>
      <div style={{ fontSize: 19, opacity: 0.9, marginBottom: 18 }}>{t.sub}</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{lines(t.items).slice(0, 3).map((l, i) => <span key={i} style={{ border: `1.5px solid ${withAlpha(c.P.light, 0.5)}`, borderRadius: 99, padding: '8px 16px', fontSize: 15, fontWeight: 600 }}>{l}</span>)}</div>
      <div style={{ marginTop: 20 }}>{Pill(c, t.cta, c.P.light, c.P.primary, 16)}</div>
    </div></>),
  hours: (c, t) => Box(c, { background: c.P.dark, color: c.P.light, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <MarkOnly concept={c.concept} name={c.name} variant="white" size={320} style={{ position: 'absolute', insetInlineEnd: -80, bottom: -80, opacity: 0.06 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'inverse', 34, 'horizontal', 200)}<span style={Label(c, c.P.accent, 13)}>{t.kicker}</span></div>
    <div style={Head(c, 54, { marginTop: 36 })}>{t.headline}</div>
    <div style={{ marginTop: 'auto', position: 'relative' }}>
      {rowsOf(t, 5).map(([a, b], i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${withAlpha(c.P.light, 0.16)}`, fontSize: 20 }}><span style={{ fontWeight: 600 }}>{a}</span><span style={{ color: c.P.accent, fontFamily: c.f.heading, fontWeight: 700 }}>{b}</span></div>)}
      <div style={{ marginTop: 16, fontSize: 15, opacity: 0.7 }}>{t.sub}</div>
    </div></>),
  showcase: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, padding: 46, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }, <>
    <div style={{ position: 'absolute', top: 0, insetInline: 0, height: 330, background: c.P.secondary, opacity: 0.55 }} />
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'primary', 30, 'horizontal', 180)}<span style={Label(c, c.P.primary, 12)}>{t.kicker}</span></div>
    <div style={{ position: 'relative', width: 170, height: 200, marginTop: 22, borderRadius: '90px 90px 22px 22px', background: c.P.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 30px 40px -18px ${withAlpha(c.P.dark, 0.45)}` }}><MarkOnly concept={c.concept} name={c.name} variant="onPrimary" size={88} /></div>
    <div style={{ position: 'relative', width: 280, height: 22, borderRadius: '50%', background: withAlpha(c.P.dark, 0.18), marginTop: -8 }} />
    <div style={{ position: 'absolute', top: 126, insetInlineEnd: 56, width: 92, height: 92, borderRadius: '50%', background: c.P.accent, color: c.P.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: c.f.heading, fontWeight: 800, fontSize: 26 }}>{t.big}</div>
    <div style={{ position: 'relative', marginTop: 'auto' }}>
      <div style={Head(c, 42)}>{t.headline}</div>
      <div style={{ fontSize: 16, opacity: 0.7, margin: '8px 0 16px' }}>{t.sub}</div>
      {Pill(c, t.cta, c.P.dark, c.P.light, 14)}
    </div></>),
  ingredients: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'primary', 32, 'horizontal', 190)}<span style={Label(c, c.P.primary, 12)}>{t.kicker}</span></div>
    <div style={Head(c, 46, { marginTop: 30, maxWidth: 400 })}>{t.headline}</div>
    <div style={{ fontSize: 16, opacity: 0.7, marginTop: 10, maxWidth: 380 }}>{t.sub}</div>
    <div style={{ marginTop: 'auto', display: 'flex', gap: 14 }}>
      {rowsOf(t, 3).map(([a, b], i) => <div key={i} style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ width: 118, height: 118, margin: '0 auto', borderRadius: '50%', background: [c.P.secondary, c.P.primary, c.P.accent][i], color: i === 1 ? c.P.light : c.P.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: c.f.heading, fontSize: 34, fontWeight: 700 }}>{num2(c, `0${i + 1}`)}</div>
        <div style={{ marginTop: 14, fontFamily: c.f.heading, fontSize: 19, fontWeight: 700 }}>{a}</div><div style={{ fontSize: 13.5, opacity: 0.65, marginTop: 4, lineHeight: 1.35 }}>{b}</div></div>)}
    </div></>),
  appui: (c, t) => Box(c, { background: c.P.dark, color: c.P.light, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: withAlpha(c.P.primary, 0.5), filter: 'blur(60px)', insetInlineEnd: -120, top: 40 }} />
    <div style={{ position: 'relative' }}>{Logo(c, 'inverse', 32, 'horizontal', 190)}</div>
    <div style={{ position: 'absolute', insetInlineEnd: 38, top: 70, width: 210, height: 400, borderRadius: 30, background: c.P.light, border: `6px solid ${withAlpha(c.P.light, 0.25)}`, padding: 16, color: c.P.dark, boxShadow: '0 30px 60px -20px rgba(0,0,0,.6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><MarkOnly concept={c.concept} name={c.name} variant="primary" size={26} /><i style={{ width: 22, height: 22, borderRadius: '50%', background: c.P.secondary }} /></div>
      <div style={{ ...Head(c, 22), marginTop: 16, lineHeight: 1.1 }}>{c.ar ? 'مرحبًا بعودتك' : 'Welcome back'}</div>
      <div style={{ background: c.P.primary, borderRadius: 16, padding: 14, marginTop: 14, color: c.P.light }}><div style={{ fontSize: 10, opacity: 0.7 }}>{c.ar ? 'الإجمالي' : 'Overview'}</div><div style={{ fontFamily: c.f.heading, fontSize: 26, fontWeight: 700, marginTop: 2 }}>{num2(c, '84%')}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 44, marginTop: 8 }}>{[40, 62, 48, 80, 66, 94, 76].map((h, i) => <i key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? c.P.accent : withAlpha(c.P.light, 0.35), borderRadius: 3 }} />)}</div></div>
      {[0, 1, 2].map((i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}><i style={{ width: 30, height: 30, borderRadius: 10, background: [c.P.accent, c.P.secondary, c.P.primary][i], opacity: 0.9 }} /><div style={{ flex: 1 }}><i style={{ display: 'block', height: 7, borderRadius: 4, background: withAlpha(c.P.dark, 0.7), width: `${70 - i * 12}%` }} /><i style={{ display: 'block', height: 6, borderRadius: 4, background: withAlpha(c.P.dark, 0.18), width: '45%', marginTop: 6 }} /></div></div>)}
    </div>
    <div style={{ marginTop: 'auto', position: 'relative', maxWidth: 250 }}>
      <div style={Label(c, c.P.accent, 13)}>{t.kicker}</div>
      <div style={Head(c, 46, { marginTop: 12 })}>{t.headline}</div>
      <div style={{ fontSize: 16, opacity: 0.8, marginTop: 12, lineHeight: 1.45 }}>{t.sub}</div>
      <div style={{ marginTop: 22 }}>{Pill(c, t.cta, c.P.accent, c.P.dark, 15)}</div>
    </div></>),
  changelog: (c, t) => Box(c, { background: c.P.dark, color: c.P.light, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'inverse', 32, 'horizontal', 190)}<span style={Label(c, c.P.accent, 12)}>{t.kicker}</span></div>
    <div dir="ltr" style={{ marginTop: 34, display: 'inline-block', alignSelf: 'flex-start', background: c.P.accent, color: c.P.dark, borderRadius: 12, padding: '6px 16px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 30, fontWeight: 700 }}>{t.big}</div>
    <div style={Head(c, 52, { marginTop: 18 })}>{t.headline}</div>
    <div style={{ marginTop: 'auto' }}>{lines(t.items).slice(0, 4).map((l, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderTop: `1px solid ${withAlpha(c.P.light, 0.14)}`, fontSize: 19 }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: withAlpha(c.P.accent, 0.2), color: c.P.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>✓</span>{l}</div>)}</div></>),
  workout: (c, t) => Box(c, { background: c.P.primary, color: c.P.light, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'onPrimary', 32, 'horizontal', 190)}<span style={Label(c, c.A1, 12)}>{t.kicker}</span></div>
    <div style={Head(c, 52, { marginTop: 30 })}>{t.headline}</div>
    <div style={{ marginTop: 'auto' }}>
      {rowsOf(t, 5).map(([a, b], i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '11px 14px', marginTop: 8, borderRadius: 12, background: i === 0 ? c.P.accent : withAlpha(c.P.light, 0.1), color: i === 0 ? c.P.dark : c.P.light }}>
        <span style={{ fontFamily: c.f.heading, fontWeight: 800, fontSize: 18, minWidth: 64 }}>{a}</span><span style={{ fontSize: 17, fontWeight: 600 }}>{b}</span></div>)}
      <div style={{ marginTop: 18, ...Label(c, c.A1, 13) }}>{t.cta}</div>
    </div></>),
  listing: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ height: 250, background: c.P.secondary, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: c.P.accent, insetInlineEnd: 60, top: 40, opacity: 0.9 }} />
      {[[40, 150, 90], [120, 110, 120], [218, 170, 80], [310, 90, 140], [408, 140, 100]].map(([x, h, w], i) => <div key={i} style={{ position: 'absolute', bottom: 0, left: x, width: w, height: h, background: i % 2 ? c.P.primary : c.P.dark, borderRadius: '6px 6px 0 0' }}>{[0, 1, 2, 3].map((r) => <div key={r} style={{ position: 'absolute', top: 16 + r * 26, left: 12, right: 12, height: 10, background: withAlpha(c.P.light, 0.22), borderRadius: 2 }} />)}</div>)}
      <div style={{ position: 'absolute', top: 24, insetInlineStart: 28 }}>{Logo(c, 'primary', 30, 'horizontal', 180)}</div>
      <div style={{ position: 'absolute', top: 24, insetInlineEnd: 28, ...Label(c, c.P.dark, 12), background: c.P.light, borderRadius: 99, padding: '7px 14px' }}>{t.kicker}</div>
    </div>
    <div style={{ padding: '26px 36px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={Head(c, 38)}>{t.headline}</div><div style={{ fontSize: 16, opacity: 0.65, marginTop: 6 }}>{t.sub}</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>{rowsOf(t, 3).map(([a, b], i) => <div key={i} style={{ flex: 1, border: `1px solid ${withAlpha(c.P.dark, 0.14)}`, borderRadius: 12, padding: '10px 14px' }}><div style={{ fontFamily: c.f.heading, fontSize: 24, fontWeight: 700 }}>{a}</div><div style={{ fontSize: 12.5, opacity: 0.6 }}>{b}</div></div>)}</div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={Head(c, 34, { color: c.P.primary })}>{t.big}</div>{Pill(c, t.cta, c.P.dark, c.P.light, 14)}</div>
    </div></>),
  trio: (c, t) => Box(c, { background: c.P.primary, color: c.P.light, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <MarkOnly concept={c.concept} name={c.name} variant="white" size={330} style={{ position: 'absolute', insetInlineEnd: -100, top: -90, opacity: 0.08 }} />
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'onPrimary', 32, 'horizontal', 190)}<span style={Label(c, c.A1, 12)}>{t.kicker}</span></div>
    <div style={{ position: 'relative', ...Head(c, 48, { marginTop: 34, maxWidth: 400 }) }}>{t.headline}</div>
    <div style={{ position: 'relative', marginTop: 'auto' }}>
      {rowsOf(t, 3).map(([a, b], i) => <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 18, padding: '14px 0', borderTop: `1px solid ${withAlpha(c.P.light, 0.22)}` }}>
        <span style={Head(c, 56, { color: i === 0 ? c.A1 : c.P.light, minWidth: 190, letterSpacing: c.ar ? 0 : '-0.03em' })}>{a}</span><span style={{ fontSize: 19, opacity: 0.85 }}>{b}</span></div>)}
    </div></>),
  course: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ background: c.P.primary, color: c.P.light, padding: '34px 46px 38px', position: 'relative', overflow: 'hidden' }}>
      <MarkOnly concept={c.concept} name={c.name} variant="white" size={240} style={{ position: 'absolute', insetInlineEnd: -50, top: -40, opacity: 0.1 }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'onPrimary', 30, 'horizontal', 180)}{Pill(c, t.kicker, c.P.accent, c.P.dark, 12)}</div>
      <div style={{ position: 'relative', ...Head(c, 48, { marginTop: 36 }) }}>{t.headline}</div>
    </div>
    <div style={{ padding: '28px 46px 36px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 17, opacity: 0.75, lineHeight: 1.5 }}>{t.sub}</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>{rowsOf(t, 3).map(([a, b], i) => <div key={i} style={{ flex: 1, background: '#fff', border: `1px solid ${withAlpha(c.P.dark, 0.12)}`, borderRadius: 14, padding: '12px 14px' }}><div style={Label(c, c.P.primary, 10.5)}>{a}</div><div style={{ fontFamily: c.f.heading, fontSize: 19, fontWeight: 700, marginTop: 6 }}>{b}</div></div>)}</div>
      <div style={{ marginTop: 'auto', background: c.P.accent, color: c.P.dark, borderRadius: 14, padding: '15px 20px', fontWeight: 800, fontSize: 17, textAlign: 'center' }}>{t.cta}</div>
    </div></>),
  itinerary: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'primary', 32, 'horizontal', 190)}<span style={Label(c, c.P.primary, 12)}>{t.kicker}</span></div>
    <div style={Head(c, 46, { marginTop: 28 })}>{t.headline}</div>
    <div style={{ position: 'relative', marginTop: 'auto', paddingInlineStart: 34 }}>
      <div style={{ position: 'absolute', insetInlineStart: 8, top: 12, bottom: 12, width: 2, background: withAlpha(c.P.primary, 0.3) }} />
      {rowsOf(t, 4).map(([a, b], i) => <div key={i} style={{ position: 'relative', padding: '10px 0' }}>
        <i style={{ position: 'absolute', insetInlineStart: -34, top: 15, width: 18, height: 18, borderRadius: '50%', background: i === 0 ? c.P.accent : c.P.primary, border: `3px solid ${c.P.light}` }} />
        <div style={Label(c, c.P.primary, 11)}>{a}</div><div style={{ fontFamily: c.f.heading, fontSize: 21, fontWeight: 600, marginTop: 2 }}>{b}</div></div>)}
      <div style={{ marginTop: 14 }}>{Pill(c, t.cta, c.P.dark, c.P.light, 14)}</div>
    </div></>),
  portfolio: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ height: 270, background: c.P.dark, color: c.P.light, padding: 40, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <MarkOnly concept={c.concept} name={c.name} variant="white" size={300} style={{ position: 'absolute', insetInlineEnd: -70, top: -40, opacity: 0.1 }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'inverse', 30, 'horizontal', 180)}<span style={Label(c, c.P.accent, 12)}>{t.kicker}</span></div>
      <div style={{ position: 'relative', marginTop: 'auto', ...Head(c, 92, { color: c.P.accent, letterSpacing: c.ar ? 0 : '-0.04em', lineHeight: 0.9 }) }}>{t.big}</div>
    </div>
    <div style={{ padding: '26px 40px 34px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={Head(c, 36)}>{t.headline}</div><div style={{ fontSize: 16, opacity: 0.7, marginTop: 8, lineHeight: 1.45 }}>{t.sub}</div>
      <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>{lines(t.items).slice(0, 4).map((l, i) => <span key={i} style={{ border: `1.5px solid ${c.P.dark}`, borderRadius: 99, padding: '6px 14px', fontSize: 13.5, fontWeight: 600 }}>{l}</span>)}</div>
    </div></>),
  saleBanner: (c, t) => Box(c, { background: c.P.accent, color: c.P.dark, padding: 46, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(-45deg, ${withAlpha(c.P.dark, 0.06)} 0 18px, transparent 18px 36px)` }} />
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'primary', 34, 'horizontal', 200)}<span style={{ ...Label(c, c.P.light, 12), background: c.P.dark, borderRadius: 99, padding: '7px 14px' }}>{t.kicker}</span></div>
    <div style={{ position: 'relative', marginTop: 'auto' }}>
      <div style={Head(c, 190, { letterSpacing: c.ar ? 0 : '-0.05em', lineHeight: 0.85, color: c.P.dark })}>{t.big}</div>
      <div style={Head(c, 46, { marginTop: 14 })}>{t.headline}</div>
      <div style={{ fontSize: 18, opacity: 0.8, marginTop: 10 }}>{t.sub}</div>
      <div style={{ marginTop: 22 }}>{Pill(c, t.cta, c.P.dark, c.P.light, 16)}</div>
    </div></>),
  lookbook: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, padding: 40, display: 'flex', flexDirection: 'column' }, <>
    <div style={{ position: 'absolute', inset: 16, border: `1px solid ${withAlpha(c.P.dark, 0.35)}` }} />
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px' }}>{Logo(c, 'primary', 28, 'horizontal', 170)}<span style={Label(c, c.P.primary, 11)}>{t.kicker}</span></div>
    <div style={{ position: 'relative', margin: '26px auto 0', width: 300, height: 300, borderRadius: '50% 50% 0 0', background: c.P.secondary, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
      <MarkOnly concept={c.concept} name={c.name} variant="primary" size={210} style={{ marginBottom: 30, opacity: 0.9 }} /></div>
    <div style={{ position: 'relative', textAlign: 'center', marginTop: 'auto', padding: '0 10px 12px' }}>
      <div style={Head(c, 62, { fontWeight: 500, letterSpacing: c.ar ? 0 : '-0.03em' })}>{t.headline}</div>
      <div style={{ fontSize: 16, opacity: 0.65, margin: '8px 0 16px' }}>{t.sub}</div>
      <div style={{ ...Label(c, c.P.dark, 12), borderTop: `1px solid ${c.P.dark}`, display: 'inline-block', paddingTop: 10 }}>{t.cta}</div>
    </div></>),
};

// ---- category print pieces ---------------------------------------------------------------------------------------
const PACK_PRINT = {
  loyalty: (c, t) => Box(c, { background: c.P.primary, color: c.P.light, padding: 26, display: 'flex', flexDirection: 'column', borderRadius: 16 }, <>
    <MarkOnly concept={c.concept} name={c.name} variant="white" size={230} style={{ position: 'absolute', insetInlineEnd: -50, top: -60, opacity: 0.08 }} />
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{Logo(c, 'onPrimary', 28, 'horizontal', 160)}<span style={Label(c, c.A1, 10)}>{t.kicker}</span></div>
    <div style={{ position: 'relative', marginTop: 14 }}><div style={Head(c, 22, { fontWeight: 600 })}>{t.headline}</div><div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 3 }}>{t.sub}</div></div>
    <div style={{ position: 'relative', marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
      {Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', border: `1.5px dashed ${withAlpha(c.P.light, 0.55)}`, background: i === 9 ? c.P.accent : withAlpha(c.P.light, 0.06), display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.P.dark, fontWeight: 800, fontSize: 14 }}>{i === 9 ? '★' : <span style={{ color: withAlpha(c.P.light, 0.5), fontSize: 11 }}>{num2(c, i + 1)}</span>}</div>)}
    </div></>),
  hangtag: (c, t) => Box(c, { background: c.P.light, color: c.P.dark, padding: '40px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderRadius: 14 }, <>
    <div style={{ position: 'absolute', top: 14, left: '50%', marginLeft: -9, width: 18, height: 18, borderRadius: '50%', background: '#fff', border: `2px solid ${withAlpha(c.P.dark, 0.35)}` }} />
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: c.P.primary, zIndex: 0 }} />
    <div style={{ position: 'relative', width: 18, height: 18, borderRadius: '50%', background: '#fff', marginTop: -26, marginBottom: 22 }} />
    <div style={{ position: 'relative', marginTop: 28 }}>{Logo(c, 'primary', 26, 'stacked', 130)}</div>
    <div style={{ position: 'relative', marginTop: 'auto' }}>
      <div style={Label(c, c.P.primary, 9)}>{t.kicker}</div>
      <div style={Head(c, 22, { marginTop: 6 })}>{t.headline}</div>
      <div style={{ fontSize: 11, opacity: 0.65, marginTop: 6 }}>{t.sub}</div>
      <div style={{ margin: '14px 0', borderTop: `1px dashed ${withAlpha(c.P.dark, 0.35)}` }} />
      {lines(t.items).slice(0, 2).map((l, i) => <div key={i} style={{ fontSize: 11, opacity: 0.75, padding: '2px 0' }}>{l}</div>)}
      <div style={Head(c, 28, { color: c.P.primary, marginTop: 12 })}>{t.big}</div>
    </div></>),
};

// ---- catalogue ------------------------------------------------------------------------------------------------
const f = (...x) => x;
export const TEMPLATE_GROUPS = [{ id: 'post', en: 'Social posts', ar: 'منشورات' }, { id: 'story', en: 'Stories', ar: 'قصص' }, { id: 'print', en: 'Print & documents', ar: 'مطبوعات ومستندات' }];
export const TEMPLATES = [
  { id: 'event', group: 'post', en: 'Event', ar: 'فعالية', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'cta') },
  { id: 'stat', group: 'post', en: 'Big number', ar: 'رقم كبير', w: 540, h: 540, ratio: 2, fields: f('kicker', 'big', 'headline', 'sub') },
  { id: 'menu', group: 'post', en: 'Menu', ar: 'قائمة', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'items') },
  { id: 'giveaway', group: 'post', en: 'Giveaway', ar: 'مسابقة', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'items', 'cta') },
  { id: 'hiring', group: 'post', en: 'Hiring', ar: 'وظيفة', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'items', 'cta') },
  { id: 'thanks', group: 'post', en: 'Thank you', ar: 'شكرًا', w: 540, h: 540, ratio: 2, bg: true, fields: f('kicker', 'headline', 'sub') },
  { id: 'bgquote', group: 'post', en: 'Quote on pattern', ar: 'اقتباس على نقش', w: 540, h: 540, ratio: 2, bg: true, fields: f('headline', 'sub') },
  { id: 'feature', group: 'post', en: 'Four features', ar: 'أربع مزايا', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'items') },
  { id: 'split', group: 'post', en: 'Split announcement', ar: 'إعلان مقسوم', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'cta') },
  { id: 'carousel', group: 'post', en: 'Carousel cover (4:5)', ar: 'غلاف سلايدات (٤:٥)', w: 540, h: 675, ratio: 2, bg: true, fields: f('kicker', 'headline', 'sub') },
  { id: 'qstory', group: 'story', en: 'Quote story', ar: 'ستوري اقتباس', w: 270, h: 480, ratio: 4, bg: true, fields: f('headline', 'sub') },
  { id: 'countdown', group: 'story', en: 'Countdown', ar: 'عدّ تنازلي', w: 270, h: 480, ratio: 4, fields: f('kicker', 'big', 'headline', 'cta') },
  { id: 'tipstory', group: 'story', en: 'Tips', ar: 'نصائح', w: 270, h: 480, ratio: 4, fields: f('kicker', 'headline', 'items') },
  { id: 'menustory', group: 'story', en: 'Menu story', ar: 'ستوري قائمة', w: 270, h: 480, ratio: 4, fields: f('kicker', 'headline', 'items') },
  { id: 'announce', group: 'story', en: 'Announcement', ar: 'إعلان', w: 270, h: 480, ratio: 4, bg: true, fields: f('kicker', 'headline', 'sub', 'cta') },
  { id: 'qa', group: 'story', en: 'Questions box', ar: 'صندوق أسئلة', w: 270, h: 480, ratio: 4, fields: f('kicker', 'headline', 'sub') },
  { id: 'poster', group: 'print', en: 'Poster (A-series)', ar: 'بوستر', w: 420, h: 594, ratio: 4, bg: true, fields: f('kicker', 'headline', 'sub', 'cta') },
  { id: 'flyer', group: 'print', en: 'Flyer', ar: 'فلاير', w: 420, h: 594, ratio: 4, fields: f('kicker', 'headline', 'sub', 'items', 'cta') },
  { id: 'menuprint', group: 'print', en: 'Printed menu', ar: 'قائمة مطبوعة', w: 420, h: 594, ratio: 4, fields: f('kicker', 'headline', 'items') },
  { id: 'certificate', group: 'print', en: 'Certificate', ar: 'شهادة', w: 594, h: 420, ratio: 4, fields: f('kicker', 'headline', 'sub', 'cta') },
  { id: 'invoice', group: 'print', en: 'Invoice', ar: 'فاتورة', w: 420, h: 594, ratio: 4, fields: f('kicker', 'headline', 'sub', 'items', 'cta') },
  { id: 'giftcard', group: 'print', en: 'Gift card', ar: 'بطاقة هدية', w: 504, h: 288, ratio: 4, bg: true, fields: f('kicker', 'big', 'headline', 'sub') },
  { id: 'thankscard', group: 'print', en: 'Thank-you card', ar: 'بطاقة شكر', w: 420, h: 300, ratio: 4, fields: f('kicker', 'headline', 'sub') },

  // category designs
  { id: 'dish', group: 'post', en: 'Dish of the day', ar: 'طبق اليوم', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'big', 'cta') },
  { id: 'reserve', group: 'post', en: 'Reservation', ar: 'حجز', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'items', 'cta') },
  { id: 'delivery', group: 'post', en: 'Delivery offer', ar: 'عرض توصيل', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'items', 'cta') },
  { id: 'hours', group: 'post', en: 'Opening hours', ar: 'ساعات العمل', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'items', 'sub') },
  { id: 'showcase', group: 'post', en: 'Product showcase', ar: 'عرض منتج', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'big', 'cta') },
  { id: 'ingredients', group: 'post', en: 'Three key points', ar: 'ثلاث نقاط', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'items') },
  { id: 'appui', group: 'post', en: 'App launch', ar: 'إطلاق تطبيق', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'cta') },
  { id: 'changelog', group: 'post', en: 'Release notes', ar: 'ملاحظات الإصدار', w: 540, h: 540, ratio: 2, fields: f('kicker', 'big', 'headline', 'items') },
  { id: 'workout', group: 'post', en: 'Schedule', ar: 'جدول', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'items', 'cta') },
  { id: 'listing', group: 'post', en: 'Property listing', ar: 'عقار', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'items', 'big', 'cta') },
  { id: 'trio', group: 'post', en: 'Three numbers', ar: 'ثلاثة أرقام', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'items') },
  { id: 'course', group: 'post', en: 'Course card', ar: 'بطاقة دورة', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'items', 'cta') },
  { id: 'itinerary', group: 'post', en: 'Itinerary', ar: 'برنامج الرحلة', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'items', 'cta') },
  { id: 'portfolio', group: 'post', en: 'Case study', ar: 'دراسة حالة', w: 540, h: 540, ratio: 2, fields: f('kicker', 'big', 'headline', 'sub', 'items') },
  { id: 'saleBanner', group: 'post', en: 'Big offer', ar: 'عرض كبير', w: 540, h: 540, ratio: 2, fields: f('kicker', 'big', 'headline', 'sub', 'cta') },
  { id: 'lookbook', group: 'post', en: 'Lookbook', ar: 'لوك بوك', w: 540, h: 540, ratio: 2, fields: f('kicker', 'headline', 'sub', 'cta') },
  { id: 'loyalty', group: 'print', en: 'Loyalty card', ar: 'بطاقة ولاء', w: 504, h: 288, ratio: 4, fields: f('kicker', 'headline', 'sub') },
  { id: 'hangtag', group: 'print', en: 'Hang tag', ar: 'بطاقة منتج', w: 220, h: 380, ratio: 4, fields: f('kicker', 'headline', 'sub', 'items', 'big') },
  { id: 'signature', group: 'print', en: 'Email signature', ar: 'توقيع البريد', w: 480, h: 120, ratio: 4, fields: f() },
];
export const FIELD_LABELS = { kicker: { en: 'Label', ar: 'العنوان الصغير' }, headline: { en: 'Headline', ar: 'العنوان' }, sub: { en: 'Supporting text', ar: 'النص الداعم' }, cta: { en: 'Button / note', ar: 'الزر / ملاحظة' }, big: { en: 'Big number', ar: 'الرقم الكبير' }, items: { en: 'Lines (one per line, "name | price" for menus)', ar: 'أسطر (سطر لكل بند، و"البند | السعر" للقوائم)' } };

const RENDERERS = { ...POSTS, ...PORTRAIT, ...STORIES, ...PRINT, ...PACK, ...PACK_PRINT };

export function Template({ id, project, concept, text, bg }) {
  const c = useCtx(project, concept);
  const render = RENDERERS[id];
  return render ? render(c, text, bg) : null;
}
