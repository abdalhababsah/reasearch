import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, Award, TrendingUp, Search, ArrowRight, CheckCircle2,
  Sparkles, Globe, Lock, Zap, BarChart3, FileText, Calendar, ExternalLink,
  ChevronRight, Star, Eye, Download, Brain, Rocket, Target, Lightbulb,
  Compass, Filter, Bookmark, Share2, MessageCircle, FileAudio,
} from 'lucide-react';
import { register } from '@/routes';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import HomeLayout from '@/layouts/home-layout';

// import the demo component
import AudioLabelingDemo from '@/pages/public/AudioLabelingDemo';

type TopResearcher = {
  id: number;
  name: string | null;
  institution: string | null;
  field: string | null;
  papers: number;
  profile_image: string | null;
};

type RecentResearch = {
  id: number;
  title: string | null;
  author: string | null;
  category: string | null;
  category_id: number | null;
  created_at: string | null;
  wallpaper_url?: string | null;
  abstract?: string | null;
  views?: number;
  downloads?: number;
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
  const { auth, topResearchers, recentResearches, topCategories } =
    usePage<SharedData & HomePageProps>().props;
  const { t, locale } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const isAuthenticated = Boolean(auth.user);

  const primaryCtaHref = isAuthenticated ? '/researcher/researches' : register();
  const primaryCtaLabel = isAuthenticated
    ? t('researches.createButton', { defaultValue: 'Create Research' })
    : t('hero.startPublishing', { defaultValue: 'Start Publishing' });

  const benefits = [
    {
      icon: Compass,
      title: t('benefits.discover.title', { defaultValue: 'Discover Breakthroughs' }),
      description: t('benefits.discover.description', {
        defaultValue:
          'Navigate through cutting-edge research across all disciplines with intelligent recommendations',
      }),
    },
    {
      icon: Filter,
      title: t('benefits.filter.title', { defaultValue: 'Smart Filtering' }),
      description: t('benefits.filter.description', {
        defaultValue: 'Find exactly what you need with advanced search and category filters',
      }),
    },
    {
      icon: Bookmark,
      title: t('benefits.save.title', { defaultValue: 'Save & Organize' }),
      description: t('benefits.save.description', {
        defaultValue: 'Build your personal library of research that matters to you',
      }),
    },
    {
      icon: Share2,
      title: t('benefits.share.title', { defaultValue: 'Share Insights' }),
      description: t('benefits.share.description', {
        defaultValue:
          'Connect with the global research community and exchange ideas',
      }),
    },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('time.today', { defaultValue: 'Today' });
    if (diffDays === 1) return t('time.yesterday', { defaultValue: 'Yesterday' });
    if (diffDays < 7)
      return t('time.daysAgo', {
        defaultValue: `${diffDays} days ago`,
        count: diffDays,
      });
    if (diffDays < 30)
      return t('time.weeksAgo', {
        defaultValue: `${Math.floor(diffDays / 7)} weeks ago`,
        count: Math.floor(diffDays / 7),
      });
    return date.toLocaleDateString();
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredResearches =
    selectedCategory === 'all'
      ? recentResearches
      : recentResearches.filter((paper) => paper.category_id === selectedCategory);

  const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.9, rotateX: -15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
    hover: { y: -12, scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  const imageVariants = {
    hover: { scale: 1.15, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const overlayVariants = {
    hover: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <HomeLayout isAuthenticated={isAuthenticated} canRegister={canRegister}>
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-background">
        <div className="container mx-auto px-4 py-10">
          <div className="grid min-h-[calc(100vh-10rem)] items-center gap-12 lg:grid-cols-2">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {t('hero.badge', {
                    defaultValue: 'Discover Research That Shapes Tomorrow',
                  })}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl font-bold leading-tight lg:text-7xl xl:text-8xl"
              >
                {t('hero.navigate', { defaultValue: 'Navigate The' })}
                <br />
                <span className="text-primary">
                  {t('hero.futureOfScience', { defaultValue: 'Future of Science' })}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-muted-foreground lg:text-2xl"
              >
                {t('hero.description', {
                  defaultValue:
                    'Explore 45,000+ groundbreaking papers. Filter by field, track citations, and connect with researchers worldwide—all in one intelligent platform.',
                })}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href={primaryCtaHref}
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-primary/50"
                >
                  {primaryCtaLabel}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/researches"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 px-8 py-4 text-lg font-semibold transition-all hover:border-primary hover:bg-primary/5"
                >
                  <Compass className="h-5 w-5" />
                  {t('hero.startExploring', { defaultValue: 'Start Exploring' })}
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                {[
                  {
                    icon: Search,
                    text: t('hero.features.smartSearch', {
                      defaultValue: 'Smart search',
                    }),
                  },
                  {
                    icon: Filter,
                    text: t('hero.features.advancedFilters', {
                      defaultValue: 'Advanced filters',
                    }),
                  },
                  {
                    icon: Bookmark,
                    text: t('hero.features.saveFavorites', {
                      defaultValue: 'Save favorites',
                    }),
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                      <item.icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="relative aspect-square w-full">
                {/* Main large image */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="absolute right-0 top-0 h-[70%] w-[70%] overflow-hidden rounded-3xl shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=800&fit=crop"
                    alt="Research"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>

                {/* Small floating card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ y: -5 }}
                  className="absolute bottom-0 left-0 w-[60%] overflow-hidden rounded-2xl bg-background shadow-xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=300&fit=crop"
                    alt="Collaboration"
                    className="h-32 w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="mb-2 text-xs font-semibold text-primary">
                      {t('hero.trendingNow', { defaultValue: 'TRENDING NOW' })}
                    </div>
                    <div className="text-sm font-bold">
                      {t('hero.trendingTopic', {
                        defaultValue: 'AI in Medical Research',
                      })}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span>
                        {t('hero.mostDownloaded', {
                          defaultValue: 'Most Downloaded This Week',
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating badges */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                  className="absolute left-0 top-[20%] rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-900"
                >
                  <div className="text-3xl font-bold text-primary">45K+</div>
                  <div className="text-xs text-muted-foreground">
                    {t('stats.publications', { defaultValue: 'Publications' })}
                  </div>
                </motion.div>

      
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Labeling Demo */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <FileAudio className="h-10 w-10 text-primary" />
              <h2 className="text-4xl md:text-5xl font-bold">
                {t('audioCta.heading', {
                  defaultValue: 'Professional Labeling Suite',
                })}
              </h2>
            </div>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t('audioCta.subheading', {
                defaultValue:
                  'Experience our powerful audio segmentation tool directly in your browser. Annotate datasets with precision and ease.',
              })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <AudioLabelingDemo />
          </motion.div>

          <div className="mt-12 text-center">
            <Link
              href="/researcher/audios"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-primary/50"
            >
              <Rocket className="h-5 w-5" />
              {t('actions.startLabeling', {
                defaultValue: 'Start Your Own Project',
              })}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation Features */}
      {/* ... rest of your welcome.tsx stays exactly as before ... */}
      {/* (I kept everything after this point unchanged from your last version) */}

      {/* Navigation Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-5xl font-bold">
              {t('benefits.heading', { defaultValue: 'Find What Matters to You' })}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t('benefits.subheading', {
                defaultValue:
                  "Powerful tools to discover, filter, and navigate through the world's research",
              })}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-3xl border-2 border-primary/10 bg-background p-8 transition-all hover:border-primary/30 hover:shadow-2xl"
              >
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Research */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-primary/5 px-6 py-2 text-sm font-semibold text-primary"
            >
              <TrendingUp className="h-4 w-4" />
              {t('featured.badge', { defaultValue: 'Trending Research' })}
            </motion.div>
            <h2 className="mb-4 text-5xl font-bold">
              {t('featured.heading', { defaultValue: 'Explore Breakthrough Research' })}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t('featured.subheading', {
                defaultValue: 'Navigate through the latest discoveries shaping our world'
              })}
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {[{ id: 'all' as const, name: t('common.all', { defaultValue: 'All Research' }), count: recentResearches.length }, ...topCategories.map(cat => ({
              id: cat.id,
              name: locale === 'ar' ? cat.name_ar : cat.name_en,
              count: cat.researches_count
            }))].map((category, i) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`group relative overflow-hidden rounded-full px-6 py-3 font-semibold transition-all ${selectedCategory === category.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-background hover:bg-primary/10'
                  }`}
                type="button"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {category.name}
                  <span
                    className={`text-xs ${selectedCategory === category.id ? 'text-white/80' : 'text-muted-foreground'
                      }`}
                  >
                    ({category.count})
                  </span>
                </span>
                {selectedCategory === category.id && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-primary"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Research Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredResearches.map((paper, i) => (
              <motion.div
                key={paper.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, margin: '-100px' }}
                variants={cardVariants}
                onHoverStart={() => setHoveredCard(paper.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group perspective-1000"
              >
                <Link href={`/researches/${paper.id}`}>
                  <div className="relative overflow-hidden rounded-3xl bg-background shadow-lg transition-all duration-500 hover:shadow-2xl">
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <motion.div variants={imageVariants} className="h-full w-full">
                        {paper.wallpaper_url ? (
                          <img
                            src={paper.wallpaper_url}
                            alt={paper.title || ''}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="relative h-full w-full bg-gradient-to-br from-primary/20 to-primary/5">
                            <img
                              src={`https://images.unsplash.com/photo-${1500000000000 + (i * 100000000)}?w=800&h=600&fit=crop`}
                              alt={paper.title || ''}
                              className="h-full w-full object-cover opacity-50"
                            />
                          </div>
                        )}
                      </motion.div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Hover Overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        variants={overlayVariants}
                        className="absolute inset-0 bg-primary/90 flex items-center justify-center opacity-0"
                      >
                        <div className="text-center text-white space-y-4 p-6">
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                              <Search className="h-8 w-8" />
                            </div>
                          </motion.div>
                          <div className="font-semibold">
                            {t('featured.clickToExplore', { defaultValue: 'Click to Explore' })}
                          </div>
                          <div className="text-sm text-white/80">
                            {t('featured.viewFullPaper', { defaultValue: 'View full research paper' })}
                          </div>
                        </div>
                      </motion.div>

                      {/* Category Badge */}
                      {paper.category && (
                        <motion.div
                          initial={{ x: -100, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 + 0.3, type: 'spring' }}
                          className="absolute left-4 top-4"
                        >
                          <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold backdrop-blur-sm">
                            {paper.category}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.5 }}
                        className="text-xl font-bold line-clamp-2 transition-colors group-hover:text-primary"
                      >
                        {paper.title || t('papers.noTitle', { defaultValue: 'Untitled Research' })}
                      </motion.h3>

                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.6 }}
                        className="text-sm text-muted-foreground line-clamp-2"
                      >
                        {paper.abstract ||
                          t('featured.defaultAbstract', {
                            defaultValue:
                              'Discover groundbreaking insights and methodologies in this comprehensive research paper.'
                          })}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 + 0.7 }}
                        className="flex items-center justify-between pt-2 border-t"
                      >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span className="truncate">
                            {paper.author ||
                              t('papers.noAuthor', { defaultValue: 'Research Team' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(paper.created_at)}</span>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.8 }}
                        className="flex items-center gap-2 text-sm font-semibold text-primary"
                      >
                        <span>
                          {t('featured.readFullPaper', { defaultValue: 'Read Full Paper' })}
                        </span>
                        <motion.div
                          animate={{ x: hoveredCard === paper.id ? 5 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Decorative Corner */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.9, type: 'spring' }}
                      className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredResearches.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-xl font-semibold text-muted-foreground">
                {t('featured.noResults', { defaultValue: 'No research papers found' })}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('featured.tryDifferentCategory', {
                  defaultValue: 'Try selecting a different category'
                })}
              </p>
            </motion.div>
          )}

          {/* View All Button */}
          {filteredResearches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/researches"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-primary/50"
                >
                  <Compass className="h-5 w-5" />
                  {t('featured.exploreAll', { defaultValue: 'Explore All Research' })}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Top Researchers */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-5xl font-bold">
              {t('topResearchers.heading', { defaultValue: 'Connect With Leading Minds' })}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t('topResearchers.subheading', {
                defaultValue: 'Follow researchers who are shaping the future of science'
              })}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {topResearchers.map((researcher, i) => (
              <motion.div
                key={researcher.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                variants={cardVariants}
                className="group"
              >
                <Link href={`/researchers/${researcher.id}`}>
                  <div className="overflow-hidden rounded-3xl bg-background shadow-lg transition-all hover:shadow-2xl">
                    <div className="relative h-72 overflow-hidden">
                      {researcher.profile_image ? (
                        <motion.img
                          variants={imageVariants}
                          src={researcher.profile_image}
                          alt={researcher.name || ''}
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

                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="absolute right-4 top-4"
                      >
                        <div className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-bold">{researcher.papers}</span>
                        </div>
                      </motion.div>

                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <motion.h3
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 + 0.4 }}
                          className="mb-1 text-2xl font-bold text-white"
                        >
                          {researcher.name ||
                            t('researchers.anonymous', { defaultValue: 'Anonymous' })}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 + 0.5 }}
                          className="text-sm font-semibold text-white/90"
                        >
                          {researcher.field ||
                            t('researcher.noField', { defaultValue: 'Researcher' })}
                        </motion.p>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="mb-4 text-sm text-muted-foreground">
                        {researcher.institution ||
                          t('researcher.noInstitution', {
                            defaultValue: 'Independent Researcher'
                          })}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          {t('actions.viewProfile', { defaultValue: 'View Profile' })}
                        </span>
                        <ChevronRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary py-24 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=600&fit=crop"
            alt="Background"
            className="h-full w-full object-cover opacity-10"
          />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl"
          >
            <h2 className="mb-6 text-5xl font-bold">
              {t('cta.heading', { defaultValue: 'Start Your Research Journey' })}
            </h2>
            <p className="mb-8 text-xl opacity-90">
              {t('cta.subheading', {
                defaultValue:
                  'Join thousands of researchers discovering, publishing, and sharing groundbreaking work.'
              })}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={register()}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-primary shadow-2xl transition-all"
                >
                  {t('actions.getStarted', { defaultValue: 'Get Started Free' })}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/researches"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-4 text-lg font-semibold transition-all hover:bg-white/10"
                >
                  <Compass className="h-5 w-5" />
                  {t('cta.browseResearch', { defaultValue: 'Browse Research' })}
                </Link>
              </motion.div>
            </div>

            <p className="mt-6 text-sm opacity-75">
              {t('cta.note', {
                defaultValue: 'No credit card required • Explore 45,000+ papers • Join in 60 seconds'
              })}
            </p>
          </motion.div>
        </div>
      </section>
    </HomeLayout>
  );
}
