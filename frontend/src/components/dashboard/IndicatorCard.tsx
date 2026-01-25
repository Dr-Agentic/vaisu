import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/primitives';
import { cn } from '@/lib/utils';

interface IndicatorCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        direction: 'up' | 'down' | 'stable';
    };
    color: 'aurora' | 'nova' | 'solar' | 'ember';
    className?: string;
    isLoading?: boolean;
}

const colorClasses = {
    aurora: {
        border: 'from-[#6366F1] via-[#8B5CF6] to-[#EC4899]',
        bg: 'bg-gradient-to-br from-[#6366F1]/10 via-[#8B5CF6]/10 to-[#EC4899]/10',
        text: 'text-[#8B5CF6]',
    },
    nova: {
        border: 'from-[#06B6D4] via-[#3B82F6] to-[#8B5CF6]',
        bg: 'bg-gradient-to-br from-[#06B6D4]/10 via-[#3B82F6]/10 to-[#8B5CF6]/10',
        text: 'text-[#3B82F6]',
    },
    solar: {
        border: 'from-[#F59E0B] via-[#F97316] to-[#EF4444]',
        bg: 'bg-gradient-to-br from-[#F59E0B]/10 via-[#F97316]/10 to-[#EF4444]/10',
        text: 'text-[#F97316]',
    },
    ember: {
        border: 'from-[#F43F5E] via-[#EC4899] to-[#DB2777]',
        bg: 'bg-gradient-to-br from-[#F43F5E]/10 via-[#EC4899]/10 to-[#DB2777]/10',
        text: 'text-[#EC4899]',
    },
};

export const IndicatorCard: React.FC<IndicatorCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color,
    className,
    isLoading,
}) => {
    const theme = colorClasses[color];

    return (
        <Card
            padding="lg"
            className={cn(
                'relative overflow-hidden border border-[var(--color-border-subtle)] transition-all duration-300',
                theme.bg,
                className
            )}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn('p-2 rounded-lg border border-[var(--color-border-subtle)]', theme.bg)}>
                    <Icon className={cn('w-5 h-5', theme.text)} />
                </div>
                {trend && (
                    <div className={cn(
                        'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono',
                        trend.direction === 'up' ? 'bg-green-500/10 text-green-500' :
                            trend.direction === 'down' ? 'bg-red-500/10 text-red-500' :
                                'bg-gray-500/10 text-gray-500'
                    )}>
                        {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '•'}
                        {trend.value}%
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    {title}
                </p>
                {isLoading ? (
                    <div className="h-8 w-24 animate-pulse bg-[var(--color-surface-elevated)] rounded" />
                ) : (
                    <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {value}
                    </h2>
                )}
                {subtitle && (
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Decorative gradient blur */}
            <div className={cn(
                'absolute -bottom-4 -right-4 w-24 h-24 blur-3xl opacity-20 bg-gradient-to-br',
                theme.border
            )} />
        </Card>
    );
};
