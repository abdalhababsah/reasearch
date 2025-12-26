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
import ImageUploadForm from '@/pages/researcher/images/forms/image-upload-form';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Upload } from 'lucide-react';

interface ImageListItem {
    id: number;
    title: string | null;
    original_filename: string;
    url: string;
    thumbnail_url: string;
    width: number | null;
    height: number | null;
    dimensions: string;
    file_size_bytes: number;
    formatted_file_size: string;
    status: 'draft' | 'labeled' | 'exported';
    total_annotations: number;
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

interface ImageIndexProps {
    images: {
        data: ImageListItem[];
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

export default function Index({ images, filters, statistics }: ImageIndexProps) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const { t, direction } = useTranslation();
    const alignStart = direction === 'rtl' ? 'text-right' : 'text-left';
    const alignEnd = direction === 'rtl' ? 'text-left' : 'text-right';

    const handleDelete = (id: number, filename: string) => {
        if (confirm(t('images.deleteConfirm', { filename }) || `Delete ${filename}?`)) {
            router.delete(`/researcher/images/${id}`);
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
                {t(`images.status.${status}`) || status}
            </Badge>
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: t('images.title') || 'Images',
                    href: '/researcher/images',
                },
            ]}
        >
            <Head title={t('images.title') || 'Images'} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <ImageIcon className="h-6 w-6" />
                            {t('images.title') || 'Image Annotation'}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('images.description') || 'Upload and annotate images with bounding boxes'}
                        </p>
                    </div>

                    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Upload className="h-4 w-4 mr-2" />
                                {t('images.uploadTitle') || 'Upload Images'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{t('images.uploadTitle') || 'Upload Images'}</DialogTitle>
                                <DialogDescription>
                                    {t('images.uploadDescription') || 'Upload one or more images to annotate'}
                                </DialogDescription>
                            </DialogHeader>

                            <ImageUploadForm onSuccess={() => setUploadOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="text-2xl font-bold">{statistics.total}</div>
                        <p className="text-sm text-muted-foreground">
                            {t('images.stats.total') || 'Total Images'}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="text-2xl font-bold">{statistics.labeled}</div>
                        <p className="text-sm text-muted-foreground">
                            {t('images.stats.labeled') || 'Labeled'}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="text-2xl font-bold">{statistics.draft}</div>
                        <p className="text-sm text-muted-foreground">
                            {t('images.stats.draft') || 'Draft'}
                        </p>
                    </div>
                </div>

                {/* Image Grid */}
                <div className="w-full">
                    {images.data.length === 0 ? (
                        <div className="rounded-xl border bg-card shadow-sm p-12 text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground mb-2">
                                {t('images.noResults') || 'No images found'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('images.uploadPrompt') || 'Upload your first image to get started'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {images.data.map((image) => (
                                <div
                                    key={image.id}
                                    className="rounded-xl border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Image Preview */}
                                    <div className="relative aspect-video bg-muted">
                                        <img
                                            src={image.url}
                                            alt={image.title || image.original_filename}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2">
                                            {getStatusBadge(image.status)}
                                        </div>
                                        {image.total_annotations > 0 && (
                                            <div className="absolute bottom-2 left-2">
                                                <Badge variant="default" className="bg-black/60">
                                                    {image.total_annotations} {t('images.annotations') || 'boxes'}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Info */}
                                    <div className="p-4">
                                        <h3 className="font-medium truncate mb-1">
                                            {image.title || image.original_filename}
                                        </h3>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div>{image.dimensions}</div>
                                            <div>{image.formatted_file_size}</div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-4">
                                            <Button asChild size="sm" className="flex-1">
                                                <Link href={`/researcher/images/${image.id}/annotate`}>
                                                    {t('actions.annotate') || 'Annotate'}
                                                </Link>
                                            </Button>
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/researcher/images/${image.id}`}>
                                                    {t('actions.view') || 'View'}
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(image.id, image.original_filename)}
                                            >
                                                {t('actions.delete') || 'Delete'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Pagination links={images.links} />
            </div>
        </AppLayout>
    );
}