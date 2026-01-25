import React, { useState, useMemo } from 'react';
import { Search, FileText, Clock } from 'lucide-react';
import { Card, Badge } from '@/components/primitives';
import { cn } from '@/lib/utils';
import { DocumentListItem } from '@/stores/documentStore';

interface DocListVisualizerProps {
    documents: DocumentListItem[];
    isLoading: boolean;
    onDocumentClick: (id: string) => void;
}

type DateFilter = 'all' | 'today' | 'week' | 'month';
type TypeFilter = 'all' | 'pdf' | 'md' | 'docx';

export const DocListVisualizer: React.FC<DocListVisualizerProps> = ({
    documents,
    isLoading,
    onDocumentClick,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

    const filteredDocs = useMemo(() => {
        return documents
            .filter((doc) => {
                // Search filter
                const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (typeof doc.tldr === 'string' ? doc.tldr.toLowerCase().includes(searchQuery.toLowerCase()) :
                        doc.tldr?.text?.toLowerCase().includes(searchQuery.toLowerCase()));

                if (!matchesSearch) return false;

                // Type filter
                if (typeFilter !== 'all') {
                    if (!doc.fileType.toLowerCase().includes(typeFilter)) return false;
                }

                // Date filter
                if (dateFilter !== 'all') {
                    const docDate = new Date(doc.uploadDate);
                    const now = new Date();
                    if (dateFilter === 'today') {
                        if (docDate.toDateString() !== now.toDateString()) return false;
                    } else if (dateFilter === 'week') {
                        const weekAgo = new Date();
                        weekAgo.setDate(now.getDate() - 7);
                        if (docDate < weekAgo) return false;
                    } else if (dateFilter === 'month') {
                        const monthAgo = new Date();
                        monthAgo.setMonth(now.getMonth() - 1);
                        if (docDate < monthAgo) return false;
                    }
                }

                return true;
            })
            .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }, [documents, searchQuery, dateFilter, typeFilter]);

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-border-strong)] transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <div className="flex bg-[var(--color-surface-elevated)] p-1 rounded-lg border border-[var(--color-border-subtle)]">
                        {(['all', 'today', 'week', 'month'] as DateFilter[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setDateFilter(f)}
                                className={cn(
                                    'px-3 py-1 text-xs rounded-md capitalize transition-all',
                                    dateFilter === f
                                        ? 'bg-[var(--color-surface-base)] text-[var(--color-text-primary)] shadow-sm'
                                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-[var(--color-surface-elevated)] p-1 rounded-lg border border-[var(--color-border-subtle)]">
                        {(['all', 'pdf', 'md', 'docx'] as TypeFilter[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setTypeFilter(f)}
                                className={cn(
                                    'px-3 py-1 text-xs rounded-md uppercase transition-all',
                                    typeFilter === f
                                        ? 'bg-[var(--color-surface-base)] text-[var(--color-text-primary)] shadow-sm'
                                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid of cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 bg-[var(--color-surface-elevated)] animate-pulse rounded-2xl border border-[var(--color-border-subtle)]" />
                    ))
                ) : filteredDocs.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-[var(--color-text-tertiary)]">
                        <p>No documents found matching your filters.</p>
                    </div>
                ) : (
                    filteredDocs.map((doc) => (
                        <Card
                            key={doc.id}
                            padding="lg"
                            className="group hover:border-[var(--color-border-strong)] transition-all cursor-pointer h-full flex flex-col"
                            onClick={() => onDocumentClick(doc.id)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-[var(--color-surface-elevated)] group-hover:bg-[var(--color-background-primary)] transition-colors">
                                    <FileText className="w-5 h-5 text-[var(--color-interactive-primary-base)]" />
                                </div>
                                <Badge variant="neutral" className="text-[10px] uppercase">
                                    {doc.fileType.split('/')[1] || doc.fileType}
                                </Badge>
                            </div>

                            <h3 className="font-bold text-[var(--color-text-primary)] mb-2 line-clamp-1">
                                {doc.title}
                            </h3>

                            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-4 flex-1">
                                {typeof doc.tldr === 'string' ? doc.tldr : doc.tldr?.text}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)] mt-auto">
                                <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(doc.uploadDate)}
                                </div>
                                <div className="text-[10px] text-[var(--color-text-tertiary)] font-mono">
                                    {doc.wordCount.toLocaleString()} words
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
