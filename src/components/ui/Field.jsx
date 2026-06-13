// Campos de formulario con estilo consistente y soporte de error.

export function Label({ children, htmlFor, hint }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-muted"
    >
      <span>{children}</span>
      {hint && <span className="text-faint font-normal">{hint}</span>}
    </label>
  )
}

const baseInput = `w-full bg-surface-2 border rounded-2xl px-4 text-[15px] text-text
  placeholder:text-faint transition-colors duration-150
  focus:outline-none focus:border-brand focus:bg-surface-3`

export function Input({ error, className = '', prefix, ...props }) {
  if (prefix) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted text-[15px]">
          {prefix}
        </span>
        <input
          className={`${baseInput} h-13 pl-8 tnum ${
            error ? 'border-danger' : 'border-border'
          } ${className}`}
          style={{ height: '3.25rem' }}
          {...props}
        />
      </div>
    )
  }
  return (
    <input
      className={`${baseInput} ${error ? 'border-danger' : 'border-border'} ${className}`}
      style={{ height: '3.25rem' }}
      {...props}
    />
  )
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`${baseInput} py-3 min-h-[88px] resize-none ${
        error ? 'border-danger' : 'border-border'
      } ${className}`}
      {...props}
    />
  )
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <div className="relative">
      <select
        className={`${baseInput} appearance-none pr-10 ${
          error ? 'border-danger' : 'border-border'
        } ${className}`}
        style={{ height: '3.25rem' }}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1.5 text-[13px] text-danger">{children}</p>
}

export function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div>
      {label && (
        <Label htmlFor={htmlFor} hint={hint}>
          {label}
        </Label>
      )}
      {children}
      <FieldError>{error}</FieldError>
    </div>
  )
}
