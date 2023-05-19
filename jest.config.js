

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '\\.tsx?$': 'babel-jest',
    '\\.jsx?$': 'babel-jest',
    '\\.mjs?$': 'babel-jest'
  },
  setupFilesAfterEnv: ['./jest.setup.js']
};
