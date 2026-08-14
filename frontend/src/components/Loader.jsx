const Loader = ({ label = 'Loading...' }) => (
  <div className="flex items-center justify-center gap-3 py-12 text-slate-600">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    <span>{label}</span>
  </div>
);

export default Loader;
