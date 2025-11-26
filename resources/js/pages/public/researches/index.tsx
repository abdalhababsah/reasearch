import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search, Filter, Calendar, User } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

type Category = {
  id: number;
  name_en: string;
  name_ar: string;
};

type Research = {
  id: number;
  title: string;
  abstract: string;
  author: {
    id: number;
    name: string;
    institution: string | null;
  };
  categories: Category[];
  tags: Array<{ id: number; name_en: string; name_ar: string }>;
  wallpaper_url: string | null;
  published_at: string | null;
  year: number | null;
};

type PageProps = {
  researches: {
    data: Research[];
    links: any[];
    current_page: number;
    last_page: number;
  };
  categories: Category[];
  years: number[];
  filters: {
    search: string;
    category: string;
    year: string;
    sort: string;
  };
};

export default function ResearchesIndex() {
  const { auth, researches, categories, years, filters } = usePage<SharedData & PageProps>().props;
  const { t, locale } = useTranslation();
  const isAuthenticated = Boolean(auth.user);

  const [localSearch, setLocalSearch] = useState(filters.search);

  const handleFilter = (key: string, value: string) => {
    // Convert "all" back to empty string for the backend
    const actualValue = value === 'all' ? '' : value;
    
    router.get(
      '/researches',
      { ...filters, [key]: actualValue },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilter('search', localSearch);
  };

  const getCategoryName = (category: Category) => {
    return locale === 'ar' ? category.name_ar : category.name_en;
  };

  // Convert empty string to "all" for Select component
  const currentCategory = filters.category || 'all';
  const currentYear = filters.year || 'all';
  const currentSort = filters.sort || 'latest';

  return (
    <HomeLayout isAuthenticated={isAuthenticated} title={t('researches.title', { defaultValue: 'Browse Research' })}>
      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold">
              {t('researches.browse.heading', { defaultValue: 'Browse Research Papers' })}
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              {t('researches.browse.subheading', { 
                defaultValue: 'Discover groundbreaking research from leading researchers worldwide' 
              })}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('researches.search.placeholder', { defaultValue: 'Search by title, keywords, or abstract...' })}
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

      {/* Filters & Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('actions.filter', { defaultValue: 'Filter' })}:</span>
            </div>

            <Select value={currentCategory} onValueChange={(value) => handleFilter('category', value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('categories.all', { defaultValue: 'All Categories' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('categories.all', { defaultValue: 'All Categories' })}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {getCategoryName(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentYear} onValueChange={(value) => handleFilter('year', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('filters.allYears', { defaultValue: 'All Years' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allYears', { defaultValue: 'All Years' })}</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentSort} onValueChange={(value) => handleFilter('sort', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">{t('sort.latest', { defaultValue: 'Latest' })}</SelectItem>
                <SelectItem value="oldest">{t('sort.oldest', { defaultValue: 'Oldest' })}</SelectItem>
                <SelectItem value="title_asc">{t('sort.titleAsc', { defaultValue: 'Title (A-Z)' })}</SelectItem>
                <SelectItem value="title_desc">{t('sort.titleDesc', { defaultValue: 'Title (Z-A)' })}</SelectItem>
              </SelectContent>
            </Select>

            {(filters.search || filters.category || filters.year) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.get('/researches')}
              >
                {t('actions.clearFilters', { defaultValue: 'Clear Filters' })}
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-muted-foreground">
            {t('researches.resultsCount', { 
              defaultValue: `Showing ${researches.data.length} results`,
              count: researches.data.length 
            })}
          </div>

          {/* Research Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {researches.data.map((research) => (
              <Link key={research.id} href={`/researches/${research.id}`}>
                <Card className="h-full transition-all hover:shadow-lg">
                  {research.wallpaper_url && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={research.wallpaper_url}
                        alt={research.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {research.categories.slice(0, 2).map((cat) => (
                        <Badge key={cat.id} variant="secondary" className="text-xs">
                          {getCategoryName(cat)}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="line-clamp-2 text-lg hover:text-primary">
                      {research.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {research.abstract}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="truncate">{research.author.name}</span>
                    </div>
                    {research.published_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(research.published_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-primary">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {t('actions.readMore', { defaultValue: 'Read more' })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {researches.data.length === 0 && (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                {t('researches.empty.title', { defaultValue: 'No research papers found' })}
              </h3>
              <p className="text-muted-foreground">
                {t('researches.empty.description', { defaultValue: 'Try adjusting your search or filters' })}
              </p>
            </div>
          )}

          {/* Pagination */}
          {researches.last_page > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {researches.links.map((link, index) => (
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