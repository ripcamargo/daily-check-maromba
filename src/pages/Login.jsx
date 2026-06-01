import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Dumbbell } from 'lucide-react';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    const result = await signIn(email, password);

    if (result.success) {
      setAlert({ type: 'success', message: 'Login realizado com sucesso!' });
      setTimeout(() => navigate('/'), 1000);
    } else {
      setAlert({ type: 'error', message: 'Email ou senha incorretos' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0c0c12] flex items-center justify-center px-4">
      {/* Background grid subtle */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-2xl mb-4">
            <Dumbbell className="w-8 h-8 text-zinc-300" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-1 tracking-tight">Admin</h1>
          <p className="text-zinc-500 text-sm">Acesso ao painel administrativo</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {alert && (
            <div className="mb-6">
              <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all"
                placeholder="admin@exemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-base font-semibold"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ← Voltar para o site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
