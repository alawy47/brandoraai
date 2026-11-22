import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown, Plus, FileText, Wand2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/brand/Logo';
import PaletteStrip from '../components/brand/PaletteStrip';
import ScaledFrame from '../components/social/ScaledFrame';
import { InstagramPost, InstagramStory } from '../components/social/SocialDesigns';
import { BoxMockup, CardFront } from '../components/mockups/Mockups';
import Footer from '../components/layout/Footer';
import { useI18n } from '../i18n/I18nContext';
import { buildSampleProjects } from '../data/sampleProjects';
import { findCategory, findPersonality } from '../data/options';
import { paletteMap } from '../lib/brand';

function LiveStudio({ samples }) {
  const { t, pick } = useI18n();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % samples.length), 4200);
    return () => clearInterval(id);
  }, [samples.length, reduce]);
  const p = samples[i];
  const c = p.concepts[p.selected];
  const P = paletteMap(c);

  return (
    <div className="panel relative overflow-hidden p-3 shadow-[0_40px_120px_-40px_rgba(110,63,240,.55)] sm:p-4">
      <div className="flex items-center justify-between px-2 pb-3 pt-1 text-xs text-mute">
        <span className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-success" />{t('landing.studioLabel')}</span>
        <span>{t('landing.generating')} {p.selected + 1} {t('landing.of')} 3</span>
      </div>
      {/* The brief */}
      <AnimatePresence mode="wait">
        <motion.div key={`brief-${p.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-1.5 px-2 pb-3">
          {[p.input.name, pick(findCategory(p.input.category)), pick(findPersonality(p.input.personality))].map((x, k) => (
            <motion.span key={x} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.12 }}
              className="rounded-lg border border-line bg-ink-2 px-2.5 py-1 text-xs text-soft">{x}</motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
      {/* The output */}
      <div className="relative overflow-hidden rounded-[14px]" style={{ background: P.light }}>
        <AnimatePresence mode="wait">
          <motion.div key={p.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.01 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex h-44 items-center justify-center px-8 sm:h-52">
              <Logo name={p.input.name} concept={c} className="h-20 w-full max-w-[300px] sm:h-24" />
            </div>
            <div className="grid grid-cols-5">
              {c.palette.map((s, k) => (
                <motion.div key={s.role} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.25 + k * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: s.hex, transformOrigin: 'bottom' }} className="flex h-20 items-end p-2">
                  <span dir="ltr" className="font-mono text-[10px] opacity-80" style={{ color: k > 2 ? (k === 3 ? '#fff' : '#111') : P.light }}>{s.hex}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`meta-${p.id}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 px-2 pb-1 pt-4 text-sm">
          <div>
            <div className="text-xs text-mute">{c.title}</div>
            <div className="mt-1 truncate text-paper" dir={p.input.language === 'ar' ? 'rtl' : 'ltr'}>{c.tagline}</div>
          </div>
          <div className="text-end">
            <div className="text-xs text-mute">Aa</div>
            <div className="mt-1 truncate text-paper">{p.input.language === 'ar' ? c.fonts.headingAr : c.fonts.heading}</div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-3 flex gap-1.5 px-2 pb-1">
        {samples.map((s, k) => (
          <button key={s.id} onClick={() => setI(k)} aria-label={s.input.name}
            className={`h-1 flex-1 rounded-full transition-colors ${k === i ? 'bg-lilac' : 'bg-line-2 hover:bg-mute'}`} />
        ))}
      </div>
    </div>
  );
}

