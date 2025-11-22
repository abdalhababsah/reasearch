import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import ResearcherProfileForm, {
    type ResearcherProfileData,
} from '@/features/researcher/researcher-profile-form';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

const researcherTabItems = [
    { id: 'account', label: 'Account information' },
    { id: 'researcher', label: 'Researcher Details' },
] as const;

type ResearcherTabId = (typeof researcherTabItems)[number]['id'];

export default function Profile({
    mustVerifyEmail,
    status,
    researcherProfile,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    researcherProfile?: ResearcherProfileData | null;
}) {
    const { auth } = usePage<SharedData>().props;
    const [activeTab, setActiveTab] = useState<ResearcherTabId>('account');
    const hasResearcherProfile = Boolean(researcherProfile);

    const renderAccountForm = () => (
        <div className="space-y-6">
            <HeadingSmall
                title="Profile information"
                description="Update your name and email address"
            />

            <Form
                {...ProfileController.update.form()}
                options={{
                    preserveScroll: true,
                }}
                className="space-y-6"
            >
                {({ processing, recentlySuccessful, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>

                            <Input
                                id="first_name"
                                className="mt-1 block w-full"
                                defaultValue={auth.user.first_name}
                                name="first_name"
                                required
                                autoComplete="given-name"
                                placeholder="First name"
                            />

                            <InputError className="mt-2" message={errors.first_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>

                            <Input
                                id="last_name"
                                className="mt-1 block w-full"
                                defaultValue={auth.user.last_name}
                                name="last_name"
                                required
                                autoComplete="family-name"
                                placeholder="Last name"
                            />

                            <InputError className="mt-2" message={errors.last_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                defaultValue={auth.user.email}
                                name="email"
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} data-test="update-profile-button">
                                Save
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                {hasResearcherProfile ? (
                    <div className="flex flex-col gap-6 md:flex-row">
                        <aside className="md:w-48">
                            <nav className="flex flex-col space-y-2">
                                {researcherTabItems.map((tab) => (
                                    <Button
                                        key={tab.id}
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            'justify-start',
                                            activeTab === tab.id && 'bg-muted',
                                        )}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.label}
                                    </Button>
                                ))}
                            </nav>
                        </aside>

                        <div className="flex-1 space-y-10">
                            {activeTab === 'account' && renderAccountForm()}

                            {activeTab === 'researcher' && researcherProfile && (
                                <div className="space-y-6">
                                    <HeadingSmall
                                        title="Researcher profile"
                                        description="Share your background, experiences, and research areas."
                                    />

                                    <ResearcherProfileForm {...researcherProfile} />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    renderAccountForm()
                )}

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
