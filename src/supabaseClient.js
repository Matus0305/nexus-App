import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fqvrtfqcawzygqjowqaw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdnJ0ZnFjYXd6eWdxam93cWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDc1NDgsImV4cCI6MjA4NzAyMzU0OH0.6wc7YQWkhKCaXHadtyFA5SHR7jl4dvpTMpx-NqR7W34'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)