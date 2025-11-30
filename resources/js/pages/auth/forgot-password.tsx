// Components
import { login } from '@/routes';
import { email } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from '@/i18n';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t, direction } = useTranslation();

    return (
        <AuthLayout
            title={t('auth.forgot.title', { defaultValue: 'Forgot password' })}
            description={t('auth.forgot.description', {
                defaultValue: 'Enter your email to receive a password reset link',
            })}
        >
            <Head title={t('auth.forgot.headTitle', { defaultValue: 'Forgot password' })} />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('auth.forgot.email', { defaultValue: 'Email address' })}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder={t('auth.forgot.emailPlaceholder', {
                                        defaultValue: 'email@example.com',
                                    })}
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="w-full"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    {t('auth.forgot.submit', {
                                        defaultValue: 'Email password reset link',
                                    })}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div
                    className={`text-center text-sm text-muted-foreground ${
                        direction === 'rtl' ? 'space-x-reverse space-x-1' : 'space-x-1'
                    }`}
                >
                    <span>{t('auth.forgot.backPrompt', { defaultValue: 'Or, return to' })}</span>
                    <TextLink href={login()}>{t('auth.forgot.backLink', { defaultValue: 'log in' })}</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
