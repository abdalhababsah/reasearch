import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Building2, Mail, Globe, ExternalLink, 
  Calendar, GraduationCap, Briefcase, FileText, User 
} from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

type Researcher = {
  id: number;
  name: string;
  email: string;
  profile: {
    institution: string | null;
    headline: string | null;
    bio: string | null;
    website: string | null;
    orcid: string | null;
    google_scholar: string | null;
    linkedin: string | null;
    twitter: string | null;
    experiences: Array<{
      id: number;
      title: string;
      company: string;
      location: string | null;
      start_date: string;
      end_date: string | null;
      is_current: boolean;
      description: string | null;
    }>;
    educations: Array<{
      id: number;
      degree: string;
      field: string;
      institution: string;
      location: string | null;
      start_date: string;
      end_date: string | null;
      description: string | null;
    }>;
    majors: Array<{ id: number; name_en: string; name_ar: string }>;
  } | null;
};

type Research = {
  id: number;
  title: string;
  abstract: string;
  categories: Array<{ id: number; name_en: string; name_ar: string }>;
  tags: Array<{ id: number; name_en: string; name_ar: string }>;
  wallpaper_url: string | null;
  published_at: string | null;
  year: number | null;
};

type PageProps = {
  researcher: Researcher;
  researches: Research[];
};

export default function ResearcherShow() {
  const { auth, researcher, researches } = usePage<SharedData & PageProps>().props;
  const { t, locale } = useTranslation();
  const isAuthenticated = Boolean(auth.user);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryName = (category: { name_en: string; name_ar: string }) => {
    return locale === 'ar' ? category.name_ar : category.name_en;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <HomeLayout isAuthenticated={isAuthenticated} title={researcher.name}>
      <article className="py-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href={route('public.researchers.index')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('actions.back', { defaultValue: 'Back to Researchers' })}
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-3xl font-bold text-primary-foreground">
                    {getInitials(researcher.name)}
                  </div>
                  <CardTitle className="text-2xl">{researcher.name}</CardTitle>
                  {researcher.profile?.headline && (
                    <CardDescription className="text-base">
                      {researcher.profile.headline}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {researcher.profile?.institution && (
                    <div className="flex items-start gap-2 text-sm">
                      <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span>{researcher.profile.institution}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${researcher.email}`} className="hover:text-primary">
                      {researcher.email}
                    </a>
                  </div>

                  {researcher.profile?.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      
                      <a href={researcher.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                     >
                        {t('researcher.website', { defaultValue: 'Website' })}
                      </a>
                    </div>
                  )}

                  <Separator />

                  {/* Social Links */}
                  <div className="space-y-2">
                    {researcher.profile?.orcid && (
                      <Button asChild variant="outline" size="sm" className="w-full justify-start">
                        
                         <a href={`https://orcid.org/${researcher.profile.orcid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          ORCID
                        </a>
                      </Button>
                    )}
                    {researcher.profile?.google_scholar && (
                      <Button asChild variant="outline" size="sm" className="w-full justify-start">
                        
                       <a   href={researcher.profile.google_scholar}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Google Scholar
                        </a>
                      </Button>
                    )}
                    {researcher.profile?.linkedin && (
                      <Button asChild variant="outline" size="sm" className="w-full justify-start">
                        
                        <a  href={researcher.profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Research Fields */}
                  {researcher.profile && researcher.profile.majors.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-2 font-semibold text-sm">
                          {t('researcher.fields', { defaultValue: 'Research Fields' })}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {researcher.profile.majors.map((major) => (
                            <Badge key={major.id} variant="secondary">
                              {locale === 'ar' ? major.name_ar : major.name_en}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="about">
                    <User className="mr-2 h-4 w-4" />
                    {t('researcher.about', { defaultValue: 'About' })}
                  </TabsTrigger>
                  <TabsTrigger value="publications">
                    <FileText className="mr-2 h-4 w-4" />
                    {t('researcher.publications', { defaultValue: 'Publications' })} ({researches.length})
                  </TabsTrigger>
                </TabsList>

                {/* About Tab */}
                <TabsContent value="about" className="space-y-6">
                  {/* Bio */}
                  {researcher.profile?.bio && (
                    <section>
                      <h2 className="mb-4 text-2xl font-semibold">
                        {t('researcher.bio', { defaultValue: 'Biography' })}
                      </h2>
                      <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {researcher.profile.bio}
                      </p>
                    </section>
                  )}

                  {/* Experience */}
                  {researcher.profile && researcher.profile.experiences.length > 0 && (
                    <section>
                      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                        <Briefcase className="h-6 w-6" />
                        {t('researcher.experience', { defaultValue: 'Experience' })}
                      </h2>
                      <div className="space-y-4">
                        {researcher.profile.experiences.map((exp) => (
                          <Card key={exp.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{exp.title}</h3>
                                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                                  {exp.location && (
                                    <p className="text-sm text-muted-foreground">{exp.location}</p>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(exp.start_date)} -{' '}
                                  {exp.is_current
                                    ? t('time.present', { defaultValue: 'Present' })
                                    : exp.end_date
                                    ? formatDate(exp.end_date)
                                    : ''}
                                </div>
                              </div>
                              {exp.description && (
                                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                                  {exp.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Education */}
                  {researcher.profile && researcher.profile.educations.length > 0 && (
                    <section>
                      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                        <GraduationCap className="h-6 w-6" />
                        {t('researcher.education', { defaultValue: 'Education' })}
                      </h2>
                      <div className="space-y-4">
                        {researcher.profile.educations.map((edu) => (
                          <Card key={edu.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold">
                                    {edu.degree} in {edu.field}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                  {edu.location && (
                                    <p className="text-sm text-muted-foreground">{edu.location}</p>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(edu.start_date)} -{' '}
                                  {edu.end_date ? formatDate(edu.end_date) : ''}
                                </div>
                              </div>
                              {edu.description && (
                                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                                  {edu.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}
                </TabsContent>

                {/* Publications Tab */}
                <TabsContent value="publications">
                  {researches.length > 0 ? (
                    <div className="space-y-4">
                      {researches.map((research) => (
                        <Link key={research.id} href={route('public.researches.show', research.id)}>
                          <Card className="transition-all hover:shadow-lg">
                            <CardHeader>
                              <div className="mb-2 flex flex-wrap gap-2">
                                {research.categories.slice(0, 2).map((cat) => (
                                  <Badge key={cat.id} variant="secondary">
                                    {getCategoryName(cat)}
                                  </Badge>
                                ))}
                              </div>
                              <CardTitle className="hover:text-primary">{research.title}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {research.abstract}
                              </CardDescription>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {research.published_at
                                    ? new Date(research.published_at).toLocaleDateString()
                                    : research.year}
                                </span>
                              </div>
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <FileText className="mx-auto mb-4 h-12 w-12" />
                      <p>{t('researcher.noPublications', { defaultValue: 'No publications yet' })}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </article>
    </HomeLayout>
  );
}
