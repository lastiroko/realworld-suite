import { useRecentHistory } from '../hooks/useDsar';
import { AuditTimeline } from '../components/dsar/AuditTimeline';

export function AuditPage() {
  const recent = useRecentHistory();

  return (
    <>
      <header className="page-header">
        <div className="page-header__content">
          <div>
            <span className="eyebrow">Acureq · Audit</span>
            <h1>Unified audit trail</h1>
            <p className="subtitle">
              Every status transition across DSAR — chronological, with the operator and the reason behind each change.
            </p>
          </div>
          <div className="page-header__actions">
            <button
              className="ghost"
              type="button"
              onClick={() => recent.refetch()}
              disabled={recent.isFetching}
            >
              {recent.isFetching ? 'Syncing…' : 'Refresh'}
            </button>
            <span className="page-header__hint">
              {recent.data?.length ?? 0} events
            </span>
          </div>
        </div>
      </header>

      <section className="card">
        {recent.isLoading ? (
          <p className="empty-state">Loading audit feed…</p>
        ) : (
          <AuditTimeline
            events={recent.data ?? []}
            showRequestId
            emptyHint="No events recorded yet. Transition a request to see it appear here."
          />
        )}
      </section>
    </>
  );
}
