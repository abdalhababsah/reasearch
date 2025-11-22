import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

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
import CategoryForm from '@/features/admin/categories/category-form';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';

interface CategoryListItem {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    parent_id?: number | null;
    parent?: { id: number; name: string } | null;
    created_at?: string | null;
}

interface ParentOption {
    id: number;
    name: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface CategoryIndexProps {
    categories: {
        data: CategoryListItem[];
        links: PaginationLink[];
    };
    parents: ParentOption[];
}

export default function CategoriesIndex({ categories, parents }: CategoryIndexProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryListItem | null>(null);
    const { t } = useTranslation();

    const handleDelete = (id: number) => {
        if (confirm(t('categories.deleteConfirm'))) {
            router.delete(`/admin/categories/${id}`);
        }
    };

    const editParentOptions = useMemo(() => {
        if (!editingCategory) {
            return parents;
        }
        return parents.filter((parent) => parent.id !== editingCategory.id);
    }, [editingCategory, parents]);

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: t('categories.title'),
                    href: '/admin/categories',
                },
            ]}
        >
            <Head title={t('categories.title')} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{t('categories.title')}</h1>
                        <p className="text-muted-foreground">{t('categories.description')}</p>
                    </div>

                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>{t('categories.createTitle')}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('categories.createTitle')}</DialogTitle>
                                <DialogDescription>{t('categories.createDescription')}</DialogDescription>
                            </DialogHeader>
                            <CategoryForm
                                action="/admin/categories"
                                method="post"
                                parentOptions={parents}
                                onSuccess={() => setCreateOpen(false)}
                                submitLabel={t('actions.save')}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="w-full overflow-hidden rounded-xl border bg-card shadow-sm">
                    <table className="min-w-full table-auto divide-y divide-border text-sm">
                        <colgroup>
                            <col className="w-2/6" />
                            <col className="w-2/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                        </colgroup>
                        <thead className="bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                    {t('categories.table.name')}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                    {t('categories.table.slug')}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                    {t('categories.table.parent')}
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                                    {t('categories.table.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {categories.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                                        {t('categories.noResults')}
                                    </td>
                                </tr>
                            )}

                            {categories.data.map((category) => (
                                <tr key={category.id}>
                                    <td className="px-4 py-3 font-medium">{category.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {category.parent?.name ?? t('categories.parentNone')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <Button asChild size="sm" variant="ghost">
                                                <Link href={`/admin/categories/${category.id}`}>
                                                    {t('actions.view')}
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingCategory(category)}
                                            >
                                                {t('actions.edit')}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(category.id)}
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

                <Pagination links={categories.links} />

                <Dialog
                    open={Boolean(editingCategory)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingCategory(null);
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory
                                    ? t('categories.editDialogTitle', { name: editingCategory.name })
                                    : t('actions.edit')}
                            </DialogTitle>
                            <DialogDescription>{t('categories.editDialogDescription')}</DialogDescription>
                        </DialogHeader>

                        {editingCategory && (
                            <CategoryForm
                                action={`/admin/categories/${editingCategory.id}`}
                                method="put"
                                parentOptions={editParentOptions}
                                defaultValues={{
                                    name: editingCategory.name,
                                    slug: editingCategory.slug,
                                    description: editingCategory.description ?? '',
                                    parent_id: editingCategory.parent_id ?? undefined,
                                }}
                                submitLabel={t('actions.update')}
                                onSuccess={() => setEditingCategory(null)}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
