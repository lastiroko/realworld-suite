import { useState } from 'react';
import { RequestForm } from '../components/dsar/RequestForm';
import { SummaryCards } from '../components/dsar/SummaryCards';
import { KanbanBoard } from '../components/dsar/KanbanBoard';
import { RequestsTable } from '../components/dsar/RequestsTable';
import { RequestDetailDrawer } from '../components/dsar/RequestDetailDrawer';
import { useRequests, useSummary } from '../hooks/useDsar';

type ViewMode = 'board' | 'table';

export function DsarPage() {
  const [view, setView] = useState<ViewMode>('board');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const requests = useRequests();
  const summary = useSummary();

  const error = requests.error ?? summary.error;
  const selected =
    selectedId === null
      ? null
      : requests.data?.find((r) => r.id === selectedId) ?? null;

  return (
    <>
      <header className="page-header">
        <div className="page-header__banner">
          <div>
            <strong>Privacy operations console</strong>
            <span>Track GDPR Article 15 deadlines, triage requests, and audit every transition.</span>
          </div>
          <button className="outline" type="button">View SLA guide</button>
        </div>
        <div className="page-header__content">
          <div>
            <span className="eyebrow">Acureq · DSAR</span>
            <h1>Data Subject Requests</h1>
            <p className="subtitle">
              Monitor active queues, hand off to the right team, and resolve before the 30-day clock runs out.
            </p>
          </div>
          <div className="page-header__actions">
            <button
              className="ghost"
              type="button"
              onClick={() => {
                requests.refetch();
                summary.refetch();
              }}
              disabled={requests.isFetching}
            >
              {requests.isFetching ? 'Syncing…' : 'Sync data'}
            </button>
            <span className="page-header__hint">
              {requests.dataUpdatedAt
                ? `Last synced ${new Date(requests.dataUpdatedAt).toLocaleTimeString()}`
                : 'Awaiting first sync'}
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          {error instanceof Error ? error.message : 'Unable to reach backend'}
        </div>
      )}

      <div className="grid two-columns">
        <section className="card">
          <h2>Log a new request</h2>
          <RequestForm />
        </section>
        <section className="card">
          <h2>Live status</h2>
          <SummaryCards summary={summary.data ?? {}} />
        </section>
      </div>

      <section className="card" style={{ marginTop: 8 }}>
        <div className="view-switcher">
          <div>
            <h2 style={{ margin: 0 }}>Active queue</h2>
            <p className="view-switcher__hint">
              {requests.data?.length ?? 0} requests · click a card to open · drag between columns to update status
            </p>
          </div>
          <div className="tab-group" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'board'}
              className={`tab${view === 'board' ? ' is-active' : ''}`}
              onClick={() => setView('board')}
            >
              Board
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'table'}
              className={`tab${view === 'table' ? ' is-active' : ''}`}
              onClick={() => setView('table')}
            >
              Table
            </button>
          </div>
        </div>

        {requests.isLoading ? (
          <p className="empty-state">Loading requests…</p>
        ) : view === 'board' ? (
          <KanbanBoard
            requests={requests.data ?? []}
            onSelect={(r) => setSelectedId(r.id)}
          />
        ) : (
          <RequestsTable
            requests={requests.data ?? []}
            onSelect={(r) => setSelectedId(r.id)}
          />
        )}
      </section>

      <RequestDetailDrawer
        request={selected}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
