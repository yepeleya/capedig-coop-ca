import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'link'],
  ['clean'],
]

/**
 * Éditeur de texte riche (façon Word) basé sur Quill, utilisé pour le
 * contenu des annonces/actualités. Pas de bouton d'image dans la barre
 * d'outils : Quill embarquerait l'image en base64 dans le HTML, ce qui
 * dépasserait vite la colonne `contenu` (TEXT, ~64 Ko) — l'image/vidéo
 * de l'annonce ou de l'actualité passe par un champ d'upload dédié.
 */
export default function RichTextEditor({ value, onChange, placeholder }) {
  const containerRef = useRef(null)
  const quillRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder: placeholder || '',
      modules: { toolbar: TOOLBAR },
    })

    if (value) quill.root.innerHTML = value

    quill.on('text-change', () => {
      const html = quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML
      onChangeRef.current?.(html)
    })

    quillRef.current = quill
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
      <div ref={containerRef} style={{ minHeight: '160px' }} />
    </div>
  )
}
