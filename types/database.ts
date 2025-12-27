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
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'viewer'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'viewer'
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          phone: string
          name: string | null
          attributes: Json
          tags: string[]
          is_unsubscribed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          phone: string
          name?: string | null
          attributes?: Json
          tags?: string[]
          is_unsubscribed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string | null
          attributes?: Json
          tags?: string[]
          is_unsubscribed?: boolean
          created_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          meta_template_id: string | null
          name: string
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | null
          language: string
          components: Json
          last_synced_at: string
        }
        Insert: {
          id?: string
          meta_template_id?: string | null
          name: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          category?: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | null
          language?: string
          components?: Json
          last_synced_at?: string
        }
        Update: {
          id?: string
          meta_template_id?: string | null
          name?: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          category?: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | null
          language?: string
          components?: Json
          last_synced_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          template_id: string | null
          status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED'
          scheduled_at: string | null
          total_audience: number
          success_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          template_id?: string | null
          status?: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED'
          scheduled_at?: string | null
          total_audience?: number
          success_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          template_id?: string | null
          status?: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED'
          scheduled_at?: string | null
          total_audience?: number
          success_count?: number
          created_at?: string
        }
      }
      campaign_logs: {
        Row: {
          id: string
          campaign_id: string | null
          contact_id: string | null
          meta_message_id: string | null
          status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
          error_reason: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          contact_id?: string | null
          meta_message_id?: string | null
          status?: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
          error_reason?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          contact_id?: string | null
          meta_message_id?: string | null
          status?: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
          error_reason?: string | null
          updated_at?: string
        }
      }
    }
  }
}
