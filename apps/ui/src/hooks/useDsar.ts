import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dsarApi } from '../api/dsar';
import type { CreateRequestPayload, RequestStatus } from '../types';

export const dsarKeys = {
  all: ['dsar'] as const,
  list: (status?: RequestStatus) => ['dsar', 'list', status ?? 'all'] as const,
  summary: () => ['dsar', 'summary'] as const,
  notes: (requestId: number) => ['dsar', 'notes', requestId] as const,
  history: (requestId: number) => ['dsar', 'history', requestId] as const,
  recentHistory: () => ['dsar', 'history', 'recent'] as const,
};

export function useRequests(status?: RequestStatus) {
  return useQuery({
    queryKey: dsarKeys.list(status),
    queryFn: () => dsarApi.list(status),
  });
}

export function useSummary() {
  return useQuery({
    queryKey: dsarKeys.summary(),
    queryFn: () => dsarApi.summary(),
  });
}

export function useNotes(requestId: number | null) {
  return useQuery({
    queryKey: dsarKeys.notes(requestId ?? -1),
    queryFn: () => dsarApi.listNotes(requestId as number),
    enabled: requestId !== null,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => dsarApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dsarKeys.all });
    },
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNotes,
    }: {
      id: number;
      status: RequestStatus;
      resolutionNotes?: string;
    }) => dsarApi.updateStatus(id, status, resolutionNotes),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: dsarKeys.all });
      qc.invalidateQueries({ queryKey: dsarKeys.history(vars.id) });
      qc.invalidateQueries({ queryKey: dsarKeys.recentHistory() });
    },
  });
}

export function useHistory(requestId: number | null) {
  return useQuery({
    queryKey: dsarKeys.history(requestId ?? -1),
    queryFn: () => dsarApi.history(requestId as number),
    enabled: requestId !== null,
  });
}

export function useRecentHistory() {
  return useQuery({
    queryKey: dsarKeys.recentHistory(),
    queryFn: () => dsarApi.recentHistory(50),
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      author,
      content,
    }: {
      requestId: number;
      author: string;
      content: string;
    }) => dsarApi.addNote(requestId, author, content),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: dsarKeys.notes(vars.requestId) });
    },
  });
}
