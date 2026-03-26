# Guia de Configuração Supabase 🗄️

## Pré-requisitos
- Conta Google, GitHub ou conta de email

## Passo 1: Criar Projeto Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"** (botão verde)
3. Preencha:
   - **Project Name**: `crm-clinica` (ou seu nome preferido)
   - **Database Password**: Escolha uma senha forte (salve em local seguro!)
   - **Region**: Escolha a mais próxima de você (ex: `South America - São Paulo`)
   - **Pricing Plan**: Selecione **"Free"** (tier gratuito)
4. Clique em **"Create new project"** e aguarde 2-3 minutos

## Passo 2: Executar Schema SQL

1. Após o projeto ser criado, você verá o dashboard
2. No menu lateral esquerdo, procure por **"SQL Editor"**
3. Clique em **"New Query"**
4. Copie TODO o conteúdo do arquivo `DATABASE_SCHEMA.sql` da raiz do projeto
5. Cole no editor SQL
6. Clique no botão **▶ Run** (canto superior direito)
7. Você verá: "Success. No rows returned" ou "Query successful"

✅ **As tabelas foram criadas! Os dados de exemplo foram inseridos.**

## Passo 3: Ativar Realtime

Para que as mudanças apareçam em tempo real na aplicação:

1. No menu lateral, vá até **"Realtime"** (em desenvolvimento) ou acesse direto:
   - **Settings** → **Realtime** no painel de administração
2. Em **Source tables**, clique em **"Add source table"**
3. Marque as caixas de seleção de:
   - ✅ `clientes`
   - ✅ `procedimentos`
   - ✅ `agendamentos`
4. Salve as alterações

## Passo 4: Obter Credenciais API

1. No menu lateral, vá até **"Settings"** (último item)
2. Clique em **"API"**
3. Procure por:
   - **Project URL**: Copie este valor (vai começar com `https://...supabase.co`)
   - **anon public key**: Copie este valor (token longo de caracteres)

## Passo 5: Configurar no Projeto CRM

1. Abra o arquivo `src/supabase/config.js`
2. Substitua os valores:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co'  // Cole a URL aqui
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui'        // Cole a chave aqui
```

**Exemplo:**
```javascript
const SUPABASE_URL = 'https://xyzabc123.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

3. Salve o arquivo (Ctrl+S)

## Passo 6: Testar a Conexão

1. Se o servidor de desenvolvimento está rodando, ele vai recarregar automaticamente
2. Abra http://localhost:5173 no navegador
3. Você deve ver:
   - ✅ Página sem erros no console (F12)
   - ✅ Clientes carregados: "Ana Silva" e "Carla Santos"
   - ✅ Procedimentos listados
   - ✅ Agendamentos aparecem na Agenda

### Verificar Console

Pressione **F12** e vá na aba **Console**. Procure por:
- ✅ `✓ Supabase conectado com sucesso!` (verde)
- ❌ Se vir erro vermelho, verifique se:
  - A URL está correta (sem espaços)
  - A chave está correta
  - O projeto foi criado

## Passo 7: Usar a Aplicação

Agora você pode:
- ✅ **Adicionar novos clientes** (nome, WhatsApp, data nascimento)
- ✅ **Criar procedimentos** (nome, preço, duração)
- ✅ **Agendar procedimentos** (seleciona cliente, procedimento, data/hora)
- ✅ **Editar dados** (clica em cliente/procedimento e modifica)
- ✅ **Deletar registros** (clica no botão lixeira)

## Troubleshooting

### ❌ "Erro ao conectar: supabase is not defined"
**Solução**: Verifique se as credenciais estão corretas em `config.js`

### ❌ "Erro ao salvar cliente: relation does not exist"
**Solução**: Execute novamente o SQL schema no editor. Verifique se as tabelas foram criadas:
- Vá em **SQL Editor** → **Recent queries** → Execute `SELECT * FROM clientes;`

### ❌ "Realtime não funciona"
**Solução**: 
1. Vá em **Realtime** e ative as tabelas (marque checkboxes)
2. Aguarde 30 segundos
3. Recargue a página (F5)

### ❌ "WhatsApp validation error"
**Solução**: Digite no formato: `11987654321` ou `+5511987654321`
- Mínimo 10 dígitos
- Máximo 15 dígitos

## Dúvidas Frequentes

**P: Os dados são privados?**
R: Neste MVP, não há autenticação. Qualquer um com a URL e chave pode acessar. Para produção, implemente Row Level Security (RLS) no Supabase.

**P: Posso deletar dados?**
R: Sim! Use os botões na tabela. Dados estão em banco de dados real - não há "lixeira".

**P: Limite de dados?**
R: Plano Free tem até 500MB de armazenamento. Para este CRM com ~100 clientes, durará anos.

**P: Posso usar em production?**
R: Sim, Supabase é production-ready. Apenas adicione autenticação e RLS para segurança.

## Próximos Passos

1. **Autenticação** (não no MVP): Usar `supabase.auth.signUp()`
2. **Backup**: Configure backups automáticos em Settings → Backups
3. **Domínio personalizável**: Use um domínio próprio para deploy
4. **Dark Mode**: Adicione ao CSS global

---

**Suporte**: https://supabase.com/docs
