// lib/supabase/database.types.ts
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
      users: {
        Row: {
          id: string
          email: string
          role_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          type: string
          keywords: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string
          type?: string
          keywords?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string
          type?: string
          keywords?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      category_master: {
        Row: {
          id: string
          name: string
          color: string
          icon: string
          type: string
          keywords: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          icon?: string
          type?: string
          keywords?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon?: string
          type?: string
          keywords?: string[] | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          transaction_date: string
          amount: number
          category_id: string | null
          description: string | null
          source: string
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_date: string
          amount: number
          category_id?: string | null
          description?: string | null
          source: string
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_date?: string
          amount?: number
          category_id?: string | null
          description?: string | null
          source?: string
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}