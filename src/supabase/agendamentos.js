/**
 * Serviço de Agendamentos - Supabase
 */

import { supabase } from './config.js'

const TABLE = 'agendamentos'

export class AgendamentosService {
  
  static async salvarAgendamento(dados) {
    try {
      // Validações básicas
      if (!dados.cliente_id || !dados.procedimento_id) {
        throw new Error('Cliente e procedimento são obrigatórios')
      }
      
      if (!dados.data || !dados.hora) {
        throw new Error('Data e hora são obrigatórias')
      }
      
      // Se for novo agendamento, verificar conflito
      if (!dados.id) {
        const conflito = await this.verificarConflito(
          dados.cliente_id,
          dados.data,
          dados.hora
        )
        
        if (conflito) {
          throw new Error('Cliente já possui agendamento neste horário')
        }
      }
      
      // Validar que não é data passada (apenas para novos agendamentos)
      if (!dados.id) {
        const dataAgendamento = new Date(`${dados.data}T${dados.hora}`)
        if (dataAgendamento < new Date()) {
          throw new Error('Não é permitido agendar para data/hora passada')
        }
      }
      
      const agendamentoData = {
        cliente_id: dados.cliente_id,
        procedimento_id: dados.procedimento_id,
        data: dados.data,
        hora: dados.hora,
        status: dados.status || 'agendado',
        observacoes: dados.observacoes || '',
        data_atualizacao: new Date().toISOString()
      }
      
      // Atualizar se tiver ID
      if (dados.id) {
        const { error } = await supabase
          .from(TABLE)
          .update(agendamentoData)
          .eq('id', dados.id)
        
        if (error) throw error
        return dados.id
      }
      
      // Criar novo
      const { data, error } = await supabase
        .from(TABLE)
        .insert([agendamentoData])
        .select()
      
      if (error) throw error
      return data[0]?.id
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error)
      throw error
    }
  }
  
  static async verificarConflito(clienteId, data, hora) {
    try {
      const { data: agendamentos, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('data', data)
        .eq('hora', hora)
        .neq('status', 'cancelado')
      
      if (error) throw error
      return agendamentos && agendamentos.length > 0
    } catch (error) {
      console.error('Erro ao verificar conflito:', error)
      return false
    }
  }
  
  static async listarAgendamentos(filtros = {}) {
    try {
      let query = supabase
        .from(TABLE)
        .select(`
          *,
          clientes(id, nome, whatsapp),
          procedimentos(id, nome, preco, duracao)
        `)
      
      // Filtro por status
      if (filtros.status) {
        query = query.eq('status', filtros.status)
      }
      
      // Filtro por cliente
      if (filtros.cliente_id) {
        query = query.eq('cliente_id', filtros.cliente_id)
      }
      
      // Filtro por data (a partir de hoje)
      if (filtros.futuro) {
        const hoje = new Date().toISOString().split('T')[0]
        query = query.gte('data', hoje)
      }
      
      const { data, error } = await query.order('data', { ascending: true }).order('hora', { ascending: true })
      
      if (error) throw error
      
      return (data || []).map(a => ({
        id: a.id,
        cliente_id: a.cliente_id,
        cliente: a.clientes ? a.clientes.nome : '-',
        clienteWhatsapp: a.clientes ? a.clientes.whatsapp : '-',
        procedimento_id: a.procedimento_id,
        procedimento: a.procedimentos ? a.procedimentos.nome : '-',
        preco: a.procedimentos ? a.procedimentos.preco : 0,
        duracao: a.procedimentos ? a.procedimentos.duracao : 0,
        data: a.data,
        hora: a.hora,
        status: a.status,
        observacoes: a.observacoes,
        dataCriacao: a.data_criacao
      }))
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error)
      return []
    }
  }
  
  // Carrega TODOS os agendamentos (sem filtro de data) com atualização em tempo real
  static onAllAgendamentosChange(callback) {
    try {
      this.listarAgendamentos().then(callback)

      const subscription = supabase
        .channel('agendamentos-all-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: TABLE },
          async () => {
            const agendamentos = await this.listarAgendamentos()
            callback(agendamentos)
          }
        )
        .subscribe()

      return () => { subscription.unsubscribe() }
    } catch (error) {
      console.error('Erro ao configurar listener (all):', error)
    }
  }

  static onAgendamentosChange(callback) {
    try {
      // Carregar dados iniciais
      this.listarAgendamentos({ futuro: true }).then(callback)
      
      // Escutar mudanças em tempo real
      const subscription = supabase
        .channel('agendamentos-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: TABLE },
          async () => {
            const agendamentos = await this.listarAgendamentos({ futuro: true })
            callback(agendamentos)
          }
        )
        .subscribe()
      
      // Retornar função de unsubscribe
      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Erro ao configurar listener:', error)
    }
  }
  
  static async obterAgendamento(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select(`
          *,
          clientes(id, nome, whatsapp),
          procedimentos(id, nome, preco, duracao)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao obter agendamento:', error)
      return null
    }
  }
  
  static async deletarAgendamento(id) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error)
      throw error
    }
  }
  
  static async atualizarStatus(id, status) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .update({ 
          status,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  }
  
  static formatarDataHora(data, hora) {
    const date = new Date(`${data}T${hora}`)
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  static getStatusBadgeClass(status) {
    const statusMap = {
      'agendado': 'badge-info',
      'confirmado': 'badge-success',
      'concluido': 'badge-success',
      'cancelado': 'badge-danger'
    }
    return statusMap[status] || 'badge-info'
  }
  
  static getStatusLabel(status) {
    const statusMap = {
      'agendado': 'Agendado',
      'confirmado': 'Confirmado',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    }
    return statusMap[status] || status
  }
}
