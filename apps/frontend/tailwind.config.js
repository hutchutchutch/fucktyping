import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        w95: {
          0: '#cad7cf',   // taskbar bg / button face
          1: '#f4f7f5',   // window bg (lighter)
          2: '#26342e',   // dark title-bar green
          3: '#000000',   // text
          hi: '#ffffff',   // 3-D highlight
          lo: '#6b7c75',   // 3-D shadow
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
        },
        '.bevel-down': {
          borderTop: `1px solid ${lo}`,
          borderLeft: `1px solid ${lo}`,
          borderBottom: `1px solid ${hi}`,
          borderRight: `1px solid ${hi}`,
        },
      })
    }),
  ],
} 