import { Head, Link, router } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';
import { type BreadcrumbItem } from '@/types';

interface ResearchFile {
    id: number;
    name: string;
    size_bytes: number;
    mime_type: string;
    url: string;
}

interface ResearchResource {
    id: number;
    title: string | null;
    title_en?: string | null;
    title_ar?: string | null;
    status: string;
    is_public: boolean;
    keywords?: string | null;
    keywords_en?: string | null;
    keywords_ar?: string | null;
    abstract?: string | null;
    abstract_en?: string | null;
    abstract_ar?: string | null;
    created_at?: string | null;
    files: ResearchFile[];
}

interface ResearchShowProps {
    research: ResearchResource;
}

export default function ResearchShow({ research }: ResearchShowProps) {
    const { t, locale } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('researches.title'), href: '/researcher/researches' },
        { title: research.title ?? t('researches.card.untitled'), href: `/researcher/researches/${research.id}` },
    ];

    const statusKey = `researches.statuses.${research.status}`;
    const statusLabel = t(statusKey);
    const statusDisplay = statusLabel === statusKey ? research.status : statusLabel;

    const formatDate = (value?: string | null) => {
        if (!value) {
            return '';
        }
        try {
            return new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            }).format(new Date(value));
        } catch (error) {
            return value;
        }
    };

    const handleDelete = () => {
        if (confirm(t('researches.show.deleteConfirm'))) {
            router.delete(`/researcher/researches/${research.id}`);
        }
    };

    const keywordDisplay = research.keywords?.split(',').map((keyword) => keyword.trim()).filter(Boolean);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={research.title ?? t('researches.card.untitled')} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{statusDisplay}</Badge>
                            <Badge variant="secondary">
                                {research.is_public ? t('researches.visibility.public') : t('researches.visibility.private')}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-semibold">{research.title ?? t('researches.card.untitled')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {research.created_at ? t('researches.card.created', { date: formatDate(research.created_at) }) : ''}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline">
                            <Link href={`/researcher/researches/${research.id}/edit`}>{t('actions.edit')}</Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            {t('actions.delete')}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2 space-y-4">
                        <section className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">{t('researches.show.overview')}</h2>
                            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                                {research.abstract ?? t('researches.card.noSummary')}
                            </p>
                        </section>

                        <section className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="text-base font-semibold">{t('researches.show.keywords')}</h3>
                            {keywordDisplay && keywordDisplay.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {keywordDisplay.map((keyword, index) => (
                                        <Badge key={`${keyword}-${index}`} variant="secondary">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-muted-foreground">{t('researches.show.noKeywords')}</p>
                            )}
                        </section>
                    </div>

                    <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold">{t('researches.show.metadata')}</h2>

                        <div className="space-y-3 text-sm">
                            <MetadataRow label={t('researches.show.status')} value={statusDisplay} />
                            <MetadataRow
                                label={t('researches.show.visibility')}
                                value={research.is_public ? t('researches.visibility.public') : t('researches.visibility.private')}
                            />
                            <MetadataRow label={t('researches.show.createdAt')} value={formatDate(research.created_at)} />
                        </div>
                    </section>
                </div>

                <section className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">{t('researches.show.filesSection')}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t('researches.show.filesHelp')}
                        </p>
                    </div>

                    {research.files.length === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">{t('researches.show.noFiles')}</p>
                    ) : (
                        <ul className="mt-4 divide-y divide-border text-sm">
                            {research.files.map((file) => (
                                <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {file.mime_type} · {formatBytes(file.size_bytes)}
                                        </p>
                                    </div>
                                    <Button asChild size="sm" variant="outline">
                                        <a href={file.url} target="_blank" rel="noreferrer">
                                            {t('actions.view')}
                                        </a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

function MetadataRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value || '—'}</span>
        </div>
    );
}

function formatBytes(bytes?: number | null) {
    if (!bytes || !Number.isFinite(bytes) || bytes <= 0) {
        return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
}
