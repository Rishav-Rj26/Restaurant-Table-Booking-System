import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={clsx(
      "fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-sm z-50 transition-all duration-300 ease-out",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      type === 'success' ? "bg-white border-green-200 text-on-surface" : "bg-error text-white border-error"
    )}>
      {type === 'success' ? <CheckCircle2 className="text-green-600 w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }} className="p-1 hover:bg-black/10 rounded-full transition-colors flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
