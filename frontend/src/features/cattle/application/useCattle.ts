import { useApiQuery } from '../../../shared/hooks/useApiQuery';
import { getCattleDetail, getCattleHistory, listCattle } from '../infrastructure';

export function useCattleList() {
  return useApiQuery(['cattle', 'list'], listCattle);
}

export function useCattleDetail(cattleId: string) {
  return useApiQuery(['cattle', 'detail', cattleId], (client) => getCattleDetail(client, cattleId));
}

export function useCattleHistory(cattleId: string) {
  return useApiQuery(['cattle', 'history', cattleId], (client) => getCattleHistory(client, cattleId));
}
