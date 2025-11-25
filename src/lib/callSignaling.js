// Firebase Signaling Service for Voice Calls
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    query,
    where,
    getDocs
} from 'firebase/firestore';

// Create a new call
export const initiateCall = async (db, callerId, receiverId, isVideo = false) => {
    try {
        const callRef = await addDoc(collection(db, 'calls'), {
            caller: callerId,
            receiver: receiverId,
            status: 'ringing',
            offer: null,
            answer: null,
            isVideo: isVideo,
            timestamp: serverTimestamp()
        });
        return callRef.id;
    } catch (error) {
        console.error('Failed to initiate call:', error);
        throw error;
    }
};

// Send WebRTC offer
export const sendOffer = async (db, callId, offer) => {
    try {
        await updateDoc(doc(db, 'calls', callId), {
            offer: JSON.parse(JSON.stringify(offer))
        });
    } catch (error) {
        console.error('Failed to send offer:', error);
        throw error;
    }
};

// Send WebRTC answer
export const sendAnswer = async (db, callId, answer) => {
    try {
        await updateDoc(doc(db, 'calls', callId), {
            answer: JSON.parse(JSON.stringify(answer)),
            status: 'active'
        });
    } catch (error) {
        console.error('Failed to send answer:', error);
        throw error;
    }
};

// Update call status
export const updateCallStatus = async (db, callId, status) => {
    try {
        await updateDoc(doc(db, 'calls', callId), { status });
    } catch (error) {
        console.error('Failed to update call status:', error);
    }
};

// End call
export const endCall = async (db, callId) => {
    try {
        await updateDoc(doc(db, 'calls', callId), {
            status: 'ended',
            endedAt: serverTimestamp()
        });

        // Delete after 1 minute
        setTimeout(async () => {
            try {
                await deleteDoc(doc(db, 'calls', callId));
            } catch (err) {
                console.error('Failed to delete call document:', err);
            }
        }, 60000);
    } catch (error) {
        console.error('Failed to end call:', error);
    }
};

// Listen to call updates
export const listenToCall = (db, callId, callback) => {
    return onSnapshot(doc(db, 'calls', callId), (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data());
        }
    });
};

// Listen for incoming calls for a user
export const listenForIncomingCalls = (db, userId, callback) => {
    const q = query(
        collection(db, 'calls'),
        where('receiver', '==', userId),
        where('status', '==', 'ringing')
    );

    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                callback({
                    id: change.doc.id,
                    ...change.doc.data()
                });
            }
        });
    });
};

// Get user info for caller/receiver
export const getUserInfo = async (db, userId) => {
    try {
        const userDoc = await getDocs(
            query(collection(db, 'users'), where('__name__', '==', userId))
        );

        if (!userDoc.empty) {
            const data = userDoc.docs[0].data();
            return { ...data, uid: userDoc.docs[0].id, name: data.displayName || data.email?.split('@')[0] || 'Kullanıcı' };
        }
        
        // Fallback: try direct document access
        const { getDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return { ...data, uid: docSnap.id, name: data.displayName || data.email?.split('@')[0] || 'Kullanıcı' };
        }
        
        return null;
    } catch (error) {
        console.error('Failed to get user info:', error);
        return null;
    }
};
