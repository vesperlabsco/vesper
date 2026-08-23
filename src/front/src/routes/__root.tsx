import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSessionStore } from '@/shared/stores/useSessionStore';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { t } = useTranslation('common', { keyPrefix: 'root-layout' });
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const login = useSessionStore((state) => state.login);
  const logout = useSessionStore((state) => state.logout);

  return (
    <>
      <nav>
        <Link to="/">{t('nav-home')}</Link>
        <Link to="/app/star-wars">{t('nav-star-wars')}</Link>
        {isAuthenticated ? (
          <button type="button" onClick={logout}>
            {t('logout')}
          </button>
        ) : (
          <button type="button" onClick={login}>
            {t('login')}
          </button>
        )}
      </nav>
      <Outlet />
    </>
  );
}
