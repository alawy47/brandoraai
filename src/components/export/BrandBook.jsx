import { forwardRef } from 'react';
import Logo from '../brand/Logo';
import { InstagramPost, InstagramStory } from '../social/SocialDesigns';
import { CardFront, CardBack, BoxMockup, BagMockup, ProductMockup } from '../mockups/Mockups';
import { paletteMap, brandFonts } from '../../lib/brand';
import { rgbString, cmykString, readableOn, withAlpha } from '../../lib/color';
import { fontStack } from '../../data/fonts';
import { findCategory } from '../../data/options';
import { translations } from '../../i18n/translations';

export const PAGE_W = 1123;
export const PAGE_H = 794;

const L = {
  en: { guidelines: 'Brand guidelines', contents: ['Brand story', 'Logo', 'Color', 'Typography', 'Social media', 'Print & packaging'], clear: 'Keep clear space equal to the height of the icon’s inner detail on every side. Never stretch, recolor outside the palette or add effects.', contact: 'Questions about using the brand?', page: 'Page', minSize: 'Minimum size: 24px digital, 12mm print.' },
  ar: { guidelines: 'دليل الهوية البصرية', contents: ['قصة العلامة', 'الشعار', 'الألوان', 'الخطوط', 'التواصل الاجتماعي', 'المطبوعات والتغليف'], clear: 'حافظ على مساحة فارغة حول الشعار من كل الجهات، ولا تمطّه أو تغيّر ألوانه خارج اللوحة المعتمدة أو تضف إليه مؤثرات.', contact: 'لديك سؤال حول استخدام العلامة؟', page: 'صفحة', minSize: 'الحد الأدنى للحجم: ٢٤ بكسل رقميًا و١٢ ملم للطباعة.' },
};

