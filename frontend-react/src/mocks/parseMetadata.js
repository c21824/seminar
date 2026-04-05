export function getCoverFromDescription(description) {
  if (!description) {
    return ''
  }
  const parts = description.split('|').map((item) => item.trim())
  const cover = parts.find((item) => item.toLowerCase().startsWith('cover:'))
  if (!cover) {
    return ''
  }
  return cover.split(':').slice(1).join(':').trim()
}

export function getPriceFromDescription(description) {
  if (!description) {
    return null
  }
  const parts = description.split('|').map((item) => item.trim())
  const price = parts.find((item) => item.toLowerCase().startsWith('price:'))
  if (!price) {
    return null
  }
  const parsed = Number(price.split(':').slice(1).join(':').trim())
  return Number.isFinite(parsed) ? parsed : null
}

export function getCatalogFromDescription(description) {
  if (!description) {
    return ''
  }
  const parts = description.split('|').map((item) => item.trim())
  const catalog = parts.find((item) => item.toLowerCase().startsWith('catalog:'))
  if (!catalog) {
    return ''
  }
  return catalog.split(':').slice(1).join(':').trim()
}

export function getBookCover(book) {
  if (!book) {
    return ''
  }
  return book.cover_image || getCoverFromDescription(book.description)
}

export function getBookPrice(book) {
  if (!book) {
    return null
  }
  const structuredPrice = Number(book.price)
  if (Number.isFinite(structuredPrice) && structuredPrice > 0) {
    return structuredPrice
  }
  return getPriceFromDescription(book.description)
}

export function getBookCatalog(book) {
  if (!book) {
    return ''
  }
  return book.catalog_name || getCatalogFromDescription(book.description)
}

export function cleanDescription(description) {
  if (!description) {
    return '-'
  }
  return description
    .split('|')
    .map((item) => item.trim())
    .filter((item) => !item.toLowerCase().startsWith('cover:'))
    .filter((item) => !item.toLowerCase().startsWith('price:'))
    .filter((item) => !item.toLowerCase().startsWith('catalog:'))
    .join(' | ')
}
