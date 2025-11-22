import { usePage } from '@inertiajs/react';

import en from './en.json';
import ar from './ar.json';
import type { SharedData } from '@/types';

type Dictionaries = typeof en;

type LocaleKey = 'en' | 'ar';

const dictionaries: Record<LocaleKey, Dictionaries> = {
    en,
    ar,
};

function getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((value, part) => {
        if (value && typeof value === 'object' && part in value) {
            return (value as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj);
}

function formatMessage(message: string, params?: Record<string, string | number>) {
    if (!params) {
        return message;
    }

    return Object.keys(params).reduce((text, key) => {
        return text.replace(new RegExp(`:${key}`, 'g'), String(params[key]));
    }, message);
}

export function useTranslation() {
    const { locale = 'en', direction = 'ltr' } = usePage<SharedData>().props;
    const dictionary = dictionaries[locale as LocaleKey] ?? en;

    const t = (key: string, params?: Record<string, string | number>) => {
        const value = getNestedValue(dictionary, key);
        if (typeof value === 'string') {
            return formatMessage(value, params);
        }
        return key;
    };

    return { t, locale: locale as LocaleKey, direction };
}
