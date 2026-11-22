import { useRef } from 'react';
import ScaledFrame from '../../components/social/ScaledFrame';
import { FlipCard, CardFront, CardBack, BoxMockup, BagMockup, ProductMockup, MockupStage } from '../../components/mockups/Mockups';
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
    </div>
  );
}
