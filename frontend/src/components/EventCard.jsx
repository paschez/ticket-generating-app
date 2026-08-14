import { MapPin, CalendarDays, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const imageUrl = event.banner
    ? `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${event.banner}`
    : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <img src={imageUrl} alt={event.title} className="h-52 w-full object-cover" />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-orange-50 px-2 py-1 font-medium text-primary">{event.category}</span>
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-800">{event.title}</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><MapPin size={16} /> {event.venue}</div>
            <div className="flex items-center gap-2"><CalendarDays size={16} /> {new Date(event.date).toLocaleDateString()}</div>
            <div className="flex items-center gap-2"><Ticket size={16} /> ${event.price} • {event.remainingTickets} left</div>
          </div>
        </div>

        <Link to={`/events/${event._id}`} className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
