import { ulid } from 'ulid';

// Function to generate a session ID
function generateSessionId() {
    const sessionId = ulid();
    sessionStorage.setItem('session_id', sessionId);
    return sessionId;
}

// Function to retrieve the session ID
function getSessionId() {
    const sessionId = sessionStorage.getItem('session_id');
    
    if (sessionId) {
        return sessionId;
    } else {
        return generateSessionId();
    }
}

export { generateSessionId, getSessionId };
export default getSessionId;