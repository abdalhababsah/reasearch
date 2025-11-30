import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building2, Mail, Globe, ExternalLink, 
  Calendar, GraduationCap, Briefcase, FileText, User,
  MapPin, Award, Share2, BookOpen, Sparkles, Eye, Download,
  ChevronRight, Star
} from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

type Researcher = {
  id: number;
  name: string;
  email: string;
  profile: {
    institution: string | null;
    headline: string | null;
    bio: string | null;
    website: string | null;
    phone: string | null;
    address: string | null;
    profile_image: string | null;
    profile_image_url?: string | null;
    orcid: string | null;
    google_scholar: string | null;
    linkedin_url: string | null;
    github_url: string | null;
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
    majors: Array<{ id: number; name: string; }>;
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
  researcher?: Researcher;
  researches?: Research[];
};

export default function ResearcherShow() {
  const page = usePage<SharedData & PageProps>();
  const { auth } = page.props;
  const researcher = page.props.researcher;
  const researches = page.props.researches ?? [];
  const { t, locale } = useTranslation();
  const isAuthenticated = Boolean(auth?.user);

  if (!researcher) {
    return null;
  }

  const profileImage = researcher.profile?.profile_image || researcher.profile?.profile_image_url || '';

  const allCategories = (researches || []).flatMap(r => r.categories);
  const uniqueCategories = Array.from(
    new Map(allCategories.map(cat => [cat.id, cat])).values()
  );
  
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [hoveredResearch, setHoveredResearch] = useState<number | null>(null);

  const filteredResearches = selectedCategory === 'all' 
    ? (researches || []) 
    : (researches || []).filter(r => r.categories.some(cat => cat.id === selectedCategory));

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

  const calculateDuration = (startDate: string, endDate: string | null, isCurrent: boolean) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    
    const totalMonths = years * 12 + months;
    const displayYears = Math.floor(totalMonths / 12);
    const displayMonths = totalMonths % 12;
    
    if (displayYears > 0 && displayMonths > 0) {
      return `${displayYears} ${t('time.years', { defaultValue: 'yrs' })} ${displayMonths} ${t('time.months', { defaultValue: 'mos' })}`;
    } else if (displayYears > 0) {
      return `${displayYears} ${t('time.years', { defaultValue: 'yrs' })}`;
    } else {
      return `${displayMonths} ${t('time.months', { defaultValue: 'mos' })}`;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: researcher.name,
        text: researcher.profile?.headline || '',
        url: window.location.href,
      });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6 }
    }),
    hover: {
      y: -8,
      transition: { duration: 0.3 }
    }
  };

  return (
    <HomeLayout isAuthenticated={isAuthenticated} title={researcher.name}>
      <div className="min-h-screen bg-background">
        {/* Hero Header Section */}
        <section className="relative overflow-hidden border-b bg-background">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]"></div>
          
          <div className="container relative z-10 mx-auto px-4 py-12 max-w-7xl">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -5 }}
              onClick={() => window.history.back()}
              className="mb-8 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('actions.back', { defaultValue: 'Back to Researchers' })}
            </motion.button>

            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/* Profile Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative flex-shrink-0"
              >
                <div className="h-80 w-80 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-background">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={researcher.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <span className="text-9xl font-bold text-white">
                        {getInitials(researcher.name)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Floating Stats Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-xl border-2 border-primary/20"
                >
                  <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{researches.length}</div>
                        <div className="text-xs text-muted-foreground">
                          {t('researcher.publications', { defaultValue: 'Publications' })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
              </motion.div>

              {/* Profile Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 space-y-8 pt-8"
              >
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl lg:text-6xl font-bold mb-4 leading-tight"
                  >
                    {researcher.name}
                  </motion.h1>
                  
                  {researcher.profile?.headline && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl text-primary font-semibold mb-6"
                    >
                      {researcher.profile.headline}
                    </motion.p>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-6 text-base text-muted-foreground"
                  >
                    {researcher.profile?.institution && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="font-medium">{researcher.profile.institution}</span>
                      </div>
                    )}
                    {researcher.profile?.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>{researcher.profile.address}</span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Research Fields Pills */}
                {researcher.profile && researcher.profile.majors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap gap-3"
                  >
                    {researcher.profile.majors.map((major, i) => (
                      <motion.span
                        key={major.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-semibold"
                      >
                        {major.name}
                      </motion.span>
                    ))}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap gap-4"
                >
                  <motion.a
                    href={`mailto:${researcher.email}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all"
                  >
                    <Mail className="h-5 w-5" />
                    {t('actions.contact', { defaultValue: 'Contact' })}
                  </motion.a>
                  
                  {researcher.profile?.website && (
                    <motion.a
                      href={researcher.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-background border-2 border-primary/20 rounded-2xl font-semibold hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <Globe className="h-5 w-5" />
                      {t('researcher.website', { defaultValue: 'Website' })}
                    </motion.a>
                  )}

                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-background border-2 border-primary/20 rounded-2xl font-semibold hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <Share2 className="h-5 w-5" />
                    {t('actions.share', { defaultValue: 'Share' })}
                  </motion.button>
                </motion.div>

                {/* Social Links */}
                {(researcher.profile?.orcid || researcher.profile?.google_scholar || researcher.profile?.linkedin_url || researcher.profile?.github_url || researcher.profile?.twitter) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-3"
                  >
                    {[
                      { url: researcher.profile?.orcid ? `https://orcid.org/${researcher.profile.orcid}` : null, icon: Award, label: 'ORCID' },
                      { url: researcher.profile?.google_scholar, icon: GraduationCap, label: 'Google Scholar' },
                      { url: researcher.profile?.linkedin_url, icon: null, label: 'LinkedIn', svg: true },
                      { url: researcher.profile?.github_url, icon: null, label: 'GitHub', svg: true },
                      { url: researcher.profile?.twitter, icon: null, label: 'Twitter', svg: true }
                    ].filter(social => social.url).map((social, i) => (
                      <motion.a
                        key={i}
                        href={social.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="h-12 w-12 rounded-xl bg-background border-2 border-primary/20 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"
                        title={social.label}
                      >
                        {social.icon && <social.icon className="h-5 w-5" />}
                        {social.svg && social.label === 'LinkedIn' && (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        )}
                        {social.svg && social.label === 'GitHub' && (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        )}
                        {social.svg && social.label === 'Twitter' && (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        )}
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* About Section */}
        {researcher.profile?.bio && (
          <section className="border-b py-20">
            <div className="container mx-auto px-4 max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-5xl"
              >
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold">
                    {t('researcher.about', { defaultValue: 'About' })}
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {researcher.profile.bio}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* Experience Section */}
        {researcher.profile && researcher.profile.experiences.length > 0 && (
          <section className="bg-muted/30 border-b py-20">
            <div className="container mx-auto px-4 max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 flex items-center gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">
                  {t('researcher.experience', { defaultValue: 'Experience' })}
                </h2>
              </motion.div>
              
              <div className="max-w-5xl space-y-12">
                {researcher.profile.experiences.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={cardVariants}
                    className="relative pl-12"
                  >
                    <div className="absolute left-0 top-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/20">
                      <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
                    </div>
                    {index < researcher.profile!.experiences.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
                    )}
                    
                    <div className="pb-8">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">{exp.title}</h3>
                          <p className="text-xl font-semibold text-primary">{exp.company}</p>
                          {exp.location && (
                            <p className="text-base text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {exp.location}
                            </p>
                          )}
                        </div>
                        <div className="text-base text-muted-foreground md:text-right shrink-0">
                          <div className="font-semibold">
                            {formatDate(exp.start_date)} - {exp.is_current ? t('time.present', { defaultValue: 'Present' }) : exp.end_date ? formatDate(exp.end_date) : ''}
                          </div>
                          <div className="text-sm mt-1">
                            {calculateDuration(exp.start_date, exp.end_date, exp.is_current)}
                          </div>
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Education Section */}
        {researcher.profile && researcher.profile.educations.length > 0 && (
          <section className="border-b py-20">
            <div className="container mx-auto px-4 max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 flex items-center gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">
                  {t('researcher.education', { defaultValue: 'Education' })}
                </h2>
              </motion.div>
              
              <div className="max-w-5xl space-y-12">
                {researcher.profile.educations.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={cardVariants}
                    className="relative pl-12"
                  >
                    <div className="absolute left-0 top-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/20">
                      <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
                    </div>
                    {index < researcher.profile!.educations.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
                    )}
                    
                    <div className="pb-8">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">{edu.degree}</h3>
                          <p className="text-xl font-semibold text-primary">{edu.field}</p>
                          <p className="text-lg">{edu.institution}</p>
                          {edu.location && (
                            <p className="text-base text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {edu.location}
                            </p>
                          )}
                        </div>
                        <div className="text-base text-muted-foreground md:text-right shrink-0">
                          <div className="font-semibold">
                            {formatDate(edu.start_date)} - {edu.end_date ? formatDate(edu.end_date) : t('time.present', { defaultValue: 'Present' })}
                          </div>
                        </div>
                      </div>
                      {edu.description && (
                        <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Publications Section */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">
                    {t('researcher.publications', { defaultValue: 'Publications' })}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {researches.length} {t('researcher.publicationsDesc', { defaultValue: 'published research papers' })}
                  </p>
                </div>
              </div>
            </motion.div>

            {researches.length > 0 ? (
              <>
                {/* Category Filter */}
                {uniqueCategories.length > 0 && (
                  <div className="mb-12 flex flex-wrap justify-center gap-3">
                    {[{ id: 'all' as const, name: 'All', count: researches.length }, ...uniqueCategories.map(cat => ({ 
                      id: cat.id, 
                      name: getCategoryName(cat),
                      count: researches.filter(r => r.categories.some(c => c.id === cat.id)).length
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
                        className={`relative overflow-hidden rounded-full px-6 py-3 font-semibold transition-all ${
                          selectedCategory === category.id
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-background hover:bg-primary/10'
                        }`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {category.name}
                          <span className={`text-xs ${selectedCategory === category.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                            ({category.count})
                          </span>
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Publications Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredResearches.map((research, i) => (
                    <motion.div
                      key={research.id}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      whileHover="hover"
                      viewport={{ once: true }}
                      variants={cardVariants}
                      onHoverStart={() => setHoveredResearch(research.id)}
                      onHoverEnd={() => setHoveredResearch(null)}
                    >
                      <Link href={`/researches/${research.id}`}>
                        <div className="h-full overflow-hidden rounded-3xl bg-background shadow-lg transition-all hover:shadow-2xl">
                          {/* Image */}
                          <div className="relative h-48 overflow-hidden">
                            {research.wallpaper_url ? (
                              <img
                                src={research.wallpaper_url}
                                alt={research.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <FileText className="h-12 w-12 text-primary/40" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            
                            {/* Category Badge */}
                            {research.categories[0] && (
                              <div className="absolute left-4 top-4">
                                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                                  {getCategoryName(research.categories[0])}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold line-clamp-2 transition-colors group-hover:text-primary">
                              {research.title}
                            </h3>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {research.abstract}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {research.published_at
                                    ? new Date(research.published_at).getFullYear()
                                    : research.year}
                                </span>
                              </div>
                              <motion.div
                                animate={{ x: hoveredResearch === research.id ? 5 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ExternalLink className="h-4 w-4 text-primary" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 text-center"
              >
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold mb-2">
                  {t('researcher.noPublications', { defaultValue: 'No publications yet' })}
                </p>
                <p className="text-muted-foreground">
                  {t('researcher.noPublicationsDesc', { defaultValue: 'Publications will appear here once published' })}
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </HomeLayout>
  );
}
