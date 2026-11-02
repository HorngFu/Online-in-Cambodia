import Link from "next/link";
import type { ReactNode } from "react";

export type Crumb = { href: string; label: string };

export function PageHeader({
  title,
  subtitle,
  description,
  crumbs = [],
  crumbLabel,
  children,
}: {
  title: string;
  subtitle?: string | null;
  description?: ReactNode;
  crumbs?: Crumb[];
  crumbLabel: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 pt-8 pb-6">
      {crumbs.length > 0 && (
        <nav aria-label={crumbLabel}>
          <ol className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
            {crumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
                <span aria-hidden>/</span>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-lg text-muted">{subtitle}</p>}
      </div>
      {description && <div className="max-w-2xl text-muted">{description}</div>}
      {children}
    </header>
  );
}
