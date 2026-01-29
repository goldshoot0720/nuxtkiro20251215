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
      subscriptions: {
        Row: {
          id: number
          name: string
          price: number
          billing_cycle: string
          next_billing_date: string
          status: string
          category: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          price: number
          billing_cycle: string
          next_billing_date: string
          status: string
          category: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          price?: number
          billing_cycle?: string
          next_billing_date?: string
          status?: string
          category?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      foods: {
        Row: {
          id: number
          name: string
          category: string
          price: number
          description: string | null
          image_url: string | null
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          category: string
          price: number
          description?: string | null
          image_url?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          category?: string
          price?: number
          description?: string | null
          image_url?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      banks: {
        Row: {
          id: number
          name: string
          account_number: string
          balance: number
          account_type: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          account_number: string
          balance: number
          account_type: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          account_number?: string
          balance?: number
          account_type?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      common_accounts: {
        Row: {
          id: number
          platform: string
          username: string
          email: string
          password: string
          notes: string | null
          category: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          platform: string
          username: string
          email: string
          password: string
          notes?: string | null
          category: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          platform?: string
          username?: string
          email?: string
          password?: string
          notes?: string | null
          category?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: number
          title: string
          content: string
          category: string
          tags: string[] | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          content: string
          category: string
          tags?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          category?: string
          tags?: string[] | null
          is_published?: boolean
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}