import { Camera, Globe, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <div className="flex items-center gap-2 text-xl font-black text-slate-900">Evently</div>
          <p className="mt-3 max-w-xs text-sm text-slate-600">Discover meaningful events and memorable moments all in one place.</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Links</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <Link to="/">Home</Link>
            <br />
            <Link to="/events">Events</Link>
            <br />
            <Link to="/login">Login</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Follow us</h3>
          <div className="mt-4 flex gap-3 text-slate-600">
            <span className="rounded-full border border-slate-200 p-2"><Globe size={16} /></span>
            <span className="rounded-full border border-slate-200 p-2"><Camera size={16} /></span>
            <span className="rounded-full border border-slate-200 p-2"><Send size={16} /></span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
        © 2026 Evently. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
