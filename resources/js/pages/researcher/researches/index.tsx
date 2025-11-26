import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';

import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';

interface StatusOption {
    value: string;
    label: string;
}

interface ResearchCard {
    id: number;
    title: string | null;
    status: string;
    is_public: boolean;
    created_at: string | null;
    excerpt?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ResearchIndexProps {
    researches: {
        data: ResearchCard[];
        links: PaginationLink[];
    };
    filters: {
        search?: string | null;
        status?: string | null;
        visibility?: string | null;
    };
    statuses: StatusOption[];
}

export default function ResearcherResearchesIndex({ researches, filters, statuses }: ResearchIndexProps) {
    const { t, direction, locale } = useTranslation();
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [visibility, setVisibility] = useState(filters.visibility ?? '');

    const localizedStatuses = useMemo(() => {
        return statuses.map((statusOption) => {
            const key = `researches.statuses.${statusOption.value}`;
            const translated = t(key);
            return {
                value: statusOption.value,
                label: translated === key ? statusOption.label : translated,
            };
        });
    }, [statuses, t]);

    const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        router.get(
            '/researcher/researches',
            {
                search,
                status,
                visibility,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setVisibility('');
        router.get('/researcher/researches', {}, { replace: true });
    };

    const formatDate = (value?: string | null) => {
        if (!value) {
            return '';
        }
        try {
            return new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }).format(new Date(value));
        } catch (error) {
            return value;
        }
    };

    const visibilityLabel = (isPublic: boolean) =>
        isPublic ? t('researches.visibility.public') : t('researches.visibility.private');

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: t('researches.title'),
                    href: '/researcher/researches',
                },
            ]}
        >
            <Head title={t('researches.title')} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{t('researches.title')}</h1>
                        <p className="text-muted-foreground">{t('researches.description')}</p>
                    </div>
                    <Button asChild>
                        <Link href="/researcher/researches/create">{t('researches.createButton')}</Link>
                    </Button>
                </div>

                <form className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-4" onSubmit={applyFilters}>
                    <div className="md:col-span-2">
                        <LabelledField label={t('researches.filters.search')}>
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t('researches.filters.searchPlaceholder')}
                            />
                        </LabelledField>
                    </div>
                    <div>
                        <LabelledField label={t('researches.filters.status')}>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                            >
                                <option value="">{t('researches.filters.statusAll')}</option>
                                {localizedStatuses.map((statusOption) => (
                                    <option key={statusOption.value} value={statusOption.value}>
                                        {statusOption.label}
                                    </option>
                                ))}
                            </select>
                        </LabelledField>
                    </div>
                    <div>
                        <LabelledField label={t('researches.filters.visibility')}>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                                value={visibility}
                                onChange={(event) => setVisibility(event.target.value)}
                            >
                                <option value="">{t('researches.filters.visibilityAll')}</option>
                                <option value="public">{t('researches.filters.visibilityPublic')}</option>
                                <option value="private">{t('researches.filters.visibilityPrivate')}</option>
                            </select>
                        </LabelledField>
                    </div>
                    <div className="md:col-span-4 flex flex-wrap items-center justify-end gap-3">
                        <Button variant="outline" type="button" onClick={resetFilters}>
                            {t('researches.filters.reset')}
                        </Button>
                        <Button type="submit">{t('researches.filters.apply')}</Button>
                    </div>
                </form>

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {researches.data.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed bg-muted/30 p-8 text-center text-muted-foreground">
                            {t('researches.emptyState')}
                        </div>
                    )}

                    {researches.data.map((research) => {
                        const statusLabel = localizedStatuses.find((option) => option.value === research.status)?.label ??
                            research.status;
                        return (
                            <div key={research.id} className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {research.title || t('researches.card.untitled')}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {research.created_at
                                                ? t('researches.card.created', { date: formatDate(research.created_at) })
                                                : null}
                                        </p>
                                    </div>
                                    <Badge variant="outline">{statusLabel}</Badge>
                                </div>
                                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                                    {research.excerpt?.length ? research.excerpt : t('researches.card.noSummary')}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    <Badge variant="secondary">{visibilityLabel(research.is_public)}</Badge>
                                </div>
                                <div className={`mt-6 flex flex-wrap items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                    <div className="text-xs text-muted-foreground">
                                        {research.created_at ? formatDate(research.created_at) : ''}
                                    </div>
                                    <div className={`ml-auto flex gap-2 ${direction === 'rtl' ? 'mr-auto ml-0' : ''}`}>
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/researcher/researches/${research.id}`}>
                                                {t('actions.view')}
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/researcher/researches/${research.id}/edit`}>
                                                {t('actions.edit')}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Pagination links={researches.links ?? []} />
            </div>
        </AppLayout>
    );
}

function LabelledField({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="flex w-full flex-col gap-2 text-sm font-medium text-foreground">
            <span>{label}</span>
            {children}
        </label>
    );
}
