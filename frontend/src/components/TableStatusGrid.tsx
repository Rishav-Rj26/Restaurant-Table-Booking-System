
import clsx from 'clsx';
import { type BadgeStatus } from './StatusBadge';

interface Table {
  id: string;
  label: string;
  capacity: number;
  status: 'available' | 'held' | 'occupied' | 'present';
}

export default function TableStatusGrid({ tables, onTableClick }: { tables: Table[], onTableClick?: (table: Table) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4 bg-gray-50 rounded-xl border border-outline-variant">
      {tables.map(table => {
        const colorClass = {
          available: 'bg-white border-outline-variant text-on-surface hover:border-primary',
          held: 'bg-amber-100 border-amber-300 text-amber-900',
          occupied: 'bg-secondary text-white border-secondary',
          present: 'bg-green-600 text-white border-green-700'
        }[table.status];

        return (
          <button 
            key={table.id}
            onClick={() => onTableClick?.(table)}
            className={clsx(
              "aspect-square rounded-xl flex flex-col items-center justify-center p-2 border-2 transition-all",
              colorClass
            )}
          >
            <div className="font-bold text-lg">{table.label}</div>
            <div className="text-xs opacity-80 mt-1">{table.capacity} pax</div>
          </button>
        );
      })}
    </div>
  );
}
