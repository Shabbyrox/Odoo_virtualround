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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          category_id: string | null
          unit: string | null
          min_stock_level: number
          created_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          category_id?: string | null
          unit?: string | null
          min_stock_level?: number
          created_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          category_id?: string | null
          unit?: string | null
          min_stock_level?: number
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
          created_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          location_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          location_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          location_id?: string
          quantity?: number
          updated_at?: string
        }
      }
      movements: {
        Row: {
          id: string
          product_id: string
          type: string
          from_location_id: string | null
          to_location_id: string | null
          quantity: number
          reason: string | null
          performed_by: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          type: string
          from_location_id?: string | null
          to_location_id?: string | null
          quantity: number
          reason?: string | null
          performed_by?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          type?: string
          from_location_id?: string | null
          to_location_id?: string | null
          quantity?: number
          reason?: string | null
          performed_by?: string | null
          status?: string
          created_at?: string
        }
      }
      adjustments: {
        Row: {
          id: string
          product_id: string
          location_id: string
          system_quantity: number
          counted_quantity: number
          reason: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          location_id: string
          system_quantity: number
          counted_quantity: number
          reason?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          location_id?: string
          system_quantity?: number
          counted_quantity?: number
          reason?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_info: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_info?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_info?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          contact_info: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_info?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_info?: string | null
          created_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          supplier_id: string | null
          location_id: string | null
          date: string
          reference: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          supplier_id?: string | null
          location_id?: string | null
          date: string
          reference?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string | null
          location_id?: string | null
          date?: string
          reference?: string | null
          status?: string
          created_at?: string
        }
      }
      receipt_items: {
        Row: {
          id: string
          receipt_id: string | null
          product_id: string | null
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          receipt_id?: string | null
          product_id?: string | null
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          receipt_id?: string | null
          product_id?: string | null
          quantity?: number
          created_at?: string
        }
      }
      deliveries: {
        Row: {
          id: string
          customer_id: string | null
          location_id: string | null
          date: string
          address: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          location_id?: string | null
          date: string
          address?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          location_id?: string | null
          date?: string
          address?: string | null
          status?: string
          created_at?: string
        }
      }
      delivery_items: {
        Row: {
          id: string
          delivery_id: string | null
          product_id: string | null
          quantity: number
          picked: boolean
          packed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          delivery_id?: string | null
          product_id?: string | null
          quantity: number
          picked?: boolean
          packed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          delivery_id?: string | null
          product_id?: string | null
          quantity?: number
          picked?: boolean
          packed?: boolean
          created_at?: string
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
