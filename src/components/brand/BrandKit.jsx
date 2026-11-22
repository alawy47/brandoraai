import { useMemo } from 'react';
import { buildLogoSvg } from '../../lib/logoSvg';
import { buildBackgroundSvg, overlayVariant, findBg, plateColor } from '../../lib/backgrounds';
import { brandFonts, paletteMap } from '../../lib/brand';
import { useFontsReady } from '../../lib/useFontsReady';

function Svg({ html, style, className = '' }) {
  return <div className={`[&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Background({ styleId, concept, name, w, h, style, className }) {
  const html = useMemo(() => buildBackgroundSvg(styleId, concept, name, w, h), [styleId, concept, name, w, h]);
  return <Svg html={html} style={style} className={className} />;
}

// Sizes are the on-screen design size; exports multiply by `ratio`.
export const COVERS = [
  { id: 'x', w: 750, h: 250, ratio: 2, out: '1500 × 500', align: 'end' },
  { id: 'linkedin', w: 792, h: 198, ratio: 2, out: '1584 × 396', align: 'end' },
  { id: 'facebook', w: 820, h: 312, ratio: 2, out: '1640 × 624', align: 'center' },
  { id: 'youtube', w: 1280, h: 720, ratio: 2, out: '2560 × 1440', align: 'center' },
  { id: 'call', w: 960, h: 540, ratio: 2, out: '1920 × 1080', align: 'corner' },
];

export function CoverDesign({ cover, styleId, project, concept }) {
  useFontsReady(concept, project.input.name);
  const name = project.input.name;
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const P = paletteMap(concept);
  const f = brandFonts(concept, lang);
  const variant = overlayVariant(styleId);
  const tone = findBg(styleId).tone;
  const text = tone === 'light' ? P.dark : P.light;
  const logo = buildLogoSvg({ name, concept, variant, layout: cover.align === 'corner' ? 'horizontal' : 'stacked' });
  const s = cover.h; // scale content to the banner height
  const isYT = cover.id === 'youtube';
  // YouTube shows only the centre 1235×338 on every device, so content stays inside it.
  const logoH = isYT ? 130 : Math.min(s * 0.42, 130);
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s * 0.04, textAlign: 'center', background: plateColor(styleId, concept.palette), borderRadius: isYT ? 28 : s * 0.08, padding: isYT ? '34px 48px' : `${s * 0.08}px ${s * 0.14}px` }}>
      <Svg html={logo} style={{ height: logoH, width: logoH * 2.4 }} />
      <div style={{ fontFamily: f.heading, color: text, fontSize: isYT ? 30 : Math.max(13, s * 0.075), fontWeight: 700, opacity: 0.9 }}>{concept.tagline}</div>
    </div>
  );
  const pos = cover.align === 'corner'
    ? { top: s * 0.07, insetInlineStart: s * 0.07, alignItems: 'flex-start' }
    : cover.align === 'end'
      ? { insetBlock: 0, insetInlineEnd: cover.w * 0.08, alignItems: 'center' }
      : { inset: 0, justifyContent: 'center', alignItems: 'center' };
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ position: 'relative', width: cover.w, height: cover.h, overflow: 'hidden', fontFamily: f.body }}>
      <Background styleId={styleId} concept={concept} name={name} w={cover.w} h={cover.h} style={{ position: 'absolute', inset: 0 }} />
      {cover.align === 'corner'
        ? <div style={{ position: 'absolute', ...pos, background: plateColor(styleId, concept.palette), borderRadius: 14, padding: '12px 18px' }}><Svg html={logo} style={{ height: s * 0.1, width: s * 0.42 }} /></div>
        : <div style={{ position: 'absolute', display: 'flex', ...pos }}>{content}</div>}
    </div>
  );
}

export const PROFILES = ['primary', 'dark', 'pattern'];

export function ProfileDesign({ kind, styleId, project, concept, size = 400 }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const name = project.input.name;
  const bg = kind === 'primary' ? P.primary : kind === 'dark' ? P.dark : null;
  const icon = buildLogoSvg({ name, concept, layout: 'icon', variant: kind === 'dark' ? 'inverse' : 'onPrimary' });
  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'hidden', background: bg || P.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {kind === 'pattern' && <Background styleId={styleId} concept={concept} name={name} w={size} h={size} style={{ position: 'absolute', inset: 0 }} />}
      {kind === 'pattern'
        ? <div style={{ position: 'relative', width: size * 0.62, height: size * 0.62, borderRadius: '50%', background: P.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(0,0,0,.25)' }}><Svg html={icon} style={{ width: size * 0.48, height: size * 0.48 }} /></div>
        : <Svg html={icon} style={{ width: size * 0.6, height: size * 0.6, position: 'relative' }} />}
    </div>
  );
}

export function AppIconDesign({ project, concept, size = 256 }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const icon = buildLogoSvg({ name: project.input.name, concept, layout: 'icon', variant: 'onPrimary' });
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.225, overflow: 'hidden', background: `linear-gradient(150deg, ${P.primary}, ${P.dark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Svg html={icon} style={{ width: size * 0.66, height: size * 0.66 }} />
    </div>
  );
}

export function emailSignatureHtml(project, concept) {
  const P = paletteMap(concept);
  const c = concept.card;
  const rtl = project.input.language === 'ar';
  const font = rtl ? 'Tahoma, Arial, sans-serif' : 'Arial, Helvetica, sans-serif';
  return `<table cellpadding="0" cellspacing="0" dir="${rtl ? 'rtl' : 'ltr'}" style="font-family:${font};font-size:13px;color:${P.dark};line-height:1.5">
  <tr>
    <td style="padding-${rtl ? 'left' : 'right'}:16px;border-${rtl ? 'left' : 'right'}:3px solid ${P.accent};vertical-align:middle">
      <img src="https://${c.web}/logo.png" alt="${project.input.name}" width="72" height="72" style="display:block;border-radius:12px">
    </td>
    <td style="padding-${rtl ? 'right' : 'left'}:16px;vertical-align:middle">
      <div style="font-size:16px;font-weight:bold;color:${P.primary}">${c.name}</div>
      <div style="color:#666">${c.title}, ${project.input.name}</div>
      <div style="margin-top:6px"><span dir="ltr">${c.phone}</span> &nbsp;|&nbsp; <a href="mailto:${c.email}" style="color:${P.primary};text-decoration:none">${c.email}</a></div>
      <div><a href="https://${c.web}" style="color:${P.primary};text-decoration:none">${c.web}</a></div>
      <div style="margin-top:6px;font-style:italic;color:#888">${concept.tagline}</div>
    </td>
  </tr>
</table>`;
}
