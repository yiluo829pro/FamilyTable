# Family Table

A family food memory and gathering coordination app. Preserve dish libraries across generations, log food experiences, coordinate dinner parties, and keep your family's food culture in one place.

## What it does

**My Tables** — each Table is a shared family space for everything you cook at home.
- **Food** — dish library with recipes, stories, photos, dietary tags, and cook time. Filter by Active / Memory / Archived.
- **Drinks** — log coffee, wine, beer, spirits, sake, tea, and non-alcoholic drinks with sub-type filters and ratings.
- **Misc** — snacks, condiments, instant noodles, baked goods, and other pantry favourites.
- **Collections** — curated shareable lists from your table (e.g. "Summer BBQ picks").
- **Events** — dinner party coordination with guest voting, potluck sign-ups, and food fund bidding.

**Experiences** — a personal journal for food outside the home kitchen.
- Restaurant and café visits with address, ambiance tags, dishes tried, and would-return rating.
- Travel food moments — log what you ate on a trip with per-moment notes.
- Cookbooks — author, cuisine focus, favourite recipes.
- **Add to cooking wishlist** — one tap to push an experience dish into your table as a new dish idea.

**Photo flow** — upload multiple photos, drag to crop to the exact frame you want, choose a cover. The crop is applied before upload so what you see in the picker is exactly what appears on the card.

**Invite co-managers** — share a table with family members via an invite link. Co-managers can add and edit items.

## Tech stack

- **Frontend** — React + Vite + TypeScript
- **Styling** — Tailwind CSS with custom design tokens (forest green, amber, cream)
- **Backend** — Supabase (PostgreSQL + Row Level Security + Storage + Auth)
- **State** — Zustand (auth), TanStack React Query (server data)
- **Routing** — React Router v6

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/yiluo829pro/FamilyTable.git
cd FamilyTable
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the full contents of `supabase/schema.sql`
3. Then run `supabase/migrations/001_experiences_top_level.sql`
4. In Storage, create a public bucket called `item-photos` with two policies:
   - **SELECT** — all roles (public reads)
   - **INSERT** — authenticated role only (uploads)

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in your Supabase project URL and anon key:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

```
src/
  components/
    dishes/         # DishForm, DishCard
    drinks/         # DrinkForm, DrinkCard
    misc/           # MiscForm, MiscCard
    experiences/    # ExperienceForm, ExperienceCard
    collections/    # CollectionCard
    ui/             # SearchableDropdown, StarRating, TagChips, PhotoCropPicker
    Layout/         # Navbar, AppLayout
  pages/
    dishes/         # NewDish, EditDish
    drinks/         # NewDrink, EditDrink
    misc/           # NewMisc, EditMisc
    experiences/    # ExperienceList, NewExperience, EditExperience
    tables/         # TableDetail, NewTable
    collections/    # NewCollection, CollectionDetail, CollectionPublic
    events/         # NewEvent, EventAdmin, EventBroadcast
    vote/           # VotePage (guest-facing)
  data/
    seeds.ts        # Pre-seeded brand/option arrays for dropdowns
  lib/
    supabase.ts
    uploadPhoto.ts
  store/
    authStore.ts
  types/
    index.ts
    database.ts     # Supabase-generated type definitions
supabase/
  schema.sql                              # Full database schema
  migrations/
    001_experiences_top_level.sql         # Make experiences personal (not table-scoped)
```
