import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';

interface TagFormProps {
    action: string;
    method: 'post' | 'put';
    defaultValues?: {
        name_en?: string;
        name_ar?: string;
        slug?: string;
    };
    submitLabel?: string;
    onSuccess?: () => void;
}

export default function TagForm({
    action,
    method,
    defaultValues,
    submitLabel,
    onSuccess,
}: TagFormProps) {
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
                            <Label htmlFor="name_en">{t('tags.nameEn')}</Label>
                        <Input
                            id="name_en"
                            name="name_en"
                            required
                            value={nameEn}
                            onChange={(event) => handleNameChange(event.target.value)}
                            placeholder={t('tags.nameEn')}
                        />
                        <InputError message={errors.name_en} />
                    </div>

                    <div className="grid gap-2">
                            <Label htmlFor="name_ar">{t('tags.nameAr')}</Label>
                        <Input
                            id="name_ar"
                            name="name_ar"
                            required
                            value={nameAr}
                            onChange={(event) => setNameAr(event.target.value)}
                            placeholder={t('tags.nameAr')}
                        />
                        <InputError message={errors.name_ar} />
                    </div>

                    <div className="grid gap-2">
                            <Label htmlFor="slug">{t('tags.table.slug')}</Label>
                        <Input
                            id="slug"
                            name="slug"
                            required
                            value={slug}
                            onChange={(event) => handleSlugChange(event.target.value)}
                            placeholder={t('tags.table.slug')}
                        />
                        <InputError message={errors.slug} />
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
