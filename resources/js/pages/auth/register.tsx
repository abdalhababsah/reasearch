import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from '@/i18n';

export default function Register() {
    const { t } = useTranslation();

    return (
        <AuthLayout
            title={t('auth.register.title', { defaultValue: 'Create an account' })}
            description={t('auth.register.description', {
                defaultValue: 'Enter your details below to create your account',
            })}
        >
            <Head title={t('auth.register.headTitle', { defaultValue: 'Register' })} />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {t('auth.register.name', { defaultValue: 'Name' })}
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder={t('auth.register.namePlaceholder', {
                                        defaultValue: 'Full name',
                                    })}
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('auth.register.email', { defaultValue: 'Email address' })}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder={t('auth.register.emailPlaceholder', {
                                        defaultValue: 'email@example.com',
                                    })}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t('auth.register.password', { defaultValue: 'Password' })}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder={t('auth.register.passwordPlaceholder', {
                                        defaultValue: 'Password',
                                    })}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t('auth.register.passwordConfirm', {
                                        defaultValue: 'Confirm password',
                                    })}
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder={t('auth.register.passwordConfirmPlaceholder', {
                                        defaultValue: 'Confirm password',
                                    })}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {t('auth.register.submit', { defaultValue: 'Create account' })}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            {t('auth.register.haveAccount', {
                                defaultValue: 'Already have an account?',
                            })}{' '}
                            <TextLink href={login()} tabIndex={6}>
                                {t('actions.login')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
