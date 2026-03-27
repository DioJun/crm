/**
 * whatsapp-reminder — Supabase Edge Function
 *
 * Envia lembretes automáticos 24h antes de cada agendamento.
 * Chamada diariamente pelo pg_cron às 09:00 BRT (12:00 UTC).
 *
 * VARIÁVEIS DE AMBIENTE (mesmas da whatsapp-notify):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   WA_PROVIDER, ZAPI_* ou EVOLUTION_*
 *   WEBHOOK_SECRET  (opcional, para proteger a chamada do pg_cron)
 *
 * DEPLOY:
 *   npx supabase functions deploy whatsapp-reminder --project-ref vivrbmqexbmymqyxvvvn
 *
 * ATIVAÇÃO DO CRON (execute o SQL em supabase/migrations/001_whatsapp_cron.sql)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // Verifica segredo para não permitir chamadas externas
  const secret = Deno.env.get('WEBHOOK_SECRET')
  if (secret) {
    const auth = req.headers.get('Authorization') ?? ''
    if (auth !== `Bearer ${secret}`) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Data de amanhã (UTC)
    const amanha = new Date()
    amanha.setUTCDate(amanha.getUTCDate() + 1)
    const dataAmanha = amanha.toISOString().split('T')[0] // "YYYY-MM-DD"

    // Busca agendamentos de amanhã (não cancelados)
    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select('*, clientes(nome, whatsapp), procedimentos(nome)')
      .eq('data', dataAmanha)
      .neq('status', 'cancelado')
      .neq('status', 'concluido')

    if (error) throw error

    if (!agendamentos || agendamentos.length === 0) {
      console.log(`Nenhum agendamento para amanhã (${dataAmanha}).`)
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let sent = 0
    let failed = 0

    for (const ag of agendamentos) {
      const phone = sanitizePhone(ag.clientes?.whatsapp ?? '')
      if (!phone) continue

      const nome        = ag.clientes?.nome       ?? 'Cliente'
      const procedimento = ag.procedimentos?.nome ?? 'procedimento'
      const horaFmt     = (ag.hora ?? '').substring(0, 5)

      const message = msgLembrete(nome, procedimento, dataAmanha, horaFmt)

      try {
        await sendWhatsApp(phone, message)
        sent++
        console.log(`✅ Lembrete enviado para ${phone} (agendamento #${ag.id})`)
      } catch (err) {
        failed++
        console.error(`❌ Falha ao enviar para ${phone} (agendamento #${ag.id}):`, err)
      }

      // Pequena pausa para não sobrecarregar a API
      await sleep(800)
    }

    return new Response(JSON.stringify({ date: dataAmanha, sent, failed }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erro no reminder:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
})

// ─── Mensagem de lembrete ─────────────────────────────────────────────────────

function msgLembrete(nome: string, proc: string, dateStr: string, hora: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const dataFmt = new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  })

  return (
    `Olá, ${nome}! 🔔\n\n` +
    `*Lembrete:* você tem um agendamento *amanhã*!\n\n` +
    `✨ *${proc}*\n` +
    `📅 ${dataFmt}\n` +
    `🕐 ${hora}\n\n` +
    `Caso precise remarcar, entre em contato com antecedência. Até amanhã! 💛`
  )
}

// ─── Envio WhatsApp (duplicado para manter a função autossuficiente) ───────────

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const provider = (Deno.env.get('WA_PROVIDER') ?? 'zapi').toLowerCase()
  provider === 'evolution' ? await sendEvolution(phone, message) : await sendZapi(phone, message)
}

async function sendZapi(phone: string, message: string): Promise<void> {
  const url = `https://api.z-api.io/instances/${mustEnv('ZAPI_INSTANCE')}/token/${mustEnv('ZAPI_TOKEN')}/send-text`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Client-Token': mustEnv('ZAPI_CLIENT_TOKEN') },
    body: JSON.stringify({ phone, message }),
  })
  if (!res.ok) throw new Error(`Z-API ${res.status}: ${await res.text()}`)
}

async function sendEvolution(phone: string, message: string): Promise<void> {
  const url = `${mustEnv('EVOLUTION_URL').replace(/\/$/, '')}/message/sendText/${mustEnv('EVOLUTION_INSTANCE')}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': mustEnv('EVOLUTION_APIKEY') },
    body: JSON.stringify({ number: phone, textMessage: { text: message }, delay: 500 }),
  })
  if (!res.ok) throw new Error(`Evolution ${res.status}: ${await res.text()}`)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return digits.startsWith('55') ? digits : `55${digits}`
}

function mustEnv(key: string): string {
  const val = Deno.env.get(key)
  if (!val) throw new Error(`Variável não definida: ${key}`)
  return val
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
