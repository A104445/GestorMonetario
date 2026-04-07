import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { useFinance } from './hooks/useFinance';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [contaId, setContaId] = useState(null);
  const [contas, setContas] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);

  // --- MODAIS ---
  const [avisoMsg, setAvisoMsg] = useState('');
  const [modalNovaConta, setModalNovaConta] = useState(false);
  const [nomeNovaConta, setNomeNovaConta] = useState('');
  const [modalApagar, setModalApagar] = useState({ aberto: false, id: null, nome: '' });

  const { transacoes, carregando, adicionarTransacao, removerTransacao, editarTransacao } = useFinance(contaId);
  const [form, setForm] = useState({ razao: '', valor: '', tipo: 'saida', categoria: '❓ Outros' });
  const [movimentoEmEdicao, setMovimentoEmEdicao] = useState(null);
  
  // --- NOVO: ESTADO DA PESQUISA ---
  const [termoPesquisa, setTermoPesquisa] = useState('');

  const listaCategorias = ['🛒 Supermercado', '🚗 Transporte', '🏠 Casa', '🍿 Lazer', '🍔 Restauração', '🏥 Saúde', '💼 Salário', '❓ Outros'];
  const nomeMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const [mesAtivo, setMesAtivo] = useState(new Date().getMonth());
  const [anoAtivo, setAnoAtivo] = useState(new Date().getFullYear());
  const [verTodos, setVerTodos] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('movimentos');
  const [temaEscuro, setTemaEscuro] = useState(() => localStorage.getItem('tema') === 'escuro');
  const [vistaEstatisticas, setVistaEstatisticas] = useState('barras');

  // --- INÍCIO DO CÁLCULO DE SALDOS ---
  const [saldosContas, setSaldosContas] = useState({});

  async function carregarSaldosTotais() {
    // Só avança se já tivermos a sessão iniciada e as contas carregadas
    if (!session || contas.length === 0) return;
    
    // 1. Criamos a lista com os IDs das tuas contas
    const idsDasContas = contas.map(c => c.id);
    
    // 2. Pedimos ao Supabase SÓ os movimentos que pertencem a estas contas
    const { data, error } = await supabase
      .from('transacoes')
      .select('conta_id, valor, tipo')
      .in('conta_id', idsDasContas);

    if (error) {
      console.error("Erro ao carregar saldos:", error);
      return;
    }

    // 3. Inicializamos todas as tuas contas a 0€ para evitar erros
    const mapaSaldos = {};
    contas.forEach(c => { mapaSaldos[c.id] = 0; });

    // 4. Fazemos a matemática (e garantimos que o valor é lido como número)
    if (data) {
      data.forEach(t => {
        const valorNumerico = parseFloat(t.valor) || 0;
        if (t.tipo === 'entrada') {
          mapaSaldos[t.conta_id] += valorNumerico;
        } else {
          mapaSaldos[t.conta_id] -= valorNumerico;
        }
      });
    }

    setSaldosContas(mapaSaldos);
  }

  // O useEffect agora "ouve" também as "contas". Assim que elas carregam, ele calcula!
  useEffect(() => {
    carregarSaldosTotais();
  }, [session, transacoes, contas]); 
  // --- FIM DO CÁLCULO DE SALDOS ---

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) carregarContas(); }, [session]);

  useEffect(() => {
    if (temaEscuro) { document.body.classList.add('dark'); localStorage.setItem('tema', 'escuro'); } 
    else { document.body.classList.remove('dark'); localStorage.setItem('tema', 'claro'); }
  }, [temaEscuro]);

  async function carregarContas() {
    let { data, error } = await supabase.from('contas').select('*').eq('user_id', session.user.id).order('nome', { ascending: true });
    if (error) return setAvisoMsg("Erro ao ler as tuas contas.");
    if (data && data.length > 0) { setContas(data); if (!contaId) setContaId(data[0].id); } 
    else {
      const { data: novaConta } = await supabase.from('contas').insert([{ user_id: session.user.id, nome: 'Carteira Principal' }]).select().single();
      if (novaConta) { setContas([novaConta]); setContaId(novaConta.id); }
    }
  }

  function criarNovaConta() { setNomeNovaConta(''); setModalNovaConta(true); setMenuAberto(false); }
  async function confirmarNovaConta(e) {
    e.preventDefault();
    if (!nomeNovaConta) return;
    const { data, error } = await supabase.from('contas').insert([{ user_id: session.user.id, nome: nomeNovaConta }]).select().single();
    if (!error && data) { setContas([...contas, data]); setContaId(data.id); setModalNovaConta(false); } 
    else { setAvisoMsg("Erro ao criar conta."); }
  }

  function apagarConta(idParaApagar, nomeDaConta) {
    if (contas.length <= 1) { setAvisoMsg("Não podes apagar a tua única conta."); return; }
    setModalApagar({ aberto: true, id: idParaApagar, nome: nomeDaConta }); setMenuAberto(false);
  }
  async function confirmarApagar() {
    const { error } = await supabase.from('contas').delete().eq('id', modalApagar.id);
    if (error) { setAvisoMsg("Erro ao apagar a conta."); } 
    else {
      const contasRestantes = contas.filter(c => c.id !== modalApagar.id);
      setContas(contasRestantes);
      if (contaId === modalApagar.id) setContaId(contasRestantes[0].id);
    }
    setModalApagar({ aberto: false, id: null, nome: '' });
  }

  // Matemática e Filtros Base
  const transacoesVisiveis = verTodos ? transacoes : transacoes.filter(t => new Date(t.created_at).getMonth() === mesAtivo && new Date(t.created_at).getFullYear() === anoAtivo);
  const saldoTotal = transacoes.reduce((acc, t) => t.tipo === 'entrada' ? acc + t.valor : acc - t.valor, 0);

  // --- NOVO: APLICAR FILTRO DE PESQUISA ---
  const transacoesFiltradas = transacoesVisiveis.filter(t => 
    t.razao.toLowerCase().includes(termoPesquisa.toLowerCase()) || 
    (t.categoria && t.categoria.toLowerCase().includes(termoPesquisa.toLowerCase()))
  );

  const estatisticas = Object.entries(transacoesVisiveis.filter(t => t.tipo === 'saida').reduce((acc, t) => {
    const cat = t.categoria || '❓ Outros'; acc[cat] = (acc[cat] || 0) + t.valor; return acc;
  }, {})).map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total);
  const totalDespesas = estatisticas.reduce((acc, cat) => acc + cat.total, 0);

  // Formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.razao || !form.valor || !contaId) return;

    if (movimentoEmEdicao) {
      editarTransacao(movimentoEmEdicao, { ...form, valor: parseFloat(form.valor) });
      setMovimentoEmEdicao(null);
    } else {
      adicionarTransacao({ ...form, valor: parseFloat(form.valor), conta_id: contaId });
    }
    setForm({ razao: '', valor: '', tipo: 'saida', categoria: '❓ Outros' });
  };

  const iniciarEdicao = (t) => {
    setMovimentoEmEdicao(t.id);
    setForm({ razao: t.razao, valor: t.valor, tipo: t.tipo, categoria: t.categoria });
  };

  // --- NOVA FUNÇÃO: EXPORTAR PARA CSV (EXCEL/SHEETS) ---
  const exportarCSV = () => {
    if (transacoesFiltradas.length === 0) {
      setAvisoMsg("Não há movimentos para exportar nesta vista.");
      return;
    }
    
    // Cabeçalho do Excel
    let csv = "Data,Tipo,Razão,Categoria,Valor\n";
    
    // Preencher as linhas
    transacoesFiltradas.forEach(t => {
      const dataFormatada = new Date(t.created_at).toLocaleDateString('pt-PT');
      const tipo = t.tipo === 'entrada' ? 'Entrada' : 'Saida';
      const razaoLimpa = t.razao.replace(/"/g, '""'); // Evita bugs se a razão tiver aspas
      const valorAjustado = t.tipo === 'saida' ? -t.valor : t.valor; // Gastos ficam negativos no Excel
      
      csv += `${dataFormatada},${tipo},"${razaoLimpa}","${t.categoria || '❓ Outros'}",${valorAjustado.toFixed(2)}\n`;
    });

    // O código mágico [0xEF, 0xBB, 0xBF] diz ao Excel para ler os acentos em Português corretamente!
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `GestorMonetario_${verTodos ? 'Todos' : nomeMeses[mesAtivo]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const coresGrafico = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6b7280'];
  let acumulado = 0;
  const pieGradient = estatisticas.length > 0 ? estatisticas.map((cat, i) => {
    const perc = (cat.total / totalDespesas) * 100;
    const stop = `${coresGrafico[i % coresGrafico.length]} ${acumulado}% ${acumulado + perc}%`;
    acumulado += perc; return stop;
  }).join(', ') : '';

  if (!session) return <Login />;
  const contaAtiva = contas.find(c => c.id === contaId);

  return (
    <div className="container" style={{ position: 'relative' }}>
      <Sidebar menuAberto={menuAberto} setMenuAberto={setMenuAberto} contas={contas} contaId={contaId} mudarConta={(id) => { setContaId(id); setMenuAberto(false); }} apagarConta={apagarConta} criarNovaConta={criarNovaConta} temaEscuro={temaEscuro} setTemaEscuro={setTemaEscuro} saldos={saldosContas} />
      <Header email={session.user.email} nomeConta={contaAtiva ? contaAtiva.nome : 'A carregar...'} saldoTotal={saldoTotal} setMenuAberto={setMenuAberto} mesAtivo={mesAtivo} setMesAtivo={setMesAtivo} anoAtivo={anoAtivo} setAnoAtivo={setAnoAtivo} nomeMeses={nomeMeses} verTodos={verTodos} setVerTodos={setVerTodos} />

      <div className="transacoes" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
          <button onClick={() => setAbaAtiva('movimentos')} style={{ flex: 1, padding: '15px', border: 'none', background: 'none', fontWeight: 'bold', borderBottom: abaAtiva === 'movimentos' ? '3px solid #3b82f6' : '3px solid transparent', color: abaAtiva === 'movimentos' ? '#3b82f6' : '#9ca3af', cursor: 'pointer' }}>📋 Movimentos</button>
          <button onClick={() => setAbaAtiva('estatisticas')} style={{ flex: 1, padding: '15px', border: 'none', background: 'none', fontWeight: 'bold', borderBottom: abaAtiva === 'estatisticas' ? '3px solid #3b82f6' : '3px solid transparent', color: abaAtiva === 'estatisticas' ? '#3b82f6' : '#9ca3af', cursor: 'pointer' }}>📊 Estatísticas</button>
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {abaAtiva === 'movimentos' ? (
            <>
              {/* --- NOVA BARRA DE FERRAMENTAS --- */}
              <div className="barra-ferramentas">
                <div className="input-pesquisa-container">
                  <span>🔍</span>
                  <input 
                    type="text" 
                    className="input-pesquisa"
                    placeholder="Pesquisar movimento..." 
                    value={termoPesquisa}
                    onChange={e => setTermoPesquisa(e.target.value)}
                  />
                </div>
                <button className="btn-exportar" onClick={exportarCSV} title="Exportar para Excel/Sheets">
                  📥 CSV
                </button>
              </div>

              <ul id="lista-transacoes">
                {carregando ? <p style={{textAlign:'center', color:'#9ca3af'}}>A carregar...</p> : transacoesFiltradas.length === 0 ? <p style={{textAlign:'center', color:'#9ca3af'}}>Nenhum movimento encontrado.</p> : transacoesFiltradas.map(t => (
                  <li key={t.id} style={movimentoEmEdicao === t.id ? { borderLeft: '4px solid #f59e0b', backgroundColor: temaEscuro ? '#374151' : '#fef3c7' } : {}}>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold' }}>{t.razao}</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{t.categoria || '❓ Outros'}</span>
                    </div>
                    <div className="valor-e-acoes">
                      <strong className={t.tipo}>{t.tipo === 'entrada' ? '+' : '-'} {t.valor.toFixed(2)}€</strong>
                      <button onClick={() => iniciarEdicao(t)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✏️</button>
                      <button className="btn-apagar" onClick={() => removerTransacao(t.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="area-estatisticas">
              <h3 style={{ marginBottom: '15px', color: '#374151', textAlign: 'center' }}>Total Gasto: <span style={{ color: '#ef4444' }}>{totalDespesas.toFixed(2)}€</span></h3>
              {estatisticas.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', gap: '10px' }}>
                  <button onClick={() => setVistaEstatisticas('barras')} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: vistaEstatisticas === 'barras' ? '#3b82f6' : 'transparent', color: vistaEstatisticas === 'barras' ? 'white' : '#6b7280' }}>📊 Barras</button>
                  <button onClick={() => setVistaEstatisticas('circular')} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: vistaEstatisticas === 'circular' ? '#3b82f6' : 'transparent', color: vistaEstatisticas === 'circular' ? 'white' : '#6b7280' }}>🍕 Circular</button>
                </div>
              )}
              {estatisticas.length === 0 ? <p style={{textAlign:'center', color:'#9ca3af'}}>Sem despesas.</p> : vistaEstatisticas === 'barras' ? (
                estatisticas.map((cat, i) => {
                  const percentagem = ((cat.total / totalDespesas) * 100).toFixed(1);
                  return (
                    <div key={cat.nome} style={{ marginBottom: '20px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4b5563', fontWeight: 'bold' }}><span>{cat.nome}</span><span>{cat.total.toFixed(2)}€ <span style={{ opacity: 0.5, fontSize: '12px' }}>({percentagem}%)</span></span></div><div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}><div style={{ width: `${percentagem}%`, height: '100%', backgroundColor: coresGrafico[i % coresGrafico.length], borderRadius: '5px', transition: 'width 0.5s' }}></div></div></div>
                  )
                })
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ width: '200px', height: '200px', borderRadius: '50%', background: `conic-gradient(${pieGradient})`, marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}></div><div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', width: '100%' }}>{estatisticas.map((cat, i) => { const percentagem = ((cat.total / totalDespesas) * 100).toFixed(1); return (<div key={cat.nome} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#4b5563', fontWeight: 'bold' }}><span style={{ width: '12px', height: '12px', backgroundColor: coresGrafico[i % coresGrafico.length], borderRadius: '50%', marginRight: '6px', display: 'inline-block' }}></span>{cat.nome} ({percentagem}%)</div>); })}</div></div>
              )}
            </div>
          )}
        </div>
      </div>

      <form className="area-input" onSubmit={handleSubmit} style={movimentoEmEdicao ? { backgroundColor: temaEscuro ? '#4b5563' : '#fef3c7', transition: '0.3s' } : { transition: '0.3s' }}>
        <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}><option value="saida">-</option><option value="entrada">+</option></select>
        <input type="text" placeholder="Razão" value={form.razao} onChange={e => setForm({...form, razao: e.target.value})} required />
        <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} style={{ maxWidth: '130px' }}>{listaCategorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
        <input type="number" step="0.01" min="0.01" placeholder="0.00" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} required style={{ maxWidth: '80px' }} />
        <button type="submit" id="botao-enviar" style={{ backgroundColor: movimentoEmEdicao ? '#f59e0b' : '#3b82f6', transition: '0.3s' }}>{movimentoEmEdicao ? '💾' : 'OK'}</button>
        {movimentoEmEdicao && (
          <button type="button" onClick={() => { setMovimentoEmEdicao(null); setForm({ razao: '', valor: '', tipo: 'saida', categoria: '❓ Outros' }); }} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
        )}
      </form>

      {/* MODAIS */}
      {avisoMsg && (
        <div className="modal-overlay" onClick={() => setAvisoMsg('')}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Aviso</h3>
            <p>{avisoMsg}</p>
            <div className="modal-botoes"><button type="button" className="btn-confirmar" style={{width: '100%'}} onClick={() => setAvisoMsg('')}>OK, percebi</button></div>
          </div>
        </div>
      )}

      {modalNovaConta && (
        <div className="modal-overlay" onClick={() => setModalNovaConta(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Nova Conta</h3>
            <p>Dá um nome à tua nova carteira ou conta.</p>
            <form onSubmit={confirmarNovaConta}>
              <input autoFocus type="text" placeholder="Ex: Poupanças" value={nomeNovaConta} onChange={e => setNomeNovaConta(e.target.value)} required />
              <div className="modal-botoes">
                <button type="button" className="btn-cancelar" onClick={() => setModalNovaConta(false)}>Cancelar</button>
                <button type="submit" className="btn-confirmar">Criar Conta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalApagar.aberto && (
        <div className="modal-overlay" onClick={() => setModalApagar({ aberto: false, id: null, nome: '' })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Apagar Conta</h3>
            <p>Tens a certeza que queres apagar a conta <strong>{modalApagar.nome}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="modal-botoes">
              <button type="button" className="btn-cancelar" onClick={() => setModalApagar({ aberto: false, id: null, nome: '' })}>Cancelar</button>
              <button type="button" className="btn-perigo" onClick={confirmarApagar}>Sim, Apagar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;