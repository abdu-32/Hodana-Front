"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Doc 06 Sec 8 (NFR-ACC-002): "modals trap focus and return it to the
 * triggering element on close." Implemented with the native <dialog>
 * element, which gives focus trapping and Escape-to-close for free --
 * no focus-trap library needed.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      triggerRef.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
      // Return focus to the element that opened the modal.
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      className="w-full max-w-md rounded-2xl border-0 bg-surface p-6 shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
      onCancel={(e) => {
        // Let the native <dialog> close via Escape; onClose runs from the
        // "close" event listener above so both paths (Escape and a
        // programmatic close) stay in sync.
        e.preventDefault();
        dialogRef.current?.close();
      }}
    >
      <h2 id="modal-title" className="mb-4 font-display text-lg font-semibold tracking-tight text-text">
        {title}
      </h2>
      {children}
    </dialog>
  );
}