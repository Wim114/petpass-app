import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 5000;

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; containerClass: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    containerClass: 'border-green-200 bg-green-50',
    iconClass: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'border-red-200 bg-red-50',
    iconClass: 'text-red-600',
  },
  info: {
    icon: Info,
    containerClass: 'border-blue-200 bg-blue-50',
    iconClass: 'text-blue-600',
  },
};

function ToastItem({
  toast: toastData,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = variantConfig[toastData.variant];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toastData.id);
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [toastData.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex w-80 items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-right ${config.containerClass}`}
      role="alert"
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClass}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{toastData.title}</p>
        {toastData.description && (
          <p className="mt-1 text-sm text-slate-600">{toastData.description}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toastData.id)}
        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/50 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((input: ToastInput) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: Toast = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? 'info',
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container - fixed bottom-right */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return context;
}
