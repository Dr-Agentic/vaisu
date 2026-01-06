import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../../lib/utils';

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
    colorVar: 'var(--color-semantic-success-base)',
    bgVar: 'var(--color-semantic-success-background)',
    borderVar: 'var(--color-semantic-success-border)',
    textVar: 'var(--color-semantic-success-text)',
  },
  error: {
    icon: AlertCircle,
    colorVar: 'var(--color-semantic-error-base)',
    bgVar: 'var(--color-semantic-error-background)',
    borderVar: 'var(--color-semantic-error-border)',
    textVar: 'var(--color-semantic-error-text)',
  },
  warning: {
    icon: AlertTriangle,
    colorVar: 'var(--color-semantic-warning-base)',
    bgVar: 'var(--color-semantic-warning-background)',
    borderVar: 'var(--color-semantic-warning-border)',
    textVar: 'var(--color-semantic-warning-text)',
  },
  info: {
    icon: Info,
    colorVar: 'var(--color-semantic-info-base)',
    bgVar: 'var(--color-semantic-info-background)',
    borderVar: 'var(--color-semantic-info-border)',
    textVar: 'var(--color-semantic-info-text)',
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
      className={cn(
        "border-l-4 rounded-xl p-[var(--spacing-lg)] shadow-strong animate-slide-in-right flex items-start gap-[var(--spacing-md)] min-w-[320px] max-w-md",
        "transition-all duration-200"
      )}
      style={{
        backgroundColor: config.bgVar,
        borderColor: config.colorVar,
        boxShadow: 'var(--elevation-lg)',
      }}
    >
      <Icon
        className="w-[var(--spacing-12)] h-[var(--spacing-12)] flex-shrink-0 mt-[var(--spacing-xs)]"
        style={{ color: config.colorVar }}
      />

      <div className="flex-1 min-w-0">
        <h4
          className="font-semibold text-sm"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h4>
        {message && (
          <p
            className="text-sm mt-[var(--spacing-xs)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {message}
          </p>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:scale-110 transition-all duration-200"
        style={{ color: 'var(--color-text-tertiary)' }}
        aria-label="Close notification"
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-tertiary)';
        }}
      >
        <X className="w-[var(--spacing-12)] h-[var(--spacing-12)]" />
      </button>
    </div>
  );
}
