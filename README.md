# Online in Cambodia

**An open-source, community-maintained directory of organizations, companies, shops, places and brands in Cambodia, showing which online platforms each one is on — and which it is not on.**

> 🚧 **Status:** early development. Preview: https://online-in-cambodia.horngfu.workers.dev · See the [roadmap](docs/DEVELOPMENT_PHASES.md) and [progress tracker](docs/DEVELOPMENT_PHASES.md#7-progress-tracker).

## Why

It is often hard to know where a business or organization in Cambodia actually lives online. Is this shop on Telegram? Does this NGO have a website? Can I pay this café with KHQR? Is that Facebook page the official one or a fake?

Online in Cambodia answers these questions in one place:

- 🔎 **Search** any listing by name, in English or Khmer.
- ✅ ❌ ❔ **See a platform grid** for each listing: available (with a link), not available, or unknown.
- 🧭 **Filter** by type, category, province and platform, including "who is *not* on this platform".
- ✍️ **Suggest** a new listing or a correction without writing any code.
- 📂 **Reuse the data**, which is open under CC BY-SA 4.0.

## Tech stack

| Part | Tool |
| --- | --- |
| Framework | [Next.js](https://nextjs.org/) (App Router, TypeScript) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| CMS | [Keystatic](https://keystatic.com/) (content stored as files in this repo) |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com/) via [OpenNext](https://opennext.js.org/cloudflare) |
| Languages | English and Khmer |

Why these choices: [docs/DECISIONS.md](docs/DECISIONS.md).

## Getting started

Requires Node.js 24 (see `.nvmrc`).

```bash
npm install
npm run dev
```

- Website: http://localhost:3000 (redirects to `/en`; Khmer is at `/km`)
- Content editor (Keystatic): http://localhost:3000/keystatic

To run the production build in Cloudflare's local runtime, use `npm run preview`. Deployment is covered in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Contributing

You don't need to be a developer to help.

| I want to… | How |
| --- | --- |
| Add a missing organization or business | [Suggest a new listing](https://github.com/HorngFu/Online-in-Cambodia/issues/new?template=new-listing.yml) |
| Fix wrong or outdated information | [Suggest a correction](https://github.com/HorngFu/Online-in-Cambodia/issues/new?template=correction.yml) |
| Report a fake or scam page | [Report a fake page](https://github.com/HorngFu/Online-in-Cambodia/issues/new?template=report-fake.yml) |
| Report a website bug | [Report a bug](https://github.com/HorngFu/Online-in-Cambodia/issues/new?template=bug-report.yml) |
| Write code or improve docs | Read [CONTRIBUTING.md](CONTRIBUTING.md) |

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Documentation

- [Development phases (roadmap)](docs/DEVELOPMENT_PHASES.md)
- [Decisions](docs/DECISIONS.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Content guide](docs/CONTENT_GUIDE.md)
- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## License

- **Code:** [MIT](LICENSE)
- **Data** (everything in `content/`): [CC BY-SA 4.0](DATA_LICENSE.md)
- **Logos and trademarks** belong to their respective owners and are shown only to identify each listing.
