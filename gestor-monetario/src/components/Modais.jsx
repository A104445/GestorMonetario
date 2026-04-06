// src/components/Modais.jsx

export function ModalAviso({ mensagem, fechar }) {
    if (!mensagem) return null;
    return (
      // onClick no overlay permite fechar clicando fora da caixa
      <div className="modal-overlay" onClick={fechar}>
        {/* stopPropagation impede que o clique dentro da caixa feche o modal */}
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <h3>Aviso</h3>
          <p>{mensagem}</p>
          <div className="modal-botoes">
            <button type="button" className="btn-confirmar" style={{width: '100%'}} onClick={fechar}>OK, percebi</button>
          </div>
        </div>
      </div>
    );
  }
  
  export function ModalNovaConta({ aberto, nome, setNome, cancelar, confirmar }) {
    if (!aberto) return null;
    return (
      <div className="modal-overlay" onClick={cancelar}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <h3>Nova Conta</h3>
          <p>Dá um nome à tua nova carteira ou conta.</p>
          <form onSubmit={confirmar}>
            <input 
              autoFocus 
              type="text" 
              placeholder="Ex: Poupanças" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              required 
            />
            <div className="modal-botoes">
              <button type="button" className="btn-cancelar" onClick={cancelar}>Cancelar</button>
              <button type="submit" className="btn-confirmar">Criar Conta</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  export function ModalApagarConta({ aberto, nome, cancelar, confirmar }) {
    if (!aberto) return null;
    return (
      <div className="modal-overlay" onClick={cancelar}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <h3>Apagar Conta</h3>
          <p>Tens a certeza que queres apagar a conta <strong>{nome}</strong>? Esta ação não pode ser desfeita.</p>
          <div className="modal-botoes">
            <button type="button" className="btn-cancelar" onClick={cancelar}>Cancelar</button>
            <button type="button" className="btn-perigo" onClick={confirmar}>Sim, Apagar</button>
          </div>
        </div>
      </div>
    );
  }