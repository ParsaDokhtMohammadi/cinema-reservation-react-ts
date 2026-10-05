import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition ' +
  'duration-200 ease-[var(--ease-out-soft)] disabled:cursor-not-allowed disabled:opacity-50 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-500 active:bg-brand-700 ' +
    'dark:bg-brand-500 dark:hover:bg-brand-400 dark:active:bg-brand-600',
  secondary:
    'border border-ink-200 bg-white text-ink-900 hover:border-ink-300 hover:bg-ink-50 ' +
    'dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50 dark:hover:border-ink-600 dark:hover:bg-ink-800',
  ghost:
    'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800/80',
  danger:
    'border border-brand-200 text-brand-700 hover:bg-brand-50 ' +
    'dark:border-brand-900 dark:text-brand-300 dark:hover:bg-brand-900/30',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
};

interface CommonProps {
  readonly variant?: Variant;
  readonly size?: Size;
  readonly fullWidth?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps extends CommonProps {
  readonly to: string;
  readonly state?: unknown;
  readonly 'aria-label'?: string;
}

/** Same visual language as Button, but renders a real link. */
export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  state,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      state={state}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
