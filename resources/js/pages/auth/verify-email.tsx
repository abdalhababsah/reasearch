// Components
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';
import { useTranslation } from '@/i18n';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t, direction } = useTranslation();

    return (
        <AuthLayout
            title={t('auth.verify.title', { defaultValue: 'Verify email' })}
            description={t('auth.verify.description', {
                defaultValue:
                    'Please verify your email address by clicking on the link we just emailed to you.',
            })}
        >
            <Head title={t('auth.verify.headTitle', { defaultValue: 'Email verification' })} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {t('auth.verify.linkSent', {
                        defaultValue:
                            'A new verification link has been sent to the email address you provided during registration.',
                    })}
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            {t('auth.verify.resend', {
                                defaultValue: 'Resend verification email',
                            })}
                        </Button>

                        <TextLink
                            href={logout()}
                            className={`mx-auto block text-sm ${
                                direction === 'rtl' ? 'text-right' : 'text-left'
                            }`}
                        >
                            {t('actions.logout')}
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
