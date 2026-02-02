module.exports = {
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'vue'],
    transform: {
        '^.+\\.js$': 'esbuild-jest'
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^vue-sonner$': '<rootDir>/__mocks__/vue-sonner.js',
        '\\.vue$': '<rootDir>/__mocks__/vue-component.js',
        '^\\.\\./\\.\\./api$': '<rootDir>/__mocks__/api.js',
        '^\\.\\./\\.\\./stores/location\\.js$': '<rootDir>/__mocks__/location-store.js'
    },
    testMatch: ['<rootDir>/src/**/*.{test,spec}.js'],
    testPathIgnorePatterns: [],
    watchPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/build/'],
    coverageReporters: ['text', 'text-summary'],
    collectCoverageFrom: [
        'src/shared/utils/**/*.js',
        '!src/shared/utils/**/*.test.js',
        '!src/shared/utils/**/__tests__/**'
    ]
};
