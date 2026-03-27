/**
 * Configuração Supabase
 * Credenciais via variáveis de ambiente (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
 * - Desenvolvimento: .env.local
 * - Produção (Vercel): Project Settings → Environment Variables
 */

import { createClient } from '@supabase/supabase-js'

// Lê das variáveis de ambiente Vite (VITE_* são expostas ao browser)
// - Desenvolvimento: defina em .env.local
// - Vercel: configure em Project Settings → Environment Variables
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || "https://vivrbmqexbmymqyxvvvn.supabase.co"
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdnJibXFleGJteW1xeXh2dnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzYzMTgsImV4cCI6MjA5MDExMjMxOH0.damoVirlE4iu80OHJ8-VmTKAGKDqy1SdJYbmeOn8XPA"

// Verificar se está configurado
export const isConfigured = () => {
  return (
    SUPABASE_URL !== "https://seu-projeto.supabase.co" &&
    SUPABASE_ANON_KEY !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  )
}

let supabase = null

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  if (isConfigured()) {
    console.log('✅ Supabase inicializado com sucesso')
  } else {
    console.warn('⚠️ Supabase NÃO configurado. Edite src/supabase/config.js')
    console.warn('🔗 https://app.supabase.com')
  }
} catch (error) {
  console.error('Erro ao inicializar Supabase:', error)
}

export { supabase }
