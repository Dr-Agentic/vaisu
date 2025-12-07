import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    borderColor: 'border-green-500',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  error: {
    icon: AlertCircle,
    borderColor: 'border-red-500',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-amber-500',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  info: {
    icon: Info,
    borderColor: 'border-blue-500',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
};

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (type === 'success' && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, type, duration, onClose]);

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-xl p-4 shadow-strong animate-slide-in-right flex items-start gap-3 min-w-[320px] max-w-md`}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        {message && (
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        )}
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all duration-200"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
