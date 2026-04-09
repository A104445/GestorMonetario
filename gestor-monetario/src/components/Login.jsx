import { useState } from 'react';
import { supabase } from '../services/supabase';

export function Login() {
  const [abaAtiva, setAbaAtiva] = useState('login'); // Pode ser 'login' ou 'registo'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState(''); 
  const [sucessoMsg, setSucessoMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSucessoMsg('');

    if (abaAtiva === 'registo') {
      // --- REGISTAR CONTA ---
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setErrorMsg('Este email já está registado! Tenta iniciar sessão.');
        } else if (error.message.includes('Password should be at least')) {
          setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
        } else {
          setErrorMsg('Erro: ' + error.message);
        }
      } else {
        // TRUQUE DE SEGURANÇA DO SUPABASE: 
        // Se a conta já existir, ele finge sucesso mas não cria uma "identidade".
        if (data?.user?.identities?.length === 0) {
          setErrorMsg('Este email já está registado! Tenta iniciar sessão.');
        } else {
          setSucessoMsg('Conta criada com sucesso! Já podes entrar.');
          setAbaAtiva('login'); // Muda para a aba de login
          setPassword('');
        }
      }
    } else {
      // --- INICIAR SESSÃO ---
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Por segurança, o Supabase junta os erros de "Conta não existe" e "Password errada"
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Email não registado ou senha incorreta.');
        } else {
          setErrorMsg('Erro: ' + error.message);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="login-centro-moderno">
        
        {/* LOGO SUPERIOR */}
        <div className="login-header-logo">
          <div className="icone-logo">💸</div>
          <h1>GESTOR <span>MONETÁRIO</span></h1>
        </div>

        {/* SELETOR DE ABAS MODERNO */}
        <div className="seletor-abas">
          <button 
            type="button" 
            className={abaAtiva === 'login' ? 'aba-ativa' : ''} 
            onClick={() => { setAbaAtiva('login'); setErrorMsg(''); setSucessoMsg(''); }}
          >
            Iniciar Sessão
          </button>
          <button 
            type="button" 
            className={abaAtiva === 'registo' ? 'aba-ativa' : ''} 
            onClick={() => { setAbaAtiva('registo'); setErrorMsg(''); setSucessoMsg(''); }}
          >
            Criar Conta
          </button>
        </div>

        {/* MENSAGENS */}
        {errorMsg && <div className="msg-erro">{errorMsg}</div>}
        {sucessoMsg && <div className="msg-sucesso">{sucessoMsg}</div>}

        {/* FORMULÁRIO COM ÍCONES */}
        <form className="area-input-login" onSubmit={handleAuth}>
          <div className="input-grupo">
            <span className="input-icone">✉️</span>
            <input 
              type="email" 
              placeholder="O teu Email" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </div>
          
          <div className="input-grupo" style={{ position: 'relative' }}>
            <span className="input-icone">🔒</span>
            
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '40px' }} /* Dá espaço à direita para o texto não ficar debaixo do emoji */
            />
            
            {/* BOTÃO DO OLHO */}
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: 0,
                opacity: 0.7
              }}
              title={mostrarPassword ? "Esconder Password" : "Mostrar Password"}
            >
              {mostrarPassword ? '🙈' : '👁️'}
            </button>
          </div>
          
          <button type="submit" className="btn-principal" disabled={loading}>
            {loading ? 'A carregar...' : (abaAtiva === 'registo' ? 'Registar Agora' : 'Entrar na Conta')}
          </button>
        </form>

      </div>
    </div>
  );
}