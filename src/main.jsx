import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './data/fonts';
import './index.css';
import App from './App';
import { I18nProvider } from './i18n/I18nContext';
import { ProjectsProvider } from './store/ProjectsContext';
import { ToastProvider } from './components/ui/Toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ProjectsProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ProjectsProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
