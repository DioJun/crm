/**
 * Clientes Page
 */

import { ClientesService } from '../supabase/clientes.js'
import { Validator, Toast, ConfirmModal, Modal } from '../utils/validation.js'

export class ClientesPage {
  constructor() {
    this.container = null
    this.currentPage = 1
    this.itemsPerPage = 10
    this.clientes = []
    this.editingId = null
    this.unsubscribes = []
  }
  
  render() {
    this.container = document.createElement('div')
    
    // Cabeçalho
    const header = document.createElement('div')
    header.className = 'page-header'
    header.innerHTML = '<h1>👥 Clientes</h1>'
    
    // Corpo
    const body = document.createElement('div')
    body.className = 'page-body'
    
    // Formulário
    const form = this.renderForm()
    
    // Tabela
    const tableSection = document.createElement('div')
    tableSection.innerHTML = `
      <h2 style="margin-top: 40px;">Lista de Clientes</h2>
      <div id="clientes-table" class="table-container">
        <div class="loading">
          <div class="loading-spinner"></div>
          <span>Carregando clientes...</span>
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
    this.loadClientes()
    
    return this.container
  }
  
  renderForm() {
    const form = document.createElement('form')
    form.className = 'form-container'
    form.id = 'cliente-form'
    
    form.innerHTML = `
      <input type="hidden" id="cliente-id" value="">
      
      <div class="form-group">
        <label class="form-label">Nome <span class="required">*</span></label>
        <input type="text" class="form-input" id="cliente-nome" placeholder="Nome completo" required>
        <div class="form-error"></div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">WhatsApp <span class="required">*</span></label>
          <input type="tel" class="form-input" id="cliente-whatsapp" placeholder="(98) 98888-8888" required>
          <div class="form-error"></div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Data de Nascimento</label>
          <input type="date" class="form-input" id="cliente-data-nascimento">
          <div class="form-error"></div>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Histórico Clínico</label>
        <textarea class="form-textarea" id="cliente-historico" placeholder="Informações sobre alergias, procedimentos anteriores, etc."></textarea>
        <div class="form-error"></div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary btn-large">💾 Salvar Cliente</button>
        <button type="reset" class="btn btn-secondary btn-large">🔄 Limpar</button>
        <button type="button" class="btn btn-secondary btn-large" id="btn-cancelar-edicao" style="display: none;">❌ Cancelar Edição</button>
      </div>
    `
    
    form.addEventListener('submit', (e) => this.handleSubmit(e))
    form.addEventListener('reset', () => {
      this.editingId = null
      document.getElementById('btn-cancelar-edicao').style.display = 'none'
    })
    
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btn-cancelar-edicao') {
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
      const nome = document.getElementById('cliente-nome').value
      const whatsapp = document.getElementById('cliente-whatsapp').value
      const dataNascimento = document.getElementById('cliente-data-nascimento').value
      const historicoClinico = document.getElementById('cliente-historico').value
      const id = document.getElementById('cliente-id').value
      
      // Validação
      if (!Validator.validateName(nome)) {
        Validator.showFieldError(document.getElementById('cliente-nome'), 'Nome inválido (mínimo 3 caracteres)')
        return
      }
      
      if (!Validator.validateWhatsApp(whatsapp)) {
        Validator.showFieldError(document.getElementById('cliente-whatsapp'), 'WhatsApp inválido')
        return
      }
      
      if (dataNascimento && !Validator.validateDateOfBirth(dataNascimento)) {
        Validator.showFieldError(document.getElementById('cliente-data-nascimento'), 'Data de nascimento inválida')
        return
      }
      
      // Salvar
      const clienteId = await ClientesService.salvarCliente({
        id: id || null,
        nome,
        whatsapp,
        dataNascimento: dataNascimento || null,
        historicoClinico
      })
      
      // Feedback
      const mensagem = id ? '✅ Cliente atualizado com sucesso!' : '✅ Cliente cadastrado com sucesso!'
      Toast.success(mensagem)
      
      form.reset()
      this.editingId = null
      document.getElementById('btn-cancelar-edicao').style.display = 'none'
      
      // Recarregar tabela
      this.currentPage = 1
      await this.loadClientes()
    } catch (error) {
      Toast.error(`❌ Erro: ${error.message}`)
    }
  }
  
  async loadClientes() {
    try {
      // Listener em tempo real
      this.unsubscribes.push(
        ClientesService.onClientesChange((clientes) => {
          this.clientes = clientes
          this.renderTable()
        })
      )
    } catch (error) {
      console.error('Erro ao carregार clientes:', error)
      const container = document.getElementById('clientes-table')
      container.innerHTML = '<p class="text-error">Erro ao carregar clientes</p>'
    }
  }
  
  renderTable() {
    const container = document.getElementById('clientes-table')
    if (!container) return // Página foi desmontada
    
    if (this.clientes.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Nenhum cliente cadastrado</div></div>'
      return
    }
    
    // Paginação
    const totalPages = Math.ceil(this.clientes.length / this.itemsPerPage)
    const start = (this.currentPage - 1) * this.itemsPerPage
    const paginatedClientes = this.clientes.slice(start, start + this.itemsPerPage)
    
    // Tabela
    let html = '<table class="table"><thead><tr>'
    html += '<th>Nome</th>'
    html += '<th>WhatsApp</th>'
    html += '<th>Data de Nascimento</th>'
    html += '<th class="column-actions">Ações</th>'
    html += '</tr></thead><tbody>'
    
    paginatedClientes.forEach(cliente => {
      const data = ClientesService.formatarData(cliente.dataNascimento)
      const whatsapp = ClientesService.formatarWhatsApp(cliente.whatsapp)
      
      html += `
        <tr>
          <td>${cliente.nome}</td>
          <td><a href="https://wa.me/${cliente.whatsapp}" target="_blank">${whatsapp}</a></td>
          <td>${data}</td>
          <td class="column-actions">
            <div class="action-buttons">
              <button class="btn-action btn-action-view"   onclick="window.verDetalhesCliente('${cliente.id}')" title="Ver Detalhes">👁️</button>
              <button class="btn-action btn-action-edit" onclick="window.editarCliente('${cliente.id}')" title="Editar">✏️</button>
              <button class="btn-action btn-action-delete" onclick="window.confirmarDeleteCliente('${cliente.id}')" title="Deletar">🗑️</button>
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
        html += `<button class="pagination-item" onclick="window.mudarPaginaClientes(1)">« Primeira</button>`
        html += `<button class="pagination-item" onclick="window.mudarPaginaClientes(${this.currentPage - 1})">‹ Anterior</button>`
      }
      
