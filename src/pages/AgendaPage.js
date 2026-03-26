/**
 * Agenda Page
 */

import { Calendar } from '@fullcalendar/core'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { AgendamentosService } from '../supabase/agendamentos.js'
import { ClientesService } from '../supabase/clientes.js'
import { ProcedimentosService } from '../supabase/procedimentos.js'
import { Toast, ConfirmModal, Modal } from '../utils/validation.js'

const STATUS_CORES = {
  agendado:   { bg: '#D4AF37', border: '#B8860B', text: '#1a1a1a' },
  confirmado: { bg: '#4CAF50', border: '#388E3C', text: '#fff'    },
  concluido:  { bg: '#78909C', border: '#546E7A', text: '#fff'    },
  cancelado:  { bg: '#EF5350', border: '#C62828', text: '#fff'    },
}

const STATUS_LABELS = {
  agendado:   'Agendado',
  confirmado: 'Confirmado',
  concluido:  'Concluído',
  cancelado:  'Cancelado',
}

export class AgendaPage {
  constructor() {
    this.container     = null
    this.calendar      = null
    this.agendamentos  = []
    this.clientes      = []
    this.procedimentos = []
    this.unsubscribes  = []
  }

  render() {
    this.container = document.createElement('div')
    this.container.className = 'agenda-page'

    this.container.innerHTML = `
      <div class="page-header">
        <h1>📅 Agenda</h1>
        <button class="btn btn-primary" id="agenda-novo-btn">+ Novo Agendamento</button>
      </div>
      <div class="agenda-legend">
        <span class="agenda-legend-item"><span class="agenda-legend-dot" style="background:#D4AF37"></span>Agendado</span>
        <span class="agenda-legend-item"><span class="agenda-legend-dot" style="background:#4CAF50"></span>Confirmado</span>
        <span class="agenda-legend-item"><span class="agenda-legend-dot" style="background:#78909C"></span>Concluído</span>
        <span class="agenda-legend-item"><span class="agenda-legend-dot" style="background:#EF5350"></span>Cancelado</span>
      </div>
      <div class="agenda-calendar-wrapper">
        <div id="agenda-calendar"></div>
      </div>
    `

    this.container.querySelector('#agenda-novo-btn')
      .addEventListener('click', () => this.abrirModalNovo(null))

    this.loadData()
    return this.container
  }

  async loadData() {
    try {
      const [clientes, procedimentos] = await Promise.all([
        ClientesService.listarClientes(),
        ProcedimentosService.listarProcedimentos(),
      ])
      this.clientes      = clientes
      this.procedimentos = procedimentos

      this.initCalendar()

      this.unsubscribes.push(
        AgendamentosService.onAllAgendamentosChange(ag => {
          this.agendamentos = ag
          this.atualizarEventos()
        })
      )
      this.unsubscribes.push(ClientesService.onClientesChange(c => { this.clientes = c }))
      this.unsubscribes.push(ProcedimentosService.onProcedimentosChange(p => { this.procedimentos = p }))
    } catch (err) {
      console.error('Erro ao carregar dados da agenda:', err)
      Toast.error('Erro ao carregar dados da agenda')
    }
  }

  initCalendar() {
    const el = document.getElementById('agenda-calendar')
    if (!el) return

    this.calendar = new Calendar(el, {
      plugins: [timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      locale: ptBrLocale,
      headerToolbar: {
        left:   'prev,next today',
        center: 'title',
        right:  'timeGridWeek,timeGridDay',
      },
      buttonText: { today: 'Hoje', week: 'Semana', day: 'Dia' },
      slotMinTime:       '07:00:00',
      slotMaxTime:       '21:00:00',
      allDaySlot:        false,
      nowIndicator:      true,
      height:            'auto',
      expandRows:        true,
      slotDuration:      '00:30:00',
      slotLabelInterval: '01:00',
      slotLabelFormat:   { hour: '2-digit', minute: '2-digit', hour12: false },
      eventTimeFormat:   { hour: '2-digit', minute: '2-digit', hour12: false },
      eventMinHeight:    40,
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5, 6],
        startTime: '08:00',
        endTime: '20:00',
      },
      dateClick:  (info) => { this.abrirModalNovo(info.dateStr) },
      eventClick: (info) => {
        const ag = this.agendamentos.find(a => String(a.id) === info.event.id)
        if (ag) this.abrirModalDetalhes(ag)
      },
      eventContent: (arg) => {
        const { cliente, procedimento, status } = arg.event.extendedProps
        return {
          html: `
            <div class="fc-event-inner">
              <div class="fc-event-time-label">${arg.timeText}</div>
              <div class="fc-event-title-main">${cliente || arg.event.title}</div>
              <div class="fc-event-subtitle">${procedimento || ''}</div>
              <div class="fc-event-status-tag">${STATUS_LABELS[status] || ''}</div>
            </div>
          `,
        }
      },
    })

