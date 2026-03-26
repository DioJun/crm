# Migração Firebase → Supabase ✅

## O que foi alterado?

### 📁 Arquivos Criados
```
src/supabase/
├── config.js              # Inicialização do Supabase
├── clientes.js            # CRUD de Clientes (Supabase)
├── procedimentos.js       # CRUD de Procedimentos (Supabase)
└── agendamentos.js        # CRUD de Agendamentos + validação de conflitos
```

### 📁 Arquivos Modificados
- `src/main.js` → Importa `supabase/config.js` em vez de `firebase/config.mock.js`
- `src/pages/ClientesPage.js` → Importa de `supabase/clientes.js`
- `src/pages/ProcedimentosPage.js` → Importa de `supabase/procedimentos.js`
- `src/pages/AgendaPage.js` → Importa de `supabase/agendamentos.js`
- `src/pages/DashboardPage.js` → Importa dos três serviços Supabase

### 📁 Arquivos Antigos (Firebase)
Estes arquivos ainda existem mas são obsoletos:
```
src/firebase/
├── config.js              # ❌ Não usado
├── config.mock.js         # ❌ Não usado
├── clientes.js            # ❌ Substituído
├── procedimentos.js       # ❌ Substituído
└── agendamentos.js        # ❌ Substituído
```

**Opcional**: Você pode deletar a pasta `src/firebase/` se quiser deixar o projeto limpo.

## Diferenças Técnicas

### Firebase Firestore
```javascript
// Salvar no Firestore
const docRef = await addDoc(collection(db, "clientes"), clienteData)

// Escutar mudanças
onSnapshot(collection(db, "clientes"), (snapshot) => {
  clientes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
})
```

### Supabase PostgreSQL
```javascript
// Salvar no Supabase
const { data, error } = await supabase
  .from('clientes')
  .insert([clienteData])
  .select()

// Escutar mudanças
supabase
  .channel('clientes-changes')
  .on('postgres_changes', { event: '*', table: 'clientes' }, () => {
    // Carregar dados atualizados
  })
  .subscribe()
```

## Vantagens do Supabase

| Feature | Firebase | Supabase |
|---------|----------|----------|
| **Banco de dados** | NoSQL (Firestore) | SQL (PostgreSQL) |
| **Relacionamentos** | Difíceis de modelar | Nativos (Foreign Keys) |
| **Performance** | Bom para apps simples | Excelente para dados complexos |
| **Preço free** | 1GB armazenamento | 500MB armazenamento |
| **Open Source** | ❌ Proprietário | ✅ Open Source |
| **Backup** | Automático | Automático |
| **Realtime** | Sim | Sim (PostgreSQL channels) |

## Como o Supabase Funciona

```
┌─────────────────────────────────────────┐
│        Seu CRM (HTML/CSS/JS)            │
└────────────────┬────────────────────────┘
                 │ import { supabase } from './config.js'
                 │
┌────────────────▼────────────────────────┐
│   @supabase/supabase-js SDK             │
│   (autenticação + banco de dados)       │
└────────────────┬────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────┐
│   Supabase Cloud API                    │
│   (https://seu-projeto.supabase.co)     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   PostgreSQL Database                   │
│   (clientes, procedimentos, agendamentos)│
└─────────────────────────────────────────┘
```

## Fluxo de uma Operação

### Exemplo: Salvar Cliente

```javascript
// 1. Usuário preenche formulário no UI
form = { nome: "Ana Silva", whatsapp: "11987654321" }

// 2. Chama ClientesService.salvarCliente(form)
const id = await ClientesService.salvarCliente(form)

// 3. Valida dados
Validator.validateName("Ana Silva") ✅
Validator.validateWhatsApp("11987654321") ✅

// 4. Envia para Supabase
const { data } = await supabase
  .from('clientes')
  .insert([{ nome, whatsapp, ... }])
  .select()

// 5. Supabase salva no PostgreSQL
INSERT INTO clientes (nome, whatsapp) VALUES ('Ana Silva', '11987654321')

// 6. Retorna ID do novo cliente
return data[0].id // ex: 1

// 7. UI atualiza automaticamente via listener (realtime)
onClientesChange((novosDados) => {
  clientes = novosDados  // Array com Ana Silva
  renderTabela()
})
```

## Arquitetura de Serviços

### ClientesService
- `salvarCliente(dados)` - CREATE ou UPDATE
- `listarClientes()` - READ all
- `obterCliente(id)` - READ one
- `deletarCliente(id)` - DELETE
- `onClientesChange(callback)` - Real-time listener
- `formatarWhatsApp(phone)` - Util
- `formatarData(dateString)` - Util

### ProcedimentosService
- `salvarProcedimento(dados)` - CREATE ou UPDATE
- `listarProcedimentos(apenasAtivos)` - READ
- `obterProcedimento(id)` - READ one
- `deletarProcedimento(id)` - DELETE
- `onProcedimentosChange(callback)` - Real-time listener
- `formatarPreco(valor)` - Util (BRL)
- `formatarDuracao(minutos)` - Util (horas/minutos)

### AgendamentosService
- `salvarAgendamento(dados)` - CREATE ou UPDATE + conflict check
- `verificarConflito(clienteId, data, hora)` - Conflict detection
- `listarAgendamentos(filtros)` - READ com filtros
- `obterAgendamento(id)` - READ one
- `deletarAgendamento(id)` - DELETE
- `atualizarStatus(id, status)` - Update status
- `onAgendamentosChange(callback)` - Real-time listener
- `formatarDataHora(data, hora)` - Util
- `getStatusBadgeClass(status)` - Util (CSS classes)
- `getStatusLabel(status)` - Util (display text)

## Configuração Necessária

Arquivo: `src/supabase/config.js`

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co'
const SUPABASE_ANON_KEY = 'eyJ...'  // Sua chave pública

export const { supabase } = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

**Onde conseguir?**
1. Vá em https://app.supabase.com
2. Selecione seu projeto
3. Settings → API
4. Copie "Project URL" e "anon public key"

## Status da Migração

- ✅ Serviços criados (clientes, procedimentos, agendamentos)
- ✅ Imports atualizados em todas as páginas
- ✅ Schema SQL preparado
- ✅ Guia de configuração criado
- ⏳ Aguardando: Você criar projeto Supabase
- ⏳ Aguardando: Executar schema SQL
- ⏳ Aguardando: Inserir credenciais no config.js
- ⏳ Aguardando: Primeira conexão e teste

## Versão do Supabase

```json
{
  "@supabase/supabase-js": "^2.38.0"
}
```

Instalado via: `npm install @supabase/supabase-js`

## Rollback (Se precisar voltar para Firebase)

1. Desfaça as alterações em `src/main.js`:
```javascript
import './firebase/config.js'  // em vez de supabase/config.js
```

2. Desfaça imports nas páginas:
```javascript
import { ClientesService } from '../firebase/clientes.js'  // em vez de supabase
```

3. Os arquivos Firebase ainda existem e são funcionales se tiverem credenciais.

---

**Próxima ação**: Veja o arquivo `SUPABASE_SETUP.md` para configurar o Supabase! 🚀
