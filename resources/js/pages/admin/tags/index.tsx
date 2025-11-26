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
import TagForm from '@/features/admin/tags/tag-form';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';

interface TagListItem {
    id: number;
    name: string;
    name_en: string;
    name_ar: string;
    slug: string;
    created_at?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface TagIndexProps {
    tags: {
        data: TagListItem[];
        links: PaginationLink[];
    };
}

export default function TagIndex({ tags }: TagIndexProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<TagListItem | null>(null);
    const { t, direction } = useTranslation();
    const alignStart = direction === 'rtl' ? 'text-right' : 'text-left';
    const alignEnd = direction === 'rtl' ? 'text-left' : 'text-right';

    const handleDelete = (id: number) => {
        if (confirm(t('tags.deleteConfirm'))) {
            router.delete(`/admin/tags/${id}`);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: t('tags.title'),
                    href: '/admin/tags',
                },
            ]}
        >
            <Head title={t('tags.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{t('tags.title')}</h1>
                        <p className="text-muted-foreground">{t('tags.description')}</p>
                    </div>

                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>{t('tags.createTitle')}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('tags.createTitle')}</DialogTitle>
                                <DialogDescription>{t('tags.createDescription')}</DialogDescription>
                            </DialogHeader>

                            <TagForm
                                action="/admin/tags"
                                method="post"
                                submitLabel={t('actions.save')}
                                onSuccess={() => setCreateOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="w-full overflow-hidden rounded-xl border bg-card shadow-sm">
                    <table className="min-w-full table-auto divide-y divide-border text-sm">
                        <colgroup>
                            <col className="w-1/2" />
                            <col className="w-1/4" />
                            <col className="w-1/4" />
                        </colgroup>
                        <thead className="bg-muted/40">
                            <tr>
                                <th className={`px-4 py-3 ${alignStart} text-sm font-medium text-muted-foreground`}>
                                    {t('tags.table.name')}
                                </th>
                                <th className={`px-4 py-3 ${alignStart} text-sm font-medium text-muted-foreground`}>
                                    {t('tags.table.slug')}
                                </th>
                                <th className={`px-4 py-3 ${alignEnd} text-sm font-medium text-muted-foreground`}>
                                    {t('tags.table.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {tags.data.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                                        {t('tags.noResults')}
                                    </td>
                                </tr>
                            )}

                            {tags.data.map((tag) => (
                                <tr key={tag.id}>
                                    <td className={`px-4 py-3 font-medium ${alignStart}`}>{tag.name}</td>
                                    <td className={`px-4 py-3 text-muted-foreground ${alignStart}`}>{tag.slug}</td>
                                    <td className={`px-4 py-3 ${alignEnd}`}>
                                        <div className={`flex flex-wrap gap-2 ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                                            <Button asChild size="sm" variant="ghost">
                                                <Link href={`/admin/tags/${tag.id}`}>{t('actions.view')}</Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingTag(tag)}
                                            >
                                                {t('actions.edit')}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(tag.id)}
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

                <Pagination links={tags.links} />

                <Dialog
                    open={Boolean(editingTag)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingTag(null);
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingTag
                                    ? t('tags.editDialogTitle', { name: editingTag.name })
                                    : t('actions.edit')}
                            </DialogTitle>
                            <DialogDescription>{t('tags.editDialogDescription')}</DialogDescription>
                        </DialogHeader>

                        {editingTag && (
                            <TagForm
                                action={`/admin/tags/${editingTag.id}`}
                                method="put"
                                defaultValues={{
                                    name_en: editingTag.name_en,
                                    name_ar: editingTag.name_ar,
                                    slug: editingTag.slug,
                                }}
                                submitLabel={t('actions.update')}
                                onSuccess={() => setEditingTag(null)}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
