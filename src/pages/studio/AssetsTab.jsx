import { useRef } from 'react';
import { Check } from 'lucide-react';
import ScaledFrame from '../../components/social/ScaledFrame';
import { Background, COVERS, CoverDesign, PROFILES, ProfileDesign, AppIconDesign, emailSignatureHtml } from '../../components/brand/BrandKit';
import Logo from '../../components/brand/Logo';
import { useI18n } from '../../i18n/I18nContext';
import { useProjects } from '../../store/ProjectsContext';
import { BG_STYLES, defaultBg } from '../../lib/backgrounds';
import { downloadNode, downloadBackground, downloadLogo } from '../../lib/download';
import { slugify } from '../../lib/generator';
import { paletteMap } from '../../lib/brand';
import { buildLogoSvg } from '../../lib/logoSvg';
import { Heading, DownloadButtons, CopyButton, useAsyncAction } from './shared';

const btn = 'inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-ink/60 px-2.5 text-xs font-medium text-soft backdrop-blur transition-colors hover:border-lilac/50 hover:text-paper disabled:opacity-50';

function Exportable({ id, w, h, ratio, filename, busy, run, children, label, sub, className = '', frameClass = '' }) {
  const ref = useRef(null);
  return (
    <div className={`panel overflow-hidden ${className}`}>
      <div className={frameClass}><ScaledFrame ref={ref} width={w} height={h}>{children}</ScaledFrame></div>
      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
        <div className="min-w-0">
          <div className="truncate text-sm text-soft">{label}</div>
          {sub && <div dir="ltr" className="text-xs text-mute rtl:text-end">{sub}</div>}
        </div>
        <DownloadButtons id={id} busy={busy} onPng={() => run(`${id}-png`, () => downloadNode(ref.current, filename, ratio))} />
      </div>
    </div>
  );
}

