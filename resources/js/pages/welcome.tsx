import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Users, Award, TrendingUp, Search, ArrowRight, CheckCircle2, 
  Sparkles, Globe, Lock, Zap, BarChart3, FileText, Calendar 
} from 'lucide-react';
import { register } from '@/routes';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import HomeLayout from '@/layouts/home-layout';

type TopResearcher = {
  id: number;
  name: string | null;
  institution: string | null;
  field: string | null;
  papers: number;
};

type RecentResearch = {
  id: number;
  title: string | null;
  author: string | null;
  category: string | null;
  category_id: number | null;
  created_at: string | null;
};

type TopCategory = {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  researches_count: number;
};

type HomePageProps = {
  canRegister?: boolean;
  topResearchers: TopResearcher[];
  recentResearches: RecentResearch[];
  topCategories: TopCategory[];
};

export default function Welcome({ canRegister = true }: HomePageProps) {
  const { auth, topResearchers, recentResearches, topCategories } = usePage<SharedData & HomePageProps>().props;
  const { t, locale } = useTranslation();
  const [email, setEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

  const isAuthenticated = Boolean(auth.user);

  const primaryCtaHref = isAuthenticated ? '/researcher/researches' : register();
  const primaryCtaLabel = isAuthenticated
    ? t('researches.createButton')
    : t('actions.create', { defaultValue: 'Create account' });

  const features = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: t('features.publish.title', { defaultValue: 'Publish Research' }),
      description: t('features.publish.description', { defaultValue: 'Share your findings with a global academic community and get instant feedback' })
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: t('features.collaborate.title', { defaultValue: 'Collaborate' }),
      description: t('features.collaborate.description', { defaultValue: 'Connect with researchers worldwide and build interdisciplinary teams' })
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: t('features.track.title', { defaultValue: 'Track Impact' }),
      description: t('features.track.description', { defaultValue: 'Monitor citations, downloads, and engagement metrics in real-time' })
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: t('features.secure.title', { defaultValue: 'Secure Storage' }),
      description: t('features.secure.description', { defaultValue: 'Keep your drafts and data safe with enterprise-grade security' })
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: t('features.fast.title', { defaultValue: 'Fast Publishing' }),
      description: t('features.fast.description', { defaultValue: 'Streamlined peer review process gets your work published faster' })
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: t('features.global.title', { defaultValue: 'Global Reach' }),
      description: t('features.global.description', { defaultValue: 'Make your research accessible to readers in 150+ countries' })
    }
  ];

  const stats = [
    { value: "15K+", label: t('stats.researchers', { defaultValue: 'Active Researchers' }) },
    { value: "45K+", label: t('stats.papers', { defaultValue: 'Published Papers' }) },
    { value: "120+", label: t('stats.countries', { defaultValue: 'Countries' }) },
    { value: "98%", label: t('stats.satisfaction', { defaultValue: 'Satisfaction Rate' }) }
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('time.today', { defaultValue: 'Today' });
    if (diffDays === 1) return t('time.yesterday', { defaultValue: 'Yesterday' });
    if (diffDays < 7) return t('time.daysAgo', { defaultValue: `${diffDays} days ago`, count: diffDays });
    if (diffDays < 30) return t('time.weeksAgo', { defaultValue: `${Math.floor(diffDays / 7)} weeks ago`, count: Math.floor(diffDays / 7) });
    return date.toLocaleDateString();
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredResearches = selectedCategory === 'all' 
    ? recentResearches 
    : recentResearches.filter(paper => paper.category_id === selectedCategory);

  return (
    <HomeLayout isAuthenticated={isAuthenticated} canRegister={canRegister}>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b py-20 md:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          {/* Floating orbs */}
          <div className="absolute left-1/4 top-20 h-64 w-64 animate-pulse rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute right-1/4 top-40 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 h-80 w-80 animate-pulse rounded-full bg-primary/10 blur-3xl" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm shadow-sm backdrop-blur">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ring-2 ring-background"></div>
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 ring-2 ring-background"></div>
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 ring-2 ring-background"></div>
                </div>
                <span className="text-muted-foreground">
                  {t('hero.badge', { defaultValue: 'Join 15,000+ researchers' })}
                </span>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>

              <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                {t('hero.where', { defaultValue: 'Where' })}{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t('hero.ideas', { defaultValue: 'Ideas' })}
                  </span>
                  <span className="absolute -bottom-2 left-0 h-3 w-full bg-primary/20 blur-sm"></span>
                </span>{' '}
                {t('hero.become', { defaultValue: 'Become' })}{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t('hero.impact', { defaultValue: 'Impact' })}
                  </span>
                  <span className="absolute -bottom-2 left-0 h-3 w-full bg-primary/20 blur-sm"></span>
                </span>
              </h1>

              <p className="text-lg text-muted-foreground md:text-xl">
                {t('hero.description', { 
                  defaultValue: 'The next-generation platform for researchers to publish groundbreaking work, collaborate across borders, and accelerate scientific discovery.' 
                })}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="group relative overflow-hidden shadow-lg">
                  <Link href={primaryCtaHref}>
                    <span className="relative z-10 flex items-center">
                      {primaryCtaLabel}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary to-primary/80 transition-transform group-hover:scale-105"></div>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 shadow-sm">
                  <Link href={isAuthenticated ? '/researcher/researches' : '/explore'}>
                    <Search className="mr-2 h-4 w-4" />
                    {isAuthenticated ? t('researches.title') : t('actions.explore', { defaultValue: 'Explore Research' })}
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{t('hero.free', { defaultValue: 'No publishing fees' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{t('hero.openAccess', { defaultValue: 'Open access forever' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{t('hero.rapidReview', { defaultValue: 'Rapid peer review' })}</span>
                </div>
              </div>
            </div>

            {/* Right: Visual Element */}
            <div className="relative">
              <div className="relative z-10 grid gap-4">
                {/* Top Card */}
                <Card className="transform border-2 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {t('hero.recentPublication', { defaultValue: 'Recent Publication' })}
                      </CardTitle>
                      <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                        {t('researches.statuses.published', { defaultValue: 'Published' })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 rounded-full bg-primary/20"></div>
                      <div className="h-3 w-full rounded-full bg-muted"></div>
                      <div className="h-3 w-5/6 rounded-full bg-muted"></div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                      <div className="space-y-1">
                        <div className="h-2 w-24 rounded-full bg-muted"></div>
                        <div className="h-2 w-16 rounded-full bg-muted/60"></div>
                      </div>
                      <div className="ml-auto flex gap-1">
                        <Badge variant="secondary" className="h-5 text-xs">AI</Badge>
                        <Badge variant="secondary" className="h-5 text-xs">ML</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bottom Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="transform border shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">2.4K</div>
                          <div className="text-xs text-muted-foreground">
                            {t('stats.citations', { defaultValue: 'Citations' })}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="transform border shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">847</div>
                          <div className="text-xs text-muted-foreground">
                            {t('stats.collaborators', { defaultValue: 'Collaborators' })}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-4 border-primary/20 blur-sm"></div>
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full border-4 border-primary/10 blur-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mb-2 text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4" variant="outline">
              {t('nav.features', { defaultValue: 'Features' })}
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {t('features.heading', { defaultValue: 'Everything You Need to Succeed' })}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t('features.subheading', { 
                defaultValue: 'Powerful tools designed to streamline your research workflow from draft to publication' 
              })}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card key={i} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Researchers Section */}
      <section id="researchers" className="border-b bg-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4" variant="outline">
              <Users className="mr-1 h-3 w-3" />
              {t('researchers.badge', { defaultValue: 'Our Community' })}
            </Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {t('researchers.heading', { defaultValue: 'Meet Leading Researchers' })}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t('researchers.subheading', { 
                defaultValue: 'Connect with brilliant minds pushing the boundaries of knowledge' 
              })}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {topResearchers.map((researcher) => (
              <Card key={researcher.id} className="transition-all hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-2xl font-bold text-primary-foreground">
                    {getInitials(researcher.name)}
                  </div>
                  <CardTitle className="text-lg">{researcher.name || t('researcher.anonymous', { defaultValue: 'Anonymous' })}</CardTitle>
                  <CardDescription>{researcher.field || t('researcher.noField', { defaultValue: 'Field not specified' })}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground">
                    {researcher.institution || t('researcher.noInstitution', { defaultValue: 'Institution not specified' })}
                  </div>
                  <div className="flex justify-around text-center text-sm">
                    <div>
                      <div className="font-bold text-primary">{researcher.papers}</div>
                      <div className="text-xs text-muted-foreground">
                        {t('researcher.papers', { defaultValue: 'Papers' })}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    {t('researcher.viewProfile', { defaultValue: 'View Profile' })}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {topResearchers.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {t('researchers.empty', { defaultValue: 'No researchers to display yet' })}
            </div>
          )}
          {topResearchers.length > 0 && (
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg">
                {t('researchers.browseAll', { defaultValue: 'Browse All Researchers' })}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Recent Papers Section */}
      <section id="papers" className="border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4" variant="outline">
              <FileText className="mr-1 h-3 w-3" />
              {t('papers.badge', { defaultValue: 'Latest Research' })}
            </Badge>
            <h2 className="mb-2 text-3xl font-bold md:text-4xl">
              {t('papers.heading', { defaultValue: 'Recently Published' })}
            </h2>
            <p className="text-muted-foreground">
              {t('papers.subheading', { defaultValue: 'Discover cutting-edge research across all fields' })}
            </p>
          </div>

          <Tabs 
            value={selectedCategory.toString()} 
            onValueChange={(value) => setSelectedCategory(value === 'all' ? 'all' : parseInt(value))} 
            className="w-full"
          >
            <TabsList className="mb-8 flex flex-wrap justify-center">
              <TabsTrigger value="all">
                {t('categories.all', { defaultValue: 'All Fields' })}
              </TabsTrigger>
              {topCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id.toString()}>
                  {locale === 'ar' ? category.name_ar : category.name_en}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={selectedCategory.toString()} className="space-y-4">
              {filteredResearches.map((paper) => (
                <Card key={paper.id} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="mb-2 text-lg hover:cursor-pointer hover:text-primary">
                          {paper.title || t('papers.noTitle', { defaultValue: 'Untitled Research' })}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {paper.author || t('papers.noAuthor', { defaultValue: 'Unknown Author' })}
                          </span>
                          {paper.category && (
                            <Badge variant="secondary" className="text-xs">
                              {paper.category}
                            </Badge>
                          )}
                          <span className="flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {formatDate(paper.created_at)}
                          </span>
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {filteredResearches.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {t('papers.empty', { defaultValue: 'No research papers found in this category' })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {recentResearches.length > 0 && (
            <div className="mt-8 text-center">
              <Button size="lg">
                {t('papers.viewAll', { defaultValue: 'View All Papers' })}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {t('cta.heading', { defaultValue: 'Ready to Share Your Research?' })}
            </h2>
            <p className="mb-8 text-lg opacity-90">
              {t('cta.subheading', { 
                defaultValue: 'Join thousands of researchers making an impact. Publish your first paper for free today.' 
              })}
            </p>
            <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder={t('cta.emailPlaceholder', { defaultValue: 'Enter your email' })}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background text-foreground"
              />
              <Button asChild size="lg" variant="secondary" className="whitespace-nowrap">
                <Link href={register()}>
                  {t('cta.button', { defaultValue: 'Get Started' })}
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm opacity-75">
              {t('cta.note', { defaultValue: 'No credit card required • Free forever for researchers' })}
            </p>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}