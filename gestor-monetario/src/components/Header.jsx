// src/components/Header.jsx

export function Header({
    email,
    nomeConta,
    saldoTotal,
    setMenuAberto,
    mesAtivo,
    setMesAtivo,
    anoAtivo,
    setAnoAtivo,
    nomeMeses,
    verTodos,
    setVerTodos,
    moeda
  }) {
    return (
      <div className="cabecalho">
        <div className="cabecalho-topo">
          <button className="btn-menu" onClick={() => setMenuAberto(true)}>☰</button>
          <span style={{ fontSize: '14px', opacity: 0.9 }}>{email}</span>
        </div>
        
        <h1>{nomeConta}</h1>
        <h2>{saldoTotal.toFixed(2)}{moeda}</h2>
  
        {/* SELETOR DE MÊS E BOTÃO 'VER TODOS' */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px', borderRadius: '12px', opacity: verTodos ? 0.3 : 1, pointerEvents: verTodos ? 'none' : 'auto', transition: '0.2s' }}>
            <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', padding: '0 10px' }} onClick={() => { if (mesAtivo === 0) { setMesAtivo(11); setAnoAtivo(anoAtivo - 1); } else { setMesAtivo(mesAtivo - 1); } }}>◀</button>
            <span style={{ fontWeight: 'bold', minWidth: '120px', textAlign: 'center', fontSize: '14px' }}>{nomeMeses[mesAtivo]} {anoAtivo}</span>
            <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', padding: '0 10px' }} onClick={() => { if (mesAtivo === 11) { setMesAtivo(0); setAnoAtivo(anoAtivo + 1); } else { setMesAtivo(mesAtivo + 1); } }}>▶</button>
          </div>
          <button onClick={() => setVerTodos(!verTodos)} style={{ marginTop: '12px', background: verTodos ? 'rgba(255,255,255,0.2)' : 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '15px', padding: '5px 15px', fontSize: '12px', cursor: 'pointer', transition: '0.2s' }}>
            {verTodos ? 'Ver apenas este mês' : 'Ver todos os meses'}
          </button>
        </div>
      </div>
    );
  }