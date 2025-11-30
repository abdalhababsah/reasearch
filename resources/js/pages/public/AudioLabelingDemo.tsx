import React, {
    useState,
    useRef,
    useEffect,
    MouseEvent as ReactMouseEvent,
  } from 'react';
  import { Zap, MessageCircle, Trash2, ArrowRight, Play, Pause, Save, Download } from 'lucide-react';
  import { useTranslation } from '@/i18n';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import { Textarea } from '@/components/ui/textarea';
  
  interface AudioLabel {
    id: number;
    name: string;
    color: string;
    description: string | null;
  }
  
  interface AudioSegment {
    clientId: string;
    id?: number;
    label_id: number;
    start_time: number;
    end_time: number;
    notes: string | null;
  }
  
  function createClientId(prefix: string = 'seg'): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  
  const DEMO_DURATION_SECONDS = 120; // fake 2 minutes
  
  const AudioLabelingDemo: React.FC = () => {
    const { t } = useTranslation();
  
    // Fake labels
    const fixedLabels: AudioLabel[] = [
      {
        id: 1,
        name: t('audioDemo.labels.speaker1', { defaultValue: 'Speaker 1' }),
        color: '#3b82f6',
        description: t('audioDemo.labels.speaker1Desc', { defaultValue: 'Main Speaker' }),
      },
      {
        id: 2,
        name: t('audioDemo.labels.speaker2', { defaultValue: 'Speaker 2' }),
        color: '#10b981',
        description: t('audioDemo.labels.speaker2Desc', { defaultValue: 'Interviewer' }),
      },
      {
        id: 3,
        name: t('audioDemo.labels.noise', { defaultValue: 'Noise' }),
        color: '#ef4444',
        description: t('audioDemo.labels.noiseDesc', { defaultValue: 'Background Noise' }),
      },
    ];
  
    const waveformContainerRef = useRef<HTMLDivElement | null>(null);
  
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [containerWidth, setContainerWidth] = useState(800);
    const [labels] = useState<AudioLabel[]>(fixedLabels);
    const [selectedLabel, setSelectedLabel] = useState<AudioLabel | null>(fixedLabels[0]);
  
    const [segments, setSegments] = useState<AudioSegment[]>([
      {
        clientId: 'demo-1',
        label_id: 1,
        start_time: 5,
        end_time: 20,
        notes: t('audioDemo.segmentNotes.speaker1', {
          defaultValue: 'Example: Speaker 1 segment',
        }),
      },
      {
        clientId: 'demo-2',
        label_id: 2,
        start_time: 30,
        end_time: 45,
        notes: t('audioDemo.segmentNotes.speaker2', {
          defaultValue: 'Example: Speaker 2 segment',
        }),
      },
      {
        clientId: 'demo-3',
        label_id: 3,
        start_time: 60,
        end_time: 75,
        notes: t('audioDemo.segmentNotes.noise', {
          defaultValue: 'Example: background noise',
        }),
      },
    ]);
  
    // Selection state
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStartPx, setSelectionStartPx] = useState(0);
    const [selectionEndPx, setSelectionEndPx] = useState(0);
  
    // Resize state
    const [resizeState, setResizeState] = useState<{
      clientId: string;
      mode: 'start' | 'end';
    } | null>(null);
  
    // Fake playback
    const activeSegmentEndRef = useRef<number | null>(null);
    const duration = DEMO_DURATION_SECONDS;
  
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
  
    const getTimeFromPx = (px: number) => {
      if (!containerWidth || !duration) return 0;
      const ratio = Math.max(0, Math.min(px / containerWidth, 1));
      return ratio * duration;
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
  
    // Fake playback timer (no real audio)
    useEffect(() => {
      if (!isPlaying) return;
  
      const interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          const step = 0.05; // seconds
          let next = prev + step;
          const stopAt = activeSegmentEndRef.current ?? duration;
  
          if (next >= stopAt) {
            next = stopAt;
            activeSegmentEndRef.current = null;
            setIsPlaying(false);
          }
  
          return next;
        });
      }, 50);
  
      return () => {
        window.clearInterval(interval);
      };
    }, [isPlaying, duration]);
  
    useEffect(() => {
      updateContainerWidth();
      window.addEventListener('resize', updateContainerWidth);
      return () => window.removeEventListener('resize', updateContainerWidth);
    }, []);
  
    // Playback controls
    const playPause = () => {
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        if (currentTime >= duration) {
          setCurrentTime(0);
        }
        activeSegmentEndRef.current = null;
        setIsPlaying(true);
      }
    };
  
    const playSegment = (segment: AudioSegment) => {
      activeSegmentEndRef.current = segment.end_time;
      setCurrentTime(segment.start_time);
      setIsPlaying(true);
    };
  
    // CRUD for segments
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
  
    // Resize logic
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
    }, [resizeState, duration, containerWidth, getTimeFromPx]);
  
    // Drag-create logic
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
  
    return (
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border bg-background shadow-2xl">
        {/* Header */}
        <div className="bg-muted/30 border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {t('audioDemo.title', { defaultValue: 'Labeling Studio Demo' })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('audioDemo.subtitle', {
                  defaultValue: 'Try creating and resizing segments on the waveform (no real audio).',
                })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {t('audioDemo.badge', { defaultValue: 'Interactive Demo' })}
          </Badge>
        </div>
  
        <div className="grid gap-6 p-6 lg:grid-cols-3">
          {/* Left Side: Waveform & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Label Selector */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                {t('audioDemo.selectLabel', { defaultValue: 'Select Label' })}
              </div>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => setSelectedLabel(label)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      selectedLabel?.id === label.id
                        ? 'ring-2 ring-offset-2 scale-105 shadow-md'
                        : 'opacity-70 hover:opacity-100 hover:bg-muted'
                    }`}
                    style={{
                      backgroundColor: label.color + '20',
                      border: `2px solid ${label.color}`,
                      color: label.color,
                    }}
                    type="button"
                    title={label.description || undefined}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
  
            {/* Waveform Editor (fake waveform, real interactions) */}
            <div className="rounded-xl border bg-card p-1 shadow-sm overflow-hidden">
              <div className="border-b bg-muted/20 p-3 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playPause}
                  className="flex items-center gap-2 h-8"
                  type="button"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {isPlaying
                    ? t('audioDemo.pause', { defaultValue: 'Pause' })
                    : t('audioDemo.play', { defaultValue: 'Play' })}
                </Button>
                <div className="font-mono text-xs font-medium text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
  
              <div className="relative p-4 bg-white dark:bg-zinc-950">
                <div
                  ref={waveformContainerRef}
                  className="w-full relative cursor-text select-none bg-gray-100 rounded-lg overflow-hidden"
                  style={{ height: 120 }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  {/* Fake waveform background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
  
                  {/* Overlay: Segments */}
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
                          {/* Handles */}
                          <div
                            className="absolute left-0 top-0 w-3 h-full opacity-0 group-hover:opacity-100 cursor-ew-resize flex items-center justify-center z-20 hover:bg-black/10"
                            onMouseDown={(e) => startResize(segment, 'start', e)}
                          >
                            <div className="w-0.5 h-6 bg-white/80 rounded shadow-sm" />
                          </div>
                          <div
                            className="absolute right-0 top-0 w-3 h-full opacity-0 group-hover:opacity-100 cursor-ew-resize flex items-center justify-center z-20 hover:bg-black/10"
                            onMouseDown={(e) => startResize(segment, 'end', e)}
                          >
                            <div className="w-0.5 h-6 bg-white/80 rounded shadow-sm" />
                          </div>
  
                          {/* Label Tag */}
                          <div className="absolute top-1 left-1 max-w-full px-1.5 py-0.5 text-[10px] font-bold text-white bg-black/60 rounded truncate pointer-events-none">
                            {label?.name}
                          </div>
  
                          {/* Delete Btn */}
                          <button
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 shadow-md flex items-center justify-center hover:bg-red-600 transition-all z-30"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSegment(segment.clientId);
                            }}
                            type="button"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      );
                    })}
  
                    {/* Selection Rect */}
                    {isSelecting && (
                      <div
                        className="absolute bg-primary/20 border-2 border-primary pointer-events-none rounded z-20"
                        style={{
                          left: `${Math.min(selectionStartPx, selectionEndPx)}px`,
                          width: `${Math.abs(selectionEndPx - selectionStartPx)}px`,
                          top: '10px',
                          height: '100px',
                        }}
                      />
                    )}
                  </div>
                </div>
  
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  {t('audioDemo.tip', {
                    defaultValue:
                      'Tip: Select a label above, then click and drag on the waveform to create a segment.',
                  })}
                </p>
              </div>
            </div>
          </div>
  
          {/* Right Side: Segment List */}
          <div className="flex flex-col h-[400px] lg:h-auto rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="bg-muted/20 p-3 border-b">
              <h4 className="font-semibold text-sm">
                {t('audioDemo.segmentsTitle', {
                  defaultValue: 'Segments',
                })}{' '}
                ({segments.length})
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {segments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                  <MessageCircle className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs">
                    {t('audioDemo.noSegments', { defaultValue: 'No segments created yet.' })}
                  </p>
                </div>
              ) : (
                segments.map((segment) => {
                  const label = labels.find((l) => l.id === segment.label_id);
                  return (
                    <div
                      key={segment.clientId}
                      className="group rounded-lg border bg-background p-2.5 text-left text-sm hover:border-primary/50 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shadow-sm"
                            style={{ backgroundColor: label?.color }}
                          />
                          <span className="font-semibold text-xs">{label?.name}</span>
                        </div>
                        <button
                          onClick={() => removeSegment(segment.clientId)}
                          className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 font-mono bg-muted/30 p-1 rounded">
                        <span>{formatTime(segment.start_time)}</span>
                        <ArrowRight className="h-3 w-3 opacity-30" />
                        <span>{formatTime(segment.end_time)}</span>
                      </div>
                      <Textarea
                        placeholder={t('audioDemo.notesPlaceholder', {
                          defaultValue: 'Add notes...',
                        })}
                        value={segment.notes || ''}
                        onChange={(e) => updateSegmentNotes(segment.clientId, e.target.value)}
                        className="min-h-[50px] text-xs resize-none bg-transparent"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
  
        <div className="bg-muted/30 border-t p-4 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled
            className="opacity-50 cursor-not-allowed"
            type="button"
          >
            <Save className="h-4 w-4 mr-2" />
            {t('audioDemo.saveDraft', { defaultValue: 'Save Draft' })}
          </Button>
          <Button disabled className="opacity-50 cursor-not-allowed" type="button">
            <Download className="h-4 w-4 mr-2" />
            {t('audioDemo.exportJson', { defaultValue: 'Export JSON' })}
          </Button>
        </div>
      </div>
    );
  };
  
  export default AudioLabelingDemo;
  