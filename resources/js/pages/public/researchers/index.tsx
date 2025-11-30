import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Users, Search, Building2, FileText, ArrowRight, Filter, Sparkles, MapPin, GraduationCap, Star, TrendingUp, ChevronRight } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import publicRoutes from '@/routes/public';
import CtaSection from '@/components/CtaSection';

type Researcher = {
  id: number;
  name: string;
  email: string;
  institution: string | null;
  headline: string | null;
  bio: string | null;
  papers_count: number;
  profile_image?: string | null;
  field?: string | null;
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.9,
    },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }),
    hover: {
      y: -12,
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
    <HomeLayout isAuthenticated={isAuthenticated} title={t('researchers.title', { defaultValue: 'Researchers' })}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        
        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t('researchers.heroBadge', { defaultValue: 'Connect With Brilliant Minds' })}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 text-5xl font-bold lg:text-6xl xl:text-7xl"
            >
              {t('researchers.heroHeading', { defaultValue: 'Discover' })}{' '}
              <span className="text-primary">
                {t('researchers.heroHeadingHighlight', { defaultValue: 'Researchers' })}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12 text-xl text-muted-foreground lg:text-2xl"
            >
              {t('researchers.heroSubheading', {
                defaultValue: 'Explore profiles of leading researchers and their groundbreaking contributions to science',
              })}
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSearch}
              className="mx-auto flex max-w-2xl gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('researchers.search.placeholder', {
                    defaultValue: 'Search by name, institution, or field...'
                  })}
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full rounded-2xl border-2 border-primary/10 bg-background px-12 py-4 text-lg transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-primary/50"
              >
                <Search className="h-5 w-5" />
                {t('actions.search')}
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Users, label: t('researchers.stats.total', { defaultValue: 'Total Researchers' }), value: researchers.data.length + '+' },
              { icon: FileText, label: t('researchers.stats.publications', { defaultValue: 'Publications' }), value: '45K+' },
              { icon: Building2, label: t('researchers.stats.institutions', { defaultValue: 'Institutions' }), value: '500+' },
              { icon: TrendingUp, label: t('researchers.stats.active', { defaultValue: 'Active Today' }), value: '2.4K' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Researchers Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex items-center justify-between"
          >
            <div>
              <h2 className="text-3xl font-bold">
                {localSearch
                  ? t('researchers.results.searchTitle', { defaultValue: 'Search Results' })
                  : t('researchers.results.allTitle', { defaultValue: 'All Researchers' })}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t('researchers.results.count', {
                  count: researchers.data.length,
                  defaultValue: 'Showing :count researcher',
                }).replace(':count', String(researchers.data.length))}
              </p>
            </div>
            
          </motion.div>

          {/* Researchers Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {researchers.data.map((researcher, i) => (
              <motion.div
                key={researcher.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, margin: "-100px" }}
                variants={cardVariants}
                onHoverStart={() => setHoveredCard(researcher.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group"
              >
                <Link href={publicRoutes.researchers.show(researcher.id).url}>
                  <div className="overflow-hidden rounded-3xl bg-background shadow-lg transition-all hover:shadow-2xl">
                    {/* Profile Image/Avatar */}
                    <div className="relative h-64 overflow-hidden">
                      {researcher.profile_image ? (
                        <motion.img
                          variants={imageVariants}
                          src={researcher.profile_image}
                          alt={researcher.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/70">
                          <span className="text-6xl font-bold text-white">
                            {getInitials(researcher.name)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Papers Count Badge */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05 + 0.3 }}
                        className="absolute right-4 top-4"
                      >
                        <div className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm dark:text-primary">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-bold">{researcher.papers_count}</span>
                        </div>
                      </motion.div>

                      {/* Featured Badge (for researchers with many papers) */}
                      {researcher.papers_count > 10 && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.05 + 0.4 }}
                          className="absolute left-4 top-4"
                        >
                          <div className="flex items-center gap-1 rounded-full bg-yellow-500/90 px-3 py-1.5 backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-white text-white" />
                            <span className="text-xs font-bold text-white">
                              {t('researchers.featured', { defaultValue: 'Featured' })}
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {/* Name Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <motion.h3
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 + 0.4 }}
                          className="mb-1 text-2xl font-bold text-white line-clamp-1"
                        >
                          {researcher.name}
                        </motion.h3>
                        {researcher.headline && (
                          <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 + 0.5 }}
                            className="text-sm font-semibold text-white/90 line-clamp-1"
                          >
                            {researcher.headline}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      {/* Institution */}
                      {researcher.institution && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 + 0.6 }}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-2">{researcher.institution}</span>
                        </motion.div>
                      )}

                      {/* Field */}
                      {researcher.field && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 + 0.7 }}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <GraduationCap className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{researcher.field}</span>
                        </motion.div>
                      )}

                      {/* Bio */}
                      {researcher.bio && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 + 0.8 }}
                          className="text-sm text-muted-foreground line-clamp-2"
                        >
                          {researcher.bio}
                        </motion.p>
                      )}

                      {/* View Profile Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 + 0.9 }}
                        className="flex items-center justify-between pt-2 border-t"
                      >
                        <span className="text-sm font-semibold text-primary">
                          {t('actions.viewProfile')}
                        </span>
                        <motion.div
                          animate={{ x: hoveredCard === researcher.id ? 5 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronRight className="h-5 w-5 text-primary" />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Decorative Corner */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.05 + 1, type: "spring" }}
                      className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {researchers.data.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">
                {t('researchers.empty.title', { defaultValue: 'No Researchers Found' })}
              </h3>
              <p className="mb-6 text-muted-foreground">
                {t('researchers.empty.description', {
                  defaultValue: 'Try adjusting your search or browse all researchers',
                })}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setLocalSearch('');
                  router.get(publicRoutes.researchers.index().url, {}, { preserveState: true });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                {t('researchers.clearSearch', { defaultValue: 'Clear Search' })}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          )}

          {/* Pagination */}
          {researchers.last_page > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 flex justify-center gap-2"
            >
              {researchers.links.map((link, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: link.url ? 1.05 : 1 }}
                  whileTap={{ scale: link.url ? 0.95 : 1 }}
                  disabled={!link.url}
                  onClick={() => link.url && router.visit(link.url)}
                  className={`rounded-xl px-4 py-2 font-semibold transition-all ${
                    link.active
                      ? 'bg-primary text-white shadow-lg'
                      : link.url
                      ? 'border-2 border-primary/20 hover:border-primary hover:bg-primary/5'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection />
    </HomeLayout>
  );
}
