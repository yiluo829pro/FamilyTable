-- ============================================================
-- Family Table — Full Schema with RLS Policies
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES (family circles)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tables (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  cover_photo_url TEXT,
  created_by    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- Admins/co-managers can see their tables
CREATE POLICY "tables_select" ON public.tables
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.table_members
      WHERE table_id = tables.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "tables_insert" ON public.tables
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "tables_update" ON public.tables
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.table_members
      WHERE table_id = tables.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "tables_delete" ON public.tables
  FOR DELETE USING (auth.uid() = created_by);

-- ============================================================
-- TABLE MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.table_members (
  id             BIGSERIAL PRIMARY KEY,
  table_id       BIGINT NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role           TEXT NOT NULL CHECK (role IN ('admin', 'co_manager')),
  invited_email  TEXT,
  accepted_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.table_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON public.table_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.table_members tm2
      WHERE tm2.table_id = table_members.table_id AND tm2.user_id = auth.uid()
    )
  );

CREATE POLICY "members_insert" ON public.table_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.table_members
      WHERE table_id = table_members.table_id AND user_id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM public.tables
      WHERE id = table_members.table_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "members_update" ON public.table_members
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.table_members tm2
      WHERE tm2.table_id = table_members.table_id AND tm2.user_id = auth.uid() AND tm2.role = 'admin'
    )
  );

-- ============================================================
-- DISHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dishes (
  id                  BIGSERIAL PRIMARY KEY,
  table_id            BIGINT NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  cuisine_tag         TEXT,
  dietary_tags        TEXT[] NOT NULL DEFAULT '{}',
  cook_time           TEXT,
  story               TEXT,
  recipe_ingredients  TEXT,
  recipe_steps        TEXT,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'memory_only', 'archived')),
  photos              TEXT[] NOT NULL DEFAULT '{}',
  created_by          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dishes_select" ON public.dishes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.table_members
      WHERE table_id = dishes.table_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.tables
      WHERE id = dishes.table_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "dishes_insert" ON public.dishes
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND (
      EXISTS (
        SELECT 1 FROM public.table_members
        WHERE table_id = dishes.table_id AND user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.tables
        WHERE id = dishes.table_id AND created_by = auth.uid()
      )
    )
  );

CREATE POLICY "dishes_update" ON public.dishes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.table_members
      WHERE table_id = dishes.table_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.tables
      WHERE id = dishes.table_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "dishes_delete" ON public.dishes
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.table_members
      WHERE table_id = dishes.table_id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id                    BIGSERIAL PRIMARY KEY,
  table_id              BIGINT NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  dinner_date           DATE,
  voting_deadline       TIMESTAMPTZ,
  shortlist_dish_ids    BIGINT[] NOT NULL DEFAULT '{}',
  slug                  TEXT NOT NULL UNIQUE,
  status                TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'voting_closed', 'menu_announced', 'archived')),
  final_menu_dish_ids   BIGINT[] NOT NULL DEFAULT '{}',
  food_fund_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  food_fund_threshold   NUMERIC(10, 2),
  potluck_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  created_by            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Admin/co-manager can see events for their tables
CREATE POLICY "events_select_auth" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.table_members
      WHERE table_id = events.table_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.tables
      WHERE id = events.table_id AND created_by = auth.uid()
    )
  );

-- Guests can fetch live events by slug (needed for vote page)
CREATE POLICY "events_select_guest" ON public.events
  FOR SELECT USING (status IN ('live', 'voting_closed', 'menu_announced'));

CREATE POLICY "events_insert" ON public.events
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND (
      EXISTS (
        SELECT 1 FROM public.table_members
        WHERE table_id = events.table_id AND user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.tables
        WHERE id = events.table_id AND created_by = auth.uid()
      )
    )
  );

CREATE POLICY "events_update" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.table_members
      WHERE table_id = events.table_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.tables
      WHERE id = events.table_id AND created_by = auth.uid()
    )
  );

