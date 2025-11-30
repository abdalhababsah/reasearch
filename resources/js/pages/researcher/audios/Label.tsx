import { Head, Link, router } from '@inertiajs/react';
import React, {
    useEffect,
    useRef,
    useState,
    MouseEvent as ReactMouseEvent,
} from 'react';
import WaveSurfer from 'wavesurfer.js';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';
import { type BreadcrumbItem } from '@/types';
import {
    Play,
    Pause,
    Save,
    Download,
    ArrowLeft,
    Trash2,
} from 'lucide-react';
import CreateLabelDialog from './forms/create-label-dialog';

interface AudioLabel {
    id: number;
    name: string;
    color: string;
    description: string | null;
}

interface AudioSegmentFromServer {
    id?: number;
    label_id: number;
    start_time: number;
    end_time: number;
    notes: string | null;
    label?: AudioLabel | null;
}

interface AudioSegment {
    clientId: string;
    id?: number;
    label_id: number;
    start_time: number;
    end_time: number;
    notes: string | null;
}

interface AudioData {
    id: number;
    title: string | null;
    description: string | null;
    original_filename: string;
    url: string;
    duration_seconds: number | null;
    status: string;
    segments: AudioSegmentFromServer[];
}

interface LabelProps {
    audio: AudioData;
    labels: AudioLabel[];
}

