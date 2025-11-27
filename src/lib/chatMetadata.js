import { getFirebaseDb } from './firebase';
import { doc, setDoc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';

export const updateChatMetadata = async (senderId, receiverId, messageText) => {
    const db = getFirebaseDb();
    const chatId = [senderId, receiverId].sort().join('_');

    try {
        // Sender's metadata (unreadCount 0 because they just sent it)
        await setDoc(doc(db, `users/${senderId}/recentChats`, receiverId), {
            chatId,
            otherUserId: receiverId,
            lastMessage: messageText,
            timestamp: serverTimestamp(),
            // Don't reset unreadCount for sender, just keep it as is or set to 0? 
            // Usually sender reads their own chat, so 0 is fine.
            unreadCount: 0
        }, { merge: true });

        // Receiver's metadata (increment unreadCount)
        // Check if doc exists to determine if we need to set initial data
        const receiverRef = doc(db, `users/${receiverId}/recentChats`, senderId);
        await setDoc(receiverRef, {
            chatId,
            otherUserId: senderId,
            lastMessage: messageText,
            timestamp: serverTimestamp(),
            unreadCount: increment(1)
        }, { merge: true });

    } catch (error) {
        console.error('Error updating chat metadata:', error);
    }
};

export const markChatAsRead = async (userId, otherUserId) => {
    const db = getFirebaseDb();
    try {
        const docRef = doc(db, `users/${userId}/recentChats`, otherUserId);
        // Only update if exists
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await updateDoc(docRef, {
                unreadCount: 0
            });
        }
    } catch (error) {
        console.error('Error marking chat as read:', error);
    }
};
