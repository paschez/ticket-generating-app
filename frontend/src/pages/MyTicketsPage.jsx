import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { Download, X } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

const qrImageUrl = (ticketNumber, size = 220) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(ticketNumber)}`;

const downloadQrCode = async (ticketNumber) => {
  const response = await fetch(qrImageUrl(ticketNumber, 512));
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${ticketNumber}-qr.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

const MyTicketsPage = () => {
  const tickets = useLoaderData() || [];
  const [previewTicket, setPreviewTicket] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!previewTicket) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setPreviewTicket(null);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [previewTicket]);

  const handleDownload = async (ticketNumber) => {
    try {
      setDownloading(true);
      await downloadQrCode(ticketNumber);
    } catch {
      alert('Unable to download QR code. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!tickets.length) {
    return (
      <EmptyState
        title="No tickets yet"
        message="Your purchased tickets will appear here once you book an event."
      />
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold text-slate-900">My Tickets</h1>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{ticket.ticketNumber}</p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">{ticket.event?.title}</h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      ticket.status === 'Used'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <p><span className="font-semibold text-slate-800">Venue:</span> {ticket.event?.venue}</p>
                  <p><span className="font-semibold text-slate-800">Purchase date:</span> {new Date(ticket.purchasedAt).toLocaleDateString()}</p>
                  <p><span className="font-semibold text-slate-800">Amount:</span> ${ticket.totalAmount}</p>
                </div>
                {ticket.usedAt ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Used on {new Date(ticket.usedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>

              <div className="mx-auto flex w-fit flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <button
                  type="button"
                  onClick={() => setPreviewTicket(ticket)}
                  className="rounded-xl transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`Preview QR code for ${ticket.ticketNumber}`}
                >
                  <img
                    src={qrImageUrl(ticket.ticketNumber)}
                    alt={`QR code for ${ticket.ticketNumber}`}
                    className="h-[180px] w-[180px] rounded-xl bg-white p-2"
                  />
                </button>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Entry QR Code</p>
                <p className="mt-1 max-w-[180px] break-all text-xs text-slate-600">{ticket.ticketNumber}</p>
                <p className="mt-1 text-xs text-slate-400">Click to preview</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => handleDownload(ticket.ticketNumber)}
                  disabled={downloading}
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewTicket ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => setPreviewTicket(null)}
          role="dialog"
          aria-modal="true"
          aria-label="QR code preview"
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewTicket(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close preview"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{previewTicket.ticketNumber}</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">{previewTicket.event?.title}</h3>
              <img
                src={qrImageUrl(previewTicket.ticketNumber, 400)}
                alt={`QR code preview for ${previewTicket.ticketNumber}`}
                className="mx-auto mt-5 h-[280px] w-[280px] rounded-2xl border border-slate-100 bg-white p-3"
              />
              <p className="mt-4 text-sm text-slate-500">Scan this code at the event entrance</p>
              <Button
                className="mt-5"
                onClick={() => handleDownload(previewTicket.ticketNumber)}
                disabled={downloading}
              >
                <Download size={16} className="mr-2" />
                {downloading ? 'Downloading...' : 'Download QR Code'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MyTicketsPage;
