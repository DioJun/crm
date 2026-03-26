/**
 * Procedimentos Page
 */

import { ProcedimentosService } from '../supabase/procedimentos.js'
import { Validator, Toast, ConfirmModal, Modal } from '../utils/validation.js'

export class ProcedimentosPage {
  constructor() {
    this.container = null
    this.currentPage = 1
    this.itemsPerPage = 10
    this.procedimentos = []
    this.editingId = null
    this.unsubscribes = []
  }
  
  render() {
    this.container = document.createElement('div')
    
    // Cabeçalho
    const header = document.createElement('div')
    header.className = 'page-header'
    header.innerHTML = '<h1>✂️ Procedimentos</h1>'
    
    // Corpo
    const body = document.createElement('div')
    body.className = 'page-body'
    
    // Formulário
    const form = this.renderForm()
    
    // Tabela
    const tableSection = document.createElement('div')
    tableSection.innerHTML = `
      <h2 style="margin-top: 40px;">Lista de Procedimentos</h2>
      <div id="procedimentos-table" class="table-container">
        <div class="loading">
          <div class="loading-spinner"></div>
          <span>Carregando procedimentos...</span>
        </div>
      </div>
    `
    
    // Footer
    const footer = document.createElement('div')
    footer.className = 'page-footer'
    
    body.appendChild(form)
    body.appendChild(tableSection)
    
    this.container.appendChild(header)
    this.container.appendChild(body)
    this.container.appendChild(footer)
    
    // Carregare dados
    this.loadProcedimentos()
    
    return this.container
  }
  
