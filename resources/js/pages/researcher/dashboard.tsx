import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, BookOpenCheck, ExternalLink, FileText, Layers, Lock, Unlock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';

interface DashboardProps {
    profileIncomplete?: boolean;
    stats: DashboardStats;
}

type LatestResearch = {
    id: number;
    title: string | null;
    status: string;
    is_public: boolean;
    updated_at?: string | null;
};

type DashboardStats = {
    totals: {
        researches: number;
        researchVersions: number;
        files: number;
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
            <div className="pointer-events-none absolute right-4 top-4 size-14 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-2xl" />
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

export default function Dashboard({ profileIncomplete, stats }: DashboardProps) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard.title'),
            href: dashboard().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {profileIncomplete && (
                    <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-500" />
                        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                            {t('dashboard.profileIncompleteTitle')}
                        </AlertTitle>
                        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                            <div className="flex items-center justify-between">
                                <span>{t('dashboard.profileIncompleteDescription')}</span>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="ml-4 border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-300 dark:hover:bg-yellow-900/30"
                                >
                                    <Link href="/settings/profile">
                                        {t('dashboard.profileIncompleteCta')}
                                        <ExternalLink className="ml-2 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label={t('dashboard.researcher.myResearches')}
                        value={stats.totals.researches}
                        helperText={`${t('dashboard.admin.public')}: ${stats.totals.publicResearches} • ${t('dashboard.admin.private')}: ${stats.totals.privateResearches}`}
                        icon={BookOpenCheck}
                    />
                    <StatCard
                        label={t('researches.statuses.published')}
                        value={stats.statusCounts.published ?? 0}
                        helperText={t('dashboard.researcher.liveNow')}
                        icon={Layers}
                    />
                    <StatCard
                        label={t('researches.statuses.under_review')}
                        value={stats.statusCounts.under_review ?? 0}
                        helperText={t('dashboard.researcher.awaiting')}
                        icon={FileText}
                    />
                    <StatCard
                        label={t('dashboard.researcher.files')}
                        value={stats.totals.files}
                        helperText={t('dashboard.researcher.versionsCount', {
                            count: stats.totals.researchVersions,
                        })}
                        icon={Layers}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t('dashboard.researcher.statusOverview')}</CardTitle>
                            <CardDescription>{t('dashboard.researcher.statusOverviewHint')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {(['draft', 'under_review', 'published', 'archived'] as const).map((status) => (
                                <div key={status} className="rounded-lg border border-border/60 p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            {t(`researches.statuses.${status}`)}
                                        </p>
                                        <Badge variant="secondary">
                                            {formatter.format(stats.statusCounts[status] ?? 0)}
                                        </Badge>
                                    </div>
                                    <p className="mt-3 text-xl font-semibold leading-tight">
                                        {formatter.format(stats.statusCounts[status] ?? 0)}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('dashboard.researcher.visibility')}</CardTitle>
                            <CardDescription>{t('dashboard.researcher.visibilityHint')}</CardDescription>
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
                            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
                                <p className="text-sm font-medium text-primary">
                                    {t('dashboard.researcher.versions')}
                                </p>
                                <p className="text-2xl font-semibold leading-tight">
                                    {formatter.format(stats.totals.researchVersions)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t('dashboard.researcher.recentUpdates')}</CardTitle>
                            <CardDescription>{t('dashboard.researcher.recentUpdatesHint')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {stats.latestResearches.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                                    {t('dashboard.researcher.noRecent')}
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
                                            {research.updated_at
                                                ? new Date(research.updated_at).toLocaleString()
                                                : t('dashboard.placeholder')}
                                        </p>
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
                            <CardTitle>{t('dashboard.researcher.fileBreakdown')}</CardTitle>
                            <CardDescription>
                                {t('dashboard.researcher.fileBreakdownHint', { total: stats.totals.files })}
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
