import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hnejyhgiocecmjwklarm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZWp5aGdpb2NlY21qd2tsYXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDc2NjksImV4cCI6MjA2NjU4MzY2OX0.50QQzMFrkdUgvQU5n4I48egqnMr3cNrHRSZ2kh1ra48";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})