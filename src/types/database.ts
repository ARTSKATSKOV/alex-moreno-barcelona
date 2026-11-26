export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "user" | "client" | "admin";
export type AccountStatus = "active" | "rejected" | "banned";
export type SupportedLocale = "en" | "es";

export interface Profile {
  id: string;
  slug: string;
  role: UserRole;
  account_status: AccountStatus;
  moderation_reason: string | null;
  moderated_at: string | null;
  moderated_by: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  locale: SupportedLocale;
  avatar_url: string | null;
  goals: string | null;
  injuries_notes: string | null;
  emergency_contact: string | null;
  first_booked_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          slug: string;
          role?: UserRole;
          account_status?: AccountStatus;
          moderation_reason?: string | null;
          moderated_at?: string | null;
          moderated_by?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          locale?: SupportedLocale;
          avatar_url?: string | null;
          goals?: string | null;
          injuries_notes?: string | null;
          emergency_contact?: string | null;
          first_booked_at?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          role?: UserRole;
          account_status?: AccountStatus;
          moderation_reason?: string | null;
          moderated_at?: string | null;
          moderated_by?: string | null;
          full_name?: string;
          email?: string;
          phone?: string | null;
          locale?: SupportedLocale;
          avatar_url?: string | null;
          goals?: string | null;
          injuries_notes?: string | null;
          emergency_contact?: string | null;
          first_booked_at?: string | null;
          last_login_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
      supported_locale: SupportedLocale;
    };
    CompositeTypes: Record<string, never>;
  };
}
