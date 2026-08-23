import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { I18nProvider } from '@/app/providers/I18nProvider';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { router } from '@/app/router';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <I18nProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </I18nProvider>
  </StrictMode>,
);
