/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Palette officielle CAPEDIG (extraite de la maquette) ──
        capedig: {
          brun:           "#3D2314",  // navbar, footer, fonds sombres
          "brun-deep":    "#2A1509",  // menu mobile, overlays
          orange:         "#D4641A",  // accent principal, boutons, badges
          "orange-light": "#E8762A",  // hover orange
          vert:           "#2D6A4F",  // bouton Espace Producteurs
          "vert-light":   "#52B788",  // hover vert
          beige:          "#F5F0EB",  // fond de page général
          "beige-dark":   "#EDE5DB",  // bordures, séparateurs
        },
      },
      fontFamily: {
        display: ["Lora", "Georgia", "serif"],
        body:    ["Inter", "'Helvetica Neue'", "Arial", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-48px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(48px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        scrollLeft: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "fade-up":      "fadeUp 0.75s cubic-bezier(0.4,0,0.2,1) forwards",
        "fade-in":      "fadeIn 0.6s ease forwards",
        "slide-left":   "slideInLeft 0.75s cubic-bezier(0.4,0,0.2,1) forwards",
        "slide-right":  "slideInRight 0.75s cubic-bezier(0.4,0,0.2,1) forwards",
        "scale-in":     "scaleIn 0.6s ease forwards",
        float:          "float 4s ease-in-out infinite",
        "scroll-left":  "scrollLeft 30s linear infinite",
        shimmer:        "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "hero-overlay": "linear-gradient(100deg, rgba(20,8,2,0.92) 0%, rgba(20,8,2,0.55) 50%, rgba(20,8,2,0.1) 100%)",
        "card-hover":   "linear-gradient(135deg, #D4641A 0%, #E8762A 100%)",
      },
    },
  },
  plugins: [],
}
