import { useRef, useState } from 'react';
import ScaledFrame from '../../components/social/ScaledFrame';
import { FlipCard, CardFront, CardBack, BoxMockup, BagMockup, ProductMockup, MockupStage, TeeMockup, CapMockup, StorefrontMockup, LetterheadMockup, WebsiteHeaderMockup, InstagramProfileMockup } from '../../components/mockups/Mockups';
import { Background } from '../../components/brand/BrandKit';
import { BG_STYLES } from '../../lib/backgrounds';
import { generateMockupPhoto } from '../../services/ai';
import { useBackend } from '../../services/useBackend';
import Button from '../../components/ui/Button';
import { ImageIcon, Wand2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { findCategory } from '../../data/options';
import { downloadNode } from '../../lib/download';
import { slugify } from '../../lib/generator';
import { Heading, DownloadButtons, useAsyncAction } from './shared';

export default function MockupsTab({ project, concept }) {
  const { t } = useI18n();
  const [busy, run] = useAsyncAction();
  const slug = slugify(project.input.name);
  const front = useRef(null), back = useRef(null), box = useRef(null), bag = useRef(null), product = useRef(null);
  const pack = findCategory(project.input.category).pack;
  const tee = useRef(null), cap = useRef(null), store = useRef(null), letter = useRef(null), web = useRef(null), ig = useRef(null);
  const k = (key) => t(`studio.mk.${key}`);
  const backend = useBackend();
  const [scene, setScene] = useState('storefront');
  const [photo, setPhoto] = useState(null);
  const makePhoto = () => run('photo', async () => setPhoto(await generateMockupPhoto({ project, concept, scene })));
  const tile = (ref, id, label, children, ratio = 2, wide = false) => (
    <div key={id} className={`panel overflow-hidden ${wide ? 'lg:col-span-2' : ''}`}>
      <div ref={ref}>{children}</div>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-sm text-soft">{label}<DownloadButtons id={id} busy={busy} onPng={() => dl(id, ref, id, ratio)} /></div>
    </div>
  );
  const dl = (id, ref, name, ratio = 3) => run(`${id}-png`, () => downloadNode(ref.current, `${slug}-${name}.png`, ratio));

  const packs = [
    { id: 'box', ref: box, label: t('studio.box'), C: BoxMockup },
    { id: 'bag', ref: bag, label: t('studio.bag'), C: BagMockup },
    { id: 'product', ref: product, label: t('studio.label'), C: ProductMockup },
  ];

  return (
    <div className="space-y-14">
      <section>
        <Heading title={t('studio.card')} sub="3.5 × 2 in" />
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <MockupStage concept={concept} tone="dark">
              <div className="w-full py-6">
                <FlipCard project={project} concept={concept} flipLabel={t('studio.flip')} />
                <p className="mt-6 text-center text-xs text-white/50">{t('studio.flip')}</p>
              </div>
            </MockupStage>
          </div>
          <div className="grid gap-4 lg:col-span-2">
            {[[front, CardFront, 'front'], [back, CardBack, 'back']].map(([ref, C, side]) => (
              <div key={side} className="panel overflow-hidden">
                <div className="p-4"><div className="overflow-hidden rounded-md shadow-lg"><ScaledFrame ref={ref} width={350} height={200}><C project={project} concept={concept} /></ScaledFrame></div></div>
                <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-sm text-soft">
                  {t(`studio.${side}`)}
                  <DownloadButtons id={side} busy={busy} onPng={() => dl(side, ref, `business-card-${side}`, 3)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <Heading title={t('studio.packaging')} />
        <div className="grid gap-4 md:grid-cols-3">
          {packs.map(({ id, ref, label, C }) => (
            <div key={id} className="panel overflow-hidden">
              <div ref={ref}>
                <MockupStage concept={concept}><div className="w-full max-w-[280px]"><C project={project} concept={concept} pack={pack} /></div></MockupStage>
              </div>
              <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-sm text-soft">
                {label}
                <DownloadButtons id={id} busy={busy} onPng={() => dl(id, ref, id, 2)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Heading title={k('apparelTitle')} sub={k('apparelSub')} />
        <div className="grid gap-4 md:grid-cols-3">
          {tile(tee, 'tshirt', k('tee'), <MockupStage concept={concept}><div className="w-full max-w-[280px]"><TeeMockup project={project} concept={concept} /></div></MockupStage>)}
          {tile(cap, 'cap', k('cap'), <MockupStage concept={concept}><div className="w-full max-w-[280px]"><CapMockup project={project} concept={concept} /></div></MockupStage>)}
          {tile(letter, 'stationery', k('stationery'), <MockupStage concept={concept}><div className="w-full max-w-[320px]"><LetterheadMockup project={project} concept={concept} /></div></MockupStage>)}
        </div>
      </section>

      <section>
        <Heading title={k('placesTitle')} sub={k('placesSub')} />
        <div className="grid gap-4 lg:grid-cols-2">
          {tile(store, 'storefront', k('store'), <MockupStage concept={concept}><StorefrontMockup project={project} concept={concept} /></MockupStage>)}
          <div className="panel overflow-hidden">
            <div ref={web} className="bg-surface p-4"><ScaledFrame width={960} height={540} className="rounded-lg shadow-xl"><WebsiteHeaderMockup project={project} concept={concept} /></ScaledFrame></div>
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-sm text-soft">{k('website')}<DownloadButtons id="website" busy={busy} onPng={() => dl('website', web, 'website-header', 2)} /></div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div>
          <Heading title={k('igTitle')} />
          <div className="panel overflow-hidden">
            <div ref={ig} className="flex justify-center bg-surface p-4">
              <div className="w-full max-w-[330px] overflow-hidden rounded-[22px] shadow-2xl ring-1 ring-black/10">
                <ScaledFrame width={390} height={760}>
                  <InstagramProfileMockup project={project} concept={concept} tiles={BG_STYLES.slice(0, 9).map((b) => <Background key={b.id} styleId={b.id} concept={concept} name={project.input.name} w={130} h={130} style={{ aspectRatio: '1' }} />)} />
                </ScaledFrame>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-sm text-soft">{k('ig')}<DownloadButtons id="igprofile" busy={busy} onPng={() => dl('igprofile', ig, 'instagram-profile', 2)} /></div>
          </div>
        </div>
        <div>
          <Heading title={k('photoTitle')} sub={k('photoSub')} />
          <div className="panel p-5">
            <div className="flex flex-wrap gap-2">
              {['storefront', 'packaging', 'apparel', 'coffee-cup', 'office', 'billboard'].map((sc) => (
                <button key={sc} onClick={() => setScene(sc)} className={`rounded-full border px-3 py-1.5 text-xs ${scene === sc ? 'border-lilac/70 bg-white/[.06] text-paper' : 'border-line text-mute hover:text-soft'}`}>{k(`scene_${sc}`)}</button>
              ))}
            </div>
            <div className="mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-dashed border-line-2 bg-ink-2">
              {photo ? <img src={photo.image} alt={k(`scene_${scene}`)} className="h-full w-full object-cover" /> : (
                <div className="max-w-sm p-6 text-center text-sm text-mute"><ImageIcon className="mx-auto mb-3 h-8 w-8 opacity-60" />{backend.edit ? k('photoReady') : k('photoOffline')}</div>
              )}
            </div>
            {photo && <p className="mt-2 text-xs text-mute">{k('madeWith')} {photo.provider}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {backend.edit
                ? <Button onClick={makePhoto} loading={busy === 'photo'}>{busy !== 'photo' && <Wand2 className="h-4 w-4" />}{k('photoBtn')}</Button>
                : <Button variant="outline" to="/settings">{k('connect')}</Button>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
