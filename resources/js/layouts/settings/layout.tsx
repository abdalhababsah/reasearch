import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useMemo } from 'react';
import { useTranslation } from '@/i18n';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { t } = useTranslation();
    const page = usePage<SharedData>();

    const sidebarNavItems = useMemo<NavItem[]>(
        () => [
            {
                title: t('nav.profile'),
                href: edit(),
                icon: null,
            },
            {
                title: t('nav.password'),
                href: editPassword(),
                icon: null,
            },
            {
                title: t('nav.twoFactor'),
                href: show(),
                icon: null,
            },
            {
                title: t('nav.appearance'),
                href: editAppearance(),
                icon: null,
            },
        ],
        [t],
    );

    const currentPath = resolveUrl(page.url as string);

    return (
        <div className="px-4 py-6">
            <Heading title={t('settings.title')} description={t('settings.description')} />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${resolveUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isSameUrl(currentPath, item.href),
                                })}
                            >
                                <Link href={item.href}>{item.title}</Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-4xl">
                    <section className="max-w-3xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
