import { generateSessionId, getSessionId } from '../session_id';

global.sessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
  };

describe('generateSessionId', () => {
    it('should generate a valid session ID', () => {
        const sessionId = generateSessionId();
        expect(sessionId).toMatch(/^[0-9A-Za-z_-]{26}$/);
    });
});

describe('getSessionId', () => {
    it('should retrieve the session ID', () => {
        const sessionId = getSessionId();
        expect(sessionId).toBeDefined();
        expect(typeof sessionId).toBe('string');
    });

    it('should generate a new session ID if none is found', () => {
        sessionStorage.removeItem('session_id');
        const sessionId = getSessionId();
        expect(sessionId).toBeDefined();
        expect(typeof sessionId).toBe('string');
    });

    it('should return the same session ID if one is found', () => {
        sessionStorage.setItem('session_id', '123');

        const newSessionId = getSessionId();
        expect(newSessionId).toBe('123');
    });
});
