/**
 * 🔑 CONFIGURAÇÃO SUPABASE
 * 
 * INSTRUÇÕES:
 * 1. Acesse: https://app.supabase.com
 * 2. Login ou crie conta (grátis)
 * 3. Crie novo projeto
 * 4. Vá em: Settings → API → Project URL e anon key
 * 5. Cole os valores abaixo
 */

import { createClient } from '@supabase/supabase-js'

// ✅ CREDENCIAIS CONFIGURADAS
const SUPABASE_URL = "https://vivrbmqexbmymqyxvvvn.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdnJibXFleGJteW1xeXh2dnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzYzMTgsImV4cCI6MjA5MDExMjMxOH0.damoVirlE4iu80OHJ8-VmTKAGKDqy1SdJYbmeOn8XPA"

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
