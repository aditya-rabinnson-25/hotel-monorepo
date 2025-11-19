/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared-components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: { extend: {} },
  plugins: []
}
