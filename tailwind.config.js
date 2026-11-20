/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'azul-negro': '#01050D',
        'naranja-principal': '#F26513',
        'naranja-rojizo': '#D93D04',
        'rojo-oscuro': '#731702',
        'gris-blanco': '#F2F2F2',
      },
    },
  },
  plugins: [],
}