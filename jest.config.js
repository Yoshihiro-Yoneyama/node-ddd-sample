/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
  testRegex: '(.*\\.(test|spec))\\.ts?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  globals: {
    'esbuild-jest': {},
  },
};
