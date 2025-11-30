import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/i18n';

interface AudioDetails {
    id: number;
    title: string | null;
    description: string | null;
    original_filename: string;
    duration_seconds: number | null;
    formatted_duration: string;
    file_size_bytes: number;
    formatted_file_size: string;
    mime_type: string;
    status: string;
    is_public: boolean;
    total_segments: number;
    url: string;
    uploaded_at: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface AudioShowProps {
    audio: AudioDetails;
}

export default function Show({ audio }: AudioShowProps) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('audios.title'), href: '/researcher/audios' },
        { title: audio.title || audio.original_filename, href: `/researcher/audios/${audio.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={audio.title || audio.original_filename} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {audio.title || audio.original_filename}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('audios.show.filename')}: {audio.original_filename}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/researcher/audios/${audio.id}/label`}>{t('actions.label')}</Link>
                        </Button>
                        <Button asChild variant="ghost">
                            <Link href="/researcher/audios">{t('actions.back')}</Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm text-sm text-muted-foreground">
                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <div>
                            <p className="font-semibold">{t('audios.form.title')}</p>
                            <p>{audio.title ?? '—'}</p>
                        </div>
                        <div>
                            <p className="font-semibold">{t('audios.table.status')}</p>
                            <p>{t(`audios.status.${audio.status}`)}</p>
                        </div>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <div>
                            <p className="font-semibold">{t('audios.table.duration')}</p>
                            <p>{audio.formatted_duration}</p>
                        </div>
                        <div>
                            <p className="font-semibold">{t('audios.show.fileSize')}</p>
                            <p>{audio.formatted_file_size}</p>
                        </div>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <div>
                            <p className="font-semibold">{t('audios.table.segments')}</p>
                            <p>{audio.total_segments}</p>
                        </div>
                        <div>
                            <p className="font-semibold">{t('audios.visibility.label')}</p>
                            <p>{audio.is_public ? t('audios.visibility.public') : t('audios.visibility.private')}</p>
                        </div>
                    </div>

                    {audio.description && (
                        <div>
                            <p className="font-semibold">{t('audios.form.description')}</p>
                            <p className="whitespace-pre-wrap">{audio.description}</p>
                        </div>
                    )}

                    <div>
                        <p className="font-semibold">{t('audios.show.mimeType')}</p>
                        <p>{audio.mime_type}</p>
                    </div>

                    <div>
                        <p className="font-semibold">{t('audios.show.audioPlayer')}</p>
                        <audio controls className="w-full mt-2" preload="metadata">
                            <source src={audio.url} type={audio.mime_type} />
                            {t('audios.show.audioNotSupported')}
                        </audio>
                    </div>

                    <div>
                        <p className="font-semibold">{t('categoryShow.created')}</p>
                        <p>{audio.created_at ?? '—'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">{t('categoryShow.updated')}</p>
                        <p>{audio.updated_at ?? '—'}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}