function Section({ id, title, sub, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 ${className}`}>
      <div className="mb-12 max-w-2xl">
        <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-[44px]">{title}</h2>
        {sub && <p className="mt-4 text-lg leading-relaxed text-mute">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Deliverable({ title, sub, children, className = '' }) {
  return (
    <div className={`panel flex flex-col overflow-hidden ${className}`}>
      <div className="flex-1 p-4">{children}</div>
      <div className="border-t border-line px-5 py-4">
        <h3 className="font-display text-[17px] font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-mute">{sub}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  const { t, pick } = useI18n();
  const samples = useMemo(() => buildSampleProjects(), []);
  const hero = samples[0];
  const hc = hero.concepts[hero.selected];
  const HP = paletteMap(hc);

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-40 start-1/2 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(155,107,255,.28),transparent)] rtl:translate-x-1/2" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
          <div>
            <h1 className="font-display text-[42px] font-semibold leading-[1.02] tracking-[-0.035em] text-balance sm:text-6xl lg:text-[76px]">
              {t('landing.heroTitle')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-soft/90">{t('landing.heroSub')}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" to="/create"><Wand2 className="h-5 w-5" />{t('landing.ctaPrimary')}</Button>
              <Button size="lg" variant="outline" href="#showcase">{t('landing.ctaSecondary')}</Button>
            </div>
            <p className="mt-5 text-sm text-mute">{t('landing.heroNote')}</p>
          </div>
          <LiveStudio samples={samples} />
        </div>
      </section>

      <div className="border-y border-line bg-ink-2/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-7 sm:px-6 lg:flex-row lg:justify-between">
          <p className="text-sm text-mute">{t('landing.trust')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-80">
            {samples.slice(0, 5).map((s) => (
              <Logo key={s.id} name={s.input.name} concept={s.concepts[s.selected]} variant="white" className="h-7 w-28 opacity-60 grayscale" />
            ))}
          </div>
        </div>
      </div>

      {/* Deliverables */}
      <Section id="features" title={t('landing.deliverTitle')} sub={t('landing.deliverSub')}>
        <div className="grid gap-4 md:grid-cols-6">
          <Deliverable className="md:col-span-3" title={t('landing.d1')} sub={t('landing.d1s')}>
            <div className="grid h-full grid-cols-2 gap-2">
              <div className="col-span-2 flex h-36 items-center justify-center rounded-xl px-6" style={{ background: HP.light }}><Logo name={hero.input.name} concept={hc} className="h-16 w-full max-w-[260px]" /></div>
              <div className="flex h-28 items-center justify-center rounded-xl" style={{ background: HP.dark }}><Logo name={hero.input.name} concept={hc} variant="inverse" layout="stacked" className="h-20 w-28" /></div>
              <div className="flex h-28 items-center justify-center rounded-xl" style={{ background: HP.primary }}><Logo name={hero.input.name} concept={hc} variant="onPrimary" layout="icon" className="h-16 w-16" /></div>
            </div>
          </Deliverable>
          <Deliverable className="md:col-span-3" title={t('landing.d2')} sub={t('landing.d2s')}>
            <div className="flex h-full flex-col gap-3">
              <div className="grid flex-1 grid-cols-5 overflow-hidden rounded-xl">
                {hc.palette.map((s) => <div key={s.role} className="min-h-28" style={{ background: s.hex }} />)}
              </div>
              <div className="flex items-end justify-between gap-4 rounded-xl px-5 py-4" style={{ background: HP.light, color: HP.dark }}>
                <span style={{ fontFamily: hc.fonts.heading }} className="text-5xl font-bold leading-none">Aa</span>
                <span className="text-end text-xs leading-relaxed" style={{ fontFamily: hc.fonts.body }}>{hc.fonts.heading}<br />{hc.fonts.body}</span>
              </div>
            </div>
          </Deliverable>
          <Deliverable className="md:col-span-2" title={t('landing.d3')} sub={t('landing.d3s')}>
            <div className="grid grid-cols-[1.6fr_1fr] gap-2">
              <ScaledFrame width={540} height={540} className="rounded-lg"><InstagramPost project={hero} concept={hc} post={hc.social.posts[0]} /></ScaledFrame>
              <ScaledFrame width={270} height={480} className="rounded-lg"><InstagramStory project={hero} concept={hc} story={hc.social.stories[0]} /></ScaledFrame>
            </div>
          </Deliverable>
          <Deliverable className="md:col-span-2" title={t('landing.d4')} sub={t('landing.d4s')}>
            <div className="relative flex h-full min-h-48 items-center justify-center rounded-xl" style={{ background: `linear-gradient(160deg, ${HP.secondary}, ${HP.light})` }}>
              <div className="w-1/2"><BoxMockup project={hero} concept={hc} /></div>
              <div className="absolute bottom-4 end-4 w-[46%] rotate-[-6deg] overflow-hidden rounded-md shadow-xl"><ScaledFrame width={350} height={200}><CardFront project={hero} concept={hc} /></ScaledFrame></div>
            </div>
          </Deliverable>
          <Deliverable className="md:col-span-2" title={t('landing.d5')} sub={t('landing.d5s')}>
            <div className="relative flex h-full min-h-48 items-center justify-center">
              {[2, 1, 0].map((k) => (
                <div key={k} className="absolute aspect-[297/210] w-[70%] rounded-md border border-black/5 p-3 shadow-2xl"
                  style={{ background: k === 0 ? HP.dark : HP.light, transform: `translate(${k * 14}px, ${k * -12}px) rotate(${k * 3}deg)` }}>
                  {k === 0 && <div className="flex h-full flex-col justify-between"><Logo name={hero.input.name} concept={hc} variant="inverse" className="h-7 w-28" /><div><FileText className="h-4 w-4 text-white/40" /><div className="mt-1 h-1.5 w-1/2 rounded-full" style={{ background: HP.accent }} /></div></div>}
                </div>
              ))}
            </div>
          </Deliverable>
        </div>
      </Section>

      {/* How it works */}
      <Section id="how" title={t('landing.howTitle')} className="border-t border-line">
        <ol className="grid gap-px overflow-hidden rounded-[20px] border border-line bg-line md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className="bg-ink p-7 sm:p-9">
              <span className="font-display text-5xl font-semibold text-amethyst/80">{n}</span>
              <h3 className="mt-6 font-display text-xl font-semibold">{t(`landing.s${n}`)}</h3>
              <p className="mt-2 leading-relaxed text-mute">{t(`landing.s${n}s`)}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Showcase */}
      <Section id="showcase" title={t('landing.showcaseTitle')} sub={t('landing.showcaseSub')} className="border-t border-line">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {samples.map((s) => {
            const c = s.concepts[s.selected];
            const P = paletteMap(c);
            return (
              <Link key={s.id} to={`/project/${s.id}`} className="group panel overflow-hidden transition-colors hover:border-line-2">
                <div className="flex h-48 items-center justify-center px-8 transition-transform duration-500 group-hover:scale-[1.02]" style={{ background: P.light }}>
                  <Logo name={s.input.name} concept={c} className="h-20 w-full max-w-[260px]" />
                </div>
                <PaletteStrip palette={c.palette} className="h-2" rounded="" />
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="font-medium">{s.input.name}</div>
                    <div className="text-sm text-mute">{pick(findCategory(s.input.category))}</div>
                  </div>
                  <span className="text-xs text-mute">{c.title}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" title={t('landing.pricingTitle')} className="border-t border-line">
        <div className="grid gap-4 lg:grid-cols-3">
          {t('landing.plans').map((plan) => (
            <div key={plan.name} className={`relative flex flex-col rounded-[20px] border p-7 ${plan.featured ? 'border-amethyst/60 bg-[linear-gradient(180deg,rgba(155,107,255,.14),rgba(155,107,255,.02))]' : 'border-line bg-surface'}`}>
              {plan.featured && <span className="absolute -top-3 start-7 rounded-full bg-amethyst px-3 py-1 text-xs font-medium text-white">{t('landing.popular')}</span>}
              <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-mute">{plan.desc}</p>
              <div className="mt-6 flex items-baseline gap-1"><span className="font-display text-5xl font-semibold">{plan.price}</span><span className="text-mute">{t('landing.perMonth')}</span></div>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => <li key={f} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lilac" />{f}</li>)}
              </ul>
              <Button className="mt-8" variant={plan.featured ? 'primary' : 'subtle'} to="/create">{plan.cta}</Button>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section title={t('landing.faqTitle')} className="border-t border-line">
        <div className="max-w-3xl divide-y divide-line border-y border-line">
          {t('landing.faq').map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {f.q}<ChevronDown className="h-5 w-5 shrink-0 text-mute transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-mute">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grain relative overflow-hidden rounded-[28px] border border-line-2 bg-[radial-gradient(120%_140%_at_100%_0%,#3B2380_0%,#1B1630_45%,#100D1A_100%)] px-6 py-16 text-center sm:px-16">
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">{t('landing.finalTitle')}</h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-soft/80">{t('landing.finalSub')}</p>
          <Button size="lg" className="mt-8" to="/create"><Plus className="h-5 w-5" />{t('landing.ctaPrimary')}</Button>
        </div>
      </section>
      <Footer />
    </>
  );
}
