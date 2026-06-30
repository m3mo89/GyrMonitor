import type { AlertLookup } from '../application/observation.types';

export type LocalAlert = {
  id: string;
  status: 'PENDING' | 'ATTENDED';
};

export const localAlertSeed: LocalAlert[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    status: 'PENDING'
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    status: 'ATTENDED'
  }
];

export class LocalAlertRepository implements AlertLookup {
  private readonly records: LocalAlert[];

  constructor(records: LocalAlert[] = localAlertSeed) {
    this.records = records;
  }

  async exists(alertId: string): Promise<boolean> {
    return this.records.some((record) => record.id === alertId);
  }
}
