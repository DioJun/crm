/**
 * Serviço de Clientes - Supabase
 */

import { supabase } from './config.js'
import { Validator } from '../utils/validation.js'

const TABLE = 'clientes'

export class ClientesService {
  
  static async salvarCliente(dados) {
    try {
      if (!Validator.validateName(dados.nome)) {
        throw new Error('Nome inválido (mínimo 3 caracteres)')
      }
      
      if (!Validator.validateWhatsApp(dados.whatsapp)) {
        throw new Error('WhatsApp inválido')
      }
      
      const clienteData = {
        nome: dados.nome.trim(),
        whatsapp: dados.whatsapp.replace(/\D/g, ''),
        data_nascimento: dados.dataNascimento || null,
        historico_clinico: dados.historicoClinico || '',
        data_atualizacao: new Date().toISOString()
      }
      
      // Atualizar se tiver ID
      if (dados.id) {
        const { error } = await supabase
          .from(TABLE)
          .update(clienteData)
          .eq('id', dados.id)
        
        if (error) throw error
        return dados.id
      }
      
      // Criar novo
      const { data, error } = await supabase
        .from(TABLE)
        .insert([clienteData])
        .select()
      
      if (error) throw error
      return data[0]?.id
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      throw error
    }
  }
  
  static async listarClientes() {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('data_criacao', { ascending: false })
      
      if (error) throw error
      
      return (data || []).map(c => ({
        id: c.id,
        nome: c.nome,
        whatsapp: c.whatsapp,
        dataNascimento: c.data_nascimento,
        historicoClinico: c.historico_clinico,
        dataCriacao: c.data_criacao
      }))
    } catch (error) {
      console.error('Erro ao listar clientes:', error)
      return []
    }
  }
  
  static onClientesChange(callback) {
    try {
      // Carregar dados iniciais
      this.listarClientes().then(callback)
      
      // Escutar mudanças em tempo real
      const subscription = supabase
        .channel('clientes-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: TABLE },
          async () => {
            const clientes = await this.listarClientes()
            callback(clientes)
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
  
  static async obterCliente(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao obter cliente:', error)
      return null
    }
  }
  
  static async deletarCliente(id) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      throw error
    }
  }
  
  static formatarWhatsApp(phone) {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `+55 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`
    } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`
    }
    return phone
  }
  
  static formatarData(dateString) {
    if (!dateString) return '-'
    const date = new Date(dateString.split('T')[0] + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
  }
}
