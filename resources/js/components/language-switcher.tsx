import { router } from '@inertiajs/react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

const locales = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
];

export default function LanguageSwitcher() {
    const { locale, t, direction } = useTranslation();

    const handleChange = (value: string) => {
        if (value === locale) {
            return;
        }

        router.post('/language', { locale: value }, { preserveScroll: true });
    };

    return (
        <div
            className={cn('flex items-center gap-2', direction === 'rtl' ? 'mr-auto' : 'ml-auto')}
        >
            <label htmlFor="language-select" className="text-xs font-medium uppercase tracking-wider">
                {t('language.label')}
            </label>
            <Select value={locale} onValueChange={handleChange}>
                <SelectTrigger id="language-select" className="h-8 w-28 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                    {locales.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
