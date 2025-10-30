import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-primary disabled:opacity-50 disabled:pointer-events-none';

    const variantClasses = {
      default: 'bg-gradient-to-br from-brand-primary-light to-brand-primary text-white font-semibold hover:opacity-90 active:scale-[0.98] shadow-primary',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
      outline: 'border border-brand-border bg-white/5 hover:bg-white/10 hover:border-brand-primary/50',
      ghost: 'hover:bg-brand-primary/10 text-brand-text-dark hover:text-brand-text-light',
    };

    const sizeClasses = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
      lg: 'h-11 px-8 rounded-md',
      icon: 'h-10 w-10',
    };

    const classes = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
    ].join(' ');

    return <button className={classes} ref={ref} {...props} />;
  }
);

Button.displayName = 'Button';

export { Button };