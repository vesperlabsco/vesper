import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useSessionStore } from '@/shared/stores/useSessionStore';

// Guard de l'espace "utilisateur final" (cf. stack.md) : posé une seule fois
// ici, hérité par toutes les routes sous app/. `getState()` (API impérative
// de Zustand) plutôt que le hook, car beforeLoad tourne hors rendu React.
export const Route = createFileRoute('/app')({
  beforeLoad: () => {
    if (!useSessionStore.getState().isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return <Outlet />;
}
