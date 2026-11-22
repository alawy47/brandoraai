import { useState } from 'react';
import { LogIn, LogOut, MailCheck } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useI18n } from '../../i18n/I18nContext';
import { useProjects } from '../../store/ProjectsContext';

/** Sign-in by email link. Renders nothing unless cloud sync is configured. */
export default function Account() {
  const { t } = useI18n();
  const { cloudEnabled, user, signIn, signOut } = useProjects();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  if (!cloudEnabled) return null;
  if (user) {
    return (
      <Button variant="ghost" size="sm" onClick={signOut} title={user.email}>
        <LogOut className="h-4 w-4" /><span className="max-w-[140px] truncate">{t('auth.signOut')}</span>
      </Button>
    );
  }
  const send = async (e) => {
    e.preventDefault();
    setState('sending'); setError('');
    try { await signIn(email.trim()); setState('sent'); } catch (err) { setError(err.message); setState('error'); }
  };
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}><LogIn className="h-4 w-4" />{t('auth.signIn')}</Button>
      <Modal open={open} onClose={() => setOpen(false)} title={t('auth.title')}>
        {state === 'sent' ? (
          <div className="flex items-start gap-3 text-soft"><MailCheck className="mt-0.5 h-5 w-5 text-success" /><p>{t('auth.sent')} <span dir="ltr">{email}</span></p></div>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <p className="text-sm text-mute">{t('auth.sub')}</p>
            <input type="email" required autoFocus className="field" dir="ltr" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label={t('auth.email')} />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" loading={state === 'sending'}>{t('auth.send')}</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
