import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/i18n';

interface TagDetails {
    id: number;
    name: string;
    name_en: string;
    name_ar: string;
    slug: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface TagShowProps {
    tag: TagDetails;
}

export default function TagShow({ tag }: TagShowProps) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('tags.title'), href: '/admin/tags' },
        { title: tag.name, href: `/admin/tags/${tag.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tag.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{tag.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('tags.table.slug')}: {tag.slug}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/tags/${tag.id}/edit`}>{t('actions.edit')}</Link>
                        </Button>
                        <Button asChild variant="ghost">
                            <Link href="/admin/tags">{t('actions.back')}</Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm text-sm text-muted-foreground">
                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <div>
                            <p className="font-semibold">{t('tags.nameEn')}</p>
                            <p>{tag.name_en}</p>
                        </div>
                        <div>
                            <p className="font-semibold">{t('tags.nameAr')}</p>
                            <p>{tag.name_ar}</p>
                        </div>
                    </div>

                    <div>
                        <p className="font-semibold">{t('categoryShow.created')}</p>
                        <p>{tag.created_at ?? '—'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">{t('categoryShow.updated')}</p>
                        <p>{tag.updated_at ?? '—'}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
