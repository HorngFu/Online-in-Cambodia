import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { format, labelOf, localName } from "@/i18n/helpers";
import {
  groupStatuses,
  type PlatformState,
  type PlatformStatus,
} from "@/lib/content";
import { paths } from "@/lib/paths";
import { platformGroups } from "@/lib/taxonomy";
import { groupIcons, StateIcon } from "./icons";

function stateLabel(dict: Dictionary, state: PlatformState) {
  if (state === "available") return dict.listing.available;
  if (state === "not_available") return dict.listing.notAvailable;
  return dict.listing.unknown;
}

function StatusRow({
  status,
  lang,
  dict,
}: {
  status: PlatformStatus;
  lang: Locale;
  dict: Dictionary;
}) {
  const name = localName(status.platform, lang).primary;
  const label = stateLabel(dict, status.state);
  const rowColors: Record<PlatformState, string> = {
    available: "border-available/30 bg-available-bg",
    not_available: "border-not-available/30 bg-not-available-bg",
    unknown: "border-border",
  };

  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${rowColors[status.state]}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <StateIcon state={status.state} />
        <div className="min-w-0">
          <Link
            href={paths.platform(lang, status.platform.slug)}
            className="font-medium hover:underline"
          >
            {name}
          </Link>
          <span className="sr-only">: {label}</span>
          {status.handle && (
            <span className="ml-2 text-sm text-muted">{status.handle}</span>
          )}
          {!status.isOfficial && (
            <p className="text-xs text-muted">{dict.listing.unofficial}</p>
          )}
          {status.note && <p className="text-xs text-muted">{status.note}</p>}
        </div>
      </div>
      {status.url ? (
        <a
          href={status.url}
          rel="noopener nofollow"
          target="_blank"
          className="flex shrink-0 items-center gap-1 text-sm text-accent hover:underline"
        >
          <span aria-hidden>{dict.listing.open}</span>
          <span className="sr-only">
            {format(dict.listing.visit, { platform: name })}
          </span>
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      ) : (
        <span aria-hidden className="shrink-0 text-sm text-muted">
          {label}
        </span>
      )}
    </li>
  );
}

/**
 * Checked platforms (available / not available) grouped by platform group,
 * with unchecked ones folded into a native <details> so no JS is needed.
 */
export function PlatformGrid({
  statuses,
  lang,
  dict,
}: {
  statuses: PlatformStatus[];
  lang: Locale;
  dict: Dictionary;
}) {
  const checked = statuses.filter((s) => s.state !== "unknown");
  const unknown = statuses.filter((s) => s.state === "unknown");

  return (
    <div className="flex flex-col gap-6">
      {groupStatuses(checked).map(({ group, statuses: items }) => {
        const Icon = groupIcons[group.value];
        return (
          <section key={group.value} className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted">
              <Icon aria-hidden className="size-4" />
              {labelOf(platformGroups, group.value, lang)}
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map((status) => (
                <StatusRow
                  key={status.platform.slug}
                  status={status}
                  lang={lang}
                  dict={dict}
                />
              ))}
            </ul>
          </section>
        );
      })}

      {unknown.length > 0 && (
        <details className="rounded-lg border border-border">
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
            {format(dict.listing.showUnknown, { count: unknown.length })}
          </summary>
          <div className="flex flex-col gap-3 border-t border-border px-3 py-3">
            <p className="text-sm text-muted">{dict.listing.unknownHelp}</p>
            <ul className="flex flex-wrap gap-2">
              {unknown.map((status) => (
                <li
                  key={status.platform.slug}
                  className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-sm"
                >
                  <StateIcon state="unknown" className="size-3.5" />
                  {localName(status.platform, lang).primary}
                  <span className="sr-only">: {dict.listing.unknown}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}