  renderForm() {
    const form = document.createElement('form')
    form.className = 'form-container'
    form.id = 'procedimento-form'
    
    form.innerHTML = `
      <input type="hidden" id="procedimento-id" value="">
      
      <div class="form-group">
        <label class="form-label">Nome do Procedimento <span class="required">*</span></label>
        <input type="text" class="form-input" id="procedimento-nome" placeholder="Ex: Limpeza de Pele" required>
        <div class="form-error"></div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Descrição</label>
        <textarea class="form-textarea" id="procedimento-descricao" placeholder="Detalhes do procedimento"></textarea>
        <div class="form-error"></div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Preço (R$) <span class="required">*</span></label>
          <input type="number" class="form-input" id="procedimento-preco" placeholder="100.00" step="0.01" min="0" required>
          <div class="form-error"></div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Duração (minutos) <span class="required">*</span></label>
          <input type="number" class="form-input" id="procedimento-duracao" placeholder="30" step="1" min="1" required>
          <div class="form-error"></div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary btn-large">💾 Salvar Procedimento</button>
        <button type="reset" class="btn btn-secondary btn-large">🔄 Limpar</button>
        <button type="button" class="btn btn-secondary btn-large" id="btn-cancelar-edicao-proc" style="display: none;">❌ Cancelar Edição</button>
      </div>
    `
    
    form.addEventListener('submit', (e) => this.handleSubmit(e))
    form.addEventListener('reset', () => {
      this.editingId = null
      document.getElementById('btn-cancelar-edicao-proc').style.display = 'none'
    })
    
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-cancelar-edicao-proc') {
        form.reset()
        this.editingId = null
        e.target.style.display = 'none'
      }
    })
    
    return form
  }
  
  async handleSubmit(e) {
    e.preventDefault()
    
    try {
      const form = e.target
      const nome = document.getElementById('procedimento-nome').value
      const descricao = document.getElementById('procedimento-descricao').value
      const preco = document.getElementById('procedimento-preco').value
      const duracao = document.getElementById('procedimento-duracao').value
      const id = document.getElementById('procedimento-id').value
      
      // Validação
      if (!Validator.validateName(nome)) {
        Validator.showFieldError(document.getElementById('procedimento-nome'), 'Nome inválido (mínimo 3 caracteres)')
        return
      }
      
      if (!Validator.validatePrice(preco)) {
        Validator.showFieldError(document.getElementById('procedimento-preco'), 'Preço inválido')
        return
      }
      
      if (!Validator.validateDuration(duracao)) {
        Validator.showFieldError(document.getElementById('procedimento-duracao'), 'Duração inválida')
        return
      }
      
      // Salvar
      await ProcedimentosService.salvarProcedimento({
        id: id || null,
        nome,
        descricao,
        preco,
        duracao
      })
      
      // Feedback
      const mensagem = id ? '✅ Procedimento atualizado com sucesso!' : '✅ Procedimento cadastrado com sucesso!'
      Toast.success(mensagem)
      
      form.reset()
      this.editingId = null
      document.getElementById('btn-cancelar-edicao-proc').style.display = 'none'
      
      // Recarregar tabela
      this.currentPage = 1
      await this.loadProcedimentos()
    } catch (error) {
      Toast.error(`❌ Erro: ${error.message}`)
    }
  }
  
  async loadProcedimentos() {
    try {
      // Listener em tempo real
      this.unsubscribes.push(
        ProcedimentosService.onProcedimentosChange((procedimentos) => {
          this.procedimentos = procedimentos
          this.renderTable()
        })
      )
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error)
      const container = document.getElementById('procedimentos-table')
      container.innerHTML = '<p class="text-error">Erro ao carregar procedimentos</p>'
    }
  }
  
  renderTable() {
    const container = document.getElementById('procedimentos-table')
    
    if (this.procedimentos.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Nenhum procedimento cadastrado</div></div>'
      return
    }
    
    // Paginação
    const totalPages = Math.ceil(this.procedimentos.length / this.itemsPerPage)
    const start = (this.currentPage - 1) * this.itemsPerPage
    const paginatedProcedimentos = this.procedimentos.slice(start, start + this.itemsPerPage)
    
    // Tabela
    let html = '<table class="table"><thead><tr>'
    html += '<th>Nome</th>'
    html += '<th>Descrição</th>'
    html += '<th>Preço</th>'
    html += '<th>Duração</th>'
    html += '<th class="column-actions">Ações</th>'
    html += '</tr></thead><tbody>'
    
    paginatedProcedimentos.forEach(proc => {
      const preco = ProcedimentosService.formatarPreco(proc.preco)
      
      html += `
        <tr>
          <td><strong>${proc.nome}</strong></td>
          <td>${proc.descricao || '-'}</td>
          <td>${preco}</td>
          <td>${proc.duracao} min</td>
          <td class="column-actions">
            <div class="action-buttons">
              <button class="btn-action btn-action-edit" onclick="window.editarProcedimento('${proc.id}')" title="Editar">✏️</button>
              <button class="btn-action btn-action-delete" onclick="window.confirmarDeleteProcedimento('${proc.id}')" title="Deletar">🗑️</button>
            </div>
          </td>
        </tr>
      `
    })
    
    html += '</tbody></table>'
    
    // Paginação
    if (totalPages > 1) {
      html += '<div class="pagination">'
      html += `<span class="pagination-info">Página ${this.currentPage} de ${totalPages}</span>`
      
      if (this.currentPage > 1) {
        html += `<button class="pagination-item" onclick="window.mudarPaginaProcedimentos(1)">« Primeira</button>`
        html += `<button class="pagination-item" onclick="window.mudarPaginaProcedimentos(${this.currentPage - 1})">‹ Anterior</button>`
      }
      
      for (let i = 1; i <= totalPages; i++) {
        if (i === this.currentPage) {
          html += `<button class="pagination-item active">${i}</button>`
        } else if (i >= this.currentPage - 2 && i <= this.currentPage + 2) {
          html += `<button class="pagination-item" onclick="window.mudarPaginaProcedimentos(${i})">${i}</button>`
        }
      }
      
      if (this.currentPage < totalPages) {
        html += `<button class="pagination-item" onclick="window.mudarPaginaProcedimentos(${this.currentPage + 1})">Próxima ›</button>`
        html += `<button class="pagination-item" onclick="window.mudarPaginaProcedimentos(${totalPages})">Última »</button>`
      }
      
      html += '</div>'
    }
    
    container.innerHTML = html
  }
  
  editarProcedimento(id) {
    const proc = this.procedimentos.find(p => p.id === id || p.id === parseInt(id))
    if (!proc) return
    Modal.open({
      title: '✏️ Editar Procedimento',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">Nome <span class="required">*</span></label>
          <input type="text" class="form-input" id="mproc-nome" value="${proc.nome}">
          <div class="form-error" id="mproc-nome-err"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <textarea class="form-textarea" id="mproc-descricao">${proc.descricao || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Preço (R$) <span class="required">*</span></label>
            <input type="number" class="form-input" id="mproc-preco" step="0.01" min="0" value="${proc.preco}">
            <div class="form-error" id="mproc-preco-err"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Duração (min) <span class="required">*</span></label>
            <input type="number" class="form-input" id="mproc-duracao" min="1" value="${proc.duracao}">
            <div class="form-error" id="mproc-duracao-err"></div>
          </div>
        </div>
      `,
      footerHTML: `
        <button class="btn btn-secondary" id="mproc-cancelar">Cancelar</button>
        <button class="btn btn-primary" id="mproc-salvar">💾 Salvar</button>
      `,
      onOpen: (overlay, close) => {
        document.getElementById('mproc-cancelar').addEventListener('click', close)
        document.getElementById('mproc-salvar').addEventListener('click', async () => {
          const nome = document.getElementById('mproc-nome').value.trim()
          const descricao = document.getElementById('mproc-descricao').value.trim()
          const preco = parseFloat(document.getElementById('mproc-preco').value)
          const duracao = parseInt(document.getElementById('mproc-duracao').value)
          let hasError = false
          if (!nome || nome.length < 2) {
            document.getElementById('mproc-nome-err').textContent = 'Nome inválido'
            hasError = true
          } else document.getElementById('mproc-nome-err').textContent = ''
          if (isNaN(preco) || preco < 0) {
            document.getElementById('mproc-preco-err').textContent = 'Preço inválido'
            hasError = true
          } else document.getElementById('mproc-preco-err').textContent = ''
          if (isNaN(duracao) || duracao < 1) {
            document.getElementById('mproc-duracao-err').textContent = 'Duração inválida'
            hasError = true
          } else document.getElementById('mproc-duracao-err').textContent = ''
          if (hasError) return
          const btn = document.getElementById('mproc-salvar')
          btn.disabled = true ; btn.textContent = 'Salvando...'
          try {
            await ProcedimentosService.salvarProcedimento({ id: proc.id, nome, descricao, preco, duracao })
            close()
            Toast.success('✅ Procedimento atualizado!')
          } catch (err) {
            btn.disabled = false ; btn.textContent = '💾 Salvar'
            Toast.error(`❌ Erro: ${err.message}`)
          }
        })
      }
    })
  }
  
  async deletarProcedimento(id) {
    const proc = this.procedimentos.find(p => p.id === id || p.id === parseInt(id))
    const confirmado = await ConfirmModal.delete(proc ? proc.nome : 'este procedimento')
    if (!confirmado) return
    try {
      await ProcedimentosService.deletarProcedimento(id)
      this.procedimentos = this.procedimentos.filter(p => p.id !== id && p.id !== parseInt(id))
      this.renderTable()
      Toast.success('✅ Procedimento deletado com sucesso!')
    } catch (error) {
      Toast.error(`❌ Erro ao deletar: ${error.message}`)
    }
  }
  
  destroy() {
    // Limpar listeners
    this.unsubscribes.forEach(unsub => {
      if (typeof unsub === 'function') unsub()
    })
    
    // Remover métodos globais
    delete window.editarProcedimento
    delete window.deletarProcedimento
    delete window.mudarPaginaProcedimentos
  }
}

// Métodos globais para ações da tabela
window.procedimentosPageInstance = null

export function setProcedimentosInstance(instance) {
  window.procedimentosPageInstance = instance
  window.editarProcedimento = (id) => instance.editarProcedimento(id)
  window.deletarProcedimento = (id) => instance.deletarProcedimento(id)
  window.confirmarDeleteProcedimento = (id) => instance.deletarProcedimento(id)
  window.mudarPaginaProcedimentos = (page) => {
    instance.currentPage = page
    instance.renderTable()
  }
}

// Registrar função setter no window para Router encontrar
window.setProcedimentosInstance = setProcedimentosInstance
