import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://dfbbehxcdsjdthfwjsts.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYmJlaHhjZHNqZHRoZndqc3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTA0MjYsImV4cCI6MjA4ODI2NjQyNn0.fN-ndTSd82NJVhmEOZ-pnmkPt9MnDog_Giq4zvRtVZo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
