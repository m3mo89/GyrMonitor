import { CattleNotFoundError, InvalidCattleIdError } from './cattle.errors';
import type { CattleHistoryPlaceholderDto, CattleRepository } from './cattle.types';
import { isUuid } from './uuid';

export class GetCattleHistoryUseCase {
  private readonly cattle: CattleRepository;

  constructor(cattle: CattleRepository) {
    this.cattle = cattle;
  }

  async execute(id: string): Promise<CattleHistoryPlaceholderDto> {
    if (!isUuid(id)) {
      throw new InvalidCattleIdError();
    }

    if (!(await this.cattle.exists(id))) {
      throw new CattleNotFoundError();
    }

    return {
      cattleId: id,
      events: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      placeholder: true,
      message: 'Cattle history will be populated by the activity-events phase.'
    };
  }
}
