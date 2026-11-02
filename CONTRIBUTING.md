# Contributing to Online in Cambodia

Thank you for helping make Cambodia's online presence easier to find! There are many ways to help, and most of them need no coding.

By taking part, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

### 1. Suggest a listing or correction (no coding)

Use the issue forms. An editor will review and add your suggestion.

- [Suggest a new listing](https://github.com/HorngFu/Online-in-Cambodia/issues/new?template=new-listing.yml)
- [Suggest a correction](https://github.com/HorngFu/Online-in-Cambodia/issues/new?template=correction.yml)
- [Report a fake or scam page](https://github.com/HorngFu/Online-in-Cambodia/issues/new?template=report-fake.yml)

Good suggestions include a **source**: a link to the official website or page where the information can be checked.

### 2. Become an editor

Editors add and verify listings directly in the Keystatic editor (see the [content guide](docs/CONTENT_GUIDE.md)). If you'd like to become one, open an issue titled "Editor request" and tell us a little about yourself and which areas (provinces or categories) you know well.

### 3. Contribute code or documentation

See [Development workflow](#development-workflow) below.

## Data rules

These rules keep the directory trustworthy.

1. **Public information only.** Never add private phone numbers, personal addresses, or personal social accounts of individuals.
2. **Official channels only.** Only link to pages run by the organization itself. Mark a link as official only when you are confident it is.
3. **"Unknown" is not "Not available".** Leave a platform out (unknown) unless you have checked and are sure the organization is not on it.
4. **Always add a source** and update the "last verified" date when you check a listing.
5. **No promotion.** Listings are neutral. No ratings, ads, or marketing text.
6. **Use English and Khmer names** when you know both. Don't guess a Khmer spelling.

## Development workflow

1. **Find or open an issue** describing the change, so work isn't duplicated.
2. **Fork** the repository (or create a branch if you are a maintainer).
3. **Create a branch** with a clear name: `feat/search-filters`, `fix/khmer-font`, `content/add-siem-reap-cafes`.
4. **Run locally:**
   ```bash
   npm install
   npm run dev
   ```
5. **Check your work** before pushing:
   ```bash
   npm run lint
   npm run typecheck
   npm run format:check
   npm run preview   # production build in Cloudflare's local runtime
   ```
6. **Open a pull request** using the template, and link the issue (`Closes #123`).
7. A maintainer will review it. CI must pass before merging.

### Commit messages

Use short, descriptive messages. Prefixes help: `feat:`, `fix:`, `docs:`, `content:`, `chore:`.

### Code style

- TypeScript, formatted with Prettier (`npm run format`) and checked with ESLint.
- Keep components small and accessible: use icons *and* text, never color alone, to show availability.
- Every user-facing string goes in the translation files: `src/i18n/dictionaries/en.json` and `km.json`.

## Corrections and takedown requests

If you represent a listed organization and believe information is wrong or should be removed:

1. Open a [correction request](https://github.com/HorngFu/Online-in-Cambodia/issues/new?template=correction.yml), or
2. If the request involves private information, contact the maintainers privately through the repository owner's GitHub profile rather than a public issue.

We aim to respond within 7 days.

## Questions

Open an issue with the `question` label. We're happy to help.
