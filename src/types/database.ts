/**
 * Database types for the STRONGER schema.
 *
 * Mirrors supabase/migrations/*.sql. Written in the shape the Supabase CLI
 * emits (`supabase gen types typescript`), so it can be replaced by generated
 * output later without touching call sites.
 *
 * Conventions:
 * - `Row`    — what a select returns.
 * - `Insert` — columns with defaults (id, created_at, updated_at) are optional.
 * - `Update` — everything optional.
 *
 * Only user-generated data lives here. The catalogue (programs, exercises,
 * coaches, meals) stays in src/data as static TypeScript.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Values accepted by profiles.experience_level. */
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

/** Values accepted by user_goals.primary_goal / secondary_goal. */
export type GoalKey =
  | "build-muscle"
  | "lose-fat"
  | "get-stronger"
  | "improve-fitness"
  | "improve-wellness"
  | "live-healthier";

/** Values accepted by user_preferences.equipment_access. */
export type EquipmentAccess = "no-equipment" | "dumbbells" | "home-gym" | "full-gym";

/** Values accepted by user_preferences.preferred_training_location. */
export type TrainingLocation = "home" | "gym" | "outdoors" | "hybrid";

/** Values accepted by user_preferences.units. */
export type Units = "metric" | "imperial";

/** Values accepted by user_memberships.tier. */
export type MembershipTier = "free" | "pro" | "elite";

/** Values accepted by habits.frequency. */
export type HabitFrequency = "daily" | "weekdays" | "weekly" | "custom";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          date_of_birth: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          experience_level: ExperienceLevel | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          date_of_birth?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          experience_level?: ExperienceLevel | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          date_of_birth?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          experience_level?: ExperienceLevel | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      user_goals: {
        Row: {
          id: string;
          user_id: string;
          primary_goal: GoalKey;
          secondary_goal: GoalKey | null;
          target_weight_kg: number | null;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          primary_goal: GoalKey;
          secondary_goal?: GoalKey | null;
          target_weight_kg?: number | null;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          primary_goal?: GoalKey;
          secondary_goal?: GoalKey | null;
          target_weight_kg?: number | null;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      user_memberships: {
        Row: {
          user_id: string;
          tier: MembershipTier;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          tier?: MembershipTier;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          tier?: MembershipTier;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferred_training_days: number | null;
          preferred_workout_duration: number | null;
          equipment_access: EquipmentAccess | null;
          preferred_training_location: TrainingLocation | null;
          units: Units;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferred_training_days?: number | null;
          preferred_workout_duration?: number | null;
          equipment_access?: EquipmentAccess | null;
          preferred_training_location?: TrainingLocation | null;
          units?: Units;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferred_training_days?: number | null;
          preferred_workout_duration?: number | null;
          equipment_access?: EquipmentAccess | null;
          preferred_training_location?: TrainingLocation | null;
          units?: Units;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          workout_slug: string;
          started_at: string;
          completed_at: string | null;
          duration_seconds: number | null;
          total_volume: number | null;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_slug: string;
          started_at?: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          total_volume?: number | null;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_slug?: string;
          started_at?: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          total_volume?: number | null;
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      workout_session_exercises: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          exercise_slug: string;
          exercise_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          exercise_slug: string;
          exercise_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          exercise_slug?: string;
          exercise_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      exercise_logs: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          exercise_slug: string;
          set_number: number;
          weight: number | null;
          reps: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          exercise_slug: string;
          set_number: number;
          weight?: number | null;
          reps: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          exercise_slug?: string;
          set_number?: number;
          weight?: number | null;
          reps?: number;
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      progress_metrics: {
        Row: {
          id: string;
          user_id: string;
          metric_type: string;
          value: number;
          unit: string | null;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_type: string;
          value: number;
          unit?: string | null;
          recorded_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          metric_type?: string;
          value?: number;
          unit?: string | null;
          recorded_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      wellness_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          sleep_hours: number | null;
          water_liters: number | null;
          steps: number | null;
          mindfulness_minutes: number | null;
          recovery_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_date?: string;
          sleep_hours?: number | null;
          water_liters?: number | null;
          steps?: number | null;
          mindfulness_minutes?: number | null;
          recovery_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          log_date?: string;
          sleep_hours?: number | null;
          water_liters?: number | null;
          steps?: number | null;
          mindfulness_minutes?: number | null;
          recovery_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      nutrition_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          calories: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_date?: string;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          log_date?: string;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency: HabitFrequency;
          target_value: number | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          frequency?: HabitFrequency;
          target_value?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          frequency?: HabitFrequency;
          target_value?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      saved_programs: {
        Row: {
          id: string;
          user_id: string;
          program_slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          program_slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      saved_exercises: {
        Row: {
          id: string;
          user_id: string;
          exercise_slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_key: string;
          unlocked_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_key: string;
          unlocked_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_key?: string;
          unlocked_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      /**
       * Deletes the calling member's own auth account, cascading to every
       * application table. Argument-free by design — the target is always
       * auth.uid(), so there is nothing here to point at another user.
       */
      delete_own_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

/** Convenience aliases so call sites never rebuild these paths by hand. */
export type PublicSchema = Database["public"];
export type TableName = keyof PublicSchema["Tables"];

export type Tables<T extends TableName> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends TableName> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends TableName> = PublicSchema["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type UserGoals = Tables<"user_goals">;
export type UserPreferences = Tables<"user_preferences">;
export type WorkoutSession = Tables<"workout_sessions">;
export type ExerciseLog = Tables<"exercise_logs">;
export type ProgressMetric = Tables<"progress_metrics">;
export type WellnessLog = Tables<"wellness_logs">;
export type NutritionLog = Tables<"nutrition_logs">;
export type Habit = Tables<"habits">;
export type HabitCompletion = Tables<"habit_completions">;
