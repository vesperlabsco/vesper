import { beforeEach, describe, expect, it } from 'vitest';
import { useSessionStore } from './useSessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ isAuthenticated: false });
  });

  it('starts unauthenticated', () => {
    expect(useSessionStore.getState().isAuthenticated).toBe(false);
  });

  it('login() sets isAuthenticated to true', () => {
    useSessionStore.getState().login();

    expect(useSessionStore.getState().isAuthenticated).toBe(true);
  });

  it('logout() sets isAuthenticated back to false', () => {
    useSessionStore.getState().login();
    useSessionStore.getState().logout();

    expect(useSessionStore.getState().isAuthenticated).toBe(false);
  });
});