-- ============================================================
-- GUEST VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guest_votes (
  id          BIGSERIAL PRIMARY KEY,
  event_id    BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_name  TEXT NOT NULL,
  dish_id     BIGINT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, guest_name, dish_id)
);

ALTER TABLE public.guest_votes ENABLE ROW LEVEL SECURITY;

-- Guests can insert votes
CREATE POLICY "votes_insert" ON public.guest_votes
  FOR INSERT WITH CHECK (true);

-- Guests can delete their own votes (toggle)
CREATE POLICY "votes_delete" ON public.guest_votes
  FOR DELETE USING (true);

-- Anyone can read vote counts (aggregated on client)
CREATE POLICY "votes_select" ON public.guest_votes
  FOR SELECT USING (true);

-- ============================================================
-- GUEST PREFERENCES (private)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guest_preferences (
  id             BIGSERIAL PRIMARY KEY,
  event_id       BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_name     TEXT NOT NULL,
  allergies      TEXT[] NOT NULL DEFAULT '{}',
  dietary_notes  TEXT[] NOT NULL DEFAULT '{}',
  free_text      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.guest_preferences ENABLE ROW LEVEL SECURITY;

-- Guests can insert their own preferences
CREATE POLICY "prefs_insert" ON public.guest_preferences
  FOR INSERT WITH CHECK (true);

-- Only admins/co-managers can read preferences
CREATE POLICY "prefs_select_auth" ON public.guest_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.table_members tm ON tm.table_id = e.table_id
      WHERE e.id = guest_preferences.event_id AND tm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.tables t ON t.id = e.table_id
      WHERE e.id = guest_preferences.event_id AND t.created_by = auth.uid()
    )
  );

-- ============================================================
-- WISHLIST ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id          BIGSERIAL PRIMARY KEY,
  event_id    BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_name  TEXT NOT NULL,
  dish_id     BIGINT,
  item_name   TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'dish' CHECK (category IN ('dish', 'drink', 'snack', 'game', 'other')),
  note        TEXT,
  will_bring  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Guests can manage their own wishlist
CREATE POLICY "wishlist_insert" ON public.wishlist_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "wishlist_select" ON public.wishlist_items
  FOR SELECT USING (true);

CREATE POLICY "wishlist_delete" ON public.wishlist_items
  FOR DELETE USING (true);

-- ============================================================
-- POTLUCK ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.potluck_items (
  id              BIGSERIAL PRIMARY KEY,
  event_id        BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  item_name       TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'dish',
  claimed_by      TEXT,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'confirmed')),
  added_by_host   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.potluck_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "potluck_select" ON public.potluck_items
  FOR SELECT USING (true);

CREATE POLICY "potluck_insert" ON public.potluck_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "potluck_update" ON public.potluck_items
  FOR UPDATE USING (true);

CREATE POLICY "potluck_delete" ON public.potluck_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.table_members tm ON tm.table_id = e.table_id
      WHERE e.id = potluck_items.event_id AND tm.user_id = auth.uid()
    )
  );

-- ============================================================
-- FOOD FUND BIDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.food_fund_bids (
  id          BIGSERIAL PRIMARY KEY,
  event_id    BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  dish_id     BIGINT NOT NULL,
  guest_name  TEXT NOT NULL,
  amount      NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  message     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.food_fund_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fund_insert" ON public.food_fund_bids
  FOR INSERT WITH CHECK (true);

CREATE POLICY "fund_select" ON public.food_fund_bids
  FOR SELECT USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_dishes_table_id ON public.dishes(table_id);
CREATE INDEX IF NOT EXISTS idx_events_table_id ON public.events(table_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_guest_votes_event_id ON public.guest_votes(event_id);
CREATE INDEX IF NOT EXISTS idx_potluck_event_id ON public.potluck_items(event_id);
CREATE INDEX IF NOT EXISTS idx_food_fund_event_id ON public.food_fund_bids(event_id);
CREATE INDEX IF NOT EXISTS idx_preferences_event_id ON public.guest_preferences(event_id);
