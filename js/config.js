// Supabase config only — all other API keys are removed from the frontend.
// They now live securely in Vercel Environment Variables and are accessed
// only via the serverless functions in the /api/ folder.

export const CONFI = {
    SUPABASE_URL: "https://ubtkfudpvgebgdbwymde.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGtmdWRwdmdlYmdkYnd5bWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjQ0MDAsImV4cCI6MjA4ODc0MDQwMH0.SaLSOXsxhwlaoG4mabCLp_48r1VSJBiJNgYOKna6f1c"
};

// NOTE: Supabase URL and Anon Key are SAFE to expose on the frontend.
// The Anon key is a public key designed for client-side use, protected by Row Level Security (RLS).
// All sensitive keys (Claude, Gemini, Unsplash, Resend) are managed via Vercel Environment Variables.
