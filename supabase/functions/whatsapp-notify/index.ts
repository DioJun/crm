/**
 * whatsapp-notify — Supabase Edge Function
 *
 * Disparada por Database Webhook sempre que um agendamento é
 * criado (INSERT) ou tem o status alterado (UPDATE).
 *
 * VARIÁVEIS DE AMBIENTE (configure em Supabase → Edge Functions → Secrets):
 *   SUPABASE_URL               – URL do projeto (preenchida automaticamente)
 *   SUPABASE_SERVICE_ROLE_KEY  – Chave service-role (preenchida automaticamente)
 *   WEBHOOK_SECRET             – Segredo que você definiu no Database Webhook
 *
 *   WA_PROVIDER    → "zapi" | "evolution"   (padrão: zapi)
 *
 *   --- Z-API (https://z-api.io) ---
 *   ZAPI_INSTANCE       – ID da instância
 *   ZAPI_TOKEN          – Token da instância
 *   ZAPI_CLIENT_TOKEN   – Client-Token (aba "Security" no painel Z-API)
 *
 *   --- Evolution API (https://evolution-api.com) ---
 *   EVOLUTION_URL       – URL base do servidor  ex: https://api.suaempresa.com.br
 *   EVOLUTION_INSTANCE  – Nome da instância
 *   EVOLUTION_APIKEY    – API Key global
 *
 * COMO CONFIGURAR O WEBHOOK NO SUPABASE:
 *   1. Acesse: https://supabase.com/dashboard/project/vivrbmqexbmymqyxvvvn
 *   2. Database → Webhooks → Create new webhook
 *   3. Name: whatsapp-notify
 *   4. Table: agendamentos  |  Events: INSERT, UPDATE
 *   5. Webhook URL: https://vivrbmqexbmymqyxvvvn.supabase.co/functions/v1/whatsapp-notify
 *   6. HTTP Headers → Adicionar: Authorization = Bearer {WEBHOOK_SECRET}
 *
 * DEPLOY:
 *   npx supabase functions deploy whatsapp-notify --project-ref vivrbmqexbmymqyxvvvn
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: Record<string, unknown>
  old_record: Record<string, unknown> | null
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // Verifica segredo do webhook
  const secret = Deno.env.get('WEBHOOK_SECRET')
  if (secret) {
    const auth = req.headers.get('Authorization') ?? ''
    if (auth !== `Bearer ${secret}`) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  try {
    const payload: WebhookPayload = await req.json()
    const { type, record, old_record } = payload

    if (payload.table !== 'agendamentos') {
      return ok()
    }

    // DELETE → ignorar
    if (type === 'DELETE') return ok()

    // UPDATE → só processa se o status mudou
    if (type === 'UPDATE' && record.status === old_record?.status) return ok()

    // Busca dados completos (com join)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: ag, error } = await supabase
      .from('agendamentos')
      .select('*, clientes(nome, whatsapp), procedimentos(nome)')
      .eq('id', record.id)
      .single()

    if (error || !ag) {
      console.error('Erro ao buscar agendamento:', error)
      return new Response('Erro interno', { status: 500 })
    }

    const phone = sanitizePhone(ag.clientes?.whatsapp ?? '')
    if (!phone) {
      console.log(`Agendamento #${ag.id}: cliente sem telefone, pulando.`)
      return ok()
    }

    const nome        = ag.clientes?.nome        ?? 'Cliente'
    const procedimento = ag.procedimentos?.nome  ?? 'procedimento'
    const dataFmt     = formatDate(ag.data)
    const horaFmt     = (ag.hora ?? '').substring(0, 5)

    let message = ''

    if (type === 'INSERT') {
      message = msgNovo(nome, procedimento, dataFmt, horaFmt)
    } else if (type === 'UPDATE') {
      if (record.status === 'confirmado') {
        message = msgConfirmado(nome, procedimento, dataFmt, horaFmt)
      } else if (record.status === 'cancelado') {
        message = msgCancelado(nome, procedimento, dataFmt, horaFmt)
      } else if (record.status === 'concluido') {
        message = msgPosVenda(nome, procedimento)
      }
    }

    if (!message) return ok()

    await sendWhatsApp(phone, message)
    console.log(`✅ WhatsApp enviado para ${phone} (agendamento #${ag.id} — ${type}/${record.status})`)

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erro no webhook:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
})

// ─── Mensagens ────────────────────────────────────────────────────────────────

function msgNovo(nome: string, proc: string, data: string, hora: string): string {
  return (
    `Olá, ${nome}! 🌟\n\n` +
    `Seu agendamento foi realizado com sucesso!\n\n` +
    `✨ *${proc}*\n` +
    `📅 ${data}\n` +
    `🕐 ${hora}\n\n` +
    `Qualquer dúvida, é só chamar. Até lá! 💛`
  )
}

function msgConfirmado(nome: string, proc: string, data: string, hora: string): string {
  return (
    `Olá, ${nome}! ✅\n\n` +
    `Seu agendamento está *confirmado*!\n\n` +
    `✨ *${proc}*\n` +
    `📅 ${data} às ${hora}\n\n` +
    `Esperamos por você! 💛`
  )
}

function msgCancelado(nome: string, proc: string, data: string, hora: string): string {
  return (
    `Olá, ${nome}.\n\n` +
    `Seu agendamento de *${proc}* para ${data} às ${hora} foi *cancelado*.\n\n` +
    `Entre em contato para remarcar. Estamos à disposição! 💛`
  )
}

function msgPosVenda(nome: string, proc: string): string {
  return (
    `Olá, ${nome}! 😊\n\n` +
    `Obrigada por confiar em nosso trabalho!\n` +
    `Esperamos que tenha adorado o resultado de *${proc}*. ✨\n\n` +
    `Se quiser agendar sua próxima visita ou indicar para um amigo, estamos aqui! 💛`
  )
}

// ─── Envio WhatsApp ───────────────────────────────────────────────────────────

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const provider = (Deno.env.get('WA_PROVIDER') ?? 'zapi').toLowerCase()

  if (provider === 'evolution') {
    await sendEvolution(phone, message)
  } else {
    await sendZapi(phone, message)
  }
}

async function sendZapi(phone: string, message: string): Promise<void> {
  const instance    = mustEnv('ZAPI_INSTANCE')
  const token       = mustEnv('ZAPI_TOKEN')
  const clientToken = mustEnv('ZAPI_CLIENT_TOKEN')

  const url = `https://api.z-api.io/instances/${instance}/token/${token}/send-text`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Token': clientToken,
    },
    body: JSON.stringify({ phone, message }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Z-API error ${res.status}: ${body}`)
  }
}

async function sendEvolution(phone: string, message: string): Promise<void> {
  const baseUrl  = mustEnv('EVOLUTION_URL').replace(/\/$/, '')
  const instance = mustEnv('EVOLUTION_INSTANCE')
  const apiKey   = mustEnv('EVOLUTION_APIKEY')

  const url = `${baseUrl}/message/sendText/${instance}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey,
    },
    body: JSON.stringify({
      number: phone,
      textMessage: { text: message },
      delay: 500,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Evolution API error ${res.status}: ${body}`)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  // Garante código do país 55 (Brasil)
  return digits.startsWith('55') ? digits : `55${digits}`
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  // Usa Date local para evitar shift de fuso UTC
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day:     '2-digit',
    month:   'long',
    year:    'numeric',
  })
}

function mustEnv(key: string): string {
  const val = Deno.env.get(key)
  if (!val) throw new Error(`Variável de ambiente obrigatória não definida: ${key}`)
  return val
}

function ok(): Response {
  return new Response('OK', { status: 200 })
}
