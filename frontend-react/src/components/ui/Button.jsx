import React from 'react'

const styleByVariant = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  link: 'inline-flex items-center justify-center rounded-full border border-textStrong/20 bg-white px-4 py-2 font-heading text-sm font-bold text-brandBlue transition hover:-translate-y-0.5 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandCyan/40',
}

export default function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const classes = `${styleByVariant[variant] || styleByVariant.primary} ${className}`.trim()
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
