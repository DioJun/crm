/**
 * Serviço de Procedimentos - Supabase
 */

import { supabase } from './config.js'
import { Validator } from '../utils/validation.js'

const TABLE = 'procedimentos'

export class ProcedimentosService {
  
  static async salvarProcedimento(dados) {
    try {
      if (!Validator.validateName(dados.nome)) {
        throw new Error('Nome do procedimento inválido (mínimo 3 caracteres)')
      }
      
      if (!dados.preco || isNaN(dados.preco) || parseFloat(dados.preco) <= 0) {
        throw new Error('Preço inválido (deve ser maior que 0)')
      }
      
      if (!dados.duracao || isNaN(dados.duracao) || parseInt(dados.duracao) <= 0) {
        throw new Error('Duração inválida (deve ser maior que 0 minutos)')
      }
      
      const procedimentoData = {
        nome: dados.nome.trim(),
        descricao: dados.descricao || '',
        preco: parseFloat(dados.preco),
        duracao: parseInt(dados.duracao),
        ativo: dados.ativo !== false,
        data_atualizacao: new Date().toISOString()
      }
      
      // Atualizar se tiver ID
      if (dados.id) {
        const { error } = await supabase
          .from(TABLE)
          .update(procedimentoData)
          .eq('id', dados.id)
        
        if (error) throw error
        return dados.id
      }
      
      // Criar novo
      const { data, error } = await supabase
        .from(TABLE)
        .insert([procedimentoData])
        .select()
      
      if (error) throw error
      return data[0]?.id
    } catch (error) {
      console.error('Erro ao salvar procedimento:', error)
      throw error
    }
  }
  
  static async listarProcedimentos(apenasAtivos = false) {
    try {
      let query = supabase
        .from(TABLE)
        .select('*')
      
      if (apenasAtivos) {
        query = query.eq('ativo', true)
      }
      
      const { data, error } = await query.order('data_criacao', { ascending: false })
      
      if (error) throw error
      
      return (data || []).map(p => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: p.preco,
        duracao: p.duracao,
        ativo: p.ativo,
        dataCriacao: p.data_criacao
      }))
    } catch (error) {
      console.error('Erro ao listar procedimentos:', error)
      return []
    }
  }
  
  static onProcedimentosChange(callback) {
    try {
      // Carregar dados iniciais
      this.listarProcedimentos().then(callback)
      
      // Escutar mudanças em tempo real
      const subscription = supabase
        .channel('procedimentos-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: TABLE },
          async () => {
            const procedimentos = await this.listarProcedimentos()
            callback(procedimentos)
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
  
  static async obterProcedimento(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao obter procedimento:', error)
      return null
    }
  }
  
  static async deletarProcedimento(id) {
    try {
      const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Erro ao deletar procedimento:', error)
      throw error
    }
  }
  
  static formatarPreco(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }
  
  static formatarDuracao(minutos) {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    if (horas > 0) {
      return `${horas}h${mins > 0 ? ' ' + mins + 'min' : ''}`
    }
    return `${mins}min`
  }
}
