import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 py-10 text-ink">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Mini CRM</h1>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
        {error ? <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-11 w-full rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </main>
  );
};

export default Login;
