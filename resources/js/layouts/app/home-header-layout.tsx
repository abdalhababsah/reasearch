import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/i18n';
import { 
  Menu, User, LogOut, Settings, FileText, 
  Users, Mail, ChevronDown, Globe 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppLogoIcon from '@/components/app-logo-icon';

type HomeHeaderLayoutProps = {
  isAuthenticated: boolean;
  canRegister?: boolean;
};

export default function HomeHeaderLayout({ isAuthenticated, canRegister = true }: HomeHeaderLayoutProps) {
  const { t, locale } = useTranslation();
  const { url } = usePage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items
  const navigationItems = [
    {
      label: t('nav.home', { defaultValue: 'Home' }),
      href: '/',
      icon: null,
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

  // Check if current route is active
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return url === '/';
    }
    return url.startsWith(href);
  };

  // Language switcher
  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    router.post('/language', { locale: newLocale }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <img
            src="/logo-large.png"
            alt={t('nav.platform', { defaultValue: 'Research platform logo' })}
            className="h-16 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActiveRoute(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            <span className="uppercase">{locale}</span>
          </Button>

          {isAuthenticated ? (
            <>
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{t('nav.account', { defaultValue: 'Account' })}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {t('nav.myAccount', { defaultValue: 'My Account' })}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {t('dashboard.title', { defaultValue: 'Dashboard' })}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/researcher/researches" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('researches.my', { defaultValue: 'My Research' })}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('profile.settings', { defaultValue: 'Settings' })}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/logout"
                      method="post"
                      as="button"
                      className="w-full cursor-pointer text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('actions.logout', { defaultValue: 'Log out' })}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Create Research Button */}
              <Button asChild size="sm">
                <Link href="/researcher/researches/create">
                  {t('researches.create', { defaultValue: 'Create Research' })}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t('actions.login', { defaultValue: 'Log in' })}</Link>
              </Button>
              {canRegister && (
                <Button asChild size="sm">
                  <Link href="/register">{t('actions.getStarted', { defaultValue: 'Get Started' })}</Link>
                </Button>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Language Switcher (Mobile) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-9 w-9 p-0"
          >
            <Globe className="h-4 w-4" />
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t('nav.menu', { defaultValue: 'Menu' })}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <AppLogoIcon className="h-5 w-5 text-primary-foreground" />
                  </span>
                  {t('nav.platform', { defaultValue: 'ResearchHub' })}
                </SheetTitle> 
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-4">
                {/* Navigation Links */}
                <nav className="flex flex-col gap-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        isActiveRoute(item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <Separator />

                {/* User Actions */}
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" className="justify-start">
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        {t('dashboard.title', { defaultValue: 'Dashboard' })}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                      <Link href="/researcher/researches" onClick={() => setMobileMenuOpen(false)}>
                        <FileText className="mr-2 h-4 w-4" />
                        {t('researches.my', { defaultValue: 'My Research' })}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Settings className="mr-2 h-4 w-4" />
                        {t('profile.settings', { defaultValue: 'Settings' })}
                      </Link>
                    </Button>

                    <Separator />

                    <Button asChild>
                      <Link href="/researcher/researches/create" onClick={() => setMobileMenuOpen(false)}>
                        {t('researches.create', { defaultValue: 'Create Research' })}
                      </Link>
                    </Button>

                    <Button asChild variant="destructive">
                      <Link
                        href="/logout"
                        method="post"
                        as="button"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('actions.logout', { defaultValue: 'Log out' })}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        {t('actions.login', { defaultValue: 'Log in' })}
                      </Link>
                    </Button>
                    {canRegister && (
                      <Button asChild>
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                          {t('actions.getStarted', { defaultValue: 'Get Started' })}
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
