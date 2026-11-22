import { motion } from 'motion/react';

export default function Segmented({ value, onChange, options, layoutId, size = 'md', className = '' }) {
  const h = size === 'sm' ? 'h-8 text-[13px]' : 'h-10 text-sm';
  return (
    <div role="tablist" className={`inline-flex rounded-xl border border-line bg-ink-2 p-1 ${className}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button type="button" key={o.value} role="tab" aria-selected={active} onClick={() => onChange(o.value)}
            className={`relative ${h} flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3.5 font-medium transition-colors ${active ? 'text-paper' : 'text-mute hover:text-soft'}`}>
            {active && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-[9px] bg-surface-2 ring-1 ring-line-2" transition={{ type: 'spring', damping: 30, stiffness: 380 }} />}
            <span className="relative flex items-center gap-1.5">{o.icon}{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
