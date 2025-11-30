import { useForm } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/i18n';
import { Upload, X, FileAudio, Loader2 } from 'lucide-react';
// import { Progress } from '@/components/ui/progress';
import { Progress } from "@/components/ui/progress";

interface AudioUploadFormProps {
    onSuccess?: () => void;
}

interface FileWithPreview extends File {
    preview?: string;
}

export default function AudioUploadForm({ onSuccess }: AudioUploadFormProps) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm({
        audio_files: [] as File[],
        title: '',
        description: '',
        is_public: false,
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles([...selectedFiles, ...files]);
            setData('audio_files', [...selectedFiles, ...files]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setData('audio_files', newFiles);
    };

    const formatFileSize = (bytes: number): string => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert(t('audios.validation.noFiles'));
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
            formData.append(`audio_files[${index}]`, file);
        });
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('is_public', data.is_public ? '1' : '0');

        post('/researcher/audios', {
            data: formData,
            forceFormData: true,
            onProgress: (progress) => {
                setUploadProgress(progress.percentage || 0);
            },
            onSuccess: () => {
                reset();
                setSelectedFiles([]);
                setUploadProgress(0);
                onSuccess?.();
            },
            onError: () => {
                setUploadProgress(0);
            },
        });
    };

    const acceptedFormats = '.mp3,.wav,.ogg,.m4a,.flac';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
                <Label>{t('audios.form.files')}</Label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 p-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted/20"
                >
                    <Upload className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm font-medium">{t('audios.form.clickToUpload')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t('audios.form.supportedFormats')}: MP3, WAV, OGG, M4A, FLAC
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t('audios.form.maxSize')}: 100MB {t('audios.form.perFile')}
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFormats}
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />
                {errors.audio_files && (
                    <p className="mt-1 text-sm text-destructive">{errors.audio_files}</p>
                )}
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <Label>{t('audios.form.selectedFiles')} ({selectedFiles.length})</Label>
                    <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border p-3">
                        {selectedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-md bg-muted/50 p-3"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileAudio className="h-5 w-5 flex-shrink-0 text-blue-500" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="flex-shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {processing && uploadProgress > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('audios.form.uploading')}</span>
                        <span className="font-medium">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                </div>
            )}

            {/* Optional Metadata (applies to all files) */}
            <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                    {t('audios.form.optionalMetadata')}
                </p>

                <div>
                    <Label htmlFor="title">{t('audios.form.title')}</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder={t('audios.form.titlePlaceholder')}
                        disabled={processing}
                    />
                    {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
                </div>

                <div>
                    <Label htmlFor="description">{t('audios.form.description')}</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder={t('audios.form.descriptionPlaceholder')}
                        rows={3}
                        disabled={processing}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_public"
                        checked={data.is_public}
                        onChange={(e) => setData('is_public', e.target.checked)}
                        disabled={processing}
                        className="h-4 w-4"
                    />
                    <Label htmlFor="is_public" className="cursor-pointer font-normal">
                        {t('audios.form.makePublic')}
                    </Label>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
                <Button
                    type="submit"
                    disabled={processing || selectedFiles.length === 0}
                    className="min-w-32"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('audios.form.uploading')}
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            {t('audios.form.upload')} ({selectedFiles.length})
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}