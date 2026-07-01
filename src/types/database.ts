// Auto-generiert via: pnpm db:types
// NICHT manuell bearbeiten
// Ersetze YOUR_PROJECT_ID in package.json und führe `pnpm db:types` aus

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
