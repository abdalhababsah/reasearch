import { Head, usePage } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import ResearcherProfileForm, {
    type ResearcherProfileData,
} from '@/features/researcher/researcher-profile-form';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Researcher Profile',
        href: '/settings/profile',
    },
];

export default function ResearcherProfile() {
    const { props } = usePage<SharedData & ResearcherProfileData>();
    const { profile, experiences, educations, majors, selected_majors } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Researcher Profile" />
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
