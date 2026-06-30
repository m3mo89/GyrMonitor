import type { CattleRepository, PaginatedResult, PaginationRequest } from '../application/cattle.types';
import { CattleSex, CattleStatus, createCattle } from '../domain/cattle';
import type { Cattle } from '../domain/cattle';
import { fromDatabaseDate, fromDatabaseDateTime } from '../../database/date-mapping';
import { getSharedDatabaseClient } from '../../database/database-singleton';
import type { DatabaseClient } from '../../database/database.types';

type CattleRow = {
  id: string;
  tag_number: string;
  breed: string;
  sex: CattleSex;
  birth_date: string | Date | null;
  status: CattleStatus;
  created_at: string | Date;
  last_risk_score: number | string | null;
};

type CountRow = {
  total: number;
};

export class MariaDbCattleRepository implements CattleRepository {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient = getSharedDatabaseClient()) {
    this.client = client;
  }

  async list(request: Required<PaginationRequest>): Promise<PaginatedResult<Cattle>> {
    const offset = (request.page - 1) * request.pageSize;
    const [count] = await this.client.query<CountRow>('SELECT COUNT(*) AS total FROM cattle');
    const rows = await this.client.query<CattleRow>(
      `SELECT id, tag_number, breed, sex, birth_date, status, created_at, last_risk_score
       FROM cattle
       ORDER BY tag_number ASC
       LIMIT ? OFFSET ?`,
      [request.pageSize, offset]
    );

    return {
      data: rows.map(toCattle),
      pagination: {
        page: request.page,
        pageSize: request.pageSize,
        total: Number(count?.total ?? 0)
      }
    };
  }

  async findById(id: string): Promise<Cattle | null> {
    const rows = await this.client.execute<CattleRow>(
      `SELECT id, tag_number, breed, sex, birth_date, status, created_at, last_risk_score
       FROM cattle
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return rows[0] ? toCattle(rows[0]) : null;
  }

  async exists(id: string): Promise<boolean> {
    const rows = await this.client.execute<{ id: string }>('SELECT id FROM cattle WHERE id = ? LIMIT 1', [id]);
    return rows.length > 0;
  }
}

function toCattle(row: CattleRow): Cattle {
  return createCattle({
    id: row.id,
    tagNumber: row.tag_number,
    breed: row.breed,
    sex: row.sex,
    birthDate: fromDatabaseDate(row.birth_date),
    status: row.status,
    createdAt: fromDatabaseDateTime(row.created_at),
    lastRiskScore: row.last_risk_score === null ? undefined : Number(row.last_risk_score)
  });
}
