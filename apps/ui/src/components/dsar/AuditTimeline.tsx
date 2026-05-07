import type { StatusHistoryEvent } from '../../types';
import { formatStatus, statusToken } from '../../types';

interface Props {
  events: StatusHistoryEvent[];
  showRequestId?: boolean;
  emptyHint?: string;
}

const formatRelative = (iso: string) => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.round((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

export function AuditTimeline({ events, showRequestId = false, emptyHint }: Props) {
  if (events.length === 0) {
    return <p className="empty-state">{emptyHint ?? 'No history yet.'}</p>;
  }

  return (
    <ol className="timeline" aria-label="Status history">
      {events.map((event) => (
        <li key={event.id} className={`timeline__item tone-${statusToken(event.toStatus)}`}>
          <span className="timeline__dot" aria-hidden="true" />
          <div className="timeline__content">
            <header className="timeline__head">
              <span className="timeline__transition">
                {event.fromStatus ? (
                  <>
                    <span className={`status-pill status-${statusToken(event.fromStatus)}`}>
                      {formatStatus(event.fromStatus)}
                    </span>
                    <span className="timeline__arrow" aria-hidden="true">→</span>
                  </>
                ) : (
                  <span className="timeline__transition-init">Created as</span>
                )}
                <span className={`status-pill status-${statusToken(event.toStatus)}`}>
                  {formatStatus(event.toStatus)}
                </span>
              </span>
              <span className="timeline__time" title={new Date(event.createdAt).toLocaleString()}>
                {formatRelative(event.createdAt)}
              </span>
            </header>
            <p className="timeline__meta">
              by <strong>{event.actor}</strong>
              {showRequestId && (
                <> · <span className="timeline__ref">#{event.requestId}</span></>
              )}
            </p>
            {event.reason && <p className="timeline__reason">{event.reason}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
