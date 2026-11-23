import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Languages, Menu, X, Plus } from 'lucide-react';
import BrandoraLogo from './BrandoraLogo';
import Button from '../ui/Button';
import { useI18n } from '../../i18n/I18nContext';
import Account from './Account';

export function LanguageToggle({ className = '' }) {
  const { lang, toggle, t } = useI18n();
  return (
    <button onClick={toggle} className={`inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-sm text-soft transition-colors hover:bg-white/5 hover:text-paper ${className}`}
      aria-label={t('common.language')}>
      <Languages className="h-4 w-4" />
      <span lang={lang === 'ar' ? 'en' : 'ar'}>{lang === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
}

export default function Navbar() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const landing = pathname === '/';

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const links = landing
    ? [['#features', t('nav.features')], ['#how', t('nav.how')], ['#showcase', t('nav.showcase')]]
    : [['/dashboard', t('nav.dashboard')], ['/create', t('nav.create')], ['/settings', t('nav.settings')]];

  const linkCls = 'rounded-lg px-3 py-2 text-sm text-mute transition-colors hover:text-paper';
  const renderLink = ([href, label]) => href.startsWith('#')
    ? <a key={href} href={href} className={linkCls}>{label}</a>
    : <NavLink key={href} to={href} className={({ isActive }) => `${linkCls} ${isActive ? '!text-paper' : ''}`}>{label}</NavLink>;

  return (
    <header className={`sticky top-0 z-50 transition-[background,border-color] duration-300 ${scrolled || open ? 'border-b border-line bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <BrandoraLogo />
        <nav className="hidden flex-1 items-center gap-1 md:flex">{links.map(renderLink)}</nav>
        <div className="ms-auto hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <Account />
          {landing && <Button variant="ghost" size="sm" to="/dashboard">{t('nav.dashboard')}</Button>}
          <Button size="sm" to="/create"><Plus className="h-4 w-4" />{t('nav.create')}</Button>
        </div>
        <button className="ms-auto rounded-lg p-2 text-soft md:hidden" onClick={() => setOpen((o) => !o)} aria-label={t('nav.menu')} aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line md:hidden">
            <div className="flex flex-col gap-1 px-4 py-4">
              {links.map(([href, label]) => href.startsWith('#')
                ? <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-soft hover:bg-white/5">{label}</a>
                : <NavLink key={href} to={href} className="rounded-lg px-3 py-2.5 text-soft hover:bg-white/5">{label}</NavLink>)}
              {landing && <NavLink to="/dashboard" className="rounded-lg px-3 py-2.5 text-soft hover:bg-white/5">{t('nav.dashboard')}</NavLink>}
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-4">
                <LanguageToggle />
                <Account />
                <Button size="sm" to="/create"><Plus className="h-4 w-4" />{t('nav.create')}</Button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
