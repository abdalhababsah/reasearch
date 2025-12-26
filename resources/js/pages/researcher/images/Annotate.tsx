import { Head, Link, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState, MouseEvent as ReactMouseEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';
import { type BreadcrumbItem } from '@/types';
import { Save, Download, ArrowLeft, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import CreateLabelDialog from '@/pages/researcher/images/forms/create-label-dialog';

interface ImageLabel {
    id: number;
    name: string;
    color: string;
    description: string | null;
}

interface ImageAnnotationFromServer {
    id?: number;
    label_id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    notes: string | null;
    label?: ImageLabel | null;
}

interface ImageAnnotation {
    clientId: string;
    id?: number;
    label_id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    notes: string | null;
}

interface ImageData {
    id: number;
    title: string | null;
    description: string | null;
    original_filename: string;
    url: string;
    width: number | null;
    height: number | null;
    status: string;
    annotations: ImageAnnotationFromServer[];
}

interface AnnotateProps {
    image: ImageData;
    labels: ImageLabel[];
}

function createClientId(prefix: string = 'ann'): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ImageAnnotatePage({ image, labels: initialLabels }: AnnotateProps) {
    const { t } = useTranslation();

    // Image refs
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [imageLoaded, setImageLoaded] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
    const [scale, setScale] = useState(1);

    // Labels
    const [labels, setLabels] = useState<ImageLabel[]>(initialLabels);
    const [selectedLabel, setSelectedLabel] = useState<ImageLabel | null>(initialLabels[0] || null);
    const [createLabelOpen, setCreateLabelOpen] = useState(false);

    // Annotations
    const [annotations, setAnnotations] = useState<ImageAnnotation[]>(() =>
        (image.annotations || []).map((a) => ({
            clientId: createClientId(a.id ? `server-${a.id}` : 'ann'),
            id: a.id,
            label_id: a.label_id,
            x: a.x,
            y: a.y,
            width: a.width,
            height: a.height,
            notes: a.notes ?? null,
        })),
    );

    useEffect(() => {
        setLabels(initialLabels);
    }, [initialLabels]);
    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
    const [drawEnd, setDrawEnd] = useState({ x: 0, y: 0 });

    // Resize state
    const [resizeState, setResizeState] = useState<{
        clientId: string;
        handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
    } | null>(null);

    const [saving, setSaving] = useState(false);
    const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('images.title') || 'Images', href: '/researcher/images' },
        {
            title: image.title || image.original_filename,
            href: `/researcher/images/${image.id}`,
        },
        {
            title: t('images.annotate.title') || 'Annotate',
            href: `/researcher/images/${image.id}/annotate`,
        },
    ];

    // Update container size
    const updateContainerSize = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setContainerSize({ width: rect.width, height: rect.height });
        }
    };

    // Get coordinates relative to image
    const getImageCoords = (e: MouseEvent | ReactMouseEvent): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas || !imageRef.current) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * (imageRef.current.naturalWidth || 1);
        const y = ((e.clientY - rect.top) / rect.height) * (imageRef.current.naturalHeight || 1);

        return { x, y };
    };

    // Draw annotations on canvas
    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;

        if (!canvas || !ctx || !img || !imageLoaded) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw annotations
        annotations.forEach((annotation) => {
            const label = labels.find((l) => l.id === annotation.label_id);
            const color = label?.color || '#3b82f6';

            const scaleX = canvas.width / (img.naturalWidth || 1);
            const scaleY = canvas.height / (img.naturalHeight || 1);

            const x = annotation.x * scaleX;
            const y = annotation.y * scaleY;
            const width = annotation.width * scaleX;
            const height = annotation.height * scaleY;

            // Draw rectangle
            ctx.strokeStyle = color;
            ctx.lineWidth = annotation.clientId === selectedAnnotation ? 3 : 2;
            ctx.strokeRect(x, y, width, height);

            // Draw fill with transparency
            ctx.fillStyle = color + '30';
            ctx.fillRect(x, y, width, height);

            // Draw label text
            ctx.fillStyle = color;
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(label?.name || 'Unknown', x + 5, y + 20);
        });

        // Draw current drawing box
        if (isDrawing) {
            const scaleX = canvas.width / (img.naturalWidth || 1);
            const scaleY = canvas.height / (img.naturalHeight || 1);

            const x = Math.min(drawStart.x, drawEnd.x) * scaleX;
            const y = Math.min(drawStart.y, drawEnd.y) * scaleY;
            const width = Math.abs(drawEnd.x - drawStart.x) * scaleX;
            const height = Math.abs(drawEnd.y - drawStart.y) * scaleY;

            ctx.strokeStyle = selectedLabel?.color || '#3b82f6';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x, y, width, height);
            ctx.setLineDash([]);
        }
    };

    useEffect(() => {
        redrawCanvas();
    }, [annotations, isDrawing, drawStart, drawEnd, imageLoaded, selectedAnnotation]);

    // Image load handler
    useEffect(() => {
        const img = new Image();
        img.src = image.url;
        img.onload = () => {
            imageRef.current = img;
            setImageLoaded(true);
            updateContainerSize();
        };

        window.addEventListener('resize', updateContainerSize);
        return () => window.removeEventListener('resize', updateContainerSize);
    }, [image.url]);

    // Mouse down - start drawing
    const handleMouseDown = (e: ReactMouseEvent<HTMLCanvasElement>) => {
        if (!selectedLabel || !imageRef.current) return;

        const coords = getImageCoords(e);
        setIsDrawing(true);
        setDrawStart(coords);
        setDrawEnd(coords);
    };

    // Mouse move - update drawing
    const handleMouseMove = (e: ReactMouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const coords = getImageCoords(e);
        setDrawEnd(coords);
    };

    // Mouse up - finish drawing
    const handleMouseUp = () => {
        if (!isDrawing || !selectedLabel) return;
        setIsDrawing(false);

        const x = Math.min(drawStart.x, drawEnd.x);
        const y = Math.min(drawStart.y, drawEnd.y);
        const width = Math.abs(drawEnd.x - drawStart.x);
        const height = Math.abs(drawEnd.y - drawStart.y);

        // Only create if box is large enough
        if (width > 5 && height > 5) {
            const newAnnotation: ImageAnnotation = {
                clientId: createClientId('ann'),
                label_id: selectedLabel.id,
                x,
                y,
                width,
                height,
                notes: null,
            };

            setAnnotations((prev) => [...prev, newAnnotation]);
        }
    };

    // Remove annotation
    const removeAnnotation = (clientId: string) => {
        setAnnotations((prev) => prev.filter((a) => a.clientId !== clientId));
        if (selectedAnnotation === clientId) {
            setSelectedAnnotation(null);
        }
    };

    // Update annotation notes
    const updateAnnotationNotes = (clientId: string, notes: string) => {
        setAnnotations((prev) =>
            prev.map((a) => (a.clientId === clientId ? { ...a, notes } : a)),
        );
    };

    // Save annotations
    const saveAnnotations = () => {
        setSaving(true);
        router.put(
            `/researcher/images/${image.id}/annotations`,
            {
                annotations: annotations.map((a) => ({
                    label_id: a.label_id,
                    x: a.x,
                    y: a.y,
                    width: a.width,
                    height: a.height,
                    notes: a.notes,
                })),
            },
            {
                onSuccess: () => setSaving(false),
                onError: () => setSaving(false),
            },
        );
    };

    // Export JSON
    const exportJSON = () => {
        window.location.href = `/researcher/images/${image.id}/export`;
    };

    // Label creation callback
    const handleLabelCreated = (newLabel: ImageLabel) => {
        setLabels((prev) => {
            if (prev.some((l) => l.id === newLabel.id)) return prev;
            return [...prev, newLabel];
        });
        setSelectedLabel(newLabel);
        setCreateLabelOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('images.annotate.title') || 'Annotate Image'} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('images.annotate.title') || 'Annotate Image'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {image.title || image.original_filename}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="ghost">
                            <Link href="/researcher/images">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('actions.back') || 'Back'}
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Left side: labels and canvas */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Label selection */}
                        <div className="rounded-xl border bg-card p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold">
                                    {t('images.annotate.selectLabel') || 'Select Label'}
                                </h2>
                                <CreateLabelDialog
                                    open={createLabelOpen}
                                    onOpenChange={setCreateLabelOpen}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {labels.map((label) => (
                                    <button
                                        key={label.id}
                                        type="button"
                                        onClick={() => setSelectedLabel(label)}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                            selectedLabel?.id === label.id
                                                ? 'ring-2 ring-offset-2 scale-105 shadow-lg'
                                                : 'opacity-70 hover:opacity-100'
                                        }`}
                                        style={{
                                            backgroundColor: label.color + '20',
                                            border: `2px solid ${label.color}`,
                                            color: label.color,
                                        }}
                                        title={label.description || undefined}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <span
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: label.color }}
                                            />
                                            {label.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Canvas */}
                        <div className="rounded-xl border bg-card p-4 shadow-sm">
                            <div
                                ref={containerRef}
                                className="relative bg-gray-100 rounded-lg overflow-hidden"
                                style={{ height: '600px' }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    width={containerSize.width}
                                    height={containerSize.height}
                                    className="w-full h-full cursor-crosshair"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                />

                                {annotations.length === 0 && !isDrawing && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="bg-white/90 px-4 py-2 rounded-lg shadow-sm text-gray-500 text-sm text-center">
                                            <div className="font-medium mb-1">
                                                {t('images.annotate.noAnnotations') ||
                                                    'No annotations yet'}
                                            </div>
                                            <div className="text-xs">
                                                {t('images.annotate.drawHelp') ||
                                                    'Select a label and draw boxes on the image'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground mt-2">
                                {t('images.annotate.instructions') ||
                                    'Tip: Select a label, then click and drag to draw bounding boxes on the image'}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                onClick={saveAnnotations}
                                disabled={saving}
                                className="flex-1"
                                type="button"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {saving
                                    ? t('images.annotate.saving') || 'Saving...'
                                    : t('images.annotate.save') || 'Save'}
                            </Button>
                            {annotations.length > 0 && (
                                <Button onClick={exportJSON} variant="outline" type="button">
                                    <Download className="h-4 w-4 mr-2" />
                                    {t('images.annotate.export') || 'Export'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right side: annotation list */}
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-card p-4 shadow-sm">
                            <h2 className="text-sm font-semibold mb-3">
                                {t('images.annotate.annotations') || 'Annotations'} (
                                {annotations.length})
                            </h2>

                            {annotations.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    {t('images.annotate.noAnnotations') || 'No annotations yet'}
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {annotations.map((annotation) => {
                                        const label = labels.find(
                                            (l) => l.id === annotation.label_id,
                                        );
                                        return (
                                            <div
                                                key={annotation.clientId}
                                                className={`rounded-lg border p-3 space-y-2 transition-colors cursor-pointer ${
                                                    selectedAnnotation === annotation.clientId
                                                        ? 'bg-muted/80'
                                                        : 'hover:bg-muted/50'
                                                }`}
                                                onClick={() =>
                                                    setSelectedAnnotation(annotation.clientId)
                                                }
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{
                                                                backgroundColor: label?.color,
                                                            }}
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {label?.name ||
                                                                t('images.annotate.unknownLabel') ||
                                                                'Label'}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeAnnotation(annotation.clientId);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <div className="text-xs text-muted-foreground">
                                                    Position: ({Math.round(annotation.x)},{' '}
                                                    {Math.round(annotation.y)})
                                                    <br />
                                                    Size: {Math.round(annotation.width)} ×{' '}
                                                    {Math.round(annotation.height)}
                                                </div>

                                                <Textarea
                                                    value={annotation.notes || ''}
                                                    onChange={(e) =>
                                                        updateAnnotationNotes(
                                                            annotation.clientId,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={
                                                        t('images.annotate.notesPlaceholder') ||
                                                        'Add notes...'
                                                    }
                                                    rows={2}
                                                    className="text-xs"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}