import { createClient } from "@supabase/supabase-js";

const supabaseUrl =  ""//Your supabase URL; 
const supabaseAnonKey = "" // Your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
