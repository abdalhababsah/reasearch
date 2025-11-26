import AppLogoIcon from '@/components/app-logo-icon';
import { useTranslation } from '@/i18n';

export default function HomeFooterLayout() {
  const { t } = useTranslation();

  return (
    <footer className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <AppLogoIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">
                {/* {t('nav.platform', { defaultValue: 'ResearchHub' })} */}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.description', { 
                defaultValue: 'Empowering researchers to share knowledge and collaborate globally.' 
              })}
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-4 font-semibold">
              {t('footer.platform', { defaultValue: 'Platform' })}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-primary">
                  {t('nav.features', { defaultValue: 'Features' })}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.pricing', { defaultValue: 'Pricing' })}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.api', { defaultValue: 'API' })}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.documentation', { defaultValue: 'Documentation' })}
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-semibold">
              {t('footer.resources', { defaultValue: 'Resources' })}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.blog', { defaultValue: 'Blog' })}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.guidelines', { defaultValue: 'Guidelines' })}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.helpCenter', { defaultValue: 'Help Center' })}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.community', { defaultValue: 'Community' })}
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-semibold">
              {t('footer.company', { defaultValue: 'Company' })}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.about', { defaultValue: 'About' })}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.careers', { defaultValue: 'Careers' })}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.contact', { defaultValue: 'Contact' })}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t('footer.privacy', { defaultValue: 'Privacy' })}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>{t('footer.copyright', { defaultValue: '© 2024 ResearchHub. All rights reserved.' })}</p>
        </div>
      </div>
    </footer>
  );
}