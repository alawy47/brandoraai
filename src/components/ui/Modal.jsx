import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-label={title} initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }} className={`panel relative w-full ${width} p-6 shadow-2xl`}>
            {title && (
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="font-display text-lg font-semibold">{title}</h2>
                {onClose && <button onClick={onClose} className="rounded-lg p-1.5 text-mute hover:bg-white/5 hover:text-paper"><X className="h-4 w-4" /></button>}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
