import { useState } from 'react'

// ─── Équipe dirigeante ───────────────────────────────────────────
// Pour ajouter une vraie photo : dépose-la dans
// frontend/public/dirigeants/ puis renseigne son chemin dans `photo`.
// Tant qu'aucune photo n'est fournie, un avatar coloré avec les
// initiales s'affiche automatiquement à la place.
const AVATAR_COLORS = ['#D4641A', '#2D6A4F', '#3D2314', '#8C5A2B']

// Pour ajouter une photo : dépose le fichier dans frontend/public/dirigeants/
// puis remplace null par le chemin, ex: '/dirigeants/kabre_yembi.jpg'
export const DIRIGEANTS = [
  {
    nom: ' M. El Adj Kabré Yembi',
    role: 'Président du Conseil d\'Administration (PCA)',
    photo: '/dirigeants/PCA.png',     
    initiales: 'KY',
  },
  {
    nom: 'Mme Sié Aman Sabine Épse Dano',
    role: 'Directrice de Production',
    photo: '/dirigeants/DIRECTRICE.png',     
    initiales: 'SD',
  },
  {
    nom: 'M. Ouattara Souleymane',
    role: 'Responsable Durabilité',
    photo: '/dirigeants/Responsable_Durabilite.png',    
    initiales: 'OS',
  },
  {
    nom: 'M. Sako Hamed El Amine',
    role: 'Responsable Traçabilité et Base de Données',
    photo: '/dirigeants/Responsable_Tracabilite.jpeg',   
    initiales: 'SH',
  },
  {
    nom: 'M. Asseman Kouassi Marcelin',
    role: 'Responsable Sydoré & ASR Travail des Enfants',
    photo: '/dirigeants/Responsable_ASR.jpeg',     
    initiales: 'AK',
  },
  {
    nom: 'Mme Soro Mariatou',
    role: 'Responsable Projet',
    photo: '/dirigeants/Responsable_projet.png',     
    initiales: 'SM',
  },
  {
    nom: "M. Kossonou Sylanus N'Guettia",
    role: 'Comptable',
    photo: '/dirigeants/COMPTABLE.png',     
    initiales: 'KS',
  },
  {
    nom: "Mlle Bertine Dah",
    role: 'Sécretaire Général',
    photo: '/dirigeants/Secretaire.png',     
    initiales: 'BD',
  }
]

function Avatar({ nom, photo, initiales, color }) {
  const [errored, setErrored] = useState(false)

  if (photo && !errored) {
    return (
      <img
        src={photo}
        alt={nom}
        onError={() => setErrored(true)}
        className="w-24 h-24 rounded-full object-cover mx-auto mb-4
                   shadow-lg border-4 border-white"
      />
    )
  }

  return (
    <div
      className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg border-4 border-white
                 flex items-center justify-center text-white font-display
                 font-bold text-[22px]"
      style={{ background: color }}
    >
      {initiales}
    </div>
  )
}

export default function EquipeDirigeants({ membres = DIRIGEANTS }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {membres.map((m, i) => (
        <div
          key={m.nom}
          className={`text-center bg-white rounded-2xl border border-capedig-beige-dark
                     p-6 card-hover reveal delay-${(i % 5) + 1}`}
        >
          <Avatar
            nom={m.nom}
            photo={m.photo}
            initiales={m.initiales}
            color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
          />
          <p className="font-display font-bold text-[16px] text-gray-900">{m.nom}</p>
          <p className="text-capedig-orange text-[13px] font-semibold mt-1">{m.role}</p>
          {m.bio && (
            <p className="text-gray-500 text-[12.5px] leading-relaxed mt-3">{m.bio}</p>
          )}
        </div>
      ))}
    </div>
  )
}
