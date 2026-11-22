import { buildLogoSvg, markSvg, logoColors, wordmarkStyle } from '../../lib/logoSvg';
import { brandFonts, paletteMap } from '../../lib/brand';
import { initialOf } from '../../lib/generator';
import { useFontsReady } from '../../lib/useFontsReady';
import { withAlpha } from '../../lib/color';

function Svg({ html, style, className }) {
  return <div className={`[&>svg]:h-full [&>svg]:w-full ${className || ''}`} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

function MarkOnly({ concept, name, variant, size, style }) {
  const c = logoColors(concept.palette, variant, concept.logo.colorway);
  const wm = wordmarkStyle(concept, name);
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${markSvg(concept.logo.mark, c, initialOf(name), wm.family, wm.weight)}</svg>`;
  return <Svg html={html} style={{ width: size, height: size, ...style }} />;
}

const base = (dir, f, extra) => ({ direction: dir, fontFamily: f.body, position: 'relative', overflow: 'hidden', width: '100%', height: '100%', ...extra });

export function InstagramPost({ project, concept, post }) {
  useFontsReady(concept, project.input.name);
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const P = paletteMap(concept);
  const f = brandFonts(concept, lang);
  const name = project.input.name;
  const handle = `@${concept.card.web.replace('.com', '')}`;

  if (post.type === 'launch') {
    return (
      <div style={base(dir, f, { background: P.primary, color: P.light, padding: 44, display: 'flex', flexDirection: 'column' })}>
        <MarkOnly concept={concept} name={name} variant="white" size={430} style={{ position: 'absolute', insetInlineEnd: -120, bottom: -110, opacity: 0.1 }} />
        <Svg html={buildLogoSvg({ name, concept, variant: 'onPrimary', layout: 'horizontal' })} style={{ height: 44, width: 'fit-content', maxWidth: 260 }} />
        <div style={{ marginTop: 'auto' }}>
          <span style={{ display: 'inline-block', background: P.accent, color: P.dark, borderRadius: 99, padding: '6px 14px', fontSize: 15, fontWeight: 600 }}>{post.kicker}</span>
          <div style={{ fontFamily: f.heading, fontSize: 64, lineHeight: 1.02, fontWeight: 700, marginTop: 18, letterSpacing: lang === 'ar' ? 0 : '-0.02em' }}>{post.headline}</div>
          <div style={{ fontSize: 20, marginTop: 14, opacity: 0.85, maxWidth: 380 }}>{post.sub}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 34, fontSize: 15 }}>
            <span style={{ borderBottom: `2px solid ${P.accent}`, paddingBottom: 3, fontWeight: 600 }}>{post.cta}</span>
            <span dir="ltr" style={{ opacity: 0.7 }}>{handle}</span>
          </div>
        </div>
      </div>
    );
  }
  if (post.type === 'product') {
    return (
      <div style={base(dir, f, { background: P.light, color: P.dark, padding: 44, display: 'flex', flexDirection: 'column' })}>
        <div style={{ position: 'absolute', width: 330, height: 330, borderRadius: '50%', background: P.secondary, top: 36, insetInlineEnd: -96 }} />
        <MarkOnly concept={concept} name={name} variant="primary" size={180} style={{ position: 'absolute', top: 112, insetInlineEnd: 12 }} />
        <div style={{ position: 'absolute', top: 40, insetInlineEnd: 236, width: 104, height: 104, borderRadius: '50%', background: P.accent, color: P.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transform: 'rotate(-12deg)', fontFamily: f.heading, fontWeight: 700 }}>
          <span style={{ fontSize: 34, lineHeight: 1 }}>20%</span><span style={{ fontSize: 13 }}>{lang === 'ar' ? 'خصم' : 'OFF'}</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: P.primary }}>{post.kicker}</span>
        <div style={{ marginTop: 'auto', position: 'relative' }}>
          <div style={{ fontFamily: f.heading, fontSize: 52, lineHeight: 1.04, fontWeight: 700, maxWidth: 280, letterSpacing: lang === 'ar' ? 0 : '-0.02em' }}>{post.headline}</div>
          <div style={{ fontSize: 17, marginTop: 14, opacity: 0.75, maxWidth: 270 }}>{post.sub}</div>
          <div style={{ display: 'inline-block', marginTop: 26, background: P.primary, color: P.light, borderRadius: 99, padding: '12px 24px', fontWeight: 600, fontSize: 16 }}>{post.cta}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={base(dir, f, { background: P.dark, color: P.light, padding: 52, display: 'flex', flexDirection: 'column', justifyContent: 'center' })}>
      <div style={{ width: 56, height: 5, background: P.accent, borderRadius: 4, marginBottom: 30 }} />
      <div style={{ fontFamily: f.heading, fontSize: 52, lineHeight: 1.12, fontWeight: 700 }}>{post.headline}</div>
      <div style={{ fontSize: 18, marginTop: 24, color: P.secondary }}>{post.sub}</div>
      <MarkOnly concept={concept} name={name} variant="inverse" size={54} style={{ position: 'absolute', bottom: 44, insetInlineEnd: 44 }} />
    </div>
  );
}

export function InstagramStory({ project, concept, story }) {
  useFontsReady(concept, project.input.name);
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const P = paletteMap(concept);
  const f = brandFonts(concept, lang);
  const name = project.input.name;

  if (story.type === 'arrival') {
    return (
      <div style={base(dir, f, { background: `linear-gradient(170deg, ${P.primary} 0%, ${P.dark} 100%)`, color: P.light, padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' })}>
        <Svg html={buildLogoSvg({ name, concept, variant: 'onPrimary', layout: 'horizontal' })} style={{ height: 30, width: 180 }} />
        <div style={{ marginTop: 52, width: 160, height: 160, borderRadius: '50%', background: withAlpha(P.light, 0.08), border: `1px solid ${withAlpha(P.light, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MarkOnly concept={concept} name={name} variant="onPrimary" size={92} />
        </div>
        <span style={{ marginTop: 34, fontSize: 13, fontWeight: 600, color: P.accent }}>{story.kicker}</span>
        <div style={{ fontFamily: f.heading, fontSize: 29, lineHeight: 1.1, fontWeight: 700, marginTop: 10 }}>{story.headline}</div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          <svg width="18" height="10" viewBox="0 0 18 10"><path d="M1 9l8-7 8 7" stroke={P.light} strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
          {story.cta}
        </div>
      </div>
    );
  }
  const option = (label, pct, on) => (
    <div style={{ position: 'relative', background: '#fff', borderRadius: 14, padding: '14px 16px', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 15, color: P.dark, boxShadow: '0 6px 20px rgba(0,0,0,.08)' }}>
      <div style={{ position: 'absolute', insetBlock: 0, insetInlineStart: 0, width: `${pct}%`, background: withAlpha(on ? P.accent : P.secondary, 0.55) }} />
      <span style={{ position: 'relative' }}>{label}</span><span style={{ position: 'relative' }}>{pct}%</span>
    </div>
  );
  return (
    <div style={base(dir, f, { background: P.light, color: P.dark, padding: 30, display: 'flex', flexDirection: 'column' })}>
      <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: P.secondary, opacity: 0.6, top: -120, insetInlineStart: -110 }} />
      <Svg html={buildLogoSvg({ name, concept, variant: 'primary', layout: 'horizontal' })} style={{ height: 30, width: 170, position: 'relative' }} />
      <div style={{ marginTop: 'auto', position: 'relative' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: P.primary }}>{story.kicker}</span>
        <div style={{ fontFamily: f.heading, fontSize: 34, lineHeight: 1.1, fontWeight: 700, margin: '10px 0 24px' }}>{story.headline}</div>
        <div style={{ display: 'grid', gap: 10 }}>{option(story.a, 64, true)}{option(story.b, 36)}</div>
      </div>
      <div style={{ height: 90 }} />
    </div>
  );
}
