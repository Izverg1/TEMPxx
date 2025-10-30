import React from 'react';

interface ProgressProps {
    value: number;
    className?: string;
    indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value, indicatorClassName, ...props }, ref) => {
        const progressValue = value ?? 0;

        return (
            <div
                ref={ref}
                className={`relative h-2 w-full overflow-hidden rounded-full bg-brand-bg-light ${className}`}
                {...props}
            >
                <div
                    className={`h-full w-full flex-1 bg-brand-primary transition-all ${indicatorClassName}`}
                    style={{ transform: `translateX(-${100 - progressValue}%)` }}
                />
            </div>
        );
    }
);
Progress.displayName = 'Progress';

export { Progress };