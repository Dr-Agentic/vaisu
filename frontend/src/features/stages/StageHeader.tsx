import React from "react";
import { ArrowLeft, Menu, Info } from "lucide-react";
import { Button } from "../../components/primitives";
import { cn } from "../../lib/utils";

export interface StageHeaderProps {
    title: string;
    documentId?: string;
    wordCount?: number;
    vizCount?: number;
    onBack?: () => void;
    onToggleSidebar?: () => void;
    onToggleSummary?: () => void;
    className?: string;
}

/**
 * StageHeader
 * 
 * Standardized header for document analysis stages.
 * Features a modern, theme-aware design with glassmorphism and gradient text.
 */
export const StageHeader: React.FC<StageHeaderProps> = ({
    title,
    documentId,
    wordCount,
    vizCount,
    onBack,
    onToggleSidebar,
    onToggleSummary,
    className,
}) => {
    return (
        <header
            className={cn(
                "h-[64px] px-6 border-b flex items-center justify-between z-40 backdrop-blur-md",
                "bg-[var(--color-surface-base)]/80 border-[var(--color-border-subtle)]",
                className
            )}
        >
            {/* Document Info */}
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <h1
                        className="text-lg font-bold tracking-tight text-gradient"
                        style={{
                            fontSize: "var(--font-size-lg)",
                            fontWeight: "var(--font-weight-bold)"
                        }}
                    >
                        {title || "Untitled Document"}
                    </h1>
                    {documentId && (
                        <span
                            className="font-mono text-[10px] opacity-40"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            ID: {documentId}
                        </span>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-3 py-1 px-3 rounded-full bg-[var(--color-surface-secondary)]/50 border border-[var(--color-border-subtle)]">
                    <span
                        className="text-xs font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {wordCount?.toLocaleString() || 0} words
                    </span>
                    <div className="w-[1px] h-3 bg-[var(--color-border-subtle)]" />
                    <span
                        className="text-xs font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {vizCount || 0} visualizations
                    </span>
                </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
                {onBack && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="hover:bg-[var(--color-surface-secondary)]"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                )}
                <div className="w-[1px] h-4 mx-1 bg-[var(--color-border-subtle)]" />
                {onToggleSidebar && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleSidebar}
                        className="hover:bg-[var(--color-surface-secondary)]"
                        title="Toggle Sidebar (S)"
                    >
                        <Menu className="w-4 h-4" />
                    </Button>
                )}
                {onToggleSummary && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleSummary}
                        className="hover:bg-[var(--color-surface-secondary)]"
                        title="Toggle Summary"
                    >
                        <Info className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </header>
    );
};
