export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      availability_change_history: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          exception_id: string | null;
          id: string;
          reason: string | null;
          rule_id: string | null;
          snapshot: Json | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          exception_id?: string | null;
          id?: string;
          reason?: string | null;
          rule_id?: string | null;
          snapshot?: Json | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          exception_id?: string | null;
          id?: string;
          reason?: string | null;
          rule_id?: string | null;
          snapshot?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "availability_change_history_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "availability_change_history_exception_id_fkey";
            columns: ["exception_id"];
            isOneToOne: false;
            referencedRelation: "session_availability_exceptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "availability_change_history_rule_id_fkey";
            columns: ["rule_id"];
            isOneToOne: false;
            referencedRelation: "session_availability_rules";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_history: {
        Row: {
          actor_id: string | null;
          actor_role: string | null;
          booking_id: string;
          created_at: string;
          event_type: string;
          id: string;
          new_status: string | null;
          previous_status: string | null;
          reason: string | null;
          session_id: string;
          user_id: string;
        };
        Insert: {
          actor_id?: string | null;
          actor_role?: string | null;
          booking_id: string;
          created_at?: string;
          event_type: string;
          id?: string;
          new_status?: string | null;
          previous_status?: string | null;
          reason?: string | null;
          session_id: string;
          user_id: string;
        };
        Update: {
          actor_id?: string | null;
          actor_role?: string | null;
          booking_id?: string;
          created_at?: string;
          event_type?: string;
          id?: string;
          new_status?: string | null;
          previous_status?: string | null;
          reason?: string | null;
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_history_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_history_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_history_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_history_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions_with_availability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          booked_at: string;
          cancel_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          checked_in_at: string | null;
          id: string;
          marked_paid_by: string | null;
          notes: string | null;
          paid_at: string | null;
          payment_status: string;
          session_id: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          booked_at?: string;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          checked_in_at?: string | null;
          id?: string;
          marked_paid_by?: string | null;
          notes?: string | null;
          paid_at?: string | null;
          payment_status?: string;
          session_id: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          booked_at?: string;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          checked_in_at?: string | null;
          id?: string;
          marked_paid_by?: string | null;
          notes?: string | null;
          paid_at?: string | null;
          payment_status?: string;
          session_id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_cancelled_by_fkey";
            columns: ["cancelled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_marked_paid_by_fkey";
            columns: ["marked_paid_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions_with_availability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      coach_client_notes: {
        Row: {
          author_id: string;
          client_id: string;
          content: string;
          created_at: string;
          id: string;
        };
        Insert: {
          author_id: string;
          client_id: string;
          content: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          author_id?: string;
          client_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coach_client_notes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coach_client_notes_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      email_notification_logs: {
        Row: {
          error_message: string | null;
          id: string;
          recipient_email: string;
          related_booking_id: string | null;
          related_session_id: string | null;
          resend_id: string | null;
          sent_at: string;
          status: string;
          template_name: string;
          user_id: string | null;
        };
        Insert: {
          error_message?: string | null;
          id?: string;
          recipient_email: string;
          related_booking_id?: string | null;
          related_session_id?: string | null;
          resend_id?: string | null;
          sent_at?: string;
          status: string;
          template_name: string;
          user_id?: string | null;
        };
        Update: {
          error_message?: string | null;
          id?: string;
          recipient_email?: string;
          related_booking_id?: string | null;
          related_session_id?: string | null;
          resend_id?: string | null;
          sent_at?: string;
          status?: string;
          template_name?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "email_notification_logs_related_booking_id_fkey";
            columns: ["related_booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_notification_logs_related_session_id_fkey";
            columns: ["related_session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_notification_logs_related_session_id_fkey";
            columns: ["related_session_id"];
            isOneToOne: false;
            referencedRelation: "sessions_with_availability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_notification_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      locations: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          is_active: boolean;
          landmark_en: string | null;
          landmark_es: string | null;
          maps_url: string | null;
          metro: string | null;
          name: string;
          neighborhood: string | null;
          place: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          landmark_en?: string | null;
          landmark_es?: string | null;
          maps_url?: string | null;
          metro?: string | null;
          name: string;
          neighborhood?: string | null;
          place: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          landmark_en?: string | null;
          landmark_es?: string | null;
          maps_url?: string | null;
          metro?: string | null;
          name?: string;
          neighborhood?: string | null;
          place?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      private_inquiries: {
        Row: {
          admin_notes: string | null;
          created_at: string;
          email: string;
          id: string;
          name: string;
          notes: string | null;
          phone: string | null;
          status: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          admin_notes?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "private_inquiries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          account_status: string;
          avatar_url: string | null;
          created_at: string;
          email: string;
          emergency_contact: string | null;
          first_booked_at: string | null;
          full_name: string;
          goals: string | null;
          id: string;
          injuries_notes: string | null;
          last_login_at: string | null;
          locale: string;
          moderated_at: string | null;
          moderated_by: string | null;
          moderation_reason: string | null;
          phone: string | null;
          role: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          account_status?: string;
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          emergency_contact?: string | null;
          first_booked_at?: string | null;
          full_name: string;
          goals?: string | null;
          id: string;
          injuries_notes?: string | null;
          last_login_at?: string | null;
          locale?: string;
          moderated_at?: string | null;
          moderated_by?: string | null;
          moderation_reason?: string | null;
          phone?: string | null;
          role?: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          account_status?: string;
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          emergency_contact?: string | null;
          first_booked_at?: string | null;
          full_name?: string;
          goals?: string | null;
          id?: string;
          injuries_notes?: string | null;
          last_login_at?: string | null;
          locale?: string;
          moderated_at?: string | null;
          moderated_by?: string | null;
          moderation_reason?: string | null;
          phone?: string | null;
          role?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_moderated_by_fkey";
            columns: ["moderated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      session_availability_exceptions: {
        Row: {
          availability_rule_id: string | null;
          created_at: string;
          created_by: string | null;
          exception_date: string;
          exception_type: string;
          id: string;
          override_location_id: string | null;
          override_max_slots: number | null;
          override_start_time: string | null;
          reason: string;
        };
        Insert: {
          availability_rule_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          exception_date: string;
          exception_type: string;
          id?: string;
          override_location_id?: string | null;
          override_max_slots?: number | null;
          override_start_time?: string | null;
          reason: string;
        };
        Update: {
          availability_rule_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          exception_date?: string;
          exception_type?: string;
          id?: string;
          override_location_id?: string | null;
          override_max_slots?: number | null;
          override_start_time?: string | null;
          reason?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_availability_exceptions_availability_rule_id_fkey";
            columns: ["availability_rule_id"];
            isOneToOne: false;
            referencedRelation: "session_availability_rules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_availability_exceptions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_availability_exceptions_override_location_id_fkey";
            columns: ["override_location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      session_availability_rules: {
        Row: {
          availability_mode: string;
          created_at: string;
          created_by: string | null;
          duration_min: number;
          effective_from: string;
          effective_until: string | null;
          id: string;
          is_active: boolean;
          location_id: string;
          max_slots: number;
          price_eur: number;
          session_type_id: string;
          start_time: string;
          updated_at: string;
          weekday: number;
        };
        Insert: {
          availability_mode?: string;
          created_at?: string;
          created_by?: string | null;
          duration_min: number;
          effective_from?: string;
          effective_until?: string | null;
          id?: string;
          is_active?: boolean;
          location_id: string;
          max_slots: number;
          price_eur: number;
          session_type_id: string;
          start_time: string;
          updated_at?: string;
          weekday: number;
        };
        Update: {
          availability_mode?: string;
          created_at?: string;
          created_by?: string | null;
          duration_min?: number;
          effective_from?: string;
          effective_until?: string | null;
          id?: string;
          is_active?: boolean;
          location_id?: string;
          max_slots?: number;
          price_eur?: number;
          session_type_id?: string;
          start_time?: string;
          updated_at?: string;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: "session_availability_rules_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_availability_rules_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_availability_rules_session_type_id_fkey";
            columns: ["session_type_id"];
            isOneToOne: false;
            referencedRelation: "session_types";
            referencedColumns: ["id"];
          },
        ];
      };
      session_history: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          id: string;
          new_state: Json | null;
          previous_state: Json | null;
          reason: string | null;
          session_id: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          new_state?: Json | null;
          previous_state?: Json | null;
          reason?: string | null;
          session_id: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          new_state?: Json | null;
          previous_state?: Json | null;
          reason?: string | null;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_history_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_history_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_history_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions_with_availability";
            referencedColumns: ["id"];
          },
        ];
      };
      session_types: {
        Row: {
          cover_image_url: string | null;
          created_at: string;
          default_duration_min: number;
          default_location_id: string | null;
          default_max_slots: number;
          default_price_eur: number;
          description: string;
          equipment: string[];
          focus: string;
          id: string;
          is_active: boolean;
          level: string;
          place: string;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          cover_image_url?: string | null;
          created_at?: string;
          default_duration_min: number;
          default_location_id?: string | null;
          default_max_slots: number;
          default_price_eur: number;
          description: string;
          equipment?: string[];
          focus: string;
          id?: string;
          is_active?: boolean;
          level?: string;
          place: string;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          cover_image_url?: string | null;
          created_at?: string;
          default_duration_min?: number;
          default_location_id?: string | null;
          default_max_slots?: number;
          default_price_eur?: number;
          description?: string;
          equipment?: string[];
          focus?: string;
          id?: string;
          is_active?: boolean;
          level?: string;
          place?: string;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_types_default_location_id_fkey";
            columns: ["default_location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          availability_rule_id: string | null;
          cancel_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          created_by: string | null;
          description: string;
          duration_min: number;
          ends_at: string;
          equipment: string[];
          focus: string;
          id: string;
          level: string;
          location_id: string;
          max_slots: number;
          place: string;
          price_eur: number;
          session_type_id: string | null;
          slug: string;
          starts_at: string;
          status: string;
          title: string;
          updated_at: string;
          weather_note: string | null;
        };
        Insert: {
          availability_rule_id?: string | null;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          created_by?: string | null;
          description: string;
          duration_min: number;
          ends_at: string;
          equipment?: string[];
          focus: string;
          id?: string;
          level?: string;
          location_id: string;
          max_slots: number;
          place: string;
          price_eur: number;
          session_type_id?: string | null;
          slug: string;
          starts_at: string;
          status?: string;
          title: string;
          updated_at?: string;
          weather_note?: string | null;
        };
        Update: {
          availability_rule_id?: string | null;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string;
          duration_min?: number;
          ends_at?: string;
          equipment?: string[];
          focus?: string;
          id?: string;
          level?: string;
          location_id?: string;
          max_slots?: number;
          place?: string;
          price_eur?: number;
          session_type_id?: string | null;
          slug?: string;
          starts_at?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          weather_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_availability_rule_id_fkey";
            columns: ["availability_rule_id"];
            isOneToOne: false;
            referencedRelation: "session_availability_rules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_cancelled_by_fkey";
            columns: ["cancelled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_session_type_id_fkey";
            columns: ["session_type_id"];
            isOneToOne: false;
            referencedRelation: "session_types";
            referencedColumns: ["id"];
          },
        ];
      };
      studio_settings: {
        Row: {
          banner_active: boolean;
          banner_message_en: string | null;
          banner_message_es: string | null;
          cancellation_window_hours: number;
          contact_email: string;
          id: number;
          instagram_url: string;
          studio_hours_en: string;
          studio_hours_es: string;
          updated_at: string;
          whatsapp_number: string;
        };
        Insert: {
          banner_active?: boolean;
          banner_message_en?: string | null;
          banner_message_es?: string | null;
          cancellation_window_hours?: number;
          contact_email?: string;
          id?: number;
          instagram_url?: string;
          studio_hours_en?: string;
          studio_hours_es?: string;
          updated_at?: string;
          whatsapp_number?: string;
        };
        Update: {
          banner_active?: boolean;
          banner_message_en?: string | null;
          banner_message_es?: string | null;
          cancellation_window_hours?: number;
          contact_email?: string;
          id?: number;
          instagram_url?: string;
          studio_hours_en?: string;
          studio_hours_es?: string;
          updated_at?: string;
          whatsapp_number?: string;
        };
        Relationships: [];
      };
      user_login_history: {
        Row: {
          auth_method: string;
          email: string;
          failure_reason: string | null;
          id: string;
          ip_address: string | null;
          logged_in_at: string;
          success: boolean;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          auth_method?: string;
          email: string;
          failure_reason?: string | null;
          id?: string;
          ip_address?: string | null;
          logged_in_at?: string;
          success?: boolean;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          auth_method?: string;
          email?: string;
          failure_reason?: string | null;
          id?: string;
          ip_address?: string | null;
          logged_in_at?: string;
          success?: boolean;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_login_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_moderation_history: {
        Row: {
          actor_id: string | null;
          created_at: string;
          event_type: string;
          id: string;
          new_role: string | null;
          new_status: string | null;
          previous_role: string | null;
          previous_status: string | null;
          reason: string | null;
          target_user_id: string;
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          event_type: string;
          id?: string;
          new_role?: string | null;
          new_status?: string | null;
          previous_role?: string | null;
          previous_status?: string | null;
          reason?: string | null;
          target_user_id: string;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          event_type?: string;
          id?: string;
          new_role?: string | null;
          new_status?: string | null;
          previous_role?: string | null;
          previous_status?: string | null;
          reason?: string | null;
          target_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_moderation_history_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_moderation_history_target_user_id_fkey";
            columns: ["target_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      sessions_with_availability: {
        Row: {
          availability_rule_id: string | null;
          cancel_reason: string | null;
          cancelled_at: string | null;
          confirmed_count: number | null;
          description: string | null;
          duration_min: number | null;
          ends_at: string | null;
          equipment: string[] | null;
          focus: string | null;
          id: string | null;
          level: string | null;
          location_id: string | null;
          location_landmark_en: string | null;
          location_landmark_es: string | null;
          location_maps_url: string | null;
          location_metro: string | null;
          location_name: string | null;
          location_neighborhood: string | null;
          location_slug: string | null;
          max_slots: number | null;
          place: string | null;
          price_eur: number | null;
          session_type_id: string | null;
          slug: string | null;
          spots_remaining: number | null;
          starts_at: string | null;
          status: string | null;
          title: string | null;
          waitlist_count: number | null;
          weather_note: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_availability_rule_id_fkey";
            columns: ["availability_rule_id"];
            isOneToOne: false;
            referencedRelation: "session_availability_rules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_session_type_id_fkey";
            columns: ["session_type_id"];
            isOneToOne: false;
            referencedRelation: "session_types";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      book_session_atomic: {
        Args: {
          p_join_waitlist?: boolean;
          p_notes?: string;
          p_session_id: string;
        };
        Returns: Json;
      };
      cancel_booking_atomic: {
        Args: { p_booking_id: string; p_reason?: string; p_reject?: boolean };
        Returns: Json;
      };
      generate_sessions_for_range: {
        Args: { p_from_date?: string; p_to_date?: string };
        Returns: number;
      };
      get_session_confirmed_count: {
        Args: { p_session_id: string };
        Returns: number;
      };
      get_session_waitlist_count: {
        Args: { p_session_id: string };
        Returns: number;
      };
      is_active_account: { Args: never; Returns: boolean };
      is_admin: { Args: never; Returns: boolean };
      slugify: { Args: { input: string }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

// Domain-specific narrowed unions and row aliases
export type UserRole = "user" | "client" | "admin";
export type AccountStatus = "active" | "rejected" | "banned";
export type SupportedLocale = "en" | "es";
export type SessionFocus = "Strength" | "Conditioning" | "Mobility" | "Private";
export type SessionPlace = "Studio" | "Outdoor";
export type SessionStatus = "scheduled" | "moved_indoor" | "cancelled" | "completed";
export type BookingStatus =
  "confirmed" | "waitlisted" | "checked_in" | "no_show" | "cancelled" | "rejected";
export type PaymentStatus = "unpaid" | "paid";
export type InquiryStatus = "new" | "contacted" | "converted" | "archived";
export type AvailabilityMode = "ongoing" | "date_range";
export type ExceptionType =
  "blackout" | "override_time" | "override_location" | "override_slots" | "weather_indoor";

export type Profile = Omit<Tables<"profiles">, "role" | "account_status" | "locale"> & {
  role: UserRole;
  account_status: AccountStatus;
  locale: SupportedLocale;
};

export type LocationRow = Tables<"locations">;
export type SessionTypeRow = Tables<"session_types">;
export type SessionAvailabilityRuleRow = Tables<"session_availability_rules">;
export type SessionAvailabilityExceptionRow = Tables<"session_availability_exceptions">;
export type SessionRow = Tables<"sessions">;
export type SessionWithAvailabilityRow = Tables<"sessions_with_availability">;
export type BookingRow = Tables<"bookings">;
export type PrivateInquiryRow = Tables<"private_inquiries">;
export type StudioSettingsRow = Tables<"studio_settings">;
