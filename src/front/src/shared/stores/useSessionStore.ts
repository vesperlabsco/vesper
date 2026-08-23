import { create } from 'zustand';

interface SessionState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

// Mock en attendant une vraie auth backend : pas de token, pas d'appel réseau,
// juste un flag en mémoire pour illustrer le guard de route de l'espace
// `app` (routes/app/route.tsx). À remplacer par un vrai AuthProvider quand
// le backend exposera une session.
export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: false,
  login: () => {
    set({ isAuthenticated: true });
  },
  logout: () => {
    set({ isAuthenticated: false });
  },
}));
