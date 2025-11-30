import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/i18n';
import { Plus, Loader2 } from 'lucide-react';

interface AudioLabel {
    id: number;
    name: string;
    color: string;
    description: string | null;
}

interface CreateLabelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLabelCreated: (label: AudioLabel) => void;
}

const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

export default function CreateLabelDialog({ open, onOpenChange, onLabelCreated }: CreateLabelDialogProps) {
    const { t } = useTranslation();
    const { props } = usePage<any>();
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        name: '',
        color: PRESET_COLORS[0],
        description: '',
    });

    useEffect(() => {
        console.log('Dialog open changed:', open);
        console.log('Form wasSuccessful:', wasSuccessful);
        console.log('Flash data:', props.flash);

        if (wasSuccessful && props.flash?.label) {
            const newLabel = props.flash.label as AudioLabel;
            console.log('Label created successfully:', newLabel);

            onLabelCreated(newLabel);
            reset();
            setSelectedColor(PRESET_COLORS[0]);
            onOpenChange(false);
        }
    }, [wasSuccessful, props.flash, onLabelCreated, onOpenChange, open, reset]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Make sure the form data carries the latest selected color
        setData('color', selectedColor);

        console.log('Submitting label:', { name: data.name, color: selectedColor });

        post('/researcher/audio-labels', {
            preserveScroll: true,
            // Let Inertia re-fetch props, so flash data & wasSuccessful update correctly
            preserveState: false,
        });
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setData('color', color);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" type="button">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('audios.label.addLabel')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('audios.label.createLabel')}</DialogTitle>
                    <DialogDescription>
                        {t('audios.label.createLabelDescription')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">{t('audios.label.labelName')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('audios.label.labelNamePlaceholder')}
                            disabled={processing}
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <Label>{t('audios.label.labelColor')}</Label>
                        <div className="grid grid-cols-8 gap-2 mt-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleColorSelect(color)}
                                    className={`h-8 w-8 rounded-md transition-all ${
                                        selectedColor === color
                                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                            : 'hover:scale-110'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        {errors.color && (
                            <p className="mt-1 text-sm text-destructive">{errors.color}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">{t('audios.label.labelDescription')}</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder={t('audios.label.labelDescriptionPlaceholder')}
                            rows={3}
                            disabled={processing}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t('audios.label.creating')}
                                </>
                            ) : (
                                t('actions.create')
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
