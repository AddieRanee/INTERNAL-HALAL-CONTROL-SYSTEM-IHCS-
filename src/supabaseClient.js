// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Replace link
const SUPABASE_URL = 'https://hkplzrzpehikldjyjsac.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcGx6cnpwZWhpa2xkanlqc2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTE5MTEsImV4cCI6MjA3MDYyNzkxMX0.zUUh5Kyj2U5ng9AsaczpokOnRD2PmRfsso-Kk3yshuQ';
const STORAGE_BUCKET = 'ihcs-files'; // the bucket you just created

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;