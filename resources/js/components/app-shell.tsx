import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ComponentProps, type ReactNode } from 'react';

interface AppShellProps extends ComponentProps<'div'> {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header', className, ...props }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col" {...props}>
                {children}
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={isOpen} className={className} {...props}>
            {children}
        </SidebarProvider>
    );
}
