import { useRef } from 'react';
import ScaledFrame from '../../components/social/ScaledFrame';
import { SocialPost, SocialStory } from '../../components/social/SocialDesigns';
import { useI18n } from '../../i18n/I18nContext';
import { downloadNode } from '../../lib/download';
import { slugify, extraSocial } from '../../lib/generator';
import { Heading, DownloadButtons, CopyButton, useAsyncAction } from './shared';

function Exportable({ width, height, ratio, filename, busy, run, id, children, footer, className }) {
  const ref = useRef(null);
  return (
    <div className={`panel overflow-hidden ${className || ''}`}>
      <div className="relative">
        <ScaledFrame ref={ref} width={width} height={height}>{children}</ScaledFrame>
        <div className="absolute end-3 top-3"><DownloadButtons id={id} busy={busy} onPng={() => run(`${id}-png`, () => downloadNode(ref.current, filename, ratio))} /></div>
      </div>
      {footer}
    </div>
  );
}

export default function SocialTab({ project, concept }) {
  const { t } = useI18n();
  const [busy, run] = useAsyncAction();
  const slug = slugify(project.input.name);
  const dir = project.input.language === 'ar' ? 'rtl' : 'ltr';
  const extra = extraSocial(project, concept);
  const posts = [...concept.social.posts, ...extra.posts];
  const stories = [...concept.social.stories, ...extra.stories];
  const { hashtags } = concept.social;

  return (
    <div className="space-y-14">
      <section>
        <Heading title={t('studio.posts')} sub="1080 × 1080" />
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((post, i) => (
            <Exportable key={post.type} id={`post${i}`} width={540} height={540} ratio={2} filename={`${slug}-post-${post.type}.png`} busy={busy} run={run}
              footer={(
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between text-xs text-mute"><span>{t('studio.caption')}</span><CopyButton value={`${post.caption}\n\n${hashtags.join(' ')}`} label={t('common.copy')} className="text-soft hover:text-paper" /></div>
                  <p className="text-sm leading-relaxed text-soft" dir={dir}>{post.caption}</p>
                </div>
              )}>
              <SocialPost project={project} concept={concept} post={post} />
            </Exportable>
          ))}
        </div>
      </section>

      <section>
        <Heading title={t('studio.stories')} sub="1080 × 1920" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((story, i) => (
            <Exportable key={story.type} id={`story${i}`} width={270} height={480} ratio={4} filename={`${slug}-story-${story.type}.png`} busy={busy} run={run}>
              <SocialStory project={project} concept={concept} story={story} />
            </Exportable>
          ))}
          <div className="panel flex flex-col p-6">
            <h3 className="font-display text-lg font-semibold">{t('studio.hashtags')}</h3>
            <div className="mt-4 flex flex-wrap gap-2" dir={dir}>
              {hashtags.map((h) => <span key={h} className="rounded-full border border-line-2 px-3 py-1 text-sm text-lilac">{h}</span>)}
            </div>
            <div className="mt-auto pt-6"><CopyButton value={hashtags.join(' ')} label={t('common.copy')} className="rounded-lg border border-line px-3 py-2 text-sm text-soft hover:text-paper" /></div>
          </div>
        </div>
      </section>
    </div>
  );
}
