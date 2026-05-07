export interface SlaInfo {
  daysRemaining: number | null;
  label: string;
  tone: 'safe' | 'warn' | 'urgent' | 'overdue' | 'none';
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateSla(dueDate: string | null): SlaInfo {
  if (!dueDate) {
    return { daysRemaining: null, label: 'No deadline', tone: 'none' };
  }
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / MS_PER_DAY);

  if (diff < 0) {
    return {
      daysRemaining: diff,
      label: `${Math.abs(diff)}d overdue`,
      tone: 'overdue',
    };
  }
  if (diff === 0) {
    return { daysRemaining: 0, label: 'Due today', tone: 'urgent' };
  }
  if (diff <= 3) {
    return { daysRemaining: diff, label: `${diff}d left`, tone: 'urgent' };
  }
  if (diff <= 7) {
    return { daysRemaining: diff, label: `${diff}d left`, tone: 'warn' };
  }
  return { daysRemaining: diff, label: `${diff}d left`, tone: 'safe' };
}
