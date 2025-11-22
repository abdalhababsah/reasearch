import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TagFormProps {
    action: string;
    method: 'post' | 'put';
    defaultValues?: {
        name?: string;
        slug?: string;
    };
    submitLabel?: string;
    onSuccess?: () => void;
}

export default function TagForm({
    action,
    method,
    defaultValues,
    submitLabel = 'Save tag',
    onSuccess,
}: TagFormProps) {
    const [name, setName] = useState(defaultValues?.name ?? '');
    const [slug, setSlug] = useState(defaultValues?.slug ?? '');
    const [slugEdited, setSlugEdited] = useState(false);

    useEffect(() => {
        setName(defaultValues?.name ?? '');
        setSlug(defaultValues?.slug ?? '');
        setSlugEdited(false);
    }, [defaultValues]);

    const handleNameChange = (value: string) => {
        setName(value);
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
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            value={name}
                            onChange={(event) => handleNameChange(event.target.value)}
                            placeholder="Artificial Intelligence"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            name="slug"
                            required
                            value={slug}
                            onChange={(event) => handleSlugChange(event.target.value)}
                            placeholder="ai"
                        />
                        <InputError message={errors.slug} />
                    </div>

                    <Button disabled={processing}>{submitLabel}</Button>
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
