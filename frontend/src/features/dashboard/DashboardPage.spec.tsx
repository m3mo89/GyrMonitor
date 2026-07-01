import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardPage } from './DashboardPage';
import { useDashboardMetrics } from './useDashboardMetrics';

vi.mock('./useDashboardMetrics', () => ({
  useDashboardMetrics: vi.fn()
}));

const mockedUseDashboardMetrics = vi.mocked(useDashboardMetrics);

const metrics = {
  totalCattle: 12,
  activeAlerts: 2,
  averageRiskScore: 41.5,
  highRiskCattle: 1,
  eventsToday: 144,
  syncPendingCount: 0,
  riskRanking: [{ cattleId: '11111111-1111-4111-8111-111111111111', tagNumber: 'GYR-001', riskScore: 91 }],
  trend: [{ date: '2026-06-30', events: 12, alerts: 2 }]
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows loading state without fabricated metrics', () => {
    mockedUseDashboardMetrics.mockReturnValue({ isLoading: true, isError: false, data: undefined, refetch: vi.fn() } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<DashboardPage />);

    expect(screen.getByText('Cargando dashboard...')).toBeInTheDocument();
    expect(screen.queryByText('Cattle total')).not.toBeInTheDocument();
  });

  it('renders backend dashboard metrics, ranking and trend', () => {
    mockedUseDashboardMetrics.mockReturnValue({ isLoading: false, isError: false, data: metrics, refetch: vi.fn() } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Cattle total')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('GYR-001')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Grafica de tendencia de eventos y alertas' })).toBeInTheDocument();
  });

  it('shows empty state for zeroed dashboard data', () => {
    mockedUseDashboardMetrics.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { ...metrics, totalCattle: 0, activeAlerts: 0, riskRanking: [], trend: [] },
      refetch: vi.fn()
    } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<DashboardPage />);

    expect(screen.getByText('Sin actividad registrada')).toBeInTheDocument();
    expect(screen.getByText('Sin ranking disponible')).toBeInTheDocument();
    expect(screen.getByText('Sin tendencia')).toBeInTheDocument();
  });

  it('shows error state with retry action when no cached data exists', () => {
    const refetch = vi.fn();
    mockedUseDashboardMetrics.mockReturnValue({ isLoading: false, isError: true, data: undefined, refetch } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<DashboardPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(screen.getByText('No se pudo cargar el dashboard')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps stale cached data visible with an indicator', () => {
    mockedUseDashboardMetrics.mockReturnValue({ isLoading: false, isError: true, data: metrics, refetch: vi.fn() } as unknown as ReturnType<typeof useDashboardMetrics>);

    render(<DashboardPage />);

    expect(screen.getByText('Datos en cache')).toBeInTheDocument();
    expect(screen.getByText('GYR-001')).toBeInTheDocument();
  });
});
