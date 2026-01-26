import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Files,
    Clock,
    LayoutDashboard,
    Upload,
    Type,
    Network
} from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { useUserStore } from '@/stores/userStore';
import { IndicatorCard } from '@/components/dashboard/IndicatorCard';
import { DocListVisualizer } from '@/components/dashboard/DocListVisualizer';
import { FileUploader } from '@/features/document/FileUploader';
import { TextInputArea } from '@/features/document/TextInputArea';
import { Card } from '@/components/primitives';
import { cn } from '@/lib/utils';

export const DashboardPage: React.FC = () => {
    const {
        documentList,
        isLoadingList,
        fetchDocumentList,
        stats,
        isLoadingStats,
        fetchDashboardStats,
        loadDocumentById
    } = useDocumentStore();

    const navigate = useNavigate();
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

    useEffect(() => {
        fetchDocumentList();
        fetchDashboardStats();
    }, [fetchDocumentList, fetchDashboardStats]);

    const handleDocClick = async (id: string) => {
        await loadDocumentById(id);
        navigate('/stages');
    };

    return (
        <div className="min-h-screen bg-[var(--color-background-primary)] text-[var(--color-text-primary)] pb-12">
            {/* Hero / Header Section */}
            <header className="relative overflow-hidden pt-12 pb-20 px-6">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                                Welcome back, <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#EC4899]">{user?.firstName || 'Explorer'}</span>
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl">
                                Ready to transform your documents into intelligent visual representations?
                            </p>
                        </div>
                    </div>
                </div>

                {/* Background decorative glow */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--color-interactive-primary-base)] to-transparent opacity-5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-r from-[var(--color-interactive-accent-base)] to-transparent opacity-5 blur-3xl" />
            </header>

            <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                {/* Row 1: Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <IndicatorCard
                        title="Total Documents"
                        value={stats?.totalDocuments || 0}
                        icon={Files}
                        color="aurora"
                        isLoading={isLoadingStats}
                    />
                    <IndicatorCard
                        title="Estimated Words"
                        value={(stats?.totalWords || 0).toLocaleString()}
                        icon={Type}
                        color="nova"
                        isLoading={isLoadingStats}
                    />
                    <IndicatorCard
                        title="Recent Activity"
                        value={stats?.documentsThisWeek || 0}
                        subtitle="Uploaded this week"
                        icon={Clock}
                        color="solar"
                        isLoading={isLoadingStats}
                    />
                    <IndicatorCard
                        title="Graphs Generated"
                        value={stats?.totalGraphs || 0}
                        icon={Network}
                        color="ember"
                        isLoading={isLoadingStats}
                    />
                </div>

                {/* Main Content Area: Bento Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Side: Document Explorer (Col 1-8) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <Card padding="xl" className="bg-[var(--color-surface-base)]/50 backdrop-blur-sm border-[var(--color-border-subtle)] flex-1">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Your Library</h2>
                                    <p className="text-sm text-[var(--color-text-secondary)]">Manage and explore your analyzed documents</p>
                                </div>
                                <div className="p-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
                                    <LayoutDashboard className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                                </div>
                            </div>

                            <DocListVisualizer
                                documents={documentList}
                                isLoading={isLoadingList}
                                onDocumentClick={handleDocClick}
                            />
                        </Card>
                    </div>

                    {/* Right Side: Quick Actions & Creation (Col 9-12) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Creation Card */}
                        <Card padding="xl" className="border-[var(--color-border-subtle)] bg-[var(--color-surface-base)] shadow-lg overflow-hidden relative">
                            <h2 className="text-2xl font-bold mb-2">New Project</h2>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-6">Create from file or raw text</p>

                            <div className="flex border-b border-[var(--color-border-subtle)] mb-6">
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-semibold transition-all relative",
                                        activeTab === 'upload' ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                                    )}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        File Upload
                                    </div>
                                    {activeTab === 'upload' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('paste')}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-semibold transition-all relative",
                                        activeTab === 'paste' ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                                    )}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Paste Text
                                    </div>
                                    {activeTab === 'paste' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]" />
                                    )}
                                </button>
                            </div>

                            <div className="min-h-[280px]">
                                {activeTab === 'upload' ? <FileUploader /> : <TextInputArea />}
                            </div>

                            {/* Decorative accent */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[var(--color-interactive-primary-base)] to-transparent opacity-10" />
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
