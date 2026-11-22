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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${markSvg(concept.logo.mark, c, initialOf(name), wm.family, wm.weight, concept.logo.custom)}</svg>`;
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

/* Apparel: t-shirt (logo on chest) and cap (icon on the front panel) */
export function TeeMockup({ project, concept, width = 340 }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const logo = buildLogoSvg({ name: project.input.name, concept, variant: 'inverse', layout: 'stacked' });
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${width}" height="${width}">
    <ellipse cx="150" cy="282" rx="100" ry="9" fill="#000" opacity=".22"/>
    <path d="M104 30l-62 28-28 62 40 18 14-30v186h164V108l14 30 40-18-28-62-62-28c-6 18-24 28-46 28s-40-10-46-28z" fill="${P.dark}"/>
    <path d="M104 30c6 18 24 28 46 28s40-10 46-28" fill="none" stroke="${mix(P.dark, '#ffffff', 0.18)}" stroke-width="5"/>
    <path d="M150 58v222" stroke="#000" stroke-opacity=".08" stroke-width="1"/>
    ${nestSvg(logo, 112, 92, 76, 70)}
  </svg>`;
  return <Svg html={html} style={{ width: '100%', aspectRatio: '1' }} />;
}

export function CapMockup({ project, concept, width = 340 }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const icon = markOnly(concept, project.input.name, 'onPrimary');
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${width}" height="${width}">
    <ellipse cx="150" cy="240" rx="110" ry="12" fill="#000" opacity=".22"/>
    <path d="M52 176c0-70 44-112 98-112s98 42 98 112z" fill="${P.primary}"/>
    <path d="M150 64v112M98 82c-14 24-20 56-20 94M202 82c14 24 20 56 20 94" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    <circle cx="150" cy="66" r="6" fill="${mix(P.primary, '#000', 0.25)}"/>
    <path d="M40 176h220c18 0 30 10 30 22H24c0-12 4-22 16-22z" fill="${mix(P.primary, '#000', 0.3)}"/>
    ${nestSvg(icon, 122, 108, 56, 56)}
  </svg>`;
  return <Svg html={html} style={{ width: '100%', aspectRatio: '1' }} />;
}

/* Storefront with a fascia sign and an awning in the brand colours */
export function StorefrontMockup({ project, concept, width = 560 }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const sign = buildLogoSvg({ name: project.input.name, concept, variant: 'inverse', layout: 'horizontal' });
  const stripes = Array.from({ length: 10 }, (_, i) => `<path d="M${60 + i * 44} 128h44l-6 40h-44z" fill="${i % 2 ? P.light : P.primary}"/>`).join('');
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 360" width="${width}" height="${width * 360 / 560}">
    <rect width="560" height="360" fill="${mix(P.light, '#c9c4bc', 0.5)}"/>
    <rect x="40" y="40" width="480" height="320" fill="${mix(P.light, '#ffffff', 0.4)}"/>
    <rect x="40" y="52" width="480" height="76" fill="${P.dark}"/>
    ${nestSvg(sign, 150, 62, 260, 56)}
    ${stripes}
    <rect x="70" y="190" width="200" height="150" fill="${mix(P.secondary, '#ffffff', 0.35)}" stroke="${P.dark}" stroke-width="6"/>
    <path d="M170 190v150M70 265h200" stroke="${P.dark}" stroke-width="3"/>
    <rect x="320" y="190" width="120" height="170" fill="${P.primary}" stroke="${P.dark}" stroke-width="6"/>
    <circle cx="420" cy="275" r="5" fill="${P.accent}"/>
    <rect x="300" y="200" width="16" height="44" rx="3" fill="${P.accent}"/>
    <rect x="0" y="348" width="560" height="12" fill="#9b968e"/>
  </svg>`;
  return <Svg html={html} style={{ width: '100%', aspectRatio: '560 / 360' }} />;
}

