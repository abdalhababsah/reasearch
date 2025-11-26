import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/i18n';

interface CategoryDetails {
    id: number;
    name: string;
    name_en: string;
    name_ar: string;
    slug: string;
    description?: string | null;
    parent?: { id: number; name: string } | null;
    children?: { id: number; name: string; name_en: string; name_ar: string }[];
    created_at?: string | null;
    updated_at?: string | null;
}

interface CategoryShowProps {
    category: CategoryDetails;
}

export default function CategoryShow({ category }: CategoryShowProps) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('categories.title'), href: '/admin/categories' },
        { title: category.name, href: `/admin/categories/${category.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{category.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('categories.table.slug')}: {category.slug}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/categories/${category.id}/edit`}>{t('actions.edit')}</Link>
                        </Button>
                        <Button asChild variant="ghost">
                            <Link href="/admin/categories">{t('actions.back')}</Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <div>
                            <p className="font-semibold">{t('categories.nameEn')}</p>
                            <p>{category.name_en}</p>
                        </div>
                        <div>
                            <p className="font-semibold">{t('categories.nameAr')}</p>
                            <p>{category.name_ar}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">
                            {t('categoryShow.parent')}
                        </p>
                        <p>{category.parent?.name ?? t('categories.parentNone')}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">
                            {t('categoryShow.description')}
                        </p>
                        <p className="whitespace-pre-line text-sm text-muted-foreground">
                            {category.description || t('categoryShow.none')}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">
                            {t('categoryShow.subcategories')}
                        </p>
                        {category.children && category.children.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {category.children.map((child) => (
                                    <li key={child.id}>{child.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('categoryShow.none')}</p>
                        )}
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <div>
                            <p className="font-semibold">{t('categoryShow.created')}</p>
                            <p>{category.created_at ?? '—'}</p>
                        </div>
                        <div>
                            <p className="font-semibold">{t('categoryShow.updated')}</p>
                            <p>{category.updated_at ?? '—'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
