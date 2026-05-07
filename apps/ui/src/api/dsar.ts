import { apiFetch } from './client';
import type {
  CreateRequestPayload,
  DsarRequest,
  DsarRequestNote,
  RequestStatus,
  StatusHistoryEvent,
  StatusSummary,
} from '../types';

export const dsarApi = {
  list: (status?: RequestStatus) =>
    apiFetch<DsarRequest[]>(
      `/requests${status ? `?status=${status}` : ''}`,
    ),

  summary: () =>
    apiFetch<{ totals: StatusSummary }>(`/requests/summary/status`).then(
      (r) => r.totals ?? {},
    ),

  create: (payload: CreateRequestPayload) =>
    apiFetch<DsarRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: number, status: RequestStatus, resolutionNotes?: string) =>
    apiFetch<DsarRequest>(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes }),
    }),

  listNotes: (requestId: number) =>
    apiFetch<DsarRequestNote[]>(`/requests/${requestId}/notes`),

  addNote: (requestId: number, author: string, content: string) =>
    apiFetch<DsarRequestNote>(`/requests/${requestId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ author, content }),
    }),

  history: (requestId: number) =>
    apiFetch<StatusHistoryEvent[]>(`/requests/${requestId}/history`),

  recentHistory: (limit = 30) =>
    apiFetch<StatusHistoryEvent[]>(`/requests/history/recent?limit=${limit}`),
};
