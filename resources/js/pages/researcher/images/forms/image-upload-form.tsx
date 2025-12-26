import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/i18n';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

interface ImageUploadFormProps {
    onSuccess: () => void;
}

export default function ImageUploadForm({ onSuccess }: ImageUploadFormProps) {
    const { t } = useTranslation();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        image_files: [] as File[],
        title: '',
        description: '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);
        setData('image_files', files);

        // Generate preview URLs
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newUrls = previewUrls.filter((_, i) => i !== index);

        setSelectedFiles(newFiles);
        setPreviewUrls(newUrls);
        setData('image_files', newFiles);

        // Revoke URL to prevent memory leaks
        URL.revokeObjectURL(previewUrls[index]);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post('/researcher/images', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedFiles([]);
                previewUrls.forEach((url) => URL.revokeObjectURL(url));
                setPreviewUrls([]);
                onSuccess();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Input */}
            <div>
                <Label htmlFor="image_files">
                    {t('images.uploadForm.images') || 'Images'} *
                </Label>
                <div className="mt-2">
                    <label
                        htmlFor="image_files"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                {t('images.uploadForm.clickToUpload') ||
                                    'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG, GIF, or WEBP (max 10MB each)
                            </p>
                        </div>
                        <input
                            id="image_files"
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleFileChange}
                            disabled={processing}
                        />
                    </label>
                </div>
                {errors.image_files && (
                    <p className="mt-1 text-sm text-destructive">{errors.image_files}</p>
                )}
            </div>

            {/* File Previews */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <Label>{t('images.uploadForm.selectedImages') || 'Selected Images'}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg border bg-muted overflow-hidden">
                                    <img
                                        src={previewUrls[index]}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    disabled={processing}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <p className="mt-1 text-xs text-muted-foreground truncate">
                                    {file.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Title */}
            <div>
                <Label htmlFor="title">
                    {t('images.uploadForm.title') || 'Title (Optional)'}
                </Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder={
                        t('images.uploadForm.titlePlaceholder') ||
                        'Enter a title for all images'
                    }
                    disabled={processing}
                />
                {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
                <Label htmlFor="description">
                    {t('images.uploadForm.description') || 'Description (Optional)'}
                </Label>
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder={
                        t('images.uploadForm.descriptionPlaceholder') ||
                        'Add a description for all images'
                    }
                    rows={3}
                    disabled={processing}
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        reset();
                        setSelectedFiles([]);
                        previewUrls.forEach((url) => URL.revokeObjectURL(url));
                        setPreviewUrls([]);
                        onSuccess();
                    }}
                    disabled={processing}
                >
                    {t('actions.cancel') || 'Cancel'}
                </Button>
                <Button type="submit" disabled={processing || selectedFiles.length === 0}>
                    {processing ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('images.uploadForm.uploading') || 'Uploading...'}
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            {t('images.uploadForm.upload') || 'Upload'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}