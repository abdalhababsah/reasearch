import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, Search, Filter, Calendar, User, Eye, Download, 
  ArrowRight, Sparkles, TrendingUp, X, ChevronRight
} from 'lucide-react';
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const [localSearch, setLocalSearch] = useState(filters.search);

  const handleFilter = (key: string, value: string) => {
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

  const clearFilters = () => {
    setLocalSearch('');
    router.get('/researches');
  };

  const getCategoryName = (category: Category) => {
    return locale === 'ar' ? category.name_ar : category.name_en;
  };

  const currentCategory = filters.category || 'all';
  const currentYear = filters.year || 'all';
  const currentSort = filters.sort || 'latest';

  const hasActiveFilters = filters.search || filters.category || filters.year;

  // Card animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }),
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <HomeLayout isAuthenticated={isAuthenticated} title={t('researches.title', { defaultValue: 'Browse Research' })}>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background py-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-6 py-2 text-sm font-semibold text-primary"
            >
              <Sparkles className="h-4 w-4" />
              {t('researches.browse.badge', { defaultValue: 'Explore Research' })}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4 text-5xl font-bold lg:text-6xl"
            >
              {t('researches.browse.heading', { defaultValue: 'Browse Research Papers' })}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10 text-xl text-muted-foreground"
            >
              {t('researches.browse.subheading', { 
                defaultValue: 'Discover groundbreaking research from leading researchers worldwide' 
              })}
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearch}
              className="flex gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('researches.search.placeholder', { defaultValue: 'Search by title, keywords, or abstract...' })}
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="h-14 rounded-2xl border-2 border-primary/10 pl-12 text-base transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button type="submit" size="lg" className="h-14 rounded-2xl px-8 text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/50">
                  <Search className="mr-2 h-5 w-5" />
                  {t('actions.search', { defaultValue: 'Search' })}
                </Button>
              </motion.div>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 rounded-2xl border-2 border-primary/10 bg-muted/30 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold">{t('actions.filter', { defaultValue: 'Filter' })}:</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Select value={currentCategory} onValueChange={(value) => handleFilter('category', value)}>
                <SelectTrigger className="w-[220px] rounded-xl border-2 border-primary/10 h-12">
                  <SelectValue placeholder={t('categories.all', { defaultValue: 'All Categories' })} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">{t('categories.all', { defaultValue: 'All Categories' })}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {getCategoryName(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={currentYear} onValueChange={(value) => handleFilter('year', value)}>
                <SelectTrigger className="w-[180px] rounded-xl border-2 border-primary/10 h-12">
                  <SelectValue placeholder={t('filters.allYears', { defaultValue: 'All Years' })} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">{t('filters.allYears', { defaultValue: 'All Years' })}</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={currentSort} onValueChange={(value) => handleFilter('sort', value)}>
                <SelectTrigger className="w-[200px] rounded-xl border-2 border-primary/10 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="latest">{t('sort.latest', { defaultValue: 'Latest' })}</SelectItem>
                  <SelectItem value="oldest">{t('sort.oldest', { defaultValue: 'Oldest' })}</SelectItem>
                  <SelectItem value="title_asc">{t('sort.titleAsc', { defaultValue: 'Title (A-Z)' })}</SelectItem>
                  <SelectItem value="title_desc">{t('sort.titleDesc', { defaultValue: 'Title (Z-A)' })}</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-12 rounded-xl border-2 border-red-200 bg-red-50 px-6 font-semibold text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:hover:bg-red-900"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t('actions.clearFilters', { defaultValue: 'Clear Filters' })}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Results Count & Active Filters Display */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-semibold"
            >
              {t('researches.resultsCount', { 
                defaultValue: `Showing ${researches.data.length} results`,
                count: researches.data.length 
              })}
            </motion.div>

            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-wrap gap-2"
              >
                {filters.search && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    <Search className="mr-2 h-3 w-3" />
                    {filters.search}
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    {categories.find(c => c.id.toString() === filters.category) && 
                      getCategoryName(categories.find(c => c.id.toString() === filters.category)!)}
                  </Badge>
                )}
                {filters.year && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    <Calendar className="mr-2 h-3 w-3" />
                    {filters.year}
                  </Badge>
                )}
              </motion.div>
            )}
          </div>

          {/* Research Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {researches.data.map((research, i) => (
              <motion.div
                key={research.id}
                custom={i}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                variants={cardVariants}
                onHoverStart={() => setHoveredCard(research.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Link href={`/researches/${research.id}`}>
                  <div className="group h-full overflow-hidden rounded-3xl border-2 border-primary/10 bg-background shadow-lg transition-all hover:border-primary/30 hover:shadow-2xl">
                    {/* Image */}
                    {research.wallpaper_url ? (
                      <div className="relative h-56 overflow-hidden">
                        <motion.img
                          variants={imageVariants}
                          src={research.wallpaper_url}
                          alt={research.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Categories on Image */}
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          {research.categories.slice(0, 2).map((cat) => (
                            <Badge key={cat.id} className="bg-white/90 text-black text-xs font-bold backdrop-blur-sm hover:bg-white">
                              {getCategoryName(cat)}
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                       
                      </div>
                    ) : (
                      <div className="relative h-56 bg-gradient-to-br from-primary/20 to-primary/5">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-primary/40" />
                        </div>
                        {/* Categories on Placeholder */}
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          {research.categories.slice(0, 2).map((cat) => (
                            <Badge key={cat.id} variant="secondary" className="text-xs font-bold">
                              {getCategoryName(cat)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold line-clamp-2 transition-colors group-hover:text-primary">
                        {research.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {research.abstract}
                      </p>

                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4 text-primary" />
                          <span className="truncate font-medium">{research.author.name}</span>
                        </div>
                        
                        {research.author.institution && (
                          <div className="text-xs text-muted-foreground truncate">
                            {research.author.institution}
                          </div>
                        )}

                        {research.published_at && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(research.published_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 text-sm font-semibold text-primary">
                        <span>{t('actions.readMore', { defaultValue: 'Read more' })}</span>
                        <motion.div
                          animate={{ x: hoveredCard === research.id ? 5 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {researches.data.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-24 text-center"
            >
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">
                {t('researches.empty.title', { defaultValue: 'No research papers found' })}
              </h3>
              <p className="mb-8 text-lg text-muted-foreground">
                {t('researches.empty.description', { defaultValue: 'Try adjusting your search or filters' })}
              </p>
              {hasActiveFilters && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={clearFilters} size="lg" className="rounded-full">
                    <X className="mr-2 h-5 w-5" />
                    {t('actions.clearFilters', { defaultValue: 'Clear Filters' })}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Pagination */}
          {researches.last_page > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 flex justify-center gap-2"
            >
              {researches.links.map((link, index) => {
                const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                const isNumber = !isPrev && !isNext;

                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: link.url ? 1.05 : 1 }}
                    whileTap={{ scale: link.url ? 0.95 : 1 }}
                  >
                    <Button
                      variant={link.active ? 'default' : 'outline'}
                      size={isNumber ? 'default' : 'lg'}
                      disabled={!link.url}
                      onClick={() => link.url && router.visit(link.url)}
                      className={`rounded-xl ${link.active ? 'shadow-lg shadow-primary/50' : ''} ${isNumber ? 'min-w-[44px]' : ''}`}
                    >
                      {isPrev && <ChevronRight className="h-5 w-5 rotate-180" />}
                      {isNumber && <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                      {isNext && <ChevronRight className="h-5 w-5" />}
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </HomeLayout>
  );
}