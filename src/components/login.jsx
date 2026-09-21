import React, { useState } from 'react';
import { supabase } from '../api/supabaseClient';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>

      {errorMessage && (
        <div className="error-banner" style={{ color: 'red', marginBottom: '1rem' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}