function createClientId(prefix: string = 'seg'): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function AudioLabelPage({ audio, labels: initialLabels }: LabelProps) {
    const { t } = useTranslation();

    // WaveSurfer refs
    const waveformContainerRef = useRef<HTMLDivElement | null>(null);
    const waveformElRef = useRef<HTMLDivElement | null>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(audio.duration_seconds ?? 0);
    const [containerWidth, setContainerWidth] = useState(800);
    const activeSegmentEndRef = useRef<number | null>(null);

    // Labels
    const [labels, setLabels] = useState<AudioLabel[]>(initialLabels);
    const [selectedLabel, setSelectedLabel] = useState<AudioLabel | null>(initialLabels[0] || null);
    const [createLabelOpen, setCreateLabelOpen] = useState(false);

    // Segments
    const [segments, setSegments] = useState<AudioSegment[]>(() =>
        (audio.segments || []).map((s) => ({
            clientId: createClientId(s.id ? `server-${s.id}` : 'seg'),
            id: s.id,
            label_id: s.label_id,
            start_time: s.start_time,
            end_time: s.end_time,
            notes: s.notes ?? null,
        })),
    );

    // Selection state for creating new segments
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStartPx, setSelectionStartPx] = useState(0);
    const [selectionEndPx, setSelectionEndPx] = useState(0);

    // Resize state
    const [resizeState, setResizeState] = useState<{
        clientId: string;
        mode: 'start' | 'end';
    } | null>(null);

    const [saving, setSaving] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('audios.title'), href: '/researcher/audios' },
        { title: audio.title || audio.original_filename, href: `/researcher/audios/${audio.id}` },
        { title: t('audios.label.title'), href: `/researcher/audios/${audio.id}/label` },
    ];

    const formatTime = (seconds: number): string => {
        if (!seconds || Number.isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const updateContainerWidth = () => {
        if (waveformContainerRef.current) {
            setContainerWidth(waveformContainerRef.current.clientWidth);
        }
    };

    const getSegmentPosition = (segment: AudioSegment) => {
        if (!duration || !containerWidth) {
            return { left: 0, width: 0, visible: false };
        }

        const startRatio = segment.start_time / duration;
        const endRatio = segment.end_time / duration;

        const left = startRatio * containerWidth;
        const width = Math.max(2, (endRatio - startRatio) * containerWidth);

        return {
            left,
            width,
            visible: width > 0,
        };
    };

    const getTimeFromPx = (px: number) => {
        if (!containerWidth || !duration) return 0;
        const ratio = Math.max(0, Math.min(px / containerWidth, 1));
        return ratio * duration;
    };

    /* ---------------- WaveSurfer init ---------------- */

    useEffect(() => {
        if (!waveformElRef.current || !audio.url) return;

        if (wavesurferRef.current) {
            try {
                wavesurferRef.current.destroy();
            } catch (err) {
                console.error(err);
            }
            wavesurferRef.current = null;
        }

        const ws = WaveSurfer.create({
            container: waveformElRef.current,
            height: 120,
            waveColor: '#e2e8f0',
            progressColor: '#3b82f6',
            cursorColor: '#1f2937',
            normalize: true,
        });

        ws.load(audio.url);
        wavesurferRef.current = ws;

        ws.on('ready', () => {
            const d = ws.getDuration();
            setDuration(d);
            updateContainerWidth();
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));

        ws.on('audioprocess', (t: number) => {
            setCurrentTime(t);
            if (activeSegmentEndRef.current !== null && t >= activeSegmentEndRef.current - 0.01) {
                ws.pause();
                activeSegmentEndRef.current = null;
            }
        });

        window.addEventListener('resize', updateContainerWidth);

        return () => {
            window.removeEventListener('resize', updateContainerWidth);
            if (wavesurferRef.current) {
                try {
                    wavesurferRef.current.destroy();
                } catch (err: any) {
                    if (err instanceof DOMException && err.name === 'AbortError') {
                        console.warn('WaveSurfer destroy aborted (safe to ignore)');
                    } else {
                        console.error(err);
                    }
                } finally {
                    wavesurferRef.current = null;
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audio.url]);

    useEffect(() => {
        updateContainerWidth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------------- playback ---------------- */

    const playPause = () => {
        const ws = wavesurferRef.current;
        if (!ws) return;
        ws.playPause();
    };

    const playSegment = (segment: AudioSegment) => {
        const ws = wavesurferRef.current;
        if (!ws) return;
        ws.setTime(segment.start_time);
        activeSegmentEndRef.current = segment.end_time;
        ws.play();
    };

    /* ---------------- segment CRUD ---------------- */

    const createSegment = (start: number, end: number) => {
        if (!selectedLabel) return;

        const seg: AudioSegment = {
            clientId: createClientId('seg'),
            label_id: selectedLabel.id,
            start_time: Math.min(start, end),
            end_time: Math.max(start, end),
            notes: null,
        };

        setSegments((prev) =>
            [...prev, seg].sort((a, b) => a.start_time - b.start_time),
        );
    };

    const removeSegment = (clientId: string) => {
        setSegments((prev) => prev.filter((s) => s.clientId !== clientId));
    };

    const updateSegmentNotes = (clientId: string, notes: string) => {
        setSegments((prev) =>
            prev.map((s) => (s.clientId === clientId ? { ...s, notes } : s)),
        );
    };

    const startResize = (
        segment: AudioSegment,
        mode: 'start' | 'end',
        e: ReactMouseEvent<HTMLDivElement>,
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setResizeState({ clientId: segment.clientId, mode });
    };

    useEffect(() => {
        if (!resizeState) return;

        const handleMove = (e: MouseEvent) => {
            const container = waveformContainerRef.current;
            if (!container || !duration) return;

            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const newTime = getTimeFromPx(x);

            setSegments((prev) =>
                prev.map((s) => {
                    if (s.clientId !== resizeState.clientId) return s;

                    if (resizeState.mode === 'start') {
                        const safeStart = Math.max(0, Math.min(newTime, s.end_time - 0.1));
                        return { ...s, start_time: safeStart };
                    } else {
                        const safeEnd = Math.max(s.start_time + 0.1, Math.min(newTime, duration));
                        return { ...s, end_time: safeEnd };
                    }
                }),
            );
        };

        const handleUp = () => {
            setResizeState(null);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };
    }, [resizeState, duration]);

    /* ---------------- selection drag (create) ---------------- */

    const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!selectedLabel || resizeState) return;

        const container = waveformContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;

        setIsSelecting(true);
        setSelectionStartPx(x);
        setSelectionEndPx(x);
    };

    const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!isSelecting) return;
        const container = waveformContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setSelectionEndPx(x);
    };

    const handleMouseUp = () => {
        if (!isSelecting) return;
        setIsSelecting(false);

        const container = waveformContainerRef.current;
        if (!container || !duration) return;

        const startPx = Math.min(selectionStartPx, selectionEndPx);
        const endPx = Math.max(selectionStartPx, selectionEndPx);

        if (Math.abs(endPx - startPx) < 3) return;

        const startTime = getTimeFromPx(startPx);
        const endTime = getTimeFromPx(endPx);

        if (Math.abs(endTime - startTime) > 0.1) {
            createSegment(startTime, endTime);
        }
    };

    /* ---------------- save & export ---------------- */

    const saveSegments = () => {
        setSaving(true);
        router.put(
            `/researcher/audios/${audio.id}/segments`,
            {
                segments: segments.map((s) => ({
                    label_id: s.label_id,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    notes: s.notes,
                })),
            },
            {
                onSuccess: () => setSaving(false),
                onError: () => setSaving(false),
            },
        );
    };

    const exportJSON = () => {
        window.location.href = `/researcher/audios/${audio.id}/export`;
    };

    /* ---------------- label creation callback ---------------- */

    const handleLabelCreated = (newLabel: AudioLabel) => {
        setLabels((prev) => {
            if (prev.some((l) => l.id === newLabel.id)) return prev;
            return [...prev, newLabel];
        });
        setSelectedLabel(newLabel);
        setCreateLabelOpen(false);
    };

    /* ---------------- render ---------------- */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('audios.label.title')} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('audios.label.title')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {audio.title || audio.original_filename}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="ghost">
                            <Link href="/researcher/audios">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('actions.back')}
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Left side: labels, waveform, actions */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Label selection */}
                        <div className="rounded-xl border bg-card p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold">
                                    {t('audios.label.selectLabel')}
                                </h2>
                                <CreateLabelDialog
                                    open={createLabelOpen}
                                    onOpenChange={setCreateLabelOpen}
                                    onLabelCreated={handleLabelCreated}
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

                        {/* Waveform + overlay */}
                        <div className="rounded-xl border bg-card p-4 shadow-sm">
                            {/* Controls */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={playPause}
                                        type="button"
                                        className="flex items-center gap-2"
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Pause className="h-4 w-4" />
                                                {t('actions.pause') ?? 'Pause'}
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4" />
                                                {t('actions.play') ?? 'Play'}
                                            </>
                                        )}
                                    </Button>
                                    <div className="text-sm text-muted-foreground">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div
                                    ref={waveformContainerRef}
                                    className="w-full bg-gray-100 rounded-lg overflow-hidden relative"
                                    style={{ height: 120 }}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                >
                                    <div ref={waveformElRef} className="w-full h-full" />

                                    {/* Segments overlay */}
                                    <div className="absolute inset-0 pointer-events-none z-10">
                                        {segments.map((segment) => {
                                            const pos = getSegmentPosition(segment);
                                            if (!pos.visible) return null;

                                            const label = labels.find((l) => l.id === segment.label_id);
                                            const color = label?.color || '#3b82f6';

                                            return (
                                                <div
                                                    key={segment.clientId}
                                                    className="absolute rounded group pointer-events-auto cursor-pointer hover:shadow-lg transition-all"
                                                    style={{
                                                        left: `${pos.left}px`,
                                                        width: `${pos.width}px`,
                                                        top: '10px',
                                                        height: '100px',
                                                        backgroundColor: color + '30',
                                                        border: `2px solid ${color}`,
                                                        borderRadius: '6px',
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        playSegment(segment);
                                                    }}
                                                >
                                                    {/* resize left */}
                                                    <div
                                                        className="absolute left-0 top-0 w-3 h-full bg-gray-900/60 opacity-0 group-hover:opacity-80 cursor-ew-resize rounded-l flex items-center justify-center z-20"
                                                        onMouseDown={(e) => startResize(segment, 'start', e)}
                                                    >
                                                        <div className="w-0.5 h-8 bg-white rounded" />
                                                    </div>

                                                    {/* resize right */}
                                                    <div
                                                        className="absolute right-0 top-0 w-3 h-full bg-gray-900/60 opacity-0 group-hover:opacity-80 cursor-ew-resize rounded-r flex items-center justify-center z-20"
                                                        onMouseDown={(e) => startResize(segment, 'end', e)}
                                                    >
                                                        <div className="w-0.5 h-8 bg-white rounded" />
                                                    </div>

                                                    {/* label text */}
                                                    <div className="absolute top-1 left-1 right-7 px-2 py-1 text-xs font-bold text-white bg-black/60 rounded truncate pointer-events-none">
                                                        {label?.name ??
                                                            t('audios.label.unknownLabel') ??
                                                            'Label'}
                                                    </div>

                                                    {/* duration */}
                                                    <div className="absolute bottom-1 left-1 px-1 py-0.5 text-xs font-medium text-white bg-black/50 rounded pointer-events-none">
                                                        {(segment.end_time - segment.start_time).toFixed(1)}s
                                                    </div>

                                                    {/* delete */}
                                                    <button
                                                        type="button"
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center shadow-lg z-20"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeSegment(segment.clientId);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        {/* Empty hint */}
                                        {segments.length === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="bg-white/90 px-4 py-2 rounded-lg shadow-sm text-gray-500 text-sm text-center">
                                                    <div className="font-medium mb-1">
                                                        {t('audios.label.noSegments')}
                                                    </div>
                                                    <div className="text-xs">
                                                        {t('audios.label.waveformHelp') ||
                                                            'Drag on the waveform with a label selected to create segments.'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Selection overlay */}
                                    {isSelecting && (
                                        <div
                                            className="absolute bg-amber-500/30 border-2 border-amber-500 pointer-events-none rounded z-20"
                                            style={{
                                                left: `${Math.min(selectionStartPx, selectionEndPx)}px`,
                                                width: `${Math.abs(selectionEndPx - selectionStartPx)}px`,
                                                top: '10px',
                                                height: '100px',
                                            }}
                                        />
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground mt-2">
                                    {t('audios.label.waveformHelp') ||
                                        'Tip: Drag on the waveform (with a label selected) to create a segment. Drag the edges to resize, click to play, or use the red icon to delete.'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                onClick={saveSegments}
                                disabled={saving}
                                className="flex-1"
                                type="button"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {saving
                                    ? t('audios.label.saving') ?? 'Saving...'
                                    : t('audios.label.save') ?? 'Save'}
                            </Button>
                            {segments.length > 0 && (
                                <Button onClick={exportJSON} variant="outline" type="button">
                                    <Download className="h-4 w-4 mr-2" />
                                    {t('audios.label.export') ?? 'Export'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right side: segment list */}
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-card p-4 shadow-sm">
                            <h2 className="text-sm font-semibold mb-3">
                                {t('audios.label.segments')} ({segments.length})
                            </h2>

                            {segments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    {t('audios.label.noSegments')}
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {segments.map((segment) => {
                                        const label = labels.find((l) => l.id === segment.label_id);
                                        return (
                                            <div
                                                key={segment.clientId}
                                                className="rounded-lg border p-3 space-y-2 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: label?.color }}
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {label?.name ??
                                                                t('audios.label.unknownLabel') ??
                                                                'Label'}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        type="button"
                                                        onClick={() => removeSegment(segment.clientId)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <div className="text-xs text-muted-foreground">
                                                    {formatTime(segment.start_time)} -{' '}
                                                    {formatTime(segment.end_time)}
                                                    <span className="ml-2">
                                                        ({formatTime(segment.end_time - segment.start_time)})
                                                    </span>
                                                </div>

                                                <Textarea
                                                    value={segment.notes || ''}
                                                    onChange={(e) =>
                                                        updateSegmentNotes(
                                                            segment.clientId,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={t('audios.label.notesPlaceholder')}
                                                    rows={2}
                                                    className="text-xs"
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
