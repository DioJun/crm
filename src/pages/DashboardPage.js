/**
 * Dashboard Page - Página inicial com KPIs
 */

import { ClientesService } from '../supabase/clientes.js'
import { ProcedimentosService } from '../supabase/procedimentos.js'
import { AgendamentosService } from '../supabase/agendamentos.js'

export class DashboardPage {
  constructor() {
    this.container = null
    this.unsubscribes = []
  }
  
  render() {
    this.container = document.createElement('div')
    
    // Cabeçalho
    const header = document.createElement('div')
    header.className = 'page-header'
    header.innerHTML = '<h1>📊 Dashboard</h1><p>Bem-vindo ao CRM da Clínica Estética</p>'
    
    // Corpo
    const body = document.createElement('div')
    body.className = 'page-body'
    
    // KPI Cards
    const kpisContainer = document.createElement('div')
    kpisContainer.className = 'kpis-container'
    
    const kpiHTML = `
      <div class="kpi-card">
        <div class="kpi-icon">👥</div>
        <div class="kpi-content">
          <div class="kpi-value" id="total-clientes">-</div>
          <div class="kpi-label">Total de Clientes</div>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-icon">✂️</div>
        <div class="kpi-content">
          <div class="kpi-value" id="total-procedimentos">-</div>
          <div class="kpi-label">Procedimentos</div>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-icon">📅</div>
        <div class="kpi-content">
          <div class="kpi-value" id="agendamentos-hoje">-</div>
          <div class="kpi-label">Agendamentos Hoje</div>
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-icon">💰</div>
        <div class="kpi-content">
          <div class="kpi-value" id="receita-hoje">-</div>
          <div class="kpi-label">Receita Estimada Hoje</div>
        </div>
      </div>
    `
    
    kpisContainer.innerHTML = kpiHTML
    
    // Últimos agendamentos
    const agendamentosSection = document.createElement('div')
    agendamentosSection.className = 'dashboard-section'
    agendamentosSection.innerHTML = `
      <h2>Próximos Agendamentos</h2>
      <div id="proximos-agendamentos" class="loading">
        <div class="loading-spinner"></div>
      </div>
    `
    
    body.appendChild(kpisContainer)
    body.appendChild(agendamentosSection)
    
    // Footer
    const footer = document.createElement('div')
    footer.className = 'page-footer'
    footer.innerHTML = '© 2024 CRM Clínica Estética. Todos os direitos reservados.'
    
    this.container.appendChild(header)
    this.container.appendChild(body)
    this.container.appendChild(footer)
    
    // Carregar dados
    this.loadData()
    this.setupListeners()
    
    return this.container
  }
  
  async loadData() {
    try {
      // Dados estáticos
      const clientes = await ClientesService.listarClientes()
      const procedimentos = await ProcedimentosService.listarProcedimentos()
      const agendamentos = await AgendamentosService.listarAgendamentos()
      
      // Verificações de segurança
      const totalClientesEl = document.getElementById('total-clientes')
      const totalProcedimentosEl = document.getElementById('total-procedimentos')
      const agendamentosHojeEl = document.getElementById('agendamentos-hoje')
      const receitaHojeEl = document.getElementById('receita-hoje')
      const proxAgEl = document.getElementById('proximos-agendamentos')
      
      if (!totalClientesEl || !totalProcedimentosEl || !agendamentosHojeEl || !receitaHojeEl || !proxAgEl) return
      
      // Atualizar KPIs
      totalClientesEl.textContent = clientes.length
      totalProcedimentosEl.textContent = procedimentos.length
      
      // Agendamentos de hoje
      const hoje = new Date().toISOString().split('T')[0]
      const agendamentosHoje = agendamentos.filter(a => a.data === hoje && a.status !== 'cancelado')
      agendamentosHojeEl.textContent = agendamentosHoje.length
      
      // Receita hoje (preco já vem do join no AgendamentosService)
      const receitaHoje = agendamentosHoje.reduce((sum, a) => sum + (Number(a.preco) || 0), 0)
      receitaHojeEl.textContent = `R$ ${receitaHoje.toFixed(2)}`
      
      // Próximos agendamentos (próximas 5)
      this.renderProximos5(agendamentos)
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      const proxAgEl = document.getElementById('proximos-agendamentos')
      if (proxAgEl) proxAgEl.innerHTML = '<p class="text-error">Erro ao carregar dados</p>'
    }
  }
  
  renderProximos5(agendamentos) {
    const container = document.getElementById('proximos-agendamentos')
    const agora = new Date().toISOString()
    
    const proximos = agendamentos
      .filter(a => `${a.data}T${a.hora}` >= agora && a.status !== 'cancelado')
      .sort((a, b) => (`${a.data}T${a.hora}`).localeCompare(`${b.data}T${b.hora}`))
      .slice(0, 5)
    
    if (proximos.length === 0) {
      container.innerHTML = '<p class="text-muted">Nenhum agendamento próximo</p>'
      return
    }
    
    let html = '<table class="table"><tbody>'
    proximos.forEach(agendamento => {
      const data = new Date(agendamento.data).toLocaleDateString('pt-BR')
      html += `
        <tr>
          <td>${data} às ${agendamento.hora}</td>
          <td><span class="status-badge ${agendamento.status}">${agendamento.status}</span></td>
        </tr>
      `
    })
    html += '</tbody></table>'
    
    container.innerHTML = html
  }
  
  async getProcedimentoDetalhes(id, cache = []) {
    const cached = cache.find(p => p.id === id)
    if (cached) return cached
    return await ProcedimentosService.obterProcedimento(id)
  }
  
  setupListeners() {
    // Recarregar dashboard quando qualquer tabela muda (chamado apenas 1x)
    this.unsubscribes.push(
      AgendamentosService.onAgendamentosChange(() => this.loadData()),
      ClientesService.onClientesChange(() => this.loadData()),
      ProcedimentosService.onProcedimentosChange(() => this.loadData())
    )
  }
  
  destroy() {
    this.unsubscribes.forEach(unsub => {
      if (typeof unsub === 'function') unsub()
    })
  }
}

// Setter de instância para consistência com Router
export function setDashboardInstance(instance) {
  // Dashboard é apenas de leitura, não há ações globais necessárias
}

// Registrar função setter no window para Router encontrar
window.setDashboardInstance = setDashboardInstance

