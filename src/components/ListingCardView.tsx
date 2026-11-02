import Link from "next/link";
import type { PlatformGroup } from "@/lib/taxonomy";
import { groupIcons } from "./icons";

export type ListingCardData = {
  href: string;
  primary: string;
  secondary: string | null;
  meta: string;
  groups: PlatformGroup[];
  availableLabel: string;
};

/** Presentational card, shared by server pages and the client-side search. */
export function ListingCardView({
  href,
  primary,
  secondary,
  meta,
  groups,
  availableLabel,
}: ListingCardData) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-full flex-col gap-3 rounded-xl border border-border p-4 transition-colors hover:border-accent hover:bg-surface"
      >
        <div>
          <h3 className="font-semibold">{primary}</h3>
          {secondary && <p className="text-sm text-muted">{secondary}</p>}
        </div>
        <p className="text-sm text-muted">{meta}</p>
        <div className="mt-auto flex items-center gap-2 text-sm">
          <span className="flex gap-1 text-available" aria-hidden>
            {groups.map((group) => {
              const Icon = groupIcons[group];
              return <Icon key={group} className="size-4" />;
            })}
          </span>
          <span className="text-muted">{availableLabel}</span>
        </div>
      </Link>
    </li>
  );
}
