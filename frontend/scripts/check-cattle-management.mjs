import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const source = (path) => readFileSync(resolve(root, path), 'utf8');

const { ApiClient } = await import('../src/shared/services/api-client.ts');
const { listCattle, getCattleDetail, getCattleHistory } = await import('../src/features/cattle/cattle.api.ts');

const requests = [];
globalThis.fetch = async (url) => {
  requests.push(String(url));

  if (String(url).endsWith('/cattle')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            id: '10000000-0000-4000-8000-000000000001',
            tagNumber: 'GYR-001',
            breed: 'Gyr',
            sex: 'FEMALE',
            status: 'ACTIVE',
            lastRiskScore: 18.5
          }
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1
        }
      })
    };
  }

  if (String(url).endsWith('/events')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          cattleId: '10000000-0000-4000-8000-000000000001',
          events: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0
          },
          placeholder: true,
          message: 'Cattle history will be populated by the activity-events phase.'
        }
      })
    };
  }

  return {
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: {
        id: '10000000-0000-4000-8000-000000000001',
        tagNumber: 'GYR-001',
        breed: 'Gyr',
        sex: 'FEMALE',
        birthDate: '2021-03-14',
        status: 'ACTIVE',
        createdAt: '2026-06-26T00:00:00.000Z',
        lastRiskScore: 18.5
      }
    })
  };
};

const apiClient = new ApiClient({ baseUrl: 'http://localhost:3000/api/v1' });
const list = await listCattle(apiClient);
assert.equal(list.data[0].tagNumber, 'GYR-001');
assert.equal(list.pagination.total, 1);

const detail = await getCattleDetail(apiClient, '10000000-0000-4000-8000-000000000001');
assert.equal(detail.breed, 'Gyr');
assert.equal(detail.birthDate, '2021-03-14');

const history = await getCattleHistory(apiClient, '10000000-0000-4000-8000-000000000001');
assert.equal(history.placeholder, true);
assert.equal(history.events.length, 0);
assert.ok(requests.some((request) => request.endsWith('/cattle/10000000-0000-4000-8000-000000000001/events')));

const listPage = source('src/features/cattle/CattleListPage.tsx');
assert.match(listPage, /Cargando cattle/);
assert.match(listPage, /No hay cattle registrados/);
assert.match(listPage, /No se pudo cargar el listado/);
assert.match(listPage, /onOpenCattle\(cattle\.id\)/);
assert.match(listPage, /lastRiskScore/);

const detailPage = source('src/features/cattle/CattleDetailPage.tsx');
assert.match(detailPage, /No se encontro el cattle solicitado/);
assert.match(detailPage, /Cattle history/);
assert.match(detailPage, /onBackToList/);
assert.match(detailPage, /getCattleHistory/);

const app = source('src/app/App.tsx');
assert.match(app, /\/cattle/);
assert.match(app, /CattleListPage/);
assert.match(app, /CattleDetailPage/);

const readme = source('src/features/cattle/README.md');
assert.match(readme, /knowledge-base\/10-roadmap\/phase-3-cattle-management\.md/);
assert.match(readme, /Manual cattle create\/update\/delete workflows are intentionally outside this phase/);

console.log('Frontend cattle-management checks passed.');
