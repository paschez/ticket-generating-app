import { useEffect, useRef, useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle2, PlusCircle, QrCode, Trash2, XCircle } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/Button';
import Input from '../components/Input';

const emptyEventForm = {
  title: '',
  description: '',
  category: 'Music',
  venue: '',
  date: '',
  startTime: '',
  endTime: '',
  price: '',
  totalTickets: '',
  status: 'published',
};

const AdminDashboardPage = () => {
  const stats = useLoaderData();
  const revalidator = useRevalidator();
  const [activeTab, setActiveTab] = useState('overview');
  const [form, setForm] = useState(emptyEventForm);
  const [banner, setBanner] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [createError, setCreateError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef(null);
  const scanningLockRef = useRef(false);
  const scannerElementId = 'admin-ticket-qr-reader';

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      const state = scanner.getState?.();
      // 2 = SCANNING, 3 = PAUSED in html5-qrcode
      if (state === 2 || state === 3) {
        await scanner.stop();
      }
      await scanner.clear();
    } catch {
      // Camera may already be stopped
    } finally {
      scannerRef.current = null;
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab !== 'verify') {
      stopScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (!stats) {
    return <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-500">Unable to load stats.</div>;
  }

  const handleDeleteEvent = async (eventId, title) => {
    const confirmed = window.confirm(`Delete "${title}"? This will also remove related tickets.`);
    if (!confirmed) return;

    setDeletingId(eventId);
    setDeleteMessage('');
    setDeleteError('');

    try {
      await api.delete(`/events/${eventId}`);
      setDeleteMessage(`Deleted "${title}" successfully.`);
      revalidator.revalidate();
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Unable to delete event.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    setCreating(true);
    setCreateMessage('');
    setCreateError('');

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, value);
      });
      if (banner) {
        payload.append('banner', banner);
      }

      await api.post('/events', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm(emptyEventForm);
      setBanner(null);
      setCreateMessage(
        form.status === 'published'
          ? 'Event created and published. It now appears on the landing page.'
          : 'Event saved as draft.'
      );
      revalidator.revalidate();
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Unable to create event.');
    } finally {
      setCreating(false);
    }
  };

  const verifyTicketCode = async (code) => {
    const ticketNumber = String(code || '').trim();
    if (!ticketNumber || verifying) return;

    setVerifying(true);
    setVerifyError('');
    setVerifyResult(null);

    try {
      const { data } = await api.post('/tickets/verify', { ticketNumber });
      setVerifyResult(data);
    } catch (error) {
      const data = error.response?.data;
      if (data?.result) {
        setVerifyResult(data);
      } else {
        setVerifyError(data?.message || 'Unable to verify ticket.');
      }
    } finally {
      setVerifying(false);
      scanningLockRef.current = false;
    }
  };

  const startScanner = async () => {
    setCameraError('');
    setVerifyError('');
    setVerifyResult(null);
    scanningLockRef.current = false;

    await stopScanner();

    try {
      const scanner = new Html5Qrcode(scannerElementId);
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras?.length) {
        setCameraError('No camera found on this device.');
        return;
      }

      const rearCamera =
        cameras.find((camera) => /back|rear|environment/i.test(camera.label)) || null;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      const onSuccess = async (decodedText) => {
        if (scanningLockRef.current) return;
        scanningLockRef.current = true;
        await verifyTicketCode(decodedText);
      };

      try {
        if (rearCamera) {
          await scanner.start(rearCamera.id, config, onSuccess, () => {});
        } else {
          await scanner.start({ facingMode: 'environment' }, config, onSuccess, () => {});
        }
      } catch {
        // Fall back to any available / front camera
        try {
          await scanner.start({ facingMode: 'user' }, config, onSuccess, () => {});
        } catch (fallbackError) {
          const firstCamera = cameras[0];
          if (!firstCamera) throw fallbackError;
          await scanner.start(firstCamera.id, config, onSuccess, () => {});
        }
      }

      setScanning(true);
    } catch (error) {
      setCameraError(
        error?.message?.includes('Permission')
          ? 'Camera permission denied. Allow camera access to scan tickets.'
          : error?.message || 'Unable to start camera. Check permissions and try again.'
      );
      scannerRef.current = null;
      setScanning(false);
    }
  };

  const resultStyles = {
    VALID: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    USED: 'border-amber-200 bg-amber-50 text-amber-800',
    INVALID: 'border-red-200 bg-red-50 text-red-800',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'create', label: 'Create Event', icon: PlusCircle },
            { id: 'manage', label: 'Manage Events', icon: Trash2 },
            { id: 'verify', label: 'Scan Ticket', icon: QrCode },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'
              }`}
            >
              {tab.icon ? <tab.icon size={16} /> : null}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Events" value={stats.totalEvents} />
            <StatCard label="Published Events" value={stats.publishedEvents} />
            <StatCard label="Tickets Sold" value={stats.ticketsSold} />
            <StatCard label="Revenue" value={`$${stats.revenue}`} />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-xl font-bold text-slate-900">Recent events</h3>
              <div className="mt-5 space-y-3">
                {stats.recentEvents.map((event) => (
                  <div key={event._id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-800">{event.title}</p>
                      <p className="text-sm text-slate-500">{event.status}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{event.ticketsSold || 0} sold</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-xl font-bold text-slate-900">Recent ticket purchases</h3>
              <div className="mt-5 space-y-3">
                {stats.recentPurchases.map((purchase) => (
                  <div key={purchase._id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-800">{purchase.event?.title}</p>
                      <p className="text-sm text-slate-500">{purchase.user?.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{purchase.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'create' && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Event Management</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Create Event</h2>
            <p className="mt-2 text-slate-600">
              Published events appear automatically in the landing page Events section.
            </p>
          </div>

          <form onSubmit={handleCreateEvent} className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Category</span>
              <select
                required
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary"
              >
                <option value="Music">Music</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Festival">Festival</option>
              </select>
            </label>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Description</span>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary"
                />
              </label>
            </div>
            <Input
              label="Venue"
              required
              value={form.venue}
              onChange={(e) => setForm((prev) => ({ ...prev, venue: e.target.value }))}
            />
            <Input
              label="Date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            />
            <Input
              label="Start time"
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
            />
            <Input
              label="End time"
              type="time"
              required
              value={form.endTime}
              onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
            />
            <Input
              label="Price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            />
            <Input
              label="Total tickets"
              type="number"
              min="1"
              required
              value={form.totalTickets}
              onChange={(e) => setForm((prev) => ({ ...prev, totalTickets: e.target.value }))}
            />
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Banner image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBanner(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              />
            </label>

            {createMessage ? (
              <p className="md:col-span-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{createMessage}</p>
            ) : null}
            {createError ? (
              <p className="md:col-span-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{createError}</p>
            ) : null}

            <div className="md:col-span-2">
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </section>
      )}

      {activeTab === 'manage' && (
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Event Management</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Manage Events</h2>
              <p className="mt-2 text-slate-600">
                Delete past events that are no longer needed. Upcoming events can also be removed if required.
              </p>
            </div>

            {deleteMessage ? (
              <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{deleteMessage}</p>
            ) : null}
            {deleteError ? (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{deleteError}</p>
            ) : null}

            <div className="space-y-8">
              <EventListSection
                title="Past events"
                emptyText="No past events to delete."
                events={stats.pastEvents || []}
                deletingId={deletingId}
                onDelete={handleDeleteEvent}
                past
              />
              <EventListSection
                title="Upcoming events"
                emptyText="No upcoming events."
                events={stats.upcomingEvents || []}
                deletingId={deletingId}
                onDelete={handleDeleteEvent}
              />
            </div>
          </div>
        </section>
      )}

      {activeTab === 'verify' && (
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Ticket Verification</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Scan Ticket</h2>
              <p className="mt-2 text-slate-600">
                Open the camera to scan a ticket QR code. The rear camera is preferred when available.
              </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-3">
              {!scanning ? (
                <Button onClick={startScanner}>
                  <Camera size={16} className="mr-2" /> Start Camera
                </Button>
              ) : (
                <Button variant="outline" onClick={stopScanner}>
                  Stop Camera
                </Button>
              )}
            </div>

            <div
              id={scannerElementId}
              className="mx-auto max-w-md overflow-hidden rounded-2xl bg-slate-100"
            />

            {cameraError ? (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{cameraError}</p>
            ) : null}

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
              <Input
                label="Or enter ticket number"
                placeholder="TKT-XXXXXXXXXX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <div className="flex items-end">
                <Button
                  onClick={() => verifyTicketCode(manualCode)}
                  disabled={verifying || !manualCode.trim()}
                  className="w-full md:w-auto"
                >
                  {verifying ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </div>

            {verifyError ? (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{verifyError}</p>
            ) : null}

            {verifyResult ? (
              <div className={`mt-6 rounded-2xl border p-5 ${resultStyles[verifyResult.result] || resultStyles.INVALID}`}>
                <div className="flex items-start gap-3">
                  {verifyResult.result === 'VALID' ? (
                    <CheckCircle2 className="mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-2">
                    <p className="text-lg font-bold">{verifyResult.message}</p>
                    {verifyResult.ticket ? (
                      <div className="space-y-1 text-sm">
                        <p><span className="font-semibold">Ticket:</span> {verifyResult.ticket.ticketNumber}</p>
                        <p><span className="font-semibold">Event:</span> {verifyResult.ticket.event?.title}</p>
                        <p><span className="font-semibold">Venue:</span> {verifyResult.ticket.event?.venue}</p>
                        <p><span className="font-semibold">Attendee:</span> {verifyResult.ticket.user?.name}</p>
                        <p><span className="font-semibold">Status:</span> {verifyResult.ticket.status}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-3xl bg-white p-6 shadow-soft">
    <p className="text-sm text-slate-500">{label}</p>
    <h2 className="mt-3 text-3xl font-black text-slate-900">{value}</h2>
  </div>
);

const EventListSection = ({ title, emptyText, events, deletingId, onDelete, past = false }) => (
  <div>
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <div className="mt-4 space-y-3">
      {events.length ? (
        events.map((event) => (
          <div
            key={event._id}
            className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-800">{event.title}</p>
              <p className="text-sm text-slate-500">
                {new Date(event.date).toLocaleDateString()} · {event.status}
                {past ? ' · past' : ''}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              disabled={deletingId === event._id}
              onClick={() => onDelete(event._id, event.title)}
            >
              <Trash2 size={16} className="mr-2" />
              {deletingId === event._id ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        ))
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          {emptyText}
        </p>
      )}
    </div>
  </div>
);

export default AdminDashboardPage;
