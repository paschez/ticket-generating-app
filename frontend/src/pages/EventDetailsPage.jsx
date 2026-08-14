import { useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { CalendarDays, MapPin, Clock3, Users } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const EventDetailsPage = () => {
  const event = useLoaderData();
  const { user } = useAuth();
  const [remainingTickets, setRemainingTickets] = useState(event?.remainingTickets ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  const handlePurchase = async () => {
    if (!user) {
      alert('Please log in to purchase tickets.');
      return;
    }

    if (isAdmin) {
      alert('Admins cannot purchase tickets.');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');
      const { data } = await api.post('/tickets', { eventId: event._id, quantity: 1 });
      setRemainingTickets((prev) => Math.max(prev - 1, 0));
      setMessage(`Ticket purchased successfully! ${data.ticket.ticketNumber}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to purchase ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!event) return <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-500">Event not found.</div>;

  const imageUrl = event.banner
    ? `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${event.banner}`
    : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <img src={imageUrl} alt={event.title} className="h-72 w-full object-cover md:h-[420px]" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.7fr]">
        <div className="space-y-6">
          <div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{event.category}</span>
            <h1 className="mt-4 text-4xl font-black text-slate-900">{event.title}</h1>
          </div>

          <p className="text-lg leading-8 text-slate-600">{event.description}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4"><MapPin className="mb-2 text-primary" /> <p className="font-semibold">Venue</p><p className="text-slate-600">{event.venue}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><CalendarDays className="mb-2 text-primary" /> <p className="font-semibold">Date</p><p className="text-slate-600">{new Date(event.date).toLocaleDateString()}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><Clock3 className="mb-2 text-primary" /> <p className="font-semibold">Time</p><p className="text-slate-600">{event.startTime} - {event.endTime}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><Users className="mb-2 text-primary" /> <p className="font-semibold">Remaining</p><p className="text-slate-600">{remainingTickets} tickets available</p></div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between border-b pb-4">
            <span className="text-sm text-slate-500">From</span>
            <span className="text-3xl font-black text-slate-900">${event.price}</span>
          </div>

          <p className="mb-4 text-sm text-slate-600">Organizer: <span className="font-semibold text-slate-800">{event.organizer?.name || 'Event Team'}</span></p>

          {isAdmin ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Admins manage events and verify tickets — ticket purchases are only available to users.
              </div>
              <Link
                to="/admin"
                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                Open Admin Dashboard
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Purchase limit: <span className="font-semibold text-slate-800">1 ticket per purchase</span>
              </div>

              <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span className="font-bold text-slate-900">${event.price}</span>
                </div>
              </div>

              {message ? (
                <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
              ) : null}

              <Button onClick={handlePurchase} className="mt-6 w-full" disabled={submitting || remainingTickets === 0}>
                {submitting ? 'Processing...' : remainingTickets === 0 ? 'Sold Out' : 'Buy Ticket'}
              </Button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default EventDetailsPage;
