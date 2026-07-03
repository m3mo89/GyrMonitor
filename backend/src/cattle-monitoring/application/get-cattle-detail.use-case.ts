import { CattleNotFoundError, InvalidCattleIdError } from './cattle.errors';
import type { CattleDetailResponseDto, CattleRepository } from './cattle.types';
import { isUuid } from '../../shared/validation/assertions';
import { toCattleDetailDto } from '../domain/cattle';

export class GetCattleDetailUseCase {
  private readonly cattle: CattleRepository;

  constructor(cattle: CattleRepository) {
    this.cattle = cattle;
  }

  async execute(id: string): Promise<CattleDetailResponseDto> {
    if (!isUuid(id)) {
      throw new InvalidCattleIdError();
    }

    const cattle = await this.cattle.findById(id);

    if (!cattle) {
      throw new CattleNotFoundError();
    }

    return toCattleDetailDto(cattle);
  }
}