export default function AssetsTab({ project, concept, ci }) {
  const { t, pick } = useI18n();
  const { updateConcept } = useProjects();
  const [busy, run] = useAsyncAction();
  const name = project.input.name;
  const slug = slugify(name);
  const P = paletteMap(concept);
  const current = concept.background || defaultBg(project.input.personality);
  const signature = emailSignatureHtml(project, concept);
  // The preview shows the real logo; the copied HTML keeps the link to the hosted file.
  const previewLogo = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildLogoSvg({ name, concept, layout: 'icon', variant: 'onPrimary', background: P.primary }))}`;
  const signaturePreview = signature.replace(`https://${concept.card.web}/logo.png`, previewLogo);
  const k = (key) => t(`studio.kit.${key}`);

  return (
    <div className="space-y-14">
      {/* Backgrounds and patterns */}
      <section>
        <Heading title={k('bgTitle')} sub={k('bgSub')} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BG_STYLES.map((b) => {
            const active = b.id === current;
            return (
              <div key={b.id} className={`panel overflow-hidden ${active ? '!border-amethyst/70 ring-1 ring-amethyst/30' : ''}`}>
                <button onClick={() => updateConcept(project.id, ci, { background: b.id })} className="block aspect-video w-full" aria-label={`${pick(b)}: ${k('use')}`}>
                  <Background styleId={b.id} concept={concept} name={name} w={480} h={270} className="h-full w-full" />
                </button>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-sm text-soft">{active && <Check className="h-4 w-4 text-lilac" />}{pick(b)}</span>
                  <div className="flex gap-1.5">
                    <button className={btn} disabled={!!busy} onClick={() => run(`${b.id}-d`, () => downloadBackground({ format: 'png', styleId: b.id, concept, name, w: 1920, h: 1080, label: 'desktop' }))}>{k('desktop')}</button>
                    <button className={btn} disabled={!!busy} onClick={() => run(`${b.id}-p`, () => downloadBackground({ format: 'png', styleId: b.id, concept, name, w: 1080, h: 1920, label: 'phone' }))}>{k('phone')}</button>
                    <button className={btn} disabled={!!busy} onClick={() => run(`${b.id}-s`, () => downloadBackground({ format: 'svg', styleId: b.id, concept, name, w: 1920, h: 1080, label: 'vector' }))}>SVG</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cover images */}
      <section>
        <Heading title={k('coversTitle')} sub={k('coversSub')} />
        <div className="grid gap-4 lg:grid-cols-2">
          {COVERS.map((cv) => (
            <Exportable key={cv.id} id={`cover-${cv.id}`} w={cv.w} h={cv.h} ratio={cv.ratio} filename={`${slug}-cover-${cv.id}.png`} busy={busy} run={run}
              label={k(cv.id)} sub={cv.out} className={cv.id === 'youtube' || cv.id === 'call' ? '' : 'lg:col-span-2'}>
              <CoverDesign cover={cv} styleId={current} project={project} concept={concept} />
            </Exportable>
          ))}
        </div>
      </section>

      {/* Profile pictures + app icon */}
      <section className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Heading title={k('profileTitle')} sub={k('profileSub')} />
          <div className="grid grid-cols-3 gap-3">
            {PROFILES.map((kind) => (
              <Exportable key={kind} id={`profile-${kind}`} w={400} h={400} ratio={2.7} filename={`${slug}-profile-${kind}.png`} busy={busy} run={run}
                label={k(`profile_${kind}`)} frameClass="p-4 [&>div]:overflow-hidden [&>div]:rounded-full">
                <ProfileDesign kind={kind} styleId={current} project={project} concept={concept} />
              </Exportable>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <Heading title={k('iconTitle')} sub={k('iconSub')} />
          <div className="panel p-5">
            <div className="flex items-end gap-5">
              <div className="w-32 shrink-0"><ScaledFrame width={256} height={256}><AppIconDesign project={project} concept={concept} /></ScaledFrame></div>
              <div className="flex items-end gap-3">
                {[48, 32, 16].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-1.5">
                    <span className="flex items-center justify-center rounded-[22%]" style={{ width: s, height: s, background: P.primary }}>
                      <Logo name={name} concept={concept} layout="icon" variant="onPrimary" style={{ width: s * 0.8, height: s * 0.8 }} />
                    </span>
                    <span dir="ltr" className="text-[10px] text-mute">{s}px</span>
                  </div>
                ))}
              </div>
            </div>
            <AppIconExport project={project} concept={concept} busy={busy} run={run} label={k('appIcon')} faviconLabel={k('favicon')} slug={slug} primary={P.primary} />
          </div>
        </div>
      </section>

      {/* Email signature */}
      <section>
        <Heading title={k('signatureTitle')} sub={k('signatureSub')}
          action={<CopyButton value={signature} label={k('copyHtml')} className="rounded-lg border border-line px-3 py-2 text-sm text-soft hover:text-paper" />} />
        <div className="overflow-x-auto rounded-2xl bg-white p-6 sm:p-8">
          <div dangerouslySetInnerHTML={{ __html: signaturePreview }} />
        </div>
      </section>
    </div>
  );
}

function AppIconExport({ project, concept, busy, run, label, faviconLabel, slug, primary }) {
  const ref = useRef(null);
  return (
    <>
      <div aria-hidden style={{ position: 'fixed', left: -10000, top: 0 }}><div ref={ref}><AppIconDesign project={project} concept={concept} size={256} /></div></div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
        <button className={btn} disabled={!!busy} onClick={() => run('app-png', () => downloadNode(ref.current, `${slug}-app-icon-1024.png`, 4))}>{label} PNG</button>
        <button className={btn} disabled={!!busy} onClick={() => run('fav-svg', () => downloadLogo({ format: 'svg', name: project.input.name, concept, layout: 'icon', variant: 'onPrimary', background: primary, filename: `${slug}-favicon` }))}>{faviconLabel} SVG</button>
        <button className={btn} disabled={!!busy} onClick={() => run('fav-png', () => downloadLogo({ format: 'png', name: project.input.name, concept, layout: 'icon', variant: 'onPrimary', background: primary, width: 512, filename: `${slug}-favicon` }))}>{faviconLabel} PNG</button>
      </div>
    </>
  );
}
