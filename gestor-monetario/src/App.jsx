import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { useFinance } from './hooks/useFinance';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar'; // <-- Importamos o Sidebar
import { Header } from './components/Header';   // <-- Importamos o Header
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [contaId, setContaId] = useState(null);
  const [contas, setContas] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);

  const { transacoes, carregando, adicionarTransacao, removerTransacao } = useFinance(contaId);
  const [form, setForm] = useState({ razao: '', valor: '', tipo: 'saida', categoria: '❓ Outros' });

  const listaCategorias = [
    '🛒 Supermercado', '🚗 Transporte', '🏠 Casa', '🍿 Lazer', 
    '🍔 Restauração', '🏥 Saúde', '💼 Salário', '❓ Outros'
  ];

  const [mesAtivo, setMesAtivo] = useState(new Date().getMonth());
  const [anoAtivo, setAnoAtivo] = useState(new Date().getFullYear());
  const nomeMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const [verTodos, setVerTodos] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('movimentos');

  const [temaEscuro, setTemaEscuro] = useState(() => localStorage.getItem('tema') === 'escuro');

  const [vistaEstatisticas, setVistaEstatisticas] = useState('barras'); // 'barras' ou 'circular'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) carregarContas();
  }, [session]);

  useEffect(() => {
    if (temaEscuro) {
      document.body.classList.add('dark');
      localStorage.setItem('tema', 'escuro');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('tema', 'claro');
    }
  }, [temaEscuro]);

  async function carregarContas() {
    let { data, error } = await supabase.from('contas').select('*').eq('user_id', session.user.id).order('nome', { ascending: true });
    if (error) return alert("Erro ao ler as tuas contas.");

    if (data && data.length > 0) {
      setContas(data);
      if (!contaId) setContaId(data[0].id);
    } else {
      const { data: novaConta } = await supabase.from('contas').insert([{ user_id: session.user.id, nome: 'Carteira Principal' }]).select().single();
      if (novaConta) { setContas([novaConta]); setContaId(novaConta.id); }
    }
  }

  async function criarNovaConta() {
    const nomeDaConta = prompt("Qual o nome da nova conta?");
    if (!nomeDaConta) return;
    const { data, error } = await supabase.from('contas').insert([{ user_id: session.user.id, nome: nomeDaConta }]).select().single();
    if (!error && data) { setContas([...contas, data]); setContaId(data.id); setMenuAberto(false); } 
    else alert("Erro ao criar conta.");
  }

  async function apagarConta(idParaApagar, nomeDaConta) {
    if (contas.length <= 1) return alert("Não podes apagar a tua única conta.");
    if (!window.confirm(`Apagar a conta "${nomeDaConta}"?`)) return;
    const { error } = await supabase.from('contas').delete().eq('id', idParaApagar);
    if (error) return alert("Erro ao apagar.");
    const contasRestantes = contas.filter(c => c.id !== idParaApagar);
    setContas(contasRestantes);
    if (contaId === idParaApagar) setContaId(contasRestantes[0].id);
  }

  // Matemática
  const transacoesDoMes = transacoes.filter(t => {
    const dataTransacao = new Date(t.created_at);
    return dataTransacao.getMonth() === mesAtivo && dataTransacao.getFullYear() === anoAtivo;
  });

  const transacoesVisiveis = verTodos ? transacoes : transacoesDoMes;
  const saldoTotal = transacoes.reduce((acc, t) => t.tipo === 'entrada' ? acc + t.valor : acc - t.valor, 0);

  const despesasPorCategoria = transacoesVisiveis.filter(t => t.tipo === 'saida').reduce((acc, t) => {
    const cat = t.categoria || '❓ Outros';
    acc[cat] = (acc[cat] || 0) + t.valor;
    return acc;
  }, {});

  const estatisticas = Object.entries(despesasPorCategoria).map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total);
  const totalDespesas = estatisticas.reduce((acc, cat) => acc + cat.total, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.razao || !form.valor || !contaId) return;
    adicionarTransacao({ ...form, valor: parseFloat(form.valor), conta_id: contaId });
    setForm({ ...form, razao: '', valor: '' });
  };

  // --- LÓGICA DO GRÁFICO CIRCULAR ---
  // Uma paleta de cores moderna para as nossas categorias
  const coresGrafico = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6b7280'];

  // Calcular as percentagens e os cortes do gráfico para o CSS conic-gradient
  let acumulado = 0;
  const pieGradient = estatisticas.length > 0 ? estatisticas.map((cat, i) => {
    const perc = (cat.total / totalDespesas) * 100;
    const stop = `${coresGrafico[i % coresGrafico.length]} ${acumulado}% ${acumulado + perc}%`;
    acumulado += perc;
    return stop;
  }).join(', ') : '';

  if (!session) return <Login />;
  const contaAtiva = contas.find(c => c.id === contaId);

  return (
    <div className="container">
      
      {/* 1. MÓDULO SIDEBAR */}
      <Sidebar 
        menuAberto={menuAberto} 
        setMenuAberto={setMenuAberto} 
        contas={contas} 
        contaId={contaId} 
        mudarConta={(id) => { setContaId(id); setMenuAberto(false); }} 
        apagarConta={apagarConta} 
        criarNovaConta={criarNovaConta} 
        temaEscuro={temaEscuro}          
        setTemaEscuro={setTemaEscuro}    
      />

      {/* 2. MÓDULO HEADER */}
      <Header 
        email={session.user.email}
        nomeConta={contaAtiva ? contaAtiva.nome : 'A carregar...'}
        saldoTotal={saldoTotal}
        setMenuAberto={setMenuAberto}
        mesAtivo={mesAtivo} setMesAtivo={setMesAtivo}
        anoAtivo={anoAtivo} setAnoAtivo={setAnoAtivo}
        nomeMeses={nomeMeses}
        verTodos={verTodos} setVerTodos={setVerTodos}
      />

      {/* 3. ZONA CENTRAL (Pode virar módulo no futuro!) */}
      <div className="transacoes" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
          <button onClick={() => setAbaAtiva('movimentos')} style={{ flex: 1, padding: '15px', border: 'none', background: 'none', fontWeight: 'bold', borderBottom: abaAtiva === 'movimentos' ? '3px solid #3b82f6' : '3px solid transparent', color: abaAtiva === 'movimentos' ? '#3b82f6' : '#9ca3af', cursor: 'pointer' }}>📋 Movimentos</button>
          <button onClick={() => setAbaAtiva('estatisticas')} style={{ flex: 1, padding: '15px', border: 'none', background: 'none', fontWeight: 'bold', borderBottom: abaAtiva === 'estatisticas' ? '3px solid #3b82f6' : '3px solid transparent', color: abaAtiva === 'estatisticas' ? '#3b82f6' : '#9ca3af', cursor: 'pointer' }}>📊 Estatísticas</button>
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {abaAtiva === 'movimentos' ? (
            <ul id="lista-transacoes">
              {carregando ? <p style={{textAlign:'center', color:'#9ca3af'}}>A carregar...</p> : transacoesVisiveis.length === 0 ? <p style={{textAlign:'center', color:'#9ca3af'}}>Ainda sem movimentos {verTodos ? '' : 'neste mês'}.</p> : transacoesVisiveis.map(t => (
                <li key={t.id}>
                  <div>
                    <span style={{ display: 'block', fontWeight: 'bold' }}>{t.razao}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{t.categoria || '❓ Outros'}</span>
                  </div>
                  <div className="valor-e-acoes">
                    <strong className={t.tipo}>{t.tipo === 'entrada' ? '+' : '-'} {t.valor.toFixed(2)}€</strong>
                    <button className="btn-apagar" onClick={() => removerTransacao(t.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="area-estatisticas">
              <h3 style={{ marginBottom: '15px', color: '#374151', textAlign: 'center' }}>
                Total Gasto {verTodos ? '(Sempre)' : 'no Mês'}: <span style={{ color: '#ef4444' }}>{totalDespesas.toFixed(2)}€</span>
              </h3>
              
              {/* TOGGLE: BARRAS VS CIRCULAR */}
              {estatisticas.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', gap: '10px' }}>
                  <button 
                    onClick={() => setVistaEstatisticas('barras')}
                    style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: vistaEstatisticas === 'barras' ? '#3b82f6' : 'transparent', color: vistaEstatisticas === 'barras' ? 'white' : '#6b7280', transition: '0.2s' }}
                  >
                    📊 Barras
                  </button>
                  <button 
                    onClick={() => setVistaEstatisticas('circular')}
                    style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: vistaEstatisticas === 'circular' ? '#3b82f6' : 'transparent', color: vistaEstatisticas === 'circular' ? 'white' : '#6b7280', transition: '0.2s' }}
                  >
                    🍕 Circular
                  </button>
                </div>
              )}

              {estatisticas.length === 0 ? (
                <p style={{textAlign:'center', color:'#9ca3af'}}>Sem despesas {verTodos ? 'registadas' : 'neste mês'}.</p>
              ) : vistaEstatisticas === 'barras' ? (
                
                /* VISTA 1: BARRAS (Como tinhas antes, mas agora usam a cor da paleta) */
                estatisticas.map((cat, i) => {
                  const percentagem = ((cat.total / totalDespesas) * 100).toFixed(1);
                  return (
                    <div key={cat.nome} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4b5563', fontWeight: 'bold' }}>
                        <span>{cat.nome}</span>
                        <span>{cat.total.toFixed(2)}€ <span style={{ opacity: 0.5, fontSize: '12px' }}>({percentagem}%)</span></span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                        {/* A barra agora usa a cor correspondente da paleta */}
                        <div style={{ width: `${percentagem}%`, height: '100%', backgroundColor: coresGrafico[i % coresGrafico.length], borderRadius: '5px', transition: 'width 0.5s ease-in-out' }}></div>
                      </div>
                    </div>
                  )
                })
              ) : (

                /* VISTA 2: GRÁFICO CIRCULAR */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  
                  {/* O Círculo Mágico com CSS */}
                  <div style={{ 
                    width: '200px', height: '200px', borderRadius: '50%', 
                    background: `conic-gradient(${pieGradient})`,
                    marginBottom: '25px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}></div>
                  
                  {/* Legenda das Categorias */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', width: '100%' }}>
                    {estatisticas.map((cat, i) => {
                      const percentagem = ((cat.total / totalDespesas) * 100).toFixed(1);
                      return (
                        <div key={cat.nome} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#4b5563', fontWeight: 'bold' }}>
                          {/* Bolinha com a cor */}
                          <span style={{ width: '12px', height: '12px', backgroundColor: coresGrafico[i % coresGrafico.length], borderRadius: '50%', marginRight: '6px', display: 'inline-block' }}></span>
                          {cat.nome} ({percentagem}%)
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. FORMULÁRIO INFERIOR */}
      <form className="area-input" onSubmit={handleSubmit}>
        <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
          <option value="saida">-</option>
          <option value="entrada">+</option>
        </select>
        <input type="text" placeholder="Razão" value={form.razao} onChange={e => setForm({...form, razao: e.target.value})} required />
        <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} style={{ maxWidth: '130px' }}>
          {listaCategorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input type="number" step="0.01" placeholder="0.00" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} required style={{ maxWidth: '80px' }} />
        <button type="submit" id="botao-enviar">OK</button>
      </form>
    </div>
  );
}

export default App;