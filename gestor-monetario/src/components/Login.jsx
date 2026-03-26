// src/components/Login.jsx
import { useState } from 'react';
import { supabase } from '../services/supabase'; // Caminho sobe uma pasta (../) para chegar a services

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Preenche o email e a senha.");
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erro ao entrar: " + error.message);
  };

  const handleSignUp = async () => {
    if (!email || !password) return alert("Preenche o email e a senha para criar conta.");
    
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("Erro ao criar conta: " + error.message);
    } else {
      alert("Sucesso! Verifica a tua caixa de entrada do Email para confirmar a conta.");
    }
  };

  return (
    <div className="container">
      <div className="login-centro">
        <h1>GESTOR <span>MONETÁRIO</span></h1>
        
        <form className="area-input-login" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="O teu Email" 
            value={email}
            onChange={e => setEmail(e.target.value)} 
            required
          />
          <input 
            type="password" 
            placeholder="A tua Senha (mínimo 6 letras)" 
            value={password}
            onChange={e => setPassword(e.target.value)} 
            required
            minLength="6"
          />
          <button type="submit" className="btn-principal">Entrar na Conta</button>
          <button type="button" onClick={handleSignUp} className="btn-link">
            Criar nova conta
          </button>
        </form>
      </div>
    </div>
  );
}