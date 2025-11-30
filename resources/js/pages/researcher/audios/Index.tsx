import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
// Update the import path below to the correct relative path if the file exists elsewhere, for example:
import AudioUploadForm from './forms/audio-upload-form';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import { FileAudio, Upload } from 'lucide-react';

interface AudioListItem {
    id: number;
    title: string | null;
    original_filename: string;
    duration_seconds: number | null;
    formatted_duration: string;
    file_size_bytes: number;
    formatted_file_size: string;
    status: 'draft' | 'labeled' | 'exported';
    total_segments: number;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Statistics {
    total: number;
    draft: number;
    labeled: number;
}

interface AudioIndexProps {
    audios: {
        data: AudioListItem[];
        links: PaginationLink[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    filters: {
        search: string | null;
        status: string | null;
        sort: string;
        direction: string;
        per_page: number;
    };
    statistics: Statistics;
}

export default function Index({ audios, filters, statistics }: AudioIndexProps) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const { t, direction } = useTranslation();
    const alignStart = direction === 'rtl' ? 'text-right' : 'text-left';
    const alignEnd = direction === 'rtl' ? 'text-left' : 'text-right';

    const handleDelete = (id: number, filename: string) => {
        if (confirm(t('audios.deleteConfirm', { filename }))) {
            router.delete(`/researcher/audios/${id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
            draft: 'secondary',
            labeled: 'default',
            exported: 'outline',
        };

        return (
            <Badge variant={variants[status] || 'default'}>
                {t(`audios.status.${status}`)}
            </Badge>
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: t('audios.title'),
                    href: '/researcher/audios',
                },
            ]}
        >
            <Head title={t('audios.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <FileAudio className="h-6 w-6" />
                            {t('audios.title')}
                        </h1>
                        <p className="text-muted-foreground">{t('audios.description')}</p>
                    </div>

                    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Upload className="h-4 w-4 mr-2" />
                                {t('audios.uploadTitle')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{t('audios.uploadTitle')}</DialogTitle>
                                <DialogDescription>{t('audios.uploadDescription')}</DialogDescription>
                            </DialogHeader>

                            <AudioUploadForm onSuccess={() => setUploadOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="text-2xl font-bold">{statistics.total}</div>
                        <p className="text-sm text-muted-foreground">{t('audios.stats.total')}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="text-2xl font-bold">{statistics.labeled}</div>
                        <p className="text-sm text-muted-foreground">{t('audios.stats.labeled')}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="text-2xl font-bold">{statistics.draft}</div>
                        <p className="text-sm text-muted-foreground">{t('audios.stats.draft')}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full overflow-hidden rounded-xl border bg-card shadow-sm">
                    <table className="min-w-full table-auto divide-y divide-border text-sm">
                        <colgroup>
                            <col className="w-2/5" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                        </colgroup>
                        <thead className="bg-muted/40">
                            <tr>
                                <th className={`px-4 py-3 ${alignStart} text-sm font-medium text-muted-foreground`}>
                                    {t('audios.table.file')}
                                </th>
                                <th className={`px-4 py-3 ${alignStart} text-sm font-medium text-muted-foreground`}>
                                    {t('audios.table.duration')}
                                </th>
                                <th className={`px-4 py-3 ${alignStart} text-sm font-medium text-muted-foreground`}>
                                    {t('audios.table.segments')}
                                </th>
                                <th className={`px-4 py-3 ${alignStart} text-sm font-medium text-muted-foreground`}>
                                    {t('audios.table.status')}
                                </th>
                                <th className={`px-4 py-3 ${alignEnd} text-sm font-medium text-muted-foreground`}>
                                    {t('audios.table.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {audios.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        <FileAudio className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                                        <p>{t('audios.noResults')}</p>
                                        <p className="text-xs mt-1">{t('audios.uploadPrompt')}</p>
                                    </td>
                                </tr>
                            )}

                            {audios.data.map((audio) => (
                                <tr key={audio.id} className="hover:bg-muted/20 transition-colors">
                                    <td className={`px-4 py-3 ${alignStart}`}>
                                        <div>
                                            <div className="font-medium">
                                                {audio.title || audio.original_filename}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {audio.formatted_file_size}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`px-4 py-3 text-muted-foreground ${alignStart}`}>
                                        {audio.formatted_duration}
                                    </td>
                                    <td className={`px-4 py-3 text-muted-foreground ${alignStart}`}>
                                        <Badge variant="outline">{audio.total_segments}</Badge>
                                    </td>
                                    <td className={`px-4 py-3 ${alignStart}`}>
                                        {getStatusBadge(audio.status)}
                                    </td>
                                    <td className={`px-4 py-3 ${alignEnd}`}>
                                        <div className={`flex flex-wrap gap-2 ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                                            <Button asChild size="sm" variant="ghost">
                                                <Link href={`/researcher/audios/${audio.id}/label`}>
                                                    {t('actions.label')}
                                                </Link>
                                            </Button>
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/researcher/audios/${audio.id}`}>
                                                    {t('actions.view')}
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(audio.id, audio.original_filename)}
                                            >
                                                {t('actions.delete')}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination links={audios.links} />
            </div>
        </AppLayout>
    );
}