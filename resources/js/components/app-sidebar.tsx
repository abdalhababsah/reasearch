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
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { dashboard as researcherDashboard } from '@/routes/researcher';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { FileText, FolderTree, LayoutGrid, Tags, FileAudio2, Image } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';
import { useTranslation } from '@/i18n';
import AppLogoIcon from './app-logo-icon';

export function AppSidebar({ side = 'left' }: { side?: 'left' | 'right' }) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role?.name === 'admin';
    const isResearcher = auth?.user?.role?.name === 'researcher';
    const { t } = useTranslation();
    const { state } = useSidebar();
    const dashboardHref = isAdmin
        ? adminDashboard()
        : isResearcher
            ? researcherDashboard()
            : dashboard();

    const mainNavItems = useMemo<NavItem[]>(() => {
        const base: NavItem[] = [
            {
                title: t('nav.dashboard'),
                href: dashboardHref,
                icon: LayoutGrid,
            },
        ];

        if (isAdmin) {
            base.push(
                {
                    title: t('nav.researches'),
                    href: '/admin/researches',
                    icon: FileText,
                },
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
        } else {
            base.push(
                {
                    title: t('nav.researches'),
                    href: '/researcher/researches',
                    icon: FileText,
                },
                {
                    title: t('nav.audios'),
                    href: '/researcher/audios',
                    icon: FileAudio2,
                },
                {
                    title: t('nav.images'),
                    href: '/researcher/images',
                    icon: Image,
                }
            );
        }

        return base;
    }, [dashboardHref, isAdmin, t]);

    return (
        <Sidebar collapsible="icon" variant="inset" side={side}>
            {state === 'expanded' && (
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className='justify-center' asChild>
                                <Link href={dashboardHref} prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
            )}
            {state === 'collapsed' && (
                <SidebarHeader>
                    <div className="flex h-10 items-center justify-center">
                        <AppLogoIcon className="h-8 w-auto" />
                    </div>
                </SidebarHeader>
            )}

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
