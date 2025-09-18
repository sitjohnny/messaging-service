import type { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    testTimeout: 15000,
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/index.ts',
        '!src/config/**',
        '!src/**/*.d.ts',
        '!src/mocks/**',
        '!src/logger/**',
        '!src/exceptions/**',
    ],
    coverageReporters: ['text', 'lcov'],
    coverageDirectory: 'coverage',
    transform: {
        '^.+\\.(js|ts|tsx)?$': 'babel-jest',
        ...tsJestTransformCfg,
    },
    transformIgnorePatterns: ['/node_modules/'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    setupFiles: ['./setupJest.ts'],
};

export default config;
