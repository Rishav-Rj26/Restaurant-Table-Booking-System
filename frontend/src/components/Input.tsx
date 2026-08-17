import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full', className)}>
        {label && <label htmlFor={inputId} className="text-sm font-semibold text-on-surface font-sans">{label}</label>}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'h-12 rounded-lg border bg-surface px-4 text-base font-sans transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:opacity-50 disabled:bg-gray-100 cursor-text',
            error ? 'border-error focus:ring-error' : 'border-outline hover:border-secondary'
          )}
          {...props}
        />
        {(error || helperText) && <span className={clsx('text-sm font-sans', error ? 'text-error' : 'text-outline')}>{error || helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
