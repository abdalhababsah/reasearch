import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

import type { SharedData } from '@/types';

interface ToastMessage {
    id: number;
    type: 'success' | 'error';
    text: string;
}

const DISPLAY_DURATION = 4500;

export default function FlashToaster() {
    const { flash } = usePage<SharedData>().props;
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const previous = useRef<{ success?: string | null; error?: string | null }>({});

    const dismiss = useCallback((id: number) => {
        setToasts((previousToasts) => previousToasts.filter((toast) => toast.id !== id));
    }, []);

    const pushToast = useCallback(
        (type: ToastMessage['type'], text?: string | null) => {
            if (!text) {
                return;
            }

            const id = Date.now() + Math.random();
            setToasts((previousToasts) => [...previousToasts, { id, type, text }]);

            setTimeout(() => dismiss(id), DISPLAY_DURATION);
        },
        [dismiss],
    );

    useEffect(() => {
        const success = (flash?.success as string) ?? null;
        const error = (flash?.error as string) ?? null;

        if (success && success !== previous.current.success) {
            pushToast('success', success);
            previous.current.success = success;
        } else if (!success) {
            previous.current.success = null;
        }

        if (error && error !== previous.current.error) {
            pushToast('error', error);
            previous.current.error = error;
        } else if (!error) {
            previous.current.error = null;
        }
    }, [flash?.success, flash?.error, pushToast]);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto rounded-xl border p-4 shadow-lg backdrop-blur-sm ${
                        toast.type === 'success'
                            ? 'border-emerald-300/50 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100'
                            : 'border-rose-300/50 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-100'
                    }`}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold">
                                {toast.type === 'success' ? 'Success' : 'Error'}
                            </p>
                            <p className="text-sm opacity-90">{toast.text}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            className="rounded-full p-1 text-current transition hover:bg-black/10 hover:text-black dark:hover:bg-white/10"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Dismiss</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
