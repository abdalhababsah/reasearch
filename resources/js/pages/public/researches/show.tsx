// resources/js/pages/public/researches/show.tsx

import { useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  FileText,
  Download,
  Tag as TagIcon,
  User,
  Building2,
  Mail,
  Quote,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  File,
  FileImage,
  Folder,
  Grid3x3,
  List,
  Search,
  SortAsc,
  Eye,
  Share2,
  Bookmark,
  Award,
  Globe,
} from 'lucide-react';
// ❌ removed react-doc-viewer
// import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

import HomeLayout from '@/layouts/home-layout';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';

type Author = {
  id: number;
  name: string;
  email: string;
  institution: string | null;
  headline: string | null;
  bio: string | null;
};

type Category = {
  id: number;
  name_en: string;
  name_ar: string;
};

type Tag = {
  id: number;
  name_en: string;
  name_ar: string;
};

type ResearchFile = {
  id: number;
  name: string;
  type: string;
  size_bytes: number;
  mime_type: string;
  url: string;
  is_primary: boolean;
};

type Research = {
  id: number;
  title_en: string;
  title_ar: string;
  title: string;
  abstract_en: string;
  abstract_ar: string;
  abstract: string;
  keywords_en: string;
  keywords_ar: string;
  keywords: string;
  doi: string | null;
  journal_name: string | null;
  year: number | null;
  published_at: string | null;
  author: Author;
  categories: Category[];
  tags: Tag[];
  files: ResearchFile[];
  wallpaper_url: string | null;
};

type PageProps = {
  research: Research;
};

