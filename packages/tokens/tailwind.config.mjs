export default {
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--font-sans)",
      },
      colors: {
        bg: "hsl(var(--color-bg) / <alpha-value>)",
        fg: "hsl(var(--color-fg) / <alpha-value>)",
        primary: "hsl(var(--color-primary) / <alpha-value>)",
        "border-light": "hsl(var(--color-border-light) / <alpha-value>)",
        "border-dark": "hsl(var(--color-border-dark) / <alpha-value>)",
      },
      borderRadius: {
        DEFAULT: "var(--radius-default)",
      },
    },
  },
};