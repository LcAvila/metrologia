/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores podem ser estendidas aqui se necessário
      },
    },
  },
  plugins: [],
  // Configuração otimizada para produção
  future: {
    hoverOnlyWhenSupported: true, // Melhora performance em dispositivos móveis
  },
  // Safelist para classes dinâmicas que o Tailwind não consegue detectar automaticamente
  safelist: [
    'bg-[var(--background)]',
    'text-[var(--foreground)]',
    'bg-[var(--sidebar-bg)]',
    'text-[var(--sidebar-text)]'
  ]
};