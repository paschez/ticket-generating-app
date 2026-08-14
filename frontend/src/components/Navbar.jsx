import { Menu, X, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition ${
      isActive ? 'text-primary' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
            <Ticket size={18} />
          </span>
          Evently
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/events" className={navLinkClass}>Events</NavLink>

          {user ? (
            <>
              {user.role === 'admin' ? (
                <NavLink to="/admin" className={navLinkClass}>Admin Panel</NavLink>
              ) : (
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
              )}
              {!user || user.role !== 'admin' ? (
                <NavLink to="/my-tickets" className={navLinkClass}>My Tickets</NavLink>
              ) : null}
              <Button onClick={logout} variant="outline">Logout</Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <NavLink to="/register" className={navLinkClass}>Register</NavLink>
            </>
          )}
        </div>

        <button type="button" className="md:hidden" onClick={() => setOpen((prev) => !prev)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="space-y-3 border-t border-slate-200 bg-white p-4 md:hidden">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/events" className={navLinkClass}>Events</NavLink>
          {user ? (
            <>
              {user.role === 'admin' ? (
                <NavLink to="/admin" className={navLinkClass}>Admin Panel</NavLink>
              ) : (
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
              )}
              {user.role !== 'admin' ? (
                <NavLink to="/my-tickets" className={navLinkClass}>My Tickets</NavLink>
              ) : null}
              <Button onClick={logout} className="w-full">Logout</Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <NavLink to="/register" className={navLinkClass}>Register</NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
