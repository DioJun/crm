-- ============================================================
-- whatsapp_cron.sql
-- Lembrete diário de agendamentos via pg_cron + pg_net
--
-- Execute este SQL em:
--   Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Habilita as extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Remove versão antiga do job (caso exista)
SELECT cron.unschedule('whatsapp-reminder-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'whatsapp-reminder-daily'
);

-- 3. Cria o job: dispara todo dia às 09:00 BRT (= 12:00 UTC)
SELECT cron.schedule(
  'whatsapp-reminder-daily',
  '0 12 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://vivrbmqexbmymqyxvvvn.supabase.co/functions/v1/whatsapp-reminder',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.webhook_secret', true)
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- ──────────────────────────────────────────────────────────────────────────────
-- IMPORTANTE: defina o segredo do webhook como parâmetro do banco:
--
--   ALTER DATABASE postgres SET "app.webhook_secret" = 'seu_webhook_secret_aqui';
--
-- Esse segredo deve ser o mesmo valor que você colocou em
-- Edge Functions → Secrets → WEBHOOK_SECRET.
-- ──────────────────────────────────────────────────────────────────────────────

-- 4. (Opcional) Verificar se o job foi criado
SELECT jobid, jobname, schedule, command
FROM cron.job
WHERE jobname = 'whatsapp-reminder-daily';
