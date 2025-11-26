import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';

import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';

interface StatusOption {
  value: string;
  label: string;
}

interface ResearchCard {
  id: number;
  title: string | null;
  status: string;
  is_public: boolean;
  created_at: string | null;
  excerpt?: string | null;
  author?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface ResearchIndexProps {
  researches: {
    data: ResearchCard[];
    links: PaginationLink[];
  };
  filters: {
    search?: string | null;
    status?: string | null;
    visibility?: string | null;
  };
  statuses: StatusOption[];
}

export default function AdminResearchesIndex({ researches, filters, statuses }: ResearchIndexProps) {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [visibility, setVisibility] = useState(filters.visibility ?? '');

  const localizedStatuses = useMemo(() => {
    return statuses.map((statusOption) => {
      const key = `researches.statuses.${statusOption.value}`;
      const translated = t(key);
      return {
        value: statusOption.value,
        label: translated === key ? statusOption.label : translated,
      };
    });
  }, [statuses, t]);

  const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    router.get(
      '/admin/researches',
      {
        search,
        status,
        visibility,
      },
      {
        preserveState: true,
        replace: true,
      }
    );
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setVisibility('');
    router.get('/admin/researches', {}, { replace: true });
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return '';
    }
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  };

  const visibilityLabel = (isPublic: boolean) =>
    isPublic ? t('researches.visibility.public') : t('researches.visibility.private');

  return (
    <AppLayout
      breadcrumbs={[
        {
          title: t('researches.title'),
          href: '/admin/researches',
        },
      ]}
    >
      <Head title={t('researches.title')} />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t('researches.title')}</h1>
            <p className="text-muted-foreground">
              {t('researches.adminDescription', {
                defaultValue: 'Review and manage all research submissions.',
              })}
            </p>
          </div>
        </div>

        <form
          className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-4"
          onSubmit={applyFilters}
        >
          <div className="md:col-span-2">
            <LabelledField
              label={t('researches.filters.search', { defaultValue: 'Search' })}
            >
              <Input
                placeholder={t('researches.filters.searchPlaceholder', {
                  defaultValue: 'Search by title or keywords',
                })}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </LabelledField>
          </div>

          <div>
            <LabelledField
              label={t('researches.filters.status', { defaultValue: 'Status' })}
            >
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">
                  {t('researches.filters.statusAll', { defaultValue: 'All statuses' })}
                </option>
                {localizedStatuses.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
            </LabelledField>
          </div>

          <div>
            <LabelledField
              label={t('researches.filters.visibility', { defaultValue: 'Visibility' })}
            >
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
              >
                <option value="">
                  {t('researches.filters.visibilityAll', {
                    defaultValue: 'All visibility options',
                  })}
                </option>
                <option value="public">
                  {t('researches.filters.visibilityPublic', { defaultValue: 'Public' })}
                </option>
                <option value="private">
                  {t('researches.filters.visibilityPrivate', { defaultValue: 'Private' })}
                </option>
              </select>
            </LabelledField>
          </div>

          <div className="flex items-end justify-end gap-2 md:col-span-4">
            <Button type="button" variant="outline" onClick={resetFilters}>
              {t('researches.filters.reset', { defaultValue: 'Reset' })}
            </Button>
            <Button type="submit">
              {t('researches.filters.apply', { defaultValue: 'Apply filters' })}
            </Button>
          </div>
        </form>

        {researches.data.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border bg-muted/40 p-10 text-center">
            <div>
              <p className="text-lg font-medium">
                {t('researches.empty.title', { defaultValue: 'No research papers found' })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('researches.empty.description', {
                  defaultValue: 'Try adjusting your search or filters',
                })}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {researches.data.map((research) => (
              <article
                key={research.id}
                className="flex flex-col justify-between rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-xs">
                      {t(`researches.statuses.${research.status}`, {
                        defaultValue: research.status,
                      })}
                    </Badge>
                    <Badge variant={research.is_public ? 'secondary' : 'outline'} className="text-xs">
                      {visibilityLabel(research.is_public)}
                    </Badge>
                  </div>
                  <h2 className="line-clamp-2 text-base font-semibold">
                    {research.title || t('researches.card.untitled')}
                  </h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {research.excerpt || t('researches.card.noSummary')}
                  </p>
                  {research.author && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {research.author.name ?? research.author.email}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{research.created_at ? formatDate(research.created_at) : ''}</span>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/researches/${research.id}`}>
                      {t('actions.view', { defaultValue: 'View' })}
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination links={researches.links ?? []} />
      </div>
    </AppLayout>
  );
}

function LabelledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide">
      <span>{label}</span>
      {children}
    </label>
  );
}

