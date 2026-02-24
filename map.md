# Pet Pass Vienna — Project Map

## Overview

Pet Pass Vienna is a customer-facing marketing website for a pet healthcare membership service targeting Vienna, Austria. Pet owners choose from three subscription tiers (Basic, Care Plus, VIP) to save on vet checkups, vaccinations, grooming, and partner discounts. The site features a built-in cost calculator that analyzes a user's pet profile and recommends the optimal plan with projected savings.

**Key capabilities:**

- Three-tier membership pricing (Basic €16/mo, Care Plus €39/mo, VIP €99/mo)
- Multi-step pet survey with personalized cost breakdown and plan recommendation
- Multi-language support (English and German)
- Waitlist / lead capture powered by Formspree
- Dual-app structure: customer-facing site (`/`) and veterinary professional portal (`/vetpro/`)
- SEO-optimized with structured data, Open Graph, and geo-targeting for Vienna

**Intended users:** Vienna pet owners (dogs, cats, rabbits) and veterinary professionals.

---

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Framework      | React 19.2.4                                    |
| Language       | TypeScript 5.8.2                                |
| Build Tool     | Vite 6.2.0                                      |
| Styling        | Tailwind CSS (CDN) + Google Fonts (Plus Jakarta Sans) |
| Icons          | Lucide React 0.563.0                            |
| State Mgmt     | React Context API                               |
| Form Backend   | Formspree (`https://formspree.io/f/mvzrvyel`)   |
| JS Target      | ES2022 / ESNext modules                         |
| Package Mgr    | npm                                             |

---

## File Tree

```
PetPass/
├── App.tsx                  # Main application — all components, logic, and UI
├── index.tsx                # React DOM entry point
├── index.html               # HTML shell with SEO metadata and CDN links
├── types.ts                 # Shared TypeScript type definitions
├── translations.ts          # i18n strings (English + German)
├── vite.config.ts           # Vite build and dev-server configuration
├── package.json             # Dependencies and npm scripts
├── package-lock.json        # Locked dependency versions
├── tsconfig.json            # TypeScript compiler options
├── metadata.json            # Project name and description
├── README.md                # Project documentation
│
├── public/                  # Static assets served at root
│   ├── favicon.png          # App favicon (PNG)
│   ├── favicon.svg          # App favicon (SVG)
│   ├── french-bulldog.png   # Decorative image
│   ├── hero-dog.png         # Hero section image
│   ├── logo.png             # Brand logo
│   ├── robots.txt           # Search-engine crawling rules
│   └── sitemap.xml          # XML sitemap for SEO
│
└── vetpro/                  # Veterinary professional portal (parallel app)
    ├── App.tsx
    ├── index.tsx
    ├── index.html
    ├── types.ts
    ├── translations.ts
    ├── vite.config.ts
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── metadata.json
    ├── README.md
    └── public/              # Static assets (mirrors main public/)
        ├── favicon.png
        ├── favicon.svg
        ├── french-bulldog.png
        ├── hero-dog.png
        ├── logo.png
        ├── robots.txt
        └── sitemap.xml
```

---

## Detailed File Descriptions

### `App.tsx`

- **Path:** `/App.tsx` (1,538 lines)
- **Purpose:** The monolithic application file. Contains every React component, custom hook, constant, and business-logic function for the customer-facing site.
- **Key Components:**
  | Name | Line | Description |
  | --- | --- | --- |
  | `LanguageContext` | 41 | React context providing `lang`, `setLang`, and `t` (translations) |
  | `useLanguage()` | 51 | Hook to consume the language context |
  | `LanguageSwitcher` | 55 | EN/DE toggle button pair |
  | `Navbar` | 83 | Sticky navigation bar with mobile hamburger menu |
  | `VIENNA_VET_PRICES` | 134 | Hardcoded 2025/2026 Vienna veterinary pricing data |
  | `PLAN_PRICES` | 161 | Monthly cost per plan tier (`basic: 16`, `care_plus: 39`, `vip: 99`) |
  | `calculateCosts()` | 167 | Core business logic — computes annual cost breakdown and recommends a plan |
  | `WaitlistModal` | 258 | Multi-step modal with quick-join and 5-step survey flows |
  | `FAQItem` | 1018 | Accordion-style FAQ entry |
  | `StickyMobileCTA` | 1043 | Floating mobile call-to-action that appears after 600px scroll |
  | `useFoundingSpots()` | 1072 | Calculates remaining "Founding 100" spots based on current date |
  | `useScrollReveal()` | 1087 | Intersection Observer hook for fade-in scroll animations |
  | `App` (default export) | ~1100 | Root component — wraps everything in `LanguageContext.Provider` and renders all page sections |
