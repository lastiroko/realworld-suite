import { calculateSla } from '../../lib/sla';

interface Props {
  dueDate: string | null;
  compact?: boolean;
}

export function SlaBadge({ dueDate, compact = false }: Props) {
  const sla = calculateSla(dueDate);
  if (sla.tone === 'none' && compact) return null;
  return (
    <span
      className={`sla-badge sla-${sla.tone}${compact ? ' is-compact' : ''}`}
      title={dueDate ? `Due ${new Date(dueDate).toLocaleDateString()}` : 'No deadline set'}
    >
      <span className="sla-dot" aria-hidden="true" />
      {sla.label}
    </span>
  );
}
