
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, trend, icon }: StatCardProps) {
  return (
    <div className="p-6 rounded-xl bg-surface border border-outline-variant shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-outline">{title}</h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className="text-3xl font-serif font-semibold text-on-surface mb-2">{value}</div>
      {trend !== undefined && (
        <div className={clsx("text-sm font-medium", trend >= 0 ? "text-green-600" : "text-error")}>
          {trend >= 0 ? '+' : ''}{trend}% from last week
        </div>
      )}
    </div>
  );
}
