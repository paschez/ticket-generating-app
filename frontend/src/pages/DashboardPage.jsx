import { Link, useLoaderData } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const tickets = useLoaderData() || [];

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-gradient-to-r from-orange-50 to-amber-50 p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Welcome back</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900">{user?.name}</h1>
          </div>
          {user?.role === 'admin' ? (
            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              Open Admin Dashboard
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">Total tickets</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">{tickets.length}</h2>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">Valid status</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">{tickets.filter((ticket) => ticket.status === 'Valid').length}</h2>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">Total spend</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">${tickets.reduce((sum, t) => sum + (t.totalAmount || 0), 0)}</h2>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-xl font-bold text-slate-900">Recent purchases</h3>
        <div className="mt-5 space-y-3">
          {tickets.length ? tickets.slice(0, 4).map((ticket) => (
            <div key={ticket._id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="font-medium text-slate-800">{ticket.event?.title}</p>
                <p className="text-sm text-slate-500">{new Date(ticket.purchasedAt).toLocaleDateString()}</p>
              </div>
              <span className="text-sm font-semibold text-primary">{ticket.status}</span>
            </div>
          )) : <p className="text-slate-500">No purchases yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
