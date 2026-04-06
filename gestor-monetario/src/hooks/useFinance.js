import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

// 1. Agora recebe o contaId que vem do App.jsx
export function useFinance(contaId) {
  const [transacoes, setTransacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  const carregarDados = async () => {
    // Se ainda não houver contaId, não tenta carregar nada
    if (!contaId) {
      setTransacoes([])
      setCarregando(false)
      return
    }

    setCarregando(true)
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('conta_id', contaId) // 2. Filtra APENAS as transações desta conta
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setTransacoes(data)
    } else {
      console.error("Erro ao carregar transações:", error)
    }
    
    setCarregando(false)
  }

  const adicionarTransacao = async (nova) => {
    const { error } = await supabase.from('transacoes').insert([nova])
    if (!error) {
      carregarDados() // Atualiza a lista após inserir
    } else {
      console.error("Erro ao inserir:", error)
    }
  }

  const removerTransacao = async (id) => {
    const { error } = await supabase.from('transacoes').delete().eq('id', id)
    if (!error) carregarDados() // Atualiza a lista após apagar
  }

  const editarTransacao = async (id, dadosAtualizados) => {
    const { error } = await supabase.from('transacoes').update(dadosAtualizados).eq('id', id)
    if (!error) carregarDados()
  }

  // 3. A MAGIA ACONTECE AQUI: 
  // Sempre que o contaId mudar, ele corre o carregarDados() outra vez!
  useEffect(() => { 
    carregarDados() 
  }, [contaId])

  return { transacoes, carregando, adicionarTransacao, removerTransacao, editarTransacao }
}