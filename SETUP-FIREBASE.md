# 🔥 SETUP FIREBASE - GUIA VISUAL

## ⚡ RESUMO (3 passos rápidos)

1. **Criar projeto Firebase** (grátis)
2. **Copiar credenciais**
3. **Colar em `src/firebase/config.js`**

---

## 📋 PASSO 1: Crie Projeto no Firebase Console

### 1.1 - Abra Firebase
✅ Clique aqui: https://console.firebase.google.com

### 1.2 - Crie novo projeto
- Clique em **"Adicionar projeto"** ou **"Create project"**
- **Nome do projeto:** `crm-clinica-estetica`
- **Google Analytics:** Desmarque (não precisa para MVP)
- Clique em **"Criar projeto"** / **"Create project"**

### 1.3 - Aguarde finalizar
⏳ Firebase criará o projeto (2-3 minutos)

---

## 📱 PASSO 2: Registre um App Web

Quando o projeto estiver pronto:

### 2.1 - Clique no ícone Web
👉 Procure por **`</>`** (símbolo de código) na tela inicial
- Clique nele
- Ou vá em **Configurações do Projeto** → **Seus aplicativos** → **Adicionar app**

### 2.2 - Selecione Web
- Clique em **Web** (símbolo `</>`)
- **App nickname:** deixe em branco
- ✅ Marque: **"Also set up Cloud Firestore"** (se aparecer)
- Clique em **"Registrar app"** / **"Register app"**

### 2.3 - Copie suas credenciais
Você verá uma tela assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "crm-clinica-abc123.firebaseapp.com",
  projectId: "crm-clinica-abc123",
  storageBucket: "crm-clinica-abc123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcd"
};
```

✅ **COPIE TODO ESSE BLOCO** (Ctrl+C)

---

## 🔐 PASSO 3: Configure `src/firebase/config.js`

### 3.1 - Abra o arquivo
No VS Code, abra: **`src/firebase/config.js`**

### 3.2 - Localize a seção de configuração
Procure por:

```javascript
const firebaseConfig = {
  apiKey: "AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // ← COLE AQUI
  authDomain: "seu-projeto-123.firebaseapp.com", // ← COLE AQUI
  projectId: "seu-projeto-123", // ← COLE AQUI
  storageBucket: "seu-projeto-123.appspot.com", // ← COLE AQUI
  messagingSenderId: "123456789012", // ← COLE AQUI
  appId: "1:123456789012:web:abcdef1234567890" // ← COLE AQUI
}
```

### 3.3 - Cole suas credenciais
**ANTES:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "seu-projeto-123.firebaseapp.com",
  projectId: "seu-projeto-123",
  // ...
}
```

**DEPOIS (exemplo):**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "crm-clinica-abc123.firebaseapp.com",
  projectId: "crm-clinica-abc123",
  storageBucket: "crm-clinica-abc123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcd"
}
```

✅ **Salve o arquivo** (Ctrl+S)

---

## 🗄️ PASSO 4: Configure Firestore Database

### 4.1 - Abra Firestore
No Firebase Console:
- Vá em **"Firestore Database"** (menu esquerdo)
- Clique em **"Create database"** / **"Criar banco de dados"**

### 4.2 - Modo de teste
- **Segurança:** Select **"Start in test mode"** / **"Começar no modo teste"**
- **Localização:**  Select a mais próxima (ex: South America - São Paulo)
- Clique em **"Create database"** / **"Criar"**

### 4.3 - Crie 3 coleções vazias
Dentro do Firestore Database, no menu superior direito, clique em **"Start collection"** / **"Iniciar coleção"**

Crie estas 3 coleções (deixe vazias):
1. `clientes`
2. `procedimentos`
3. `agendamentos`

**Para cada uma:**
- Nome da coleção: (ex: `clientes`)
- Clique em **"Next"** / **"Próximo"**
- **Document ID:** deixe em branco ou automático
- **Add first document:** pule (deixe vazio)
- Clique em **"Save"** / **"Salvar"**

---

## ✅ VERIFICAR SE FUNCIONOU

Depois de fazer tudo isso:

1. **Volte para a aba do navegador com a app** (http://localhost:5173)
2. **Pressione F5** para recarregar
3. Abra **DevTools** (F12) e vá para **Console**
4. Você deve ver em VERDE:
   ```
   ✅ Firebase inicializado com sucesso
   ```

Se vir em VERMELHO:
```
❌ Erro ao inicializar Firebase
```
→ Verifique se as credenciais foram coladas corretamente

---

## 🚀 TESTAR A APP

Depois que Firebase está funcionando:

### Teste 1: Criar um Cliente
1. Vá para **👥 Clientes**
2. Preencha:
   - Nome: `João Silva`
   - WhatsApp: `(98) 98888-8888`
   - Data: deixe em branco
   - Histórico: `Primeira visita`
3. Clique em **💾 Salvar Cliente**
4. Deve aparecer ✅ **"Cliente cadastrado com sucesso!"**

### Teste 2: Criar um Procedimento
1. Vá para **✂️ Procedimentos**
2. Preencha:
   - Nome: `Limpeza de Pele`
   - Descrição: `Limpeza profunda com extratos naturais`
   - Preço: `150.00`
   - Duração: `60`
3. Clique em **💾 Salvar Procedimento**

### Teste 3: Criar uma Agenda
1. Vá para **📅 Agenda**
2. Selecione:
   - Cliente: `João Silva`
   - Procedimento: `Limpeza de Pele`
   - Data: **amanhã ou dia seguinte**
   - Hora: `14:00`
3. Clique em **💾 Salvar Agendamento**

---

## 🆘 TROUBLESHOOTING

### ❌ Erro: "Firebase não está configurado"
- ✅ Edite `src/firebase/config.js`
- ✅ Copie credenciais corretamente (sem espaços extras)
- ✅ Salve o arquivo (Ctrl+S)
- ✅ Recarregue a página (F5)

### ❌ Erro: "Expected first argument to collection()..."
- Firebase não inicializou corretamente
- Verifique se `apiKey` está correto (não tem "XIzaXXXX" mais)

### ❌ Tabela vazia depois de adicionar cliente
- Verifique se a coleção `clientes` existe no Firestore
- Adicione um cliente via formulário

### ❌ Dropdown de clientes/procedimentos vazio na agenda
- Crie primeiro alguns clientes/procedimentos
- Aguarde 2-3 segundos para sincronizar

---

## 📞 PRÓXIMAS ETAPAS

Depois de configurar:
1. ✅ Teste os 3 CRUD básicos (Create, Read, Update, Delete)
2. ✅ Teste editar um cliente
3. ✅ Teste deletar um agendamento
4. ✅ Explore o Dashboard (KPIs devem atualizar)

---

**Gostaria de ajuda para configurar? Cole suas credenciais do Firebase abaixo que eu insiro para você! 🚀**
