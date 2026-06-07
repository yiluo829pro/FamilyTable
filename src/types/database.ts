export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tables: {
        Row: {
          id: number
          name: string
          description: string | null
          cover_photo_url: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          cover_photo_url?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          cover_photo_url?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      table_members: {
        Row: {
          id: number
          table_id: number
          user_id: string | null
          role: 'admin' | 'co_manager'
          invited_email: string | null
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          table_id: number
          user_id?: string | null
          role: 'admin' | 'co_manager'
          invited_email?: string | null
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          table_id?: number
          user_id?: string | null
          role?: 'admin' | 'co_manager'
          invited_email?: string | null
          accepted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      dishes: {
        Row: {
          id: number
          table_id: number
          name: string
          cuisine_tag: string | null
          dietary_tags: string[]
          cook_time: string | null
          story: string | null
          recipe_ingredients: string | null
          recipe_steps: string | null
          status: 'active' | 'memory_only' | 'archived'
          photos: string[]
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          table_id: number
          name: string
          cuisine_tag?: string | null
          dietary_tags?: string[]
          cook_time?: string | null
          story?: string | null
          recipe_ingredients?: string | null
          recipe_steps?: string | null
          status?: 'active' | 'memory_only' | 'archived'
          photos?: string[]
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          table_id?: number
          name?: string
          cuisine_tag?: string | null
          dietary_tags?: string[]
          cook_time?: string | null
          story?: string | null
          recipe_ingredients?: string | null
          recipe_steps?: string | null
          status?: 'active' | 'memory_only' | 'archived'
          photos?: string[]
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: number
          table_id: number
          name: string
          dinner_date: string | null
          voting_deadline: string | null
          shortlist_dish_ids: number[]
          slug: string
          status: 'draft' | 'live' | 'voting_closed' | 'menu_announced' | 'archived'
          final_menu_dish_ids: number[]
          food_fund_enabled: boolean
          food_fund_threshold: number | null
          potluck_enabled: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: number
          table_id: number
          name: string
          dinner_date?: string | null
          voting_deadline?: string | null
          shortlist_dish_ids?: number[]
          slug: string
          status?: 'draft' | 'live' | 'voting_closed' | 'menu_announced' | 'archived'
          final_menu_dish_ids?: number[]
          food_fund_enabled?: boolean
          food_fund_threshold?: number | null
          potluck_enabled?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: number
          table_id?: number
          name?: string
          dinner_date?: string | null
          voting_deadline?: string | null
          shortlist_dish_ids?: number[]
          slug?: string
          status?: 'draft' | 'live' | 'voting_closed' | 'menu_announced' | 'archived'
          final_menu_dish_ids?: number[]
          food_fund_enabled?: boolean
          food_fund_threshold?: number | null
          potluck_enabled?: boolean
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      guest_votes: {
        Row: {
          id: number
          event_id: number
          guest_name: string
          dish_id: number
          created_at: string
        }
        Insert: {
          id?: number
          event_id: number
          guest_name: string
          dish_id: number
          created_at?: string
        }
        Update: {
          id?: number
          event_id?: number
          guest_name?: string
          dish_id?: number
          created_at?: string
        }
        Relationships: []
      }
      guest_preferences: {
        Row: {
          id: number
          event_id: number
          guest_name: string
          allergies: string[]
          dietary_notes: string[]
          free_text: string | null
          created_at: string
        }
        Insert: {
          id?: number
          event_id: number
          guest_name: string
          allergies?: string[]
          dietary_notes?: string[]
          free_text?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          event_id?: number
          guest_name?: string
          allergies?: string[]
          dietary_notes?: string[]
          free_text?: string | null
          created_at?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          id: number
          event_id: number
          guest_name: string
          dish_id: number | null
          item_name: string
          category: 'dish' | 'drink' | 'snack' | 'game' | 'other'
          note: string | null
          will_bring: boolean
          created_at: string
        }
        Insert: {
          id?: number
          event_id: number
          guest_name: string
          dish_id?: number | null
          item_name: string
          category?: 'dish' | 'drink' | 'snack' | 'game' | 'other'
          note?: string | null
          will_bring?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          event_id?: number
          guest_name?: string
          dish_id?: number | null
          item_name?: string
          category?: 'dish' | 'drink' | 'snack' | 'game' | 'other'
          note?: string | null
          will_bring?: boolean
          created_at?: string
        }
        Relationships: []
      }
      potluck_items: {
        Row: {
          id: number
          event_id: number
          item_name: string
          category: string
          claimed_by: string | null
          status: 'open' | 'claimed' | 'confirmed'
          added_by_host: boolean
          created_at: string
        }
        Insert: {
          id?: number
          event_id: number
          item_name: string
          category?: string
          claimed_by?: string | null
          status?: 'open' | 'claimed' | 'confirmed'
          added_by_host?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          event_id?: number
          item_name?: string
          category?: string
          claimed_by?: string | null
          status?: 'open' | 'claimed' | 'confirmed'
          added_by_host?: boolean
          created_at?: string
        }
        Relationships: []
      }
      food_fund_bids: {
        Row: {
          id: number
          event_id: number
          dish_id: number
          guest_name: string
          amount: number
          message: string | null
          created_at: string
        }
        Insert: {
          id?: number
          event_id: number
          dish_id: number
          guest_name: string
          amount: number
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          event_id?: number
          dish_id?: number
          guest_name?: string
          amount?: number
          message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      drinks: {
        Row: {
          id: number
          table_id: number
          name: string
          brand: string | null
          sub_type: 'coffee' | 'wine' | 'beer' | 'spirits' | 'sake' | 'tea' | 'non_alcoholic'
          photo_url: string | null
          tasting_notes: string[]
          rating: number | null
          status: 'tried_loved' | 'tried' | 'wishlist'
          personal_notes: string | null
          roast_level: string | null
          process: string | null
          origin_country: string | null
          brew_method: string | null
          blend_name: string | null
          wine_type: string | null
          varietal: string | null
          producer: string | null
          vintage_year: number | null
          wine_region: string | null
          abv: number | null
          price_range: string | null
          occasion: string | null
          brewery: string | null
          beer_style: string | null
          beer_abv: number | null
          ibu: number | null
          beer_format: string | null
          spirit_type: string | null
          distillery: string | null
          age_statement: number | null
          spirit_abv: number | null
          cocktail_notes: string | null
          sake_type: string | null
          sake_brewery: string | null
          sake_region: string | null
          smv: number | null
          serving_temp: string | null
          tea_type: string | null
          tea_brand: string | null
          tea_origin: string | null
          brew_temp: string | null
          steep_time: string | null
          na_sub_type: string | null
          na_brand: string | null
          flavor_variant: string | null
          added_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          table_id: number
          name: string
          brand?: string | null
          sub_type: 'coffee' | 'wine' | 'beer' | 'spirits' | 'sake' | 'tea' | 'non_alcoholic'
          photo_url?: string | null
          tasting_notes?: string[]
          rating?: number | null
          status?: 'tried_loved' | 'tried' | 'wishlist'
          personal_notes?: string | null
          roast_level?: string | null
          process?: string | null
          origin_country?: string | null
          brew_method?: string | null
          blend_name?: string | null
          wine_type?: string | null
          varietal?: string | null
          producer?: string | null
          vintage_year?: number | null
          wine_region?: string | null
          abv?: number | null
          price_range?: string | null
          occasion?: string | null
          brewery?: string | null
          beer_style?: string | null
          beer_abv?: number | null
          ibu?: number | null
          beer_format?: string | null
          spirit_type?: string | null
          distillery?: string | null
          age_statement?: number | null
          spirit_abv?: number | null
          cocktail_notes?: string | null
          sake_type?: string | null
          sake_brewery?: string | null
          sake_region?: string | null
          smv?: number | null
          serving_temp?: string | null
          tea_type?: string | null
          tea_brand?: string | null
          tea_origin?: string | null
          brew_temp?: string | null
          steep_time?: string | null
          na_sub_type?: string | null
          na_brand?: string | null
          flavor_variant?: string | null
          added_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          table_id?: number
          name?: string
          brand?: string | null
          sub_type?: 'coffee' | 'wine' | 'beer' | 'spirits' | 'sake' | 'tea' | 'non_alcoholic'
          photo_url?: string | null
          tasting_notes?: string[]
          rating?: number | null
          status?: 'tried_loved' | 'tried' | 'wishlist'
          personal_notes?: string | null
          roast_level?: string | null
          process?: string | null
          origin_country?: string | null
          brew_method?: string | null
          blend_name?: string | null
          wine_type?: string | null
          varietal?: string | null
          producer?: string | null
          vintage_year?: number | null
          wine_region?: string | null
          abv?: number | null
          price_range?: string | null
          occasion?: string | null
          brewery?: string | null
          beer_style?: string | null
          beer_abv?: number | null
          ibu?: number | null
          beer_format?: string | null
          spirit_type?: string | null
          distillery?: string | null
          age_statement?: number | null
          spirit_abv?: number | null
          cocktail_notes?: string | null
          sake_type?: string | null
          sake_brewery?: string | null
          sake_region?: string | null
          smv?: number | null
          serving_temp?: string | null
          tea_type?: string | null
          tea_brand?: string | null
          tea_origin?: string | null
          brew_temp?: string | null
          steep_time?: string | null
          na_sub_type?: string | null
          na_brand?: string | null
          flavor_variant?: string | null
          added_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      misc_items: {
        Row: {
          id: number
          table_id: number
          name: string
          brand: string | null
          sub_category: 'snacks' | 'condiments' | 'instant_noodles' | 'baked_goods'
          photo_url: string | null
          flavor_variant: string | null
          rating: number | null
          status: 'tried_loved' | 'tried' | 'wishlist'
          personal_notes: string | null
          where_to_buy: string | null
          snack_type: string | null
          heat_level: string | null
          tasting_notes: string[]
          condiment_type: string | null
          intensity: string | null
          noodle_type: string | null
          broth_type: string | null
          spice_level: number | null
          customization_notes: string | null
          baked_source: string | null
          baked_type: string | null
          bakery_brand: string | null
          added_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          table_id: number
          name: string
          brand?: string | null
          sub_category: 'snacks' | 'condiments' | 'instant_noodles' | 'baked_goods'
          photo_url?: string | null
          flavor_variant?: string | null
          rating?: number | null
          status?: 'tried_loved' | 'tried' | 'wishlist'
          personal_notes?: string | null
          where_to_buy?: string | null
          snack_type?: string | null
          heat_level?: string | null
          tasting_notes?: string[]
          condiment_type?: string | null
          intensity?: string | null
          noodle_type?: string | null
          broth_type?: string | null
          spice_level?: number | null
          customization_notes?: string | null
          baked_source?: string | null
          baked_type?: string | null
          bakery_brand?: string | null
          added_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          table_id?: number
          name?: string
          brand?: string | null
          sub_category?: 'snacks' | 'condiments' | 'instant_noodles' | 'baked_goods'
          photo_url?: string | null
          flavor_variant?: string | null
          rating?: number | null
          status?: 'tried_loved' | 'tried' | 'wishlist'
          personal_notes?: string | null
          where_to_buy?: string | null
          snack_type?: string | null
          heat_level?: string | null
          tasting_notes?: string[]
          condiment_type?: string | null
          intensity?: string | null
          noodle_type?: string | null
          broth_type?: string | null
          spice_level?: number | null
          customization_notes?: string | null
          baked_source?: string | null
          baked_type?: string | null
          bakery_brand?: string | null
          added_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          id: number
          table_id: number
          name: string
          sub_category: 'restaurant' | 'cafe' | 'travel' | 'cookbook'
          photo_url: string | null
          rating: number | null
          status: string
          personal_notes: string | null
          cuisine: string | null
          address: string | null
          city: string | null
          country: string | null
          price_range: string | null
          occasion: string | null
          ambiance_tags: string[]
          dishes_tried: string | null
          standout_dish: string | null
          would_return: string | null
          cafe_specialty: string | null
          work_friendly: boolean | null
          wifi_available: boolean | null
          trip_name: string | null
          trip_city: string | null
          trip_country: string | null
          trip_start_date: string | null
          trip_end_date: string | null
          author: string | null
          cuisine_focus: string | null
          year_published: number | null
          publisher: string | null
          favorite_recipes: string | null
          visit_dates: string[]
          added_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          table_id: number
          name: string
          sub_category: 'restaurant' | 'cafe' | 'travel' | 'cookbook'
          photo_url?: string | null
          rating?: number | null
          status?: string
          personal_notes?: string | null
          cuisine?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          price_range?: string | null
          occasion?: string | null
          ambiance_tags?: string[]
          dishes_tried?: string | null
          standout_dish?: string | null
          would_return?: string | null
          cafe_specialty?: string | null
          work_friendly?: boolean | null
          wifi_available?: boolean | null
          trip_name?: string | null
          trip_city?: string | null
          trip_country?: string | null
          trip_start_date?: string | null
          trip_end_date?: string | null
          author?: string | null
          cuisine_focus?: string | null
          year_published?: number | null
          publisher?: string | null
          favorite_recipes?: string | null
          visit_dates?: string[]
          added_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          table_id?: number
          name?: string
          sub_category?: 'restaurant' | 'cafe' | 'travel' | 'cookbook'
          photo_url?: string | null
          rating?: number | null
          status?: string
          personal_notes?: string | null
          cuisine?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          price_range?: string | null
          occasion?: string | null
          ambiance_tags?: string[]
          dishes_tried?: string | null
          standout_dish?: string | null
          would_return?: string | null
          cafe_specialty?: string | null
          work_friendly?: boolean | null
          wifi_available?: boolean | null
          trip_name?: string | null
          trip_city?: string | null
          trip_country?: string | null
          trip_start_date?: string | null
          trip_end_date?: string | null
          author?: string | null
          cuisine_focus?: string | null
          year_published?: number | null
          publisher?: string | null
          favorite_recipes?: string | null
          visit_dates?: string[]
          added_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      travel_moments: {
        Row: {
          id: number
          experience_id: number
          item_name: string
          where_eaten: string | null
          photo_url: string | null
          memory_note: string | null
          created_at: string
        }
        Insert: {
          id?: number
          experience_id: number
          item_name: string
          where_eaten?: string | null
          photo_url?: string | null
          memory_note?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          experience_id?: number
          item_name?: string
          where_eaten?: string | null
          photo_url?: string | null
          memory_note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          id: number
          table_id: number
          name: string
          description: string | null
          slug: string
          privacy: 'private' | 'shared'
          created_by: string
          created_at: string
        }
        Insert: {
          id?: number
          table_id: number
          name: string
          description?: string | null
          slug: string
          privacy?: 'private' | 'shared'
          created_by: string
          created_at?: string
        }
        Update: {
          id?: number
          table_id?: number
          name?: string
          description?: string | null
          slug?: string
          privacy?: 'private' | 'shared'
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          id: number
          collection_id: number
          item_type: 'dish' | 'drink' | 'misc' | 'experience'
          item_id: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: number
          collection_id: number
          item_type: 'dish' | 'drink' | 'misc' | 'experience'
          item_id: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          collection_id?: number
          item_type?: 'dish' | 'drink' | 'misc' | 'experience'
          item_id?: number
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
