import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useReveal } from '../../hooks/useReveal'
import { isVideoFile } from '../../utils/richContent'

export default function AnnonceDetail() {
  useReveal()
  const { id } = useParams()

  const [ann, setAnn] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(false)

  useEffect(() => {
    fetch(`/api/annonces/index.php?id=${id}&statut=publiee`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const item = Array.isArray(data) ? data[0] : null
        if (item) setAnn(item)
        else setErreur(true)
      })
      .catch(() => setErreur(true))
      .finally(() => setLoading(false))
  }, [id])

  const rawImg = ann?.image
  const img = rawImg && !rawImg.startsWith('http') ? `/uploads/${rawImg}` : rawImg
  const video = isVideoFile(rawImg)

  return (
    <div className="min-h-screen bg-capedig-beige">
      <Navbar />

      <section className="px-6" style={{ paddingTop: '108px', paddingBottom: '64px' }}>
        <div className="max-w-3xl mx-auto">
          <Link to="/actualites"
            className="inline-flex items-center gap-1.5 text-capedig-orange text-[13.5px]
                       font-semibold mb-6 hover:gap-2.5 transition-all duration-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux annonces
          </Link>

          {loading && (
            <div className="space-y-4">
              <div className="h-64 skeleton rounded-2xl" />
              <div className="h-8 skeleton rounded w-3/4" />
              <div className="h-4 skeleton rounded w-full" />
              <div className="h-4 skeleton rounded w-5/6" />
            </div>
          )}

          {!loading && erreur && (
            <div className="text-center py-16">
              <p className="text-[18px] font-bold text-gray-700 mb-2">
                Cette annonce n'est plus disponible.
              </p>
              <Link to="/actualites" className="text-capedig-orange font-semibold hover:underline">
                Retour à la liste
              </Link>
            </div>
          )}

          {!loading && ann && (
            <article className="bg-white rounded-2xl border border-capedig-beige-dark
                                overflow-hidden reveal">
              {img && (
                <div className="bg-black">
                  {video ? (
                    <video src={img} controls className="w-full max-h-[420px]" />
                  ) : (
                    <img src={img} alt={ann.titre} className="w-full max-h-[420px] object-cover" />
                  )}
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10.5px] font-bold tracking-[1.4px] px-3 py-1 rounded
                                   bg-capedig-vert text-white uppercase">
                    {ann.categorie || 'Annonce'}
                  </span>
                  <span className="text-gray-400 text-[12.5px]">{ann.date}</span>
                </div>
                <h1 className="font-display text-[28px] font-bold text-gray-900 leading-tight mb-6">
                  {ann.titre}
                </h1>
                <div
                  className="prose-actualite text-gray-700 text-[15px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ann.contenu) }}
                />
              </div>
            </article>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
