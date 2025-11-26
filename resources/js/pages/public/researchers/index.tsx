import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search, Building2, FileText, ArrowRight } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import publicRoutes from '@/routes/public';

type Researcher = {
  id: number;
  name: string;
  email: string;
  institution: string | null;
  headline: string | null;
  bio: string | null;
  papers_count: number;
};

type PageProps = {
  researchers: {
    data: Researcher[];
    links: any[];
    current_page: number;
    last_page: number;
  };
  filters: {
    search: string;
    field: string;
  };
};

export default function ResearchersIndex() {
  const { auth, researchers, filters } = usePage<SharedData & PageProps>().props;
  const { t } = useTranslation();
  const isAuthenticated = Boolean(auth.user);

  const [localSearch, setLocalSearch] = useState(filters.search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(publicRoutes.researchers.index().url, { search: localSearch }, { preserveState: true, preserveScroll: true });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <HomeLayout isAuthenticated={isAuthenticated} title={t('researchers.title', { defaultValue: 'Researchers' })}>
      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-bold">
              {t('researchers.browse.heading', { defaultValue: 'Discover Researchers' })}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              {t('researchers.browse.subheading', { 
                defaultValue: 'Connect with leading researchers and explore their groundbreaking work' 
              })}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('researchers.search.placeholder', { defaultValue: 'Search by name, institution, or field...' })}
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                {t('actions.search', { defaultValue: 'Search' })}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Researchers Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Count */}
          <div className="mb-6 text-sm text-muted-foreground">
            {t('researchers.resultsCount', { 
              defaultValue: `Showing ${researchers.data.length} researchers`,
              count: researchers.data.length 
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {researchers.data.map((researcher) => (
              <Card key={researcher.id} className="flex flex-col transition-all hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-2xl font-bold text-primary-foreground">
                    {getInitials(researcher.name)}
                  </div>
                  <CardTitle className="text-lg">{researcher.name}</CardTitle>
                  {researcher.headline && (
                    <CardDescription className="line-clamp-2">{researcher.headline}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {researcher.institution && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-2">{researcher.institution}</span>
                    </div>
                  )}

                  {researcher.bio && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">{researcher.bio}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {researcher.papers_count}{' '}
                      {t('researcher.papers', { defaultValue: 'Papers', count: researcher.papers_count })}
                    </span>
                  </div>

                  <Button asChild className="w-full" variant="outline" size="sm">
                    <Link href={publicRoutes.researchers.show(researcher.id).url}>
                      {t('researcher.viewProfile', { defaultValue: 'View Profile' })}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {researchers.data.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                {t('researchers.empty.title', { defaultValue: 'No researchers found' })}
              </h3>
              <p className="text-muted-foreground">
                {t('researchers.empty.description', { defaultValue: 'Try adjusting your search' })}
              </p>
            </div>
          )}

          {/* Pagination */}
          {researchers.last_page > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {researchers.links.map((link, index) => (
                <Button
                  key={index}
                  variant={link.active ? 'default' : 'outline'}
                  size="sm"
                  disabled={!link.url}
                  onClick={() => link.url && router.visit(link.url)}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </HomeLayout>
  );
}
