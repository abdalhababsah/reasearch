import { FormEvent, useCallback, useMemo, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { X, Paperclip } from 'lucide-react';
import { useForm } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/i18n';

const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024; // 1GB

type StatusOption = {
    value: string;
    label: string;
};

type ExistingFile = {
    id: number;
    name: string;
    size_bytes: number;
    url: string;
};

interface ResearchFormValues {
    title_en: string;
    title_ar: string;
    abstract_en?: string;
    abstract_ar?: string;
    keywords_en?: string;
    keywords_ar?: string;
    status?: string;
    is_public: boolean;
    files: File[];
}

interface ResearchFormProps {
    action: string;
    method: 'post' | 'put';
    statuses: StatusOption[];
    defaultValues?: Partial<ResearchFormValues>;
    existingFiles?: ExistingFile[];
    submitLabel?: string;
    onSuccess?: () => void;
}

export default function ResearchForm({
    action,
    method,
    statuses,
    defaultValues,
    existingFiles = [],
    submitLabel,
    onSuccess,
}: ResearchFormProps) {
    const { t } = useTranslation();
    const initialStatus = defaultValues?.status ?? statuses[0]?.value ?? 'draft';

    const form = useForm<ResearchFormValues>({
        title_en: defaultValues?.title_en ?? '',
        title_ar: defaultValues?.title_ar ?? '',
        abstract_en: defaultValues?.abstract_en ?? '',
        abstract_ar: defaultValues?.abstract_ar ?? '',
        keywords_en: defaultValues?.keywords_en ?? '',
        keywords_ar: defaultValues?.keywords_ar ?? '',
        status: initialStatus,
        is_public: defaultValues?.is_public ?? false,
        files: [],
    });

    const { data, setData, post, put, processing, errors, reset } = form;
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dropError, setDropError] = useState<string | null>(null);

    const localizedStatuses = useMemo(() => {
        return statuses.map((status) => {
            const key = `researches.statuses.${status.value}`;
            const translated = t(key);
            return {
                value: status.value,
                label: translated === key ? status.label : translated,
            };
        });
    }, [statuses, t]);

    const syncFiles = useCallback(
        (files: File[]) => {
            setSelectedFiles(files);
            setData('files', files);
        },
        [setData]
    );

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            setDropError(null);
            if (!acceptedFiles.length) {
                return;
            }
            syncFiles([...selectedFiles, ...acceptedFiles]);
        },
        [selectedFiles, syncFiles]
    );

    const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
        if (!fileRejections.length) {
            return;
        }

        const message = fileRejections
            .map((rejection) => {
                const reasons = rejection.errors.map((error) => error.message).join(', ');
                return `${rejection.file.name}: ${reasons}`;
            })
            .join('\n');
        setDropError(message || t('researches.form.dropzoneError'));
    }, [t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        multiple: true,
        maxSize: MAX_FILE_SIZE_BYTES,
        onDrop,
        onDropRejected,
    });

    const removeSelectedFile = (index: number) => {
        const updated = selectedFiles.filter((_, idx) => idx !== index);
        syncFiles(updated);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const submit = method === 'post' ? post : put;
        submit(action, {
            forceFormData: true,
            onSuccess: () => {
                if (method === 'post') {
                    reset();
                    syncFiles([]);
                }
                onSuccess?.();
            },
        });
    };

    const formatBytes = (bytes: number) => {
        if (!Number.isFinite(bytes) || bytes <= 0) {
            return '0 B';
        }
        const units = ['B', 'KB', 'MB', 'GB'];
        const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const value = bytes / Math.pow(1024, exponent);
        return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="title_en">{t('researches.form.titleEn')}</Label>
                    <Input
                        id="title_en"
                        name="title_en"
                        value={data.title_en}
                        onChange={(event) => setData('title_en', event.target.value)}
                        required
                    />
                    <InputError message={errors.title_en} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="title_ar">{t('researches.form.titleAr')}</Label>
                    <Input
                        id="title_ar"
                        name="title_ar"
                        value={data.title_ar}
                        onChange={(event) => setData('title_ar', event.target.value)}
                        required
                    />
                    <InputError message={errors.title_ar} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="abstract_en">{t('researches.form.abstractEn')}</Label>
                    <Textarea
                        id="abstract_en"
                        name="abstract_en"
                        rows={4}
                        value={data.abstract_en}
                        onChange={(event) => setData('abstract_en', event.target.value)}
                    />
                    <InputError message={errors.abstract_en} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="abstract_ar">{t('researches.form.abstractAr')}</Label>
                    <Textarea
                        id="abstract_ar"
                        name="abstract_ar"
                        rows={4}
                        value={data.abstract_ar}
                        onChange={(event) => setData('abstract_ar', event.target.value)}
                    />
                    <InputError message={errors.abstract_ar} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="keywords_en">{t('researches.form.keywordsEn')}</Label>
                    <Input
                        id="keywords_en"
                        name="keywords_en"
                        value={data.keywords_en}
                        onChange={(event) => setData('keywords_en', event.target.value)}
                        placeholder="AI, Healthcare"
                    />
                    <InputError message={errors.keywords_en} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="keywords_ar">{t('researches.form.keywordsAr')}</Label>
                    <Input
                        id="keywords_ar"
                        name="keywords_ar"
                        value={data.keywords_ar}
                        onChange={(event) => setData('keywords_ar', event.target.value)}
                        placeholder="ذكاء اصطناعي، صحة"
                    />
                    <InputError message={errors.keywords_ar} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="status">{t('researches.form.status')}</Label>
                    <select
                        id="status"
                        name="status"
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                        value={data.status}
                        onChange={(event) => setData('status', event.target.value)}
                    >
                        {localizedStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.status} />
                </div>

                <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="is_public"
                            checked={data.is_public}
                            onCheckedChange={(checked) => setData('is_public', checked === true)}
                        />
                        <div>
                            <Label htmlFor="is_public">{t('researches.form.isPublic')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('researches.form.isPublicHint')}
                            </p>
                        </div>
                    </div>
                    <InputError message={errors.is_public} />
                </div>
            </div>

            <div className="space-y-3">
                <Label>{t('researches.form.files')}</Label>
                <div
                    {...getRootProps({
                        className: `flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
                            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/40'
                        }`,
                    })}
                >
                    <input {...getInputProps({ name: 'files[]' })} />
                    <Paperclip className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">{t('researches.form.dropzoneTitle')}</p>
                    <p className="text-sm text-muted-foreground">{t('researches.form.dropzoneDescription')}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {t('researches.form.maxFileSize', { size: '1GB' })}
                    </p>
                </div>
                {(dropError || errors.files) && (
                    <p className="text-sm text-destructive">{dropError ?? errors.files}</p>
                )}

                {selectedFiles.length > 0 && (
                    <div className="rounded-lg border bg-muted/40 p-4">
                        <p className="mb-3 text-sm font-medium text-muted-foreground">
                            {t('researches.form.pendingUploads')}
                        </p>
                        <ul className="space-y-2 text-sm">
                            {selectedFiles.map((file, index) => (
                                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{file.name}</span>
                                        <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSelectedFile(index)}
                                        aria-label={t('actions.delete')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {existingFiles.length > 0 && (
                    <div className="rounded-lg border bg-card/40 p-4">
                        <p className="mb-3 text-sm font-medium text-muted-foreground">
                            {t('researches.form.existingFiles')}
                        </p>
                        <ul className="space-y-2 text-sm">
                            {existingFiles.map((file) => (
                                <li key={file.id} className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatBytes(file.size_bytes)}</p>
                                    </div>
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        {t('actions.view')}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end">
                <Button type="submit" disabled={processing}>
                    {submitLabel ?? (method === 'post' ? t('actions.create') : t('actions.update'))}
                </Button>
            </div>
        </form>
    );
}
