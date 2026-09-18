/**
 * Hand-written to match supabase/schema.sql. Once the Supabase project exists,
 * regenerate with `supabase gen types typescript --project-id <id>` and replace this file.
 */

export type Platform = 'instagram' | 'x' | 'youtube' | 'linkedin' | 'other';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'categories_owner_user_id_fkey';
            columns: ['owner_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      saves: {
        Row: {
          id: string;
          owner_user_id: string;
          category_id: string | null;
          url: string;
          platform: Platform;
          title: string | null;
          description: string | null;
          thumbnail_url: string | null;
          author_name: string | null;
          tags: string[];
          raw_metadata: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          category_id?: string | null;
          url: string;
          platform?: Platform;
          title?: string | null;
          description?: string | null;
          thumbnail_url?: string | null;
          author_name?: string | null;
          tags?: string[];
          raw_metadata?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['saves']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'saves_owner_user_id_fkey';
            columns: ['owner_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saves_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Save = Database['public']['Tables']['saves']['Row'];
