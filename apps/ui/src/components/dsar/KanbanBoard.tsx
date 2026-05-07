import { useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { useUpdateStatus } from '../../hooks/useDsar';
import { STATUS_OPTIONS, formatStatus } from '../../types';
import type { DsarRequest, RequestStatus } from '../../types';
import { SlaBadge } from './SlaBadge';

interface Props {
  requests: DsarRequest[];
  onSelect: (request: DsarRequest) => void;
}

const COLUMN_HINTS: Record<RequestStatus, string> = {
  NEW: 'Awaiting triage',
  IN_PROGRESS: 'Identity verified, gathering data',
  ON_HOLD: 'Blocked or paused',
  COMPLETED: 'Delivered to subject',
  REJECTED: 'Closed without action',
};

export function KanbanBoard({ requests, onSelect }: Props) {
  const updateStatus = useUpdateStatus();
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<RequestStatus | null>(null);

  const grouped = useMemo(() => {
    const map: Record<RequestStatus, DsarRequest[]> = {
      NEW: [],
      IN_PROGRESS: [],
      ON_HOLD: [],
      COMPLETED: [],
      REJECTED: [],
    };
    for (const r of requests) map[r.status]?.push(r);
    return map;
  }, [requests]);

  const onDragStart = (e: DragEvent<HTMLElement>, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(id));
  };

  const onDragEnd = () => {
    setDraggedId(null);
    setDragOver(null);
  };

  const onDragOver = (e: DragEvent<HTMLElement>, status: RequestStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOver !== status) setDragOver(status);
  };

  const onDrop = (e: DragEvent<HTMLElement>, status: RequestStatus) => {
    e.preventDefault();
    setDragOver(null);
    const id = Number(e.dataTransfer.getData('text/plain'));
    if (!id) return;
    const current = requests.find((r) => r.id === id);
    if (!current || current.status === status) return;
    updateStatus.mutate({ id, status });
  };

  return (
    <div className="kanban" role="list">
      {STATUS_OPTIONS.map((status) => {
        const items = grouped[status];
        const isOver = dragOver === status;
        return (
          <div
            key={status}
            className={`kanban__col status-tone-${status.toLowerCase().replace(/_/g, '-')}${isOver ? ' is-over' : ''}`}
            onDragOver={(e) => onDragOver(e, status)}
            onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
            onDrop={(e) => onDrop(e, status)}
            role="listitem"
          >
            <header className="kanban__head">
              <div>
                <h3>{formatStatus(status)}</h3>
                <small>{COLUMN_HINTS[status]}</small>
              </div>
              <span className="kanban__count">{items.length}</span>
            </header>
            <div className="kanban__list">
              {items.length === 0 && (
                <p className="kanban__empty">No items</p>
              )}
              {items.map((r) => (
                <article
                  key={r.id}
                  className={`kanban__card${draggedId === r.id ? ' is-dragging' : ''}`}
                  draggable
                  onDragStart={(e) => onDragStart(e, r.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => onSelect(r)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(r);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open request ${r.dataSubjectName}`}
                >
                  <header className="kanban__cardHead">
                    <span className="kanban__type">{r.requestType}</span>
                    <SlaBadge dueDate={r.dueDate} compact />
                  </header>
                  <h4>{r.dataSubjectName}</h4>
                  <p>{r.details}</p>
                  <footer className="kanban__cardFoot">
                    <small>{r.dataSubjectEmail}</small>
                    <small>#{r.id}</small>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
