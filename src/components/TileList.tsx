import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export type Tile = {
  href: string;
  label: string;
  sublabel?: string | null;
  count?: string;
  icon?: LucideIcon;
};

/** A grid of links with optional counts, used on index and home pages. */
export function TileList({
  tiles,
  columns = "sm:grid-cols-2 lg:grid-cols-4",
}: {
  tiles: Tile[];
  columns?: string;
}) {
  return (
    <ul className={`grid gap-2 ${columns}`}>
      {tiles.map(({ href, label, sublabel, count, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className="flex h-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-accent hover:bg-surface"
          >
            {Icon && (
              <Icon aria-hidden className="size-4 shrink-0 text-muted" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{label}</span>
              {sublabel && (
                <span className="block truncate text-sm text-muted">
                  {sublabel}
                </span>
              )}
            </span>
            {count && (
              <span className="shrink-0 text-sm text-muted">{count}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
