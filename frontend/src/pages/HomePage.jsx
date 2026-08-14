import { useLoaderData, useSearchParams } from 'react-router-dom';
import { Search, Sparkles, TicketPercent } from 'lucide-react';
import EventCard from '../components/EventCard';
import Button from '../components/Button';

const HomePage = () => {
  const events = useLoaderData() || [];
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const date = searchParams.get('date') || '';

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8 shadow-soft md:p-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary shadow-sm">
              <Sparkles size={14} /> Live experiences
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              Discover the next unforgettable night.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Find concerts, festivals, workshops, and community events designed to bring people together.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button>Explore Events</Button>
              <Button variant="outline">Become a Host</Button>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-4 shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80"
              alt="Event crowd"
              className="h-[420px] w-full rounded-[1.5rem] object-cover"
            />
          </div>
        </div>
      </section>

      <form method="get" action="/events" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search events"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-primary"
            />
          </label>

          <select
            name="category"
            defaultValue={category}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
          >
            <option value="">All categories</option>
            <option value="Music">Music</option>
            <option value="Conference">Conference</option>
            <option value="Workshop">Workshop</option>
            <option value="Festival">Festival</option>
          </select>

          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
          />
        </div>
      </form>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Events</p>
            <h2 className="text-3xl font-bold text-slate-900">Featured this week</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TicketPercent size={16} /> {events.length} events
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.length ? events.map((event) => <EventCard key={event._id} event={event} />) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              No events match your filters yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
