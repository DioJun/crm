# CRM Clínica Estética - MVP

Sistema de gestão de clientes para clínicas de estética. Dashboard administrativo fullstack com HTML5, CSS3, JavaScript Vanilla e **Supabase PostgreSQL**.

## 🚀 Começando

### Pré-requisitos

- **Node.js v18.0.0+** com npm
- **Supabase account** (free tier funciona!)

#### Como instalar Node.js:
1. Acesse: https://nodejs.org/
2. Download da versão **LTS** (recomendado)
3. Execute o instalador e marque "Add to PATH"
4. Abra um terminal novo e execute:
   ```bash
   node --version
   npm --version
   ```

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

📖 **Veja o arquivo `SUPABASE_SETUP.md`** para guia completo com screenshots!

**Resumo rápido:**

1. Criar projeto em https://app.supabase.com
2. Executar script SQL de `DATABASE_SCHEMA.sql` no editor SQL
3. Copiar credenciais: Project URL + anon key
4. Colar em `src/supabase/config.js`

### 3. Rodar o Projeto

```bash
npm run dev
```

Abre automaticamente em `http://localhost:5173`

**Pronto! O CRM está funcionando com dados em tempo real do Supabase.** ✅

## 📋 Funcionalidades Implementadas

### ✅ Dashboard
- KPIs: Total de Clientes, Procedimentos, Agendamentos Hoje, Receita
- Próximos 5 agendamentos

### ✅ Módulo Clientes
- **Cadastro:** Nome, WhatsApp, Data de Nascimento, Histórico Clínico
- **Ações:** Criar, Ler, Atualizar, Deletar (CRUD)
- **Recursos:** Paginação, busca em tempo real, validação de campos
- **Integração WhatsApp:** Links diretos para conversa

### ✅ Módulo Procedimentos
- **Cadastro:** Nome, Descrição, Preço, Duração
- **CRUD:** Completo com paginação

### ✅ Módulo Agenda
- **Cadastro:** Cliente, Procedimento, Data, Hora, Status, Anotações
- **Validação:** Impede datas passadas, detecta conflitos
- **Status:** Agendado, Confirmado, Concluído, Cancelado
- **Atualizações em tempo real:** Sincronização automática

## 🎨 Design

- **Paleta:** Branco (#FFF), Cinza (#E8E8E8), Dourado (#D4AF37)
- **Tipografia:** Poppins (Google Fonts)
- **Responsividade:** Mobile First
  - Desktop: 1024px+
  - Tablet: 768px
  - Mobile: 480px
- **Animações:** Transições suaves e feedback visual

## 🛠️ Stack Tecnológico

- **Frontend:** HTML5 + CSS3 (Vanilla, sem frameworks)
- **JavaScript:** Vanilla ES6+
- **Build:** Vite
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Autenticação:** Não incluída no MVP (próxima fase)

## 📁 Estrutura de Pastas

```
├── src/
│   ├── supabase/           # Integração Supabase
│   │   ├── config.js       # Credenciais (edite aqui)
│   │   ├── clientes.js
│   │   ├── procedimentos.js
│   │   └── agendamentos.js
│   ├── pages/              # Páginas da aplicação
│   │   ├── DashboardPage.js
│   │   ├── ClientesPage.js
│   │   ├── ProcedimentosPage.js
│   │   └── AgendaPage.js
│   ├── components/         # Componentes reutilizáveis
│   │   └── Sidebar.js
│   ├── styles/             # Estilos CSS
│   │   ├── globals.css
│   │   ├── layout.css
│   │   ├── sidebar.css
│   │   ├── forms.css
│   │   ├── tables.css
│   │   └── dashboard.css
│   ├── utils/              # Utilitários
│   │   ├── router.js       # SPA routing
│   │   └── validation.js   # Validações e toasts
│   └── main.js             # Entry point
├── index.html
├── vite.config.js
├── package.json
├── DATABASE_SCHEMA.sql     # SQL para Supabase
├── SUPABASE_SETUP.md       # Guia de configuração
└── MIGRATION_FIREBASE_SUPABASE.md  # Detalhes da migração
```

## 🔧 Comandos

```bash
# Modo desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Pré-visualizar build
npm run preview
```

## 🚨 Troubleshooting

### "Supabase não está configurado"
- Verifique se editou `src/supabase/config.js` com suas credenciais
- Abra console (F12) e procure por "Supabase conectado"

### "Tabelas não existem"
- Execute o SQL de `DATABASE_SCHEMA.sql` no Supabase SQL Editor
- Confirme que as 3 tabelas foram criadas: `clientes`, `procedimentos`, `agendamentos`

### "Atualizações em tempo real não funcionam"
- Vá em Supabase Dashboard → Realtime
- Ative as 3 tabelas na seção "Source tables"
- Aguarde 30 segundos e recargue a página

### Página não carrega / erro na tabela
- Abra DevTools (F12) → Console
- Procure por mensagens de erro
- Copie o erro e verifique documentação Supabase

## 📝 Próximos Passos (Pós-MVP)

1. **Autenticação:** Login com Google/Email
2. **Notificações:** WhatsApp/Email de lembrete
3. **Relatórios:** Exportar para PDF/CSV
4. **Dashboard avançado:** Gráficos de receita
5. **Integração Stripe:** Pagamentos online
6. **Deploy:** Vercel / Firebase Hosting

## 📄 Licença

Projeto criado para fins educacionais e comerciais. Todos os direitos reservados.

---

**Desenvolvido com ❤️ em 3 dias. MVP Fullstack CRM v1.0**
