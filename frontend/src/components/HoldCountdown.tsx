import React, { useState, useEffect, forwardRef } from 'react';

import { Clock } from 'lucide-react';
import clsx from 'clsx';

interface HoldCountdownProps {
  expiresAt: string;
  onExpire: () => void;
}

export default function HoldCountdown({ expiresAt, onExpire }: HoldCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 120; // less than 2 minutes

  return (
    <div className={clsx(
      "flex items-center gap-2 p-3 rounded-lg border font-medium text-sm",
      isWarning ? "bg-error-container text-error border-error/20" : "bg-secondary-container text-secondary border-secondary/20"
    )}>
      <Clock className="w-4 h-4" />
      Time remaining to complete booking: {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
