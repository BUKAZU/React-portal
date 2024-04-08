import { getSessionId } from './session_id';

// Function to track an event
function trackEvent(eventName: string, eventProperties: Record<string, any> = {}) {
    const sessionId = getSessionId();
    const event = {
        interactionType: eventName,
        sessionIdentifier: sessionId,
        ...eventProperties
    };

    console.log('Tracking event:', event);
}