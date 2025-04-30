import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        'bevel-up': 'inset 1px 1px 0px #FFFFFF, inset -1px -1px 0px #808080',
        'bevel-down': 'inset -1px -1px 0px #FFFFFF, inset 1px 1px 0px #808080',
      },
      colors: {
        w95: {
          0: '#C0C0C0',   // window face
          1: '#FFFFFF',   // window bg (lighter)
          2: '#008080',   // teal title-bar
          3: '#000000',   // text
          hi: '#FFFFFF',   // 3-D highlight
          lo: '#404040',   // 3-D shadow
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'sans-serif'],
        w98: ['"MS Sans Serif"', '"Press Start 2P"', 'sans-serif'],
        system: ['"MS Sans Serif"', 'Arial', 'sans-serif'],
      },
      cursor: {
        w98: 'url("/cursors/w95_arrow.cur"), default',
        w98hand: 'url("/cursors/w95_hand.cur"), pointer',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      borderRadius: {
        none: '0',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, theme }) => {
      const hi = theme('colors.w95.hi')
      const lo = theme('colors.w95.lo')

      addUtilities({
        '.bevel-up': {
          borderTop: `1px solid ${hi}`,
          borderLeft: `1px solid ${hi}`,
          borderBottom: `1px solid ${lo}`,
          borderRight: `1px solid ${lo}`,
          boxShadow: `inset 1px 1px #DFDFDF, inset -1px -1px #808080`,
        },
        '.bevel-down': {
          borderTop: `1px solid ${lo}`,
          borderLeft: `1px solid ${lo}`,
          borderBottom: `1px solid ${hi}`,
          borderRight: `1px solid ${hi}`,
          boxShadow: `inset 1px 1px #808080, inset -1px -1px #DFDFDF`,
        },
        '.w98-window': {
          backgroundColor: '#C0C0C0',
          border: '1px solid',
          borderTopColor: '#DFDFDF',
          borderLeftColor: '#DFDFDF',
          borderBottomColor: '#404040',
          borderRightColor: '#404040',
          boxShadow: 'inset 1px 1px #FFFFFF, inset -1px -1px #808080',
        },
        '.w98-titlebar': {
          backgroundColor: '#008080',
          color: 'white',
          fontWeight: 'bold',
          padding: '2px 4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      })
    }),
  ],
}
