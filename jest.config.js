module.exports = {
  roots: ['<rootDir>/test'],
  testMatch: ['**/?(*.)+(test).+(ts)'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
  moduleDirectories: ['<rootDir>/test/'],
};
