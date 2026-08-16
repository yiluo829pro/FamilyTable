# Family Table

A family food memory and gathering coordination app. Preserve dish libraries across generations, log food experiences, coordinate dinner parties, and keep your family's food culture in one place.

## What it does

**My Tables** — each Table is a shared family space for everything you cook at home.
- **Food** — dish library with recipes, stories, photos, dietary tags, and cook time. Filter by Active / Memory / Archived.
- **Drinks** — log coffee, wine, beer, spirits, sake, tea, and non-alcoholic drinks with sub-type filters and ratings.
- **Misc** — snacks, condiments, instant noodles, baked goods, and other pantry favourites.
- **Collections** — curated shareable lists from your table (e.g. "Summer BBQ picks").
- **Events** — dinner party coordination with guest voting, potluck sign-ups, and food fund bidding.

<img width="1259" height="1380" alt="Screenshot 2026-08-16 at 4 40 02 PM" src="https://github.com/user-attachments/assets/e0fc278b-9905-47d6-b05b-ae1b1ca9e23f" />

<img width="1250" height="952" alt="Screenshot 2026-08-16 at 5 33 01 PM" src="https://github.com/user-attachments/assets/5c062c21-ea95-4bcc-9e60-32d2e49c9f58" />

<img width="1259" height="933" alt="Screenshot 2026-08-16 at 4 43 54 PM" src="https://github.com/user-attachments/assets/fe637dcd-28e1-4fda-89b0-33090b26e7c1" />


<img width="1259" height="1500" alt="Screenshot 2026-08-16 at 4 44 30 PM" src="https://github.com/user-attachments/assets/fb468b9e-facb-4585-bc54-cae8969e429d" />

<img width="1259" height="1500" alt="Screenshot 2026-08-16 at 4 44 41 PM" src="https://github.com/user-attachments/assets/2eca3e55-b0e0-461a-ad86-3c5ba4ee968b" />

<img width="1110" height="713" alt="Screenshot 2026-08-16 at 4 49 39 PM" src="https://github.com/user-attachments/assets/ee0800b2-6f4d-4c51-853a-1e22e1e2ed0b" />







**Experiences** — a personal journal for food outside the home kitchen.
- Restaurant and café visits with address, ambiance tags, dishes tried, and would-return rating.
- Travel food moments — log what you ate on a trip with per-moment notes.
- Cookbooks — author, cuisine focus, favourite recipes.
- **Add to cooking wishlist** — one tap to push an experience dish into your table as a new dish idea.

<img width="1271" height="992" alt="Screenshot 2026-08-16 at 5 36 55 PM" src="https://github.com/user-attachments/assets/30a023c9-a823-4c64-918b-14ef0aeda5fb" />

<img width="1271" height="1057" alt="Screenshot 2026-08-16 at 5 58 45 PM" src="https://github.com/user-attachments/assets/a7785f73-1a39-4507-9f30-c230e74a34e7" />






**Photo flow** — upload multiple photos, drag to crop to the exact frame you want, choose a cover. The crop is applied before upload so what you see in the picker is exactly what appears on the card.

<img width="1271" height="1497" alt="Screenshot 2026-08-16 at 5 34 35 PM" src="https://github.com/user-attachments/assets/5f6918da-d0d0-42f4-b163-fbca82ce8d90" />


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
