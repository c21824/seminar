import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', duration = 2500) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => removeToast(id), duration)
  }, [removeToast])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <article
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-semibold shadow-card ${
              toast.type === 'error'
                ? 'border-danger/30 bg-danger/10 text-danger'
                : toast.type === 'success'
                  ? 'border-ok/30 bg-ok/10 text-ok'
                  : 'border-brandCyan/30 bg-brandCyan/10 text-brandBlue'
            }`}
          >
            {toast.message}
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }
  return context
}
