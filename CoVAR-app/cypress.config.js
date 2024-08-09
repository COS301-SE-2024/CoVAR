const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3050",
    viewportWidth: 1920,
    viewportHeight: 1080,
  },
});