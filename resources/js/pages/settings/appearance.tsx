import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';
import { useTranslation } from '@/i18n';

export default function Appearance() {
    const { t } = useTranslation();
    const breadcrumbs = [
        {
            title: t('settings.appearanceTitle'),
            href: editAppearance().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.appearanceTitle')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={t('settings.appearanceTitle')}
                        description={t('settings.appearanceDescription')}
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
