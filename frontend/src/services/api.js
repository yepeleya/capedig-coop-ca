const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function buildUrl(path, params) {
  const url = `${BASE_URL}/${path.replace(/^\/+/, '')}`
  if (!params) return url
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return query ? `${url}?${query}` : url
}

async function request(path, { method = 'GET', params, body, isFormData = false } = {}) {
  const token = localStorage.getItem('capedig_token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok || (data && data.success === false)) {
    const message = (data && (data.message || data.error)) || `Erreur ${res.status}`
    throw new Error(message)
  }

  return data
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData, isFormData: true }),
  del: (path, params) => request(path, { method: 'DELETE', params }),
}
