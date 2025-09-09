import { useRef } from "react";

function generateSessionId() {
    return "s-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useSessionId = () => {
    const sessionIdRef = useRef(() => {
        const key = "yuume:sid";
        let sessionId = localStorage.getItem(key);
        if (!sessionId) {
            sessionId = generateSessionId();
            localStorage.setItem(key, sessionId);
        }
        return sessionId;
    });

    return sessionIdRef.current();
};