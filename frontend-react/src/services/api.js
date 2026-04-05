const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: JSON_HEADERS,
    ...options,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export async function getGatewayHealth() {
  return request('/api/v1/healthz/')
}

export async function getServicesHealth() {
  return request('/api/v1/services-health/')
}

export async function getBooks() {
  return request('/api/v1/proxy/book-service/books/')
}

export async function createBook(payload) {
  return request('/api/v1/proxy/book-service/books/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getCatalogItems() {
  return request('/api/v1/proxy/catalog-service/catalog-items/')
}

export async function createCatalogItem(payload) {
  return request('/api/v1/proxy/catalog-service/catalog-items/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getOrders() {
  return request('/api/v1/proxy/order-service/orders/')
}

export async function createOrder(payload) {
  return request('/api/v1/proxy/order-service/orders/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getReviews() {
  return request('/api/v1/proxy/comment-rate-service/reviews/')
}

export async function createReview(payload) {
  return request('/api/v1/proxy/comment-rate-service/reviews/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
