// src/components/Sidebar.jsx
export function Sidebar({ 
  menuAberto, setMenuAberto, contas, contaId, mudarConta, 
  apagarConta, criarNovaConta, temaEscuro, setTemaEscuro, saldos 
}) {
  return (
    <>
      <div className={`overlay ${menuAberto ? 'aberto' : ''}`} onClick={() => setMenuAberto(false)}></div>
      
      <div className={`sidebar ${menuAberto ? 'aberto' : ''}`}>
        <div className="sidebar-header">
          Minhas Contas
        </div>

        <div className="lista-contas">
          {contas.map(conta => (
            <div 
              key={conta.id} 
              className={`item-conta ${conta.id === contaId ? 'ativa' : ''}`}
              onClick={() => mudarConta(conta.id)}
            >
              <div className="item-conta-info">
                <span className="nome-conta">{conta.nome}</span>
                {/* Mostra o saldo calculado ou 0.00€ se ainda não existir */}
                <span className="saldo-conta">
                  {saldos && saldos[conta.id] !== undefined ? saldos[conta.id].toFixed(2) : '0.00'}€
                </span>
              </div>

              <button className="btn-apagar-conta" onClick={(e) => { e.stopPropagation(); apagarConta(conta.id, conta.nome); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          ))}
          
          <button className="btn-nova-conta" onClick={criarNovaConta}>
            + Nova Conta
          </button>
        </div>

        {/* ... (resto do menu: Dark Mode e Logout) ... */}
        <div className="sidebar-footer">
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Modo Escuro</span>
            <label className="toggle-switch">
              <input type="checkbox" checked={temaEscuro} onChange={() => setTemaEscuro(!temaEscuro)} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}