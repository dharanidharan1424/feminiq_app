import { createClient } from "@supabase/supabase-js";

const supabaseUrl = " https://xxdkrosmawdgmfdjobcb.supabase.co"//Your supabase URL; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZGtyb3NtYXdkZ21mZGpvYmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NjgyOTIsImV4cCI6MjA4MTM0NDI5Mn0.WjXDfhghyEkRejYZnCtOxqGFA_Prt77jcTEMtBIOapE" // Your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

