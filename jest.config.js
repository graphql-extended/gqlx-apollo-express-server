module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(js|ts)$',
  moduleFileExtensions: [
    'ts',
    'js',
    'json',
  ],
  modulePaths: ['src', 'node_modules'],
  globals: {
    NODE_ENV: 'test',
  },
  testPathIgnorePatterns: [],
};
