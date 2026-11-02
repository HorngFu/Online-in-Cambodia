import { collection, config, fields } from "@keystatic/core";
import {
  availabilityOptions,
  listingStatuses,
  listingTypes,
  platformGroups,
  provinces,
  toOptions,
} from "./src/lib/taxonomy";

// GitHub mode switches on once the GitHub App exists (Phase 5), signalled by
// its slug env var. Until then Keystatic runs in local mode, which only works
// with `npm run dev` because it edits files on disk.
export const isGitHubMode = Boolean(
  process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
);

export default config({
  storage: isGitHubMode
    ? { kind: "github", repo: "HorngFu/Online-in-Cambodia" }
    : { kind: "local" },
  ui: {
    brand: { name: "Online in Cambodia" },
    navigation: {
      Directory: ["listings"],
      Settings: ["platforms", "categories"],
    },
  },
  collections: {
    listings: collection({
      label: "Listings",
      slugField: "name",
      path: "content/listings/*",
      format: "yaml",
      columns: ["type", "lastVerified"],
      schema: {
        name: fields.slug({
          name: {
            label: "Name (English)",
            validation: { isRequired: true },
          },
          slug: {
            label: "URL slug",
            description:
              "Lowercase, hyphens only. Don't change it after publishing.",
          },
        }),
        nameKm: fields.text({
          label: "Name (Khmer)",
          description: "Leave empty if you don't know the correct spelling.",
        }),
        type: fields.select({
          label: "Type",
          options: toOptions(listingTypes),
          defaultValue: "company",
        }),
        categories: fields.multiRelationship({
          label: "Categories",
          collection: "categories",
          validation: { length: { min: 1 } },
        }),
        provinces: fields.multiselect({
          label: "Provinces",
          options: toOptions(provinces),
        }),
        description: fields.text({
          label: "Description (English)",
          description: "1–3 neutral sentences. No advertising.",
          multiline: true,
        }),
        descriptionKm: fields.text({
          label: "Description (Khmer)",
          multiline: true,
        }),
        logo: fields.image({
          label: "Logo",
          description: "Square WebP or PNG, 50 KB or less.",
          directory: "public/logos",
          publicPath: "/logos/",
        }),
        platforms: fields.array(
          fields.object({
            platform: fields.relationship({
              label: "Platform",
              collection: "platforms",
              validation: { isRequired: true },
            }),
            availability: fields.select({
              label: "Availability",
              options: toOptions(availabilityOptions),
              defaultValue: "available",
            }),
            url: fields.url({
              label: "Link",
              description:
                "Required when available, unless the platform doesn't use links.",
            }),
            handle: fields.text({
              label: "Handle or account name",
              description: "For example @browncoffeekh",
            }),
            isOfficial: fields.checkbox({
              label: "Official account",
              description: "Run by the organization itself.",
              defaultValue: true,
            }),
            note: fields.text({ label: "Note" }),
          }),
          {
            label: "Platforms",
            description:
              "Leave a platform out if you don't know. Only add 'Not available' after checking.",
            itemLabel: (props) =>
              `${props.fields.platform.value ?? "Choose a platform"} · ${
                props.fields.availability.value === "available"
                  ? "available"
                  : "not available"
              }`,
          },
        ),
        sources: fields.array(
          fields.url({
            label: "Source URL",
            validation: { isRequired: true },
          }),
          {
            label: "Sources",
            description: "Where this information can be checked.",
            itemLabel: (props) => props.value ?? "New source",
            validation: { length: { min: 1 } },
          },
        ),
        lastVerified: fields.date({
          label: "Last verified",
          defaultValue: { kind: "today" },
          validation: { isRequired: true },
        }),
        verifiedBy: fields.text({
          label: "Verified by",
          description: "GitHub username of the editor who checked it.",
        }),
        status: fields.select({
          label: "Status",
          options: toOptions(listingStatuses),
          defaultValue: "active",
        }),
      },
    }),

    platforms: collection({
      label: "Platforms",
      slugField: "name",
      path: "content/platforms/*",
      format: "yaml",
      columns: ["group", "order"],
      schema: {
        name: fields.slug({
          name: { label: "Name", validation: { isRequired: true } },
        }),
        nameKm: fields.text({ label: "Name (Khmer)" }),
        group: fields.select({
          label: "Group",
          options: toOptions(platformGroups),
          defaultValue: "social",
        }),
        urlPattern: fields.text({
          label: "Link pattern",
          description:
            "Optional regular expression that every link for this platform must match, e.g. ^https://(www\\.)?facebook\\.com/",
        }),
        linkRequired: fields.checkbox({
          label: "Link required",
          description:
            "Untick for things without a page to link to, such as KHQR or card payments.",
          defaultValue: true,
        }),
        order: fields.integer({
          label: "Display order",
          description: "Lower numbers show first within their group.",
          defaultValue: 100,
        }),
      },
    }),

    categories: collection({
      label: "Categories",
      slugField: "name",
      path: "content/categories/*",
      format: "yaml",
      columns: ["parent"],
      schema: {
        name: fields.slug({
          name: { label: "Name (English)", validation: { isRequired: true } },
        }),
        nameKm: fields.text({ label: "Name (Khmer)" }),
        parent: fields.relationship({
          label: "Parent category",
          description: "Optional. Only two levels, e.g. Food & Drink → Café.",
          collection: "categories",
        }),
      },
    }),
  },
});
