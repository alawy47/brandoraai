import { useState } from 'react';
import { buildLogoSvg, markSvg, logoColors, wordmarkStyle } from '../../lib/logoSvg';
import { brandFonts, paletteMap, nestSvg } from '../../lib/brand';
import { initialOf } from '../../lib/generator';
import { useFontsReady } from '../../lib/useFontsReady';
import { mix, withAlpha } from '../../lib/color';
import ScaledFrame from '../social/ScaledFrame';

function Svg({ html, style, className = '' }) {
  return <div className={`[&>svg]:h-full [&>svg]:w-full ${className}`} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

function markOnly(concept, name, variant) {
  const c = logoColors(concept.palette, variant, concept.logo.colorway);
  const wm = wordmarkStyle(concept, name);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${markSvg(concept.logo.mark, c, initialOf(name), wm.family, wm.weight)}</svg>`;
}

/* Business card, 3.5 × 2 in at 100px/in */
export function CardFront({ project, concept }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const f = brandFonts(concept, lang);
  return (
    <div style={{ width: 350, height: 200, background: P.dark, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <Svg html={markOnly(concept, project.input.name, 'inverse')} style={{ position: 'absolute', width: 260, height: 260, insetInlineEnd: -90, top: -50, opacity: 0.07 }} />
      <Svg html={buildLogoSvg({ name: project.input.name, concept, variant: 'inverse', layout: 'stacked' })} style={{ height: 92, width: 220 }} />
      <span style={{ fontFamily: f.body, color: P.secondary, fontSize: 10.5, letterSpacing: lang === 'ar' ? 0 : '0.06em' }}>{concept.tagline}</span>
      <div style={{ position: 'absolute', bottom: 0, insetInline: 0, height: 5, background: P.accent }} />
    </div>
  );
}

export function CardBack({ project, concept }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const f = brandFonts(concept, lang);
  const c = concept.card;
  const line = (v) => <div dir="ltr" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>{v}</div>;
  return (
    <div style={{ width: 350, height: 200, background: P.light, color: P.dark, position: 'relative', overflow: 'hidden', padding: 26, display: 'flex', flexDirection: 'column', direction: lang === 'ar' ? 'rtl' : 'ltr', fontFamily: f.body }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, insetInlineEnd: 0, width: 8, background: P.primary }} />
      <div style={{ fontFamily: f.heading, fontSize: 19, fontWeight: 700, color: P.primary }}>{c.name}</div>
      <div style={{ fontSize: 10.5, marginTop: 3, opacity: 0.7 }}>{c.title}</div>
      <div style={{ marginTop: 'auto', fontSize: 10, lineHeight: 1.75 }}>
        {line(c.phone)}{line(c.email)}{line(c.web)}<div>{c.city}</div>
      </div>
      <Svg html={markOnly(concept, project.input.name, 'primary')} style={{ position: 'absolute', width: 46, height: 46, bottom: 24, insetInlineEnd: 30 }} />
    </div>
  );
}

export function FlipCard({ project, concept, flipLabel }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button onClick={() => setFlipped((f) => !f)} aria-label={flipLabel} className="group block w-full [perspective:1400px]">
      <div className="relative mx-auto aspect-[7/4] w-full max-w-[460px] transition-transform duration-700 ease-out-soft [transform-style:preserve-3d] group-hover:[transform:rotateX(4deg)_rotateY(-6deg)]"
        style={flipped ? { transform: 'rotateY(180deg)' } : undefined}>
        {[false, true].map((back) => (
          <div key={String(back)} className="absolute inset-0 overflow-hidden rounded-[10px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)] [backface-visibility:hidden]" style={back ? { transform: 'rotateY(180deg)' } : undefined}>
            <ScaledFrame width={350} height={200}>{back ? <CardBack project={project} concept={concept} /> : <CardFront project={project} concept={concept} />}</ScaledFrame>
          </div>
        ))}
      </div>
    </button>
  );
}

/* Isometric gift box */
export function BoxMockup({ project, concept, width = 340 }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const logo = buildLogoSvg({ name: project.input.name, concept, variant: 'onPrimary', layout: 'stacked' });
  const icon = markOnly(concept, project.input.name, 'onPrimary');
  const top = mix(P.primary, '#FFFFFF', 0.16), left = mix(P.primary, '#000000', 0.28);
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${width}" height="${width}">
    <ellipse cx="150" cy="268" rx="125" ry="16" fill="#000" opacity=".28"/>
    <polygon points="150,40 270,90 150,140 30,90" fill="${top}"/>
    <polygon points="30,90 150,140 150,262 30,212" fill="${left}"/>
    <polygon points="150,140 270,90 270,212 150,262" fill="${P.primary}"/>
    <polygon points="90,65 110,57 230,107 210,115" fill="${P.accent}"/>
    <polygon points="210,115 230,107 230,229 210,237" fill="${P.accent}" opacity=".9"/>
    <g transform="matrix(1 ${-50 / 120} 0 1 150 140)">${nestSvg(logo, 6, 18, 58, 76)}</g>
    <g transform="matrix(1 ${50 / 120} 0 1 30 90)" opacity=".85">${nestSvg(icon, 35, 36, 50, 50)}</g>
    <polygon points="150,140 150,262 147,261 147,141" fill="#000" opacity=".12"/>
  </svg>`;
  return <Svg html={html} style={{ width: '100%', aspectRatio: '1' }} />;
}

/* Shopping bag */
export function BagMockup({ project, concept, width = 340 }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const logo = buildLogoSvg({ name: project.input.name, concept, variant: 'primary', layout: 'stacked' });
  const side = mix(P.light, '#000000', 0.12);
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${width}" height="${width}">
    <ellipse cx="150" cy="272" rx="110" ry="12" fill="#000" opacity=".28"/>
    <path d="M110 92V70a40 40 0 0 1 80 0v22" fill="none" stroke="${P.dark}" stroke-width="6" stroke-linecap="round"/>
    <polygon points="200,92 236,104 232,266 200,270" fill="${side}"/>
    <rect x="64" y="92" width="136" height="178" fill="${P.light}"/>
    <rect x="64" y="92" width="136" height="20" fill="${P.primary}"/>
    <circle cx="110" cy="102" r="4" fill="${P.light}"/><circle cx="190" cy="102" r="4" fill="${P.light}"/>
    ${nestSvg(logo, 82, 140, 100, 90)}
    <rect x="64" y="256" width="136" height="14" fill="${P.accent}"/>
  </svg>`;
  return <Svg html={html} style={{ width: '100%', aspectRatio: '1' }} />;
}

/* Category product: cup, bottle or hang tag */
export function ProductMockup({ project, concept, pack, width = 340 }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const name = project.input.name;
  const icon = markOnly(concept, name, 'onPrimary');
  const logo = buildLogoSvg({ name, concept, variant: 'primary', layout: 'stacked' });
  let body;
  if (pack === 'cup') {
    body = `<ellipse cx="150" cy="272" rx="80" ry="10" fill="#000" opacity=".28"/>
      <path d="M86 78h128l-16 190H102z" fill="${P.light}"/>
      <path d="M92 140h116l-6 70H98z" fill="${P.primary}"/>
      ${nestSvg(icon, 130, 152, 40, 40)}
      <rect x="78" y="62" width="144" height="18" rx="6" fill="${P.dark}"/>
      <path d="M96 62q54-26 108 0" fill="${mix(P.dark, '#fff', 0.15)}"/>
      <path d="M102 268h96" stroke="${P.accent}" stroke-width="4"/>`;
  } else if (pack === 'bottle') {
    body = `<ellipse cx="150" cy="274" rx="70" ry="9" fill="#000" opacity=".28"/>
      <rect x="128" y="30" width="44" height="40" rx="6" fill="${P.accent}"/>
      <rect x="138" y="68" width="24" height="16" fill="${mix(P.accent, '#000', 0.25)}"/>
      <rect x="92" y="84" width="116" height="188" rx="26" fill="${P.primary}"/>
      <rect x="100" y="92" width="10" height="170" rx="5" fill="#fff" opacity=".14"/>
      <rect x="106" y="138" width="88" height="100" rx="8" fill="${P.light}"/>
      ${nestSvg(logo, 112, 146, 76, 84)}`;
  } else {
    body = `<ellipse cx="150" cy="272" rx="90" ry="10" fill="#000" opacity=".25"/>
      <path d="M150 20v40" stroke="${P.dark}" stroke-width="2"/>
      <path d="M94 60h112l18 22v180H76V82z" fill="${P.primary}"/>
      <circle cx="150" cy="82" r="8" fill="${P.light}"/>
      ${nestSvg(icon, 110, 120, 80, 80)}
      <rect x="76" y="238" width="148" height="24" fill="${P.accent}"/>`;
  }
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${width}" height="${width}">${body}</svg>`;
  return <Svg html={html} style={{ width: '100%', aspectRatio: '1' }} />;
}

export function MockupStage({ concept, children, tone = 'light' }) {
  const P = paletteMap(concept);
  const bg = tone === 'light'
    ? `radial-gradient(120% 90% at 50% 0%, ${mix(P.light, '#FFFFFF', 0.4)} 0%, ${mix(P.secondary, P.light, 0.55)} 100%)`
    : `radial-gradient(120% 90% at 50% 0%, ${mix(P.dark, '#FFFFFF', 0.08)} 0%, ${P.dark} 100%)`;
  return <div style={{ background: bg, boxShadow: `inset 0 0 0 1px ${withAlpha('#ffffff', 0.04)}` }} className="flex items-center justify-center rounded-2xl p-6 sm:p-10">{children}</div>;
}
