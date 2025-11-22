import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface TagDetails {
    id: number;
    name: string;
    slug: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface TagShowProps {
    tag: TagDetails;
}

export default function TagShow({ tag }: TagShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tags', href: '/admin/tags' },
        { title: tag.name, href: `/admin/tags/${tag.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tag.name} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{tag.name}</h1>
                        <p className="text-sm text-muted-foreground">Slug: {tag.slug}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/tags/${tag.id}/edit`}>Edit</Link>
                        </Button>
                        <Button asChild variant="ghost">
                            <Link href="/admin/tags">Back</Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm text-sm text-muted-foreground">
                    <div>
                        <p className="font-semibold">Created</p>
                        <p>{tag.created_at ?? '—'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Updated</p>
                        <p>{tag.updated_at ?? '—'}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
