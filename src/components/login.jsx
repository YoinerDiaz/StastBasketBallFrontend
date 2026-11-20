import { useState } from 'react';
import { Activity, Eye, EyeOff, Lock, Mail, ShieldCheck, Trophy } from 'lucide-react';
import { supabase } from '../api/supabaseClient';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage('No fue posible iniciar sesión. Verifica tu correo y contraseña.');
    } else if (onLoginSuccess) {
      onLoginSuccess(data.user);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:items-center lg:justify-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 42px,rgba(255,255,255,.08) 42px,rgba(255,255,255,.08) 43px),repeating-linear-gradient(90deg,transparent,transparent 42px,rgba(255,255,255,.08) 42px,rgba(255,255,255,.08) 43px)' }} />
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-green-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

        <div className="relative max-w-xl px-12 py-16">
          <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-green-300 backdrop-blur">
            <ShieldCheck className="h-4 w-4" /> Acceso administrativo
          </div>
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-green-500 text-slate-950 shadow-2xl shadow-green-500/30">
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className="text-5xl font-black leading-tight text-white xl:text-6xl">
            Gestiona cada detalle del <span className="block bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">juego en tiempo real</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Administra equipos, programación, jugadores y estadísticas desde un panel diseñado para mantener el control de cada partido.
          </p>
          <div className="mt-10 inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-slate-300 backdrop-blur">
            <Activity className="h-6 w-6 text-green-300" />
            <span className="text-sm font-bold">Control de partidos y análisis en tiempo real</span>
          </div>
        </div>
      </section>

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-10 sm:px-6 lg:px-10">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-green-100/80 to-transparent lg:hidden" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white shadow-xl shadow-green-200 lg:mx-0">
              <Trophy className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-gray-950">Bienvenido de nuevo</h2>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Inicia sesión para administrar tus partidos y estadísticas.
            </p>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-2xl shadow-gray-200/70 sm:p-8">
            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-12 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    disabled={loading}
                    className="absolute right-3 top-1/2 rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3.5 text-sm font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-green-200 transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {loading ? 'Iniciando sesión' : 'Ingresar al panel'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs font-medium text-gray-400">
            Panel exclusivo para administradores autorizados.
          </p>
        </div>
      </main>
    </div>
  );
}