- **Dependencies:** `react`, `lucide-react`, `./types`, `./translations`
- **Interactions:** Renders the entire SPA. Submits lead-capture data to Formspree via `fetch` POST. Consumes types from `types.ts` and translations from `translations.ts`.

---

### `index.tsx`

- **Path:** `/index.tsx` (17 lines)
- **Purpose:** React DOM entry point. Mounts `<App />` into the `#root` element.
- **Key Components:** `ReactDOM.createRoot()`, `React.StrictMode` wrapper.
- **Dependencies:** `react`, `react-dom/client`, `./App`
- **Interactions:** Referenced by `index.html` via Vite's module script tag.

---

### `index.html`

- **Path:** `/index.html` (283 lines)
- **Purpose:** HTML shell loaded by Vite. Contains comprehensive SEO metadata, structured data, and CDN links.
- **Key Components:**
  - Primary meta tags (title, description, keywords, canonical URL)
  - Open Graph and Twitter Card meta tags
  - Geo-targeting tags (Vienna: 48.2082, 16.3738)
  - Language alternates (`en`, `de-AT`)
  - JSON-LD structured data: `LocalBusiness`, `Service`, `FAQPage`, `Organization`
  - Tailwind CSS CDN (`<script src="https://cdn.tailwindcss.com">`)
  - Google Fonts CDN (Plus Jakarta Sans)
  - Custom Tailwind config (animations: `fade-up`, delay utilities)
- **Dependencies:** Tailwind CSS CDN, Google Fonts CDN, `/index.tsx` (via `<script type="module">`)
- **Interactions:** Provides the `#root` div that `index.tsx` mounts into. Supplies global styles and fonts to all components.

---

### `types.ts`

- **Path:** `/types.ts` (54 lines)
- **Purpose:** Shared TypeScript type definitions used across the application.
- **Key Components:**
  | Type | Kind | Description |
  | --- | --- | --- |
  | `PricingTier` | interface | Plan card data (name, price, description, features, isPopular) |
  | `District` | union | Vienna districts: 1st–9th + "Other (10-23)" |
  | `PetType` | union | `'dog' \| 'cat' \| 'rabbit' \| 'other'` |
  | `PetAge` | union | `'puppy_kitten' \| 'young' \| 'adult' \| 'senior'` |
  | `VetFrequency` | union | `'rarely' \| 'once_year' \| 'twice_year' \| 'quarterly' \| 'monthly'` |
  | `HealthCondition` | union | 9 conditions including `'none'` |
  | `PetSurveyData` | interface | Survey form state (petType, petCount, petAge, vetFrequency, healthConditions, groomingFrequency) |
  | `CostBreakdown` | interface | Calculator output (itemized costs, recommendedPlan, planCost, annualSavings, savingsPercentage) |
- **Dependencies:** None (standalone type definitions).
- **Interactions:** Imported by `App.tsx` for type-safe survey data and cost calculations.

---

### `translations.ts`

- **Path:** `/translations.ts` (597 lines)
- **Purpose:** Contains all user-facing text in English and German. Exports the `Language` type and `translations` object.
- **Key Components:**
  - `Language` type: `'en' | 'de'`
  - `Translations` type (inferred from the object structure)
  - `translations` object with keys: `nav`, `hero`, `problem`, `howItWorks`, `pricing`, `partners`, `faq`, `survey`, `trust`, `waitlist`, `footer`, `stickyCta`
