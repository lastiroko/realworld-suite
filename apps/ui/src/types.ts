export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'REJECTED';

export const STATUS_OPTIONS: RequestStatus[] = [
  'NEW',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'REJECTED',
];

export const REQUEST_TYPES = [
  'ACCESS',
  'DELETION',
  'PORTABILITY',
  'RECTIFICATION',
  'RESTRICTION',
] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export interface DsarRequest {
  id: number;
  dataSubjectName: string;
  dataSubjectEmail: string;
  requestType: string;
  details: string;
  status: RequestStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DsarRequestNote {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface CreateRequestPayload {
  dataSubjectName: string;
  dataSubjectEmail: string;
  requestType: string;
  details: string;
  dueDate: string | null;
}

export type StatusSummary = Partial<Record<RequestStatus, number>>;

export interface StatusHistoryEvent {
  id: number;
  requestId: number;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus;
  reason: string | null;
  actor: string;
  createdAt: string;
}

export const formatStatus = (status: RequestStatus) => status.replace(/_/g, ' ');
export const statusToken = (status: RequestStatus) =>
  status.toLowerCase().replace(/_/g, '-');
