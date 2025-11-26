import { Head, useForm, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';

interface StatusOption {
    value: string;
    label: string;
}

interface Category {
    id: number;
    name_en: string | null;
    name_ar: string | null;
}

interface Tag {
    id: number;
    name_en: string | null;
    name_ar: string | null;
}

interface ResearchFile {
    id: number;
    name: string;
    size_bytes: number;
    mime_type: string;
    url: string;
    is_primary: boolean;
}

interface ResearchResource {
    id: number;
    title: string | null;
    status: string;
    files: ResearchFile[];
    categories: Array<{ id: number; name_en: string; name_ar: string }>;
    tags: Array<{ id: number; name_en: string; name_ar: string }>;
    wallpaper_url: string | null;
    raw: {
        title_en: string;
        title_ar: string;
        abstract_en?: string | null;
        abstract_ar?: string | null;
        keywords_en?: string | null;
        keywords_ar?: string | null;
        status?: string | null;
        is_public: boolean;
    };
}

interface ResearchEditProps {
    statuses: StatusOption[];
    categories: Category[];
    tags: Tag[];
    research: ResearchResource;
    selectedCategories: number[];
    selectedTags: number[];
}

export default function ResearchEdit({ 
    statuses, 
    categories, 
    tags, 
    research,
    selectedCategories,
    selectedTags
}: ResearchEditProps) {
    const { t, locale } = useTranslation();

    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'PUT',
        title_en: research.raw.title_en || '',
        title_ar: research.raw.title_ar || '',
        abstract_en: research.raw.abstract_en || '',
        abstract_ar: research.raw.abstract_ar || '',
        keywords_en: research.raw.keywords_en || '',
        keywords_ar: research.raw.keywords_ar || '',
        status: research.raw.status || 'draft',
        is_public: research.raw.is_public,
        category_ids: selectedCategories as number[],
        tag_ids: selectedTags as number[],
        files: [] as File[],
        primary_file_index: null as number | null,
        remove_file_ids: [] as number[],
        wallpaper: null as File | null,
        remove_wallpaper: false,
    });

    const [categorySearch, setCategorySearch] = useState('');
    const [tagSearch, setTagSearch] = useState('');
    const [wallpaperPreview, setWallpaperPreview] = useState<string | null>(research.wallpaper_url);

    // Find current primary file from existing files
    const currentPrimaryFileId = research.files.find(f => f.is_primary)?.id || null;

    // Handle wallpaper preview URL
    useEffect(() => {
        if (data.remove_wallpaper) {
            setWallpaperPreview(null);
            return;
        }
        
        if (!data.wallpaper) {
            setWallpaperPreview(research.wallpaper_url);
            return;
        }
        
        const url = URL.createObjectURL(data.wallpaper);
        setWallpaperPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.wallpaper, data.remove_wallpaper, research.wallpaper_url]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/researcher/researches/${research.id}`, {
            forceFormData: true,
            onSuccess: () => {
                // Don't reset form on success for edit page
            },
        });
    };

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        const next = [...(data.files ?? []), ...files];
        setData('files', next as any);

        e.target.value = '';
    };

    const handleWallpaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('wallpaper', file as any);
        if (file) {
            setData('remove_wallpaper', false);
        }
    };

    const toggleCategory = (id: number, checked: boolean) => {
        const current = data.category_ids ?? [];
        const next = checked ? [...current, id] : current.filter((x) => x !== id);
        setData('category_ids', next);
    };

    const toggleTag = (id: number, checked: boolean) => {
        const current = data.tag_ids ?? [];
        const next = checked ? [...current, id] : current.filter((x) => x !== id);
        setData('tag_ids', next);
    };

    const removeNewFileAt = (index: number) => {
        const next = (data.files ?? []).filter((_, i) => i !== index);
        setData('files', next as any);

        if (data.primary_file_index === index) {
            setData('primary_file_index', next.length ? 0 : null);
        } else if (
            data.primary_file_index !== null &&
            data.primary_file_index > index
        ) {
            setData('primary_file_index', data.primary_file_index - 1);
        }
    };

    const removeExistingFile = (fileId: number) => {
        const next = [...(data.remove_file_ids ?? []), fileId];
        setData('remove_file_ids', next);
    };

    const removeWallpaper = () => {
        setData('wallpaper', null);
        setData('remove_wallpaper', true);
    };

    // Get existing files that haven't been marked for removal
    const activeExistingFiles = research.files.filter(
        f => !data.remove_file_ids.includes(f.id)
    );

    const filteredCategories = useMemo(
        () =>
            categories.filter((c) => {
                const label =
                    locale === 'ar'
                        ? c.name_ar ?? c.name_en ?? ''
                        : c.name_en ?? c.name_ar ?? '';
                return label.toLowerCase().includes(categorySearch.toLowerCase());
            }),
        [categories, categorySearch, locale]
    );

    const filteredTags = useMemo(
        () =>
            tags.filter((t) => {
                const label =
                    locale === 'ar'
                        ? t.name_ar ?? t.name_en ?? ''
                        : t.name_en ?? t.name_ar ?? '';
                return label.toLowerCase().includes(tagSearch.toLowerCase());
            }),
        [tags, tagSearch, locale]
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: t('researches.title'), href: '/researcher/researches' },
                { title: research.title ?? t('researches.card.untitled'), href: `/researcher/researches/${research.id}` },
                { title: t('actions.edit'), href: '#' },
            ]}
        >
            <Head title={`${t('actions.edit')} • ${research.title ?? t('researches.card.untitled')}`} />

            <form
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col gap-6 p-4 lg:p-6"
            >
                {/* Header area with title + actions */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold">
                            {t('actions.edit')} {research.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('researches.form.editSubtitle', {
                                defaultValue: 'Update your research details, manage files, and adjust settings.',
                            })}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(`/researcher/researches/${research.id}`)}
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="min-w-[120px]"
                        >
                            {processing ? t('actions.saving') : t('actions.update')}
                        </Button>
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                    {/* LEFT COLUMN – main form */}
                    <div className="space-y-6">
                        {/* Basic info */}
                        <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-base font-semibold">
                                    {t('researches.form.basicInfo')}
                                </h2>
                                <Badge variant="outline" className="text-xs">
                                    {data.status}
                                </Badge>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-medium mb-1 uppercase tracking-wide">
                                        {t('researches.form.title_en')}
                                    </label>
                                    <Input
                                        value={data.title_en}
                                        onChange={(e) =>
                                            setData('title_en', e.target.value)
                                        }
                                        placeholder={t('researches.form.titlePlaceholderEn')}
                                    />
                                    <InputError message={errors.title_en} />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1 uppercase tracking-wide">
                                        {t('researches.form.title_ar')}
                                    </label>
                                    <Input
                                        value={data.title_ar}
                                        onChange={(e) =>
                                            setData('title_ar', e.target.value)
                                        }
                                        placeholder={t('researches.form.titlePlaceholderAr')}
                                    />
                                    <InputError message={errors.title_ar} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-medium mb-1 uppercase tracking-wide">
                                        {t('researches.form.abstract_en')}
                                    </label>
                                    <Textarea
                                        rows={5}
                                        value={data.abstract_en}
                                        onChange={(e) =>
                                            setData('abstract_en', e.target.value)
                                        }
                                        placeholder={t('researches.form.abstractPlaceholderEn')}
                                    />
                                    <InputError message={errors.abstract_en} />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1 uppercase tracking-wide">
                                        {t('researches.form.abstract_ar')}
                                    </label>
                                    <Textarea
                                        rows={5}
                                        value={data.abstract_ar}
                                        onChange={(e) =>
                                            setData('abstract_ar', e.target.value)
                                        }
                                        placeholder={t('researches.form.abstractPlaceholderAr')}
                                    />
                                    <InputError message={errors.abstract_ar} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-medium mb-1 uppercase tracking-wide">
                                        {t('researches.form.keywords_en')}
                                    </label>
                                    <Input
                                        value={data.keywords_en}
                                        onChange={(e) =>
                                            setData('keywords_en', e.target.value)
                                        }
                                        placeholder={t('researches.form.keywordsPlaceholderEn')}
                                    />
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        {t('researches.form.keywordsHelp')}
                                    </p>
                                    <InputError message={errors.keywords_en} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 uppercase tracking-wide">
                                        {t('researches.form.keywords_ar')}
                                    </label>
                                    <Input
                                        value={data.keywords_ar}
                                        onChange={(e) =>
                                            setData('keywords_ar', e.target.value)
                                        }
                                        placeholder={t('researches.form.keywordsPlaceholderAr')}
                                    />
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        {t('researches.form.keywordsHelp')}
                                    </p>
                                    <InputError message={errors.keywords_ar} />
                                </div>
                            </div>
                        </section>

                        {/* Categories + Tags */}
                        <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold">
                                    {t('researches.form.taxonomy')}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {t('researches.form.taxonomyHelp')}
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Categories */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium uppercase tracking-wide">
                                            {t('researches.form.categories')}
                                        </span>
                                        <Input
                                            placeholder={t('actions.search')}
                                            value={categorySearch}
                                            onChange={(e) =>
                                                setCategorySearch(e.target.value)
                                            }
                                            className="h-8 text-xs max-w-[180px]"
                                        />
                                    </div>
                                    <div className="mt-1 max-h-48 overflow-y-auto rounded-md border p-2">
                                        {filteredCategories.length ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {filteredCategories.map((cat) => {
                                                    const label =
                                                        locale === 'ar'
                                                            ? cat.name_ar ?? cat.name_en ?? ''
                                                            : cat.name_en ?? cat.name_ar ?? '';
                                                    const checked = data.category_ids.includes(cat.id);
                                                    return (
                                                        <label
                                                            key={cat.id}
                                                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition cursor-pointer ${
                                                                checked
                                                                    ? 'border-primary bg-primary/10 text-primary'
                                                                    : 'border-border bg-background hover:bg-muted'
                                                            }`}
                                                        >
                                                            <Checkbox
                                                                checked={checked}
                                                                onCheckedChange={() => toggleCategory(cat.id, !checked)}
                                                                className="h-3 w-3"
                                                            />
                                                            <span className="truncate max-w-[130px]">
                                                                {label}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-muted-foreground">
                                                {t('researches.form.noCategories')}
                                            </p>
                                        )}
                                    </div>
                                    <InputError message={errors.category_ids as string} />
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium uppercase tracking-wide">
                                            {t('researches.form.tags')}
                                        </span>
                                        <Input
                                            placeholder={t('actions.search')}
                                            value={tagSearch}
                                            onChange={(e) => setTagSearch(e.target.value)}
                                            className="h-8 text-xs max-w-[180px]"
                                        />
                                    </div>
                                    <div className="mt-1 max-h-48 overflow-y-auto rounded-md border p-2">
                                        {filteredTags.length ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {filteredTags.map((tag) => {
                                                    const label =
                                                        locale === 'ar'
                                                            ? tag.name_ar ?? tag.name_en ?? ''
                                                            : tag.name_en ?? tag.name_ar ?? '';
                                                    const checked = data.tag_ids.includes(tag.id);
                                                    return (
                                                        <label
                                                            key={tag.id}
                                                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition cursor-pointer ${
                                                                checked
                                                                    ? 'border-primary bg-primary/10 text-primary'
                                                                    : 'border-border bg-background hover:bg-muted'
                                                            }`}
                                                        >
                                                            <Checkbox
                                                                checked={checked}
                                                                onCheckedChange={() => toggleTag(tag.id, !checked)}
                                                                className="h-3 w-3"
                                                            />
                                                            <span className="truncate max-w-[130px]">
                                                                {label}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-muted-foreground">
                                                {t('researches.form.noTags')}
                                            </p>
                                        )}
                                    </div>
                                    <InputError message={errors.tag_ids as string} />
                                </div>
                            </div>
                        </section>

                        {/* Files & wallpaper */}
                        <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold">
                                    {t('researches.form.files')}
                                </h2>
                                <p className="text-xs text-muted-foreground max-w-[260px] text-right">
                                    {t('researches.show.filesHelp')}
                                </p>
                            </div>

                            {/* Existing Files */}
                            {activeExistingFiles.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-xs font-medium uppercase tracking-wide">
                                        {t('researches.form.existingFiles', { defaultValue: 'Existing Files' })}
                                    </span>
                                    <ul className="divide-y rounded-md border text-sm">
                                        {activeExistingFiles.map((file) => (
                                            <li
                                                key={file.id}
                                                className="flex items-center gap-3 px-3 py-2"
                                            >
                                                <div className="flex flex-1 flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate max-w-[220px]">
                                                            {file.name}
                                                        </span>
                                                        {file.is_primary && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px]"
                                                            >
                                                                {t('researches.form.primaryFile')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {(file.mime_type || '—') +
                                                            ' · ' +
                                                            formatBytes(file.size_bytes)}
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2 text-xs text-destructive"
                                                    onClick={() => removeExistingFile(file.id)}
                                                >
                                                    {t('actions.remove')}
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Upload new files */}
                            <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-center">
                                <p className="text-sm font-medium">
                                    {t('researches.form.addMoreFiles', {
                                        defaultValue: 'Add more documents',
                                    })}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t('researches.form.dropFilesSubtitle', {
                                        defaultValue:
                                            'PDF, Word, Excel, CSV, ZIP, or images.',
                                    })}
                                </p>
                                <div className="mt-3 flex justify-center">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                                        <span>{t('researches.form.chooseFiles')}</span>
                                        <Input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFilesChange}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.rar,.txt,image/*"
                                        />
                                    </label>
                                </div>
                                <InputError message={errors.files as string} />
                            </div>

                            {/* New files list */}
                            {Array.isArray(data.files) && data.files.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium uppercase tracking-wide">
                                            {t('researches.form.newFiles', { defaultValue: 'New Files' })}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {t('researches.form.primaryHint')}
                                        </span>
                                    </div>
                                    <ul className="divide-y rounded-md border text-sm">
                                        {data.files.map((file, index) => (
                                            <li
                                                key={`${file.name}-${index}`}
                                                className="flex items-center gap-3 px-3 py-2"
                                            >
                                                <input
                                                    type="radio"
                                                    name="primary_file_index"
                                                    className="h-3 w-3 mt-0.5"
                                                    checked={data.primary_file_index === index}
                                                    onChange={() =>
                                                        setData('primary_file_index', index)
                                                    }
                                                />
                                                <div className="flex flex-1 flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate max-w-[220px]">
                                                            {file.name}
                                                        </span>
                                                        {data.primary_file_index === index && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px]"
                                                            >
                                                                {t('researches.form.primaryFile')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {(file.type || '—') +
                                                            ' · ' +
                                                            formatBytes(file.size)}
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2 text-xs text-destructive"
                                                    onClick={() => removeNewFileAt(index)}
                                                >
                                                    {t('actions.remove')}
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Wallpaper */}
                            <div className="mt-4 border-t pt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_200px] items-start">
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium mb-1 uppercase tracking-wide">
                                        {t('researches.form.wallpaper')}
                                    </label>
                                    <p className="text-[11px] text-muted-foreground mb-1">
                                        {t('researches.form.wallpaperHelp', {
                                            defaultValue:
                                                'Optional cover image for the research card.',
                                        })}
                                    </p>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleWallpaperChange}
                                    />
                                    {wallpaperPreview && !data.remove_wallpaper && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            className="mt-2"
                                            onClick={removeWallpaper}
                                        >
                                            {t('researches.form.removeWallpaper', { defaultValue: 'Remove Wallpaper' })}
                                        </Button>
                                    )}
                                    <InputError message={errors.wallpaper as string} />
                                </div>

                                <div className="flex items-center justify-center">
                                    <div className="relative h-32 w-40 overflow-hidden rounded-lg border bg-muted">
                                        {wallpaperPreview && !data.remove_wallpaper ? (
                                            <img
                                                src={wallpaperPreview}
                                                alt="Wallpaper preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                                {t('researches.form.noWallpaperPreview', { defaultValue: 'No image' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN – status & visibility card */}
                    <aside className="space-y-4">
                        <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                            <h2 className="text-base font-semibold">
                                {t('researches.form.settings')}
                            </h2>

                            <div className="space-y-4 text-sm">
                                {/* Status */}
                                <div>
                                    <label className="block text-xs font-medium mb-1 uppercase tracking-wide">
                                        {t('researches.form.status')}
                                    </label>
                                    <select
                                        className="w-full rounded-md border px-2 py-1.5 text-sm bg-background"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        {statuses.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} />
                                </div>

                                {/* Visibility */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={data.is_public}
                                            onCheckedChange={(checked) =>
                                                setData('is_public', Boolean(checked))
                                            }
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {t('researches.visibility.public')}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {t('researches.form.visibilityHelp')}
                                            </span>
                                        </div>
                                    </div>
                                    <InputError message={errors.is_public as string} />
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </form>
        </AppLayout>
    );
}

function formatBytes(bytes?: number | null) {
    if (!bytes || !Number.isFinite(bytes) || bytes <= 0) {
        return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
}