// feat(demo-app): configure Tailwind CSS v3 with Rick & Morty theme

/** @type {import('tailwindcss').Config} */
module.exports = {
  /**
   * Content scan: incluye tanto demo-app como ui-lib para que Tailwind
   * genere las clases usadas en ambos proyectos del workspace.
   * IMPORTANTE: sin incluir ui-lib, las clases de los componentes de la
   * librería no serían generadas y el CSS quedaría roto.
   */
  content: [
    './projects/demo-app/src/**/*.{html,ts}',
    './projects/ui-lib/src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      /**
       * Paleta cromática inspirada en Rick & Morty.
       * Usar como: bg-portal-green, text-space-black, border-danger-red, etc.
       */
      colors: {
        'portal-green': '#00ff41',  // Verde ácido icónico del portal interdimensional
        'space-black':  '#0a0a0f',  // Negro profundo del espacio — fondo principal
        'deep-blue':    '#1a1a2e',  // Azul oscuro — fondo de secciones
        'card-bg':      '#16213e',  // Fondo de tarjetas
        'rick-blue':    '#0f3460',  // Azul medio — cabeceras y secciones
        'danger-red':   '#e94560',  // Rojo — acciones destructivas y errores
        'text-primary': '#e0e0e0',  // Texto principal sobre fondos oscuros
        'text-muted':   '#8892b0',  // Texto secundario apagado
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter:    ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'portal': '0 4px 20px rgba(0, 255, 65, 0.15)',
        'portal-lg': '0 8px 40px rgba(0, 255, 65, 0.25)',
      },
    },
  },
  plugins: [],
};
