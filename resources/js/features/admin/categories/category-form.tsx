import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/i18n';

interface ParentOption {
    id: number;
    name: string;
}

interface CategoryFormProps {
    action: string;
    method: 'post' | 'put';
    parentOptions: ParentOption[];
    defaultValues?: {
        name_en?: string;
        name_ar?: string;
        slug?: string;
        description?: string | null;
        parent_id?: number | null;
    };
    submitLabel?: string;
    onSuccess?: () => void;
}

export default function CategoryForm({
    action,
    method,
    parentOptions,
    defaultValues,
    submitLabel,
    onSuccess,
}: CategoryFormProps) {
    const [nameEn, setNameEn] = useState(defaultValues?.name_en ?? '');
    const [nameAr, setNameAr] = useState(defaultValues?.name_ar ?? '');
    const [slug, setSlug] = useState(defaultValues?.slug ?? '');
    const [slugEdited, setSlugEdited] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setNameEn(defaultValues?.name_en ?? '');
        setNameAr(defaultValues?.name_ar ?? '');
        setSlug(defaultValues?.slug ?? '');
        setSlugEdited(false);
    }, [defaultValues]);

    const handleNameChange = (value: string) => {
        setNameEn(value);
        if (!slugEdited) {
            setSlug(generateSlug(value));
        }
    };

    const handleSlugChange = (value: string) => {
        setSlugEdited(true);
        setSlug(value);
    };

    return (
        <Form
            method={method}
            action={action}
            className="space-y-6"
            onSuccess={() => {
                onSuccess?.();
            }}
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name_en">{t('categories.nameEn')}</Label>
                        <Input
                            id="name_en"
                            name="name_en"
                            required
                            value={nameEn}
                            onChange={(event) => handleNameChange(event.target.value)}
                            placeholder={t('categories.nameEn')}
                        />
                        <InputError message={errors.name_en} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name_ar">{t('categories.nameAr')}</Label>
                        <Input
                            id="name_ar"
                            name="name_ar"
                            required
                            value={nameAr}
                            onChange={(event) => setNameAr(event.target.value)}
                            placeholder={t('categories.nameAr')}
                        />
                        <InputError message={errors.name_ar} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">{t('categories.table.slug')}</Label>
                        <Input
                            id="slug"
                            name="slug"
                            required
                            value={slug}
                            onChange={(event) => handleSlugChange(event.target.value)}
                            placeholder={t('categories.table.slug')}
                        />
                        <InputError message={errors.slug} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="parent_id">{t('categories.table.parent')}</Label>
                        <select
                            id="parent_id"
                            name="parent_id"
                            defaultValue={defaultValues?.parent_id ?? ''}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                        >
                            <option value="">{t('categories.parentNone')}</option>
                            {parentOptions.map((parent) => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.parent_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">{t('categoryShow.description')}</Label>
                        <Textarea
                            id="description"
                            name="description"
                            rows={5}
                            defaultValue={defaultValues?.description ?? ''}
                            placeholder={t('categoryShow.description')}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <Button disabled={processing}>{submitLabel ?? t('actions.save')}</Button>
                </>
            )}
        </Form>
    );
}

const generateSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');
