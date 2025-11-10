import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './App.css';

type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'REJECTED';

interface DsarRequest {
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

interface DsarRequestNote {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
const STATUS_OPTIONS: RequestStatus[] = ['NEW', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'REJECTED'];

const formatStatus = (status: RequestStatus) => status.replace(/_/g, ' ');
const statusToken = (status: RequestStatus) => status.toLowerCase().replace(/_/g, '-');

interface CreateRequestForm {
  dataSubjectName: string;
  dataSubjectEmail: string;
  requestType: string;
  details: string;
  dueDate: string;
}

const initialForm: CreateRequestForm = {
  dataSubjectName: '',
  dataSubjectEmail: '',
  requestType: 'ACCESS',
  details: '',
  dueDate: ''
};

type Summary = Partial<Record<RequestStatus, number>>;

type NotesState = Record<number, DsarRequestNote[]>;

type LoadingState = 'idle' | 'loading' | 'submitting';

type ApiError = string | null;

export default function App() {
  const [requests, setRequests] = useState<DsarRequest[]>([]);
  const [summary, setSummary] = useState<Summary>({});
  const [form, setForm] = useState<CreateRequestForm>(initialForm);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<ApiError>(null);
  const [notes, setNotes] = useState<NotesState>({});
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const fetchJson = useCallback(async <T,>(input: RequestInfo | URL, init?: RequestInit) => {
    const response = await fetch(input, init);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || response.statusText);
    }
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      console.warn('Unexpected non-JSON response', error);
      return text as unknown as T;
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading('loading');
    setError(null);
    try {
      const [requestsResponse, summaryResponse] = await Promise.all([
        fetchJson<DsarRequest[]>(`${API_BASE}/requests`),
        fetchJson<{ totals: Summary }>(`${API_BASE}/requests/summary/status`)
      ]);
      setRequests(requestsResponse);
      setSummary(summaryResponse.totals ?? {});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reach backend';
      setError(message);
    } finally {
      setLoading('idle');
    }
  }, [fetchJson]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm(initialForm);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading('submitting');
    setError(null);
    try {
      const payload = { ...form, dueDate: form.dueDate || null };
      await fetchJson(`${API_BASE}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      resetForm();
      await loadAllData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create request';
      setError(message);
    } finally {
      setLoading('idle');
    }
  };

  const handleStatusChange = async (request: DsarRequest, status: RequestStatus) => {
    if (status === request.status) return;
    const resolutionNotes = window.prompt('Add context for this transition (optional):') ?? undefined;
    try {
      await fetchJson(`${API_BASE}/requests/${request.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNotes })
      });
      await loadAllData();
      if (expandedRow === request.id) {
        await loadNotes(request.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update status';
      setError(message);
    }
  };

