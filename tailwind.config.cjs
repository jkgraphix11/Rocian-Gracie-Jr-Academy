/** Rocian Gracie Jr Tijuana — Mat / Matter design system.
 * Compile with Tailwind 3.4.17; no runtime CDN dependency.
 */
module.exports = {
  content: ['./src/**/*.py', './dist/script.js'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1440px' },
    extend: {
      colors: { obsidian: '#000000', paper: '#FFFFFF', champion: '#C7FF2E', fog: '#A4A4A4', panel: '#101010', line: '#343434' },
      fontFamily: { display: ['Archivo', 'Arial', 'sans-serif'], sans: ['Archivo', 'Arial', 'sans-serif'], mono: ['Archivo', 'Arial', 'sans-serif'] },
      fontSize: { 'hero': ['clamp(4.8rem, 12.7vw, 13rem)', {lineHeight: '.94', letterSpacing: '-.035em'}], 'section': ['clamp(3rem, 6.5vw, 7rem)', {lineHeight: '1', letterSpacing: '-.025em'}] },
      spacing: { gutter: 'clamp(1.25rem, 4vw, 5rem)' },
      animation: { ticker: 'ticker 30s linear infinite' },
      keyframes: { ticker: { to: { transform: 'translateX(-50%)' } } }
    }
  },
  plugins: []
};
