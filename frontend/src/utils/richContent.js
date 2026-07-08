const EXT_VIDEO = ['mp4', 'webm', 'mov']

export function isVideoFile(filename) {
  if (!filename) return false
  const ext = filename.split('.').pop().toLowerCase()
  return EXT_VIDEO.includes(ext)
}

/** Retire les balises HTML pour un aperçu texte (cartes, extraits). */
export function stripHtml(html, maxLen) {
  if (!html) return ''
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!maxLen || text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}
