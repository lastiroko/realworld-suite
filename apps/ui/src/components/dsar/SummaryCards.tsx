import { STATUS_OPTIONS, formatStatus } from '../../types';
import type { StatusSummary } from '../../types';

interface Props {
  summary: StatusSummary;
}

export function SummaryCards({ summary }: Props) {
  return (
    <div className="summary-grid">
      {STATUS_OPTIONS.map((status) => (
        <div key={status} className="summary-card">
          <span className="label">{formatStatus(status)}</span>
          <strong>{summary[status] ?? 0}</strong>
        </div>
      ))}
    </div>
  );
}
