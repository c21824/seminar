const SESSION_KEY = 'bookops_session'

export const defaultRouteByRole = {
  customer: '/customer/home',
  staff: '/staff/books',
  manager: '/manager/approvals',
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
