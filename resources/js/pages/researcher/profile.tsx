import { Head, usePage } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import ResearcherProfileForm, {
    type ResearcherProfileData,
} from '@/features/researcher/researcher-profile-form';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { useTranslation } from '@/i18n';

export default function ResearcherProfile() {
    const { props } = usePage<SharedData & ResearcherProfileData>();
    const { profile, experiences, educations, majors, selected_majors } = props;
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('researcher.profileTitle'),
            href: '/settings/profile',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('researcher.profileTitle')} />
            <ResearcherProfileForm
                profile={profile}
                experiences={experiences}
                educations={educations}
                majors={majors}
                selected_majors={selected_majors}
            />
        </AppLayout>
    );
}
