module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        slate: "#2f2f2f",
        bone: "#f4f1ec",
        mint: "#b9e4d0",
        coral: "#f07a5a",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui"],
        body: ["'Source Sans 3'", "system-ui"],
      },
    },
  },
  plugins: [],
};
