
import clsx from 'clsx';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export default function Toast({ type, message, onClose }: ToastProps) {
  return (
    <div className={clsx(
      "fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-sm z-50",
      type === 'success' ? "bg-white border-green-200 text-on-surface" : "bg-error text-white border-error"
    )}>
      {type === 'success' ? <CheckCircle2 className="text-green-600 w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
