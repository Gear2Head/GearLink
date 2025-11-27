module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/apps', '<rootDir>/libs'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverageFrom: [
        'apps/**/*.ts',
        'libs/**/*.ts',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/*.config.ts',
        '!**/migrations/**',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    moduleNameMapper: {
        '^@gearlink/prisma$': '<rootDir>/libs/prisma/src',
        '^@gearlink/common$': '<rootDir>/libs/common/src',
        '^@gearlink/crypto$': '<rootDir>/libs/crypto/src',
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
