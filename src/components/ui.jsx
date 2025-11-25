import { User } from 'lucide-react';
import { cn } from '../lib/utils';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
    const variants = {
        primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20',
        secondary: 'bg-dark-surface hover:bg-dark-border text-gray-200',
        ghost: 'hover:bg-dark-surface text-gray-400 hover:text-white',
        danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500',
    };

    return (
        <button
            className={cn(
                'px-4 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export const Input = ({ className, ...props }) => (
    <input
        className={cn(
            'w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all',
            className
        )}
        {...props}
    />
);

export const Avatar = ({ src, fallback, className }) => (
    <div className={cn('w-10 h-10 rounded-xl overflow-hidden bg-dark-border flex-shrink-0', className)}>
        {src ? (
            <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-dark-surface to-dark-border">
                {fallback || <User size={20} />}
            </div>
        )}
    </div>
);
