// src/components/Sidebar.jsx
import { supabase } from '../services/supabase';

export function Sidebar({ 
  menuAberto, 
  setMenuAberto, 
  contas, 
  contaId, 
  mudarConta, 
  apagarConta, 
  criarNovaConta,
  temaEscuro,
  setTemaEscuro
}) {
  return (
    <>
      {/* OVERLAY ESCURO */}
      <div className={`overlay ${menuAberto ? 'aberto' : ''}`} onClick={() => setMenuAberto(false)}></div>
      
      {/* GAVETA LATERAL */}
      <div className={`sidebar ${menuAberto ? 'aberto' : ''}`}>
        <div className="sidebar-header">As Minhas Contas</div>
        
        <div className="lista-contas">
          {contas.map(conta => (
            <div key={conta.id} className={`item-conta ${conta.id === contaId ? 'ativa' : ''}`} onClick={() => mudarConta(conta.id)}>
              <span style={{ flex: 1 }}>{conta.nome}</span>
              <button className="btn-apagar-conta" onClick={(e) => { e.stopPropagation(); apagarConta(conta.id, conta.nome); }} title="Apagar Conta">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
          ))}
        </div>
        
        <button className="btn-nova-conta" onClick={criarNovaConta}>+ Adicionar Conta</button>
        
        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>

          {/* PEQUENO TOGGLE DO MODO ESCURO */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5px', marginBottom: '20px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: temaEscuro ? '#f9fafb' : '#374151' }}>
              {temaEscuro ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
            </span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={temaEscuro} 
                onChange={() => setTemaEscuro(!temaEscuro)} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', padding: '10px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Terminar Sessão
          </button>
        </div>
      </div>
    </>
  );
}