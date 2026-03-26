# 🧪 MODO DESENVOLVIMENTO - Firebase Mock

Você tem 2 opções:

## ✅ OPÇÃO 1: Usar Firebase REAL (Recomendado)

**Como fazer:**
1. Siga as instruções em [SETUP-FIREBASE.md](./SETUP-FIREBASE.md)
2. Cole suas credenciais em `src/firebase/config.js`
3. Recarregue a página (F5)

**Vantagem:** Dados persistem, funcionalidade completa

---

## 🧪 OPÇÃO 2: Usar Firebase MOCK (Para teste rápido)

Já com **dados de teste pré-carregados**!

### Ativar o modo Mock

Abra `src/main.js` e altere a importação:

**ANTES:**
```javascript
import './styles/globals.css'
import './styles/layout.css'
// ... outros imports
```

**DEPOIS (adicione esta linha):**
```javascript
// 🧪 Descomentar para modo DESENVOLVIMENTO com dados de teste
import './firebase/config.mock.js'
```

Ou substitua a importação em qualquer arquivo que importe de `src/firebase/config.js`:

```javascript
// Em vez de:
import { db, /* ... */ } from './firebase/config.js'

// Use:
import { db, /* ... */ } from './firebase/config.mock.js'
```

### Dados de Teste Inclusos

**2 Clientes:**
- Ana Silva - 85987123456
- Carla Santos - 85988765432

**3 Procedimentos:**
- Limpeza de Pele (R$150.00, 60min)
- Peeling Químico (R$200.00, 45min)
- Microagulhamento (R$300.00, 50min)

**2 Agendamentos:**
- Ana Silva - 28/03/2026 às 14:00
- Carla Santos - 29/03/2026 às 10:30

### Recarregue
Pressione **F5** e veja os dados de teste carregados! 🎉

---

## 🔄 Como Alternar

### Para usar MOCK:
1. Edite `src/main.js` (ou qualquer arquivo que importe firebase)
2. Troque a importação para `config.mock.js`
3. Recarregue (F5)
4. Obtenha ✅ "🧪 MODO DESENVOLVIMENTO - Firebase Mock Ativo"

### Para usar REAL:
1. Configure credenciais em `src/firebase/config.js`
2. Troque importação de volta para `config.js`
3. Recarregue (F5)
4. Obtenha ✅ "Firebase inicializado com sucesso"

---

## ⚠️ Notas Importantes

- **Mock armazena em memória** → Dados perdidos ao recarregar
- **Mock é útil para** UI testing, demos, apresentações
- **Para PRODUÇÃO** use Firebase Real
- Todos os CRUD funcionam igual em ambos os modos

---

## 🚀 Recomendação

1. **Agora:** Use MOCK para trabalhar na UI/UX
2. **Depois:** Configure Firebase Real quando tiver credenciais prontas
3. **Fácil alternar** entre os dois conforme necessário

---

**Qual opção você prefere? 🎯**
