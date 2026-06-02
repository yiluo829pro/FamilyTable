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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
