import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-brand-border bg-brand-bg-light px-3 py-2 text-sm text-brand-text-light placeholder:text-brand-text-dark transition-shadow focus:outline-none focus:ring-0 focus:shadow-glow-primary ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };