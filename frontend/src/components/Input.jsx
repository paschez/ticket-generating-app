const Input = ({ label, error, ...props }) => {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label && <span className="mb-2 block">{label}</span>}
      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition ${
          error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-primary'
        } ${props.className || ''}`}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
};

export default Input;
