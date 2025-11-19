module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared-components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: { extend: {} },
  plugins: [require("@tailwindcss/typography")]
};
