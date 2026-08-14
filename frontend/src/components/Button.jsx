const Button = ({ children, variant = 'primary', className = '', type = 'button', ...props }) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-orange-600',
    secondary: 'bg-secondary text-slate-800 hover:bg-amber-300',
    accent: 'bg-accent text-white hover:bg-emerald-600',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 shadow-sm ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
