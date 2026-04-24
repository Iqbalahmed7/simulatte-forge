/**
 * Forge API Client — calls the standalone Forge Railway service directly.
 * No proxy, no white-rabbit dependency.
 */

const FORGE_API_URL = process.env.FORGE_API_URL ?? 'http://localhost:8000';
const FORGE_API_KEY = process.env.FORGE_API_KEY ?? '';

export class ForgeAPIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function req(path: string, options: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${FORGE_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': FORGE_API_KEY,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ForgeAPIError(res.status, body);
  }

  return res.json();
}

export const forgeApi = {
  // Tests
  listTests: (tenantId: string) => req(`/tests?tenant_id=${tenantId}`),
  createTest: (data: Record<string, unknown>) =>
    req('/tests', { method: 'POST', body: JSON.stringify(data) }),
  getTest: (testId: string) => req(`/tests/${testId}`),
  runTest: (testId: string) =>
    req(`/tests/${testId}/run`, { method: 'POST' }),
  getScorecard: (testId: string) => req(`/tests/${testId}/scorecard`),
  listRuns: (testId: string) => req(`/tests/${testId}/runs`),
  getRun: (testId: string, runId: string) =>
    req(`/tests/${testId}/runs/${runId}`),
  getTrace: (testId: string, runId: string) =>
    req(`/tests/${testId}/runs/${runId}/trace`),
  createVariant: (testId: string, data: Record<string, unknown>) =>
    req(`/tests/${testId}/variant`, { method: 'POST', body: JSON.stringify(data) }),
  askPersona: (testId: string, data: Record<string, unknown>) =>
    req(`/tests/${testId}/ask`, { method: 'POST', body: JSON.stringify(data) }),

  // Pools
  listPools: (tenantId: string) => req(`/pools?tenant_id=${tenantId}`),
  createPool: (data: Record<string, unknown>) =>
    req('/pools', { method: 'POST', body: JSON.stringify(data) }),
  syncPoolFromIris: (data: Record<string, unknown>) =>
    req('/pools/sync-from-iris', { method: 'POST', body: JSON.stringify(data) }),

  // Admin (uses X-Admin-Key header)
  adminStats: () => req('/admin/stats', { headers: { 'X-Admin-Key': process.env.ADMIN_SECRET ?? '' } }),
  adminListTenants: () => req('/admin/tenants', { headers: { 'X-Admin-Key': process.env.ADMIN_SECRET ?? '' } }),
  adminGetTenant: (id: string) => req(`/admin/tenants/${id}`, { headers: { 'X-Admin-Key': process.env.ADMIN_SECRET ?? '' } }),
  adminCreateTenant: (data: Record<string, unknown>) =>
    req('/admin/tenants', { method: 'POST', body: JSON.stringify(data), headers: { 'X-Admin-Key': process.env.ADMIN_SECRET ?? '' } }),
  adminUpdateTenant: (id: string, data: Record<string, unknown>) =>
    req(`/admin/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data), headers: { 'X-Admin-Key': process.env.ADMIN_SECRET ?? '' } }),
  adminGrantCredits: (id: string, data: Record<string, unknown>) =>
    req(`/admin/tenants/${id}/credits`, { method: 'POST', body: JSON.stringify(data), headers: { 'X-Admin-Key': process.env.ADMIN_SECRET ?? '' } }),
  adminGetLedger: (id: string) => req(`/admin/tenants/${id}/ledger`, { headers: { 'X-Admin-Key': process.env.ADMIN_SECRET ?? '' } }),
};
