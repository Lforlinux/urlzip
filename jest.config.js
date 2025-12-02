module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      isolatedModules: true
    }]
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'bin/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/cdk.out/**'
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputName: 'junit.xml',
        outputDirectory: '.',
        suiteName: 'Jest Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: 'true',
        includeConsoleOutput: 'true',
        addFileAttribute: 'true'
      }
    ]
  ]
};
