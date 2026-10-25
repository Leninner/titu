import * as React from 'react'

type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
}

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border-0 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'
const variants = {
  default: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
  outline: 'border border-[var(--border)] bg-white text-[var(--navy)] hover:bg-[var(--accent-soft)]',
  ghost: 'bg-transparent text-[var(--navy)] hover:bg-[var(--accent-soft)]',
}
const sizes = {
  default: 'h-10 px-4',
  sm: 'h-8 px-3 text-xs',
  icon: 'size-10',
}

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`.trim()}
      {...props}
    />
  )
}
