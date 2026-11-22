import { useI18n } from '../../i18n/I18nContext';
import { rgbString, cmykString, contrastRatio, readableOn } from '../../lib/color';
import { paletteMap } from '../../lib/brand';
import { fontStack } from '../../data/fonts';
import { Heading, CopyButton } from './shared';

const SPECIMEN = {
  en: { head: 'Designed with intent', body: 'Good typography is invisible. It sets the pace of reading, gives your story a voice and makes every message feel like it came from the same place.' },
  ar: { head: 'تصميم بهدف واضح', body: 'الطباعة الجيدة لا تُلاحظ. فهي تضبط إيقاع القراءة، وتمنح قصتك صوتًا، وتجعل كل رسالة تبدو صادرة من المكان نفسه.' },
};

function TypeCard({ label, labels, heading, body, lang, colors, scriptLabel }) {
  const s = SPECIMEN[lang];
  return (
    <div className="overflow-hidden rounded-[20px] border border-line" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-7 sm:p-9" style={{ background: colors.light, color: colors.dark }}>
        <div className="flex items-start justify-between gap-4 text-xs opacity-60"><span>{label}</span><span>{scriptLabel}</span></div>
        <div className="mt-6 grid gap-8 sm:grid-cols-[auto_1fr] sm:items-end">
          <span className="text-[96px] font-bold leading-[0.85]" style={{ fontFamily: fontStack(heading), color: colors.primary }}>{lang === 'ar' ? 'أب' : 'Aa'}</span>
          <div>
            <div className="text-3xl font-bold leading-tight" style={{ fontFamily: fontStack(heading) }}>{s.head}</div>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed opacity-80" style={{ fontFamily: fontStack(body) }}>{s.body}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-line bg-surface text-sm rtl:divide-x-reverse">
        <div className="p-4"><div className="text-xs text-mute">{labels[0]}</div><div style={{ fontFamily: fontStack(heading) }} className="mt-0.5 text-base">{heading}</div></div>
        <div className="p-4"><div className="text-xs text-mute">{labels[1]}</div><div style={{ fontFamily: fontStack(body) }} className="mt-0.5 text-base">{body}</div></div>
      </div>
    </div>
  );
}

export default function IdentityTab({ project, concept }) {
  const { t } = useI18n();
  const P = paletteMap(concept);
  const brandLang = project.input.language === 'ar' ? 'ar' : 'en';
  const scale = [['Display', 64], ['H1', 44], ['H2', 30], ['H3', 22], ['Body', 16], ['Caption', 13]];
  const pairs = [['primary', 'light'], ['dark', 'light'], ['light', 'primary'], ['dark', 'accent']];
  const pairings = [
    { lang: 'en', heading: concept.fonts.heading, body: concept.fonts.body, script: t('studio.latin') },
    { lang: 'ar', heading: concept.fonts.headingAr, body: concept.fonts.bodyAr, script: t('studio.arabicScript') },
  ];
  if (brandLang === 'ar') pairings.reverse();
  const hf = brandLang === 'ar' ? concept.fonts.headingAr : concept.fonts.heading;
  const bf = brandLang === 'ar' ? concept.fonts.bodyAr : concept.fonts.body;

  return (
    <div className="space-y-14">
      <section>
        <Heading title={t('studio.palette')} sub={t('studio.paletteSub')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {concept.palette.map((c, i) => {
            const fg = readableOn(c.hex);
            return (
              <div key={c.role} className={`overflow-hidden rounded-2xl border border-line ${i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                <div className="flex h-44 flex-col justify-between p-4" style={{ background: c.hex, color: fg }}>
                  <span className="text-xs opacity-75">{t(`studio.roles.${c.role}`)}</span>
                  <span className="font-display text-xl font-semibold">{c.name[brandLang]}</span>
                </div>
                <div className="space-y-1.5 bg-surface p-4 text-xs">
                  {[['HEX', c.hex], ['RGB', rgbString(c.hex)], ['CMYK', cmykString(c.hex)]].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2">
                      <span className="text-mute">{k}</span>
                      <CopyButton value={v} className="font-mono text-soft hover:text-paper" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pairs.map(([fg, bg]) => {
            const r = contrastRatio(P[fg], P[bg]);
            const grade = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA Large' : 'Decorative';
            return (
              <div key={fg + bg} className="flex items-center justify-between rounded-xl border border-line px-4 py-3" style={{ background: P[bg], color: P[fg] }}>
                <span className="font-display text-lg font-semibold">Aa</span>
                <span className="text-end text-xs"><span className="block font-medium" dir="ltr">{r.toFixed(1)}:1</span><span className="opacity-75">{grade}</span></span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <Heading title={t('studio.typography')} />
        <div className="grid gap-4 lg:grid-cols-2">
          {pairings.map((p) => <TypeCard key={p.lang} label={t('studio.typography')} labels={[t('studio.heading'), t('studio.body')]} heading={p.heading} body={p.body} lang={p.lang} colors={P} scriptLabel={p.script} />)}
        </div>
      </section>

      <section>
        <Heading title={t('studio.scale')} />
        <div className="panel divide-y divide-line" dir={brandLang === 'ar' ? 'rtl' : 'ltr'}>
          {scale.map(([label, size]) => (
            <div key={label} className="flex items-baseline gap-6 overflow-hidden px-5 py-4">
              <span className="w-20 shrink-0 text-xs text-mute" dir="ltr">{label} {size}px</span>
              <span className="truncate" style={{ fontFamily: fontStack(size >= 22 ? hf : bf), fontSize: size, fontWeight: size >= 22 ? 700 : 400, lineHeight: 1.15 }}>{project.input.name} {concept.tagline}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
