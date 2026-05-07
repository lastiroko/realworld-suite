import { useEffect, useState } from 'react';
import {
  useAddNote,
  useHistory,
  useNotes,
  useUpdateStatus,
} from '../../hooks/useDsar';
import { STATUS_OPTIONS, formatStatus } from '../../types';
import type { DsarRequest, RequestStatus } from '../../types';
import { StatusPill } from './StatusPill';
import { SlaBadge } from './SlaBadge';
import { AuditTimeline } from './AuditTimeline';

interface Props {
  request: DsarRequest | null;
  onClose: () => void;
}

export function RequestDetailDrawer({ request, onClose }: Props) {
  const open = request !== null;
  const history = useHistory(request?.id ?? null);
  const notes = useNotes(request?.id ?? null);
  const updateStatus = useUpdateStatus();
  const addNote = useAddNote();

  const [reason, setReason] = useState('');
  const [pendingStatus, setPendingStatus] = useState<RequestStatus | null>(null);
  const [noteAuthor, setNoteAuthor] = useState('Operator');
  const [noteContent, setNoteContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReason('');
    setPendingStatus(null);
    setNoteContent('');
    setError(null);
  }, [request?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!request) return null;

  const isResolved =
    request.status === 'COMPLETED' || request.status === 'REJECTED';

  const onApplyStatus = async () => {
    if (!pendingStatus || pendingStatus === request.status) return;
    setError(null);
    try {
      await updateStatus.mutateAsync({
        id: request.id,
        status: pendingStatus,
        resolutionNotes: reason || undefined,
      });
      setReason('');
      setPendingStatus(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status');
    }
  };

  const onSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteAuthor.trim() || !noteContent.trim()) return;
    setError(null);
    try {
      await addNote.mutateAsync({
        requestId: request.id,
        author: noteAuthor.trim(),
        content: noteContent.trim(),
      });
      setNoteContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add note');
    }
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-label={`Request #${request.id}`}>
        <header className="drawer__head">
          <div>
            <span className="eyebrow">Request #{request.id} · {request.requestType}</span>
            <h2>{request.dataSubjectName}</h2>
            <p className="drawer__sub">{request.dataSubjectEmail}</p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="drawer__meta">
          <StatusPill status={request.status} />
          <SlaBadge dueDate={request.dueDate} />
          <span className="drawer__metaItem">
            Submitted {new Date(request.createdAt).toLocaleDateString()}
          </span>
        </div>

        <section className="drawer__section">
          <h3>Context</h3>
          <p className="drawer__details">{request.details}</p>
        </section>

        {!isResolved && (
          <section className="drawer__section">
            <h3>Transition status</h3>
            <div className="drawer__transitionRow">
              <select
                value={pendingStatus ?? request.status}
                onChange={(e) => setPendingStatus(e.target.value as RequestStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {formatStatus(s)}
                  </option>
                ))}
              </select>
              <button
                className="primary"
                type="button"
                onClick={onApplyStatus}
                disabled={
                  updateStatus.isPending ||
                  !pendingStatus ||
                  pendingStatus === request.status
                }
              >
                {updateStatus.isPending ? 'Applying…' : 'Apply'}
              </button>
            </div>
            <textarea
              placeholder="Reason for transition (optional, recorded in audit log)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </section>
        )}

        <section className="drawer__section">
          <h3>Audit timeline</h3>
          {history.isLoading ? (
            <p className="empty-state">Loading…</p>
          ) : (
            <AuditTimeline
              events={history.data ?? []}
              emptyHint="No transitions recorded yet."
            />
          )}
        </section>

        <section className="drawer__section">
          <h3>Notes</h3>
          <ul className="drawer__notes">
            {notes.isLoading && <li>Loading…</li>}
            {!notes.isLoading && (notes.data ?? []).length === 0 && (
              <li className="drawer__noteEmpty">No notes yet.</li>
            )}
            {(notes.data ?? []).map((note) => (
              <li key={note.id} className="drawer__note">
                <header>
                  <strong>{note.author}</strong>
                  <small>{new Date(note.createdAt).toLocaleString()}</small>
                </header>
                <p>{note.content}</p>
              </li>
            ))}
          </ul>
          <form onSubmit={onSubmitNote} className="drawer__noteForm">
            <input
              type="text"
              placeholder="Author"
              value={noteAuthor}
              onChange={(e) => setNoteAuthor(e.target.value)}
            />
            <textarea
              placeholder="Add a note…"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={2}
            />
            <button
              className="secondary"
              type="submit"
              disabled={addNote.isPending || !noteContent.trim()}
            >
              {addNote.isPending ? 'Saving…' : 'Add note'}
            </button>
          </form>
        </section>

        {error && <div className="form-error" role="alert">{error}</div>}
      </aside>
    </>
  );
}
