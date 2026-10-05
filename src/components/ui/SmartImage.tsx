import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../lib/cn';
import { FilmIcon } from './Icon';

interface SmartImageProps {
  readonly src: string;
  readonly alt: string;
  /** Shown inside the fallback card when the artwork cannot be loaded. */
  readonly fallbackLabel?: string;
  /** Dominant colour of the real artwork, used to tint the fallback. */
  readonly accentColor?: string;
  readonly className?: string;
  readonly imageClassName?: string;
  readonly loading?: 'lazy' | 'eager';
  readonly sizes?: string;
}

function SmartImageFrame({
  src,
  alt,
  fallbackLabel,
  accentColor = '#3f3f3b',
  className,
  imageClassName,
  loading = 'lazy',
  sizes,
}: SmartImageProps) {
  const { t } = useTranslation();
  // Only ever set from the img's own load/error events.
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className={cn('relative overflow-hidden bg-ink-100 dark:bg-ink-800', className)}>
      {status !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          sizes={sizes}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            imageClassName,
          )}
        />
      )}

      {status === 'loading' && (
        <div
          className="absolute inset-0 animate-pulse bg-linear-to-br from-ink-200 to-ink-100 dark:from-ink-800 dark:to-ink-900"
          aria-hidden="true"
        />
      )}

      {status === 'error' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center"
          style={{ background: `linear-gradient(150deg, ${accentColor}66 0%, #18181b 85%)` }}
          role="img"
          aria-label={alt}
        >
          <FilmIcon className="size-7 text-white/70" />
          <span className="line-clamp-3 text-xs font-semibold text-white/90">
            {fallbackLabel ?? t('errors.imageFailed')}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * An image that never leaves a hole in the layout: a shimmer while loading,
 * and a tinted, labelled card if the file fails (offline, blocked host, dead
 * link).
 *
 * Keying the frame on `src` restarts the load state for a new URL without a
 * render-phase state update or an effect.
 */
export function SmartImage(props: SmartImageProps) {
  return <SmartImageFrame key={props.src} {...props} />;
}
