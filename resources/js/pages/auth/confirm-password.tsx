import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';
import { useTranslation } from '@/i18n';

export default function ConfirmPassword() {
    const { t } = useTranslation();

    return (
        <AuthLayout
            title={t('auth.confirmPassword.title', { defaultValue: 'Confirm your password' })}
            description={t('auth.confirmPassword.description', {
                defaultValue:
                    'This is a secure area of the application. Please confirm your password before continuing.',
            })}
        >
            <Head title={t('auth.confirmPassword.titleShort', { defaultValue: 'Confirm password' })} />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                {t('auth.confirmPassword.passwordLabel', { defaultValue: 'Password' })}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder={t('auth.confirmPassword.passwordPlaceholder', { defaultValue: 'Password' })}
                                autoComplete="current-password"
                                autoFocus
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                {t('auth.confirmPassword.submit', { defaultValue: 'Confirm password' })}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
