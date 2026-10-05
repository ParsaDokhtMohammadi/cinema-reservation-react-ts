import Swal from 'sweetalert2';

/**
 * SweetAlert2 is reserved for destructive confirmations. Styling comes from
 * `.lumiere-swal-*` classes in index.css, which read our theme tokens, so one
 * wrapper covers light/dark and LTR/RTL without duplicating anything.
 */

const CUSTOM_CLASSES = {
  popup: 'lumiere-swal-popup',
  title: 'lumiere-swal-title',
  htmlContainer: 'lumiere-swal-text',
  actions: 'lumiere-swal-actions',
  confirmButton: 'lumiere-swal-confirm',
  cancelButton: 'lumiere-swal-cancel',
} as const;

function isRtl(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
}

export interface ConfirmOptions {
  readonly title: string;
  readonly body: string;
  readonly confirmText: string;
  readonly cancelText: string;
}

/** Resolves true only when the user explicitly confirms. */
export async function confirmDestructive(options: ConfirmOptions): Promise<boolean> {
  const rtl = isRtl();

  const result = await Swal.fire({
    title: options.title,
    text: options.body,
    icon: 'warning',
    iconColor: 'var(--gold)',
    showCancelButton: true,
    confirmButtonText: options.confirmText,
    cancelButtonText: options.cancelText,
    // In RTL the primary action belongs on the right-hand side of the pair.
    reverseButtons: rtl,
    focusCancel: true,
    buttonsStyling: false,
    customClass: CUSTOM_CLASSES,
  });

  return result.isConfirmed;
}

export interface AlertOptions {
  readonly title: string;
  readonly body: string;
  readonly confirmText: string;
}

/** A blocking "this went wrong" dialog — used for seat conflicts. */
export async function alertProblem(options: AlertOptions): Promise<void> {
  await Swal.fire({
    title: options.title,
    text: options.body,
    icon: 'error',
    confirmButtonText: options.confirmText,
    buttonsStyling: false,
    customClass: CUSTOM_CLASSES,
  });
}
