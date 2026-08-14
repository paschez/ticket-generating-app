import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../api/axios';

const AdminSetupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', setupKey: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const { data } = await api.post('/auth/admin', form);
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck size={24} />
        </span>
        <h1 className="text-3xl font-bold text-slate-900">Create Admin Account</h1>
        <p className="mt-2 text-slate-500">
          One-time setup. Creates a new admin or promotes an existing user to admin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Full name" name="name" value={form.name} onChange={handleChange} required />
        <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Input
          label="Admin Setup Key"
          type="password"
          name="setupKey"
          value={form.setupKey}
          onChange={handleChange}
          placeholder="Required secret key"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Admin Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an admin?{' '}
        <Link to="/login" className="font-semibold text-primary">Login</Link>
      </p>
    </div>
  );
};

export default AdminSetupPage;
