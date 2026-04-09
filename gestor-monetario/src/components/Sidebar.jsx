import { supabase } from '../services/supabase';

export function Sidebar({ 
  menuAberto, setMenuAberto, contas, contaId, mudarConta, 
  apagarConta, renomearConta, criarNovaConta, saldos, abrirDefinicoes, moeda,
  contasGuardadas, trocarDeEmail, emailAtual, adicionarNovoPerfil, pedirRemocaoPerfil
}) {

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuAberto(false);
  };

  return (
    <>
      <div className={`overlay ${menuAberto ? 'aberto' : ''}`} onClick={() => setMenuAberto(false)}></div>
      
      <div className={`sidebar ${menuAberto ? 'aberto' : ''}`}>
        
        {/* CABEÇALHO */}
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Minhas Contas</span>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={criarNovaConta} title="Nova Conta" style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '26px', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>+</button>
            <button onClick={abrirDefinicoes} title="Definições" style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '20px', cursor: 'pointer', padding: 0 }}>⚙️</button>
          </div>
        </div>

        {/* LISTA DE CARTEIRAS (DA SESSÃO ATUAL) */}
        <div className="lista-contas">
          {contas.map(conta => (
            <div 
              key={conta.id} 
              className={`item-conta ${conta.id === contaId ? 'ativa' : ''}`}
              onClick={() => mudarConta(conta.id)}
            >
              <div className="item-conta-info">
                {/* Agrupamos o Nome e o Lápis lado a lado */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="nome-conta">{conta.nome}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); renomearConta(conta.id, conta.nome); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.7 }}
                    title="Editar Nome da Conta"
                  >
                    ✏️
                  </button>
                </div>
                
                <span className="saldo-conta">
                  {saldos && saldos[String(conta.id)] !== undefined 
                    ? `${Number(saldos[String(conta.id)]).toFixed(2)}${moeda || '€'}` 
                    : `0.00${moeda || '€'}`}
                </span>
              </div>

              <button className="btn-apagar-conta" onClick={(e) => { e.stopPropagation(); apagarConta(conta.id, conta.nome); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          ))}
        </div>

        {/* SECÇÃO PERFIS GUARDADOS */}
        {contasGuardadas && (
          <div style={{ padding: '15px 20px', borderTop: '1px solid #f3f4f6', backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Perfis Guardados
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* LISTA OS OUTROS EMAILS COM BOTÃO DE REMOVER */}
              {contasGuardadas.map(conta => (
                conta.email !== emailAtual && (
                  <div key={conta.email} style={{ display: 'flex', gap: '5px' }}>
                    
                    {/* BOTÃO DE TROCAR (Ocupa o espaço quase todo) */}
                    <button 
                      onClick={() => trocarDeEmail(conta)}
                      title={conta.email}
                      style={{ 
                        flex: 1, padding: '10px', background: 'white', border: '1px solid #e5e7eb', 
                        borderRadius: '8px', textAlign: 'left', fontSize: '13px', color: '#374151', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                      }}
                    >
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>🔄</span> 
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conta.email}
                      </span>
                    </button>

                    {/* NOVO BOTÃO DE REMOVER */}
                    <button
                      onClick={() => pedirRemocaoPerfil(conta.email)} // <-- Muda isto!
                      title="Remover Perfil"
                      style={{
                        padding: '0 12px', background: '#fee2e2', border: '1px solid #fca5a5',
                        borderRadius: '8px', color: '#ef4444', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '14px', transition: '0.2s'
                      }}
                    >
                      X
                    </button>
                    
                  </div>
                )
              ))}

              {/* BOTÃO PARA ADICIONAR NOVO EMAIL (SEM APAGAR OS OUTROS) */}
              <button 
                onClick={adicionarNovoPerfil}
                style={{ 
                  width: '100%', padding: '10px', background: 'transparent', border: '1px dashed #9ca3af', 
                  borderRadius: '8px', textAlign: 'center', fontSize: '13px', color: '#6b7280', cursor: 'pointer',
                  fontWeight: 'bold', marginTop: contasGuardadas.length > 1 ? '5px' : '0'
                }}
              >
                + Adicionar Outro E-mail
              </button>

            </div>
          </div>
        )}

        {/* RODAPÉ COM O TERMINAR SESSÃO */}
        <div className="sidebar-footer" style={{ marginTop: 'auto', borderTop: '1px solid #f3f4f6', padding: '20px' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', padding: '12px', backgroundColor: '#fee2e2', color: '#ef4444', 
              border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px'
            }}
          >
            🚪 Terminar Sessão
          </button>
        </div>
        
      </div>
    </>
  );
}