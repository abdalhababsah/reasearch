// resources/js/pages/researcher/researches/show.tsx

import { Head, Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Calendar,
  Globe,
  FileText,
  Download,
  Eye,
  EyeOff,
  Tag,
  Lock,
  Unlock,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';

type ResearchFile = {
  id: number;
  name: string;
  size_bytes: number;
  mime_type: string | null;
  type: string;
  url: string;
  is_primary: boolean;
  is_visible: boolean;
};

type Category = {
  id: number;
  name_en: string | null;
  name_ar: string | null;
};

type TagType = {
  id: number;
  name_en: string | null;
  name_ar: string | null;
};

type Research = {
  id: number;
  title: string | null;
  status: string;
  is_public: boolean;
  keywords: string | null;
  created_at: string | null;
  files?: ResearchFile[];
  categories?: Category[];
  tags?: TagType[];
  wallpaper_url: string | null;

  // extra body fields returned when includeBody = true
  title_en?: string | null;
  title_ar?: string | null;
  abstract?: string | null;
  abstract_en?: string | null;
  abstract_ar?: string | null;
  keywords_en?: string | null;
  keywords_ar?: string | null;
};

type PageProps = {
  research?: Research;
};

export default function ResearchShow() {
  const { t, locale } = useTranslation();
  const page = usePage<SharedData & PageProps>().props;

  const research = page.research;

  // Graceful fallback if nothing came from backend
  if (!research) {
    return (
      <AppLayout
        breadcrumbs={[
          {
            title: t('researches.title', { defaultValue: 'Researches' }),
            href: '/researcher/researches',
          },
          {
            title: t('errors.notFound', { defaultValue: 'Not found' }),
            href: '#',
          },
        ]}
      >
        <Head
          title={t('researches.notFound', {
            defaultValue: 'Research not found',
          })}
        />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-semibold">
              {t('researches.notFound', {
                defaultValue: 'Research not found',
              })}
            </h1>
            <Button asChild>
              <Link href="/researcher/researches">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('actions.back', { defaultValue: 'Back' })}
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const files: ResearchFile[] = research.files ?? [];
  const categories: Category[] = research.categories ?? [];
  const tags: TagType[] = research.tags ?? [];

  const getName = (item: { name_en: string | null; name_ar: string | null }) => {
    const base =
      locale === 'ar'
        ? item.name_ar ?? item.name_en ?? ''
        : item.name_en ?? item.name_ar ?? '';
    return base || '—';
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const formatBytes = (bytes?: number | null) => {
    if (!bytes || !Number.isFinite(bytes) || bytes <= 0) {
      return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
  };

  const statusColor: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    under_review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    archived: 'bg-slate-200 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  };

  const statusLabel =
    research.status
      ?.replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Draft';

  return (
    <AppLayout
      breadcrumbs={[
        {
          title: t('researches.title', { defaultValue: 'Researches' }),
          href: '/researcher/researches',
        },
        {
          title:
            research.title ??
            research.title_en ??
            t('researches.card.untitled', { defaultValue: 'Untitled' }),
          href: '#',
        },
      ]}
    >
      <Head
        title={
          research.title ??
          research.title_en ??
          t('researches.card.untitled', { defaultValue: 'Untitled research' })
        }
      />

      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {/* Header + actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mb-2 p-0 text-xs text-muted-foreground hover:text-primary"
            >
              <Link href="/researcher/researches">
                <ArrowLeft className="mr-1 h-3 w-3" />
                {t('actions.back', { defaultValue: 'Back to list' })}
              </Link>
            </Button>

            <h1 className="text-2xl font-semibold leading-tight">
              {research.title ??
                research.title_en ??
                t('researches.card.untitled', { defaultValue: 'Untitled research' })}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge
                variant="secondary"
                className={`border-none px-2 py-0.5 text-[11px] ${statusColor[research.status] ?? ''}`}
              >
                {statusLabel}
              </Badge>

              <span className="inline-flex items-center gap-1">
                {research.is_public ? (
                  <>
                    <Unlock className="h-3 w-3" />
                    {t('researches.visibility.public', { defaultValue: 'Public' })}
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    {t('researches.visibility.private', { defaultValue: 'Private' })}
                  </>
                )}
              </span>

              {research.created_at && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateTime(research.created_at)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/researcher/researches/${research.id}/edit`}>
                {t('actions.edit', { defaultValue: 'Edit' })}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Wallpaper / summary */}
            <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
              {research.wallpaper_url && (
                <div className="h-40 w-full overflow-hidden bg-muted">
                  <img
                    src={research.wallpaper_url}
                    alt="Wallpaper"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-4 p-5">
                {/* Categories & tags */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge key={cat.id} variant="outline" className="text-xs">
                      {getName(cat)}
                    </Badge>
                  ))}
                  {tags.length > 0 && (
                    <>
                      {categories.length > 0 && (
                        <span className="text-[10px] text-muted-foreground px-1">•</span>
                      )}
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-[10px] inline-flex items-center gap-1"
                        >
                          <Tag className="h-3 w-3" />
                          {getName(tag)}
                        </Badge>
                      ))}
                    </>
                  )}
                </div>

                {/* Abstract */}
                {research.abstract && (
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold">
                      {t('researches.show.abstract', { defaultValue: 'Abstract' })}
                    </h2>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {research.abstract}
                    </p>
                  </div>
                )}

                {/* Multilingual abstracts (optional) */}
                {(research.abstract_en || research.abstract_ar) && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {research.abstract_en && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wide">
                          EN
                        </h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {research.abstract_en}
                        </p>
                      </div>
                    )}
                    {research.abstract_ar && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wide">
                          AR
                        </h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {research.abstract_ar}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Keywords */}
                {(research.keywords_en || research.keywords_ar || research.keywords) && (
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold">
                      {t('researches.show.keywords', { defaultValue: 'Keywords' })}
                    </h2>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {(research.keywords_en ?? research.keywords ?? '')
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .map((k, idx) => (
                          <Badge key={`kw-en-${idx}`} variant="outline">
                            {k}
                          </Badge>
                        ))}
                      {research.keywords_ar &&
                        research.keywords_ar
                          .split(',')
                          .map((k) => k.trim())
                          .filter(Boolean)
                          .map((k, idx) => (
                            <Badge
                              key={`kw-ar-${idx}`}
                              variant="secondary"
                              className="border-dashed"
                            >
                              {k}
                            </Badge>
                          ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Files */}
            <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('researches.show.files', { defaultValue: 'Files' })}
                </h2>
                <p className="text-xs text-muted-foreground max-w-[260px] text-right">
                  {t('researches.show.filesHelp', {
                    defaultValue: 'Primary file is the main document. Visibility controls what appears publicly.',
                  })}
                </p>
              </div>

              {files.length > 0 ? (
                <ul className="divide-y rounded-md border text-sm">
                  {files.map((file) => (
                    <li
                      key={file.id}
                      className="flex flex-wrap items-center gap-3 px-3 py-2"
                    >
                      <div className="flex-1 min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[260px]">
                            {file.name}
                          </span>
                          {file.is_primary && (
                            <Badge variant="secondary" className="text-[10px]">
                              {t('researches.form.primaryFile', {
                                defaultValue: 'Primary',
                              })}
                            </Badge>
                          )}
                          {!file.is_visible && (
                            <Badge
                              variant="outline"
                              className="text-[10px] inline-flex items-center gap-1"
                            >
                              <EyeOff className="h-3 w-3" />
                              {t('researches.show.hidden', {
                                defaultValue: 'Hidden',
                              })}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {(file.mime_type || '—') +
                            ' · ' +
                            formatBytes(file.size_bytes)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                        >
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-1 h-3 w-3" />
                            {t('actions.download', { defaultValue: 'Download' })}
                          </a>
                        </Button>
                        {file.is_visible && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            {t('researches.show.fileVisible', {
                              defaultValue: 'Visible',
                            })}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
                  <span>
                    {t('researches.show.noFiles', {
                      defaultValue: 'No files uploaded yet.',
                    })}
                  </span>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN – meta card */}
          <aside className="space-y-4">
            <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4 text-sm">
              <h2 className="text-base font-semibold">
                {t('researches.show.details', { defaultValue: 'Details' })}
              </h2>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {t('researches.form.status', { defaultValue: 'Status' })}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`border-none px-2 py-0.5 text-[11px] ${statusColor[research.status] ?? ''}`}
                    >
                      {statusLabel}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {t('researches.visibility.label', { defaultValue: 'Visibility' })}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-2">
                    {research.is_public ? (
                      <>
                        <Unlock className="h-3 w-3" />
                        <span>
                          {t('researches.visibility.public', {
                            defaultValue: 'Public',
                          })}
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        <span>
                          {t('researches.visibility.private', {
                            defaultValue: 'Private',
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {research.keywords && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {t('researches.show.keywords', {
                          defaultValue: 'Keywords',
                        })}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                        {research.keywords
                          .split(',')
                          .map((k) => k.trim())
                          .filter(Boolean)
                          .map((k, idx) => (
                            <Badge key={idx} variant="outline">
                              {k}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </>
                )}

                {research.wallpaper_url && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {t('researches.form.wallpaper', {
                          defaultValue: 'Wallpaper',
                        })}
                      </div>
                      <div className="mt-2 rounded-md border overflow-hidden">
                        <div className="aspect-[4/3] bg-muted">
                          <img
                            src={research.wallpaper_url}
                            alt="Wallpaper"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
