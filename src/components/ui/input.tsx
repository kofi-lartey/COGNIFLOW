import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full h-14 bg-background-dark/50 border rounded-soft text-text-primary text-base placeholder:text-text-secondary/50',
            'focus:outline-none focus:ring-1 focus:ring-cyan-accent focus:border-cyan-accent transition-all',
            icon && 'pl-12 pr-4',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-border-dark',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };