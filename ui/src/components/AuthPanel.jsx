import { useState } from 'react';
import Card from './Card';

function AuthPanel({ onLogin, onRegister, loading, error }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
  });

  const submit = async (e) => {
    e.preventDefault();
    if (isSignup) {
      await onRegister(form);
    } else {
      await onLogin({ email: form.email, password: form.password });
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 py-8">
      <Card title="Digital Prescription - Doctor Authentication">
        <form onSubmit={submit} className="space-y-3">
          {isSignup && (
            <label className="block text-sm">
              Doctor Name
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                required
              />
            </label>
          )}
          <label className="block text-sm">
            Email
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
          </label>
          {isSignup && (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-sm">
                Clinic Name
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.clinicName}
                  onChange={(e) => setForm((s) => ({ ...s, clinicName: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Clinic Phone
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.clinicPhone}
                  onChange={(e) => setForm((s) => ({ ...s, clinicPhone: e.target.value }))}
                />
              </label>
              <label className="block text-sm md:col-span-2">
                Clinic Address
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  value={form.clinicAddress}
                  onChange={(e) => setForm((s) => ({ ...s, clinicAddress: e.target.value }))}
                />
              </label>
            </div>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-4 py-2"
              onClick={() => setIsSignup((v) => !v)}
              disabled={loading}
            >
              {isSignup ? 'Have account? Login' : 'New doctor? Sign up'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AuthPanel;

