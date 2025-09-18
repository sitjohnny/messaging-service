global.console = {
    ...console,
    error: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid'),
}));
