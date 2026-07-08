import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useApiQuery } from '../../../shared/hooks/useApiQuery';
import { useAuth } from '../../auth';
import type { AlertDetail, AlertStatus } from '../domain';
import { getAlertDetail, listAlertObservations, listAlerts, updateAlertStatus } from '../infrastructure';

export const alertsListQueryKey = ['alerts', 'list'];

export function useAlertsList() {
  return useApiQuery(alertsListQueryKey, listAlerts);
}

export function useAlertDetail(alertId: string) {
  return useApiQuery(['alerts', 'detail', alertId], (client) => getAlertDetail(client, alertId));
}

export function useAlertObservations(alertId: string) {
  return useApiQuery(['alerts', 'observations', alertId], (client) => listAlertObservations(client, alertId));
}

export function useUpdateAlertStatus(alertId: string) {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();
  const alertQueryKey = ['alerts', 'detail', alertId];

  return useMutation({
    mutationFn: (status: AlertStatus) => updateAlertStatus(apiClient, alertId, status),
    onSuccess(updated) {
      queryClient.setQueryData<AlertDetail>(alertQueryKey, (current) =>
        current ? { ...current, status: updated.status, attendedAt: updated.attendedAt } : current
      );
      void queryClient.invalidateQueries({ queryKey: alertsListQueryKey });
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
    }
  });
}
