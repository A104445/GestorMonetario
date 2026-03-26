import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qzvelrtreptqirliuspl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dmVscnRyZXB0cWlybGl1c3BsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDA2MTMsImV4cCI6MjA4OTg3NjYxM30._C26LnrtqsztPjqCEguZWiZvI5Ihltu_nbTES-E3DNo'

export const supabase = createClient(supabaseUrl, supabaseKey)