- **Dependencies:** None.
- **Interactions:** Imported by `App.tsx`. The `LanguageContext` provides `t` (the active language's translations) to all components via `useLanguage()`.

---

### `vite.config.ts`

- **Path:** `/vite.config.ts` (23 lines)
- **Purpose:** Vite build-tool configuration.
- **Key Components:**
  - Dev server: port `3000`, host `0.0.0.0`
  - React plugin (`@vitejs/plugin-react`)
  - Environment variable injection: `GEMINI_API_KEY` → `process.env.API_KEY` / `process.env.GEMINI_API_KEY`
  - Path alias: `@/` resolves to project root
- **Dependencies:** `vite`, `@vitejs/plugin-react`, `path`
- **Interactions:** Consumed by Vite CLI (`npm run dev`, `npm run build`).

---

### `package.json`

- **Path:** `/package.json`
- **Purpose:** npm project manifest.
- **Key Components:**
  - **Name:** `vienna-pet-club`
  - **Scripts:** `dev` (vite), `build` (vite build), `preview` (vite preview)
  - **Dependencies:** `react`, `react-dom`, `lucide-react`
  - **DevDependencies:** `@types/node`, `@vitejs/plugin-react`, `typescript`, `vite`
- **Dependencies:** N/A (this is the dependency root).
- **Interactions:** Defines the scripts that `vite.config.ts` uses and the packages all source files import.

---

### `tsconfig.json`

- **Path:** `/tsconfig.json`
- **Purpose:** TypeScript compiler configuration.
- **Key Components:** Target ES2022, ESNext modules, bundler module resolution, `react-jsx` JSX transform, `@/*` path alias.
- **Dependencies:** None.
- **Interactions:** Consumed by TypeScript compiler and Vite during builds.

---

### `metadata.json`

- **Path:** `/metadata.json`
- **Purpose:** Project metadata (name: "Vienna Pet Club", description of the membership service).
- **Dependencies:** None.
- **Interactions:** May be consumed by hosting platforms or build tooling.

---

### `public/` Directory

| File | Purpose |
| --- | --- |
| `favicon.png` / `favicon.svg` | Browser tab icon (PNG and SVG variants) |
| `hero-dog.png` | Hero section background image (315 KB) |
| `french-bulldog.png` | Decorative image used in content sections (221 KB) |
| `logo.png` | Brand logo used in Navbar and footer (17 KB) |
| `robots.txt` | Instructs search-engine crawlers |
| `sitemap.xml` | XML sitemap listing site URLs for SEO |

All files are served statically at the root path by Vite.

---

### `vetpro/` Directory

- **Path:** `/vetpro/`
- **Purpose:** A parallel, standalone application for veterinary professionals. Shares the same architecture and tech stack as the main app but with different content and pricing.
- **Key Differences from Main App:**
  - Different plan pricing (Basic: €19/mo vs €16/mo in main)
  - Simplified waitlist flow (no quick-join option)
  - Different plan benefit descriptions
  - Separate Vite dev server and build pipeline
- **Structure:** Mirrors the root application exactly (`App.tsx`, `index.tsx`, `index.html`, `types.ts`, `translations.ts`, `vite.config.ts`, `package.json`, `tsconfig.json`, `metadata.json`, `public/`).
- **Dependencies:** Same as the main app (React, Lucide, Tailwind CDN).
- **Interactions:** Fully independent — does not share code with the main app at runtime. Types and structure are duplicated.

---

## Key Workflows

### 1. Landing Page Rendering

```
Browser → index.html → Vite loads index.tsx
  → ReactDOM.createRoot(#root)
    → <App />
      → LanguageContext.Provider (default: 'en')
        → Navbar
        → Hero Section (founding spots counter via useFoundingSpots)
        → Problem/Solution Cards
        → How It Works (3 steps)
        → Pricing Plans (3 tiers)
        → Partners Section
        → FAQ Accordion (FAQItem components)
        → Lead Capture CTA
        → Footer
        → StickyMobileCTA (visible after 600px scroll)
```

### 2. Quick Join Flow

```
User clicks "Join the Waitlist" → WaitlistModal opens (flowType: 'quick')
  → User selects Vienna district
  → User enters email
  → Submit → POST to Formspree API
    Payload: { email, district, language, source: 'quick_join' }
  → Success screen displayed
```

### 3. Survey Flow (5 Steps)

```
User clicks "Calculate My Savings" → WaitlistModal opens (flowType: 'survey')
  → Step 1: Select pet type, count, age
  → Step 2: Select vet visit frequency
  → Step 3: Select health conditions (multi-select)
  → Step 4: Select grooming frequency
  → Step 5: View cost breakdown (powered by calculateCosts)
    → User enters district + email
    → Submit → POST to Formspree API
      Payload: { email, district, language, source: 'survey',
                 petType, petCount, petAge, vetFrequency,
                 healthConditions, groomingFrequency,
                 estimatedAnnualCost, recommendedPlan,
                 estimatedSavings, savingsPercentage }
    → Success screen with personalized savings
```

### 4. Cost Calculation (`calculateCosts`)

```
Input: PetSurveyData
  │
  ├─ Annual checkups = visits/year × €40 × petCount
  ├─ Vaccinations = (€65 basic + €45 rabies) × petCount
  │     × 1.5 if puppy/kitten, × 1.2 if senior
  ├─ Health condition costs = sum of condition costs × petCount
  │     × 1.3 if senior
  ├─ Grooming = frequency × price-by-pet-type × petCount
  ├─ Emergency buffer = 15% of subtotal
  │
  ├─ Plan recommendation:
  │     VIP if: 2+ conditions OR grooming ≥ 4/yr OR senior
  │     Care Plus if: 1+ condition OR grooming > 2/yr OR checkups > 2/yr
  │     Basic otherwise
  │
  └─ Savings = membershipValue − annualPlanCost
       (membershipValue includes covered checkups, vaccinations,
        grooming sessions, dental cleaning, and discount percentages)

Output: CostBreakdown
```

### 5. Language Switching

```
User clicks EN or DE in LanguageSwitcher
  → setLang() updates LanguageContext state
  → All components consuming useLanguage() re-render
  → UI text updates instantly (no page reload)
```

---

## Configuration & Environment

| File | Role |
| --- | --- |
| `vite.config.ts` | Dev server (port 3000, host 0.0.0.0), React plugin, `GEMINI_API_KEY` env injection, `@/` path alias |
| `tsconfig.json` | ES2022 target, bundler module resolution, `react-jsx`, `@/*` path mapping |
| `package.json` | npm scripts: `dev`, `build`, `preview`; runtime and dev dependencies |
| `index.html` | Tailwind CSS CDN, Google Fonts CDN, SEO metadata, structured data |
| `metadata.json` | Project name ("Vienna Pet Club") and description |
| `public/robots.txt` | Search-engine crawl directives |
| `public/sitemap.xml` | XML sitemap for search indexing |

**Environment Variables:**
- `GEMINI_API_KEY` — Configured in `vite.config.ts` but currently unused in application code. Would be sourced from `.env.local` (not checked into version control).

**External Service:**
- Formspree endpoint `https://formspree.io/f/mvzrvyel` — receives all waitlist form submissions via POST.

---

## Future Considerations

- **No test suite:** No testing framework, test files, or test scripts exist. Adding unit tests (for `calculateCosts`) and component tests would improve reliability.
- **Monolithic App.tsx:** The ~1,538-line single file contains all components, hooks, and business logic. Splitting into a `components/`, `hooks/`, and `utils/` directory structure would improve maintainability.
- **Code duplication with vetpro:** The `vetpro/` app duplicates the main app's types, translations structure, and most component code. Extracting shared code into a common package or shared directory would reduce maintenance burden.
- **No authentication or user accounts:** The app is purely a lead-capture landing page. Adding user accounts would require a backend and auth system.
- **Unused GEMINI_API_KEY:** The Vite config injects this env variable, but no code references it. Either integrate it or remove the configuration.
- **Static pricing data:** Vet prices are hardcoded constants. A CMS or API-driven approach would allow non-developer updates.
