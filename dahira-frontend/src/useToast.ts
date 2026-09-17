import { useCallback, useState } from 'react';
import type { ToastItem, ToastType } from './Toast';

let nextId = 1;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setToasts((current) => [...current, { id, type, message }]);
  }, []);

  return { toasts, pushToast, dismissToast };
}