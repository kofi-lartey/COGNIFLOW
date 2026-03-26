import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-cyan-accent text-background-dark hover:brightness-110 active:scale-[0.98]',
      secondary: 'bg-card-dark border border-border-dark text-text-primary hover:bg-border-dark/30',
      outline: 'border border-border-dark bg-transparent text-text-primary hover:bg-border-dark/20',
      ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-background-dark/50',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-5 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-soft font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-accent focus:ring-offset-2 focus:ring-offset-background-dark disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };