const VARIANTES = {
  primary:
    'bg-brand text-white shadow-lg shadow-brand/25 active:bg-brand-soft disabled:opacity-40',
  secondary:
    'bg-surface-3 text-text active:bg-border-strong disabled:opacity-40',
  ghost: 'bg-transparent text-muted active:bg-surface-2 disabled:opacity-40',
  danger:
    'bg-danger-dim text-danger active:opacity-80 disabled:opacity-40',
  outline:
    'bg-transparent text-text border border-border-strong active:bg-surface-2 disabled:opacity-40',
}

const TAMANOS = {
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-12 px-5 text-[15px] rounded-2xl gap-2',
  lg: 'h-14 px-6 text-base rounded-2xl gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  full = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-semibold tracking-tight
        transition-all duration-150 active:scale-[0.97] select-none
        ${VARIANTES[variant]} ${TAMANOS[size]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
