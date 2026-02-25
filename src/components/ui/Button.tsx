import { type ButtonHTMLAttributes, forwardRef } from 'react';
import Spinner from '@/components/ui/Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/20 border-transparent',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500/20 border-transparent',
  outline:
    'bg-white text-slate-700 hover:bg-slate-50 focus:ring-emerald-500/20 border-slate-300',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500/20 border-transparent',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20 border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const spinnerSizeMap: Record<ButtonSize, 'sm' | 'sm' | 'sm'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'sm',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
