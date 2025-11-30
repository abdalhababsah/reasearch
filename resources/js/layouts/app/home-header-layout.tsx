// home-header-layout.tsx
import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, User, LogOut, Settings, FileText, 
  Users, Mail, ChevronDown, Globe, X, Sparkles,
  LayoutDashboard, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';

type HomeHeaderLayoutProps = {
  isAuthenticated: boolean;
  canRegister?: boolean;
};

export default function HomeHeaderLayout({ isAuthenticated, canRegister = true }: HomeHeaderLayoutProps) {
  const { t, locale } = useTranslation();
  const { url } = usePage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigationItems = [
    {
      label: t('nav.home', { defaultValue: 'Home' }),
      href: '/',
    },
    {
      label: t('nav.researches', { defaultValue: 'Research' }),
      href: '/researches',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: t('nav.researchers', { defaultValue: 'Researchers' }),
      href: '/researchers',
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: t('nav.contact', { defaultValue: 'Contact' }),
      href: '/contact',
      icon: <Mail className="h-4 w-4" />,
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return url === '/';
    }
    return url.startsWith(href);
  };

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    router.post('/language', { locale: newLocale }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className=" top-0 z-50 "
      >
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center transition-transform hover:scale-105">
              <img
                src="/logo-large.png"
                alt={t('nav.platform', { defaultValue: 'Research platform logo' })}
                className="h-16 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-2 lg:flex">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group"
                >
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                      isActiveRoute(item.href)
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                  {isActiveRoute(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-3 lg:flex">
              {/* Language Switcher */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary/20 font-semibold transition-all hover:border-primary hover:bg-primary/5"
              >
                <span className="text-xs uppercase">{locale}</span>
              </motion.button>

              {isAuthenticated ? (
                <>
                  {/* User Dropdown */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 rounded-xl border-2 border-primary/20 px-4 py-2 font-semibold transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <User className="h-4 w-4" />
                      <span>{t('nav.account', { defaultValue: 'Account' })}</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        userMenuOpen && "rotate-180"
                      )} />
                    </motion.button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setUserMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border-2 border-primary/20 bg-background shadow-2xl"
                          >
                            <div className="bg-gradient-to-br from-primary/5 to-transparent p-4">
                              <div className="text-sm font-semibold">{t('nav.myAccount', { defaultValue: 'My Account' })}</div>
                            </div>
                            <div className="p-2">
                              {[
                                { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard.title', { defaultValue: 'Dashboard' }) },
                                { href: '/researcher/researches', icon: FileText, label: t('researches.my', { defaultValue: 'My Research' }) },
                                { href: '/profile', icon: Settings, label: t('profile.settings', { defaultValue: 'Settings' }) },
                              ].map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10"
                                >
                                  <item.icon className="h-4 w-4" />
                                  {item.label}
                                </Link>
                              ))}
                              <div className="my-2 h-px bg-border" />
                              <Link
                                href="/logout"
                                method="post"
                                as="button"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <LogOut className="h-4 w-4" />
                                {t('actions.logout', { defaultValue: 'Log out' })}
                              </Link>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Create Research Button */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/researcher/researches/create"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-primary/50"
                    >
                      <Plus className="h-4 w-4" />
                      {t('researches.create', { defaultValue: 'Create Research' })}
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/login"
                      className="rounded-xl border-2 border-primary/20 px-6 py-2.5 font-semibold transition-all hover:border-primary hover:bg-primary/5"
                    >
                      {t('actions.login', { defaultValue: 'Log in' })}
                    </Link>
                  </motion.div>
                  {canRegister && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/register"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-primary/50"
                      >
                        <Sparkles className="h-4 w-4" />
                        {t('actions.getStarted', { defaultValue: 'Get Started' })}
                      </Link>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary/20 font-semibold"
              >
                <span className="text-xs uppercase">{locale}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary/20"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 z-50 h-full w-[85%] max-w-sm overflow-y-auto bg-background shadow-2xl lg:hidden"
            >
              <div className="p-6">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">Menu</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="mb-6 space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all',
                        isActiveRoute(item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="my-6 h-px bg-border" />

                {/* User Actions */}
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {[
                      { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard.title', { defaultValue: 'Dashboard' }) },
                      { href: '/researcher/researches', icon: FileText, label: t('researches.my', { defaultValue: 'My Research' }) },
                      { href: '/profile', icon: Settings, label: t('profile.settings', { defaultValue: 'Settings' }) },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all hover:bg-muted"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}

                    <div className="my-4 h-px bg-border" />

                    <Link
                      href="/researcher/researches/create"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white"
                    >
                      <Plus className="h-5 w-5" />
                      {t('researches.create', { defaultValue: 'Create Research' })}
                    </Link>

                    <Link
                      href="/logout"
                      method="post"
                      as="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-6 py-3 font-semibold text-red-600 dark:bg-red-950"
                    >
                      <LogOut className="h-5 w-5" />
                      {t('actions.logout', { defaultValue: 'Log out' })}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl border-2 border-primary/20 px-6 py-3 font-semibold"
                    >
                      {t('actions.login', { defaultValue: 'Log in' })}
                    </Link>
                    {canRegister && (
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white"
                      >
                        <Sparkles className="h-4 w-4" />
                        {t('actions.getStarted', { defaultValue: 'Get Started' })}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}