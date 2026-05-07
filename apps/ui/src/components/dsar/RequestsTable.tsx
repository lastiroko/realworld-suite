import type { DsarRequest } from '../../types';
import { StatusPill } from './StatusPill';
import { SlaBadge } from './SlaBadge';

interface Props {
  requests: DsarRequest[];
  onSelect: (request: DsarRequest) => void;
}

export function RequestsTable({ requests, onSelect }: Props) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Requester</th>
            <th>Type</th>
            <th>SLA</th>
            <th>Status</th>
            <th></th>
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
          {requests.map((req) => (
            <tr
              key={req.id}
              className="table-row"
              onClick={() => onSelect(req)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSelect(req);
              }}
            >
              <td>
                <strong>{req.dataSubjectName}</strong>
                <small className="timestamp">{req.dataSubjectEmail}</small>
                <small className="timestamp">
                  Submitted {new Date(req.createdAt).toLocaleString()}
                </small>
              </td>
              <td>
                <div>{req.requestType}</div>
                <small className="timestamp">{req.details}</small>
              </td>
              <td>
                <SlaBadge dueDate={req.dueDate} />
              </td>
              <td>
                <StatusPill status={req.status} />
              </td>
              <td>
                <button
                  className="secondary"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(req);
                  }}
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
