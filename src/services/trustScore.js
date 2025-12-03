/**
 * Trust Score Calculation Service
 * Handles all trust score calculations including decay, weighted vouches, and negative vouches
 */

/**
 * Calculate score decay based on time elapsed since last verification
 * @param {Date|Timestamp} lastVerifiedAt - Last verification timestamp
 * @param {number} currentScore - Current trust score
 * @returns {number} Decayed score
 */
export const calculateDecay = (lastVerifiedAt, currentScore) => {
    if (!lastVerifiedAt) {
        return currentScore;
    }

    const now = new Date();
    const lastVerified = lastVerifiedAt.toDate ? lastVerifiedAt.toDate() : new Date(lastVerifiedAt);
    const daysSinceVerification = Math.floor((now - lastVerified) / (1000 * 60 * 60 * 24));

    // Decay rate: -5 points per 30 days
    const decayPeriods = Math.floor(daysSinceVerification / 30);
    const decayAmount = decayPeriods * 5;

    // Apply decay but never go below minimum of 20
    const decayedScore = Math.max(currentScore - decayAmount, 20);

    return decayedScore;
};

/**
 * Get vouch weight multiplier based on user verification level
 * @param {string} verificationLevel - User's verification level
 * @returns {number} Weight multiplier
 */
export const getVouchWeight = (verificationLevel) => {
    const weights = {
        'unverified': 1.0,
        'phone': 1.5,
        'email': 1.5,
        'verified': 2.0  // Both phone and email verified
    };

    return weights[verificationLevel] || 1.0;
};

/**
 * Calculate weighted trust score
 * @param {Array} positiveVouches - Array of positive vouch objects
 * @param {Array} negativeVouches - Array of negative vouch objects
 * @param {Object} userVerificationLevels - Map of userId to verification level
 * @param {Date|Timestamp} lastVerifiedAt - Last verification timestamp
 * @returns {Object} Score breakdown
 */
export const calculateWeightedScore = (
    positiveVouches = [],
    negativeVouches = [],
    userVerificationLevels = {},
    lastVerifiedAt = null
) => {
    const BASE_SCORE = 50;
    const POSITIVE_VOUCH_VALUE = 10;
    const NEGATIVE_VOUCH_VALUE = 15;
    const MAX_SCORE = 100;
    const MIN_SCORE = 20;

    // Calculate positive vouch contribution with weights
    let positiveScore = 0;
    positiveVouches.forEach(vouch => {
        const verificationLevel = userVerificationLevels[vouch.userId] || 'unverified';
        const weight = getVouchWeight(verificationLevel);
        positiveScore += POSITIVE_VOUCH_VALUE * weight;
    });

    // Calculate negative vouch impact (stronger than positive)
    const negativeScore = negativeVouches.length * NEGATIVE_VOUCH_VALUE;

    // Calculate raw score
    let rawScore = BASE_SCORE + positiveScore - negativeScore;

    // Apply boundaries before decay
    rawScore = Math.min(Math.max(rawScore, MIN_SCORE), MAX_SCORE);

    // Apply time-based decay
    const decayedScore = calculateDecay(lastVerifiedAt, rawScore);

    return {
        baseScore: BASE_SCORE,
        positiveContribution: positiveScore,
        negativeContribution: negativeScore,
        rawScore: rawScore,
        decayedScore: decayedScore,
        finalScore: Math.round(decayedScore),
        positiveVouchCount: positiveVouches.length,
        negativeVouchCount: negativeVouches.length
    };
};

/**
 * Check if decay calculation is needed (24 hours since last check)
 * @param {Date|Timestamp} lastDecayCheck - Last decay check timestamp
 * @returns {boolean} True if decay check needed
 */
export const shouldDecay = (lastDecayCheck) => {
    if (!lastDecayCheck) {
        return true;
    }

    const now = new Date();
    const lastCheck = lastDecayCheck.toDate ? lastDecayCheck.toDate() : new Date(lastDecayCheck);
    const hoursSinceCheck = (now - lastCheck) / (1000 * 60 * 60);

    return hoursSinceCheck >= 24;
};

/**
 * Get days until next decay
 * @param {Date|Timestamp} lastVerifiedAt - Last verification timestamp
 * @returns {number} Days until next decay
 */
export const getDaysUntilDecay = (lastVerifiedAt) => {
    if (!lastVerifiedAt) {
        return 0;
    }

    const now = new Date();
    const lastVerified = lastVerifiedAt.toDate ? lastVerifiedAt.toDate() : new Date(lastVerifiedAt);
    const daysSinceVerification = Math.floor((now - lastVerified) / (1000 * 60 * 60 * 24));

    const daysInCurrentPeriod = daysSinceVerification % 30;
    const daysUntilNextDecay = 30 - daysInCurrentPeriod;

    return daysUntilNextDecay;
};

/**
 * Get relative time string (e.g., "2 days ago")
 * @param {Date|Timestamp} timestamp - Timestamp to convert
 * @returns {string} Relative time string
 */
export const getRelativeTime = (timestamp) => {
    if (!timestamp) {
        return 'Never';
    }

    const now = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

/**
 * Get trust score color class based on score
 * @param {number} score - Trust score
 * @returns {string} Tailwind color classes
 */
export const getTrustScoreColor = (score) => {
    if (score >= 70) {
        return 'bg-green-100/80 text-green-700 border-green-200';
    } else if (score >= 40) {
        return 'bg-yellow-100/80 text-yellow-700 border-yellow-200';
    } else {
        return 'bg-red-100/80 text-red-700 border-red-200';
    }
};

/**
 * Get verification level badge
 * @param {string} verificationLevel - User's verification level
 * @returns {Object} Badge info
 */
export const getVerificationBadge = (verificationLevel) => {
    const badges = {
        'verified': { text: '⭐⭐', label: 'Verified', weight: '2.0x' },
        'phone': { text: '⭐', label: 'Phone Verified', weight: '1.5x' },
        'email': { text: '⭐', label: 'Email Verified', weight: '1.5x' },
        'unverified': { text: '', label: 'Unverified', weight: '1.0x' }
    };

    return badges[verificationLevel] || badges['unverified'];
};
