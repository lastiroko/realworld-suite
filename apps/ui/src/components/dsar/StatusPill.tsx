import type { RequestStatus } from '../../types';
import { formatStatus, statusToken } from '../../types';

interface Props {
  status: RequestStatus;
}

export function StatusPill({ status }: Props) {
  return (
    <span className={`status-pill status-${statusToken(status)}`}>
      {formatStatus(status)}
    </span>
  );
}