    this.calendar.render()
  }

  atualizarEventos() {
    if (!this.calendar) return

    const events = this.agendamentos.map(ag => {
      const cores      = STATUS_CORES[ag.status] || STATUS_CORES.agendado
      const duracao    = Math.max(ag.duracao || 60, 30) // mínimo 30 min
      const horaStr    = (ag.hora || '00:00:00').substring(0, 5)
      const [h, m]     = horaStr.split(':').map(Number)
      const totalMin   = h * 60 + m + duracao
      const endH       = String(Math.floor(totalMin / 60) % 24).padStart(2, '0')
      const endM       = String(totalMin % 60).padStart(2, '0')
      const startStr   = `${ag.data}T${horaStr}:00`
      const endStr     = `${ag.data}T${endH}:${endM}:00`

      return {
        id:              String(ag.id),
        title:           ag.cliente || 'Sem cliente',
        start:           startStr,
        end:             endStr,
        backgroundColor: cores.bg,
        borderColor:     cores.border,
        textColor:       cores.text,
        extendedProps: {
          status:       ag.status,
          cliente:      ag.cliente,
          procedimento: ag.procedimento,
        },
      }
    })

    this.calendar.removeAllEvents()
    this.calendar.addEventSource({ events })
  }

  _optClientes(selectedId = null) {
    return this.clientes
      .map(c => `<option value="${c.id}" ${String(c.id) === String(selectedId) ? 'selected' : ''}>${c.nome}</option>`)
      .join('')
  }

  _optProcs(selectedId = null) {
    return this.procedimentos
      .map(p => `<option value="${p.id}" ${String(p.id) === String(selectedId) ? 'selected' : ''}>${p.nome} — ${ProcedimentosService.formatarPreco(p.preco)}</option>`)
      .join('')
  }

  _optStatus(selected = 'agendado') {
    return Object.entries(STATUS_LABELS)
      .map(([v, l]) => `<option value="${v}" ${v === selected ? 'selected' : ''}>${l}</option>`)
      .join('')
  }

  abrirModalNovo(dateStr) {
    let data = '', hora = ''
    if (dateStr) {
      const local = dateStr.substring(0, 16)
      ;[data, hora] = local.split('T')
    }

    Modal.open({
      title: '➕ Novo Agendamento',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">Cliente <span class="required">*</span></label>
          <select class="form-select" id="mnv-cli">
            <option value="">Selecione um cliente...</option>${this._optClientes()}
          </select>
          <div class="form-error" id="mnv-cli-err"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Procedimento <span class="required">*</span></label>
          <select class="form-select" id="mnv-proc">
            <option value="">Selecione um procedimento...</option>${this._optProcs()}
          </select>
          <div class="form-error" id="mnv-proc-err"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Data <span class="required">*</span></label>
            <input type="date" class="form-input" id="mnv-data" value="${data}">
            <div class="form-error" id="mnv-data-err"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Hora <span class="required">*</span></label>
            <input type="time" class="form-input" id="mnv-hora" value="${hora}">
            <div class="form-error" id="mnv-hora-err"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="mnv-status">${this._optStatus()}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea class="form-textarea" id="mnv-obs" placeholder="Informações adicionais..."></textarea>
        </div>
      `,
      footerHTML: `
        <button class="btn btn-secondary" id="mnv-cancelar">Cancelar</button>
        <button class="btn btn-primary"   id="mnv-salvar">💾 Salvar Agendamento</button>
      `,
      onOpen: (_ov, close) => {
        const err = (id, msg) => { document.getElementById(id).textContent = msg }
        document.getElementById('mnv-cancelar').addEventListener('click', close)
        document.getElementById('mnv-salvar').addEventListener('click', async () => {
          const cliId  = document.getElementById('mnv-cli').value
          const procId = document.getElementById('mnv-proc').value
          const dataV  = document.getElementById('mnv-data').value
          const horaV  = document.getElementById('mnv-hora').value
          const stV    = document.getElementById('mnv-status').value
          const obsV   = document.getElementById('mnv-obs').value

          let hasErr = false
          err('mnv-cli-err',  cliId  ? '' : 'Selecione um cliente');       if (!cliId)  hasErr = true
          err('mnv-proc-err', procId ? '' : 'Selecione um procedimento');  if (!procId) hasErr = true
          err('mnv-data-err', dataV  ? '' : 'Data obrigatória');      if (!dataV)  hasErr = true
          err('mnv-hora-err', horaV  ? '' : 'Hora obrigatória');      if (!horaV)  hasErr = true
          if (hasErr) return

          const btn = document.getElementById('mnv-salvar')
          btn.disabled = true; btn.textContent = 'Salvando...'
          try {
            await AgendamentosService.salvarAgendamento({
              cliente_id: parseInt(cliId), procedimento_id: parseInt(procId),
              data: dataV, hora: horaV, status: stV, observacoes: obsV,
            })
            close()
            Toast.success('✅ Agendamento criado com sucesso!')
          } catch (e) {
            btn.disabled = false; btn.textContent = '💾 Salvar Agendamento'
            Toast.error('❌ ' + e.message)
          }
        })
      },
    })
  }

  abrirModalDetalhes(ag) {
    const dataFmt = new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
    const horaFmt = (ag.hora || '').substring(0, 5)
    const cores   = STATUS_CORES[ag.status] || STATUS_CORES.agendado

    const rawPhone = (ag.clienteWhatsapp || '').replace(/\D/g, '')
    const phone    = rawPhone.startsWith('55') ? rawPhone : ('55' + rawPhone)
    const msgWa    = 'Olá ' + ag.cliente + ', confirmamos seu procedimento de ' + ag.procedimento + ' para o dia ' + dataFmt + ' às ' + horaFmt + '. Podemos confirmar?'
    const waHref   = rawPhone ? ('https://wa.me/' + phone + '?text=' + encodeURIComponent(msgWa)) : null

    Modal.open({
      title: '📋 Detalhes do Agendamento',
      width: '520px',
      bodyHTML: `
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Cliente</span>
            <span class="detail-value">${ag.cliente}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Procedimento</span>
            <span class="detail-value">${ag.procedimento}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Data</span>
            <span class="detail-value">${dataFmt}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Hora</span>
            <span class="detail-value">${horaFmt}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status</span>
            <span class="detail-value">
              <span class="agenda-status-badge" style="background:${cores.bg};color:${cores.text}">${STATUS_LABELS[ag.status]}</span>
            </span>
          </div>
          ${ag.observacoes ? `
          <div class="detail-divider"></div>
          <div class="detail-item">
            <span class="detail-label">Observações</span>
            <span class="detail-value">${ag.observacoes}</span>
          </div>` : ''}
        </div>
      `,
      footerHTML: `
        <button class="btn btn-danger"    id="mdet-deletar">🗑️ Deletar</button>
        <button class="btn btn-secondary" id="mdet-editar">✏️ Editar</button>
        ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">💬 Confirmar via WhatsApp</a>` : ''}
      `,
      onOpen: (_ov, close) => {
        document.getElementById('mdet-deletar').addEventListener('click', async () => {
          const ok = await ConfirmModal.delete(ag.cliente + ' — ' + dataFmt)
          if (!ok) return
          try {
            await AgendamentosService.deletarAgendamento(ag.id)
            close()
            Toast.success('✅ Agendamento deletado!')
          } catch (e) { Toast.error('❌ ' + e.message) }
        })
        document.getElementById('mdet-editar').addEventListener('click', () => {
          close()
          setTimeout(() => this.abrirModalEdicao(ag), 280)
        })
      },
    })
  }

  abrirModalEdicao(ag) {
    Modal.open({
      title: '✏️ Editar Agendamento',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">Cliente <span class="required">*</span></label>
          <select class="form-select" id="med-cli">${this._optClientes(ag.cliente_id)}</select>
          <div class="form-error" id="med-cli-err"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Procedimento <span class="required">*</span></label>
          <select class="form-select" id="med-proc">${this._optProcs(ag.procedimento_id)}</select>
          <div class="form-error" id="med-proc-err"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Data <span class="required">*</span></label>
            <input type="date" class="form-input" id="med-data" value="${ag.data || ''}">
            <div class="form-error" id="med-data-err"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Hora <span class="required">*</span></label>
            <input type="time" class="form-input" id="med-hora" value="${(ag.hora || '').substring(0, 5)}">
            <div class="form-error" id="med-hora-err"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="med-status">${this._optStatus(ag.status)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea class="form-textarea" id="med-obs">${ag.observacoes || ''}</textarea>
        </div>
      `,
      footerHTML: `
        <button class="btn btn-secondary" id="med-cancelar">Cancelar</button>
        <button class="btn btn-primary"   id="med-salvar">💾 Salvar</button>
      `,
      onOpen: (_ov, close) => {
        const err = (id, msg) => { document.getElementById(id).textContent = msg }
        document.getElementById('med-cancelar').addEventListener('click', close)
        document.getElementById('med-salvar').addEventListener('click', async () => {
          const cliId  = document.getElementById('med-cli').value
          const procId = document.getElementById('med-proc').value
          const dataV  = document.getElementById('med-data').value
          const horaV  = document.getElementById('med-hora').value
          const stV    = document.getElementById('med-status').value
          const obsV   = document.getElementById('med-obs').value

          let hasErr = false
          err('med-cli-err',  cliId  ? '' : 'Selecione um cliente');       if (!cliId)  hasErr = true
          err('med-proc-err', procId ? '' : 'Selecione um procedimento');  if (!procId) hasErr = true
          err('med-data-err', dataV  ? '' : 'Data obrigatória');      if (!dataV)  hasErr = true
          err('med-hora-err', horaV  ? '' : 'Hora obrigatória');      if (!horaV)  hasErr = true
          if (hasErr) return

          const btn = document.getElementById('med-salvar')
          btn.disabled = true; btn.textContent = 'Salvando...'
          try {
            await AgendamentosService.salvarAgendamento({
              id: ag.id,
              cliente_id: parseInt(cliId), procedimento_id: parseInt(procId),
              data: dataV, hora: horaV, status: stV, observacoes: obsV,
            })
            close()
            Toast.success('✅ Agendamento atualizado!')
          } catch (e) {
            btn.disabled = false; btn.textContent = '💾 Salvar'
            Toast.error('❌ ' + e.message)
          }
        })
      },
    })
  }

  destroy() {
    if (this.calendar) { this.calendar.destroy(); this.calendar = null }
    this.unsubscribes.forEach(fn => typeof fn === 'function' && fn())
    delete window.editarAgendamento
    delete window.confirmarDeleteAgendamento
    delete window.mudarPaginaAgenda
  }
}

window.agendaPageInstance = null

export function setAgendaInstance(instance) {
  window.agendaPageInstance = instance
  window.editarAgendamento = (id) => {
    const ag = instance.agendamentos.find(a => String(a.id) === String(id))
    if (ag) instance.abrirModalEdicao(ag)
  }
  window.confirmarDeleteAgendamento = (id) => {
    const ag = instance.agendamentos.find(a => String(a.id) === String(id))
    if (ag) instance.abrirModalDetalhes(ag)
  }
}

window.setAgendaInstance = setAgendaInstance
