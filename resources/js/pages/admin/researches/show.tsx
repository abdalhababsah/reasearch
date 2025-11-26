import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/i18n';
import { Download, Eye, FileIcon, ArrowLeft, ExternalLink } from 'lucide-react';

interface Category {
  id: number;
  name_en: string | null;
  name_ar: string | null;
}

interface Tag {
  id: number;
  name_en: string | null;
  name_ar: string | null;
}

interface Author {
  id: number;
  name: string | null;
  email: string;
}

interface ResearchFile {
  id: number;
  name: string;
  type: string;
  size_bytes: number;
  mime_type: string;
  is_primary: boolean;
  is_visible: boolean;
  url?: string | null;
}

interface ResearchShowProps {
  research: {
    id: number;
    title: string | null;
    title_en?: string | null;
    title_ar?: string | null;
    abstract?: string | null;
    status: string;
    is_public: boolean;
    allow_document_view: boolean;
    allow_dataset_browse: boolean;
    created_at?: string | null;
    author?: Author | null;
    categories: Category[];
    tags: Tag[];
    files: ResearchFile[];
  };
  statusOptions: string[];
}

export default function AdminResearchShow({ research, statusOptions }: ResearchShowProps) {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<'list' | 'viewer'>('list');
  const [selectedFile, setSelectedFile] = useState<ResearchFile | null>(null);

  const handleUpdate = (newStatus: string, newVisibility: boolean) => {
    router.put(`/admin/researches/${research.id}`, {
      status: newStatus,
      is_public: newVisibility,
    });
  };

  const toggleVisibility = () => {
    handleUpdate(research.status, !research.is_public);
  };

  const publish = () => {
    handleUpdate('published', true);
  };

  const unpublish = () => {
    handleUpdate('draft', false);
  };

  const handleViewFile = (file: ResearchFile) => {
    if (!file.url) return;
    setSelectedFile(file);
    setCurrentView('viewer');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedFile(null);
  };

  const handleDownloadFile = (file: ResearchFile) => {
    if (!file.url) return;
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = (file: ResearchFile) => {
    if (!file.url) return;
    window.open(file.url, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
    return '📎';
  };

  const docs = selectedFile?.url
    ? [
        {
          uri: selectedFile.url,
          fileName: selectedFile.name,
          fileType: selectedFile.mime_type,
        },
      ]
    : [];

  return (
    <AppLayout
      breadcrumbs={[
        { title: t('researches.title'), href: '/admin/researches' },
        { title: research.title ?? t('researches.card.untitled'), href: '#' },
      ]}
    >
      <Head title={research.title ?? t('researches.card.untitled')} />

      <div className="flex flex-1 flex-col gap-6 p-4">
        {/* Header - Only show when in list view */}
        {currentView === 'list' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {t(`researches.statuses.${research.status}`, {
                      defaultValue: research.status,
                    })}
                  </Badge>
                  <Badge variant={research.is_public ? 'secondary' : 'outline'}>
                    {research.is_public
                      ? t('researches.visibility.public')
                      : t('researches.visibility.private')}
                  </Badge>
                </div>
                <h1 className="text-2xl font-semibold">
                  {research.title ?? t('researches.card.untitled')}
                </h1>
                {research.author && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {research.author.name ?? research.author.email}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {research.status !== 'published' && (
                  <Button onClick={publish}>
                    {t('researches.actions.publish', { defaultValue: 'Publish' })}
                  </Button>
                )}
                {research.status === 'published' && (
                  <Button variant="outline" onClick={unpublish}>
                    {t('researches.actions.unpublish', { defaultValue: 'Unpublish' })}
                  </Button>
                )}
                <Button variant="outline" onClick={toggleVisibility}>
                  {research.is_public
                    ? t('researches.actions.makePrivate', { defaultValue: 'Make private' })
                    : t('researches.actions.makePublic', { defaultValue: 'Make public' })}
                </Button>
              </div>
            </div>

            {/* Overview */}
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">
                {t('researches.show.overview', { defaultValue: 'Overview' })}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {research.abstract ?? t('researches.card.noSummary')}
              </p>
            </section>

            {/* Metadata */}
            <section className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
              <h3 className="text-base font-semibold">
                {t('researches.show.metadata', { defaultValue: 'Metadata' })}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t('researches.show.status', { defaultValue: 'Status' })}
                  </p>
                  <p className="text-sm mt-1">
                    {t(`researches.statuses.${research.status}`, {
                      defaultValue: research.status,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t('researches.show.visibility', { defaultValue: 'Visibility' })}
                  </p>
                  <p className="text-sm mt-1">
                    {research.is_public
                      ? t('researches.visibility.public')
                      : t('researches.visibility.private')}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Files Section - Always Visible */}
        <section className="rounded-xl border bg-card shadow-sm flex flex-col min-h-[600px]">
          {/* File Explorer Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              {currentView === 'viewer' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('actions.back', { defaultValue: 'Back' })}
                </Button>
              )}
              <h3 className="text-base font-semibold">
                {currentView === 'list'
                  ? `${t('researches.show.filesSection', { defaultValue: 'Files' })} (${research.files?.length || 0})`
                  : selectedFile?.name}
              </h3>
            </div>

            {/* Action buttons when viewing file */}
            {currentView === 'viewer' && selectedFile && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('actions.download', { defaultValue: 'Download' })}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenInNewTab(selectedFile)}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('actions.openNewTab', { defaultValue: 'Open in New Tab' })}
                </Button>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {currentView === 'list' ? (
              /* File List View */
              research.files && research.files.length ? (
                <div className="space-y-2">
                  {research.files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleViewFile(file)}
                      disabled={!file.url}
                      className="w-full flex items-center justify-between gap-4 rounded-lg border bg-background p-4 transition-all hover:bg-muted/50 hover:shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 text-2xl">
                          {getFileIcon(file.mime_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            {file.is_primary && (
                              <Badge variant="default" className="text-[10px]">
                                {t('researches.form.primaryFile', { defaultValue: 'Primary' })}
                              </Badge>
                            )}
                            {!file.is_visible && (
                              <Badge variant="outline" className="text-[10px]">
                                {t('researches.show.disabled', { defaultValue: 'Hidden' })}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{file.mime_type}</span>
                            <span>•</span>
                            <span>{formatFileSize(file.size_bytes)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {file.url && (
                          <Eye className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {t('researches.show.noFiles', { defaultValue: 'No files uploaded yet.' })}
                  </p>
                </div>
              )
            ) : (
              /* File Viewer */
              selectedFile && selectedFile.url && (
                <div className="h-full min-h-[500px] rounded-lg border bg-muted/10 overflow-hidden">
                  <DocViewer
                    documents={docs}
                    pluginRenderers={DocViewerRenderers}
                    config={{
                      header: {
                        disableHeader: true,
                      },
                    }}
                    style={{
                      height: '100%',
                      minHeight: '500px',
                    }}
                  />
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}