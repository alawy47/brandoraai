import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Create from './pages/Create';
import Studio from './pages/Studio';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Button from './components/ui/Button';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { useI18n } from './i18n/I18nContext';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo({ top: 0 }); }, [pathname, hash]);
  return null;
}

function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-32 text-center">
      <p className="font-display text-7xl font-semibold text-amethyst">404</p>
      <Button className="mt-8" to="/">{t('nav.home')}</Button>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-dvh">
      <ScrollToTop />
      <Navbar />
      <main>
        <ErrorBoundary key={useLocation().pathname}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<Create />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:id" element={<Studio />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}
