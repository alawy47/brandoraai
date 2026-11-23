import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import './data/fonts';
import './index.css';
import App from './App';
import { I18nProvider } from './i18n/I18nContext';
import { ProjectsProvider } from './store/ProjectsContext';
import { ToastProvider } from './components/ui/Toast';
import { probeBackend } from './services/ai';

probeBackend();

// Hosted previews (sandboxed frames) can't change the address bar, so they route in memory.
const Router = import.meta.env.VITE_PREVIEW ? MemoryRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <I18nProvider>
        <ProjectsProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ProjectsProvider>
      </I18nProvider>
    </Router>
  </React.StrictMode>,
);
