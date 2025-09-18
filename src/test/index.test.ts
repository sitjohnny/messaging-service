import { AddressInfo } from 'net';
import http from 'http';
import app from '../index';
import config from '../config/config';

describe('index.ts', () => {
    let server: http.Server;

    beforeAll((done) => {
        server = app.listen(config.port, () => {
            done();
        });
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    test('should listen on the specified port', async () => {
        const address = server.address() as AddressInfo;
        expect(address).not.toBeNull();
        expect(address.port).toBe(config.port);
    });
});
