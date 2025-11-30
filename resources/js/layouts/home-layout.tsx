// home-layout.tsx (updated)
import { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/i18n';
import HomeHeaderLayout from '@/layouts/app/home-header-layout';
import HomeFooterLayout from '@/layouts/app/home-footer-layout';

type HomeLayoutProps = {
  children: ReactNode;
  title?: string;
  isAuthenticated?: boolean;
  canRegister?: boolean;
};

export default function HomeLayout({ 
  children, 
  title,
  isAuthenticated = false,
  canRegister = true 
}: HomeLayoutProps) {
  const { t, locale } = useTranslation();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const pageTitle = title || t('nav.platform', { defaultValue: 'Research Platform' });

  return (
    <>
      <Head title={pageTitle} />
      <div dir={dir} className="min-h-screen bg-background">
        <HomeHeaderLayout isAuthenticated={isAuthenticated} canRegister={canRegister} />
        <main className="relative">{children}</main>
        <HomeFooterLayout />
      </div>
    </>
  );
}