const EmptyState = ({ title, message, action }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
    <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
    <p className="mt-2 text-sm text-slate-500">{message}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
