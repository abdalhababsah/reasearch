import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { FolderTree, LayoutGrid, Tags } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';
import { useTranslation } from '@/i18n';

export function AppSidebar({ side = 'left' }: { side?: 'left' | 'right' }) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role?.name === 'admin';
    const { t } = useTranslation();

    const mainNavItems = useMemo<NavItem[]>(() => {
        const base: NavItem[] = [
            {
                title: t('nav.dashboard'),
                href: dashboard(),
                icon: LayoutGrid,
            },
        ];

        if (isAdmin) {
            base.push(
                {
                    title: t('nav.categories'),
                    href: '/admin/categories',
                    icon: FolderTree,
                },
                {
                    title: t('nav.tags'),
                    href: '/admin/tags',
                    icon: Tags,
                },
            );
        }

        return base;
    }, [isAdmin, t]);

    return (
        <Sidebar collapsible="icon" variant="inset" side={side}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
