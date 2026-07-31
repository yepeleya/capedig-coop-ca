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

function buildHeaders(isFormData) {
  const token = localStorage.getItem('capedig_token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (!isFormData) headers['Content-Type'] = 'application/json'
  return headers
}

async function parseJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

// Centralise la règle "qu'est-ce qu'une réponse en échec ?" : soit le statut
// HTTP n'est pas ok, soit l'API renvoie explicitement { success: false }.
// Un corps sans champ `success` (ex. une liste GET) n'est pas une erreur.
function assertSuccess(res, data) {
  const failed = !res.ok || (data && data.success === false)
  if (!failed) return
  const message = (data && (data.message || data.error)) || `Erreur ${res.status}`
  throw new Error(message)
}

async function request(path, { method = 'GET', params, body, isFormData = false } = {}) {
  const res = await fetch(buildUrl(path, params), {
    method,
    headers: buildHeaders(isFormData),
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  const data = await parseJson(res)
  assertSuccess(res, data)
  return data
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData, isFormData: true }),
  del: (path, params) => request(path, { method: 'DELETE', params }),
}
