import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, doc, getDoc, updateDoc, arrayUnion, deleteDoc, orderBy } from 'firebase/firestore';
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';
import { calculateWeightedScore, shouldDecay } from './trustScore';

const OPPORTUNITIES_COLLECTION = 'opportunities';

export const addOpportunity = async (data) => {
    try {
        const lat = parseFloat(data.lat);
        const lng = parseFloat(data.lng);
        const hash = geohashForLocation([lat, lng]);

        const docRef = await addDoc(collection(db, OPPORTUNITIES_COLLECTION), {
            ...data,
            location: {
                lat,
                lng,
                geohash: hash,
                address: data.address
            },
            createdAt: Timestamp.now(),
            lastVerifiedAt: Timestamp.now(),
            lastDecayCheck: Timestamp.now(),
            trustScore: 50, // Initial score
            decayedScore: 50, // Initial decayed score
            vouchCount: 0,
            negativeVouchCount: 0,
            negativeVouches: [],
            isActive: true
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding opportunity: ", error);
        throw error;
    }
};

export const getOpportunities = async (center, radiusInKm) => {
    // center is [lat, lng]
    const radiusInM = radiusInKm * 1000;
    const bounds = geohashQueryBounds(center, radiusInM);
    const promises = [];

    for (const b of bounds) {
        const q = query(
            collection(db, OPPORTUNITIES_COLLECTION),
            where('location.geohash', '>=', b[0]),
            where('location.geohash', '<=', b[1])
        );
        promises.push(getDocs(q));
    }

    const snapshots = await Promise.all(promises);
    const matchingDocs = [];

    for (const snap of snapshots) {
        for (const doc of snap.docs) {
            const lat = doc.data().location.lat;
            const lng = doc.data().location.lng;

            // We have to filter false positives due to geohash accuracy
            const distanceInKm = distanceBetween([lat, lng], center);
            const distanceInM = distanceInKm * 1000;

            if (distanceInM <= radiusInM) {
                matchingDocs.push({
                    id: doc.id,
                    ...doc.data(),
                    distance: distanceInKm.toFixed(1) // Add distance to the object
                });
            }
        }
    }

    // Sort by Trust Score (descending)
    return matchingDocs.sort((a, b) => b.trustScore - a.trustScore);
};

export const getAllOpportunities = async (center) => {
    try {
        const q = query(
            collection(db, OPPORTUNITIES_COLLECTION),
            orderBy('trustScore', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const opportunities = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let distance = null;

            if (center && data.location && data.location.lat && data.location.lng) {
                const distanceInKm = distanceBetween(
                    [data.location.lat, data.location.lng],
                    center
                );
                distance = distanceInKm.toFixed(1);
            }

            opportunities.push({
                id: doc.id,
                ...data,
                distance: distance
            });
        });

        return opportunities;
    } catch (error) {
        console.error("Error getting all opportunities:", error);
        throw error;
    }
};

export const getOpportunityById = async (id) => {
    const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error("No such document!");
    }
};

export const addVouch = async (opportunityId, vouchData) => {
    try {
        const oppRef = doc(db, OPPORTUNITIES_COLLECTION, opportunityId);
        const oppSnap = await getDoc(oppRef);

        if (!oppSnap.exists()) {
            throw new Error("Opportunity not found");
        }

        const currentData = oppSnap.data();
        const existingVouches = currentData.vouches || [];

        // Check if user has already vouched
        const hasVouched = existingVouches.some(vouch => vouch.userId === vouchData.userId);
        if (hasVouched) {
            throw new Error("You have already vouched for this opportunity");
        }

        const currentScore = currentData.trustScore || 50;
        const newVouchCount = (currentData.vouchCount || 0) + 1;

        // Add 10 points to existing score, max 100
        const newTrustScore = Math.min(currentScore + 10, 100);

        // Create vouch object
        const newVouch = {
            ...vouchData,
            timestamp: Timestamp.now()
        };

        // Update document
        await updateDoc(oppRef, {
            vouchCount: newVouchCount,
            trustScore: newTrustScore,
            decayedScore: newTrustScore, // Update decayed score too
            vouches: arrayUnion(newVouch),
            lastVerifiedAt: Timestamp.now(),
            lastDecayCheck: Timestamp.now() // Reset decay check
        });

        return { newTrustScore, newVouchCount };
    } catch (error) {
        console.error("Error adding vouch:", error);
        throw error;
    }
};

export const deleteOpportunity = async (opportunityId, userId) => {
    try {
        const oppRef = doc(db, OPPORTUNITIES_COLLECTION, opportunityId);
        const oppSnap = await getDoc(oppRef);

        if (!oppSnap.exists()) {
            throw new Error('Opportunity not found');
        }

        const oppData = oppSnap.data();

        // Check if the user is the owner
        if (oppData.userId !== userId) {
            throw new Error('You can only delete your own postings');
        }

        await deleteDoc(oppRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting opportunity:", error);
        throw error;
    }
};

/**
 * Add a negative vouch (report) to an opportunity
 */
export const addNegativeVouch = async (opportunityId, reportData) => {
    try {
        const oppRef = doc(db, OPPORTUNITIES_COLLECTION, opportunityId);
        const oppSnap = await getDoc(oppRef);

        if (!oppSnap.exists()) {
            throw new Error('Opportunity not found');
        }

        const negativeVouch = {
            userId: reportData.userId,
            userName: reportData.userName,
            reason: reportData.reason,
            timestamp: Timestamp.now()
        };

        await updateDoc(oppRef, {
            negativeVouches: arrayUnion(negativeVouch),
            negativeVouchCount: (oppSnap.data().negativeVouchCount || 0) + 1
        });

        // Recalculate trust score
        await recalculateTrustScore(opportunityId);

        return true;
    } catch (error) {
        console.error("Error adding negative vouch:", error);
        throw error;
    }
};

/**
 * Recalculate trust score for an opportunity
 */
export const recalculateTrustScore = async (opportunityId) => {
    try {
        const oppRef = doc(db, OPPORTUNITIES_COLLECTION, opportunityId);
        const oppSnap = await getDoc(oppRef);

        if (!oppSnap.exists()) {
            throw new Error('Opportunity not found');
        }

        const oppData = oppSnap.data();
        const positiveVouches = oppData.vouches || [];
        const negativeVouches = oppData.negativeVouches || [];
        const lastVerifiedAt = oppData.lastVerifiedAt;

        // Get verification levels for all vouchers
        const userVerificationLevels = {};
        for (const vouch of positiveVouches) {
            const userDoc = await getDoc(doc(db, 'users', vouch.userId));
            if (userDoc.exists()) {
                userVerificationLevels[vouch.userId] = userDoc.data().verificationLevel || 'unverified';
            } else {
                userVerificationLevels[vouch.userId] = 'unverified';
            }
        }

        // Calculate new score
        const scoreBreakdown = calculateWeightedScore(
            positiveVouches,
            negativeVouches,
            userVerificationLevels,
            lastVerifiedAt
        );

        // Update opportunity
        await updateDoc(oppRef, {
            trustScore: scoreBreakdown.rawScore,
            decayedScore: scoreBreakdown.finalScore,
            lastDecayCheck: Timestamp.now()
        });

        return scoreBreakdown;
    } catch (error) {
        console.error("Error recalculating trust score:", error);
        throw error;
    }
};

/**
 * Check and apply decay to opportunities if needed
 */
export const checkAndApplyDecay = async (opportunities) => {
    const updatedOpportunities = [];

    for (const opp of opportunities) {
        if (shouldDecay(opp.lastDecayCheck)) {
            try {
                await recalculateTrustScore(opp.id);
                // Fetch updated data
                const oppRef = doc(db, OPPORTUNITIES_COLLECTION, opp.id);
                const oppSnap = await getDoc(oppRef);
                if (oppSnap.exists()) {
                    updatedOpportunities.push({
                        id: oppSnap.id,
                        ...oppSnap.data()
                    });
                }
            } catch (error) {
                console.error(`Error applying decay to opportunity ${opp.id}:`, error);
                updatedOpportunities.push(opp); // Keep original if update fails
            }
        } else {
            updatedOpportunities.push(opp);
        }
    }

    return updatedOpportunities;
};

/**
 * Update user verification level
 */
export const updateUserVerification = async (userId, verificationType) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const currentLevel = userSnap.data().verificationLevel || 'unverified';
        let newLevel = currentLevel;

        // Determine new verification level
        if (verificationType === 'phone' && currentLevel === 'email') {
            newLevel = 'verified';
        } else if (verificationType === 'email' && currentLevel === 'phone') {
            newLevel = 'verified';
        } else if (verificationType === 'phone') {
            newLevel = 'phone';
        } else if (verificationType === 'email') {
            newLevel = 'email';
        }

        await updateDoc(userRef, {
            verificationLevel: newLevel,
            verificationDate: Timestamp.now()
        });

        return newLevel;
    } catch (error) {
        console.error("Error updating user verification:", error);
        throw error;
    }
};