export default function ResearchShow() {
  const { auth, research } = usePage<SharedData & PageProps>().props;
  const { t, locale } = useTranslation();
  const isAuthenticated = Boolean(auth.user);

  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const hasFiles = research.files.length > 0;

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return research.files;
    return research.files.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [research.files, searchQuery]);

  const getCategoryName = (category: Category) => {
    return locale === 'ar' ? category.name_ar : category.name_en;
  };

  const getTagName = (tag: Tag) => {
    return locale === 'ar' ? tag.name_ar : tag.name_en;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const displayYear = research.published_at
    ? new Date(research.published_at).getFullYear()
    : research.year;

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType: string, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType === 'application/pdf' || ext === 'pdf') return FileText;
    if (
      mimeType.includes('spreadsheet') ||
      ['xls', 'xlsx', 'csv'].includes(ext || '')
    )
      return FileText;
    if (
      mimeType.includes('code') ||
      ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'php', 'rb', 'cs', 'cpp'].includes(
        ext || ''
      )
    )
      return FileText;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return Folder;

    return File;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6 },
    }),
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: research.title,
        text: research.abstract,
        url: window.location.href,
      });
    }
  };

  // ---- Helper: generic inline preview for any file type ----
  const renderFilePreview = (file: ResearchFile | undefined) => {
    if (!file) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
          {t('research.noFileSelected', {
            defaultValue: 'No file selected.',
          })}
        </div>
      );
    }

    const { mime_type, url, name } = file;
    const ext = name.split('.').pop()?.toLowerCase() || '';

    // Images
    if (mime_type.startsWith('image/')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black/5 dark:bg-black/50">
          <img
            src={url}
            alt={name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      );
    }

    // Audio
    if (mime_type.startsWith('audio/')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            {t('research.audioPreview', {
              defaultValue: 'Audio preview',
            })}
          </p>
          <audio controls className="w-full max-w-xl">
            <source src={url} type={mime_type} />
            {t('research.audioNotSupported', {
              defaultValue: 'Your browser does not support the audio element.',
            })}
          </audio>
        </div>
      );
    }

    // Video
    if (mime_type.startsWith('video/')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/80">
          <video
            controls
            className="w-full h-full max-h-full object-contain"
          >
            <source src={url} type={mime_type} />
            {t('research.videoNotSupported', {
              defaultValue: 'Your browser does not support the video element.',
            })}
          </video>
        </div>
      );
    }

    // Text / code files – let browser render inside iframe
    if (
      mime_type.startsWith('text/') ||
      ['json', 'md', 'txt', 'log', 'js', 'ts', 'jsx', 'tsx', 'py', 'php', 'java', 'rb', 'cs', 'cpp'].includes(
        ext
      )
    ) {
      return (
        <iframe
          src={url}
          title={name}
          className="w-full h-full bg-white dark:bg-black"
        />
      );
    }

    // PDFs and typical docs – browser can handle via iframe as well
    if (
      mime_type === 'application/pdf' ||
      ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)
    ) {
      return (
        <iframe
          src={url}
          title={name}
          className="w-full h-full bg-white dark:bg-black"
        />
      );
    }

    // Archives and anything else – fallback iframe (browser decides: inline vs download)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground max-w-md text-center">
          {t('research.previewFallback', {
            defaultValue:
              'Your browser will handle this file type. If it cannot display it, it will be downloaded automatically.',
          })}
        </p>
        <iframe
          src={url}
          title={name}
          className="w-full h-3/4 border rounded-lg bg-white dark:bg-black"
        />
      </div>
    );
  };

  return (
    <HomeLayout isAuthenticated={isAuthenticated} title={research.title}>
      <div className="min-h-screen bg-background">
        {/* Hero Section - Professional Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b-2 border-primary/10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]"></div>

          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>

          <div className="container relative z-10 mx-auto px-4 py-8 max-w-7xl">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -5 }}
              onClick={() => window.history.back()}
              className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('actions.back', { defaultValue: 'Back to Research' })}
            </motion.button>

            {/* Research Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-white dark:bg-gray-900 px-4 py-2 shadow-lg"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {t('research.publication', {
                  defaultValue: 'Research Publication',
                })}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight max-w-5xl"
            >
              {research.title}
            </motion.h1>

            {/* Journal & Metadata Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-6 mb-8"
            >
              {research.journal_name && (
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <Award className="h-5 w-5" />
                  {research.journal_name}
                </div>
              )}

              {displayYear && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">{displayYear}</span>
                </div>
              )}

              {research.doi && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>DOI: {research.doi}</span>
                </div>
              )}
            </motion.div>

            {/* Categories Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              {research.categories.map((cat, i) => (
                <motion.span
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-5 py-2.5 bg-primary/10 border-2 border-primary/20 text-primary rounded-full text-sm font-semibold shadow-sm"
                >
                  {getCategoryName(cat)}
                </motion.span>
              ))}
            </motion.div>

            {/* Author Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl border-2 border-primary/10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/researchers/${research.author.id}`}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-2xl font-bold text-white shadow-lg hover:shadow-xl transition-shadow flex-shrink-0"
                  >
                    {research.author.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Link>
                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      {t('research.author', { defaultValue: 'Author' })}
                    </p>
                    <Link
                      href={`/researchers/${research.author.id}`}
                      className="text-xl font-bold hover:text-primary transition-colors"
                    >
                      {research.author.name}
                    </Link>
                    {research.author.headline && (
                      <p className="text-sm text-primary font-semibold mt-1">
                        {research.author.headline}
                      </p>
                    )}
                    {research.author.institution && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Building2 className="h-4 w-4" />
                        {research.author.institution}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:${research.author.email}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all whitespace-nowrap"
                  >
                    <Mail className="h-4 w-4" />
                    {t('actions.contact', {
                      defaultValue: 'Contact Author',
                    })}
                  </a>

                  <Link
                    href={`/researchers/${research.author.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-background px-6 py-3 text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <User className="h-4 w-4" />
                    {t('actions.viewProfile', {
                      defaultValue: 'View Profile',
                    })}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Abstract & Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Abstract */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border-2 border-primary/10 bg-gradient-to-br from-white to-muted/30 dark:from-gray-900 dark:to-gray-800/30 p-8 shadow-xl"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Quote className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold">
                    {t('research.abstract', { defaultValue: 'Abstract' })}
                  </h2>
                </div>

                <p className="whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">
                  {research.abstract}
                </p>

                {/* Keywords */}
                {research.keywords && (
                  <div className="mt-8 pt-8 border-t-2 border-primary/10">
                    <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-primary" />
                      {t('research.keywords', { defaultValue: 'Keywords' })}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {research.keywords
                        .split(/[;,]+/)
                        .map((kw) => kw.trim())
                        .filter(Boolean)
                        .map((kw, i) => (
                          <span
                            key={`${kw}-${i}`}
                            className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors"
                          >
                            {kw}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </motion.section>

              {/* Tags */}
              {research.tags.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border-2 border-primary/10 bg-white dark:bg-gray-900 p-8 shadow-xl"
                >
                  <h3 className="mb-4 text-xl font-bold flex items-center gap-2">
                    <TagIcon className="h-5 w-5 text-primary" />
                    {t('research.tags', {
                      defaultValue: 'Research Tags',
                    })}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {research.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        #{getTagName(tag)}
                      </span>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Wallpaper Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="rounded-3xl border-2 border-primary/10 bg-white dark:bg-gray-900 shadow-xl overflow-hidden sticky top-24"
              >
                <div className="relative h-64">
                  {research.wallpaper_url ? (
                    <img
                      src={research.wallpaper_url}
                      alt={research.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <BookOpen className="h-20 w-20 text-primary/60" />
                    </div>
                  )}

                  {/* Year Badge */}
                  <div className="absolute top-4 right-4 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 shadow-2xl">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {displayYear}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        {t('research.year', { defaultValue: 'Year' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Action Buttons */}
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all"
                  >
                    <Share2 className="h-4 w-4" />
                    {t('actions.share', { defaultValue: 'Share Research' })}
                  </button>

                  <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-primary/20 bg-background px-6 py-3 text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-all">
                    <Bookmark className="h-4 w-4" />
                    {t('actions.save', { defaultValue: 'Save to Library' })}
                  </button>

                  {/* Quick Stats */}
                  <div className="pt-4 border-t-2 border-primary/10 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {research.files.length}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        {t('research.files', { defaultValue: 'Files' })}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {research.categories.length}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        {t('research.categories', {
                          defaultValue: 'Categories',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Files & Viewer Section - Full Width */}
        <section className="bg-gradient-to-b from-muted/30 to-background py-16 border-t-2 border-primary/10">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Section Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg">
                    <Folder className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold">
                      {t('research.filesAndDocuments', {
                        defaultValue: 'Files & Documents',
                      })}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {research.files.length}{' '}
                      {t('research.filesAvailable', {
                        defaultValue: 'files available for download',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {hasFiles ? (
                <div className="rounded-3xl border-2 border-primary/10 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
                  {/* FIX: Use grid-cols-1 for mobile, custom split for lg */}
                  <div className="grid grid-cols-1 lg:grid-cols-[420px,1fr]">
                    {/* Left Side - File Explorer */}
                    {/* FIX: Use border-b-2 for mobile separation, border-r-2 for lg */}
                    <div className="lg:border-r-2 border-b-2 lg:border-b-0 border-primary/10 flex flex-col bg-gradient-to-b from-muted/20 to-background">
                      {/* Explorer Header */}
                      <div className="border-b-2 border-primary/10 bg-gradient-to-r from-primary/5 to-background p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Folder className="h-5 w-5 text-primary" />
                            <span className="font-bold text-lg">
                              {t('research.documents', {
                                defaultValue: 'Documents',
                              })}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-muted-foreground px-3 py-1 rounded-full bg-primary/10">
                            {filteredFiles.length}{' '}
                            {t('research.items', { defaultValue: 'items' })}
                          </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder={t('research.searchFiles', {
                              defaultValue: 'Search files...',
                            })}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-primary/10 bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-medium placeholder:text-muted-foreground"
                          />
                        </div>
                      </div>

                      {/* View Mode Controls */}
                      <div className="border-b border-primary/10 bg-muted/20 px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-all ${
                              viewMode === 'list'
                                ? 'bg-primary text-white shadow-lg'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <List className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-all ${
                              viewMode === 'grid'
                                ? 'bg-primary text-white shadow-lg'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <Grid3x3 className="h-4 w-4" />
                          </button>
                        </div>
                        <button className="p-2.5 rounded-lg hover:bg-muted transition-colors">
                          <SortAsc className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>

                      {/* File List - FIX: Add max-h for mobile to prevent overflow */}
                      <div className="flex-1 overflow-y-auto p-4 max-h-[50vh] lg:max-h-none">
                        {viewMode === 'list' ? (
                          <div className="space-y-2">
                            {filteredFiles.map((file, i) => {
                              const FileIcon = getFileIcon(file.mime_type, file.name);
                              const isSelected = selectedFileIndex === research.files.indexOf(file);

                              return (
                                <motion.button
                                  key={file.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  onClick={() => setSelectedFileIndex(research.files.indexOf(file))}
                                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                                    isSelected
                                      ? 'bg-primary/10 border-2 border-primary/40 shadow-lg scale-[1.02]'
                                      : 'hover:bg-muted/50 border-2 border-transparent hover:border-primary/20'
                                  }`}
                                >
                                  <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ${
                                      isSelected ? 'bg-primary/20 shadow-lg' : 'bg-primary/10'
                                    }`}
                                  >
                                    <FileIcon
                                      className={`h-6 w-6 ${
                                        isSelected ? 'text-primary' : 'text-primary/70'
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`truncate font-semibold text-sm ${
                                        isSelected ? 'text-primary' : ''
                                      }`}
                                    >
                                      {file.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                      <span className="font-medium">
                                        {formatFileSize(file.size_bytes)}
                                      </span>
                                      <span>•</span>
                                      <span className="truncate uppercase">
                                        {file.mime_type.split('/')[1]}
                                      </span>
                                    </div>
                                  </div>
                                  {file.is_primary && (
                                    <span className="rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold uppercase text-white shadow-lg">
                                      Primary
                                    </span>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {filteredFiles.map((file, i) => {
                              const FileIcon = getFileIcon(file.mime_type, file.name);
                              const isSelected = selectedFileIndex === research.files.indexOf(file);

                              return (
                                <motion.button
                                  key={file.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.05 }}
                                  onClick={() => setSelectedFileIndex(research.files.indexOf(file))}
                                  className={`p-4 rounded-xl text-center transition-all ${
                                    isSelected
                                      ? 'bg-primary/10 border-2 border-primary/40 shadow-lg'
                                      : 'hover:bg-muted/50 border-2 border-transparent'
                                  }`}
                                >
                                  <div
                                    className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-xl ${
                                      isSelected ? 'bg-primary/20' : 'bg-primary/10'
                                    }`}
                                  >
                                    <FileIcon
                                      className={`h-10 w-10 ${
                                        isSelected ? 'text-primary' : 'text-primary/70'
                                      }`}
                                    />
                                  </div>
                                  <p
                                    className={`text-xs font-semibold truncate ${
                                      isSelected ? 'text-primary' : ''
                                    }`}
                                  >
                                    {file.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                    {formatFileSize(file.size_bytes)}
                                  </p>
                                  {file.is_primary && (
                                    <span className="mt-2 inline-block rounded-lg bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase text-primary">
                                      Primary
                                    </span>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Explorer Footer */}
                      <div className="border-t-2 border-primary/10 bg-gradient-to-r from-primary/5 to-background p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-muted-foreground">
                            {filteredFiles.length}{' '}
                            {t('research.files', { defaultValue: 'files' })}
                          </span>
                          <span className="font-bold text-primary">
                            {formatFileSize(
                              research.files.reduce(
                                (acc, f) => acc + f.size_bytes,
                                0
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Document Viewer */}
                    <div className="flex flex-col bg-gradient-to-br from-muted/10 to-background">
                      {/* Viewer Header */}
                      <div className="border-b-2 border-primary/10 bg-gradient-to-r from-background to-primary/5 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {(() => {
                              const file =
                                research.files[selectedFileIndex] ||
                                research.files[0];
                              const FileIcon = getFileIcon(
                                file?.mime_type || '',
                                file?.name || ''
                              );
                              return (
                                <>
                                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0 shadow-lg">
                                    <FileIcon className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-base truncate">
                                      {file?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                      {formatFileSize(
                                        file?.size_bytes || 0
                                      )}{' '}
                                      • {file?.mime_type}
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setSelectedFileIndex((prev) =>
                                  prev === 0
                                    ? research.files.length - 1
                                    : prev - 1
                                )
                              }
                              disabled={research.files.length <= 1}
                              className="p-2.5 rounded-xl border-2 border-primary/20 hover:bg-primary/5 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="text-sm font-bold px-3 py-1 rounded-lg bg-primary/10">
                              {selectedFileIndex + 1} / {research.files.length}
                            </span>
                            <button
                              onClick={() =>
                                setSelectedFileIndex((prev) =>
                                  prev === research.files.length - 1
                                    ? 0
                                    : prev + 1
                                )
                              }
                              disabled={research.files.length <= 1}
                              className="p-2.5 rounded-xl border-2 border-primary/20 hover:bg-primary/5 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Viewer Content - FIX: Add responsive min-height */}
                      <div className="flex-1 overflow-hidden relative min-h-[400px] lg:min-h-[550px]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedFileIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                          >
                            {renderFilePreview(
                              research.files[selectedFileIndex] ||
                                research.files[0]
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Viewer Footer */}
                      <div className="border-t-2 border-primary/10 bg-gradient-to-r from-background to-primary/5 p-5">
                        <div className="flex items-center justify-between gap-4">
                       

                          <a
                            href={research.files[selectedFileIndex]?.url}
                            download
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all"
                          >
                            <Download className="h-4 w-4" />
                            {t('actions.download', {
                              defaultValue: 'Download File',
                            })}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-24 text-center rounded-3xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-muted/30 to-background"
                >
                  <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-muted shadow-xl">
                    <FileText className="h-14 w-14 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold mb-2">
                    {t('research.noFiles', {
                      defaultValue: 'No Files Available',
                    })}
                  </p>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t('research.noFilesDesc', {
                      defaultValue:
                        'Files and documents will be available once uploaded by the author.',
                    })}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </div>
    </HomeLayout>
  );
}