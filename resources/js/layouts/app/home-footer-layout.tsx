// home-footer-layout.tsx
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Github, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';

export default function HomeFooterLayout() {
  const { t } = useTranslation();

  const footerLinks = {
    platform: [
      { label: t('nav.features', { defaultValue: 'Features' }), href: '/#features' },
      { label: t('footer.pricing', { defaultValue: 'Pricing' }), href: '/pricing' },
      { label: t('footer.api', { defaultValue: 'API' }), href: '/api' },
      { label: t('footer.documentation', { defaultValue: 'Documentation' }), href: '/docs' },
    ],
    resources: [
      { label: t('footer.blog', { defaultValue: 'Blog' }), href: '/blog' },
      { label: t('footer.guidelines', { defaultValue: 'Guidelines' }), href: '/guidelines' },
      { label: t('footer.helpCenter', { defaultValue: 'Help Center' }), href: '/help' },
      { label: t('footer.community', { defaultValue: 'Community' }), href: '/community' },
    ],
    company: [
      { label: t('footer.about', { defaultValue: 'About' }), href: '/about' },
      { label: t('footer.careers', { defaultValue: 'Careers' }), href: '/careers' },
      { label: t('footer.contact', { defaultValue: 'Contact' }), href: '/contact' },
      { label: t('footer.privacy', { defaultValue: 'Privacy' }), href: '/privacy' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className="relative overflow-hidden border-t bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      <div className="container relative z-10 mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-24 w-24 items-center justify-center ">
                  <AppLogoIcon />
                </div>
                <span className="text-2xl font-bold">
                  {t('nav.platform', { defaultValue: 'ResearchHub' })}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                {t('footer.description', { 
                  defaultValue: 'Empowering researchers to share knowledge and collaborate globally. Join thousands of researchers making an impact.' 
                })}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <a href="mailto:support@researchhub.com" className="hover:text-primary transition-colors">
                    support@researchhub.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <a href="tel:+1234567890" className="hover:text-primary transition-colors">
                    +1 (234) 567-890
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span>123 Research Blvd, Science City</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">
                {t(`footer.${category}`, { defaultValue: category })}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    
                      <a href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="mb-3 text-2xl font-bold">
              {t('footer.newsletterHeading', { defaultValue: 'Stay Updated' })}
            </h3>
            <p className="mb-6 text-muted-foreground">
              {t('footer.newsletterSubheading', {
                defaultValue: 'Get the latest research insights and platform updates delivered to your inbox.',
              })}
            </p>
            <form className="flex gap-3">
              <input
                type="email"
                placeholder={t('footer.newsletterPlaceholder', { defaultValue: 'Enter your email' })}
                className="flex-1 rounded-xl border-2 border-primary/20 bg-background px-6 py-3 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-primary/50"
              >
                {t('footer.newsletterCta', { defaultValue: 'Subscribe' })}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { defaultValue: '© 2024 ResearchHub. All rights reserved.' })}
          </p>

          {/* Social Links */}
          <div className="flex gap-3">
            {socialLinks.map((social, i) => (
              <motion.a
                key={social.label}
                href={social.href}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary/20 transition-all hover:border-primary hover:bg-primary hover:text-white"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
