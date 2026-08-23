import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStarWarsPeople } from './useStarWarsPeople';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useStarWarsPeople', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            message: 'ok',
            total_records: 1,
            total_pages: 1,
            results: [
              { uid: '1', name: 'Luke Skywalker', url: 'https://www.swapi.tech/api/people/1' },
            ],
          }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the parsed list of characters', async () => {
    const { result } = renderHook(() => useStarWarsPeople(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([
      { uid: '1', name: 'Luke Skywalker', url: 'https://www.swapi.tech/api/people/1' },
    ]);
  });
});
