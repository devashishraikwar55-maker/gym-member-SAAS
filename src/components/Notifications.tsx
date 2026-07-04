import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'danger';
}

interface NotificationsProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export function Notifications({ toasts, removeToast }: NotificationsProps) {
  return (
    <div 
      id="notifications-container"
      className="fixed top-5 right-5 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const bgClass = {
            success: 'bg-white border-l-4 border-brand-success text-brand-text-primary shadow-lg',
            warning: 'bg-white border-l-4 border-brand-warning text-brand-text-primary shadow-lg',
            danger: 'bg-white border-l-4 border-brand-danger text-brand-text-primary shadow-lg'
          }[toast.type];

          const Icon = {
            success: CheckCircle,
            warning: AlertTriangle,
            danger: XCircle
          }[toast.type];

          const iconColor = {
            success: 'text-brand-success',
            warning: 'text-brand-warning',
            danger: 'text-brand-danger'
          }[toast.type];

          return (
            <motion.div
              key={toast.id}
              id={`toast-${toast.id}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
              className={`flex items-start p-4 rounded-xl border border-brand-border pointer-events-auto ${bgClass}`}
              layout
            >
              <div className="flex-shrink-0 mr-3">
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 text-sm font-medium pr-4">
                {toast.message}
              </div>
              <button
                id={`close-toast-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer rounded p-0.5 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
