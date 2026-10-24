import * as React from 'react'

type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
}

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border-0 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#7150b3]/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'
const variants = {
  default: 'bg-[#6845a6] text-white hover:bg-[#57388f]',
  outline: 'border border-[#d9cbeb] bg-white text-[#583b88] hover:bg-[#f3eef8]',
  ghost: 'bg-transparent text-[#583b88] hover:bg-[#f3eef8]',
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
