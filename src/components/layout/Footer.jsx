import BrandoraLogo from './BrandoraLogo';
import { LanguageToggle } from './Navbar';
import { useI18n } from '../../i18n/I18nContext';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <BrandoraLogo />
          <p className="max-w-sm text-sm text-mute">{t('landing.footer')}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-mute">
          <LanguageToggle />
          <span>© {new Date().getFullYear()} BRANDORA. {t('landing.rights')}</span>
        </div>
      </div>
    </footer>
  );
}
