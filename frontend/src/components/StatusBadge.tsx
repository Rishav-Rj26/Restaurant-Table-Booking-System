
import clsx from 'clsx';

export type BadgeStatus = 'confirmed' | 'held' | 'pending' | 'no_show' | 'present' | 'cancelled' | 'failed';

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config: Record<BadgeStatus, { label: string; classes: string }> = {
    confirmed: { label: 'Confirmed', classes: 'bg-green-100 text-green-800 border-green-200' },
    present: { label: 'Present', classes: 'bg-green-600 text-white border-green-700 font-bold' },
    held: { label: 'Held', classes: 'bg-amber-100 text-amber-800 border-amber-200' },
    pending: { label: 'Pending', classes: 'bg-amber-100 text-amber-800 border-amber-200' },
    no_show: { label: 'No Show', classes: 'bg-red-100 text-red-800 border-red-200' },
    failed: { label: 'Failed', classes: 'bg-red-100 text-red-800 border-red-200' },
    cancelled: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const { label, classes } = config[status] || config.pending;

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border font-sans',
        classes,
        className
      )}
    >
      {label}
    </span>
  );
}
