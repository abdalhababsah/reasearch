import FlashToaster from '@/components/flash-toaster';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren, useEffect } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { locale, direction } = usePage<SharedData>().props;
    const currentDirection = direction ?? 'ltr';

    useEffect(() => {
        if (direction) {
            document.documentElement.dir = direction;
        }
    }, [direction]);

    useEffect(() => {
        if (locale) {
            document.documentElement.lang = locale;
        }
    }, [locale]);

    return (
        <AppShell
            variant="sidebar"
            className={currentDirection === 'rtl' ? 'flex-row' : undefined}
        >
            <AppSidebar side={currentDirection === 'rtl' ? 'right' : 'left'} />
            <AppContent
                variant="sidebar"
                className="overflow-x-hidden"
                dir={currentDirection}
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <FlashToaster />
                {children}
            </AppContent>
        </AppShell>
    );
}
