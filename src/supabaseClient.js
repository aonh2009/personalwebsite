import { createClient } from "@supabase/supabase-js";

// Reads from environment variables set in Cloudflare Pages (and .env locally).
// If they are not set, this stays null and the site falls back to seed posts,
// so `npm run dev` works out of the box before the backend is connected.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key ? createClient(url, key) : null;