/* Stationery: A4 letterhead and DL envelope */
export function LetterheadMockup({ project, concept, width = 420 }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const c = concept.card;
  const logo = buildLogoSvg({ name: project.input.name, concept, variant: 'primary', layout: 'horizontal' });
  const lines = Array.from({ length: 9 }, (_, i) => `<rect x="40" y="${150 + i * 16}" width="${i === 8 ? 120 : 190 - (i % 3) * 18}" height="5" rx="2.5" fill="#d8d4dc"/>`).join('');
  const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 340" width="${width}" height="${width * 340 / 420}">
    <rect width="420" height="340" fill="${mix(P.secondary, P.light, 0.6)}"/>
    <g transform="rotate(-4 150 170)"><rect x="200" y="70" width="190" height="96" fill="#fff" stroke="#00000010"/>
      <rect x="200" y="70" width="190" height="6" fill="${P.primary}"/>${nestSvg(logo, 212, 86, 90, 24)}
      <rect x="300" y="122" width="72" height="4" rx="2" fill="#d8d4dc"/><rect x="300" y="132" width="56" height="4" rx="2" fill="#d8d4dc"/><rect x="300" y="142" width="64" height="4" rx="2" fill="#d8d4dc"/></g>
    <rect x="22" y="40" width="230" height="290" fill="#fff" stroke="#00000010"/>
    ${nestSvg(logo, 40, 60, 110, 30)}
    <rect x="40" y="112" width="190" height="1.5" fill="${P.accent}"/>
    ${lines}
    <text x="40" y="312" font-family="Arial, sans-serif" font-size="7" fill="#888">${c.email}  ·  ${c.web}  ·  ${c.phone}</text>
    <rect x="22" y="324" width="230" height="6" fill="${P.primary}"/>
  </svg>`;
  return <Svg html={html} style={{ width: '100%', aspectRatio: '420 / 340' }} />;
}

/* Website header, rendered as a real page section in the brand's fonts and colours */
export function WebsiteHeaderMockup({ project, concept }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const f = brandFonts(concept, lang);
  const nav = lang === 'ar' ? ['المنتجات', 'قصتنا', 'المواقع', 'تواصل'] : ['Shop', 'Our story', 'Locations', 'Contact'];
  const logo = buildLogoSvg({ name: project.input.name, concept, variant: 'primary', layout: 'horizontal' });
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ width: 960, height: 540, background: P.light, color: P.dark, fontFamily: f.body, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 48px' }}>
        <Svg html={logo} style={{ height: 40, width: 190 }} />
        <div style={{ display: 'flex', gap: 30, fontSize: 15 }}>{nav.map((n) => <span key={n}>{n}</span>)}</div>
        <span style={{ background: P.primary, color: P.light, borderRadius: 99, padding: '10px 20px', fontSize: 14, fontWeight: 600 }}>{concept.social.posts[1]?.cta || 'Shop now'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, padding: '50px 48px 0', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: f.heading, fontSize: 58, lineHeight: 1.05, fontWeight: 700 }}>{concept.tagline}</div>
          <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.75, marginTop: 18, maxWidth: 420 }}>{concept.mission}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
            <span style={{ background: P.primary, color: P.light, borderRadius: 12, padding: '14px 24px', fontWeight: 600 }}>{concept.social.posts[1]?.cta}</span>
            <span style={{ border: `1.5px solid ${P.dark}`, borderRadius: 12, padding: '14px 24px', fontWeight: 600 }}>{nav[1]}</span>
          </div>
        </div>
        <div style={{ height: 330, borderRadius: 24, background: `linear-gradient(150deg, ${P.primary}, ${P.dark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Svg html={markOnly(concept, project.input.name, 'onPrimary')} style={{ width: 150, height: 150 }} />
        </div>
      </div>
    </div>
  );
}

/* Instagram profile page: avatar, bio, highlights and a grid of brand tiles */
export function InstagramProfileMockup({ project, concept, tiles }) {
  useFontsReady(concept, project.input.name);
  const P = paletteMap(concept);
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const handle = concept.card.web.replace('.com', '');
  const L = lang === 'ar' ? { posts: 'منشور', followers: 'متابع', following: 'يتابع', follow: 'متابعة', msg: 'مراسلة', hl: ['جديد', 'المنيو', 'قصتنا', 'المواقع'] } : { posts: 'posts', followers: 'followers', following: 'following', follow: 'Follow', msg: 'Message', hl: ['New', 'Menu', 'Story', 'Visit'] };
  const icon = markOnly(concept, project.input.name, 'onPrimary');
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ width: 390, height: 760, background: '#fff', color: '#111', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      <div dir="ltr" style={{ padding: '18px 18px 8px', fontWeight: 700, fontSize: 18 }}>{handle}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '8px 18px' }}>
        <div style={{ width: 86, height: 86, borderRadius: '50%', padding: 3, background: `linear-gradient(45deg, ${P.accent}, ${P.primary})` }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: P.primary, border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Svg html={icon} style={{ width: 46, height: 46 }} /></div>
        </div>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', textAlign: 'center', fontSize: 13 }}>
          {[['128', L.posts], ['24.6K', L.followers], ['312', L.following]].map(([n, l]) => <div key={l}><div style={{ fontWeight: 700, fontSize: 16 }}>{n}</div>{l}</div>)}
        </div>
      </div>
      <div style={{ padding: '4px 18px', fontSize: 13, lineHeight: 1.45 }}>
        <div style={{ fontWeight: 700 }}>{project.input.name}</div>
        <div>{concept.tagline}</div>
        <div dir="ltr" style={{ color: '#00376b', textAlign: lang === 'ar' ? 'right' : 'left' }}>{concept.card.web}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '10px 18px' }}>
        <span style={{ flex: 1, textAlign: 'center', background: '#0095f6', color: '#fff', borderRadius: 8, padding: '7px 0', fontWeight: 600, fontSize: 13 }}>{L.follow}</span>
        <span style={{ flex: 1, textAlign: 'center', background: '#efefef', borderRadius: 8, padding: '7px 0', fontWeight: 600, fontSize: 13 }}>{L.msg}</span>
      </div>
      <div style={{ display: 'flex', gap: 16, padding: '6px 18px 14px' }}>
        {L.hl.map((h, i) => (
          <div key={h} style={{ textAlign: 'center', fontSize: 11 }}>
            <div style={{ width: 58, height: 58, borderRadius: '50%', border: '1px solid #ddd', padding: 3 }}><div style={{ width: '100%', height: '100%', borderRadius: '50%', background: [P.primary, P.secondary, P.dark, P.accent][i] }} /></div>
            <div style={{ marginTop: 4 }}>{h}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>{tiles}</div>
    </div>
  );
}
