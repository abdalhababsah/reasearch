import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface CategoryDetails {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    parent?: { id: number; name: string } | null;
    children?: { id: number; name: string }[];
    created_at?: string | null;
    updated_at?: string | null;
}

interface CategoryShowProps {
    category: CategoryDetails;
}

export default function CategoryShow({ category }: CategoryShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Categories', href: '/admin/categories' },
        { title: category.name, href: `/admin/categories/${category.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{category.name}</h1>
                        <p className="text-sm text-muted-foreground">Slug: {category.slug}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/categories/${category.id}/edit`}>Edit</Link>
                        </Button>
                        <Button asChild variant="ghost">
                            <Link href="/admin/categories">Back</Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Parent</p>
                        <p>{category.parent?.name ?? '—'}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Description</p>
                        <p className="whitespace-pre-line text-sm text-muted-foreground">
                            {category.description || 'No description provided.'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Subcategories</p>
                        {category.children && category.children.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {category.children.map((child) => (
                                    <li key={child.id}>{child.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">None</p>
                        )}
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <div>
                            <p className="font-semibold">Created</p>
                            <p>{category.created_at ?? '—'}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Updated</p>
                            <p>{category.updated_at ?? '—'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
