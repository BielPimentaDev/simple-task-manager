/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        strict: true,
        esModuleInterop: true,
        module: 'commonjs',
        skipLibCheck: true,
        types: ['jest', 'node'],
      },
    }],
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      lines: 85,
      functions: 85,
      branches: 85,
      statements: 85,
    },
  },
}
