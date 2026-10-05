import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

type Tone = 'neutral' | 'brand' | 'gold' | 'success' | 'muted';

const TONES: Record<Tone, string> = {
  neutral:
    'border-ink-200 bg-white/80 text-ink-700 dark:border-ink-700 dark:bg-ink-900/70 dark:text-ink-200',
  brand: 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/40 dark:text-brand-200',
  gold: 'border-gold-400/40 bg-gold-400/15 text-gold-700 dark:border-gold-400/30 dark:bg-gold-400/10 dark:text-gold-300',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300',
  muted: 'border-transparent bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400',
};

interface BadgeProps {
  readonly children: ReactNode;
  readonly tone?: Tone;
  readonly className?: string;
  readonly icon?: ReactNode;
}

export function Badge({ children, tone = 'neutral', className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
