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
import { type BreadcrumbItem } from '@/types';

interface TagListItem {
    id: number;
    name: string;
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tags',
        href: '/admin/tags',
    },
];

export default function TagIndex({ tags }: TagIndexProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<TagListItem | null>(null);

    const handleDelete = (id: number) => {
        if (confirm('Delete this tag?')) {
            router.delete(`/admin/tags/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tags" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Tags</h1>
                        <p className="text-muted-foreground">Micro labels for research entries.</p>
                    </div>

                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Create tag</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create tag</DialogTitle>
                                <DialogDescription>
                                    Provide a name and slug for the new tag.
                                </DialogDescription>
                            </DialogHeader>

                            <TagForm
                                action="/admin/tags"
                                method="post"
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
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                    Slug
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {tags.data.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                                        No tags found.
                                    </td>
                                </tr>
                            )}

                            {tags.data.map((tag) => (
                                <tr key={tag.id}>
                                    <td className="px-4 py-3 font-medium">{tag.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{tag.slug}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <Button asChild size="sm" variant="ghost">
                                                <Link href={`/admin/tags/${tag.id}`}>View</Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingTag(tag)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(tag.id)}
                                            >
                                                Delete
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
                            <DialogTitle>Edit {editingTag ? editingTag.name : 'tag'}</DialogTitle>
                            <DialogDescription>Rename or adjust the slug for this tag.</DialogDescription>
                        </DialogHeader>

                        {editingTag && (
                            <TagForm
                                action={`/admin/tags/${editingTag.id}`}
                                method="put"
                                defaultValues={editingTag}
                                submitLabel="Update tag"
                                onSuccess={() => setEditingTag(null)}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
