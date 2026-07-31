// Icônes SVG inline (aucune emoji dans le code) — même convention que
// AdminSidebar.jsx : trait fin, `currentColor`, viewBox 24x24 sauf mention.
// Chaque icône accepte `className` pour piloter taille et couleur via Tailwind.

export function IconCheck({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function IconCheckDouble({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 13l4 4L15 8" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 13l4 4L22 8" />
    </svg>
  )
}

export function IconCheckCircle({ className = 'w-14 h-14', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9.5" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 12.5l3 3 6-6.5" />
    </svg>
  )
}

export function IconX({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function IconWarning({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v3.75m0 3.001v.001M10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h17.78a1.5 1.5 0 001.29-2.25L13.71 3.86a1.5 1.5 0 00-2.42 0z" />
    </svg>
  )
}

export function IconMic({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3zM19 11a7 7 0 01-14 0M12 18v3" />
    </svg>
  )
}

export function IconPhone({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 4h10a1 1 0 011 1v14a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1zM11 18h2" />
    </svg>
  )
}

export function IconSearch({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 17a7 7 0 100-14 7 7 0 000 14zM21 21l-4.35-4.35" />
    </svg>
  )
}

export function IconNewspaper({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 5h13a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM4 5a2 2 0 00-2 2v9a2 2 0 002 2M8 8h7M8 12h7M8 16h4" />
    </svg>
  )
}

export function IconTractor({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 17a2 2 0 100-4 2 2 0 000 4zM17 17a3 3 0 100-6 3 3 0 000 6zM7 15h5.5M5 13V7h5l3 4h2.5a2.5 2.5 0 012.5 2.5V14M9 7V4h3" />
    </svg>
  )
}

export function IconUsers({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export function IconPin({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 21s-7-6.14-7-11.5A7 7 0 0119 9.5C19 14.86 12 21 12 21z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    </svg>
  )
}

export function IconTrendingUp({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 17l6-6 4 4 8-8M21 7h-5v5" />
    </svg>
  )
}

export function IconMegaphone({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 11v2a2 2 0 002 2h1l3 5v-5h2l7 4V6l-7 4H6a2 2 0 00-2 2z" />
    </svg>
  )
}

export function IconMail({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 6h18v12H3V6zM3 6l9 7 9-7" />
    </svg>
  )
}

export function IconSend({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconDotsVertical({ className = 'w-5 h-5', ...props }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  )
}

export function IconLock({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M6 11V8a6 6 0 1112 0v3M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1z" />
    </svg>
  )
}

export function IconLockOpen({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M6 11V8a6 6 0 0111.2-3M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1z" />
    </svg>
  )
}

export function IconTrash({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0h10l-.8 12.2a2 2 0 01-2 1.8H8.8a2 2 0 01-2-1.8L6 7z" />
    </svg>
  )
}

export function IconEraser({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 20h9M13.5 5.5l4.6 4.6a1.5 1.5 0 010 2.1L11 19.3a1.5 1.5 0 01-2.1 0l-4.6-4.6a1.5 1.5 0 010-2.1l7.1-7.1a1.5 1.5 0 012.1 0z" />
    </svg>
  )
}

export function IconArchiveClose({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 7h16M5 7v11a2 2 0 002 2h10a2 2 0 002-2V7M4 7l1.5-3h13L20 7M10 12h4" />
    </svg>
  )
}

export function IconLeaf({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 20c8 0 14-6 14-14V4h-2C9 4 3 10 3 18v2h2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20c3-6 7-10 13-14" />
    </svg>
  )
}