function Fixed({ w, h, scale, children, style }) {
  return (
    <div style={{ width: w * scale, height: h * scale, overflow: 'hidden', borderRadius: 6, flexShrink: 0, ...style }}>
      <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}

function Page({ children, bg, color, n, title, project, P, f, dir, lang }) {
  return (
    <div data-pdf-page style={{ width: PAGE_W, height: PAGE_H, background: bg, color, position: 'relative', overflow: 'hidden', direction: dir, fontFamily: f.body, flexShrink: 0 }}>
      {title && (
        <div style={{ position: 'absolute', top: 40, insetInline: 56, display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.6 }}>
          <span>{project.input.name}</span><span>{L[lang].guidelines}</span>
        </div>
      )}
      {title && <h2 style={{ position: 'absolute', top: 76, insetInlineStart: 56, margin: 0, fontFamily: f.heading, fontSize: 40, fontWeight: 700, color: P.primary }}>{title}</h2>}
      {children}
      {n && (
        <div style={{ position: 'absolute', bottom: 34, insetInline: 56, display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.5 }}>
          <span>{String(n).padStart(2, '0')}</span><span dir="ltr">{L[lang].page} {n} / 8</span>
        </div>
      )}
    </div>
  );
}

const BrandBook = forwardRef(function BrandBook({ project, concept }, ref) {
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const P = paletteMap(concept);
  const f = brandFonts(concept, lang);
  const tr = translations[lang].studio;
  const l = L[lang];
  const name = project.input.name;
  const common = { project, P, f, dir, lang };
  const pack = findCategory(project.input.category).pack;
  const year = new Date().getFullYear();

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 20, width: PAGE_W }}>
      {/* 1. Cover */}
      <Page {...common} bg={P.dark} color={P.light}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: withAlpha(P.primary, 0.35), filter: 'blur(10px)', insetInlineEnd: -220, top: -260 }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 28 }}>
          <Logo name={name} concept={concept} variant="inverse" layout="stacked" style={{ width: 420, height: 240 }} />
          <div style={{ fontFamily: f.heading, fontSize: 26, color: P.secondary }}>{concept.tagline}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 48, insetInline: 56, display: 'flex', justifyContent: 'space-between', fontSize: 14, opacity: 0.7 }}>
          <span>{l.guidelines}</span><span>{concept.title}</span><span dir="ltr">{year}</span>
        </div>
      </Page>

      {/* 2. Story */}
      <Page {...common} n={2} title={l.contents[0]} bg={P.light} color={P.dark}>
        <div style={{ position: 'absolute', top: 170, insetInline: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
          <div>
            <div style={{ fontFamily: f.heading, fontSize: 52, lineHeight: 1.08, fontWeight: 700, color: P.primary }}>{concept.tagline}</div>
            <p style={{ fontSize: 17, lineHeight: 1.7, marginTop: 28 }}>{concept.story}</p>
          </div>
          <div style={{ display: 'grid', gap: 26, alignContent: 'start' }}>
            <div><div style={{ fontSize: 13, opacity: 0.6 }}>{tr.mission}</div><p style={{ fontSize: 17, lineHeight: 1.6, margin: '6px 0 0' }}>{concept.mission}</p></div>
            <div>
              <div style={{ fontSize: 13, opacity: 0.6 }}>{tr.values}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>{concept.values.map((v) => <span key={v} style={{ background: P.primary, color: P.light, padding: '8px 16px', borderRadius: 99, fontSize: 15 }}>{v}</span>)}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, opacity: 0.6 }}>{tr.voice}</div>
              <div style={{ fontFamily: f.heading, fontSize: 24, marginTop: 6 }}>{concept.voice.traits.join(' / ')}</div>
              <p style={{ fontSize: 16, marginTop: 8, opacity: 0.8 }}>“{concept.voice.sample}”</p>
            </div>
          </div>
        </div>
      </Page>

      {/* 3. Logo */}
      <Page {...common} n={3} title={l.contents[1]} bg="#FFFFFF" color={P.dark}>
        <div style={{ position: 'absolute', top: 160, bottom: 80, insetInline: 56, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14 }}>
          <div style={{ gridRow: 'span 2', background: P.light, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
            <Logo name={name} concept={concept} style={{ width: 380, height: 150 }} />
            <p style={{ fontSize: 13, lineHeight: 1.6, marginTop: 40, opacity: 0.75, maxWidth: 360, textAlign: 'center' }}>{concept.logo.rationale}</p>
          </div>
          {[['inverse', 'horizontal', P.dark], ['onPrimary', 'stacked', P.primary], ['primary', 'icon', P.light], ['mono', 'horizontal', '#F2F2F2']].map(([v, lay, bg]) => (
            <div key={v} style={{ background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <Logo name={name} concept={concept} variant={v} layout={lay} style={{ width: lay === 'icon' ? 100 : 240, height: lay === 'icon' ? 100 : 110 }} />
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 54, insetInline: 56, fontSize: 12, opacity: 0.65, display: 'flex', justifyContent: 'space-between', gap: 40 }}><span style={{ maxWidth: 560 }}>{l.clear}</span><span>{l.minSize}</span></div>
      </Page>

      {/* 4. Color */}
      <Page {...common} n={4} title={l.contents[2]} bg={P.light} color={P.dark}>
        <div style={{ position: 'absolute', top: 160, bottom: 80, insetInline: 56, display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr', gap: 12 }}>
          {concept.palette.map((c) => {
            const fg = readableOn(c.hex);
            return (
              <div key={c.role} style={{ background: c.hex, color: fg, borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }}>
                <div><div style={{ fontSize: 13, opacity: 0.75 }}>{tr.roles[c.role]}</div><div style={{ fontFamily: f.heading, fontSize: 22, fontWeight: 700, marginTop: 4 }}>{c.name[lang]}</div></div>
                <div dir="ltr" style={{ fontSize: 12.5, lineHeight: 1.8, fontFamily: 'ui-monospace, monospace', textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                  <div>HEX {c.hex}</div><div>RGB {rgbString(c.hex)}</div><div>CMYK {cmykString(c.hex)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Page>

      {/* 5. Typography */}
      <Page {...common} n={5} title={l.contents[3]} bg="#FFFFFF" color={P.dark}>
        <div style={{ position: 'absolute', top: 170, insetInline: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {[['en', concept.fonts.heading, concept.fonts.body], ['ar', concept.fonts.headingAr, concept.fonts.bodyAr]].sort((a) => (a[0] === lang ? -1 : 1)).map(([sl, h, b]) => (
            <div key={sl} dir={sl === 'ar' ? 'rtl' : 'ltr'} style={{ borderTop: `3px solid ${P.primary}`, paddingTop: 22 }}>
              <div style={{ fontFamily: fontStack(h), fontSize: 120, fontWeight: 700, lineHeight: 0.95, color: P.primary }}>{sl === 'ar' ? 'أبجد' : 'Aa'}</div>
              <div style={{ fontFamily: fontStack(h), fontSize: 30, fontWeight: 700, marginTop: 18 }}>{h}</div>
              <div style={{ fontSize: 13, opacity: 0.6 }}>{tr.heading}</div>
              <div style={{ fontFamily: fontStack(b), fontSize: 22, marginTop: 18 }}>{b}</div>
              <div style={{ fontSize: 13, opacity: 0.6 }}>{tr.body}</div>
              <p style={{ fontFamily: fontStack(b), fontSize: 14, lineHeight: 1.7, marginTop: 16, opacity: 0.8 }}>{sl === 'ar' ? 'أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ ١٢٣٤٥٦٧٨٩٠' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 1234567890'}</p>
            </div>
          ))}
        </div>
      </Page>

      {/* 6. Social */}
      <Page {...common} n={6} title={l.contents[4]} bg={P.light} color={P.dark}>
        <div style={{ position: 'absolute', top: 175, insetInline: 56, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {concept.social.posts.map((post) => (
            <Fixed key={post.type} w={540} h={540} scale={0.43}><InstagramPost project={project} concept={concept} post={post} /></Fixed>
          ))}
          {concept.social.stories.slice(0, 1).map((story) => (
            <Fixed key={story.type} w={270} h={480} scale={0.86}><InstagramStory project={project} concept={concept} story={story} /></Fixed>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 430, insetInlineStart: 56, width: 724, fontSize: 13.5, lineHeight: 1.6, opacity: 0.8 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{tr.caption}</div>
          {concept.social.posts[0].caption}
          <div style={{ marginTop: 10, color: P.primary }}>{concept.social.hashtags.join('  ')}</div>
        </div>
      </Page>

      {/* 7. Print */}
      <Page {...common} n={7} title={l.contents[5]} bg="#F3F2F5" color={P.dark}>
        <div style={{ position: 'absolute', top: 170, insetInline: 56, display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 30 }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <Fixed w={350} h={200} scale={1.15} style={{ boxShadow: '0 14px 30px rgba(0,0,0,.18)' }}><CardFront project={project} concept={concept} /></Fixed>
            <Fixed w={350} h={200} scale={1.15} style={{ boxShadow: '0 14px 30px rgba(0,0,0,.18)' }}><CardBack project={project} concept={concept} /></Fixed>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignItems: 'center', background: `linear-gradient(160deg, ${P.secondary}, ${P.light})`, borderRadius: 14, padding: 18, height: 478 }}>
            <BoxMockup project={project} concept={concept} /><BagMockup project={project} concept={concept} /><ProductMockup project={project} concept={concept} pack={pack} />
          </div>
        </div>
      </Page>

      {/* 8. Back cover */}
      <Page {...common} bg={P.primary} color={P.light}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
          <Logo name={name} concept={concept} variant="onPrimary" layout="icon" style={{ width: 140, height: 140 }} />
          <div style={{ fontSize: 15, opacity: 0.75 }}>{l.contact}</div>
          <div dir="ltr" style={{ fontFamily: f.heading, fontSize: 26, fontWeight: 700 }}>{concept.card.email}</div>
          <div dir="ltr" style={{ fontSize: 15, opacity: 0.75 }}>{concept.card.web}</div>
        </div>
      </Page>
    </div>
  );
});

export default BrandBook;