      for (let i = 1; i <= totalPages; i++) {
        if (i === this.currentPage) {
          html += `<button class="pagination-item active">${i}</button>`
        } else if (i >= this.currentPage - 2 && i <= this.currentPage + 2) {
          html += `<button class="pagination-item" onclick="window.mudarPaginaClientes(${i})">${i}</button>`
        }
      }
      
      if (this.currentPage < totalPages) {
        html += `<button class="pagination-item" onclick="window.mudarPaginaClientes(${this.currentPage + 1})">Próxima ›</button>`
        html += `<button class="pagination-item" onclick="window.mudarPaginaClientes(${totalPages})">Última »</button>`
      }
      
      html += '</div>'
    }
    
    container.innerHTML = html
  }
  
  verDetalhesCliente(id) {
    const c = this.clientes.find(cl => cl.id === id || cl.id === parseInt(id))
    if (!c) return
    const whatsapp = ClientesService.formatarWhatsApp(c.whatsapp)
    const nascimento = c.dataNascimento ? ClientesService.formatarData(c.dataNascimento) : '-'
    const criacao = c.dataCriacao ? ClientesService.formatarData(c.dataCriacao) : '-'
    Modal.open({
      title: '👤 Detalhes do Cliente',
      bodyHTML: `
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Nome</span>
            <span class="detail-value">${c.nome}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">WhatsApp</span>
            <span class="detail-value"><a href="https://wa.me/${c.whatsapp}" target="_blank">${whatsapp} 💬</a></span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Data de Nascimento</span>
            <span class="detail-value">${nascimento}</span>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-item">
            <span class="detail-label">Histórico Clínico</span>
            <span class="detail-value">${c.historicoClinico || '<em style="color:var(--color-dark-gray)">Sem informações</em>'}</span>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-item">
            <span class="detail-label">Cadastrado em</span>
            <span class="detail-value">${criacao}</span>
          </div>
        </div>
      `,
      footerHTML: `<button class="btn btn-primary" id="modal-btn-editar-cliente">✏️ Editar</button>`
    })
    setTimeout(() => {
      const btn = document.getElementById('modal-btn-editar-cliente')
      if (btn) btn.addEventListener('click', () => {
        const overlay = document.getElementById('page-modal-overlay')
        if (overlay) overlay.classList.remove('page-modal-overlay--visible')
        setTimeout(() => { if (overlay) overlay.remove(); this.editarCliente(id) }, 200)
      })
    }, 50)
  }

  editarCliente(id) {
    const c = this.clientes.find(cl => cl.id === id || cl.id === parseInt(id))
    if (!c) return
    const nascimento = c.dataNascimento ? c.dataNascimento.split('T')[0] : ''
    Modal.open({
      title: '✏️ Editar Cliente',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">Nome <span class="required">*</span></label>
          <input type="text" class="form-input" id="medit-nome" value="${c.nome}">
          <div class="form-error" id="medit-nome-err"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">WhatsApp <span class="required">*</span></label>
            <input type="tel" class="form-input" id="medit-whatsapp" value="${c.whatsapp}">
            <div class="form-error" id="medit-whatsapp-err"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Data de Nascimento</label>
            <input type="date" class="form-input" id="medit-datanascimento" value="${nascimento}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Histórico Clínico</label>
          <textarea class="form-textarea" id="medit-historico">${c.historicoClinico || ''}</textarea>
        </div>
      `,
      footerHTML: `
        <button class="btn btn-secondary" id="medit-cancelar">Cancelar</button>
        <button class="btn btn-primary" id="medit-salvar">💾 Salvar</button>
      `,
      onOpen: (overlay, close) => {
        document.getElementById('medit-cancelar').addEventListener('click', close)
        document.getElementById('medit-salvar').addEventListener('click', async () => {
          const nome = document.getElementById('medit-nome').value
          const whatsapp = document.getElementById('medit-whatsapp').value
          const dataNascimento = document.getElementById('medit-datanascimento').value
          const historicoClinico = document.getElementById('medit-historico').value
          if (!Validator.validateName(nome)) {
            document.getElementById('medit-nome-err').textContent = 'Nome inválido (mínimo 3 caracteres)'
            document.getElementById('medit-nome').focus()
            return
          }
          if (!Validator.validateWhatsApp(whatsapp)) {
            document.getElementById('medit-whatsapp-err').textContent = 'WhatsApp inválido'
            document.getElementById('medit-whatsapp').focus()
            return
          }
          const btn = document.getElementById('medit-salvar')
          btn.disabled = true ; btn.textContent = 'Salvando...'
          try {
            await ClientesService.salvarCliente({ id: c.id, nome, whatsapp, dataNascimento: dataNascimento || null, historicoClinico })
            close()
            Toast.success('✅ Cliente atualizado com sucesso!')
          } catch (err) {
            btn.disabled = false ; btn.textContent = '💾 Salvar'
            Toast.error(`❌ Erro: ${err.message}`)
          }
        })
      }
    })
  }
  
  async deletarCliente(id) {
    const cliente = this.clientes.find(c => c.id === id || c.id === parseInt(id))
    const confirmado = await ConfirmModal.delete(cliente ? cliente.nome : 'este cliente')
    if (!confirmado) return
    try {
      await ClientesService.deletarCliente(id)
      this.clientes = this.clientes.filter(c => c.id !== id && c.id !== parseInt(id))
      this.renderTable()
      Toast.success('✅ Cliente deletado com sucesso!')
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
    delete window.editarCliente
    delete window.deletarCliente
    delete window.mudarPaginaClientes
  }
}

// Métodos globais para ações da tabela
window.clientesPageInstance = null

export function setClientesInstance(instance) {
  window.clientesPageInstance = instance
  window.editarCliente = (id) => instance.editarCliente(id)
  window.verDetalhesCliente = (id) => instance.verDetalhesCliente(id)
  window.deletarCliente = (id) => instance.deletarCliente(id)
  window.confirmarDeleteCliente = (id) => instance.deletarCliente(id)
  window.mudarPaginaClientes = (page) => {
    instance.currentPage = page
    instance.renderTable()
  }
}

// Registrar função setter no window para Router encontrar
window.setClientesInstance = setClientesInstance
