import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export default function Pagination({ links }: { links: PaginationLink[] }) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <nav className="mt-6 flex flex-wrap items-center gap-2" aria-label="Pagination">
            {links.map((link, index) => {
                const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');

                if (!link.url) {
                    return (
                        <span
                            key={`${label}-${index}`}
                            className="rounded-md border border-transparent px-3 py-1.5 text-sm text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={link.url + index}
                        href={link.url}
                        className={`rounded-md border px-3 py-1.5 text-sm transition ${
                            link.active
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground'
                        }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </nav>
    );
}
