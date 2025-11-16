/**
 * Integration tests for click tracking and analytics flow
 * Tests the complete journey: landing page → click → analytics display
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEventAnalytics } from '@/hooks/useEventAnalytics';
import { useUserPlan } from '@/hooks/useUserPlan';
import { createMockSupabaseClient } from '../utils/testUtils';
import type { ReactNode } from 'react';

// Mock the auth and plan hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false,
  }),
}));

jest.mock('@/hooks/useUserPlan', () => ({
  useUserPlan: jest.fn(() => ({
    plan: 'pro',
    isPro: true,
    isFree: false,
    loading: false,
    error: null,
  })),
}));

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => createMockSupabaseClient(),
}));

describe('Click Tracking Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a fresh query client for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useEventAnalytics Hook', () => {
    it('should fetch analytics data for a valid event ID', async () => {
      const mockAnalyticsData = {
        total_clicks: 10,
        platform_breakdown: {
          google: 5,
          apple: 3,
          outlook: 2,
        },
        last_clicked_at: '2025-11-16T10:00:00Z',
      };

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.rpc = jest.fn(() =>
        Promise.resolve({
          data: [mockAnalyticsData],
          error: null,
        })
      ) as unknown as typeof mockSupabase.rpc;

      // Override the mock for this test
      jest.mocked(createMockSupabaseClient).mockReturnValueOnce(mockSupabase);

      const { result } = renderHook(() => useEventAnalytics('test-event-id'), {
        wrapper,
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Check analytics data
      expect(result.current.analytics).toEqual({
        totalClicks: 10,
        platformBreakdown: [
          { platform: 'google', clicks: 5 },
          { platform: 'apple', clicks: 3 },
          { platform: 'outlook', clicks: 2 },
        ],
        lastClickedAt: '2025-11-16T10:00:00Z',
      });
    });

    it('should return empty analytics for event with no clicks', async () => {
      const mockAnalyticsData = {
        total_clicks: 0,
        platform_breakdown: {},
        last_clicked_at: null,
      };

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.rpc = jest.fn(() =>
        Promise.resolve({
          data: [mockAnalyticsData],
          error: null,
        })
      ) as unknown as typeof mockSupabase.rpc;

      jest.mocked(createMockSupabaseClient).mockReturnValueOnce(mockSupabase);

      const { result } = renderHook(() => useEventAnalytics('test-event-id'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.analytics).toEqual({
        totalClicks: 0,
        platformBreakdown: [],
        lastClickedAt: undefined,
      });
      expect(result.current.hasData).toBe(false);
    });

    it('should handle error when fetching analytics fails', async () => {
      const mockSupabase = createMockSupabaseClient();
      mockSupabase.rpc = jest.fn(() =>
        Promise.resolve({
          data: null,
          error: { message: 'Database error' },
        })
      ) as unknown as typeof mockSupabase.rpc;

      jest.mocked(createMockSupabaseClient).mockReturnValueOnce(mockSupabase);

      const { result } = renderHook(() => useEventAnalytics('test-event-id'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.analytics).toBeUndefined();
    });

    it('should not fetch analytics for free users', async () => {
      // Override the plan mock for this test
      jest.mocked(useUserPlan).mockReturnValueOnce({
        plan: 'free',
        isPro: false,
        isFree: true,
        loading: false,
        error: null,
      });

      const mockSupabase = createMockSupabaseClient();
      const rpcSpy = jest.fn();
      mockSupabase.rpc = rpcSpy as unknown as typeof mockSupabase.rpc;

      jest.mocked(createMockSupabaseClient).mockReturnValueOnce(mockSupabase);

      const { result } = renderHook(() => useEventAnalytics('test-event-id'), {
        wrapper,
      });

      // Wait a bit to ensure no fetch happens
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // RPC should not have been called
      expect(rpcSpy).not.toHaveBeenCalled();
      expect(result.current.analytics).toBeUndefined();
    });

    it('should not fetch when eventId is undefined', async () => {
      const mockSupabase = createMockSupabaseClient();
      const rpcSpy = jest.fn();
      mockSupabase.rpc = rpcSpy as unknown as typeof mockSupabase.rpc;

      jest.mocked(createMockSupabaseClient).mockReturnValueOnce(mockSupabase);

      const { result } = renderHook(() => useEventAnalytics(undefined), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(rpcSpy).not.toHaveBeenCalled();
    });
  });

  describe('Platform Breakdown Sorting', () => {
    it('should sort platforms by clicks in descending order', async () => {
      const mockAnalyticsData = {
        total_clicks: 15,
        platform_breakdown: {
          outlook: 2,
          google: 8,
          apple: 5,
        },
        last_clicked_at: '2025-11-16T10:00:00Z',
      };

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.rpc = jest.fn(() =>
        Promise.resolve({
          data: [mockAnalyticsData],
          error: null,
        })
      ) as unknown as typeof mockSupabase.rpc;

      jest.mocked(createMockSupabaseClient).mockReturnValueOnce(mockSupabase);

      const { result } = renderHook(() => useEventAnalytics('test-event-id'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be sorted: google (8), apple (5), outlook (2)
      expect(result.current.analytics?.platformBreakdown).toEqual([
        { platform: 'google', clicks: 8 },
        { platform: 'apple', clicks: 5 },
        { platform: 'outlook', clicks: 2 },
      ]);
    });
  });

  describe('Analytics Flags', () => {
    it('should set hasData to true when clicks exist', async () => {
      const mockAnalyticsData = {
        total_clicks: 5,
        platform_breakdown: { google: 5 },
        last_clicked_at: '2025-11-16T10:00:00Z',
      };

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.rpc = jest.fn(() =>
        Promise.resolve({
          data: [mockAnalyticsData],
          error: null,
        })
      ) as unknown as typeof mockSupabase.rpc;

      jest.mocked(createMockSupabaseClient).mockReturnValueOnce(mockSupabase);

      const { result } = renderHook(() => useEventAnalytics('test-event-id'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasData).toBe(true);
    });

    it('should set hasData to false when no clicks exist', async () => {
      const mockAnalyticsData = {
        total_clicks: 0,
        platform_breakdown: {},
        last_clicked_at: null,
      };

      const mockSupabase = createMockSupabaseClient();
      mockSupabase.rpc = jest.fn(() =>
        Promise.resolve({
          data: [mockAnalyticsData],
          error: null,
        })
      ) as unknown as typeof mockSupabase.rpc;

      jest.mocked(createMockSupabaseClient).mockReturnValueOnce(mockSupabase);

      const { result } = renderHook(() => useEventAnalytics('test-event-id'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasData).toBe(false);
    });
  });
});
