import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';
import { ArrowLeft, Edit, Download } from 'lucide-react';

interface ImageData {
    id: number;
    title: string | null;
    description: string | null;
    original_filename: string;
    url: string;
    width: number | null;
    height: number | null;
    dimensions: string;
    file_size_bytes: number;
    formatted_file_size: string;
    mime_type: string;
    status: string;
    total_annotations: number;
    uploaded_at: string;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    image: ImageData;
}

export default function Show({ image }: ShowProps) {
    const { t } = useTranslation();

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
                { title: t('images.title') || 'Images', href: '/researcher/images' },
                {
                    title: image.title || image.original_filename,
                    href: `/researcher/images/${image.id}`,
                },
            ]}
        >
            <Head title={image.title || image.original_filename} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {image.title || image.original_filename}
                        </h1>
                        <p className="text-sm text-muted-foreground">{image.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="ghost">
                            <Link href="/researcher/images">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('actions.back') || 'Back'}
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/researcher/images/${image.id}/annotate`}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t('actions.annotate') || 'Annotate'}
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Image Preview */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <img
                                src={image.url}
                                alt={image.title || image.original_filename}
                                className="w-full h-auto"
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-card p-4 shadow-sm">
                            <h2 className="text-sm font-semibold mb-3">
                                {t('images.details') || 'Details'}
                            </h2>

                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-muted-foreground">
                                        {t('images.status.label') || 'Status'}
                                    </dt>
                                    <dd className="mt-1">{getStatusBadge(image.status)}</dd>
                                </div>

                                <div>
                                    <dt className="text-muted-foreground">
                                        {t('images.dimensions') || 'Dimensions'}
                                    </dt>
                                    <dd className="mt-1">{image.dimensions}</dd>
                                </div>

                                <div>
                                    <dt className="text-muted-foreground">
                                        {t('images.fileSize') || 'File Size'}
                                    </dt>
                                    <dd className="mt-1">{image.formatted_file_size}</dd>
                                </div>

                                <div>
                                    <dt className="text-muted-foreground">
                                        {t('images.mimeType') || 'Type'}
                                    </dt>
                                    <dd className="mt-1">{image.mime_type}</dd>
                                </div>

                                <div>
                                    <dt className="text-muted-foreground">
                                        {t('images.annotations') || 'Annotations'}
                                    </dt>
                                    <dd className="mt-1">
                                        <Badge variant="outline">{image.total_annotations}</Badge>
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-muted-foreground">
                                        {t('images.uploaded') || 'Uploaded'}
                                    </dt>
                                    <dd className="mt-1 text-xs">
                                        {new Date(image.uploaded_at).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Actions */}
                        {image.total_annotations > 0 && (
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <a href={`/researcher/images/${image.id}/export`}>
                                    <Download className="h-4 w-4 mr-2" />
                                    {t('actions.export') || 'Export JSON'}
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}