import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookCopy, FileText, Layers, Lock, Unlock, Users } from 'lucide-react';
import { useTranslation } from '@/i18n';

type LatestResearch = {
    id: number;
    title: string | null;
    status: string;
    is_public: boolean;
    created_at?: string | null;
    author?: {
        id: number;
        name?: string | null;
        email: string;
    } | null;
};

type DashboardStats = {
    totals: {
        researches: number;
        researchVersions: number;
        files: number;
        categories: number;
        tags: number;
        researchers: number;
        admins: number;
        publicResearches: number;
        privateResearches: number;
    };
    statusCounts: Record<string, number>;
    fileTypes: Record<string, number>;
    latestResearches: LatestResearch[];
};

const formatter = new Intl.NumberFormat();

type StatCardProps = {
    label: string;
    value: number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    helperText?: string;
};

function StatCard({ label, value, helperText, icon: Icon }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute right-4 top-4 size-16 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-2xl" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <div className="rounded-full bg-muted p-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="pb-6 pt-2">
                <div className="text-3xl font-semibold leading-tight text-foreground">
                    {formatter.format(value)}
                </div>
                {helperText && <p className="text-muted-foreground text-xs">{helperText}</p>}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ stats }: { stats: DashboardStats }) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('nav.dashboard'),
            href: dashboard().url,
        },
    ];

    const statusSummary = [
        { key: 'published', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200' },
        { key: 'under_review', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-200' },
        { key: 'draft', color: 'bg-slate-500/15 text-slate-700 dark:text-slate-200' },
        { key: 'archived', color: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-200' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label={t('dashboard.admin.totalResearches')}
                        value={stats.totals.researches}
                        helperText={`${t('dashboard.admin.public')}: ${stats.totals.publicResearches} • ${t('dashboard.admin.private')}: ${stats.totals.privateResearches}`}
                        icon={BookCopy}
                    />
                    <StatCard
                        label={t('dashboard.admin.published')}
                        value={stats.statusCounts.published}
                        helperText={t('researches.statuses.published')}
                        icon={Layers}
                    />
                    <StatCard
                        label={t('dashboard.admin.underReview')}
                        value={stats.statusCounts.under_review}
                        helperText={t('researches.statuses.under_review')}
                        icon={FileText}
                    />
                    <StatCard
                        label={t('dashboard.admin.researchers')}
                        value={stats.totals.researchers}
                        helperText={`${t('dashboard.admin.admins')}: ${formatter.format(stats.totals.admins)}`}
                        icon={Users}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t('dashboard.admin.researchBreakdown')}</CardTitle>
                            <CardDescription>{t('dashboard.admin.researchBreakdownHint')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {statusSummary.map((item) => (
                                <div key={item.key} className="rounded-lg border border-border/60 p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            {t(`researches.statuses.${item.key}`)}
                                        </p>
                                        <Badge variant="secondary" className={item.color}>
                                            {stats.statusCounts[item.key] ?? 0}
                                        </Badge>
                                    </div>
                                    <p className="mt-3 text-xl font-semibold leading-tight">
                                        {formatter.format(stats.statusCounts[item.key] ?? 0)}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('dashboard.admin.people')}</CardTitle>
                            <CardDescription>{t('dashboard.admin.peopleHint')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Unlock className="h-4 w-4 text-emerald-500" />
                                    {t('dashboard.admin.public')}
                                </div>
                                <span className="text-lg font-semibold">
                                    {formatter.format(stats.totals.publicResearches)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Lock className="h-4 w-4 text-amber-500" />
                                    {t('dashboard.admin.private')}
                                </div>
                                <span className="text-lg font-semibold">
                                    {formatter.format(stats.totals.privateResearches)}
                                </span>
                            </div>
                            <div className="grid gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span>{t('dashboard.admin.categories')}</span>
                                    <span className="font-semibold text-foreground">
                                        {formatter.format(stats.totals.categories)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>{t('dashboard.admin.tags')}</span>
                                    <span className="font-semibold text-foreground">
                                        {formatter.format(stats.totals.tags)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t('dashboard.admin.recentSubmissions')}</CardTitle>
                            <CardDescription>{t('dashboard.admin.recentSubmissionsHint')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {stats.latestResearches.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                                    {t('dashboard.admin.noRecent')}
                                </div>
                            )}
                            {stats.latestResearches.map((research) => (
                                <div
                                    key={research.id}
                                    className="flex flex-col gap-2 rounded-lg border border-border/60 p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-semibold leading-tight">
                                            {research.title ?? t('researches.card.untitled')}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {research.created_at
                                                ? new Date(research.created_at).toLocaleString()
                                                : t('dashboard.placeholder')}
                                        </p>
                                        {research.author && (
                                            <p className="text-muted-foreground text-xs">
                                                {research.author.name ?? research.author.email}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {t(`researches.statuses.${research.status}`)}
                                        </Badge>
                                        <Badge variant={research.is_public ? 'secondary' : 'outline'}>
                                            {research.is_public
                                                ? t('researches.visibility.public')
                                                : t('researches.visibility.private')}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('dashboard.admin.fileBreakdown')}</CardTitle>
                            <CardDescription>
                                {t('dashboard.admin.fileBreakdownHint', { total: stats.totals.files })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(['document', 'dataset', 'image', 'other'] as const).map((type) => (
                                <div
                                    key={type}
                                    className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                                >
                                    <div className="flex items-center gap-2 text-sm font-medium capitalize">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        {t(`dashboard.files.${type}`, { defaultValue: type })}
                                    </div>
                                    <span className="text-lg font-semibold">
                                        {formatter.format(stats.fileTypes[type] ?? 0)}
                                    </span>
                                </div>
                            ))}
                            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
                                <p className="text-sm font-medium text-primary">
                                    {t('dashboard.admin.versions')}
                                </p>
                                <p className="text-2xl font-semibold leading-tight">
                                    {formatter.format(stats.totals.researchVersions)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