  const loadNotes = useCallback(async (requestId: number) => {
    try {
      const notesResponse = await fetchJson<DsarRequestNote[]>(`${API_BASE}/requests/${requestId}/notes`);
      setNotes(prev => ({ ...prev, [requestId]: notesResponse }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to fetch notes';
      setError(message);
    }
  }, [fetchJson]);

  const toggleNotes = async (requestId: number) => {
    const isExpanded = expandedRow === requestId;
    const next = isExpanded ? null : requestId;
    setExpandedRow(next);
    if (!isExpanded && !notes[requestId]) {
      await loadNotes(requestId);
    }
  };

  const handleAddNote = async (requestId: number) => {
    const author = window.prompt('Author');
    const content = window.prompt('Note');
    if (!author || !content) {
      return;
    }
    try {
      await fetchJson(`${API_BASE}/requests/${requestId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content })
      });
      await loadNotes(requestId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to add note';
      setError(message);
    }
  };

  const isSubmitting = loading === 'submitting';

  const summaryItems = useMemo(() => STATUS_OPTIONS.map(status => ({
    status,
    count: summary[status] ?? 0
  })), [summary]);

  return (
    <div className="app-shell">
      <div className="workspace-nav">
        <div className="workspace-nav__brand" aria-label="Acureq AI workspace">
          <span className="workspace-nav__glyph" aria-hidden="true">
            AI
          </span>
          <span className="workspace-nav__logo">Acureq</span>
        </div>
        <div className="workspace-nav__actions">
          <div className="workspace-nav__summary">
            <span className="workspace-nav__label">Workspace</span>
            <span className="workspace-nav__name">Acureq Desk</span>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={loadAllData}
            disabled={loading === 'loading'}
            aria-label="Sync workspace data"
          >
            {loading === 'loading' ? '…' : '⟳'}
          </button>
          <div className="workspace-nav__avatar" aria-hidden="true">
            AQ
          </div>
        </div>
      </div>

      <header className="page-header">
        <div className="page-header__banner">
          <div>
            <strong>Accelerate your privacy ops with Acureq AI</strong>
            <span>Unlock deeper insights, automated triage, and collaborative resolution flows.</span>
          </div>
          <button className="outline" type="button">Explore plans</button>
        </div>
        <div className="page-header__content">
          <div>
            <span className="eyebrow">Acureq Privacy Desk</span>
            <h1>DSAR Workflow Command Center</h1>
            <p className="subtitle">Monitor, triage, and resolve privacy requests with confidence.</p>
          </div>
          <div className="page-header__actions">
            <button
              className="ghost"
              type="button"
              onClick={loadAllData}
              disabled={loading === 'loading'}
            >
              {loading === 'loading' ? 'Syncing…' : 'Sync data'}
            </button>
            <span className="page-header__hint">Last synced moments ago</span>
          </div>
        </div>
      </header>
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <div className="grid two-columns">
        <section className="card">
          <h2>Log a new request</h2>
          <form onSubmit={handleSubmit} className="grid">
            <div className="field">
              <label htmlFor="dataSubjectName">Data subject name</label>
              <input
                id="dataSubjectName"
                name="dataSubjectName"
                value={form.dataSubjectName}
                onChange={handleInputChange}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="dataSubjectEmail">Email</label>
              <input
                id="dataSubjectEmail"
                name="dataSubjectEmail"
                type="email"
                value={form.dataSubjectEmail}
                onChange={handleInputChange}
                placeholder="jane.doe@example.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="requestType">Request type</label>
              <select id="requestType" name="requestType" value={form.requestType} onChange={handleInputChange}>
                <option value="ACCESS">Access</option>
                <option value="DELETION">Deletion</option>
                <option value="PORTABILITY">Portability</option>
                <option value="RECTIFICATION">Rectification</option>
                <option value="RESTRICTION">Restriction</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="dueDate">Due date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="details">Context</label>
              <textarea
                id="details"
                name="details"
                value={form.details}
                onChange={handleInputChange}
                placeholder="Summarize the request and any initial details"
                required
              />
            </div>
            <div className="button-row">
              <button className="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Create request'}
              </button>
              <button className="secondary" type="button" onClick={resetForm} disabled={isSubmitting}>
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Live status</h2>
          <div className="summary-grid">
            {summaryItems.map(({ status, count }) => (
              <div key={status} className="summary-card">
                <span className="label">{formatStatus(status)}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card" style={{ marginTop: 32 }}>
        <div className="button-row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Active queue</h2>
          <button className="secondary" type="button" onClick={loadAllData} disabled={loading === 'loading'}>
            {loading === 'loading' ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Requester</th>
                <th>Type</th>
                <th>Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No requests captured yet.
                  </td>
                </tr>
              )}
              {requests.map(request => (
                <tr key={request.id}>
                  <td>
                    <strong>{request.dataSubjectName}</strong>
                    <small className="timestamp">{request.dataSubjectEmail}</small>
                    <small className="timestamp">
                      Submitted {new Date(request.createdAt).toLocaleString()}
                    </small>
                  </td>
                  <td>
                    <div>{request.requestType}</div>
                    <small className="timestamp">{request.details}</small>
                  </td>
                  <td>{request.dueDate ? new Date(request.dueDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <span
                      className={`status-pill status-${statusToken(request.status)}`}
                    >
                      {formatStatus(request.status)}
                    </span>
                  </td>
                  <td>
                    <div className="button-row">
                      <select
                        value={request.status}
                        onChange={event => handleStatusChange(request, event.target.value as RequestStatus)}
                        disabled={request.status === 'COMPLETED' || request.status === 'REJECTED'}
                      >
                        {STATUS_OPTIONS.map(option => (
                          <option key={option} value={option}>
                            {formatStatus(option)}
                          </option>
                        ))}
                      </select>
                      <button className="secondary" type="button" onClick={() => toggleNotes(request.id)}>
                        {expandedRow === request.id ? 'Hide notes' : 'View notes'}
                      </button>
                      <button className="secondary" type="button" onClick={() => handleAddNote(request.id)}>
                        Add note
                      </button>
                    </div>
                    {expandedRow === request.id && (
                      <ul className="notes-list">
                        {(notes[request.id] ?? []).map(note => (
                          <li key={note.id}>
                            <strong>{note.author}</strong> — {note.content}
                            <small className="timestamp">
                              {new Date(note.createdAt).toLocaleString()}
                            </small>
                          </li>
                        ))}
                        {(notes[request.id] ?? []).length === 0 && <li>No notes yet.</li>}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
