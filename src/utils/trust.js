// Trust score calculation and verification logic

export const calculateTrustScore = (vouchCount, lastVerifiedAt) => {
    // Simple logic: 10 points per vouch, capped at 100
    // Decay logic could be added later based on lastVerifiedAt
    const score = Math.min(vouchCount * 10, 100);
    return score;
};

export const generateVerificationHash = async (opportunityId, userPhone, timestamp) => {
    const data = `${opportunityId}:${userPhone}:${timestamp}`;
    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};
