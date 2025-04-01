module.exports = {
    testEnvironment: "jsdom", // Permite pruebas con DOM (por ejemplo, `document`)
    transform: {
      "^.+\\.jsx?$": "babel-jest"
    },
    moduleFileExtensions: ["js", "jsx"]
  };